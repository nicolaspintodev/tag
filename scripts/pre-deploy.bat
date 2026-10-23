@echo off
setlocal
echo ============================================================
echo   TAG Logistica - Preparacion para Despliegue (DonWeb)
echo ============================================================
echo.

if not defined PHP_EXE set "PHP_EXE=php"
if /I "%PHP_EXE%"=="php" if exist "C:\php84\php.exe" set "PHP_EXE=C:\php84\php.exe"

:: 1. Build Frontend
echo [1/3] Compilando Frontend (React)...
cd /d "%~dp0..\client"
call npm ci
if errorlevel 1 (
    echo.
    echo ERROR: Fallo npm ci.
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Fallo la compilacion del Frontend.
    pause
    exit /b 1
)

:: 2. Limpiar cache Laravel
echo [2/3] Limpiando caches de Laravel (API)...
cd /d "%~dp0..\api"
"%PHP_EXE%" artisan config:clear
"%PHP_EXE%" artisan cache:clear
"%PHP_EXE%" artisan view:clear
"%PHP_EXE%" artisan route:clear

echo.
echo [3/3] LISTO PARA SUBIR.
echo.
echo INSTRUCCIONES FINALES:
echo 1. Sube el contenido de 'client/dist' a 'public_html' por FTP.
echo 2. Sube la carpeta 'api' al servidor (incluye vendor si no hay Composer).
echo 3. Configura el .env en el servidor con los datos de DonWeb.
echo 4. No subas node_modules, tests, .git ni bases locales.
echo.
pause
