import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { importWordsAction } from "@/lib/actions/word-actions";
import { resolveSearchParams } from "@/lib/flash";

export default async function ImportWordsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await resolveSearchParams(searchParams);

  return (
    <>
      <FlashBanner searchParams={params} />

      <div className="mx-auto max-w-4xl">
        <div className="page-card p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Importar Palabras</h1>
            <p className="text-gray-600">Sube un archivo JSON con tus palabras</p>
          </div>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-3 font-medium text-blue-900">Formato del archivo JSON</h2>
            <pre className="overflow-x-auto rounded bg-blue-100 p-3 text-sm text-blue-900">
              <code>{`[
  {
    "english_word": "house",
    "translation": "casa",
    "explanation": "donde la gente vive",
    "language": "Inglés",
    "feature": "A1"
  }
]`}</code>
            </pre>
            <div className="mt-3 text-sm text-blue-700">
              <p>Campos requeridos: english_word, translation, language, feature</p>
              <p>Campos opcionales: explanation, times_practiced, times_correct, last_practiced</p>
            </div>
          </div>

          <form action={importWordsAction} className="space-y-6">
            <div>
              <label className="input-label" htmlFor="file">
                Archivo JSON
              </label>
              <input accept=".json" className="text-input" id="file" name="file" required type="file" />
              <p className="mt-1 text-sm text-gray-500">Solo archivos .json (máximo 10MB)</p>
            </div>

            <div>
              <label className="input-label" htmlFor="overwriteDuplicates">
                Manejar Duplicados
              </label>
              <select className="select-input" defaultValue="skip" id="overwriteDuplicates" name="overwriteDuplicates">
                <option value="skip">Omitir palabras duplicadas</option>
                <option value="update">Actualizar palabras existentes</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="createMissing">
                Idiomas/Características Faltantes
              </label>
              <select className="select-input" defaultValue="create" id="createMissing" name="createMissing">
                <option value="create">Crear automáticamente</option>
                <option value="skip">Omitir palabras con datos faltantes</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button className="primary-button flex-1" type="submit">
                Importar Palabras
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
