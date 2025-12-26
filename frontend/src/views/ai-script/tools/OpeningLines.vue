<template>
  <div class="opening-lines-container">
    <el-card class="tool-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><ChatDotRound /></el-icon>
          <span class="header-title">开场白生成工具</span>
        </div>
      </template>

      <div class="tool-content">
        <el-row :gutter="20">
          <!-- 左侧：输入区域 -->
          <el-col :span="12">
            <div class="input-section">
              <el-alert
                title="开场白生成工具说明"
                type="info"
                :closable="false"
                style="margin-bottom: 20px"
              >
                <template #default>
                  <p>• <strong>适用场景</strong>：初次联系客户、开始新对话</p>
                  <p>• <strong>功能特点</strong>：根据场景和技巧快速生成专业开场白</p>
                  <p>• <strong>使用方式</strong>：选择场景技巧，输入客户信息，一键生成</p>
                </template>
              </el-alert>

              <h3 class="section-title">输入信息</h3>

              <el-form :model="form" label-width="100px" label-position="top">
                <el-form-item label="选择场景">
                  <el-select
                    v-model="form.scenarioId"
                    placeholder="请选择沟通场景"
                    @change="handleScenarioChange"
                    filterable
                  >
                    <el-option
                      v-for="scenario in scenarios"
                      :key="scenario.id"
                      :label="scenario.scenarioName"
                      :value="scenario.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="选择技巧">
                  <el-select
                    v-model="form.techniqueId"
                    placeholder="请选择销售技巧"
                    :disabled="!form.scenarioId"
                    filterable
                  >
                    <el-option
                      v-for="technique in currentTechniques"
                      :key="technique.id"
                      :label="technique.techniqueName"
                      :value="technique.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="客户信息（可选）">
                  <el-input
                    v-model="form.customerInfo"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入客户的基本信息，如：客户姓名、年龄、职业、需求等"
                  />
                </el-form-item>

                <el-form-item label="特殊要求（可选）">
                  <el-input
                    v-model="form.specialRequirement"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入特殊要求，如：语气、风格、重点等"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="generating"
                    @click="handleGenerate"
                    :disabled="!form.scenarioId"
                    size="large"
                    style="width: 100%"
                  >
                    <el-icon v-if="!generating"><MagicStick /></el-icon>
                    {{ generating ? '生成中...' : '生成开场白' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>

          <!-- 右侧：生成结果 -->
          <el-col :span="12">
            <div class="result-section">
              <h3 class="section-title">生成结果</h3>

              <div v-if="!result && !generating" class="empty-result">
                <el-icon class="empty-icon"><Document /></el-icon>
                <p>选择场景和技巧后，点击生成按钮获取开场白建议</p>
              </div>

              <div v-if="generating" class="loading-result">
                <el-icon class="loading-icon is-loading"><Loading /></el-icon>
                <p>AI正在为您生成专业的开场白...</p>
              </div>

              <div v-if="result && !generating" class="result-content">
                <div class="result-card">
                  <div class="result-header">
                    <span class="confidence-label">置信度：</span>
                    <el-progress
                      :percentage="Math.round((result.confidence || 0.5) * 100)"
                      :color="getConfidenceColor(result.confidence || 0.5)"
                      :stroke-width="8"
                      style="flex: 1; margin-left: 10px"
                    />
                  </div>

                  <div class="result-main">
                    <div class="result-text">
                      {{ result.content }}
                    </div>
                  </div>

                  <div v-if="result.thinkingProcess" class="thinking-process">
                    <el-collapse>
                      <el-collapse-item title="查看思考过程" name="thinking">
                        <div class="thinking-content">
                          {{ result.thinkingProcess }}
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>

                  <div v-if="result.knowledgeSources && result.knowledgeSources.length > 0" class="knowledge-sources">
                    <el-divider>引用知识库</el-divider>
                    <el-tag
                      v-for="source in result.knowledgeSources"
                      :key="source.id"
                      class="knowledge-tag"
                      type="info"
                    >
                      {{ source.title }}
                    </el-tag>
                  </div>

                  <div class="result-actions">
                    <el-button
                      type="primary"
                      :icon="CopyDocument"
                      @click="handleCopy"
                    >
                      复制
                    </el-button>
                    <el-button
                      :icon="RefreshRight"
                      @click="handleGenerate"
                    >
                      重新生成
                    </el-button>
                    <el-button
                      type="success"
                      :icon="ChatDotRound"
                      @click="handleUseInConversation"
                    >
                      在会话中使用
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 历史记录 -->
    <el-card class="history-card" v-if="history.length > 0">
      <template #header>
        <div class="card-header">
          <span class="header-title">历史记录</span>
          <el-button type="danger" size="small" text @click="clearHistory">清空</el-button>
        </div>
      </template>

      <div class="history-list">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item"
          @click="loadHistoryItem(item)"
        >
          <div class="history-content">
            {{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}
          </div>
          <div class="history-meta">
            <span>{{ item.scenario }} - {{ item.technique }}</span>
            <span>{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  MagicStick,
  Document,
  Loading,
  CopyDocument,
  RefreshRight,
} from '@element-plus/icons-vue'
import { getScenarios, generateScriptDirect } from '@/api/ai-script-assistant'
import { useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'

const router = useRouter()
const { copy } = useClipboard()

// 表单数据
const form = reactive({
  scenarioId: null as number | null,
  techniqueId: null as number | null,
  customerInfo: '',
  specialRequirement: '',
})

// 场景和技巧
const scenarios = ref<any[]>([])
const currentTechniques = computed(() => {
  if (!form.scenarioId) return []
  const scenario = scenarios.value.find(s => s.id === form.scenarioId)
  return scenario?.techniques || []
})

// 生成状态和结果
const generating = ref(false)
const result = ref<any>(null)

// 历史记录
const history = ref<any[]>([])

// 加载场景
const loadScenarios = async () => {
  try {
    const res = await getScenarios('opening_lines')
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
    ElMessage.error('加载场景失败')
  }
}

// 场景变化
const handleScenarioChange = () => {
  form.techniqueId = null
}

// 生成开场白
const handleGenerate = async () => {
  if (!form.scenarioId) {
    ElMessage.warning('请先选择场景')
    return
  }

  generating.value = true
  result.value = null

  try {
    const res = await generateScriptDirect({
      functionType: 'opening_lines',
      scenarioId: form.scenarioId,
      techniqueId: form.techniqueId || undefined,
      variables: {
        customerInfo: form.customerInfo || undefined,
        specialRequirement: form.specialRequirement || undefined,
      },
    })

    result.value = res

    // 保存到历史记录
    const scenario = scenarios.value.find(s => s.id === form.scenarioId)
    const technique = currentTechniques.value.find(t => t.id === form.techniqueId)

    history.value.unshift({
      content: res.content,
      scenario: scenario?.scenarioName || '未知场景',
      technique: technique?.techniqueName || '未选择技巧',
      timestamp: new Date(),
      confidence: res.confidence,
      thinkingProcess: res.thinkingProcess,
      knowledgeSources: res.knowledgeSources,
    })

    // 限制历史记录数量
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }

    // 保存到本地存储
    saveHistory()

    ElMessage.success('开场白生成成功')
  } catch (error) {
    console.error('生成开场白失败:', error)
    ElMessage.error('生成开场白失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

// 复制结果
const handleCopy = async () => {
  if (!result.value) return

  try {
    await copy(result.value.content)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 在会话中使用
const handleUseInConversation = () => {
  router.push({
    name: 'ScriptConversation',
    query: {
      functionType: 'opening_lines',
      scenarioId: form.scenarioId,
      techniqueId: form.techniqueId,
      prefilledContent: result.value?.content,
    },
  })
}

// 加载历史记录项
const loadHistoryItem = (item: any) => {
  result.value = {
    content: item.content,
    confidence: item.confidence,
    thinkingProcess: item.thinkingProcess,
    knowledgeSources: item.knowledgeSources,
  }
}

// 清空历史记录
const clearHistory = () => {
  history.value = []
  localStorage.removeItem('opening_lines_history')
  ElMessage.success('历史记录已清空')
}

// 保存历史记录
const saveHistory = () => {
  try {
    localStorage.setItem('opening_lines_history', JSON.stringify(history.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 加载历史记录
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('opening_lines_history')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

// 格式化时间
const formatTime = (time: any) => {
  const date = new Date(time)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadScenarios()
  loadHistory()
})
</script>

<style scoped lang="scss">
.opening-lines-container {
  padding: 20px;

  .tool-card,
  .history-card {
    margin-bottom: 20px;

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

  .tool-content {
    .section-title {
      margin: 0 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #409eff;
      font-size: 16px;
      font-weight: 600;
    }

    .input-section {
      .el-select {
        width: 100%;
      }
    }

    .result-section {
      .empty-result,
      .loading-result {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        color: #909399;

        .empty-icon,
        .loading-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        p {
          font-size: 14px;
        }
      }

      .result-content {
        .result-card {
          padding: 20px;
          background-color: #f5f7fa;
          border-radius: 8px;

          .result-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;

            .confidence-label {
              font-weight: 600;
              white-space: nowrap;
            }
          }

          .result-main {
            margin-bottom: 20px;

            .result-text {
              padding: 16px;
              background-color: white;
              border-radius: 6px;
              line-height: 1.8;
              white-space: pre-wrap;
              font-size: 15px;
            }
          }

          .thinking-process {
            margin-bottom: 20px;

            .thinking-content {
              padding: 12px;
              background-color: white;
              border-radius: 6px;
              line-height: 1.6;
              white-space: pre-wrap;
              color: #606266;
            }
          }

          .knowledge-sources {
            margin-bottom: 20px;

            .knowledge-tag {
              margin-right: 8px;
              margin-bottom: 8px;
            }
          }

          .result-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
        }
      }
    }
  }

  .history-card {
    .history-list {
      display: grid;
      gap: 12px;

      .history-item {
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #ecf5ff;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        }

        .history-content {
          margin-bottom: 8px;
          color: #303133;
          line-height: 1.6;
        }

        .history-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
