-- CreateTable
CREATE TABLE "word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "english_word" TEXT NOT NULL,
    "normalized_english_word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "explanation" TEXT,
    "language_id" INTEGER NOT NULL,
    "feature_id" INTEGER NOT NULL,
    "times_practiced" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "word_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "feature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "feature" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quiz_session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "session_id" TEXT NOT NULL,
    "word_ids" TEXT NOT NULL,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "quiz_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_words_language_normalized" ON "word"("language_id", "normalized_english_word");

-- CreateIndex
CREATE UNIQUE INDEX "language_language_key" ON "language"("language");

-- CreateIndex
CREATE UNIQUE INDEX "feature_feature_key" ON "feature"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_session_session_id_key" ON "quiz_session"("session_id");
