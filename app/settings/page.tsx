import { FlashBanner } from "@/components/flash-banner";
import {
  createTagAction,
  createLanguageAction,
  deleteTagAction,
  deleteLanguageAction,
} from "@/lib/actions/settings-actions";
import { resolveSearchParams } from "@/lib/flash";
import { getActiveTags, getActiveLanguages } from "@/lib/settings";

export default async function SettingsPage({
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

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Configuración</h1>
          <p className="text-gray-600">Gestiona idiomas y etiquetas para tus palabras</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="page-card p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-800">Agregar Idioma</h2>
              <form action={createLanguageAction} className="space-y-4">
                <div>
                  <label className="input-label" htmlFor="language-name">
                    Nombre del Idioma
                  </label>
                  <input className="text-input" id="language-name" name="name" required />
                </div>
                <button className="primary-button w-full" type="submit">
                  Agregar Idioma
                </button>
              </form>
            </div>

            <div className="page-card p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-800">Idiomas Disponibles</h2>
              {languages.length > 0 ? (
                <div className="space-y-2">
                  {languages.map((language) => (
                    <div
                      className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3"
                      key={language.id}
                    >
                      <span className="font-medium text-blue-800">{language.language}</span>
                      <form action={deleteLanguageAction.bind(null, language.id)}>
                        <button className="text-red-600 hover:text-red-800" type="submit">
                          <i className="fa-solid fa-trash" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center italic text-gray-500">No hay idiomas configurados</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="page-card p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-800">Agregar Etiqueta</h2>
              <form action={createTagAction} className="space-y-4">
                <div>
                  <label className="input-label" htmlFor="tag-name">
                    Nombre de la Etiqueta
                  </label>
                  <input className="text-input" id="tag-name" name="name" required />
                </div>
                <button className="primary-button w-full bg-green-600 hover:bg-green-700" type="submit">
                  Agregar Etiqueta
                </button>
              </form>
            </div>

            <div className="page-card p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-800">Etiquetas Disponibles</h2>
              {tags.length > 0 ? (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                      key={tag.id}
                    >
                      <span className="font-medium text-green-800">{tag.tag}</span>
                      <form action={deleteTagAction.bind(null, tag.id)}>
                        <button className="text-red-600 hover:text-red-800" type="submit">
                          <i className="fa-solid fa-trash" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center italic text-gray-500">
                  No hay etiquetas configuradas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
