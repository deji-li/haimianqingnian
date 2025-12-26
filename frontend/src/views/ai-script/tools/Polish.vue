<template>
  <div class="script-polish-container">
    <el-card class="tool-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Edit /></el-icon>
          <span class="header-title">话术润色工具</span>
        </div>
      </template>

      <div class="tool-content">
        <el-row :gutter="20">
          <!-- 左侧：输入区域 -->
          <el-col :span="12">
            <div class="input-section">
              <el-alert
                title="话术润色工具说明"
                type="info"
                :closable="false"
                style="margin-bottom: 20px"
              >
                <template #default>
                  <p>• <strong>适用场景</strong>：优化现有话术、提升表达效果</p>
                  <p>• <strong>功能特点</strong>：专业润色、对比展示、一键替换</p>
                  <p>• <strong>使用方式</strong>：输入原始话术，选择润色目标，获取优化版本</p>
                </template>
              </el-alert>

              <h3 class="section-title">原始话术</h3>

              <el-form :model="form" label-width="100px" label-position="top">
                <el-form-item label="待润色的话术内容">
                  <el-input
                    v-model="form.content"
                    type="textarea"
                    :rows="12"
                    placeholder="请输入需要润色的话术内容..."
                    maxlength="2000"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="应用场景（可选）">
                  <el-select
                    v-model="form.scenarioId"
                    placeholder="请选择应用场景"
                    clearable
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

                <el-form-item label="润色目标">
                  <el-checkbox-group v-model="form.polishGoals">
                    <el-checkbox label="提升专业性">提升专业性</el-checkbox>
                    <el-checkbox label="增强说服力">增强说服力</el-checkbox>
                    <el-checkbox label="优化语气">优化语气</el-checkbox>
                    <el-checkbox label="简化表达">简化表达</el-checkbox>
                    <el-checkbox label="增加亲和力">增加亲和力</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="特殊要求（可选）">
                  <el-input
                    v-model="form.specialRequirement"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入特殊要求，如：保持原意、强调某个重点等"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="polishing"
                    @click="handlePolish"
                    :disabled="!form.content"
                    size="large"
                    style="width: 100%"
                  >
                    <el-icon v-if="!polishing"><MagicStick /></el-icon>
                    {{ polishing ? '润色中...' : '开始润色' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>

          <!-- 右侧：润色结果 -->
          <el-col :span="12">
            <div class="result-section">
              <h3 class="section-title">润色结果</h3>

              <div v-if="!result && !polishing" class="empty-result">
                <el-icon class="empty-icon"><Document /></el-icon>
                <p>输入话术内容后，点击润色按钮获取优化建议</p>
              </div>

              <div v-if="polishing" class="loading-result">
                <el-icon class="loading-icon is-loading"><Loading /></el-icon>
                <p>AI正在为您优化话术...</p>
              </div>

              <div v-if="result && !polishing" class="result-content">
                <div class="result-card">
                  <div class="result-header">
                    <div class="confidence-section">
                      <span class="confidence-label">优化程度：</span>
                      <el-progress
                        :percentage="Math.round((result.confidence || 0.5) * 100)"
                        :color="getConfidenceColor(result.confidence || 0.5)"
                        :stroke-width="8"
                        style="flex: 1; margin-left: 10px"
                      />
                    </div>
                  </div>

                  <div class="comparison-view">
                    <div class="original-content">
                      <div class="content-label">原始话术</div>
                      <div class="content-text">{{ form.content }}</div>
                    </div>

                    <el-icon class="arrow-icon"><Right /></el-icon>

                    <div class="polished-content">
                      <div class="content-label">润色后</div>
                      <div class="content-text">{{ result.content }}</div>
                    </div>
                  </div>

                  <div v-if="result.thinkingProcess" class="thinking-process">
                    <el-collapse>
                      <el-collapse-item title="查看优化说明" name="thinking">
                        <div class="thinking-content">
                          {{ result.thinkingProcess }}
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>

                  <div v-if="result.knowledgeSources && result.knowledgeSources.length > 0" class="knowledge-sources">
                    <el-divider>参考知识</el-divider>
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
                      复制润色结果
                    </el-button>
                    <el-button
                      :icon="RefreshRight"
                      @click="handlePolish"
                    >
                      重新润色
                    </el-button>
                    <el-button
                      type="success"
                      :icon="Select"
                      @click="handleReplace"
                    >
                      替换原文
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
          <span class="header-title">润色历史</span>
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
          <div class="history-original">
            <span class="label">原文：</span>
            <span class="text">{{ item.original.substring(0, 50) }}{{ item.original.length > 50 ? '...' : '' }}</span>
          </div>
          <div class="history-polished">
            <span class="label">润色：</span>
            <span class="text">{{ item.polished.substring(0, 50) }}{{ item.polished.length > 50 ? '...' : '' }}</span>
          </div>
          <div class="history-meta">
            <span>{{ item.goals.join('、') || '通用润色' }}</span>
            <span>{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Edit,
  MagicStick,
  Document,
  Loading,
  CopyDocument,
  RefreshRight,
  Select,
  Right,
} from '@element-plus/icons-vue'
import { getScenarios, generateScriptDirect } from '@/api/ai-script-assistant'
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard()

// 表单数据
const form = reactive({
  content: '',
  scenarioId: null as number | null,
  polishGoals: [] as string[],
  specialRequirement: '',
})

// 场景
const scenarios = ref<any[]>([])

// 润色状态和结果
const polishing = ref(false)
const result = ref<any>(null)

// 历史记录
const history = ref<any[]>([])

// 加载场景
const loadScenarios = async () => {
  try {
    const res = await getScenarios('script_polish')
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
    ElMessage.error('加载场景失败')
  }
}

// 润色话术
const handlePolish = async () => {
  if (!form.content) {
    ElMessage.warning('请输入需要润色的话术内容')
    return
  }

  polishing.value = true
  result.value = null

  try {
    const res = await generateScriptDirect({
      functionType: 'script_polish',
      content: form.content,
      scenarioId: form.scenarioId || undefined,
      variables: {
        polishGoals: form.polishGoals.length > 0 ? form.polishGoals.join('、') : undefined,
        specialRequirement: form.specialRequirement || undefined,
      },
    })

    result.value = res

    // 保存到历史记录
    history.value.unshift({
      original: form.content,
      polished: res.content,
      goals: form.polishGoals,
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

    ElMessage.success('话术润色成功')
  } catch (error) {
    console.error('润色话术失败:', error)
    ElMessage.error('润色话术失败，请稍后重试')
  } finally {
    polishing.value = false
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

// 替换原文
const handleReplace = () => {
  if (!result.value) return

  form.content = result.value.content
  ElMessage.success('已替换为润色后的内容')
}

// 加载历史记录项
const loadHistoryItem = (item: any) => {
  form.content = item.original
  result.value = {
    content: item.polished,
    confidence: item.confidence,
    thinkingProcess: item.thinkingProcess,
    knowledgeSources: item.knowledgeSources,
  }
}

// 清空历史记录
const clearHistory = () => {
  history.value = []
  localStorage.removeItem('script_polish_history')
  ElMessage.success('历史记录已清空')
}

// 保存历史记录
const saveHistory = () => {
  try {
    localStorage.setItem('script_polish_history', JSON.stringify(history.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 加载历史记录
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('script_polish_history')
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
.script-polish-container {
  padding: 20px;

  .tool-card,
  .history-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .header-icon {
        font-size: 20px;
        color: #409eff;
      }

      .header-title {
        font-size: 16px;
        font-weight: 600;
        flex: 1;
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
            margin-bottom: 20px;

            .confidence-section {
              display: flex;
              align-items: center;

              .confidence-label {
                font-weight: 600;
                white-space: nowrap;
              }
            }
          }

          .comparison-view {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;

            .original-content,
            .polished-content {
              flex: 1;
              padding: 16px;
              background-color: white;
              border-radius: 6px;

              .content-label {
                margin-bottom: 8px;
                font-weight: 600;
                font-size: 14px;
                color: #606266;
              }

              .content-text {
                line-height: 1.8;
                white-space: pre-wrap;
                color: #303133;
              }
            }

            .original-content {
              border-left: 3px solid #e6a23c;
            }

            .polished-content {
              border-left: 3px solid #67c23a;
            }

            .arrow-icon {
              font-size: 24px;
              color: #409eff;
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

        .history-original,
        .history-polished {
          margin-bottom: 4px;
          line-height: 1.6;

          .label {
            font-weight: 600;
            color: #606266;
            margin-right: 4px;
          }

          .text {
            color: #303133;
          }
        }

        .history-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;
          padding-top: 8px;
          border-top: 1px solid #ebeef5;
        }
      }
    }
  }
}
</style>
