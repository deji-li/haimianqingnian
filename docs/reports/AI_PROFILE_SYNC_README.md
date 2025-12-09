# AI分析结果自动同步到客户资料

## 功能说明

之前的问题：AI分析了聊天记录后，得到了很多有价值的客户画像信息（年级、经济水平、决策角色等），但**这些信息没有同步到客户资料中**。

现在的改进：**AI分析完成后，自动将客户画像同步到客户档案**，无需销售手动填写。

---

## 同步的信息

### 1. 基础画像（存储在独立字段）

| 字段 | 说明 | 示例值 |
|------|------|--------|
| `student_grade` | 学生年级 | "初中" |
| `student_age` | 学生年龄 | 13 |
| `family_economic_level` | 家庭经济水平 | "中" |
| `decision_maker_role` | 决策角色 | "单独决策" |
| `parent_role` | 家长身份 | "家长" |
| `location` | 所在地区 | "浦东花木" |
| `estimated_value` | 预估成交金额 | 3000.00 |
| `quality_level` | AI质量等级 | "B" |
| `last_ai_analysis_time` | 最后分析时间 | "2025-11-08 15:50:43" |

### 2. 详细画像（存储在JSON字段）

`ai_profile` 字段包含：
- **needs**: 客户需求列表（如：["浦东花木附近课程", "声乐培训", "羽毛球培训"]）
- **painPoints**: 客户痛点（如：["不清楚课程地址", "担心团课等待时间"]）
- **interests**: 感兴趣的点
- **objections**: 客户异议/顾虑
- **competitors**: 提到的竞品
- **mindset**: 客户心态（积极/观望/抗拒/犹豫）
- **emotionalTone**: 情绪基调（友好/中立/不耐烦/负面）
- **trustLevel**: 信任程度（高/中/低）
- **dealOpportunity**: 成交机会（高/中/低）
- **urgency**: 紧迫性（高/中/低）
- **estimatedCycle**: 预估成交周期

---

## 同步逻辑

### 触发时机
每次AI聊天分析完成后，自动触发同步。

### 同步规则
1. **非空覆盖**：只有AI分析出具体值时才更新，避免覆盖现有准确信息
2. **增量更新**：保留客户原有信息，只补充新分析出的内容
3. **时间戳记录**：记录最后一次AI分析时间

### 代码位置
- **实体定义**：`backend/src/modules/customer/entities/customer.entity.ts` (第81-123行)
- **同步逻辑**：`backend/src/modules/ai-chat/ai-chat.service.ts` (第175-242行)
- **数据库迁移**：`backend/src/database/migrations/005-add-ai-profile-fields.sql`

---

## 前端展示建议

### 在客户详情页展示AI画像

**基本信息区域**：
```
客户姓名：Kiki
微信昵称：Kiki
学生年级：初中        [AI自动识别]
学生年龄：13岁        [AI自动识别]
家长身份：家长        [AI自动识别]
所在地区：浦东花木    [AI自动识别]
```

**商机评估区域**：
```
质量等级：B级          [AI评估]
客户意向：中           [AI评估]
预估价值：¥3,000      [AI评估]
家庭经济：中等         [AI评估]
决策角色：单独决策     [AI评估]
```

**需求分析区域**：
```
客户需求：
  • 浦东花木附近课程
  • 声乐培训
  • 羽毛球培训

客户顾虑：
  • 不清楚课程地址
  • 担心团课等待时间
```

---

## 数据库表结构

```sql
-- customers表新增字段
ALTER TABLE `customers`
ADD COLUMN `student_grade` VARCHAR(50) NULL COMMENT '学生年级',
ADD COLUMN `student_age` INT NULL COMMENT '学生年龄',
ADD COLUMN `family_economic_level` ENUM('高', '中', '低') NULL COMMENT '家庭经济水平',
ADD COLUMN `decision_maker_role` VARCHAR(100) NULL COMMENT '决策角色',
ADD COLUMN `parent_role` VARCHAR(50) NULL COMMENT '家长身份',
ADD COLUMN `location` VARCHAR(100) NULL COMMENT '所在地区',
ADD COLUMN `estimated_value` DECIMAL(10,2) NULL COMMENT '预估成交金额',
ADD COLUMN `quality_level` ENUM('A', 'B', 'C', 'D') NULL COMMENT 'AI评估质量等级',
ADD COLUMN `ai_profile` JSON NULL COMMENT 'AI分析的客户画像',
ADD COLUMN `last_ai_analysis_time` DATETIME NULL COMMENT '最后一次AI分析时间';
```

---

## 部署步骤

### 自动部署（推荐）
```bash
cd D:\CC\1.1
bash deploy_ai_profile_sync.sh
```

### 手动部署

**步骤1：本地提交代码**
```bash
cd D:\CC\1.1
git add .
git commit -m "feat: AI分析结果自动同步到客户资料"
git push origin master
```

**步骤2：服务器拉取代码**
```bash
ssh root@106.53.77.212
cd /root/crm
git pull origin master
```

**步骤3：执行数据库迁移**
```bash
docker exec -i crm-mysql mysql -uroot -p7821630lideji crm < backend/src/database/migrations/005-add-ai-profile-fields.sql
```

**步骤4：重新构建后端**
```bash
docker-compose stop backend
docker-compose build backend
docker-compose up -d backend
```

**步骤5：验证**
```bash
# 检查表结构
docker exec crm-mysql mysql -uroot -p7821630lideji crm -e "SHOW COLUMNS FROM customers LIKE '%student%';"

# 查看日志
docker-compose logs --tail=50 backend | grep "客户画像已同步"
```

---

## 测试验证

### 测试步骤
1. **上传新的聊天记录**进行AI分析
2. **等待分析完成**（状态变为"已完成"）
3. **进入客户管理页面**
4. **查看该客户的详情**
5. **验证AI字段是否自动填充**：
   - 学生年级
   - 家庭经济水平
   - 决策角色
   - 预估成交金额
   - 质量等级

### 预期结果
```
客户画像已同步: ID=123, 意向=中, 等级=B, 年级=初中, 预估=3000元
```

---

## 查询示例

### SQL查询：查看所有AI分析过的客户
```sql
SELECT
  id,
  wechat_nickname,
  student_grade,
  family_economic_level,
  quality_level,
  estimated_value,
  last_ai_analysis_time
FROM customers
WHERE last_ai_analysis_time IS NOT NULL
ORDER BY last_ai_analysis_time DESC;
```

### SQL查询：查看高质量客户
```sql
SELECT
  id,
  wechat_nickname,
  student_grade,
  quality_level,
  estimated_value,
  ai_profile->>'$.needs' as needs
FROM customers
WHERE quality_level IN ('A', 'B')
  AND estimated_value > 5000
ORDER BY estimated_value DESC;
```

### SQL查询：查看客户详细画像（JSON）
```sql
SELECT
  id,
  wechat_nickname,
  JSON_PRETTY(ai_profile) as profile_detail
FROM customers
WHERE id = 123;
```

---

## 后续优化建议

### 1. 前端客户详情页增强
在客户详情页增加"AI画像"标签页，展示所有AI分析信息。

### 2. 智能提醒
当客户画像更新后，提醒销售关注：
- "客户年级已更新为初中，建议推荐初中课程"
- "客户预算评估为3000元，建议推荐性价比套餐"

### 3. 批量分析
支持批量导入历史聊天记录，为所有客户生成AI画像。

### 4. 画像对比
对比多次分析结果，识别客户需求变化趋势。

---

## 常见问题

**Q1: 如果AI分析错误，会覆盖正确信息吗？**
A: 不会。只有AI分析出具体值时才更新，如果AI返回空值或"未知"，不会覆盖现有数据。

**Q2: 可以手动编辑AI填充的信息吗？**
A: 可以。销售可以在客户管理页面手动修改任何字段，AI下次分析时会尊重手动修改的值。

**Q3: JSON字段如何在前端展示？**
A: 后端API已解析好JSON字段，前端直接使用 `customer.aiProfile.needs` 等属性访问。

**Q4: 历史客户会自动更新画像吗？**
A: 只有重新进行AI聊天分析时才会更新。可以开发批量分析功能来更新历史客户。

---

## 技术细节

### TypeORM实体定义
```typescript
@Column({ name: 'ai_profile', type: 'json', nullable: true })
aiProfile: any;
```

### 更新逻辑（核心代码）
```typescript
const updateData: any = {
  qualityLevel,
  estimatedValue,
  studentGrade: customerProfile?.studentGrade,
  familyEconomicLevel: customerProfile?.familyEconomicLevel,
  // ... 其他字段
  aiProfile: {
    needs: analysisResult.customerNeeds,
    painPoints: analysisResult.customerPainPoints,
    // ... 其他详细信息
  },
  lastAiAnalysisTime: new Date(),
};

await this.customerRepository.update(customerId, updateData);
```

### 日志输出
```
[AiChatService] 客户画像已同步: ID=123, 意向=中, 等级=B, 年级=初中, 预估=3000元
```
