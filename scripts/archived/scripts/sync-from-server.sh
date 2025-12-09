#!/bin/bash
# Sync database from server to local

SERVER_HOST="106.53.77.212"
SERVER_USER="root"
SERVER_PASSWORD="7821630lideji"
SERVER_DB="education_crm"
LOCAL_PASSWORD="123456"
LOCAL_DB="education_crm"

echo "================================"
echo "Sync Database from Server"
echo "================================"
echo ""

echo "[1/2] Exporting database from server..."
docker exec crm-mysql mysqldump -uroot -p${SERVER_PASSWORD} \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --skip-lock-tables \
  ${SERVER_DB} > server-backup.sql

if [ $? -ne 0 ]; then
  echo "Error: Failed to export from server"
  exit 1
fi

echo "  Exported $(wc -l < server-backup.sql) lines"
echo ""

echo "[2/2] Importing to local database..."
# Drop and recreate database
MYSQL_PWD=${LOCAL_PASSWORD} mysql -uroot -e "DROP DATABASE IF EXISTS ${LOCAL_DB};"
MYSQL_PWD=${LOCAL_PASSWORD} mysql -uroot -e "CREATE DATABASE ${LOCAL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import
MYSQL_PWD=${LOCAL_PASSWORD} mysql -uroot --default-character-set=utf8mb4 ${LOCAL_DB} < server-backup.sql

if [ $? -eq 0 ]; then
  echo "  Import successful!"
  echo ""

  # Update admin password for local use
  MYSQL_PWD=${LOCAL_PASSWORD} mysql -uroot ${LOCAL_DB} -e "UPDATE users SET password = '\$2b\$10\$O5JAAV.9y0cv3StqlwF8ses.apDi2UDnl/zKW4JBi/9i32IhKXepi' WHERE username = 'admin';"

  echo "================================"
  echo "Sync Complete!"
  echo "================================"
  echo ""
  echo "Admin password has been reset to: admin123"
  echo ""
else
  echo "Error: Import failed"
  exit 1
fi
