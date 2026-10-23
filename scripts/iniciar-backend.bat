@echo off
setlocal
echo Iniciando Backend (API)...
cd /d "%~dp0..\api"
if not defined PHP_EXE set "PHP_EXE=php"
if /I "%PHP_EXE%"=="php" if exist "C:\php84\php.exe" set "PHP_EXE=C:\php84\php.exe"
"%PHP_EXE%" artisan serve --host=0.0.0.0 --port=8000
