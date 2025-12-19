<template>
  <div class="script-polish-panel">
    <!-- 左��场景选择 -->
    <div class="polish-layout">
      <div class="left-section">
        <h3 class="section-title">应用场景</h3>
        <div class="scenario-grid">
          <div
            v-for="scenario in scenarios"
            :key="scenario.value"
            :class="['scenario-card', { active: selectedScenario === scenario.value }]"
            @click="selectScenario(scenario.value)"
          >
            <div class="scenario-name">{{ scenario.label }}</div>
          </div>
        </div>
      </div>

      <div class="right-section">
        <h3 class="section-title">润色目标</h3>
        <div class="goal-grid">
          <div
            v-for="goal in polishGoals"
            :key="goal.value"
            :class="['goal-card', { active: selectedGoal === goal.value }]"
            @click="selectGoal(goal.value)"
          >
            <div class="goal-name">{{ goal.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 话术输入区 -->
    <div class="input-section">
      <h3 class="section-title">原始话术</h3>
      <el-input
        v-model="originalScript"
        type="textarea"
        :rows="4"
        placeholder="请输入您想要润色的话术内容..."
        maxlength="2000"
        show-word-limit
        class="script-input"
      />
    </div>

    <!-- 生成按钮 -->
    <div class="action-section">
      <el-button
        type="primary"
        size="large"
        :loading="generating"
        :disabled="!canGenerate"
        @click="generatePolishedScript"
      >
        <el-icon><MagicStick /></el-icon>
        一键润色
      </el-button>
    </div>

    <!-- 结果展示区 -->
    <div v-if="polishedScript" class="result-section">
      <div class="result-header">
        <h3 class="section-title">润色结果</h3>
        <div class="result-actions">
          <el-button size="small" @click="copyResult">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
          <el-button size="small" type="primary" @click="regenerate">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
        </div>
      </div>

      <div class="result-content">
        <div class="polished-script" v-html="formatScript(polishedScript)"></div>

        <!-- AI思考过程 -->
        <thinking-process
          v-if="thinkingProcess"
          :process="thinkingProcess"
          :confidence="confidence"
          :processing-time="processingTime"
          :knowledge-sources="knowledgeSources"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, CopyDocument, Refresh } from '@element-plus/icons-vue'
import ThinkingProcess from './ThinkingProcess.vue'
import { generateScriptDirect } from '@/api/ai-script-assistant'

// 场景选项
const scenarios = [
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

// 状态管理
const selectedScenario = ref('')
const selectedGoal = ref('')
const originalScript = ref('')
const polishedScript = ref('')
const generating = ref(false)

// AI响应相关
const thinkingProcess = ref('')
const confidence = ref(0)
const processingTime = ref(0)
const knowledgeSources = ref<any[]>([])

// 计算属性
const canGenerate = computed(() => {
  return originalScript.value.trim().length > 0 && selectedGoal.value
})

// 选择场景
const selectScenario = (scenario: string) => {
  selectedScenario.value = scenario
}

// 选择润色目标
const selectGoal = (goal: string) => {
  selectedGoal.value = goal
}


// 生成润色话术
const generatePolishedScript = async () => {
  if (!canGenerate.value) return

  generating.value = true
  thinkingProcess.value = ''
  knowledgeSources.value = []

  try {
    const response = await generateScriptDirect({
      functionType: 'script_polish',
      content: originalScript.value,
      variables: {
        applicationScenario: selectedScenario.value,
        polishGoal: selectedGoal.value,
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

// 复制结果
const copyResult = async () => {
  try {
    const textContent = polishedScript.value.replace(/<[^>]*>/g, '')
    await navigator.clipboard.writeText(textContent)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 重新生成
const regenerate = () => {
  generatePolishedScript()
}

// 格式化脚本
const formatScript = (script: string) => {
  return script.replace(/\n/g, '<br>')
}
</script>

<style scoped lang="scss">
.script-polish-panel {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: #fff;

  .section-title {
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

  .polish-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  .scenario-grid,
  .goal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .scenario-card,
  .goal-card {
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

    .scenario-name,
    .goal-name {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
      line-height: 1.4;
    }
  }

  .input-section {
    margin-bottom: 24px;

    .script-input {
      :deep(.el-textarea__inner) {
        font-size: 14px;
        line-height: 1.6;
        resize: none;
      }
    }
  }

  .action-section {
    text-align: center;
    margin-bottom: 32px;

    .el-button {
      min-width: 180px;
      height: 44px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .result-section {
    background: #f8f9fb;
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        margin-bottom: 0;
      }

      .result-actions {
        display: flex;
        gap: 8px;
      }
    }

    .result-content {
      .polished-script {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 1.8;
        color: #303133;
        white-space: pre-wrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .script-polish-panel {
    padding: 16px;

    .polish-layout {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .scenario-grid,
    .goal-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
}
</style>