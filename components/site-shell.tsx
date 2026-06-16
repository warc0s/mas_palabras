import Link from "next/link";
import type { ReactNode } from "react";

import { DesktopNav } from "@/components/desktop-nav";
import { FooterNav } from "@/components/footer-nav";
import { LanguageSelector } from "@/components/language-selector";
import { MobileNav } from "@/components/mobile-nav";
import { getNavLinks } from "@/components/nav-data";
import type { Dictionary, Locale } from "@/lib/i18n";

export function SiteShell({
  children,
  dictionary,
  locale,
}: {
  children: ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}) {
  const navLinks = getNavLinks(dictionary);

  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-primary-600 via-accent to-secondary-600" />

      <header className="sticky top-0 z-50 border-b border-neutral-300 bg-neutral-50/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link className="group flex items-center gap-3" href="/">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 font-display text-lg font-semibold text-neutral-25 shadow-paper transition-all group-hover:-rotate-3 group-hover:bg-primary-700">
                {dictionary.logoText}
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-tight text-neutral-900">
                  {dictionary.productName}
                </span>
                <span className="eyebrow-muted mt-1">{dictionary.shell.tagline}</span>
              </span>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <DesktopNav links={navLinks} />
              <LanguageSelector currentLocale={locale} label={dictionary.shell.languageLabel} />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSelector currentLocale={locale} label={dictionary.shell.languageLabel} />
              <MobileNav
                links={navLinks}
                labels={{ close: dictionary.shell.closeMenu, open: dictionary.shell.openMenu }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>

      <footer className="mt-24 border-t border-neutral-300 bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 font-display text-base font-semibold text-neutral-25">
                  {dictionary.logoText}
                </span>
                <span className="font-display text-2xl font-semibold text-neutral-900">
                  {dictionary.productName}
                </span>
              </div>
              <p className="mt-4 font-display text-lg italic leading-relaxed text-neutral-600">
                {dictionary.shell.quote}
              </p>
            </div>

            <FooterNav links={navLinks} />
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-neutral-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="eyebrow-muted">{dictionary.shell.copyright}</p>
            <p className="eyebrow-muted">{dictionary.shell.footerNote}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
