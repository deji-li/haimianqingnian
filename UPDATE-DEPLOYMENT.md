# 新功能覆盖部署方案

## 📌 系统AI功能总览

### 🎯 完整AI功能清单（共7大模块）

**前期已有功能（3个）：**

1. **AI聊天记录分析** - 智能分析微信聊天截图
   - 自动识别聊天文字（豆包OCR）
   - 提取客户需求和痛点
   - 分析客户意向等级
   - 生成跟进建议

2. **AI知识库** - AI问答助手
   - 快速查询产品/业务信息
   - 智能推荐相关知识
   - 支持知识收藏和分享

3. **AI工具中心** - 4个AI工具集合
   - **AI话术助手**：生成个性化销售话术（开场白、需求挖掘、应对异议、促成成交）
   - **AI风险预警**：自动识别客户流失风险并推荐行动
   - **AI客户复苏**：识别沉睡客户并生成唤醒话术
   - **AI培训陪练**：模拟销售场景进行对话训练

**本次新增功能（4个）：**

4. **AI营销助手** - 6种营销场景文案生成
   - 朋友圈文案
   - 微信群发文案
   - 抖音营销文案
   - 小红书营销文案
   - 短视频拍摄脚本
   - 公众号推文

5. **AI人效分析看板** - 管理层数据看板
   - 销售人员AI使用排行榜
   - 分析质量分布统计
   - AI功能使用统计
   - 客户转化漏斗分析

6. **AI诊断报告** - 自动生成经营报告
   - 支持周报/月报/季报
   - 关键指标统计
   - AI洞察发现
   - 问题诊断和改进建议

7. **CRM统计页面** - 销售个人数据中心
   - 客户/订单统计概览
   - 30天转化趋势图
   - 客户来源分布
   - AI工具使用统计

---

## 📋 本次更新内容

### ✅ 新增功能（4个）

1. **AI营销助手** - 支持6种营销场景文案生成
   - 朋友圈文案
   - 微信群发文案
   - 抖音营销文案
   - 小红书营销文案
   - 短视频拍摄脚本
   - 公众号推文

2. **AI人效分析看板** - 管理层查看团队AI使用效果
   - 销售人员排行榜
   - 质量分布统计
   - 功能使用统计
   - 转化漏斗分析

3. **AI诊断报告** - 自动生成周报/月报/季报
   - 关键指标统计
   - AI洞察发现
   - 问题诊断
   - 改进建议

4. **CRM统计页面** - 销售人员查看个人数据
   - 客户/订单统计
   - 转化趋势图表
   - 客户来源分布
   - AI工具使用统计

---

## 🚀 部署步骤（自动化）

### 第一步：提交代码到Git

在本地项目目录 `D:\CC\1.1` 执行：

```bash
# 1. 添加所有新文件和修改
git add .

# 2. 提交代码（包含详细说明）
git commit -m "feat: 新增AI营销助手、AI人效分析、AI诊断报告、CRM统计功能

新增功能：
- AI营销助手：支持6种营销场景文案生成
- AI人效分析看板：管理层查看团队AI使用效果
- AI诊断报告：自动生成周报/月报/季报
- CRM统计页面：销售人员查看个人数据

技术更新：
- 添加DeepSeek AI服务集成
- 新增7个AI相关数据库表
- 新增AI模块相关路由和API
- 新增AI权限配置"

# 3. 推送到GitHub（触发自动部署）
git push origin master
```

### 第二步：监控自动部署

1. **查看GitHub Actions进度**
   - 访问：https://github.com/deji-li/haimianqingnian/actions
   - 查看最新的workflow运行状态
   - 预计耗时：3-5分钟

2. **部署流程说明**
   ```
   推送代码 → GitHub Actions触发
     ↓
   SSH连接到服务器
     ↓
   拉取最新代码 (git pull)
     ↓
   停止旧容器 (docker-compose down)
     ↓
   重新构建镜像 (docker-compose build)
     ↓
   启动新容器 (docker-compose up -d)
     ↓
   等待服务就绪（30秒）
     ↓
   部署完成 ✅
   ```

### 第三步：验证部署结果

#### 1. 检查容器状态

SSH登录到服务器：
```bash
ssh root@你的服务器IP

# 进入项目目录
cd /var/www/crm

# 查看容器状态（应该都是Up状态）
docker-compose ps

# 查看后端日志
docker-compose logs -f backend --tail=50
```

#### 2. 验证新功能

访问系统并测试：

✅ **AI营销助手**
- 路径：`AI智能助手` → `AI营销助手`
- 测试：选择场景 → 配置需求 → 生成文案

✅ **AI人效分析**
- 路径：`AI智能助手` → `AI人效分析`
- 查看：销售排行、图表数据

✅ **AI诊断报告**
- 路径：`AI智能助手` → `AI诊断报告`
- 测试：生成新报告 → 查看详情

✅ **CRM统计**
- 路径：侧边栏 → `CRM统计`
- 查看：个人统计数据、图表

---

## ⚙️ 服务器环境配置

### 重要：配置AI API密钥

SSH登录服务器后：

```bash
# 编辑环境变量
cd /var/www/crm
vim .env

# 在.env文件中添加（或修改）以下配置：

# DeepSeek AI 配置（用于AI洞察、文案生成等）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# 豆包 OCR 配置（用于识别微信聊天截图中的文字）
DOUBAO_API_KEY=your_doubao_api_key_here
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_OCR_MODEL=doubao-vision-pro
```

**获取DeepSeek API密钥：**
1. 访问：https://platform.deepseek.com
2. 注册/登录账号
3. 进入API Keys页面
4. 创建新的API Key
5. 复制密钥到.env文件

**获取豆包 API密钥：**
1. 访问：https://console.volcengine.com/ark
2. 注册/登录账号（字节跳动火山引擎）
3. 创建推理接入点
4. 获取API Key
5. 复制密钥到.env文件

配置完成后重启后端：
```bash
docker-compose restart backend
```

### 数据库表自动创建

**首次部署**：
- 新的AI表会在容器启动时自动创建
- 通过 `003-create-ai-tables.sql` 迁移脚本执行

**已有数据库**：
如果数据库已存在，需要手动执行SQL：

```bash
# 方法1：通过Docker执行
docker exec -i crm-mysql mysql -uroot -p你的密码 education_crm < backend/src/database/migrations/003-create-ai-tables.sql

# 方法2：进入MySQL容器执行
docker exec -it crm-mysql mysql -uroot -p
use education_crm;
source /docker-entrypoint-initdb.d/05-ai-tables.sql;
```

---

## 🔍 常见问题排查

### 1. 部署失败

**查看GitHub Actions日志**
- 进入Actions页面查看详细错误
- 常见原因：
  - SSH密钥配置错误
  - 服务器磁盘空间不足
  - Docker服务未运行

**解决方案**：
```bash
# 检查磁盘空间
df -h

# 检查Docker状态
systemctl status docker

# 清理Docker空间
docker system prune -f
```

### 2. 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs mysql

# 重启容器
docker-compose restart

# 完全重建
docker-compose down
docker-compose up -d --build
```

### 3. AI功能报错

**检查DeepSeek API配置**：
```bash
# 查看环境变量
docker exec crm-backend env | grep DEEPSEEK

# 测试API连接
curl -X POST "https://api.deepseek.com/v1/chat/completions" \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

### 4. 新路由404

**清除浏览器缓存**：
- 按 `Ctrl+Shift+R` 强制刷新
- 或清除浏览器缓存后重新访问

**检查前端容器**：
```bash
# 重启前端容器
docker-compose restart frontend

# 检查前端文件
docker exec -it crm-frontend ls /usr/share/nginx/html
```

---

## 📊 性能优化建议

### 1. 数据库索引优化

```sql
-- 为常用查询添加索引
USE education_crm;

-- 客户相关索引
CREATE INDEX idx_customer_sales_lifecycle ON customers(sales_id, lifecycle_stage);
CREATE INDEX idx_customer_create ON customers(create_time);

-- 订单相关索引
CREATE INDEX idx_order_customer_time ON orders(customer_id, payment_time);

-- AI表索引（已在迁移脚本中包含）
```

### 2. Docker资源限制

编辑 `docker-compose.yml` 添加资源限制：
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        memory: 1G
```

### 3. 启用Nginx缓存

已在Dockerfile中配置，确保生效：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📝 回滚方案

如果部署后发现问题，可以快速回滚：

```bash
# SSH登录服务器
ssh root@你的服务器IP
cd /var/www/crm

# 查看Git提交历史
git log --oneline -10

# 回滚到上一个版本（记下commit hash）
git reset --hard 上一个commit的hash

# 重新部署
docker-compose down
docker-compose up -d --build
```

---

## ✅ 部署检查清单

部署前：
- [ ] 所有代码已在本地测试通过
- [ ] Git仓库已更新（git push）
- [ ] GitHub Actions配置正确

部署中：
- [ ] GitHub Actions workflow执行成功
- [ ] 服务器容器全部启动（3个）
- [ ] 没有错误日志

部署后：
- [ ] 可以正常访问前端页面
- [ ] 可以正常登录系统
- [ ] DeepSeek API已配置（AI洞察、文案生成）
- [ ] 豆包OCR API已配置（聊天记录识别）
- [ ] 4个新功能都可以访问
- [ ] AI表已创建（7个表）
- [ ] AI权限已配置

---

## 📞 技术支持

遇到问题按以下顺序排查：

1. **查看本文档的常见问题章节**
2. **查看GitHub Actions日志**
3. **查看Docker容器日志**：`docker-compose logs -f`
4. **检查服务器资源**：`df -h` 和 `docker stats`
5. **联系开发团队**

---

## 🎉 部署完成

按照以上步骤操作后，新功能将自动部署到生产环境！

**记住**：
- ✅ 只需要 `git push`，其余都是自动的
- ✅ 部署耗时约 3-5 分钟
- ✅ 部署成功后访问系统验证新功能

祝部署顺利！🚀
