<template>
  <div class="team-leaderboard">
    <el-card class="header-card">
      <div class="page-header">
        <h2>团队排行榜</h2>
        <div class="filters">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
          <el-select v-model="selectedDepartment" placeholder="全部部门" clearable @change="fetchData">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
          <el-select v-model="selectedCampus" placeholder="全部校区" clearable @change="fetchData">
            <el-option
              v-for="campus in campuses"
              :key="campus.id"
              :label="campus.name"
              :value="campus.id"
            />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 团队总览 -->
    <el-card class="overview-card">
      <template #header>
        <span class="card-title">团队总览</span>
      </template>
      <div class="overview-stats">
        <div class="stat-item">
          <div class="stat-label">团队人数</div>
          <div class="stat-value">{{ overview.totalMembers }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总销售额</div>
          <div class="stat-value primary">¥{{ formatMoney(overview.totalAmount) }}</div>
          <div v-if="overview.amountGrowthRate !== undefined" class="stat-growth">
            <span :class="overview.amountGrowthRate >= 0 ? 'growth-up' : 'growth-down'">
              {{ overview.amountGrowthRate >= 0 ? '↑' : '↓' }}
              {{ Math.abs(overview.amountGrowthRate).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ overview.totalOrders }}</div>
          <div v-if="overview.orderGrowthRate !== undefined" class="stat-growth">
            <span :class="overview.orderGrowthRate >= 0 ? 'growth-up' : 'growth-down'">
              {{ overview.orderGrowthRate >= 0 ? '↑' : '↓' }}
              {{ Math.abs(overview.orderGrowthRate).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总客户数</div>
          <div class="stat-value">{{ overview.totalCustomers }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">人均销售额</div>
          <div class="stat-value">¥{{ formatMoney(overview.avgAmountPerMember) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">人均订单数</div>
          <div class="stat-value">{{ overview.avgOrdersPerMember.toFixed(1) }}</div>
        </div>
      </div>
    </el-card>

    <!-- 排行榜选项卡 -->
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 成员业绩排行 -->
        <el-tab-pane label="成员业绩排行" name="member">
          <div class="sort-options">
            <el-radio-group v-model="sortBy" @change="fetchMemberPerformance">
              <el-radio-button label="totalAmount">销售额排行</el-radio-button>
              <el-radio-button label="orderCount">订单数排行</el-radio-button>
              <el-radio-button label="customerCount">客户数排行</el-radio-button>
            </el-radio-group>
          </div>

          <el-table :data="memberPerformance" stripe style="margin-top: 20px">
            <el-table-column label="排名" width="80">
              <template #default="{ row }">
                <div class="rank-badge">
                  <el-tag v-if="row.rank === 1" type="danger" effect="dark">🥇</el-tag>
                  <el-tag v-else-if="row.rank === 2" type="warning" effect="dark">🥈</el-tag>
                  <el-tag v-else-if="row.rank === 3" type="success" effect="dark">🥉</el-tag>
                  <span v-else>{{ row.rank }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="姓名" width="120">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar v-if="row.avatar" :src="row.avatar" :size="32" />
                  <el-avatar v-else :size="32">{{ row.realName?.substring(0, 1) }}</el-avatar>
                  <span class="user-name">{{ row.realName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="部门" prop="departmentName" width="120" />
            <el-table-column label="校区" prop="campusName" width="120" />
            <el-table-column label="销售额" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="100" />
            <el-table-column label="客户数" prop="customerCount" width="100" />
            <el-table-column label="新增客户" prop="newCustomerCount" width="100" />
            <el-table-column label="跟进次数" prop="followCount" width="100" />
            <el-table-column label="目标完成率" width="150">
              <template #default="{ row }">
                <div v-if="row.targetCompletion !== undefined">
                  <el-progress
                    :percentage="Math.min(row.targetCompletion, 100)"
                    :color="getProgressColor(row.targetCompletion)"
                  />
                </div>
                <span v-else class="text-muted">未设置目标</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 部门对比 -->
        <el-tab-pane label="部门业绩对比" name="department">
          <div ref="departmentChartRef" class="chart-container"></div>
          <el-table :data="departmentComparison" stripe style="margin-top: 20px">
            <el-table-column label="部门名称" prop="departmentName" width="150" />
            <el-table-column label="人数" prop="memberCount" width="100" />
            <el-table-column label="总销售额" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="120" />
            <el-table-column label="客户数" prop="customerCount" width="120" />
            <el-table-column label="人均销售额" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatMoney(row.avgAmountPerMember) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 校区对比 -->
        <el-tab-pane label="校区业绩对比" name="campus">
          <div ref="campusChartRef" class="chart-container"></div>
          <el-table :data="campusComparison" stripe style="margin-top: 20px">
            <el-table-column label="校区名称" prop="campusName" width="150" />
            <el-table-column label="人数" prop="memberCount" width="100" />
            <el-table-column label="总销售额" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="120" />
            <el-table-column label="客户数" prop="customerCount" width="120" />
            <el-table-column label="人均销售额" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatMoney(row.avgAmountPerMember) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getTeamMemberPerformance,
  getTeamOverview,
  getDepartmentComparison,
  getCampusComparison,
  type TeamMemberPerformance,
  type TeamOverview,
  type DepartmentPerformance,
  type CampusPerformance,
} from '@/api/team-stats'

// 筛选条件
const dateRange = ref<[string, string] | null>(null)
const selectedDepartment = ref<number | null>(null)
const selectedCampus = ref<number | null>(null)
const departments = ref<any[]>([])
const campuses = ref<any[]>([])

// 排序方式
const sortBy = ref<'totalAmount' | 'orderCount' | 'customerCount'>('totalAmount')

// 活动标签页
const activeTab = ref('member')

// 数据
const overview = reactive<TeamOverview>({
  totalMembers: 0,
  totalAmount: 0,
  totalOrders: 0,
  totalCustomers: 0,
  avgAmountPerMember: 0,
  avgOrdersPerMember: 0,
})
const memberPerformance = ref<TeamMemberPerformance[]>([])
const departmentComparison = ref<DepartmentPerformance[]>([])
const campusComparison = ref<CampusPerformance[]>([])

// 图表引用
const departmentChartRef = ref<HTMLElement>()
const campusChartRef = ref<HTMLElement>()
let departmentChart: ECharts | null = null
let campusChart: ECharts | null = null

// 格式化金额
const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 获取查询参数
const getQueryParams = () => {
  return {
    startDate: dateRange.value?.[0],
    endDate: dateRange.value?.[1],
    departmentId: selectedDepartment.value,
    campusId: selectedCampus.value,
    sortBy: sortBy.value,
    limit: 50,
  }
}

// 日期变化处理
const handleDateChange = () => {
  fetchData()
}

// 获取团队总览
const fetchOverview = async () => {
  try {
    const data = await getTeamOverview(getQueryParams())
    Object.assign(overview, data)
  } catch (error: any) {
    ElMessage.error(error.message || '获取团队总览失败')
  }
}

// 获取成员业绩
const fetchMemberPerformance = async () => {
  try {
    const data = await getTeamMemberPerformance(getQueryParams())
    memberPerformance.value = data || []
  } catch (error: any) {
    ElMessage.error(error.message || '获取成员业绩失败')
  }
}

// 获取部门对比
const fetchDepartmentComparison = async () => {
  try {
    const data = await getDepartmentComparison(getQueryParams())
    departmentComparison.value = data || []
    await nextTick()
    renderDepartmentChart()
  } catch (error: any) {
    ElMessage.error(error.message || '获取部门对比失败')
  }
}

// 获取校区对比
const fetchCampusComparison = async () => {
  try {
    const data = await getCampusComparison(getQueryParams())
    campusComparison.value = data || []
    await nextTick()
    renderCampusChart()
  } catch (error: any) {
    ElMessage.error(error.message || '获取校区对比失败')
  }
}

// 渲染部门对比图表
const renderDepartmentChart = () => {
  if (!departmentChartRef.value) return

  if (!departmentChart) {
    departmentChart = echarts.init(departmentChartRef.value)
  }

  const option = {
    title: {
      text: '部门业绩对比',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      top: 30,
      data: ['总销售额', '人均销售额', '订单数'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: departmentComparison.value.map((item) => item.departmentName),
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（元）',
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
        name: '总销售额',
        type: 'bar',
        data: departmentComparison.value.map((item) => item.totalAmount),
        itemStyle: { color: '#409eff' },
      },
      {
        name: '人均销售额',
        type: 'bar',
        data: departmentComparison.value.map((item) => item.avgAmountPerMember),
        itemStyle: { color: '#67c23a' },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: departmentComparison.value.map((item) => item.orderCount),
        itemStyle: { color: '#e6a23c' },
      },
    ],
  }

  departmentChart.setOption(option)
}

// 渲染校区对比图表
const renderCampusChart = () => {
  if (!campusChartRef.value) return

  if (!campusChart) {
    campusChart = echarts.init(campusChartRef.value)
  }

  const option = {
    title: {
      text: '校区业绩对比',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      top: 30,
      data: ['总销售额', '人均销售额', '订单数'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: campusComparison.value.map((item) => item.campusName),
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（元）',
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
        name: '总销售额',
        type: 'bar',
        data: campusComparison.value.map((item) => item.totalAmount),
        itemStyle: { color: '#409eff' },
      },
      {
        name: '人均销售额',
        type: 'bar',
        data: campusComparison.value.map((item) => item.avgAmountPerMember),
        itemStyle: { color: '#67c23a' },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: campusComparison.value.map((item) => item.orderCount),
        itemStyle: { color: '#e6a23c' },
      },
    ],
  }

  campusChart.setOption(option)
}

// 标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'department' && departmentComparison.value.length === 0) {
    fetchDepartmentComparison()
  } else if (tab === 'campus' && campusComparison.value.length === 0) {
    fetchCampusComparison()
  }
}

// 获取所有数据
const fetchData = () => {
  fetchOverview()
  if (activeTab.value === 'member') {
    fetchMemberPerformance()
  } else if (activeTab.value === 'department') {
    fetchDepartmentComparison()
  } else if (activeTab.value === 'campus') {
    fetchCampusComparison()
  }
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  departmentChart?.resize()
  campusChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.team-leaderboard {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      .filters {
        display: flex;
        gap: 12px;
      }
    }
  }

  .overview-card {
    margin-bottom: 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 20px;

      .stat-item {
        text-align: center;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;

          &.primary {
            color: #409eff;
          }
        }

        .stat-growth {
          margin-top: 8px;
          font-size: 14px;

          .growth-up {
            color: #67c23a;
          }

          .growth-down {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .sort-options {
    display: flex;
    justify-content: center;
  }

  .rank-badge {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
      font-weight: 500;
    }
  }

  .amount-text {
    color: #409eff;
    font-weight: 500;
  }

  .text-muted {
    color: #909399;
    font-size: 12px;
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }
}
</style>
