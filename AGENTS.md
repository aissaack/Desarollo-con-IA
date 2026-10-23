# AGENTS.md

App web estática "Diario de Estudio": HTML, CSS y JS puros. Sin frameworks, dependencias, build, servidor ni tests automatizados.

## Ejecutar y verificar

- Abrir `index.html` con doble clic (funciona en `file://` en Chrome, Edge y Firefox).
- Comprobación rápida de sintaxis: `node --check app.js`.
- No hay lint, typecheck ni suite de tests. Verifica a mano: guardar una sesión, recargar, y probar rachas con fechas pasadas.
- `README.md` está desactualizado (dice que falta definir el stack); este archivo manda.

## Estructura

- `index.html`: estructura y textos de interfaz, todos en español.
- `styles.css`: todos los estilos; diseño responsive de una columna, sin media queries (todo fluido).
- `app.js`: toda la lógica, sin módulos. Mismos nombres y comentarios en español.
- Solo deben existir estos tres archivos de aplicación; no añadir frameworks, librerías ni pasos de compilación.

## Reglas de fechas (críticas)

- Usar siempre fecha local del usuario; nunca `toISOString()` ni UTC para calcular días.
- Las fechas se guardan como `"YYYY-MM-DD"` (valor del `<input type="date">` o `fechaLocalISO()`).
- Para sumar/restar días usar `sumarDias()`, que construye `new Date(año, mes - 1, día ± n)`; así funcionan cambios de mes, año y horario de verano.
- Para mostrar fechas, construir la fecha con componentes locales y `toLocaleDateString("es-ES", ...)`; parsear `"YYYY-MM-DD"` con `new Date(string)` la interpreta como UTC y desplaza el día.

## Racha

- Un día cuenta si tiene al menos una sesión.
- La racha termina hoy; si hoy no hay sesión pero ayer sí, empieza en ayer (sigue viva hasta acabar el día).
- Si no hay sesión ni hoy ni ayer, la racha es 0. Contar hacia atrás mientras exista el día en el `Set`.

## Persistencia

- `localStorage`, clave `diarioDeEstudio.sesiones`.
- Array de objetos `{ fecha, tema, minutos }` (`minutos` numérico entero > 0).
- Lectura y escritura envueltas en `try/catch`; la app debe seguir funcionando en memoria si `localStorage` falla.
- `form.reset()` vacía el input de fecha: tras guardar hay que volver a poner `fechaLocalISO()`.

## Interfaz

- Lista de sesiones de más reciente a más antigua; mismo día: la añadida después va primero.
- Usar `textContent`/`createElement` para datos del usuario (nunca `innerHTML` con tema).
- No añadir funciones no solicitadas (borrar/editar sesiones, filtros, estadísticas) salvo petición explícita.

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

- Siempre: actualizar `MEMORY.md` al terminar cada tarea.
