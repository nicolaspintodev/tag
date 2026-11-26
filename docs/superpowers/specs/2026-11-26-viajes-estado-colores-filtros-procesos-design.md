# Spec: colores de Estado y filtros de procesos en Viajes

## Contexto

La rama `fix/liquidaciones` ya tiene el trabajo de procesos y montos commiteado en `6f5866a`. El usuario pidió dos ajustes nuevos:

1. Volver a poner color en la columna `Estado` del grid de Viajes.
2. Reemplazar los checks sueltos `Facturado` y `Liquidado` por un dropdown con cuatro checks de procesos.

## Decisiones aprobadas

- El filtro nuevo se aplica con `Aplicar` dentro del dropdown, no al marcar/desmarcar.
- Los checks son independientes y se combinan con AND: si se marcan varios, el viaje debe cumplir todos.
- Las opciones son `L. Cliente`, `L. Chofer`, `L. Proveedor` y `Facturado`.
- Los filtros usan los campos granulares `liquidado_cliente`, `liquidado_chofer`, `liquidado_proveedor` y `facturado`. El flag agregado legacy `liquidado` no interviene.
- El dropdown incluye un botón `Limpiar` que desmarca todo y aplica sin filtros.
- El botón del dropdown muestra `Procesos`, o `Procesos (n)` cuando hay filtros activos.
- Click afuera cierra el menú sin aplicar cambios pendientes.
- La columna `Estado` vuelve a usar badge con fondo, conservando el texto completo: `Planificado`, `Iniciado`, `Terminado`.
- Los colores del badge son los anteriormente usados: warning para `planificado`, info para `iniciado`, success para `terminado`.

## Cambios técnicos previstos

### Backend

- `api/app/Http/Controllers/ViajeController.php`
  - En `index`, quitar el manejo de los query params `facturado` y `liquidado`.
  - Agregar filtros para `liquidado_cliente`, `liquidado_chofer`, `liquidado_proveedor` y `facturado`.
  - Cada param presente y verdadero agrega `where(columna, true)` a la query; varios params se combinan con AND.

### Frontend

- `client/src/lib/columns/viajes.jsx`
  - Reemplazar `estadoRender` para devolver un badge con fondo y texto completo mediante clases CSS nuevas.
  - Agregar helper puro `buildViajeProcessFilterParams(filters = {})` que devuelva solamente los params `true`, por ejemplo `{ liquidado_cliente: 'true', facturado: 'true' }`.
  - Mantener `ESTADO_LABELS` y el resto de los helpers existentes.
- `client/src/pages/Viajes.jsx`
  - Quitar los estados `facturadoFilter` / `liquidadoFilter` y sus handlers.
  - Agregar estado aplicado `processFilters` y estado temporal del dropdown.
  - Reemplazar los dos checks de la toolbar por el dropdown local con los cuatro checks y los botones `Aplicar` / `Limpiar`.
  - `fetchRows` debe incluir los params devueltos por `buildViajeProcessFilterParams` y conservar búsqueda, estado, fechas y archivados.
  - Cerrar el dropdown al aplicar o limpiar.
- `client/src/index.css`
  - Agregar clases para el badge de estado y para el dropdown de procesos.
  - No crear componentes reutilizables nuevos porque hoy hay un solo consumidor.

## Tests

- Frontend:
  - Actualizar el test del render de `Estado` para esperar badge con fondo y texto completo.
  - Agregar tests unitarios para `buildViajeProcessFilterParams`: ningún filtro, un filtro y múltiples filtros.
- Backend:
  - Agregar tests feature en `ViajeApiTest.php` para filtro individual por flag granular.
  - Agregar test feature que verifique intersección AND entre dos flags.
- Verificación completa: `npm test`, `npm run lint`, `npm run build`, `C:/php84/php.exe vendor/bin/pint --test`, `C:/php84/php.exe artisan test` y smoke manual en Chrome.

## Fuera de alcance

- Migraciones ni cambios de base de datos.
- Quitar o renombrar flags en DB.
- Usar el agregado legacy `liquidado` para filtrar o colorear.
- Extraer un componente reutilizable de dropdown.
- Cambiar las pestañas o la tabla `Proceso | Documento` del modal.

## Riesgos / notas

- El backend ya expone los flags granulares en el JSON de `GET /api/viajes`, por lo que no hace falta eager load adicional.
- El filtro anterior `liquidado` consultaba la columna legacy; se reemplaza deliberadamente por los flags por concepto.
- Los cambios del dropdown quedan pendientes hasta `Aplicar`; si el usuario cierra con click afuera, se descartan.

## Criterios de aceptación

- La columna `Estado` muestra badges con colores y texto completo `Planificado` / `Iniciado` / `Terminado`.
- La toolbar de Viajes ya no muestra los checks sueltos `Facturado` y `Liquidado`.
- El dropdown `Procesos` muestra los cuatro checks, `Aplicar` y `Limpiar`.
- Marcar varios checks devuelve sólo viajes que cumplen todos esos flags.
- `Limpiar` devuelve el listado sin filtros de procesos.
- Tests, lint, build, Pint y suite PHP pasan, y el smoke manual confirma grid y filtros.
- Commit y push finales autorizados; sin merge.
