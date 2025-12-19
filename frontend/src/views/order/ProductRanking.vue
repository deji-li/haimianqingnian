<template>
  <div class="product-ranking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>商品排行榜</h2>
      <p class="page-desc">实时展示各课程销售排名</p>
    </div>

    <!-- 筛选条件卡片 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" :inline="true" class="filter-form">
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

        <el-form-item label="校区">
          <el-select v-model="queryParams.campusId" placeholder="全部校区" clearable style="width: 120px" @change="handleQuery">
            <el-option
              v-for="campus in campuses"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-select v-model="queryParams.sortBy" placeholder="排序方式" style="width: 120px" @change="handleQuery">
            <el-option label="销量" value="quantity" />
            <el-option label="金额" value="amount" />
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card stat-card-1">
          <div class="stat-header">
            <span class="stat-label">总销量</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalQuantity }}</div>
            <div class="stat-unit">节课</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-2">
          <div class="stat-header">
            <span class="stat-label">商品总数</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalProducts }}</div>
            <div class="stat-unit">种</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-3">
          <div class="stat-header">
            <span class="stat-label">总销售额</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(totalAmount) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-4">
          <div class="stat-header">
            <span class="stat-label">平均单价</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(avgPrice) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品排行榜卡片 -->
    <div class="ranking-section">
      <div class="section-title">
        <h3>{{ queryParams.sortBy === 'quantity' ? '课程销量排行' : '课程销售额排行' }}</h3>
        <el-button type="primary" text size="small" @click="exportData">导出数据</el-button>
      </div>

      <div v-loading="loading" class="ranking-list-container">
        <div v-if="productList.length === 0" class="empty-state">
          <el-empty description="暂无排行数据" />
        </div>
        <div v-else class="ranking-list">
          <div v-for="(item, index) in productList" :key="item.courseName" class="ranking-item" :class="`rank-${index + 1}`">
            <!-- 排名徽章 -->
            <div class="rank-badge">
              <span v-if="index === 0" class="badge gold">🥇</span>
              <span v-else-if="index === 1" class="badge silver">🥈</span>
              <span v-else-if="index === 2" class="badge bronze">🥉</span>
              <span v-else class="badge">{{ index + 1 }}</span>
            </div>

            <!-- 课程信息 -->
            <div class="course-info">
              <div class="course-name">{{ item.courseName || '未知课程' }}</div>
              <div class="course-meta">校区: {{ item.campusName || '未知校区' }}</div>
            </div>

            <!-- 销售数据 -->
            <div class="sales-data">
              <div class="data-item">
                <span class="label">销量</span>
                <span class="value">{{ (parseFloat(item.quantity) || 0).toFixed(0) }} 节</span>
              </div>
              <div class="data-item">
                <span class="label">金额</span>
                <span class="value">¥{{ formatMoney(parseFloat(item.totalAmount) || 0) }}</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="sales-info">
              <div class="amount">¥{{ formatMoney(parseFloat(item.totalAmount) || 0) }}</div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: totalAmount > 0 ? Math.round(((parseFloat(item.totalAmount) || 0) / totalAmount) * 100) + '%' : '0%', backgroundColor: getProgressColor(index) }"></div>
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
import { getCampusList } from '@/api/campus'

// 查询参数
const queryParams = reactive({
  timeRange: 'month',
  campusId: null as number | null,
  sortBy: 'quantity' as 'quantity' | 'amount',
  startDate: '',
  endDate: ''
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 数据
const productList = ref<any[]>([])
const campuses = ref<any[]>([])
const loading = ref(false)
const totalStats = ref({
  totalOrders: 0,
  totalQuantity: 0,
  totalAmount: 0,
  totalProducts: 0
})

// 统计数据（使用后端返回的总统计）
const totalQuantity = computed(() => {
  return totalStats.value.totalQuantity || 0
})

const totalAmount = computed(() => {
  return totalStats.value.totalAmount || 0
})

const avgPrice = computed(() => {
  if (totalQuantity.value === 0) return 0
  return totalAmount.value / totalQuantity.value
})

// 加载数据
const handleQuery = async () => {
  try {
    loading.value = true

    // 构建API参数，让后端处理时间范围计算
    const params = new URLSearchParams({
      timeRange: queryParams.timeRange,
      sortBy: queryParams.sortBy
    })

    // 如果是自定义时间，才传递日期参数
    if (queryParams.timeRange === 'custom' && queryParams.startDate && queryParams.endDate) {
      params.append('startDate', queryParams.startDate)
      params.append('endDate', queryParams.endDate)
    }

    // 如果有校区筛选，添加校区参数
    if (queryParams.campusId) {
      params.append('campusId', queryParams.campusId.toString())
    }

    // 使用专门的产品排行榜API
    const url = `/api/ranking/product?${params.toString()}`
    console.log('请求URL:', url)
    console.log('时间范围:', queryParams.timeRange)
    console.log('自定义日期:', queryParams.startDate, queryParams.endDate)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    const result = await response.json()
    console.log('API响应:', result)

    if (result.code === 200 || result.status === 'ok') {
      // 后端返回的数据结构: {code: 200, data: {data: [...], total: {...}, ...}}
      productList.value = result.data?.data || []
      totalStats.value = result.data?.total || {
        totalOrders: 0,
        totalQuantity: 0,
        totalAmount: 0,
        totalProducts: 0
      }
      console.log('设置的商品列表数据:', productList.value)
      console.log('总统计数据:', totalStats.value)
      console.log('第一条数据示例:', productList.value[0])
    } else {
      console.error('API返回错误:', result)
      productList.value = []
      totalStats.value = { totalOrders: 0, totalQuantity: 0, totalAmount: 0, totalProducts: 0 }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    queryParams.startDate = customDateRange.value[0]
    queryParams.endDate = customDateRange.value[1]
    handleQuery()
  }
}

// 重置筛选
const handleReset = () => {
  queryParams.timeRange = 'month'
  queryParams.campusId = null
  queryParams.sortBy = 'quantity'
  queryParams.startDate = ''
  queryParams.endDate = ''
  customDateRange.value = []
  handleQuery()
}

// 加载校区列表
const loadCampuses = async () => {
  try {
    const response = await getCampusList()
    campuses.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('加载校区列表失败:', error)
  }
}

// 格式化金额
const formatMoney = (value: number): string => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// 获取进度条颜色
const getProgressColor = (index: number): string => {
  if (index === 0) return '#ffd700'
  if (index === 1) return '#c0c0c0'
  if (index === 2) return '#cd7f32'
  return '#ffa500'
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessage.info(`课程详情功能开发中...`)
}

// 导出数据
const exportData = () => {
  ElMessage.info(`导出功能开发中...`)
}

// 生命周期
onMounted(() => {
  loadCampuses()
  handleQuery()
})
</script>

<style scoped lang="scss">
.product-ranking {
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
          grid-template-columns: 60px 1fr 150px 200px 120px;
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

          .course-info {
            min-width: 0;

            .course-name {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 6px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .course-meta {
              font-size: 12px;
              color: #909399;
            }
          }

          .sales-data {
            display: flex;
            flex-direction: column;
            gap: 8px;

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
