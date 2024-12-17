FROM php:8.1-apache

# Installer les extensions nécessaires
RUN apt-get update && apt-get install -y libxslt-dev \
    && docker-php-ext-install xsl