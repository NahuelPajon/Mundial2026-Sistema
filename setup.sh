#!/bin/bash

echo "==================================================="
echo "  INICIANDO ENTORNO DE DESARROLLO - MUNDIAL 2026"
echo "==================================================="

echo "[1/6] Terminando procesos previos de Docker..."
docker compose down

echo "[2/6] Levantando Base de Datos en Docker..."
docker compose up -d

echo "[3/6] Limpiando y compilando Backend (.NET)..."
dotnet clean backend/mundial2026.slnx
dotnet build backend/mundial2026.slnx

echo "[4/6] Verificando dependencias de Frontend (npm)..."
cd frontend && npm i && cd ..

echo "[5/6] Levantando servicios en paralelo..."
# Levantamos la API y Vite al mismo tiempo usando el operador '&'
cd backend/src/mundial2026.API && dotnet run &
cd ../../../frontend && npm run dev &

# Mantiene el script activo para poder cancelar ambos procesos con Ctrl+C
type ctrl+c to exit
wait
