import { describe, expect, it } from "vitest";

import { normalizeText } from "@/lib/text";

describe("normalizeText", () => {
  it("elimina acentos y normaliza mayúsculas", () => {
    expect(normalizeText("Café")).toBe("cafe");
    expect(normalizeText("CAFÉ")).toBe("cafe");
  });

  it("recorta espacios laterales", () => {
    expect(normalizeText("  Árbol  ")).toBe("arbol");
  });

  it("elimina zero-width space entre letras", () => {
    expect(normalizeText("caf\u200Be")).toBe("cafe");
    expect(normalizeText("Caf\u200Bé")).toBe("cafe");
  });

  it("elimina BOM al inicio y embebido", () => {
    expect(normalizeText("\uFEFFCafe")).toBe("cafe");
    expect(normalizeText("\uFEFFca\uFEFFfe")).toBe("cafe");
  });

  it("elimina zero-width joiner", () => {
    expect(normalizeText("ca\u200Dfe")).toBe("cafe");
  });

  it("elimina marks direccionales LTR/RTL", () => {
    expect(normalizeText("cafe\u200E")).toBe("cafe");
    expect(normalizeText("cafe\u200F")).toBe("cafe");
  });

  it("decomposes combining marks and diacritics", () => {
    const composed = "e\u0301";
    expect(normalizeText(composed)).toBe("e");
    expect(normalizeText("Caf" + "e\u0301")).toBe("cafe");
  });

  it("es idempotente", () => {
    const cases = [
      "Café",
      "  Árbol  ",
      "cafe\u200Be",
      "\uFEFFCafé",
      "ca\u200Dfe",
      "nïñö",
      "",
      "   ",
    ];
    for (const value of cases) {
      const once = normalizeText(value);
      expect(normalizeText(once)).toBe(once);
    }
  });

  it("devuelve vacío para entradas que solo contienen formato o espacios", () => {
    expect(normalizeText("\u200B\u200B\u200B")).toBe("");
    expect(normalizeText("\uFEFF")).toBe("");
    expect(normalizeText("\u200E\u200F")).toBe("");
    expect(normalizeText("   ")).toBe("");
    expect(normalizeText("")).toBe("");
  });

  it("trata como equivalentes visually-identical con y sin Cf", () => {
    expect(normalizeText("Cafe")).toBe(normalizeText("Caf\u200Be"));
    expect(normalizeText("Cafe")).toBe(normalizeText("\uFEFFCafe"));
  });
});
