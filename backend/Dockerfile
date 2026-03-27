FROM php:8.2-cli

# ARG UID
# ARG GID

# RUN groupadd -g ${GID} laravel \
#    && useradd -u ${UID} -g laravel -m laravel

# dependencias
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl libzip-dev pkg-config \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY docker-php-opcache.ini /usr/local/etc/php/conf.d/docker-php-opcache.ini

RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer \
    && chmod +x /usr/local/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .

RUN php artisan storage:link

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Windows: si el script tiene CRLF, el shebang falla con "no such file or directory"
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
