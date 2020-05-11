FROM php:7.4-apache

# Enable the Apache Headers module:
RUN ln -s /etc/apache2/mods-available/headers.load \
  /etc/apache2/mods-enabled/headers.load

# Enable the Apache Rewrite module:
RUN ln -s /etc/apache2/mods-available/rewrite.load \
  /etc/apache2/mods-enabled/rewrite.load

# Install GD, Imagick and ImageMagick as image conversion options:
RUN DEBIAN_FRONTEND=noninteractive \
  apt-get update && apt-get install -y --no-install-recommends \
  libpng-dev \
  libjpeg-dev \
  libmagickwand-dev \
  imagemagick \
  && pecl install \
  imagick \
  && docker-php-ext-enable \
  imagick \
  && docker-php-ext-configure \
  gd --with-jpeg=/usr/include/ \
  && docker-php-ext-install \
  gd \
  # Uninstall obsolete packages:
  && apt-get autoremove -y \
  libpng-dev \
  libjpeg-dev \
  libmagickwand-dev \
  # Remove obsolete files:
  && apt-get clean \
  && rm -rf \
  /tmp/* \
  /usr/share/doc/* \
  /var/cache/* \
  /var/lib/apt/lists/* \
  /var/tmp/*

# Use the default development configuration:
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Add a custom configuration file:
COPY php.ini "$PHP_INI_DIR/conf.d/"
