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
      return `Language "${name}" reactivated successfully.`;
    }
    return `Language "${name}" already exists.`;
  }

  await prisma.language.create({
    data: { language: name, active: true },
  });
  return `Language "${name}" added successfully.`;
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
      return `Tag "${name}" reactivated successfully.`;
    }
    return `Tag "${name}" already exists.`;
  }

  await prisma.tag.create({
    data: { tag: name, active: true },
  });
  return `Tag "${name}" added successfully.`;
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
    return `Language "${language.language}" deactivated. The ${wordCount} associated words are kept.`;
  }

  await prisma.language.delete({
    where: { id: languageId },
  });
  return `Language "${language.language}" deleted completely.`;
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
    return `Tag "${tag.tag}" deactivated. The ${wordCount} associated words are kept.`;
  }

  await prisma.tag.delete({
    where: { id: tagId },
  });
  return `Tag "${tag.tag}" deleted completely.`;
}
