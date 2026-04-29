#!/bin/bash
# =============================================================================
#  CAR-HERO — Configuración de SSL con Let's Encrypt
# =============================================================================
#
#  Ejecutar DESPUÉS del primer despliegue con deploy.sh (cuando la app ya
#  funcione en HTTP). Este script:
#    1. Obtiene un certificado SSL gratuito de Let's Encrypt
#    2. Activa la configuración HTTPS en Nginx
#    3. Reinicia los contenedores
#
#  Prerrequisitos:
#    - La app debe estar corriendo en HTTP (deploy.sh ya ejecutado)
#    - El dominio carhero.duckdns.org debe apuntar a esta IP
#    - Puerto 80 y 443 abiertos en el Security Group
#
#  Uso:
#    chmod +x setup-ssl.sh
#    ./setup-ssl.sh
#
# =============================================================================
set -e

DOMAIN="carhero.duckdns.org"
EMAIL="${1:-tu-email@gmail.com}"

echo ""
echo "========================================="
echo "  🔒 CAR-HERO — Configuración de SSL"
echo "========================================="
echo ""
echo "  Dominio: $DOMAIN"
echo "  Email:   $EMAIL"
echo ""

# ── Verificar que el dominio resuelve a esta IP ──
echo "🔍 Verificando DNS..."
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "NO_DETECTADA")
DNS_IP=$(dig +short $DOMAIN 2>/dev/null || nslookup $DOMAIN 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')

echo "   IP del servidor: $SERVER_IP"
echo "   IP del dominio:  $DNS_IP"

if [ "$SERVER_IP" != "NO_DETECTADA" ] && [ "$SERVER_IP" != "$DNS_IP" ]; then
    echo ""
    echo "⚠️  AVISO: La IP del dominio ($DNS_IP) no coincide con la IP del servidor ($SERVER_IP)"
    echo "   Asegúrate de que $DOMAIN apunta a $SERVER_IP en DuckDNS."
    read -p "   ¿Continuar de todos modos? (s/N): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo "❌ Cancelado."
        exit 1
    fi
fi

# ── Paso 1: Obtener certificado con Certbot ──
echo ""
echo "📜 Obteniendo certificado SSL de Let's Encrypt..."
echo "   (Esto puede tardar unos segundos...)"
echo ""

# Parar el frontend temporalmente para liberar el puerto 80
docker compose -f docker-compose.prod.yml stop frontend

# Ejecutar Certbot en modo standalone
docker run -it --rm \
    -p 80:80 \
    -v "$(docker volume inspect certbot_etc --format '{{ .Mountpoint }}' 2>/dev/null || echo 'certbot_etc'):/etc/letsencrypt" \
    -v "$(docker volume inspect certbot_var --format '{{ .Mountpoint }}' 2>/dev/null || echo 'certbot_var'):/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

# Verificar que se creó el certificado
if docker run --rm -v certbot_etc:/etc/letsencrypt alpine ls /etc/letsencrypt/live/$DOMAIN/fullchain.pem > /dev/null 2>&1; then
    echo ""
    echo "✅ Certificado SSL obtenido correctamente"
else
    echo ""
    echo "❌ ERROR: No se pudo obtener el certificado."
    echo "   Asegúrate de que el dominio $DOMAIN apunta a esta IP y el puerto 80 está abierto."
    # Restaurar frontend en HTTP
    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d frontend
    exit 1
fi

# ── Paso 2: Activar configuración SSL en Nginx ──
echo ""
echo "🔧 Activando configuración HTTPS en Nginx..."

# Hacer backup de la configuración HTTP actual
cp frontend/nginx.conf frontend/nginx.http.conf.bak

# Copiar la configuración SSL
cp frontend/nginx.ssl.conf frontend/nginx.conf

echo "✅ Configuración SSL activada"

# ── Paso 3: Reiniciar los contenedores ──
echo ""
echo "🔄 Reiniciando contenedores..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar a que arranque
sleep 5

# ── Verificar ──
echo ""
echo "========================================="
echo "  ✅ ¡SSL configurado correctamente!"
echo "========================================="
echo ""
echo "🔒 Tu app está disponible en:"
echo "   https://$DOMAIN"
echo ""
echo "📝 HTTP (puerto 80) redirige automáticamente a HTTPS (443)"
echo ""
echo "📝 El certificado se renueva automáticamente cada 12h"
echo "   gracias al contenedor Certbot en docker-compose.prod.yml"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
