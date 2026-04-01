FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Expose port
EXPOSE ${PORT:-8000}

# Start command - run migrations and start server
CMD php artisan config:clear && \
    php artisan migrate --force && \
    (php artisan db:seed --force || echo "Seeder skipped") && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000} 2>&1 | tee /dev/stderr
