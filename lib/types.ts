export type FlashType = "success" | "error" | "warning" | "info";

export type SearchParams = Record<string, string | string[] | undefined>;

export type SortBy =
  | "english_word"
  | "translation"
  | "created_at_desc"
  | "created_at_asc"
  | "accuracy_desc"
  | "accuracy_asc"
  | "needs_practice";

export type QuizType = "to_spanish" | "to_original" | "mixed";
export type DifficultyFilter = "all" | "needs_practice" | "new";

export type WordWithRelations = {
  id: number;
  englishWord: string;
  normalizedEnglishWord: string;
  translation: string;
  explanation: string | null;
  languageId: number;
  tagId: number;
  timesPracticed: number;
  timesCorrect: number;
  lastPracticed: Date | null;
  createdAt: Date;
  language: {
    id: number;
    language: string;
    active: boolean;
  };
  tag: {
    id: number;
    tag: string;
    active: boolean;
  };
};

export type ImportIssue = {
  line: number;
  code: string;
  action: "error" | "skipped";
};

export type ImportResult = {
  success: number;
  skipped: number;
  errors: number;
  createdLanguages: string[];
  createdTags: string[];
  issues: ImportIssue[];
};
