import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WordWithRelations } from "@/lib/types";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    word: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");
const { listWords } = await import("@/lib/words");

const mockedFindMany = vi.mocked(prisma.word.findMany);

function buildWord(overrides: Partial<WordWithRelations> = {}): WordWithRelations {
  return {
    id: overrides.id ?? 1,
    englishWord: overrides.englishWord ?? "test",
    normalizedEnglishWord: overrides.normalizedEnglishWord ?? "test",
    translation: overrides.translation ?? "prueba",
    explanation: overrides.explanation ?? null,
    languageId: overrides.languageId ?? 1,
    tagId: overrides.tagId ?? 1,
    timesPracticed: overrides.timesPracticed ?? 0,
    timesCorrect: overrides.timesCorrect ?? 0,
    lastPracticed: overrides.lastPracticed ?? null,
    createdAt: overrides.createdAt ?? new Date("2024-01-01"),
    language: overrides.language ?? { id: 1, language: "Inglés", active: true },
    tag: overrides.tag ?? { id: 1, tag: "A1", active: true },
  };
}

describe("listWords", () => {
  beforeEach(() => {
    mockedFindMany.mockReset();
  });

  it("normaliza el término de búsqueda antes de filtrar", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "Café", translation: "café" }),
      buildWord({ id: 2, englishWord: "house", translation: "casa" }),
    ]);

    const result = await listWords({ search: "cafe" });

    expect(result.totalWords).toBe(1);
    expect(result.words[0].englishWord).toBe("Café");
  });

  it("busca también en la traducción normalizada", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "house", translation: "Café" }),
      buildWord({ id: 2, englishWord: "tree", translation: "árbol" }),
    ]);

    const result = await listWords({ search: "CAFÉ" });

    expect(result.totalWords).toBe(1);
    expect(result.words[0].englishWord).toBe("house");
  });

  it("ignora zero-width spaces en el término y en los campos", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "Caf\u200Be", translation: "café" }),
      buildWord({ id: 2, englishWord: "house", translation: "casa" }),
    ]);

    const result = await listWords({ search: "cafe" });

    expect(result.totalWords).toBe(1);
    expect(result.words[0].id).toBe(1);
  });

  it("ordena primero las no practicadas en accuracy_asc", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "high", timesPracticed: 10, timesCorrect: 9 }),
      buildWord({ id: 2, englishWord: "low", timesPracticed: 5, timesCorrect: 1 }),
      buildWord({ id: 3, englishWord: "new", timesPracticed: 0, timesCorrect: 0 }),
    ]);

    const result = await listWords({ sortBy: "accuracy_asc" });

    expect(result.words.map((w) => w.englishWord)).toEqual(["new", "low", "high"]);
  });

  it("ordena al final las no practicadas en accuracy_desc", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "new", timesPracticed: 0, timesCorrect: 0 }),
      buildWord({ id: 2, englishWord: "low", timesPracticed: 5, timesCorrect: 1 }),
      buildWord({ id: 3, englishWord: "high", timesPracticed: 10, timesCorrect: 9 }),
    ]);

    const result = await listWords({ sortBy: "accuracy_desc" });

    expect(result.words.map((w) => w.englishWord)).toEqual(["high", "low", "new"]);
  });

  it("rompe empates de accuracy por orden alfabético", async () => {
    mockedFindMany.mockResolvedValue([
      buildWord({ id: 1, englishWord: "zebra", timesPracticed: 0, timesCorrect: 0 }),
      buildWord({ id: 2, englishWord: "apple", timesPracticed: 0, timesCorrect: 0 }),
    ]);

    const result = await listWords({ sortBy: "accuracy_asc" });

    expect(result.words.map((w) => w.englishWord)).toEqual(["apple", "zebra"]);
  });
});
