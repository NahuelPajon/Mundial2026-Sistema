#!/bin/bash

echo "==================================================="
echo "   APAGANDO TODO EL ENTORNO DE DESARROLLO"
echo "==================================================="

echo "[1/3] Deteniendo contenedores de Docker..."
docker compose down

echo "[2/3] Matando procesos del Backend (.NET)..."
pkill -f "dotnet run"
pkill -f "mundial2026.API"

echo "[3/3] Matando procesos del Frontend (Node/Vite)..."
pkill -f "node"
pkill -f "vite"

echo "==================================================="
echo "   ¡Hecho! Todos los servicios han sido detenidos."
echo "==================================================="
