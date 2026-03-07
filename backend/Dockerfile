FROM php:8.2-cli

# ARG UID
# ARG GID

# RUN groupadd -g ${GID} laravel \
#    && useradd -u ${UID} -g laravel -m laravel

# dependencias
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl libzip-dev pkg-config \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer \
    && chmod +x /usr/local/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .

RUN php artisan storage:link

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
# CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]