# AI话术助手 - 开发总结

## 项目概述

AI话术助手是一个基于企业知识库的智能话术生成与优化系统，包含4大核心功能：
- **帮你谈单**：保留对话历史的谈单话术生成
- **帮你回复**：保留对话历史的客户回复生成
- **话术润色**：单次使用的话术优化
- **开场白**：单次使用的开场白生成

## 开发完成内容

### 1. 数据库层（✅ 已完成）

#### 表结构（5张核心表）
- `ai_script_conversation` - 对话会话表
- `ai_script_message` - 对话消息表
- `ai_script_scenario` - 场景配置表（28个场景）
- `ai_script_technique` - 技巧配置表（245个技巧）
- `ai_script_feedback` - 反馈表

#### 初始化数据
- ✅ 9个场景 × 2功能（帮你谈单/帮你回复） = 18个场景
- ✅ 10个场景用于开场白
- ✅ 245个技巧配置（包含关键词映射）

**位置：**
- `backend/create-ai-script-tables.sql` - 建表脚本
- `backend/init-ai-script-data.sql` - 初始化数据脚本

---

### 2. 后端开发（✅ 已完成）

#### Entity实体层
**位置：** `backend/src/modules/ai-script-assistant/entities/`

- `ai-script-conversation.entity.ts` - 对话实体
- `ai-script-message.entity.ts` - 消息实体
- `ai-script-scenario.entity.ts` - 场景实体
- `ai-script-technique.entity.ts` - 技巧实体
- `ai-script-feedback.entity.ts` - 反馈实体

#### DTO层
**位置：** `backend/src/modules/ai-script-assistant/dto/`

- `scenario.dto.ts` - 场景相关DTO
- `technique.dto.ts` - 技巧相关DTO
- `conversation.dto.ts` - 对话相关DTO
- `feedback.dto.ts` - 反馈DTO

#### Service服务层（8个核心服务）
**位置：** `backend/src/modules/ai-script-assistant/services/`

1. **scenario.service.ts** - 场景管理服务
   - 查询场景列表
   - 场景的创建、更新

2. **technique.service.ts** - 技巧管理服务
   - 查询技巧列表
   - 技巧的创建、更新

3. **conversation.service.ts** - 对话管理服务
   - ⭐ 并发控制：每个用户最多10个活跃对话
   - 创建、查询、删除对话
   - 生成对话标题（使用DeepSeek AI）

4. **knowledge-matcher.service.ts** - 知识库匹配服务
   - 多维度匹配：场景分类 + 技巧关键词 + 用户输入
   - 匹配分数计算（0-100分）
   - 返回匹配的知识库内容

5. **script-generation.service.ts** - 话术生成服务（核心）
   - ⭐ 三种生成策略：
     - 分数≥90：直接使用知识库（knowledge_direct）
     - 分数75-90：知识库+AI优化（knowledge_hybrid）
     - 分数<75：纯AI生成（ai_generate）
   - 解析AI响应（思考过程、话术内容、建议）
   - 更新知识库使用统计

6. **feedback.service.ts** - 反馈与自动学习服务
   - 用户反馈收集（点赞/踩）
   - ⭐ 自动学习触发：有点赞且无踩时，自动学习到知识库
   - 状态：pending_review（需要人工审核）

7. **history.service.ts** - 历史记录查询服务
   - 权限控制：普通用户只能查看自己的，管理员可选择用户
   - 多维度筛选：功能类型、场景、技巧、日期范围、关键词
   - 分页查询

8. **cleanup.service.ts** - 定时清理服务
   - ⭐ 每天凌晨3点自动清理30天前的对话
   - 使用 @Cron 装饰器实现定时任务

#### Controller层
**位置：** `backend/src/modules/ai-script-assistant/ai-script-assistant.controller.ts`

完整的API端点：
- `GET /ai-script/scenarios` - 获取场景列表
- `GET /ai-script/techniques` - 获取技巧列表
- `POST /ai-script/conversations` - 创建对话
- `GET /ai-script/conversations` - 获取对话列表
- `GET /ai-script/conversations/:id` - 获取对话详情
- `DELETE /ai-script/conversations/:id` - 删除对话
- `POST /ai-script/conversations/:id/messages` - 发送消息
- `POST /ai-script/feedback` - 提交反馈
- `GET /ai-script/history` - 查询历史记录

#### 模块配置
**位置：** `backend/src/modules/ai-script-assistant/ai-script-assistant.module.ts`

- 已集成到主应用模块 `app.module.ts`
- 启用了ScheduleModule（用于定时任务）

---

### 3. 前端开发（✅ 已完成）

#### API接口封装
**位置：** `frontend/src/api/ai-script.ts`

- 完整的TypeScript类型定义
- 所有后端API的封装
- 包含请求/响应类型

#### 主页面和组件
**位置：** `frontend/src/views/ai/`

1. **ScriptAssistant.vue** - 主页面
   - Tab导航（4个功能）
   - 统一的页面布局

2. **script-assistant/DealAssistTab.vue** - 帮你谈单Tab
   - 左侧：对话列表（创建、选择、删除对话）
   - 右侧：聊天区域（场景/技巧选择、消息列表、输入框）
   - 完整的对话历史管理
   - AI响应展示（思考过程、知识来源、建议、反馈）

3. **script-assistant/ReplyAssistTab.vue** - 帮你回复Tab
   - 与"帮你谈单"结构相同
   - 针对回复场景优化

4. **script-assistant/ScriptPolishTab.vue** - 话术润色Tab
   - 左右分栏布局
   - 原始话术输入 → AI润色 → 结果展示
   - 单次使用，不保留历史

5. **script-assistant/OpeningLinesTab.vue** - 开场白Tab
   - 场景和技巧选择
   - 补充信息输入
   - 开场白生成和变体建议
   - 单次使用，不保留历史

6. **ScriptHistory.vue** - 对话记录查询页面
   - 多维度筛选（功能类型、场景、技巧、日期、关键词）
   - 展开查看对话详情
   - 时间轴展示消息流
   - 反馈统计

#### 路由配置
**位置：** `frontend/src/router/index.ts`

已添加路由：
- `/sales-tools/script-assistant` - AI话术助手
- `/sales-tools/script-history` - 对话记录查询

---

## 核心技术特性

### 1. 知识库优先策略
- ⭐ 优先匹配企业知识库，而非直接调用AI
- 节省AI成本，保证话术质量和一致性

### 2. 智能匹配算法
```typescript
匹配分数 = 基础分50 + 场景匹配20 + 技巧匹配20 + 用户输入匹配10
```

### 3. 三层生成策略
- **分数≥90**：直接使用知识库内容
- **分数75-90**：知识库内容 + AI优化
- **分数<75**：纯AI生成

### 4. 自动学习机制
- 触发条件：`点赞数 > 0 且 踩数 = 0`
- 自动创建知识库记录，状态为 `pending_review`
- 需要人工审核后正式入库

### 5. 并发控制
- 每个用户最多10个活跃对话
- 创建时检查限制
- 用户可自行删除对话以释放名额

### 6. 自动清理
- 每天凌晨3点执行
- 删除30天前的对话记录
- 级联删除相关消息和反馈

---

## 启动和测试指南

### 1. 数据库已初始化
数据库表和初始数据已经创建完成：
```bash
mysql> SELECT COUNT(*) FROM ai_script_scenario;  # 28个场景
mysql> SELECT COUNT(*) FROM ai_script_technique;  # 245个技巧
```

### 2. 启动后端服务
```bash
cd backend
npm install  # 如果还没安装依赖
npm run start:dev
```

后端将在 `http://localhost:3000` 启动。

### 3. 启动前端服务
```bash
cd frontend
npm install  # 如果还没安装依赖
npm run dev
```

前端将在 `http://localhost:5173` 启动（或其他端口）。

### 4. 访问功能
1. 登录系统
2. 进入"销售工具"菜单
3. 点击"AI话术助手"
4. 测试4个Tab功能

---

## 功能测试清单

### 帮你谈单/帮你回复
- [ ] 创建新对话（测试10个上限）
- [ ] 选择场景和技巧
- [ ] 发送消息，检查AI响应
- [ ] 验证思考过程、知识来源、建议
- [ ] 测试点赞/踩反馈
- [ ] 删除对话
- [ ] 切换对话，验证历史保留

### 话术润色
- [ ] 输入原始话术
- [ ] 点击润色，检查结果
- [ ] 验证优化说明
- [ ] 测试复制功能
- [ ] 提交反馈

### 开场白
- [ ] 选择场景
- [ ] 选择技巧（可选）
- [ ] 输入补充信息（可选）
- [ ] 生成开场白
- [ ] 查看变体建议
- [ ] 测试重新生成

### 对话记录查询
- [ ] 按功能类型筛选
- [ ] 按场景筛选
- [ ] 按技巧筛选
- [ ] 按日期范围筛选
- [ ] 按关键词搜索
- [ ] 展开查看对话详情
- [ ] 查看时间轴和反馈统计

---

## 已知注意事项

### 1. DeepSeek API配置
确保在 `backend/.env.development` 中配置了正确的DeepSeek API Key：
```env
DEEPSEEK_API_KEY=your_actual_api_key_here
```

### 2. 首次使用前的准备
- ✅ 数据库表已创建
- ✅ 28个场景已初始化
- ✅ 245个技巧已配置
- ⚠️ 需要配置DeepSeek API Key
- ⚠️ 建议先在企业知识库中添加一些内容，以便测试知识匹配功能

### 3. 权限控制
- 普通用户：只能查看自己的对话历史
- 管理员：可以选择用户查看所有历史

---

## 文件清单

### 数据库
- `backend/create-ai-script-tables.sql`
- `backend/init-ai-script-data.sql`

### 后端
- `backend/src/modules/ai-script-assistant/`
  - `entities/` - 5个实体文件
  - `dto/` - 4个DTO文件
  - `services/` - 8个服务文件
  - `ai-script-assistant.controller.ts`
  - `ai-script-assistant.module.ts`

### 前端
- `frontend/src/api/ai-script.ts`
- `frontend/src/views/ai/ScriptAssistant.vue`
- `frontend/src/views/ai/script-assistant/`
  - `DealAssistTab.vue`
  - `ReplyAssistTab.vue`
  - `ScriptPolishTab.vue`
  - `OpeningLinesTab.vue`
- `frontend/src/views/ai/ScriptHistory.vue`

### 路由
- `frontend/src/router/index.ts` （已添加2个路由）

---

## 下一步建议

1. **配置AI服务**
   - 设置DeepSeek API Key
   - 测试AI响应

2. **准备知识库**
   - 添加一些企业知识库内容
   - 确保场景分类和关键词匹配

3. **功能测试**
   - 按照测试清单逐项测试
   - 记录问题和优化点

4. **性能优化**
   - 观察API响应时间
   - 优化数据库查询
   - 考虑添加缓存

5. **用户培训**
   - 准备使用手册
   - 培训业务人员使用

---

## 技术栈总结

**后端：**
- NestJS 10
- TypeORM
- MySQL 8.0
- DeepSeek AI API
- Schedule（定时任务）

**前端：**
- Vue 3 + Composition API
- Element Plus
- TypeScript
- date-fns（时间处理）

**核心特性：**
- ⭐ 知识库优先策略
- ⭐ 智能匹配算法
- ⭐ 自动学习机制
- ⭐ 并发控制
- ⭐ 定时清理

---

**开发完成时间：** 2025年

**开发者：** Claude Code

**状态：** ✅ 开发完成，待测试和优化
