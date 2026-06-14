import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { WordsTable } from "@/components/words-table";
import { getSingleParam, resolveSearchParams } from "@/lib/flash";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";
import { getAccuracy, needsPractice } from "@/lib/word-metrics";
import { listWords } from "@/lib/words";

export default async function ViewWordsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await resolveSearchParams(searchParams);

  const languageId = Number(getSingleParam(params, "language") ?? "0");
  const tagId = Number(getSingleParam(params, "tag") ?? "0");
  const page = Number(getSingleParam(params, "page") ?? "1");
  const perPage = Number(getSingleParam(params, "per_page") ?? "25");
  const sortBy = (getSingleParam(params, "sort_by") ?? "english_word") as
    | "english_word"
    | "translation"
    | "created_at_desc"
    | "created_at_asc"
    | "accuracy_desc"
    | "accuracy_asc"
    | "needs_practice";

  const [languages, tags, data] = await Promise.all([
    getActiveLanguages(),
    getActiveTags(),
    listWords({
      search: getSingleParam(params, "search") ?? "",
      languageId: Number.isInteger(languageId) && languageId > 0 ? languageId : undefined,
      tagId: Number.isInteger(tagId) && tagId > 0 ? tagId : undefined,
      sortBy,
      page: Number.isInteger(page) ? page : 1,
      perPage: Number.isInteger(perPage) ? perPage : 25,
    }),
  ]);

  const words = data.words.map((word) => ({
    id: word.id,
    englishWord: word.englishWord,
    translation: word.translation,
    explanation: word.explanation ?? "",
    language: word.language.language,
    tag: word.tag.tag,
    timesPracticed: word.timesPracticed,
    accuracy: getAccuracy(word.timesPracticed, word.timesCorrect),
    needsPractice: needsPractice(word.timesPracticed, word.timesCorrect),
  }));

  const queryBase = new URLSearchParams();
  const rawSearch = getSingleParam(params, "search");
  if (rawSearch) {
    queryBase.set("search", rawSearch);
  }
  if (languageId > 0) {
    queryBase.set("language", String(languageId));
  }
  if (tagId > 0) {
    queryBase.set("tag", String(tagId));
  }
  queryBase.set("sort_by", sortBy);
  queryBase.set("per_page", String(data.perPage));

  const start = data.totalWords === 0 ? 0 : (data.page - 1) * data.perPage + 1;
  const end = Math.min(data.page * data.perPage, data.totalWords);

  return (
    <>
      <FlashBanner searchParams={params} />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 border-b border-neutral-300 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">El léxico</span>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-neutral-900 md:text-6xl">
            Tu vocabulario
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-wide text-neutral-500">
            {data.totalWords} entrada{data.totalWords === 1 ? "" : "s"} registrada
            {data.totalWords === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="outline-button px-4 py-2.5 text-sm" href="/import_words">
            <i className="fa-solid fa-file-import" />
            <span>Importar</span>
          </Link>
          <Link className="outline-button px-4 py-2.5 text-sm" href="/export_words">
            <i className="fa-solid fa-file-export" />
            <span>Exportar</span>
          </Link>
          <Link className="primary-button px-4 py-2.5 text-sm" href="/maspalabras">
            <i className="fa-solid fa-plus" />
            <span>Añadir palabra</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form className="page-card mb-6 p-6" method="GET">
        <div className="relative mb-5">
          <label className="sr-only" htmlFor="search-input">
            Buscar
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <i className="fa-solid fa-magnifying-glass" />
          </div>
          <input
            className="text-input pl-11"
            defaultValue={rawSearch ?? ""}
            id="search-input"
            name="search"
            placeholder="Buscar en tu vocabulario…"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="input-label" htmlFor="language">
              Idioma
            </label>
            <select className="select-input" defaultValue={languageId} id="language" name="language">
              <option value={0}>Todos los idiomas</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.language}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="tag">
              Etiqueta
            </label>
            <select className="select-input" defaultValue={tagId} id="tag" name="tag">
              <option value={0}>Todas las etiquetas</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="sort_by">
              Ordenar
            </label>
            <select className="select-input" defaultValue={sortBy} id="sort_by" name="sort_by">
              <option value="english_word">Palabra (A-Z)</option>
              <option value="translation">Traducción (A-Z)</option>
              <option value="created_at_desc">Más recientes</option>
              <option value="created_at_asc">Más antiguas</option>
              <option value="accuracy_desc">Mayor precisión</option>
              <option value="accuracy_asc">Menor precisión</option>
              <option value="needs_practice">Necesitan práctica</option>
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="per_page">
              Por página
            </label>
            <select className="select-input" defaultValue={data.perPage} id="per_page" name="per_page">
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="primary-button mt-5 px-4 py-2.5 text-sm" type="submit">
          <i className="fa-solid fa-filter" />
          <span>Aplicar filtros</span>
        </button>
      </form>

      {/* Table */}
      <div className="page-card overflow-hidden">
        {words.length > 0 ? (
          <>
            <WordsTable words={words} />

            <div className="flex flex-col gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="font-mono text-xs uppercase tracking-wide text-neutral-500">
                {start}–{end} de {data.totalWords} · página {data.page}/{data.totalPages}
              </div>
              <div className="flex gap-2">
                <PaginationLink
                  disabled={data.page <= 1}
                  href={`/verpalabras?${buildPageQuery(queryBase, data.page - 1)}`}
                  label="← Anterior"
                />
                <PaginationLink
                  disabled={data.page >= data.totalPages}
                  href={`/verpalabras?${buildPageQuery(queryBase, data.page + 1)}`}
                  label="Siguiente →"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-50 text-3xl text-neutral-300 shadow-paper">
              <i className="fa-solid fa-book-open" />
            </div>
            <h2 className="font-display text-3xl font-semibold text-neutral-900">
              El léxico está en blanco
            </h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-600">
              Añade tu primera palabra o importa un conjunto completo para empezar tu diccionario.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="primary-button" href="/maspalabras">
                <i className="fa-solid fa-plus" />
                <span>Añadir primera palabra</span>
              </Link>
              <Link className="outline-button" href="/import_words">
                <i className="fa-solid fa-file-import" />
                <span>Importar vocabulario</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function buildPageQuery(base: URLSearchParams, page: number) {
  const next = new URLSearchParams(base.toString());
  next.set("page", String(Math.max(page, 1)));
  return next.toString();
}

function PaginationLink({
  href,
  label,
  disabled,
}: {
  href: string;
  label: string;
  disabled: boolean;
}) {
  return disabled ? (
    <span className="cursor-not-allowed rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2 font-mono text-xs uppercase tracking-wide text-neutral-400">
      {label}
    </span>
  ) : (
    <Link
      className="rounded-full border border-neutral-300 bg-neutral-25 px-4 py-2 font-mono text-xs uppercase tracking-wide text-neutral-700 transition-all hover:-translate-y-0.5 hover:border-neutral-900 hover:bg-neutral-100"
      href={href}
    >
      {label}
    </Link>
  );
}
