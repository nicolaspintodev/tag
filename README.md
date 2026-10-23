# TAG Logística

Sistema de gestión para una empresa de transporte y logística: clientes, proveedores, unidades, choferes, viajes, liquidaciones, documentación y facturación.

[![CI](https://github.com/nicolaspintodev/tag/actions/workflows/ci.yml/badge.svg)](https://github.com/nicolaspintodev/tag/actions/workflows/ci.yml)

> **Estado:** PoC funcional. La autenticación y la facturación están implementadas como mock/bypass. No usar todavía con datos reales de producción.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Laravel 13 + PHP 8.4 + Sanctum |
| Frontend | React 19 + Vite 8 |
| Base de datos (dev) | SQLite |
| Base de datos (prod) | MySQL 8 |
| Estilos | CSS nativo |
| Iconos | Lucide React |

## Estructura

```text
TAG/
├── api/          # Backend Laravel
├── client/       # Frontend React + Vite
├── docs/         # Reservada para documentación de código
├── scripts/      # Atajos para Windows (.bat)
├── LICENSE
└── README.md
```

## Requisitos

- PHP 8.4 con `pdo_sqlite`, `mbstring`, `openssl`, `fileinfo`
- Composer 2
- Node.js 22 + npm
- Git

## Setup local

### Backend

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate:fresh --seed --force
php artisan storage:link
php artisan serve
```

En Windows podés usar `copy .env.example .env` en lugar de `cp`. `storage:link` es opcional y puede requerir permisos de administrador.

La API queda en `http://localhost:8000`.

### Frontend

```bash
cd client
npm ci
cp .env.example .env.local
npm run dev
```

La UI queda en `http://localhost:5173`.

### Scripts para Windows

```bat
scripts\iniciar-backend.bat
scripts\iniciar-frontend.bat
scripts\reset-db.bat
scripts\pre-deploy.bat
scripts\cerrar-servers.bat
```

Los scripts usan `php` y, si existe, `C:\php84\php.exe`. Podés forzar otro binario con `set PHP_EXE=C:\ruta\a\php.exe` antes de ejecutarlos.

## Tests

```bash
cd api
composer test
```

```bash
cd client
npm run lint
npm run build
```

Los tests de backend usan SQLite en memoria (`api/phpunit.xml`) y no tocan la base local. La documentación de testing se mantiene en el hub interno del proyecto.

## Documentación

- [Guía para agentes](AGENTS.md)

La documentación de gestión, deploy, testing e historial se mantiene en el hub interno del proyecto. `docs/` queda reservada para documentación de código.

## Despliegue

El hosting de producción es DonWeb/Ferozo (hosting compartido). No soporta Docker ni procesos persistentes de Node, por lo que el frontend se compila y se sube por FTP. La guía de deploy se mantiene en el hub interno del proyecto.

## Repositorio legacy

El repositorio anterior [`pinto0528/TAG`](https://github.com/pinto0528/TAG) quedó archivado. La rama `nuevo-flujo` conserva el historial y los planes de testing antiguos. El repositorio canónico es [`nicolaspintodev/tag`](https://github.com/nicolaspintodev/tag).

## Licencia

[MIT](LICENSE)
