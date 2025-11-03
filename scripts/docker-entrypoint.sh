#!/bin/bash

# ============================================
# Docker Entrypoint - Script de inicio del contenedor
# ============================================
# Este script se ejecuta cuando el contenedor inicia
# 1. Ejecuta las migraciones
# 2. Inicia el servidor Node.js

set -e

echo "🐳 Iniciando contenedor INME Backend..."

# Ejecutar migraciones
./scripts/run_migrations.sh

# Iniciar el servidor
echo "🚀 Iniciando servidor Node.js..."
exec node dist/index.js
