# Backend

## Philosophy

The server lives inside Next.js and is split between:

- server-side pages for reads
- server actions for mutations
- minimal route handlers for I/O cases such as export or explicit quiz ending

## Actions by Domain

### `lib/actions/word-actions.ts`

- `createWordAction` - creates a word and redirects to `/verpalabras`
- `updateWordAction` - updates an existing word
- `deleteWordAction` - deletes one word
- `bulkDeleteWordsAction` - deletes several words and validates IDs with Zod
- `importWordsAction` - processes a JSON upload and redirects with a summary

### `lib/actions/settings-actions.ts`

- `createLanguageAction`
- `createTagAction`
- `deleteLanguageAction`
- `deleteTagAction`

### `lib/actions/quiz-actions.ts`

- `startQuizAction` - creates a session and the `mas-palabras-quiz` cookie
- `submitQuizAnswerAction` - validates an answer, updates progress, and advances
- `skipQuizAnswerAction` - counts a failed attempt and advances
- `endQuizAction` - ends the active session

`submitQuizAnswerAction` and `skipQuizAnswerAction` call `revalidatePath("/")` and `revalidatePath("/verpalabras")` before success redirects.

The quiz-action error path distinguishes:

- `quiz_question_invalid` - stale question, usually from double submit or navigation
- `quiz_session_invalid` - missing cookie, completed session, or mismatched `sessionId`
- any other error - logged server-side and redirected as a generic error

## Domain Services

### `lib/words.ts`

- `getDashboardStats()`
- `listWords(filters)`
- `getWordById(id)`
- `createWord(input)`
- `updateWord(id, input)`
- `deleteWord(id)`
- `bulkDeleteWords(ids)`
- `exportWords()`

`createWord` and `updateWord` catch Prisma `P2002` and rethrow `duplicate_word`.

### Search and Normalization

`listWords` filters language and tag through Prisma, but applies free-text search in memory after normalizing the input and the `englishWord`, `translation`, and `explanation` fields.

Reason: SQLite `LIKE` is only case-insensitive for ASCII and does not support Unicode normalization. This is acceptable for the current personal-app scale. It will not scale to very large datasets.

### Accuracy Sorting

`accuracy_asc` puts unpracticed words first. `accuracy_desc` puts them last. The comparator uses `getAccuracy`, which returns 0 when `timesPracticed === 0`.

### `lib/settings.ts`

- lists active languages and tags
- creates or reactivates languages and tags
- soft-deletes or hard-deletes depending on usage

### `lib/quiz.ts`

- `startQuizSession`
- `getActiveQuizSession`
- `getQuizQuestionData`
- `submitQuizAnswer`
- `skipQuizAnswer`
- `endActiveQuiz`

The active session is identified with an `httpOnly` cookie and also persisted in `quiz_session`.

The server derives the question direction from `quizConfigJson`, never from the form. For `mixed`, `deriveMixedDirection(sessionId, currentIndex)` returns a deterministic direction per question.

Submit and skip are atomic. The full operation happens inside a Prisma transaction. Session advancement uses `updateMany` with `where: { id, currentIndex }` as compare-and-swap. If another request already advanced the session, the transaction throws `quiz_question_invalid` before double-counting stats.

Skip intentionally counts as a failed attempt. Do not change this without updating this guide.

### `lib/import-export.ts`

- `processImport(data, overwriteMode, createMissingMode)`
- sanitizes records
- parses flexible date formats
- creates missing relations when requested
- detects normalized duplicates by language
- processes every item in its own transaction so one failed item does not roll back the whole import

## Redirect Feedback

Operation feedback travels through query string parameters.

Pattern:

1. the action mutates state
2. it invalidates cache with `revalidatePath` when needed
3. it redirects with `status` and `message`
4. the page renders `FlashBanner`

## Redirects and `try/catch`

`redirectWithFlash` calls Next's `redirect()`, which throws a special `NEXT_REDIRECT` exception. A success redirect must stay outside the `try/catch`, otherwise the catch branch will treat success as failure.

Correct pattern:

```ts
let result: ResultType;
try {
  result = await service(...);
} catch {
  redirectWithFlash("/path", "error", "Error message.");
}

revalidatePath("/path");
redirectWithFlash("/path", "success", `OK: ${result.value}.`);
```

## Route Handlers

- `app/export_words/route.ts` - downloads JSON
- `app/end_quiz/route.ts` - ends the active quiz session and redirects
