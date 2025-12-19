<template>
  <div class="conversation-mode">
    <div class="main-content">
      <!-- 左侧：功能选择 -->
      <div class="sidebar">
        <el-card class="function-card">
          <h3>选择功能</h3>
          <div class="function-list">
            <div
              v-for="func in functionTypes"
              :key="func.type"
              :class="['function-item', { active: currentFunction === func.type }]"
              @click="selectFunction(func.type)"
            >
              <el-icon>
                <component :is="func.icon" />
              </el-icon>
              <div class="function-info">
                <div class="function-name">{{ func.name }}</div>
                <div class="function-desc">{{ func.description }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间：对话区域 -->
      <div class="conversation-area">
        <el-card class="chat-card">
          <div class="chat-header">
            <div class="chat-info">
              <h3>{{ getFunctionTitle() }}</h3>
              <span v-if="currentConversation" class="chat-status">对话中</span>
            </div>
            <div class="chat-actions">
              <el-button
                v-if="currentConversation"
                type="primary"
                size="small"
                @click="showCustomerSelector = true"
              >
                <el-icon><User /></el-icon>
                选择客户
              </el-button>
              <el-button
                v-if="currentConversation"
                size="small"
                @click="createNewConversation"
              >
                <el-icon><Plus /></el-icon>
                新建对话
              </el-button>
            </div>
          </div>

          <div class="messages-container" ref="messagesContainer">
            <div v-if="messages.length === 0" class="empty-state">
              <el-empty description="开始新的对话">
                <el-button type="primary" @click="createNewConversation">开始对话</el-button>
              </el-empty>
            </div>

            <div v-else class="messages">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message', message.role]"
              >
                <div class="message-avatar">
                  <el-avatar v-if="message.role === 'user'" :size="40">
                    {{ userInfo?.realName?.[0] || 'U' }}
                  </el-avatar>
                  <el-avatar v-else :size="40" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    <el-icon><Avatar /></el-icon>
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                  <!-- AI思考过程展示 -->
                  <thinking-process
                    v-if="message.thinkingProcess"
                    :process="message.thinkingProcess"
                    :confidence="message.confidenceScore"
                    :processing-time="message.processingTime"
                    :strategy="message.sourceType"
                    :knowledge-sources="message.knowledgeSource"
                    compact
                    @view-knowledge="viewKnowledge"
                  />
                  <div v-if="message.knowledgeSource" class="message-knowledge">
                    <el-tag size="small" type="success">知识来源</el-tag>
                    <div class="knowledge-items">
                      <el-tag
                        v-for="source in message.knowledgeSource"
                        :key="source.id"
                        size="small"
                        class="knowledge-item"
                      >
                        {{ source.title }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="message-actions" v-if="message.role === 'assistant'">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="copyMessage(message.content)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                      复制
                    </el-button>
                    <el-button
                      link
                      :type="message.feedback === 'like' ? 'success' : 'default'"
                      size="small"
                      @click="submitFeedback(message.id, 'like')"
                    >
                      <el-icon><Check /></el-icon>
                      有用
                    </el-button>
                    <el-button
                      link
                      :type="message.feedback === 'dislike' ? 'danger' : 'default'"
                      size="small"
                      @click="submitFeedback(message.id, 'dislike')"
                    >
                      <el-icon><Close /></el-icon>
                      无用
                    </el-button>
                    <el-button
                      link
                      type="warning"
                      size="small"
                      @click="recommendToKnowledgeBase(message)"
                      v-if="message.confidenceScore >= 0.7"
                    >
                      <el-icon><Star /></el-icon>
                      推荐到知识库
                    </el-button>
                  </div>
                </div>
                <div class="message-time">
                  {{ formatTime(message.createTime) }}
                </div>
              </div>
            </div>
          </div>

          <div class="input-area" v-if="currentConversation">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="3"
              placeholder="请输入您的问题或需求..."
              @keydown.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <div class="input-tips">
                <span>按 Ctrl+Enter 发送消息</span>
              </div>
              <el-button
                type="primary"
                :loading="sending"
                @click="sendMessage"
              >
                <el-icon><Position /></el-icon>
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：参考信息 -->
      <div class="reference-panel">
        <el-card class="history-card">
          <h3>对话历史</h3>
          <div class="conversation-list">
            <div
              v-for="conv in conversationHistory"
              :key="conv.id"
              :class="['conversation-item', { active: currentConversation?.id === conv.id }]"
              @click="loadConversation(conv.id)"
            >
              <div class="conv-title">{{ conv.title }}</div>
              <div class="conv-time">{{ formatTime(conv.lastMessageTime || conv.createTime) }}</div>
              <div class="conv-preview">{{ conv.latestMessage?.content || '暂无消息' }}</div>
            </div>
          </div>
        </el-card>

        <!-- 话术生成器 -->
        <el-card class="script-generator-card">
          <h3>话术生成器</h3>

          <!-- 场景选择 -->
          <el-select
            v-model="selectedScenario"
            placeholder="选择场景"
            style="width: 100%; margin-bottom: 15px"
            @change="onScenarioChange"
          >
            <el-option
              v-for="scenario in scenarios"
              :key="scenario.id"
              :label="scenario.scenarioName"
              :value="scenario.id"
            />
          </el-select>

          <!-- 技巧选择 -->
          <div v-if="selectedScenario && techniques.length > 0">
            <h4>选择技巧</h4>
            <el-radio-group v-model="selectedTechnique" @change="onTechniqueChange">
              <div class="technique-list">
                <el-radio
                  v-for="technique in techniques"
                  :key="technique.id"
                  :label="technique.id"
                  class="technique-item"
                >
                  <div class="technique-content">
                    <div class="technique-name">{{ technique.techniqueName }}</div>
                    <div class="technique-desc">{{ technique.techniqueDesc }}</div>
                  </div>
                </el-radio>
              </div>
            </el-radio-group>
          </div>

          <!-- 生成按钮 -->
          <el-button
            v-if="selectedTechnique"
            type="primary"
            style="width: 100%; margin-top: 15px"
            :loading="generating"
            @click="generateScript"
          >
            生成话术
          </el-button>

          <!-- 生成结果 -->
          <div v-if="generatedScript" class="generated-script">
            <div class="script-content">{{ generatedScript }}</div>
            <div class="script-actions">
              <el-button size="small" @click="copyScript">复制</el-button>
              <el-button size="small" type="primary" @click="useScriptInChat">
                使用到对话
              </el-button>
            </div>
          </div>
        </el-card>

        <el-card class="knowledge-card">
          <h3>相关知识</h3>
          <div v-if="relatedKnowledge.length > 0" class="knowledge-list">
            <div
              v-for="knowledge in relatedKnowledge"
              :key="knowledge.id"
              class="knowledge-item"
              @click="viewKnowledge(knowledge)"
            >
              <div class="knowledge-title">{{ knowledge.title }}</div>
              <div class="knowledge-category">{{ knowledge.sceneCategory }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无相关知识" :image-size="80" />
        </el-card>
      </div>
    </div>

    <!-- 客户选择对话框 -->
    <el-dialog v-model="showCustomerSelector" title="选择客户" width="600px">
      <customer-selector @select="handleCustomerSelect" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  TrendCharts,
  EditPen,
  MagicStick,
  User,
  Plus,
  Avatar,
  DocumentCopy,
  Check,
  Close,
  Position,
  Star,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import {
  createConversation,
  sendMessage as sendMessageApi,
  getConversations,
  getConversationDetail,
  getScenarios,
  getTechniques,
  submitFeedback as submitFeedbackApi,
  recommendScript,
} from '@/api/ai-script-assistant'
import type {
  CreateConversationDto,
  SendMessageDto,
  QueryConversationsDto,
  FunctionType,
} from '@/api/ai-script-assistant'
import CustomerSelector from '@/components/CustomerSelector.vue'
import ThinkingProcess from '@/components/ai-script-assistant/ThinkingProcess.vue'

const props = defineProps({
  functionType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 功能类型配置
const functionTypes = [
  {
    type: 'deal_assist' as FunctionType,
    name: '帮你谈单',
    description: '针对具体客户生成谈单话术',
    icon: 'TrendCharts',
  },
  {
    type: 'reply_assist' as FunctionType,
    name: '帮你回复',
    description: '帮助回复客户消息和异议',
    icon: 'ChatDotRound',
  },
]

// 状态管理
const currentFunction = ref<FunctionType>(props.functionType as FunctionType)
const selectedScenario = ref<number>()
const selectedTechnique = ref<number>()
const currentConversation = ref<any>(null)
const messages = ref<any[]>([])
const messageInput = ref('')
const sending = ref(false)
const showCustomerSelector = ref(false)
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const conversationHistory = ref<any[]>([])
const relatedKnowledge = ref<any[]>([])
const messagesContainer = ref<HTMLElement>()

// 话术生成器相关
const generating = ref(false)
const generatedScript = ref('')

// 选择功能
const selectFunction = (funcType: FunctionType) => {
  currentFunction.value = funcType
  selectedScenario.value = undefined
  selectedTechnique.value = undefined
  techniques.value = []
  loadScenarios(funcType)
}

// 加载场景
const loadScenarios = async (functionType: FunctionType) => {
  try {
    const res = await getScenarios(functionType)
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
  }
}

// 场景变化
const onScenarioChange = async (scenarioId: number) => {
  selectedTechnique.value = undefined
  techniques.value = []

  if (scenarioId) {
    try {
      // 调用API获取该场景的技巧
      const res = await getTechniques(scenarioId)
      techniques.value = res || []
    } catch (error) {
      console.error('加载技巧失败:', error)
      ElMessage.error('加载技巧失败')
    }
  }
}

// 技巧变化
const onTechniqueChange = (techniqueId: number) => {
  // 可以在这里添加技巧选择的处理逻辑
}

// 获取功能标题
const getFunctionTitle = () => {
  const func = functionTypes.find(f => f.type === currentFunction.value)
  return func ? func.name : 'AI话术助手'
}

// 创建新对话
const createNewConversation = async () => {
  try {
    const data: CreateConversationDto = {
      functionType: currentFunction.value,
      scenarioId: selectedScenario.value,
      techniqueId: selectedTechnique.value,
    }

    const res = await createConversation(data)
    currentConversation.value = res
    messages.value = res.messages || []

    // 重新加载对话历史
    loadConversationHistory()

    ElMessage.success('对话创建成功')
  } catch (error) {
    console.error('创建对话失败:', error)
    ElMessage.error('创建对话失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || !currentConversation.value) return

  sending.value = true
  try {
    const data: SendMessageDto = {
      content: messageInput.value.trim(),
    }

    const res = await sendMessageApi(currentConversation.value.id, data)

    // 添加用户消息
    messages.value.push(res.userMessage)

    // 添加AI回复
    messages.value.push(res.assistantMessage)

    // 更新相关知识
    if (res.knowledgeSources) {
      relatedKnowledge.value = res.knowledgeSources
    }

    messageInput.value = ''

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

// 加载对话历史
const loadConversationHistory = async () => {
  try {
    const params: QueryConversationsDto = {
      functionType: currentFunction.value,
      page: 1,
      limit: 10,
    }
    const res = await getConversations(params)
    conversationHistory.value = res.list || []
  } catch (error) {
    console.error('加载对话历史失败:', error)
  }
}

// 加载对话详情
const loadConversation = async (conversationId: number) => {
  try {
    const res = await getConversationDetail(conversationId)
    currentConversation.value = res.conversation
    messages.value = res.messages || []

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载对话详情失败:', error)
    ElMessage.error('加载对话失败')
  }
}

// 提交反馈
const submitFeedback = async (messageId: number, feedbackType: 'like' | 'dislike') => {
  try {
    await submitFeedbackApi({ messageId, feedbackType })

    // 更新消息反馈状态
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.feedback = feedbackType
    }

    ElMessage.success('反馈提交成功')
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('反馈提交失败')
  }
}

// 复制消息
const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

// 推荐话术到知识库
const recommendToKnowledgeBase = async (message: any) => {
  try {
    await ElMessageBox.confirm(
      '确认将这条高质量话术推荐到企业知识库吗？审核通过后将自动添加到知识库中。',
      '推荐话术',
      {
        confirmButtonText: '确认推荐',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await recommendScript({
      conversationId: currentConversation.value?.id || 0,
      messageId: message.id,
      recommendReason: `高质量话术（置信度: ${(message.confidenceScore * 100).toFixed(1)}%）`,
    })

    ElMessage.success('推荐成功！话术已提交审核')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('推荐话术失败:', error)
      ElMessage.error(error.response?.data?.message || '推荐失败')
    }
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 处理客户选择
const handleCustomerSelect = (customer: any) => {
  if (currentConversation.value) {
    // 更新对话的客户信息
    // TODO: 调用更新对话客户API
    ElMessage.success(`已选择客户: ${customer.realName || customer.wechatNickname}`)
  }
  showCustomerSelector.value = false
}

// 查看知识详情
const viewKnowledge = (knowledge: any) => {
  // TODO: 打开知识详情对话框或跳转到知识库页面
  ElMessage.info(`查看知识: ${knowledge.title}`)
}

// 生成话术
const generateScript = async () => {
  if (!selectedTechnique.value) return

  generating.value = true
  try {
    // 创建临时对话来生成话术
    const tempData: CreateConversationDto = {
      functionType: currentFunction.value,
      scenarioId: selectedScenario.value,
      techniqueId: selectedTechnique.value,
    }

    const conversation = await createConversation(tempData)

    // 发送生成消息
    const messageData: SendMessageDto = {
      content: `请根据${scenarios.value.find(s => s.id === selectedScenario.value)?.scenarioName}场景，使用${techniques.value.find(t => t.id === selectedTechnique.value)?.techniqueName}技巧生成一个话术示例`,
    }

    const res = await sendMessageApi(conversation.id, messageData)
    generatedScript.value = res.assistantMessage.content

  } catch (error) {
    console.error('生成话术失败:', error)
    ElMessage.error('生成话术失败')
  } finally {
    generating.value = false
  }
}

// 复制话术
const copyScript = () => {
  navigator.clipboard.writeText(generatedScript.value).then(() => {
    ElMessage.success('话术已复制到剪贴板')
  })
}

// 使用话术到对话
const useScriptInChat = () => {
  if (!currentConversation.value) {
    ElMessage.warning('请先创建对话')
    return
  }
  messageInput.value = generatedScript.value
  generatedScript.value = ''
  ElMessage.success('话术已填入输入框')
}

// 监听props变化
watch(() => props.functionType, (newVal) => {
  if (newVal) {
    currentFunction.value = newVal as FunctionType
    loadScenarios(currentFunction.value)
    loadConversationHistory()
  }
})

// 初始化
onMounted(async () => {
  await loadScenarios(currentFunction.value)
  await loadConversationHistory()
})
</script>

<style scoped lang="scss">
.conversation-mode {
  height: 75vh;
  display: flex;
  flex-direction: column;

  .main-content {
    flex: 1;
    display: flex;
    gap: 20px;
    height: 100%;
    overflow: hidden;
  }

  .sidebar {
    width: 280px;
    display: flex;
    flex-direction: column;

    .function-card {
      flex: 1;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        color: #303133;
      }

      .function-list {
        flex: 1;

        .function-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;

          &:hover {
            background: #f5f7fa;
          }

          &.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;

            .function-desc {
              color: rgba(255, 255, 255, 0.8);
            }
          }

          .el-icon {
            font-size: 20px;
          }

          .function-info {
            flex: 1;

            .function-name {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .function-desc {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
            }
          }
        }
      }
    }
  }

  .conversation-area {
    flex: 1;
    display: flex;
    flex-direction: column;

    .chat-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0;
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;

        .chat-info {
          display: flex;
          align-items: center;
          gap: 10px;

          h3 {
            margin: 0;
            color: #303133;
          }

          .chat-status {
            padding: 2px 8px;
            background: #f0f9ff;
            color: #409eff;
            border-radius: 10px;
            font-size: 12px;
          }
        }
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;

        .empty-state {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .messages {
          .message {
            display: flex;
            margin-bottom: 20px;
            align-items: flex-start;
            gap: 12px;

            &.user {
              flex-direction: row-reverse;

              .message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }

              .message-time {
                text-align: right;
              }
            }

            .message-avatar {
              flex-shrink: 0;
            }

            .message-content {
              flex: 1;
              max-width: 70%;
              background: #f5f7fa;
              padding: 12px 16px;
              border-radius: 12px;
              position: relative;

              .message-text {
                white-space: pre-wrap;
                line-height: 1.5;
              }

              .message-thinking,
              .message-knowledge {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);

                p {
                  margin: 5px 0 0 0;
                  font-size: 12px;
                  color: #666;
                }

                .knowledge-items {
                  margin-top: 5px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 5px;

                  .knowledge-item {
                    cursor: pointer;
                  }
                }
              }

              .message-actions {
                margin-top: 10px;
                display: flex;
                gap: 10px;
                opacity: 0;
                transition: opacity 0.3s;
              }

              &:hover .message-actions {
                opacity: 1;
              }
            }

            .message-time {
              font-size: 12px;
              color: #909399;
              margin-top: 5px;
              width: 60px;
            }
          }
        }
      }

      .input-area {
        padding: 20px;
        border-top: 1px solid #e4e7ed;

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;

          .input-tips {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .reference-panel {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .history-card,
    .script-generator-card,
    .knowledge-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-height: 300px;

      &:not(.script-generator-card) {
        flex: 0 0 auto;
      }

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 15px;
      }

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #303133;
      }

      .conversation-list {
        flex: 1;
        overflow-y: auto;

        .conversation-item {
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 8px;

          &:hover {
            background: #f5f7fa;
          }

          &.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;

            .conv-time,
            .conv-preview {
              color: rgba(255, 255, 255, 0.8);
            }
          }

          .conv-title {
            font-weight: 500;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .conv-time {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .conv-preview {
            font-size: 12px;
            color: #666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .technique-list {
        max-height: 150px;
        overflow-y: auto;

        .technique-item {
          display: block;
          margin-bottom: 10px;
          padding: 8px;
          border: 1px solid #e4e7ed;
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
          }

          .technique-content {
            margin-left: 24px;

            .technique-name {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .technique-desc {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .generated-script {
        margin-top: 15px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
        border: 1px solid #e4e7ed;

        .script-content {
          margin-bottom: 10px;
          line-height: 1.6;
          color: #303133;
        }

        .script-actions {
          text-align: right;
        }
      }

      .knowledge-list {
        flex: 1;
        overflow-y: auto;

        .knowledge-item {
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 8px;

          &:hover {
            background: #f5f7fa;
          }

          .knowledge-title {
            font-weight: 500;
            margin-bottom: 4px;
            font-size: 13px;
            color: #303133;
          }

          .knowledge-category {
            font-size: 11px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>