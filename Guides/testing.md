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

- normalización de texto

`tests/unit/word-metrics.test.ts`

- accuracy
- `needsPractice`
- `practicePriority`

`tests/unit/flash.test.ts`

- construcción y lectura de mensajes de redirect

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

Si tocas quiz, import/export o persistencia, amplía la suite antes de dar por cerrado el cambio.
