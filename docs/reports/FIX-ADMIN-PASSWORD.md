# 修复 Admin 密码和 HTTPS 问题

## 问题1：Admin 密码重置

### 方法一：通过SQL脚本重置（推荐）

**在服务器上执行以下命令：**

```bash
# 1. 进入项目目录
cd /root/crm

# 2. 上传 reset-admin-password.sql 到服务器
# （从本地上传该文件到服务器的 /root/crm 目录）

# 3. 连接到MySQL容器并执行SQL
docker exec -i crm-mysql mysql -uroot -p教育CRM@2024 education_crm < reset-admin-password.sql
```

### 方法二：直接通过MySQL命令行

```bash
# 连接到MySQL容器
docker exec -it crm-mysql mysql -uroot -p教育CRM@2024

# 在MySQL命令行中执行
USE education_crm;
UPDATE users SET password = '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC' WHERE username = 'admin';
SELECT id, username, real_name FROM users WHERE username = 'admin';
EXIT;
```

### 重置后的登录信息

- **用户名**: `admin`
- **密码**: `123456`

---

## 问题2：HTTP "不安全" 警告

### 问题说明

浏览器显示 "不安全" 是因为网站使用 HTTP 协议（未加密），这是**正常现象**。

- ✅ **不影响使用**：可以继续使用，只是数据传输未加密
- ⚠️ **生产环境建议**：配置 HTTPS 以保护数据安全

### 解决方案：配置 HTTPS（可选）

#### 步骤1：申请SSL证书

**选项A：使用 Let's Encrypt 免费证书（推荐）**

```bash
# 1. 安装 Certbot
apt update
apt install certbot

# 2. 申请证书（需要有域名）
certbot certonly --standalone -d yourdomain.com

# 证书会生成在：
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**选项B：购买商业证书**

从阿里云、腾讯云等购买SSL证书

#### 步骤2：配置 Nginx HTTPS

**修改 `frontend/nginx.conf`：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # HTTP自动跳转到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置保持不变...
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**修改 `docker-compose.yml` 挂载证书：**

```yaml
frontend:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro  # 挂载证书目录
  ports:
    - "80:80"
    - "443:443"  # 添加HTTPS端口
```

#### 步骤3：重新部署

```bash
# 重新构建并启动
docker-compose up -d --build frontend
```

---

## 快速验证

### 1. 验证密码重置成功

```bash
# 在服务器上执行
docker exec -it crm-mysql mysql -uroot -p教育CRM@2024 -e "SELECT id, username, real_name FROM education_crm.users WHERE username='admin';"
```

### 2. 测试登录

1. 访问：`http://106.53.77.212/login`
2. 用户名：`admin`
3. 密码：`123456`

---

## 注意事项

1. **HTTP vs HTTPS**
   - HTTP：数据明文传输，不安全但可用
   - HTTPS：数据加密传输，需要SSL证书
   - 内网测试环境可以使用HTTP
   - 生产环境强烈建议配置HTTPS

2. **SSL证书续期**
   - Let's Encrypt 证书有效期90天
   - 需要设置自动续期：`certbot renew --dry-run`
   - 添加定时任务：`0 3 * * * certbot renew --quiet`

3. **安全建议**
   - 首次登录后立即修改admin密码
   - 定期更换密码
   - 生产环境必须配置HTTPS
