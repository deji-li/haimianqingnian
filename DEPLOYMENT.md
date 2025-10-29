# 海绵青年CRM系统 - 生产环境部署文档

## 📋 目录

- [部署方案概述](#部署方案概述)
- [服务器要求](#服务器要求)
- [首次部署步骤](#首次部署步骤)
- [GitHub Actions配置](#github-actions配置)
- [日常更新流程](#日常更新流程)
- [常见问题](#常见问题)
- [运维管理](#运维管理)

---

## 🎯 部署方案概述

本项目采用 **Docker + GitHub Actions** 自动化部署方案：

- **容器化**：使用Docker容器化部署，环境一致性高
- **自动化**：通过GitHub Actions实现CI/CD，git push自动部署
- **服务编排**：使用docker-compose管理多个容器服务
- **反向代理**：Nginx作为前端服务器和API代理

**架构图：**

```
┌─────────────────────────────────────────────────┐
│                   用户浏览器                      │
└────────────────────┬────────────────────────────┘
                     │ HTTP (80端口)
                     ▼
┌─────────────────────────────────────────────────┐
│           Nginx容器 (crm-frontend)               │
│  - 提供前端静态文件                               │
│  - 反向代理API请求到后端                          │
└────────────────────┬────────────────────────────┘
                     │ /api/* → http://backend:3000
                     ▼
┌─────────────────────────────────────────────────┐
│          NestJS容器 (crm-backend)                │
│  - 处理API请求                                    │
│  - 业务逻辑处理                                   │
└────────────────────┬────────────────────────────┘
                     │ MySQL连接
                     ▼
┌─────────────────────────────────────────────────┐
│           MySQL容器 (crm-mysql)                  │
│  - 存储业务数据                                   │
│  - 持久化到数据卷                                 │
└─────────────────────────────────────────────────┘
```

---

## 💻 服务器要求

### 最低配置

- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **带宽**: 1Mbps
- **操作系统**: CentOS 7+、Ubuntu 18.04+、Debian 10+

### 推荐配置

- **CPU**: 4核
- **内存**: 8GB
- **硬盘**: 80GB SSD
- **带宽**: 5Mbps
- **操作系统**: Ubuntu 22.04 LTS

### 推荐服务商

- 阿里云轻量应用服务器：80-100元/月
- 腾讯云轻量应用服务器：80-100元/月
- 华为云云耀云服务器：70-90元/月

---

## 🚀 首次部署步骤

### 第一步：购买和配置服务器

1. **购买服务器**
   - 选择推荐配置的云服务器
   - 选择Ubuntu 22.04 LTS操作系统
   - 配置安全组，开放端口：80、443、22

2. **连接到服务器**
   ```bash
   ssh root@your_server_ip
   ```

### 第二步：安装必要软件

1. **更新系统**
   ```bash
   apt update && apt upgrade -y
   ```

2. **安装Docker**
   ```bash
   # 安装Docker
   curl -fsSL https://get.docker.com | bash

   # 启动Docker服务
   systemctl start docker
   systemctl enable docker

   # 验证安装
   docker --version
   ```

3. **安装Docker Compose**
   ```bash
   # 下载Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   # 添加执行权限
   chmod +x /usr/local/bin/docker-compose

   # 验证安装
   docker-compose --version
   ```

4. **安装Git**
   ```bash
   apt install git -y
   git --version
   ```

### 第三步：克隆项目代码

1. **创建项目目录**
   ```bash
   mkdir -p /var/www
   cd /var/www
   ```

2. **克隆代码库**
   ```bash
   # 替换为你的GitHub仓库地址
   git clone https://github.com/your-username/your-repo.git crm
   cd crm
   ```

### 第四步：配置环境变量

1. **复制环境变量模板**
   ```bash
   cp .env.example .env
   ```

2. **编辑环境变量**
   ```bash
   nano .env
   ```

3. **填写配置信息**
   ```env
   # 数据库配置
   DB_HOST=mysql
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_secure_password_123  # 修改为强密码
   DB_DATABASE=education_crm

   # JWT配置
   JWT_SECRET=your_jwt_secret_key_abc123xyz  # 修改为随机字符串
   JWT_EXPIRES_IN=7d

   NODE_ENV=production
   TZ=Asia/Shanghai
   ```

4. **生成安全的JWT密钥**（推荐）
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 第五步：首次启动

1. **构建并启动容器**
   ```bash
   docker-compose up -d --build
   ```

2. **查看容器状态**
   ```bash
   docker-compose ps
   ```

   正常情况下应该看到3个容器都是`Up`状态：
   ```
   NAME              STATUS        PORTS
   crm-mysql         Up           0.0.0.0:3306->3306/tcp
   crm-backend       Up (healthy) 0.0.0.0:3000->3000/tcp
   crm-frontend      Up (healthy) 0.0.0.0:80->80/tcp
   ```

3. **查看日志**
   ```bash
   # 查看所有容器日志
   docker-compose logs -f

   # 查看特定容器日志
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

4. **验证部署**
   - 打开浏览器访问：`http://your_server_ip`
   - 应该能看到登录页面
   - 使用默认管理员账号登录：
     - 用户名：`admin`
     - 密码：见`backend/init-admin.sql`中的配置

---

## ⚙️ GitHub Actions配置

### 配置GitHub Secrets

1. **进入GitHub仓库设置**
   - 打开你的GitHub仓库
   - 点击 `Settings` → `Secrets and variables` → `Actions`
   - 点击 `New repository secret`

2. **添加以下Secrets**

   | Secret名称 | 说明 | 示例值 |
   |-----------|------|--------|
   | `SERVER_HOST` | 服务器IP地址 | `123.45.67.89` |
   | `SERVER_USER` | SSH登录用户名 | `root` |
   | `SERVER_PORT` | SSH端口 | `22` |
   | `SERVER_SSH_KEY` | SSH私钥 | 见下方说明 |
   | `DEPLOY_PATH` | 部署路径 | `/var/www/crm` |

3. **生成SSH密钥对**

   在**本地电脑**上执行：
   ```bash
   # 生成SSH密钥对
   ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_deploy

   # 查看公钥
   cat ~/.ssh/github_actions_deploy.pub

   # 查看私钥
   cat ~/.ssh/github_actions_deploy
   ```

4. **配置服务器SSH密钥**

   在**服务器**上执行：
   ```bash
   # 添加公钥到authorized_keys
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "你的公钥内容" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

5. **添加私钥到GitHub Secrets**
   - 复制完整的私钥内容（包括`-----BEGIN ... -----`和`-----END ... -----`）
   - 在GitHub仓库设置中添加为`SERVER_SSH_KEY`

### 测试自动部署

1. **修改代码并提交**
   ```bash
   git add .
   git commit -m "test: 测试自动部署"
   git push origin master
   ```

2. **查看部署进度**
   - 打开GitHub仓库
   - 点击 `Actions` 标签
   - 查看最新的workflow运行状态

3. **部署成功标志**
   - Workflow显示绿色✅
   - 访问网站验证新代码已生效

---

## 🔄 日常更新流程

配置好GitHub Actions后，更新只需3步：

### 1. 本地开发和测试

```bash
# 开发新功能
# 本地测试确认无误
npm run dev
```

### 2. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin master
```

### 3. 自动部署

- GitHub Actions自动触发
- 1-3分钟后自动部署完成
- 访问网站验证更新

**就是这么简单！** 🎉

---

## ❓ 常见问题

### 1. 容器无法启动

**问题**：执行`docker-compose up`后容器一直重启

**排查步骤**：
```bash
# 查看容器日志
docker-compose logs backend

# 常见原因：
# 1. 数据库连接失败 → 检查.env中的数据库配置
# 2. 端口被占用 → 修改docker-compose.yml中的端口映射
# 3. 环境变量未配置 → 确认.env文件存在且配置正确
```

### 2. 数据库连接失败

**问题**：后端日志显示`ECONNREFUSED mysql:3306`

**解决方案**：
```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 如果MySQL未正常启动，查看日志
docker-compose logs mysql

# 重启MySQL容器
docker-compose restart mysql
```

### 3. 前端页面空白

**问题**：访问网站显示空白页

**排查步骤**：
```bash
# 1. 检查Nginx容器日志
docker-compose logs frontend

# 2. 进入容器检查文件
docker exec -it crm-frontend ls /usr/share/nginx/html

# 3. 重新构建前端
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### 4. API请求404

**问题**：前端页面能访问，但API请求返回404

**解决方案**：
```bash
# 检查后端容器是否正常
docker-compose ps backend

# 检查Nginx配置中的proxy_pass
docker exec -it crm-frontend cat /etc/nginx/conf.d/default.conf

# 重启前端容器
docker-compose restart frontend
```

### 5. GitHub Actions部署失败

**问题**：GitHub Actions workflow执行失败

**排查步骤**：
1. 检查GitHub Secrets是否配置正确
2. 测试SSH连接：`ssh -i ~/.ssh/your_key user@server_ip`
3. 查看workflow日志中的错误信息
4. 确认服务器磁盘空间充足：`df -h`

---

## 🛠️ 运维管理

### 查看日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看指定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# 查看最近100行日志
docker-compose logs --tail=100 backend
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
docker-compose restart frontend
```

### 停止服务

```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器（数据不会丢失）
docker-compose down
```

### 数据备份

#### 1. 备份数据库

```bash
# 导出数据库
docker exec crm-mysql mysqldump -uroot -p"your_password" education_crm > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i crm-mysql mysql -uroot -p"your_password" education_crm < backup_20240101.sql
```

#### 2. 备份上传文件

```bash
# 查看上传文件卷位置
docker volume inspect crm_upload_data

# 备份上传文件
docker run --rm -v crm_upload_data:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

### 清理空间

```bash
# 清理未使用的镜像
docker image prune -a -f

# 清理未使用的容器
docker container prune -f

# 清理未使用的卷（注意：会删除数据！）
docker volume prune -f

# 清理所有未使用资源
docker system prune -a -f
```

### 监控资源使用

```bash
# 查看容器资源使用情况
docker stats

# 查看磁盘使用
df -h

# 查看Docker占用空间
docker system df
```

### 更新Docker镜像

```bash
# 拉取最新基础镜像
docker pull mysql:8.0
docker pull nginx:alpine
docker pull node:18-alpine

# 重新构建并启动
docker-compose up -d --build
```

---

## 📞 技术支持

如遇到问题，请按以下优先级处理：

1. **查看本文档的常见问题章节**
2. **查看容器日志**：`docker-compose logs -f`
3. **检查服务器资源**：`docker stats` 和 `df -h`
4. **联系开发团队**

---

## 📝 更新日志

### 2024-01-01
- ✅ 初始版本
- ✅ Docker容器化配置
- ✅ GitHub Actions自动部署
- ✅ 完整部署文档

---

## 📄 许可证

MIT License
