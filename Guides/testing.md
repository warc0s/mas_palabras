# Testing

## Comandos

```bash
pnpm test
pnpm build
```

## Stack

- Vitest para unit tests
- TypeScript check integrado dentro de `next build`

## Suite actual

`tests/unit/text.test.ts`

- normalización de texto (acentos, mayúsculas, marks combinantes)
- eliminación de caracteres de formato `\p{Cf}` (ZWSP, ZWJ, BOM, LTR/RTL marks)
- idempotencia
- casos extremos (vacíos tras normalización)

`tests/unit/word-metrics.test.ts`

- accuracy
- `needsPractice`
- `practicePriority`

`tests/unit/words.test.ts`

- búsqueda normalizada en memoria (input y campos)
- ordenación por precisión asc/desc con palabras no practicadas
- desempate alfabético

`tests/unit/flash.test.ts`

- construcción y lectura de mensajes de redirect

`tests/unit/import-export.test.ts`

- import JSON con campo `tag`
- rechazo de payloads sin campo `tag`
- validación de `invalid_stats` cuando `times_correct > times_practiced`
- validación de `invalid_integer` para booleanos, hex, exponenciales y arrays
- preservación de stats no presentes en updates parciales (modo `update`)
- validación de `invalid_date_format` para strings espurios como `"5"` o `"2024"`
- resiliencia ante errores inesperados a mitad del loop (una tx por item)
- clasificación de `P2002` como `duplicate` skipped

`tests/unit/quiz.test.ts`

- `shuffle` (Fisher-Yates): preserva elementos, no muta el original
- `deriveMixedDirection`: determinismo por `(sessionId, index)` y salida acotada

## Validación funcional mínima recomendada

Además de la suite, valida manualmente:

1. alta de palabra
2. edición y borrado
3. filtros de `/verpalabras`
4. inicio y finalización de quiz
5. export JSON
6. import JSON

## Huecos actuales

- todavía no hay E2E automáticos
- no hay tests de integración contra Prisma ni server actions
- `submitQuizAnswer` y `skipQuizAnswer` no tienen tests funcionales de concurrencia porque requieren mockear el comportamiento de `updateMany` con `where` condicional. La garantía de atomicidad viene del compare-and-swap sobre `currentIndex` en `advanceSessionTx`: si el `updateMany` retorna `count === 0`, la tx aborta con `quiz_question_invalid` y las stats de la palabra no se duplican.

Si tocas quiz, import/export o persistencia, amplía la suite antes de dar por cerrado el cambio.
