import Link from "next/link";
import { notFound } from "next/navigation";

import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { updateWordAction } from "@/lib/actions/word-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";
import { getWordById } from "@/lib/words";

export default async function EditWordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, pageParams] = await Promise.all([params, resolveSearchParams(searchParams)]);
  const wordId = Number(id);
  if (!Number.isInteger(wordId)) {
    notFound();
  }

  const [word, languages, tags, dictionary] = await Promise.all([
    getWordById(wordId),
    getActiveLanguages(),
    getActiveTags(),
    getDictionary(),
  ]);

  if (!word) {
    notFound();
  }

  return (
    <>
      <FlashBanner searchParams={pageParams} />

      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={dictionary.form.entryEyebrow(word.englishWord)}
          subtitle={dictionary.form.editSubtitle}
          title={dictionary.form.editTitle}
        />
        <div className="page-card p-8">
          <form action={updateWordAction} className="space-y-6">
            <input name="wordId" type="hidden" value={word.id} />

            <div>
              <label className="input-label" htmlFor="englishWord">
                {dictionary.common.word}
              </label>
              <input
                className="text-input"
                defaultValue={word.englishWord}
                id="englishWord"
                name="englishWord"
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="translation">
                {dictionary.common.translation}
              </label>
              <input
                className="text-input"
                defaultValue={word.translation}
                id="translation"
                name="translation"
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="explanation">
                {dictionary.common.explanation}
              </label>
              <textarea
                className="textarea-input"
                defaultValue={word.explanation ?? ""}
                id="explanation"
                name="explanation"
                rows={4}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="languageId">
                  {dictionary.common.language}
                </label>
                <select
                  className="select-input"
                  defaultValue={word.languageId}
                  id="languageId"
                  name="languageId"
                  required
                >
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.language}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" htmlFor="tagId">
                  {dictionary.common.tag}
                </label>
                <select
                  className="select-input"
                  defaultValue={word.tagId}
                  id="tagId"
                  name="tagId"
                  required
                >
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <SubmitButton className="primary-button flex-1" pendingLabel={dictionary.common.saving}>
                {dictionary.common.saveChanges}
              </SubmitButton>
              <Link className="secondary-button flex-1" href="/verpalabras">
                {dictionary.common.cancel}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
