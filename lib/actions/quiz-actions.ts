"use server";

import { revalidatePath } from "next/cache";

import { redirectWithFlash } from "@/lib/flash";
import {
  endActiveQuiz,
  getActiveQuizSession,
  skipQuizAnswer,
  startQuizSession,
  submitQuizAnswer,
} from "@/lib/quiz";
import { quizAnswerSchema, quizConfigSchema, quizSkipSchema } from "@/lib/validators";

function isErrorCode(error: unknown, code: string): boolean {
  return error instanceof Error && error.message === code;
}

export async function startQuizAction(formData: FormData) {
  const parsed = quizConfigSchema.safeParse({
    languageId: formData.get("languageId"),
    tagId: formData.get("tagId"),
    quizType: formData.get("quizType"),
    onlyDifficult: formData.get("onlyDifficult"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz", "error", "Review the quiz configuration.");
  }

  const result = await startQuizSession(parsed.data);
  if (!result) {
    redirectWithFlash("/quiz", "warning", "No words are available with the selected filters.");
  }

  redirectWithFlash(
    "/quiz_question",
    "info",
    `Quiz started with ${result.poolSize} available words.`,
  );
}

export async function submitQuizAnswerAction(formData: FormData) {
  const parsed = quizAnswerSchema.safeParse({
    answer: formData.get("answer"),
    wordId: formData.get("wordId"),
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz_question", "error", "You must write an answer.");
  }

  let result: Awaited<ReturnType<typeof submitQuizAnswer>>;
  try {
    result = await submitQuizAnswer(parsed.data);
  } catch (error) {
    await redirectToQuizOnError(error);
    return;
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash(result.finished ? "/quiz" : "/quiz_question", result.finished ? "success" : result.message.startsWith("Correct") ? "success" : "error", result.message);
}

export async function skipQuizAnswerAction(formData: FormData) {
  const parsed = quizSkipSchema.safeParse({
    wordId: formData.get("wordId"),
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz_question", "error", "The question could not be skipped.");
  }

  let result: Awaited<ReturnType<typeof skipQuizAnswer>>;
  try {
    result = await skipQuizAnswer(parsed.data);
  } catch (error) {
    await redirectToQuizOnError(error);
    return;
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash(result.finished ? "/quiz" : "/quiz_question", result.finished ? "success" : "info", result.message);
}

async function redirectToQuizOnError(error: unknown): Promise<void> {
  if (isErrorCode(error, "quiz_question_invalid")) {
    const active = await getActiveQuizSession();
    if (active && !active.isCompleted) {
      redirectWithFlash("/quiz_question", "info", "That question was already answered.");
    }
    redirectWithFlash("/quiz", "warning", "The quiz session has already ended.");
  }

  if (isErrorCode(error, "quiz_session_invalid")) {
    redirectWithFlash("/quiz", "warning", "Quiz session expired. Start a new quiz.");
  }

  console.error("quiz action failed", { error });
  redirectWithFlash("/quiz", "error", "The answer could not be processed. Try again.");
}

export async function endQuizAction() {
  const message = await endActiveQuiz();
  redirectWithFlash("/quiz", "info", message ?? "There was no active quiz session.");
}
