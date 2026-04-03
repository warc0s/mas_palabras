import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/text";
import type { ImportIssue, ImportResult } from "@/lib/types";

type OverwriteMode = "skip" | "update";
type CreateMissingMode = "create" | "skip";

type SanitizedImportItem = {
  englishWord: string;
  normalizedEnglish: string;
  translation: string;
  explanation: string;
  language: string;
  feature: string;
  languageId?: number;
  featureId?: number;
  timesPracticed: number;
  timesCorrect: number;
  hasStats: boolean;
  lastPracticed: Date | null;
  hasLastPracticed: boolean;
};

const EMPTY_DATE_VALUES = new Set(["", "nunca", "never"]);

export async function processImport(
  data: unknown,
  overwriteMode: OverwriteMode,
  createMissingMode: CreateMissingMode,
): Promise<ImportResult> {
  if (!Array.isArray(data)) {
    throw new Error("invalid_payload");
  }

  const result: ImportResult = {
    success: 0,
    skipped: 0,
    errors: 0,
    createdLanguages: [],
    createdFeatures: [],
    issues: [],
  };

  const createdLanguages = new Set<string>();
  const createdFeatures = new Set<string>();
  const pendingNewRecords = new Map<string, number>();

  await prisma.$transaction(async (tx) => {
    for (const [index, item] of data.entries()) {
      const line = index + 1;
      let sanitized: SanitizedImportItem;

      try {
        sanitized = sanitizeImportItem(item);
      } catch (error) {
        registerImportIssue(result, line, getErrorCode(error), "error");
        continue;
      }

      try {
        const relations = await ensureRelations(
          tx,
          sanitized,
          createMissingMode,
          createdLanguages,
          createdFeatures,
        );
        sanitized.languageId = relations.languageId;
        sanitized.featureId = relations.featureId;
      } catch (error) {
        registerImportIssue(result, line, getErrorCode(error), "skipped");
        continue;
      }

      const key = `${sanitized.languageId}:${sanitized.normalizedEnglish}`;
      const existing = await tx.word.findFirst({
        where: {
          languageId: sanitized.languageId,
          normalizedEnglishWord: sanitized.normalizedEnglish,
        },
      });

      if (existing || pendingNewRecords.has(key)) {
        if (overwriteMode === "skip") {
          registerImportIssue(result, line, "duplicate", "skipped");
          continue;
        }

        if (existing) {
          await tx.word.update({
            where: { id: existing.id },
            data: {
              translation: sanitized.translation,
              explanation: sanitized.explanation,
              featureId: sanitized.featureId,
              ...(sanitized.hasStats
                ? {
                    timesPracticed: sanitized.timesPracticed,
                    timesCorrect: sanitized.timesCorrect,
                  }
                : {}),
              ...(sanitized.hasLastPracticed
                ? {
                    lastPracticed: sanitized.lastPracticed,
                  }
                : {}),
            },
          });
        }

        result.success += 1;
        continue;
      }

      const created = await tx.word.create({
        data: {
          englishWord: sanitized.englishWord,
          normalizedEnglishWord: sanitized.normalizedEnglish,
          translation: sanitized.translation,
          explanation: sanitized.explanation,
          languageId: sanitized.languageId!,
          featureId: sanitized.featureId!,
          timesPracticed: sanitized.timesPracticed,
          timesCorrect: sanitized.timesCorrect,
          lastPracticed: sanitized.lastPracticed,
        },
      });

      pendingNewRecords.set(key, created.id);
      result.success += 1;
    }
  });

  result.createdLanguages = [...createdLanguages].sort();
  result.createdFeatures = [...createdFeatures].sort();
  return result;
}

async function ensureRelations(
  tx: Prisma.TransactionClient,
  sanitized: SanitizedImportItem,
  createMissingMode: CreateMissingMode,
  createdLanguages: Set<string>,
  createdFeatures: Set<string>,
) {
  let language = await tx.language.findUnique({
    where: { language: sanitized.language },
  });
  let feature = await tx.feature.findUnique({
    where: { feature: sanitized.feature },
  });

  if (!language) {
    if (createMissingMode !== "create") {
      throw new Error("language_missing");
    }
    language = await tx.language.create({
      data: { language: sanitized.language, active: true },
    });
    createdLanguages.add(language.language);
  }

  if (!feature) {
    if (createMissingMode !== "create") {
      throw new Error("feature_missing");
    }
    feature = await tx.feature.create({
      data: { feature: sanitized.feature, active: true },
    });
    createdFeatures.add(feature.feature);
  }

  return { languageId: language.id, featureId: feature.id };
}

function sanitizeImportItem(item: unknown): SanitizedImportItem {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("invalid_record");
  }

  const record = item as Record<string, unknown>;
  const requiredFields = ["english_word", "translation", "language", "feature"] as const;
  const missingFields = requiredFields.filter((field) => !(field in record));
  if (missingFields.length > 0) {
    throw new Error("missing_fields");
  }

  const englishWord = readString(record.english_word);
  const translation = readString(record.translation);
  const language = readString(record.language);
  const feature = readString(record.feature);
  const explanation = readOptionalString(record.explanation);

  if (!englishWord || !translation || !language || !feature) {
    throw new Error("empty_fields");
  }

  const normalizedEnglish = normalizeText(englishWord);
  const parsedStats = parseOptionalIntegerPair(record.times_practiced, record.times_correct);
  const parsedLastPracticed = parseOptionalDate(record.last_practiced);

  return {
    englishWord,
    normalizedEnglish,
    translation,
    explanation,
    language,
    feature,
    timesPracticed: parsedStats.timesPracticed,
    timesCorrect: parsedStats.timesCorrect,
    hasStats: parsedStats.hasStats,
    lastPracticed: parsedLastPracticed.value,
    hasLastPracticed: parsedLastPracticed.hasValue,
  };
}

function readString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("invalid_fields");
  }
  return value.trim();
}

function readOptionalString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value !== "string") {
    throw new Error("invalid_fields");
  }
  return value.trim();
}

function parseOptionalIntegerPair(timesPracticedRaw: unknown, timesCorrectRaw: unknown) {
  const hasTimesPracticed = timesPracticedRaw != null;
  const hasTimesCorrect = timesCorrectRaw != null;
  if (!hasTimesPracticed && !hasTimesCorrect) {
    return { timesPracticed: 0, timesCorrect: 0, hasStats: false };
  }

  const timesPracticed = parseInteger(timesPracticedRaw);
  const timesCorrect = parseInteger(timesCorrectRaw);
  if (timesPracticed < 0 || timesCorrect < 0) {
    throw new Error("negative_stats");
  }

  return { timesPracticed, timesCorrect, hasStats: true };
}

function parseInteger(value: unknown): number {
  if (value == null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error("invalid_integer");
  }
  return parsed;
}

function parseOptionalDate(value: unknown): { value: Date | null; hasValue: boolean } {
  if (value == null) {
    return { value: null, hasValue: false };
  }

  if (typeof value === "number") {
    const date = new Date(value * 1000);
    if (Number.isNaN(date.getTime())) {
      throw new Error("invalid_date_format");
    }
    return { value: date, hasValue: true };
  }

  if (typeof value !== "string") {
    throw new Error("invalid_date_format");
  }

  const trimmed = value.trim();
  if (EMPTY_DATE_VALUES.has(trimmed.toLocaleLowerCase("es"))) {
    return { value: null, hasValue: true };
  }

  const nativeParsed = new Date(trimmed);
  if (!Number.isNaN(nativeParsed.getTime())) {
    return { value: nativeParsed, hasValue: true };
  }

  const ddmmyyyy = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return { value: date, hasValue: true };
    }
  }

  const yyyymmdd = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return { value: date, hasValue: true };
    }
  }

  throw new Error("invalid_date_format");
}

function registerImportIssue(
  result: ImportResult,
  line: number,
  code: string,
  action: ImportIssue["action"],
) {
  if (action === "error") {
    result.errors += 1;
  } else {
    result.skipped += 1;
  }
  result.issues.push({ line, code, action });
}

function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "unknown_error";
}
