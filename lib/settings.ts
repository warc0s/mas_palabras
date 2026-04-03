import { prisma } from "@/lib/prisma";

export async function getActiveLanguages() {
  return prisma.language.findMany({
    where: { active: true },
    orderBy: { language: "asc" },
  });
}

export async function getActiveFeatures() {
  return prisma.feature.findMany({
    where: { active: true },
    orderBy: { feature: "asc" },
  });
}

export async function createOrReactivateLanguage(name: string): Promise<string> {
  const existing = await prisma.language.findUnique({
    where: { language: name },
  });

  if (existing) {
    if (!existing.active) {
      await prisma.language.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return `Idioma "${name}" reactivado exitosamente.`;
    }
    return `El idioma "${name}" ya existe.`;
  }

  await prisma.language.create({
    data: { language: name, active: true },
  });
  return `Idioma "${name}" agregado exitosamente.`;
}

export async function createOrReactivateFeature(name: string): Promise<string> {
  const existing = await prisma.feature.findUnique({
    where: { feature: name },
  });

  if (existing) {
    if (!existing.active) {
      await prisma.feature.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return `Característica "${name}" reactivada exitosamente.`;
    }
    return `La característica "${name}" ya existe.`;
  }

  await prisma.feature.create({
    data: { feature: name, active: true },
  });
  return `Característica "${name}" agregada exitosamente.`;
}

export async function deleteLanguage(languageId: number): Promise<string> {
  const language = await prisma.language.findUnique({
    where: { id: languageId },
  });

  if (!language) {
    throw new Error("language_not_found");
  }

  const wordCount = await prisma.word.count({
    where: { languageId },
  });

  if (wordCount > 0) {
    await prisma.language.update({
      where: { id: languageId },
      data: { active: false },
    });
    return `Idioma "${language.language}" desactivado. Las ${wordCount} palabras asociadas se mantienen.`;
  }

  await prisma.language.delete({
    where: { id: languageId },
  });
  return `Idioma "${language.language}" eliminado completamente.`;
}

export async function deleteFeature(featureId: number): Promise<string> {
  const feature = await prisma.feature.findUnique({
    where: { id: featureId },
  });

  if (!feature) {
    throw new Error("feature_not_found");
  }

  const wordCount = await prisma.word.count({
    where: { featureId },
  });

  if (wordCount > 0) {
    await prisma.feature.update({
      where: { id: featureId },
      data: { active: false },
    });
    return `Característica "${feature.feature}" desactivada. Las ${wordCount} palabras asociadas se mantienen.`;
  }

  await prisma.feature.delete({
    where: { id: featureId },
  });
  return `Característica "${feature.feature}" eliminada completamente.`;
}
