import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
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

      <div className="mx-auto max-w-3xl">
        <div className="page-card p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Configurar Quiz</h1>
            <p className="text-gray-600">Personaliza tu sesión de práctica</p>
          </div>

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

            <div className="flex gap-4">
              <button className="primary-button flex-1 bg-secondary-600 hover:bg-secondary-700" type="submit">
                Iniciar Quiz
              </button>
              <Link className="secondary-button flex-1" href="/">
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-8 rounded-lg bg-purple-50 p-6">
            <h2 className="mb-2 font-medium text-purple-900">Consejos para el Quiz</h2>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>Las respuestas no distinguen entre mayúsculas y minúsculas.</li>
              <li>Los acentos y tildes no afectan la corrección.</li>
              <li>Cada palabra aparecerá solo una vez por sesión.</li>
              <li>Puedes terminar el quiz en cualquier momento.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
