"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActivePath, navLinks } from "@/components/nav-data";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className="nav-link"
            data-active={active}
            href={link.href}
            key={link.href}
          >
            <i className={`fa-solid ${link.icon} text-[0.7rem]`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
