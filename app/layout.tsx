import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/site-shell";
import { dictionaries, getLocale } from "@/lib/i18n";

import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: dictionaries.en.meta.title,
  description: dictionaries.en.meta.description,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dictionary = dictionaries[locale];

  return (
    <html
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      lang={locale}
    >
      <head>
        <link crossOrigin="" href="https://cdnjs.cloudflare.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          referrerPolicy="no-referrer"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SiteShell dictionary={dictionary} locale={locale}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
