<template>
  <div class="ai-reports-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI诊断报告</h2>
          <p class="subtitle">AI自动生成周报/月报，洞察问题，提供改进建议</p>
        </div>
        <el-button type="primary" @click="showGenerateDialog = true">
          <el-icon><DocumentAdd /></el-icon>
          生成新报告
        </el-button>
      </div>
    </el-card>

    <!-- 筛选 -->
    <el-card>
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="报告类型">
          <el-select v-model="queryForm.reportType" clearable placeholder="全部">
            <el-option label="周报" value="周报" />
            <el-option label="月报" value="月报" />
            <el-option label="季报" value="季报" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部">
            <el-option label="生成中" value="生成中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="失败" value="失败" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报告列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="reportType" label="报告类型" width="100" />
        <el-table-column prop="reportPeriod" label="报告周期" width="120" />
        <el-table-column label="目标" width="150">
          <template #default="{ row }">
            <span v-if="row.targetType">{{ row.targetType }}</span>
            <span v-else>全公司</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === '已完成'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === '生成中'" type="warning">生成中</el-tag>
            <el-tag v-else-if="row.status === '失败'" type="danger">失败</el-tag>
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="generateTime" label="生成时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="viewReport(row)"
              :disabled="row.status !== '已完成'"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.limit"
        :total="total"
        @current-change="loadData"
        @size-change="loadData"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>

    <!-- 生成报告对话框 -->
    <el-dialog v-model="showGenerateDialog" title="生成AI诊断报告" width="600px">
      <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
        <el-form-item label="报告类型" prop="reportType">
          <el-select v-model="generateForm.reportType" placeholder="请选择" style="width: 100%">
            <el-option label="周报" value="周报" />
            <el-option label="月报" value="月报" />
            <el-option label="季报" value="季报" />
          </el-select>
        </el-form-item>
        <el-form-item label="报告周期" prop="reportPeriod">
          <el-input v-model="generateForm.reportPeriod" placeholder="例如：2025-W01 或 2025-01 或 2025-Q1" />
          <div class="form-tip">
            周报格式：2025-W01，月报格式：2025-01，季报格式：2025-Q1
          </div>
        </el-form-item>
        <el-form-item label="目标范围">
          <el-select v-model="generateForm.targetType" placeholder="请选择" style="width: 100%">
            <el-option label="全公司" value="全公司" />
            <el-option label="个人" value="个人" />
            <el-option label="团队" value="团队" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          生成报告
        </el-button>
      </template>
    </el-dialog>

    <!-- 报告详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="AI诊断报告详情" width="900px">
      <div v-if="currentReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报告类型">{{ currentReport.reportType }}</el-descriptions-item>
          <el-descriptions-item label="报告周期">{{ currentReport.reportPeriod }}</el-descriptions-item>
          <el-descriptions-item label="目标">{{ currentReport.targetType || '全公司' }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ currentReport.generateTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <!-- 关键指标 -->
        <div v-if="currentReport.keyMetrics" class="section">
          <h3>关键指标</h3>
          <el-row :gutter="16">
            <el-col :span="6" v-for="(value, key) in currentReport.keyMetrics" :key="key">
              <el-card>
                <el-statistic :title="formatMetricName(key)" :value="value" />
              </el-card>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- AI洞察发现 -->
        <div v-if="currentReport.aiInsights && currentReport.aiInsights.length > 0" class="section">
          <h3>
            <el-icon><Sunny /></el-icon>
            AI洞察发现
          </h3>
          <ul class="insights-list">
            <li v-for="(insight, index) in currentReport.aiInsights" :key="index">
              {{ insight }}
            </li>
          </ul>
        </div>

        <el-divider />

        <!-- 问题诊断 -->
        <div v-if="currentReport.problems && currentReport.problems.length > 0" class="section">
          <h3>
            <el-icon><Warning /></el-icon>
            问题诊断
          </h3>
          <ul class="problems-list">
            <li v-for="(problem, index) in currentReport.problems" :key="index">
              {{ problem }}
            </li>
          </ul>
        </div>

        <el-divider />

        <!-- 改进建议 -->
        <div v-if="currentReport.recommendations && currentReport.recommendations.length > 0" class="section">
          <h3>
            <el-icon><TrendCharts /></el-icon>
            改进建议
          </h3>
          <ul class="recommendations-list">
            <li v-for="(recommendation, index) in currentReport.recommendations" :key="index">
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentAdd,
  Sunny,
  Warning,
  TrendCharts,
} from '@element-plus/icons-vue'
import { generateAiReport, getAiReportList, getAiReportDetail } from '@/api/ai'

const loading = ref(false)
const generating = ref(false)
const showGenerateDialog = ref(false)
const showDetailDialog = ref(false)
const tableData = ref([])
const total = ref(0)
const currentReport = ref(null)
const generateFormRef = ref()

const queryForm = reactive({
  page: 1,
  limit: 20,
  reportType: '',
  status: '',
})

const generateForm = reactive({
  reportType: '周报',
  reportPeriod: '',
  targetType: '全公司',
})

const generateRules = {
  reportType: [{ required: true, message: '请选择报告类型', trigger: 'change' }],
  reportPeriod: [{ required: true, message: '请输入报告周期', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAiReportList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryForm.page = 1
  queryForm.reportType = ''
  queryForm.status = ''
  loadData()
}

const handleGenerate = async () => {
  if (!generateFormRef.value) return

  await generateFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    generating.value = true
    try {
      await generateAiReport(generateForm)
      ElMessage.success('报告生成中，请稍后查看')
      showGenerateDialog.value = false
      generateForm.reportPeriod = ''
      loadData()

      // 轮询检查报告状态
      setTimeout(() => {
        loadData()
      }, 5000)
    } catch (error: any) {
      ElMessage.error(error.message || '生成失败')
    } finally {
      generating.value = false
    }
  })
}

const viewReport = async (row: any) => {
  try {
    const res = await getAiReportDetail(row.id)
    currentReport.value = res
    showDetailDialog.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

const formatMetricName = (key: string) => {
  const nameMap: Record<string, string> = {
    totalCustomers: '总客户数',
    newCustomers: '新增客户',
    highQualityLeads: '高质量线索',
    conversionRate: '转化率',
    avgResponseTime: '平均响应时间',
    aiUsageCount: 'AI使用次数',
    customerSatisfaction: '客户满意度',
  }
  return nameMap[key] || key
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ai-reports-container {
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

  .table-card {
    margin-top: 20px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .report-detail {
    .section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .insights-list,
      .problems-list,
      .recommendations-list {
        padding-left: 20px;

        li {
          margin-bottom: 12px;
          line-height: 1.8;
          color: #606266;
        }
      }

      .insights-list li {
        color: #409EFF;
      }

      .problems-list li {
        color: #E6A23C;
      }

      .recommendations-list li {
        color: #67C23A;
      }
    }
  }
}
</style>
