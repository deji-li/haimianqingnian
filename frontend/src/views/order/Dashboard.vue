<template>
  <div class="order-dashboard-container">
    <!-- 日期筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="快捷筛选">
          <el-button-group>
            <el-button :type="quickFilter === 'today' ? 'primary' : ''" @click="handleQuickFilter('today')">
              今日
            </el-button>
            <el-button :type="quickFilter === 'yesterday' ? 'primary' : ''" @click="handleQuickFilter('yesterday')">
              昨日
            </el-button>
            <el-button :type="quickFilter === 'thisWeek' ? 'primary' : ''" @click="handleQuickFilter('thisWeek')">
              本周
            </el-button>
            <el-button :type="quickFilter === 'lastWeek' ? 'primary' : ''" @click="handleQuickFilter('lastWeek')">
              上周
            </el-button>
            <el-button :type="quickFilter === 'thisMonth' ? 'primary' : ''" @click="handleQuickFilter('thisMonth')">
              本月
            </el-button>
            <el-button :type="quickFilter === 'lastMonth' ? 'primary' : ''" @click="handleQuickFilter('lastMonth')">
              上月
            </el-button>
          </el-button-group>
        </el-form-item>
        <el-form-item label="自定义时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchStatistics">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总订单数</div>
            <div class="stat-value">{{ statistics.totalOrders }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#FFB800"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总销售额</div>
            <div class="stat-value amount">¥{{ statistics.totalAmount.toFixed(2) }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#67C23A"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">新学员订单</div>
            <div class="stat-value">{{ statistics.newStudentOrders }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#409EFF"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">老学员订单</div>
            <div class="stat-value">{{ statistics.oldStudentOrders }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#909399"><UserFilled /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="16" class="chart-row">
      <!-- 订单状态分布 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">订单状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>

      <!-- 新老学员占比 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">新老学员占比</span>
            </div>
          </template>
          <div ref="studentChartRef" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <el-card shadow="never" class="order-list-card">
      <template #header>
        <div class="card-header">
          <span class="title">最近订单</span>
          <el-button link type="primary" @click="goToOrderList">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="customerName" label="客户" width="120">
          <template #default="{ row }">
            {{ row.customerName || row.wechatNickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程" width="140" />
        <el-table-column prop="paymentAmount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.paymentAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.orderStatus === '待上课'
                  ? 'warning'
                  : row.orderStatus === '上课中'
                    ? 'primary'
                    : row.orderStatus === '已完成'
                      ? 'success'
                      : 'danger'
              "
            >
              {{ row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.paymentTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getOrderStatistics, getOrderList, type Order } from '@/api/order'

const router = useRouter()

const loading = ref(false)
const dateRange = ref<string[]>([])
const quickFilter = ref('thisMonth')
const statusChartRef = ref<HTMLElement>()
const studentChartRef = ref<HTMLElement>()

const statistics = reactive({
  totalOrders: 0,
  totalAmount: 0,
  newStudentOrders: 0,
  oldStudentOrders: 0,
  statusStats: [] as Array<{ status: string; count: number }>,
})

const recentOrders = ref<Order[]>([])

// 获取统计数据
const fetchStatistics = async () => {
  try {
    let startDate = dateRange.value?.[0]
    let endDate = dateRange.value?.[1]

    const stats = await getOrderStatistics(startDate, endDate)
    Object.assign(statistics, stats)

    // 获取最近订单
    const orderRes = await getOrderList({
      page: 1,
      pageSize: 10,
      keyword: '',
      startDate,
      endDate,
    })
    recentOrders.value = orderRes.list

    // 更新图表
    await nextTick()
    renderStatusChart()
    renderStudentChart()
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// 快捷筛选处理
const handleQuickFilter = (type: string) => {
  quickFilter.value = type
  const today = dayjs()

  switch (type) {
    case 'today':
      dateRange.value = [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
      break
    case 'yesterday':
      dateRange.value = [
        today.subtract(1, 'day').format('YYYY-MM-DD'),
        today.subtract(1, 'day').format('YYYY-MM-DD'),
      ]
      break
    case 'thisWeek':
      dateRange.value = [
        today.startOf('week').format('YYYY-MM-DD'),
        today.endOf('week').format('YYYY-MM-DD'),
      ]
      break
    case 'lastWeek':
      dateRange.value = [
        today.subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
        today.subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
      ]
      break
    case 'thisMonth':
      dateRange.value = [
        today.startOf('month').format('YYYY-MM-DD'),
        today.endOf('month').format('YYYY-MM-DD'),
      ]
      break
    case 'lastMonth':
      dateRange.value = [
        today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
      ]
      break
  }

  fetchStatistics()
}

// 自定义日期范围变化处理
const handleDateRangeChange = () => {
  quickFilter.value = ''
  fetchStatistics()
}

// 渲染订单状态分布图表
const renderStatusChart = () => {
  if (!statusChartRef.value) return

  const chart = echarts.init(statusChartRef.value)
  const data = statistics.statusStats.map((item) => ({
    value: item.count,
    name: item.status,
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
        color: ['#FFB800', '#409EFF', '#67C23A', '#F56C6C'],
      },
    ],
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 渲染新老学员占比图表
const renderStudentChart = () => {
  if (!studentChartRef.value) return

  const chart = echarts.init(studentChartRef.value)
  const data = [
    { value: statistics.newStudentOrders, name: '新学员' },
    { value: statistics.oldStudentOrders, name: '老学员' },
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '学员类型',
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
        color: ['#67C23A', '#909399'],
      },
    ],
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 跳转到订单列表
const goToOrderList = () => {
  router.push('/order/list')
}

// 格式化日期
const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  // 默认显示本月数据
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
  const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD')
  dateRange.value = [startOfMonth, endOfMonth]

  fetchStatistics()
})
</script>

<style scoped lang="scss">
.order-dashboard-container {
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
            color: #ff6b00;
          }
        }
      }

      .stat-icon {
        opacity: 0.2;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .order-list-card {
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

  .amount {
    color: #ff6b00;
    font-weight: 500;
  }
}
</style>
