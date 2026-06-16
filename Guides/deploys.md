# Development and Deployment

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate:dev --name init
```

## Development

```bash
pnpm dev
```

The app runs at `http://127.0.0.1:3000`.

## Production Build

```bash
pnpm build
pnpm start:local
```

`pnpm start:local` runs the standalone Next server and sets an absolute `DATABASE_URL` for `prisma/dev.db`.

## Migrations

```bash
pnpm prisma:migrate:dev --name change_name
pnpm prisma:migrate:deploy
pnpm prisma:generate
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

`NEXT_PUBLIC_SITE_URL` sets the absolute URL base for metadata. If it is not defined, the fallback is `http://localhost:3000`.

For development, build, and local standalone startup, the scripts convert the database path to an absolute path when starting Next.

## Self-Hosted Deployment

Expected flow:

1. `pnpm install`
2. `pnpm prisma:migrate:deploy`
3. `pnpm build`
4. `DATABASE_URL="file:/absolute/path/prod.db" pnpm start`

`pnpm start` respects the environment `DATABASE_URL`. Use `pnpm start:local` only when running against `prisma/dev.db`.

## Public Hosting Warning

The source repository can be public, but a deployed public instance is still personal-app grade until user accounts, authorization, data isolation, rate limiting, and stronger headers are implemented.
