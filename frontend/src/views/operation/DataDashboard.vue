<template>
  <div class="data-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>运营数据看板</h2>
        <p class="page-desc">实时监控运营数据表现</p>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="margin-right: 10px"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon views">
                <el-icon><View /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ formatNumber(metrics.totalViews) }}</div>
                <div class="metric-label">总浏览量</div>
                <div class="metric-change" :class="metrics.viewsGrowth >= 0 ? 'positive' : 'negative'">
                  {{ formatGrowth(metrics.viewsGrowth) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon plays">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ formatNumber(metrics.totalPlays) }}</div>
                <div class="metric-label">总播放量</div>
                <div class="metric-change" :class="metrics.playsGrowth >= 0 ? 'positive' : 'negative'">
                  {{ formatGrowth(metrics.playsGrowth) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon customers">
                <el-icon><User /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.totalCustomers }}</div>
                <div class="metric-label">引流客户数</div>
                <div class="metric-change" :class="metrics.customersGrowth >= 0 ? 'positive' : 'negative'">
                  {{ formatGrowth(metrics.customersGrowth) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon commission">
                <el-icon><Money /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">¥{{ formatMoney(metrics.totalCommission) }}</div>
                <div class="metric-label">总提成金额</div>
                <div class="metric-change" :class="metrics.commissionGrowth >= 0 ? 'positive' : 'negative'">
                  {{ formatGrowth(metrics.commissionGrowth) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 趋势图 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>数据趋势</span>
              <el-radio-group v-model="trendType" size="small" @change="updateTrendChart">
                <el-radio-button label="views">浏览量</el-radio-button>
                <el-radio-button label="plays">播放量</el-radio-button>
                <el-radio-button label="customers">客户数</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 平台分布 -->
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <span>平台分布</span>
          </template>
          <div ref="platformChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 运营人员排行 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>运营人员业绩排行</span>
              <el-select v-model="rankType" size="small" style="width: 120px" @change="updateRankChart">
                <el-option label="引流客户" value="customers" />
                <el-option label="提成金额" value="commission" />
                <el-option label="转化率" value="conversion" />
              </el-select>
            </div>
          </template>
          <div ref="rankChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 转化漏斗 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>转化漏斗分析</span>
          </template>
          <div ref="funnelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账号表现表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>账号表现详情</span>
          <el-button link type="primary" @click="viewAllAccounts">查看全部</el-button>
        </div>
      </template>
      <el-table :data="topAccounts" style="width: 100%">
        <el-table-column prop="platformType" label="平台" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformTagType(row.platformType)" size="small">
              {{ row.platformType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号名称" min-width="200" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />
        <el-table-column prop="fansCount" label="粉丝数" width="120" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.fansCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="avgViews" label="平均浏览" width="120" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.avgViews) }}
          </template>
        </el-table-column>
        <el-table-column prop="engagementRate" label="互动率" width="100" sortable>
          <template #default="{ row }">
            {{ row.engagementRate ? `${row.engagementRate}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="customerCount" label="引流客户" width="100" sortable />
        <el-table-column prop="conversionRate" label="转化率" width="100" sortable>
          <template #default="{ row }">
            <span :class="getConversionClass(row.conversionRate)">
              {{ row.conversionRate ? `${row.conversionRate}%` : '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, View, VideoPlay, User, Money } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { operationApi } from '@/api/operation'
import dayjs from 'dayjs'
import ChartContainer from './components/ChartContainer.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const dateRange = ref<[string, string]>([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])
const trendType = ref('views')
const rankType = ref('customers')
const topAccounts = ref<any[]>([])

// 核心指标
const metrics = reactive({
  totalViews: 0,
  totalPlays: 0,
  totalCustomers: 0,
  totalCommission: 0,
  viewsGrowth: 0,
  playsGrowth: 0,
  customersGrowth: 0,
  commissionGrowth: 0
})

// 图表实例
let trendChart: echarts.ECharts | null = null
let platformChart: echarts.ECharts | null = null
let rankChart: echarts.ECharts | null = null
let funnelChart: echarts.ECharts | null = null

// 图表DOM引用
const trendChartRef = ref<HTMLElement>()
const platformChartRef = ref<HTMLElement>()
const rankChartRef = ref<HTMLElement>()
const funnelChartRef = ref<HTMLElement>()

// 获取核心指标数据
const fetchMetrics = async () => {
  try {
    const response = await operationApi.getPerformanceMetrics({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    Object.assign(metrics, response)
  } catch (error) {
    console.error('获取指标数据失败:', error)
  }
}

// 获取平台对比数据
const fetchPlatformData = async () => {
  try {
    const response = await operationApi.getPlatformComparison({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    updatePlatformChart(response)
  } catch (error) {
    console.error('获取平台数据失败:', error)
  }
}

// 获取转化漏斗数据
const fetchFunnelData = async () => {
  try {
    const response = await operationApi.getConversionFunnel({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    updateFunnelChart(response)
  } catch (error) {
    console.error('获取漏斗数据失败:', error)
  }
}

// 获取账号表现数据
const fetchAccountData = async () => {
  try {
    const response = await operationApi.getAccountList({
      page: 1,
      pageSize: 10,
      sortBy: 'performance'
    })
    topAccounts.value = response.list
  } catch (error) {
    console.error('获取账号数据失败:', error)
  }
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

// 更新趋势图
const updateTrendChart = async () => {
  if (!trendChart) return

  // 生成模拟数据
  const dates = Array.from({ length: 30 }, (_, i) => {
    return dayjs().subtract(29 - i, 'day').format('MM-DD')
  })

  const dataMap: Record<string, number[]> = {
    views: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 5000),
    plays: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8000) + 3000),
    customers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: trendType.value === 'views' ? '浏览量' : trendType.value === 'plays' ? '播放量' : '客户数',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: dataMap[trendType.value]
    }]
  }

  trendChart.setOption(option)
}

// 初始化平台分布图
const initPlatformChart = () => {
  if (!platformChartRef.value) return
  platformChart = echarts.init(platformChartRef.value)
  fetchPlatformData()
}

// 更新平台分布图
const updatePlatformChart = (data: any) => {
  if (!platformChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '平台分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '小红书' },
        { value: 735, name: '抖音' },
        { value: 580, name: '视频号' }
      ]
    }]
  }

  platformChart.setOption(option)
}

// 初始化排行图
const initRankChart = () => {
  if (!rankChartRef.value) return
  rankChart = echarts.init(rankChartRef.value)
  updateRankChart()
}

// 更新排行图
const updateRankChart = () => {
  if (!rankChart) return

  const data = Array.from({ length: 10 }, (_, i) => ({
    name: `运营${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20
  })).sort((a, b) => b.value - a.value)

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
    series: [{
      name: rankType.value === 'customers' ? '引流客户' : rankType.value === 'commission' ? '提成金额' : '转化率',
      type: 'bar',
      data: data.map(item => item.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  }

  rankChart.setOption(option)
}

// 初始化转化漏斗图
const initFunnelChart = () => {
  if (!funnelChartRef.value) return
  funnelChart = echarts.init(funnelChartRef.value)
  fetchFunnelData()
}

// 更新转化漏斗图
const updateFunnelChart = (data: any) => {
  if (!funnelChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}'
    },
    legend: {
      data: ['浏览', '咨询', '试听', '成交']
    },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: 1000, name: '浏览' },
        { value: 500, name: '咨询' },
        { value: 200, name: '试听' },
        { value: 80, name: '成交' }
      ]
    }]
  }

  funnelChart.setOption(option)
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchMetrics(),
      fetchPlatformData(),
      fetchFunnelData(),
      fetchAccountData()
    ])
    updateTrendChart()
    updateRankChart()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 日期变化
const handleDateChange = () => {
  refreshData()
}

// 查看全部账号
const viewAllAccounts = () => {
  router.push('/operation/accounts')
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  trendChart?.resize()
  platformChart?.resize()
  rankChart?.resize()
  funnelChart?.resize()
}

// 辅助函数
const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatGrowth = (growth: number) => {
  if (!growth) return '0%'
  const prefix = growth >= 0 ? '+' : ''
  return `${prefix}${growth.toFixed(1)}%`
}

const getPlatformTagType = (platform: string) => {
  const typeMap: Record<string, string> = {
    '小红书': 'danger',
    '抖音': 'primary',
    '视频号': 'success'
  }
  return typeMap[platform] || 'info'
}

const getConversionClass = (rate: number) => {
  if (!rate) return ''
  if (rate >= 10) return 'high-conversion'
  if (rate >= 5) return 'medium-conversion'
  return 'low-conversion'
}

// 初始化
onMounted(async () => {
  await nextTick()
  refreshData()
  initTrendChart()
  initPlatformChart()
  initRankChart()
  initFunnelChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  platformChart?.dispose()
  rankChart?.dispose()
  funnelChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.page-desc {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.metrics-cards {
  margin-bottom: 20px;
}

.metric-card {
  height: 120px;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 30px;
  color: white;
}

.metric-icon.views {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-icon.plays {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-icon.customers {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-icon.commission {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.metric-change {
  font-size: 12px;
  margin-top: 5px;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card,
.table-card {
  height: 400px;
}

.chart-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  padding: 20px;
}

.table-card {
  height: auto;
}

.table-card :deep(.el-card__body) {
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.high-conversion {
  color: #67c23a;
  font-weight: bold;
}

.medium-conversion {
  color: #e6a23c;
}

.low-conversion {
  color: #f56c6c;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}
</style>