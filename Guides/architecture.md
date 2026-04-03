# Arquitectura General

## Stack

- Framework: Next.js 16 con App Router
- Lenguaje: TypeScript estricto
- Estilos: Tailwind CSS
- BD: SQLite + Prisma
- Validación: Zod
- Testing: Vitest
- Producción: build standalone de Next ejecutado con Node

## Estructura de ficheros

```
app/
  layout.tsx            # layout global, metadata y shell común
  page.tsx              # dashboard
  maspalabras/          # alta de palabra
  verpalabras/          # listado, filtros y bulk delete
  edit/[id]/            # edición
  quiz/                 # configuración del quiz
  quiz_question/        # pregunta activa
  import_words/         # importación JSON
  export_words/route.ts # descarga JSON
  settings/             # idiomas y características
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
  settings.ts           # idiomas y características
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
5. Tras mutar, se llama a `revalidatePath()` y se redirige con `status` y `message`.
6. `FlashBanner` pinta el resultado del último flujo.

## Convenciones

- Todo el código de aplicación va en inglés salvo el copy visible al usuario, que sigue en español.
- No hay API REST pública. La superficie principal son páginas, server actions y un par de route handlers internos.
- La UI mantiene el look de la app anterior; no se ha rediseñado la identidad visual.
- La fuente de verdad del esquema está en `prisma/schema.prisma`.
- Los comandos de Next se lanzan con `DATABASE_URL` absoluta en los scripts para que `dev`, `build` y `start` usen la misma BD.
