# 数据库设计文档

## 概述

教育培训CRM系统采用 MySQL 8.0 数据库，包含 10 张核心表，支持客户管理、订单管理、财务统计和 OKR 绩效考核等功能。

## 数据库信息

- **数据库名**：education_crm
- **字符集**：utf8mb4
- **排序规则**：utf8mb4_unicode_ci
- **时区**：Asia/Shanghai (+08:00)

## 核心表设计

### 1. roles（角色表）

**说明**：系统角色定义表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 角色ID | 主键，自增 |
| name | VARCHAR(50) | 角色名称 | 如：超级管理员 |
| code | VARCHAR(50) | 角色代码 | 唯一键，如：admin |
| permissions | JSON | 权限配置 | JSON 数组 |
| description | VARCHAR(255) | 角色描述 | 可为空 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_code` (`code`)

**初始数据**：
- admin：超级管理员
- campus_manager：校区主管
- sales_manager：销售主管
- sales：销售
- operation：运营
- finance：财务

---

### 2. departments（部门表）

**说明**：组织架构部门表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 部门ID | 主键，自增 |
| name | VARCHAR(50) | 部门名称 | - |
| parent_id | INT | 父部门ID | 默认 0 |
| sort_order | INT | 排序 | 默认 0 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

---

### 3. campuses（校区表）

**说明**：教学校区信息表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 校区ID | 主键，自增 |
| name | VARCHAR(100) | 校区名称 | - |
| region | VARCHAR(50) | 所属地区 | 可为空 |
| address | VARCHAR(255) | 详细地址 | 可为空 |
| phone | VARCHAR(20) | 联系电话 | 可为空 |
| status | TINYINT | 状态 | 1-正常 0-停用 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

---

### 4. users（用户表）

**说明**：系统用户信息表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 用户ID | 主键，自增 |
| username | VARCHAR(50) | 用户名 | 唯一键 |
| password | VARCHAR(255) | 密码 | bcrypt 加密 |
| real_name | VARCHAR(50) | 真实姓名 | - |
| phone | VARCHAR(20) | 手机号 | 可为空 |
| email | VARCHAR(100) | 邮箱 | 可为空 |
| role_id | INT | 角色ID | 外键关联 roles |
| department_id | INT | 部门ID | 可为空 |
| campus_id | INT | 校区ID | 可为空 |
| avatar | VARCHAR(255) | 头像URL | 可为空 |
| status | TINYINT | 状态 | 1-正常 0-禁用 |
| last_login_time | DATETIME | 最后登录时间 | 可为空 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_username` (`username`)
- KEY `idx_role_id` (`role_id`)
- KEY `idx_department_id` (`department_id`)
- KEY `idx_campus_id` (`campus_id`)

---

### 5. customers（客户表）⭐ 核心表

**说明**：客户基本信息表，微信号唯一

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 客户ID | 主键，自增 |
| wechat_nickname | VARCHAR(100) | 微信昵称 | 可为空 |
| wechat_id | VARCHAR(100) | 微信号 | 唯一键 |
| phone | VARCHAR(20) | 手机号 | 可为空 |
| real_name | VARCHAR(50) | 真实姓名 | 可为空 |
| traffic_source | VARCHAR(50) | 流量来源 | 抖音/小红书/百度等 |
| operator_id | INT | 运营人员ID | 获取流量的运营 |
| sales_id | INT | 对接销售ID | 必填 |
| sales_wechat | VARCHAR(100) | 对接销售微信号 | 可为空 |
| customer_intent | ENUM | 客户意向度 | 高/中/低 |
| next_follow_time | DATETIME | 下次回访时间 | 可为空 |
| remark | TEXT | 备注 | 可为空 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_wechat_id` (`wechat_id`)
- KEY `idx_sales_id` (`sales_id`)
- KEY `idx_operator_id` (`operator_id`)
- KEY `idx_phone` (`phone`)
- KEY `idx_next_follow_time` (`next_follow_time`)
- KEY `idx_create_time` (`create_time`)

---

### 6. customer_follow_records（客户跟进记录表）

**说明**：客户跟进历史记录

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 记录ID | 主键，自增 |
| customer_id | INT | 客户ID | 外键关联 customers |
| follow_content | TEXT | 跟进内容 | 必填 |
| follow_time | DATETIME | 跟进时间 | 自动填充 |
| operator_id | INT | 跟进人ID | 必填 |
| next_follow_time | DATETIME | 下次跟进时间 | 可为空 |
| create_time | DATETIME | 创建时间 | 自动填充 |

**索引**：
- PRIMARY KEY (`id`)
- KEY `idx_customer_id` (`customer_id`)
- KEY `idx_operator_id` (`operator_id`)
- KEY `idx_follow_time` (`follow_time`)

---

### 7. orders（订单表）⭐ 核心表

**说明**：订单信息表，订单号唯一

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 订单ID | 主键，自增 |
| order_no | VARCHAR(50) | 订单号 | 唯一键 |
| customer_id | INT | 客户ID | 可为空（Excel导入时） |
| wechat_id | VARCHAR(100) | 微信号 | 冗余字段，用于关联 |
| wechat_nickname | VARCHAR(100) | 微信昵称 | 冗余字段 |
| phone | VARCHAR(20) | 手机号 | 冗余字段 |
| sales_id | INT | 销售ID | 必填 |
| campus_id | INT | 校区ID | 可为空 |
| course_name | VARCHAR(100) | 课程名称 | 必填 |
| payment_amount | DECIMAL(10,2) | 付款金额 | 必填 |
| payment_time | DATETIME | 支付时间 | 必填 |
| is_new_student | TINYINT | 是否新学员 | 1-是 0-否 |
| order_status | ENUM | 订单状态 | 待上课/上课中/已完成/已退款 |
| teacher_name | VARCHAR(50) | 授课老师 | 可为空 |
| region | VARCHAR(50) | 所属地区 | 可为空 |
| distributor_sales | VARCHAR(50) | 分销销售 | 可为空 |
| remark | TEXT | 备注 | 可为空 |
| data_source | ENUM | 数据来源 | 手工录入/小程序导入 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_order_no` (`order_no`)
- KEY `idx_customer_id` (`customer_id`)
- KEY `idx_wechat_id` (`wechat_id`)
- KEY `idx_sales_id` (`sales_id`)
- KEY `idx_campus_id` (`campus_id`)
- KEY `idx_payment_time` (`payment_time`)
- KEY `idx_create_time` (`create_time`)

**重要说明**：
- `is_new_student`：根据客户首次下单时间自动判定（3个月内为新学员）
- `wechat_id`、`wechat_nickname`、`phone`：冗余字段，用于 Excel 导入时快速匹配客户

---

### 8. financial_statistics（财务统计表）

**说明**：每日财务统计数据表（定时任务生成）

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 统计ID | 主键，自增 |
| date | DATE | 统计日期 | - |
| sales_id | INT | 销售ID | NULL表示全部 |
| campus_id | INT | 校区ID | NULL表示全部 |
| total_amount | DECIMAL(10,2) | 总收入 | 默认 0 |
| order_count | INT | 订单数 | 默认 0 |
| new_student_amount | DECIMAL(10,2) | 新学员收入 | 默认 0 |
| old_student_amount | DECIMAL(10,2) | 老学员收入 | 默认 0 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_date_sales_campus` (`date`,`sales_id`,`campus_id`)
- KEY `idx_date` (`date`)
- KEY `idx_sales_id` (`sales_id`)
- KEY `idx_campus_id` (`campus_id`)

---

### 9. okr_objectives（OKR目标表）

**说明**：OKR 目标定义表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 目标ID | 主键，自增 |
| user_id | INT | 用户ID | 个人目标 |
| team_id | INT | 团队ID | 团队目标 |
| quarter | TINYINT | 季度 | 1-4 |
| year | INT | 年份 | - |
| objective | TEXT | 目标描述 | 必填 |
| weight | DECIMAL(5,2) | 权重 | 默认 100.00 |
| status | ENUM | 状态 | 进行中/已完成/已取消 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_year_quarter` (`year`,`quarter`)

---

### 10. okr_key_results（OKR关键结果表）

**说明**：OKR 关键结果表

| 字段名 | 类型 | 说明 | 备注 |
|--------|------|------|------|
| id | INT | 关键结果ID | 主键，自增 |
| objective_id | INT | 目标ID | 外键关联 okr_objectives |
| key_result | TEXT | 关键结果描述 | 必填 |
| target_value | DECIMAL(10,2) | 目标值 | 必填 |
| current_value | DECIMAL(10,2) | 当前值 | 默认 0 |
| completion_rate | DECIMAL(5,2) | 完成率（%） | 虚拟计算列 |
| unit | VARCHAR(20) | 单位 | 元/单/人等 |
| create_time | DATETIME | 创建时间 | 自动填充 |
| update_time | DATETIME | 更新时间 | 自动更新 |

**索引**：
- PRIMARY KEY (`id`)
- KEY `idx_objective_id` (`objective_id`)

**特殊说明**：
- `completion_rate` 是计算列：`(current_value / target_value * 100)`

---

## ER 关系图

```
users ──┬── customers (sales_id)
        ├── customers (operator_id)
        ├── orders (sales_id)
        ├── customer_follow_records (operator_id)
        └── okr_objectives (user_id)

customers ──┬── orders (customer_id)
            └── customer_follow_records (customer_id)

orders ──> financial_statistics (汇总生成)

okr_objectives ──> okr_key_results (objective_id)

roles ──> users (role_id)
departments ──> users (department_id)
campuses ──> users (campus_id)
campuses ──> orders (campus_id)
```

---

## 核心业务逻辑

### 1. 新老客户判定规则

```sql
-- 判断规则：客户首次下单后 3 个月内算新学员
-- 实现位置：订单创建/更新时自动计算

SELECT
  CASE
    WHEN TIMESTAMPDIFF(MONTH,
      (SELECT MIN(payment_time) FROM orders WHERE customer_id = ?),
      NOW()) <= 3
    THEN 1  -- 新学员
    ELSE 0  -- 老学员
  END as is_new_student
```

### 2. Excel 订单导入匹配逻辑

**匹配优先级**：
1. 通过 `order_no` 查找已存在订单（有则更新）
2. 通过 `wechat_id` 精确匹配客户
3. 通过 `phone` 模糊匹配客户
4. 无法匹配则创建订单，`customer_id` 留空

### 3. 数据权限过滤

**SQL 示例**（根据角色自动注入条件）：

```sql
-- 销售：只看自己的数据
SELECT * FROM customers WHERE sales_id = {当前用户ID}

-- 校区主管：看本校区数据
SELECT * FROM orders WHERE campus_id = {当前用户校区ID}

-- 管理员：看全部
SELECT * FROM orders
```

---

## 性能优化建议

### 1. 索引优化
- ✅ 所有外键字段已添加索引
- ✅ 高频查询字段（微信号、订单号、时间）已添加索引
- ✅ 唯一约束字段已创建唯一索引

### 2. 查询优化
- 使用 `idx_payment_time` 加速时间范围查询
- 使用 `idx_sales_id` 加速权限过滤
- 定时统计表 `financial_statistics` 避免实时聚合

### 3. 数据量预估
- 客户表：1-10 万级别
- 订单表：每月 2000 条，年 2.4 万条
- 统计表：每日生成，年 365 条

---

## 备份策略

### 自动备份脚本

```bash
#!/bin/bash
# 每日凌晨 2 点自动备份

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/mysql"
BACKUP_FILE="education_crm_$DATE.sql"

mysqldump -u crm_user -pcrm_pass123 education_crm > $BACKUP_DIR/$BACKUP_FILE

# 压缩
gzip $BACKUP_DIR/$BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

---

## 常用查询示例

### 查询销售排行榜（本月）

```sql
SELECT
  u.real_name,
  COUNT(o.id) as order_count,
  SUM(o.payment_amount) as total_amount
FROM orders o
LEFT JOIN users u ON o.sales_id = u.id
WHERE o.payment_time >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY o.sales_id, u.real_name
ORDER BY total_amount DESC
LIMIT 10;
```

### 查询客户转化率

```sql
SELECT
  traffic_source,
  COUNT(*) as customer_count,
  COUNT(DISTINCT o.customer_id) as converted_count,
  ROUND(COUNT(DISTINCT o.customer_id) / COUNT(*) * 100, 2) as conversion_rate
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY traffic_source;
```

---

如有问题，请参考 [快速开始指南](./QUICK_START.md)
