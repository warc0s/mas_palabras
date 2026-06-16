# Architecture

## Stack

- Framework: Next.js 16 with App Router
- Language: strict TypeScript
- Styling: Tailwind CSS
- Database: SQLite with Prisma
- Validation: Zod
- Testing: Vitest
- Production: Next standalone build executed with Node

## Runtime Shape

The executable tree is made of App Router routes, React components, domain services in `lib/`, server actions, and a small number of route handlers.

## File Structure

```text
app/
  layout.tsx            # global layout, metadata, shared shell
  globals.css           # global styles and shared Tailwind classes
  error.tsx             # global error boundary
  not-found.tsx         # 404 page
  page.tsx              # dashboard
  maspalabras/          # word creation
  verpalabras/          # listing, filters, bulk delete
  edit/[id]/            # editing
  quiz/                 # quiz configuration
  quiz_question/        # active question
  import_words/         # JSON import
  export_words/route.ts # JSON download
  settings/             # languages and tags
  end_quiz/route.ts     # explicit quiz-session end

components/
  site-shell.tsx        # nav, footer, layout structure
  language-selector.tsx # client-side interface-language selector
  desktop-nav.tsx       # desktop navigation
  mobile-nav.tsx        # accessible mobile navigation
  footer-nav.tsx        # footer navigation
  flash-banner.tsx      # query-string status messages
  words-table.tsx       # interactive table and bulk delete
  submit-button.tsx     # pending-state submit button
  page-header.tsx       # shared page heading

lib/
  prisma.ts             # Prisma Client singleton
  i18n.ts               # interface dictionaries and locale cookie lookup
  text.ts               # normalization
  word-metrics.ts       # accuracy, needsPractice, priority
  words.ts              # word/dashboard/export queries and mutations
  settings.ts           # languages and tags
  quiz.ts               # sessions and gameplay
  import-export.ts      # JSON import
  validators.ts         # Zod schemas
  flash.ts              # redirect-message helpers
  actions/              # server actions by domain

prisma/
  schema.prisma         # source schema
  migrations/           # Prisma SQL migrations

tests/unit/             # Vitest domain tests
```

## Main Flow

1. An App Router route renders server-side.
2. The page reads data through `lib/*`.
3. Mutations run through server actions in `lib/actions/*`.
4. Server actions write to SQLite through Prisma.
5. Mutations that affect listings or dashboard data call `revalidatePath()`.
6. The action redirects with `status` and `message`.
7. `FlashBanner` renders feedback for the last flow.

## Conventions

- Application code and comments are in English.
- Interactive UI copy belongs in `lib/i18n.ts`.
- The main surface is pages, server actions, and a couple of internal route handlers.
- The current visual language is editorial, vocabulary-focused, and Tailwind-based.
- The schema source of truth is `prisma/schema.prisma`.
- `pnpm dev`, `pnpm build`, and `pnpm start:local` set an absolute `DATABASE_URL` to `prisma/dev.db`.
- `pnpm start` respects the environment `DATABASE_URL` for self-hosting.
