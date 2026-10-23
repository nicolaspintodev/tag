@echo off
setlocal
echo Iniciando Frontend (React)...
cd /d "%~dp0..\client"
call npm run dev
