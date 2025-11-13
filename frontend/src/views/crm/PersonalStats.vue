<template>
  <div class="personal-stats-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>我的CRM统计</h2>
          <p class="subtitle">实时查看您的客户、订单和业绩数据</p>
        </div>
        <el-button type="primary" @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="总客户数" :value="statsData?.summary.totalCustomers || 0">
            <template #prefix>
              <el-icon color="#409EFF"><User /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-extra">
            本月新增: {{ statsData?.summary.thisMonthCustomers || 0 }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="总订单数" :value="statsData?.summary.totalOrders || 0">
            <template #prefix>
              <el-icon color="#67C23A"><Document /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-extra">
            本月订单: {{ statsData?.summary.thisMonthOrders || 0 }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="总营收（元）"
            :value="statsData?.summary.totalRevenue || 0"
            :precision="2"
          >
            <template #prefix>
              <el-icon color="#E6A23C"><Money /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-extra">
            本月营收: ¥{{ (statsData?.summary.thisMonthRevenue || 0).toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="转化率"
            :value="statsData?.summary.conversionRate || 0"
            suffix="%"
            :precision="1"
          >
            <template #prefix>
              <el-icon color="#F56C6C"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-extra">
            平均订单金额: ¥{{ (statsData?.summary.avgOrderAmount || 0).toFixed(2) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 客户阶段分布和来源分布 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>客户阶段分布</span>
            </div>
          </template>
          <div ref="stageChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>客户来源分布</span>
            </div>
          </template>
          <div ref="sourceChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近30天转化趋势 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近30天转化趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI使用统计 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI工具使用统计</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-statistic title="聊天分析次数" :value="statsData?.aiUsage.analysisCount || 0">
                <template #prefix>
                  <el-icon color="#409EFF"><ChatDotRound /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="12">
              <el-statistic title="AI陪练次数" :value="statsData?.aiUsage.trainingCount || 0">
                <template #prefix>
                  <el-icon color="#E6A23C"><MagicStick /></el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  User,
  Document,
  Money,
  TrendCharts,
  ChatDotRound,
  MagicStick,
} from '@element-plus/icons-vue'
import { getPersonalStats, type PersonalStatsData } from '@/api/analytics'
import * as echarts from 'echarts'

const loading = ref(false)
const statsData = ref<PersonalStatsData | null>(null)

const stageChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

let stageChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPersonalStats()
    statsData.value = res.data

    await nextTick()
    initCharts()
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  initStageChart()
  initSourceChart()
  initTrendChart()
}

const initStageChart = () => {
  if (!stageChartRef.value || !statsData.value) return

  if (stageChart) {
    stageChart.dispose()
  }

  stageChart = echarts.init(stageChartRef.value)

  const stageStats = statsData.value.stageStats
  const data = [
    { name: '线索', value: stageStats.线索 },
    { name: '意向客户', value: stageStats.意向客户 },
    { name: '商机', value: stageStats.商机 },
    { name: '成交客户', value: stageStats.成交客户 },
    { name: '复购客户', value: stageStats.复购客户 },
  ].filter((item) => item.value > 0)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '客户阶段',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data,
      },
    ],
  }

  stageChart.setOption(option)
}

const initSourceChart = () => {
  if (!sourceChartRef.value || !statsData.value) return

  if (sourceChart) {
    sourceChart.dispose()
  }

  sourceChart = echarts.init(sourceChartRef.value)

  const sourceData = statsData.value.sourceDistribution.map((item) => ({
    name: item.source,
    value: item.count,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '客户来源',
        type: 'pie',
        radius: '65%',
        center: ['60%', '50%'],
        data: sourceData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  sourceChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value || !statsData.value) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const trendData = statsData.value.conversionTrend
  const dates = trendData.map((item) => item.date)
  const newCustomers = trendData.map((item) => item.newCustomers)
  const converted = trendData.map((item) => item.converted)
  const rates = trendData.map((item) => item.conversionRate.toFixed(1))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['新增客户', '成交客户', '转化率'],
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '客户数',
        position: 'left',
      },
      {
        type: 'value',
        name: '转化率(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '新增客户',
        type: 'bar',
        data: newCustomers,
        itemStyle: {
          color: '#409EFF',
        },
      },
      {
        name: '成交客户',
        type: 'bar',
        data: converted,
        itemStyle: {
          color: '#67C23A',
        },
      },
      {
        name: '转化率',
        type: 'line',
        yAxisIndex: 1,
        data: rates,
        itemStyle: {
          color: '#E6A23C',
        },
        smooth: true,
      },
    ],
  }

  trendChart.setOption(option)
}

// 响应式处理函数
const handleResize = () => {
  stageChart?.resize()
  sourceChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stageChart?.dispose()
  sourceChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="scss">
.personal-stats-container {
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
      }
    }
  }

  .stat-card {
    margin-bottom: 20px;

    .stat-extra {
      margin-top: 12px;
      font-size: 14px;
      color: #606266;
    }
  }

  .chart-row {
    margin-top: 20px;
  }

  .card-header {
    font-weight: 500;
    font-size: 16px;
  }
}
</style>
