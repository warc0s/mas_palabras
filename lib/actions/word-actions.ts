"use server";

import { revalidatePath } from "next/cache";

import { redirectWithFlash } from "@/lib/flash";
import { processImport } from "@/lib/import-export";
import { createWord, updateWord, deleteWord, bulkDeleteWords } from "@/lib/words";
import { wordSchema } from "@/lib/validators";

export async function createWordAction(formData: FormData) {
  const parsed = wordSchema.safeParse({
    englishWord: formData.get("englishWord"),
    translation: formData.get("translation"),
    explanation: formData.get("explanation"),
    languageId: formData.get("languageId"),
    tagId: formData.get("tagId"),
  });

  if (!parsed.success) {
    redirectWithFlash("/maspalabras", "error", "Revisa los campos del formulario.");
  }

  try {
    await createWord(parsed.data);
  } catch (error) {
    redirectWithFlash("/maspalabras", "error", mapWordError(error));
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  revalidatePath("/maspalabras");
  redirectWithFlash("/verpalabras", "success", "Palabra agregada exitosamente.");
}

export async function updateWordAction(formData: FormData) {
  const wordId = Number(formData.get("wordId"));
  const parsed = wordSchema.safeParse({
    englishWord: formData.get("englishWord"),
    translation: formData.get("translation"),
    explanation: formData.get("explanation"),
    languageId: formData.get("languageId"),
    tagId: formData.get("tagId"),
  });

  if (!Number.isInteger(wordId) || !parsed.success) {
    redirectWithFlash("/verpalabras", "error", "No se pudo actualizar la palabra.");
  }

  try {
    await updateWord(wordId, parsed.data);
  } catch (error) {
    redirectWithFlash(`/edit/${wordId}`, "error", mapWordError(error));
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  revalidatePath(`/edit/${wordId}`);
  redirectWithFlash("/verpalabras", "success", "Palabra actualizada exitosamente.");
}

export async function deleteWordAction(wordId: number) {
  try {
    await deleteWord(wordId);
  } catch {
    redirectWithFlash("/verpalabras", "error", "No se pudo eliminar la palabra.");
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash("/verpalabras", "success", "Palabra eliminada exitosamente.");
}

export async function bulkDeleteWordsAction(wordIds: number[]) {
  if (!wordIds.length) {
    redirectWithFlash("/verpalabras", "warning", "No se seleccionaron palabras.");
  }

  const deleted = await bulkDeleteWords(wordIds);
  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash(
    "/verpalabras",
    "success",
    `${deleted} palabra${deleted === 1 ? "" : "s"} eliminada${deleted === 1 ? "" : "s"}.`,
  );
}

export async function importWordsAction(formData: FormData) {
  const file = formData.get("file");
  const overwriteDuplicates = formData.get("overwriteDuplicates");
  const createMissing = formData.get("createMissing");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithFlash("/import_words", "error", "Selecciona un archivo JSON.");
  }

  if (file.size > 10 * 1024 * 1024) {
    redirectWithFlash("/import_words", "error", "El archivo es demasiado grande.");
  }

  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    redirectWithFlash("/import_words", "error", "El archivo no contiene JSON válido.");
  }

  try {
    const result = await processImport(
      data,
      overwriteDuplicates === "update" ? "update" : "skip",
      createMissing === "skip" ? "skip" : "create",
    );

    revalidatePath("/");
    revalidatePath("/verpalabras");
    revalidatePath("/settings");
    redirectWithFlash(
      "/verpalabras",
      "success",
      `Importación completada: ${result.success} ok, ${result.skipped} omitidas, ${result.errors} con error.`,
    );
  } catch {
    redirectWithFlash("/import_words", "error", "No se pudo procesar el archivo.");
  }
}

function mapWordError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Ocurrió un error inesperado.";
  }

  switch (error.message) {
    case "duplicate_word":
      return "La palabra ya existe en este idioma.";
    case "language_not_found":
      return "El idioma seleccionado no existe o está inactivo.";
    case "tag_not_found":
      return "La etiqueta seleccionada no existe o está inactiva.";
    case "word_not_found":
      return "La palabra no existe.";
    default:
      return "Ocurrió un error inesperado.";
  }
}
