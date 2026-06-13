import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
import { startQuizAction } from "@/lib/actions/quiz-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";

export default async function QuizConfigPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [languages, tags, params] = await Promise.all([
    getActiveLanguages(),
    getActiveTags(),
    resolveSearchParams(searchParams),
  ]);

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Sesión de práctica"
          subtitle="Ajusta el alcance de tu repaso antes de empezar."
          title="Configurar quiz"
        />
        <div className="page-card p-8">
          <form action={startQuizAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="languageId">
                  Idioma
                </label>
                <select className="select-input" defaultValue={0} id="languageId" name="languageId">
                  <option value={0}>Todos los idiomas</option>
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.language}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" htmlFor="tagId">
                  Etiqueta
                </label>
                <select className="select-input" defaultValue={0} id="tagId" name="tagId">
                  <option value={0}>Todas las etiquetas</option>
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
                Tipo de Quiz
              </label>
              <select className="select-input" defaultValue="to_spanish" id="quizType" name="quizType">
                <option value="to_spanish">Traducir al español</option>
                <option value="to_original">Traducir al idioma original</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="onlyDifficult">
                Dificultad
              </label>
              <select className="select-input" defaultValue="all" id="onlyDifficult" name="onlyDifficult">
                <option value="all">Todas las palabras</option>
                <option value="needs_practice">Solo palabras que necesitan práctica</option>
                <option value="new">Solo palabras nuevas (no practicadas)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary-600 px-5 py-3 font-medium text-neutral-25 shadow-[0_8px_20px_-10px_rgba(31,90,79,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-500 hover:shadow-[0_16px_30px_-12px_rgba(31,90,79,0.7)] active:translate-y-0"
                type="submit"
              >
                <i className="fa-solid fa-play" />
                <span>Iniciar quiz</span>
              </button>
              <Link className="outline-button flex-1" href="/">
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-8 rounded-xl rounded-l-sm border-l-[3px] border-secondary-400 bg-secondary-50 px-5 py-4">
            <div className="eyebrow mb-3 text-secondary-700">Reglas de la casa</div>
            <ul className="space-y-2 text-sm leading-relaxed text-neutral-700">
              <li className="flex gap-2.5">
                <i className="fa-solid fa-check mt-1 text-xs text-secondary-600" />
                Las respuestas no distinguen mayúsculas de minúsculas.
              </li>
              <li className="flex gap-2.5">
                <i className="fa-solid fa-check mt-1 text-xs text-secondary-600" />
                Los acentos y tildes no afectan la corrección.
              </li>
              <li className="flex gap-2.5">
                <i className="fa-solid fa-check mt-1 text-xs text-secondary-600" />
                Cada palabra aparece una sola vez por sesión.
              </li>
              <li className="flex gap-2.5">
                <i className="fa-solid fa-check mt-1 text-xs text-secondary-600" />
                Puedes terminar el quiz cuando quieras.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
