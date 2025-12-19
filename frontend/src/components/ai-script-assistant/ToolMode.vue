<template>
  <div class="tool-mode">
    <!-- 话术润色模式 -->
    <div v-if="functionType === 'script_polish'" class="script-polish-mode">
      <!-- 左侧：应用场景选择 -->
      <div class="left-panel">
        <h3 class="panel-title">应用场景</h3>
        <el-select
          v-model="selectedScenario"
          placeholder="请选择应用场景"
          style="width: 100%"
          @change="handleScenarioChange"
        >
          <el-option
            v-for="scenario in scriptPolishScenarios"
            :key="scenario.value"
            :label="scenario.label"
            :value="scenario.value"
          />
        </el-select>
      </div>

      <!-- 右侧：润色目标选择 -->
      <div class="right-panel">
        <h3 class="panel-title">润色目标</h3>
        <el-select
          v-model="selectedPolishGoal"
          placeholder="请选择润色目标"
          style="width: 100%"
        >
          <el-option
            v-for="goal in polishGoals"
            :key="goal.value"
            :label="goal.label"
            :value="goal.value"
          />
        </el-select>
      </div>

      <!-- 全宽：原始话术输入 -->
      <div class="full-width-panel">
        <h3 class="panel-title">原始话术</h3>
        <el-input
          v-model="originalScript"
          type="textarea"
          :rows="6"
          placeholder="请输入您想要润色的话术内容..."
          maxlength="2000"
          show-word-limit
        />
      </div>

      <!-- 生成按钮 -->
      <div class="action-panel">
        <el-button
          type="primary"
          size="large"
          :loading="generating"
          :disabled="!canGenerateScript"
          @click="generatePolishScript"
        >
          一键润色
        </el-button>
      </div>

      <!-- 润色结果 -->
      <div v-if="polishedScript" class="result-panel">
        <h3 class="panel-title">润色结果</h3>
        <div class="script-result">
          <div class="result-content" v-html="formatScript(polishedScript)"></div>

          <!-- AI思考过程 -->
          <thinking-process
            v-if="thinkingProcess"
            :process="thinkingProcess"
            :confidence="confidence"
            :processing-time="processingTime"
            :knowledge-sources="knowledgeSources"
          />

          <div class="result-actions">
            <el-button size="small" @click="copyScript">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" type="primary" @click="regenerateScript">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 开场白生成模式 -->
    <div v-else-if="functionType === 'opening_lines'" class="opening-lines-mode">
      <!-- 场景选择 -->
      <div class="scenario-section">
        <h3 class="panel-title">选择场景</h3>
        <el-select
          v-model="selectedScenario"
          placeholder="请选择开场白场景"
          style="width: 100%"
          @change="handleOpeningScenarioChange"
        >
          <el-option
            v-for="scenario in openingScenarios"
            :key="scenario.id"
            :label="scenario.scenarioName"
            :value="scenario.id"
          />
        </el-select>

        <!-- 技巧选择 -->
        <div v-if="openingTechniques.length > 0" class="techniques-section">
          <h4 class="sub-title">选择技巧</h4>
          <el-radio-group v-model="selectedTechnique">
            <el-radio
              v-for="technique in openingTechniques"
              :key="technique.id"
              :label="technique.id"
              class="technique-radio"
            >
              <div class="technique-info">
                <div class="technique-name">{{ technique.techniqueName }}</div>
                <div class="technique-desc">{{ technique.techniqueDesc }}</div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 生成按钮 -->
      <div class="action-panel">
        <el-button
          type="primary"
          size="large"
          :loading="generating"
          :disabled="!canGenerateOpening"
          @click="generateOpening"
        >
          一键生成开场白
        </el-button>
      </div>

      <!-- 生成结果 -->
      <div v-if="openingScript" class="result-panel">
        <h3 class="panel-title">开场白</h3>
        <div class="script-result">
          <div class="result-content" v-html="formatScript(openingScript)"></div>

          <!-- AI思考过程 -->
          <thinking-process
            v-if="thinkingProcess"
            :process="thinkingProcess"
            :confidence="confidence"
            :processing-time="processingTime"
            :knowledge-sources="knowledgeSources"
          />

          <div class="result-actions">
            <el-button size="small" @click="copyOpeningScript">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" type="primary" @click="regenerateOpening">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Refresh } from '@element-plus/icons-vue'
import ThinkingProcess from './ThinkingProcess.vue'
import { getScenarios, getTechniques, generateScript } from '@/api/ai-script-assistant'

const props = defineProps<{
  functionType: string
}>()

// 话术润色相关
const selectedScenario = ref('')
const selectedPolishGoal = ref('')
const originalScript = ref('')
const polishedScript = ref('')

// 开场白生成相关
const openingScenarios = ref<any[]>([])
const openingTechniques = ref<any[]>([])
const selectedTechnique = ref<number | null>(null)
const openingScript = ref('')

// 通用状态
const generating = ref(false)
const thinkingProcess = ref('')
const confidence = ref(0)
const processingTime = ref(0)
const knowledgeSources = ref<any[]>([])

// 话术润色场景选项
const scriptPolishScenarios = [
  { label: '初次接触', value: 'first_contact' },
  { label: '产品介绍', value: 'product_intro' },
  { label: '异议处理', value: 'objection_handling' },
  { label: '价格谈判', value: 'price_negotiation' },
  { label: '促成交易', value: 'closing_deal' },
  { label: '售后服务', value: 'after_sales' },
  { label: '客户关怀', value: 'customer_care' },
  { label: '活动邀约', value: 'event_invitation' },
]

// 润色目标选项
const polishGoals = [
  { label: '更专业正式', value: 'professional' },
  { label: '更亲切自然', value: 'friendly' },
  { label: '更有说服力', value: 'persuasive' },
  { label: '更简洁明了', value: 'concise' },
  { label: '更有感染力', value: 'engaging' },
  { label: '更突出价值', value: 'value_focused' },
  { label: '更易理解', value: 'easy_understand' },
  { label: '更有紧迫感', value: 'urgency' },
]

// 计算属性
const canGenerateScript = computed(() => {
  return originalScript.value.trim().length > 0 && selectedPolishGoal.value
})

const canGenerateOpening = computed(() => {
  return selectedScenario.value && selectedTechnique.value
})

// 处理场景变化
const handleScenarioChange = () => {
  // 可以根据场景调整润色目标选项
}

// 处理开场白场景变化
const handleOpeningScenarioChange = async () => {
  selectedTechnique.value = null
  openingTechniques.value = []

  if (selectedScenario.value) {
    try {
      const techniques = await getTechniques(selectedScenario.value)
      openingTechniques.value = techniques || []
    } catch (error) {
      console.error('加载技巧失败:', error)
    }
  }
}

// 生成润色话术
const generatePolishScript = async () => {
  generating.value = true

  try {
    const response = await generateScript({
      functionType: 'script_polish',
      content: originalScript.value,
      variables: {
        applicationScenario: selectedScenario.value,
        polishGoal: selectedPolishGoal.value,
      }
    })

    polishedScript.value = response.content
    thinkingProcess.value = response.thinkingProcess || ''
    confidence.value = response.confidence || 0
    processingTime.value = response.processingTime || 0
    knowledgeSources.value = response.knowledgeSources || []

    ElMessage.success('话术润色成功')
  } catch (error) {
    console.error('润色失败:', error)
    ElMessage.error('润色失败，请重试')
  } finally {
    generating.value = false
  }
}

// 生成开场白
const generateOpening = async () => {
  generating.value = true

  try {
    const response = await generateScript({
      functionType: 'opening_lines',
      scenarioId: selectedScenario.value,
      techniqueId: selectedTechnique.value || undefined,
    })

    openingScript.value = response.content
    thinkingProcess.value = response.thinkingProcess || ''
    confidence.value = response.confidence || 0
    processingTime.value = response.processingTime || 0
    knowledgeSources.value = response.knowledgeSources || []

    ElMessage.success('开场白生成成功')
  } catch (error) {
    console.error('生成开场白失败:', error)
    ElMessage.error('生成开场白失败，请重试')
  } finally {
    generating.value = false
  }
}

// 复制脚本
const copyScript = async () => {
  try {
    await navigator.clipboard.writeText(polishedScript.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制开场白
const copyOpeningScript = async () => {
  try {
    await navigator.clipboard.writeText(openingScript.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 重新生成
const regenerateScript = () => {
  generatePolishScript()
}

const regenerateOpening = () => {
  generateOpening()
}

// 格式化脚本
const formatScript = (script: string) => {
  return script.replace(/\n/g, '<br>')
}

// 初始化开场白场景
const initOpeningScenarios = async () => {
  if (props.functionType === 'opening_lines') {
    try {
      const scenarios = await getScenarios('opening_lines')
      openingScenarios.value = scenarios || []
    } catch (error) {
      console.error('加载开场白场景失败:', error)
    }
  }
}

// 组件挂载时初始化
import { onMounted } from 'vue'
onMounted(() => {
  initOpeningScenarios()
})
</script>

<style scoped lang="scss">
.tool-mode {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e4e7ed;
    border-radius: 3px;
  }
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin: 16px 0 12px 0;
}

.script-polish-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .left-panel,
  .right-panel {
    min-width: 0;
  }

  .full-width-panel {
    grid-column: 1 / -1;
  }
}

.opening-lines-mode {
  max-width: 800px;
  margin: 0 auto;
}

.scenario-section {
  margin-bottom: 24px;
}

.techniques-section {
  margin-top: 20px;
}

.technique-radio {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  margin-right: 0;

  :deep(.el-radio__label) {
    width: 100%;
    padding-left: 24px;
  }
}

.technique-info {
  .technique-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .technique-desc {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}

.action-panel {
  text-align: center;
  margin: 32px 0;

  .el-button {
    min-width: 160px;
  }
}

.result-panel {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.script-result {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 12px;

  .result-content {
    font-size: 14px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 16px;
    white-space: pre-wrap;
  }

  .result-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .script-polish-mode {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tool-mode {
    padding: 16px;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>