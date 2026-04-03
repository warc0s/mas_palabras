"use server";

import { revalidatePath } from "next/cache";

import { redirectWithFlash } from "@/lib/flash";
import {
  createOrReactivateFeature,
  createOrReactivateLanguage,
  deleteFeature,
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

export async function createFeatureAction(formData: FormData) {
  const parsed = settingsItemSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirectWithFlash("/settings", "error", "Introduce una característica válida.");
  }

  const message = await createOrReactivateFeature(parsed.data.name);
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

export async function deleteFeatureAction(featureId: number) {
  try {
    const message = await deleteFeature(featureId);
    revalidatePath("/settings");
    redirectWithFlash(
      "/settings",
      message.includes("desactivada") ? "info" : "success",
      message,
    );
  } catch {
    redirectWithFlash("/settings", "error", "No se pudo eliminar la característica.");
  }
}
