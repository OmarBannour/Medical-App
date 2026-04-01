#!/bin/bash
set -e

echo "=== Railway Laravel Startup ==="

# Debug: Print database connection info (without password)
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"
echo "DB_HOST: ${DB_HOST:-not set}"
echo "MYSQLHOST: ${MYSQLHOST:-not set}"
echo "DB_PORT: ${DB_PORT:-not set}"
echo "MYSQLPORT: ${MYSQLPORT:-not set}"
echo "DB_DATABASE: ${DB_DATABASE:-not set}"
echo "MYSQLDATABASE: ${MYSQLDATABASE:-not set}"

# Set Railway MySQL variables if they exist
if [ -n "$MYSQLHOST" ]; then
    export DB_HOST="$MYSQLHOST"
    echo "Using MYSQLHOST: $MYSQLHOST"
fi

if [ -n "$MYSQLPORT" ]; then
    export DB_PORT="$MYSQLPORT"
    echo "Using MYSQLPORT: $MYSQLPORT"
fi

if [ -n "$MYSQLDATABASE" ]; then
    export DB_DATABASE="$MYSQLDATABASE"
    echo "Using MYSQLDATABASE: $MYSQLDATABASE"
fi

if [ -n "$MYSQLUSER" ]; then
    export DB_USERNAME="$MYSQLUSER"
    echo "Using MYSQLUSER: $MYSQLUSER"
fi

if [ -n "$MYSQLPASSWORD" ]; then
    export DB_PASSWORD="$MYSQLPASSWORD"
    echo "Using MYSQLPASSWORD: [hidden]"
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if php artisan db:show 2>/dev/null; then
        echo "Database connection successful!"
        break
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$max_attempts - Database not ready, waiting 2 seconds..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "ERROR: Could not connect to database after $max_attempts attempts"
    echo "Final connection details:"
    echo "  Host: ${DB_HOST}"
    echo "  Port: ${DB_PORT}"
    echo "  Database: ${DB_DATABASE}"
    echo "  Username: ${DB_USERNAME}"
    exit 1
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders (only if needed)
echo "Running seeders..."
php artisan db:seed --force || echo "Seeder failed or already run, continuing..."

# Start Laravel
echo "Starting Laravel on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
