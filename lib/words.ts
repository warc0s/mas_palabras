import { prisma } from "@/lib/prisma";
import { getAccuracy, needsPractice, practicePriority } from "@/lib/word-metrics";
import { normalizeText } from "@/lib/text";
import type { SortBy, WordWithRelations } from "@/lib/types";

type WordInput = {
  englishWord: string;
  translation: string;
  explanation?: string;
  languageId: number;
  tagId: number;
};

type WordFilters = {
  search?: string;
  languageId?: number;
  tagId?: number;
  sortBy?: SortBy;
  page?: number;
  perPage?: number;
};

export async function getDashboardStats() {
  const [wordCount, languageCount, tagCount, words] = await Promise.all([
    prisma.word.count(),
    prisma.language.count({ where: { active: true } }),
    prisma.tag.count({ where: { active: true } }),
    prisma.word.findMany({
      select: {
        timesPracticed: true,
        timesCorrect: true,
      },
    }),
  ]);

  const totalPracticed = words.reduce((sum, word) => sum + word.timesPracticed, 0);
  const practicedWords = words.filter((word) => word.timesPracticed > 0);
  const avgAccuracy =
    practicedWords.length > 0
      ? Number(
          (
            practicedWords.reduce(
              (sum, word) => sum + getAccuracy(word.timesPracticed, word.timesCorrect),
              0,
            ) / practicedWords.length
          ).toFixed(1),
        )
      : 0;
  const wordsNeedPractice = words.filter((word) =>
    needsPractice(word.timesPracticed, word.timesCorrect),
  ).length;

  return {
    wordCount,
    languageCount,
    tagCount,
    totalPracticed,
    avgAccuracy,
    wordsNeedPractice,
  };
}

export async function listWords(filters: WordFilters) {
  const search = filters.search?.trim() ?? "";
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 25, 1), 100);
  const sortBy = filters.sortBy ?? "english_word";

  const words = (await prisma.word.findMany({
    where: {
      ...(filters.languageId ? { languageId: filters.languageId } : {}),
      ...(filters.tagId ? { tagId: filters.tagId } : {}),
      ...(search
        ? {
            OR: [
              { englishWord: { contains: search } },
              { translation: { contains: search } },
              { explanation: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      language: true,
      tag: true,
    },
  })) as WordWithRelations[];

  const sortedWords = [...words].sort((left, right) => {
    switch (sortBy) {
      case "translation":
        return left.translation.localeCompare(right.translation, "es");
      case "created_at_desc":
        return right.createdAt.getTime() - left.createdAt.getTime();
      case "created_at_asc":
        return left.createdAt.getTime() - right.createdAt.getTime();
      case "accuracy_desc":
        return compareAccuracy(right, left);
      case "accuracy_asc":
        return compareAccuracy(left, right);
      case "needs_practice":
        return (
          practicePriority(right.timesPracticed, right.timesCorrect) -
            practicePriority(left.timesPracticed, left.timesCorrect) ||
          left.englishWord.localeCompare(right.englishWord, "es")
        );
      case "english_word":
      default:
        return left.englishWord.localeCompare(right.englishWord, "es");
    }
  });

  const totalWords = sortedWords.length;
  const totalPages = totalWords === 0 ? 1 : Math.ceil(totalWords / perPage);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;

  return {
    words: sortedWords.slice(startIndex, startIndex + perPage),
    page: safePage,
    perPage,
    totalWords,
    totalPages,
  };
}

function compareAccuracy(first: WordWithRelations, second: WordWithRelations) {
  const firstUnpracticed = first.timesPracticed === 0 ? 1 : 0;
  const secondUnpracticed = second.timesPracticed === 0 ? 1 : 0;
  if (firstUnpracticed !== secondUnpracticed) {
    return firstUnpracticed - secondUnpracticed;
  }

  const firstAccuracy = getAccuracy(first.timesPracticed, first.timesCorrect);
  const secondAccuracy = getAccuracy(second.timesPracticed, second.timesCorrect);
  return firstAccuracy - secondAccuracy || first.englishWord.localeCompare(second.englishWord, "es");
}

export async function getWordById(wordId: number) {
  return prisma.word.findUnique({
    where: { id: wordId },
    include: {
      language: true,
      tag: true,
    },
  });
}

export async function createWord(input: WordInput) {
  const normalized = normalizeText(input.englishWord);
  await ensureWordRelations(input.languageId, input.tagId);
  await ensureWordNotDuplicated(input.languageId, normalized);

  return prisma.word.create({
    data: {
      englishWord: input.englishWord.trim(),
      normalizedEnglishWord: normalized,
      translation: input.translation.trim(),
      explanation: input.explanation?.trim() ?? "",
      languageId: input.languageId,
      tagId: input.tagId,
    },
  });
}

export async function updateWord(wordId: number, input: WordInput) {
  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) {
    throw new Error("word_not_found");
  }

  const normalized = normalizeText(input.englishWord);
  await ensureWordRelations(input.languageId, input.tagId);
  await ensureWordNotDuplicated(input.languageId, normalized, wordId);

  return prisma.word.update({
    where: { id: wordId },
    data: {
      englishWord: input.englishWord.trim(),
      normalizedEnglishWord: normalized,
      translation: input.translation.trim(),
      explanation: input.explanation?.trim() ?? "",
      languageId: input.languageId,
      tagId: input.tagId,
    },
  });
}

export async function deleteWord(wordId: number) {
  await prisma.word.delete({
    where: { id: wordId },
  });
}

export async function bulkDeleteWords(wordIds: number[]) {
  const uniqueIds = [...new Set(wordIds)];
  const result = await prisma.word.deleteMany({
    where: { id: { in: uniqueIds } },
  });
  return result.count;
}

export async function exportWords() {
  const words = (await prisma.word.findMany({
    include: {
      language: true,
      tag: true,
    },
    orderBy: { englishWord: "asc" },
  })) as WordWithRelations[];

  return words.map((word) => ({
    id: word.id,
    english_word: word.englishWord,
    translation: word.translation,
    explanation: word.explanation ?? "",
    language: word.language.language,
    tag: word.tag.tag,
    times_practiced: word.timesPracticed,
    times_correct: word.timesCorrect,
    accuracy: getAccuracy(word.timesPracticed, word.timesCorrect),
    last_practiced: word.lastPracticed?.toISOString() ?? null,
    created_at: word.createdAt.toISOString(),
  }));
}

async function ensureWordRelations(languageId: number, tagId: number) {
  const [language, tag] = await Promise.all([
    prisma.language.findUnique({ where: { id: languageId } }),
    prisma.tag.findUnique({ where: { id: tagId } }),
  ]);

  if (!language || !language.active) {
    throw new Error("language_not_found");
  }
  if (!tag || !tag.active) {
    throw new Error("tag_not_found");
  }
}

async function ensureWordNotDuplicated(
  languageId: number,
  normalizedEnglishWord: string,
  currentId?: number,
) {
  const existing = await prisma.word.findFirst({
    where: {
      languageId,
      normalizedEnglishWord,
      ...(currentId ? { id: { not: currentId } } : {}),
    },
  });

  if (existing) {
    throw new Error("duplicate_word");
  }
}
