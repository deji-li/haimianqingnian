<template>
  <div class="marketing-scenarios-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI营销场景</h2>
          <p class="subtitle">基于AI大模型的6大营销场景分析，帮您精准定位客户需求，制定最优销售策略</p>
        </div>
        <el-button @click="refreshScenarios">
          <el-icon><Refresh /></el-icon>
          刷新场景
        </el-button>
      </div>
    </el-card>

    <!-- 场景分类tab -->
    <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
      <el-tab-pane
        v-for="cat in categories"
        :key="cat.category"
        :label="`${cat.category} (${cat.count})`"
        :name="cat.category"
      />
    </el-tabs>

    <!-- 场景卡片列表 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col
        :span="8"
        v-for="scenario in filteredScenarios"
        :key="scenario.scenarioKey"
        style="margin-bottom: 20px"
      >
        <el-card
          class="scenario-card"
          :class="{ disabled: !scenario.isActive }"
          shadow="hover"
        >
          <div class="scenario-header">
            <div class="scenario-icon" :style="{ backgroundColor: getScenarioColor(scenario.scenarioKey) }">
              <el-icon :size="32">
                <component :is="getScenarioIcon(scenario.scenarioKey)" />
              </el-icon>
            </div>
            <div class="scenario-title">
              <h3>{{ scenario.scenarioName }}</h3>
              <el-tag :type="scenario.isActive ? 'success' : 'info'" size="small">
                {{ scenario.isActive ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
          </div>

          <div class="scenario-description">
            {{ scenario.scenarioDescription }}
          </div>

          <div class="scenario-meta">
            <el-tag size="small">{{ scenario.scenarioCategory }}</el-tag>
            <el-tag size="small" type="info">{{ scenario.modelProvider }}</el-tag>
            <el-tag size="small" type="warning">温度: {{ scenario.temperature }}</el-tag>
          </div>

          <div class="scenario-actions">
            <el-button
              type="primary"
              :disabled="!scenario.isActive"
              @click="openExecuteDialog(scenario)"
              style="width: 100%"
            >
              <el-icon><VideoPlay /></el-icon>
              执行分析
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 场景执行对话框 -->
    <el-dialog
      v-model="executeDialogVisible"
      :title="`执行场景: ${currentScenario?.scenarioName}`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentScenario">
        <el-alert
          :title="currentScenario.scenarioDescription"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <!-- 动态表单：根据requiredVariables生成 -->
        <el-form :model="executeForm" label-width="120px" ref="executeFormRef">
          <el-form-item
            v-for="varName in currentScenario.requiredVariables"
            :key="varName"
            :label="getVariableLabel(varName)"
            :prop="`variables.${varName}`"
            :rules="[{ required: true, message: `请输入${getVariableLabel(varName)}` }]"
          >
            <el-input
              v-if="isTextVariable(varName)"
              v-model="executeForm.variables[varName]"
              type="textarea"
              :rows="4"
              :placeholder="`请输入${getVariableLabel(varName)}`"
            />
            <el-input
              v-else
              v-model="executeForm.variables[varName]"
              :placeholder="`请输入${getVariableLabel(varName)}`"
            />
          </el-form-item>

          <el-form-item label="关联客户" prop="customerId">
            <el-input
              v-model.number="executeForm.customerId"
              placeholder="可选，输入客户ID"
              type="number"
            />
          </el-form-item>
        </el-form>

        <!-- 执行结果 -->
        <div v-if="executeResult" class="execute-result">
          <el-divider content-position="left">分析结果</el-divider>

          <div class="result-content">
            <pre>{{ formatResult(executeResult.result) }}</pre>
          </div>

          <el-divider />

          <div class="result-meta">
            <el-text size="small" type="info">
              执行时间: {{ new Date(executeResult.executedAt).toLocaleString() }}
            </el-text>
          </div>

          <div class="result-actions">
            <el-button @click="copyResult" size="small">
              <el-icon><DocumentCopy /></el-icon>
              复制结果
            </el-button>
            <el-button @click="downloadResult" size="small">
              <el-icon><Download /></el-icon>
              下载结果
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleExecute"
          :loading="executing"
          :disabled="executing"
        >
          {{ executing ? '分析中...' : '开始分析' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Refresh,
  VideoPlay,
  DocumentCopy,
  Download,
  TrendCharts,
  DataAnalysis,
  Coordinate,
  ChatDotRound,
  QuestionFilled,
  Timer,
} from '@element-plus/icons-vue'
import {
  getMarketingScenarios,
  getScenarioCategories,
  executeMarketingScenario,
} from '@/api/ai'

// 数据定义
const loading = ref(false)
const activeCategory = ref('客户洞察')
const scenarios = ref<any[]>([])
const categories = ref<any[]>([])
const executeDialogVisible = ref(false)
const currentScenario = ref<any>(null)
const executing = ref(false)
const executeResult = ref<any>(null)
const executeFormRef = ref<FormInstance>()

const executeForm = reactive({
  scenarioKey: '',
  variables: {} as Record<string, any>,
  customerId: undefined as number | undefined,
})

// 计算属性：过滤场景
const filteredScenarios = computed(() => {
  if (!activeCategory.value || activeCategory.value === '全部') {
    return scenarios.value
  }
  return scenarios.value.filter(s => s.scenarioCategory === activeCategory.value)
})

// 场景图标映射
const scenarioIconMap: Record<string, any> = {
  pain_point_analysis: TrendCharts,
  interest_point_mining: DataAnalysis,
  need_positioning: Coordinate,
  script_recommendation: ChatDotRound,
  objection_handling: QuestionFilled,
  closing_timing: Timer,
}

// 场景颜色映射
const scenarioColorMap: Record<string, string> = {
  pain_point_analysis: '#E6A23C',
  interest_point_mining: '#67C23A',
  need_positioning: '#409EFF',
  script_recommendation: '#F56C6C',
  objection_handling: '#909399',
  closing_timing: '#303133',
}

// 变量标签映射
const variableLabelMap: Record<string, string> = {
  chat_content: '聊天内容',
  customer_profile: '客户画像',
  pain_points: '痛点列表',
  interest_points: '兴趣点列表',
  conversation_stage: '沟通阶段',
  decision_role: '决策角色',
  objections: '异议列表',
  intention_score: '意向分数',
  resolved_pain_points: '已解决痛点',
  unresolved_pain_points: '未解决痛点',
  communication_rounds: '沟通轮次',
}

// 判断是否是文本类型的变量
const isTextVariable = (varName: string) => {
  return ['chat_content', 'customer_profile'].includes(varName)
}

// 获取变量标签
const getVariableLabel = (varName: string) => {
  return variableLabelMap[varName] || varName
}

// 获取场景图标
const getScenarioIcon = (scenarioKey: string) => {
  return scenarioIconMap[scenarioKey] || TrendCharts
}

// 获取场景颜色
const getScenarioColor = (scenarioKey: string) => {
  return scenarioColorMap[scenarioKey] || '#409EFF'
}

// 加载场景列表
const loadScenarios = async () => {
  loading.value = true
  try {
    const data = await getMarketingScenarios({ isActive: undefined })
    scenarios.value = data
  } catch (error: any) {
    ElMessage.error(error.message || '加载场景失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await getScenarioCategories()
    categories.value = [{ category: '全部', count: scenarios.value.length }, ...data]
  } catch (error: any) {
    ElMessage.error(error.message || '加载分类失败')
  }
}

// 刷新场景
const refreshScenarios = async () => {
  await loadScenarios()
  await loadCategories()
  ElMessage.success('场景已刷新')
}

// 分类切换
const handleCategoryChange = () => {
  // 切换分类时的逻辑
}

// 打开执行对话框
const openExecuteDialog = (scenario: any) => {
  currentScenario.value = scenario
  executeForm.scenarioKey = scenario.scenarioKey
  executeForm.variables = {}
  executeForm.customerId = undefined
  executeResult.value = null
  executeDialogVisible.value = true
}

// 执行场景分析
const handleExecute = async () => {
  if (!executeFormRef.value) return

  await executeFormRef.value.validate(async (valid) => {
    if (!valid) return

    executing.value = true
    try {
      const result = await executeMarketingScenario({
        scenarioKey: executeForm.scenarioKey,
        variables: executeForm.variables,
        customerId: executeForm.customerId,
      })

      executeResult.value = result
      ElMessage.success('分析完成')
    } catch (error: any) {
      ElMessage.error(error.message || '分析失败')
    } finally {
      executing.value = false
    }
  })
}

// 格式化结果
const formatResult = (result: any) => {
  if (typeof result === 'string') {
    return result
  }
  return JSON.stringify(result, null, 2)
}

// 复制结果
const copyResult = () => {
  const text = formatResult(executeResult.value.result)
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

// 下载结果
const downloadResult = () => {
  const text = formatResult(executeResult.value.result)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentScenario.value.scenarioKey}_${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

// 初始化
onMounted(async () => {
  await loadScenarios()
  await loadCategories()
})
</script>

<style scoped lang="scss">
.marketing-scenarios-container {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
      }

      .subtitle {
        margin: 5px 0 0;
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .scenario-card {
    height: 100%;
    transition: all 0.3s;

    &.disabled {
      opacity: 0.6;
    }

    &:hover:not(.disabled) {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .scenario-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .scenario-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .scenario-title {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .scenario-description {
      color: #606266;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 16px;
      min-height: 60px;
    }

    .scenario-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .scenario-actions {
      margin-top: 12px;
    }
  }

  .execute-result {
    .result-content {
      max-height: 400px;
      overflow-y: auto;
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 12px;

      pre {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    .result-meta {
      margin-bottom: 12px;
    }

    .result-actions {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
