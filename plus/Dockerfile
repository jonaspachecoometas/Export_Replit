FROM php:8.2-fpm

ARG UID=1000
ARG GID=33

# Sistema + extensões PHP + Node 18
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    bcmath \
    exif \
    gd \
    intl \
    pcntl \
    pdo_mysql \
    sockets \
    zip \
    soap \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ajusta UID/GID do www-data para bater com o host (rob: dockershared)
RUN groupmod -g ${GID} www-data \
    && usermod -u ${UID} -g ${GID} www-data

# Composer da imagem oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia o script de entrypoint (como root mesmo)
COPY docker/check-env.sh /usr/local/bin/check-env.sh
RUN chmod +x /usr/local/bin/check-env.sh

WORKDIR /var/www/html

# A partir daqui o usuário padrão é www-data (mesmo UID do rob)
USER www-data

# Define o home do www-data
ENV HOME=/var/www/html

# Configs úteis do Composer
ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_ALLOW_SUPERUSER=1

EXPOSE 9000 5173

ENTRYPOINT ["/usr/local/bin/check-env.sh"]
CMD ["php-fpm"]
