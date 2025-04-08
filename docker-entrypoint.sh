#!/bin/sh
# docker-entrypoint.sh

set -e

# Wait for MySQL to be ready
./wait-for-it.sh db:3306 -- echo "MySQL is up"

# Run database migrations
npx sequelize-cli db:migrate

# Start the application
exec npm start 