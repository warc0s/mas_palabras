# Arquitectura General

## Stack

- Framework: Next.js 16 con App Router
- Lenguaje: TypeScript estricto
- Estilos: Tailwind CSS
- BD: SQLite + Prisma
- Validación: Zod
- Testing: Vitest
- Producción: build standalone de Next ejecutado con Node

## Runtime actual

El árbol ejecutable se compone de rutas de App Router, componentes React, servicios de dominio en `lib/`, server actions y route handlers puntuales.

## Estructura de ficheros

```
app/
  layout.tsx            # layout global, metadata y shell común
  globals.css           # estilos globales y clases Tailwind compartidas
  error.tsx             # error boundary global
  not-found.tsx         # página 404
  page.tsx              # dashboard
  maspalabras/          # alta de palabra
  verpalabras/          # listado, filtros y bulk delete
  edit/[id]/            # edición
  quiz/                 # configuración del quiz
  quiz_question/        # pregunta activa
  import_words/         # importación JSON
  export_words/route.ts # descarga JSON
  settings/             # idiomas y etiquetas
  end_quiz/route.ts     # cierre explícito de sesión de quiz

components/
  site-shell.tsx        # nav, footer y estructura común
  flash-banner.tsx      # mensajes por query string
  mobile-nav.tsx        # navegación móvil
  words-table.tsx       # tabla interactiva y borrado masivo

lib/
  prisma.ts             # singleton Prisma Client
  text.ts               # normalización
  word-metrics.ts       # accuracy, needsPractice, priority
  words.ts              # queries y mutaciones de palabras/dashboard/export
  settings.ts           # idiomas y etiquetas
  quiz.ts               # sesiones y gameplay
  import-export.ts      # importación JSON
  validators.ts         # esquemas Zod
  flash.ts              # helpers de mensajes por redirect
  actions/              # server actions por dominio

prisma/
  schema.prisma         # esquema fuente
  migrations/           # migraciones SQL generadas por Prisma

tests/unit/             # tests Vitest del dominio base
```

## Flujo general

1. La ruta de App Router renderiza una página server-side.
2. La página pide datos a `lib/*`.
3. Las mutaciones se hacen con server actions en `lib/actions/*`.
4. Las server actions escriben en SQLite vía Prisma.
5. En mutaciones que afectan listados o dashboard, se llama a `revalidatePath()`.
6. La action redirige con `status` y `message`.
7. `FlashBanner` pinta el resultado del último flujo.

## Convenciones

- Todo el código de aplicación va en inglés salvo el copy visible al usuario, que sigue en español.
- La superficie principal son páginas, server actions y un par de route handlers internos.
- La UI actual usa un lenguaje visual propio basado en Tailwind, tarjetas translúcidas, gradientes suaves y Font Awesome.
- La fuente de verdad del esquema está en `prisma/schema.prisma`.
- `pnpm dev`, `pnpm build` y `pnpm start:local` fijan `DATABASE_URL` absoluta hacia `prisma/dev.db`.
- `pnpm start` respeta el `DATABASE_URL` del entorno para self-host.
