#!/bin/bash
# docker-entrypoint.sh

set -e

echo "Waiting for MySQL to be ready..."
./wait-for-it.sh db:3306 -- echo "MySQL is up"

echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "Starting the application..."
exec npm start 