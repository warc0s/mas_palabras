import Link from "next/link";
import type { ReactNode } from "react";

import { MobileNav } from "@/components/mobile-nav";

const links = [
  { href: "/", label: "Inicio", icon: "fa-home" },
  { href: "/maspalabras", label: "Añadir", icon: "fa-plus" },
  { href: "/verpalabras", label: "Ver Palabras", icon: "fa-list" },
  { href: "/quiz", label: "Practicar", icon: "fa-brain" },
  { href: "/settings", label: "Ajustes", icon: "fa-cog" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-neutral-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <Link
              className="group flex items-center text-2xl font-semibold text-neutral-900 hover:text-primary-600"
              href="/"
            >
              <span className="mr-3 text-primary-500">
                <i className="fa-solid fa-book-open" />
              </span>
              <span className="bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                Registro de Palabras
              </span>
            </Link>

            <div className="hidden items-center space-x-1 md:flex">
              {links.map((link) => (
                <Link className="nav-link" href={link.href} key={link.href}>
                  <i className={`fa-solid ${link.icon} w-4`} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <MobileNav />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      <footer className="mt-20 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 py-12 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/10">
                <i className="fa-solid fa-book-open text-xl text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Registro de Palabras</h3>
              <p className="mt-2 text-sm text-neutral-400">Mejora tu vocabulario día a día</p>
            </div>
            <div className="border-t border-neutral-700 pt-6">
              <p className="text-sm text-neutral-500">
                &copy; 2026 Registro de Palabras. Diseñado para el aprendizaje personal.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
