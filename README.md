# TAG Logistica

Sistema de gestion integral para empresas de transporte y logistica. Centraliza la operativa diaria: asignacion de recursos, trazabilidad documental y financiera de cada viaje.

## Modulos

### Viajes (modulo central)
Ciclo de vida completo con 5 estados: Pendiente → En Curso → Finalizado → Liquidado (o Cancelado). Asignacion de recursos (choferes y unidades, propios o tercerizados), sistema de tarifa flexible (km, bulto, tonelada, tarifa plana), gestion de cargas, hoja de ruta imprimible (A4).

### Administracion de recursos
- **Unidades**: camiones y acoplados, seguimiento VTV/seguros
- **Choferes**: legajos, contactos, control LINTI
- **Proveedores (fleteros)**: transporte tercerizado

### Liquidaciones
Agrupacion de viajes para cobrar al cliente o pagar al proveedor. Wizard de creacion con filtros dinamicos, numeracion automatica (LIQ-C-XXXX / LIQ-P-XXXX), estados: borrador → pendiente → facturada.

### Facturacion
Facturas generadas a partir de liquidaciones (mock por ahora).

### Documentacion
Hojas de ruta imprimibles, documentos por viaje (REMITO, CARTA_DE_PORTE, HOJA_DE_RUTA).

## Flujo de negocio

```
Viaje → Documento → Liquidacion → Factura
         (1:1)        (N:N)         (1:1)
```

## Stack

- **Frontend**: React 19, Vite 8, React Router DOM 7, Recharts, Lucide React
- **Backend**: Laravel 13, PHP 8.4
- **Base de datos**: SQLite (desarrollo), MySQL (produccion)
- **Auth**: Laravel Sanctum
- **Infra dev**: Docker Compose (MySQL + Laravel + Node)

## Setup

```bash
# Backend
cd api
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve

# Frontend
cd client
npm install
npm run dev
```

O con Docker:

```bash
docker compose up
```

- API: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Estructura

```
tag/
├── api/                    # Backend Laravel
│   ├── app/                # Controllers, Models, Enums
│   ├── database/           # Migraciones y seeders
│   ├── routes/             # API y web routes
│   └── tests/              # Feature y unit tests
├── client/                 # Frontend React
│   └── src/pages/          # 10 modulos (Viajes, Liquidaciones, etc.)
├── docs/                   # Documentacion del proyecto
├── docker-compose.yml
└── README.md
```

## Docs

- `docs/DEPLOYMENT_GUIDE.md` — Guia de despliegue en produccion
- `docs/ESTADO_DEL_PROYECTO.md` — Estado actual y proximos pasos
- `docs/HISTORY.md` — Historial de cambios

## Licencia

MIT
