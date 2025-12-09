# 运营管理模块API对接文档

## 概述

本文档描述了运营管理模块新增的API接口，用于前后端对接使用。

## 数据库迁移

在开始使用之前，请先执行数据库迁移脚本：
```sql
-- 文件位置：backend/migrations/add-operation-features.sql
-- 该脚本会创建运营客户转化表和通知表
```

## 新增API接口

### 1. 客户转化相关

#### 1.1 获取运营引流客户列表
```
GET /operation/customers
```

**查询参数：**
- page: 页码（默认1）
- pageSize: 每页数量（默认20）
- operatorId: 运营人员ID（可选）
- status: 客户状态（可选）
- conversionStage: 转化阶段（可选）
- platform: 来源平台（可选）
- city: 来源城市（可选）

**返回数据：**
```json
{
  "list": [
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "operatorId": 1,
      "operatorName": "运营A",
      "trafficPlatform": "小红书",
      "trafficCity": "广州",
      "status": "已成交",
      "conversionStage": "成交转化",
      "orderCount": 2,
      "totalAmount": 5998,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastOrderDate": "2024-01-15T00:00:00.000Z",
      "conversionRate": 15.5
    }
  ],
  "total": 100
}
```

#### 1.2 获取转化漏斗数据
```
GET /operation/conversion-funnel
```

**查询参数：**
- operatorId: 运营人员ID（可选）
- startDate: 开始日期（可选）
- endDate: 结束日期（可选）

**返回数据：**
```json
{
  "stages": [
    {
      "name": "引流",
      "value": 1000
    },
    {
      "name": "初步接触",
      "value": 600
    },
    {
      "name": "深度咨询",
      "value": 300
    },
    {
      "name": "试听体验",
      "value": 150
    },
    {
      "name": "成交转化",
      "value": 80
    }
  ]
}
```

### 2. 业绩指标相关

#### 2.1 获取运营业绩指标
```
GET /operation/performance-metrics
```

**查询参数：**
- operatorId: 运营人员ID（可选）
- startDate: 开始日期（可选）
- endDate: 结束日期（可选）

**返回数据：**
```json
{
  "totalViews": 125000,
  "totalPlays": 89000,
  "totalCustomers": 150,
  "totalCommission": 32000,
  "viewsGrowth": 15.5,
  "playsGrowth": 12.3,
  "customersGrowth": 8.7,
  "commissionGrowth": 22.1,
  "avgViews": 5800,
  "activeAccounts": 8,
  "conversionRate": 15.8
}
```

#### 2.2 获取平台效果对比
```
GET /operation/platform-comparison
```

**查询参数：**
- startDate: 开始日期（可选）
- endDate: 结束日期（可选）

**返回数据：**
```json
[
  {
    "platform": "小红书",
    "accountCount": 5,
    "totalFans": 150000,
    "avgEngagementRate": 5.2,
    "totalViews": 45000,
    "totalPlays": 32000,
    "avgViews": 9000
  },
  {
    "platform": "抖音",
    "accountCount": 3,
    "totalFans": 98000,
    "avgEngagementRate": 4.8,
    "totalViews": 52000,
    "totalPlays": 41000,
    "avgViews": 17333
  },
  {
    "platform": "视频号",
    "accountCount": 2,
    "totalFans": 56000,
    "avgEngagementRate": 3.9,
    "totalViews": 28000,
    "totalPlays": 16000,
    "avgViews": 14000
  }
]
```

### 3. 通知管理

#### 3.1 获取未读通知数量
```
GET /operation/notifications/unread-count
```

**返回数据：**
```json
{
  "count": 5
}
```

#### 3.2 获取通知列表
```
GET /operation/notifications
```

**查询参数：**
- page: 页码（默认1）
- pageSize: 每页数量（默认20）
- isRead: 是否已读（可选）

**返回数据：**
```json
{
  "list": [
    {
      "id": 1,
      "operatorId": 1,
      "customerId": 123,
      "orderId": 456,
      "type": "conversion",
      "title": "客户转化成功",
      "content": "您引流的客户张三已成功下单，订单金额：¥2999",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 20
}
```

#### 3.3 标记通知为已读
```
POST /operation/notifications/:id/read
```

**路径参数：**
- id: 通知ID

**返回数据：**
```json
{
  "id": 1,
  "operatorId": 1,
  "isRead": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.4 标记所有通知为已读
```
POST /operation/notifications/read-all
```

**返回数据：**
```json
{
  "success": true
}
```

## 自动化功能

### 1. 客户下单时的自动处理

当创建新学员订单时，系统会自动：

1. **生成提成记录**
   - 检查客户是否有运营人员
   - 检查订单是否有标签且配置了提成金额
   - 创建运营提成记录

2. **创建转化通知**
   - 向对应的运营人员发送转化成功通知
   - 通知内容包括客户名称和订单金额

3. **更新转化阶段**
   - 将客户转化阶段更新为"成交转化"

### 2. 数据权限控制

- **运营人员**：只能查看自己的数据
- **运营主管**：可以查看所有运营人员数据
- **管理员**：拥有所有权限

## 错误处理

### HTTP状态码

- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

## 注意事项

1. **时间格式**：所有日期时间使用ISO 8601格式
2. **金额格式**：使用数字类型，前端负责格式化显示
3. **分页格式**：统一使用 `{ list: [], total: number }` 格式
4. **权限验证**：所有接口都需要JWT token验证

## 测试建议

1. **功能测试**
   - 测试各接口的正常流程
   - 测试参数校验
   - 测试权限控制

2. **集成测试**
   - 测试订单创建时的自动提成生成
   - 测试通知自动创建
   - 测试数据统计准确性

3. **性能测试**
   - 测试大数据量下的查询性能
   - 测试并发请求处理

## 后续优化

1. **缓存优化**：对频繁查询的数据添加缓存
2. **批量操作**：支持批量更新状态等操作
3. **实时通知**：使用WebSocket实现实时推送
4. **数据分析**：添加更多维度的数据分析功能