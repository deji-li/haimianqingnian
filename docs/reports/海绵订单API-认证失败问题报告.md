# 海绵订单同步API - 认证失败问题报告

## 📋 问题概述

**报告时间**: 2025-11-22 13:20
**问题状态**: ❌ API认证失败
**影响范围**: 订单同步功能无法使用
**错误代码**: 100 (未登录)

---

## 🔗 API基本信息

| 项目 | 内容 |
|------|------|
| **API地址** | `https://yx.vipstore.top/yoga/admin/getGoodsOrderList` |
| **请求方法** | POST |
| **Content-Type** | `application/x-www-form-urlencoded` |
| **API密钥** | `12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT` |

---

## 🧪 测试详情

### 测试请求

```bash
curl -X POST https://yx.vipstore.top/yoga/admin/getGoodsOrderList \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT&page=1&limit=10"
```

### 请求参数

```
key=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT
page=1
limit=10
```

### HTTP响应头

```
HTTP/1.1 200 OK
Server: nginx
Date: Sat, 22 Nov 2025 05:19:59 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type,X-File-Name, Accept
Access-Control-Max-Age: 1728000
Strict-Transport-Security: max-age=31536000
```

### 响应内容

```json
{
  "code": 100,
  "msg": "未登录",
  "time": 1763788799,
  "data": []
}
```

---

## ❌ 问题分析

### 1. HTTP状态码正常，但业务状态异常

- ✅ HTTP状态码: `200 OK` (服务器成功接收并处理请求)
- ❌ 业务状态码: `100` (未登录/认证失败)
- ❌ 错误信息: `"未登录"`
- ❌ 数据结果: `[]` (空数组)

### 2. 可能的原因

1. **API密钥无效**
   - 密钥可能已过期
   - 密钥可能被撤销
   - 密钥格式或配置错误

2. **认证方式不完整**
   - 可能需要额外的认证参数(如token, signature等)
   - 可能需要Session认证
   - 可能需要IP白名单

3. **请求格式问题**
   - 参数名称可能有误(key vs apiKey vs api_key)
   - 缺少必需的附加参数
   - 字段顺序或编码问题

---

## 💻 我方实现代码

### 后端实现 (NestJS/TypeScript)

```typescript
// backend/src/modules/order-sync/haimian-api.service.ts

async getOrderList(params: {
  page?: number;
  limit?: number;
  startTime?: string;
  endTime?: string;
  status?: number;
}): Promise<HaimianOrder[]> {
  const apiKey = await this.businessConfigService.getConfig('order_sync.api_key');
  const apiUrl = await this.businessConfigService.getConfig('order_sync.api_url');

  const requestData: HaimianApiRequest = {
    key: apiKey,                    // ← 使用 'key' 作为参数名
    page: params.page || 1,
    limit: params.limit || 100,
    start_time: params.startTime,
    end_time: params.endTime,
    status: params.status,
  };

  // 将JSON对象转换为URL编码格式
  const formData = new URLSearchParams();
  Object.keys(requestData).forEach((key) => {
    const value = requestData[key];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await axios.post<HaimianApiResponse>(
    apiUrl,
    formData.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    }
  );

  // 返回 code: 100, msg: "未登录"
  if (response.data.code !== 200) {
    throw new HttpException(
      `海绵API返回错误: ${response.data.msg}`,
      HttpStatus.BAD_GATEWAY,
    );
  }

  return response.data.data.list;
}
```

### 实际错误日志

```
[Nest] 29028  - 2025/11/22 12:57:33   ERROR [OrderSyncService] 同步失败: 海绵API返回错误: 未登录
HttpException: 海绵API返回错误: 未登录
    at HaimianApiService.getOrderList (D:\CC\1.1\backend\dist\main.js:317208:23)
    at async HaimianApiService.getAllOrders (D:\CC\1.1\backend\dist\main.js:317227:28)
    at async OrderSyncService.triggerSync (D:\CC\1.1\backend\dist\main.js:316285:35)
```

---

## 📝 需要海绵技术团队提供的信息

### 1. API认证方式确认

请确认正确的API调用方式，包括：

- [ ] API密钥参数名称是 `key` 还是其他名称？
- [ ] 是否需要额外的认证参数？
- [ ] 是否需要特定的请求头（如Authorization, Token等）？
- [ ] 是否有IP白名单限制？

### 2. API密钥状态

- [ ] 请确认API密钥 `12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT` 是否有效
- [ ] 如已失效，请提供新的有效密钥
- [ ] 请说明密钥的有效期和使用限制

### 3. 完整的API文档

请提供包含以下内容的完整API文档：

- [ ] 请求参数完整列表（必填/选填）
- [ ] 参数类型和格式说明
- [ ] 认证方式详细说明
- [ ] 响应格式说明（成功和失败场景）
- [ ] 错误码对照表
- [ ] 示例请求和响应

### 4. 测试环境

- [ ] 是否有测试环境可供调试？
- [ ] 测试环境的API地址和密钥

---

## 🔧 临时解决方案

在等待海绵团队回复期间，建议：

1. **确认API文档**: 检查是否有最新版本的API文档
2. **联系技术对接人**: 确认API密钥状态和认证方式
3. **IP白名单**: 如需要，请将我方服务器IP加入白名单
4. **版本确认**: 确认API版本是否有更新

---

## 📞 联系信息

**报告提交人**: [您的名字/团队]
**联系方式**: [您的邮箱/电话]
**紧急程度**: 🔴 高 (影响订单同步功能)

---

## 附录：完整的curl测试命令

```bash
# 基础测试
curl -X POST https://yx.vipstore.top/yoga/admin/getGoodsOrderList \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT&page=1&limit=10"

# 带详细输出的测试
curl -X POST https://yx.vipstore.top/yoga/admin/getGoodsOrderList \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT&page=1&limit=10" \
  -i -v

# 测试不同参数名
curl -X POST https://yx.vipstore.top/yoga/admin/getGoodsOrderList \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "apiKey=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT&page=1&limit=10"

curl -X POST https://yx.vipstore.top/yoga/admin/getGoodsOrderList \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT&page=1&limit=10"
```

---

**文档版本**: 1.0
**最后更新**: 2025-11-22 13:20
**状态**: 等待海绵技术团队反馈
