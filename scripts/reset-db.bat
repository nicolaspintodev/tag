@echo off
setlocal
echo === TAG Logistica - Base de Datos ===
echo.
echo Migrando y sembrando datos de prueba...
cd /d "%~dp0..\api"
if not defined PHP_EXE set "PHP_EXE=php"
if /I "%PHP_EXE%"=="php" if exist "C:\php84\php.exe" set "PHP_EXE=C:\php84\php.exe"
"%PHP_EXE%" artisan migrate:fresh --seed --force
echo.
echo Listo! Base de datos reiniciada con datos nuevos.
pause
