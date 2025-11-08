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

    <!-- 风险预警统计 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">风险预警统计</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="risk-stat">
            <div class="risk-label">待处理</div>
            <div class="risk-value">{{ riskStats.pending || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat high">
            <div class="risk-label">高风险</div>
            <div class="risk-value">{{ riskStats.high || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat medium">
            <div class="risk-label">中风险</div>
            <div class="risk-value">{{ riskStats.medium || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="risk-stat low">
            <div class="risk-label">低风险</div>
            <div class="risk-value">{{ riskStats.low || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAiEfficiencyAnalytics } from '@/api/ai'

const loading = ref(false)
const dateRange = ref([])
const qualityChartRef = ref()
const featureChartRef = ref()
const funnelChartRef = ref()

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
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '客户质量',
        type: 'pie',
        radius: '50%',
        data: [
          { value: qualityDistribution.value.A || 0, name: 'A级（优质）' },
          { value: qualityDistribution.value.B || 0, name: 'B级（良好）' },
          { value: qualityDistribution.value.C || 0, name: 'C级（一般）' },
          { value: qualityDistribution.value.D || 0, name: 'D级（较差）' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
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
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['聊天分析', '话术生成', '知识搜索', '培训陪练', '风险预警', '营销文案'],
    },
    yAxis: {
      type: 'value',
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
        itemStyle: {
          color: '#409EFF',
        },
      },
    ],
  }

  featureChart.setOption(option)
}

const renderFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (!funnelChart) {
    funnelChart = echarts.init(funnelChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}',
    },
    series: [
      {
        name: '客户转化',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: [
          { value: conversionFunnel.value.leads || 0, name: '线索' },
          { value: conversionFunnel.value.customers || 0, name: '客户' },
          { value: conversionFunnel.value.intents || 0, name: '意向客户' },
          { value: conversionFunnel.value.deals || 0, name: '成交' },
        ],
      },
    ],
  }

  funnelChart.setOption(option)
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

  .risk-stat {
    text-align: center;
    padding: 20px;
    border-radius: 4px;
    background: #f5f7fa;

    &.high {
      background: #fef0f0;
      color: #f56c6c;
    }

    &.medium {
      background: #fdf6ec;
      color: #e6a23c;
    }

    &.low {
      background: #f0f9ff;
      color: #409eff;
    }

    .risk-label {
      font-size: 14px;
      margin-bottom: 8px;
    }

    .risk-value {
      font-size: 32px;
      font-weight: bold;
    }
  }
}
</style>
