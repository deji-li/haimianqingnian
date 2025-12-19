<template>
  <div class="script-polish-mode">
    <div class="main-container">
      <!-- 左侧：应用场景选择 -->
      <div class="left-panel">
        <el-card class="scenario-card">
          <h3>应用场景</h3>
          <el-select
            v-model="selectedScenario"
            placeholder="请选择应用场景"
            style="width: 100%"
            @change="onScenarioChange"
          >
            <el-option
              v-for="scenario in scenarios"
              :key="scenario.id"
              :label="scenario.scenarioName"
              :value="scenario.id"
            />
          </el-select>

          <div v-if="selectedScenario" class="scenario-description">
            <h4>场景说明</h4>
            <p>{{ selectedScenarioInfo?.scenarioDesc }}</p>
          </div>
        </el-card>
      </div>

      <!-- 右侧：润色目标和操作区域 -->
      <div class="right-panel">
        <!-- 润色目标选择 -->
        <el-card class="polish-goal-card">
          <h3>润色目标</h3>
          <el-select
            v-model="selectedGoal"
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
        </el-card>

        <!-- 原始话术输入区 -->
        <el-card class="input-card">
          <h3>原始话术</h3>
          <el-input
            v-model="originalScript"
            type="textarea"
            :rows="8"
            placeholder="请输入需要润色的话术内容..."
            maxlength="2000"
            show-word-limit
          />
        </el-card>

        <!-- 一键润色按钮 -->
        <div class="action-area">
          <el-button
            type="primary"
            size="large"
            :loading="polishing"
            :disabled="!originalScript.trim() || !selectedScenario || !selectedGoal"
            @click="polishScript"
          >
            <el-icon><MagicStick /></el-icon>
            一键润色
          </el-button>
        </div>

        <!-- 润色结果展示区 -->
        <el-card v-if="polishedResult" class="result-card">
          <template #header>
            <div class="result-header">
              <h3>润色结果</h3>
              <div class="result-actions">
                <el-button size="small" @click="copyResult">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button size="small" type="success" @click="saveToKnowledge">
                  <el-icon><Star /></el-icon>
                  保存到知识库
                </el-button>
              </div>
            </div>
          </template>

          <!-- 润色后的内容 -->
          <div class="polished-content">
            <div class="content-text">{{ polishedResult.content }}</div>
          </div>

          <!-- AI思考过程 -->
          <thinking-process
            v-if="polishedResult.thinkingProcess"
            :process="polishedResult.thinkingProcess"
            :confidence="polishedResult.confidence"
            :processing-time="polishedResult.processingTime"
            :strategy="polishedResult.strategy"
            :knowledge-sources="polishedResult.knowledgeSources"
            @view-knowledge="viewKnowledge"
          />

          <!-- 改进建议 -->
          <div v-if="polishedResult.suggestions" class="suggestions">
            <h4>改进建议</h4>
            <ul>
              <li v-for="(suggestion, index) in polishedResult.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 知识来源 -->
          <div v-if="polishedResult.knowledgeSources" class="knowledge-sources">
            <h4>参考知识</h4>
            <div class="knowledge-tags">
              <el-tag
                v-for="source in polishedResult.knowledgeSources"
                :key="source.id"
                size="small"
                class="knowledge-tag"
              >
                {{ source.title }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 对比展示 -->
        <el-card v-if="polishedResult" class="comparison-card">
          <template #header>
            <h3>润色对比</h3>
          </template>
          <div class="comparison-content">
            <div class="comparison-item">
              <div class="comparison-label">原始话术：</div>
              <div class="comparison-text original">{{ originalScript }}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-label">润色后：</div>
              <div class="comparison-text polished">{{ polishedResult.content }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick, DocumentCopy, Star } from '@element-plus/icons-vue'
import { getScenarios } from '@/api/ai-script-assistant'
import ThinkingProcess from '@/components/ai-script-assistant/ThinkingProcess.vue'

const emit = defineEmits(['close'])

// 状态管理
const selectedScenario = ref<number>()
const selectedGoal = ref<string>()
const originalScript = ref('')
const polishing = ref(false)
const polishedResult = ref<any>(null)
const scenarios = ref<any[]>([])

// 润色目标选项
const polishGoals = [
  { label: '简洁优化', value: 'concise' },
  { label: '专业提升', value: 'professional' },
  { label: '亲和力强化', value: 'friendly' },
  { label: '说服力增强', value: 'persuasive' },
  { label: '情感表达优化', value: 'emotional' },
  { label: '逻辑性加强', value: 'logical' },
]

// 计算属性
const selectedScenarioInfo = computed(() => {
  return scenarios.value.find(s => s.id === selectedScenario.value)
})

// 场景变化处理
const onScenarioChange = () => {
  // 可以在这里根据场景调整润色目标选项
}

// 润色话术
const polishScript = async () => {
  if (!originalScript.value.trim()) {
    ElMessage.warning('请输入需要润色的话术内容')
    return
  }

  if (!selectedScenario.value) {
    ElMessage.warning('请选择应用场景')
    return
  }

  if (!selectedGoal.value) {
    ElMessage.warning('请选择润色目标')
    return
  }

  polishing.value = true
  try {
    // 构建润色请求
    const prompt = `
      场景：${selectedScenarioInfo.value?.scenarioName}
      润色目标：${polishGoals.find(g => g.value === selectedGoal.value)?.label}

      原始话术：
      ${originalScript.value}

      请根据以上信息，对原始话术进行润色优化。
    `

    // 调用AI润色API（这里暂时模拟）
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟润色结果
    polishedResult.value = {
      content: `经过润色优化的话术内容：${originalScript.value.replace(/。/g, '，更专业、更有说服力。')}`,
      thinkingProcess: '1. 分析原始话术的结构和表达方式\n2. 根据选定的润色目标进行优化\n3. 确保润色后的内容符合应用场景要求\n4. 检查语言的流畅性和专业性',
      suggestions: [
        '建议在开头增加个性化问候',
        '可以加入更多数据支撑',
        '结尾可以增加行动召唤',
      ],
      knowledgeSources: [
        { id: 1, title: '高效沟通技巧' },
        { id: 2, title: '客户心理分析' },
      ],
    }

    ElMessage.success('话术润色完成')
  } catch (error) {
    console.error('润色失败:', error)
    ElMessage.error('润色失败，请重试')
  } finally {
    polishing.value = false
  }
}

// 复制结果
const copyResult = () => {
  if (polishedResult.value?.content) {
    navigator.clipboard.writeText(polishedResult.value.content).then(() => {
      ElMessage.success('润色结果已复制到剪贴板')
    })
  }
}

// 保存到知识库
const saveToKnowledge = async () => {
  if (!polishedResult.value) return

  try {
    // TODO: 调用保存到知识库的API
    ElMessageBox.confirm(
      '确定要将润色后的话术保存到知识库吗？',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    ).then(() => {
      ElMessage.success('已保存到知识库')
    }).catch(() => {
      // 用户取消
    })
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 初始化
onMounted(async () => {
  try {
    // 加载场景数据（话术润色可能需要特定场景）
    const res = await getScenarios()
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
  }
})
</script>

<style scoped lang="scss">
.script-polish-mode {
  height: 75vh;
  padding: 20px;
  background: #f5f7fa;

  .main-container {
    height: 100%;
    display: flex;
    gap: 20px;
  }

  .left-panel {
    width: 300px;
    flex-shrink: 0;

    .scenario-card {
      height: 100%;

      :deep(.el-card__body) {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        color: #303133;
      }

      .scenario-description {
        margin-top: 20px;
        flex: 1;

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #606266;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #909399;
          line-height: 1.6;
        }
      }
    }
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;

    .polish-goal-card {
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #303133;
      }
    }

    .input-card {
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #303133;
      }
    }

    .action-area {
      display: flex;
      justify-content: center;
      padding: 20px 0;

      .el-button {
        padding: 12px 40px;
        font-size: 16px;
      }
    }

    .result-card {
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          color: #303133;
        }

        .result-actions {
          display: flex;
          gap: 10px;
        }
      }

      .polished-content {
        background: #f0f9ff;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #409eff;

        .content-text {
          line-height: 1.8;
          color: #303133;
          font-size: 15px;
        }
      }

      .thinking-process {
        margin-top: 20px;

        :deep(.el-collapse) {
          border: 1px solid #e4e7ed;
          border-radius: 6px;

          .el-collapse-item__header {
            background: #fafafa;
            padding: 12px 20px;
            font-weight: 500;
          }

          .el-collapse-item__content {
            padding: 15px 20px;
          }
        }

        .thinking-content {
          line-height: 1.6;
          color: #606266;
          font-size: 14px;
        }
      }

      .suggestions {
        margin-top: 20px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }

        ul {
          margin: 0;
          padding-left: 20px;

          li {
            color: #606266;
            line-height: 1.6;
            margin-bottom: 5px;
          }
        }
      }

      .knowledge-sources {
        margin-top: 20px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }

        .knowledge-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .knowledge-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }
    }

    .comparison-card {
      h3 {
        margin: 0;
        color: #303133;
      }

      .comparison-content {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .comparison-item {
          display: flex;
          gap: 15px;

          .comparison-label {
            width: 80px;
            flex-shrink: 0;
            font-weight: 500;
            color: #606266;
          }

          .comparison-text {
            flex: 1;
            padding: 15px;
            border-radius: 8px;
            line-height: 1.6;

            &.original {
              background: #fef0f0;
              border-left: 4px solid #f56c6c;
              color: #666;
            }

            &.polished {
              background: #f0f9ff;
              border-left: 4px solid #409eff;
              color: #303133;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .script-polish-mode {
    padding: 15px;

    .main-container {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
      order: 2;
    }

    .right-panel {
      order: 1;
    }
  }
}
</style>