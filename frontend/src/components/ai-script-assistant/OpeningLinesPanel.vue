<template>
  <div class="opening-lines-panel">
    <!-- 场景选择 -->
    <div class="scenario-section">
      <h3 class="section-title">选择场景</h3>
      <div class="scenario-grid">
        <div
          v-for="scenario in scenarios"
          :key="scenario.id"
          :class="['scenario-card', { active: selectedScenario === scenario.id }]"
          @click="selectScenario(scenario.id)"
        >
          <div class="scenario-name">{{ scenario.scenarioName }}</div>
        </div>
      </div>
    </div>

    <!-- 技巧选择 -->
    <div v-if="techniques.length > 0" class="technique-section">
      <h3 class="section-title">选择技巧</h3>
      <div class="technique-grid">
        <div
          v-for="technique in techniques"
          :key="technique.id"
          :class="['technique-card', { active: selectedTechnique === technique.id }]"
          @click="selectTechnique(technique.id)"
        >
          <div class="technique-header">
            <div class="technique-name">{{ technique.techniqueName }}</div>
            <div class="technique-icon">⭐</div>
          </div>
          <div class="technique-desc">{{ technique.techniqueDesc }}</div>
        </div>
      </div>
    </div>

    <!-- 生成按钮 -->
    <div class="action-section">
      <el-button
        type="primary"
        size="large"
        :loading="generating"
        :disabled="!canGenerate"
        @click="generateOpeningLines"
      >
        <el-icon><ChatDotRound /></el-icon>
        一键生成开场白
      </el-button>
    </div>

    <!-- 结果展示区 -->
    <div v-if="openingScript" class="result-section">
      <div class="result-header">
        <h3 class="section-title">生成的开场白</h3>
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
        <div class="opening-script" v-html="formatScript(openingScript)"></div>

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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, CopyDocument, Refresh } from '@element-plus/icons-vue'
import ThinkingProcess from './ThinkingProcess.vue'
import { getScenarios, getTechniques, generateScriptDirect } from '@/api/ai-script-assistant'

// 状态管理
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const selectedScenario = ref<number | null>(null)
const selectedTechnique = ref<number | null>(null)
const openingScript = ref('')
const generating = ref(false)

// AI响应相关
const thinkingProcess = ref('')
const confidence = ref(0)
const processingTime = ref(0)
const knowledgeSources = ref<any[]>([])

// 计算属性
const canGenerate = computed(() => {
  return selectedScenario.value && selectedTechnique.value
})

// 加载开场白场景
const loadScenarios = async () => {
  try {
    const result = await getScenarios('opening_lines')
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


// 生成开场白
const generateOpeningLines = async () => {
  if (!canGenerate.value) return

  generating.value = true
  thinkingProcess.value = ''
  knowledgeSources.value = []

  try {
    const response = await generateScriptDirect({
      functionType: 'opening_lines',
      scenarioId: selectedScenario.value!,
      techniqueId: selectedTechnique.value!,
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

// 复制结果
const copyResult = async () => {
  try {
    const textContent = openingScript.value.replace(/<[^>]*>/g, '')
    await navigator.clipboard.writeText(textContent)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 重新生成
const regenerate = () => {
  generateOpeningLines()
}

// 格式化脚本
const formatScript = (script: string) => {
  return script.replace(/\n/g, '<br>')
}

// 组件挂载时加载场景
onMounted(() => {
  loadScenarios()
})
</script>

<style scoped lang="scss">
.opening-lines-panel {
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

  .scenario-section {
    margin-bottom: 16px;

    .scenario-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .scenario-card {
      background: #fff;
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      padding: 16px 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      &.active {
        border-color: #667eea;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }

      .scenario-name {
        font-size: 13px;
        color: #303133;
        font-weight: 500;
        line-height: 1.4;
      }
    }
  }

  .technique-section {
    margin-bottom: 24px;

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

      .technique-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .technique-name {
        font-size: 12px;
        color: #303133;
        font-weight: 500;
        line-height: 1.3;
        flex: 1;
        margin-right: 4px;
        text-align: center;
      }

      .technique-icon {
        font-size: 12px;
        color: #f5ba41;
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

  .action-section {
    text-align: center;
    margin-bottom: 32px;

    .el-button {
      min-width: 200px;
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
      .opening-script {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 1.8;
        color: #303133;
        white-space: pre-wrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #667eea;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .opening-lines-panel {
    padding: 16px;

    .scenario-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .technique-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>