# Plan MVP-002: Business Rules Implementation & Reseed

## Objetivo
Implementar reglas de negocio para viajes y resembrar la BD con 10 viajes válidos.

---

## Reglas de Negocio Completas

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | **Auto-terminado** | Al marcar `facturado` o `liquidado` → `estado = 'terminado'` (auto, no revertible) |
| 2 | **Flags independientes** | `facturado` / `liquidado` son flags booleanos independientes, solo en viajes `terminado` |
| 3 | **Exclusividad recursos** | Chofer, Tractora, Acoplado → máx 1 viaje `iniciado` simultáneo |
| 4 | **Iniciado requiere recursos** | Viaje `iniciado` DEBE tener `chofer` Y `tractora` (acoplado opcional) |
| 5 | **Acoplado sin tractora** | No se puede asignar `acoplado_id` sin `tractora_id` |
| 6 | **Reseed** | Borrar 5 viajes actuales, crear 10 nuevos respetando todas las reglas |
| Edge | **Desmarcar flags** | Al desmarcar facturado/liquidado → `estado` queda en `terminado` (no revierte) |

---

## Archivos a Modificar

### 1. `api/app/Models/Viaje.php`
- Agregar método `validateBusinessRules()` 
- Agregar método `validateResourceExclusivity(array &$errors)`
- Actualizar `booted()` para llamar validaciones en evento `saving`
- Evento `saving`: auto-set `terminado` cuando flags se marcan true

### 2. `api/app/Http/Controllers/ViajeController.php`
- Agregar validaciones en `store()` y `update()` que reflejen las reglas del modelo
- Retornar errores 422 con mensajes específicos por campo

### 3. `api/database/seeders/TestSeeder.php` (o nuevo `ViajeSeeder`)
- Truncar tabla `viajes`
- Crear 10 viajes nuevos según distribución abajo

### 4. `api/tests/Feature/ViajeApiTest.php`
- Tests para cada regla de validación

---

## Distribución de 10 Viajes (Seeder)

| # | Estado | Chofer | Tractora | Acoplado | Facturado | Liquidado |
|---|--------|--------|----------|----------|-----------|-----------|
| 1 | planificado | C1 | T1 | - | false | false |
| 2 | planificado | C2 | T2 | A1 | false | false |
| 3 | iniciado | C3 | T3 | - | false | false |
| 4 | iniciado | C4 | T4 | A2 | false | false |
| 5 | iniciado | C5 | T5 | - | false | false |
| 6 | terminado | C1 | T1 | - | true | false |
| 7 | terminado | C2 | T2 | A1 | false | true |
| 8 | terminado | C3 | T3 | - | true | true |
| 9 | terminado | C4 | T4 | A2 | false | false |
| 10 | terminado | C5 | T5 | - | true | false |

**Reglas cumplidas:**
- ✅ 3 `iniciado` con recursos únicos (chofer+tractora requeridos)
- ✅ Sin acoplado sin tractora
- ✅ `terminado` reutilizan recursos (histórico, libres para nuevos `iniciado`)
- ✅ Mix de flags facturado/liquidado

---

## Validaciones Específicas

### Mensajes de Error (Español)
- `chofer_id`: "Un viaje Iniciado debe tener un chofer asignado"
- `tractora_id`: "Un viaje Iniciado debe tener una tractora asignada"
- `tractora_id` (acoplado): "No se puede asignar acoplado sin tractora"
- `chofer_id` (conflicto): "El chofer ya tiene un viaje Iniciado"
- `tractora_id` (conflicto): "La tractora ya está en un viaje Iniciado"
- `acoplado_id` (conflicto): "El acoplado ya está en un viaje Iniciado"
- `estado`: "Solo los viajes Terminados pueden ser facturados/liquidados"

### Validación de Recursos (solo para `iniciado`)
```php
// Chofer, Tractora, Acoplado → único en estado 'iniciado'
if ($viaje->estado === EstadoViaje::INICIADO) {
    // validar existencia chofer + tractora
    // validar exclusividad chofer/tractora/acoplado
}

// Validar acoplado sin tractora (cualquier estado)
if ($viaje->acoplado_id && !$viaje->tractora_id) {
    // error en acoplado_id
}

// Validar flags solo en terminado
if (($viaje->facturado || $viaje->liquidado) && $viaje->estado !== EstadoViaje::TERMINADO) {
    // error en estado
}
```

---

## Tests a Agregar

| Test | Descripción |
|------|-------------|
| `test_auto_terminado_when_facturado_checked` | Marcar facturado → estado = terminado |
| `test_auto_terminado_when_liquidado_checked` | Marcar liquidado → estado = terminado |
| `test_uncheck_flags_keeps_terminado` | Desmarcar flags → estado se queda terminado |
| `test_iniciado_requires_chofer_and_tractora` | Sin chofer/tractora → error 422 |
| `test_acoplado_requires_tractora` | Acoplado sin tractora → error 422 |
| `test_resource_exclusivity_chofer` | Mismo chofer en 2 iniciados → error 422 |
| `test_resource_exclusivity_tractora` | Misma tractora en 2 iniciados → error 422 |
| `test_resource_exclusivity_acoplado` | Mismo acoplado en 2 iniciados → error 422 |
| `test_terminado_allows_resource_reuse` | Chofer en terminado + iniciado → OK |
| `test_flags_only_on_terminado` | Facturar en planificado → error 422 |
| `test_seeder_creates_valid_data` | 10 viajes creados cumplen todas las reglas |

---

## Futuro (No implementar ahora)
- Flags `facturado`/`liquidado` se setearán automáticamente vía Liquidaciones/Facturas
- Usuario NO editará checks directamente (solo lectura en UI)
- Validaciones preparadas para updates programáticos (system updates)

---

## Orden de Implementación

1. **Model**: `Viaje.php` - validaciones en `booted()` + métodos de validación
2. **Controller**: `ViajeController.php` - validaciones en store/update
3. **Seeder**: `TestSeeder.php` - truncate + 10 viajes nuevos
4. **Tests**: `ViajeApiTest.php` - casos de validación
5. **Verificar**: `php artisan test` + frontend lint/build