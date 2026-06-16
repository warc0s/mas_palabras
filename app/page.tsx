import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { resolveSearchParams } from "@/lib/flash";
import { getDictionary } from "@/lib/i18n";
import { getDashboardStats } from "@/lib/words";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [stats, params, dictionary] = await Promise.all([
    getDashboardStats(),
    resolveSearchParams(searchParams),
    getDictionary(),
  ]);

  return (
    <>
      <FlashBanner searchParams={params} />

      {/* Headword hero: the app name treated as a dictionary entry. */}
      <section className="relative animate-rise pb-4 pt-6">
        <div className="mb-7 flex items-center gap-4">
          <span className="eyebrow">{dictionary.home.eyebrow}</span>
          <span className="h-px w-12 origin-left animate-draw-rule bg-primary-400" />
          <span className="eyebrow-muted">{dictionary.home.descriptor}</span>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row md:items-baseline md:flex-wrap">
          <h1 className="font-display text-6xl font-semibold leading-none tracking-tight text-neutral-900 md:text-8xl">
            {dictionary.productName}
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-base text-primary-700 md:text-lg">
              /ˈmas pa·ˈla·bras/
            </span>
            <span className="font-display text-base italic text-neutral-500 md:text-lg">
              {dictionary.home.phoneticType}
            </span>
          </div>
        </div>

        <p className="mt-7 max-w-2xl text-balance text-lg leading-relaxed text-neutral-700">
          <span className="font-mono text-sm text-primary-600">1.</span>{" "}
          {dictionary.home.definition}
        </p>

        {/* Masthead stat ledger */}
        <div className="mt-10 flex flex-wrap items-stretch gap-y-4 border-y border-neutral-300">
          <MastheadStat icon="fa-book" label={dictionary.home.stats.words} value={stats.wordCount} />
          <MastheadStat icon="fa-earth-americas" label={dictionary.home.stats.languages} value={stats.languageCount} />
          <MastheadStat icon="fa-tags" label={dictionary.home.stats.tags} value={stats.tagCount} />
          {stats.totalPracticed > 0 ? (
            <MastheadStat
              icon="fa-bullseye"
              label={dictionary.home.stats.accuracy}
              value={`${stats.avgAccuracy}%`}
            />
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link className="primary-button" href="/maspalabras">
            <i className="fa-solid fa-plus" />
            <span>{dictionary.common.addWord}</span>
          </Link>
          <Link className="outline-button" href="/verpalabras">
            <i className="fa-solid fa-book" />
            <span>{dictionary.home.exploreLexicon}</span>
          </Link>
        </div>
      </section>

      {/* Index cards */}
      <section className="mt-20 animate-rise animation-delay-200">
        <div className="mb-8 flex items-center gap-4">
          <span className="eyebrow-muted">{dictionary.home.index}</span>
          <span className="rule" />
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 shadow-paper md:grid-cols-3">
          <IndexCard
            href="/maspalabras"
            icon="fa-feather-pointed"
            number="I"
            openLabel={dictionary.common.open}
            text={dictionary.home.cards.addText}
            title={dictionary.home.cards.addTitle}
          />
          <IndexCard
            href="/verpalabras"
            icon="fa-book-open"
            number="II"
            openLabel={dictionary.common.open}
            text={dictionary.home.cards.lexiconText}
            title={dictionary.home.cards.lexiconTitle}
          />
          <IndexCard
            href="/quiz"
            icon="fa-brain"
            number="III"
            openLabel={dictionary.common.open}
            text={dictionary.home.cards.memoryText}
            title={dictionary.home.cards.memoryTitle}
          />
        </div>
      </section>

      {stats.wordCount > 0 ? (
        <section className="page-card mt-20 animate-rise animation-delay-300 p-8 md:p-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">{dictionary.home.progressEyebrow}</span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-neutral-900 md:text-4xl">
                {dictionary.home.progressTitle}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
              {dictionary.home.progressText}
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            <LedgerStat
              label={dictionary.home.totalWords}
              tone="primary"
              value={stats.wordCount}
              width={100}
            />
            <LedgerStat
              label={dictionary.home.practiceSessions}
              tone="secondary"
              value={stats.totalPracticed}
              width={Math.min(
                Math.round((stats.totalPracticed / Math.max(stats.wordCount * 3, 1)) * 100),
                100,
              )}
            />
            <LedgerStat
              label={dictionary.home.averageAccuracy}
              tone="accent"
              value={`${stats.avgAccuracy}%`}
              width={stats.avgAccuracy}
            />
            <LedgerStat
              label={dictionary.home.needReview}
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
                    {dictionary.home.practiceDifficult}
                  </div>
                  <div className="eyebrow-muted mt-1">
                    {dictionary.home.waitingEntries(stats.wordsNeedPractice)}
                  </div>
                </div>
              </div>
              <span className="font-mono text-sm font-medium uppercase tracking-wide text-primary-700">
                {dictionary.home.start}{" "}
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
  openLabel,
}: {
  href: string;
  title: string;
  text: string;
  icon: string;
  number: string;
  openLabel: string;
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
        {openLabel}
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
