<template>
  <div class="analytics-container">
    <div class="page-header">
      <h2>销售数据分析</h2>
      <div class="filter-group">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="handleRefresh" :icon="RefreshIcon">
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 销售漏斗图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">销售漏斗</span>
          </template>
          <div ref="funnelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 转化率数据 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">转化率详情</span>
          </template>
          <div class="conversion-list">
            <div
              v-for="(item, index) in funnelData"
              :key="item.stage"
              class="conversion-item"
            >
              <div class="item-header">
                <el-tag :type="getStageTag(item.stage)" size="large">
                  {{ item.stage }}
                </el-tag>
                <span class="count">{{ item.count }}人</span>
              </div>
              <div class="item-body">
                <div class="progress-info">
                  <span>占比</span>
                  <span class="value">{{ item.percentage }}%</span>
                </div>
                <el-progress :percentage="item.percentage" :stroke-width="10" />
              </div>
              <div v-if="item.conversionRate !== undefined" class="item-footer">
                <div class="conversion-rate">
                  <span>转化率</span>
                  <span
                    class="value"
                    :class="getConversionClass(item.conversionRate)"
                  >
                    {{ item.conversionRate }}%
                  </span>
                </div>
                <div v-if="item.avgDays" class="avg-days">
                  <span>平均停留</span>
                  <span class="value">{{ item.avgDays }}天</span>
                </div>
              </div>
              <el-divider v-if="index < funnelData.length - 1" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 客户来源分析 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">客户来源分析</span>
          </template>
          <div ref="sourceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 销售周期分析 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">销售周期分析</span>
          </template>
          <div class="cycle-list">
            <el-table :data="salesCycleData" style="width: 100%">
              <el-table-column prop="fromStage" label="起始阶段" width="120" />
              <el-table-column prop="toStage" label="目标阶段" width="120" />
              <el-table-column prop="avgDays" label="平均天数" width="100">
                <template #default="{ row }">
                  <el-tag>{{ row.avgDays }}天</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="范围">
                <template #default="{ row }">
                  {{ row.minDays }}~{{ row.maxDays }}天
                </template>
              </el-table-column>
              <el-table-column prop="count" label="样本数" width="80" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 高价值客户 -->
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">高价值客户TOP 20</span>
          </template>
          <el-table :data="highValueCustomers" style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="customerName" label="客户姓名" width="150" />
            <el-table-column prop="totalAmount" label="总消费" width="120">
              <template #default="{ row }">
                ¥{{ row.totalAmount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="orderCount" label="订单数" width="100" />
            <el-table-column prop="avgOrderAmount" label="平均订单额" width="130">
              <template #default="{ row }">
                ¥{{ row.avgOrderAmount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="lifecycleStage" label="生命周期" width="120">
              <template #default="{ row }">
                <el-tag :type="getStageTag(row.lifecycleStage)">
                  {{ row.lifecycleStage }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOrderDate" label="最后购买时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.lastOrderDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="potentialValue" label="潜在价值" width="130">
              <template #default="{ row }">
                <el-tag type="warning">
                  ¥{{ row.potentialValue.toLocaleString() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleViewCustomer(row.customerId)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getSalesFunnel,
  getCustomerSource,
  getSalesCycle,
  getHighValueCustomers,
  type SalesFunnelData,
  type CustomerSourceData,
  type SalesCycleData,
  type CustomerValueData,
} from '@/api/analytics'
import dayjs from 'dayjs'

const RefreshIcon = Refresh
const router = useRouter()

// 数据
const dateRange = ref<[string, string]>()
const funnelData = ref<SalesFunnelData[]>([])
const sourceData = ref<CustomerSourceData[]>([])
const salesCycleData = ref<SalesCycleData[]>([])
const highValueCustomers = ref<CustomerValueData[]>([])

// 图表实例
const funnelChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
let funnelChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null

// 获取销售漏斗数据
const fetchFunnelData = async () => {
  try {
    const params = dateRange.value
      ? {
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
        }
      : undefined

    funnelData.value = await getSalesFunnel(params)

    // 渲染漏斗图
    nextTick(() => {
      renderFunnelChart()
    })
  } catch (error) {
    console.error('Failed to fetch funnel data:', error)
  }
}

// 获取客户来源数据
const fetchSourceData = async () => {
  try {
    const params = dateRange.value
      ? {
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
        }
      : undefined

    sourceData.value = await getCustomerSource(params)

    // 渲染来源饼图
    nextTick(() => {
      renderSourceChart()
    })
  } catch (error) {
    console.error('Failed to fetch source data:', error)
  }
}

// 获取销售周期数据
const fetchSalesCycleData = async () => {
  try {
    const params = dateRange.value
      ? {
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
        }
      : undefined

    salesCycleData.value = await getSalesCycle(params)
  } catch (error) {
    console.error('Failed to fetch sales cycle data:', error)
  }
}

// 获取高价值客户
const fetchHighValueCustomers = async () => {
  try {
    highValueCustomers.value = await getHighValueCustomers(20)
  } catch (error) {
    console.error('Failed to fetch high value customers:', error)
  }
}

// 渲染漏斗图（全新3D渐变设计）
const renderFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (!funnelChart) {
    funnelChart = echarts.init(funnelChartRef.value)
  }

  // 定义渐变色彩方案（从蓝色到绿色的渐变）
  const colorScheme = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#409EFF' },
      { offset: 1, color: '#66B1FF' },
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#67C23A' },
      { offset: 1, color: '#85CE61' },
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#E6A23C' },
      { offset: 1, color: '#F0C78A' },
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#F56C6C' },
      { offset: 1, color: '#F78989' },
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#909399' },
      { offset: 1, color: '#B3B6BC' },
    ]),
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = funnelData.value[params.dataIndex]
        let html = `<div style="padding: 8px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${params.name}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>数量：</span><span style="font-weight: 600;">${params.value}人</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>占比：</span><span style="font-weight: 600;">${data.percentage}%</span>
          </div>`
        if (data.conversionRate !== undefined) {
          html += `<div style="display: flex; justify-content: space-between;">
            <span>转化率：</span><span style="font-weight: 600; color: #67C23A;">${data.conversionRate}%</span>
          </div>`
        }
        html += '</div>'
        return html
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
    },
    series: [
      {
        type: 'funnel',
        left: '5%',
        top: 40,
        bottom: 40,
        width: '90%',
        min: 0,
        max: 100,
        minSize: '10%',
        maxSize: '100%',
        sort: 'descending',
        gap: 8,
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => {
            const data = funnelData.value[params.dataIndex]
            return `{title|${params.name}}\n{count|${params.value}人} {rate|${data.percentage}%}`
          },
          rich: {
            title: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
              lineHeight: 24,
            },
            count: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#fff',
              lineHeight: 28,
            },
            rate: {
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
            },
          },
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 5,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
        emphasis: {
          label: {
            fontSize: 18,
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.4)',
          },
        },
        data: funnelData.value.map((item, index) => ({
          value: item.count,
          name: item.stage,
          itemStyle: {
            color: colorScheme[index % colorScheme.length],
          },
        })),
      },
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  }

  funnelChart.setOption(option)
}

// 渲染来源饼图
const renderSourceChart = () => {
  if (!sourceChartRef.value) return

  if (!sourceChart) {
    sourceChart = echarts.init(sourceChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)<br/>转化率: {percent|{@conversionRate}%}',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: sourceData.value.map((item) => ({
          value: item.count,
          name: item.source,
          conversionRate: item.conversionRate.toFixed(1),
        })),
      },
    ],
  }

  sourceChart.setOption(option)
}

// 刷新所有数据
const handleRefresh = async () => {
  await Promise.all([
    fetchFunnelData(),
    fetchSourceData(),
    fetchSalesCycleData(),
    fetchHighValueCustomers(),
  ])
}

// 日期变更
const handleDateChange = () => {
  handleRefresh()
}

// 查看客户详情
const handleViewCustomer = (id: number) => {
  router.push({ name: 'CustomerDetail', params: { id } })
}

// 辅助函数
const getStageTag = (stage: string): any => {
  const tagMap: Record<string, string> = {
    线索: 'info',
    意向客户: 'primary',
    商机: 'warning',
    成交客户: 'success',
    复购客户: 'success',
    流失客户: 'danger',
  }
  return tagMap[stage] || 'info'
}

const getConversionClass = (rate: number) => {
  if (rate >= 70) return 'high'
  if (rate >= 40) return 'medium'
  return 'low'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

// 监听窗口大小变化，重新渲染图表
const handleResize = () => {
  funnelChart?.resize()
  sourceChart?.resize()
}

onMounted(() => {
  handleRefresh()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  funnelChart?.dispose()
  sourceChart?.dispose()
})
</script>

<style scoped lang="scss">
.analytics-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #303133;
    }

    .filter-group {
      display: flex;
      gap: 12px;
    }
  }

  .card-title {
    font-size: 16px;
    font-weight: 500;
  }

  .chart-container {
    height: 400px;
  }

  .conversion-list {
    .conversion-item {
      padding: 20px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(64, 158, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .count {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      .item-body {
        margin-bottom: 12px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #606266;
          font-weight: 500;

          .value {
            font-weight: 600;
            font-size: 16px;
            color: #409EFF;
          }
        }

        :deep(.el-progress__text) {
          font-weight: 600;
        }
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 14px;
        color: #606266;

        .conversion-rate,
        .avg-days {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .value {
            font-weight: 600;
            font-size: 18px;

            &.high {
              color: #67c23a;
            }
            &.medium {
              color: #e6a23c;
            }
            &.low {
              color: #f56c6c;
            }
          }
        }
      }

      :deep(.el-divider) {
        display: none;
      }
    }
  }

  .cycle-list {
    padding: 16px 0;
  }
}
</style>
