# Guía 2: Visión de producto, explicación de ideas y criterios de cierre

## 1. Diagnóstico del repositorio actual

Más Palabras ya tiene una base razonablemente ordenada para una aplicación personal: usa Next.js App Router, TypeScript, Tailwind, Prisma, SQLite, server actions, servicios de dominio en `lib/`, documentación interna en `Guides/` y una pequeña suite de tests unitarios. Hoy permite crear palabras, asociarlas a idioma y etiqueta, verlas en una biblioteca, editarlas, borrarlas, importarlas, exportarlas y practicarlas con un quiz adaptativo básico.

El problema no es que falten botones. El problema es que el modelo actual presupone uso personal y datos globales. Para convertirlo en una aplicación pública, hay que cambiar la naturaleza del producto: de registro privado de palabras a sistema personal de adquisición de vocabulario.

Los principales límites actuales son estos:

- No hay usuarios, autenticación ni autorización.
- Las palabras, idiomas y etiquetas no pertenecen a nadie.
- La exportación descarga todo el vocabulario existente.
- Hay una mutación mediante GET para terminar el quiz.
- El campo conceptual `englishWord` limita el producto a una mentalidad inglés a español.
- La repetición se basa en contadores simples, no en tarjetas con próxima revisión.
- El progreso vive en la palabra, no en eventos de aprendizaje ni tarjetas independientes.
- La importación es útil, pero todavía no es una experiencia de migración seria.
- La UI tiene una dirección visual agradable, pero necesita sistema, jerarquía y una experiencia móvil más fuerte.
- La seguridad, privacidad, cumplimiento, observabilidad y operación no están listas para exposición pública.

La ampliación debe hacerse desde la base, no por acumulación de funcionalidades superficiales.

## 2. Idea general del producto

La app debe convertirse en un diccionario personal vivo con motor de memoria. El usuario no solo guarda palabras: captura vocabulario real, lo organiza, lo entiende, lo practica en varios formatos, ve su evolución y conserva la propiedad de sus datos.

La propuesta de valor debe ser algo parecido a esto:

Más Palabras es tu sistema visual de vocabulario: guarda cualquier palabra o expresión que encuentres, enriquécela con contexto, organízala en mazos inteligentes y repásala justo cuando tu memoria lo necesita.

El producto debe apoyarse en cinco pilares:

1. Captura rápida: guardar vocabulario desde formulario, importación, texto, web, móvil o contenido externo.
2. Comprensión: añadir traducciones, acepciones, ejemplos, matices, pronunciación, registro y contexto.
3. Memoria: transformar entradas en tarjetas y programar repasos espaciados.
4. Visualización: mostrar el vocabulario como biblioteca, mapa, progreso, calendario y red semántica.
5. Propiedad: datos privados por defecto, exportables, eliminables y compartibles solo por decisión del usuario.

Si estos pilares quedan bien resueltos, la app puede competir por calidad de experiencia, no por cantidad de juegos o ruido visual.

## 3. Principios de producto

### 3.1 Primero aprendizaje, después gamificación

La app debe incentivar constancia, pero no debe caer en métricas vacías. Las rachas, medallas y retos sirven si mejoran la vuelta diaria y la calidad del repaso. Si distraen, sobran.

Se considerará listo cuando:

- El usuario entienda cada día qué tiene que repasar y por qué.
- Las recompensas no oculten el estado real de aprendizaje.
- Las métricas principales sean retención, tarjetas vencidas completadas, errores resueltos y vocabulario activo, no solo tiempo dentro de la app.

### 3.2 Vocabulario contextual, no listas muertas

Una palabra aislada se olvida o se usa mal. Cada entrada debe tender a tener contexto: ejemplos, fuente, registro, colocaciones, acepcines y notas de uso.

Se considerará listo cuando:

- La pantalla de detalle de una palabra explique cómo se usa, no solo qué significa.
- Las tarjetas puedan generarse desde ejemplos reales.
- El usuario pueda distinguir traducciones parecidas y usos concretos.

### 3.3 Multiidioma real

El repositorio actual habla de `englishWord`, pero una aplicación de referencia no puede estar conceptualmente atada al inglés. Debe distinguir idioma base, idioma objetivo, término, traducción y dirección de práctica.

Se considerará listo cuando:

- Un usuario pueda estudiar japonés desde español, francés desde inglés o alemán desde catalán sin campos artificiales.
- La UI deje de presuponer que la palabra original es inglesa.
- Los filtros, importaciones, tarjetas y estadísticas funcionen por pares de idiomas.

### 3.4 Confianza y propiedad de datos

El usuario va a meter conocimiento personal: palabras de trabajo, estudios, viajes, lecturas, posibles datos sensibles en ejemplos o notas. El producto debe tratar esos datos con seriedad.

Se considerará listo cuando:

- Todo dato privado esté aislado por usuario.
- La exportación y eliminación de cuenta sean completas y comprensibles.
- La visibilidad pública sea opt in, nunca accidental.
- La app pueda explicar con claridad qué datos guarda y para qué.

### 3.5 Belleza funcional

La app debe ser muy visual, pero lo visual debe ayudar a decidir, recordar y navegar. Tarjetas, mapas, heatmaps y colores deben reducir carga cognitiva.

Se considerará listo cuando:

- El dashboard indique en menos de diez segundos qué hacer hoy.
- La biblioteca sea agradable con 20 palabras y siga siendo útil con 20.000.
- El modo estudio elimine distracciones y centre la atención.

## 4. Identidad, registro y perfiles

La autenticación es la frontera entre app personal y producto público. No basta con añadir login; hay que convertir todo el dominio a multiusuario. El usuario debe tener una cuenta, sesiones seguras, preferencias y un perfil de aprendizaje.

Qué buscamos:

- Que cada usuario tenga su vocabulario, sus mazos, sus repasos y sus estadísticas.
- Que el inicio sea fácil, pero no débil.
- Que el onboarding capture lo mínimo necesario para personalizar la experiencia.

Ideas clave:

- Registro e inicio con email.
- Recuperación de acceso.
- Login social si reduce fricción.
- Passkeys como opción moderna.
- Perfil con idioma de interfaz, idioma nativo, idiomas objetivo, nivel, objetivos y recordatorios.
- Gestión de sesiones y dispositivos.
- Eliminación de cuenta desde ajustes.

Se considerará listo cuando:

- Un usuario nuevo pueda registrarse, iniciar sesión, cerrar sesión y recuperar acceso sin intervención manual.
- Ninguna ruta privada sea accesible sin autenticación.
- Al iniciar sesión, el usuario vea solo sus datos.
- El onboarding termine con una primera acción útil: añadir palabra, importar mazo o empezar un mazo demo.
- La cuenta pueda eliminarse de forma clara y verificable.

## 5. Aislamiento de datos y autorización

Este es el cambio más crítico. Todas las entidades que hoy son globales deben quedar bajo propiedad de un usuario o de un espacio compartido. La autorización debe vivir en el servidor y en los servicios de dominio, no solo en la UI.

Qué buscamos:

- Que no exista fuga transversal de datos.
- Que los IDs no permitan acceder a recursos ajenos.
- Que la exportación, importación y borrado funcionen por usuario.

Ideas clave:

- Propietario en palabras, tarjetas, colecciones, etiquetas, idiomas personales, sesiones, estadísticas e importaciones.
- Permisos explícitos para espacios compartidos.
- Reglas de lectura y escritura centralizadas.
- Exportación personal, nunca global.
- Borrado de cuenta con cascada controlada.

Se considerará listo cuando:

- Dos usuarios puedan tener la misma palabra en el mismo idioma sin conflicto.
- Un usuario no pueda consultar, modificar, borrar ni exportar recursos de otro usuario aunque conozca el ID.
- Las pruebas cubran intentos de acceso cruzado.
- Las rutas antiguas peligrosas hayan sido reemplazadas o cerradas.

## 6. Rediseño del modelo léxico

La unidad principal no debe ser una fila simple con palabra, traducción y explicación. Debe ser una entrada léxica capaz de contener acepciones, ejemplos, notas, pronunciación, etiquetas y tarjetas derivadas.

Qué buscamos:

- Que una entrada pueda representar una palabra simple, una expresión, un phrasal verb, una colocación o una frase útil.
- Que el usuario pueda aprender uso real, no solo equivalencias.
- Que el sistema sea flexible por idioma.

Ideas clave:

- Entrada léxica neutral: término, idioma objetivo, idioma base y metadatos.
- Acepciones y traducciones múltiples.
- Ejemplos por acepción.
- Notas personales.
- Parte de la oración.
- Nivel CEFR o nivel personalizado.
- Registro y dominio temático.
- Colocaciones y palabras relacionadas.
- Pronunciación, audio e IPA cuando proceda.

Se considerará listo cuando:

- Una palabra con varias acepciones se pueda representar sin duplicados torpes.
- Una expresión pueda estudiarse igual que una palabra simple.
- El detalle de entrada permita entender significado, uso, contexto y estado de aprendizaje.
- La importación pueda crear entradas simples sin obligar a rellenar todo.

## 7. Etiquetas, colecciones y mazos

Las etiquetas actuales son útiles, pero insuficientes. Una app de referencia necesita separar etiquetas libres, colecciones de estudio, mazos y vistas inteligentes.

Qué buscamos:

- Que el usuario organice vocabulario de forma personal.
- Que pueda estudiar por objetivo, tema, nivel, examen, viaje o proyecto.
- Que el sistema proponga agrupaciones útiles sin quitar control.

Ideas clave:

- Etiquetas múltiples por entrada.
- Colecciones o mazos con portada, descripción, idioma, nivel y objetivo.
- Mazos inteligentes basados en reglas.
- Filtros guardados.
- Colores e iconos.
- Plantillas de mazos.
- Biblioteca pública en fases avanzadas.

Se considerará listo cuando:

- Una palabra pueda pertenecer a varias colecciones.
- El usuario pueda crear un mazo de estudio en menos de un minuto.
- El usuario pueda filtrar y repasar por cualquier combinación relevante.
- Las etiquetas no sustituyan indebidamente a niveles, idiomas o estados.

## 8. Captura e importación

La app debe hacer muy fácil meter vocabulario. La captura es una ventaja competitiva: si guardar una palabra cuesta demasiado, el producto muere.

Qué buscamos:

- Alta rápida para momentos de lectura o conversación.
- Alta completa cuando el usuario quiere precisión.
- Importación robusta para traer vocabulario existente.
- Revisión antes de contaminar la biblioteca.

Ideas clave:

- Formulario rápido con término y traducción.
- Formulario completo con acepciones, ejemplos, pronunciación y notas.
- Creación inline de idioma, etiqueta y colección.
- Duplicados detectados antes de guardar.
- Importación JSON, CSV, TSV y pegado masivo.
- Mapeo manual de columnas.
- Previsualización de importación.
- Informe de errores por fila.
- Deshacer importación.
- Extracción desde texto largo, subtítulos y web en fases avanzadas.

Se considerará listo cuando:

- El usuario pueda añadir una palabra desde móvil en menos de diez segundos.
- Una importación grande no bloquee la interfaz ni deje datos a medias.
- El usuario pueda revisar duplicados y conflictos antes de confirmar.
- Toda importación deje un resumen comprensible y recuperable.

## 9. Enriquecimiento inteligente

El producto puede diferenciarse mucho si ayuda a convertir palabras pobres en buenas tarjetas. La IA o los servicios externos no deben escribir sobre los datos del usuario sin revisión; deben sugerir.

Qué buscamos:

- Mejorar calidad de entradas con ejemplos, matices y tarjetas.
- Ahorrar tiempo sin perder control.
- Mantener trazabilidad de contenido sugerido.

Ideas clave:

- Ejemplos naturales graduados por nivel.
- Traducciones alternativas.
- Explicaciones breves adaptadas al usuario.
- Colocaciones, sinónimos y antónimos.
- Falsos amigos y confusiones frecuentes.
- Mnemotecnias opcionales.
- Generación de tarjetas de cloze.
- Audio para término y ejemplos.
- Imágenes o asociaciones visuales.
- Revisión manual de cada sugerencia.

Se considerará listo cuando:

- Las sugerencias nunca se guarden sin consentimiento explícito.
- El usuario pueda editar cada sugerencia antes de aceptarla.
- El sistema marque qué contenido fue generado o sugerido automáticamente.
- La calidad mínima sea suficientemente alta como para ahorrar trabajo real.

## 10. Motor de aprendizaje y repetición espaciada

El quiz actual suma intentos y aciertos por palabra. Eso sirve para una demo, pero no para una aplicación seria de memoria. Hay que separar entrada léxica de tarjetas. Una entrada puede producir varias tarjetas con estados distintos: reconocer, producir, escuchar, completar huecos o usar en contexto.

Qué buscamos:

- Repasar cada tarjeta en el momento adecuado.
- Medir memoria de forma granular.
- Evitar que el usuario acumule una deuda imposible.

Ideas clave:

- Tarjetas derivadas de entradas.
- Estado por tarjeta: nueva, aprendiendo, repaso, dominada, suspendida, problemática.
- Eventos de revisión.
- Próxima fecha de repaso.
- Calificación de respuesta: otra vez, difícil, bien, fácil.
- Límite diario de nuevas tarjetas y repasos.
- Priorización de vencidas.
- Detección de leeches o tarjetas mal diseñadas.
- Algoritmo de repetición espaciada configurable.

Se considerará listo cuando:

- Cada tarjeta tenga historial y próxima revisión propia.
- El dashboard pueda decir qué toca hoy con base en fechas reales de repaso.
- Un fallo afecte a la tarjeta concreta, no de forma grosera a toda la entrada.
- El usuario pueda mantener una rutina diaria sin que el sistema le sature.

## 11. Modos de práctica

Una referencia de vocabulario no puede tener un solo quiz. Debe entrenar reconocimiento, recuerdo activo, escritura, escucha, contexto y producción.

Qué buscamos:

- Que practicar no sea monótono.
- Que cada modo tenga sentido pedagógico.
- Que el usuario pueda elegir intensidad y habilidad.

Ideas clave:

- Flashcards.
- Escritura exacta con tolerancia.
- Elección múltiple.
- Cloze en frases.
- Escucha y dictado.
- Pronunciación.
- Emparejar columnas.
- Ordenar frases.
- Conversación corta usando palabras objetivo.
- Repaso de errores.
- Sesiones de 3, 5, 10 y 20 minutos.

Se considerará listo cuando:

- Cada modo cree eventos de revisión coherentes.
- El usuario pueda iniciar una sesión en un clic desde el dashboard.
- La sesión termine con resumen útil.
- Las tarjetas problemáticas reaparezcan de forma razonable.

## 12. Corrección y feedback

La corrección binaria es pobre. El usuario necesita saber si ha fallado por errata, por significado, por registro, por gramática o por una traducción alternativa no registrada.

Qué buscamos:

- Corregir sin frustrar.
- Aceptar respuestas legítimas.
- Convertir fallos en mejora de tarjeta.

Ideas clave:

- Respuestas alternativas.
- Tolerancia a mayúsculas, acentos y pequeñas erratas cuando aplique.
- Marcado manual como correcta.
- Feedback de respuesta correcta.
- Edición inmediata de la tarjeta tras un fallo.
- Explicación de matices.
- Detección de confusiones frecuentes.

Se considerará listo cuando:

- El usuario pueda añadir una respuesta alternativa desde el resultado.
- La app no penalice variantes válidas ya registradas.
- El feedback indique una acción posible: repasar, editar, añadir ejemplo, suspender o aceptar variante.

## 13. Dashboard visual

El dashboard debe dejar de ser solo una portada con estadísticas. Debe ser el centro operativo del aprendizaje diario.

Qué buscamos:

- Que el usuario sepa qué hacer hoy.
- Que vea progreso real sin maquillaje.
- Que detecte problemas antes de abandonar.

Ideas clave:

- Repasos vencidos hoy.
- Nuevas tarjetas disponibles.
- Carga diaria.
- Racha y calendario.
- Palabras difíciles.
- Progreso por idioma, nivel, tema y colección.
- Mapa de vocabulario.
- Recomendaciones del día.
- Curva de retención estimada.

Se considerará listo cuando:

- El usuario pueda empezar el repaso diario desde el primer bloque.
- Las estadísticas sean accionables.
- El dashboard funcione igual de bien para principiantes y usuarios con miles de entradas.

## 14. Biblioteca y detalle de palabra

La biblioteca debe ser el lugar donde el usuario gestiona su conocimiento. La tabla actual es un buen punto de partida, pero necesita vistas, filtros, acciones masivas y detalle rico.

Qué buscamos:

- Gestión rápida en volumen.
- Consulta cómoda tipo diccionario personal.
- Limpieza de datos y mejora continua.

Ideas clave:

- Vista tabla.
- Vista tarjetas.
- Vista compacta.
- Búsqueda por término, traducción, ejemplo, nota y etiqueta.
- Filtros combinables y guardados.
- Orden por vencimiento, dificultad y fecha.
- Edición inline.
- Acciones masivas.
- Página de detalle con acepciones, ejemplos, tarjetas y estadísticas.

Se considerará listo cuando:

- El usuario pueda encontrar cualquier entrada aunque recuerde solo parte del ejemplo o traducción.
- Las acciones masivas sean seguras y reversibles cuando sea razonable.
- El detalle de palabra sustituya a una ficha de estudio completa.

## 15. Diseño visual y experiencia móvil

La app ya tiene una estética suave con tarjetas, gradientes y colores primarios. Conviene conservar esa dirección, pero convertirla en sistema. La referencia visual no debe ser un panel SaaS genérico; debe sentirse como una herramienta de aprendizaje personal.

Qué buscamos:

- Claridad, calma y foco.
- Uso excelente en móvil.
- Visualizaciones que ayuden a recordar.

Ideas clave:

- Sistema de componentes consistente.
- Navegación móvil fuerte.
- Estados vacíos útiles.
- Microinteracciones sobrias.
- Modo estudio sin distracciones.
- Modo oscuro.
- Tarjetas visuales por idioma, tema o nivel.
- Heatmap, mapas y constelaciones semánticas.

Se considerará listo cuando:

- La app se use cómodamente con una mano en móvil.
- Las sesiones de repaso no tengan ruido visual.
- Las pantallas principales parezcan parte de la misma familia visual.
- La biblioteca no se rompa con mucho contenido.

## 16. Accesibilidad e internacionalización

Una aplicación pública debe ser accesible e internacionalizable desde el diseño. No es un añadido final. Además, en una app de idiomas hay que distinguir idioma de interfaz, idioma base e idioma objetivo.

Qué buscamos:

- Acceso por teclado y lector de pantalla.
- Buen contraste y foco visible.
- Soporte de varios idiomas de interfaz.
- Soporte de escrituras no latinas.

Ideas clave:

- Etiquetas accesibles.
- Estados no dependientes solo del color.
- `prefers-reduced-motion`.
- UI en español e inglés como mínimo.
- Formatos locales de fecha y hora.
- Soporte RTL si se añaden idiomas que lo requieran.

Se considerará listo cuando:

- Los flujos de registro, alta, biblioteca, repaso, importación y ajustes se puedan completar con teclado.
- Los iconos interactivos tengan nombre accesible.
- La interfaz pueda cambiar de idioma sin alterar los datos de aprendizaje.

## 17. PWA, offline y notificaciones

El vocabulario se repasa en huecos: metro, cama, paseo, espera. La app debe funcionar bien en móvil y tener capacidades de instalación y repaso offline.

Qué buscamos:

- Reducir fricción de vuelta diaria.
- Permitir estudiar sin conexión en sesiones preparadas.
- Sincronizar con seguridad al recuperar conexión.

Ideas clave:

- Manifest instalable.
- Iconos y nombre corto.
- Repaso offline de tarjetas sincronizadas.
- Cola local de respuestas.
- Resolución de conflictos.
- Recordatorios push opcionales.

Se considerará listo cuando:

- El usuario pueda instalar la app en móvil o escritorio.
- Una sesión offline completada se sincronice después sin duplicar intentos.
- El usuario controle si quiere notificaciones y cuándo.

## 18. Hábitos y retención

El producto debe ayudar a volver, pero sin explotar ansiedad. El aprendizaje requiere continuidad. La app debe facilitar una rutina sostenible.

Qué buscamos:

- Constancia sin culpa.
- Metas realistas.
- Recuperación cuando el usuario acumula retraso.

Ideas clave:

- Recordatorios configurables.
- Metas diarias y semanales.
- Rachas con días de descanso.
- Recomendaciones si hay demasiadas tarjetas vencidas.
- Planes por fecha objetivo.
- Resúmenes semanales.

Se considerará listo cuando:

- El usuario pueda ajustar su carga diaria.
- El sistema proponga reducir deuda en vez de castigar abandono.
- Las notificaciones se puedan pausar y configurar claramente.

## 19. Comunidad y mazos públicos

La comunidad puede convertir el producto en referencia, pero solo si se modera bien. Mazos públicos, perfiles de creadores y colaboración aportan valor, pero también riesgos: contenido incorrecto, spam, copyright, abuso y ruido.

Qué buscamos:

- Compartir conocimiento sin contaminar datos personales.
- Crear una biblioteca pública útil y curada.
- Permitir que cada usuario copie y adapte contenido.

Ideas clave:

- Enlaces privados a colecciones.
- Mazos públicos con autor y licencia.
- Copia a espacio personal.
- Valoraciones y reportes.
- Moderación.
- Mazos destacados.
- Clases y profesores en fases avanzadas.

Se considerará listo cuando:

- Publicar sea una decisión explícita.
- Copiar un mazo no dé permisos sobre el original.
- El contenido reportado pueda revisarse y retirarse.
- Los mazos públicos tengan señales de calidad.

## 20. API e integraciones

Una API puede convertir Más Palabras en plataforma, pero solo después de cerrar autenticación, autorización y modelo de datos. Antes sería una fuente de vulnerabilidades.

Qué buscamos:

- Permitir integraciones sin comprometer privacidad.
- Documentar capacidades de forma estable.
- Dar control al usuario sobre tokens y permisos.

Ideas clave:

- API documentada formalmente.
- Tokens personales.
- Scopes.
- Rate limits.
- Revocación.
- Logs de uso.
- Importación y exportación por API.

Se considerará listo cuando:

- Cada token tenga permisos mínimos.
- El usuario pueda ver y revocar tokens.
- La API nunca exponga datos privados sin autorización.
- La documentación permita usar la API sin leer el código fuente.

## 21. Administración, soporte y moderación

Una app pública necesita herramientas internas. Sin ellas, cada incidencia obliga a tocar base de datos o código.

Qué buscamos:

- Resolver problemas de usuarios sin improvisar.
- Moderar contenido público.
- Detectar abuso y errores operativos.

Ideas clave:

- Panel de administración.
- Búsqueda limitada de usuarios.
- Bloqueo y suspensión.
- Reportes de contenido.
- Auditoría de acciones administrativas.
- Centro de ayuda.
- Métricas agregadas de salud del producto.

Se considerará listo cuando:

- Un administrador pueda revisar reportes sin acceso excesivo a datos privados.
- Las acciones administrativas queden registradas.
- Soporte pueda diagnosticar importaciones fallidas, límites y errores sin pedir contraseñas ni datos innecesarios.

## 22. Seguridad

Las brechas actuales son normales en una app personal, pero inaceptables en producción pública. Hay que aplicar una defensa completa: autenticación, autorización, validación, rate limiting, cabeceras, CSP, logs, protección de rutas y gestión de secretos.

Qué buscamos:

- Reducir riesgo de fuga de datos.
- Evitar abuso de acciones costosas.
- Hacer que cada endpoint tenga límites y permisos.

Ideas clave:

- Autorización server-side.
- Protección contra CSRF donde proceda.
- Rate limiting.
- Validación con esquemas compartidos.
- CSP.
- Cabeceras de seguridad.
- Logs sin datos sensibles.
- Mensajes de error seguros.
- Gestión de secretos por entorno.
- Escaneo de dependencias.

Se considerará listo cuando:

- No haya endpoints públicos que expongan datos privados.
- Las pruebas cubran accesos no autorizados.
- Los errores técnicos no se muestren al usuario final.
- Los recursos externos de frontend estén controlados o justificados.
- Login, importación y API estén protegidos contra abuso básico.

## 23. Privacidad y cumplimiento

En Europa, una aplicación pública que trate cuentas y datos personales debe incorporar derechos del usuario desde el producto: información, acceso, rectificación, borrado, portabilidad, oposición y control de comunicaciones.

Qué buscamos:

- Privacidad comprensible.
- Datos mínimos.
- Portabilidad real.
- Eliminación verificable.

Ideas clave:

- Política de privacidad.
- Términos.
- Preferencias de privacidad.
- Exportación de datos.
- Eliminación de cuenta.
- Gestión de consentimiento para emails o notificaciones no esenciales.
- Retención de logs y backups definida.
- Visibilidad pública opt in.

Se considerará listo cuando:

- El usuario pueda descargar sus datos sin soporte.
- El usuario pueda borrar su cuenta desde ajustes.
- La app explique qué datos usa para aprendizaje, seguridad y producto.
- Los mazos públicos y perfiles públicos tengan controles de visibilidad claros.

## 24. Monetización

La monetización no debe aparecer antes de que el núcleo sea valioso. Pero conviene diseñar límites desde el principio para no romperlos luego.

Qué buscamos:

- Un plan gratuito que permita comprobar valor real.
- Planes de pago asociados a costes reales: enriquecimiento automático, audio, almacenamiento, API, clases o colaboración.
- Transparencia en límites.

Ideas clave:

- Freemium individual.
- Premium con más palabras, mazos, audio, IA, exportaciones o API.
- Plan profesor o academia.
- Créditos para funciones costosas.
- Pantalla de uso y límites.
- Facturación y portal de cliente.

Se considerará listo cuando:

- El usuario sepa qué incluye su plan antes de alcanzar un límite.
- El plan gratuito no sea una demo inútil.
- Las funciones costosas tengan límites medibles.
- Facturación y cancelación sean comprensibles.

## 25. Métricas de producto

No basta con contar usuarios. Hay que saber si aprenden y si vuelven porque la app les sirve.

Qué buscamos:

- Medir activación, retención y aprendizaje.
- Detectar fricción.
- Mejorar con datos agregados y respetuosos.

Ideas clave:

- Activación: primera palabra, primer mazo, primer repaso completado.
- Retención diaria y semanal.
- Tarjetas vencidas completadas.
- Importaciones correctas.
- Sesiones abandonadas.
- Palabras problemáticas resueltas.
- Uso de enriquecimiento.
- Embudo de onboarding.

Se considerará listo cuando:

- Exista un dashboard interno con métricas accionables.
- Los eventos no guarden contenido sensible innecesario.
- Las decisiones de producto puedan apoyarse en datos, no solo impresiones.

## 26. Testing, QA y fiabilidad

El repositorio tiene tests unitarios de base. Para una app pública hay que cubrir integración, E2E, autorización, importación, motor de repaso y accesibilidad.

Qué buscamos:

- Evitar regresiones en datos de aprendizaje.
- Probar flujos reales.
- Validar permisos y borrados.

Ideas clave:

- Unit tests de dominio.
- Tests de integración con base de datos de prueba.
- E2E de registro, login, alta, repaso, importación, exportación y eliminación.
- Tests de accesibilidad.
- Tests de rendimiento con bibliotecas grandes.
- CI con build, tests y migraciones.
- QA manual por release.

Se considerará listo cuando:

- Una release no pueda desplegarse si fallan tests críticos.
- Los permisos entre usuarios estén probados.
- El motor de repetición espaciada tenga tests deterministas.
- La importación y exportación estén cubiertas con casos de error.

## 27. Observabilidad y operación

Cuando la app esté pública, habrá errores reales. Hay que verlos, entenderlos y responder.

Qué buscamos:

- Detectar fallos antes de que escalen.
- Saber si una importación, job o despliegue falla.
- Restaurar datos si hay accidente.

Ideas clave:

- Logging estructurado.
- Captura de errores cliente y servidor.
- Métricas de latencia y errores.
- Health checks.
- Backups y pruebas de restauración.
- Alertas.
- Panel operativo.

Se considerará listo cuando:

- Existan alertas para errores 5xx, importaciones fallidas masivas, jobs atascados y problemas de base de datos.
- Los backups se hayan restaurado al menos en un entorno de prueba.
- Los logs permitan diagnosticar sin exponer contenido privado.

## 28. Landing, onboarding y contenido público

La landing no debe vender humo. Debe explicar una diferencia clara: vocabulario propio, visual, contextual y con memoria espaciada.

Qué buscamos:

- Que un visitante entienda el producto rápido.
- Que el registro desemboque en valor real.
- Que el contenido público ayude a adquirir usuarios sin degradar la app.

Ideas clave:

- Landing pública.
- Demo interactiva sin cuenta o con datos temporales.
- Onboarding con objetivo.
- Primer mazo recomendado.
- Guías sobre cómo crear buenas tarjetas.
- Mazos públicos SEO en fases avanzadas.
- Blog o recursos de aprendizaje si hay capacidad editorial.

Se considerará listo cuando:

- Un usuario nuevo complete primera acción de aprendizaje en la primera sesión.
- Los estados vacíos indiquen una acción concreta.
- La landing no prometa funciones inexistentes.

## 29. Deuda técnica actual que debe cerrarse

Hay varias piezas del repositorio actual que conviene corregir durante la transición.

### 29.1 `englishWord`

Debe desaparecer como concepto de producto. Aunque internamente pueda haber una migración gradual, la app debe hablar de término, idioma objetivo y traducción.

Se considerará listo cuando:

- La UI no diga ni presuponga que toda palabra original es inglesa.
- La base conceptual admita cualquier par de idiomas.

### 29.2 Exportación global

La ruta actual de exportación no puede sobrevivir tal cual en una app pública.

Se considerará listo cuando:

- Exportar descargue solo datos autorizados del usuario o espacio actual.
- Existan tests que intenten exportar datos ajenos.

### 29.3 GET con mutación

Terminar una sesión de quiz mediante GET es aceptable en una app local, pero no en una pública.

Se considerará listo cuando:

- Las mutaciones usen acciones o métodos adecuados.
- No haya crawlers, prefetches o enlaces capaces de modificar estado accidentalmente.

### 29.4 Paginación y búsqueda en memoria

El listado actual carga palabras y ordena en aplicación. Con miles de palabras por usuario y muchos usuarios, esto será un problema.

Se considerará listo cuando:

- La búsqueda, paginación y ordenación escalen con datos grandes.
- Existan índices y pruebas de rendimiento básicas.

### 29.5 Errores visibles

La página de error global muestra `error.message`. En producción eso puede filtrar detalles internos.

Se considerará listo cuando:

- Los usuarios vean mensajes seguros.
- Los detalles técnicos queden solo en logs protegidos.

### 29.6 Recursos externos

Font Awesome se carga desde CDN. En producción hay que decidir si se autohospeda, se sustituye o se protege correctamente.

Se considerará listo cuando:

- La política de seguridad de contenido contemple todos los recursos externos.
- No haya dependencias visuales externas sin control deliberado.

## 30. Producto final esperado

Una vez completada la checklist, Más Palabras debe sentirse como una herramienta seria, visual y de alta confianza para aprender vocabulario. No debe parecer un CRUD con quiz. Debe parecer un sistema personal de aprendizaje.

El resultado final debe permitir esto:

- Una persona se registra.
- Elige idioma base, idioma objetivo y meta.
- Añade o importa vocabulario en minutos.
- La app limpia duplicados y sugiere mejoras.
- Cada entrada puede tener contexto, ejemplos y tarjetas.
- El usuario repasa cada día lo que toca.
- El dashboard le muestra progreso real.
- La biblioteca le sirve como diccionario personal.
- Puede usarla desde móvil, incluso con conectividad limitada.
- Puede exportar o borrar sus datos.
- Puede compartir mazos si quiere.
- El sistema es seguro, accesible, observable y mantenible.

La señal de que la aplicación está a la altura no será que tenga muchas pantallas. Será que un usuario que aprende idiomas la quiera abrir a diario porque le reduce fricción, le da claridad y nota que recuerda mejor.

## 31. Criterio global de cierre

La checklist completa se considerará cerrada cuando se cumplan simultáneamente estas condiciones:

- Todas las funcionalidades P0 están implementadas, probadas y documentadas.
- Todas las funcionalidades P1 están implementadas o existe una justificación explícita de producto para posponer alguna sin romper la visión.
- Las funcionalidades P2 y P3 incluidas en el alcance final elegido están implementadas con los mismos criterios de calidad que P0.
- No quedan rutas públicas que filtren datos privados.
- No quedan mutaciones inseguras heredadas del uso personal.
- El modelo de datos es multiusuario y multiidioma.
- El motor de aprendizaje usa tarjetas, eventos y próxima revisión.
- El usuario puede exportar y eliminar sus datos.
- La app pasa tests unitarios, integración, E2E críticos, build y validación manual.
- La UI principal es usable en móvil y escritorio.
- La documentación de `Guides/` refleja el estado real.
- El despliegue de producción tiene backups, logs, errores capturados, métricas y alertas básicas.
- Existe una demo realista que muestre el valor del producto sin datos sensibles.

Si alguna de estas condiciones no se cumple, la aplicación puede ser útil, pero todavía no debe presentarse como producto público de referencia.
