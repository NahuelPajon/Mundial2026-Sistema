@echo off
title Apagar Entorno - Mundial 2026
echo ===================================================
echo   APAGANDO TODO EL ENTORNO DE DESARROLLO
echo ===================================================

echo [1/3] Deteniendo contenedores de Docker...
docker compose down

echo [2/3] Matando procesos del Backend (.NET)...
:: /F fuerza el cierre, /IM especifica el nombre del proceso
taskkill /F /IM dotnet.exe >nul 2>&1
taskkill /F /IM mundial2026.API.exe >nul 2>&1

echo [3/3] Matando procesos del Frontend (Node/Vite)...
taskkill /F /IM node.exe >nul 2>&1

echo ===================================================
echo   ¡Hecho! Todos los servicios han sido detenidos.
echo ===================================================
timeout /t 3
