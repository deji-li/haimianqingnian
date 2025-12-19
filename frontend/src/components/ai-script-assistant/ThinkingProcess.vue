<template>
  <div class="thinking-process">
    <!-- 折叠式思考过程展示 -->
    <el-collapse v-if="process" class="thinking-collapse">
      <el-collapse-item name="thinking">
        <template #title>
          <div class="thinking-header">
            <el-icon class="thinking-icon"><Cpu /></el-icon>
            <span class="thinking-title">AI思考过程</span>
            <el-tag
              v-if="confidence"
              :type="getConfidenceType(confidence)"
              size="small"
              class="confidence-tag"
            >
              置信度 {{ (confidence * 100).toFixed(1) }}%
            </el-tag>
            <el-tag
              v-if="processingTime"
              type="info"
              size="small"
              class="time-tag"
            >
              {{ processingTime }}ms
            </el-tag>
          </div>
        </template>

        <div class="thinking-content">
          <!-- 格式化显示思考过程 -->
          <div class="thinking-text" v-html="formatThinkingText(process)"></div>

          <!-- 知识来源展示 -->
          <div v-if="knowledgeSources && knowledgeSources.length > 0" class="knowledge-sources">
            <h4 class="sources-title">
              <el-icon><Reading /></el-icon>
              知识来源
            </h4>
            <div class="sources-list">
              <div
                v-for="(source, index) in knowledgeSources"
                :key="source.id || index"
                class="source-item"
                @click="viewKnowledge(source)"
              >
                <div class="source-info">
                  <div class="source-title">{{ source.title }}</div>
                  <div class="source-meta">
                    <span class="source-category">{{ source.category || '未分类' }}</span>
                    <span v-if="source.score" class="source-score">
                      相关度: {{ (source.score * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>
                <el-icon class="source-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <!-- 策略说明 -->
          <div v-if="strategy" class="strategy-info">
            <h4 class="strategy-title">
              <el-icon><TrendCharts /></el-icon>
              生成策略
            </h4>
            <el-tag :type="getStrategyType(strategy)" class="strategy-tag">
              {{ getStrategyText(strategy) }}
            </el-tag>
            <p class="strategy-desc">{{ getStrategyDescription(strategy) }}</p>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 简化版显示（用于空间有限的场景） -->
    <div v-else-if="compact && process" class="thinking-compact">
      <el-tooltip effect="dark" placement="top" :show-after="500">
        <template #content>
          <div class="compact-tooltip" v-html="formatThinkingText(process)"></div>
        </template>
        <div class="compact-content">
          <el-icon class="compact-icon"><Cpu /></el-icon>
          <span class="compact-text">AI已深度分析</span>
          <el-tag v-if="confidence" :type="getConfidenceType(confidence)" size="small">
            {{ (confidence * 100).toFixed(0) }}%
          </el-tag>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, Reading, ArrowRight, TrendCharts } from '@element-plus/icons-vue'

interface Props {
  process?: string
  confidence?: number
  processingTime?: number
  strategy?: string
  knowledgeSources?: Array<{
    id?: number
    title: string
    category?: string
    score?: number
    content?: string
  }>
  compact?: boolean // 紧凑模式
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const emit = defineEmits<{
  viewKnowledge: [source: any]
}>()

// 格式化思考过程文本
const formatThinkingText = (text: string): string => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<span class="step-number">$1</span>')
    .replace(/（([^）]+)）/g, '<span class="parenthesis">（$1）</span>')
    .replace(/重要提示：/g, '<span class="important">重要提示：</span>')
    .replace(/建议：/g, '<span class="suggestion">建议：</span>')
}

// 获取置信度类型
const getConfidenceType = (confidence: number): string => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'danger'
}

// 获取策略类型
const getStrategyType = (strategy: string): string => {
  switch (strategy) {
    case 'KNOWLEDGE_BASED': return 'primary'
    case 'KNOWLEDGE_ENHANCED': return 'success'
    case 'GENERAL_AI': return 'info'
    default: return 'info'
  }
}

// 获取策略文本
const getStrategyText = (strategy: string): string => {
  switch (strategy) {
    case 'KNOWLEDGE_BASED': return '知识库驱动'
    case 'KNOWLEDGE_ENHANCED': return '知识增强'
    case 'GENERAL_AI': return '智能生成'
    default: return '未知策略'
  }
}

// 获取策略描述
const getStrategyDescription = (strategy: string): string => {
  switch (strategy) {
    case 'KNOWLEDGE_BASED':
      return '基于企业知识库中的成功案例和最佳实践生成回复，确保专业性和实用性。'
    case 'KNOWLEDGE_ENHANCED':
      return '结合企业知识库和AI智能分析，生成个性化的话术建议。'
    case 'GENERAL_AI':
      return '基于通用的销售沟通经验和技巧生成建议。'
    default:
      return '使用相应的策略生成最合适的话术回复。'
  }
}

// 查看知识详情
const viewKnowledge = (source: any) => {
  emit('viewKnowledge', source)
}
</script>

<style scoped lang="scss">
.thinking-process {
  margin: 10px 0;

  .thinking-collapse {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-collapse-item__header) {
      background: #fafafa;
      padding: 12px 20px;
      border-bottom: 1px solid #e4e7ed;

      &:hover {
        background: #f5f7fa;
      }
    }

    :deep(.el-collapse-item__content) {
      padding: 0;
      background: white;
    }
  }

  .thinking-header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .thinking-icon {
      color: #409eff;
      font-size: 18px;
    }

    .thinking-title {
      font-weight: 500;
      color: #303133;
      flex: 1;
    }

    .confidence-tag,
    .time-tag {
      margin-left: auto;
    }
  }

  .thinking-content {
    padding: 20px;

    .thinking-text {
      line-height: 1.8;
      color: #606266;
      margin-bottom: 20px;

      :deep(.step-number) {
        font-weight: 600;
        color: #409eff;
      }

      :deep(.parenthesis) {
        color: #909399;
        font-size: 0.9em;
      }

      :deep(.important) {
        color: #f56c6c;
        font-weight: 500;
      }

      :deep(.suggestion) {
        color: #67c23a;
        font-weight: 500;
      }
    }

    .knowledge-sources {
      background: #f8fafc;
      border-radius: 6px;
      padding: 15px;
      margin-top: 15px;

      .sources-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        color: #303133;

        .el-icon {
          color: #409eff;
        }
      }

      .sources-list {
        .source-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

            .source-arrow {
              color: #409eff;
              transform: translateX(3px);
            }
          }

          .source-info {
            flex: 1;

            .source-title {
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .source-meta {
              font-size: 12px;
              color: #909399;
              display: flex;
              gap: 12px;

              .source-score {
                color: #67c23a;
              }
            }
          }

          .source-arrow {
            color: #c0c4cc;
            transition: all 0.3s;
          }
        }
      }
    }

    .strategy-info {
      margin-top: 15px;

      .strategy-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 500;
        color: #303133;

        .el-icon {
          color: #409eff;
        }
      }

      .strategy-tag {
        margin-bottom: 8px;
      }

      .strategy-desc {
        margin: 0;
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  // 紧凑模式
  .thinking-compact {
    .compact-content {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: #f0f9ff;
      border-radius: 4px;
      cursor: help;

      .compact-icon {
        color: #409eff;
        font-size: 14px;
      }

      .compact-text {
        font-size: 12px;
        color: #606266;
      }
    }

    .compact-tooltip {
      max-width: 400px;
      line-height: 1.6;

      :deep(.step-number) {
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .thinking-process {
    .thinking-header {
      flex-wrap: wrap;
      gap: 6px;

      .confidence-tag,
      .time-tag {
        margin-left: 0;
        font-size: 11px;
      }
    }

    .thinking-content {
      padding: 15px;

      .knowledge-sources {
        padding: 12px;

        .source-item {
          padding: 8px;

          .source-info {
            .source-title {
              font-size: 13px;
            }

            .source-meta {
              font-size: 11px;
            }
          }
        }
      }
    }
  }
}
</style>