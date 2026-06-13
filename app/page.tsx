import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { resolveSearchParams } from "@/lib/flash";
import { getDashboardStats } from "@/lib/words";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [stats, params] = await Promise.all([getDashboardStats(), resolveSearchParams(searchParams)]);

  return (
    <>
      <FlashBanner searchParams={params} />

      {/* Headword hero — the app name treated as a dictionary entry */}
      <section className="relative animate-rise pb-4 pt-6">
        <div className="mb-7 flex items-center gap-4">
          <span className="eyebrow">№ 001</span>
          <span className="h-px w-12 origin-left animate-draw-rule bg-primary-400" />
          <span className="eyebrow-muted">Diccionario personal vivo</span>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row md:items-baseline md:flex-wrap">
          <h1 className="font-display text-6xl font-semibold leading-none tracking-tight text-neutral-900 md:text-8xl">
            Más Palabras
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-base text-primary-700 md:text-lg">
              /ˈmas pa·ˈla·bras/
            </span>
            <span className="font-display text-base italic text-neutral-500 md:text-lg">
              loc. nom.
            </span>
          </div>
        </div>

        <p className="mt-7 max-w-2xl text-balance text-lg leading-relaxed text-neutral-700">
          <span className="font-mono text-sm text-primary-600">1.</span>{" "}
          Sistema personal para <em className="font-display not-italic text-neutral-900">coleccionar</em>,{" "}
          <em className="font-display not-italic text-neutral-900">definir</em> y{" "}
          <em className="font-display not-italic text-neutral-900">memorizar</em> el vocabulario que de
          verdad importa, en cualquier idioma.
        </p>

        {/* Masthead stat ledger */}
        <div className="mt-10 flex flex-wrap items-stretch gap-y-4 border-y border-neutral-300">
          <MastheadStat icon="fa-book" label="Palabras" value={stats.wordCount} />
          <MastheadStat icon="fa-earth-americas" label="Idiomas" value={stats.languageCount} />
          <MastheadStat icon="fa-tags" label="Etiquetas" value={stats.tagCount} />
          {stats.totalPracticed > 0 ? (
            <MastheadStat
              icon="fa-bullseye"
              label="Precisión"
              value={`${stats.avgAccuracy}%`}
            />
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link className="primary-button" href="/maspalabras">
            <i className="fa-solid fa-plus" />
            <span>Añadir palabra</span>
          </Link>
          <Link className="outline-button" href="/verpalabras">
            <i className="fa-solid fa-book" />
            <span>Explorar léxico</span>
          </Link>
        </div>
      </section>

      {/* Index cards */}
      <section className="mt-20 animate-rise animation-delay-200">
        <div className="mb-8 flex items-center gap-4">
          <span className="eyebrow-muted">Índice</span>
          <span className="rule" />
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 shadow-paper md:grid-cols-3">
          <IndexCard
            href="/maspalabras"
            icon="fa-feather-pointed"
            number="I"
            text="Registra entradas nuevas con su traducción, una explicación propia y las etiquetas que tú decidas."
            title="Añadir palabras"
          />
          <IndexCard
            href="/verpalabras"
            icon="fa-book-open"
            number="II"
            text="Recorre tu colección completa con búsqueda, filtros por idioma y etiqueta, y orden a tu gusto."
            title="Explorar el léxico"
          />
          <IndexCard
            href="/quiz"
            icon="fa-brain"
            number="III"
            text="Repasa con ejercicios adaptativos que insisten en las palabras que más se te resisten."
            title="Entrenar memoria"
          />
        </div>
      </section>

      {stats.wordCount > 0 ? (
        <section className="page-card mt-20 animate-rise animation-delay-300 p-8 md:p-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Apéndice · Progreso</span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-neutral-900 md:text-4xl">
                Tu cuaderno de avance
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
              Una lectura rápida de cuánto has construido y qué te espera por repasar.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            <LedgerStat
              label="Palabras en total"
              tone="primary"
              value={stats.wordCount}
              width={100}
            />
            <LedgerStat
              label="Sesiones de práctica"
              tone="secondary"
              value={stats.totalPracticed}
              width={Math.min(
                Math.round((stats.totalPracticed / Math.max(stats.wordCount * 3, 1)) * 100),
                100,
              )}
            />
            <LedgerStat
              label="Precisión media"
              tone="accent"
              value={`${stats.avgAccuracy}%`}
              width={stats.avgAccuracy}
            />
            <LedgerStat
              label="Necesitan repaso"
              tone="warning"
              value={stats.wordsNeedPractice}
              width={Math.round((stats.wordsNeedPractice / stats.wordCount) * 100)}
            />
          </div>

          {stats.wordsNeedPractice > 0 ? (
            <Link
              className="group mt-10 flex flex-col gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-paper sm:flex-row sm:items-center sm:justify-between"
              href="/quiz"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-neutral-25 shadow-glow transition-transform group-hover:scale-105">
                  <i className="fa-solid fa-fire" />
                </span>
                <div>
                  <div className="font-display text-lg font-semibold text-neutral-900">
                    Practicar las palabras difíciles
                  </div>
                  <div className="eyebrow-muted mt-1">
                    {stats.wordsNeedPractice} entradas esperando turno
                  </div>
                </div>
              </div>
              <span className="font-mono text-sm font-medium uppercase tracking-wide text-primary-700">
                Empezar{" "}
                <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function MastheadStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex min-w-[8rem] flex-1 items-center gap-3 border-r border-neutral-300 px-5 py-5 last:border-r-0">
      <i className={`fa-solid ${icon} text-neutral-400`} />
      <div>
        <div className="font-display text-3xl font-semibold leading-none text-neutral-900">
          {value}
        </div>
        <div className="eyebrow-muted mt-1.5">{label}</div>
      </div>
    </div>
  );
}

function IndexCard({
  href,
  title,
  text,
  icon,
  number,
}: {
  href: string;
  title: string;
  text: string;
  icon: string;
  number: string;
}) {
  return (
    <Link
      className="group relative flex flex-col bg-neutral-25 p-8 transition-colors hover:bg-primary-50"
      href={href}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl italic text-neutral-300 transition-colors group-hover:text-primary-400">
          {number}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-lg text-primary-600 transition-all group-hover:-translate-y-0.5 group-hover:border-primary-200 group-hover:bg-neutral-25 group-hover:shadow-paper">
          <i className={`fa-solid ${icon}`} />
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">{text}</p>
      <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.72rem] font-medium uppercase tracking-widest text-primary-700">
        Abrir
        <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function LedgerStat({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: number | string;
  width: number;
  tone: "primary" | "secondary" | "accent" | "warning";
}) {
  const bars = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    accent: "bg-accent",
    warning: "bg-primary-400",
  } as const;

  return (
    <div>
      <div className="font-display text-4xl font-semibold leading-none text-neutral-900">{value}</div>
      <div className="eyebrow-muted mt-2">{label}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full ${bars[tone]}`}
          style={{ width: `${Math.min(width, 100)}%` }}
        />
      </div>
    </div>
  );
}
