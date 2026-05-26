# mas_palabras

Aplicación Next.js para gestionar vocabulario personal y practicarlo con quizzes adaptativos.

## Estado actual

El runtime actual usa Next.js App Router, TypeScript, Tailwind CSS, Prisma y SQLite. La superficie de servidor está formada por páginas server-side, server actions y route handlers puntuales.

La documentación operativa vive en `Guides/`. Para trabajar con el repo, empieza por `AGENTS.md` y después lee las guías del área que vayas a tocar.

## Instalación

```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate:dev --name init
```

## Desarrollo local

```bash
pnpm dev
```

La app corre en `http://127.0.0.1:3000`.

## Tests y chequeo estático

```bash
pnpm test
pnpm build
```

La suite actual es Vitest unitario. `pnpm build` hace el chequeo de TypeScript de Next.

## Despliegue en producción

La aplicación está preparada para ejecutarse como build standalone de Next:

```bash
pnpm build
pnpm start:local
```

`pnpm start:local` usa `prisma/dev.db`. Para self-host real, define `DATABASE_URL` absoluta y arranca con `pnpm start`.
