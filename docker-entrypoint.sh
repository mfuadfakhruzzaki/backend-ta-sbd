#!/bin/bash
# docker-entrypoint.sh

# Exit on error
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    sleep 1
done

# Create config.json from environment variables
cat > /app/config/config.json << EOF
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

# Run database migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate

# Start the application
echo "Starting the application..."
exec node server.js 