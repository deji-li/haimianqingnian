<template>
  <div class="training-session">
    <!-- 顶部信息栏 -->
    <el-card class="session-header" shadow="never">
      <div class="header-content">
        <div class="session-info">
          <div class="info-row">
            <el-icon class="info-icon"><Document /></el-icon>
            <span class="label">剧本：</span>
            <span class="value">{{ session.scriptTitle }}</span>
          </div>
          <div class="info-row">
            <el-icon class="info-icon"><User /></el-icon>
            <span class="label">客户角色：</span>
            <span class="value">{{ session.customerPersonaName }}</span>
          </div>
          <div class="info-row">
            <el-icon class="info-icon"><ChatDotRound /></el-icon>
            <span class="label">当前轮次：</span>
            <span class="value">{{ session.currentRound }} / {{ session.maxRounds }}</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button v-if="session.status === 'active'" type="warning" @click="pauseSession">
            <el-icon><VideoPause /></el-icon>
            暂停训练
          </el-button>
          <el-button v-if="session.status === 'paused'" type="primary" @click="resumeSession">
            <el-icon><VideoPlay /></el-icon>
            继续训练
          </el-button>
          <el-button type="danger" plain @click="endSession">
            <el-icon><Close /></el-icon>
            结束训练
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧对话区域 -->
      <el-col :span="16">
        <el-card class="chat-card" shadow="never">
          <template #header>
            <div class="chat-header">
              <span class="chat-title">
                <el-icon><ChatDotRound /></el-icon>
                对话窗口
              </span>
              <el-tag v-if="session.status === 'active'" type="success" effect="dark">
                <el-icon><VideoCamera /></el-icon>
                训练进行中
              </el-tag>
              <el-tag v-else-if="session.status === 'paused'" type="warning">
                已暂停
              </el-tag>
            </div>
          </template>

          <!-- 对话历史 -->
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['message-item', message.role]"
            >
              <div class="message-avatar">
                <el-avatar :size="40" :src="message.avatar">
                  {{ message.role === 'customer' ? '客' : '销' }}
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
                <div v-if="message.emotion" class="message-emotion">
                  <el-tag size="small" effect="plain">
                    情绪：{{ message.emotion }}
                  </el-tag>
                  <el-tag v-if="message.objectionType" size="small" type="warning" effect="plain">
                    异议：{{ message.objectionType }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- AI正在输入 -->
            <div v-if="isAITyping" class="message-item customer typing">
              <div class="message-avatar">
                <el-avatar :size="40">客</el-avatar>
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
          <div class="chat-input-area">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              placeholder="请输入你的销售话术..."
              :disabled="session.status !== 'active' || isAITyping"
              @keydown.ctrl.enter="sendMessage"
            />
            <div class="input-actions">
              <div class="input-tips">
                <el-icon><InfoFilled /></el-icon>
                Ctrl + Enter 快速发送
              </div>
              <el-button
                type="primary"
                :disabled="!userInput.trim() || session.status !== 'active' || isAITyping"
                :loading="isSending"
                @click="sendMessage"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧信息面板 -->
      <el-col :span="8">
        <!-- 客户信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><User /></el-icon>
              客户信息
            </span>
          </template>
          <div class="customer-info">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ customerPersona.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">性格类型：</span>
              <el-tag size="small">{{ customerPersona.personalityType }}</el-tag>
            </div>
            <div class="info-item">
              <span class="label">沟通风格：</span>
              <el-tag size="small" type="success">{{ customerPersona.communicationStyle }}</el-tag>
            </div>
            <div class="info-item">
              <span class="label">决策风格：</span>
              <el-tag size="small" type="warning">{{ customerPersona.decisionMakingStyle }}</el-tag>
            </div>
            <div class="info-section">
              <div class="section-title">典型异议：</div>
              <el-tag
                v-for="(objection, index) in customerPersona.typicalObjections"
                :key="index"
                size="small"
                type="danger"
                effect="plain"
                class="objection-tag"
              >
                {{ objection }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 培训目标 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Flag /></el-icon>
              培训目标
            </span>
          </template>
          <div class="training-goals">
            <el-checkbox-group v-model="achievedGoals" disabled>
              <div v-for="(goal, index) in trainingGoals" :key="index" class="goal-item">
                <el-checkbox :label="goal" :value="goal" />
              </div>
            </el-checkbox-group>
          </div>
        </el-card>

        <!-- 实时评分 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Star /></el-icon>
              实时评分
            </span>
          </template>
          <div class="real-time-score">
            <div class="score-display">
              <el-progress
                type="circle"
                :percentage="currentScore"
                :width="120"
                :color="getScoreColor(currentScore)"
              >
                <template #default>
                  <span class="score-text">{{ currentScore }}</span>
                </template>
              </el-progress>
            </div>
            <div class="score-dimensions">
              <div class="dimension-item" v-for="(score, key) in dimensionScores" :key="key">
                <span class="dimension-label">{{ getDimensionLabel(key) }}</span>
                <el-progress :percentage="score" :show-text="false" />
                <span class="dimension-value">{{ score }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 建议提示 -->
        <el-card v-if="suggestions.length > 0" class="info-card" shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Promotion /></el-icon>
              建议提示
            </span>
          </template>
          <div class="suggestions">
            <el-alert
              v-for="(suggestion, index) in suggestions"
              :key="index"
              :title="suggestion"
              type="info"
              :closable="false"
              class="suggestion-item"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  User,
  ChatDotRound,
  VideoPause,
  VideoPlay,
  Close,
  VideoCamera,
  InfoFilled,
  Promotion,
  Flag,
  Star
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const sessionId = route.params.id as string
const chatMessagesRef = ref<HTMLElement>()

// 会话状态
const session = reactive({
  id: '',
  scriptTitle: '',
  customerPersonaName: '',
  status: 'active',
  currentRound: 0,
  maxRounds: 5
})

// 客户人设
const customerPersona = reactive({
  name: '',
  personalityType: '',
  communicationStyle: '',
  decisionMakingStyle: '',
  typicalObjections: [] as string[]
})

// 消息列表
const messages = ref<any[]>([])
const userInput = ref('')
const isAITyping = ref(false)
const isSending = ref(false)

// 培训目标
const trainingGoals = ref<string[]>([])
const achievedGoals = ref<string[]>([])

// 实时评分
const currentScore = ref(0)
const dimensionScores = reactive({
  goalAchievement: 0,
  professionalism: 0,
  efficiency: 0,
  adaptability: 0,
  customerSatisfaction: 0
})

// 建议提示
const suggestions = ref<string[]>([])

// 加载会话信息
const loadSession = async () => {
  try {
    const response = await request.get(`/api/training-coach/sessions/${sessionId}`)
    const data = response.data

    Object.assign(session, {
      id: data.id,
      scriptTitle: data.script_title,
      customerPersonaName: data.customer_persona_name,
      status: data.session_status,
      currentRound: data.current_round,
      maxRounds: data.max_rounds
    })

    // 加载对话历史
    if (data.conversation_history) {
      messages.value = data.conversation_history
      scrollToBottom()
    }

    // 加载培训目标
    if (data.training_goals) {
      trainingGoals.value = data.training_goals
    }

    // 加载客户人设
    if (data.customer_persona) {
      Object.assign(customerPersona, data.customer_persona)
    }

    // 加载实时评分
    if (data.current_score) {
      currentScore.value = data.current_score
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    ElMessage.error('加载会话信息失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isSending.value) return

  const messageContent = userInput.value.trim()
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'sales',
    senderName: '销售（你）',
    content: messageContent,
    timestamp: new Date().toISOString()
  })

  scrollToBottom()
  isSending.value = true
  isAITyping.value = true

  try {
    // 发送到后端获取AI回复
    const response = await request.post(`/api/training-coach/sessions/${sessionId}/messages`, {
      message: messageContent
    })

    const aiResponse = response.data

    // 添加AI客户回复
    messages.value.push({
      role: 'customer',
      senderName: customerPersona.name,
      content: aiResponse.message,
      emotion: aiResponse.emotion,
      objectionType: aiResponse.objection_type,
      timestamp: new Date().toISOString()
    })

    // 更新会话信息
    session.currentRound = aiResponse.current_round

    // 更新实时评分
    if (aiResponse.real_time_score) {
      currentScore.value = aiResponse.real_time_score.overall_score
      Object.assign(dimensionScores, aiResponse.real_time_score.dimension_scores)
    }

    // 更新建议
    if (aiResponse.suggestions) {
      suggestions.value = aiResponse.suggestions
    }

    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    ElMessage.error('发送消息失败')
  } finally {
    isSending.value = false
    isAITyping.value = false
  }
}

// 暂停会话
const pauseSession = async () => {
  try {
    await request.post(`/api/training-coach/sessions/${sessionId}/pause`)
    session.status = 'paused'
    ElMessage.success('已暂停训练')
  } catch (error) {
    console.error('Failed to pause session:', error)
    ElMessage.error('暂停失败')
  }
}

// 恢复会话
const resumeSession = async () => {
  try {
    await request.post(`/api/training-coach/sessions/${sessionId}/resume`)
    session.status = 'active'
    ElMessage.success('已恢复训练')
  } catch (error) {
    console.error('Failed to resume session:', error)
    ElMessage.error('恢复失败')
  }
}

// 结束会话
const endSession = async () => {
  try {
    await ElMessageBox.confirm('确定要结束当前训练吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.post(`/api/training-coach/sessions/${sessionId}/end`)
    ElMessage.success('训练已结束')

    // 跳转到评估报告页面
    router.push(`/training-coach/session/${sessionId}/report`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to end session:', error)
      ElMessage.error('结束训练失败')
    }
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 辅助函数
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getDimensionLabel = (key: string) => {
  const labels: Record<string, string> = {
    goalAchievement: '目标达成',
    professionalism: '专业性',
    efficiency: '效率',
    adaptability: '应变能力',
    customerSatisfaction: '客户体验'
  }
  return labels[key] || key
}

// 初始化
onMounted(() => {
  loadSession()
})
</script>

<style scoped lang="scss">
.training-session {
  padding: 20px;

  .session-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .session-info {
        display: flex;
        gap: 30px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 5px;

          .info-icon {
            color: #409EFF;
          }

          .label {
            color: #909399;
          }

          .value {
            font-weight: bold;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .main-content {
    .chat-card {
      height: calc(100vh - 250px);
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .chat-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
        }
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 20px;

        .message-item {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;

          &.customer {
            .message-content {
              background: white;
            }
          }

          &.sales {
            flex-direction: row-reverse;

            .message-content {
              background: #409EFF;
              color: white;

              .message-header .sender-name {
                color: white;
              }

              .message-time {
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }

          .message-avatar {
            flex-shrink: 0;
          }

          .message-content {
            max-width: 70%;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .message-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 12px;

              .sender-name {
                font-weight: bold;
                color: #303133;
              }

              .message-time {
                color: #909399;
              }
            }

            .message-text {
              line-height: 1.6;
              word-wrap: break-word;
            }

            .message-emotion {
              margin-top: 8px;
              display: flex;
              gap: 5px;
            }
          }

          &.typing .message-content {
            background: white;
            padding: 20px;

            .typing-indicator {
              display: flex;
              gap: 5px;

              span {
                width: 8px;
                height: 8px;
                background: #409EFF;
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
          }
        }
      }

      .chat-input-area {
        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;

          .input-tips {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .info-card {
      margin-bottom: 20px;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }

      .customer-info,
      .training-goals,
      .real-time-score,
      .suggestions {
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .label {
            color: #909399;
            margin-right: 8px;
          }

          .value {
            font-weight: bold;
          }
        }

        .info-section {
          margin-top: 15px;

          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
          }

          .objection-tag {
            margin-right: 8px;
            margin-bottom: 8px;
          }
        }
      }

      .real-time-score {
        .score-display {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;

          .score-text {
            font-size: 24px;
            font-weight: bold;
          }
        }

        .score-dimensions {
          .dimension-item {
            margin-bottom: 15px;

            .dimension-label {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 5px;
            }

            .dimension-value {
              font-size: 12px;
              font-weight: bold;
              margin-left: 10px;
            }
          }
        }
      }

      .goal-item {
        margin-bottom: 10px;
      }

      .suggestion-item {
        margin-bottom: 10px;
      }
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
</style>
