# 📜 Scripts de Migraciones - Referencia Rápida

## 🎯 Propósito

Estos scripts automatizan la ejecución de migraciones de base de datos al iniciar el contenedor Docker.

---

## 📁 Archivos

### 1. `run_migrations.sh`

**Qué hace:** Espera a que PostgreSQL esté listo y ejecuta las migraciones.

**Cuándo se usa:** Llamado automáticamente por `docker-entrypoint.sh` al iniciar el contenedor.

**Ejecución manual:**

```bash
./scripts/run_migrations.sh
```

---

### 2. `docker-entrypoint.sh`

**Qué hace:** Script de inicio del contenedor que ejecuta migraciones y luego inicia el servidor.

**Cuándo se usa:** Automáticamente cuando Docker inicia el contenedor (definido en `CMD` del Dockerfile).

**Flujo:**

1. Ejecuta `run_migrations.sh`
2. Inicia el servidor con `node dist/index.js`

---

### 3. `migrate.ts`

**Qué hace:** Script interactivo para gestionar migraciones en desarrollo local.

**Cuándo se usa:** Durante el desarrollo cuando necesitas crear, ejecutar o revertir migraciones.

**Ejecución:**

```bash
yarn migrate
```

**Opciones disponibles:**

- ✅ Run migrations - Ejecutar migraciones pendientes
- ✅ Run all migrations - Ejecutar todas las migraciones
- ❌ Revert all migrations - Revertir todas las migraciones
- 🔄 Down and up migrations - Revertir y volver a ejecutar
- ⬅️ Revert migrations - Revertir última migración
- 📋 Show the status of migrations - Ver estado
- ➕ Generate migration - Crear nueva migración

---

## 🚀 Comandos Útiles

### Desarrollo Local:

```bash
# Ejecutar migraciones
yarn migration:run

# Ver estado de migraciones
yarn migration:show

# Revertir última migración
yarn migration:revert

# Script interactivo completo
yarn migrate
```

### En Docker:

```bash
# Las migraciones se ejecutan automáticamente al iniciar
docker compose -f docker-compose.prod.yml up

# Ejecutar migraciones manualmente en contenedor
docker compose -f docker-compose.prod.yml exec backend yarn migration:run

# Ver logs de migraciones
docker compose -f docker-compose.prod.yml logs backend
```

---

## 🔍 Verificar Estado

### Localmente:

```bash
yarn migration:show
```

### En Docker:

```bash
docker compose -f docker-compose.prod.yml exec backend yarn migration:show
```

---

## 📖 Documentación Completa

Para una explicación detallada línea por línea, consulta:

- **[MIGRATIONS_GUIDE.md](../MIGRATIONS_GUIDE.md)** - Guía completa con explicaciones detalladas

---

## ⚠️ Importante

- ✅ Los scripts tienen `set -e` - se detienen si algo falla
- ✅ `run_migrations.sh` espera automáticamente a que PostgreSQL esté listo
- ✅ Las migraciones solo se ejecutan si hay pendientes (TypeORM es inteligente)
- ✅ Si las migraciones fallan, el servidor NO inicia

---

## 🐛 Troubleshooting Rápido

**Error: "psql: command not found"**
→ Falta `postgresql-client` en Dockerfile

**Error: "Permission denied"**
→ Ejecuta: `chmod +x scripts/*.sh`

**Migraciones no se ejecutan**
→ Verifica que `src/database` esté copiado en Dockerfile

**PostgreSQL no está listo**
→ El script espera automáticamente, revisa logs con `docker compose logs database`

---

**Para más detalles, lee [MIGRATIONS_GUIDE.md](../MIGRATIONS_GUIDE.md)** 📚
