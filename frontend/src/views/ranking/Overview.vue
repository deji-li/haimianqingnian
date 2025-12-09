<template>
  <div class="ranking-overview">
    <div class="page-header">
      <h2>排行榜总览</h2>
      <p class="page-desc">综合展示各类排行榜数据，提供全面的业绩分析</p>
    </div>

    <!-- 快速筛选 -->
    <el-card class="filter-card">
      <el-form :model="globalParams" :inline="true" class="filter-form">
        <el-form-item label="时间范围">
          <el-select v-model="globalParams.timeRange" placeholder="请选择" style="width: 120px" @change="refreshAllData">
            <el-option label="今日" value="day" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="globalParams.timeRange === 'custom'" label="自定义时间">
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleCustomDateChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="refreshAllData" :loading="globalLoading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 总览统计卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card campus">
          <div class="card-header">
            <el-icon class="card-icon"><OfficeBuilding /></el-icon>
            <div class="card-title">校区业绩</div>
          </div>
          <div class="card-stats">
            <div class="main-stat">
              <div class="value">{{ totalCampusRevenue }}</div>
              <div class="label">总收入</div>
            </div>
            <div class="sub-stats">
              <div class="stat-item">
                <span class="label">校区数:</span>
                <span class="value">{{ campusCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均收入:</span>
                <span class="value">{{ avgCampusRevenue }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="overview-card teacher">
          <div class="card-header">
            <el-icon class="card-icon"><User /></el-icon>
            <div class="card-title">老师业绩</div>
          </div>
          <div class="card-stats">
            <div class="main-stat">
              <div class="value">{{ totalTeacherCommission }}</div>
              <div class="label">总提成</div>
            </div>
            <div class="sub-stats">
              <div class="stat-item">
                <span class="label">老师数:</span>
                <span class="value">{{ teacherCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均提成:</span>
                <span class="value">{{ avgTeacherCommission }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="overview-card sales">
          <div class="card-header">
            <el-icon class="card-icon"><Trophy /></el-icon>
            <div class="card-title">销售业绩</div>
          </div>
          <div class="card-stats">
            <div class="main-stat">
              <div class="value">{{ totalSalesRevenue }}</div>
              <div class="label">总销售额</div>
            </div>
            <div class="sub-stats">
              <div class="stat-item">
                <span class="label">销售数:</span>
                <span class="value">{{ salesCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均销售:</span>
                <span class="value">{{ avgSalesRevenue }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="overview-card order">
          <div class="card-header">
            <el-icon class="card-icon"><Document /></el-icon>
            <div class="card-title">订单统计</div>
          </div>
          <div class="card-stats">
            <div class="main-stat">
              <div class="value">{{ totalOrderCount }}</div>
              <div class="label">总订单数</div>
            </div>
            <div class="sub-stats">
              <div class="stat-item">
                <span class="label">平均金额:</span>
                <span class="value">{{ avgOrderAmount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">完成率:</span>
                <span class="value">{{ orderCompletionRate }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细排行榜 -->
    <el-row :gutter="20" class="ranking-section">
      <!-- 校区排行榜 -->
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header-content">
              <h3>校区排行榜</h3>
              <el-button type="text" @click="goToCampusRanking">查看详情 →</el-button>
            </div>
          </template>
          <div v-loading="campusLoading">
            <div v-if="campusRanking.length === 0" class="empty-state">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="ranking-list">
              <div
                v-for="(item, index) in campusRanking.slice(0, 5)"
                :key="item.campusId"
                class="ranking-item"
              >
                <div class="rank" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                <div class="content">
                  <div class="name">{{ item.campusName }}</div>
                  <div class="value">¥{{ item.totalRevenue?.toFixed(2) || '0.00' }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 老师排行榜 -->
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header-content">
              <h3>老师排行榜</h3>
              <el-button type="text" @click="goToTeacherRanking">查看详情 →</el-button>
            </div>
          </template>
          <div v-loading="teacherLoading">
            <div v-if="teacherRanking.length === 0" class="empty-state">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="ranking-list">
              <div
                v-for="(item, index) in teacherRanking.slice(0, 5)"
                :key="item.teacherId"
                class="ranking-item"
              >
                <div class="rank" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                <div class="content">
                  <div class="name">{{ item.teacherName }}</div>
                  <div class="value">¥{{ item.commission?.toFixed(2) || '0.00' }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 销售排行榜 -->
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header-content">
              <h3>销售排行榜</h3>
              <el-button type="text" @click="goToSalesRanking">查看详情 →</el-button>
            </div>
          </template>
          <div v-loading="salesLoading">
            <div v-if="salesRanking.length === 0" class="empty-state">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="ranking-list">
              <div
                v-for="(item, index) in salesRanking.slice(0, 5)"
                :key="item.salesId"
                class="ranking-item"
              >
                <div class="rank" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                <div class="content">
                  <div class="name">{{ item.salesName }}</div>
                  <div class="value">¥{{ item.totalRevenue?.toFixed(2) || '0.00' }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 订单排行榜 -->
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header-content">
              <h3>订单排行榜</h3>
              <el-button type="text" @click="goToOrderRanking">查看详情 →</el-button>
            </div>
          </template>
          <div v-loading="orderLoading">
            <div v-if="orderRanking.length === 0" class="empty-state">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="ranking-list">
              <div
                v-for="(item, index) in orderRanking.slice(0, 5)"
                :key="item.orderNo"
                class="ranking-item"
              >
                <div class="rank" :class="getRankClass(index + 1)">{{ index + 1 }}</div>
                <div class="content">
                  <div class="name">{{ item.customerName }}</div>
                  <div class="value">¥{{ item.paymentAmount?.toFixed(2) || '0.00' }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, OfficeBuilding, User, Trophy, Document } from '@element-plus/icons-vue'
import {
  campusRankingApi,
  teacherRankingApi,
  salesRankingApi,
  orderRankingApi,
  rankingOverviewApi
} from '@/api/ranking'

const router = useRouter()

// 全局参数
const globalParams = reactive({
  timeRange: 'month'
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 各类排行榜数据
const campusRanking = ref<any[]>([])
const teacherRanking = ref<any[]>([])
const salesRanking = ref<any[]>([])
const orderRanking = ref<any[]>([])

// 加载状态
const globalLoading = ref(false)
const campusLoading = ref(false)
const teacherLoading = ref(false)
const salesLoading = ref(false)
const orderLoading = ref(false)

// 计算属性
const totalCampusRevenue = computed(() => {
  return campusRanking.value.reduce((sum, item) => sum + (item.totalRevenue || 0), 0).toFixed(2)
})

const campusCount = computed(() => campusRanking.value.length)

const avgCampusRevenue = computed(() => {
  if (campusCount.value === 0) return '¥0.00'
  const avg = totalCampusRevenue.value / campusCount.value
  return `¥${parseFloat(avg).toFixed(2)}`
})

const totalTeacherCommission = computed(() => {
  return teacherRanking.value.reduce((sum, item) => sum + (item.commission || 0), 0).toFixed(2)
})

const teacherCount = computed(() => teacherRanking.value.length)

const avgTeacherCommission = computed(() => {
  if (teacherCount.value === 0) return '¥0.00'
  const avg = totalTeacherCommission.value / teacherCount.value
  return `¥${parseFloat(avg).toFixed(2)}`
})

const totalSalesRevenue = computed(() => {
  return salesRanking.value.reduce((sum, item) => sum + (item.totalRevenue || 0), 0).toFixed(2)
})

const salesCount = computed(() => salesRanking.value.length)

const avgSalesRevenue = computed(() => {
  if (salesCount.value === 0) return '¥0.00'
  const avg = totalSalesRevenue.value / salesCount.value
  return `¥${parseFloat(avg).toFixed(2)}`
})

const totalOrderCount = computed(() => orderRanking.value.length)

const avgOrderAmount = computed(() => {
  if (totalOrderCount.value === 0) return '¥0.00'
  const total = orderRanking.value.reduce((sum, item) => sum + (item.paymentAmount || 0), 0)
  const avg = total / totalOrderCount.value
  return `¥${parseFloat(avg).toFixed(2)}`
})

const orderCompletionRate = computed(() => {
  if (totalOrderCount.value === 0) return 0
  const completedOrders = orderRanking.value.filter(order =>
    ['已完成', '已支付'].includes(order.orderStatus)
  ).length
  return Math.round((completedOrders / totalOrderCount.value) * 100)
})

// 方法
const getRankClass = (rank: number) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

const handleCustomDateChange = (dates: [string, string]) => {
  if (dates && dates.length === 2) {
    globalParams.startDate = dates[0]
    globalParams.endDate = dates[1]
  } else {
    delete globalParams.startDate
    delete globalParams.endDate
  }
  refreshAllData()
}

const loadCampusRanking = async () => {
  try {
    campusLoading.value = true
    const params = {
      type: 'revenue',
      timeRange: globalParams.timeRange,
      ...globalParams
    }
    const response = await campusRankingApi(params)
    campusRanking.value = response.data.data || []
  } catch (error) {
    console.error('获取校区排行榜失败:', error)
  } finally {
    campusLoading.value = false
  }
}

const loadTeacherRanking = async () => {
  try {
    teacherLoading.value = true
    const params = {
      type: 'commission',
      timeRange: globalParams.timeRange,
      ...globalParams
    }
    const response = await teacherRankingApi(params)
    teacherRanking.value = response.data.data || []
  } catch (error) {
    console.error('获取老师排行榜失败:', error)
  } finally {
    teacherLoading.value = false
  }
}

const loadSalesRanking = async () => {
  try {
    salesLoading.value = true
    const params = {
      timeRange: globalParams.timeRange,
      ...globalParams
    }
    const response = await salesRankingApi(params)
    salesRanking.value = response.data.data || []
  } catch (error) {
    console.error('获取销售排行榜失败:', error)
  } finally {
    salesLoading.value = false
  }
}

const loadOrderRanking = async () => {
  try {
    orderLoading.value = true
    const params = {
      type: 'amount',
      timeRange: globalParams.timeRange,
      ...globalParams
    }
    const response = await orderRankingApi(params)
    orderRanking.value = response.data.data || []
  } catch (error) {
    console.error('获取订单排行榜失败:', error)
  } finally {
    orderLoading.value = false
  }
}

const refreshAllData = async () => {
  globalLoading.value = true
  try {
    await Promise.all([
      loadCampusRanking(),
      loadTeacherRanking(),
      loadSalesRanking(),
      loadOrderRanking()
    ])
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    globalLoading.value = false
  }
}

// 导航方法
const goToCampusRanking = () => {
  router.push('/order/campus-ranking')
}

const goToTeacherRanking = () => {
  router.push('/teacher/ranking')
}

const goToSalesRanking = () => {
  router.push('/analytics/leaderboard')
}

const goToOrderRanking = () => {
  router.push('/order/ranking')
}

// 生命周期
onMounted(() => {
  refreshAllData()
})
</script>

<style scoped lang="scss">
.ranking-overview {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-desc {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      margin: 0;
    }
  }

  .overview-cards {
    margin-bottom: 20px;

    .overview-card {
      height: 140px;
      border: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      &.campus {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.teacher {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.sales {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.order {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .card-icon {
          font-size: 20px;
          margin-right: 8px;
          opacity: 0.9;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          opacity: 0.9;
        }
      }

      .card-stats {
        .main-stat {
          margin-bottom: 12px;

          .value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
          }

          .label {
            font-size: 12px;
            opacity: 0.8;
          }
        }

        .sub-stats {
          .stat-item {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 4px;
            opacity: 0.8;

            .label {
              opacity: 0.7;
            }

            .value {
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  .ranking-section {
    .ranking-card {
      height: 320px;
      margin-bottom: 20px;

      .card-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .empty-state {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ranking-list {
        .ranking-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .rank {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            margin-right: 12px;
            font-size: 14px;

            &.gold {
              background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
              color: #8b4513;
            }
            &.silver {
              background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
              color: #696969;
            }
            &.bronze {
              background: linear-gradient(135deg, #cd7f32 0%, #e6a55c 100%);
              color: #8b4513;
            }
            &:not(.gold):not(.silver):not(.bronze) {
              background: #f0f0f0;
              color: #909399;
            }
          }

          .content {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .name {
              font-size: 14px;
              color: #303133;
              font-weight: 500;
            }

            .value {
              font-size: 14px;
              font-weight: 600;
              color: #67c23a;
            }
          }
        }
      }
    }
  }
}
</style>