# TAG Logística — Cliente

Frontend React 19 + Vite 8.

## Desarrollo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

La app queda en `http://localhost:5173` y consume la API en `http://localhost:8000/api` por defecto.

## Configuración

La URL de la API se define con `VITE_API_URL` (ver `src/apiConfig.js`). Para producción, crear `.env.production`:

```env
VITE_API_URL=https://logisticatag.com.ar/api
```

## Build y lint

```bash
npm run lint
npm run build
```

El build queda en `dist/` y se sube por FTP. La guía de deploy se mantiene en el hub interno del proyecto.
