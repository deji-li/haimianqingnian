<template>
  <div class="opening-lines-mode">
    <div class="main-container">
      <!-- 左侧：场景选择 -->
      <div class="left-panel">
        <el-card class="scenario-card">
          <h3>开场场景</h3>
          <div class="scenario-list">
            <div
              v-for="scenario in scenarios"
              :key="scenario.id"
              :class="['scenario-item', { active: selectedScenario === scenario.id }]"
              @click="selectScenario(scenario.id)"
            >
              <div class="scenario-icon">{{ getScenarioIcon(scenario.scenarioName) }}</div>
              <div class="scenario-info">
                <div class="scenario-name">{{ scenario.scenarioName }}</div>
                <div class="scenario-desc">{{ scenario.scenarioDesc }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 技巧选择 -->
        <el-card v-if="selectedScenario && techniques.length > 0" class="technique-card">
          <h3>话术技巧</h3>
          <div class="technique-list">
            <el-radio-group v-model="selectedTechnique" @change="onTechniqueChange">
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
            </el-radio-group>
          </div>
        </el-card>
      </div>

      <!-- 右侧：生成区域 -->
      <div class="right-panel">
        <!-- 客户信息输入 -->
        <el-card class="customer-info-card">
          <template #header>
            <h3>客户信息（可选）</h3>
          </template>
          <el-form :model="customerInfo" label-width="80px">
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="客户姓名">
                  <el-input v-model="customerInfo.name" placeholder="请输入客户姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="行业领域">
                  <el-input v-model="customerInfo.industry" placeholder="请输入行业" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="职位">
                  <el-input v-model="customerInfo.position" placeholder="请输入职位" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关系程度">
                  <el-select v-model="customerInfo.relationship" placeholder="请选择">
                    <el-option label="初次接触" value="first" />
                    <el-option label="已有联系" value="contacted" />
                    <el-option label="比较熟悉" value="familiar" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 生成按钮 -->
        <div class="action-area">
          <el-button
            type="primary"
            size="large"
            :loading="generating"
            :disabled="!selectedScenario"
            @click="generateOpening"
          >
            <el-icon><MagicStick /></el-icon>
            生成开场白
          </el-button>
        </div>

        <!-- 生成结果 -->
        <el-card v-if="generatedResult" class="result-card">
          <template #header>
            <div class="result-header">
              <h3>开场白</h3>
              <div class="result-actions">
                <el-button size="small" @click="copyResult">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button size="small" type="success" @click="saveToKnowledge">
                  <el-icon><Star /></el-icon>
                  保存到知识库
                </el-button>
                <el-button size="small" type="primary" @click="regenerate">
                  <el-icon><Refresh /></el-icon>
                  重新生成
                </el-button>
              </div>
            </div>
          </template>

          <!-- 开场白内容 -->
          <div class="opening-content">
            <div class="opening-text">{{ generatedResult.content }}</div>
          </div>

          <!-- 使用建议 -->
          <div v-if="generatedResult.suggestions" class="usage-suggestions">
            <h4>使用建议</h4>
            <ul>
              <li v-for="(suggestion, index) in generatedResult.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 变体方案 -->
          <div v-if="generatedResult.variations" class="variations">
            <h4>其他变体</h4>
            <div class="variation-list">
              <div
                v-for="(variation, index) in generatedResult.variations"
                :key="index"
                class="variation-item"
                @click="selectVariation(variation)"
              >
                {{ variation }}
              </div>
            </div>
          </div>

          <!-- AI思考过程 -->
          <thinking-process
            v-if="generatedResult.thinkingProcess"
            :process="generatedResult.thinkingProcess"
            :confidence="generatedResult.confidence"
            :processing-time="generatedResult.processingTime"
            :strategy="generatedResult.strategy"
            :knowledge-sources="generatedResult.knowledgeSources"
            @view-knowledge="viewKnowledge"
          />

          <!-- 适用场景 -->
          <div v-if="generatedResult.applicableScenarios" class="applicable-scenarios">
            <h4>适用场景</h4>
            <div class="scenario-tags">
              <el-tag
                v-for="scenario in generatedResult.applicableScenarios"
                :key="scenario"
                size="small"
                class="scenario-tag"
              >
                {{ scenario }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 历史记录 -->
        <el-card v-if="history.length > 0" class="history-card">
          <template #header>
            <h3>历史记录</h3>
          </template>
          <div class="history-list">
            <div
              v-for="item in history"
              :key="item.id"
              class="history-item"
              @click="loadHistory(item)"
            >
              <div class="history-content">{{ item.content }}</div>
              <div class="history-time">{{ formatTime(item.createTime) }}</div>
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
import { MagicStick, DocumentCopy, Star, Refresh } from '@element-plus/icons-vue'
import { getScenarios } from '@/api/ai-script-assistant'
import ThinkingProcess from '@/components/ai-script-assistant/ThinkingProcess.vue'

const emit = defineEmits(['close'])

// 状态管理
const selectedScenario = ref<number>()
const selectedTechnique = ref<number>()
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const generating = ref(false)
const generatedResult = ref<any>(null)
const history = ref<any[]>([])

// 客户信息
const customerInfo = ref({
  name: '',
  industry: '',
  position: '',
  relationship: '',
})

// 场景图标映射
const scenarioIcons: Record<string, string> = {
  '祝福问候': '🎉',
  '自我介绍': '👋',
  '需求探询': '🔍',
  '消除顾虑': '💪',
  '互动提问': '❓',
  '传达价值': '💎',
  '挖掘兴趣': '✨',
  '分享趋势': '📈',
  '引导深入': '🎯',
  '情感链接': '❤️',
}

// 获取场景图标
const getScenarioIcon = (scenarioName: string): string => {
  return scenarioIcons[scenarioName] || '📝'
}

// 选择场景
const selectScenario = (scenarioId: number) => {
  selectedScenario.value = scenarioId
  selectedTechnique.value = undefined

  const scenario = scenarios.value.find(s => s.id === scenarioId)
  if (scenario) {
    techniques.value = scenario.techniques || []
  }
}

// 技巧变化
const onTechniqueChange = () => {
  // 可以在这里添加技巧选择的处理逻辑
}

// 生成开场白
const generateOpening = async () => {
  if (!selectedScenario.value) {
    ElMessage.warning('请选择开场场景')
    return
  }

  generating.value = true
  try {
    const scenario = scenarios.value.find(s => s.id === selectedScenario.value)
    const technique = techniques.value.find(t => t.id === selectedTechnique.value)

    // 构建生成请求
    const prompt = `
      开场场景：${scenario?.scenarioName}
      场景描述：${scenario?.scenarioDesc}
      ${technique ? `技巧：${technique.techniqueName} - ${technique.techniqueDesc}` : ''}
      ${customerInfo.value.name ? `客户姓名：${customerInfo.value.name}` : ''}
      ${customerInfo.value.industry ? `行业领域：${customerInfo.value.industry}` : ''}
      ${customerInfo.value.position ? `职位：${customerInfo.value.position}` : ''}
      ${customerInfo.value.relationship ? `关系程度：${customerInfo.value.relationship}` : ''}

      请根据以上信息生成一个合适的开场白。
    `

    // 调用AI生成API（这里暂时模拟）
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟生成结果
    generatedResult.value = {
      content: generateMockOpening(),
      suggestions: [
        '保持真诚友好的语气',
        '适当提及客户的背景信息',
        '控制时长在30秒以内',
        '为后续对话留下空间',
      ],
      variations: [
        '另一种开场白表达方式',
        '更简洁的版本',
        '更正式的版本',
      ],
      thinkingProcess: '1. 分析场景和客户信息\n2. 选择合适的开场策略\n3. 设计个性化的表达方式\n4. 确保开场白简洁有力\n5. 加入适当的互动元素',
      applicableScenarios: ['电话沟通', '微信聊天', '初次见面'],
    }

    // 添加到历史记录
    history.value.unshift({
      id: Date.now(),
      content: generatedResult.value.content,
      createTime: new Date().toISOString(),
    })

    ElMessage.success('开场白生成完成')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 模拟开场白生成
const generateMockOpening = (): string => {
  const scenario = scenarios.value.find(s => s.id === selectedScenario.value)
  const templates = [
    `${customerInfo.value.name ? `${customerInfo.value.name}，您好！` : '您好！'}我是${scenario?.scenarioName}方面的专家，希望能够为您提供有价值的信息。`,
    `您好！关注到您在${customerInfo.value.industry || '相关领域'}的发展，我们有一些${scenario?.scenarioDesc}的解决方案想和您分享。`,
    `${customerInfo.value.name || '朋友'}，${scenario?.scenarioDesc}，相信这会对您有所帮助。`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

// 复制结果
const copyResult = () => {
  if (generatedResult.value?.content) {
    navigator.clipboard.writeText(generatedResult.value.content).then(() => {
      ElMessage.success('开场白已复制到剪贴板')
    })
  }
}

// 保存到知识库
const saveToKnowledge = async () => {
  if (!generatedResult.value) return

  try {
    ElMessageBox.confirm(
      '确定要将这个开场白保存到知识库吗？',
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

// 重新生成
const regenerate = () => {
  generateOpening()
}

// 选择变体
const selectVariation = (variation: string) => {
  generatedResult.value!.content = variation
  ElMessage.success('已切换到该变体')
}

// 加载历史记录
const loadHistory = (item: any) => {
  generatedResult.value = {
    content: item.content,
    suggestions: [],
    variations: [],
  }
  ElMessage.success('已加载历史记录')
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

// 初始化
onMounted(async () => {
  try {
    // 加载开场白场景数据
    const res = await getScenarios('opening_lines')
    scenarios.value = res || []
  } catch (error) {
    console.error('加载场景失败:', error)
  }
})
</script>

<style scoped lang="scss">
.opening-lines-mode {
  height: 75vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .main-container {
    height: 100%;
    display: flex;
    gap: 20px;
  }

  .left-panel {
    width: 350px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .scenario-card {
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

      .scenario-list {
        flex: 1;
        overflow-y: auto;

        .scenario-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;

          &:hover {
            background: #f0f9ff;
          }

          &.active {
            background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

            .scenario-desc {
              color: rgba(255, 255, 255, 0.9);
            }
          }

          .scenario-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(64, 158, 255, 0.1);
            border-radius: 50%;
          }

          .scenario-info {
            flex: 1;

            .scenario-name {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .scenario-desc {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
            }
          }
        }
      }
    }

    .technique-card {
      max-height: 300px;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #303133;
      }

      .technique-list {
        flex: 1;
        overflow-y: auto;

        .technique-item {
          display: block;
          margin-bottom: 10px;
          padding: 10px;
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
    }
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;

    .customer-info-card {
      h3 {
        margin: 0;
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

      .opening-content {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        padding: 25px;
        border-radius: 10px;
        border-left: 4px solid #0ea5e9;
        position: relative;

        &::before {
          content: '"';
          position: absolute;
          top: 10px;
          left: 15px;
          font-size: 48px;
          color: #0ea5e9;
          opacity: 0.2;
        }

        .opening-text {
          line-height: 1.8;
          color: #0c4a6e;
          font-size: 16px;
          font-style: italic;
          position: relative;
          z-index: 1;
        }
      }

      .usage-suggestions {
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

      .variations {
        margin-top: 20px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }

        .variation-list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .variation-item {
            padding: 10px 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: #e0f2fe;
              border-color: #0ea5e9;
            }
          }
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

      .applicable-scenarios {
        margin-top: 20px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }

        .scenario-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .scenario-tag {
            background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
            color: white;
            border: none;
          }
        }
      }
    }

    .history-card {
      max-height: 300px;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      h3 {
        margin: 0;
        color: #303133;
      }

      .history-list {
        flex: 1;
        overflow-y: auto;

        .history-item {
          padding: 12px;
          border: 1px solid #e4e7ed;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;

          &:hover {
            background: #f0f9ff;
            border-color: #409eff;
          }

          .history-content {
            color: #303133;
            line-height: 1.5;
            margin-bottom: 5px;
          }

          .history-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .opening-lines-mode {
    padding: 15px;

    .main-container {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
      order: 2;
      max-height: 300px;
    }

    .right-panel {
      order: 1;
    }
  }
}
</style>