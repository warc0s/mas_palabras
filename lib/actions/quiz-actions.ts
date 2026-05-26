"use server";

import { redirectWithFlash } from "@/lib/flash";
import { endActiveQuiz, skipQuizAnswer, startQuizSession, submitQuizAnswer } from "@/lib/quiz";
import { quizAnswerSchema, quizConfigSchema } from "@/lib/validators";

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
    quizType: formData.get("quizType"),
  });

  if (!parsed.success) {
    redirectWithFlash("/quiz_question", "error", "Debes escribir una respuesta.");
  }

  try {
    const result = await submitQuizAnswer(parsed.data);
    redirectWithFlash(result.finished ? "/quiz" : "/quiz_question", result.finished ? "success" : result.message.startsWith("¡Correcto") ? "success" : "error", result.message);
  } catch {
    redirectWithFlash("/quiz", "warning", "Sesión de quiz expirada. Inicia un nuevo quiz.");
  }
}

export async function skipQuizAnswerAction() {
  try {
    const result = await skipQuizAnswer();
    redirectWithFlash(result.finished ? "/quiz" : "/quiz_question", result.finished ? "success" : "info", result.message);
  } catch {
    redirectWithFlash("/quiz", "warning", "No hay sesión de quiz activa.");
  }
}

export async function endQuizAction() {
  const message = await endActiveQuiz();
  redirectWithFlash("/quiz", "info", message ?? "No había sesión de quiz activa.");
}
