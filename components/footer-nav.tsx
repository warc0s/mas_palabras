"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActivePath, navLinks } from "@/components/nav-data";

export function FooterNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-8 gap-y-2">
      {navLinks.map((link) => (
        <Link
          aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
          className="font-mono text-[0.78rem] uppercase tracking-wide text-neutral-600 hover:text-primary-700"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
