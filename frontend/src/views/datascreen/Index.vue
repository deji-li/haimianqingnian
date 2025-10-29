<template>
  <div class="datascreen-container">
    <!-- 头部 -->
    <div class="datascreen-header">
      <div class="header-left">
        <div class="logo"></div>
      </div>
      <div class="header-center">
        <h1 class="title">海绵青年销售数据大屏</h1>
        <div class="subtitle">实时数据监控与分析</div>
      </div>
      <div class="header-right">
        <div class="datetime">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="datascreen-content">
      <!-- 左侧 -->
      <div class="content-left">
        <!-- 今日数据 -->
        <div class="panel today-panel">
          <div class="panel-header">
            <span class="panel-title">今日数据</span>
          </div>
          <div class="panel-body">
            <div class="stat-item">
              <div class="stat-label">新增客户</div>
              <div class="stat-value">{{ overview.today.newCustomers }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">新增订单</div>
              <div class="stat-value">{{ overview.today.newOrders }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">今日销售额</div>
              <div class="stat-value amount">¥{{ overview.today.revenue.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 客户意向分布 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">客户意向分布</span>
          </div>
          <div class="panel-body chart-container">
            <div ref="intentChartRef" style="width: 100%; height: 320px"></div>
          </div>
        </div>

        <!-- 新老学员占比 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">新老学员占比</span>
          </div>
          <div class="panel-body chart-container">
            <div ref="studentChartRef" style="width: 100%; height: 320px"></div>
          </div>
        </div>
      </div>

      <!-- 中间 -->
      <div class="content-center">
        <!-- 核心指标 -->
        <div class="core-stats">
          <div class="core-stat-item">
            <div class="core-stat-label">客户总数</div>
            <div class="core-stat-value">{{ overview.customer.total }}</div>
          </div>
          <div class="core-stat-item">
            <div class="core-stat-label">订单总数</div>
            <div class="core-stat-value">{{ overview.order.total }}</div>
          </div>
          <div class="core-stat-item">
            <div class="core-stat-label">累计销售额</div>
            <div class="core-stat-value amount">¥{{ (overview.revenue.total / 10000).toFixed(2) }}万</div>
          </div>
          <div class="core-stat-item">
            <div class="core-stat-label">本月销售额</div>
            <div class="core-stat-value amount">¥{{ (overview.revenue.thisMonth / 10000).toFixed(2) }}万</div>
          </div>
        </div>

        <!-- 销售额趋势 -->
        <div class="panel trend-panel">
          <div class="panel-header">
            <span class="panel-title">近7天销售额趋势</span>
          </div>
          <div class="panel-body">
            <div ref="trendChartRef" style="width: 100%; height: 350px"></div>
          </div>
        </div>

        <!-- 订单状态分布 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">订单状态分布</span>
          </div>
          <div class="panel-body">
            <div ref="statusChartRef" style="width: 100%; height: 280px"></div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="content-right">
        <!-- 销售排行榜 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">销售排行榜 Top 10</span>
          </div>
          <div class="panel-body">
            <div ref="salesChartRef" style="width: 100%; height: 280px"></div>
          </div>
        </div>

        <!-- 校区销售额分布 -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">校区销售额分布</span>
          </div>
          <div class="panel-body chart-container">
            <div ref="campusChartRef" style="width: 100%; height: 320px"></div>
          </div>
        </div>

        <!-- 课程销售额Top5 -->
        <div class="panel course-panel">
          <div class="panel-header">
            <span class="panel-title">课程销售额 Top 5</span>
          </div>
          <div class="panel-body">
            <div class="course-list">
              <div class="course-item" v-for="(item, index) in courseRevenue.slice(0, 5)" :key="index">
                <div class="course-rank" :class="{ 'rank-first': index === 0 }">{{ index + 1 }}</div>
                <div class="course-name">{{ item.courseName }}</div>
                <div class="course-revenue">¥{{ item.revenue.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getDashboardOverview, getWeeklyTrend } from '@/api/dashboard'
import { getSalesRanking, getCampusRevenue, getCourseRevenue } from '@/api/finance'
import type { DashboardOverview, WeeklyTrend } from '@/api/dashboard'
import type { SalesRanking, CampusRevenue, CourseRevenue } from '@/api/finance'

const currentTime = ref('')
const trendChartRef = ref<HTMLElement>()
const intentChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
const studentChartRef = ref<HTMLElement>()
const salesChartRef = ref<HTMLElement>()
const campusChartRef = ref<HTMLElement>()

const overview = reactive<DashboardOverview>({
  customer: { total: 0, byIntent: [] },
  order: { total: 0, newStudent: 0, oldStudent: 0, byStatus: [] },
  revenue: { total: 0, thisMonth: 0 },
  today: { newCustomers: 0, newOrders: 0, revenue: 0 },
})

const weeklyTrend = ref<WeeklyTrend[]>([])
const salesRanking = ref<SalesRanking[]>([])
const campusRevenue = ref<CampusRevenue[]>([])
const courseRevenue = ref<CourseRevenue[]>([])

let timeInterval: any = null
let dataInterval: any = null

// 更新时间
const updateTime = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss dddd')
}

// 获取数据
const fetchData = async () => {
  try {
    const [overviewData, trendData, salesData, campusData, courseData] = await Promise.all([
      getDashboardOverview(),
      getWeeklyTrend(),
      getSalesRanking(),
      getCampusRevenue(),
      getCourseRevenue(),
    ])

    Object.assign(overview, overviewData)
    weeklyTrend.value = trendData
    salesRanking.value = salesData
    campusRevenue.value = campusData
    courseRevenue.value = courseData

    await nextTick()
    renderAllCharts()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

// 渲染所有图表
const renderAllCharts = () => {
  renderTrendChart()
  renderIntentChart()
  renderStatusChart()
  renderStudentChart()
  renderSalesChart()
  renderCampusChart()
}

// 销售额趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  const chart = echarts.init(trendChartRef.value)
  const dates = weeklyTrend.value.map((item) => item.date.substring(5))
  const revenues = weeklyTrend.value.map((item) => item.revenue)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 30, bottom: 30, top: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    series: [{
      data: revenues,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(33, 150, 243, 0.5)' },
          { offset: 1, color: 'rgba(33, 150, 243, 0.1)' },
        ]),
      },
      itemStyle: { color: '#42A5F5' },
      lineStyle: { width: 3 },
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

// 客户意向图
const renderIntentChart = () => {
  if (!intentChartRef.value) return

  const chart = echarts.init(intentChartRef.value)
  const data = overview.customer.byIntent.map((item) => ({
    value: item.count,
    name: item.intent,
  }))

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: '10%',
      textStyle: { color: '#a0aec0', fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: '50%',
      center: ['35%', '30%'],
      data,
      label: {
        color: '#a0aec0',
        fontSize: 11
      },
      color: ['#00E5FF', '#FF6B6B', '#FFA726'],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 229, 255, 0.5)'
        }
      }
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

// 订单状态图
const renderStatusChart = () => {
  if (!statusChartRef.value) return

  const chart = echarts.init(statusChartRef.value)
  const data = overview.order.byStatus.map((item) => ({
    value: item.count,
    name: item.status,
  }))

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      textStyle: { color: '#a0aec0', fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '48%'],
      data,
      label: { color: '#a0aec0', fontSize: 12 },
      color: ['#00E5FF', '#FFA726', '#4CAF50', '#E91E63'],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 229, 255, 0.5)'
        }
      }
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

// 新老学员图
const renderStudentChart = () => {
  if (!studentChartRef.value) return

  const chart = echarts.init(studentChartRef.value)
  const data = [
    { value: overview.order.newStudent, name: '新学员' },
    { value: overview.order.oldStudent, name: '老学员' },
  ]

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: '10%',
      textStyle: { color: '#a0aec0', fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: '50%',
      center: ['35%', '30%'],
      data,
      label: {
        color: '#a0aec0',
        fontSize: 11
      },
      color: ['#00E5FF', '#9C27B0'],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 229, 255, 0.5)'
        }
      }
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

// 销售排行图
const renderSalesChart = () => {
  if (!salesChartRef.value) return

  const chart = echarts.init(salesChartRef.value)
  const names = salesRanking.value.map((item) => item.salesName)
  const revenues = salesRanking.value.map((item) => item.totalRevenue)

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 30, bottom: 30, top: 10 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    yAxis: {
      type: 'category',
      data: names.reverse(),
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
    },
    series: [{
      type: 'bar',
      data: revenues.reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#1976D2' },
          { offset: 1, color: '#64B5F6' },
        ]),
      },
      label: {
        show: true,
        position: 'right',
        color: '#a0aec0',
        formatter: (params: any) => `¥${params.value.toFixed(0)}`,
      },
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

// 校区销售额图
const renderCampusChart = () => {
  if (!campusChartRef.value) return

  const chart = echarts.init(campusChartRef.value)
  const data = campusRevenue.value.map((item) => ({
    value: item.revenue,
    name: item.campusName,
  }))

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: '10%',
      textStyle: { color: '#a0aec0', fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: '50%',
      center: ['35%', '30%'],
      data,
      label: { color: '#a0aec0', fontSize: 11 },
      color: ['#00E5FF', '#9C27B0', '#FFA726', '#4CAF50', '#E91E63'],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 229, 255, 0.5)'
        }
      }
    }],
  })

  window.addEventListener('resize', () => chart.resize())
}

onMounted(() => {
  updateTime()
  fetchData()

  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000)

  // 每30秒刷新数据
  dataInterval = setInterval(fetchData, 30000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (dataInterval) clearInterval(dataInterval)
})
</script>

<style scoped lang="scss">
.datascreen-container {
  width: 100vw;
  height: 100vh;
  min-width: 1920px;
  min-height: 1080px;
  background: linear-gradient(to bottom, #0a1929, #1a2332);
  overflow: auto;
  position: relative;

  .datascreen-header {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    background: linear-gradient(to right, rgba(0, 229, 255, 0.1), rgba(0, 151, 167, 0.05), rgba(0, 229, 255, 0.1));
    border-bottom: 2px solid rgba(0, 229, 255, 0.4);
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 229, 255, 0.2);

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg,
        transparent,
        #00E5FF 20%,
        #00E5FF 80%,
        transparent
      );
      animation: headerGlow 3s ease-in-out infinite;
    }

    .header-left {
      width: 200px;
    }

    .header-center {
      flex: 1;
      text-align: center;

      .title {
        font-size: 36px;
        font-weight: bold;
        color: #00E5FF;
        text-shadow: 0 0 20px rgba(0, 229, 255, 0.8),
                     0 0 40px rgba(0, 229, 255, 0.4);
        margin: 0;
        letter-spacing: 2px;
        animation: titleGlow 3s ease-in-out infinite;
      }

      .subtitle {
        font-size: 14px;
        color: #a0aec0;
        margin-top: 5px;
      }
    }

    .header-right {
      width: 200px;
      text-align: right;

      .datetime {
        font-size: 16px;
        color: #00E5FF;
        font-weight: 500;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
        padding: 8px 16px;
        background: rgba(0, 229, 255, 0.08);
        border-radius: 4px;
        border: 1px solid rgba(0, 229, 255, 0.3);
      }
    }
  }

  .datascreen-content {
    height: calc(100% - 100px);
    display: flex;
    gap: 20px;
    padding: 20px;

    .content-left,
    .content-right {
      width: 450px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .content-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  .panel {
    background: rgba(26, 35, 50, 0.85);
    border: 1px solid rgba(33, 150, 243, 0.3);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 229, 255, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    transition: all 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00E5FF, transparent);
      animation: scan 3s infinite;
    }

    &:hover {
      border-color: rgba(0, 229, 255, 0.5);
      box-shadow: 0 8px 30px rgba(0, 229, 255, 0.25),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    &.trend-panel {
      flex: 1;
    }

    &.today-panel {
      flex-shrink: 0;

      .panel-body {
        padding: 15px;
      }
    }

    &.course-panel {
      flex-shrink: 0;

      .panel-body {
        padding: 15px;
        max-height: 380px;
        overflow-y: auto;
      }
    }
  }

  .panel-header {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: linear-gradient(to right, rgba(0, 229, 255, 0.15), transparent);
    border-bottom: 1px solid rgba(0, 229, 255, 0.3);

    .panel-title {
      font-size: 18px;
      font-weight: 500;
      color: #00E5FF;
      position: relative;
      padding-left: 15px;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: linear-gradient(to bottom, #00E5FF, #0097A7);
        border-radius: 2px;
        box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }

  .panel-body {
    padding: 20px;

    &.chart-container {
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @keyframes scan {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
    }
    50% {
      opacity: 0.6;
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
    }
  }

  .stat-item {
    padding: 16px 18px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, rgba(0, 229, 255, 0.05), rgba(0, 151, 167, 0.05));
    border-left: 3px solid #00E5FF;
    border-radius: 4px;
    min-height: 85px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 50px;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1));
      transform: skewX(-15deg);
    }

    &:hover {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 151, 167, 0.1));
      border-left-color: #00E5FF;
      box-shadow: 0 4px 15px rgba(0, 229, 255, 0.2);
      transform: translateX(5px);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .stat-label {
      font-size: 13px;
      color: #a0aec0;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      line-height: 1.3;
    }

    .stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #fff;
      word-wrap: break-word;
      word-break: break-all;
      line-height: 1.3;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      &.amount {
        color: #4CAF50;
        text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        font-size: 20px;
      }
    }
  }

  .core-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .core-stat-item {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 151, 167, 0.05));
      border: 2px solid transparent;
      background-clip: padding-box;
      border-radius: 8px;
      padding: 30px 20px;
      text-align: center;
      position: relative;
      transition: all 0.3s ease;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 8px;
        padding: 2px;
        background: linear-gradient(135deg, #00E5FF, #0097A7);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.5;
      }

      &:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);

        &::before {
          opacity: 1;
          animation: borderGlow 1.5s ease-in-out infinite;
        }
      }

      .core-stat-label {
        font-size: 16px;
        color: #a0aec0;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .core-stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);

        &.amount {
          color: #4CAF50;
          text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
        }
      }
    }
  }

  @keyframes borderGlow {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  @keyframes headerGlow {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes titleGlow {
    0%, 100% {
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.8),
                   0 0 40px rgba(0, 229, 255, 0.4);
    }
    50% {
      text-shadow: 0 0 30px rgba(0, 229, 255, 1),
                   0 0 60px rgba(0, 229, 255, 0.6);
    }
  }

  .course-list {
    .course-item {
      display: flex;
      align-items: center;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(0, 229, 255, 0.15);
      transition: all 0.3s ease;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 0;
        background: linear-gradient(to bottom, #00E5FF, #0097A7);
        transition: height 0.3s ease;
      }

      &:hover {
        background: rgba(0, 229, 255, 0.05);
        padding-left: 15px;

        &::before {
          height: 100%;
        }

        .course-rank {
          transform: scale(1.1) rotate(360deg);
        }
      }

      &:last-child {
        border-bottom: none;
      }

      .course-rank {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #00E5FF, #0097A7);
        color: #0a1929;
        font-size: 16px;
        font-weight: bold;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
        transition: all 0.5s ease;
        flex-shrink: 0;

        &.rank-first {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
        }
      }

      .course-name {
        flex: 1;
        font-size: 14px;
        color: #e2e8f0;
      }

      .course-revenue {
        font-size: 16px;
        font-weight: 500;
        color: #4CAF50;
        text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
      }
    }
  }
}
</style>
