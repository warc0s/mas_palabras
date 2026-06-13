"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { isActivePath, navLinks } from "@/components/nav-data";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-900"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
      </button>

      {open ? (
        <div className="absolute inset-x-2 top-full mt-1 rounded-2xl border border-neutral-200 bg-neutral-25 py-2 shadow-lift">
          {navLinks.map((link) => (
            <Link
              className="mobile-nav-link"
              data-active={isActivePath(pathname, link.href)}
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              <i className={`fa-solid ${link.icon} w-5 text-center`} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
