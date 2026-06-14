import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/flash-banner";
import { SubmitButton } from "@/components/submit-button";
import { endQuizAction, skipQuizAnswerAction, submitQuizAnswerAction } from "@/lib/actions/quiz-actions";
import { buildFlashUrl, resolveSearchParams } from "@/lib/flash";
import { getQuizQuestionData } from "@/lib/quiz";
import { getAccuracy } from "@/lib/word-metrics";

export default async function QuizQuestionPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, quiz] = await Promise.all([resolveSearchParams(searchParams), getQuizQuestionData()]);
  if (!quiz) {
    redirect(buildFlashUrl("/quiz", "warning", "No hay sesión de quiz activa. Configura un nuevo quiz."));
  }

  const progressWidth =
    quiz.stats.totalAvailable > 0
      ? Math.round(((quiz.stats.answered + 1) / quiz.stats.totalAvailable) * 100)
      : 0;
  const incorrect = quiz.stats.answered - quiz.stats.correctAnswers;
  const promptWord = quiz.quizType === "to_spanish" ? quiz.word.englishWord : quiz.word.translation;
  const promptLang =
    quiz.quizType === "to_spanish" ? quiz.word.language.language : "Español";

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-3xl">
        {/* Session masthead */}
        <div className="mb-6 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Sesión de práctica</span>
                <h1 className="mt-2 font-display text-2xl font-semibold text-neutral-900">
                  Pregunta {quiz.stats.answered + 1}
                  <span className="text-neutral-400"> / {quiz.stats.totalAvailable}</span>
                </h1>
              </div>
              <form action={endQuizAction}>
                <SubmitButton className="outline-button px-4 py-2.5 text-sm" icon="fa-solid fa-flag-checkered" pendingLabel="Terminando…">
                  Terminar
                </SubmitButton>
              </form>
            </div>

          <div className="flex items-center gap-4">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-primary-600 transition-all"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="flex items-center gap-1.5 text-secondary-700">
                <i className="fa-solid fa-check" />
                {quiz.stats.correctAnswers}
              </span>
              <span className="flex items-center gap-1.5 text-primary-700">
                <i className="fa-solid fa-xmark" />
                {incorrect}
              </span>
              {quiz.stats.answered > 0 ? (
                <span className="text-neutral-500">
                  {getAccuracy(quiz.stats.answered, quiz.stats.correctAnswers).toFixed(0)}%
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Entry card */}
        <div className="page-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-3 sm:px-10">
            <span className="eyebrow-muted">
              {quiz.quizType === "to_spanish"
                ? "Traduce al Español"
                : `Traduce al ${quiz.word.language.language}`}
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-neutral-400">
              {promptLang}
            </span>
          </div>

          <div className="px-6 py-12 text-center sm:px-10">
            <p className="font-display text-5xl font-semibold leading-tight text-neutral-900 md:text-7xl">
              {promptWord}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="meta-chip border-secondary-200 bg-secondary-50 text-secondary-700">
                <i className="fa-solid fa-earth-americas" />
                {quiz.word.language.language}
              </span>
              <span className="meta-chip border-neutral-300 bg-neutral-50 text-neutral-600">
                <i className="fa-solid fa-tag" />
                {quiz.word.tag.tag}
              </span>
              {quiz.word.timesPracticed > 0 ? (
                <span className="meta-chip border-accent/40 bg-accent/10 text-[#8a6418]">
                  <i className="fa-solid fa-chart-line" />
                  {getAccuracy(quiz.word.timesPracticed, quiz.word.timesCorrect)}%
                </span>
              ) : null}
            </div>

            {quiz.word.explanation ? (
              <div className="mx-auto mt-8 max-w-xl rounded-xl rounded-l-sm border-l-[3px] border-accent bg-neutral-50 px-5 py-4 text-left">
                <div className="eyebrow-muted mb-1">Pista</div>
                <p className="font-display text-lg italic leading-relaxed text-neutral-700">
                  {quiz.word.explanation}
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-8 sm:px-10">
            <form action={submitQuizAnswerAction} className="space-y-5">
              <input name="wordId" type="hidden" value={quiz.word.id} />
              <input name="sessionId" type="hidden" value={quiz.session.sessionId} />

              <label className="input-label text-center" htmlFor="answer">
                Tu respuesta
              </label>
              <input
                autoComplete="off"
                autoFocus
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-25 px-6 py-4 text-center font-display text-2xl font-medium text-neutral-900 transition-all duration-200 placeholder:font-sans placeholder:text-base placeholder:italic placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-200/50"
                id="answer"
                name="answer"
                placeholder="escribe la traducción…"
                required
              />

              <SubmitButton className="primary-button w-full py-4 text-base" icon="fa-solid fa-check" pendingLabel="Comprobando…">
                Verificar
              </SubmitButton>
            </form>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <form action={skipQuizAnswerAction} className="flex-1">
                <input name="wordId" type="hidden" value={quiz.word.id} />
                <input name="sessionId" type="hidden" value={quiz.session.sessionId} />
                <SubmitButton className="outline-button w-full" icon="fa-solid fa-forward" pendingLabel="Saltando…">
                  Saltar
                </SubmitButton>
              </form>
              <Link className="outline-button flex-1" href="/verpalabras">
                <i className="fa-solid fa-book" />
                <span>Ver léxico</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
