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
- `bulkDeleteWordsAction` — borra varias palabras; valida con Zod `z.array(z.number().int().positive())`. IDs inválidos → redirect con error; array vacío → redirect con warning.
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

`submitQuizAnswerAction` y `skipQuizAnswerAction` llaman a `revalidatePath("/")` y `revalidatePath("/verpalabras")` antes del redirect de éxito para que las stats de dashboard y listado se refresquen.

El `catch` de ambas actions delega en `redirectToQuizOnError`, que distingue tres casos para no mostrar mensajes falsos al usuario:

- `quiz_question_invalid` — la sesión sigue activa pero `currentIndex` avanzó (race por doble click o navegación). Si `getActiveQuizSession()` confirma que la sesión sigue viva, redirige a `/quiz_question` con info "Esa pregunta ya fue respondida." Si no, va a `/quiz` como sesión terminada.
- `quiz_session_invalid` — la cookie no existe, la sesión fue completada o el `sessionId` del form no casa con la cookie. Redirige a `/quiz` con warning.
- Otro error — fallo real (BD, etc.). Se loguea con `console.error` y se redirige a `/quiz` con error genérico.

## Servicios de dominio

### `lib/words.ts`

- `getDashboardStats()` — solo cuenta palabras cuyo idioma y etiqueta están activos
- `listWords(filters)` — búsqueda normalizada en memoria (ver "Búsqueda y normalización")
- `getWordById(id)`
- `createWord(input)` — captura `P2002` de Prisma y lo relanza como `duplicate_word`
- `updateWord(id, input)` — captura `P2002` de Prisma y lo relanza como `duplicate_word`
- `deleteWord(id)`
- `bulkDeleteWords(ids)`
- `exportWords()`

### Búsqueda y normalización

`listWords` filtra idioma y etiqueta en la query Prisma, pero el término de búsqueda se aplica en memoria tras normalizar con `normalizeText` tanto el input como los campos `englishWord`, `translation` y `explanation`. Razón: SQLite `LIKE` solo es case-insensitive ASCII y no soporta normalización Unicode; la paginación ya es en memoria, así que esta opción es coherente con el tamaño del repo personal. No escala a miles de palabras.

### Ordenación por precisión

`accuracy_asc` pone primero las palabras no practicadas (precisión efectiva 0). `accuracy_desc` las pone al final. El comparator usa `getAccuracy`, que ya devuelve 0 cuando `timesPracticed === 0`, así que no hace falta un caso especial.

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

Dirección de la pregunta: el servidor deriva la dirección (`to_spanish` o `to_original`) desde `quizConfigJson` guardado en `QuizSession`, nunca desde el form. Para `mixed`, `deriveMixedDirection(sessionId, currentIndex)` produce un valor determinista por pregunta. El cliente recibe la dirección ya resuelta para mostrar el prompt, pero el input del form no la viaja: el servidor siempre la recalcula dentro de la transacción de submit.

Atomicidad de submit y skip: toda la operación (leer sesión, validar `wordId`/`currentIndex`, leer palabra, actualizar palabra, avanzar sesión) ocurre dentro de una única `prisma.$transaction`. El avance de `currentIndex`/`totalQuestions` usa `updateMany` con `where: { id, currentIndex }` (compare-and-swap). Si otra petición concurrente ya avanzó el `currentIndex` entre la lectura y el avance, el `updateMany` retorna `count === 0` y se lanza `quiz_question_invalid` dentro de la tx. Esto cierra la race del doble submit: la segunda petición aborta sin incrementar dos veces las stats de la palabra. `skipQuizAnswer` recibe y valida `wordId`/`sessionId` desde el form igual que `submitQuizAnswer`, así que una acción stale de saltar no actúa sobre una pregunta distinta a la que el usuario tenía delante.

Skip cuenta como intento fallido por decisión de diseño: degrada precisión y avanza `times_practiced`. No cambiar sin actualizar este documento.

### `lib/import-export.ts`

- `processImport(data, overwriteMode, createMissingMode)`
- sanitiza registros
- parsea fechas flexibles (rango de año `2000`-`2100`)
- crea relaciones faltantes si se ha pedido
- detecta duplicados normalizados por idioma
- procesa cada item en su propia `$transaction`: si un item falla, los demás se conservan

## Redirects con feedback

El feedback de operaciones viaja en query string. El patrón actual es:

1. la action hace la mutación
2. invalida caché con `revalidatePath` cuando afecta a listados, dashboard o settings
3. redirige con `status` y `message`
4. la página muestra `FlashBanner`

### Importante: redirects y try/catch

`redirectWithFlash` llama a `redirect()` de Next, que lanza una excepción especial (`NEXT_REDIRECT`). Si el redirect de éxito se hace dentro de un `try/catch`, el `catch` lo captura y se ejecuta la rama de error aunque la mutación haya ido bien.

Regla: el redirect de éxito SIEMPRE va fuera del try. Patrón correcto:

```
let result: TipoResultado;
try {
  result = await servicio(...);
} catch {
  redirectWithFlash("/ruta", "error", "mensaje de error.");
}

revalidatePath("/ruta");
redirectWithFlash("/ruta", "success", `OK: ${result.algo}.`);
```

Como `redirectWithFlash` retorna `never`, TypeScript sabe que tras el `catch` la variable `result` ya está asignada.

## Route handlers

- `app/export_words/route.ts` — descarga JSON
- `app/end_quiz/route.ts` — termina sesión y redirige
