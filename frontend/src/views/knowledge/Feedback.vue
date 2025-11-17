<template>
  <div class="knowledge-feedback-container">
    <!-- Page Header -->
    <div class="page-header">
      <h2>负反馈管理</h2>
      <el-text type="info">处理知识库使用中的负反馈，持续优化知识质量</el-text>
    </div>

    <!-- High Negative Alert -->
    <el-alert
      v-if="highNegativeList.length > 0"
      title="高负反馈预警"
      type="warning"
      show-icon
      :closable="false"
      class="warning-alert"
    >
      <div class="alert-content">
        <p>以下知识条目负反馈较多，建议优先处理：</p>
        <div class="high-negative-list">
          <el-tag
            v-for="item in highNegativeList.slice(0, 5)"
            :key="item.id"
            type="danger"
            effect="dark"
            class="high-negative-tag"
            @click="viewKnowledge(item)"
          >
            {{ item.title }} ({{ item.negativeFeedbackCount }}次)
          </el-tag>
          <el-button
            v-if="highNegativeList.length > 5"
            size="small"
            type="warning"
            link
            @click="showAllHighNegative"
          >
            查看全部 {{ highNegativeList.length }} 条
          </el-button>
        </div>
      </div>
    </el-alert>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Feedback List Tab -->
      <el-tab-pane name="list">
        <template #label>
          <el-badge :value="unhandledCount" :hidden="unhandledCount === 0">
            反馈列表
          </el-badge>
        </template>

        <!-- Filter Form -->
        <el-card shadow="never" class="filter-card">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="知识ID">
              <el-input
                v-model.number="filterForm.knowledgeId"
                placeholder="输入知识ID"
                clearable
                style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="反馈场景">
              <el-select
                v-model="filterForm.feedbackScene"
                placeholder="全部场景"
                clearable
                style="width: 150px"
              >
                <el-option label="客户咨询" value="客户咨询" />
                <el-option label="AI对话" value="AI对话" />
                <el-option label="智能搜索" value="智能搜索" />
                <el-option label="话术推荐" value="话术推荐" />
              </el-select>
            </el-form-item>

            <el-form-item label="处理状态">
              <el-select
                v-model="filterForm.handled"
                placeholder="全部状态"
                clearable
                style="width: 120px"
              >
                <el-option label="未处理" :value="false" />
                <el-option label="已处理" :value="true" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadFeedbackList">
                查询
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Feedback Table -->
        <el-card shadow="never" class="table-card">
          <el-table v-loading="loading" :data="feedbackList" stripe>
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="expand-content">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="用户问题" :span="2">
                      <div style="white-space: pre-wrap">{{ row.userQuestion }}</div>
                    </el-descriptions-item>
                    <el-descriptions-item label="知识答案" :span="2">
                      <div style="white-space: pre-wrap">{{ row.knowledgeAnswer }}</div>
                    </el-descriptions-item>
                    <el-descriptions-item label="反馈原因" :span="2">
                      {{ row.feedbackReason }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="row.expectedAnswer"
                      label="期望答案"
                      :span="2"
                    >
                      <div style="white-space: pre-wrap">{{ row.expectedAnswer }}</div>
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="row.handled"
                      label="处理结果"
                      :span="2"
                    >
                      {{ row.handleResult }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="row.handled"
                      label="优化措施"
                      :span="2"
                    >
                      {{ row.optimizationAction }}
                    </el-descriptions-item>
                    <el-descriptions-item label="客户ID">
                      {{ row.customerId || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="提交时间">
                      {{ row.createTime }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="id" label="ID" width="80" />

            <el-table-column prop="knowledgeId" label="知识ID" width="100">
              <template #default="{ row }">
                <el-link type="primary" @click="viewKnowledgeById(row.knowledgeId)">
                  #{{ row.knowledgeId }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column prop="feedbackScene" label="反馈场景" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.feedbackScene }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="userQuestion" label="用户问题" min-width="200" show-overflow-tooltip />

            <el-table-column prop="feedbackReason" label="反馈原因" width="150" show-overflow-tooltip />

            <el-table-column prop="handled" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.handled ? 'success' : 'warning'">
                  {{ row.handled ? '已处理' : '未处理' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="提交时间" width="180" />

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="!row.handled"
                  size="small"
                  type="primary"
                  link
                  @click="handleFeedback(row)"
                >
                  处理
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="info"
                  link
                  @click="viewHandleResult(row)"
                >
                  查看处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="filterForm.page"
              v-model:page-size="filterForm.limit"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadFeedbackList"
              @current-change="loadFeedbackList"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- Statistics Tab -->
      <el-tab-pane label="统计分析" name="stats">
        <el-card shadow="never">
          <div class="stats-container">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic title="总反馈数" :value="statsData.totalFeedback" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="未处理" :value="statsData.unhandled">
                  <template #suffix>
                    <el-text type="warning">条</el-text>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic title="已处理" :value="statsData.handled">
                  <template #suffix>
                    <el-text type="success">条</el-text>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic title="处理率" :value="statsData.handleRate" suffix="%" />
              </el-col>
            </el-row>

            <el-divider />

            <h3>高负反馈知识</h3>
            <el-table :data="highNegativeList" stripe>
              <el-table-column prop="id" label="知识ID" width="100" />
              <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="sceneCategory" label="场景分类" width="120">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.sceneCategory }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="negativeFeedbackCount" label="负反馈次数" width="120" sortable>
                <template #default="{ row }">
                  <el-text type="danger" size="large">
                    {{ row.negativeFeedbackCount }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column prop="usageCount" label="使用次数" width="100" />
              <el-table-column label="负反馈率" width="120">
                <template #default="{ row }">
                  <el-progress
                    :percentage="getFeedbackRate(row)"
                    :color="getFeedbackRateColor(row)"
                    :stroke-width="8"
                  >
                    <span style="font-size: 12px">{{ getFeedbackRate(row) }}%</span>
                  </el-progress>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click="viewKnowledge(row)">
                    查看详情
                  </el-button>
                  <el-button size="small" type="warning" link @click="handleOptimize(row)">
                    优化
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- Handle Feedback Dialog -->
    <el-dialog
      v-model="handleDialogVisible"
      title="处理反馈"
      width="700px"
    >
      <el-form
        ref="handleFormRef"
        :model="handleForm"
        :rules="handleRules"
        label-width="100px"
      >
        <el-form-item label="反馈信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户问题">
              {{ currentFeedback?.userQuestion }}
            </el-descriptions-item>
            <el-descriptions-item label="反馈原因">
              {{ currentFeedback?.feedbackReason }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <el-form-item label="处理结果" prop="handleResult">
          <el-select v-model="handleForm.handleResult" placeholder="选择处理结果">
            <el-option label="已优化知识内容" value="已优化知识内容" />
            <el-option label="已添加新知识" value="已添加新知识" />
            <el-option label="知识已禁用" value="知识已禁用" />
            <el-option label="反馈不合理" value="反馈不合理" />
            <el-option label="其他处理" value="其他处理" />
          </el-select>
        </el-form-item>

        <el-form-item label="优化措施" prop="optimizationAction">
          <el-input
            v-model="handleForm.optimizationAction"
            type="textarea"
            :rows="4"
            placeholder="请描述具体的优化措施或处理说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitHandle">
          提交处理
        </el-button>
      </template>
    </el-dialog>

    <!-- View Handle Result Dialog -->
    <el-dialog
      v-model="viewResultDialogVisible"
      title="处理结果"
      width="600px"
    >
      <el-descriptions v-if="currentFeedback" :column="1" border>
        <el-descriptions-item label="处理结果">
          {{ currentFeedback.handleResult }}
        </el-descriptions-item>
        <el-descriptions-item label="优化措施">
          {{ currentFeedback.optimizationAction }}
        </el-descriptions-item>
        <el-descriptions-item label="处理时间">
          {{ currentFeedback.updateTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- Knowledge Detail Dialog -->
    <el-dialog
      v-model="knowledgeDialogVisible"
      title="知识详情"
      width="800px"
    >
      <el-descriptions v-if="currentKnowledge" :column="2" border>
        <el-descriptions-item label="ID">
          {{ currentKnowledge.id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentKnowledge.status === 'active' ? 'success' : 'info'">
            {{ currentKnowledge.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">
          {{ currentKnowledge.title }}
        </el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div style="white-space: pre-wrap">{{ currentKnowledge.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="使用次数">
          {{ currentKnowledge.usageCount }}
        </el-descriptions-item>
        <el-descriptions-item label="负反馈次数">
          <el-text type="danger">{{ currentKnowledge.negativeFeedbackCount }}</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="knowledgeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editKnowledge">编辑知识</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getFeedbackList,
  handleFeedback as handleFeedbackApi,
  getHighNegativeFeedback,
  getKnowledgeDetail,
  type KnowledgeBase
} from '@/api/knowledge'
import { useRouter } from 'vue-router'

const router = useRouter()

// Active tab
const activeTab = ref('list')

// Feedback list
const loading = ref(false)
const feedbackList = ref<any[]>([])
const total = ref(0)
const filterForm = reactive({
  page: 1,
  limit: 20,
  knowledgeId: undefined as number | undefined,
  feedbackScene: '',
  handled: undefined as boolean | undefined
})

// High negative feedback
const highNegativeList = ref<KnowledgeBase[]>([])

// Handle dialog
const handleDialogVisible = ref(false)
const submitting = ref(false)
const handleFormRef = ref<FormInstance>()
const currentFeedback = ref<any>(null)
const handleForm = reactive({
  handleResult: '',
  optimizationAction: ''
})

const handleRules: FormRules = {
  handleResult: [
    { required: true, message: '请选择处理结果', trigger: 'change' }
  ],
  optimizationAction: [
    { required: true, message: '请输入优化措施', trigger: 'blur' },
    { min: 10, message: '优化措施至少10个字符', trigger: 'blur' }
  ]
}

// View result dialog
const viewResultDialogVisible = ref(false)

// Knowledge detail dialog
const knowledgeDialogVisible = ref(false)
const currentKnowledge = ref<KnowledgeBase | null>(null)

// Computed
const unhandledCount = computed(() => {
  return feedbackList.value.filter(item => !item.handled).length
})

const statsData = computed(() => {
  const totalFeedback = total.value
  const handled = feedbackList.value.filter(item => item.handled).length
  const unhandled = totalFeedback - handled
  const handleRate = totalFeedback > 0 ? Math.round((handled / totalFeedback) * 100) : 0

  return {
    totalFeedback,
    handled,
    unhandled,
    handleRate
  }
})

// Load feedback list
const loadFeedbackList = async () => {
  loading.value = true
  try {
    const res = await getFeedbackList(filterForm)
    feedbackList.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载反馈列表失败')
  } finally {
    loading.value = false
  }
}

// Load high negative feedback
const loadHighNegativeFeedback = async () => {
  try {
    const res = await getHighNegativeFeedback()
    highNegativeList.value = res.data || []
  } catch (error) {
    console.error('Failed to load high negative feedback:', error)
  }
}

// Handle feedback
const handleFeedback = (row: any) => {
  currentFeedback.value = row
  handleForm.handleResult = ''
  handleForm.optimizationAction = ''
  handleDialogVisible.value = true
}

// Submit handle
const submitHandle = async () => {
  if (!handleFormRef.value || !currentFeedback.value) return

  await handleFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await handleFeedbackApi(currentFeedback.value.id, handleForm)
      ElMessage.success('处理成功')
      handleDialogVisible.value = false
      loadFeedbackList()
    } catch (error) {
      ElMessage.error('处理失败')
    } finally {
      submitting.value = false
    }
  })
}

// View handle result
const viewHandleResult = (row: any) => {
  currentFeedback.value = row
  viewResultDialogVisible.value = true
}

// View knowledge by ID
const viewKnowledgeById = async (id: number) => {
  try {
    const res = await getKnowledgeDetail(id)
    currentKnowledge.value = res.data
    knowledgeDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载知识详情失败')
  }
}

// View knowledge
const viewKnowledge = (knowledge: KnowledgeBase) => {
  currentKnowledge.value = knowledge
  knowledgeDialogVisible.value = true
}

// Edit knowledge
const editKnowledge = () => {
  if (currentKnowledge.value) {
    router.push({
      path: '/knowledge/list',
      query: { editId: currentKnowledge.value.id }
    })
  }
}

// Handle optimize
const handleOptimize = (knowledge: KnowledgeBase) => {
  router.push({
    path: '/knowledge/list',
    query: { editId: knowledge.id }
  })
}

// Show all high negative
const showAllHighNegative = () => {
  activeTab.value = 'stats'
}

// Reset filter
const handleReset = () => {
  Object.assign(filterForm, {
    page: 1,
    limit: 20,
    knowledgeId: undefined,
    feedbackScene: '',
    handled: undefined
  })
  loadFeedbackList()
}

// Get feedback rate
const getFeedbackRate = (knowledge: KnowledgeBase) => {
  if (knowledge.usageCount === 0) return 0
  return Math.round((knowledge.negativeFeedbackCount / knowledge.usageCount) * 100)
}

// Get feedback rate color
const getFeedbackRateColor = (knowledge: KnowledgeBase) => {
  const rate = getFeedbackRate(knowledge)
  if (rate >= 50) return '#F56C6C'
  if (rate >= 30) return '#E6A23C'
  return '#67C23A'
}

// Lifecycle
onMounted(() => {
  loadFeedbackList()
  loadHighNegativeFeedback()
})
</script>

<style scoped lang="scss">
.knowledge-feedback-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      color: #303133;
    }
  }

  .warning-alert {
    margin-bottom: 20px;

    .alert-content {
      p {
        margin: 0 0 10px 0;
      }

      .high-negative-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;

        .high-negative-tag {
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }

  :deep(.el-tabs--border-card) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  .filter-card,
  .table-card {
    margin-bottom: 20px;
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

  .stats-container {
    h3 {
      margin: 20px 0;
      color: #303133;
    }

    :deep(.el-statistic__head) {
      font-size: 14px;
      color: #909399;
    }

    :deep(.el-statistic__content) {
      font-size: 28px;
      font-weight: 600;
    }
  }

  :deep(.el-badge__content) {
    border: none;
  }
}
</style>
