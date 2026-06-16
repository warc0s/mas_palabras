import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createWordAction } from "@/lib/actions/word-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";

export default async function CreateWordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [languages, tags, params, dictionary] = await Promise.all([
    getActiveLanguages(),
    getActiveTags(),
    resolveSearchParams(searchParams),
    getDictionary(),
  ]);
  const hasLanguages = languages.length > 0;
  const hasTags = tags.length > 0;

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={dictionary.form.createEyebrow}
          subtitle={dictionary.form.createSubtitle}
          title={dictionary.form.createTitle}
        />
        <div className="page-card p-8">
          <form action={createWordAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="languageId">
                  {dictionary.common.language}
                </label>
                <select className="select-input" id="languageId" name="languageId" required>
                  {hasLanguages ? (
                    languages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.language}
                      </option>
                    ))
                  ) : (
                    <option value="">{dictionary.form.noLanguages}</option>
                  )}
                </select>
                {!hasLanguages ? (
                  <p className="mt-2 text-sm text-neutral-500">
                    {dictionary.form.addFirstLanguage}{" "}
                    <Link className="font-medium text-primary hover:underline" href="/settings">
                      {dictionary.nav.settings}
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
              <div>
                <label className="input-label" htmlFor="tagId">
                  {dictionary.common.tag}
                </label>
                <select className="select-input" id="tagId" name="tagId" required>
                  {hasTags ? (
                    tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.tag}
                      </option>
                    ))
                  ) : (
                    <option value="">{dictionary.form.noTags}</option>
                  )}
                </select>
                {!hasTags ? (
                  <p className="mt-2 text-sm text-neutral-500">
                    {dictionary.form.addFirstTag}{" "}
                    <Link className="font-medium text-primary hover:underline" href="/settings">
                      {dictionary.nav.settings}
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="englishWord">
                {dictionary.common.word}
              </label>
              <input className="text-input" id="englishWord" name="englishWord" required />
            </div>

            <div>
              <label className="input-label" htmlFor="translation">
                {dictionary.common.translation}
              </label>
              <input className="text-input" id="translation" name="translation" required />
            </div>

            <div>
              <label className="input-label" htmlFor="explanation">
                {dictionary.common.explanation}
              </label>
              <textarea className="textarea-input" id="explanation" name="explanation" rows={4} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <SubmitButton className="primary-button flex-1" pendingLabel={dictionary.common.saving}>
                <i className="fa-solid fa-floppy-disk w-4" />
                <span>{dictionary.common.save}</span>
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
