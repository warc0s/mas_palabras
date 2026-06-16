import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { startQuizAction } from "@/lib/actions/quiz-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";

export default async function QuizConfigPage({
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

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow={dictionary.quiz.configEyebrow}
          subtitle={dictionary.quiz.configSubtitle}
          title={dictionary.quiz.configTitle}
        />
        <div className="page-card p-8">
          <form action={startQuizAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="languageId">
                  {dictionary.common.language}
                </label>
                <select className="select-input" defaultValue={0} id="languageId" name="languageId">
                  <option value={0}>{dictionary.words.allLanguages}</option>
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
                <select className="select-input" defaultValue={0} id="tagId" name="tagId">
                  <option value={0}>{dictionary.words.allTags}</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="quizType">
                {dictionary.quiz.quizType}
              </label>
              <select className="select-input" defaultValue="to_spanish" id="quizType" name="quizType">
                <option value="to_spanish">{dictionary.quiz.translateToSpanish}</option>
                <option value="to_original">{dictionary.quiz.translateToOriginal}</option>
                <option value="mixed">{dictionary.quiz.mixed}</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="onlyDifficult">
                {dictionary.quiz.difficulty}
              </label>
              <select className="select-input" defaultValue="all" id="onlyDifficult" name="onlyDifficult">
                <option value="all">{dictionary.quiz.allWords}</option>
                <option value="needs_practice">{dictionary.quiz.needsPracticeOnly}</option>
                <option value="new">{dictionary.quiz.newOnly}</option>
              </select>
            </div>

            <div className="flex gap-3">
              <SubmitButton
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-600 px-5 py-3 font-medium text-neutral-25 shadow-[0_8px_20px_-10px_rgba(31,90,79,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-500 hover:shadow-[0_16px_30px_-12px_rgba(31,90,79,0.7)] active:translate-y-0"
                pendingLabel={dictionary.quiz.starting}
              >
                <i className="fa-solid fa-play" />
                <span>{dictionary.quiz.startQuiz}</span>
              </SubmitButton>
              <Link className="outline-button flex-1" href="/">
                {dictionary.common.cancel}
              </Link>
            </div>
          </form>

          <div className="mt-8 rounded-xl rounded-l-sm border-l-[3px] border-secondary-400 bg-secondary-50 px-5 py-4">
            <div className="eyebrow mb-3 text-secondary-700">{dictionary.quiz.rulesTitle}</div>
            <ul className="space-y-2 text-sm leading-relaxed text-neutral-700">
              {dictionary.quiz.rules.map((rule) => (
                <li className="flex gap-2.5" key={rule}>
                  <i className="fa-solid fa-check mt-1 text-xs text-secondary-600" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
