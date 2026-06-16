"use client";

import { usePathname, useRouter } from "next/navigation";

const LOCALE_COOKIE = "mas-palabras-locale";
type Locale = "en" | "es" | "ca";
const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  ca: "Català",
};
const locales: Locale[] = ["en", "es", "ca"];

export function LanguageSelector({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.replace(pathname);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wide text-neutral-500">
      <span className="sr-only">{label}</span>
      <i aria-hidden="true" className="fa-solid fa-language text-neutral-400" />
      <select
        aria-label={label}
        className="rounded-lg border border-neutral-300 bg-neutral-25 px-2 py-1.5 text-neutral-700 transition-colors hover:border-neutral-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200/70"
        defaultValue={currentLocale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
