import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/flash-banner";
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

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-4xl">
        <div className="page-card mb-8 p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-secondary-700">Sesión de Práctica</h1>
              <p className="text-neutral-600">Fortalece tu vocabulario con ejercicios adaptativos</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 font-medium text-green-700">
                <i className="fa-solid fa-check w-4" />
                <span>{quiz.stats.correctAnswers} correctas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700">
                <i className="fa-solid fa-times w-4" />
                <span>{quiz.stats.answered - quiz.stats.correctAnswers} incorrectas</span>
              </div>
              {quiz.stats.answered > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 font-medium text-primary-700">
                  <i className="fa-solid fa-percent w-4" />
                  <span>
                    {getAccuracy(quiz.stats.answered, quiz.stats.correctAnswers).toFixed(1)}% precisión
                  </span>
                </div>
              ) : null}
              <form action={endQuizAction}>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200"
                  type="submit"
                >
                  <i className="fa-solid fa-stop w-4" />
                  <span>Terminar</span>
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-primary-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <div className="text-sm font-medium text-neutral-600">
              Pregunta {quiz.stats.answered + 1} de {quiz.stats.totalAvailable}
            </div>
          </div>
        </div>

        <div className="page-card p-10">
          <div className="mb-10 text-center">
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-secondary-200/50 bg-gradient-to-r from-secondary-50 to-primary-50 px-6 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100">
                <i className="fa-solid fa-brain text-secondary-600" />
              </div>
              <span className="text-lg font-semibold text-neutral-800">
                {quiz.quizType === "to_spanish"
                  ? "Traduce al Español"
                  : `Traduce al ${quiz.word.language.language}`}
              </span>
            </div>
          </div>

          <div className="mb-10 rounded-3xl border-2 border-dashed border-primary-300/50 bg-gradient-to-br from-neutral-50 to-primary-50/30 p-12">
            <div className="text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-600">
                {quiz.quizType === "to_spanish"
                  ? `Palabra en ${quiz.word.language.language}:`
                  : "Palabra en Español:"}
              </p>
              <div className="mb-6 text-5xl font-bold text-neutral-900 md:text-6xl">
                {quiz.quizType === "to_spanish" ? quiz.word.englishWord : quiz.word.translation}
              </div>

              {quiz.word.explanation ? (
                <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-yellow-200/50 bg-white/80 p-6">
                  <div className="flex items-start gap-3 text-left">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-100">
                      <i className="fa-solid fa-lightbulb text-sm text-yellow-600" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-neutral-800">Pista</p>
                      <p className="text-neutral-700">{quiz.word.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="rounded-xl border border-primary-200 bg-primary-100 px-3 py-1.5 font-medium text-primary-700">
                  <i className="fa-solid fa-globe mr-2 w-4" />
                  {quiz.word.language.language}
                </div>
                <div className="rounded-xl border border-green-200 bg-green-100 px-3 py-1.5 font-medium text-green-700">
                  <i className="fa-solid fa-tag mr-2 w-4" />
                  {quiz.word.feature.feature}
                </div>
                {quiz.word.timesPracticed > 0 ? (
                  <div className="rounded-xl border border-purple-200 bg-purple-100 px-3 py-1.5 font-medium text-purple-700">
                    <i className="fa-solid fa-chart-line mr-2 w-4" />
                    {getAccuracy(quiz.word.timesPracticed, quiz.word.timesCorrect)}% precisión
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <form action={submitQuizAnswerAction} className="space-y-8">
            <input name="wordId" type="hidden" value={quiz.word.id} />
            <input name="sessionId" type="hidden" value={quiz.session.sessionId} />
            <input name="quizType" type="hidden" value={quiz.quizType} />

            <div>
              <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800" htmlFor="answer">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100">
                  <i className="fa-solid fa-keyboard text-sm text-green-600" />
                </span>
                Tu Respuesta
              </label>
              <input
                autoComplete="off"
                autoFocus
                className="w-full rounded-2xl border-2 border-neutral-300 px-6 py-4 text-center text-2xl font-medium text-neutral-900 placeholder-neutral-400 focus:border-secondary-500 focus:outline-none focus:ring-4 focus:ring-secondary-200"
                id="answer"
                name="answer"
                placeholder="Escribe la traducción aquí..."
                required
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                className="flex-1 rounded-2xl bg-gradient-to-r from-secondary-600 to-secondary-700 px-8 py-4 text-lg font-bold text-white hover:from-secondary-700 hover:to-secondary-800"
                type="submit"
              >
                Verificar
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <form action={skipQuizAnswerAction} className="flex-1">
              <button
                className="w-full rounded-2xl border-2 border-neutral-300 bg-white px-8 py-4 font-semibold text-neutral-700 hover:bg-neutral-50"
                type="submit"
              >
                Saltar Pregunta
              </button>
            </form>
            <Link
              className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-300 bg-white px-8 py-4 font-medium text-neutral-700 hover:bg-neutral-50"
              href="/verpalabras"
            >
              Ver todas las palabras
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
