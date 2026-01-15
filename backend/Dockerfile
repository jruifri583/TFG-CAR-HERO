FROM php:8.2-cli

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip curl libpng-dev libonig-dev libxml2-dev

# Extensiones PHP necesarias para Laravel
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd xml dom

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar solo la carpeta backend
COPY . . 

# Instalar dependencias PHP
RUN composer install --ignore-platform-reqs

# Generar clave de Laravel
RUN php artisan key:generate || true

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
