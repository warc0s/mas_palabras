# Guía 1: Checklist de implementación para convertir Más Palabras en una aplicación pública de referencia

## Uso de esta checklist

Esta guía está pensada para entregársela a un agente codificador. Cada casilla representa una capacidad funcional, de producto, seguridad, calidad o experiencia de usuario que debe quedar implementada y validada. No describe cómo programarla. El agente debe decidir la implementación técnica respetando el repositorio, sus guías internas y el criterio de calidad marcado en la Guía 2.

Convención sugerida:

- P0: imprescindible para exponer la app públicamente.
- P1: diferencial fuerte de producto.
- P2: ambición avanzada para convertirla en referencia.
- P3: expansión, comunidad, monetización y ecosistema.

## 0. Auditoría inicial del repositorio actual

- [ ] P0 Revisar todas las guías existentes en `AGENTS.md` y `Guides/` antes de tocar la aplicación.
- [ ] P0 Documentar el estado actual: app personal, sin autenticación, datos globales, SQLite, quiz básico, importación/exportación JSON y gestión de idiomas/etiquetas.
- [ ] P0 Identificar todas las rutas, server actions y route handlers que mutan o exponen datos.
- [ ] P0 Auditar todos los accesos a `Word`, `Language`, `Tag` y `QuizSession` para detectar dónde habrá que aplicar aislamiento por usuario.
- [ ] P0 Revisar nombres de dominio demasiado específicos, especialmente `englishWord`, para convertir el producto en una app multiidioma real.
- [ ] P0 Crear una hoja de riesgos antes de migrar: datos existentes, duplicados, sesiones de quiz, exportación global, rutas GET con mutación y ausencia de autorización.
- [ ] P0 Definir una estrategia de migración desde uso personal a multiusuario sin pérdida de datos.
- [ ] P0 Añadir una guía nueva en `Guides/` dedicada a producto público, identidad, multiusuario y privacidad.

## 1. Identidad, cuentas y perfiles

- [ ] P0 Añadir registro de usuario.
- [ ] P0 Añadir inicio de sesión.
- [ ] P0 Añadir cierre de sesión claro y accesible.
- [ ] P0 Añadir recuperación de acceso.
- [ ] P0 Añadir verificación de email cuando aplique.
- [ ] P0 Añadir protección de rutas privadas.
- [ ] P0 Añadir sesión persistente segura para usuarios autenticados.
- [ ] P0 Añadir perfil de usuario con nombre visible, avatar opcional, idioma de interfaz y zona horaria.
- [ ] P0 Añadir página de cuenta con email, contraseña o método de acceso, sesiones activas y eliminación de cuenta.
- [ ] P1 Añadir login social si encaja con el posicionamiento del producto.
- [ ] P1 Añadir soporte de passkeys como método moderno de acceso.
- [ ] P1 Añadir segundo factor de autenticación para cuentas sensibles o usuarios premium.
- [ ] P1 Añadir gestión de dispositivos y cierre remoto de sesiones.
- [ ] P1 Añadir onboarding posterior al registro con objetivo de aprendizaje, idioma nativo, idiomas objetivo y nivel aproximado.
- [ ] P1 Añadir perfil de aprendizaje: meta semanal, intensidad, preferencias de quiz, notificaciones y estilo de corrección.
- [ ] P2 Añadir perfiles públicos opcionales con logros, mazos compartidos y estadísticas agregadas no sensibles.

## 2. Aislamiento de datos y modelo multiusuario

- [ ] P0 Asociar cada palabra a un usuario propietario.
- [ ] P0 Asociar cada idioma, etiqueta, colección, sesión de quiz y estadística a un usuario o a un espacio compartido explícito.
- [ ] P0 Impedir que un usuario lea, edite, exporte o borre datos de otro usuario.
- [ ] P0 Añadir reglas de autorización a todos los servicios de dominio, no solo a la interfaz.
- [ ] P0 Convertir `GET /export_words` en una exportación del usuario autenticado, nunca global.
- [ ] P0 Sustituir cualquier mutación mediante GET por una acción segura y explícita.
- [ ] P0 Diseñar la relación entre datos privados, datos compartidos y datos públicos.
- [ ] P0 Añadir borrado completo de los datos del usuario.
- [ ] P0 Añadir exportación completa de datos personales y de aprendizaje.
- [ ] P1 Añadir espacios de trabajo o grupos para aulas, academias, familias o equipos.
- [ ] P1 Añadir permisos por espacio: propietario, editor, estudiante, lector.
- [ ] P1 Añadir transferencia de propiedad de colecciones compartidas.
- [ ] P2 Añadir auditoría de cambios importantes: importaciones, borrados masivos, cambios de visibilidad y cambios de permisos.

## 3. Base de datos, persistencia y escalabilidad

- [ ] P0 Diseñar el esquema público de producción con una base de datos apta para multiusuario.
- [ ] P0 Migrar los datos globales actuales a entidades vinculadas a un usuario inicial o espacio personal.
- [ ] P0 Añadir índices para búsquedas por usuario, idioma, etiqueta, colección, texto normalizado y fechas de repaso.
- [ ] P0 Añadir restricciones únicas por usuario e idioma, no globales.
- [ ] P0 Separar entidades de catálogo global de entidades personales.
- [ ] P0 Añadir campos de actualización y archivado donde tenga sentido.
- [ ] P0 Añadir estrategia de backups, restauración y retención.
- [ ] P0 Añadir límites de tamaño para importaciones, explicaciones, ejemplos, notas, imágenes y audio.
- [ ] P1 Añadir historial de eventos de aprendizaje para análisis futuro.
- [ ] P1 Añadir trabajos asíncronos para importaciones grandes, enriquecimiento automático, generación de audio e informes.
- [ ] P1 Añadir soft delete recuperable para elementos importantes.
- [ ] P2 Añadir modelo de versionado para palabras, tarjetas, colecciones y mazos públicos.
- [ ] P2 Añadir sistema de colas para procesos costosos.

## 4. Rediseño del dominio léxico

- [ ] P0 Renombrar conceptualmente la palabra principal para que no esté limitada a inglés.
- [ ] P0 Definir una entrada léxica como término, idioma objetivo, traducción, idioma base, explicación y metadatos.
- [ ] P0 Permitir varias traducciones por entrada.
- [ ] P0 Permitir varias acepciones por entrada.
- [ ] P0 Permitir ejemplos de uso por entrada y por acepción.
- [ ] P0 Permitir notas personales.
- [ ] P0 Permitir parte de la oración: sustantivo, verbo, adjetivo, expresión, phrasal verb, idiom, conector y otros.
- [ ] P0 Permitir nivel estimado: A1, A2, B1, B2, C1, C2 o personalizado.
- [ ] P0 Permitir marcar una entrada como activa, archivada, dominada o suspendida.
- [ ] P1 Añadir pronunciación textual: IPA u otro sistema según idioma.
- [ ] P1 Añadir campos de género, plural, conjugación, régimen verbal o notas gramaticales según idioma.
- [ ] P1 Añadir colocaciones, sinónimos, antónimos y palabras relacionadas.
- [ ] P1 Añadir registro: formal, informal, técnico, coloquial, vulgar, literario.
- [ ] P1 Añadir dominio temático: trabajo, viajes, salud, tecnología, universidad, cultura, exámenes y otros.
- [ ] P1 Añadir frecuencia o prioridad de aprendizaje.
- [ ] P1 Añadir fuente de la palabra: manual, importación, texto, vídeo, lectura, comunidad, IA o API.
- [ ] P2 Añadir variantes regionales y advertencias de uso.
- [ ] P2 Añadir familias de palabras y raíces.
- [ ] P2 Añadir relaciones semánticas visuales entre palabras.

## 5. Etiquetas, colecciones y mazos

- [ ] P0 Mantener etiquetas personales simples.
- [ ] P0 Añadir colecciones o mazos como agrupación principal de estudio.
- [ ] P0 Permitir que una palabra pertenezca a varias colecciones.
- [ ] P0 Permitir que una palabra tenga varias etiquetas.
- [ ] P0 Diferenciar etiquetas de nivel, tema, origen, estado y uso.
- [ ] P0 Añadir creación, edición, archivado y borrado seguro de colecciones.
- [ ] P1 Añadir etiquetas jerárquicas o agrupadas.
- [ ] P1 Añadir colores e iconos para colecciones y etiquetas.
- [ ] P1 Añadir reglas dinámicas de colección: palabras B2 sin dominar, verbos de viajes, errores frecuentes, palabras nuevas de esta semana.
- [ ] P1 Añadir mazos inteligentes generados por objetivo.
- [ ] P2 Añadir plantillas de mazos: examen, viaje, entrevista, lectura técnica, conversación diaria.
- [ ] P2 Añadir duplicación y mezcla de mazos.
- [ ] P3 Añadir marketplace o biblioteca pública de mazos compartidos.

## 6. Captura y creación de vocabulario

- [ ] P0 Mejorar el formulario de alta para que sea rápido, visual y tolerante a entradas parciales.
- [ ] P0 Permitir crear idioma, etiqueta y colección desde el propio flujo de alta.
- [ ] P0 Añadir detección de duplicados en tiempo real antes de guardar.
- [ ] P0 Añadir modo de alta rápida con solo término y traducción.
- [ ] P0 Añadir modo de alta completa con acepciones, ejemplos, pronunciación, notas y metadatos.
- [ ] P1 Añadir importación desde CSV.
- [ ] P1 Añadir importación desde TSV.
- [ ] P1 Añadir pegado masivo desde texto plano.
- [ ] P1 Añadir importación desde listas copiadas de otras apps.
- [ ] P1 Añadir previsualización de importación antes de confirmar.
- [ ] P1 Añadir resolución manual de duplicados durante importación.
- [ ] P1 Añadir historial de importaciones con resumen, errores y posibilidad de deshacer.
- [ ] P2 Añadir extracción de vocabulario desde texto largo.
- [ ] P2 Añadir extracción desde subtítulos o transcripciones.
- [ ] P2 Añadir extensión de navegador para guardar palabras desde cualquier web.
- [ ] P2 Añadir bookmarklet o acción rápida para captura sin extensión.
- [ ] P2 Añadir captura móvil estilo compartir con la app.
- [ ] P3 Añadir OCR para capturar palabras desde imágenes, siempre con revisión manual antes de guardar.

## 7. Enriquecimiento inteligente de entradas

- [ ] P1 Añadir sugerencias automáticas de ejemplos naturales.
- [ ] P1 Añadir sugerencias de traducciones alternativas.
- [ ] P1 Añadir explicación breve adaptada al nivel del usuario.
- [ ] P1 Añadir mnemotecnias opcionales.
- [ ] P1 Añadir sinónimos y antónimos sugeridos.
- [ ] P1 Añadir colocaciones frecuentes.
- [ ] P1 Añadir advertencias de falsos amigos o confusiones habituales.
- [ ] P1 Añadir validación de calidad: entradas vacías, traducciones demasiado largas, idioma incorrecto, duplicados semánticos.
- [ ] P1 Permitir aceptar, editar o rechazar cada sugerencia antes de guardarla.
- [ ] P1 Registrar qué contenido fue generado o sugerido automáticamente.
- [ ] P2 Añadir ejemplos graduados por nivel: simple, intermedio, avanzado.
- [ ] P2 Añadir explicación contrastiva entre dos palabras parecidas.
- [ ] P2 Añadir generación de tarjetas de cloze a partir de ejemplos.
- [ ] P2 Añadir generación de audio para término y ejemplos.
- [ ] P2 Añadir imágenes o asociaciones visuales opcionales para memoria.
- [ ] P2 Añadir revisión de calidad por comunidad para mazos públicos.

## 8. Motor de aprendizaje y repetición espaciada

- [ ] P0 Sustituir la regla simple actual de `needsPractice` por un modelo explícito de repaso por tarjeta.
- [ ] P0 Separar entrada léxica de tarjeta de práctica.
- [ ] P0 Crear tarjetas por dirección: término a traducción, traducción a término, cloze, escucha, selección, escritura.
- [ ] P0 Registrar cada intento como evento de revisión.
- [ ] P0 Guardar fecha de próxima revisión por tarjeta.
- [ ] P0 Guardar estado de aprendizaje: nueva, aprendiendo, en repaso, dominada, suspendida, leech.
- [ ] P0 Añadir calificación de respuesta más rica que correcto o incorrecto: otra vez, difícil, bien, fácil.
- [ ] P0 Priorizar tarjetas vencidas antes que tarjetas nuevas.
- [ ] P0 Permitir límite diario de tarjetas nuevas.
- [ ] P0 Permitir límite diario de repasos.
- [ ] P1 Añadir algoritmo de repetición espaciada configurable.
- [ ] P1 Añadir carga diaria estimada.
- [ ] P1 Añadir detección de palabras problemáticas.
- [ ] P1 Añadir suspensión automática sugerida para tarjetas mal diseñadas.
- [ ] P1 Añadir mezcla controlada de reconocimiento y producción activa.
- [ ] P1 Añadir sesiones cortas de 3, 5, 10 y 20 minutos.
- [ ] P1 Añadir modo de repaso rápido desde el dashboard.
- [ ] P1 Añadir resumen de sesión con aciertos, errores, tarjetas vencidas, nuevas tarjetas y próximas revisiones.
- [ ] P2 Añadir estimación de retención y dificultad por usuario.
- [ ] P2 Añadir adaptación por fatiga y hora del día.
- [ ] P2 Añadir entrenamiento intensivo antes de un examen o viaje.
- [ ] P2 Añadir simulador de carga futura si el usuario añade muchas palabras.

## 9. Modos de práctica

- [ ] P0 Mantener quiz escrito básico, pero rediseñado sobre tarjetas.
- [ ] P0 Añadir modo flashcard con mostrar respuesta.
- [ ] P0 Añadir modo elección múltiple.
- [ ] P0 Añadir modo escritura exacta con tolerancia configurable.
- [ ] P0 Añadir modo cloze: completar huecos en una frase.
- [ ] P1 Añadir modo escucha: oír y escribir.
- [ ] P1 Añadir modo pronunciación con grabación y autoevaluación o feedback asistido.
- [ ] P1 Añadir modo dictado de ejemplos.
- [ ] P1 Añadir modo emparejar columnas.
- [ ] P1 Añadir modo ordenar frase.
- [ ] P1 Añadir modo conversación: usar palabras objetivo en respuestas cortas.
- [ ] P1 Añadir modo test de examen con temporizador.
- [ ] P1 Añadir modo repaso de errores.
- [ ] P1 Añadir modo repaso antes de dormir o repaso ultracorto.
- [ ] P2 Añadir retos diarios personalizados.
- [ ] P2 Añadir entrenamiento por habilidad: lectura, escritura, escucha, habla y uso contextual.
- [ ] P2 Añadir modo visual de mapa mental.
- [ ] P2 Añadir modo historia: construir una mini historia con palabras objetivo.

## 10. Corrección, tolerancia y feedback

- [ ] P0 Mantener corrección insensible a mayúsculas y acentos donde proceda.
- [ ] P0 Permitir respuestas alternativas válidas.
- [ ] P0 Permitir marcar manualmente una respuesta como correcta.
- [ ] P0 Mostrar respuesta correcta con explicación útil.
- [ ] P0 Mostrar por qué una respuesta no coincide cuando sea seguro hacerlo.
- [ ] P1 Añadir tolerancia a pequeñas erratas.
- [ ] P1 Añadir feedback sobre género, número, conjugación o preposición cuando aplique.
- [ ] P1 Añadir feedback de matiz: formalidad, registro, colocación y contexto.
- [ ] P1 Añadir lista de errores frecuentes por palabra.
- [ ] P1 Añadir botón de reportar tarjeta confusa.
- [ ] P1 Añadir edición inmediata desde el resultado de una tarjeta.
- [ ] P2 Añadir feedback comparativo entre palabras parecidas.
- [ ] P2 Añadir sugerencias de rediseño de tarjeta cuando una palabra falla demasiado.

## 11. Dashboard y visualización del aprendizaje

- [ ] P0 Rediseñar el dashboard para usuarios autenticados.
- [ ] P0 Mostrar tarjetas vencidas hoy.
- [ ] P0 Mostrar racha, carga diaria y progreso semanal.
- [ ] P0 Mostrar palabras nuevas, palabras aprendiendo, palabras dominadas y palabras problemáticas.
- [ ] P0 Mostrar acceso directo a repaso del día.
- [ ] P0 Mostrar continuidad: continuar última sesión, último mazo abierto, última importación.
- [ ] P1 Añadir calendario de actividad.
- [ ] P1 Añadir curva de retención estimada.
- [ ] P1 Añadir distribución por nivel, idioma, etiqueta, colección y dominio temático.
- [ ] P1 Añadir ranking personal de palabras más difíciles.
- [ ] P1 Añadir mapa visual de vocabulario por temas.
- [ ] P1 Añadir objetivos semanales y seguimiento.
- [ ] P1 Añadir recomendaciones del día: repasar, corregir tarjetas pobres, añadir ejemplos, limpiar duplicados.
- [ ] P2 Añadir grafo semántico interactivo.
- [ ] P2 Añadir línea temporal de adquisición de vocabulario.
- [ ] P2 Añadir predicción de dominio por fecha objetivo.
- [ ] P2 Añadir informes descargables para estudiantes, profesores o academias.

## 12. Biblioteca de vocabulario y búsqueda

- [ ] P0 Rediseñar `/verpalabras` como biblioteca personal potente.
- [ ] P0 Añadir vista de tabla.
- [ ] P0 Añadir vista de tarjetas visuales.
- [ ] P0 Añadir vista compacta para gestión rápida.
- [ ] P0 Añadir búsqueda por término, traducción, ejemplo, nota y etiqueta.
- [ ] P0 Añadir filtros combinables.
- [ ] P0 Añadir ordenación por vencimiento, dificultad, frecuencia, fecha de creación y fecha de último fallo.
- [ ] P0 Añadir edición rápida inline.
- [ ] P0 Añadir selección masiva segura.
- [ ] P1 Añadir búsqueda difusa.
- [ ] P1 Añadir búsqueda por sinónimos o palabras relacionadas.
- [ ] P1 Añadir filtros guardados.
- [ ] P1 Añadir acciones masivas: etiquetar, mover a colección, archivar, suspender, cambiar nivel, generar tarjetas.
- [ ] P1 Añadir revisión de calidad de biblioteca.
- [ ] P2 Añadir vista de diccionario personal con acepciones y ejemplos agrupados.
- [ ] P2 Añadir vista comparativa entre idiomas.

## 13. Diseño visual, interacción y usabilidad

- [ ] P0 Definir un sistema visual propio, no un dashboard genérico.
- [ ] P0 Mantener una estética limpia, luminosa y orientada al aprendizaje.
- [ ] P0 Crear componentes consistentes para botones, inputs, tarjetas, banners, modales, tablas, menús y estados vacíos.
- [ ] P0 Mejorar navegación móvil.
- [ ] P0 Añadir estados de carga claros.
- [ ] P0 Añadir estados de error claros sin filtrar detalles técnicos.
- [ ] P0 Añadir confirmaciones para borrados importantes.
- [ ] P0 Añadir undo cuando sea razonable.
- [ ] P1 Añadir microinteracciones sobrias en repaso y progreso.
- [ ] P1 Añadir modo oscuro.
- [ ] P1 Añadir temas visuales por idioma o colección.
- [ ] P1 Añadir tarjetas con color, icono, progreso y próxima revisión.
- [ ] P1 Añadir celebraciones discretas de hitos importantes.
- [ ] P1 Añadir diseño específico para sesiones de estudio sin distracciones.
- [ ] P2 Añadir visualizaciones ricas: mapa, constelaciones, árbol de temas y heatmap.
- [ ] P2 Añadir editor de tarjetas con previsualización en vivo.

## 14. Accesibilidad e internacionalización

- [ ] P0 Cumplir criterios básicos de accesibilidad en navegación, formularios, contraste, foco visible y uso con teclado.
- [ ] P0 Añadir etiquetas accesibles en iconos y controles interactivos.
- [ ] P0 Evitar depender solo del color para comunicar estados.
- [ ] P0 Validar la experiencia con lector de pantalla en flujos principales.
- [ ] P0 Respetar `prefers-reduced-motion`.
- [ ] P1 Internacionalizar la interfaz.
- [ ] P1 Permitir español e inglés como mínimo en la UI.
- [ ] P1 Separar idioma de interfaz, idioma base e idioma objetivo.
- [ ] P1 Formatear fechas, números y zonas horarias según usuario.
- [ ] P1 Soportar idiomas con escritura no latina.
- [ ] P1 Soportar dirección RTL para idiomas que lo requieran.
- [ ] P2 Añadir copy de accesibilidad para modo estudio, audio, dictado y pronunciación.

## 15. PWA, móvil y uso offline

- [ ] P1 Añadir manifest de app instalable.
- [ ] P1 Añadir iconos, nombre corto, color de tema y pantalla inicial.
- [ ] P1 Añadir modo responsive excelente en móvil.
- [ ] P1 Añadir repaso offline para tarjetas ya sincronizadas.
- [ ] P1 Añadir cola local de respuestas cuando no haya conexión.
- [ ] P1 Sincronizar respuestas pendientes al volver la conexión.
- [ ] P1 Mostrar estado de conexión y conflictos.
- [ ] P2 Añadir recordatorios push opcionales.
- [ ] P2 Añadir widgets o accesos rápidos a repaso diario si el ecosistema lo permite.
- [ ] P2 Añadir instalación guiada en móvil y escritorio.

## 16. Notificaciones, hábitos y retención

- [ ] P1 Añadir recordatorios diarios configurables.
- [ ] P1 Añadir recordatorios por tarjetas vencidas.
- [ ] P1 Añadir resumen semanal por email opcional.
- [ ] P1 Añadir meta diaria y semanal.
- [ ] P1 Añadir rachas sin convertirlas en castigo.
- [ ] P1 Añadir días de descanso.
- [ ] P1 Añadir recuperación de racha limitada o simbólica.
- [ ] P1 Añadir recomendaciones suaves cuando el usuario acumule demasiadas tarjetas vencidas.
- [ ] P2 Añadir plan de estudio adaptativo para fechas objetivo.
- [ ] P2 Añadir nudges personalizados por patrón de uso.

## 17. Comunidad y contenido compartido

- [ ] P2 Permitir compartir una colección como enlace privado.
- [ ] P2 Permitir publicar mazos en una biblioteca pública.
- [ ] P2 Permitir copiar un mazo público al espacio personal.
- [ ] P2 Mantener la copia personal independiente del original salvo que el usuario acepte actualizaciones.
- [ ] P2 Añadir atribución de autor.
- [ ] P2 Añadir licencias o condiciones de uso para contenido público.
- [ ] P2 Añadir valoraciones y comentarios moderados.
- [ ] P2 Añadir reportes de contenido incorrecto, ofensivo o con copyright dudoso.
- [ ] P2 Añadir revisión editorial para mazos destacados.
- [ ] P2 Añadir perfiles de creadores.
- [ ] P3 Añadir colaboración en colecciones compartidas.
- [ ] P3 Añadir clases con profesor y estudiantes.
- [ ] P3 Añadir tareas asignadas por profesor.
- [ ] P3 Añadir seguimiento agregado para aula sin exponer respuestas innecesarias.

## 18. Diccionario personal y capa de referencia

- [ ] P1 Crear una página de detalle rica para cada entrada.
- [ ] P1 Mostrar traducciones, acepciones, ejemplos, tarjetas asociadas, historial de fallos y próximas revisiones.
- [ ] P1 Mostrar palabras relacionadas.
- [ ] P1 Mostrar advertencias de uso y registro.
- [ ] P1 Permitir comparar dos entradas similares.
- [ ] P1 Permitir marcar entradas favoritas.
- [ ] P1 Permitir imprimir o exportar una ficha de palabra.
- [ ] P2 Añadir fichas públicas de términos si se decide construir una capa abierta.
- [ ] P2 Añadir rutas SEO para mazos públicos, temas y fichas públicas.
- [ ] P2 Añadir glosarios temáticos curados.
- [ ] P3 Añadir API o feeds públicos para mazos y glosarios autorizados.

## 19. Importación, exportación e interoperabilidad

- [ ] P0 Mantener exportación JSON, pero limitada al usuario autenticado.
- [ ] P0 Añadir exportación completa de cuenta.
- [ ] P0 Añadir exportación por colección, etiqueta, idioma y rango de fechas.
- [ ] P1 Añadir importación CSV.
- [ ] P1 Añadir importación TSV.
- [ ] P1 Añadir importación compatible con estructuras tipo flashcards.
- [ ] P1 Añadir plantillas descargables de importación.
- [ ] P1 Añadir previsualización de columnas y mapeo manual.
- [ ] P1 Añadir informe detallado post importación.
- [ ] P1 Añadir deshacer última importación.
- [ ] P2 Añadir API de importación para usuarios avanzados.
- [ ] P2 Añadir webhooks o integraciones con herramientas externas si el producto evoluciona hacia plataforma.

## 20. API pública y ecosistema de desarrolladores

- [ ] P2 Diseñar una API pública solo cuando el modelo de permisos esté cerrado.
- [ ] P2 Documentar la API con una especificación formal.
- [ ] P2 Añadir tokens personales de API.
- [ ] P2 Añadir scopes de permisos: lectura, escritura, importación, exportación, estadísticas.
- [ ] P2 Añadir rate limits por usuario, token y endpoint.
- [ ] P2 Añadir logs de uso de API para el usuario.
- [ ] P2 Añadir revocación de tokens.
- [ ] P3 Añadir SDKs o ejemplos oficiales solo si hay demanda real.

## 21. Administración, moderación y soporte

- [ ] P0 Añadir panel interno de administración.
- [ ] P0 Añadir búsqueda de usuarios para soporte con mínimos datos necesarios.
- [ ] P0 Añadir bloqueo o suspensión de cuentas abusivas.
- [ ] P0 Añadir revisión de reportes de contenido público.
- [ ] P0 Añadir gestión de límites y cuotas.
- [ ] P1 Añadir trazabilidad de acciones administrativas.
- [ ] P1 Añadir centro de ayuda básico.
- [ ] P1 Añadir formulario de contacto o soporte.
- [ ] P1 Añadir gestión de incidencias de importación y datos corruptos.
- [ ] P2 Añadir herramientas editoriales para mazos destacados.
- [ ] P2 Añadir métricas agregadas de producto respetando privacidad.

## 22. Seguridad técnica

- [ ] P0 Aplicar autorización server-side en cada lectura y mutación.
- [ ] P0 Añadir protección CSRF donde proceda.
- [ ] P0 Añadir rate limiting en login, registro, importación, endpoints públicos y acciones costosas.
- [ ] P0 Añadir validación de entrada en servidor para todos los formularios y APIs.
- [ ] P0 Añadir límites de payload y número de registros por importación.
- [ ] P0 Eliminar exposición de mensajes técnicos al usuario final.
- [ ] P0 Añadir cabeceras de seguridad.
- [ ] P0 Añadir CSP adecuada.
- [ ] P0 Revisar dependencias externas de frontend, especialmente recursos cargados desde CDN.
- [ ] P0 Añadir política de cookies.
- [ ] P0 Añadir controles contra enumeración de usuarios en login y recuperación.
- [ ] P0 Añadir logs de seguridad sin datos sensibles.
- [ ] P1 Añadir detección de abuso en importaciones, generación automática y API.
- [ ] P1 Añadir revisión de permisos de objetos para evitar IDOR.
- [ ] P1 Añadir escaneo de dependencias en CI.
- [ ] P1 Añadir gestión de secretos por entorno.
- [ ] P2 Añadir pruebas de seguridad automatizadas de rutas críticas.
- [ ] P2 Añadir proceso de respuesta a incidentes.

## 23. Privacidad, derechos del usuario y cumplimiento

- [ ] P0 Redactar política de privacidad clara.
- [ ] P0 Redactar términos de uso claros.
- [ ] P0 Añadir consentimiento de comunicaciones no esenciales.
- [ ] P0 Añadir preferencias de privacidad.
- [ ] P0 Añadir descarga de datos personales.
- [ ] P0 Añadir eliminación de cuenta y datos.
- [ ] P0 Añadir rectificación de datos de perfil.
- [ ] P0 Añadir mínima recogida de datos: solo lo necesario para que el producto funcione.
- [ ] P0 Definir retención de logs y backups.
- [ ] P1 Añadir pantalla de actividad y sesiones del usuario.
- [ ] P1 Añadir control de visibilidad para perfiles y mazos.
- [ ] P1 Añadir separación clara entre contenido privado y público.
- [ ] P2 Añadir registro interno de consentimientos relevantes.

## 24. Monetización y planes

- [ ] P2 Definir plan gratuito útil y honesto.
- [ ] P2 Definir límites del plan gratuito: palabras, mazos, importaciones, enriquecimiento automático, audio o API.
- [ ] P2 Definir plan premium individual.
- [ ] P2 Definir plan para profesores o academias.
- [ ] P2 Añadir checkout, portal de cliente y gestión de facturación si se monetiza.
- [ ] P2 Añadir límites de uso visibles antes de bloquear al usuario.
- [ ] P2 Añadir sistema de créditos para funciones costosas si se usan.
- [ ] P2 Añadir pantalla de plan y uso actual.
- [ ] P3 Añadir afiliación o ingresos para creadores de mazos si hay biblioteca pública.

## 25. Métricas de producto y analítica

- [ ] P1 Definir métricas internas: activación, retención, repasos por usuario, palabras añadidas, tarjetas vencidas completadas, importaciones correctas, sesiones abandonadas.
- [ ] P1 Añadir eventos de producto con privacidad por diseño.
- [ ] P1 Medir embudo de onboarding.
- [ ] P1 Medir fricción en importación.
- [ ] P1 Medir abandono durante sesiones de repaso.
- [ ] P1 Medir uso de funciones de enriquecimiento.
- [ ] P1 Crear dashboard interno de salud del producto.
- [ ] P2 Añadir experimentación controlada para cambios de onboarding, práctica y retención.
- [ ] P2 Añadir métricas de calidad de aprendizaje, no solo actividad.

## 26. Testing y calidad

- [ ] P0 Mantener tests unitarios existentes.
- [ ] P0 Añadir tests unitarios para normalización multiidioma.
- [ ] P0 Añadir tests de dominio para autorización y aislamiento de usuario.
- [ ] P0 Añadir tests de integración contra base de datos de prueba.
- [ ] P0 Añadir tests para importación CSV, JSON y duplicados.
- [ ] P0 Añadir tests para borrado de cuenta, exportación y permisos.
- [ ] P0 Añadir tests para motor de repetición espaciada.
- [ ] P0 Añadir E2E para registro, login, alta de palabra, repaso, importación, exportación y eliminación.
- [ ] P0 Añadir CI con test, build, lint y migraciones.
- [ ] P0 Añadir checklist manual de QA por release.
- [ ] P1 Añadir tests de accesibilidad automatizados.
- [ ] P1 Añadir tests de rendimiento en bibliotecas grandes.
- [ ] P1 Añadir tests de concurrencia en importaciones y repasos.
- [ ] P2 Añadir pruebas de carga para endpoints críticos.
- [ ] P2 Añadir pruebas de recuperación ante fallo en trabajos asíncronos.

## 27. Observabilidad y operación

- [ ] P0 Añadir logging estructurado.
- [ ] P0 Añadir captura de errores de servidor y cliente.
- [ ] P0 Añadir métricas básicas de latencia, errores, jobs, colas e importaciones.
- [ ] P0 Añadir health check.
- [ ] P0 Añadir documentación de despliegue real de producción.
- [ ] P0 Añadir migraciones reproducibles por entorno.
- [ ] P0 Añadir backups verificados.
- [ ] P1 Añadir alertas para errores de login, importaciones fallidas, saturación de colas y errores 5xx.
- [ ] P1 Añadir trazas para acciones críticas.
- [ ] P1 Añadir panel interno de estado operativo.
- [ ] P2 Añadir estrategia multi-región solo si el uso lo justifica.

## 28. Contenido, onboarding y posicionamiento

- [ ] P0 Definir propuesta de valor en una frase.
- [ ] P0 Rediseñar landing pública para usuarios no autenticados.
- [ ] P0 Crear onboarding con primera palabra, primer mazo y primer repaso completado.
- [ ] P0 Añadir datos demo sin mezclar con datos reales del usuario.
- [ ] P1 Añadir plantillas de inicio por objetivo: viajar, entrevista, examen, leer libros, conversación.
- [ ] P1 Añadir contenido curado inicial por niveles.
- [ ] P1 Añadir guía integrada de cómo crear buenas tarjetas.
- [ ] P1 Añadir consejos de aprendizaje contextual dentro del producto.
- [ ] P1 Añadir empty states útiles en cada pantalla.
- [ ] P2 Añadir blog o guías públicas sobre vocabulario, memoria y aprendizaje.
- [ ] P2 Añadir páginas públicas SEO de mazos destacados y temas.

## 29. Limpieza de deuda actual específica

- [ ] P0 Sustituir `englishWord` como concepto de producto por un término neutral de idioma objetivo.
- [ ] P0 Evitar que `Language` y `Tag` sean globales cuando sean personales.
- [ ] P0 Eliminar exportación global de vocabulario.
- [ ] P0 Cambiar finalización de quiz por GET a una mutación segura.
- [ ] P0 Sustituir flash messages en query string para mensajes sensibles o demasiado largos.
- [ ] P0 Evitar mostrar `error.message` técnico en página de error global.
- [ ] P0 Revisar la carga de Font Awesome desde CDN y decidir si se autohospeda, se sustituye o se protege con CSP/SRI.
- [ ] P0 Revisar paginación y búsqueda para no cargar todo el vocabulario en memoria cuando el volumen crezca.
- [ ] P0 Revisar `sort(() => Math.random() - 0.5)` del quiz por un barajado más sólido.
- [ ] P0 Revisar importaciones grandes para que no bloqueen la petición principal.
- [ ] P0 Revisar el modelo de progreso actual porque mezcla intentos de palabra con aprendizaje real de tarjetas.
- [ ] P0 Actualizar todas las guías de `Guides/` cuando cambie el comportamiento real.

## 30. Hitos de entrega sugeridos

- [ ] Hito 1 Convertir la app personal en app privada multiusuario segura.
- [ ] Hito 2 Rediseñar vocabulario como dominio léxico multiidioma.
- [ ] Hito 3 Sustituir quiz básico por motor de tarjetas y repetición espaciada.
- [ ] Hito 4 Rediseñar biblioteca, dashboard y detalle de palabra.
- [ ] Hito 5 Añadir importación/exportación avanzada y captura rápida.
- [ ] Hito 6 Añadir enriquecimiento inteligente y audio.
- [ ] Hito 7 Añadir PWA, móvil, offline y notificaciones.
- [ ] Hito 8 Añadir comunidad, mazos públicos y moderación.
- [ ] Hito 9 Añadir API pública, integraciones y monetización si el producto lo justifica.
- [ ] Hito 10 Cerrar accesibilidad, seguridad, privacidad, QA, observabilidad y despliegue de producción.
