#!/bin/bash
# Run this on the SERVER (106.53.77.212)

echo "Exporting database from Docker container..."
docker exec crm-mysql mysqldump -uroot -p7821630lideji \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --skip-lock-tables \
  education_crm > /root/crm/education_crm_backup.sql

echo "Backup created at: /root/crm/education_crm_backup.sql"
echo "Size: $(du -h /root/crm/education_crm_backup.sql)"
echo ""
echo "Next steps:"
echo "1. Commit this file to git: cd /root/crm && git add education_crm_backup.sql && git commit -m 'feat: backup database' && git push"
echo "2. On local machine, pull from git and import"
