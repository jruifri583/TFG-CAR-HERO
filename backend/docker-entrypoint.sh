#!/bin/sh
set -e
cd /var/www/html

# Si vendor está en volumen Docker (no en el bind mount del host), la primera vez está vacío.
if [ ! -f vendor/autoload.php ]; then
  echo "[backend] vendor vacío — ejecutando composer install..."
  composer install --no-interaction --prefer-dist --no-scripts
  php artisan package:discover --ansi || true
fi

exec "$@"
