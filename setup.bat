@echo off
title Pipeline de Desarrollo - Mundial 2026
echo ===================================================
echo   INICIANDO ENTORNO DE DESARROLLO - MUNDIAL 2026
echo ===================================================

echo [1/6] Terminando procesos previos de Docker
docker compose down

echo [2/6] Levantando Base de Datos en Docker...
docker compose up -d

echo [3/6] Limpiando y compilando Backend (.NET)...
dotnet clean backend/mundial2026.slnx
dotnet build backend/mundial2026.slnx

echo [4/6] Verificando dependencias de Frontend (npm)...
cd frontend
call npm i
cd ..

echo [5/6] Levantando API de C# en una nueva ventana...
:: 'start' abre una nueva consola para que el proceso corra en paralelo
start "Backend - API .NET" cmd /k "cd backend/src/mundial2026.API && dotnet run"

echo [6/6] Levantando Frontend (Vite) en una nueva ventana...
start "Frontend - React" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo  ¡Todo listo! Las consolas paralelas estan corriendo.
echo ===================================================
pause
