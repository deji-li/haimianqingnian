<template>
  <div class="advanced-analytics">
    <el-card class="header-card">
      <div class="page-header">
        <h2>高级数据分析</h2>
        <el-button type="primary" @click="handleRefresh" :icon="RefreshIcon">
          刷新数据
        </el-button>
      </div>
    </el-card>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 收入预测标签页 -->
      <el-tab-pane label="收入预测" name="forecast">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="card-title">收入预测（基于线性回归）</span>
                  <div class="controls">
                    <span class="label">预测未来：</span>
                    <el-select v-model="forecastMonths" @change="fetchRevenueForecast" style="width: 120px">
                      <el-option label="3个月" :value="3" />
                      <el-option label="6个月" :value="6" />
                      <el-option label="12个月" :value="12" />
                    </el-select>
                  </div>
                </div>
              </template>

              <!-- 置信度提示 -->
              <div v-if="forecastData.length > 0" class="confidence-info">
                <el-alert
                  :title="`模型置信度：${forecastData[0].confidence.toFixed(1)}%`"
                  :type="getConfidenceType(forecastData[0].confidence)"
                  :description="getConfidenceDescription(forecastData[0].confidence)"
                  show-icon
                  :closable="false"
                />
              </div>

              <!-- 收入预测图表 -->
              <div ref="forecastChartRef" class="chart-container"></div>

              <!-- 预测数据表格 -->
              <el-table :data="futureForecasts" style="margin-top: 20px">
                <el-table-column label="月份" prop="period" width="120" />
                <el-table-column label="预测收入" width="150">
                  <template #default="{ row }">
                    <span class="amount-text">¥{{ formatMoney(row.predicted) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="置信度" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getConfidenceType(row.confidence)">
                      {{ row.confidence.toFixed(1) }}%
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="说明">
                  <template #default>
                    <span>基于过去12个月历史数据的线性回归预测</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 转化率分析标签页 -->
      <el-tab-pane label="转化率分析" name="conversion">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span class="card-title">多维度转化率分析</span>
                  <el-radio-group v-model="conversionDimension" @change="fetchConversionAnalysis">
                    <el-radio-button label="traffic_source">流量来源</el-radio-button>
                    <el-radio-button label="sales">销售人员</el-radio-button>
                    <el-radio-button label="campus">校区</el-radio-button>
                  </el-radio-group>
                </div>
              </template>

              <!-- 转化率对比图表 -->
              <div ref="conversionChartRef" class="chart-container"></div>

              <!-- 转化率详细数据表格 -->
              <el-table :data="conversionData" style="margin-top: 20px">
                <el-table-column :label="getDimensionLabel()" prop="dimension" width="150" />
                <el-table-column label="总客户数" prop="totalCustomers" width="120" />
                <el-table-column label="已转化客户" prop="convertedCustomers" width="120" />
                <el-table-column label="转化率" width="120">
                  <template #default="{ row }">
                    <el-progress
                      :percentage="row.conversionRate"
                      :color="getConversionColor(row.conversionRate)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="平均转化天数" width="120">
                  <template #default="{ row }">
                    {{ row.avgDays }}天
                  </template>
                </el-table-column>
                <el-table-column label="总收入" width="150">
                  <template #default="{ row }">
                    <span class="amount-text">¥{{ formatMoney(row.totalRevenue) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="人均收入" width="150">
                  <template #default="{ row }">
                    <span class="amount-text">¥{{ formatMoney(row.avgRevenuePerCustomer) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh as RefreshIcon } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getRevenueForecast,
  getConversionAnalysis,
  type RevenueForecastData,
  type ConversionAnalysisData,
} from '@/api/analytics'

// 活动标签页
const activeTab = ref('forecast')

// 收入预测相关
const forecastMonths = ref(3)
const forecastData = ref<RevenueForecastData[]>([])
const forecastChartRef = ref<HTMLElement>()
let forecastChart: ECharts | null = null

// 转化率分析相关
const conversionDimension = ref<'traffic_source' | 'sales' | 'campus'>('traffic_source')
const conversionData = ref<ConversionAnalysisData[]>([])
const conversionChartRef = ref<HTMLElement>()
let conversionChart: ECharts | null = null

// 计算未来预测数据
const futureForecasts = computed(() => {
  return forecastData.value.filter((item) => !item.isHistorical)
})

// 格式化金额
const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取置信度类型
const getConfidenceType = (confidence: number) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'warning'
  return 'danger'
}

// 获取置信度描述
const getConfidenceDescription = (confidence: number) => {
  if (confidence >= 80) return '模型拟合度较高，预测结果可信度高'
  if (confidence >= 60) return '模型拟合度中等，预测结果仅供参考'
  return '模型拟合度较低，预测结果不确定性较大'
}

// 获取转化率颜色
const getConversionColor = (rate: number) => {
  if (rate >= 50) return '#67c23a'
  if (rate >= 30) return '#e6a23c'
  if (rate >= 10) return '#f56c6c'
  return '#909399'
}

// 获取维度标签
const getDimensionLabel = () => {
  const labels: Record<string, string> = {
    traffic_source: '流量来源',
    sales: '销售人员',
    campus: '校区',
  }
  return labels[conversionDimension.value]
}

// 获取收入预测数据
const fetchRevenueForecast = async () => {
  try {
    const data = await getRevenueForecast(forecastMonths.value)
    forecastData.value = data || []
    await nextTick()
    renderForecastChart()
  } catch (error: any) {
    ElMessage.error(error.message || '获取收入预测失败')
  }
}

// 获取转化率分析数据
const fetchConversionAnalysis = async () => {
  try {
    const data = await getConversionAnalysis(conversionDimension.value)
    conversionData.value = data || []
    await nextTick()
    renderConversionChart()
  } catch (error: any) {
    ElMessage.error(error.message || '获取转化率分析失败')
  }
}

// 渲染收入预测图表
const renderForecastChart = () => {
  if (!forecastChartRef.value) return

  if (!forecastChart) {
    forecastChart = echarts.init(forecastChartRef.value)
  }

  const historicalData = forecastData.value.filter((item) => item.isHistorical)
  const futureData = forecastData.value.filter((item) => !item.isHistorical)

  const option = {
    title: {
      text: '收入预测趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ¥${formatMoney(item.value)}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['实际收入', '拟合值', '预测收入'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: forecastData.value.map((item) => item.period),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '收入（元）',
      axisLabel: {
        formatter: (value: number) => `¥${(value / 1000).toFixed(0)}K`,
      },
    },
    series: [
      {
        name: '实际收入',
        type: 'line',
        data: historicalData.map((item) => item.actual || null),
        itemStyle: { color: '#409eff' },
        symbol: 'circle',
        symbolSize: 8,
      },
      {
        name: '拟合值',
        type: 'line',
        data: historicalData.map((item) => item.predicted),
        itemStyle: { color: '#67c23a' },
        lineStyle: { type: 'dashed' },
        symbol: 'none',
      },
      {
        name: '预测收入',
        type: 'line',
        data: [
          ...new Array(historicalData.length).fill(null),
          ...futureData.map((item) => item.predicted),
        ],
        itemStyle: { color: '#e6a23c' },
        lineStyle: { type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 10,
        markLine: {
          silent: true,
          lineStyle: {
            color: '#999',
            type: 'solid',
          },
          data: [{ xAxis: historicalData.length - 1 }],
          label: {
            formatter: '预测分界线',
          },
        },
      },
    ],
  }

  forecastChart.setOption(option)
}

// 渲染转化率分析图表
const renderConversionChart = () => {
  if (!conversionChartRef.value) return

  if (!conversionChart) {
    conversionChart = echarts.init(conversionChartRef.value)
  }

  const option = {
    title: {
      text: `${getDimensionLabel()}转化率对比`,
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
      data: ['转化率', '人均收入'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: conversionData.value.map((item) => item.dimension),
      axisLabel: {
        rotate: 30,
        interval: 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '转化率（%）',
        position: 'left',
        max: 100,
      },
      {
        type: 'value',
        name: '人均收入（元）',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => `¥${(value / 1000).toFixed(0)}K`,
        },
      },
    ],
    series: [
      {
        name: '转化率',
        type: 'bar',
        data: conversionData.value.map((item) => item.conversionRate.toFixed(2)),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
      },
      {
        name: '人均收入',
        type: 'line',
        yAxisIndex: 1,
        data: conversionData.value.map((item) => item.avgRevenuePerCustomer.toFixed(2)),
        itemStyle: { color: '#67c23a' },
        smooth: true,
      },
    ],
  }

  conversionChart.setOption(option)
}

// 标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'forecast' && forecastData.value.length === 0) {
    fetchRevenueForecast()
  } else if (tab === 'conversion' && conversionData.value.length === 0) {
    fetchConversionAnalysis()
  }
}

// 刷新数据
const handleRefresh = () => {
  if (activeTab.value === 'forecast') {
    fetchRevenueForecast()
  } else {
    fetchConversionAnalysis()
  }
}

// 窗口大小变化
const handleResize = () => {
  forecastChart?.resize()
  conversionChart?.resize()
}

onMounted(() => {
  fetchRevenueForecast()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  forecastChart?.dispose()
  conversionChart?.dispose()
})
</script>

<style scoped lang="scss">
.advanced-analytics {
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
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .confidence-info {
    margin-bottom: 20px;
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }

  .amount-text {
    color: #409eff;
    font-weight: 500;
  }
}
</style>
