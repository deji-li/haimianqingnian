# 教育培训 CRM+OA+OKR 系统

## 项目简介

这是一个专为教育培训机构打造的企业级管理平台，集成了客户关系管理（CRM）、订单管理、财务统计、OKR绩效考核和数据可视化等功能。

### 核心功能

- **CRM客户管理**：客户登记、跟进记录、回访提醒、客户详情全链路展示
- **订单管理**：手工录入、Excel批量导入、新老客户自动判定、智能关联
- **财务统计**：销售排行榜、校区业绩对比、提成自动计算、多维度报表
- **OKR绩效考核**：目标设定、进度追踪、完成率计算、预警提醒
- **数据可视化**：管理仪表盘、数据大屏（1920×1080）、实时数据展示
- **权限管理**：基于角色的数据权限隔离，支持多人协作

### 技术栈

**前端**
- Vue 3.4 + TypeScript 5.3
- Element Plus 2.5（黄色主题定制）
- Pinia 2（状态管理）
- Vue Router 4
- ECharts 5（数据可视化）
- Vite 5

**后端**
- Node.js 20 LTS + Nest.js 10
- TypeORM 0.3 + MySQL 8.0
- Redis 7（缓存+会话）
- JWT（身份认证）
- Swagger（API文档）

**部署**
- Docker + Docker Compose
- Nginx（反向代理）
- PM2（进程管理）
- 阿里云 ECS

## 快速开始

### 环境要求

- Node.js 18+ / 20+
- Docker & Docker Compose
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd education-crm
```

2. **安装依赖**
```bash
npm run install:all
```

3. **启动 Docker 容器**（MySQL + Redis）
```bash
npm run docker:up
```

4. **启动开发服务器**
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端：http://localhost:5174
npm run dev:backend   # 后端：http://localhost:3000
```

5. **访问系统**
- 前端：http://localhost:5174
- 后端 API 文档：http://localhost:3000/api
- 默认管理员账号：`admin` / `123456`

### Docker 命令

```bash
# 启动容器
npm run docker:up

# 停止容器
npm run docker:down

# 查看日志
npm run docker:logs
```

## 项目结构

```
education-crm/
├── frontend/           # Vue3 前端
├── backend/            # Nest.js 后端
├── database/           # 数据库脚本
├── docker/             # Docker 配置
├── docs/               # 项目文档
├── docker-compose.yml  # Docker 编排
├── package.json        # Monorepo 配置
└── README.md
```

## 开发指南

详细开发文档请查看：
- [数据库设计文档](./docs/DATABASE.md)
- [API 接口文档](./docs/API.md)
- [部署文档](./docs/DEPLOY.md)
- [用户操作手册](./docs/USER_MANUAL.md)

## 系统特性

### 用户规模
- 支持 10-50 人同时在线
- 客户数据：1-10 万级别
- 订单量：每月 2000+ 条

### 性能优化
- 数据库索引优化
- Redis 缓存热点数据
- 前端虚拟滚动长列表
- 分页查询（每页 20-50 条）

### 安全特性
- JWT Token 认证
- 基于角色的权限控制（RBAC）
- 数据权限隔离
- SQL 注入防护
- XSS 攻击防护

## 角色权限

| 角色 | 权限说明 |
|------|---------|
| 超级管理员 | 查看和管理所有数据 |
| 校区主管 | 查看和管理本校区所有数据 |
| 销售主管 | 查看和管理本部门销售数据 |
| 销售 | 仅查看和管理自己的客户和订单 |
| 运营 | 查看流量数据，不能查看订单金额 |
| 财务 | 查看所有订单和财务报表 |

## 浏览器支持

- Chrome 90+（推荐）
- Edge 90+
- Firefox 88+
- Safari 14+

## 开发团队

Education CRM Team

## 许可证

MIT License

---

如有问题，请查看 [文档](./docs) 或提交 Issue。
