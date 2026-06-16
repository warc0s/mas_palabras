"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithFlash } from "@/lib/flash";
import { processImport } from "@/lib/import-export";
import type { ImportResult } from "@/lib/types";
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
    redirectWithFlash("/maspalabras", "error", "Review the form fields.");
  }

  try {
    await createWord(parsed.data);
  } catch (error) {
    redirectWithFlash("/maspalabras", "error", mapWordError(error));
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  revalidatePath("/maspalabras");
  redirectWithFlash("/verpalabras", "success", "Word added successfully.");
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
    redirectWithFlash("/verpalabras", "error", "The word could not be updated.");
  }

  try {
    await updateWord(wordId, parsed.data);
  } catch (error) {
    redirectWithFlash(`/edit/${wordId}`, "error", mapWordError(error));
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  revalidatePath(`/edit/${wordId}`);
  redirectWithFlash("/verpalabras", "success", "Word updated successfully.");
}

export async function deleteWordAction(wordId: number) {
  try {
    await deleteWord(wordId);
  } catch {
    redirectWithFlash("/verpalabras", "error", "The word could not be deleted.");
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash("/verpalabras", "success", "Word deleted successfully.");
}

const bulkDeleteSchema = z.array(z.number().int().positive());

export async function bulkDeleteWordsAction(wordIds: number[]) {
  const parsed = bulkDeleteSchema.safeParse(wordIds);
  if (!parsed.success) {
    redirectWithFlash("/verpalabras", "error", "The word selection is not valid.");
  }

  const validIds = parsed.data;
  if (validIds.length === 0) {
    redirectWithFlash("/verpalabras", "warning", "No words were selected.");
  }

  const deleted = await bulkDeleteWords(validIds);
  revalidatePath("/");
  revalidatePath("/verpalabras");
  redirectWithFlash(
    "/verpalabras",
    "success",
    `${deleted} ${deleted === 1 ? "word" : "words"} deleted.`,
  );
}

export async function importWordsAction(formData: FormData) {
  const file = formData.get("file");
  const overwriteDuplicates = formData.get("overwriteDuplicates");
  const createMissing = formData.get("createMissing");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithFlash("/import_words", "error", "Select a JSON file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    redirectWithFlash("/import_words", "error", "The file is too large.");
  }

  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    redirectWithFlash("/import_words", "error", "The file does not contain valid JSON.");
  }

  let result: ImportResult;
  try {
    result = await processImport(
      data,
      overwriteDuplicates === "update" ? "update" : "skip",
      createMissing === "skip" ? "skip" : "create",
    );
  } catch {
    redirectWithFlash("/import_words", "error", "The file could not be processed.");
  }

  revalidatePath("/");
  revalidatePath("/verpalabras");
  revalidatePath("/settings");
  redirectWithFlash(
    "/verpalabras",
    "success",
    `Import completed: ${result.success} ok, ${result.skipped} skipped, ${result.errors} with errors.`,
  );
}

function mapWordError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred.";
  }

  switch (error.message) {
    case "duplicate_word":
      return "The word already exists in this language.";
    case "language_not_found":
      return "The selected language does not exist or is inactive.";
    case "tag_not_found":
      return "The selected tag does not exist or is inactive.";
    case "word_not_found":
      return "The word does not exist.";
    default:
      return "An unexpected error occurred.";
  }
}
