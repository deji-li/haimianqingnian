<template>
  <div class="team-statistics-container">
    <!-- 顶部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div>
          <h2>团队统计</h2>
          <p class="subtitle">团队成员业绩分析、部门对比、校区统计</p>
        </div>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="filters.departmentId"
            placeholder="全部部门"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="校区">
          <el-select
            v-model="filters.campusId"
            placeholder="全部校区"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="campus in campuses"
              :key="campus.id"
              :label="campus.name"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="exportData">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据概览 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="stat-item">
            <div class="stat-value">{{ teamOverview.totalMembers }}</div>
            <div class="stat-label">团队成员</div>
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="stat-item">
            <div class="stat-value">¥{{ formatAmount(teamOverview.totalAmount) }}</div>
            <div class="stat-label">总业绩</div>
            <div class="stat-icon money">
              <el-icon><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="stat-item">
            <div class="stat-value">{{ teamOverview.totalOrders }}</div>
            <div class="stat-label">订单数量</div>
            <div class="stat-icon orders">
              <el-icon><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="stat-item">
            <div class="stat-value">{{ teamOverview.totalCustomers }}</div>
            <div class="stat-label">客户数量</div>
            <div class="stat-icon customers">
              <el-icon><UserFilled /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标签页内容 -->
    <el-card shadow="never" class="content-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 成员业绩排行榜 -->
        <el-tab-pane label="成员业绩" name="performance">
          <el-table
            v-loading="performanceLoading"
            :data="memberPerformance"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="realName" label="姓名" width="120">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="32" :src="row.avatar" fit="cover">
                    {{ row.realName.charAt(0) }}
                  </el-avatar>
                  <span>{{ row.realName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="departmentName" label="部门" width="120" />
            <el-table-column prop="campusName" label="校区" width="120" />
            <el-table-column prop="totalAmount" label="总业绩" width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatAmount(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="订单数" width="100" />
            <el-table-column prop="customerCount" label="客户数" width="100" />
            <el-table-column prop="newCustomerCount" label="新客户" width="100" />
            <el-table-column prop="followCount" label="跟进数" width="100" />
            <el-table-column prop="targetCompletion" label="目标完成率" width="120">
              <template #default="{ row }">
                <el-progress
                  v-if="row.targetCompletion !== undefined"
                  :percentage="row.targetCompletion"
                  :color="getProgressColor(row.targetCompletion)"
                  :show-text="false"
                />
                <span class="progress-text">{{ row.targetCompletion }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 部门对比 -->
        <el-tab-pane label="部门对比" name="department">
          <div class="chart-container">
            <div class="chart-header">
              <h3>部门业绩对比</h3>
              <el-radio-group v-model="departmentChartType" size="small">
                <el-radio-button label="bar">柱状图</el-radio-button>
                <el-radio-button label="line">折线图</el-radio-button>
                <el-radio-button label="pie">饼图</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-placeholder">
              <el-empty description="图表功能开发中" />
            </div>
          </div>
          <el-table
            v-loading="departmentLoading"
            :data="departmentPerformance"
            style="width: 100%; margin-top: 20px;"
          >
            <el-table-column prop="departmentName" label="部门名称" />
            <el-table-column prop="memberCount" label="成员数" width="100" />
            <el-table-column prop="totalAmount" label="总业绩" width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatAmount(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="订单数" width="100" />
            <el-table-column prop="customerCount" label="客户数" width="100" />
            <el-table-column prop="avgAmountPerMember" label="人均业绩" width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatAmount(row.avgAmountPerMember) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 校区对比 -->
        <el-tab-pane label="校区对比" name="campus">
          <div class="chart-container">
            <div class="chart-header">
              <h3>校区业绩对比</h3>
              <el-radio-group v-model="campusChartType" size="small">
                <el-radio-button label="bar">柱状图</el-radio-button>
                <el-radio-button label="line">折线图</el-radio-button>
                <el-radio-button label="pie">饼图</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-placeholder">
              <el-empty description="图表功能开发中" />
            </div>
          </div>
          <el-table
            v-loading="campusLoading"
            :data="campusPerformance"
            style="width: 100%; margin-top: 20px;"
          >
            <el-table-column prop="campusName" label="校区名称" />
            <el-table-column prop="memberCount" label="成员数" width="100" />
            <el-table-column prop="totalAmount" label="总业绩" width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatAmount(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="订单数" width="100" />
            <el-table-column prop="customerCount" label="客户数" width="100" />
            <el-table-column prop="avgAmountPerMember" label="人均业绩" width="120">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatAmount(row.avgAmountPerMember) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, User, Money, Document, UserFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getTeamMemberPerformance,
  getTeamOverview,
  getDepartmentComparison,
  getCampusComparison,
  type TeamMemberPerformance,
  type TeamOverview,
  type DepartmentPerformance,
  type CampusPerformance,
  type TeamStatsQuery
} from '@/api/team-stats'
import { getDepartmentList } from '@/api/department'
import { getCampusList } from '@/api/campus'

const activeTab = ref('performance')
const dateRange = ref<[string, string]>([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])

const performanceLoading = ref(false)
const departmentLoading = ref(false)
const campusLoading = ref(false)

const memberPerformance = ref<TeamMemberPerformance[]>([])
const departmentPerformance = ref<DepartmentPerformance[]>([])
const campusPerformance = ref<CampusPerformance[]>([])
const teamOverview = ref<TeamOverview>({
  totalMembers: 0,
  totalAmount: 0,
  totalOrders: 0,
  totalCustomers: 0,
  avgAmountPerMember: 0,
  avgOrdersPerMember: 0
})

const departmentChartType = ref('bar')
const campusChartType = ref('bar')

const filters = reactive<TeamStatsQuery>({
  startDate: dateRange.value[0],
  endDate: dateRange.value[1],
  departmentId: undefined,
  campusId: undefined
})

const departments = ref<any[]>([])
const campuses = ref<any[]>([])

// 格式化金额
const formatAmount = (amount: number) => {
  if (!amount) return '0'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 0 })
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 日期变化
const handleDateChange = () => {
  filters.startDate = dateRange.value[0]
  filters.endDate = dateRange.value[1]
  fetchData()
}

// 筛选条件变化
const handleFilterChange = () => {
  fetchData()
}

// 标签页变化
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'department' && departmentPerformance.value.length === 0) {
    fetchDepartmentData()
  } else if (tabName === 'campus' && campusPerformance.value.length === 0) {
    fetchCampusData()
  }
}

// 重置筛选
const handleReset = () => {
  Object.assign(filters, {
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    departmentId: undefined,
    campusId: undefined
  })
  dateRange.value = [filters.startDate!, filters.endDate!]
  fetchData()
}

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 获取基础数据
const fetchBasicData = async () => {
  try {
    const [deptRes, campusRes] = await Promise.all([
      getDepartmentList(),
      getCampusList()
    ])
    departments.value = deptRes.list || []
    campuses.value = campusRes.list || []
  } catch (error) {
    console.error('Failed to fetch basic data:', error)
  }
}

// 获取团队概览
const fetchTeamOverview = async () => {
  try {
    const overview = await getTeamOverview(filters)
    teamOverview.value = overview
  } catch (error) {
    console.error('Failed to fetch team overview:', error)
    ElMessage.error('获取团队概览失败')
  }
}

// 获取成员业绩数据
const fetchPerformanceData = async () => {
  performanceLoading.value = true
  try {
    const data = await getTeamMemberPerformance(filters)
    memberPerformance.value = data
    // 添加排名
    memberPerformance.value.forEach((item, index) => {
      item.rank = index + 1
    })
  } catch (error) {
    console.error('Failed to fetch performance data:', error)
    ElMessage.error('获取成员业绩数据失败')
  } finally {
    performanceLoading.value = false
  }
}

// 获取部门对比数据
const fetchDepartmentData = async () => {
  departmentLoading.value = true
  try {
    const data = await getDepartmentComparison(filters)
    departmentPerformance.value = data
  } catch (error) {
    console.error('Failed to fetch department data:', error)
    ElMessage.error('获取部门对比数据失败')
  } finally {
    departmentLoading.value = false
  }
}

// 获取校区对比数据
const fetchCampusData = async () => {
  campusLoading.value = true
  try {
    const data = await getCampusComparison(filters)
    campusPerformance.value = data
  } catch (error) {
    console.error('Failed to fetch campus data:', error)
    ElMessage.error('获取校区对比数据失败')
  } finally {
    campusLoading.value = false
  }
}

// 获取所有数据
const fetchData = async () => {
  await Promise.all([
    fetchTeamOverview(),
    fetchPerformanceData()
  ])
}

onMounted(async () => {
  await fetchBasicData()
  await fetchData()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.team-statistics-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);

  .header-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    .header-content {
      h2 {
        color: var(--xhs-text-primary);
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .subtitle {
        color: var(--xhs-text-secondary);
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .filter-card, .content-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .overview-row {
    margin-bottom: 20px;

    .overview-card {
      @include xhs-card;
      border: none;
      background: white;

      .stat-item {
        position: relative;
        padding: 20px;
        text-align: center;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: var(--xhs-primary);
          margin-bottom: 8px;
        }

        .stat-label {
          color: var(--xhs-text-secondary);
          font-size: 14px;
        }

        .stat-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;

          &.users {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          }

          &.money {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          }

          &.orders {
            background: linear-gradient(135deg, #e6a23c 0%, #eebe77 100%);
          }

          &.customers {
            background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          }
        }
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-avatar {
      background: var(--xhs-primary);
      color: white;
      font-weight: bold;
    }
  }

  .amount-text {
    font-weight: 600;
    color: var(--xhs-success);
  }

  .chart-container {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: var(--xhs-text-primary);
      }
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--xhs-bg-color);
      border-radius: 12px;
    }
  }

  .progress-text {
    margin-left: 8px;
    font-size: 12px;
    color: var(--xhs-text-secondary);
  }

  :deep(.el-button--primary) {
    @include xhs-button-primary;
  }

  :deep(.el-table) {
    .el-table__header {
      th {
        background: var(--xhs-bg-color);
        color: var(--xhs-text-primary);
        font-weight: 600;
      }
    }

    .el-table__row {
      &:hover {
        background: rgba(255, 184, 0, 0.05);
      }
    }
  }

  :deep(.el-form-item__label) {
    color: var(--xhs-text-primary);
    font-weight: 500;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--xhs-primary);
    }

    &.is-focus {
      border-color: var(--xhs-primary);
      box-shadow: 0 0 0 2px rgba(255, 184, 0, 0.2);
    }
  }

  :deep(.el-date-editor) {
    .el-input__wrapper {
      border-radius: 8px;
    }
  }

  :deep(.el-select) {
    .el-select__wrapper {
      border-radius: 8px;
    }
  }

  :deep(.el-tabs__header) {
    .el-tabs__item {
      color: var(--xhs-text-secondary);
      font-weight: 500;

      &.is-active {
        color: var(--xhs-primary);
      }
    }
  }
}
</style>