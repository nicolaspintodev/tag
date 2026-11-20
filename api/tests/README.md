# Tests de API - TAG Logística

## Resumen
Total: **66 tests** (157 assertions) — solo Feature, sin tests de reglas/flujos retirados.

---

## Security (27 tests)
| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `AuthTest.php` | 15 | Login, logout, rate limiting, normalización email, tokens |
| `PasswordPolicyTest.php` | 6 | Validación complejidad password (mayúscula, minúscula, número, símbolo, longitud) |
| `CorsTest.php` | 5 | Orígenes permitidos/denegados, preflight, allowlist |
| `DebugRouteTest.php` | 1 | Ruta de debug no expuesta |

---

## Contratos API (39 tests)
| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `ViajeApiTest.php` | 12 | CRUD viaje, estados, unidades, multi-unidad |
| `GastoApiTest.php` | 6 | CRUD gasto, validación clase (propio/proveedor) |
| `LiquidacionApiTest.php` | 14 | CRUD liquidación, agregar/quitar viajes, actualizar monto pivot, cambiar estado, viajes con liquidación |
| `DocumentoApiTest.php` | 7 | CRUD documento + archivos adjuntos (store, destroy, validación tipo) |

---

## Retirados (cobertura pendiente - TAG-035)
| Archivo original | Tests | Motivo |
|------------------|-------|--------|
| `Unit/ViajeCostoTest.php` | 12 | Fórmulas costo_proveedor_ajustado, costo_viaje, ganancia |
| `Unit/EstadoTransitionsTest.php` | 8 | Transiciones estado viaje/liquidación |
| `Unit/AutoNumberingTest.php` | 5 | Numeración viajes (P-/T-) y liquidaciones |
| `Feature/FlujoViajeCompletoTest.php` | 4 | Flujo E2E viaje con gastos/anticipos |
| `Feature/FlujoLiquidacionCompletoTest.php` | 4 | Flujo E2E liquidación cliente/proveedor |
| `Feature/ExampleTest.php` + `Unit/ExampleTest.php` | 2 | Placeholders |
| `GastoApiTest` (3 métodos) | 3 | Recalculo costo_viaje (cubierto por fórmulas arriba) |
| `LiquidacionApiTest` (7 métodos + 1 aserción) | 8 | Viajes disponibles por tipo, total, estado no borrador |

---

## Ejecución
```bash
cd api
composer test
```

---

## Cobertura objetivo futura (TAG-035)
- Tests de regresión para fórmulas de costo/ganancia
- Tests de transiciones de estado (viaje: pendiente→en_curso→finalizado→liquidado/cancelado; liquidación: borrador→pendiente→facturada)
- Tests de numeración automática (viaje P-/T- secuencial)
- Flujos E2E viaje y liquidación