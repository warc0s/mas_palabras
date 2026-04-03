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

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-100/50 via-secondary-100/30 to-neutral-50" />
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-primary-200/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-secondary-200/20 blur-3xl" />

        <div className="px-4 py-20 text-center">
          <div className="mb-8">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm">
              <div className="mr-2 h-2 w-2 rounded-full bg-primary-500" />
              Tu plataforma de aprendizaje de idiomas
            </div>
            <div className="mb-6 text-6xl font-bold leading-tight md:text-7xl">
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-800 bg-clip-text text-transparent">
                Domina Nuevas
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent">
                Palabras
              </span>
            </div>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-neutral-600">
              Transforma tu vocabulario con una experiencia de aprendizaje inteligente,
              organizada y completamente personalizable para múltiples idiomas.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <StatPill color="primary" icon="fa-book" label="Palabras" value={stats.wordCount} />
            <StatPill color="green" icon="fa-globe" label="Idiomas" value={stats.languageCount} />
            <StatPill color="secondary" icon="fa-tags" label="Categorías" value={stats.featureCount} />
            {stats.totalPracticed > 0 ? (
              <StatPill
                color="orange"
                icon="fa-chart-line"
                label="Precisión"
                value={`${stats.avgAccuracy}%`}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-3">
        <FeatureCard
          href="/maspalabras"
          icon="fa-plus"
          text="Expande tu vocabulario añadiendo palabras nuevas con traducciones, explicaciones y categorías personalizadas."
          title="Añadir Palabras"
          tone="primary"
        />
        <FeatureCard
          href="/verpalabras"
          icon="fa-list"
          text="Navega tu colección completa con búsqueda inteligente, filtros avanzados y organización por categorías."
          title="Explorar Vocabulario"
          tone="green"
        />
        <FeatureCard
          href="/quiz"
          icon="fa-brain"
          text="Fortalece tu memoria con ejercicios adaptativos que priorizan las palabras que más necesitas practicar."
          title="Entrenar Mente"
          tone="secondary"
        />
      </div>

      {stats.wordCount > 0 ? (
        <div className="page-card mt-24 p-10">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-neutral-900">Tu Progreso de Aprendizaje</h2>
            <p className="text-neutral-600">Visualiza tu evolución y dominio del vocabulario</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <ProgressCard
              color="primary"
              icon="fa-book"
              label="Palabras Total"
              value={stats.wordCount}
              width={100}
            />
            <ProgressCard
              color="green"
              icon="fa-chart-line"
              label="Sesiones Práctica"
              value={stats.totalPracticed}
              width={Math.min(Math.round((stats.totalPracticed / Math.max(stats.wordCount * 3, 1)) * 100), 100)}
            />
            <ProgressCard
              color="secondary"
              icon="fa-bullseye"
              label="Precisión Media"
              value={`${stats.avgAccuracy}%`}
              width={stats.avgAccuracy}
            />
            <ProgressCard
              color="orange"
              icon="fa-triangle-exclamation"
              label="Pendientes"
              value={stats.wordsNeedPractice}
              width={Math.round((stats.wordsNeedPractice / stats.wordCount) * 100)}
            />
          </div>

          {stats.wordsNeedPractice > 0 ? (
            <div className="mt-10 text-center">
              <Link
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-8 py-4 text-white shadow-lg hover:from-orange-700 hover:to-red-700"
                href="/quiz"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <i className="fa-solid fa-fire" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Practicar Palabras Difíciles</div>
                  <div className="text-sm text-orange-100">
                    {stats.wordsNeedPractice} palabras esperando
                  </div>
                </div>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "green" | "secondary" | "orange";
}) {
  const map = {
    primary: "border-primary-200/50 bg-white/80 text-primary-600",
    green: "border-green-200/50 bg-white/80 text-green-600",
    secondary: "border-secondary-200/50 bg-white/80 text-secondary-600",
    orange: "border-orange-200/50 bg-white/80 text-orange-600",
  } as const;

  return (
    <div className={`rounded-2xl border px-6 py-4 shadow-sm backdrop-blur-sm ${map[color]}`}>
      <div className="flex items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-neutral-900">{value}</div>
          <div className="text-sm text-neutral-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  text,
  icon,
  tone,
}: {
  href: string;
  title: string;
  text: string;
  icon: string;
  tone: "primary" | "green" | "secondary";
}) {
  const map = {
    primary: "border-primary-200/50 text-primary-600 hover:border-primary-300/50",
    green: "border-green-200/50 text-green-600 hover:border-green-300/50",
    secondary: "border-secondary-200/50 text-secondary-600 hover:border-secondary-300/50",
  } as const;

  return (
    <div className={`page-card p-8 ${map[tone]}`}>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/70 text-3xl">
            <i className={`fa-solid ${icon}`} />
          </div>
        </div>
        <h3 className="mb-4 text-2xl font-bold text-neutral-900">{title}</h3>
        <p className="mb-8 leading-relaxed text-neutral-600">{text}</p>
        <Link className="primary-button" href={href}>
          <i className={`fa-solid ${icon} w-4`} />
          <span>{title}</span>
        </Link>
      </div>
    </div>
  );
}

function ProgressCard({
  icon,
  label,
  value,
  width,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  width: number;
  color: "primary" | "green" | "secondary" | "orange";
}) {
  const tones = {
    primary: "bg-primary-100 text-primary-600 from-primary-500 to-primary-600",
    green: "bg-green-100 text-green-600 from-green-500 to-green-600",
    secondary: "bg-secondary-100 text-secondary-600 from-secondary-500 to-secondary-600",
    orange: "bg-orange-100 text-orange-600 from-orange-500 to-orange-600",
  } as const;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[color].split(" ")[0]} ${tones[color].split(" ")[1]}`}>
          <i className={`fa-solid ${icon} text-xl`} />
        </div>
        <div className="text-right">
          <div className={`mb-1 text-3xl font-bold ${tones[color].split(" ")[1]}`}>{value}</div>
          <div className="text-sm text-neutral-600">{label}</div>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tones[color].split(" ").slice(2).join(" ")}`}
          style={{ width: `${Math.min(width, 100)}%` }}
        />
      </div>
    </div>
  );
}
