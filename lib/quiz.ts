import crypto from "node:crypto";

import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/text";
import { getAccuracy, needsPractice } from "@/lib/word-metrics";
import type { DifficultyFilter, QuizType } from "@/lib/types";

const QUIZ_COOKIE_NAME = "mas-palabras-quiz";

const QUIZ_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

type QuizConfig = {
  quizType: QuizType;
  languageId: number;
  tagId: number;
  onlyDifficult: DifficultyFilter;
  poolSize: number;
};

type ResolvedDirection = "to_spanish" | "to_original";

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function deriveMixedDirection(sessionId: string, index: number): ResolvedDirection {
  let hash = 0;
  const seed = `${sessionId}:${index}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) | 0;
  }
  return (hash & 1) === 0 ? "to_spanish" : "to_original";
}

function resolveDirection(
  session: { sessionId: string; currentIndex: number },
  config: QuizConfig,
): ResolvedDirection {
  if (config.quizType === "mixed") {
    return deriveMixedDirection(session.sessionId, session.currentIndex);
  }
  return config.quizType;
}

export async function startQuizSession(input: {
  languageId: number;
  tagId: number;
  quizType: QuizType;
  onlyDifficult: DifficultyFilter;
}) {
  const active = await getActiveQuizSession();
  if (active && !active.isCompleted) {
    await prisma.quizSession.update({
      where: { id: active.id },
      data: { isCompleted: true },
    });
  }

  const words = await prisma.word.findMany({
    where: {
      language: { active: true },
      tag: { active: true },
      ...(input.languageId ? { languageId: input.languageId } : {}),
      ...(input.tagId ? { tagId: input.tagId } : {}),
    },
    select: {
      id: true,
      timesPracticed: true,
      timesCorrect: true,
    },
  });

  const filtered = words.filter((word) => {
    if (input.onlyDifficult === "new") {
      return word.timesPracticed === 0;
    }
    if (input.onlyDifficult === "needs_practice") {
      return needsPractice(word.timesPracticed, word.timesCorrect);
    }
    return true;
  });

  if (filtered.length === 0) {
    return null;
  }

  const shuffledIds = shuffle(filtered.map((word) => word.id));
  const sessionId = crypto.randomUUID();
  const quizConfig: QuizConfig = {
    quizType: input.quizType,
    languageId: input.languageId,
    tagId: input.tagId,
    onlyDifficult: input.onlyDifficult,
    poolSize: shuffledIds.length,
  };

  await prisma.quizSession.create({
    data: {
      sessionId,
      wordIdsJson: JSON.stringify(shuffledIds),
      totalQuestions: 0,
      correctAnswers: 0,
      currentIndex: 0,
      isCompleted: false,
      quizConfigJson: JSON.stringify(quizConfig),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(QUIZ_COOKIE_NAME, sessionId, {
    ...QUIZ_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24,
  });

  return { sessionId, poolSize: shuffledIds.length };
}

export async function getActiveQuizSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(QUIZ_COOKIE_NAME)?.value;
  if (!sessionId) {
    return null;
  }

  return prisma.quizSession.findUnique({
    where: { sessionId },
  });
}

export async function getQuizQuestionData() {
  const session = await getActiveQuizSession();
  if (!session) {
    return null;
  }

  if (session.isCompleted) {
    await clearQuizCookie();
    return null;
  }

  const wordIds = parseWordIds(session.wordIdsJson);
  if (wordIds.length === 0 || session.currentIndex >= wordIds.length) {
    await finalizeQuizSession(session.id);
    return null;
  }

  const wordId = wordIds[session.currentIndex];
  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: {
      language: true,
      tag: true,
    },
  });

  if (!word) {
    await prisma.quizSession.update({
      where: { id: session.id },
      data: { currentIndex: { increment: 1 } },
    });
    return getQuizQuestionData();
  }

  const config = parseQuizConfig(session.quizConfigJson);
  const direction = resolveDirection(session, config);

  return {
    session,
    word,
    wordIds,
    quizType: direction,
    stats: {
      answered: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      totalAvailable: wordIds.length,
    },
  };
}

export async function submitQuizAnswer(input: {
  answer: string;
  wordId: number;
  sessionId: string;
}) {
  const cookieStore = await cookies();
  const cookieSessionId = cookieStore.get(QUIZ_COOKIE_NAME)?.value;

  const outcome = await prisma.$transaction(async (tx) => {
    if (!cookieSessionId) {
      throw new Error("quiz_session_invalid");
    }

    const session = await tx.quizSession.findUnique({
      where: { sessionId: cookieSessionId },
    });
    if (!session || session.isCompleted || session.sessionId !== input.sessionId) {
      throw new Error("quiz_session_invalid");
    }

    const wordIds = parseWordIds(session.wordIdsJson);
    if (
      session.currentIndex >= wordIds.length ||
      wordIds[session.currentIndex] !== input.wordId
    ) {
      throw new Error("quiz_question_invalid");
    }

    const word = await tx.word.findUnique({
      where: { id: input.wordId },
    });
    if (!word) {
      throw new Error("word_not_found");
    }

    const config = parseQuizConfig(session.quizConfigJson);
    const direction = resolveDirection(session, config);
    const correctAnswer = direction === "to_spanish" ? word.translation : word.englishWord;
    const isCorrect = normalizeText(input.answer) === normalizeText(correctAnswer);

    await tx.word.update({
      where: { id: word.id },
      data: {
        timesPracticed: { increment: 1 },
        ...(isCorrect ? { timesCorrect: { increment: 1 } } : {}),
        lastPracticed: new Date(),
      },
    });

    await advanceSessionTx(tx, session.id, session.currentIndex, wordIds.length, isCorrect, true);

    return { isCorrect, correctAnswer, sessionId: session.id };
  });

  const updated = await prisma.quizSession.findUnique({
    where: { id: outcome.sessionId },
  });
  const finished = !updated || updated.isCompleted;
  if (finished) {
    const summary = await finalizeQuizSummary(outcome.sessionId);
    return {
      finished: true,
      message: summary,
    };
  }

  return {
    finished: false,
    message: outcome.isCorrect
      ? "¡Correcto! Excelente trabajo."
      : `Incorrecto. La respuesta correcta era: "${outcome.correctAnswer}"`,
  };
}

// Design decision (Bug 21): skip counts as a failed attempt and degrades accuracy.
// Documented in Guides/backend.md. Do not change without updating the guide.
export async function skipQuizAnswer(input: { wordId: number; sessionId: string }) {
  const cookieStore = await cookies();
  const cookieSessionId = cookieStore.get(QUIZ_COOKIE_NAME)?.value;

  const outcome = await prisma.$transaction(async (tx) => {
    if (!cookieSessionId) {
      throw new Error("quiz_session_invalid");
    }

    const session = await tx.quizSession.findUnique({
      where: { sessionId: cookieSessionId },
    });
    if (!session || session.isCompleted || session.sessionId !== input.sessionId) {
      throw new Error("quiz_session_invalid");
    }

    const wordIds = parseWordIds(session.wordIdsJson);
    if (
      session.currentIndex >= wordIds.length ||
      wordIds[session.currentIndex] !== input.wordId
    ) {
      throw new Error("quiz_question_invalid");
    }

    const word = await tx.word.findUnique({
      where: { id: input.wordId },
      select: { id: true },
    });

    if (word) {
      await tx.word.update({
        where: { id: word.id },
        data: {
          timesPracticed: { increment: 1 },
          lastPracticed: new Date(),
        },
      });
    }

    await advanceSessionTx(tx, session.id, session.currentIndex, wordIds.length, false, true);

    return { sessionId: session.id };
  });

  const updated = await prisma.quizSession.findUnique({
    where: { id: outcome.sessionId },
  });
  const finished = !updated || updated.isCompleted;
  if (finished) {
    const summary = await finalizeQuizSummary(outcome.sessionId);
    return {
      finished: true,
      message: summary,
    };
  }

  return {
    finished: false,
    message: "Pregunta saltada.",
  };
}

export async function endActiveQuiz() {
  const session = await getActiveQuizSession();
  if (!session) {
    await clearQuizCookie();
    return null;
  }

  if (!session.isCompleted) {
    await prisma.quizSession.update({
      where: { id: session.id },
      data: { isCompleted: true },
    });
  }

  await clearQuizCookie();
  return "Quiz terminado.";
}

export async function advanceSessionTx(
  tx: Prisma.TransactionClient,
  sessionId: number,
  currentIndex: number,
  totalPool: number,
  isCorrect: boolean,
  countAttempt: boolean,
) {
  const nextIndex = currentIndex + 1;
  // Compare-and-swap on currentIndex. If another concurrent submit/skip
  // already advanced the session between the validation read and this write,
  // the WHERE clause does not match and count === 0 — the caller treats that
  // as quiz_question_invalid.
  const result = await tx.quizSession.updateMany({
    where: { id: sessionId, currentIndex },
    data: {
      currentIndex: { increment: 1 },
      totalQuestions: countAttempt ? { increment: 1 } : undefined,
      correctAnswers: countAttempt && isCorrect ? { increment: 1 } : undefined,
      isCompleted: nextIndex >= totalPool,
    },
  });
  if (result.count === 0) {
    throw new Error("quiz_question_invalid");
  }
}

async function finalizeQuizSession(sessionId: number) {
  await prisma.quizSession.update({
    where: { id: sessionId },
    data: { isCompleted: true },
  });
  await clearQuizCookie();
}

async function finalizeQuizSummary(sessionId: number) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    await clearQuizCookie();
    return "Quiz completado.";
  }

  await clearQuizCookie();
  const accuracy = getAccuracy(session.totalQuestions, session.correctAnswers);
  return `¡Quiz completado! Respondiste ${session.correctAnswers}/${session.totalQuestions} correctamente (${accuracy.toFixed(1)}%)`;
}

function parseWordIds(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is number => typeof value === "number");
  } catch {
    return [];
  }
}

function parseQuizConfig(raw: string | null): QuizConfig {
  const fallback: QuizConfig = {
    quizType: "to_spanish",
    languageId: 0,
    tagId: 0,
    onlyDifficult: "all",
    poolSize: 0,
  };

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<QuizConfig>;
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

async function clearQuizCookie() {
  const cookieStore = await cookies();
  cookieStore.set(QUIZ_COOKIE_NAME, "", {
    ...QUIZ_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
