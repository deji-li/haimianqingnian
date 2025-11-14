<template>
  <div class="dashboard-container">
    <el-card class="welcome-card" v-loading="loading">
      <h2>欢迎使用教育培训CRM管理系统</h2>
      <p>当前登录用户：{{ userStore.userInfo?.realName }} ({{ userStore.userInfo?.roleName }})</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <el-icon class="icon" color="#FFB800"><User /></el-icon>
          <div>
            <p class="label">用户名</p>
            <p class="value">{{ userStore.userInfo?.username }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.departmentName">
          <el-icon class="icon" color="#FF9800"><OfficeBuilding /></el-icon>
          <div>
            <p class="label">所属部门</p>
            <p class="value">{{ userStore.userInfo.departmentName }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.campusName">
          <el-icon class="icon" color="#67C23A"><Location /></el-icon>
          <div>
            <p class="label">所属校区</p>
            <p class="value">{{ userStore.userInfo.campusName }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 本月数据（含环比） -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月新增客户</p>
              <p class="stat-value">{{ comparison.customers.thisMonth }}</p>
              <div class="stat-compare" v-if="comparison.customers.growth !== 0">
                <el-icon v-if="comparison.customers.growth > 0" color="#67c23a"><Top /></el-icon>
                <el-icon v-else color="#f56c6c"><Bottom /></el-icon>
                <span :class="comparison.customers.growth > 0 ? 'increase' : 'decrease'">
                  {{ Math.abs(comparison.customers.growth) }}%
                </span>
                <span class="compare-text">较上月</span>
              </div>
            </div>
            <el-icon class="stat-icon" color="#409EFF"><UserFilled /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月新增订单</p>
              <p class="stat-value">{{ comparison.orders.thisMonth }}</p>
              <div class="stat-compare" v-if="comparison.orders.growth !== 0">
                <el-icon v-if="comparison.orders.growth > 0" color="#67c23a"><Top /></el-icon>
                <el-icon v-else color="#f56c6c"><Bottom /></el-icon>
                <span :class="comparison.orders.growth > 0 ? 'increase' : 'decrease'">
                  {{ Math.abs(comparison.orders.growth) }}%
                </span>
                <span class="compare-text">较上月</span>
              </div>
            </div>
            <el-icon class="stat-icon" color="#FFB800"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月销售额</p>
              <p class="stat-value amount">¥{{ comparison.revenue.thisMonth.toFixed(2) }}</p>
              <div class="stat-compare" v-if="comparison.revenue.growth !== 0">
                <el-icon v-if="comparison.revenue.growth > 0" color="#67c23a"><Top /></el-icon>
                <el-icon v-else color="#f56c6c"><Bottom /></el-icon>
                <span :class="comparison.revenue.growth > 0 ? 'increase' : 'decrease'">
                  {{ Math.abs(comparison.revenue.growth) }}%
                </span>
                <span class="compare-text">较上月</span>
              </div>
            </div>
            <el-icon class="stat-icon" color="#67C23A"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日数据 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日新增客户</p>
              <p class="stat-value">{{ overview.today.newCustomers }}</p>
            </div>
            <el-icon class="stat-icon" color="#909399"><UserFilled /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日新增订单</p>
              <p class="stat-value">{{ overview.today.newOrders }}</p>
            </div>
            <el-icon class="stat-icon" color="#909399"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日销售额</p>
              <p class="stat-value amount">¥{{ overview.today.revenue.toFixed(2) }}</p>
            </div>
            <el-icon class="stat-icon" color="#909399"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 总体数据 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">客户总数</p>
              <p class="stat-value">{{ overview.customer.total }}</p>
            </div>
            <el-icon class="stat-icon" color="#409EFF"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">订单总数</p>
              <p class="stat-value">{{ overview.order.total }}</p>
            </div>
            <el-icon class="stat-icon" color="#FFB800"><Files /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总销售额</p>
              <p class="stat-value amount">¥{{ overview.revenue.total.toFixed(2) }}</p>
            </div>
            <el-icon class="stat-icon" color="#67C23A"><Wallet /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月销售额</p>
              <p class="stat-value amount">¥{{ overview.revenue.thisMonth.toFixed(2) }}</p>
            </div>
            <el-icon class="stat-icon" color="#E6A23C"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">近7天销售额趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">客户意向分布</span>
            </div>
          </template>
          <div ref="intentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单状态 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">订单状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">新老学员占比</span>
            </div>
          </template>
          <div ref="studentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 团队业绩排行 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <span class="title">团队业绩排行（本月）</span>
          <el-button link type="primary" @click="goToTeamStats">
            查看详情
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table :data="teamRanking" stripe v-if="teamRanking.length > 0">
        <el-table-column label="排名" width="80">
          <template #default="{ $index }">
            <el-tag v-if="$index === 0" type="danger" size="large">🥇</el-tag>
            <el-tag v-else-if="$index === 1" type="warning" size="large">🥈</el-tag>
            <el-tag v-else-if="$index === 2" type="success" size="large">🥉</el-tag>
            <span v-else style="font-weight: 600; font-size: 16px;">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesName" label="销售" width="120" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="campusName" label="校区" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="100" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #409EFF;">{{ row.orderCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="销售额" width="150" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #67C23A;">¥{{ row.revenue.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerCount" label="新增客户" width="100" align="right" />
      </el-table>

      <el-empty v-else description="暂无数据" />
    </el-card>

    <!-- 校区业绩对比 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">校区业绩对比（本月）</span>
            </div>
          </template>
          <div ref="campusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">课程销售分析（本月）</span>
            </div>
          </template>
          <div ref="courseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import * as echarts from 'echarts'
import { getDashboardOverview, getWeeklyTrend, getComparisonData, type DashboardOverview, type WeeklyTrend, type ComparisonData } from '@/api/dashboard'
import { Top, Bottom } from '@element-plus/icons-vue'
import { getPendingFollowUps, type Customer } from '@/api/customer'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 存储chart实例和resize处理器，用于清理
const chartInstances: echarts.ECharts[] = []
const resizeHandlers: (() => void)[] = []

// 团队业绩排行数据
interface TeamRanking {
  salesId: number
  salesName: string
  departmentName: string
  campusName: string
  orderCount: number
  revenue: number
  customerCount: number
}
const teamRanking = ref<TeamRanking[]>([])

// 校区业绩数据
interface CampusPerformance {
  campusName: string
  revenue: number
  orderCount: number
}
const campusPerformance = ref<CampusPerformance[]>([])

// 课程销售数据
interface CoursePerformance {
  courseName: string
  revenue: number
  count: number
}
const coursePerformance = ref<CoursePerformance[]>([])

const trendChartRef = ref<HTMLElement>()
const intentChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
const studentChartRef = ref<HTMLElement>()
const campusChartRef = ref<HTMLElement>()
const courseChartRef = ref<HTMLElement>()

const overview = reactive<DashboardOverview>({
  customer: {
    total: 0,
    byIntent: [],
  },
  order: {
    total: 0,
    newStudent: 0,
    oldStudent: 0,
    byStatus: [],
  },
  revenue: {
    total: 0,
    thisMonth: 0,
  },
  today: {
    newCustomers: 0,
    newOrders: 0,
    revenue: 0,
  },
})

const weeklyTrend = ref<WeeklyTrend[]>([])

const comparison = reactive<ComparisonData>({
  customers: {
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
  },
  orders: {
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
  },
  revenue: {
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
  },
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const [overviewData, trendData, comparisonData] = await Promise.all([
      getDashboardOverview(),
      getWeeklyTrend(),
      getComparisonData(),
    ])

    Object.assign(overview, overviewData)
    weeklyTrend.value = trendData
    Object.assign(comparison, comparisonData)

    // TODO: 从后端API获取团队业绩、校区业绩、课程销售数据
    // 暂时使用模拟数据
    fetchTeamRanking()
    fetchCampusPerformance()
    fetchCoursePerformance()

    await nextTick()
    renderTrendChart()
    renderIntentChart()
    renderStatusChart()
    renderStudentChart()
    renderCampusChart()
    renderCourseChart()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// 获取团队业绩排行（模拟数据）
const fetchTeamRanking = async () => {
  // TODO: 调用实际API
  // const data = await getTeamRanking()
  // teamRanking.value = data

  // 模拟数据
  teamRanking.value = [
    { salesId: 1, salesName: '张三', departmentName: '销售一部', campusName: '总部校区', orderCount: 45, revenue: 328000, customerCount: 38 },
    { salesId: 2, salesName: '李四', departmentName: '销售一部', campusName: '分部校区', orderCount: 38, revenue: 295000, customerCount: 32 },
    { salesId: 3, salesName: '王五', departmentName: '销售二部', campusName: '总部校区', orderCount: 35, revenue: 268000, customerCount: 29 },
    { salesId: 4, salesName: '赵六', departmentName: '销售二部', campusName: '分部校区', orderCount: 28, revenue: 215000, customerCount: 25 },
    { salesId: 5, salesName: '钱七', departmentName: '销售一部', campusName: '总部校区', orderCount: 25, revenue: 198000, customerCount: 21 },
  ]
}

// 获取校区业绩数据（模拟数据）
const fetchCampusPerformance = async () => {
  // TODO: 调用实际API
  campusPerformance.value = [
    { campusName: '总部校区', revenue: 856000, orderCount: 128 },
    { campusName: '分部校区', revenue: 642000, orderCount: 95 },
    { campusName: '东区校区', revenue: 478000, orderCount: 72 },
    { campusName: '西区校区', revenue: 325000, orderCount: 51 },
  ]
}

// 获取课程销售数据（模拟数据）
const fetchCoursePerformance = async () => {
  // TODO: 调用实际API
  coursePerformance.value = [
    { courseName: 'Python编程', revenue: 458000, count: 68 },
    { courseName: 'Java开发', revenue: 392000, count: 52 },
    { courseName: '前端开发', revenue: 328000, count: 45 },
    { courseName: '数据分析', revenue: 265000, count: 38 },
    { courseName: 'UI设计', revenue: 198000, count: 29 },
  ]
}

// 渲染销售额趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  const chart = echarts.init(trendChartRef.value)
  const dates = weeklyTrend.value.map((item) => item.date)
  const revenues = weeklyTrend.value.map((item) => item.revenue)

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: '销售额（元）',
    },
    series: [
      {
        data: revenues,
        type: 'line',
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
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染客户意向图
const renderIntentChart = () => {
  if (!intentChartRef.value) return

  const chart = echarts.init(intentChartRef.value)
  const data = overview.customer.byIntent.map((item) => ({
    value: item.count,
    name: item.intent,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        color: ['#67C23A', '#FFB800', '#909399'],
      },
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染订单状态图
const renderStatusChart = () => {
  if (!statusChartRef.value) return

  const chart = echarts.init(statusChartRef.value)
  const data = overview.order.byStatus.map((item) => ({
    value: item.count,
    name: item.status,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        color: ['#FFB800', '#409EFF', '#67C23A', '#F56C6C'],
      },
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染新老学员图
const renderStudentChart = () => {
  if (!studentChartRef.value) return

  const chart = echarts.init(studentChartRef.value)
  const data = [
    { value: overview.order.newStudent, name: '新学员' },
    { value: overview.order.oldStudent, name: '老学员' },
  ]

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        color: ['#67C23A', '#909399'],
      },
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染校区业绩对比图
const renderCampusChart = () => {
  if (!campusChartRef.value) return

  const chart = echarts.init(campusChartRef.value)
  const campusNames = campusPerformance.value.map((item) => item.campusName)
  const revenues = campusPerformance.value.map((item) => item.revenue)
  const orderCounts = campusPerformance.value.map((item) => item.orderCount)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['销售额', '订单数'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: campusNames,
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
        type: 'bar',
        data: revenues,
        itemStyle: {
          color: '#67C23A',
        },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: orderCounts,
        itemStyle: {
          color: '#409EFF',
        },
      },
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 渲染课程销售分析图
const renderCourseChart = () => {
  if (!courseChartRef.value) return

  const chart = echarts.init(courseChartRef.value)
  const courseNames = coursePerformance.value.map((item) => item.courseName)
  const revenues = coursePerformance.value.map((item) => item.revenue)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const item = params[0]
        const course = coursePerformance.value[item.dataIndex]
        return `${item.name}<br/>销售额: ¥${item.value.toLocaleString()}<br/>销量: ${course.count} 份`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: courseNames,
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '销售额（元）',
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: revenues,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FFB800' },
            { offset: 1, color: '#FFC940' },
          ]),
        },
        barWidth: '60%',
      },
    ],
  }

  chart.setOption(option)
  chartInstances.push(chart)
  const resizeHandler = () => chart.resize()
  window.addEventListener('resize', resizeHandler)
  resizeHandlers.push(resizeHandler)
}

// 跳转到团队统计
const goToTeamStats = () => {
  router.push({ name: 'TeamStats' })
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  // 清理所有chart实例
  chartInstances.forEach(chart => chart.dispose())
  // 移除所有resize监听器
  resizeHandlers.forEach(handler => window.removeEventListener('resize', handler))
})
</script>

<style scoped lang="scss">
.dashboard-container {
  // 响应式图表容器
  .chart-container {
    width: 100%;
    height: 300px;
  }

  .welcome-card {
    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      font-size: 14px;
      color: #606266;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 32px;
        }

        .label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .value {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;

      .stat-icon {
        font-size: 48px;
        opacity: 0.3;
      }

      .stat-info {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;

          &.amount {
            color: #67C23A;
          }
        }

        .stat-compare {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 14px;

          .increase {
            color: #67c23a;
            font-weight: 500;
          }

          .decrease {
            color: #f56c6c;
            font-weight: 500;
          }

          .compare-text {
            color: #909399;
            font-size: 12px;
            margin-left: 4px;
          }
        }
      }
    }
  }

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

  .overdue {
    color: #F56C6C;
    font-weight: 500;
  }

  // ==================== 响应式设计 ====================

  // 平板设备 (768px - 1024px)
  @media (max-width: 1024px) {
    .welcome-card {
      h2 {
        font-size: 20px;
      }

      .info-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
    }

    .chart-container {
      height: 280px;
    }

    .stat-card .stat-content {
      .stat-icon {
        font-size: 40px;
      }

      .stat-info .stat-value {
        font-size: 22px;
      }
    }
  }

  // 移动设备 (< 768px)
  @media (max-width: 768px) {
    .welcome-card {
      h2 {
        font-size: 18px;
      }

      p {
        font-size: 13px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;

        .info-item {
          .icon {
            font-size: 28px;
          }

          .label {
            font-size: 11px;
          }

          .value {
            font-size: 14px;
          }
        }
      }
    }

    .chart-container {
      height: 250px;
    }

    .stat-card {
      margin-bottom: 12px;

      .stat-content {
        .stat-icon {
          font-size: 36px;
        }

        .stat-info {
          .stat-label {
            font-size: 13px;
          }

          .stat-value {
            font-size: 20px;

            &.amount {
              font-size: 18px;
            }
          }

          .stat-compare {
            font-size: 12px;

            .compare-text {
              font-size: 11px;
            }
          }
        }
      }
    }

    .card-header .title {
      font-size: 14px;
    }

    // 表格优化：隐藏部分列
    :deep(.el-table) {
      font-size: 13px;

      .el-table-column--selection,
      .el-table__header th:nth-child(3),
      .el-table__body td:nth-child(3),
      .el-table__header th:nth-child(4),
      .el-table__body td:nth-child(4) {
        display: none; // 隐藏部门和校区列
      }
    }
  }

  // 小屏手机 (< 480px)
  @media (max-width: 480px) {
    .welcome-card {
      h2 {
        font-size: 16px;
      }

      p {
        font-size: 12px;
      }

      .info-grid {
        gap: 10px;

        .info-item {
          .icon {
            font-size: 24px;
          }

          .label {
            font-size: 10px;
          }

          .value {
            font-size: 13px;
          }
        }
      }
    }

    .chart-container {
      height: 220px;
    }

    .stat-card {
      .stat-content {
        padding: 4px 0;

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          .stat-label {
            font-size: 12px;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 18px;

            &.amount {
              font-size: 16px;
            }
          }

          .stat-compare {
            font-size: 11px;
            margin-top: 4px;

            .compare-text {
              font-size: 10px;
            }
          }
        }
      }
    }

    .card-header {
      .title {
        font-size: 13px;
      }

      :deep(.el-button) {
        font-size: 12px;
      }
    }

    // 表格进一步简化
    :deep(.el-table) {
      font-size: 12px;

      .el-table__header th:nth-child(5),
      .el-table__body td:nth-child(5) {
        display: none; // 还隐藏订单数列
      }
    }
  }
}
</style>
