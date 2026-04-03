import { z } from "zod";

export const wordSchema = z.object({
  englishWord: z.string().trim().min(1).max(100),
  translation: z.string().trim().min(1).max(100),
  explanation: z.string().trim().max(300).optional().default(""),
  languageId: z.coerce.number().int().positive(),
  featureId: z.coerce.number().int().positive(),
});

export const settingsItemSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const quizConfigSchema = z.object({
  languageId: z.coerce.number().int().nonnegative().default(0),
  featureId: z.coerce.number().int().nonnegative().default(0),
  quizType: z.enum(["to_spanish", "to_original", "mixed"]),
  onlyDifficult: z.enum(["all", "needs_practice", "new"]),
});

export const quizAnswerSchema = z.object({
  answer: z.string().trim().min(1),
  wordId: z.coerce.number().int().positive(),
  sessionId: z.string().trim().min(1),
  quizType: z.enum(["to_spanish", "to_original", "mixed"]),
});
