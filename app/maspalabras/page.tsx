import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { createWordAction } from "@/lib/actions/word-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getActiveFeatures, getActiveLanguages } from "@/lib/settings";

export default async function CreateWordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [languages, features, params] = await Promise.all([
    getActiveLanguages(),
    getActiveFeatures(),
    resolveSearchParams(searchParams),
  ]);

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-4xl">
        <div className="page-card p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-neutral-800">Añadir Palabra</h1>
            <p className="text-neutral-600">Registra una nueva entrada en tu vocabulario</p>
          </div>

          <form action={createWordAction} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="languageId">
                  Idioma
                </label>
                <select className="select-input" id="languageId" name="languageId" required>
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.language}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" htmlFor="featureId">
                  Característica
                </label>
                <select className="select-input" id="featureId" name="featureId" required>
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.feature}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="englishWord">
                Palabra
              </label>
              <input className="text-input" id="englishWord" name="englishWord" required />
            </div>

            <div>
              <label className="input-label" htmlFor="translation">
                Traducción
              </label>
              <input className="text-input" id="translation" name="translation" required />
            </div>

            <div>
              <label className="input-label" htmlFor="explanation">
                Explicación
              </label>
              <textarea className="textarea-input" id="explanation" name="explanation" rows={4} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="primary-button flex-1" type="submit">
                <i className="fa-solid fa-floppy-disk w-4" />
                <span>Guardar</span>
              </button>
              <Link className="secondary-button flex-1" href="/verpalabras">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
