FROM php:8.2-cli

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip curl libpng-dev libonig-dev libxml2-dev \
    netcat-openbsd

# Extensiones PHP necesarias para Laravel
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd xml dom

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar solo la carpeta backend
COPY . . 

# Instalar dependencias PHP
RUN composer install \
    --no-interaction \
    --prefer-dist \
    --no-scripts


EXPOSE 8000

