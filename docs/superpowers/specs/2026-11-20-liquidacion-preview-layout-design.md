# Liquidación preview: metadata y totales compactos

## Contexto

La vista previa del wizard de liquidaciones muestra los datos del destinatario y el resumen de importes. En la iteración actual:

- El bloque de metadatos está en grilla con múltiples filas.
- El bloque de totales está apilado en tres líneas y alineado a la derecha.
- El campo “Número” se muestra como `(pendiente)`, pero el número de liquidación recién se genera en el backend al crearla.
- En la tabla “Viajes incluidos”, la celda de `Código` usa la clase `mono`, que la alinea a la derecha, mientras el encabezado `Código` queda a la izquierda.

`Distribuidora Norte` no muestra condición IVA porque el dato en DB es `null`; el `TestSeeder` no completa ese campo para ese cliente. No es un error de mapeo: otros clientes sí tienen `responsable_inscripto` o `monotributo`.

## Objetivos

- Quitar el campo “Número” de la vista previa: no tiene sentido mostrarlo antes de crear la liquidación.
- Mostrar los metadatos del destinatario en una sola fila.
- Mostrar Subtotal, IVA y Total general en una sola fila, aprovechando el ancho disponible.
- Hacer visible la ausencia de condición IVA con un texto explícito, sin modificar datos persistidos.
- Corregir el desalineamiento entre el encabezado y la celda de `Código` en la tabla de viajes.

## No objetivos

- No generar ni reservar un número de liquidación en la vista previa.
- No modificar migraciones, seeders ni datos de DB.
- No cambiar la tabla “Viajes incluidos” salvo la alineación de la columna `Código`.
- No reintroducir botones dentro del preview: `Editar`, `Guardar Borrador` y `Crear Liquidación` siguen en el footer del wizard.

## Diseño

### Metadatos

`LiquidacionPreview.jsx` renderiza una única franja horizontal con estos pares etiqueta/valor, en este orden:

1. `Tipo`
2. `Nombre legal`
3. `CUIT`
4. `Condición IVA`
5. `Fecha emisión`

Se elimina el item `Número` y el badge `(pendiente)` asociado. Si el destinatario no tiene `condicion_iva`, se muestra `Sin condición IVA`. La resolución del texto usa el mapa existente `CONDICION_IVA_LABELS` y un fallback explícito.

### Totales

El bloque de totales pasa a una card horizontal a lo ancho con tres celdas:

- `Subtotal`
- `IVA (21%)`
- `TOTAL GENERAL`

La celda de `TOTAL GENERAL` se destaca visualmente. Los importes siguen formateados con `Intl.NumberFormat('es-AR', ...)` y calculados con `computeTotals`, que ya convierte strings decimales a números mediante `toNumber`.

### Tabla de viajes

La celda de `Código` deja de usar la clase `mono` y hereda la tipografía de la tabla, quedando alineada a la izquierda como su encabezado. No se agrega ningún wrapper ni estilo nuevo para esa columna.

### CSS y responsive

- `.preview-meta`: `display: grid` con `grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))`; los pares etiqueta/valor mantienen etiqueta sobre valor.
- `.totals-grid`: `display: grid` con `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` y separadores entre celdas; `TOTAL GENERAL` con énfasis.
- En pantallas angostas, ambos bloques pueden hacer wrap para evitar cortes; en anchos normales deben verse en una sola línea.
- Se conservan las variables CSS definidas en `index.css`.
- Se retira el estilo `.pending-badge` de `index.css`, que queda sin consumidores al eliminar el badge `(pendiente)`.

## Archivos afectados

- `client/src/components/liquidacion/LiquidacionPreview.jsx`
- `client/src/index.css`

No se requieren cambios en backend, DB ni seeders.

## Verificación

- `npm run lint`
- `npm test`
- `npm run build`
- Comprobar que el preview ya no contiene “Número” ni `(pendiente)`.
- Comprobar que `Distribuidora Norte` muestra “Sin condición IVA”.
- Comprobar que metadatos y totales se ven en una sola fila en ancho normal.
- Comprobar que el código de viaje coincide visualmente con el encabezado `Código`.

## Criterios de aceptación

- El preview no muestra el número de liquidación antes de crearla.
- Los cinco metadatos acordados están en una sola fila en ancho normal.
- La ausencia de condición IVA se muestra como “Sin condición IVA”.
- Subtotal, IVA y Total general están en una sola fila, con el total destacado.
- La columna `Código` está alineada con su encabezado.
- No hay botones nuevos dentro del preview ni cambios en el footer del wizard.
- Lint, tests y build pasan sin errores.
