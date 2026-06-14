import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it, vi } from "vitest";

type ProcessImport = typeof import("@/lib/import-export").processImport;
type PrismaClient = typeof import("@/lib/prisma").prisma;

let processImport: ProcessImport;
let prisma: PrismaClient;
let tempDir: string;
let originalDatabaseUrl: string | undefined;

const schemaStatements = [
  `CREATE TABLE "language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
  )`,
  `CREATE TABLE "tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
  )`,
  `CREATE TABLE "word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "english_word" TEXT NOT NULL,
    "normalized_english_word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "explanation" TEXT,
    "language_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "times_practiced" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "word_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX "language_language_key" ON "language"("language")`,
  `CREATE UNIQUE INDEX "tag_tag_key" ON "tag"("tag")`,
  `CREATE UNIQUE INDEX "uq_words_language_normalized" ON "word"("language_id", "normalized_english_word")`,
];

describe("processImport", () => {
  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "mas-palabras-"));
    originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${join(tempDir, "test.db")}`;

    const importExportModule = await import("@/lib/import-export");
    const prismaModule = await import("@/lib/prisma");
    processImport = importExportModule.processImport;
    prisma = prismaModule.prisma;

    for (const statement of schemaStatements) {
      await prisma.$executeRawUnsafe(statement);
    }
  });

  beforeEach(async () => {
    await prisma.word.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.language.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
    rmSync(tempDir, { force: true, recursive: true });
  });

  it("creates missing tags from the tag JSON field", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
        },
      ],
      "skip",
      "create",
    );

    const word = await prisma.word.findFirst({
      include: {
        language: true,
        tag: true,
      },
    });

    expect(result.success).toBe(1);
    expect(result.createdLanguages).toEqual(["Inglés"]);
    expect(result.createdTags).toEqual(["A1"]);
    expect(word?.tag.tag).toBe("A1");
  });

  it("does not accept payloads without the tag JSON field", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([{ line: 1, code: "missing_fields", action: "error" }]);
  });

  it("rejects times_correct greater than times_practiced with invalid_stats (bug 7)", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_practiced: 1,
          times_correct: 5,
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_stats", action: "error" },
    ]);

    const words = await prisma.word.findMany();
    expect(words).toHaveLength(0);
  });

  it("rejects create with only times_correct since implied times_practiced=0", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_correct: 1,
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_stats", action: "error" },
    ]);

    const words = await prisma.word.findMany();
    expect(words).toHaveLength(0);
  });

  it("rejects update that lowers times_practiced below existing times_correct", async () => {
    await prisma.language.create({ data: { language: "Inglés", active: true } });
    const tag = await prisma.tag.create({ data: { tag: "A1", active: true } });
    const language = await prisma.language.findUnique({ where: { language: "Inglés" } });

    await prisma.word.create({
      data: {
        englishWord: "house",
        normalizedEnglishWord: "house",
        translation: "casa",
        explanation: "",
        languageId: language!.id,
        tagId: tag.id,
        timesPracticed: 5,
        timesCorrect: 3,
        lastPracticed: new Date("2024-01-01T00:00:00Z"),
      },
    });

    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_practiced: 2,
        },
      ],
      "update",
      "skip",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_stats", action: "error" },
    ]);

    const word = await prisma.word.findFirst();
    expect(word?.timesPracticed).toBe(5);
    expect(word?.timesCorrect).toBe(3);
  });

  it("rejects update that raises times_correct above existing times_practiced", async () => {
    await prisma.language.create({ data: { language: "Inglés", active: true } });
    const tag = await prisma.tag.create({ data: { tag: "A1", active: true } });
    const language = await prisma.language.findUnique({ where: { language: "Inglés" } });

    await prisma.word.create({
      data: {
        englishWord: "house",
        normalizedEnglishWord: "house",
        translation: "casa",
        explanation: "",
        languageId: language!.id,
        tagId: tag.id,
        timesPracticed: 2,
        timesCorrect: 1,
        lastPracticed: new Date("2024-01-01T00:00:00Z"),
      },
    });

    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_correct: 4,
        },
      ],
      "update",
      "skip",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_stats", action: "error" },
    ]);

    const word = await prisma.word.findFirst();
    expect(word?.timesPracticed).toBe(2);
    expect(word?.timesCorrect).toBe(1);
  });

  it("preserves existing timesCorrect when only times_practiced is provided in update mode (bug 9)", async () => {
    await prisma.language.create({
      data: { language: "Inglés", active: true },
    });
    const tag = await prisma.tag.create({ data: { tag: "A1", active: true } });
    const language = await prisma.language.findUnique({ where: { language: "Inglés" } });

    await prisma.word.create({
      data: {
        englishWord: "house",
        normalizedEnglishWord: "house",
        translation: "casa vieja",
        explanation: "",
        languageId: language!.id,
        tagId: tag.id,
        timesPracticed: 5,
        timesCorrect: 3,
        lastPracticed: new Date("2024-01-01T00:00:00Z"),
      },
    });

    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa nueva",
          language: "Inglés",
          tag: "A1",
          times_practiced: 10,
        },
      ],
      "update",
      "skip",
    );

    expect(result.success).toBe(1);

    const word = await prisma.word.findFirst();
    expect(word?.translation).toBe("casa nueva");
    expect(word?.timesPracticed).toBe(10);
    expect(word?.timesCorrect).toBe(3);
  });

  it("preserves existing timesPracticed when only times_correct is provided in update mode (bug 9)", async () => {
    await prisma.language.create({
      data: { language: "Inglés", active: true },
    });
    const tag = await prisma.tag.create({ data: { tag: "A1", active: true } });
    const language = await prisma.language.findUnique({ where: { language: "Inglés" } });

    await prisma.word.create({
      data: {
        englishWord: "house",
        normalizedEnglishWord: "house",
        translation: "casa",
        explanation: "",
        languageId: language!.id,
        tagId: tag.id,
        timesPracticed: 8,
        timesCorrect: 2,
        lastPracticed: new Date("2024-01-01T00:00:00Z"),
      },
    });

    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_correct: 4,
        },
      ],
      "update",
      "skip",
    );

    expect(result.success).toBe(1);

    const word = await prisma.word.findFirst();
    expect(word?.timesPracticed).toBe(8);
    expect(word?.timesCorrect).toBe(4);
  });

  it.each([
    ["boolean", true],
    ["hex string", "0x10"],
    ["exponential string", "1e3"],
    ["single-element array", [5]],
    ["object", { value: 1 }],
  ])("rejects invalid times_practiced of type %s with invalid_integer (bug 8)", async (_name, invalidValue) => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          times_practiced: invalidValue,
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_integer", action: "error" },
    ]);
  });

  it("rejects last_practiced year-only strings with invalid_date_format (bug 25)", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          last_practiced: "5",
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_date_format", action: "error" },
    ]);
  });

  it("rejects last_practiced bare-year strings inside the accepted native parse window (bug 25)", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          last_practiced: "2024",
        },
      ],
      "skip",
      "create",
    );

    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 1, code: "invalid_date_format", action: "error" },
    ]);
  });

  it("accepts a valid ISO date for last_practiced", async () => {
    const result = await processImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
          last_practiced: "2024-04-03T15:00:00Z",
        },
      ],
      "skip",
      "create",
    );

    expect(result.success).toBe(1);
  });
});

describe("processImport error resilience (bug 10)", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/lib/prisma");
  });

  it("keeps importing remaining items when one item throws an unexpected error", async () => {
    vi.resetModules();

    const createMock = vi.fn();
    createMock
      .mockResolvedValueOnce({ id: 10 })
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ id: 30 });

    const languageFindUnique = vi.fn().mockResolvedValue({
      id: 1,
      language: "Inglés",
    });
    const tagFindUnique = vi.fn().mockResolvedValue({ id: 1, tag: "A1" });
    const wordFindFirst = vi.fn().mockResolvedValue(null);

    const txMock = {
      language: { findUnique: languageFindUnique },
      tag: { findUnique: tagFindUnique },
      word: {
        findFirst: wordFindFirst,
        create: createMock,
        update: vi.fn(),
      },
    };

    const mockPrisma = {
      $transaction: async (cb: (tx: typeof txMock) => Promise<unknown>) =>
        cb(txMock),
    };

    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }));

    const { processImport: isolatedProcessImport } = await import(
      "@/lib/import-export"
    );

    const result = await isolatedProcessImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
        },
        {
          english_word: "dog",
          translation: "perro",
          language: "Inglés",
          tag: "A1",
        },
        {
          english_word: "cat",
          translation: "gato",
          language: "Inglés",
          tag: "A1",
        },
      ],
      "skip",
      "skip",
    );

    expect(createMock).toHaveBeenCalledTimes(3);
    expect(result.success).toBe(2);
    expect(result.errors).toBe(1);
    expect(result.issues).toEqual([
      { line: 2, code: "unknown_error", action: "error" },
    ]);
  });

  it("classifies a Prisma P2002 mid-loop as duplicate skipped", async () => {
    vi.resetModules();

    const { Prisma } = await import("@prisma/client");

    const createMock = vi.fn();
    createMock
      .mockResolvedValueOnce({ id: 10 })
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError("unique", {
          code: "P2002",
          clientVersion: "test",
        }),
      )
      .mockResolvedValueOnce({ id: 30 });

    const languageFindUnique = vi.fn().mockResolvedValue({
      id: 1,
      language: "Inglés",
    });
    const tagFindUnique = vi.fn().mockResolvedValue({ id: 1, tag: "A1" });
    const wordFindFirst = vi.fn().mockResolvedValue(null);

    const txMock = {
      language: { findUnique: languageFindUnique },
      tag: { findUnique: tagFindUnique },
      word: {
        findFirst: wordFindFirst,
        create: createMock,
        update: vi.fn(),
      },
    };

    const mockPrisma = {
      $transaction: async (cb: (tx: typeof txMock) => Promise<unknown>) =>
        cb(txMock),
    };

    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }));

    const { processImport: isolatedProcessImport } = await import(
      "@/lib/import-export"
    );

    const result = await isolatedProcessImport(
      [
        {
          english_word: "house",
          translation: "casa",
          language: "Inglés",
          tag: "A1",
        },
        {
          english_word: "dog",
          translation: "perro",
          language: "Inglés",
          tag: "A1",
        },
        {
          english_word: "cat",
          translation: "gato",
          language: "Inglés",
          tag: "A1",
        },
      ],
      "skip",
      "skip",
    );

    expect(result.success).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.errors).toBe(0);
    expect(result.issues).toEqual([
      { line: 2, code: "duplicate", action: "skipped" },
    ]);
  });
});
