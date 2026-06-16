import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { importWordsAction } from "@/lib/actions/word-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";

export default async function ImportWordsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, dictionary] = await Promise.all([
    resolveSearchParams(searchParams),
    getDictionary(),
  ]);

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={dictionary.importPage.eyebrow}
          subtitle={dictionary.importPage.subtitle}
          title={dictionary.importPage.title}
        />
        <div className="page-card p-8">
          <div className="mb-8 overflow-hidden rounded-2xl bg-neutral-900 text-neutral-25 shadow-paper">
            <div className="flex items-center justify-between border-b border-neutral-700 px-5 py-3">
              <span className="eyebrow text-neutral-400">{dictionary.importPage.expectedFormat}</span>
              <span className="font-mono text-xs text-neutral-500">{dictionary.importPage.filename}</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-sm leading-relaxed text-neutral-100">
              <code>{`[
  {
    "english_word": "house",
    "translation": "home",
    "explanation": "where people live",
    "language": "English",
    "tag": "A1"
  }
]`}</code>
            </pre>
            <div className="space-y-1 border-t border-neutral-700 px-5 py-3 text-sm text-neutral-400">
              <p>
                <span className="text-primary-300">{dictionary.importPage.required}</span> english_word, translation,
                language, tag
              </p>
              <p>
                <span className="text-secondary-300">{dictionary.importPage.optional}</span> explanation, times_practiced,
                times_correct, last_practiced
              </p>
            </div>
          </div>

          <form action={importWordsAction} className="space-y-6">
            <div>
              <label className="input-label" htmlFor="file">
                {dictionary.importPage.jsonFile}
              </label>
              <input accept=".json" className="text-input" id="file" name="file" required type="file" />
              <p className="mt-2 font-mono text-xs uppercase tracking-wide text-neutral-500">
                {dictionary.importPage.fileHint}
              </p>
            </div>

            <div>
              <label className="input-label" htmlFor="overwriteDuplicates">
                {dictionary.importPage.duplicateHandling}
              </label>
              <select className="select-input" defaultValue="skip" id="overwriteDuplicates" name="overwriteDuplicates">
                <option value="skip">{dictionary.importPage.skipDuplicates}</option>
                <option value="update">{dictionary.importPage.updateDuplicates}</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="createMissing">
                {dictionary.importPage.missingHandling}
              </label>
              <select className="select-input" defaultValue="create" id="createMissing" name="createMissing">
                <option value="create">{dictionary.importPage.createMissing}</option>
                <option value="skip">{dictionary.importPage.skipMissing}</option>
              </select>
            </div>

            <div className="flex gap-4">
              <SubmitButton className="primary-button flex-1" pendingLabel={dictionary.importPage.importing}>
                {dictionary.importPage.importWords}
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
