import crypto from "node:crypto";

import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/text";
import { getAccuracy, needsPractice } from "@/lib/word-metrics";
import type { DifficultyFilter, QuizType } from "@/lib/types";

const QUIZ_COOKIE_NAME = "mas-palabras-quiz";

type QuizConfig = {
  quizType: QuizType;
  languageId: number;
  featureId: number;
  onlyDifficult: DifficultyFilter;
  poolSize: number;
};

export async function startQuizSession(input: {
  languageId: number;
  featureId: number;
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
      ...(input.languageId ? { languageId: input.languageId } : {}),
      ...(input.featureId ? { featureId: input.featureId } : {}),
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

  const shuffledIds = filtered.map((word) => word.id).sort(() => Math.random() - 0.5);
  const sessionId = crypto.randomUUID();
  const quizConfig: QuizConfig = {
    quizType: input.quizType,
    languageId: input.languageId,
    featureId: input.featureId,
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
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
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
      feature: true,
    },
  });

  if (!word) {
    await advanceQuizSession(prisma, false, wordIds.length, false);
    return getQuizQuestionData();
  }

  const config = parseQuizConfig(session.quizConfigJson);
  const quizType =
    config.quizType === "mixed"
      ? session.totalQuestions % 2 === 0
        ? "to_spanish"
        : "to_original"
      : config.quizType;

  return {
    session,
    word,
    wordIds,
    quizType,
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
  quizType: QuizType;
}) {
  const session = await getActiveQuizSession();
  if (!session || session.isCompleted || session.sessionId !== input.sessionId) {
    throw new Error("quiz_session_invalid");
  }

  const wordIds = parseWordIds(session.wordIdsJson);
  if (session.currentIndex >= wordIds.length || wordIds[session.currentIndex] !== input.wordId) {
    throw new Error("quiz_question_invalid");
  }

  const word = await prisma.word.findUnique({
    where: { id: input.wordId },
  });

  if (!word) {
    throw new Error("word_not_found");
  }

  const correctAnswer = input.quizType === "to_spanish" ? word.translation : word.englishWord;
  const isCorrect = normalizeText(input.answer) === normalizeText(correctAnswer);

  await prisma.$transaction(async (tx) => {
    await tx.word.update({
      where: { id: word.id },
      data: {
        timesPracticed: { increment: 1 },
        ...(isCorrect ? { timesCorrect: { increment: 1 } } : {}),
        lastPracticed: new Date(),
      },
    });

    await advanceQuizSession(tx, isCorrect, wordIds.length);
  });

  const updated = await getActiveQuizSession();
  const finished = !updated || updated.isCompleted;
  if (finished) {
    const summary = await finalizeQuizSummary(session.id);
    return {
      finished: true,
      message: summary,
    };
  }

  return {
    finished: false,
    message: isCorrect
      ? "¡Correcto! Excelente trabajo."
      : `Incorrecto. La respuesta correcta era: "${correctAnswer}"`,
  };
}

export async function skipQuizAnswer() {
  const session = await getActiveQuizSession();
  if (!session || session.isCompleted) {
    throw new Error("quiz_session_invalid");
  }

  const wordIds = parseWordIds(session.wordIdsJson);
  await advanceQuizSession(prisma, false, wordIds.length);

  const updated = await getActiveQuizSession();
  const finished = !updated || updated.isCompleted;
  if (finished) {
    const summary = await finalizeQuizSummary(session.id);
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

async function advanceQuizSession(
  client: Prisma.TransactionClient | typeof prisma,
  correct: boolean,
  totalPool: number,
  countAttempt = true,
) {
  const session = await getActiveQuizSession();
  if (!session) {
    return;
  }

  const nextIndex = session.currentIndex + 1;
  await client.quizSession.update({
    where: { id: session.id },
    data: {
      currentIndex: nextIndex,
      totalQuestions: countAttempt ? { increment: 1 } : undefined,
      correctAnswers: countAttempt && correct ? { increment: 1 } : undefined,
      isCompleted: nextIndex >= totalPool,
    },
  });
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
    featureId: 0,
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
  cookieStore.delete(QUIZ_COOKIE_NAME);
}
