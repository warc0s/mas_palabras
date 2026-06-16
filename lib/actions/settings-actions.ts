"use server";

import { revalidatePath } from "next/cache";

import { redirectWithFlash } from "@/lib/flash";
import {
  createOrReactivateTag,
  createOrReactivateLanguage,
  deleteTag,
  deleteLanguage,
} from "@/lib/settings";
import { settingsItemSchema } from "@/lib/validators";

export async function createLanguageAction(formData: FormData) {
  const parsed = settingsItemSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirectWithFlash("/settings", "error", "Enter a valid language.");
  }

  const message = await createOrReactivateLanguage(parsed.data.name);
  revalidatePath("/settings");
  revalidatePath("/maspalabras");
  revalidatePath("/edit/[id]");
  redirectWithFlash("/settings", message.includes("already exists") ? "warning" : "success", message);
}

export async function createTagAction(formData: FormData) {
  const parsed = settingsItemSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirectWithFlash("/settings", "error", "Enter a valid tag.");
  }

  const message = await createOrReactivateTag(parsed.data.name);
  revalidatePath("/settings");
  revalidatePath("/maspalabras");
  revalidatePath("/edit/[id]");
  redirectWithFlash("/settings", message.includes("already exists") ? "warning" : "success", message);
}

export async function deleteLanguageAction(languageId: number) {
  let message: string;
  try {
    message = await deleteLanguage(languageId);
  } catch {
    redirectWithFlash("/settings", "error", "The language could not be deleted.");
  }

  revalidatePath("/settings");
  redirectWithFlash("/settings", message.includes("deactivated") ? "info" : "success", message);
}

export async function deleteTagAction(tagId: number) {
  let message: string;
  try {
    message = await deleteTag(tagId);
  } catch {
    redirectWithFlash("/settings", "error", "The tag could not be deleted.");
  }

  revalidatePath("/settings");
  redirectWithFlash(
    "/settings",
    message.includes("deactivated") ? "info" : "success",
    message,
  );
}
