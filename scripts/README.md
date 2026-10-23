# Scripts para Windows

Atajos para el entorno local. Ejecutar con doble clic o desde `cmd`.

| Script | Qué hace |
|---|---|
| `iniciar-backend.bat` | Levanta Laravel en `http://localhost:8000`. |
| `iniciar-frontend.bat` | Levanta Vite en `http://localhost:5173`. |
| `reset-db.bat` | Borra y recrea la base SQLite local con datos de prueba. |
| `pre-deploy.bat` | Compila el frontend y limpia caches de Laravel. |
| `cerrar-servers.bat` | Cierra los procesos que escuchan en los puertos 8000 y 5173. |

## PHP

Los scripts usan `php` del `PATH`. Si no está disponible y existe `C:\php84\php.exe`, usan ese binario. Para forzar otro:

```bat
set PHP_EXE=C:\ruta\a\php.exe
scripts\iniciar-backend.bat
```

## Advertencia

`reset-db.bat` es destructivo: elimina la base local y vuelve a sembrar datos de prueba.
