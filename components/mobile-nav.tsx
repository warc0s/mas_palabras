"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Inicio", icon: "fa-home" },
  { href: "/maspalabras", label: "Añadir", icon: "fa-plus" },
  { href: "/verpalabras", label: "Ver Palabras", icon: "fa-list" },
  { href: "/quiz", label: "Practicar", icon: "fa-brain" },
  { href: "/settings", label: "Ajustes", icon: "fa-cog" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        className="text-xl text-neutral-600 hover:text-neutral-900"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <i className="fa-solid fa-bars" />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 border-t border-neutral-200/50 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                className="mobile-nav-link"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                <i className={`fa-solid ${link.icon} w-5`} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
