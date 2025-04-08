#!/bin/bash
# Database initialization script for E-Commerce Barang Bekas project

echo "Starting database initialization at $(date)"

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
for i in {1..30}; do
  if mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; then
    echo "MySQL is ready!"
    break
  fi
  echo "Waiting for MySQL to start... ($i/30)"
  sleep 1
done

# Check if schema initialization is needed
SCHEMA_EXISTS=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME" | wc -l)

if [ "$SCHEMA_EXISTS" -eq 0 ]; then
  echo "Initializing database schema..."
  
  # Create database if not exists
  mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  
  # Import schema
  mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /app/knowledge/schema.sql
  
  echo "Database schema initialized successfully."
else
  echo "Database already exists, skipping initialization."
fi

echo "Database setup completed at $(date)" 