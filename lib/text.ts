export function normalizeText(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("es");
}

export function slugFromText(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
