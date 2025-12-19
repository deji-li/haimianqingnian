<template>
  <div class="conversation-mode">
    <!-- 对话消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', message.role]"
      >
        <div class="message-avatar">
          <el-avatar v-if="message.role === 'user'" :size="36">
            {{ userStore.user?.realName?.[0] || 'U' }}
          </el-avatar>
          <el-avatar v-else :size="36" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon><Cpu /></el-icon>
          </el-avatar>
        </div>

        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>

          <!-- AI思考过程 -->
          <thinking-process
            v-if="message.role === 'assistant' && message.thinkingProcess"
            :process="message.thinkingProcess"
            :confidence="message.confidenceScore"
            :processing-time="message.processingTime"
            :knowledge-sources="message.knowledgeSource"
          />

          <!-- 消息时间 -->
          <div class="message-time">
            {{ formatTime(message.createTime) }}
          </div>
        </div>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="message-item assistant">
        <div class="message-avatar">
          <el-avatar :size="36" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon class="is-loading"><Loading /></el-icon>
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          :placeholder="getPlaceholder()"
          :disabled="loading"
          @keydown.enter.prevent="handleEnter"
          resize="none"
          maxlength="2000"
          show-word-limit
        />
        <div class="input-actions">
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Cpu, Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import ThinkingProcess from './ThinkingProcess.vue'
import { createConversation, sendMessage as sendMsgApi } from '@/api/ai-script-assistant'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  thinkingProcess?: string
  confidenceScore?: number
  processingTime?: number
  knowledgeSource?: any[]
  createTime: string
}

const props = defineProps<{
  functionType: string
  customerId?: number
}>()

const emit = defineEmits<{
  scriptGenerated: [script: string]
}>()

const userStore = useUserStore()

// 状态管理
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const conversationId = ref<number | null>(null)
const messageListRef = ref<HTMLElement>()

// 初始化对话
const initConversation = async () => {
  try {
    const conv = await createConversation({
      functionType: props.functionType as any,
      customerId: props.customerId,
    })
    conversationId.value = conv.id

    // 如果有场景和技巧，发送欢迎消息
    if (conv.scenarioId && conv.techniqueId) {
      messages.value.push({
        id: Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(),
        createTime: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('初始化对话失败:', error)
    ElMessage.error('初始化对话失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value || !conversationId.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString(),
  })

  scrollToBottom()

  loading.value = true

  try {
    const response = await sendMsgApi(conversationId.value, {
      content: userMessage,
    })

    // 添加AI回复
    messages.value.push({
      id: response.assistantMessage.id,
      role: 'assistant',
      content: response.assistantMessage.content,
      thinkingProcess: response.assistantMessage.thinkingProcess,
      confidenceScore: response.assistantMessage.confidenceScore,
      processingTime: response.assistantMessage.processingTime,
      knowledgeSource: response.knowledgeSources,
      createTime: response.assistantMessage.createTime,
    })

    // 触发话术生成事件
    emit('scriptGenerated', response.assistantMessage.content)

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 处理回车发送
const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 格式化消息内容
const formatMessage = (content: string) => {
  // 简单的换行处理
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取输入框占位符
const getPlaceholder = () => {
  const placeholders = {
    deal_assist: '请描述您的客户情况，我将为您提供谈单话术建议...',
    reply_assist: '请描述客户的问题或异议，我将帮您生成合适的回复...',
    script_polish: '请输入您想要润色的话术内容...',
    opening_lines: '请描述客户情况和场景，我将为您生成开场白...',
  }
  return placeholders[props.functionType as keyof typeof placeholders] || '请输入您的问题...'
}

// 获取欢迎消息
const getWelcomeMessage = () => {
  const welcomeMessages = {
    deal_assist: '您好！我是您的谈单助手，请告诉我您遇到的客户情况，我将为您提供专业的话术建议。',
    reply_assist: '您好！我是您的回复助手，请描述客户的提问或异议，我将帮您生成合适的回复话术。',
    script_polish: '您好！我是话术润色助手，请提供您想要优化的话术内容，我将帮您进行改进。',
    opening_lines: '您好！我是开场白生成助手，请告诉我客户的基本情况，我将为您生成有效的开场白。',
  }
  return welcomeMessages[props.functionType as keyof typeof welcomeMessages] || '您好！我是AI话术助手，请问有什么可以帮助您的？'
}

// 监听功能类型变化
watch(() => props.functionType, () => {
  messages.value = []
  initConversation()
})

onMounted(() => {
  initConversation()
})
</script>

<style scoped lang="scss">
.conversation-mode {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e4e7ed;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-right: 12px;

      .message-text {
        color: white;
      }

      .message-time {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .message-avatar {
      margin-left: 12px;
    }
  }

  &.assistant {
    .message-content {
      background: #f5f7fa;
      margin-left: 12px;
    }

    .message-avatar {
      margin-right: 12px;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;

  .message-text {
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
    margin-bottom: 8px;
    word-wrap: break-word;
  }

  .message-time {
    font-size: 12px;
    color: #909399;
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    background-color: #409eff;
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

.input-area {
  border-top: 1px solid #e4e7ed;
  padding: 16px 20px;
  background: #fff;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;

  .el-textarea {
    flex: 1;
  }
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

// 响应式设计
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .input-actions {
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>