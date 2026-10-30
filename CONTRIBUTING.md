# Contribuir

## Requisitos

- PHP 8.4 + Composer 2
- Node.js 22 + npm

## Setup

Seguir el [README](README.md#setup-local). En resumen:

```bash
cd api && composer install
cp .env.example .env && php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate:fresh --seed --force

cd ../client && npm ci
```

## Flujo de trabajo

1. Crear una rama desde `develop`: `feat/...`, `fix/...`, `chore/...` o `docs/...`.
2. Hacer commits chicos y descriptivos.
3. Antes de abrir el PR:
   ```bash
   cd api && composer test
   cd ../client && npm run lint && npm run build
   ```
4. Abrir el PR contra `develop` usando la plantilla y mergear con squash.
5. Releases: PR de `develop` a `main` con tag `vX.Y.Z`. Hotfixes: rama desde `main`, PR a `main` y réplica a `develop`.

No pushear directo a `main` ni `develop`.

## Estilo

- PHP: Laravel Pint (`cd api && ./vendor/bin/pint`).
- JavaScript: ESLint (`cd client && npm run lint`).
- No commitear `.env`, bases SQLite, `vendor/`, `node_modules/` ni `dist/`.
- No subir datos reales de clientes, choferes o viajes.

## Documentación

- Guía para agentes: `AGENTS.md` en la raíz.
- Gestión, testing, deploy e historial: hub interno del proyecto.
- `docs/` queda reservada para documentación de código.
