# Backend

## Filosofía

El servidor vive dentro de Next.js y se reparte entre:

- páginas server-side para lectura
- server actions para mutación
- route handlers mínimos para casos de I/O como export o fin explícito del quiz

## Acciones por dominio

### `lib/actions/word-actions.ts`

- `createWordAction` — crea palabra y redirige a `/verpalabras`
- `updateWordAction` — actualiza palabra existente
- `deleteWordAction` — elimina una palabra
- `bulkDeleteWordsAction` — borra varias palabras
- `importWordsAction` — procesa upload JSON y redirige con resumen

### `lib/actions/settings-actions.ts`

- `createLanguageAction`
- `createTagAction`
- `deleteLanguageAction`
- `deleteTagAction`

### `lib/actions/quiz-actions.ts`

- `startQuizAction` — crea sesión y cookie `mas-palabras-quiz`
- `submitQuizAnswerAction` — valida respuesta, actualiza progreso y avanza
- `skipQuizAnswerAction` — cuenta intento fallido y avanza
- `endQuizAction` — termina la sesión activa

## Servicios de dominio

### `lib/words.ts`

- `getDashboardStats()`
- `listWords(filters)`
- `getWordById(id)`
- `createWord(input)`
- `updateWord(id, input)`
- `deleteWord(id)`
- `bulkDeleteWords(ids)`
- `exportWords()`

### `lib/settings.ts`

- listas activas de idiomas y etiquetas
- alta o reactivación
- soft-delete o hard-delete según uso

### `lib/quiz.ts`

- `startQuizSession`
- `getActiveQuizSession`
- `getQuizQuestionData`
- `submitQuizAnswer`
- `skipQuizAnswer`
- `endActiveQuiz`

La sesión activa se identifica con una cookie `httpOnly` y persiste además en la tabla `quiz_session`.

### `lib/import-export.ts`

- `processImport(data, overwriteMode, createMissingMode)`
- sanitiza registros
- parsea fechas flexibles
- crea relaciones faltantes si se ha pedido
- detecta duplicados normalizados por idioma

## Redirects con feedback

El feedback de operaciones viaja en query string. El patrón actual es:

1. la action hace la mutación
2. invalida caché con `revalidatePath` cuando afecta a listados, dashboard o settings
3. redirige con `status` y `message`
4. la página muestra `FlashBanner`

## Route handlers

- `app/export_words/route.ts` — descarga JSON
- `app/end_quiz/route.ts` — termina sesión y redirige
