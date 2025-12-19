<template>
  <div class="script-assistant">
    <!-- 左侧对话列表 - 仅对话模式显示 -->
    <div v-if="isConversationMode" class="conversation-sidebar">
      <div class="sidebar-header">
        <el-button type="primary" style="width: 100%" @click="createNewConversation">
          <el-icon><Plus /></el-icon>
          新建对话
        </el-button>
      </div>

      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          :class="['conversation-item', { active: currentConversationId === conv.id }]"
        >
          <div class="conversation-content" @click="selectConversation(conv.id)">
            <div class="conversation-title">{{ conv.title || '新对话' }}</div>
            <div class="conversation-meta">
              <span class="conversation-time">{{ formatTime(conv.lastMessageTime || conv.createTime) }}</span>
              <span class="conversation-type">{{ getFunctionTypeName(conv.functionType) }}</span>
            </div>
          </div>
          <div class="conversation-actions">
            <el-button
              type="danger"
              size="small"
              text
              @click.stop="handleDeleteConversation(conv.id)"
              :icon="Delete"
              title="删除对话"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="main-content" :class="{ 'full-width': !isConversationMode }">
      <!-- 功能模型选择 -->
      <div class="function-selector">
        <el-radio-group v-model="currentFunction" size="large" @change="handleFunctionChange">
          <el-radio-button label="deal_assist">帮你谈单</el-radio-button>
          <el-radio-button label="reply_assist">帮你回复</el-radio-button>
          <el-radio-button label="script_polish">话术润色</el-radio-button>
          <el-radio-button label="opening_lines">开场白生成</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 工具模式 - 话术润色 -->
      <div v-if="currentFunction === 'script_polish'" class="tool-mode">
        <script-polish-panel />
      </div>

      <!-- 工具模式 - 开场白生成 -->
      <div v-else-if="currentFunction === 'opening_lines'" class="tool-mode">
        <opening-lines-panel />
      </div>

      <!-- 对话模式 -->
      <template v-else>
        <!-- 场景和技巧选择区域 -->
        <div v-if="showScenarioSelector" class="scenario-technique-selector">
          <!-- 锁定状态提示 -->
          <div v-if="isLocked" class="lock-notice">
            <el-icon><Lock /></el-icon>
            <span>当前对话已锁定场景和技巧，无法更改。请新建对话以使用其他场景。</span>
          </div>

          <!-- 场景选择 -->
          <div class="selector-section">
            <h3 class="selector-title">
              选择场景
              <el-tag v-if="isLocked" type="info" size="small" class="lock-tag">已锁定</el-tag>
            </h3>
            <div class="scenario-grid">
              <div
                v-for="scenario in scenarios"
                :key="scenario.id"
                :class="[
                  'scenario-card',
                  { active: selectedScenario === scenario.id },
                  { locked: isLocked }
                ]"
                @click="!isLocked && selectScenario(scenario.id)"
              >
                <div class="scenario-name">{{ scenario.scenarioName }}</div>
                <div v-if="isLocked && selectedScenario === scenario.id" class="lock-indicator">
                  <el-icon><Lock /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 技巧选择 -->
          <div v-if="techniques.length > 0" class="selector-section">
            <h3 class="selector-title">
              选择技巧
              <el-tag v-if="isLocked" type="info" size="small" class="lock-tag">已锁定</el-tag>
            </h3>
            <div class="technique-grid">
              <div
                v-for="technique in techniques"
                :key="technique.id"
                :class="[
                  'technique-card',
                  { active: selectedTechnique === technique.id },
                  { locked: isLocked }
                ]"
                @click="!isLocked && selectTechnique(technique.id)"
              >
                <div class="technique-name">{{ technique.techniqueName }}</div>
                <div class="technique-desc">{{ technique.techniqueDesc }}</div>
                <div v-if="isLocked && selectedTechnique === technique.id" class="lock-indicator">
                  <el-icon><Lock /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="chat-area">
          <div v-if="!currentConversationId" class="empty-state">
            <el-empty description="请选择或创建一个对话开始使用">
              <el-button type="primary" @click="createNewConversation">创建新对话</el-button>
            </el-empty>
          </div>

          <template v-else>
            <!-- 消息列表 -->
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
                    :confidence="parseFloat(message.confidenceScore || '0')"
                    :processing-time="message.processingTime"
                    :knowledge-sources="message.knowledgeSource"
                  />

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
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Cpu, Loading, Lock, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import ThinkingProcess from '@/components/ai-script-assistant/ThinkingProcess.vue'
import ScriptPolishPanel from '@/components/ai-script-assistant/ScriptPolishPanel.vue'
import OpeningLinesPanel from '@/components/ai-script-assistant/OpeningLinesPanel.vue'
import { createConversation, sendMessage as sendMsgApi, getConversations, getConversationDetail, getScenarios, getTechniques, deleteConversation } from '@/api/ai-script-assistant'

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

interface Conversation {
  id: number
  title: string
  functionType: string
  scenarioId?: number
  techniqueId?: number
  lastMessageTime?: string
  createTime: string
}

const userStore = useUserStore()

// 状态管理
const currentFunction = ref<string>('deal_assist')
const currentConversationId = ref<number | null>(null)
const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)

// 场景和技巧
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const selectedScenario = ref<number | null>(null)
const selectedTechnique = ref<number | null>(null)

// 锁定状态：对话开始后锁定场景和技巧
const isLocked = computed(() => {
  return currentConversationId.value !== null && isConversationMode.value
})

const messageListRef = ref<HTMLElement>()

// 计算属性
const isConversationMode = computed(() => {
  return currentFunction.value === 'deal_assist' || currentFunction.value === 'reply_assist'
})

const showScenarioSelector = computed(() => {
  return currentFunction.value === 'deal_assist' ||
         currentFunction.value === 'reply_assist' ||
         currentFunction.value === 'opening_lines'
})

// 获取功能类型名称
const getFunctionTypeName = (functionType: string) => {
  const typeNames = {
    deal_assist: '帮你谈单',
    reply_assist: '帮你回复',
    script_polish: '话术润色',
    opening_lines: '开场白生成',
  }
  return typeNames[functionType as keyof typeof typeNames] || functionType
}

// 创建新对话
const createNewConversation = async () => {
  // 检查是否选择了场景和技巧
  if (currentFunction.value === 'deal_assist' || currentFunction.value === 'reply_assist') {
    if (!selectedScenario.value || !selectedTechnique.value) {
      ElMessage.warning('请先选择场景和技巧')
      return
    }
  }

  try {
    const conv = await createConversation({
      functionType: currentFunction.value as any,
      scenarioId: selectedScenario.value || undefined,
      techniqueId: selectedTechnique.value || undefined,
    })

    await loadConversations()
    await selectConversation(conv.id)

    ElMessage.success('对话创建成功')
  } catch (error) {
    console.error('创建对话失败:', error)
    ElMessage.error('创建对话失败')
  }
}

// 选择对话
const selectConversation = async (conversationId: number) => {
  currentConversationId.value = conversationId

  // 如果是对话模式，需要加载对话的场景和技巧并锁定
  const conversation = conversations.value.find(c => c.id === conversationId)
  if (conversation && isConversationMode.value) {
    // 锁定场景和技巧，禁止更改
    selectedScenario.value = conversation.scenarioId
    selectedTechnique.value = conversation.techniqueId

    // 加载对应的技巧列表
    if (selectedScenario.value) {
      try {
        const result = await getTechniques(selectedScenario.value)
        techniques.value = result || []
      } catch (error) {
        console.error('加载技巧失败:', error)
      }
    }
  }

  // 加载对话消息
  await loadMessages(conversationId)
}

// 加载对话消息
const loadMessages = async (conversationId: number) => {
  try {
    const result = await getConversationDetail(conversationId)
    messages.value = result.messages || []
  } catch (error) {
    console.error('加载消息失败:', error)
    messages.value = []
  }
}

// 删除对话
const handleDeleteConversation = async (conversationId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个对话吗？删除后将无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteConversation(conversationId)
    ElMessage.success('对话删除成功')

    // 如果删除的是当前对话，清空消息区
    if (currentConversationId.value === conversationId) {
      currentConversationId.value = null
      messages.value = []
      selectedScenario.value = null
      selectedTechnique.value = null
    }

    // 重新加载对话列表
    await loadConversations()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除对话失败:', error)
      ElMessage.error('删除对话失败')
    }
  }
}

// 加载对话列表
const loadConversations = async () => {
  try {
    const result = await getConversations({
      page: 1,
      limit: 50
    })
    conversations.value = result.list || []
  } catch (error) {
    console.error('加载对话列表失败:', error)
  }
}

// 加载场景
const loadScenarios = async () => {
  if (!showScenarioSelector.value) return

  try {
    const result = await getScenarios(currentFunction.value as any)
    scenarios.value = result || []
  } catch (error) {
    console.error('加载场景失败:', error)
  }
}

// 选择场景
const selectScenario = async (scenarioId: number) => {
  selectedScenario.value = scenarioId
  selectedTechnique.value = null
  techniques.value = []

  try {
    const result = await getTechniques(scenarioId)
    techniques.value = result || []
  } catch (error) {
    console.error('加载技巧失败:', error)
  }
}

// 选择技巧
const selectTechnique = (techniqueId: number) => {
  selectedTechnique.value = techniqueId
}


// 处理场景变化（保留兼容性）
const handleScenarioChange = async () => {
  if (selectedScenario.value) {
    await selectScenario(selectedScenario.value)
  }
}

// 处理功能变化
const handleFunctionChange = () => {
  // 如果有活跃对话，提示用户先结束对话
  if (currentConversationId.value && isConversationMode.value) {
    ElMessage.warning('请先结束当前对话再切换功能类型')
    // 恢复原选中状态
    currentFunction.value = conversations.value.find(c => c.id === currentConversationId.value)?.functionType || 'deal_assist'
    return
  }

  selectedScenario.value = null
  selectedTechnique.value = null
  techniques.value = []
  loadScenarios()
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value || !currentConversationId.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString(),
  })

  scrollToBottom()
  loading.value = true

  try {
    // 获取当前对话的场景和技巧信息
    const currentConversation = conversations.value.find(c => c.id === currentConversationId.value)

    const messageData: any = {
      content: userMessage,
    }

    // 如果有场景和技巧，添加到消息中
    if (currentConversation?.scenarioId) {
      const scenario = scenarios.value.find(s => s.id === currentConversation.scenarioId)
      if (scenario) {
        messageData.scenario = scenario.scenarioKey
      }
    }

    if (currentConversation?.techniqueId) {
      const technique = techniques.value.find(t => t.id === currentConversation.techniqueId)
      if (technique) {
        messageData.technique = technique.techniqueName
      }
    }

    const response = await sendMsgApi(currentConversationId.value, messageData)

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

    await loadConversations() // 更新对话列表
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
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 获取输入框占位符
const getPlaceholder = () => {
  const placeholders = {
    deal_assist: '请描述您的客户情况，我将为您提供谈单话术建议...',
    reply_assist: '请描述客户的提问或异议，我将帮您生成合适的回复话术...',
    script_polish: '请输入您想要润色的话术内容...',
    opening_lines: '请描述客户情况和场景，我将为您生成开场白...',
  }
  return placeholders[currentFunction.value as keyof typeof placeholders] || '请输入您的问题...'
}

// 监听功能类型变化
watch(() => currentFunction.value, () => {
  handleFunctionChange()
})

onMounted(() => {
  loadConversations()
  loadScenarios()
})

// 清理资源
onUnmounted(() => {
  // 取消所有进行中的异步操作
  loading.value = false
  currentConversationId.value = null
  messages.value = []
  conversations.value = []
  scenarios.value = []
  techniques.value = []
  selectedScenario.value = null
  selectedTechnique.value = null
})
</script>

<style scoped lang="scss">
.script-assistant {
  height: 100vh;
  display: flex;
  background: #f5f7fa;
}

// 左侧对话列表
.conversation-sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e4e7ed;
    border-radius: 3px;
  }
}

.conversation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;

    .conversation-actions {
      opacity: 1;
    }
  }

  &.active {
    background-color: #ecf5ff;
    border-left: 3px solid #409eff;
  }
}

.conversation-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.conversation-actions {
  opacity: 0;
  transition: opacity 0.3s;
  margin-left: 8px;

  .el-button {
    padding: 4px;
  }
}

.conversation-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  font-weight: 500;
}

.conversation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.conversation-time {
  flex: 1;
}

.conversation-type {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

// 右侧主内容区
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

  &.full-width {
    margin-left: 0;
  }
}

// 功能选择器
.function-selector {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;

  .el-radio-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

// 场景技巧选择器
.scenario-technique-selector {
  padding: 16px 20px;
  background: #f8f9fb;
  border-bottom: 1px solid #e4e7ed;

  .selector-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .selector-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-right: 8px;
      border-radius: 2px;
    }
  }

  // 场景网格
  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .scenario-card {
    background: #fff;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 12px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: #667eea;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
    }

    &.active {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
    }

    .scenario-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
      line-height: 1.4;
    }
  }

  // 技巧网格
  .technique-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .technique-card {
    background: #fff;
    border: 2px solid #e4e7ed;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: #764ba2;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(118, 75, 162, 0.15);
    }

    &.active {
      border-color: #764ba2;
      background: linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
      box-shadow: 0 2px 8px rgba(118, 75, 162, 0.2);
    }

    .technique-name {
      font-size: 12px;
      color: #303133;
      font-weight: 500;
      margin-bottom: 2px;
      line-height: 1.3;
      text-align: center;
    }

    .technique-desc {
      font-size: 10px;
      color: #909399;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-align: center;
    }
  }
}

// 工具模式
.tool-mode {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

// 聊天区域
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

// 锁定状态样式
.lock-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  margin-bottom: 16px;
  color: #1e40af;
  font-size: 14px;
}

.lock-tag {
  margin-left: 8px;
}

.lock-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #67c23a;
  font-size: 14px;
}

.scenario-card,
.technique-card {
  position: relative;

  &.locked {
    opacity: 0.7;
    cursor: not-allowed !important;

    &:hover {
      transform: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
  }

  &.active.locked {
    opacity: 1;
    border-color: #67c23a;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .conversation-sidebar {
    width: 240px;
  }

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

  .function-selector {
    .el-radio-group {
      justify-content: center;
    }
  }
}
</style>