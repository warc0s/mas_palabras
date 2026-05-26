import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

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
});
