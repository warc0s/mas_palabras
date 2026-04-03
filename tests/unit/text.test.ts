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
});
