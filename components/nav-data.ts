import type { Dictionary } from "@/lib/i18n";

export type NavLink = {
  href: string;
  label: string;
  icon: string;
};

export function getNavLinks(dictionary: Dictionary): NavLink[] {
  return [
    { href: "/", label: dictionary.nav.home, icon: "fa-feather-pointed" },
    { href: "/maspalabras", label: dictionary.nav.add, icon: "fa-plus" },
    { href: "/verpalabras", label: dictionary.nav.lexicon, icon: "fa-book" },
    { href: "/quiz", label: dictionary.nav.practice, icon: "fa-brain" },
    { href: "/settings", label: dictionary.nav.settings, icon: "fa-sliders" },
  ];
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
