<template>
  <div class="teacher-ranking">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>
            <span class="trophy-icon">🏆</span>
            老师业绩排行榜
            <span class="sparkle-icon">✨</span>
          </h1>
          <p class="subtitle">实时展示老师教学业绩，���励卓越表现，共创美好未来</p>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-card class="filter-card" shadow="hover">
        <div class="filter-content">
          <el-form :model="queryParams" :inline="true" class="filter-form">
            <el-form-item label="🎯 排名维度">
              <el-select
                v-model="queryParams.type"
                placeholder="选择排名维度"
                class="custom-select"
                style="width: 160px"
              >
                <el-option label="💰 提成金额" value="commission" />
                <el-option label="📋 订单数量" value="orderCount" />
                <el-option label="👥 学员数量" value="studentCount" />
              </el-select>
            </el-form-item>

            <el-form-item label="📅 时间范围">
              <el-select
                v-model="queryParams.timeRange"
                placeholder="选择时间范围"
                class="custom-select"
                style="width: 160px"
              >
                <el-option label="🌞 今日" value="day" />
                <el-option label="📆 本周" value="week" />
                <el-option label="🗓️ 本月" value="month" />
                <el-option label="📊 本年" value="year" />
                <el-option label="⚙️ 自定义" value="custom" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="queryParams.timeRange === 'custom'" label="🗓️ 自定义时间">
              <el-date-picker
                v-model="customDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleCustomDateChange"
                class="custom-date-picker"
              />
            </el-form-item>

            <el-form-item class="filter-actions">
              <el-button
                type="primary"
                @click="handleQuery"
                :loading="loading"
                class="primary-btn"
              >
                <el-icon><Search /></el-icon>
                查询数据
              </el-button>
              <el-button @click="handleReset" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置筛选
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 排行榜内容 -->
    <div class="ranking-section">
      <el-card class="ranking-card" shadow="hover">
        <div v-loading="loading" class="ranking-content">

          <!-- 空状态 -->
          <div v-if="!loading && rankingData.length === 0" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">🏆</div>
              <h3 class="empty-title">暂无排行榜数据</h3>
              <p class="empty-description">请尝试调整筛选条件或等待数据更新</p>
              <div class="empty-decorations">
                <span class="decoration-star" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.1 + 's' }">⭐</span>
              </div>
            </div>
          </div>

          <!-- 排行榜列表 -->
          <div v-else class="ranking-list">
            <!-- 前三名领奖台 -->
            <div v-if="rankingData.length >= 3" class="podium-section">
              <div class="podium-title">
                <span class="title-icon">🎉</span>
                <h3>荣耀领奖台</h3>
              </div>

              <div class="podium-container">
                <!-- 第二名 -->
                <div class="podium-item second-place">
                  <div class="podium-rank">2</div>
                  <div class="podium-crown">🥈</div>
                  <div class="podium-content">
                    <h4 class="teacher-name">{{ rankingData[1]?.teacherName || '未知老师' }}</h4>
                    <p class="teacher-campus">{{ rankingData[1]?.campusName || '未知校区' }}</p>
                    <div class="achievement">
                      <div class="main-value">{{ formatValue(rankingData[1]?.[displayField] || 0) }}</div>
                      <div class="detail-info">{{ getDetailText(rankingData[1]) }}</div>
                    </div>
                  </div>
                  <div class="podium-base"></div>
                </div>

                <!-- 第一名 -->
                <div class="podium-item first-place">
                  <div class="podium-rank">1</div>
                  <div class="podium-crown">👑</div>
                  <div class="podium-content">
                    <h4 class="teacher-name">{{ rankingData[0]?.teacherName || '未知老师' }}</h4>
                    <p class="teacher-campus">{{ rankingData[0]?.campusName || '未知校区' }}</p>
                    <div class="achievement">
                      <div class="main-value">{{ formatValue(rankingData[0]?.[displayField] || 0) }}</div>
                      <div class="detail-info">{{ getDetailText(rankingData[0]) }}</div>
                    </div>
                  </div>
                  <div class="podium-base"></div>
                </div>

                <!-- 第三名 -->
                <div class="podium-item third-place">
                  <div class="podium-rank">3</div>
                  <div class="podium-crown">🥉</div>
                  <div class="podium-content">
                    <h4 class="teacher-name">{{ rankingData[2]?.teacherName || '未知老师' }}</h4>
                    <p class="teacher-campus">{{ rankingData[2]?.campusName || '未知校区' }}</p>
                    <div class="achievement">
                      <div class="main-value">{{ formatValue(rankingData[2]?.[displayField] || 0) }}</div>
                      <div class="detail-info">{{ getDetailText(rankingData[2]) }}</div>
                    </div>
                  </div>
                  <div class="podium-base"></div>
                </div>
              </div>
            </div>

            <!-- 其他排名 -->
            <div v-if="rankingData.length > 3" class="other-ranks-section">
              <div class="section-title">
                <span class="title-icon">📊</span>
                <h3>完整排名</h3>
              </div>

              <div class="ranks-list">
                <div
                  v-for="(item, index) in rankingData.slice(3)"
                  :key="item.teacherId"
                  class="rank-item"
                >
                  <div class="rank-number">{{ index + 4 }}</div>
                  <div class="teacher-info">
                    <div class="teacher-details">
                      <h4 class="teacher-name">{{ item.teacherName }}</h4>
                      <span class="teacher-campus">{{ item.campusName }}</span>
                    </div>
                  </div>
                  <div class="performance">
                    <div class="main-value">{{ formatValue(item[displayField]) }}</div>
                    <div class="detail-info">{{ getDetailText(item) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计概览 -->
    <div v-if="rankingData.length > 0" class="stats-section">
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon teachers">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ rankingData.length }}</div>
            <div class="stat-label">参与老师</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon commission">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatValue(totalCommission) }}</div>
            <div class="stat-label">总提成金额</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalOrders }}</div>
            <div class="stat-label">总订单数量</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon students">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalStudents }}</div>
            <div class="stat-label">总学员数量</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, User, Money, Document, UserFilled } from '@element-plus/icons-vue'
import { teacherRankingApi } from '@/api/ranking'

// 查询参数
const queryParams = reactive({
  type: 'commission',
  timeRange: 'month'
})

// 自定义日期范围
const customDateRange = ref<[string, string]>([])

// 排行榜数据
const rankingData = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 计算属性
const displayField = computed(() => {
  const fieldMap = {
    commission: 'commission',
    orderCount: 'orderCount',
    studentCount: 'studentCount'
  }
  return fieldMap[queryParams.type] || 'commission'
})

const totalCommission = computed(() => {
  return rankingData.value.reduce((sum, item) => sum + (item.commission || 0), 0)
})

const totalOrders = computed(() => {
  return rankingData.value.reduce((sum, item) => sum + (item.orderCount || 0), 0)
})

const totalStudents = computed(() => {
  return rankingData.value.reduce((sum, item) => sum + (item.studentCount || 0), 0)
})

// 方法
const formatValue = (value: number) => {
  if (queryParams.type === 'commission') {
    return `¥${value.toFixed(2)}`
  }
  return value.toString()
}

const getDetailText = (item: any) => {
  const details = []
  if (item.commission) details.push(`提成: ¥${item.commission.toFixed(2)}`)
  if (item.orderCount) details.push(`订单: ${item.orderCount}个`)
  if (item.studentCount) details.push(`学员: ${item.studentCount}人`)
  return details.join(' | ')
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

    const response = await teacherRankingApi(params)
    rankingData.value = response.data || []

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

const handleReset = () => {
  queryParams.type = 'commission'
  queryParams.timeRange = 'month'
  customDateRange.value = []
  delete queryParams.startDate
  delete queryParams.endDate
  handleQuery()
}

// 生命周期
onMounted(() => {
  handleQuery()
})
</script>

<style scoped lang="scss">
// 使用全局金黄色主题变量
.teacher-ranking {
  min-height: 100vh;
  background: var(--xhs-bg-page);
  padding: 40px 24px;

  // 页面头部
  .page-header {
    text-align: center;
    margin-bottom: 48px;

    .header-content {
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      font-size: var(--xhs-font-size-display);
      font-weight: var(--xhs-font-weight-bold);
      color: var(--xhs-text-primary);
      margin: 0 0 16px 0;
      letter-spacing: var(--xhs-letter-spacing-wide);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      line-height: var(--xhs-line-height-tight);

      .trophy-icon {
        font-size: 48px;
        background: var(--xhs-gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sparkle-icon {
        font-size: 32px;
        animation: sparkle 2s ease-in-out infinite;
        color: var(--xhs-primary);
      }
    }

    .subtitle {
      font-size: var(--xhs-font-size-lg);
      color: var(--xhs-text-secondary);
      margin: 0;
      font-weight: var(--xhs-font-weight-normal);
      line-height: var(--xhs-line-height-base);
    }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
  }

  // 筛选区域
  .filter-section {
    margin-bottom: 40px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;

    .filter-card {
      background: var(--xhs-bg-base);
      border-radius: var(--xhs-border-radius-large);
      box-shadow: var(--xhs-shadow-card);
      border: none;

      :deep(.el-card__body) {
        padding: 32px;
      }

      .filter-content {
        .filter-form {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 32px;

          :deep(.el-form-item) {
            margin-bottom: 0;

            .el-form-item__label {
              font-weight: var(--xhs-font-weight-medium);
              color: var(--xhs-text-primary);
              font-size: var(--xhs-font-size-base);
              margin-right: 8px;
            }

            .custom-select {
              .el-input__inner {
                border-radius: var(--xhs-border-radius-small);
                border: 1px solid var(--xhs-border-color);
                background: var(--xhs-bg-base);
                transition: var(--xhs-transition-fast);

                &:focus {
                  border-color: var(--xhs-primary);
                  box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.1);
                }
              }
            }

            .custom-date-picker {
              .el-input__inner {
                border-radius: var(--xhs-border-radius-small);
                border: 1px solid var(--xhs-border-color);
                background: var(--xhs-bg-base);
              }
            }

            &.filter-actions {
              .primary-btn {
                background: var(--xhs-gradient-primary);
                border: none;
                border-radius: var(--xhs-border-radius-base);
                padding: 12px 24px;
                font-weight: var(--xhs-font-weight-medium);
                letter-spacing: var(--xhs-letter-spacing-normal);
                transition: var(--xhs-transition-base);
                box-shadow: var(--xhs-shadow-light);

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: var(--xhs-shadow-base);
                }
              }

              .reset-btn {
                background: var(--xhs-bg-base);
                color: var(--xhs-text-primary);
                border: 1px solid var(--xhs-border-color);
                border-radius: var(--xhs-border-radius-base);
                padding: 12px 24px;
                font-weight: var(--xhs-font-weight-medium);
                transition: var(--xhs-transition-base);

                &:hover {
                  background: var(--xhs-bg-hover);
                  border-color: var(--xhs-primary);
                  transform: translateY(-1px);
                }
              }
            }
          }
        }
      }
    }
  }

  // 排行榜区域
  .ranking-section {
    margin-bottom: 48px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;

    .ranking-card {
      background: var(--xhs-bg-base);
      border-radius: var(--xhs-border-radius-large);
      box-shadow: var(--xhs-shadow-card);
      border: none;
      overflow: hidden;

      :deep(.el-card__body) {
        padding: 0;
      }

      .ranking-content {
        min-height: 400px;
        padding: 40px;
      }

      // 空状态
      .empty-state {
        text-align: center;
        padding: 80px 20px;
        background: var(--xhs-warm);
        border-radius: var(--xhs-border-radius-base);
        margin: 20px 0;

        .empty-content {
          .empty-icon {
            font-size: 72px;
            margin-bottom: 24px;
            background: var(--xhs-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: float 3s ease-in-out infinite;
          }

          .empty-title {
            font-size: var(--xhs-font-size-xl);
            font-weight: var(--xhs-font-weight-semibold);
            color: var(--xhs-text-primary);
            margin: 0 0 12px 0;
          }

          .empty-description {
            font-size: var(--xhs-font-size-base);
            color: var(--xhs-text-secondary);
            margin: 0 0 32px 0;
          }

          .empty-decorations {
            display: flex;
            justify-content: center;
            gap: 12px;

            .decoration-star {
              font-size: 16px;
              color: var(--xhs-primary);
              opacity: 0.6;
              animation: twinkle 2s ease-in-out infinite;
            }
          }
        }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      @keyframes twinkle {
        0%, 100% { opacity: 0.4; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.1); }
      }

      // 排行榜列表
      .ranking-list {
        // 领奖台区域
        .podium-section {
          margin-bottom: 60px;

          .podium-title {
            text-align: center;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;

            .title-icon {
              font-size: 32px;
              color: var(--xhs-primary);
            }

            h3 {
              font-size: var(--xhs-font-size-xxl);
              font-weight: var(--xhs-font-weight-bold);
              color: var(--xhs-text-primary);
              margin: 0;
            }
          }

          .podium-container {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 40px;
            padding: 20px 0;

            .podium-item {
              text-align: center;
              position: relative;
              transition: var(--xhs-transition-base);

              &:hover {
                transform: translateY(-8px);
              }

              .podium-rank {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                width: 40px;
                height: 40px;
                background: var(--xhs-gradient-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: var(--xhs-font-weight-bold);
                font-size: var(--xhs-font-size-lg);
                box-shadow: var(--xhs-shadow-light);
                z-index: 2;
              }

              .podium-crown {
                font-size: 48px;
                margin-bottom: 16px;
                filter: drop-shadow(0 4px 8px rgba(255, 184, 0, 0.3));
              }

              .podium-content {
                background: var(--xhs-bg-base);
                padding: 32px 24px;
                border-radius: var(--xhs-border-radius-base);
                box-shadow: var(--xhs-shadow-card);
                min-width: 200px;
                position: relative;
                z-index: 1;

                .teacher-name {
                  font-size: var(--xhs-font-size-lg);
                  font-weight: var(--xhs-font-weight-semibold);
                  color: var(--xhs-text-primary);
                  margin: 0 0 8px 0;
                  line-height: var(--xhs-line-height-tight);
                }

                .teacher-campus {
                  font-size: var(--xhs-font-size-sm);
                  color: var(--xhs-text-tertiary);
                  margin: 0 0 20px 0;
                }

                .achievement {
                  .main-value {
                    font-size: var(--xhs-font-size-xl);
                    font-weight: var(--xhs-font-weight-bold);
                    color: var(--xhs-primary);
                    margin-bottom: 8px;
                  }

                  .detail-info {
                    font-size: var(--xhs-font-size-xs);
                    color: var(--xhs-text-tertiary);
                    line-height: var(--xhs-line-height-base);
                  }
                }
              }

              .podium-base {
                height: 40px;
                background: var(--xhs-gradient-warm);
                border-radius: 0 0 var(--xhs-border-radius-small) var(--xhs-border-radius-small);
                margin-top: -10px;
                position: relative;
                z-index: 0;
              }

              &.first-place {
                .podium-crown { color: #FFD700; }
                .podium-base {
                  height: 60px;
                  background: var(--xhs-gradient-golden);
                }
                .podium-content {
                  border: 2px solid var(--xhs-primary);
                  box-shadow: var(--xhs-shadow-base);
                }
                .podium-rank {
                  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                }
              }

              &.second-place {
                .podium-crown { color: #C0C0C0; }
                .podium-base { height: 50px; }
                .podium-content {
                  border: 2px solid #C0C0C0;
                }
                .podium-rank {
                  background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
                }
              }

              &.third-place {
                .podium-crown { color: #CD7F32; }
                .podium-base { height: 40px; }
                .podium-content {
                  border: 2px solid #CD7F32;
                }
                .podium-rank {
                  background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
                }
              }
            }
          }
        }

        // 其他排名区域
        .other-ranks-section {
          .section-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--xhs-border-color);

            .title-icon {
              font-size: 24px;
              color: var(--xhs-primary);
            }

            h3 {
              font-size: var(--xhs-font-size-xl);
              font-weight: var(--xhs-font-weight-semibold);
              color: var(--xhs-text-primary);
              margin: 0;
            }
          }

          .ranks-list {
            .rank-item {
              display: flex;
              align-items: center;
              padding: 20px 24px;
              margin-bottom: 12px;
              background: var(--xhs-bg-base);
              border: 1px solid var(--xhs-border-color);
              border-radius: var(--xhs-border-radius-base);
              transition: var(--xhs-transition-base);

              &:hover {
                background: var(--xhs-bg-hover);
                border-color: var(--xhs-primary);
                transform: translateY(-2px);
                box-shadow: var(--xhs-shadow-light);
              }

              .rank-number {
                width: 48px;
                height: 48px;
                background: var(--xhs-gradient-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: var(--xhs-font-weight-bold);
                font-size: var(--xhs-font-size-lg);
                margin-right: 20px;
                box-shadow: var(--xhs-shadow-light);
              }

              .teacher-info {
                flex: 1;

                .teacher-details {
                  .teacher-name {
                    font-size: var(--xhs-font-size-base);
                    font-weight: var(--xhs-font-weight-medium);
                    color: var(--xhs-text-primary);
                    margin: 0 0 4px 0;
                  }

                  .teacher-campus {
                    font-size: var(--xhs-font-size-sm);
                    color: var(--xhs-text-tertiary);
                  }
                }
              }

              .performance {
                text-align: right;

                .main-value {
                  font-size: var(--xhs-font-size-lg);
                  font-weight: var(--xhs-font-weight-semibold);
                  color: var(--xhs-primary);
                  margin-bottom: 4px;
                }

                .detail-info {
                  font-size: var(--xhs-font-size-xs);
                  color: var(--xhs-text-tertiary);
                }
              }
            }
          }
        }
      }
    }
  }

  // 统计概览
  .stats-section {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;

      .stat-card {
        background: var(--xhs-bg-base);
        border-radius: var(--xhs-border-radius-base);
        padding: 24px;
        display: flex;
        align-items: center;
        box-shadow: var(--xhs-shadow-card);
        border: 1px solid var(--xhs-border-color);
        transition: var(--xhs-transition-base);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--xhs-shadow-base);
          border-color: var(--xhs-primary);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--xhs-border-radius-base);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          .el-icon {
            font-size: 24px;
            color: white;
          }

          &.teachers {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.commission {
            background: var(--xhs-gradient-primary);
          }

          &.orders {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.students {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
        }

        .stat-content {
          .stat-number {
            font-size: var(--xhs-font-size-xxl);
            font-weight: var(--xhs-font-weight-bold);
            color: var(--xhs-text-primary);
            margin-bottom: 4px;
            line-height: var(--xhs-line-height-tight);
          }

          .stat-label {
            font-size: var(--xhs-font-size-sm);
            color: var(--xhs-text-secondary);
            font-weight: var(--xhs-font-weight-normal);
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 24px 16px;

    .page-header {
      margin-bottom: 32px;

      h1 {
        font-size: var(--xhs-font-size-title);
        flex-direction: column;
        gap: 12px;

        .trophy-icon {
          font-size: 36px;
        }

        .sparkle-icon {
          font-size: 24px;
        }
      }

      .subtitle {
        font-size: var(--xhs-font-size-base);
      }
    }

    .filter-section {
      margin-bottom: 32px;

      .filter-card :deep(.el-card__body) {
        padding: 24px 16px;
      }

      .filter-form {
        gap: 16px !important;

        :deep(.el-form-item) {
          width: 100%;

          .el-select,
          .el-date-picker {
            width: 100% !important;
          }
        }
      }
    }

    .ranking-section {
      .ranking-card .ranking-content {
        padding: 24px 16px;
      }

      .podium-container {
        flex-direction: column;
        align-items: center;
        gap: 24px !important;

        .podium-item {
          width: 100%;
          max-width: 300px;

          .podium-content {
            min-width: auto;
          }
        }
      }

      .stats-container {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .stat-card {
          padding: 20px 16px;

          .stat-icon {
            width: 48px;
            height: 48px;
            margin-right: 12px;

            .el-icon {
              font-size: 20px;
            }
          }

          .stat-content .stat-number {
            font-size: var(--xhs-font-size-xl);
          }
        }
      }
    }
  }
}
</style>