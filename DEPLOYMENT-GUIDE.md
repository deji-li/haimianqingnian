# 教育CRM系统 - 部署指南

**文档版本**: 1.0
**更新日期**: 2025-12-26
**系统版本**: Education CRM v2.0

---

## 📋 目录

1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [数据库配置](#数据库配置)
4. [后端部署](#后端部署)
5. [前端部署](#前端部署)
6. [验证部署](#验证部署)
7. [常见问题](#常见问题)
8. [维护指南](#维护指南)

---

## 系统要求

### 最低配置

| 组件 | 要求 |
|------|------|
| 操作系统 | Windows 10+, Linux (Ubuntu 20.04+), macOS 10.15+ |
| Node.js | v16.x 或更高版本 |
| MySQL | 8.0+ |
| 内存 | 最低 4GB，推荐 8GB+ |
| 磁盘 | 最低 10GB 可用空间 |
| CPU | 双核或更高 |

### 软件依赖

```bash
# 后端
Node.js >= 16.x
npm >= 8.x
MySQL 8.0+
TypeScript 5.x

# 前端
Node.js >= 16.x
npm >= 8.x
Vue 3.x
Element Plus
```

---

## 环境准备

### 1. 安装Node.js

**Windows**:
```bash
# 下载安装包
https://nodejs.org/

# 验证安装
node -v
npm -v
```

**Linux/macOS**:
```bash
# 使用nvm安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
nvm use 16
```

### 2. 安装MySQL

**Windows**:
```bash
# 下载MySQL Installer
https://dev.mysql.com/downloads/installer/
```

**Linux (Ubuntu)**:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS**:
```bash
brew install mysql
brew services start mysql
```

### 3. 克隆项目

```bash
cd D:\CC\1.1
# 或
cd /path/to/project
```

---

## 数据库配置

### 1. 创建数据库

```sql
-- 登录MySQL
mysql -uroot -p

-- 创建数据库
CREATE DATABASE education_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON education_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 导入初始数据

```bash
# 方式1: 使用SQL文件（如果有）
mysql -uroot -p123456 education_crm < backend/init-data.sql

# 方式2: 执行初始化脚本
mysql -uroot -p123456 education_crm < backend/add-new-permissions-fixed.sql
mysql -uroot -p123456 education_crm < backend/configure-role-permissions.sql
mysql -uroot -p123456 education_crm < backend/init-training-coach-complete.sql
```

### 3. 验证数据库

```sql
-- 检查表数量
USE education_crm;
SHOW TABLES;

-- 预期: 88个表

-- 检查关键表
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM permissions;
SELECT COUNT(*) FROM customers;
```

---

## 后端部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

编辑 `backend/.env`:

```env
# AI服务配置
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=education_crm

# JWT配置
JWT_SECRET=your-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000
```

### 3. 构建项目

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

### 4. 验证后端启动

```bash
# 检查端口
netstat -ano | findstr :3000

# 或使用curl测试
curl http://localhost:3000

# 预期输出: {"message":"Education CRM API"}
```

### 5. 后端进程管理（生产环境）

**使用PM2**:

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start dist/main.js --name education-crm-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs education-crm-backend

# 重启应用
pm2 restart education-crm-backend

# 停止应用
pm2 stop education-crm-backend
```

---

## 前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量

编辑 `frontend/.env.production`:

```env
# API地址
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# 应用配置
VITE_APP_TITLE=教育CRM系统
```

### 3. 构建项目

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
```

### 4. 部署静态文件

**方式1: 使用Nginx**

```bash
# 安装Nginx
sudo apt install nginx  # Linux
# 或下载Windows版本

# 配置Nginx
sudo nano /etc/nginx/sites-available/education-crm
```

Nginx配置示例:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置:

```bash
sudo ln -s /etc/nginx/sites-available/education-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**方式2: 使用 serve (简单部署)**

```bash
# 安装serve
npm install -g serve

# 启动服务
cd frontend/dist
serve -s . -l 8080
```

### 5. 验证前端部署

访问: `http://localhost:8080`

预期: 登录页面正常显示

---

## 验证部署

### 1. 后端健康检查

```bash
# 健康检查端点
curl http://localhost:3000/health

# 预期输出
{"status":"ok","timestamp":"2025-12-26T..."}
```

### 2. 数据库连接测试

```bash
# 在后端项目中
npm run test:db

# 或手动测试
mysql -uroot -p123456 education_crm -e "SELECT COUNT(*) FROM users;"
```

### 3. 功能验证清单

| 功能模块 | 测试点 | 状态 |
|----------|--------|------|
| 用户登录 | 输入用户名密码登录 | ⬜ |
| 客户管理 | 创建/编辑/删除客户 | ⬜ |
| 订单管理 | 查看订单列表 | ⬜ |
| AI助手 | 发送消息测试 | ⬜ |
| 知识库 | 搜索知识 | ⬜ |
| 培训陪练 | 创建培训会话 | ⬜ |
| 企业微信 | 查看配置 | ⬜ |

### 4. 性能验证

```bash
# 后端响应时间
time curl http://localhost:3000/api/customers

# 数据库查询性能
mysql -uroot -p123456 education_crm -e "SHOW PROCESSLIST;"
```

---

## 常见问题

### 问题1: 后端启动失败 - 数据库连接错误

**错误信息**:
```
Error: Access denied for user 'root'@'localhost'
```

**解决方案**:
1. 检查 `.env` 文件中的数据库密码
2. 确认MySQL服务正在运行
3. 验证用户权限

```bash
# 重启MySQL (Linux)
sudo systemctl restart mysql

# Windows
# 在服务管理器中重启MySQL服务
```

### 问题2: 前端构建失败 - 模块未找到

**错误信息**:
```
Error: Cannot find module 'xxx'
```

**解决方案**:
```bash
# 清理缓存
rm -rf node_modules
rm package-lock.json

# 重新安装
npm install
```

### 问题3: API跨域错误

**错误信息**:
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**解决方案**:

检查 `backend/src/main.ts` 中的CORS配置:

```typescript
app.enableCors({
  origin: '*', // 生产环境应指定具体域名
  credentials: true,
});
```

### 问题4: 权限不足

**错误信息**:
```
403 Forbidden - Insufficient permissions
```

**解决方案**:

1. 确认用户角色已分配权限
2. 检查权限表数据

```sql
-- 查看用户权限
SELECT u.username, r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id
WHERE u.username = 'admin';
```

### 问题5: AI功能无响应

**错误信息**:
```
AI service unavailable
```

**解决方案**:

1. 检查 `.env` 中的AI API配置
2. 验证API Key是否有效
3. 检查网络连接

```bash
# 测试API连接
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hello"}]}'
```

---

## 维护指南

### 日常维护

#### 1. 日志监控

```bash
# 后端日志
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# PM2日志
pm2 logs education-crm-backend

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 2. 数据库备份

```bash
# 备份数据库
mysqldump -uroot -p123456 education_crm > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -uroot -p123456 education_crm < backup_20251226.sql
```

自动化备份脚本 (`backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -uroot -p123456 education_crm | gzip > $BACKUP_DIR/education_crm_$DATE.sql.gz

# 保留最近30天的备份
find $BACKUP_DIR -name "education_crm_*.sql.gz" -mtime +30 -delete
```

#### 3. 系统更新

```bash
# 更新后端
cd backend
git pull
npm install
npm run build
pm2 restart education-crm-backend

# 更新前端
cd frontend
git pull
npm install
npm run build

# 重启Nginx
sudo systemctl reload nginx
```

### 性能优化

#### 1. 数据库优化

```sql
-- 检查慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- 分析表
ANALYZE TABLE customers;
ANALYZE TABLE orders;

-- 优化表
OPTIMIZE TABLE customers;
OPTIMIZE TABLE orders;
```

#### 2. 索引优化

```sql
-- 查看索引使用情况
SHOW INDEX FROM customers;
SHOW INDEX FROM orders;

-- 添加索引（如需要）
CREATE INDEX idx_customer_phone ON customers(phone);
CREATE INDEX idx_order_date ON orders(created_time);
```

#### 3. 缓存配置

考虑使用Redis缓存:

```bash
# 安装Redis
sudo apt install redis-server

# 启动Redis
sudo systemctl start redis
```

### 安全加固

#### 1. 修改默认密码

```sql
-- 修改数据库密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_strong_password';

-- 修改JWT密钥
# 编辑 backend/.env
JWT_SECRET=use-strong-random-secret-here
```

#### 2. 启用HTTPS

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 3. 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 📞 技术支持

### 联系方式

- 技术文档: `DEVELOPMENT-HANDBOOK.md`
- 实施进度: `IMPLEMENTATION-PROGRESS.md`
- 问题反馈: GitHub Issues

### 快速诊断命令

```bash
# 系统状态检查
echo "=== 后端状态 ==="
pm2 status

echo "=== 数据库状态 ==="
sudo systemctl status mysql

echo "=== Nginx状态 ==="
sudo systemctl status nginx

echo "=== 磁盘空间 ==="
df -h

echo "=== 内存使用 ==="
free -h

echo "=== 端口占用 ==="
netstat -tuln | grep -E ':(3000|80|443|3306)'
```

---

**文档生成时间**: 2025-12-26
**维护人员**: Claude Code Assistant
**下次更新**: 根据实际部署情况更新
