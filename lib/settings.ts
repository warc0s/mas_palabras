import { prisma } from "@/lib/prisma";

export async function getActiveLanguages() {
  return prisma.language.findMany({
    where: { active: true },
    orderBy: { language: "asc" },
  });
}

export async function getActiveTags() {
  return prisma.tag.findMany({
    where: { active: true },
    orderBy: { tag: "asc" },
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

export async function createOrReactivateTag(name: string): Promise<string> {
  const existing = await prisma.tag.findUnique({
    where: { tag: name },
  });

  if (existing) {
    if (!existing.active) {
      await prisma.tag.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return `Etiqueta "${name}" reactivada exitosamente.`;
    }
    return `La etiqueta "${name}" ya existe.`;
  }

  await prisma.tag.create({
    data: { tag: name, active: true },
  });
  return `Etiqueta "${name}" agregada exitosamente.`;
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

export async function deleteTag(tagId: number): Promise<string> {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error("tag_not_found");
  }

  const wordCount = await prisma.word.count({
    where: { tagId },
  });

  if (wordCount > 0) {
    await prisma.tag.update({
      where: { id: tagId },
      data: { active: false },
    });
    return `Etiqueta "${tag.tag}" desactivada. Las ${wordCount} palabras asociadas se mantienen.`;
  }

  await prisma.tag.delete({
    where: { id: tagId },
  });
  return `Etiqueta "${tag.tag}" eliminada completamente.`;
}
