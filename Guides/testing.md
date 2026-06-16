# Testing

## Commands

```bash
pnpm test
pnpm build
```

## Stack

- Vitest for unit tests
- TypeScript checking through `next build`

## Current Suite

`tests/unit/text.test.ts`

- text normalization
- accent and combining-mark removal
- format-character removal such as ZWSP, ZWJ, BOM, LTR, and RTL marks
- idempotency
- edge cases that normalize to empty strings

`tests/unit/word-metrics.test.ts`

- accuracy
- `needsPractice`
- `practicePriority`

`tests/unit/words.test.ts`

- normalized in-memory search
- accuracy sorting with unpracticed words
- alphabetical tie-breaks

`tests/unit/flash.test.ts`

- redirect-message URL construction and parsing

`tests/unit/import-export.test.ts`

- JSON import with `tag`
- rejection of payloads without `tag`
- `invalid_stats` when `times_correct > times_practiced`
- `invalid_integer` for booleans, hex, exponents, and arrays
- partial stat preservation in `update` mode
- `invalid_date_format` for ambiguous strings
- resilience to unexpected errors in the item loop
- classification of Prisma `P2002` as duplicate skipped

`tests/unit/quiz.test.ts`

- Fisher-Yates `shuffle`
- deterministic `deriveMixedDirection`
- compare-and-swap session advancement failure

## Minimum Manual Validation

Besides the automated suite, validate:

1. word creation
2. editing and deletion
3. `/verpalabras` filters
4. quiz start and completion
5. JSON export
6. JSON import
7. interface language switching

## Current Gaps

- no automated E2E tests yet
- no Prisma integration tests for server actions
- no browser accessibility tests
- no concurrency test for full quiz submit/skip flows

If you touch quiz, import/export, persistence, or i18n, extend or rerun the suite before closing the change.
