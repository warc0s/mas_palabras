# Frontend — Templates y UI

## Stack visual

- Tailwind CSS vía CDN (`cdn.tailwindcss.com`) con config inline en `base.html`
- Font Awesome 6 para iconos
- Google Fonts: Inter (300–700)
- Sin build step: todo es Tailwind CDN + `<style type="text/tailwindcss">`

## Estructura de templates

Todos extienden `base.html`:
```
base.html
├── <nav>              # Sticky, glassmorphism, responsive (mobile menu)
├── flash messages     # Auto-hide a 5s, animaciones
├── {% block content %} # Cada template sobrescribe esto
└── <footer>
```

## Tailwind config (en base.html)

Tema personalizado con 3 paletas:
- primary — Sky blue (#0ea5e9 hasta #0c4a6e)
- secondary — Purple (#a855f7 hasta #581c87)
- accent — Amber (#f59e0b)
- neutral — Gris estándar + neutral-25 extra

Animaciones definidas: `fade-in`, `slide-up`, `scale-in`, `shimmer`

## Componentes CSS reutilizables

Definidos con `@apply` en `<style type="text/tailwindcss">` dentro de cada template:

- `.nav-link` (base.html) — Links de navegación desktop
- `.mobile-nav-link` (base.html) — Links navegación mobile
- `.stats-pill` (index.html) — Pastillas de estadísticas
- `.feature-card` (index.html) — Tarjetas de features
- `.modern-button` (index.html) — Botones con efecto hover
- `.progress-card` / `.progress-bar` / `.progress-fill` (index.html) — Barras de progreso

## Templates por página

### `index.html` — Dashboard
- Hero section con título y stats pills
- 3 feature cards: Añadir, Explorar, Practicar
- Progress dashboard (si hay palabras): total, sesiones, precisión, pendientes
- CTA "Practicar Palabras Difíciles" si hay pendientes

### `maspalabras.html` — Alta palabra
- Formulario WordForm con campos: english_word, translation, explanation, language (select), feature (select)

### `verpalabras.html` — Listado
- Barra de búsqueda + filtros (idioma, categoría) + sort
- Tabla de palabras paginada
- Info: "Mostrando X - Y de Z · Página N de M"
- Acciones por palabra: editar, eliminar

### `edit.html` — Edición
- Mismo formulario que maspalabras, pre-rellenado

### `quiz_config.html` — Configurar quiz
- Formulario: idioma, categoría, tipo de quiz, dificultad

### `quiz.html` — Pregunta activa
- Muestra palabra según quiz_type
- Input respuesta + botones verificar/skip
- Stats: respondidas, correctas, total disponible

### `import_words.html` — Importar
- Upload JSON + opciones duplicados + creación automática

### `settings.html` — Ajustes
- Dos formularios: nuevo idioma, nueva categoría
- Lista de idiomas y categorías activos con botón eliminar

### Error pages
- `404.html`, `500.html`, `413.html` — páginas de error custom

## Patrones JS (inline en base.html)

- Mobile menu toggle: `#mobile-menu-button` -> `#mobile-menu` classList toggle
- Auto-hide flashes: setTimeout 5s, fade-out + remove
- Smooth scroll: para anchors internos

## Donde tocar qué

- Cambiar colores globalmente -> Tailwind config en `base.html`
- Añadir una sección al nav -> `base.html` nav desktop + mobile
- Cambiar estilos de cards/botones -> `@apply` blocks en cada template
- Añadir JS global -> `<script>` en `base.html` al final
- Nueva página -> Crear template, extender `base.html`, bloque `content`
- Cambiar layout general -> `base.html`
