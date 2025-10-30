# 运营提成功能测试指南

## 测试前提

1. 确保数据库Schema正确（运行 `verify-schema.sql`）
2. 确保字典表有提成配置：
   - 正常订单: 8元
   - 活动订单: 5元
3. 准备测试数据：
   - 至少1个运营人员账号
   - 至少1个绑定了该运营人员的客户
   - 至少1个未绑定运营人员的客户

## 测试用例

### 用例1: ✅ 正常订单，应生成8元提成

**前置条件：**
- 客户已绑定运营人员（operator_id 不为空）
- 订单为新学员订单（is_new_student = 1）
- 订单标签为"正常订单"

**测试步骤：**
1. 通过API创建订单：
   ```json
   {
     "customerId": 1,  // 该客户的operator_id不为空
     "campusId": 1,
     "orderAmount": 1000,
     "paymentAmount": 1000,
     "orderTag": "正常订单",
     "isNewStudent": 1
   }
   ```

2. 查询 operation_commission_records 表

**预期结果：**
- 自动创建1条提成记录
- commission_amount = 8
- order_tag = "正常订单"
- status = "待发放"

**SQL验证：**
```sql
SELECT * FROM operation_commission_records
WHERE order_id = [刚创建的订单ID];
```

---

### 用例2: ✅ 活动订单，应生成5元提成

**前置条件：**
- 客户已绑定运营人员
- 订单为新学员订单
- 订单标签为"活动订单"

**测试步骤：**
1. 创建订单，orderTag设为"活动订单"

**预期结果：**
- commission_amount = 5
- order_tag = "活动订单"

---

### 用例3: ❌ 无订单标签，不应生成提成

**前置条件：**
- 客户已绑定运营人员
- 订单为新学员订单
- 订单标签为空或null

**测试步骤：**
1. 创建订单，不传orderTag字段

**预期结果：**
- operation_commission_records 表中无新记录
- 不抛出错误，正常创建订单

---

### 用例4: ❌ 老学员订单，不应生成提成

**前置条件：**
- 客户已绑定运营人员
- 订单为老学员订单（is_new_student = 0）
- 订单有标签

**测试步骤：**
1. 创建订单，isNewStudent设为0

**预期结果：**
- operation_commission_records 表中无新记录

**业务逻辑：**
仅新学员的首单才为运营带来引流价值，老学员复购不算运营业绩。

---

### 用例5: ❌ 客户未绑定运营人员，不应生成提成

**前置条件：**
- 客户的 operator_id 为 null
- 订单为新学员订单
- 订单有标签

**测试步骤：**
1. 使用未绑定运营人员的客户创建订单

**预期结果：**
- operation_commission_records 表中无新记录

**业务逻辑：**
客户不是通过运营引流来的，没有运营提成。

---

### 用例6: ❌ 未配置的订单标签，不应生成提成

**前置条件：**
- 客户已绑定运营人员
- 订单为新学员订单
- 订单标签为"特殊活动"（字典中未配置）

**测试步骤：**
1. 创建订单，orderTag设为"特殊活动"

**预期结果：**
- operation_commission_records 表中无新记录

**业务逻辑：**
未配置提成金额的标签不生成提成，灵活控制哪些订单类型有提成。

---

### 用例7: ✅ 同一订单不重复生成提成

**前置条件：**
- 已有订单的提成记录存在

**测试步骤：**
1. 尝试更新该订单（如修改金额）

**预期结果：**
- operation_commission_records 表中该订单只有1条记录
- 不会重复创建

**代码保护：**
```typescript
const existingCommission = await this.operationCommissionRepository.findOne({
  where: { orderId: savedOrder.id },
});

if (!existingCommission) {
  // 只有不存在时才创建
}
```

---

## 批量测试SQL脚本

### 1. 查看提成配置
```sql
SELECT dict_label as '订单标签', dict_value as '提成金额（元）'
FROM dictionary
WHERE dict_type = 'operation_commission' AND status = 1;
```

### 2. 查看所有提成记录
```sql
SELECT
  c.id,
  c.operator_id,
  u.real_name as '运营人员',
  cust.wechat_nickname as '客户',
  c.order_tag as '订单标签',
  c.order_amount as '订单金额',
  c.commission_amount as '提成金额',
  c.status as '状态',
  c.create_time as '创建时间'
FROM operation_commission_records c
LEFT JOIN users u ON c.operator_id = u.id
LEFT JOIN customers cust ON c.customer_id = cust.id
ORDER BY c.create_time DESC;
```

### 3. 统计某运营人员的提成
```sql
SELECT
  u.real_name as '运营人员',
  COUNT(*) as '订单数',
  SUM(commission_amount) as '总提成',
  SUM(CASE WHEN status='已发放' THEN commission_amount ELSE 0 END) as '已发放',
  SUM(CASE WHEN status='待发放' THEN commission_amount ELSE 0 END) as '待发放'
FROM operation_commission_records c
LEFT JOIN users u ON c.operator_id = u.id
WHERE c.operator_id = [运营人员ID]
GROUP BY c.operator_id;
```

### 4. 查看未生成提成的新学员订单（排查问题）
```sql
SELECT
  o.id as '订单ID',
  o.order_tag as '订单标签',
  o.is_new_student as '是否新学员',
  c.operator_id as '运营人员ID',
  CASE
    WHEN o.is_new_student = 0 THEN '老学员订单'
    WHEN c.operator_id IS NULL THEN '客户未绑定运营'
    WHEN o.order_tag IS NULL THEN '订单无标签'
    ELSE '检查字典配置'
  END as '未生成原因'
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN operation_commission_records ocr ON o.id = ocr.order_id
WHERE ocr.id IS NULL  -- 没有提成记录
  AND o.payment_amount > 0  -- 已付款
ORDER BY o.create_time DESC
LIMIT 20;
```

## 测试检查清单

- [ ] 用例1: 正常订单生成8元提成
- [ ] 用例2: 活动订单生成5元提成
- [ ] 用例3: 无标签不生成提成
- [ ] 用例4: 老学员不生成提成
- [ ] 用例5: 无运营人员不生成提成
- [ ] 用例6: 未配置标签不生成提成
- [ ] 用例7: 同一订单不重复生成
- [ ] 验证字典配置正确
- [ ] 验证数据库Schema正确
- [ ] 验证后端日志无错误

## API测试示例（Postman/cURL）

### 创建订单（应生成提成）
```bash
curl -X POST http://8.138.144.234:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": 1,
    "campusId": 1,
    "orderAmount": 1000,
    "paymentAmount": 1000,
    "orderTag": "正常订单",
    "isNewStudent": 1
  }'
```

### 创建订单（不应生成提成 - 无标签）
```bash
curl -X POST http://8.138.144.234:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": 1,
    "campusId": 1,
    "orderAmount": 1000,
    "paymentAmount": 1000,
    "isNewStudent": 1
  }'
```

## 故障排查

### 问题: 应该生成提成但没有生成

**检查步骤：**

1. **验证客户是否绑定运营人员：**
   ```sql
   SELECT id, wechat_nickname, operator_id
   FROM customers
   WHERE id = [客户ID];
   ```

2. **验证订单信息：**
   ```sql
   SELECT id, order_tag, is_new_student, payment_amount
   FROM orders
   WHERE id = [订单ID];
   ```

3. **验证字典配置：**
   ```sql
   SELECT * FROM dictionary
   WHERE dict_type = 'operation_commission'
     AND dict_label = [订单标签]
     AND status = 1;
   ```

4. **查看后端日志：**
   ```bash
   docker logs crm-backend-1 --tail 100
   ```
   查找 "Failed to create operation commission" 错误

### 问题: 提成金额不正确

**检查：**
- 字典表中该订单标签的 dict_value 是否正确
- DictionaryService.getOperationCommissionAmount() 方法是否正确解析

### 问题: 重复生成提成

**检查：**
- order_id 是否有唯一索引
- 代码中是否有 existingCommission 检查

---

**测试负责人：** ___________
**测试日期：** ___________
**测试结果：** [ ] 通过  [ ] 失败
**备注：** ___________
