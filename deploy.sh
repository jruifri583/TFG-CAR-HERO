#!/bin/bash
# =============================================================================
#  CAR-HERO — Script de despliegue en AWS EC2
# =============================================================================
#
#  Prerrequisitos en la instancia EC2:
#    - Ubuntu 22.04+ / Amazon Linux 2023
#    - Docker y Docker Compose instalados
#    - Puerto 80 (HTTP) y 443 (HTTPS) abiertos en el Security Group
#    - Fichero .env.prod configurado con los secretos reales
#
#  Uso:
#    chmod +x deploy.sh
#    ./deploy.sh
#
# =============================================================================
set -e

echo ""
echo "========================================="
echo "  🚗 CAR-HERO — Despliegue en producción"
echo "========================================="
echo ""

# ── Verificar que existe .env.prod ──
if [ ! -f .env.prod ]; then
    echo "❌ ERROR: No se encontró el fichero .env.prod"
    echo "   Copia .env.prod.example como .env.prod y rellena los valores reales."
    exit 1
fi

# ── Verificar Docker ──
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no está instalado."
    echo "   Ejecuta: sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin"
    exit 1
fi

echo "✅ Fichero .env.prod encontrado"
echo "✅ Docker disponible"
echo ""

# ── Pull de las últimas imágenes base ──
echo "📦 Descargando imágenes base..."
docker pull node:20-alpine
docker pull nginx:1.27-alpine
docker pull php:8.2-fpm-alpine
docker pull mysql:8.0

# ── Build y arranque ──
echo ""
echo "🔨 Construyendo y arrancando contenedores..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# ── Esperar a que MySQL esté listo ──
echo ""
echo "⏳ Esperando a que MySQL esté listo..."
sleep 10

# Comprobar con reintentos
for i in {1..12}; do
    if docker exec carhero_mysql mysqladmin ping -u root -p"$(grep MYSQL_ROOT_PASSWORD .env.prod | cut -d '=' -f2)" --silent 2>/dev/null; then
        echo "✅ MySQL está listo"
        break
    fi
    echo "   Reintentando... ($i/12)"
    sleep 5
done

# ── Migraciones y configuración de Laravel ──
echo ""
echo "🗄️  Ejecutando migraciones..."
docker exec carhero_backend php artisan migrate --force

echo "⚙️  Cacheando configuración de Laravel..."
docker exec carhero_backend php artisan config:cache
docker exec carhero_backend php artisan route:cache
docker exec carhero_backend php artisan view:cache

# ── Seed (solo la primera vez, descomenta si necesitas) ──
# echo "🌱 Ejecutando seeders..."
# docker exec carhero_backend php artisan db:seed --force

# ── Verificar estado ──
echo ""
echo "========================================="
echo "  ✅ ¡Despliegue completado!"
echo "========================================="
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Frontend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'TU_IP'):80"
echo "⚙️  Backend:   Interno (puerto 8000, solo accesible desde el frontend)"
echo "🗄️  MySQL:     Interno (puerto 3306, no expuesto)"
echo ""
echo "📝 Para ver los logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "📝 Para ejecutar seeders (primera vez):"
echo "   docker exec carhero_backend php artisan db:seed --force"
echo ""
echo "🔒 Para activar HTTPS con SSL (Let's Encrypt):"
echo "   chmod +x setup-ssl.sh"
echo "   ./setup-ssl.sh tu-email@gmail.com"
echo ""
