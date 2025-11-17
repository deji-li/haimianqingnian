<template>
  <div class="knowledge-statistics-container">
    <!-- Page Header -->
    <div class="page-header">
      <h2>使用统计看板</h2>
      <el-text type="info">全面掌握知识库使用情况和质量指标</el-text>
    </div>

    <!-- Overview Statistics -->
    <el-card shadow="never" class="overview-card">
      <template #header>
        <div class="card-header">
          <span>总体概览</span>
          <el-button :icon="Refresh" @click="loadAllData" :loading="loading">
            刷新
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <el-statistic title="总知识数" :value="overview.totalKnowledge">
              <template #suffix>
                <el-text type="info">条</el-text>
              </template>
            </el-statistic>
            <el-progress
              :percentage="100"
              :show-text="false"
              :stroke-width="3"
              color="#409EFF"
            />
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-item">
            <el-statistic title="总使用次数" :value="overview.totalUsage">
              <template #suffix>
                <el-text type="success">次</el-text>
              </template>
            </el-statistic>
            <el-progress
              :percentage="100"
              :show-text="false"
              :stroke-width="3"
              color="#67C23A"
            />
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-item">
            <el-statistic title="平均使用率" :value="overview.avgUsageRate" suffix="%">
              <template #suffix>
                <el-text type="warning">%</el-text>
              </template>
            </el-statistic>
            <el-progress
              :percentage="overview.avgUsageRate"
              :show-text="false"
              :stroke-width="3"
              color="#E6A23C"
            />
          </div>
        </el-col>

        <el-col :span="6">
          <div class="stat-item">
            <el-statistic title="负反馈率" :value="overview.negativeFeedbackRate" suffix="%">
              <template #suffix>
                <el-text :type="overview.negativeFeedbackRate > 10 ? 'danger' : 'success'">
                  %
                </el-text>
              </template>
            </el-statistic>
            <el-progress
              :percentage="overview.negativeFeedbackRate"
              :show-text="false"
              :stroke-width="3"
              :color="overview.negativeFeedbackRate > 10 ? '#F56C6C' : '#67C23A'"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Charts Row -->
    <el-row :gutter="20">
      <!-- Hot Knowledge Ranking -->
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门知识排行</span>
              <el-select
                v-model="hotKnowledgeLimit"
                size="small"
                style="width: 100px"
                @change="loadHotKnowledge"
              >
                <el-option label="Top 10" :value="10" />
                <el-option label="Top 20" :value="20" />
                <el-option label="Top 50" :value="50" />
              </el-select>
            </div>
          </template>

          <el-table
            v-loading="loadingHot"
            :data="hotKnowledgeList"
            stripe
            max-height="400"
          >
            <el-table-column type="index" label="排名" width="70">
              <template #default="{ $index }">
                <el-tag
                  v-if="$index < 3"
                  :type="getRankType($index)"
                  size="small"
                  round
                >
                  {{ $index + 1 }}
                </el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="title" label="标题" show-overflow-tooltip />

            <el-table-column prop="sceneCategory" label="场景" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.sceneCategory }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="usageCount" label="使用次数" width="100" sortable>
              <template #default="{ row }">
                <el-text type="success" size="large" tag="b">
                  {{ row.usageCount }}
                </el-text>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Category Distribution -->
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>场景分类分布</span>
          </template>

          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- More Charts Row -->
    <el-row :gutter="20">
      <!-- Usage Trend -->
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>使用趋势</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadUsageTrend">
                <el-radio-button label="7days">最近7天</el-radio-button>
                <el-radio-button label="30days">最近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- Quality Metrics -->
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>知识质量分析</span>
          </template>

          <div ref="qualityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Source Type Distribution -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>知识来源分布</span>
          </template>

          <div class="source-stats">
            <el-row :gutter="20">
              <el-col :span="6" v-for="source in sourceDistribution" :key="source.type">
                <div class="source-item">
                  <div class="source-header">
                    <el-icon :size="24" :color="source.color">
                      <component :is="source.icon" />
                    </el-icon>
                    <span class="source-name">{{ source.name }}</span>
                  </div>
                  <div class="source-count">{{ source.count }}</div>
                  <el-progress
                    :percentage="source.percentage"
                    :color="source.color"
                    :stroke-width="8"
                  />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Document, MagicStick, Upload, Edit } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getOverview,
  getGlobalUsageStats,
  getHotKnowledge,
  getCategories,
  type KnowledgeBase
} from '@/api/knowledge'

// Loading states
const loading = ref(false)
const loadingHot = ref(false)

// Overview data
const overview = reactive({
  totalKnowledge: 0,
  totalUsage: 0,
  avgUsageRate: 0,
  negativeFeedbackRate: 0
})

// Hot knowledge
const hotKnowledgeLimit = ref(10)
const hotKnowledgeList = ref<KnowledgeBase[]>([])

// Chart refs
const categoryChartRef = ref<HTMLDivElement>()
const trendChartRef = ref<HTMLDivElement>()
const qualityChartRef = ref<HTMLDivElement>()

// Chart instances
let categoryChart: ECharts | null = null
let trendChart: ECharts | null = null
let qualityChart: ECharts | null = null

// Trend period
const trendPeriod = ref('7days')

// Source distribution
const sourceDistribution = ref([
  { type: 'manual', name: '手动创建', count: 0, percentage: 0, color: '#409EFF', icon: Edit },
  { type: 'ai_mining', name: 'AI挖掘', count: 0, percentage: 0, color: '#67C23A', icon: MagicStick },
  { type: 'industry_import', name: '行业导入', count: 0, percentage: 0, color: '#E6A23C', icon: Document },
  { type: 'batch_import', name: '批量导入', count: 0, percentage: 0, color: '#909399', icon: Upload }
])

// Load overview
const loadOverview = async () => {
  try {
    const res = await getOverview()
    if (res.data) {
      overview.totalKnowledge = res.data.totalKnowledge || 0
      overview.totalUsage = res.data.totalUsage || 0
      overview.avgUsageRate = res.data.avgUsageRate || 0
      overview.negativeFeedbackRate = res.data.negativeFeedbackRate || 0

      // Update source distribution
      if (res.data.sourceDistribution) {
        sourceDistribution.value.forEach(source => {
          const found = res.data.sourceDistribution.find((s: any) => s.type === source.type)
          if (found) {
            source.count = found.count
            source.percentage = found.percentage
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to load overview:', error)
  }
}

// Load global usage stats
const loadGlobalUsageStats = async () => {
  try {
    const res = await getGlobalUsageStats()
    if (res.data) {
      // Update category chart
      updateCategoryChart(res.data.categoryDistribution || [])
      // Update quality chart
      updateQualityChart(res.data.qualityMetrics || {})
    }
  } catch (error) {
    console.error('Failed to load global usage stats:', error)
  }
}

// Load hot knowledge
const loadHotKnowledge = async () => {
  loadingHot.value = true
  try {
    const res = await getHotKnowledge()
    hotKnowledgeList.value = (res.data || []).slice(0, hotKnowledgeLimit.value)
  } catch (error) {
    ElMessage.error('加载热门知识失败')
  } finally {
    loadingHot.value = false
  }
}

// Load usage trend
const loadUsageTrend = async () => {
  // Mock data - in real app, this would come from API
  const days = trendPeriod.value === '7days' ? 7 : 30
  const dates = []
  const values = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    values.push(Math.floor(Math.random() * 100) + 50)
  }

  updateTrendChart(dates, values)
}

// Update category chart
const updateCategoryChart = (data: any[]) => {
  if (!categoryChart || !data || data.length === 0) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.map((item: any) => ({
          name: item.category,
          value: item.count
        }))
      }
    ]
  }

  categoryChart.setOption(option)
}

// Update trend chart
const updateTrendChart = (dates: string[], values: number[]) => {
  if (!trendChart) return

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '使用次数'
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#409EFF',
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// Update quality chart
const updateQualityChart = (metrics: any) => {
  if (!qualityChart) return

  const data = [
    { name: '优质知识 (>80分)', value: metrics.excellent || 0, color: '#67C23A' },
    { name: '良好知识 (60-80分)', value: metrics.good || 0, color: '#409EFF' },
    { name: '待优化 (<60分)', value: metrics.needImprovement || 0, color: '#E6A23C' },
    { name: '高负反馈', value: metrics.highNegative || 0, color: '#F56C6C' }
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
          itemStyle: { color: item.color }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        }
      }
    ]
  }

  qualityChart.setOption(option)
}

// Initialize charts
const initCharts = async () => {
  await nextTick()

  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }

  if (qualityChartRef.value) {
    qualityChart = echarts.init(qualityChartRef.value)
  }

  // Handle window resize
  window.addEventListener('resize', handleResize)
}

// Handle resize
const handleResize = () => {
  categoryChart?.resize()
  trendChart?.resize()
  qualityChart?.resize()
}

// Load all data
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadOverview(),
      loadGlobalUsageStats(),
      loadHotKnowledge(),
      loadUsageTrend()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// Get rank type
const getRankType = (index: number) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
}

// Lifecycle
onMounted(async () => {
  await initCharts()
  await loadAllData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  categoryChart?.dispose()
  trendChart?.dispose()
  qualityChart?.dispose()
})
</script>

<style scoped lang="scss">
.knowledge-statistics-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      color: #303133;
    }
  }

  .overview-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-item {
      text-align: center;

      :deep(.el-statistic__head) {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      :deep(.el-statistic__content) {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .el-progress {
        margin-top: 10px;
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      width: 100%;
      height: 400px;
    }
  }

  .source-stats {
    .source-item {
      padding: 20px;
      border: 1px solid #EBEEF5;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
      }

      .source-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 15px;

        .source-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }

      .source-count {
        font-size: 32px;
        font-weight: 600;
        color: #409EFF;
        margin-bottom: 15px;
      }
    }
  }
}
</style>
