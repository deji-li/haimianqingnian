<template>
  <div class="knowledge-analytics">
    <div class="page-header">
      <h2>知识库分析</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          style="margin-right: 10px"
        />
        <el-button type="primary" @click="refreshAnalytics">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 概览统计 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.totalKnowledge }}</div>
                <div class="stat-label">总知识条目</div>
                <div class="stat-trend" :class="{ positive: overview.knowledgeGrowth > 0 }">
                  <el-icon><ArrowUp v-if="overview.knowledgeGrowth > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(overview.knowledgeGrowth) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon quality">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.avgQualityScore }}</div>
                <div class="stat-label">平均质量评分</div>
                <div class="stat-trend" :class="{ positive: overview.qualityTrend > 0 }">
                  <el-icon><ArrowUp v-if="overview.qualityTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(overview.qualityTrend) }}分
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon usage">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.totalUsage }}</div>
                <div class="stat-label">总使用次数</div>
                <div class="stat-trend" :class="{ positive: overview.usageGrowth > 0 }">
                  <el-icon><ArrowUp v-if="overview.usageGrowth > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(overview.usageGrowth) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon satisfaction">
                <el-icon><Thumb /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overview.satisfactionRate }}%</div>
                <div class="stat-label">满意度</div>
                <div class="stat-trend" :class="{ positive: overview.satisfactionTrend > 0 }">
                  <el-icon><ArrowUp v-if="overview.satisfactionTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(overview.satisfactionTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表分析 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 知识增长趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>知识增长趋势</span>
                <el-radio-group v-model="growthPeriod" size="small" @change="loadGrowthChart">
                  <el-radio-button value="week">周</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                  <el-radio-button value="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="growthChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 使用情况分析 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>使用情况分析</span>
            </template>
            <div ref="usageChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 场景分类分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>场景分类分布</span>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 知识来源分析 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>知识来源分析</span>
            </template>
            <div ref="sourceChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 热点知识和待优化知识 -->
    <div class="knowledge-insights">
      <el-row :gutter="20">
        <!-- 热点知识 -->
        <el-col :span="12">
          <el-card class="insight-card">
            <template #header>
              <div class="insight-header">
                <span>🔥 热点知识</span>
                <el-link type="primary" @click="viewAllHotKnowledge">查看全部</el-link>
              </div>
            </template>
            <div class="hot-knowledge-list">
              <div
                v-for="(item, index) in hotKnowledge"
                :key="item.id"
                class="hot-item"
                :class="{ top: index < 3 }"
              >
                <div class="hot-rank">{{ index + 1 }}</div>
                <div class="hot-content">
                  <div class="hot-title">{{ item.title }}</div>
                  <div class="hot-stats">
                    <span class="usage-count">使用 {{ item.usageCount }} 次</span>
                    <span class="satisfaction-rate" :class="{ high: item.satisfactionRate >= 90 }">
                      满意度 {{ item.satisfactionRate }}%
                    </span>
                  </div>
                </div>
                <div class="hot-trend" :class="{ up: item.trend > 0 }">
                  <el-icon><ArrowUp v-if="item.trend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(item.trend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 待优化知识 -->
        <el-col :span="12">
          <el-card class="insight-card">
            <template #header>
              <div class="insight-header">
                <span>⚠️ 待优化知识</span>
                <el-link type="primary" @click="viewAllOptimizeKnowledge">查看全部</el-link>
              </div>
            </template>
            <div class="optimize-knowledge-list">
              <div
                v-for="item in optimizeKnowledge"
                :key="item.id"
                class="optimize-item"
                :class="getOptimizeLevel(item)"
              >
                <div class="optimize-level">
                  <el-tag :type="getOptimizeTagType(item)" size="small">
                    {{ getOptimizeLevelText(item) }}
                  </el-tag>
                </div>
                <div class="optimize-content">
                  <div class="optimize-title">{{ item.title }}</div>
                  <div class="optimize-reason">{{ item.reason }}</div>
                  <div class="optimize-stats">
                    <span class="negative-feedback">负反馈 {{ item.negativeFeedbackCount }}</span>
                    <span class="low-usage">使用率 {{ item.usageRate }}%</span>
                  </div>
                </div>
                <div class="optimize-actions">
                  <el-button size="small" type="primary" @click="optimizeItem(item)">
                    优化
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI功能使用统计 -->
    <div class="ai-usage-section">
      <el-card>
        <template #header>
          <span>🤖 AI功能使用统计</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="ai-function-item">
              <div class="function-icon assistant">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="function-stats">
                <div class="function-name">AI助手</div>
                <div class="function-usage">{{ aiUsage.aiAssistant }} 次调用</div>
                <el-progress
                  :percentage="aiUsage.aiAssistantRate"
                  :color="getProgressColor(aiUsage.aiAssistantRate)"
                />
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="ai-function-item">
              <div class="function-icon analysis">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="function-stats">
                <div class="function-name">客户分析</div>
                <div class="function-usage">{{ aiUsage.customerAnalysis }} 次分析</div>
                <el-progress
                  :percentage="aiUsage.customerAnalysisRate"
                  :color="getProgressColor(aiUsage.customerAnalysisRate)"
                />
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="ai-function-item">
              <div class="function-icon marketing">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="function-stats">
                <div class="function-name">营销建议</div>
                <div class="function-usage">{{ aiUsage.marketingAdvice }} 次生成</div>
                <el-progress
                  :percentage="aiUsage.marketingAdviceRate"
                  :color="getProgressColor(aiUsage.marketingAdviceRate)"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Star,
  View,
  Thumb,
  ArrowUp,
  ArrowDown,
  Refresh,
  ChatDotRound,
  DataAnalysis,
  TrendCharts
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { enterpriseKnowledgeApi } from '@/api/enterprise-knowledge'

// 响应式数据
const loading = ref(false)
const dateRange = ref([])
const growthPeriod = ref('month')

// 概览数据
const overview = reactive({
  totalKnowledge: 0,
  knowledgeGrowth: 0,
  avgQualityScore: 0,
  qualityTrend: 0,
  totalUsage: 0,
  usageGrowth: 0,
  satisfactionRate: 0,
  satisfactionTrend: 0
})

// 图表引用
const growthChartRef = ref()
const usageChartRef = ref()
const categoryChartRef = ref()
const sourceChartRef = ref()

// 图表实例
let growthChart: echarts.ECharts | null = null
let usageChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null

// 热点知识和待优化知识
const hotKnowledge = ref([])
const optimizeKnowledge = ref([])

// AI使用统计
const aiUsage = reactive({
  aiAssistant: 0,
  aiAssistantRate: 0,
  customerAnalysis: 0,
  customerAnalysisRate: 0,
  marketingAdvice: 0,
  marketingAdviceRate: 0
})

// 方法
const refreshAnalytics = async () => {
  await Promise.all([
    loadOverview(),
    loadGrowthChart(),
    loadUsageChart(),
    loadCategoryChart(),
    loadSourceChart(),
    loadHotKnowledge(),
    loadOptimizeKnowledge(),
    loadAIUsage()
  ])
}

const handleDateChange = () => {
  refreshAnalytics()
}

const loadOverview = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getAnalyticsOverview({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })

    Object.assign(overview, response.data)
  } catch (error) {
    ElMessage.error('加载概览数据失败')
    console.error('Load overview error:', error)
  }
}

const loadGrowthChart = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getGrowthTrend({
      period: growthPeriod.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })

    const data = response.data

    await nextTick()
    if (!growthChartRef.value) return

    if (!growthChart) {
      growthChart = echarts.init(growthChartRef.value)
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['新增知识', '累计知识']
      },
      xAxis: {
        type: 'category',
        data: data.dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增知识',
          type: 'bar',
          data: data.newKnowledge,
          itemStyle: {
            color: '#409EFF'
          }
        },
        {
          name: '累计知识',
          type: 'line',
          data: data.totalKnowledge,
          itemStyle: {
            color: '#67C23A'
          },
          smooth: true
        }
      ]
    }

    growthChart.setOption(option)
  } catch (error) {
    console.error('Load growth chart error:', error)
  }
}

const loadUsageChart = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getUsageAnalytics({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })

    const data = response.data

    await nextTick()
    if (!usageChartRef.value) return

    if (!usageChart) {
      usageChart = echarts.init(usageChartRef.value)
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['使用次数', '独立用户', '满意度']
      },
      xAxis: {
        type: 'category',
        data: data.dates
      },
      yAxis: [
        {
          type: 'value',
          name: '次数'
        },
        {
          type: 'value',
          name: '满意度(%)',
          max: 100
        }
      ],
      series: [
        {
          name: '使用次数',
          type: 'bar',
          data: data.usageCount,
          itemStyle: {
            color: '#E6A23C'
          }
        },
        {
          name: '独立用户',
          type: 'bar',
          data: data.uniqueUsers,
          itemStyle: {
            color: '#F56C6C'
          }
        },
        {
          name: '满意度',
          type: 'line',
          yAxisIndex: 1,
          data: data.satisfaction,
          itemStyle: {
            color: '#67C23A'
          }
        }
      ]
    }

    usageChart.setOption(option)
  } catch (error) {
    console.error('Load usage chart error:', error)
  }
}

const loadCategoryChart = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getCategoryDistribution()
    const data = response.data

    await nextTick()
    if (!categoryChartRef.value) return

    if (!categoryChart) {
      categoryChart = echarts.init(categoryChartRef.value)
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10
      },
      series: [
        {
          name: '场景分类',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }

    categoryChart.setOption(option)
  } catch (error) {
    console.error('Load category chart error:', error)
  }
}

const loadSourceChart = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getSourceDistribution()
    const data = response.data

    await nextTick()
    if (!sourceChartRef.value) return

    if (!sourceChart) {
      sourceChart = echarts.init(sourceChartRef.value)
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.categories
      },
      series: [
        {
          name: '知识数量',
          type: 'bar',
          data: data.values,
          itemStyle: {
            color: function(params: any) {
              const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
              return colors[params.dataIndex % colors.length]
            }
          }
        }
      ]
    }

    sourceChart.setOption(option)
  } catch (error) {
    console.error('Load source chart error:', error)
  }
}

const loadHotKnowledge = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getHotKnowledge({ limit: 10 })
    hotKnowledge.value = response.data
  } catch (error) {
    console.error('Load hot knowledge error:', error)
  }
}

const loadOptimizeKnowledge = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getOptimizeKnowledge({ limit: 10 })
    optimizeKnowledge.value = response.data
  } catch (error) {
    console.error('Load optimize knowledge error:', error)
  }
}

const loadAIUsage = async () => {
  try {
    const response = await enterpriseKnowledgeApi.getAIUsageAnalytics()
    Object.assign(aiUsage, response.data)
  } catch (error) {
    console.error('Load AI usage error:', error)
  }
}

// 辅助方法
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
}

const getOptimizeLevel = (item: any) => {
  if (item.negativeFeedbackCount >= 5 || item.satisfactionRate < 60) return 'critical'
  if (item.negativeFeedbackCount >= 3 || item.satisfactionRate < 75) return 'warning'
  return 'normal'
}

const getOptimizeTagType = (item: any) => {
  const level = getOptimizeLevel(item)
  const typeMap = {
    critical: 'danger',
    warning: 'warning',
    normal: 'info'
  }
  return typeMap[level] || 'info'
}

const getOptimizeLevelText = (item: any) => {
  const level = getOptimizeLevel(item)
  const textMap = {
    critical: '紧急',
    warning: '建议',
    normal: '观察'
  }
  return textMap[level] || '观察'
}

const viewAllHotKnowledge = () => {
  // 跳转到热点知识页面
  ElMessage.info('跳转到热点知识页面')
}

const viewAllOptimizeKnowledge = () => {
  // 跳转到待优化知识页面
  ElMessage.info('跳转到待优化知识页面')
}

const optimizeItem = (item: any) => {
  // 打开优化对话框
  ElMessage.info(`优化知识: ${item.title}`)
}

// 生命周期
onMounted(async () => {
  // 设置默认日期范围为最近30天
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)

  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]

  await refreshAnalytics()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    growthChart?.resize()
    usageChart?.resize()
    categoryChart?.resize()
    sourceChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.knowledge-analytics {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .overview-section {
    margin-bottom: 20px;

    .stat-card {
      .stat-item {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;

          .el-icon {
            font-size: 24px;
            color: white;
          }

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.quality {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.usage {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.satisfaction {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .stat-content {
          flex: 1;

          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }

          .stat-trend {
            font-size: 12px;
            color: #F56C6C;
            display: flex;
            align-items: center;

            &.positive {
              color: #67C23A;
            }

            .el-icon {
              margin-right: 2px;
            }
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
      }
    }
  }

  .knowledge-insights {
    margin-bottom: 20px;

    .insight-card {
      .insight-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .hot-knowledge-list {
        .hot-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &.top {
            background: #fff9e6;
            margin: 0 -12px;
            padding: 12px;
            border-radius: 4px;
          }

          .hot-rank {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #409EFF;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 12px;

            .top & {
              background: #FFB800;
            }
          }

          .hot-content {
            flex: 1;

            .hot-title {
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .hot-stats {
              font-size: 12px;
              color: #909399;

              span {
                margin-right: 15px;

                &.satisfaction-rate {
                  &.high {
                    color: #67C23A;
                  }
                }
              }
            }
          }

          .hot-trend {
            font-size: 12px;
            color: #67C23A;
            display: flex;
            align-items: center;

            &.up {
              color: #67C23A;
            }

            .el-icon {
              margin-right: 2px;
            }
          }
        }
      }

      .optimize-knowledge-list {
        .optimize-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &.critical {
            background: #fef0f0;
            margin: 0 -12px;
            padding: 12px;
            border-radius: 4px;
          }

          &.warning {
            background: #fdf6ec;
            margin: 0 -12px;
            padding: 12px;
            border-radius: 4px;
          }

          .optimize-level {
            margin-right: 12px;
          }

          .optimize-content {
            flex: 1;

            .optimize-title {
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .optimize-reason {
              font-size: 12px;
              color: #E6A23C;
              margin-bottom: 4px;
            }

            .optimize-stats {
              font-size: 12px;
              color: #909399;

              span {
                margin-right: 15px;

                &.negative-feedback {
                  color: #F56C6C;
                }

                &.low-usage {
                  color: #E6A23C;
                }
              }
            }
          }

          .optimize-actions {
            margin-left: 12px;
          }
        }
      }
    }
  }

  .ai-usage-section {
    .ai-function-item {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;

      .function-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        .el-icon {
          font-size: 20px;
          color: white;
        }

        &.assistant {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.analysis {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.marketing {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
      }

      .function-stats {
        flex: 1;

        .function-name {
          font-weight: 500;
          color: #303133;
          margin-bottom: 5px;
        }

        .function-usage {
          font-size: 12px;
          color: #909399;
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>