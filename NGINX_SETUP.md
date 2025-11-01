# Configuración de Nginx para Servir Imágenes

## 📋 Descripción

Este proyecto utiliza Nginx como servidor de archivos estáticos para servir las imágenes subidas por los usuarios. Las imágenes se almacenan en un volumen Docker compartido entre el backend (API) y Nginx.

## 🏗️ Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│    Nginx     │────▶│  uploads_data   │
│  (React)    │     │   (Port 8082)│     │     Volume      │
└─────────────┘     └──────────────┘     │ /home/tmp/inme  │
                           ▲              └─────────────────┘
                           │                      ▲
                    ┌──────────────┐              │
                    │   Backend    │──────────────┘
                    │   (Port 3030)│
                    └──────────────┘
```

**Directorio compartido:** `/home/tmp/inme`

- El backend escribe imágenes en este directorio
- Nginx lee desde el mismo directorio (read-only)
- Ambos acceden al volumen Docker `uploads_data`

## 🚀 Uso

### Iniciar los servicios

```bash
docker compose up -d
```

Esto iniciará:

- **PostgreSQL** en el puerto `4555`
- **Backend API** en el puerto `3030`
- **Nginx** en el puerto `8082`

### Acceder a las imágenes

Las imágenes estarán disponibles en:

```
http://localhost:8082/uploads/{nombre-del-archivo}
```

Ejemplo:

```
http://localhost:8082/uploads/products/producto-123.jpg
```

### Desde el Frontend

En tu código del frontend, usa la URL base de Nginx:

```typescript
// En tu archivo de constantes
export const IMAGES_BASE_URL = "http://localhost:8082/uploads";

// Al mostrar una imagen
<img src={`${IMAGES_BASE_URL}/${producto.imagen}`} alt={producto.nombre} />
```

## 🔧 Configuración

### Nginx (`nginx.conf`)

- **Puerto**: 80 (mapeado a 8082 en el host)
- **Directorio de imágenes**: `/home/tmp/inme/`
- **CORS**: Habilitado para todos los orígenes (`*`)
- **Cache**: 1 año para imágenes
- **Compresión**: Gzip habilitado
- **Tipos de archivo permitidos**: jpg, jpeg, png, gif, webp, svg, ico, pdf

### Volúmenes Docker

- `uploads_data`: Volumen compartido entre API y Nginx
  - API escribe en `/home/tmp/inme`
  - Nginx lee desde `/home/tmp/inme` (read-only)
  - Variable de entorno en API: `ROOT_DIRECTORY=/home/tmp/inme`

## 📝 Endpoints

### Health Check

```bash
curl http://localhost:8082/health
# Respuesta: OK
```

### Obtener una imagen

```bash
curl http://localhost:8082/uploads/products/ejemplo.jpg
```

## 🔒 Seguridad

- Nginx está configurado en modo **read-only** para el volumen de uploads
- Solo se permiten tipos de archivo específicos (imágenes y PDFs)
- Acceso denegado a archivos ocultos (`.`)
- CORS configurado para desarrollo (ajustar en producción)

## 🐛 Troubleshooting

### Las imágenes no se muestran

1. Verifica que el contenedor de Nginx esté corriendo:

   ```bash
   docker compose ps
   ```

2. Verifica los logs de Nginx:

   ```bash
   docker compose logs nginx
   ```

3. Verifica que el archivo existe en el volumen:
   ```bash
   docker compose exec nginx ls -la /home/tmp/inme/
   docker compose exec api ls -la /home/tmp/inme/
   ```

### Error de CORS

Si tienes problemas de CORS en producción, actualiza la configuración en `nginx.conf`:

```nginx
# Cambiar de:
add_header 'Access-Control-Allow-Origin' '*' always;

# A tu dominio específico:
add_header 'Access-Control-Allow-Origin' 'https://tu-dominio.com' always;
```

## 🔄 Actualizar configuración

Si modificas `nginx.conf`, recarga Nginx:

```bash
docker compose restart nginx
```

## 📊 Monitoreo

Ver logs en tiempo real:

```bash
# Todos los servicios
docker compose logs -f

# Solo Nginx
docker compose logs -f nginx
```

## 🌐 Producción

Para producción, considera:

1. **HTTPS**: Configurar certificados SSL/TLS
2. **CORS**: Restringir a tu dominio específico
3. **Rate Limiting**: Agregar límites de tasa
4. **CDN**: Considerar usar un CDN para mejor rendimiento
5. **Backup**: Configurar backup del volumen `uploads`

### Ejemplo de configuración HTTPS (producción)

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... resto de la configuración
}
```
