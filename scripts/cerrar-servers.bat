@echo off
setlocal
echo === TAG Logistica - Cerrando servidores ===
echo.

echo Cerrando Backend (puerto 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Cerrando Frontend (puerto 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173.*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo Listo! Servidores de TAG cerrados.
pause
