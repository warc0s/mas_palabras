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
    redirectWithFlash("/settings", "error", "Introduce un idioma válido.");
  }

  const message = await createOrReactivateLanguage(parsed.data.name);
  revalidatePath("/settings");
  revalidatePath("/maspalabras");
  revalidatePath("/edit/[id]");
  redirectWithFlash("/settings", message.includes("ya existe") ? "warning" : "success", message);
}

export async function createTagAction(formData: FormData) {
  const parsed = settingsItemSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirectWithFlash("/settings", "error", "Introduce una etiqueta válida.");
  }

  const message = await createOrReactivateTag(parsed.data.name);
  revalidatePath("/settings");
  revalidatePath("/maspalabras");
  revalidatePath("/edit/[id]");
  redirectWithFlash("/settings", message.includes("ya existe") ? "warning" : "success", message);
}

export async function deleteLanguageAction(languageId: number) {
  try {
    const message = await deleteLanguage(languageId);
    revalidatePath("/settings");
    redirectWithFlash("/settings", message.includes("desactivado") ? "info" : "success", message);
  } catch {
    redirectWithFlash("/settings", "error", "No se pudo eliminar el idioma.");
  }
}

export async function deleteTagAction(tagId: number) {
  try {
    const message = await deleteTag(tagId);
    revalidatePath("/settings");
    redirectWithFlash(
      "/settings",
      message.includes("desactivada") ? "info" : "success",
      message,
    );
  } catch {
    redirectWithFlash("/settings", "error", "No se pudo eliminar la etiqueta.");
  }
}
