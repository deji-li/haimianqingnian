# Git提交指南

## 📋 提交前检查

在提交代码前，请确认以下内容：

- ✅ 所有新文件都已创建
- ✅ 所有修改都已保存
- ✅ 代码可以正常编译/构建
- ✅ 没有包含敏感信息（密码、密钥等）

## 🚀 提交步骤

### 1. 查看当前状态

```bash
git status
```

### 2. 添加所有更改

```bash
# 添加所有新文件和修改
git add .

# 或者分组添加
git add backend/
git add frontend/
git add *.md
git add *.sql
git add *.bat
git add *.sh
```

### 3. 查看将要提交的内容

```bash
git status
```

### 4. 提交更改

```bash
git commit -m "feat: 添加企业知识库完整系统

主要功能：
- 添加企业知识库核心模块（7个表，37个API接口）
- 添加AI知识挖掘功能
- 添加负反馈管理系统
- 添加使用统计看板
- 集成知识库到AI对话和营销推荐

前端功能：
- 添加初始化向导页面
- 添加知识管理页面（CRUD）
- 添加智能搜索页面（AI语义搜索）
- 添加AI挖掘页面（自动挖掘+审核）
- 添加负反馈管理页面
- 添加使用统计页面（含ECharts图表）

数据库：
- 新增7个表结构
- 添加38个性能优化索引
- 提供200+条行业问题库数据
- 提供100条教育行业示例数据

部署：
- 提供一键部署脚本（Windows/Linux）
- 提供完整部署文档
- 提供合并的数据库更新SQL"
```

### 5. 推送到远程仓库

```bash
# 推送到master分支
git push origin master

# 如果是第一次推送或分支不存在
git push -u origin master
```

## 📝 提交说明

### 新增文件（53个）

#### 后端文件（45个）

**核心模块**
- `backend/src/modules/enterprise-knowledge/` (24个文件)
  - 控制器、服务、DTO、实体等

**共享服务**
- `backend/src/common/services/ai/ai-shared.module.ts`
- `backend/src/common/services/ai/ai-config-caller.service.ts`
- `backend/src/common/services/ai/field-mapping.service.ts`

**AI助手**
- `backend/src/modules/ai-chat/ai-assistant.controller.ts`
- `backend/src/modules/ai-chat/ai-assistant.service.ts`
- `backend/src/modules/ai-chat/dto/ai-assistant.dto.ts`

**数据库**
- `backend/database/migrations/` (8个SQL文件)
- `backend/database/update_all.sql` (合并脚本)

**文档**
- `backend/ENTERPRISE_KNOWLEDGE_*.md` (4个文档)
- `backend/KNOWLEDGE_INTEGRATION_PATCHES.md`

#### 前端文件（8个）

- `frontend/src/api/knowledge.ts`
- `frontend/src/views/knowledge/*.vue` (6个页面)

#### 部署文件

- `DEPLOYMENT_GUIDE.md` (部署指南)
- `GIT_COMMIT_GUIDE.md` (本文件)
- `deploy.bat` (Windows部署脚本)
- `deploy.sh` (Linux部署脚本)

### 修改文件（14个）

#### 后端修改
- `backend/src/app.module.ts` (添加新模块)
- `backend/src/modules/ai-chat/ai-chat.module.ts`
- `backend/src/modules/ai-config/ai-config.module.ts`
- `backend/src/modules/ai-marketing/ai-marketing.module.ts`
- `backend/src/modules/ai-marketing/ai-marketing.service.ts` (集成知识库)
- `backend/src/modules/ai-tools/ai-tools.module.ts`
- `backend/src/modules/ai-tools/ai-tools.service.ts` (集成知识库)

#### 删除的旧文件（整合到新模块）
- `backend/src/modules/ai-knowledge/*` (5个旧文件)

#### 前端修改
- `frontend/src/router/index.ts` (添加知识库路由)

## 🔍 提交验证

### 提交前验证

```bash
# 1. 查看文件差异
git diff

# 2. 查看将要提交的文件
git diff --cached

# 3. 查看提交日志
git log -1
```

### 推送后验证

```bash
# 1. 查看远程分支
git branch -r

# 2. 查看远程日志
git log origin/master -1

# 3. 确认推送成功
git status
```

## 🌟 提交后检查清单

- ✅ 本地提交成功
- ✅ 推送到远程成功
- ✅ 在GitHub/GitLab上可以看到最新提交
- ✅ 所有文件都已包含
- ✅ 提交信息清晰准确

## 📦 服务器部署步骤

提交并推送后，在服务器上执行：

### Linux服务器

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 拉取最新代码
git pull origin master

# 3. 赋予执行权限
chmod +x deploy.sh

# 4. 执行部署
./deploy.sh
```

### Windows服务器

```bash
# 1. 进入项目目录
cd D:\path\to\your\project

# 2. 拉取最新代码
git pull origin master

# 3. 执行部署
deploy.bat
```

## ⚠️ 注意事项

### 不要提交的文件

以下文件/目录不应该提交（应该在 `.gitignore` 中）：

```
node_modules/
dist/
.env
.env.local
logs/
*.log
.DS_Store
.vscode/
.idea/
```

### 敏感信息检查

提交前检查是否包含：
- ❌ 数据库密码
- ❌ API密钥
- ❌ 私钥文件
- ❌ 个人配置

### 冲突解决

如果拉取时遇到冲突：

```bash
# 1. 暂存当前更改
git stash

# 2. 拉取最新代码
git pull origin master

# 3. 应用暂存的更改
git stash pop

# 4. 解决冲突后重新提交
git add .
git commit -m "resolve conflicts"
git push origin master
```

## 🎯 快速命令

```bash
# 一键提交并推送（确保没有冲突）
git add . && git commit -m "feat: 添加企业知识库系统" && git push origin master

# 查看提交历史
git log --oneline -10

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1

# 查看远程仓库地址
git remote -v
```

## 📚 相关文档

- [部署指南](./DEPLOYMENT_GUIDE.md)
- [企业知识库最终报告](./backend/ENTERPRISE_KNOWLEDGE_FINAL_REPORT.md)
- [知识集成补丁](./backend/KNOWLEDGE_INTEGRATION_PATCHES.md)

---

**提交日期**：2025-11-17
**版本**：v1.0.0
