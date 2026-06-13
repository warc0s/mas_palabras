export type NavLink = {
  href: string;
  label: string;
  icon: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Inicio", icon: "fa-feather-pointed" },
  { href: "/maspalabras", label: "Añadir", icon: "fa-plus" },
  { href: "/verpalabras", label: "Léxico", icon: "fa-book" },
  { href: "/quiz", label: "Practicar", icon: "fa-brain" },
  { href: "/settings", label: "Ajustes", icon: "fa-sliders" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
