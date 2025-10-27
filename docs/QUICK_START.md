# 快速开始指南

本文档将指导您快速启动教育培训CRM管理系统。

## 环境要求

- Node.js 18+ 或 20+
- Docker & Docker Compose
- Git

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd education-crm
```

### 2. 安装依赖

```bash
# 方式一：使用根目录脚本（推荐）
npm run install:all

# 方式二：分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 3. 启动 Docker 容器（MySQL + Redis）

```bash
# 启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

**重要提示**：
- 首次启动会自动执行数据库初始化脚本（database/init.sql）
- MySQL 端口：3306
- Redis 端口：6379
- MySQL 账号：crm_user / crm_pass123
- Redis 密码：redis123456

### 4. 启动后端服务

```bash
cd backend
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动

访问 API 文档：`http://localhost:3000/api`

### 5. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 6. 登录系统

打开浏览器访问：`http://localhost:5173`

**默认测试账号**：
- 超级管理员：`admin` / `123456`
- 销售账号1：`sales01` / `123456`
- 销售账号2：`sales02` / `123456`
- 校区主管：`campus01` / `123456`
- 财务账号：`finance01` / `123456`

## 常见问题

### 1. Docker 容器启动失败

**问题**：`docker-compose up -d` 失败

**解决方案**：
```bash
# 检查端口占用
netstat -ano | findstr 3306
netstat -ano | findstr 6379

# 停止并删除旧容器
docker-compose down -v

# 重新启动
docker-compose up -d
```

### 2. 数据库连接失败

**问题**：后端启动时提示数据库连接失败

**解决方案**：
```bash
# 确认 Docker 容器正在运行
docker ps

# 查看 MySQL 日志
docker logs education-crm-mysql

# 等待 MySQL 完全启动（约 30 秒）
# 然后重新启动后端
```

### 3. 前端无法访问后端 API

**问题**：前端请求 API 时 404 错误

**解决方案**：
1. 确认后端服务已启动（http://localhost:3000）
2. 检查 Vite 代理配置（frontend/vite.config.ts）
3. 清除浏览器缓存

### 4. 端口被占用

**问题**：3000 或 5173 端口已被占用

**解决方案**：
```bash
# 修改后端端口：backend/.env.development
APP_PORT=3001

# 修改前端端口：frontend/.env.development
VITE_APP_PORT=5174

# 或者在 package.json 中修改启动命令
"dev": "vite --port 5174"
```

## 开发模式快速命令

```bash
# 根目录同时启动前后端（需要先安装 concurrently）
npm run dev

# 单独启动前端
npm run dev:frontend

# 单独启动后端
npm run dev:backend

# Docker 操作
npm run docker:up      # 启动容器
npm run docker:down    # 停止容器
npm run docker:logs    # 查看日志
```

## 数据库管理

### 连接数据库

使用任意 MySQL 客户端连接：

- **主机**：localhost
- **端口**：3306
- **用户名**：crm_user
- **密码**：crm_pass123
- **数据库**：education_crm

### 重置数据库

```bash
# 停止容器并删除数据
docker-compose down -v

# 重新启动（会自动执行初始化脚本）
docker-compose up -d
```

## 项目结构

```
education-crm/
├── frontend/           # Vue3 前端
├── backend/            # Nest.js 后端
├── database/           # 数据库脚本
├── docker/             # Docker 配置
├── docs/               # 文档
├── docker-compose.yml  # Docker 编排
└── README.md
```

## 下一步

现在您已经成功启动了系统！接下来可以：

1. 查看 [数据库设计文档](./DATABASE.md) 了解数据结构
2. 查看 [API 文档](http://localhost:3000/api) 了解接口定义
3. 开始开发业务功能模块

## 需要帮助？

如果遇到问题，请查看：
- [项目 README](../README.md)
- [数据库文档](./DATABASE.md)
- [部署文档](./DEPLOY.md)

祝您开发愉快！ 🚀
