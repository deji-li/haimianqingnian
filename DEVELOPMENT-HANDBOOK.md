# 教育CRM系统开发手册

**项目名称**: 教育CRM系统全面优化
**当前阶段**: Week 2 - 角色权限配置
**最后更新**: 2025-12-26
**维护者**: Claude Code Assistant

---

## 📋 快速导航

- [项目概览](#项目概览)
- [当前状态](#当前状态)
- [已完成工作](#已完成工作)
- [当前任务](#当前任务)
- [技术架构](#技术架构)
- [开发规范](#开发规范)
- [故障排查](#故障排查)
- [继续开发指南](#继续开发指南)

---

## 项目概览

### 项目目标
对教育CRM系统进行全面优化，包括：
1. 导航菜单重构
2. 权限系统完善
3. 代码结构优化
4. AI功能联动
5. 测试与上线准备

### 开发计划 (5周)
- ✅ Week 1: 导航重构 + 权限修复 + 回归测试
- 🔄 Week 2: 角色权限配置 (当前)
- ⏳ Week 3: 代码结构优化
- ⏳ Week 4: AI功能联动
- ⏳ Week 5: 测试与上线准备

---

## 当前状态

### 最新进度 (2025-12-26)
- **Week 1**: ✅ 100% 完成
  - ✅ 导航菜单重构 (16→13个一级菜单)
  - ✅ 权限安全修复 (11个Controller)
  - ✅ 新增47个权限点
  - ✅ 全功能回归测试通过
  - ✅ 修复3个编译错误

- **Week 2**: 🔄 进行中
  - 🔄 角色权限配置

### 系统状态
- ✅ 后端编译正常 (NestJS)
- ✅ 前端编译正常 (Vue 3)
- ✅ 数据库连接正常 (MySQL)
- ✅ 242个权限点，14个模块
- ✅ 权限系统完整

### 代码状态
- **最后提交**: 未提交 (有未提交的修改)
- **修改文件**:
  - 后端: 11个Controller文件
  - 前端: 2个Vue组件
  - 数据库: 1个SQL脚本已执行

---

## 已完成工作

### Week 1 完成详情

#### 1. 导航菜单重构 ✅
**文件**: `frontend/src/layouts/DefaultLayout.vue`

**修改内容**:
- 合并AI营销助手到销售工具
- 移动AI话术工具到销售工具
- 整合排行榜功能
- 移动数据大屏到数据分析
- 整合运营管理

**结果**: 13个一级菜单，结构更清晰

#### 2. 权限安全修复 ✅
**修复文件**: 11个Controller

**后端文件**:
1. `marketing-assistant.controller.ts` - 修复权限格式
2. `operation.controller.ts` - 恢复PermissionGuard
3. `init-knowledge.controller.ts` - 添加权限保护
4. `mining-knowledge.controller.ts` - 添加权限保护
5. `training-coach.controller.ts` - 添加PermissionGuard
6. `wework.controller.ts` - 完整权限保护
7. `wework-basic.controller.ts` - 完整权限保护
8. `ai-assistant.controller.ts` - 添加PermissionGuard
9. `ai-script-assistant.controller.ts` - 添加PermissionGuard

**新增权限点**: 47个
- 企业知识库: 9个
- AI培训陪练: 12个
- 企业微信: 8个
- 数据分析: 6个
- AI功能: 8个
- 系统管理: 4个

#### 3. 编译问题修复 ✅
**修复问题**:
- `ai-script-assistant.controller.ts` - 缺少PermissionGuard导入
- `Session.vue` - BulbFilled图标不存在
- `Report.vue` - BulbFilled图标不存在

#### 4. 数据库更新 ✅
**SQL脚本**: `add-new-permissions-fixed.sql`
- 新增47个权限点
- 执行成功，242个权限点总数

---

## 当前任务

### Week 2: 角色权限配置

#### 任务目标
为8种角色配置相应的权限，确保权限系统完整可用。

#### 角色列表
1. 超级管理员 (super_admin)
2. 管理员 (admin)
3. 销售主管 (sales_supervisor)
4. 销售顾问 (sales_consultant)
5. 运营人员 (operator)
6. 财务人员 (finance)
7. 培训师 (trainer)
8. 普通用户 (user)

#### 待完成工作
- [ ] 分析现有角色和权限表结构
- [ ] 设计角色权限配置方案
- [ ] 创建角色权限配置SQL脚本
- [ ] 执行角色权限配置
- [ ] 验证配置结果
- [ ] 创建权限测试用例
- [ ] 更新开发文档

---

## 技术架构

### 前端技术栈
- **框架**: Vue 3 (Composition API)
- **UI**: Element Plus
- **路由**: Vue Router
- **语言**: TypeScript
- **构建**: Vite
- **目录**: `D:\CC\1.1\frontend`

### 后端技术栈
- **框架**: NestJS
- **ORM**: TypeORM
- **数据库**: MySQL (education_crm)
- **语言**: TypeScript
- **构建**: Webpack
- **目录**: `D:\CC\1.1\backend`

### 数据库连接
```bash
主机: localhost
数据库: education_crm
用户: root
密码: 123456
端口: 3306
```

### 关键表结构

#### permissions (权限表)
```sql
id              int          主键
code            varchar(100) 权限代码 (唯一)
name            varchar(100) 权限名称
module          varchar(50)  所属模块
description     varchar(255) 描述
parent_id       int          父权限ID
status          tinyint      状态 (1:启用)
create_time     datetime     创建时间
update_time     datetime     更新时间
```

#### roles (角色表)
```sql
id              int          主键
role_code       varchar(50)  角色代码 (唯一)
role_name       varchar(100) 角色名称
description     varchar(255) 描述
status          tinyint      状态
create_time     datetime     创建时间
update_time     datetime     更新时间
```

#### role_permissions (角色权限关联表)
```sql
id              int          主键
role_id         int          角色ID
permission_id   int          权限ID
create_time     datetime     创建时间
```

---

## 开发规范

### 权限命名规范
格式: `模块:资源:操作`

**模块列表**:
- ai (AI功能)
- analytics (数据分析)
- automation (自动化)
- customer (客户管理)
- dashboard (仪表盘)
- finance (财务)
- knowledge (知识库)
- operation (运营)
- order (订单)
- system (系统)
- target (目标)
- training (培训陪练)
- user (用户)
- wework (企业微信)
- workspace (工作台)

**操作列表**:
- view (查看)
- create (创建)
- update (更新)
- delete (删除)
- export (导出)
- import (导入)
- assign (分配)
- approve (审批)
- execute (执行)
- manage (管理)
- use (使用)

### Controller开发规范
```typescript
@ApiTags('模块名称')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
@Controller('module-path')
export class ModuleController {
  @Get()
  @ApiOperation({ summary: '描述' })
  @RequirePermissions('module:resource:action')
  async method() {
    // implementation
  }
}
```

### SQL脚本规范
1. 使用事务
2. 添加注释
3. 包含回滚说明
4. 使用 ON DUPLICATE KEY UPDATE
5. 执行前备份数据库

---

## 故障排查

### 常见问题

#### 1. 编译错误
**问题**: 找不到 PermissionGuard
**解决**: 检查是否导入 `import { PermissionGuard } from '../../common/guards/permission.guard';`

**问题**: Element Plus 图标不存在
**解决**: 检查 `@element-plus/icons-vue` 中的图标名称，可用的图标: Document, User, ChatDotRound, Promotion, Star, Flag 等

#### 2. 权限不生效
**检查清单**:
1. Controller 是否使用 `@UseGuards(JwtAuthGuard, PermissionGuard)`
2. 方法是否添加 `@RequirePermissions('permission:code')`
3. 权限是否存在于数据库 `permissions` 表
4. 用户是否拥有该权限 (role_permissions 表)

#### 3. 数据库连接失败
**检查清单**:
1. MySQL 服务是否启动
2. 密码是否正确 (123456)
3. 数据库是否存在 (education_crm)
4. 端口是否正确 (3306)

---

## 继续开发指南

### 如何恢复开发

1. **查看当前状态**
   ```bash
   # 查看开发手册
   cat D:\CC\1.1\DEVELOPMENT-HANDBOOK.md

   # 查看实施进度
   cat D:\CC\1.1\IMPLEMENTATION-PROGRESS.md

   # 查看最近修改
   cd D:\CC\1.1
   git status
   git log -5
   ```

2. **启动开发环境**
   ```bash
   # 启动后端 (终端1)
   cd D:\CC\1.1\backend
   npm run start:dev

   # 启动前端 (终端2)
   cd D:\CC\1.1\frontend
   npm run dev
   ```

3. **数据库操作**
   ```bash
   # 连接数据库
   mysql -u root -p123456 education_crm

   # 查看权限
   SELECT module, COUNT(*) FROM permissions GROUP BY module;

   # 查看角色
   SELECT * FROM roles;
   ```

### 下一步任务

**Week 2: 角色权限配置**

1. **分析现有数据**
   ```sql
   -- 查看现有角色
   SELECT id, role_code, role_name FROM roles;

   -- 查看现有权限
   SELECT module, COUNT(*) as count
   FROM permissions
   GROUP BY module
   ORDER BY module;

   -- 查看已有角色权限
   SELECT r.role_name, COUNT(rp.permission_id) as permission_count
   FROM roles r
   LEFT JOIN role_permissions rp ON r.id = rp.role_id
   GROUP BY r.id, r.role_name;
   ```

2. **设计角色权限方案**
   - 为每个角色定义权限列表
   - 创建SQL配置脚本

3. **执行配置**
   - 执行SQL脚本
   - 验证结果

### 关键文件位置

**后端核心文件**:
- `backend/src/main.ts` - 应用入口
- `backend/src/app.module.ts` - 主模块
- `backend/src/common/guards/` - Guards
- `backend/src/common/decorators/` - 装饰器

**前端核心文件**:
- `frontend/src/main.ts` - 应用入口
- `frontend/src/router/index.ts` - 路由配置
- `frontend/src/layouts/DefaultLayout.vue` - 主布局
- `frontend/src/views/` - 页面组件

**配置文件**:
- `backend/.env` - 后端环境变量
- `frontend/.env` - 前端环境变量

**SQL脚本**:
- `backend/add-new-permissions-fixed.sql` - 权限添加脚本
- (Week 2) `backend/configure-role-permissions.sql` - 角色权限配置脚本 (待创建)

**文档文件**:
- `DEVELOPMENT-HANDBOOK.md` - 本手册
- `IMPLEMENTATION-PROGRESS.md` - 实施进度
- `PERMISSION-FIX-PROGRESS.md` - 权限修复进度
- `REGRESSION-TEST-REPORT.md` - 测试报告

---

## 提交与备份

### 提交代码
```bash
# 查看修改
git status

# 添加文件
git add .

# 提交 (请根据实际修改填写)
git commit -m "feat: Week 1 完成 - 导航重构、权限修复、回归测试

- 优化导航菜单结构 (16→13)
- 修复11个Controller权限保护
- 新增47个权限点
- 修复3个编译错误
- 通过全功能回归测试

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 数据库备份
```bash
# 备份数据库
mysqldump -u root -p123456 education_crm > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p123456 education_crm < backup_20251226.sql
```

---

## 重要提醒

### ⚠️ 开发注意事项
1. **执行SQL前务必备份数据库**
2. **不要批量修改，逐个测试**
3. **保持权限命名规范一致**
4. **修改Controller后要测试**
5. **前端编译注意Element Plus图标版本**

### 📝 更新文档
**每次完成重要任务后，请更新**:
1. `DEVELOPMENT-HANDBOOK.md` - 本手册
2. `IMPLEMENTATION-PROGRESS.md` - 实施进度
3. 相关任务的具体文档

### 🔍 问题排查流程
1. 查看错误日志
2. 检查代码修改
3. 查看数据库状态
4. 参考本文档的故障排查章节
5. 查看git历史记录

---

## 快速参考

### 常用命令

**后端**:
```bash
cd D:\CC\1.1\backend
npm run build          # 编译
npm run start:dev      # 开发模式
npm run start:prod     # 生产模式
```

**前端**:
```bash
cd D:\CC\1.1\frontend
npm run build          # 编译
npm run dev            # 开发模式
npm run preview        # 预览
```

**数据库**:
```bash
mysql -u root -p123456 education_crm
mysql -u root -p123456 education_crm < script.sql
```

### 关键路径
```
项目根目录: D:\CC\1.1\
后端目录:   D:\CC\1.1\backend\
前端目录:   D:\CC\1.1\frontend\
SQL目录:    D:\CC\1.1\backend\
文档目录:   D:\CC\1.1\
```

---

**文档版本**: v1.0
**最后更新**: 2025-12-26
**维护者**: Claude Code Assistant

**如需继续开发，请先阅读本文档的"继续开发指南"章节**
