#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
./wait-for-it.sh $DB_HOST:$DB_PORT -t 60

# Run migrations if needed (assuming you have sequelize setup)
# npx sequelize-cli db:migrate

# Run seeders
echo "Running seeders..."
node scripts/runSeeders.js

# Start the application
echo "Starting the application..."
npm start 