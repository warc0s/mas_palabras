import { FlashBanner } from "@/components/flash-banner";
import { PageHeader } from "@/components/page-header";
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

      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Taller"
          subtitle="Define los idiomas y las etiquetas con los que clasificas tu vocabulario."
          title="Ajustes"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Languages */}
          <section className="page-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-600 text-neutral-25 shadow-paper">
                <i className="fa-solid fa-earth-americas text-sm" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-neutral-900">Idiomas</h2>
                <p className="eyebrow-muted mt-0.5">{languages.length} en uso</p>
              </div>
            </div>

            <form action={createLanguageAction} className="flex gap-2 border-b border-neutral-200 p-6">
              <input
                aria-label="Nombre del idioma"
                className="text-input"
                name="name"
                placeholder="p. ej. Inglés"
                required
              />
              <button
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary-600 px-4 py-3 font-medium text-neutral-25 shadow-[0_8px_20px_-10px_rgba(31,90,79,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-500"
                type="submit"
              >
                <i className="fa-solid fa-plus" />
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </form>

            <div className="p-6">
              {languages.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {languages.map((language) => (
                    <li className="flex items-center justify-between py-3" key={language.id}>
                      <span className="flex items-center gap-3">
                        <i className="fa-solid fa-earth-americas text-sm text-secondary-600" />
                        <span className="font-display text-lg text-neutral-900">
                          {language.language}
                        </span>
                      </span>
                      <form action={deleteLanguageAction.bind(null, language.id)}>
                        <button
                          aria-label={`Eliminar ${language.language}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
                          type="submit"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyHint icon="fa-earth-americas" text="Aún no hay idiomas configurados." />
              )}
            </div>
          </section>

          {/* Tags */}
          <section className="page-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-neutral-25 shadow-glow">
                <i className="fa-solid fa-tag text-sm" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-neutral-900">Etiquetas</h2>
                <p className="eyebrow-muted mt-0.5">{tags.length} en uso</p>
              </div>
            </div>

            <form action={createTagAction} className="flex gap-2 border-b border-neutral-200 p-6">
              <input
                aria-label="Nombre de la etiqueta"
                className="text-input"
                name="name"
                placeholder="p. ej. A1, Verbos…"
                required
              />
              <button
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-medium text-neutral-25 shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-500"
                type="submit"
              >
                <i className="fa-solid fa-plus" />
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </form>

            <div className="p-6">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 py-1.5 pl-3.5 pr-1.5 font-mono text-sm text-neutral-700"
                      key={tag.id}
                    >
                      {tag.tag}
                      <form action={deleteTagAction.bind(null, tag.id)}>
                        <button
                          aria-label={`Eliminar ${tag.tag}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-primary-100 hover:text-primary-700"
                          type="submit"
                        >
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      </form>
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyHint icon="fa-tag" text="Aún no hay etiquetas configuradas." />
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EmptyHint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <i className={`fa-solid ${icon} text-2xl text-neutral-300`} />
      <p className="font-mono text-xs uppercase tracking-wide text-neutral-400">{text}</p>
    </div>
  );
}
