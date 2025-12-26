<template>
  <div class="deal-assist-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><TrendCharts /></el-icon>
          <span class="header-title">帮你谈单</span>
        </div>
      </template>

      <!-- 功能说明 -->
      <el-alert
        title="帮你谈单功能说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>• <strong>适用场景</strong>：产品推介、价格谈判、异议处理、促成交易</p>
          <p>• <strong>功能特点</strong>：智能场景分析、专业话术建议、知识库支持</p>
          <p>• <strong>使用方式</strong>：选择场景技巧，描述客户情况，获得谈单建议</p>
        </template>
      </el-alert>

      <div class="assist-layout">
        <!-- 左侧对话列表 -->
        <div class="conversation-sidebar">
          <div class="sidebar-header">
            <el-button type="primary" style="width: 100%" @click="createNewConversation">
              <el-icon><Plus /></el-icon>
              新建谈单对话
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
                  <span class="conversation-type">帮你谈单</span>
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
        <div class="main-content">
          <!-- 场景和技巧选择 -->
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
                    <el-icon v-if="message.role === 'user'"><User /></el-icon>
                    <el-icon v-else><Cpu /></el-icon>
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-role">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
                      <span class="message-time">{{ formatTime(message.createTime) }}</span>
                    </div>
                    <div class="message-text">{{ message.content }}</div>

                    <!-- AI响应详细信息 -->
                    <div v-if="message.role === 'assistant'" class="message-details">
                      <!-- 思考过程 -->
                      <div v-if="message.thinkingProcess" class="thinking-process">
                        <el-collapse>
                          <el-collapse-item title="查看思考过程" name="thinking">
                            <div class="thinking-content">{{ message.thinkingProcess }}</div>
                          </el-collapse-item>
                        </el-collapse>
                      </div>

                      <!-- 知识来源 -->
                      <div v-if="message.knowledgeSource && message.knowledgeSource.length > 0" class="knowledge-sources">
                        <div class="knowledge-header">
                          <el-icon><Reading /></el-icon>
                          <span>参考知识库</span>
                        </div>
                        <div class="knowledge-list">
                          <div
                            v-for="(source, index) in message.knowledgeSource"
                            :key="index"
                            class="knowledge-item"
                          >
                            <el-tag type="info" size="small">{{ source.title }}</el-tag>
                          </div>
                        </div>
                      </div>

                      <!-- 置信度 -->
                      <div v-if="message.confidenceScore" class="confidence-info">
                        <span class="confidence-label">AI置信度：</span>
                        <el-rate
                          :model-value="message.confidenceScore * 5"
                          disabled
                          show-score
                          text-color="#ff9900"
                          score-template="{value}%"
                          :max="5"
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="input-area">
                <div class="input-wrapper">
                  <el-input
                    v-model="inputMessage"
                    type="textarea"
                    :rows="2"
                    placeholder="请描述客户情况和您遇到的谈单问题..."
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
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Cpu, User, Lock, Delete, TrendCharts, Reading
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import ThinkingProcess from '@/components/ai-script-assistant/ThinkingProcess.vue'
import {
  createConversation,
  sendMessage as sendMsgApi,
  getConversations,
  getConversationDetail,
  getScenarios,
  getTechniques,
  deleteConversation
} from '@/api/ai-script-assistant'

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
const conversations = ref<Conversation[]>([])
const currentConversationId = ref<number | null>(null)
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const selectedScenario = ref<number | null>(null)
const selectedTechnique = ref<number | null>(null)

// Refs
const messageListRef = ref<HTMLElement>()

// 计算属性
const isLocked = computed(() => !!currentConversationId.value)
const showScenarioSelector = computed(() => !isLocked.value)

// 创建新对话
const createNewConversation = async () => {
  try {
    if (!selectedScenario.value) {
      ElMessage.warning('请先选择场景')
      return
    }

    const conversation = await createConversation({
      functionType: 'deal_assist',
      scenarioId: selectedScenario.value,
      techniqueId: selectedTechnique.value || undefined,
      title: '谈单咨询',
    })

    await loadConversations()
    await selectConversation(conversation.id)
    ElMessage.success('创建对话成功')
  } catch (error: any) {
    console.error('创建对话失败:', error)
    ElMessage.error(error.message || '创建对话失败')
  }
}

// 选择对话
const selectConversation = async (conversationId: number) => {
  try {
    currentConversationId.value = conversationId
    const res = await getConversationDetail(conversationId)

    messages.value = res.messages || []
    selectedScenario.value = res.conversation.scenarioId
    selectedTechnique.value = res.conversation.techniqueId

    // 加载对应场景的技巧
    if (res.conversation.scenarioId) {
      await loadTechniques(res.conversation.scenarioId)
    }

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error: any) {
    console.error('加载对话详情失败:', error)
    ElMessage.error('加载对话详情失败')
  }
}

// 选择场景
const selectScenario = async (scenarioId: number) => {
  selectedScenario.value = scenarioId
  selectedTechnique.value = null
  await loadTechniques(scenarioId)
}

// 选择技巧
const selectTechnique = (techniqueId: number) => {
  selectedTechnique.value = techniqueId
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  if (!currentConversationId.value) {
    ElMessage.warning('请先创建对话')
    return
  }

  const messageContent = inputMessage.value.trim()
  inputMessage.value = ''
  loading.value = true

  try {
    const res = await sendMsgApi(currentConversationId.value, {
      content: messageContent,
      customerName: '客户',
      scenario: scenarios.value.find(s => s.id === selectedScenario.value)?.scenarioName,
      technique: techniques.value.find(t => t.id === selectedTechnique.value)?.techniqueName,
    })

    messages.value.push(...[res.userMessage, res.assistantMessage])

    // 智能生成标题（第一条消息）
    if (messages.value.length === 2) {
      const conversation = conversations.value.find(c => c.id === currentConversationId.value)
      if (conversation && !conversation.title || conversation.title === '谈单咨询') {
        const title = generateSmartTitle(messageContent)
        // 这里可以调用API更新标题
      }
    }

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error: any) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请稍后重试')
  } finally {
    loading.value = false
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

    if (currentConversationId.value === conversationId) {
      currentConversationId.value = null
      messages.value = []
      selectedScenario.value = null
      selectedTechnique.value = null
    }

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
    const res = await getConversations({
      functionType: 'deal_assist',
      page: 1,
      limit: 50,
    })
    conversations.value = res.list || []
  } catch (error) {
    console.error('加载对话列表失败:', error)
  }
}

// 加载场景
const loadScenarios = async () => {
  try {
    const res = await getScenarios('deal_assist')
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
    ElMessage.error('加载场景失败')
  }
}

// 加载技巧
const loadTechniques = async (scenarioId: number) => {
  try {
    const res = await getTechniques(scenarioId)
    techniques.value = res || []
  } catch (error) {
    console.error('加载技巧失败:', error)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 处理回车发送
const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

// 生成智能标题
const generateSmartTitle = (content: string): string => {
  const keywords = content
    .replace(/[^\u4e00-\u9fa5\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
    .slice(0, 3)

  if (keywords.length > 0) {
    return `谈单-${keywords.join('、')}`
  }
  return '谈单咨询'
}

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return '-'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadConversations()
  loadScenarios()
})
</script>

<style scoped lang="scss">
.deal-assist-container {
  padding: 20px;

  .main-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-icon {
        font-size: 20px;
        color: #409eff;
      }

      .header-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .assist-layout {
    display: flex;
    height: 70vh;
    min-height: 600px;

    .conversation-sidebar {
      width: 300px;
      flex-shrink: 0;
      border-right: 1px solid #e4e7ed;

      .sidebar-header {
        padding: 16px;
        border-bottom: 1px solid #e4e7ed;
      }

      .conversation-list {
        height: calc(100% - 73px);
        overflow-y: auto;

        .conversation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f5f7fa;
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

          .conversation-content {
            flex: 1;
            min-width: 0;

            .conversation-title {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .conversation-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #909399;

              .conversation-type {
                background-color: #f0f9ff;
                color: #409eff;
                padding: 2px 6px;
                border-radius: 10px;
              }
            }
          }

          .conversation-actions {
            opacity: 0;
            transition: opacity 0.3s;
          }
        }
      }
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .scenario-technique-selector {
        padding: 16px 20px;
        background: #f8f9fb;
        border-bottom: 1px solid #e4e7ed;

        .lock-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background-color: #fef0f0;
          border: 1px solid #fcd3d3;
          border-radius: 4px;
          margin-bottom: 16px;
          color: #f56c6c;
          font-size: 14px;
        }

        .selector-section {
          margin-bottom: 16px;

          .selector-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 12px;
            font-size: 14px;
            font-weight: 600;
            color: #303133;

            .lock-tag {
              margin-left: auto;
            }
          }

          .scenario-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;

            .scenario-card {
              padding: 12px;
              border: 2px solid #e4e7ed;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s;
              text-align: center;

              &:hover {
                border-color: #409eff;
              }

              &.active {
                border-color: #409eff;
                background-color: #ecf5ff;
              }

              &.locked {
                cursor: not-allowed;
                opacity: 0.7;

                &.active {
                  border-color: #67c23a;
                  background-color: #f0f9ff;
                }
              }

              .scenario-name {
                font-weight: 500;
                color: #303133;
              }

              .lock-indicator {
                display: flex;
                justify-content: center;
                margin-top: 4px;
                color: #67c23a;
              }
            }
          }

          .technique-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;

            .technique-card {
              padding: 12px;
              border: 2px solid #e4e7ed;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s;

              &:hover {
                border-color: #409eff;
              }

              &.active {
                border-color: #409eff;
                background-color: #ecf5ff;
              }

              &.locked {
                cursor: not-allowed;
                opacity: 0.7;

                &.active {
                  border-color: #67c23a;
                  background-color: #f0f9ff;
                }
              }

              .technique-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 4px;
              }

              .technique-desc {
                font-size: 12px;
                color: #606266;
                line-height: 1.4;
              }

              .lock-indicator {
                display: flex;
                justify-content: center;
                margin-top: 8px;
                color: #67c23a;
              }
            }
          }
        }
      }

      .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 400px;

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;

          .message-item {
            display: flex;
            margin-bottom: 20px;

            &.user {
              flex-direction: row-reverse;

              .message-content {
                margin-right: 12px;
                margin-left: 0;
              }
            }

            .message-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              flex-shrink: 0;

              .el-icon {
                color: white;
              }
            }

            &.user .message-avatar {
              background-color: #409eff;
            }

            &.assistant .message-avatar {
              background-color: #67c23a;
            }

            .message-content {
              max-width: 70%;
              margin-left: 12px;

              .message-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;

                .message-role {
                  font-weight: 600;
                  font-size: 14px;
                }

                .message-time {
                  font-size: 12px;
                  color: #909399;
                }
              }

              .message-text {
                padding: 12px 16px;
                background-color: #f5f7fa;
                border-radius: 8px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-break: break-word;
              }

              .message-details {
                margin-top: 12px;

                .thinking-process,
                .knowledge-sources,
                .confidence-info {
                  margin-bottom: 8px;
                }

                .knowledge-sources {
                  .knowledge-header {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 13px;
                    color: #606266;
                    margin-bottom: 8px;
                  }

                  .knowledge-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;

                    .knowledge-item {
                      .el-tag {
                        max-width: 150px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      }
                    }
                  }
                }

                .confidence-info {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 13px;
                  color: #606266;
                }
              }
            }
          }
        }

        .input-area {
          border-top: 1px solid #e4e7ed;
          padding: 16px 20px;

          .input-wrapper {
            .el-textarea {
              margin-bottom: 12px;
            }

            .input-actions {
              display: flex;
              justify-content: flex-end;
            }
          }
        }
      }
    }
  }
}
</style>