import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { WordsTable } from "@/components/words-table";
import { getSingleParam, resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";
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

  const [languages, tags, data, dictionary] = await Promise.all([
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
    getDictionary(),
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
          <span className="eyebrow">{dictionary.words.eyebrow}</span>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-neutral-900 md:text-6xl">
            {dictionary.words.title}
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-wide text-neutral-500">
            {dictionary.words.registered(data.totalWords)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="outline-button px-4 py-2.5 text-sm" href="/import_words">
            <i className="fa-solid fa-file-import" />
            <span>{dictionary.common.import}</span>
          </Link>
          <Link className="outline-button px-4 py-2.5 text-sm" href="/export_words">
            <i className="fa-solid fa-file-export" />
            <span>{dictionary.common.export}</span>
          </Link>
          <Link className="primary-button px-4 py-2.5 text-sm" href="/maspalabras">
            <i className="fa-solid fa-plus" />
            <span>{dictionary.common.addWord}</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form className="page-card mb-6 p-6" method="GET">
        <div className="relative mb-5">
          <label className="sr-only" htmlFor="search-input">
            {dictionary.words.search}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <i className="fa-solid fa-magnifying-glass" />
          </div>
          <input
            className="text-input pl-11"
            defaultValue={rawSearch ?? ""}
            id="search-input"
            name="search"
            placeholder={dictionary.words.searchPlaceholder}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="input-label" htmlFor="language">
              {dictionary.common.language}
            </label>
            <select className="select-input" defaultValue={languageId} id="language" name="language">
              <option value={0}>{dictionary.words.allLanguages}</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.language}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="tag">
              {dictionary.common.tag}
            </label>
            <select className="select-input" defaultValue={tagId} id="tag" name="tag">
              <option value={0}>{dictionary.words.allTags}</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="sort_by">
              {dictionary.words.sort}
            </label>
            <select className="select-input" defaultValue={sortBy} id="sort_by" name="sort_by">
              <option value="english_word">{dictionary.words.sortOptions.word}</option>
              <option value="translation">{dictionary.words.sortOptions.translation}</option>
              <option value="created_at_desc">{dictionary.words.sortOptions.newest}</option>
              <option value="created_at_asc">{dictionary.words.sortOptions.oldest}</option>
              <option value="accuracy_desc">{dictionary.words.sortOptions.highestAccuracy}</option>
              <option value="accuracy_asc">{dictionary.words.sortOptions.lowestAccuracy}</option>
              <option value="needs_practice">{dictionary.words.sortOptions.needsPractice}</option>
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="per_page">
              {dictionary.words.perPage}
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
          <span>{dictionary.common.applyFilters}</span>
        </button>
      </form>

      {/* Table */}
      <div className="page-card overflow-hidden">
        {words.length > 0 ? (
          <>
            <WordsTable
              copy={{
                clear: dictionary.common.clear,
                confirmBulkDeleteEnd: dictionary.words.confirmBulkDeleteEnd,
                confirmBulkDeleteStart: dictionary.words.confirmBulkDeleteStart,
                confirmSingleDeleteEnd: dictionary.words.confirmSingleDeleteEnd,
                confirmSingleDeleteStart: dictionary.words.confirmSingleDeleteStart,
                delete: dictionary.common.delete,
                deleteAction: dictionary.common.delete,
                deleting: dictionary.common.deleting,
                editAction: dictionary.common.edit,
                new: dictionary.common.new,
                noNote: dictionary.common.noNote,
                review: dictionary.common.review,
                selectAll: dictionary.words.selectAll,
                selectAction: dictionary.words.selectAction,
                selectedPlural: dictionary.words.selectedPlural,
                selectedSingular: dictionary.words.selectedSingular,
                table: dictionary.words.table,
              }}
              words={words}
            />

            <div className="flex flex-col gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="font-mono text-xs uppercase tracking-wide text-neutral-500">
                {dictionary.words.pageStatus(start, end, data.totalWords, data.page, data.totalPages)}
              </div>
              <div className="flex gap-2">
                <PaginationLink
                  disabled={data.page <= 1}
                  href={`/verpalabras?${buildPageQuery(queryBase, data.page - 1)}`}
                  label={`← ${dictionary.common.previous}`}
                />
                <PaginationLink
                  disabled={data.page >= data.totalPages}
                  href={`/verpalabras?${buildPageQuery(queryBase, data.page + 1)}`}
                  label={`${dictionary.common.next} →`}
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
              {dictionary.words.emptyTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-600">
              {dictionary.words.emptyText}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="primary-button" href="/maspalabras">
                <i className="fa-solid fa-plus" />
                <span>{dictionary.words.addFirst}</span>
              </Link>
              <Link className="outline-button" href="/import_words">
                <i className="fa-solid fa-file-import" />
                <span>{dictionary.words.importVocabulary}</span>
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
