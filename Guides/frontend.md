# Frontend

## Stack visual

- Next.js App Router
- React Server Components por defecto
- Client Components solo cuando hay interacción real
- Tailwind CSS
- `next/font` para Inter
- Font Awesome vía stylesheet global en `app/layout.tsx`

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
- `/settings` — idiomas y etiquetas

## Línea visual

Identidad **editorial / diccionario impreso, pero con superficies modernas**. Alma de léxico tipográfico cruzada con la suavidad de una app actual: nada de dashboard genérico ni glass-morphism.

- Fondo de papel cálido (`neutral-50`) con una trama de puntos muy sutil y una pizca de calor del acento.
- Escala de radios redefinida en `tailwind.config.ts` (`borderRadius`): todo es más redondeado. `rounded-sm` ya vale 0.5rem; superficies grandes usan `rounded-2xl`, botones/inputs `rounded-xl`, chips y paginación `rounded-full` (píldoras).
- Sombras suaves y difusas (`shadow-paper`, `shadow-lift`, `shadow-glow`) en vez de offsets duros. Botones y tiles se elevan ligeramente al hover (`-translate-y-0.5` + sombra mayor) para que la página invite a usarse.
- Tarjetas tipo cartulina: borde fino `neutral-200`, esquinas `rounded-2xl`, sombra `shadow-paper`. Clase `.page-card`.
- Navegación tipo píldora: `.nav-link` y `.mobile-nav-link` usan fondo tintado redondeado en hover/activo (`bg-primary-50`), sin subrayado.
- Tipografía con jerarquía clara:
  - `font-display` (**Fraunces**) para titulares, palabras y lemas. Las palabras del léxico se tratan como entradas de diccionario (serif, a veces en cursiva).
  - `font-sans` (**Hanken Grotesk**) para cuerpo y controles.
  - `font-mono` (**JetBrains Mono**) para etiquetas, metadatos y notación. Helpers `.eyebrow` / `.eyebrow-muted` (mayúsculas, `tracking-widest`).
- Paleta acotada: `primary` = rojo-óxido (acento principal/marca), `secondary` = verde pino (idiomas, aciertos), `accent` = ocre (avisos/pistas), `neutral` = escala piedra cálida.
- Detalles de carácter: reglas finas (`.rule`), numeración de entradas, fonética del nombre, citas en cursiva serif, chips `.meta-chip` para idioma/etiqueta.

Botones (`.primary-button`, `.secondary-button`, `.outline-button`), inputs y selects ya viven en `app/globals.css`. Reutiliza esas clases y `components/page-header.tsx` antes de inventar estilos nuevos.

Cuidado con `@apply` y valores arbitrarios que lleven `<` o comillas (p. ej. un SVG inline en `bg-[url(...)]`): rompen el build de Tailwind. Escribe esas propiedades como CSS plano dentro de la regla.

## Dónde tocar qué

- layout general, nav y footer -> `components/site-shell.tsx`
- estilos compartidos -> `app/globals.css`
- tabla de vocabulario -> `components/words-table.tsx`
- copy o estructura de una pantalla -> su `app/.../page.tsx`

## Límite server/client

- páginas y fetch de datos: server component
- selección múltiple y confirmaciones de borrado: client component
- formularios: server actions
