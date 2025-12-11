<template>
  <div class="sales-ranking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>销售排行榜</h2>
      <p class="page-desc">实时展示销售团队业绩排名</p>
    </div>

    <!-- 筛选条件卡片 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="时间范围">
          <el-select v-model="queryParams.timeRange" placeholder="请选择" style="width: 120px" @change="loadData">
            <el-option label="今日" value="day" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="queryParams.timeRange === 'custom'" label="自定义时间">
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item label="部门">
          <el-select v-model="queryParams.departmentId" placeholder="全部部门" clearable style="width: 120px" @change="loadData">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="校区">
          <el-select v-model="queryParams.campusId" placeholder="全部校区" clearable style="width: 120px" @change="loadData">
            <el-option
              v-for="campus in campuses"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-select v-model="queryParams.sortBy" placeholder="排序方式" style="width: 120px" @change="loadData">
            <el-option label="销售额" value="totalAmount" />
            <el-option label="订单数" value="orderCount" />
            <el-option label="客户数" value="customerCount" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 团队统计卡片 -->
    <el-row :gutter="20" class="stats-cards" v-if="overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="stat-label">总销售额</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(overview.totalAmount) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="stat-label">销售人数</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalMembers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="stat-label">总订单数</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-header">
            <span class="stat-label">人均销售额</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(overview.avgAmountPerMember) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售排行榜卡片 -->
    <div class="ranking-section">
      <div class="section-title">
        <h3>销售人员排行榜</h3>
        <el-button type="primary" text size="small" @click="exportData">导出数据</el-button>
      </div>

      <div v-loading="loading" class="ranking-list-container">
        <div v-if="rankingData.length === 0" class="empty-state">
          <el-empty description="暂无排行数据" />
        </div>
        <div v-else class="ranking-list">
          <div v-for="(item, index) in rankingData" :key="item.userId" class="ranking-item" :class="`rank-${item.rank}`">
            <!-- 排名徽章 -->
            <div class="rank-badge">
              <span v-if="item.rank === 1" class="badge gold">🥇</span>
              <span v-else-if="item.rank === 2" class="badge silver">🥈</span>
              <span v-else-if="item.rank === 3" class="badge bronze">🥉</span>
              <span v-else class="badge">{{ item.rank }}</span>
            </div>

            <!-- 销售人员信息 -->
            <div class="member-info">
              <div class="member-name">{{ item.realName || item.userName }}</div>
              <div class="member-meta">{{ item.departmentName }} | {{ item.campusName }}</div>
            </div>

            <!-- 销售数据统计 -->
            <div class="sales-stats">
              <div class="stat-item">
                <span class="label">销售额</span>
                <span class="value">¥{{ formatMoney(item.totalAmount) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">订单数</span>
                <span class="value">{{ item.orderCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">客户数</span>
                <span class="value">{{ item.customerCount }}</span>
              </div>
            </div>

            <!-- 销售额和进度条 -->
            <div class="sales-info">
              <div class="amount">¥{{ formatMoney(item.totalAmount) }}</div>
              <div class="progress-wrapper" v-if="overview && overview.totalAmount">
                <div class="progress-bar" :style="{ width: Math.round((item.totalAmount / overview.totalAmount) * 100) + '%', backgroundColor: getProgressColor(item.rank) }"></div>
              </div>
            </div>

            <!-- 操作 -->
            <div class="actions">
              <el-button type="primary" text size="small" @click="viewDetail(item)">详情</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getTeamMemberPerformance, getTeamOverview } from '@/api/team-stats'
import { getCampusList } from '@/api/campus'

// 查询参数
const queryParams = reactive({
  timeRange: 'month',
  departmentId: null as number | null,
  campusId: null as number | null,
  sortBy: 'totalAmount' as 'totalAmount' | 'orderCount' | 'customerCount',
  startDate: '',
  endDate: ''
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 数据
const rankingData = ref<any[]>([])
const overview = ref<any>(null)
const departments = ref<any[]>([])
const campuses = ref<any[]>([])
const loading = ref(false)

// 加载数据
const loadData = async () => {
  try {
    loading.value = true

    // 计算日期范围
    const now = new Date()
    let startDate = queryParams.startDate
    let endDate = queryParams.endDate

    if (queryParams.timeRange === 'month' && !startDate) {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      startDate = firstDay.toISOString().split('T')[0]
      endDate = now.toISOString().split('T')[0]
    } else if (queryParams.timeRange === 'day' && !startDate) {
      const today = now.toISOString().split('T')[0]
      startDate = today
      endDate = today
    } else if (queryParams.timeRange === 'week' && !startDate) {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      startDate = weekAgo.toISOString().split('T')[0]
      endDate = now.toISOString().split('T')[0]
    } else if (queryParams.timeRange === 'year' && !startDate) {
      const yearAgo = new Date(now.getFullYear(), 0, 1)
      startDate = yearAgo.toISOString().split('T')[0]
      endDate = now.toISOString().split('T')[0]
    }

    // 获取销售排行数据
    const params: any = {
      sortBy: queryParams.sortBy,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(queryParams.departmentId && { departmentId: queryParams.departmentId }),
      ...(queryParams.campusId && { campusId: queryParams.campusId })
    }

    const [performanceRes, overviewRes] = await Promise.all([
      getTeamMemberPerformance(params),
      getTeamOverview(params)
    ])

    // 添加排名
    rankingData.value = (Array.isArray(performanceRes) ? performanceRes : []).map((item: any, index: number) => ({
      ...item,
      rank: index + 1
    }))

    overview.value = overviewRes
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载部门和校区列表
const loadFilters = async () => {
  try {
    const campusRes = await getCampusList()
    campuses.value = Array.isArray(campusRes) ? campusRes : []
    // departments 需要从系统管理模块获取，暂时使用空数组
    departments.value = []
  } catch (error) {
    console.error('加载筛选列表失败:', error)
  }
}

// 处理日期变化
const handleDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    queryParams.startDate = customDateRange.value[0]
    queryParams.endDate = customDateRange.value[1]
    loadData()
  }
}

// 重置筛选
const resetFilter = () => {
  queryParams.timeRange = 'month'
  queryParams.departmentId = null
  queryParams.campusId = null
  queryParams.sortBy = 'totalAmount'
  queryParams.startDate = ''
  queryParams.endDate = ''
  customDateRange.value = []
  loadData()
}

// 格式化金额
const formatMoney = (value: number): string => {
  if (!value) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// 获取进度条颜色
const getProgressColor = (rank: number): string => {
  if (rank === 1) return '#f56c6c'
  if (rank === 2) return '#e6a23c'
  if (rank === 3) return '#67c23a'
  return '#409eff'
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`销售人员详情功能开发中...`)
}

// 导出数据
const exportData = () => {
  ElMessage.info(`导出功能开发中...`)
}

// 生命周期
onMounted(() => {
  loadFilters()
  loadData()
})
</script>

<style scoped lang="scss">
.sales-ranking {
  padding: 20px;
  background: #f5f7fa;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-desc {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .filter-card {
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  }

  .stats-cards {
    margin-bottom: 30px;

    .stat-card {
      height: 100%;
      background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
      color: #333;
      border: none;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.25);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: translate(30%, -30%);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 30px rgba(255, 215, 0, 0.35);
      }

      &:nth-child(2) {
        background: linear-gradient(135deg, #ffa500 0%, #ff9500 100%);
        box-shadow: 0 4px 20px rgba(255, 165, 0, 0.25);

        &:hover {
          box-shadow: 0 6px 30px rgba(255, 165, 0, 0.35);
        }
      }

      &:nth-child(3) {
        background: linear-gradient(135deg, #ffcc00 0%, #ffb300 100%);
        box-shadow: 0 4px 20px rgba(255, 204, 0, 0.25);

        &:hover {
          box-shadow: 0 6px 30px rgba(255, 204, 0, 0.35);
        }
      }

      &:nth-child(4) {
        background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
        box-shadow: 0 4px 20px rgba(255, 193, 7, 0.25);

        &:hover {
          box-shadow: 0 6px 30px rgba(255, 193, 7, 0.35);
        }
      }

      .stat-header {
        margin-bottom: 16px;

        .stat-label {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.85;
        }
      }

      .stat-content {
        position: relative;
        z-index: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }
      }
    }
  }

  .ranking-section {
    margin-top: 20px;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 0 16px 0;
      border-bottom: 2px solid #ffd700;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #303133;
      }
    }

    .ranking-list-container {
      .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }

      .ranking-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .ranking-item {
          display: grid;
          grid-template-columns: 60px 1fr 180px 200px 120px;
          gap: 20px;
          align-items: center;
          padding: 16px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border-left: 4px solid #ffd700;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%);
            pointer-events: none;
          }

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(255, 215, 0, 0.15);
          }

          &.rank-1 {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, white 100%);
            border-left-color: #ffd700;
            padding: 20px;

            .rank-badge .badge.gold {
              font-size: 32px;
            }
          }

          &.rank-2 {
            border-left-color: #c0c0c0;
          }

          &.rank-3 {
            border-left-color: #cd7f32;
          }

          .rank-badge {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;

            .badge {
              font-size: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
              border-radius: 50%;
              font-weight: bold;
              color: white;
              box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);

              &.gold {
                font-size: 28px;
              }

              &.silver {
                background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
                box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
              }

              &.bronze {
                background: linear-gradient(135deg, #cd7f32 0%, #b8730c 100%);
                box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
              }
            }
          }

          .member-info {
            min-width: 0;

            .member-name {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 6px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .member-meta {
              font-size: 12px;
              color: #909399;
            }
          }

          .sales-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .stat-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;

              .label {
                font-size: 11px;
                color: #909399;
              }

              .value {
                font-size: 13px;
                font-weight: 600;
                color: #ffd700;
              }
            }
          }

          .sales-info {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .amount {
              font-size: 18px;
              font-weight: 700;
              color: #ffd700;
            }

            .progress-wrapper {
              height: 6px;
              background: #f0f0f0;
              border-radius: 3px;
              overflow: hidden;

              .progress-bar {
                height: 100%;
                border-radius: 3px;
                transition: width 0.3s ease;
                min-width: 2px;
              }
            }
          }

          .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>
