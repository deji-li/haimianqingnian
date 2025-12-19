<template>
  <div class="teacher-ranking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>老师排行榜</h2>
      <p class="page-desc">实时展示老师业绩排名</p>
    </div>

    <!-- 筛选条件卡片 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="排名维度">
          <el-select v-model="queryParams.type" placeholder="请选择" style="width: 140px" @change="handleQuery">
            <el-option label="提成金额" value="commission" />
            <el-option label="订单数量" value="orderCount" />
            <el-option label="学员数量" value="studentCount" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-select v-model="queryParams.timeRange" placeholder="请选择" style="width: 120px" @change="handleQuery">
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card stat-card-1">
          <div class="stat-header">
            <span class="stat-label">总提成金额</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(totalCommission) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-2">
          <div class="stat-header">
            <span class="stat-label">参与老师</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalTeachers }}</div>
            <div class="stat-unit">人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-3">
          <div class="stat-header">
            <span class="stat-label">总订单数</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalOrders }}</div>
            <div class="stat-unit">单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-4">
          <div class="stat-header">
            <span class="stat-label">总学员数</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStudents }}</div>
            <div class="stat-unit">人</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 老师排行榜卡片 -->
    <div class="ranking-section">
      <div class="section-title">
        <h3>{{ getRankingTitle() }}</h3>
        <el-button type="primary" text size="small" @click="exportData">导出数据</el-button>
      </div>

      <div v-loading="loading" class="ranking-list-container">
        <div v-if="rankingData.length === 0" class="empty-state">
          <el-empty description="暂无排行数据" />
        </div>
        <div v-else class="ranking-list">
          <div v-for="(item, index) in rankingData" :key="item.teacherId" class="ranking-item" :class="`rank-${index + 1}`">
            <!-- 排名徽章 -->
            <div class="rank-badge">
              <span v-if="index === 0" class="badge gold">🥇</span>
              <span v-else-if="index === 1" class="badge silver">🥈</span>
              <span v-else-if="index === 2" class="badge bronze">🥉</span>
              <span v-else class="badge">{{ index + 1 }}</span>
            </div>

            <!-- 老师信息 -->
            <div class="teacher-info">
              <div class="teacher-name">{{ item.teacherName || '未知老师' }}</div>
              <div class="teacher-meta">校区: {{ item.campusName || '未知校区' }}</div>
            </div>

            <!-- 业绩数据 -->
            <div class="performance-data">
              <div class="data-item">
                <span class="label">提成</span>
                <span class="value">¥{{ formatMoney(item.commission || 0) }}</span>
              </div>
              <div class="data-item">
                <span class="label">订单</span>
                <span class="value">{{ item.orderCount || 0 }} 单</span>
              </div>
              <div class="data-item">
                <span class="label">学员</span>
                <span class="value">{{ item.studentCount || 0 }} 人</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="performance-info">
              <div class="amount">{{ formatMainValue(item) }}</div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: getProgressWidth(item, index) + '%', backgroundColor: getProgressColor(index) }"></div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { teacherRankingApi } from '@/api/ranking'

// 查询参数
const queryParams = reactive({
  type: 'commission' as 'commission' | 'orderCount' | 'studentCount',
  timeRange: 'month',
  startDate: '',
  endDate: ''
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 排行榜数据
const rankingData = ref<any[]>([])
const totalStats = ref({
  totalTeachers: 0,
  totalCommission: 0,
  totalOrders: 0,
  totalStudents: 0,
  totalRevenue: 0
})

// 加载状态
const loading = ref(false)

// 使用后端返回的总统计数据
const totalCommission = computed(() => {
  return totalStats.value.totalCommission || 0
})

const totalOrders = computed(() => {
  return totalStats.value.totalOrders || 0
})

const totalStudents = computed(() => {
  return totalStats.value.totalStudents || 0
})

// 最大值（用于计算进度条）
const maxValue = computed(() => {
  if (rankingData.value.length === 0) return 0
  const fieldMap = {
    commission: 'commission',
    orderCount: 'orderCount',
    studentCount: 'studentCount'
  }
  const field = fieldMap[queryParams.type]
  return Math.max(...rankingData.value.map(item => parseFloat(item[field]) || 0))
})

// 方法
const getRankingTitle = () => {
  const titleMap = {
    commission: '老师提成排行',
    orderCount: '老师订单排行',
    studentCount: '老师学员排行'
  }
  return titleMap[queryParams.type] || '老师排行'
}

const formatMainValue = (item: any) => {
  if (queryParams.type === 'commission') {
    return `¥${formatMoney(item.commission || 0)}`
  } else if (queryParams.type === 'orderCount') {
    return `${item.orderCount || 0}单`
  } else {
    return `${item.studentCount || 0}人`
  }
}

const getProgressWidth = (item: any, index: number) => {
  if (maxValue.value === 0) return 0
  const fieldMap = {
    commission: 'commission',
    orderCount: 'orderCount',
    studentCount: 'studentCount'
  }
  const field = fieldMap[queryParams.type]
  const value = parseFloat(item[field]) || 0
  return Math.round((value / maxValue.value) * 100)
}

const getProgressColor = (index: number): string => {
  if (index === 0) return '#ffd700'
  if (index === 1) return '#c0c0c0'
  if (index === 2) return '#cd7f32'
  return '#ffa500'
}

const formatMoney = (value: number): string => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// 处理日期变化
const handleDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    queryParams.startDate = customDateRange.value[0]
    queryParams.endDate = customDateRange.value[1]
    handleQuery()
  }
}

// 加载数据
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

    const response = await teacherRankingApi(params)
    console.log('API完整响应:', response)

    rankingData.value = response.data || []
    totalStats.value = response.total || {
      totalTeachers: 0,
      totalCommission: 0,
      totalOrders: 0,
      totalStudents: 0,
      totalRevenue: 0
    }

    console.log('老师排行榜数据:', rankingData.value)
    console.log('总统计数据:', totalStats.value)

    if (rankingData.value.length === 0) {
      ElMessage.info('当前条件下暂无排行榜数据')
    }
  } catch (error) {
    console.error('获取老师排行榜数据失败:', error)
    ElMessage.error('获取排行榜数据失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const handleReset = () => {
  queryParams.type = 'commission'
  queryParams.timeRange = 'month'
  queryParams.startDate = ''
  queryParams.endDate = ''
  customDateRange.value = []
  handleQuery()
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`老师详情功能开发中...`)
}

// 导出数据
const exportData = () => {
  ElMessage.info(`导出功能开发中...`)
}

// 生命周期
onMounted(() => {
  handleQuery()
})
</script>

<style scoped lang="scss">
.teacher-ranking {
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

      &.stat-card-2 {
        background: linear-gradient(135deg, #ffa500 0%, #ff9500 100%);
        box-shadow: 0 4px 20px rgba(255, 165, 0, 0.25);

        &:hover {
          box-shadow: 0 6px 30px rgba(255, 165, 0, 0.35);
        }
      }

      &.stat-card-3 {
        background: linear-gradient(135deg, #ffcc00 0%, #ffb300 100%);
        box-shadow: 0 4px 20px rgba(255, 204, 0, 0.25);

        &:hover {
          box-shadow: 0 6px 30px rgba(255, 204, 0, 0.35);
        }
      }

      &.stat-card-4 {
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

        .stat-unit {
          font-size: 12px;
          opacity: 0.75;
          font-weight: 500;
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
          grid-template-columns: 60px 1fr 280px 200px 120px;
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

          .teacher-info {
            min-width: 0;

            .teacher-name {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 6px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .teacher-meta {
              font-size: 12px;
              color: #909399;
            }
          }

          .performance-data {
            display: flex;
            gap: 20px;

            .data-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;

              .label {
                font-size: 12px;
                color: #909399;
              }

              .value {
                font-size: 14px;
                font-weight: 600;
                color: #ffd700;
              }
            }
          }

          .performance-info {
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
