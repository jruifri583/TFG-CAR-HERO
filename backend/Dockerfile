FROM php:8.1-cli

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    zip \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# Extensiones PHP necesarias para Laravel
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install

RUN php artisan key:generate || true

EXPOSE 8000
