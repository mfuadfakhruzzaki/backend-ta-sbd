#!/bin/bash
# MySQL backup script for E-Commerce Barang Bekas project

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backup/mysql"
MYSQL_USER="root"
MYSQL_PASSWORD="root_password"
DATABASE="marketplace"
RETENTION_DAYS=7

# Log start of backup
echo "Starting MySQL backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform the backup
mysqldump -h localhost -u $MYSQL_USER -p$MYSQL_PASSWORD $DATABASE | gzip > "$BACKUP_DIR/$DATABASE-$TIMESTAMP.sql.gz"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_DIR/$DATABASE-$TIMESTAMP.sql.gz"
  
  # Delete backups older than RETENTION_DAYS
  find $BACKUP_DIR -name "$DATABASE-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  echo "Cleaned up backups older than $RETENTION_DAYS days"
else
  echo "Backup failed!"
  exit 1
fi

echo "Backup process completed at $(date)" 