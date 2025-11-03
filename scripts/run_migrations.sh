#!/bin/bash

# ============================================
# Script para ejecutar migraciones automáticamente en Docker
# ============================================
# Este script espera a que la base de datos esté lista 
# y luego ejecuta las migraciones de TypeORM

set -e

echo "Esperando a que la base de datos esté lista..."

# Esperar a que PostgreSQL esté listo
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo " PostgreSQL no está listo aún - esperando..."
  sleep 2
done

echo "PostgreSQL está listo!"

echo "Ejecutando migraciones..."

# Ejecutar migraciones principales
yarn typeorm migration:run -d ./src/database/appDataSource.ts

echo "Migraciones ejecutadas exitosamente!"

# Ejecutar seeders (opcional, comentar si no se necesita)
# echo " Ejecutando seeders..."
yarn typeorm migration:run -d ./src/database/seeders/seedersDataSource.ts
# echo "Seeders ejecutados exitosamente!"

echo "Base de datos lista para usar!"
