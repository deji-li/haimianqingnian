<template>
  <div class="order-ranking">
    <div class="page-header">
      <h2>订单排行榜</h2>
      <p class="page-desc">展示订单金额、数量等维度的排名情况</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="排名类型">
          <el-select v-model="queryParams.type" placeholder="请选择" style="width: 120px">
            <el-option label="订单金额" value="amount" />
            <el-option label="订单数量" value="count" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-select v-model="queryParams.timeRange" placeholder="请选择" style="width: 120px">
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
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleCustomDateChange"
          />
        </el-form-item>

        <el-form-item label="校区">
          <el-select v-model="queryParams.campusId" placeholder="全部校区" clearable style="width: 150px">
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 排行榜数据 -->
    <el-card class="ranking-card">
      <div v-loading="loading" class="ranking-content">
        <!-- 空状态 -->
        <el-empty v-if="!loading && rankingData.length === 0" description="暂无排行榜数据" />

        <!-- 排行榜表格 -->
        <el-table v-else :data="rankingData" stripe style="width: 100%">
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ $index }">
              <div class="rank-badge" :class="getRankClass($index + 1)">
                {{ $index + 1 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="订单号" prop="orderNo" min-width="180" />
          <el-table-column label="客户姓名" prop="customerName" width="120" />
          <el-table-column label="课程名称" prop="courseName" min-width="150" />
          <el-table-column label="校区" prop="campusName" width="120" />
          <el-table-column label="销售" prop="salesName" width="100" />
          <el-table-column label="老师" prop="teacherName" width="100" />

          <el-table-column label="订单金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount">¥{{ row.paymentAmount?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="老师提成" width="120" align="right">
            <template #default="{ row }">
              <span class="commission">¥{{ row.teacherCommission?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="支付时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.paymentTime) }}
            </template>
          </el-table-column>

          <el-table-column label="订单状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.orderStatus)">
                {{ row.orderStatus }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleViewOrder(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 统计概览 -->
    <el-row v-if="rankingData.length > 0" :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ totalAmount.toFixed(2) }}</div>
              <div class="stat-label">总订单金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon order">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ rankingData.length }}</div>
              <div class="stat-label">总订单数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon commission">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ totalCommission.toFixed(2) }}</div>
              <div class="stat-label">总老师提成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon avg">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ averageAmount.toFixed(2) }}</div>
              <div class="stat-label">平均订单金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Money, Document, User, TrendCharts } from '@element-plus/icons-vue'
import { orderRankingApi } from '@/api/ranking'
import { getCampusList } from '@/api/campus'

// 查询参数
const queryParams = reactive({
  type: 'amount',
  timeRange: 'month',
  campusId: null
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 排行榜数据
const rankingData = ref<any[]>([])

// 校区列表
const campusList = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 计算属性
const totalAmount = computed(() => {
  return rankingData.value.reduce((sum, item) => sum + (item.paymentAmount || 0), 0)
})

const totalCommission = computed(() => {
  return rankingData.value.reduce((sum, item) => sum + (item.teacherCommission || 0), 0)
})

const averageAmount = computed(() => {
  if (rankingData.value.length === 0) return 0
  return totalAmount.value / rankingData.value.length
})

// 方法
const getRankClass = (rank: number) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '待支付': 'warning',
    '已支付': 'success',
    '已完成': 'success',
    '已取消': 'danger',
    '已退款': 'info'
  }
  return statusMap[status] || 'info'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const handleCustomDateChange = (dates: [string, string]) => {
  if (dates && dates.length === 2) {
    queryParams.startDate = dates[0]
    queryParams.endDate = dates[1]
  } else {
    delete queryParams.startDate
    delete queryParams.endDate
  }
}

const handleQuery = async () => {
  try {
    loading.value = true

    const params: any = {
      type: queryParams.type,
      timeRange: queryParams.timeRange
    }

    if (queryParams.timeRange === 'custom' && queryParams.startDate && queryParams.endDate) {
      params.startDate = queryParams.startDate
      params.endDate = queryParams.endDate
    }

  if (queryParams.campusId) {
      params.campusId = queryParams.campusId
    }

  const response = await orderRankingApi(params)
    rankingData.value = response.data.data || []

    if (rankingData.value.length === 0) {
      ElMessage.info('当前条件下暂无排行榜数据')
    }
  } catch (error) {
    console.error('获取订单排行榜数据失败:', error)
    ElMessage.error('获取排行榜数据失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.type = 'amount'
  queryParams.timeRange = 'month'
  queryParams.campusId = null
  customDateRange.value = []
  delete queryParams.startDate
  delete queryParams.endDate
  handleQuery()
}

const handleViewOrder = (order: any) => {
  // 这里可以跳转到订单详情页面
  console.log('查看订单详情:', order)
  ElMessage.info('订单详情功能开发中...')
}

const loadCampusList = async () => {
  try {
    const response = await getCampusList()
    campusList.value = response.data.data || []
  } catch (error) {
    console.error('获取校区列表失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadCampusList()
  handleQuery()
})
</script>

<style scoped lang="scss">
.order-ranking {
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

  .ranking-card {
    margin-bottom: 20px;

    .ranking-content {
      min-height: 400px;

      .rank-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        margin: 0 auto;

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
      }

      .amount {
        color: #67c23a;
        font-weight: 600;
      }

      .commission {
        color: #e6a23c;
        font-weight: 600;
      }
    }
  }

  .stats-row {
    .stat-card {
      .stat-item {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          &.amount {
            background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
          }

          &.order {
            background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
          }

          &.commission {
            background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
          }

          &.avg {
            background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          }

          .el-icon {
            font-size: 24px;
            color: white;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>