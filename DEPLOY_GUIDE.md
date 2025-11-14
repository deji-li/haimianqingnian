# 服务器快速部署方案

## 📋 部署前准备

### 服务器环境要求
- 操作系统：Ubuntu 20.04+ / CentOS 7+
- Node.js：>= 18.x
- MySQL：>= 8.0
- Nginx：>= 1.18
- PM2：>= 5.x（进程管理）
- Git：>= 2.x

---

## 🚀 快速部署步骤

### 1. 拉取代码

```bash
# SSH方式（推荐）
cd /var/www
git clone git@github.com:deji-li/haimianqingnian.git crm
cd crm

# 或使用HTTPS方式
git clone https://github.com/deji-li/haimianqingnian.git crm
cd crm
```

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install --production
cd ..

# 安装后端依赖
cd backend
npm install --production
cd ..
```

### 3. 配置环境变量

```bash
# 后端环境配置
cd backend
cp .env.example .env.production

# 编辑配置文件
vim .env.production
```

**后端环境变量配置**（`.env.production`）：

```env
# 应用配置
NODE_ENV=production
PORT=3000
API_PREFIX=/api

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=crm_user
DB_PASSWORD=your_strong_password
DB_DATABASE=crm_production
DB_SYNCHRONIZE=false  # 生产环境务必设置为false
DB_LOGGING=false

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Redis配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# 海绵青年API配置
HAIMIAN_API_BASE_URL=https://haimianqingnian.com/api
HAIMIAN_API_KEY=your_haimian_api_key
```

**前端环境配置**（`frontend/.env.production`）：

```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_TITLE=教育培训CRM系统
```

### 4. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE crm_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON crm_production.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入初始数据（如果有）
# mysql -u crm_user -p crm_production < database/init.sql
```

**重要**：生产环境建议手动执行数据库迁移脚本，而不是依赖TypeORM的自动同步。

### 5. 构建项目

```bash
# 构建前端
cd frontend
npm run build
# 构建产物在 dist/ 目录

# 构建后端
cd ../backend
npm run build
# 构建产物在 dist/ 目录
```

### 6. 配置Nginx

```bash
# 创建Nginx配置文件
sudo vim /etc/nginx/sites-available/crm
```

**Nginx配置示例**：

```nginx
# HTTP 重定向到 HTTPS（可选）
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置（使用Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    location / {
        root /var/www/crm/frontend/dist;
        try_files $uri $uri/ /index.html;

        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 增加超时时间
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # 文件上传大小限制
    client_max_body_size 20M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

**启用Nginx配置**：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 7. 使用PM2启动后端

```bash
# 全局安装PM2
sudo npm install -g pm2

# 进入后端目录
cd /var/www/crm/backend

# 启动应用
pm2 start dist/main.js --name crm-api --max-memory-restart 500M

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs crm-api

# 查看状态
pm2 status
```

**PM2配置文件**（可选，`backend/ecosystem.config.js`）：

```javascript
module.exports = {
  apps: [{
    name: 'crm-api',
    script: './dist/main.js',
    instances: 2,  // 多进程
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
}
```

使用配置文件启动：

```bash
pm2 start ecosystem.config.js
```

### 8. 配置SSL证书（可选但推荐）

使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 自动配置SSL
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 9. 验证部署

```bash
# 检查后端API
curl https://your-domain.com/api/health

# 检查前端
curl https://your-domain.com

# 检查PM2状态
pm2 status

# 查看日志
pm2 logs crm-api --lines 50
```

---

## 🔄 更新部署

当代码有更新时，执行以下步骤：

```bash
# 1. 拉取最新代码
cd /var/www/crm
git pull origin master

# 2. 更新依赖（如果package.json有变化）
cd frontend && npm install
cd ../backend && npm install

# 3. 重新构建
cd /var/www/crm/frontend
npm run build

cd ../backend
npm run build

# 4. 重启后端服务
pm2 restart crm-api

# 5. 查看日志确认
pm2 logs crm-api --lines 20
```

**一键更新脚本**（`scripts/update.sh`）：

```bash
#!/bin/bash

set -e

echo "🚀 开始更新部署..."

# 进入项目目录
cd /var/www/crm

# 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin master

# 更新前端
echo "🎨 构建前端..."
cd frontend
npm install
npm run build

# 更新后端
echo "⚙️  构建后端..."
cd ../backend
npm install
npm run build

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart crm-api

# 显示状态
echo "✅ 更新完成！"
pm2 status

echo "📋 最近日志："
pm2 logs crm-api --lines 20 --nostream
```

使用方法：

```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

---

## 🛡️ 安全加固建议

### 1. 防火墙配置

```bash
# UFW防火墙
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# 限制SSH访问
sudo ufw limit 22/tcp
```

### 2. MySQL安全配置

```bash
# 运行MySQL安全脚本
sudo mysql_secure_installation

# 禁止root远程登录
# 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
```

### 3. 定期备份

**数据库备份脚本**（`scripts/backup-db.sh`）：

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/crm"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="crm_production"
DB_USER="crm_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_$DATE.sql

# 保留最近7天的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: $BACKUP_DIR/db_$DATE.sql.gz"
```

**设置定时任务**：

```bash
# 编辑crontab
crontab -e

# 每天凌晨2点备份数据库
0 2 * * * /var/www/crm/scripts/backup-db.sh >> /var/log/crm-backup.log 2>&1
```

### 4. 日志轮转

**PM2日志轮转**：

```bash
pm2 install pm2-logrotate

pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 📊 监控和运维

### 1. PM2监控

```bash
# 启用PM2 Web监控
pm2 web

# 访问：http://your-server:9615
```

### 2. 系统资源监控

```bash
# 安装htop
sudo apt-get install htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. Nginx日志分析

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log

# 统计访问量
cat /var/log/nginx/access.log | wc -l
```

---

## 🔧 常见问题排查

### 问题1：后端启动失败

```bash
# 查看PM2日志
pm2 logs crm-api

# 常见原因：
# 1. 数据库连接失败 - 检查.env配置
# 2. 端口被占用 - 更换端口或关闭占用进程
# 3. 依赖缺失 - 重新npm install
```

### 问题2：前端页面白屏

```bash
# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 常见原因：
# 1. 路由配置错误 - 检查try_files配置
# 2. 权限问题 - chmod -R 755 frontend/dist
```

### 问题3：数据库连接超时

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 重启MySQL
sudo systemctl restart mysql

# 检查连接数
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### 问题4：文件上传失败

```bash
# 检查上传目录权限
ls -la backend/uploads

# 设置权限
chmod -R 755 backend/uploads
chown -R www-data:www-data backend/uploads

# 检查Nginx配置
# client_max_body_size 20M;
```

---

## 📞 技术支持

### 日志位置
- **Nginx访问日志**: `/var/log/nginx/access.log`
- **Nginx错误日志**: `/var/log/nginx/error.log`
- **PM2日志**: `~/.pm2/logs/`
- **应用日志**: `/var/www/crm/backend/logs/`

### 性能优化建议
1. 启用Redis缓存
2. 配置CDN加速静态资源
3. 数据库查询优化（添加索引）
4. 启用Gzip压缩
5. 使用PM2集群模式

### 扩展性建议
1. 使用Nginx负载均衡
2. 数据库主从复制
3. 文件存储迁移到OSS
4. 使用Docker容器化部署

---

## 📝 部署检查清单

- [ ] 服务器环境准备完成
- [ ] 代码拉取成功
- [ ] 依赖安装完成
- [ ] 环境变量配置正确
- [ ] 数据库初始化完成
- [ ] 前端构建成功
- [ ] 后端构建成功
- [ ] Nginx配置正确
- [ ] SSL证书配置完成
- [ ] PM2启动成功
- [ ] 访问测试通过
- [ ] 防火墙配置完成
- [ ] 备份脚本配置完成
- [ ] 日志轮转配置完成
- [ ] 监控配置完成

---

**文档版本**: v1.0
**最后更新**: 2025年1月
**适用环境**: Ubuntu 20.04+ / CentOS 7+

---

## 🎉 部署完成

恭喜！如果所有步骤都执行成功，您的CRM系统现在应该已经可以通过 `https://your-domain.com` 访问了。

如遇问题，请检查上述日志文件或联系技术支持。
