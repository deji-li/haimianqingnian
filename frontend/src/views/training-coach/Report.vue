<template>
  <div class="training-report">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">训练评估报告</span>
      </template>
    </el-page-header>

    <el-card class="report-header" shadow="never">
      <div class="session-summary">
        <div class="summary-left">
          <h2>{{ session.sessionName }}</h2>
          <div class="meta-info">
            <el-tag :type="getStatusType(session.completionStatus)">
              {{ getCompletionStatusText(session.completionStatus) }}
            </el-tag>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(session.completedAt) }}
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              训练时长：{{ session.duration }}分钟
            </span>
          </div>
        </div>
        <div class="summary-right">
          <div class="final-score">
            <div class="score-label">最终得分</div>
            <div class="score-value" :style="{ color: getScoreColor(session.finalScore) }">
              {{ session.finalScore }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="report-content">
      <!-- 评分维度 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><TrendCharts /></el-icon>
              评分维度
            </span>
          </template>
          <div class="score-dimensions">
            <div
              v-for="(score, key) in evaluation.dimensionScores"
              :key="key"
              class="dimension-item"
            >
              <div class="dimension-header">
                <span class="dimension-name">{{ getDimensionLabel(key) }}</span>
                <span class="dimension-score">{{ score }}</span>
              </div>
              <el-progress :percentage="score" :color="getProgressColor(score)" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 目标达成情况 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Flag /></el-icon>
              目标达成情况
            </span>
          </template>
          <div class="goals-achievement">
            <div class="achievement-rate">
              <el-progress
                type="circle"
                :percentage="session.goalAchievementRate"
                :width="120"
                :color="getProgressColor(session.goalAchievementRate)"
              >
                <template #default>
                  <span class="rate-text">{{ session.goalAchievementRate }}%</span>
                </template>
              </el-progress>
            </div>
            <div class="goals-list">
              <div v-for="(goal, index) in trainingGoals" :key="index" class="goal-item">
                <el-icon v-if="goal.achieved" class="goal-icon achieved"><SuccessFilled /></el-icon>
                <el-icon v-else class="goal-icon"><CircleClose /></el-icon>
                <span :class="{ 'achieved-text': goal.achieved }">{{ goal.text }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 优势分析 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Star /></el-icon>
              优势分析
            </span>
          </template>
          <div class="strengths">
            <el-alert
              v-for="(strength, index) in evaluation.strengths"
              :key="index"
              :title="strength"
              type="success"
              :closable="false"
              show-icon
              class="analysis-item"
            />
            <el-empty v-if="evaluation.strengths.length === 0" description="暂无优势分析" />
          </div>
        </el-card>
      </el-col>

      <!-- 改进建议 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Promotion /></el-icon>
              改进建议
            </span>
          </template>
          <div class="improvements">
            <el-alert
              v-for="(improvement, index) in evaluation.improvements"
              :key="index"
              :title="improvement"
              type="warning"
              :closable="false"
              show-icon
              class="analysis-item"
            />
            <el-empty v-if="evaluation.improvements.length === 0" description="暂无改进建议" />
          </div>
        </el-card>
      </el-col>

      <!-- 详细反馈 -->
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><ChatLineRound /></el-icon>
              详细反馈
            </span>
          </template>
          <div class="detailed-feedback">
            <el-scrollbar height="300px">
              <p class="feedback-text">{{ evaluation.detailedFeedback }}</p>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>

      <!-- 对话回放 -->
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header-with-action">
              <span class="card-title">
                <el-icon><ChatDotRound /></el-icon>
                对话回放
              </span>
              <el-button type="primary" size="small" @click="exportConversation">
                <el-icon><Download /></el-icon>
                导出对话
              </el-button>
            </div>
          </template>
          <div class="conversation-replay">
            <el-timeline>
              <el-timeline-item
                v-for="(message, index) in conversationHistory"
                :key="index"
                :timestamp="formatTime(message.timestamp)"
                placement="top"
              >
                <el-card shadow="hover">
                  <div class="replay-message">
                    <div class="message-sender">
                      <el-avatar :size="30">
                        {{ message.role === 'customer' ? '客' : '销' }}
                      </el-avatar>
                      <span class="sender-name">{{ message.senderName }}</span>
                    </div>
                    <div class="message-content">{{ message.content }}</div>
                    <div v-if="message.emotion || message.objectionType" class="message-tags">
                      <el-tag v-if="message.emotion" size="small" effect="plain">
                        情绪：{{ message.emotion }}
                      </el-tag>
                      <el-tag v-if="message.objectionType" size="small" type="warning" effect="plain">
                        异议：{{ message.objectionType }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

      <!-- 推荐行动 -->
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">
              <el-icon><Promotion /></el-icon>
              推荐行动
            </span>
          </template>
          <div class="recommendations">
            <el-steps :active="0" direction="vertical">
              <el-step
                v-for="(recommendation, index) in evaluation.recommendations"
                :key="index"
                :title="`步骤 ${index + 1}`"
                :description="recommendation"
              />
            </el-steps>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <div class="report-actions">
      <el-button @click="goBack">返回列表</el-button>
      <el-button type="primary" @click="startNewTraining">开始新的训练</el-button>
      <el-button type="success" @click="reviewSameScript">使用相同剧本重新训练</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Timer,
  TrendCharts,
  Flag,
  Star,
  ChatLineRound,
  ChatDotRound,
  Download,
  Promotion,
  SuccessFilled,
  CircleClose
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const sessionId = route.params.id as string

// 会话信息
const session = reactive({
  sessionName: '',
  completionStatus: 'success',
  completedAt: '',
  duration: 0,
  finalScore: 0,
  goalAchievementRate: 0,
  scriptId: null
})

// 评估数据
const evaluation = reactive({
  dimensionScores: {
    goalAchievement: 0,
    professionalism: 0,
    efficiency: 0,
    adaptability: 0,
    customerSatisfaction: 0
  },
  strengths: [] as string[],
  improvements: [] as string[],
  detailedFeedback: '',
  recommendations: [] as string[]
})

// 培训目标
const trainingGoals = ref<Array<{ text: string; achieved: boolean }>>([])

// 对话历史
const conversationHistory = ref<any[]>([])

// 加载评估报告
const loadReport = async () => {
  try {
    const response = await request.get(`/api/training-coach/sessions/${sessionId}/evaluation`)
    const data = response.data

    // 填充会话信息
    Object.assign(session, {
      sessionName: data.session_name,
      completionStatus: data.completion_status,
      completedAt: data.completed_at,
      duration: data.duration,
      finalScore: data.final_score,
      goalAchievementRate: data.goal_achievement_rate,
      scriptId: data.script_id
    })

    // 填充评估数据
    if (data.evaluation) {
      Object.assign(evaluation, {
        dimensionScores: data.evaluation.dimension_scores || {},
        strengths: data.evaluation.strengths || [],
        improvements: data.evaluation.improvements || [],
        detailedFeedback: data.evaluation.detailed_feedback || '',
        recommendations: data.evaluation.recommendations || []
      })
    }

    // 填充培训目标
    if (data.training_goals) {
      trainingGoals.value = data.training_goals
    }

    // 填充对话历史
    if (data.conversation_history) {
      conversationHistory.value = data.conversation_history
    }
  } catch (error) {
    console.error('Failed to load report:', error)
    ElMessage.error('加载评估报告失败')
  }
}

// 导出对话
const exportConversation = () => {
  try {
    const text = conversationHistory.value
      .map(msg => `[${msg.senderName}] ${formatTime(msg.timestamp)}\n${msg.content}\n`)
      .join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training-conversation-${sessionId}.txt`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export:', error)
    ElMessage.error('导出失败')
  }
}

// 返回
const goBack = () => {
  router.push('/training-coach')
}

// 开始新训练
const startNewTraining = () => {
  router.push('/training-coach')
}

// 使用相同剧本重新训练
const reviewSameScript = async () => {
  try {
    const response = await request.post('/training-coach/sessions', {
      script_id: session.scriptId,
      session_name: `${session.sessionName} - 重训`
    })

    const newSessionId = response.data.id
    router.push(`/training-coach/session/${newSessionId}`)
  } catch (error) {
    console.error('Failed to create new session:', error)
    ElMessage.error('创建训练会话失败')
  }
}

// 辅助函数
const getDimensionLabel = (key: string) => {
  const labels: Record<string, string> = {
    goalAchievement: '目标达成度',
    professionalism: '专业性',
    efficiency: '效率',
    adaptability: '应变能力',
    customerSatisfaction: '客户体验'
  }
  return labels[key] || key
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    success: 'success',
    failure: 'danger',
    partial: 'warning'
  }
  return typeMap[status] || 'info'
}

const getCompletionStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功完成',
    failure: '未完成',
    partial: '部分完成'
  }
  return textMap[status] || status
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString()
}

// 初始化
onMounted(() => {
  loadReport()
})
</script>

<style scoped lang="scss">
.training-report {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .report-header {
    margin-bottom: 20px;

    .session-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .summary-left {
        h2 {
          margin: 0 0 15px 0;
          font-size: 24px;
        }

        .meta-info {
          display: flex;
          align-items: center;
          gap: 20px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #606266;
          }
        }
      }

      .summary-right {
        .final-score {
          text-align: center;

          .score-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 10px;
          }

          .score-value {
            font-size: 48px;
            font-weight: bold;
          }
        }
      }
    }
  }

  .report-content {
    margin-bottom: 20px;

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
    }

    .card-header-with-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .score-dimensions {
      .dimension-item {
        margin-bottom: 20px;

        .dimension-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .dimension-name {
            font-weight: bold;
          }

          .dimension-score {
            font-size: 18px;
            font-weight: bold;
          }
        }
      }
    }

    .goals-achievement {
      .achievement-rate {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;

        .rate-text {
          font-size: 20px;
          font-weight: bold;
        }
      }

      .goals-list {
        .goal-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 15px;

          .goal-icon {
            font-size: 18px;

            &.achieved {
              color: #67C23A;
            }
          }

          .achieved-text {
            color: #67C23A;
          }
        }
      }
    }

    .strengths,
    .improvements {
      .analysis-item {
        margin-bottom: 10px;
      }
    }

    .detailed-feedback {
      .feedback-text {
        line-height: 1.8;
        color: #606266;
        white-space: pre-wrap;
      }
    }

    .conversation-replay {
      padding: 20px;

      .replay-message {
        .message-sender {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;

          .sender-name {
            font-weight: bold;
          }
        }

        .message-content {
          line-height: 1.6;
          color: #606266;
          margin-bottom: 10px;
        }

        .message-tags {
          display: flex;
          gap: 8px;
        }
      }
    }

    .recommendations {
      padding: 20px;
    }
  }

  .report-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 30px 0;
  }
}
</style>
