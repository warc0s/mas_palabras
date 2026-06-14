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
  tag: string;
  timesPracticed: number;
  timesCorrect: number;
  hasTimesPracticed: boolean;
  hasTimesCorrect: boolean;
  lastPracticed: Date | null;
  hasLastPracticed: boolean;
};

const EMPTY_DATE_VALUES = new Set(["", "nunca", "never"]);
const MIN_ACCEPTED_YEAR = 2000;
const MAX_ACCEPTED_YEAR = 2100;

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
    createdTags: [],
    issues: [],
  };

  const createdLanguages = new Set<string>();
  const createdTags = new Set<string>();
  const pendingNewRecords = new Map<string, number>();

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
      const outcome = await prisma.$transaction(async (tx) => {
        const relations = await ensureRelations(
          tx,
          sanitized,
          createMissingMode,
        );

        const key = `${relations.languageId}:${sanitized.normalizedEnglish}`;
        const existing = await tx.word.findFirst({
          where: {
            languageId: relations.languageId,
            normalizedEnglishWord: sanitized.normalizedEnglish,
          },
        });

        const isDuplicate = existing != null || pendingNewRecords.has(key);

        if (isDuplicate && overwriteMode === "skip") {
          return {
            kind: "skipped_duplicate" as const,
            createdLanguage: relations.createdLanguage,
            createdTag: relations.createdTag,
          };
        }

        if (existing) {
          const effectivePracticed = sanitized.hasTimesPracticed
            ? sanitized.timesPracticed
            : existing.timesPracticed;
          const effectiveCorrect = sanitized.hasTimesCorrect
            ? sanitized.timesCorrect
            : existing.timesCorrect;
          if (effectiveCorrect > effectivePracticed) {
            throw new Error("invalid_stats");
          }
          await tx.word.update({
            where: { id: existing.id },
            data: {
              translation: sanitized.translation,
              explanation: sanitized.explanation,
              tagId: relations.tagId,
              ...(sanitized.hasTimesPracticed
                ? { timesPracticed: sanitized.timesPracticed }
                : {}),
              ...(sanitized.hasTimesCorrect
                ? { timesCorrect: sanitized.timesCorrect }
                : {}),
              ...(sanitized.hasLastPracticed
                ? { lastPracticed: sanitized.lastPracticed }
                : {}),
            },
          });
          return {
            kind: "success" as const,
            createdLanguage: relations.createdLanguage,
            createdTag: relations.createdTag,
          };
        }

        if (pendingNewRecords.has(key)) {
          return {
            kind: "skipped_duplicate" as const,
            createdLanguage: relations.createdLanguage,
            createdTag: relations.createdTag,
          };
        }

        if (sanitized.timesCorrect > sanitized.timesPracticed) {
          throw new Error("invalid_stats");
        }

        const created = await tx.word.create({
          data: {
            englishWord: sanitized.englishWord,
            normalizedEnglishWord: sanitized.normalizedEnglish,
            translation: sanitized.translation,
            explanation: sanitized.explanation,
            languageId: relations.languageId,
            tagId: relations.tagId,
            timesPracticed: sanitized.timesPracticed,
            timesCorrect: sanitized.timesCorrect,
            lastPracticed: sanitized.lastPracticed,
          },
        });

        pendingNewRecords.set(key, created.id);
        return {
          kind: "success" as const,
          createdLanguage: relations.createdLanguage,
          createdTag: relations.createdTag,
        };
      });

      if (outcome.createdLanguage) {
        createdLanguages.add(outcome.createdLanguage);
      }
      if (outcome.createdTag) {
        createdTags.add(outcome.createdTag);
      }

      if (outcome.kind === "success") {
        result.success += 1;
      } else {
        registerImportIssue(result, line, "duplicate", "skipped");
      }
    } catch (error) {
      const code = classifyProcessError(error);
      const action: ImportIssue["action"] = SKIP_ISSUE_CODES.has(code)
        ? "skipped"
        : "error";
      registerImportIssue(result, line, code, action);
    }
  }

  result.createdLanguages = [...createdLanguages].sort();
  result.createdTags = [...createdTags].sort();
  return result;
}

const SKIP_ISSUE_CODES = new Set([
  "duplicate",
  "language_missing",
  "tag_missing",
]);

async function ensureRelations(
  tx: Prisma.TransactionClient,
  sanitized: SanitizedImportItem,
  createMissingMode: CreateMissingMode,
): Promise<{
  languageId: number;
  tagId: number;
  createdLanguage: string | null;
  createdTag: string | null;
}> {
  let language = await tx.language.findUnique({
    where: { language: sanitized.language },
  });
  let tag = await tx.tag.findUnique({
    where: { tag: sanitized.tag },
  });

  let createdLanguage: string | null = null;
  let createdTag: string | null = null;

  if (!language) {
    if (createMissingMode !== "create") {
      throw new Error("language_missing");
    }
    language = await tx.language.create({
      data: { language: sanitized.language, active: true },
    });
    createdLanguage = language.language;
  }

  if (!tag) {
    if (createMissingMode !== "create") {
      throw new Error("tag_missing");
    }
    tag = await tx.tag.create({
      data: { tag: sanitized.tag, active: true },
    });
    createdTag = tag.tag;
  }

  return { languageId: language.id, tagId: tag.id, createdLanguage, createdTag };
}

function classifyProcessError(error: unknown): string {
  const code = getErrorCode(error);
  if (DOMAIN_ERROR_CODES.has(code)) {
    return code;
  }
  if (isPrismaUniqueViolation(error)) {
    return "duplicate";
  }
  return "unknown_error";
}

const DOMAIN_ERROR_CODES = new Set([
  "language_missing",
  "tag_missing",
  "invalid_stats",
  "invalid_record",
  "missing_fields",
  "empty_fields",
  "invalid_fields",
  "invalid_integer",
  "invalid_date_format",
  "negative_stats",
]);

function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function sanitizeImportItem(item: unknown): SanitizedImportItem {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("invalid_record");
  }

  const record = item as Record<string, unknown>;
  const requiredFields = ["english_word", "translation", "language", "tag"] as const;
  const missingFields = requiredFields.filter((field) => !(field in record));
  if (missingFields.length > 0) {
    throw new Error("missing_fields");
  }

  const englishWord = readString(record.english_word);
  const translation = readString(record.translation);
  const language = readString(record.language);
  const tag = readString(record.tag);
  const explanation = readOptionalString(record.explanation);

  if (!englishWord || !translation || !language || !tag) {
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
    tag,
    timesPracticed: parsedStats.timesPracticed,
    timesCorrect: parsedStats.timesCorrect,
    hasTimesPracticed: parsedStats.hasTimesPracticed,
    hasTimesCorrect: parsedStats.hasTimesCorrect,
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
    return {
      timesPracticed: 0,
      timesCorrect: 0,
      hasTimesPracticed: false,
      hasTimesCorrect: false,
    };
  }

  const timesPracticed = hasTimesPracticed ? parseInteger(timesPracticedRaw) : 0;
  const timesCorrect = hasTimesCorrect ? parseInteger(timesCorrectRaw) : 0;

  if (hasTimesPracticed && timesPracticed < 0) {
    throw new Error("negative_stats");
  }
  if (hasTimesCorrect && timesCorrect < 0) {
    throw new Error("negative_stats");
  }
  if (hasTimesPracticed && hasTimesCorrect && timesCorrect > timesPracticed) {
    throw new Error("invalid_stats");
  }

  return { timesPracticed, timesCorrect, hasTimesPracticed, hasTimesCorrect };
}

function parseInteger(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("invalid_integer");
  }
  if (value === "") {
    return 0;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error("invalid_integer");
    }
    return value;
  }
  if (!/^-?\d+$/.test(value)) {
    throw new Error("invalid_integer");
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

  const ddmmyyyy = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isNaN(date.getTime()) && isReasonableDateYear(date)) {
      return { value: date, hasValue: true };
    }
  }

  const yyyymmdd = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isNaN(date.getTime()) && isReasonableDateYear(date)) {
      return { value: date, hasValue: true };
    }
  }

  if (/^\d+$/.test(trimmed)) {
    throw new Error("invalid_date_format");
  }

  const nativeParsed = new Date(trimmed);
  if (
    !Number.isNaN(nativeParsed.getTime()) &&
    isReasonableDateYear(nativeParsed)
  ) {
    return { value: nativeParsed, hasValue: true };
  }

  throw new Error("invalid_date_format");
}

function isReasonableDateYear(date: Date): boolean {
  const year = date.getUTCFullYear();
  return year >= MIN_ACCEPTED_YEAR && year <= MAX_ACCEPTED_YEAR;
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
