PRAGMA foreign_keys=OFF;

CREATE TABLE "tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

INSERT INTO "tag" ("id", "tag", "active", "created_at", "updated_at")
SELECT "id", "feature", "active", "created_at", "updated_at"
FROM "feature";

CREATE TABLE "new_word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "english_word" TEXT NOT NULL,
    "normalized_english_word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "explanation" TEXT,
    "language_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "times_practiced" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "word_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_word" (
    "id",
    "english_word",
    "normalized_english_word",
    "translation",
    "explanation",
    "language_id",
    "tag_id",
    "times_practiced",
    "times_correct",
    "last_practiced",
    "created_at"
)
SELECT
    "id",
    "english_word",
    "normalized_english_word",
    "translation",
    "explanation",
    "language_id",
    "feature_id",
    "times_practiced",
    "times_correct",
    "last_practiced",
    "created_at"
FROM "word";

DROP TABLE "word";
DROP TABLE "feature";
ALTER TABLE "new_word" RENAME TO "word";

CREATE UNIQUE INDEX "tag_tag_key" ON "tag"("tag");
CREATE UNIQUE INDEX "uq_words_language_normalized" ON "word"("language_id", "normalized_english_word");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
