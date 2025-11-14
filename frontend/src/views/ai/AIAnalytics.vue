<template>
  <div class="ai-analytics-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI人效分析看板</h2>
          <p class="subtitle">实时监控团队AI使用情况，提升销售效率</p>
        </div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadData"
          style="max-width: 320px;"
        />
      </div>
    </el-card>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="AI分析总次数" :value="stats.totalAnalysis || 0">
            <template #suffix>次</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="高质量线索" :value="stats.highQualityLeads || 0">
            <template #suffix>个</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="平均转化率" :value="(stats.avgConversionRate * 100) || 0" :precision="2">
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="待处理风险" :value="stats.pendingRisks || 0">
            <template #suffix>个</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 销售人员排行榜 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">销售人员AI使用排行</span>
            </div>
          </template>
          <el-table :data="userRankings" max-height="400">
            <el-table-column label="排名" width="60">
              <template #default="{ $index }">
                <el-tag v-if="$index === 0" type="danger">🥇</el-tag>
                <el-tag v-else-if="$index === 1" type="warning">🥈</el-tag>
                <el-tag v-else-if="$index === 2" type="success">🥉</el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名" width="100" />
            <el-table-column prop="totalUsageCount" label="总使用次数" width="100" />
            <el-table-column prop="highQualityLeadsCount" label="A级线索" width="80" />
            <el-table-column prop="conversionRate" label="转化率" width="100">
              <template #default="{ row }">
                {{ (row.conversionRate * 100).toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 客户质量分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">客户质量分布</span>
            </div>
          </template>
          <div ref="qualityChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- AI功能使用统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">AI功能使用统计</span>
            </div>
          </template>
          <div ref="featureChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>

      <!-- 转化漏斗 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">转化漏斗</span>
            </div>
          </template>
          <div ref="funnelChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 销售人员综合能力雷达图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">Top 3 销售人员综合能力</span>
            </div>
          </template>
          <div ref="radarChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>

      <!-- 功能使用占比饼图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">功能使用占比</span>
            </div>
          </template>
          <div ref="featurePieChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 风险预警统计 -->
    <el-card class="risk-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon style="margin-right: 8px; vertical-align: middle;"><Warning /></el-icon>
            风险预警统计
          </span>
          <el-tag type="danger" size="small" v-if="(riskStats.high || 0) > 0">
            {{ riskStats.high || 0 }} 个高风险待处理
          </el-tag>
        </div>
      </template>
      <el-row :gutter="20" class="risk-stats-row">
        <el-col :span="6">
          <div class="risk-stat">
            <div class="risk-icon">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="risk-content">
              <div class="risk-label">待处理</div>
              <div class="risk-value">{{ riskStats.pending || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat high">
            <div class="risk-icon">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
            <div class="risk-content">
              <div class="risk-label">高风险</div>
              <div class="risk-value">{{ riskStats.high || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat medium">
            <div class="risk-icon">
              <el-icon :size="32"><InfoFilled /></el-icon>
            </div>
            <div class="risk-content">
              <div class="risk-label">中风险</div>
              <div class="risk-value">{{ riskStats.medium || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat low">
            <div class="risk-icon">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="risk-content">
              <div class="risk-label">低风险</div>
              <div class="risk-value">{{ riskStats.low || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Clock, WarningFilled, InfoFilled, CircleCheck } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getAiEfficiencyAnalytics } from '@/api/ai'

const loading = ref(false)
const dateRange = ref([])
const qualityChartRef = ref()
const featureChartRef = ref()
const funnelChartRef = ref()
const radarChartRef = ref()
const featurePieChartRef = ref()

const stats = reactive({
  totalAnalysis: 0,
  highQualityLeads: 0,
  avgConversionRate: 0,
  pendingRisks: 0,
})

const userRankings = ref([])
const qualityDistribution = ref({})
const featureUsageStats = ref({})
const conversionFunnel = ref({})
const riskStats = ref({})

let qualityChart: any = null
let featureChart: any = null
let funnelChart: any = null
let radarChart: any = null
let featurePieChart: any = null

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const res = await getAiEfficiencyAnalytics(params)
    const data = res

    // 更新数据
    userRankings.value = data.userUsageStats
    qualityDistribution.value = data.qualityDistribution
    featureUsageStats.value = data.featureUsageStats
    conversionFunnel.value = data.conversionFunnel
    riskStats.value = data.riskStats

    // 计算统计数据
    stats.totalAnalysis = data.userUsageStats.reduce((sum: number, u: any) => sum + u.aiAnalysisCount, 0)
    stats.highQualityLeads = data.userUsageStats.reduce((sum: number, u: any) => sum + u.highQualityLeadsCount, 0)
    stats.avgConversionRate = data.userUsageStats.length > 0
      ? data.userUsageStats.reduce((sum: number, u: any) => sum + u.conversionRate, 0) / data.userUsageStats.length
      : 0
    stats.pendingRisks = data.riskStats.pending

    // 渲染图表
    await nextTick()
    renderQualityChart()
    renderFeatureChart()
    renderFunnelChart()
    renderRadarChart()
    renderFeaturePieChart()
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const renderQualityChart = () => {
  if (!qualityChartRef.value) return

  if (!qualityChart) {
    qualityChart = echarts.init(qualityChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      itemGap: 15,
      textStyle: {
        fontSize: 13,
        color: '#666',
      },
      icon: 'circle',
    },
    color: ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C'],
    series: [
      {
        name: '客户质量',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 28,
            fontWeight: 'bold',
            formatter: '{d}%',
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: qualityDistribution.value.A || 0, name: 'A级（优质）' },
          { value: qualityDistribution.value.B || 0, name: 'B级（良好）' },
          { value: qualityDistribution.value.C || 0, name: 'C级（一般）' },
          { value: qualityDistribution.value.D || 0, name: 'D级（较差）' },
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100,
      },
    ],
  }

  qualityChart.setOption(option)
}

const renderFeatureChart = () => {
  if (!featureChartRef.value) return

  if (!featureChart) {
    featureChart = echarts.init(featureChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(64, 158, 255, 0.1)',
        },
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['聊天分析', '话术生成', '知识搜索', '培训陪练', '风险预警', '营销文案'],
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        interval: 0,
        rotate: 15,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: [
          featureUsageStats.value.chatAnalysis || 0,
          featureUsageStats.value.scriptGeneration || 0,
          featureUsageStats.value.knowledgeSearch || 0,
          featureUsageStats.value.training || 0,
          featureUsageStats.value.riskAlert || 0,
          featureUsageStats.value.marketing || 0,
        ],
        barWidth: '45%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#66B1FF' },
          ]),
          borderRadius: [8, 8, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3A8CFF' },
              { offset: 1, color: '#5CA7FF' },
            ]),
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#666',
          fontSize: 12,
        },
        animationDelay: (idx: number) => idx * 100,
      },
    ],
    animationEasing: 'elasticOut',
  }

  featureChart.setOption(option)
}

const renderFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (!funnelChart) {
    funnelChart = echarts.init(funnelChartRef.value)
  }

  const funnelData = [
    { value: conversionFunnel.value.leads || 0, name: '线索' },
    { value: conversionFunnel.value.customers || 0, name: '客户' },
    { value: conversionFunnel.value.intents || 0, name: '意向客户' },
    { value: conversionFunnel.value.deals || 0, name: '成交' },
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = funnelData
        const idx = params.dataIndex
        const rate = idx > 0 ? ((data[idx].value / data[idx - 1].value) * 100).toFixed(1) : 100
        return `${params.name}<br/>数量: ${params.value}<br/>转化率: ${rate}%`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666'],
    series: [
      {
        name: '客户转化',
        type: 'funnel',
        left: '15%',
        top: 40,
        bottom: 40,
        width: '70%',
        min: 0,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}',
          fontSize: 14,
          color: '#fff',
          fontWeight: 'bold',
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 5,
        },
        emphasis: {
          label: {
            fontSize: 18,
          },
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        data: funnelData,
      },
    ],
    animationEasing: 'cubicOut',
    animationDuration: 1000,
  }

  funnelChart.setOption(option)
}

const renderRadarChart = () => {
  if (!radarChartRef.value) return

  if (!radarChart) {
    radarChart = echarts.init(radarChartRef.value)
  }

  // 取前3名销售人员
  const top3Users = userRankings.value.slice(0, 3)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    legend: {
      bottom: 10,
      data: top3Users.map((u: any) => u.userName),
      textStyle: {
        fontSize: 13,
        color: '#666',
      },
    },
    radar: {
      indicator: [
        { name: '使用频次', max: Math.max(...top3Users.map((u: any) => u.totalUsageCount), 100) },
        { name: 'A级线索', max: Math.max(...top3Users.map((u: any) => u.highQualityLeadsCount), 50) },
        { name: '转化率', max: 100 },
        { name: '聊天分析', max: Math.max(...top3Users.map((u: any) => u.chatAnalysisCount || 0), 50) },
        { name: '话术生成', max: Math.max(...top3Users.map((u: any) => u.scriptGenerationCount || 0), 50) },
        { name: '知识搜索', max: Math.max(...top3Users.map((u: any) => u.knowledgeSearchCount || 0), 50) },
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#666',
        fontSize: 13,
      },
      splitLine: {
        lineStyle: {
          color: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0'],
          type: 'dashed',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(64, 158, 255, 0.02)', 'rgba(64, 158, 255, 0.05)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
    },
    series: [
      {
        name: '销售人员能力',
        type: 'radar',
        data: top3Users.map((user: any, index: number) => ({
          value: [
            user.totalUsageCount || 0,
            user.highQualityLeadsCount || 0,
            (user.conversionRate * 100) || 0,
            user.chatAnalysisCount || 0,
            user.scriptGenerationCount || 0,
            user.knowledgeSearchCount || 0,
          ],
          name: user.userName,
          areaStyle: {
            opacity: 0.3,
          },
          lineStyle: {
            width: 2,
          },
          symbolSize: 6,
        })),
        emphasis: {
          lineStyle: {
            width: 4,
          },
          areaStyle: {
            opacity: 0.5,
          },
        },
      },
    ],
    color: ['#5470C6', '#91CC75', '#FAC858'],
  }

  radarChart.setOption(option)
}

const renderFeaturePieChart = () => {
  if (!featurePieChartRef.value) return

  if (!featurePieChart) {
    featurePieChart = echarts.init(featurePieChartRef.value)
  }

  const featureData = [
    { value: featureUsageStats.value.chatAnalysis || 0, name: '聊天分析' },
    { value: featureUsageStats.value.scriptGeneration || 0, name: '话术生成' },
    { value: featureUsageStats.value.knowledgeSearch || 0, name: '知识搜索' },
    { value: featureUsageStats.value.training || 0, name: '培训陪练' },
    { value: featureUsageStats.value.riskAlert || 0, name: '风险预警' },
    { value: featureUsageStats.value.marketing || 0, name: '营销文案' },
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'middle',
      itemGap: 12,
      textStyle: {
        fontSize: 13,
        color: '#666',
      },
      formatter: (name: string) => {
        const item = featureData.find(d => d.name === name)
        return `${name}  ${item?.value || 0}`
      },
    },
    color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'],
    series: [
      {
        name: 'AI功能',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          fontSize: 13,
          color: '#666',
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        data: featureData,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100,
      },
    ],
  }

  featurePieChart.setOption(option)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ai-analytics-container {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
      }

      .subtitle {
        margin: 5px 0 0;
        color: #909399;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .risk-card {
    margin-top: 20px;

    .card-header {
      .title {
        display: flex;
        align-items: center;
      }
    }
  }

  .risk-stats-row {
    padding: 10px 0;
  }

  .risk-stat {
    display: flex;
    align-items: center;
    padding: 24px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    &.high {
      background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);

      .risk-icon {
        background: linear-gradient(135deg, #f56c6c 0%, #ff6b6b 100%);
        color: white;
      }

      .risk-value {
        color: #f56c6c;
      }
    }

    &.medium {
      background: linear-gradient(135deg, #fdf6ec 0%, #fcefc7 100%);

      .risk-icon {
        background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
        color: white;
      }

      .risk-value {
        color: #e6a23c;
      }
    }

    &.low {
      background: linear-gradient(135deg, #f0f9ff 0%, #e1f3ff 100%);

      .risk-icon {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        color: white;
      }

      .risk-value {
        color: #409eff;
      }
    }

    .risk-icon {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
      color: white;
      margin-right: 16px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .risk-content {
      flex: 1;
      text-align: left;

      .risk-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .risk-value {
        font-size: 32px;
        font-weight: bold;
        color: #333;
        line-height: 1;
      }
    }
  }
}
</style>
