<p align="center">
  <img src="docs/assets/logo.svg" alt="Mas Palabras" width="680">
</p>

# Mas Palabras

Mas Palabras is a personal vocabulary manager built with Next.js, Prisma, SQLite, and TypeScript. It helps you collect words, classify them by language and tag, import or export JSON, and practice with adaptive quizzes.

The repository is ready to be public as source code. The deployed app is still personal-use grade until authentication, authorization, user data isolation, and rate limiting are implemented.

## Table of Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Production Build](#production-build)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Security Status](#security-status)
- [Contributing](#contributing)
- [License](#license)

## Screenshots

### Dashboard

![Dashboard screenshot](docs/assets/screenshot-dashboard.png)

### Lexicon

![Lexicon screenshot](docs/assets/screenshot-lexicon.png)

### Mobile

![Mobile screenshot](docs/assets/screenshot-mobile.png)

## Features

- Personal vocabulary dashboard
- Word creation, editing, deletion, filtering, sorting, and bulk deletion
- Language and tag management
- Adaptive quiz sessions
- JSON import and export
- Interface language selector
- English, Spanish, and Catalan UI dictionaries
- Prisma migrations for SQLite
- Vitest domain tests
- GitHub Actions CI for test and build

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Zod
- Vitest

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate:dev --name init
```

## Environment Variables

Minimum:

```env
DATABASE_URL="file:./dev.db"
```

Optional:

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
```

Do not commit real `.env` files, local SQLite databases, generated builds, logs, tokens, or keys.

## Development

```bash
pnpm dev
```

The app runs at:

```text
http://127.0.0.1:3000
```

## Testing

```bash
pnpm test
pnpm build
```

`pnpm test` runs the Vitest unit suite. `pnpm build` runs the production build and Next.js TypeScript checks.

## Production Build

```bash
pnpm build
pnpm start:local
```

`pnpm start:local` runs the standalone server against `prisma/dev.db`.

For real self-hosting, set an absolute database URL and run:

```bash
DATABASE_URL="file:/absolute/path/prod.db" pnpm start
```

## Project Structure

```text
app/                # Next.js App Router routes
components/         # Shell, navigation, table, forms, shared UI
lib/                # Domain logic, Prisma, validation, i18n, server actions
prisma/             # Prisma schema and migrations
tests/              # Vitest tests
Guides/             # Internal engineering documentation
docs/assets/        # README images and public assets
```

## Documentation

Start with:

- [AGENTS.md](AGENTS.md)
- [Guides/architecture.md](Guides/architecture.md)
- [Guides/backend.md](Guides/backend.md)
- [Guides/frontend.md](Guides/frontend.md)
- [Guides/security.md](Guides/security.md)
- [Guides/TODO/public-product-checklist.md](Guides/TODO/public-product-checklist.md)
- [Guides/TODO/product-vision.md](Guides/TODO/product-vision.md)

## Security Status

This codebase has been cleaned for public repository publication, but the app should not be deployed as a public multi-user service yet.

Known product security gaps:

- no authentication
- no authorization
- no per-user data isolation
- no rate limiting
- global JSON export
- one state-changing quiz endpoint still uses GET
- Font Awesome loads from a CDN without a custom CSP or SRI

See [SECURITY.md](SECURITY.md) and [Guides/security.md](Guides/security.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

The expected workflow is branch, validate, commit, push, and open a pull request into `main`.

## License

No license has been selected yet. Until a license is added, all rights are reserved by the repository owner.
