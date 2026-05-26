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

      <div className="mx-auto max-w-7xl">
        <div className="page-card mb-8">
          <div className="border-b border-neutral-200/50 p-8">
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200">
                    <i className="fa-solid fa-book-open text-xl text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-neutral-900">Tu Vocabulario</h1>
                    <p className="text-lg text-neutral-600">
                      {words.length} palabra{words.length === 1 ? "" : "s"} • Organizadas y listas para
                      practicar
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="secondary-button bg-secondary-600 hover:bg-secondary-700" href="/import_words">
                  <i className="fa-solid fa-upload w-4" />
                  <span>Importar</span>
                </Link>
                <Link className="primary-button bg-green-600 hover:bg-green-700" href="/export_words">
                  <i className="fa-solid fa-download w-4" />
                  <span>Exportar</span>
                </Link>
                <Link className="primary-button" href="/maspalabras">
                  <i className="fa-solid fa-plus w-4" />
                  <span>Añadir Palabra</span>
                </Link>
              </div>
            </div>

            <form className="space-y-6" method="GET">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                  <i className="fa-solid fa-search" />
                </div>
                <input
                  className="text-input pl-11"
                  defaultValue={rawSearch ?? ""}
                  name="search"
                  placeholder="Buscar en tu vocabulario..."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-4">
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

              <button className="primary-button" type="submit">
                <i className="fa-solid fa-filter w-4" />
                <span>Aplicar filtros</span>
              </button>
            </form>
          </div>
        </div>

        <div className="page-card">
          {words.length > 0 ? (
            <>
              <WordsTable words={words} />

              <div className="flex flex-col gap-4 border-t border-neutral-200/50 px-8 py-6 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-neutral-600">
                  Mostrando {start} - {end} de {data.totalWords} · Página {data.page} de {data.totalPages}
                </div>
                <div className="flex gap-2">
                  <PaginationLink
                    disabled={data.page <= 1}
                    href={`/verpalabras?${buildPageQuery(queryBase, data.page - 1)}`}
                    label="Anterior"
                  />
                  <PaginationLink
                    disabled={data.page >= data.totalPages}
                    href={`/verpalabras?${buildPageQuery(queryBase, data.page + 1)}`}
                    label="Siguiente"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center">
              <div className="mx-auto mb-8 text-8xl text-neutral-300">
                <i className="fa-solid fa-book-open" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">Tu vocabulario está vacío</h2>
              <p className="mb-8 text-neutral-600">
                Añade tu primera palabra o importa un conjunto completo para comenzar.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link className="primary-button" href="/maspalabras">
                  <i className="fa-solid fa-plus w-4" />
                  <span>Añadir Primera Palabra</span>
                </Link>
                <Link className="outline-button" href="/import_words">
                  <i className="fa-solid fa-upload w-4" />
                  <span>Importar Vocabulario</span>
                </Link>
              </div>
            </div>
          )}
        </div>
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
    <span className="rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400">
      {label}
    </span>
  ) : (
    <Link
      className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      href={href}
    >
      {label}
    </Link>
  );
}
