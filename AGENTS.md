# AGENTS.md - TAG Logistica

Guia para agentes de IA trabajando en este proyecto.

## Repositorio

- Canonico: <https://github.com/nicolaspintodev/tag>
- Legacy (archivado): <https://github.com/pinto0528/TAG>
- `main`: estable y deployable. Solo recibe releases y hotfixes.
- `develop`: rama de integracion. Recibe PRs de ramas cortas.
- Ramas cortas: `feat/...`, `fix/...`, `chore/...`, `docs/...` desde `develop`.
- Flujo: rama corta -> PR squash -> `develop`; release: `develop` -> PR -> `main` + tag; hotfix: `main` -> PR -> `main` y replica a `develop`.
- No commitear ni pushear sin autorizacion explicita.
- No pushear directo a `main` ni `develop`.

## Comandos de Desarrollo

### Backend (Laravel)
```bash
cd api
# Servidor de desarrollo
php artisan serve

# Migraciones + seed
php artisan migrate:fresh --seed --force

# Syntax check
php -l app/Models/ModelName.php
php -l app/Http/Controllers/ControllerName.php

# Limpiar cache
php artisan cache:clear
php artisan config:clear
```

### Frontend (React)
```bash
cd client
npm ci
npm run dev       # Dev server en http://localhost:5173
npm run build     # Build de produccion
npm run lint      # ESLint
```

### Tests
```bash
cd api
composer test
```

### Scripts (Windows)
```bat
scripts\iniciar-backend.bat
scripts\iniciar-frontend.bat
scripts\reset-db.bat
scripts\pre-deploy.bat
scripts\cerrar-servers.bat
```
Si `php` no esta en el `PATH`, definir `PHP_EXE` o usar `C:\php84\php.exe`.

### Base de datos
```bash
# Reset completo
php artisan migrate:fresh --seed --force

# Verificar estructura
php artisan tinker --execute="echo print_r(\Illuminate\Support\Facades\Schema::getColumnListing('viajes'), true);"
```

## Reglas Git

- **NO commitear ni pushear** a menos que el usuario lo indique explicitamente.
- Siempre preguntar antes de hacer commit.

## Convenciones

### PHP / Laravel
- PHP 8.4, Laravel 13
- Models extienden `Illuminate\Database\Eloquent\Model` (siempre importar)
- Soft deletes en todos los modelos de negocio
- Controllers usan `findOrFail($id)` explicito (no route model binding)
- Validacion en `$request->validate()` dentro del controller
- Migraciones numeradas secuencialmente con prefijo de fecha

### React
- Functional components + hooks
- CSS nativo (sin framework CSS)
- API calls via fetch con `API_BASE_URL` (ver `client/src/apiConfig.js`)
- Lucide React para iconos

### Base de datos
- SQLite en desarrollo, MySQL en produccion
- No usar funciones MySQL-specific (LOCATE, SUBSTRING...AS UNSIGNED)
- Usar regex PHP o equivalentes SQLite
- Tablas pivote incluyen timestamps()

### Enums
- `EstadoViaje`: pendiente, en_curso, finalizado, liquidado, cancelado
- Estados de liquidacion: borrador, pendiente, facturada
- Estados de documento: pendiente, conforme, rechazado
- Gastos: clase (propio|tercerizado), reintegro (boolean)

## Estructura de Archivos Clave

### Modelos
- `api/app/Models/Viaje.php` — entidad central, multi-unidad (N:N), costo_viaje auto-calculado
- `api/app/Models/Liquidacion.php` — N:N con viaje via pivot
- `api/app/Models/Documento.php` — 1:1 con viaje, archivos adjuntos (N:N)
- `api/app/Models/DocumentoArchivo.php` — archivos de documentos
- `api/app/Models/Gasto.php` — clase (propio|tercerizado), reintegro (boolean)
- `api/app/Models/Factura.php` — 1:1 con liquidacion

### Controllers
- `api/app/Http/Controllers/ViajeController.php` — CRUD + multi-unidad + eager loading completo
- `api/app/Http/Controllers/LiquidacionController.php` — CRUD + viajes-disponibles, agregar/quitar viajes, cambiar estado
- `api/app/Http/Controllers/DocumentoController.php` — CRUD + archivos adjuntos
- `api/app/Http/Controllers/GastoController.php` — CRUD, auto-recalcula costo_viaje
- `api/app/Http/Controllers/FacturaController.php` — CRUD, filtrado por liquidacion

### Frontend (UI anterior desactivada)
- `client/src/App.jsx` — shell mínimo: login + placeholder.
- Las páginas en `client/src/pages/` se conservan como referencia, sin rutas activas hasta la reconstrucción en W1.
- `client/src/pages/Trips.jsx` — modulo de viajes (1700+ lineas)
- `client/src/pages/Settlements.jsx` — liquidaciones con wizard
- `client/src/pages/Billing.jsx` — facturacion
- `client/src/pages/Resources.jsx` — unidades y choferes
- `client/src/pages/Clients.jsx` — ABM clientes
- `client/src/pages/Providers.jsx` — ABM proveedores

## Bugs Conocidos

1. **Frontend pagina en blanco**: reportado historicamente; verificar en el entorno actual antes de asumir que sigue.
2. **Factura creacion**: Mock por ahora, flujo completo pendiente.

## Datos de Prueba

Seeder incluido (`TestSeeder.php`):
- Admin: admin@tag.com / admin123
- 2 clientes, 2 proveedores
- 2 choferes propios + 2 externos
- 2 unidades propias + 2 externas
