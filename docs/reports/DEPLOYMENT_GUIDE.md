# 企业知识库系统部署指南

## 📋 部署概览

本次更新添加了完整的企业知识库系统，包括：
- 后端：7个数据库表，37个API接口
- 前端：6个功能页面
- 数据库：索引优化 + 200+行业问题 + 100条示例数据

## 🚀 快速部署（推荐）

### 方式一：使用一键部署脚本

#### Windows服务器
```bash
# 1. 拉取最新代码
git pull origin master

# 2. 执行部署脚本
.\deploy.bat
```

#### Linux服务器
```bash
# 1. 拉取最新代码
git pull origin master

# 2. 赋予执行权限
chmod +x deploy.sh

# 3. 执行部署脚本
./deploy.sh
```

部署脚本会自动完成：
- ✅ 数据库迁移（创建表、索引、初始数据）
- ✅ 后端依赖安装
- ✅ 前端依赖安装和构建
- ✅ 服务重启

---

## 📝 手动部署步骤

如果您想手动控制部署流程，请按以下步骤操作：

### 第一步：拉取代码

```bash
# 切换到项目目录
cd /your/project/path

# 拉取最新代码
git pull origin master
```

### 第二步：数据库更新

#### 方式A：使用合并脚本（推荐）

```bash
# Windows
cd backend\database
mysql -u root -p your_database_name < update_all.sql

# Linux
cd backend/database
mysql -u root -p your_database_name < update_all.sql
```

#### 方式B：逐个执行迁移文件

```bash
cd backend/database/migrations

# 1. 创建知识库核心表
mysql -u root -p your_database_name < 001_create_enterprise_knowledge_tables.sql

# 2. 创建挖掘相关表
mysql -u root -p your_database_name < 002_create_knowledge_mining_tables.sql

# 3. 创建反馈表
mysql -u root -p your_database_name < 003_create_knowledge_feedback_table.sql

# 4. 创建使用日志表
mysql -u root -p your_database_name < 004_create_knowledge_usage_log_table.sql

# 5. 创建行业问题表
mysql -u root -p your_database_name < 005_create_industry_questions_table.sql

# 6. 添加性能索引
mysql -u root -p your_database_name < 006_add_knowledge_indexes.sql

# 7. 导入200+行业问题（可选）
mysql -u root -p your_database_name < 007_init_more_industry_questions.sql

# 8. 导入100条示例知识（可选）
mysql -u root -p your_database_name < 008_init_sample_knowledge_data.sql
```

### 第三步：后端部署

```bash
cd backend

# 1. 安装依赖（如有新增）
npm install

# 2. 构建项目
npm run build

# 3. 重启服务
# 使用PM2
pm2 restart crm-backend

# 或使用其他方式重启
```

### 第四步：前端部署

```bash
cd frontend

# 1. 安装依赖（如有新增）
npm install

# 2. 构建生产版本
npm run build

# 3. 部署dist目录到Web服务器
# Nginx示例：将dist目录内容复制到 /var/www/html/
```

---

## 🗄️ 数据库变更详情

### 新增表（7个）

| 表名 | 说明 | 记录数 |
|------|------|--------|
| `enterprise_knowledge_base` | 企业知识库主表 | 0（可导入100条示例） |
| `knowledge_mining_batch` | 知识挖掘批次表 | 0 |
| `knowledge_mining_candidate` | 挖掘候选知识表 | 0 |
| `knowledge_feedback` | 知识负反馈表 | 0 |
| `knowledge_usage_log` | 知识使用日志表 | 0 |
| `industry_question_library` | 行业问题库表 | 0（可导入200+条） |
| `ai_field_mapping_config` | AI字段映射配置表 | 0 |

### 性能优化（38个索引）

```sql
-- 知识库表索引（14个）
CREATE INDEX idx_ekb_status ON enterprise_knowledge_base(status);
CREATE INDEX idx_ekb_scene_category ON enterprise_knowledge_base(sceneCategory);
-- ... 等38个索引
```

### 初始数据（可选）

- **行业问题库**：200+条（金融50、医疗50、零售50、IT50）
- **示例知识**：100条（教育行业）

---

## 🌐 前端路由变更

新增路由组：`/knowledge`

```
/knowledge                      # 企业知识库
  ├── /init                    # 初始化向导
  ├── /list                    # 知识管理
  ├── /search                  # 智能搜索
  ├── /mining                  # AI知识挖掘
  ├── /feedback                # 负反馈管理
  └── /statistics              # 使用统计
```

---

## 📦 新增文件清单

### 后端文件（45个）

#### 核心模块
```
backend/src/modules/enterprise-knowledge/
├── enterprise-knowledge.module.ts
├── enterprise-knowledge.controller.ts
├── enterprise-knowledge.service.ts
├── knowledge-integration.service.ts
├── dto/ (11个DTO文件)
└── entities/ (7个实体文件)
```

#### 共享服务
```
backend/src/common/services/ai/
├── ai-shared.module.ts
├── ai-config-caller.service.ts
└── field-mapping.service.ts
```

#### AI助手增强
```
backend/src/modules/ai-chat/
├── ai-assistant.controller.ts
├── ai-assistant.service.ts
└── dto/ai-assistant.dto.ts
```

#### 数据库迁移
```
backend/database/migrations/
├── 001_create_enterprise_knowledge_tables.sql
├── 002_create_knowledge_mining_tables.sql
├── 003_create_knowledge_feedback_table.sql
├── 004_create_knowledge_usage_log_table.sql
├── 005_create_industry_questions_table.sql
├── 006_add_knowledge_indexes.sql
├── 007_init_more_industry_questions.sql (200+条)
└── 008_init_sample_knowledge_data.sql (100条)
```

### 前端文件（8个）

```
frontend/src/api/knowledge.ts                    # API接口

frontend/src/views/knowledge/
├── Init.vue                                     # 初始化向导
├── List.vue                                     # 知识管理
├── Search.vue                                   # 智能搜索
├── Mining.vue                                   # AI挖掘
├── Feedback.vue                                 # 负反馈
└── Statistics.vue                               # 使用统计

frontend/src/router/index.ts                     # 路由配置（已更新）
```

---

## ✅ 部署验证

### 1. 数据库验证

```sql
-- 检查表是否创建成功
SHOW TABLES LIKE '%knowledge%';
SHOW TABLES LIKE 'industry_question_library';

-- 检查索引是否创建
SHOW INDEX FROM enterprise_knowledge_base;

-- 检查行业问题数量（如果导入了）
SELECT COUNT(*) FROM industry_question_library;

-- 检查示例知识数量（如果导入了）
SELECT COUNT(*) FROM enterprise_knowledge_base;
```

### 2. 后端API验证

访问 Swagger 文档：
```
http://your-domain/api/docs
```

检查以下API分组是否存在：
- ✅ enterprise-knowledge（企业知识库）
- ✅ ai-assistant（AI助手）

### 3. 前端页面验证

访问以下页面确认是否正常：
- ✅ http://your-domain/knowledge/init - 初始化向导
- ✅ http://your-domain/knowledge/list - 知识管理
- ✅ http://your-domain/knowledge/search - 智能搜索
- ✅ http://your-domain/knowledge/mining - AI挖掘
- ✅ http://your-domain/knowledge/feedback - 负反馈
- ✅ http://your-domain/knowledge/statistics - 使用统计

### 4. 功能测试

#### 基础测试
1. 访问初始化向导，完成4步初始化
2. 在知识管理页面创建一条知识
3. 在智能搜索页面搜索刚创建的知识
4. 查看使用统计页面是否正常显示

#### 高级测试
1. 启动一次AI知识挖掘任务
2. 审核挖掘出的知识
3. 提交负反馈
4. 查看统计图表是否正常

---

## 🔧 环境要求

### 后端
- Node.js >= 16.x
- MySQL >= 5.7
- PM2（推荐）

### 前端
- Node.js >= 16.x
- Nginx 或其他Web服务器

---

## 🐛 常见问题

### Q1: 数据库导入失败

**原因**：字符编码问题或SQL语法不兼容

**解决**：
```bash
# 确保使用UTF-8编码
mysql -u root -p --default-character-set=utf8mb4 your_database_name < update_all.sql
```

### Q2: 前端路由404

**原因**：Nginx配置未设置history模式

**解决**：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Q3: API请求跨域错误

**原因**：后端CORS配置问题

**解决**：
检查 `backend/src/main.ts` 中的CORS配置：
```typescript
app.enableCors({
  origin: ['http://your-frontend-domain'],
  credentials: true,
});
```

### Q4: 知识库功能菜单不显示

**原因**：用户权限不足

**解决**：
1. 检查用户角色权限
2. 在系统管理 > 角色权限中，为相应角色添加知识库模块权限

---

## 📞 技术支持

如遇到部署问题，请检查：
1. 日志文件：`backend/logs/`
2. 浏览器控制台错误
3. 网络请求响应

---

## 📊 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Vue 3)                          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │初始化向导│知识管理  │智能搜索  │AI挖掘    │负反馈    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     后端 (NestJS)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  EnterpriseKnowledgeModule (37个API接口)             │  │
│  │  ├─ 知识CRUD                                         │  │
│  │  ├─ 智能搜索                                         │  │
│  │  ├─ AI挖掘                                           │  │
│  │  ├─ 负反馈管理                                       │  │
│  │  └─ 使用统计                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  KnowledgeIntegrationService (集成服务)              │  │
│  │  └─ 为其他模块提供知识库查询接口                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ TypeORM
┌─────────────────────────────────────────────────────────────┐
│                       MySQL数据库                            │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │知识库主表    │行业问题库    │AI字段映射配置        │   │
│  ├──────────────┼──────────────┼──────────────────────┤   │
│  │挖掘批次表    │挖掘候选表    │负反馈表              │   │
│  ├──────────────┴──────────────┴──────────────────────┤   │
│  │使用日志表 (含38个性能优化索引)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 下一步建议

部署完成后，建议按以下顺序开始使用：

1. **初始化企业信息**
   - 访问 `/knowledge/init`
   - 完成4步初始化向导

2. **导入基础知识**
   - 方式1：使用初始化向导导入行业问题
   - 方式2：在知识管理页面手动创建
   - 方式3：使用批量导入功能

3. **配置AI集成**
   - 在系统管理 > AI配置中设置API密钥
   - 配置知识库相关的AI场景

4. **开始使用**
   - 在AI对话中自动引用知识库
   - 定期启动知识挖掘任务
   - 处理负反馈优化知识质量

---

**部署日期**：2025-11-17
**版本**：v1.0.0
**开发者**：Claude Code
