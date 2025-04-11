#!/bin/bash
# docker-entrypoint.sh

# Exit on error
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    sleep 1
done

# Create config directory in /tmp where we have write access
mkdir -p /tmp/config
cat > /tmp/config/config.json << EOF
{
  "development": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$DB_NAME",
    "host": "$DB_HOST",
    "dialect": "mysql",
    "port": 3306
  },
  "production": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$DB_NAME",
    "host": "$DB_HOST",
    "dialect": "mysql",
    "port": 3306
  }
}
EOF

# Run database migrations with custom config path and migrations path
echo "Running database migrations..."
npx sequelize-cli db:migrate --config /tmp/config/config.json --migrations-path /app/migrations

# Check if admin user exists before seeding
echo "Checking if admin user exists..."
ADMIN_EXISTS=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM USER WHERE role = 'admin'" -s)

# Run seeders only if no admin user found
if [ "$ADMIN_EXISTS" -eq "0" ]; then
  echo "No admin user found. Running database seeders..."
  npx sequelize-cli db:seed:all --config /tmp/config/config.json --seeders-path /app/seeders
else
  echo "Admin user already exists. Skipping seeders."
fi

# Start the application
echo "Starting the application..."
exec node app.js 