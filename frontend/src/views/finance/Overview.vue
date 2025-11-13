<template>
  <div class="finance-overview-container">
    <!-- 日期筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="统计时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="fetchAllData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAllData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 财务概览卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总销售额</div>
            <div class="stat-value amount">¥{{ overview.totalRevenue.toFixed(2) }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#67C23A"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">订单总数</div>
            <div class="stat-value">{{ overview.totalOrders }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#FFB800"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">退款金额</div>
            <div class="stat-value refund">¥{{ overview.refundAmount.toFixed(2) }}</div>
            <div class="stat-sub">退款订单：{{ overview.refundCount }} 笔</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#F56C6C"><RefreshLeft /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">平均客单价</div>
            <div class="stat-value">¥{{ overview.avgOrderAmount.toFixed(2) }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#409EFF"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售额趋势图 -->
    <el-card shadow="never" class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="title">销售额趋势</span>
          <el-radio-group v-model="trendType" @change="fetchRevenueTrend">
            <el-radio-button value="day">按日</el-radio-button>
            <el-radio-button value="month">按月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" style="width: 100%; height: 400px"></div>
    </el-card>

    <!-- 图表行 -->
    <el-row :gutter="16" class="chart-row">
      <!-- 销售排行榜 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">销售排行榜（Top 10）</span>
            </div>
          </template>
          <div ref="salesChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>

      <!-- 校区销售额分布 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">校区销售额分布</span>
            </div>
          </template>
          <div ref="campusChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程销售额统计 -->
    <el-card shadow="never" class="course-card">
      <template #header>
        <div class="card-header">
          <span class="title">课程销售额统计（Top 10）</span>
        </div>
      </template>
      <el-table :data="courseRevenue" stripe>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="revenue" label="总销售额" width="150">
          <template #default="{ row }">
            <span class="amount">¥{{ row.revenue.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="120" />
        <el-table-column label="平均单价" width="150">
          <template #default="{ row }">
            ¥{{ (row.revenue / row.orderCount).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  getFinanceOverview,
  getRevenueTrend,
  getSalesRanking,
  getCampusRevenue,
  getCourseRevenue,
  type FinanceOverview,
  type RevenueTrend,
  type SalesRanking,
  type CampusRevenue,
  type CourseRevenue,
} from '@/api/finance'

const dateRange = ref<string[]>([])
const trendType = ref<'day' | 'month'>('day')

const trendChartRef = ref<HTMLElement>()
const salesChartRef = ref<HTMLElement>()
const campusChartRef = ref<HTMLElement>()

// 存储chart实例用于清理
let trendChart: echarts.ECharts | null = null
let salesChart: echarts.ECharts | null = null
let campusChart: echarts.ECharts | null = null
const resizeHandlers: (() => void)[] = []

const overview = reactive<FinanceOverview>({
  totalRevenue: 0,
  totalOrders: 0,
  refundCount: 0,
  refundAmount: 0,
  newStudentRevenue: 0,
  oldStudentRevenue: 0,
  avgOrderAmount: 0,
})

const revenueTrend = ref<RevenueTrend[]>([])
const salesRanking = ref<SalesRanking[]>([])
const campusRevenue = ref<CampusRevenue[]>([])
const courseRevenue = ref<CourseRevenue[]>([])

// 获取所有数据
const fetchAllData = async () => {
  const startDate = dateRange.value?.[0]
  const endDate = dateRange.value?.[1]

  await Promise.all([
    fetchOverview(startDate, endDate),
    fetchRevenueTrend(),
    fetchSalesRanking(startDate, endDate),
    fetchCampusRevenue(startDate, endDate),
    fetchCourseRevenue(startDate, endDate),
  ])
}

// 获取财务概览
const fetchOverview = async (startDate?: string, endDate?: string) => {
  try {
    const data = await getFinanceOverview(startDate, endDate)
    Object.assign(overview, data)
  } catch (error) {
    console.error('Failed to fetch overview:', error)
  }
}

// 获取销售额趋势
const fetchRevenueTrend = async () => {
  try {
    const startDate = dateRange.value?.[0]
    const endDate = dateRange.value?.[1]
    revenueTrend.value = await getRevenueTrend(trendType.value, startDate, endDate)

    await nextTick()
    renderTrendChart()
  } catch (error) {
    console.error('Failed to fetch revenue trend:', error)
  }
}

// 获取销售排行
const fetchSalesRanking = async (startDate?: string, endDate?: string) => {
  try {
    salesRanking.value = await getSalesRanking(startDate, endDate)

    await nextTick()
    renderSalesChart()
  } catch (error) {
    console.error('Failed to fetch sales ranking:', error)
  }
}

// 获取校区销售额
const fetchCampusRevenue = async (startDate?: string, endDate?: string) => {
  try {
    campusRevenue.value = await getCampusRevenue(startDate, endDate)

    await nextTick()
    renderCampusChart()
  } catch (error) {
    console.error('Failed to fetch campus revenue:', error)
  }
}

// 获取课程销售额
const fetchCourseRevenue = async (startDate?: string, endDate?: string) => {
  try {
    courseRevenue.value = await getCourseRevenue(startDate, endDate)
  } catch (error) {
    console.error('Failed to fetch course revenue:', error)
  }
}

// 渲染销售额趋势图表
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const dates = revenueTrend.value.map((item) => item.date)
  const revenues = revenueTrend.value.map((item) => item.revenue)
  const counts = revenueTrend.value.map((item) => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['销售额', '订单数'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额（元）',
        position: 'left',
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: revenues,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 184, 0, 0.3)' },
            { offset: 1, color: 'rgba(255, 184, 0, 0.05)' },
          ]),
        },
        itemStyle: {
          color: '#FFB800',
        },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: counts,
        smooth: true,
        itemStyle: {
          color: '#409EFF',
        },
      },
    ],
  }

  trendChart.setOption(option)

  const resizeHandler = () => trendChart?.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染销售排行图表
const renderSalesChart = () => {
  if (!salesChartRef.value) return

  salesChart = echarts.init(salesChartRef.value)
  const names = salesRanking.value.map((item) => item.salesName)
  const revenues = salesRanking.value.map((item) => item.totalRevenue)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '销售额（元）',
    },
    yAxis: {
      type: 'category',
      data: names.reverse(),
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: revenues.reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#FFB800' },
            { offset: 1, color: '#FFE066' },
          ]),
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => `¥${params.value.toFixed(2)}`,
        },
      },
    ],
  }

  salesChart.setOption(option)

  const resizeHandler = () => salesChart?.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染校区销售额图表
const renderCampusChart = () => {
  if (!campusChartRef.value) return

  campusChart = echarts.init(campusChartRef.value)
  const data = campusRevenue.value.map((item) => ({
    value: item.revenue,
    name: item.campusName,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '校区销售额',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        color: ['#FFB800', '#67C23A', '#409EFF', '#F56C6C', '#909399'],
      },
    ],
  }

  campusChart.setOption(option)

  const resizeHandler = () => campusChart?.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

onMounted(() => {
  // 默认显示本月数据
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
  const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD')
  dateRange.value = [startOfMonth, endOfMonth]

  fetchAllData()
})

onUnmounted(() => {
  // 清理所有resize监听器
  resizeHandlers.forEach(handler => window.removeEventListener('resize', handler))
  // 清理chart实例
  trendChart?.dispose()
  salesChart?.dispose()
  campusChart?.dispose()
})
</script>

<style scoped lang="scss">
.finance-overview-container {
  .filter-card {
    margin-bottom: 16px;
  }

  .stat-cards {
    margin-bottom: 16px;

    .stat-card {
      position: relative;
      overflow: hidden;

      :deep(.el-card__body) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
      }

      .stat-content {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;

          &.amount {
            color: #67C23A;
          }

          &.refund {
            color: #F56C6C;
          }
        }

        .stat-sub {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }

      .stat-icon {
        opacity: 0.2;
      }
    }
  }

  .chart-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;

    .card-header {
      .title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .course-card {
    .card-header {
      .title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .amount {
    color: #67C23A;
    font-weight: 500;
  }
}
</style>
