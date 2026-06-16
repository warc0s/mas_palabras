"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { isActivePath, type NavLink } from "@/components/nav-data";

const PANEL_ID = "mobile-nav-panel";

export function MobileNav({ links, labels }: { links: NavLink[]; labels: { open: string; close: string } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      buttonRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-controls={PANEL_ID}
        aria-expanded={open}
        aria-label={open ? labels.close : labels.open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-900"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
      </button>

      {open ? (
        <>
          <button
            aria-hidden="true"
            aria-label={labels.close}
            className="fixed inset-0 z-40 cursor-default bg-neutral-900/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <div
            className="absolute inset-x-2 top-full z-50 mt-1 rounded-2xl border border-neutral-200 bg-neutral-25 py-2 shadow-lift"
            id={PANEL_ID}
          >
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className="mobile-nav-link"
                  data-active={active}
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  <i className={`fa-solid ${link.icon} w-5 text-center`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
