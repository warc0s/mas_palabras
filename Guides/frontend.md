# Frontend

## Stack visual

- Next.js App Router
- React Server Components por defecto
- Client Components solo cuando hay interacción real
- Tailwind CSS
- `next/font` para Inter
- Font Awesome vía script global

## Componentes principales

- `components/site-shell.tsx` — nav, footer y contenedor general
- `components/mobile-nav.tsx` — menú responsive
- `components/flash-banner.tsx` — mensajes de estado
- `components/words-table.tsx` — tabla con selección múltiple y borrados

## Rutas UI

- `/` — dashboard
- `/maspalabras` — alta
- `/verpalabras` — listado y filtros
- `/edit/[id]` — edición
- `/quiz` — configuración del quiz
- `/quiz_question` — pregunta activa
- `/import_words` — import JSON
- `/settings` — idiomas y características

## Línea visual

Se ha conservado el look general de la app anterior:

- fondos con gradiente suave
- tarjetas blancas translúcidas
- colores `primary`, `secondary`, `neutral`
- copy y estructura muy parecidos a las plantillas Jinja originales

No conviertas esta UI en otro dashboard genérico. Si hay que tocar diseño, respeta primero el lenguaje visual ya existente.

## Dónde tocar qué

- layout general, nav y footer -> `components/site-shell.tsx`
- estilos compartidos -> `app/globals.css`
- tabla de vocabulario -> `components/words-table.tsx`
- copy o estructura de una pantalla -> su `app/.../page.tsx`

## Límite server/client

- páginas y fetch de datos: server component
- selección múltiple y confirmaciones de borrado: client component
- formularios: server actions
