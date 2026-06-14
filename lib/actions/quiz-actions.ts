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
    redirectWithFlash("/quiz", "error", "Revisa la configuración del quiz.");
  }

  const result = await startQuizSession(parsed.data);
  if (!result) {
    redirectWithFlash("/quiz", "warning", "No hay palabras disponibles con los filtros seleccionados.");
  }

  redirectWithFlash(
    "/quiz_question",
    "info",
    `Quiz iniciado con ${result.poolSize} palabras disponibles.`,
  );
}

export async function submitQuizAnswerAction(formData: FormData) {
  const parsed = quizAnswerSchema.safeParse({
    answer: formData.get("answer"),
    wordId: formData.get("wordId"),
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz_question", "error", "Debes escribir una respuesta.");
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
  redirectWithFlash(result.finished ? "/quiz" : "/quiz_question", result.finished ? "success" : result.message.startsWith("¡Correcto") ? "success" : "error", result.message);
}

export async function skipQuizAnswerAction(formData: FormData) {
  const parsed = quizSkipSchema.safeParse({
    wordId: formData.get("wordId"),
    sessionId: formData.get("sessionId"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz_question", "error", "No se pudo saltar la pregunta.");
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
      redirectWithFlash("/quiz_question", "info", "Esa pregunta ya fue respondida.");
    }
    redirectWithFlash("/quiz", "warning", "La sesión del quiz ya terminó.");
  }

  if (isErrorCode(error, "quiz_session_invalid")) {
    redirectWithFlash("/quiz", "warning", "Sesión de quiz expirada. Inicia un nuevo quiz.");
  }

  console.error("quiz action failed", { error });
  redirectWithFlash("/quiz", "error", "No se pudo procesar la respuesta. Inténtalo de nuevo.");
}

export async function endQuizAction() {
  const message = await endActiveQuiz();
  redirectWithFlash("/quiz", "info", message ?? "No había sesión de quiz activa.");
}
