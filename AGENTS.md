# AGENTS.md — Mas_Palabras

App Next.js para gestionar vocabulario personal y practicarlo con quizzes adaptativos.

## Qué leer antes de tocar código

Lectura obligatoria antes de cada sesión de trabajo:

1. Este fichero (`AGENTS.md`)
2. Todas las guías de `Guides/` (son breves, léelas enteras)
3. La guía específica del área que vayas a tocar, una segunda vez con atención

### Mapa de guías

- `Guides/architecture.md` — Stack, estructura de ficheros, flujo de arranque de la app
- `Guides/backend.md` — Server actions, route handlers, lógica de negocio
- `Guides/api.md` — Superficie HTTP actual y ausencia de API REST pública
- `Guides/database.md` — Prisma, SQLite, esquema (4 tablas), migraciones
- `Guides/frontend.md` — App Router, componentes, Tailwind, dónde tocar estilos
- `Guides/security.md` — Validación server-side, cookie del quiz, gaps pendientes
- `Guides/testing.md` — Cómo ejecutar tests, estructura, convenciones
- `Guides/deploys.md` — Setup local, Prisma, build standalone y arranque Node
- `Guides/import-export.md` — Formato JSON, opciones de import, códigos de error

### Lectura rápida por tipo de cambio

- Tocar rutas, server actions o lógica -> `Guides/backend.md`
- Tocar modelos o BD -> `Guides/database.md`
- Tocar superficie HTTP -> `Guides/api.md`
- Tocar componentes o estilos -> `Guides/frontend.md`
- Tocar config, env vars, despliegue -> `Guides/deploys.md` + `Guides/security.md`
- Tocar import/export -> `Guides/import-export.md`
- Añadir tests -> `Guides/testing.md`

## Estructura del proyecto

```
app/                # Rutas Next.js App Router
components/         # Shell, banner, tabla y piezas reutilizables
lib/                # Prisma, servicios de dominio, validación y server actions
prisma/             # schema.prisma + migraciones
tests/              # Vitest
Guides/             # Documentación de referencia
```

## Principios

- Prioriza base sólida sobre features rápidas. Si falta información, deja un TODO explícito antes que inventar.
- Cambios pequeños y focalizados. Nada de refactors masivos no pedidos.
- Si una decisión cambia el enfoque o el alcance, pausa y pide confirmación.
- Ataca la causa raíz. No maquilles estados ni acumules deuda sin señalarla.
- Cierra el ciclo: explorar, cambiar, validar, resumir.

## Reglas de código

- Código e identificadores en inglés. Copy visible y mensajes en español.
- Las páginas y route handlers deben ser ligeros. Lógica de negocio fuera de `app/`.
- Los componentes presentan; las reglas viven en `lib/`.
- Centraliza validaciones y reglas compartidas. Si algo crece, extráelo a un módulo.
- Comentarios solo cuando aclaren una decisión no obvia.
- Todo tipado. `next build` debe pasar sin errores de TypeScript.

## Modelo de dominio — reglas clave

El modelo gira en torno a 4 tablas: `word`, `language`, `feature`, `quiz_session`.

Reglas que no se pueden romper:

- Los duplicados se detectan por `(language_id, normalized_english_word)`. La normalización quita acentos y pasa a casefold.
- Language y Feature hacen soft-delete (active=False) si tienen palabras asociadas.
- El tracking de progreso (`times_practiced`, `times_correct`, `last_practiced`) se actualiza en cada respuesta de quiz.
- Una palabra "necesita práctica" si: nunca practicada, menos de 3 intentos, o precisión menor al 70%.

Antes de cambiar el esquema: documenta el motivo, revisa impacto en datos existentes, define migración.

## Validación

- Todo cambio funcional necesita validación explícita.
- Prioriza tests automatizados. Si no hay tests, valida manual y documenta qué comprobaste.
- Cambios en quizzes, scoring, progreso o persistencia requieren validación cuidadosa.
- Cambios documentales o estructurales: explica por qué no aplica test.

## Seguridad

- Nunca commitees secretos. Variables sensibles en `.env`.
- Valida siempre inputs de usuario en server actions o servicios.
- Antes de borrados o migraciones irreversibles, confirma intención.
- La app no tiene autenticación ni rate limiting. Ver `Guides/security.md` para gaps conocidos.

## Guías: fuente única y documentación viva

- Las guías son la base de verdad del proyecto. Siempre deben reflejar el estado actual del código.
- Cada cambio en el código que afecte a una guía debe ir acompañado de la actualización de esa guía.
- Si añades una ruta, un modelo, un helper, un template o cambias un comportamiento: actualiza la guía correspondiente.
- Cada tema tiene una guía fuente. No repitas contenido que ya está en su guía.
- Si detectas duplicidad entre guías, corrígela.
- Si falta una guía necesaria, créala mínima o deja un TODO.
- Formato de las guías: solo texto, almohadillas (`#`) para headings y backticks para código. Sin tablas, sin negritas.

## Git

Conventional Commits, una sola línea, sin cuerpo.

Formato: `type: subject`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
Subject: breve, en inglés, imperativo.

Ejemplos: `feat: add quiz result summary`, `fix: prevent duplicate vocabulary entries`

## Ejecución

- Responde siempre en español.
- No dejes procesos persistentes corriendo sin avisar.
- Si un comando puede tardar o modificar datos, avisa antes.
- Comandos principales del proyecto:
  - `pnpm dev`
  - `pnpm build`
  - `pnpm start`
  - `pnpm test`
