<template>
  <div class="knowledge-mining-container">
    <!-- Page Header -->
    <div class="page-header">
      <h2>AI知识挖掘</h2>
      <el-text type="info">从对话记录中自动挖掘有价值的知识</el-text>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Start Mining Tab -->
      <el-tab-pane label="启动挖掘" name="start">
        <el-card shadow="never">
          <el-form
            ref="miningFormRef"
            :model="miningForm"
            :rules="miningRules"
            label-width="120px"
          >
            <el-form-item label="数据源类型" prop="sourceType">
              <el-select v-model="miningForm.sourceType" placeholder="选择数据源">
                <el-option label="AI对话记录" value="ai_chat" />
                <el-option label="客户反馈" value="customer_feedback" />
                <el-option label="工单记录" value="tickets" />
              </el-select>
            </el-form-item>

            <el-form-item label="数据源选择" prop="sourceIds">
              <el-select
                v-model="miningForm.sourceIds"
                multiple
                placeholder="选择要挖掘的数据源（留空表示全部）"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="source in availableSources"
                  :key="source.id"
                  :label="source.name"
                  :value="source.id"
                />
              </el-select>
              <el-text type="info" size="small">
                留空将挖掘该类型的所有数据源
              </el-text>
            </el-form-item>

            <el-form-item label="时间范围" prop="dateRange">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="startingMining"
                :icon="MagicStick"
                @click="handleStartMining"
              >
                开始挖掘
              </el-button>
              <el-button @click="resetMiningForm">重置</el-button>
            </el-form-item>
          </el-form>

          <el-alert
            title="挖掘说明"
            type="info"
            :closable="false"
            show-icon
          >
            <ul style="margin: 0; padding-left: 20px;">
              <li>AI将自动分析选定时间范围内的对话记录</li>
              <li>提取可能成为知识库的高价值内容</li>
              <li>挖掘结果需要人工审核后才会正式加入知识库</li>
              <li>建议每周执行一次挖掘任务，保持知识库的更新</li>
            </ul>
          </el-alert>
        </el-card>
      </el-tab-pane>

      <!-- Pending Review Tab -->
      <el-tab-pane name="review">
        <template #label>
          <el-badge :value="pendingCount" :hidden="pendingCount === 0">
            待审核
          </el-badge>
        </template>

        <div class="review-header">
          <el-form :inline="true" :model="reviewFilter">
            <el-form-item label="数据源">
              <el-select
                v-model="reviewFilter.sourceType"
                placeholder="全部"
                clearable
                style="width: 150px"
              >
                <el-option label="AI对话" value="ai_chat" />
                <el-option label="客户反馈" value="customer_feedback" />
                <el-option label="工单记录" value="tickets" />
              </el-select>
            </el-form-item>

            <el-form-item label="最低评分">
              <el-select
                v-model="reviewFilter.minScore"
                placeholder="不限"
                clearable
                style="width: 120px"
              >
                <el-option label="80分以上" :value="80" />
                <el-option label="70分以上" :value="70" />
                <el-option label="60分以上" :value="60" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadPendingReview">
                查询
              </el-button>
            </el-form-item>
          </el-form>

          <div class="batch-actions">
            <el-button
              type="success"
              :icon="Check"
              :disabled="selectedReviewIds.length === 0"
              @click="handleBatchApprove"
            >
              批量通过
            </el-button>
            <el-button
              type="danger"
              :icon="Close"
              :disabled="selectedReviewIds.length === 0"
              @click="handleBatchReject"
            >
              批量拒绝
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loadingReview"
          :data="pendingList"
          stripe
          @selection-change="handleReviewSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="expand-content">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="完整内容" :span="2">
                    <div style="white-space: pre-wrap">{{ row.content }}</div>
                  </el-descriptions-item>
                  <el-descriptions-item label="提取关键词">
                    {{ row.keywords }}
                  </el-descriptions-item>
                  <el-descriptions-item label="AI评分理由">
                    {{ row.scoreReason || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="数据源ID">
                    {{ row.sourceId }}
                  </el-descriptions-item>
                  <el-descriptions-item label="挖掘时间">
                    {{ row.createTime }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

          <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <el-text line-clamp="2">{{ row.content }}</el-text>
            </template>
          </el-table-column>

          <el-table-column prop="sceneCategory" label="场景分类" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.sceneCategory }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="confidenceScore" label="AI评分" width="120" sortable>
            <template #default="{ row }">
              <el-progress
                :percentage="row.confidenceScore"
                :color="getScoreColor(row.confidenceScore)"
                :stroke-width="6"
              >
                <span style="font-size: 12px">{{ row.confidenceScore }}</span>
              </el-progress>
            </template>
          </el-table-column>

          <el-table-column prop="sourceType" label="数据源" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ getSourceTypeLabel(row.sourceType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="success"
                link
                :icon="Check"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                size="small"
                type="danger"
                link
                :icon="Close"
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="reviewFilter.page"
            v-model:page-size="reviewFilter.limit"
            :page-sizes="[10, 20, 50]"
            :total="reviewTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadPendingReview"
            @current-change="loadPendingReview"
          />
        </div>
      </el-tab-pane>

      <!-- Batch History Tab -->
      <el-tab-pane label="挖掘历史" name="history">
        <el-table v-loading="loadingBatches" :data="batchList" stripe>
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="expand-content">
                <el-descriptions :column="3" border>
                  <el-descriptions-item label="批次ID">
                    {{ row.id }}
                  </el-descriptions-item>
                  <el-descriptions-item label="数据源类型">
                    {{ getSourceTypeLabel(row.sourceType) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusLabel(row.status) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="总条数">
                    {{ row.totalCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="已提取">
                    {{ row.extractedCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="已通过">
                    <el-text type="success">{{ row.approvedCount }}</el-text>
                  </el-descriptions-item>
                  <el-descriptions-item label="已拒绝">
                    <el-text type="danger">{{ row.rejectedCount }}</el-text>
                  </el-descriptions-item>
                  <el-descriptions-item label="待审核">
                    <el-text type="warning">
                      {{ row.extractedCount - row.approvedCount - row.rejectedCount }}
                    </el-text>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">
                    {{ row.createTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="时间范围" :span="3">
                    {{ row.dateRange?.startDate }} 至 {{ row.dateRange?.endDate }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="id" label="批次ID" width="100" />

          <el-table-column prop="sourceType" label="数据源" width="120">
            <template #default="{ row }">
              {{ getSourceTypeLabel(row.sourceType) }}
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="进度" width="200">
            <template #default="{ row }">
              <div class="progress-info">
                <el-progress
                  :percentage="getProgressPercentage(row)"
                  :status="row.status === 'completed' ? 'success' : undefined"
                />
                <el-text size="small" type="info">
                  {{ row.extractedCount }} / {{ row.totalCount }}
                </el-text>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="审核情况" width="200">
            <template #default="{ row }">
              <div class="review-stats">
                <el-tag size="small" type="success">
                  通过: {{ row.approvedCount }}
                </el-tag>
                <el-tag size="small" type="danger">
                  拒绝: {{ row.rejectedCount }}
                </el-tag>
                <el-tag size="small" type="warning">
                  待审: {{ row.extractedCount - row.approvedCount - row.rejectedCount }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="创建时间" width="180" />

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'processing'"
                size="small"
                type="primary"
                link
                :icon="Refresh"
                @click="refreshBatchStatus(row)"
              >
                刷新状态
              </el-button>
              <el-button
                v-if="row.status === 'completed' && (row.extractedCount - row.approvedCount - row.rejectedCount) > 0"
                size="small"
                type="warning"
                link
                @click="goToReview(row)"
              >
                去审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="batchFilter.page"
            v-model:page-size="batchFilter.limit"
            :page-sizes="[10, 20, 50]"
            :total="batchTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadBatchHistory"
            @current-change="loadBatchHistory"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Reject Dialog -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因（可选）"
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick,
  Search,
  Check,
  Close,
  Refresh
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  startMining,
  getMiningStatus,
  getPendingReview,
  approveMining,
  rejectMining,
  getMiningBatches,
  type MiningTask
} from '@/api/knowledge'

// Active tab
const activeTab = ref('start')

// Mining form
const miningFormRef = ref<FormInstance>()
const startingMining = ref(false)
const dateRange = ref<[string, string]>([])
const miningForm = reactive({
  sourceType: 'ai_chat',
  sourceIds: [] as number[],
  dateRange: {
    startDate: '',
    endDate: ''
  }
})

const miningRules: FormRules = {
  sourceType: [
    { required: true, message: '请选择数据源类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ]
}

// Available sources (mock data - should be loaded from API)
const availableSources = ref([
  { id: 1, name: 'AI助手对话' },
  { id: 2, name: '客服对话' },
  { id: 3, name: '销售对话' }
])

// Pending review
const loadingReview = ref(false)
const pendingList = ref<any[]>([])
const reviewTotal = ref(0)
const selectedReviewIds = ref<number[]>([])
const reviewFilter = reactive({
  page: 1,
  limit: 20,
  sourceType: '',
  minScore: undefined as number | undefined
})

const pendingCount = computed(() => reviewTotal.value)

// Batch history
const loadingBatches = ref(false)
const batchList = ref<MiningTask[]>([])
const batchTotal = ref(0)
const batchFilter = reactive({
  page: 1,
  limit: 20
})

// Reject dialog
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectId = ref<number | null>(null)
const batchReject = ref(false)

// Disabled date (no future dates)
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// Start mining
const handleStartMining = async () => {
  if (!miningFormRef.value) return

  // Set date range
  if (dateRange.value && dateRange.value.length === 2) {
    miningForm.dateRange = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    }
  } else {
    ElMessage.warning('请选择时间范围')
    return
  }

  await miningFormRef.value.validate(async (valid) => {
    if (!valid) return

    startingMining.value = true
    try {
      const res = await startMining({
        sourceType: miningForm.sourceType,
        sourceIds: miningForm.sourceIds,
        dateRange: miningForm.dateRange
      })

      ElMessage.success('挖掘任务已启动')

      // Switch to history tab
      activeTab.value = 'history'
      loadBatchHistory()

      // Reset form
      resetMiningForm()
    } catch (error) {
      ElMessage.error('启动挖掘失败')
    } finally {
      startingMining.value = false
    }
  })
}

// Reset mining form
const resetMiningForm = () => {
  dateRange.value = []
  miningForm.sourceType = 'ai_chat'
  miningForm.sourceIds = []
  miningForm.dateRange = {
    startDate: '',
    endDate: ''
  }
  miningFormRef.value?.resetFields()
}

// Load pending review
const loadPendingReview = async () => {
  loadingReview.value = true
  try {
    const res = await getPendingReview(reviewFilter)
    pendingList.value = res.data.items || []
    reviewTotal.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载待审核列表失败')
  } finally {
    loadingReview.value = false
  }
}

// Review selection change
const handleReviewSelectionChange = (selection: any[]) => {
  selectedReviewIds.value = selection.map(item => item.id)
}

// Approve single
const handleApprove = (row: any) => {
  ElMessageBox.confirm(
    `确定要通过知识 "${row.title}" 吗？通过后将加入知识库。`,
    '确认通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      await approveMining(row.id)
      ElMessage.success('已通过')
      loadPendingReview()
      loadBatchHistory()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {
    // User cancelled
  })
}

// Reject single
const handleReject = (row: any) => {
  currentRejectId.value = row.id
  batchReject.value = false
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// Confirm reject
const confirmReject = async () => {
  try {
    if (batchReject.value) {
      await Promise.all(
        selectedReviewIds.value.map(id => rejectMining(id, rejectReason.value))
      )
      ElMessage.success('批量拒绝成功')
      selectedReviewIds.value = []
    } else if (currentRejectId.value) {
      await rejectMining(currentRejectId.value, rejectReason.value)
      ElMessage.success('已拒绝')
    }

    rejectDialogVisible.value = false
    loadPendingReview()
    loadBatchHistory()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// Batch approve
const handleBatchApprove = () => {
  ElMessageBox.confirm(
    `确定要批量通过选中的 ${selectedReviewIds.value.length} 条知识吗？`,
    '批量通过确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      await Promise.all(selectedReviewIds.value.map(id => approveMining(id)))
      ElMessage.success('批量通过成功')
      selectedReviewIds.value = []
      loadPendingReview()
      loadBatchHistory()
    } catch (error) {
      ElMessage.error('批量通过失败')
    }
  }).catch(() => {
    // User cancelled
  })
}

// Batch reject
const handleBatchReject = () => {
  batchReject.value = true
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// Load batch history
const loadBatchHistory = async () => {
  loadingBatches.value = true
  try {
    const res = await getMiningBatches(batchFilter)
    batchList.value = res.data.items || []
    batchTotal.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载挖掘历史失败')
  } finally {
    loadingBatches.value = false
  }
}

// Refresh batch status
const refreshBatchStatus = async (row: MiningTask) => {
  try {
    const res = await getMiningStatus(row.id.toString())
    Object.assign(row, res.data)
    ElMessage.success('状态已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

// Go to review
const goToReview = (row: MiningTask) => {
  reviewFilter.sourceType = row.sourceType
  activeTab.value = 'review'
  loadPendingReview()
}

// Helper functions
const getSourceTypeLabel = (sourceType: string) => {
  const labels: Record<string, string> = {
    ai_chat: 'AI对话',
    customer_feedback: '客户反馈',
    tickets: '工单记录'
  }
  return labels[sourceType] || sourceType
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return labels[status] || status
}

const getProgressPercentage = (row: MiningTask) => {
  if (row.totalCount === 0) return 0
  return Math.round((row.extractedCount / row.totalCount) * 100)
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

// Lifecycle
onMounted(() => {
  loadPendingReview()
  loadBatchHistory()
})
</script>

<style scoped lang="scss">
.knowledge-mining-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      color: #303133;
    }
  }

  :deep(.el-tabs--border-card) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-tab-pane) {
    padding: 20px;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .batch-actions {
      display: flex;
      gap: 10px;
    }
  }

  .expand-content {
    padding: 20px;
    background: #F5F7FA;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .progress-info {
    .el-progress {
      margin-bottom: 5px;
    }

    .el-text {
      display: block;
      text-align: center;
    }
  }

  .review-stats {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  :deep(.el-badge__content) {
    border: none;
  }
}
</style>
