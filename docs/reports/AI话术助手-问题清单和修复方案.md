# AI话术助手 - 问题清单和修复方案

## 发现的问题

### ❌ 问题1：字段名不一致（严重）
**位置**: Message Entity vs 前端API

**问题描述**:
- 数据库表字段: `role` ENUM('user', 'assistant')
- Entity字段: `role`
- 前端API定义: `messageType: 'user' | 'assistant'`
- 前端组件使用: `message.messageType`

**影响**: 前端无法正确读取消息类型，导致UI显示错误

**修复方案**:
```typescript
// Entity添加虚拟字段或序列化转换
// 或修改前端统一使用 role
```

---

### ❌ 问题2：Message缺少反馈统计字段（严重）
**位置**: Message Entity

**问题描述**:
- 前端期望: `likeCount: number, dislikeCount: number`
- Entity中没有这些字段
- FeedbackService有 `getFeedbackStats()` 方法但未被使用

**影响**: 前端无法显示点赞/踩数量，用户无法看到反馈统计

**修复方案**:
```typescript
// 方案1: Entity添加虚拟字段
@VirtualColumn()
likeCount?: number;

@VirtualColumn()
dislikeCount?: number;

// 方案2: Service查询时手动附加统计数据
async getConversationDetail(id) {
  const messages = await this.messageRepository.find(...);

  // 为每条消息附加反馈统计
  for (const message of messages) {
    const stats = await this.feedbackService.getFeedbackStats(message.id);
    message.likeCount = stats.likeCount;
    message.dislikeCount = stats.dislikeCount;
  }

  return { conversation, messages };
}
```

---

### ⚠️ 问题3：Conversation缺少 lastMessageTime 字段（中等）
**位置**: Conversation Entity 和数据库表

**问题描述**:
- 前端使用: `conv.lastMessageTime || conv.createTime`
- 数据库表中没有 `last_message_time` 字段
- Entity中没有定义此字段

**影响**: 对话列表无法按最后消息时间排序，前端会fallback到createTime

**修复方案**:
```sql
-- 添加数据库字段
ALTER TABLE `ai_script_conversation`
ADD COLUMN `last_message_time` DATETIME DEFAULT NULL COMMENT '最后消息时间'
AFTER `title`;

-- 添加索引
CREATE INDEX `idx_last_message` ON `ai_script_conversation`(`last_message_time`);
```

```typescript
// Entity添加字段
@Column({
  name: 'last_message_time',
  type: 'datetime',
  nullable: true,
  comment: '最后消息时间',
})
lastMessageTime: Date;

// 发送消息时更新
await this.conversationRepository.update(
  { id: conversationId },
  { lastMessageTime: new Date() }
);
```

---

### ❌ 问题4：sendMessage返回数据不完整（严重）
**位置**: ScriptGenerationService.generateScript()

**问题描述**:
当前返回:
```typescript
{
  messageId: number;
  content: string;
  thinkingProcess: string;
  suggestions: string[];
  knowledgeSource?: any;
  sourceType: string;
}
```

前端期望:
```typescript
{
  message: AiScriptMessage;  // 完整的消息对象
  conversation: AiScriptConversation;  // 更新后的对话对象
}
```

**影响**: 前端无法正确更新UI，无法获取完整的消息对象

**修复方案**:
```typescript
// 修改 generateScript 返回值
async generateScript(...): Promise<{
  message: AiScriptMessage;
  conversation: AiScriptConversation;
}> {
  // ...生成逻辑...

  // 获取完整的消息对象（包含反馈统计）
  const message = await this.messageRepository.findOne({
    where: { id: assistantMessage.id },
  });

  // 附加反馈统计
  const stats = await this.feedbackService.getFeedbackStats(message.id);
  message.likeCount = stats.likeCount;
  message.dislikeCount = stats.dislikeCount;

  // 获取更新后的对话对象
  const conversation = await this.conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['scenario', 'technique'],
  });

  return { message, conversation };
}
```

---

### ❌ 问题5：getConversationDetail没有附加反馈统计（中等）
**位置**: ConversationService.getConversationDetail()

**问题描述**:
查询对话详情时，返回的messages没有反馈统计字段

**影响**: 历史消息无法显示点赞/踩数量

**修复方案**:
```typescript
async getConversationDetail(conversationId: number, userId: number) {
  const conversation = await this.conversationRepository.findOne(...);

  const messages = await this.messageRepository.find({
    where: { conversationId },
    order: { createTime: 'ASC' },
  });

  // 为每条消息附加反馈统计
  const messagesWithStats = await Promise.all(
    messages.map(async (message) => {
      const stats = await this.feedbackService.getFeedbackStats(message.id);
      return {
        ...message,
        likeCount: stats.likeCount,
        dislikeCount: stats.dislikeCount,
      };
    })
  );

  return {
    conversation,
    messages: messagesWithStats,
  };
}
```

---

### ⚠️ 问题6：EnterpriseKnowledgeBase Entity可能缺少字段
**位置**: 知识库实体

**需要检查**: 知识库表是否有以下字段
- `sourceId` - 用于自动学习功能
- `creatorId` - 创建者ID
- `status` - 待审核状态

---

### ⚠️ 问题7：循环依赖风险
**位置**: FeedbackService 注入 ConversationService

**问题描述**:
```typescript
// FeedbackService
constructor(
  private readonly conversationService: ConversationService,  // 可能导致循环依赖
) {}
```

**修复方案**:
使用 `forwardRef()` 或重构服务依赖关系

---

## 修复优先级

### 🔴 高优先级（必须修复）
1. ✅ 问题1：字段名不一致 - 影响基本功能
2. ✅ 问题2：Message缺少反馈统计 - 影响用户体验
3. ✅ 问题4：sendMessage返回数据不完整 - 影响前端更新

### 🟡 中优先级（建议修复）
1. ✅ 问题3：添加 lastMessageTime 字段
2. ✅ 问题5：getConversationDetail附加反馈统计

### 🟢 低优先级（可选）
1. 问题6：检查知识库字段
2. 问题7：优化服务依赖

---

## 快速修复步骤

### 步骤1：统一字段名（二选一）

**方案A：修改前端（推荐）**
```typescript
// frontend/src/api/ai-script.ts
export interface AiScriptMessage {
  // 改为 role
  role: 'user' | 'assistant';
  // ...其他字段
}
```
然后全局替换前端组件中的 `messageType` 为 `role`

**方案B：修改Entity添加序列化**
```typescript
// Entity添加getter
@Entity('ai_script_message')
export class AiScriptMessage {
  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: string;

  // 添加虚拟字段用于JSON序列化
  get messageType(): string {
    return this.role;
  }
}
```

### 步骤2：添加反馈统计字段

修改以下Service方法：
1. `ConversationService.getConversationDetail()`
2. `ScriptGenerationService.generateScript()`

在返回messages时附加统计数据。

### 步骤3：添加 lastMessageTime 字段

1. 执行数据库ALTER语句
2. 更新Entity
3. 在saveMessage时更新lastMessageTime

### 步骤4：修复返回数据结构

修改 `ScriptGenerationService.generateScript()` 返回完整的 message 和 conversation 对象。

---

## 测试检查清单

修复后需要测试：
- [ ] 创建对话
- [ ] 发送消息，检查返回数据
- [ ] 检查消息类型显示（用户/AI）
- [ ] 提交反馈，检查统计更新
- [ ] 查看对话历史，检查反馈显示
- [ ] 检查对话列表排序
- [ ] 测试自动学习功能

---

## 预计修复时间

- 高优先级修复：1-2小时
- 中优先级修复：30分钟
- 全面测试：1小时

**总计：2.5-3.5小时**
