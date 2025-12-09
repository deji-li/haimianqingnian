<template>
  <div class="knowledge-mining">
    <div class="page-header">
      <h2>AI知识挖掘</h2>
      <el-button type="primary" @click="startNewMining">
        <el-icon><Plus /></el-icon>
        新建挖掘任务
      </el-button>
    </div>

    <!-- 挖掘任务列表 -->
    <div class="mining-tasks">
      <el-table v-loading="loading" :data="miningTasks" style="width: 100%">
        <el-table-column prop="taskName" label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="task-name">
              <span>{{ row.taskName }}</span>
              <el-tag v-if="row.isAutoTask" size="small" type="info">自动任务</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="miningMethod" label="挖掘方式" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getMiningMethodType(row.miningMethod)">
              {{ getMiningMethodText(row.miningMethod) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'exception' : ''"
            />
          </template>
        </el-table-column>

        <el-table-column label="挖掘结果" width="200">
          <template #default="{ row }">
            <div class="mining-results" v-if="row.status === 'completed'">
              <div class="result-item">
                <span>总提取: {{ row.totalExtracted || 0 }}</span>
              </div>
              <div class="result-item">
                <span>高质量: {{ row.highQuality || 0 }}</span>
              </div>
              <div class="result-item">
                <span>已采纳: {{ row.approved || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="completedTime" label="完成时间" width="180">
          <template #default="{ row }">
            {{ row.completedTime ? formatDateTime(row.completedTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="viewTaskDetail(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                v-if="row.status === 'completed'"
                size="small"
                type="primary"
                @click="reviewResults(row)"
              >
                <el-icon><Check /></el-icon>
                审核
              </el-button>
              <el-button
                v-if="row.status === 'running'"
                size="small"
                type="warning"
                @click="pauseTask(row)"
              >
                <el-icon><VideoPause /></el-icon>
                暂停
              </el-button>
              <el-button
                v-if="row.status === 'paused'"
                size="small"
                type="success"
                @click="resumeTask(row)"
              >
                <el-icon><VideoPlay /></el-icon>
                继续
              </el-button>
              <el-button size="small" type="danger" @click="deleteTask(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 挖掘配置对话框 -->
    <el-dialog
      v-model="showMiningConfigDialog"
      title="配置AI知识挖掘"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="miningFormRef"
        :model="miningForm"
        :rules="miningFormRules"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input
            v-model="miningForm.taskName"
            placeholder="请输入任务名称"
          />
        </el-form-item>

        <el-form-item label="挖掘方式" prop="miningMethod">
          <el-radio-group v-model="miningForm.miningMethod">
            <el-radio value="SMART_SELECT">智能选取</el-radio>
            <el-radio value="SPECIFY_EMPLOYEES">指定员工</el-radio>
            <el-radio value="MANUAL_UPLOAD">手动上传</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 时间范围 -->
        <el-form-item
          label="时间范围"
          v-if="miningForm.miningMethod !== 'MANUAL_UPLOAD'"
        >
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="handleDateRangeChange"
          />
        </el-form-item>

        <!-- 指定员工 -->
        <el-form-item
          label="选择员工"
          v-if="miningForm.miningMethod === 'SPECIFY_EMPLOYEES'"
          prop="employeeIds"
        >
          <el-select
            v-model="miningForm.employeeIds"
            multiple
            filterable
            placeholder="选择员工"
            style="width: 100%"
          >
            <el-option
              v-for="employee in employeeList"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>

        <!-- 智能选取条件 -->
        <div v-if="miningForm.miningMethod === 'SMART_SELECT'">
          <el-form-item label="质量级别">
            <el-select
              v-model="miningForm.smartSelectCriteria.minQualityLevel"
              placeholder="选择质量级别"
              style="width: 200px"
            >
              <el-option label="A 级" value="A" />
              <el-option label="B 级" value="B" />
              <el-option label="C 级" value="C" />
              <el-option label="D 级" value="D" />
            </el-select>
          </el-form-item>

          <el-form-item label="意向度评分">
            <el-input-number
              v-model="miningForm.smartSelectCriteria.minIntentionScore"
              :min="0"
              :max="100"
              placeholder="最低意向度评分"
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <!-- 关键词筛选 -->
        <div v-if="miningForm.smartSelectCriteria">
          <el-form-item label="包含关键词">
            <el-input
              v-model="includeKeywordsText"
              placeholder="用逗号分隔多个关键词"
              @change="updateKeywords('include')"
            />
          </el-form-item>

          <el-form-item label="排除关键词">
            <el-input
              v-model="excludeKeywordsText"
              placeholder="用逗号分隔多个关键词"
              @change="updateKeywords('exclude')"
            />
          </el-form-item>
        </div>

        <el-form-item label="最大处理数量">
          <el-input-number
            v-model="miningForm.maxCount"
            :min="10"
            :max="500"
            placeholder="最大处理记录数"
            style="width: 200px"
          />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item
          label="上传文件"
          v-if="miningForm.miningMethod === 'MANUAL_UPLOAD'"
        >
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".txt,.csv,.xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              支持 .txt, .csv, .xlsx, .xls 格式文件
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showMiningConfigDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitMiningTask">
          开始挖掘
        </el-button>
      </template>
    </el-dialog>

    <!-- 挖掘结果审核对话框 -->
    <el-dialog
      v-model="showReviewDialog"
      title="审核挖掘结果"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentTask" class="review-content">
        <!-- 审核统计 -->
        <div class="review-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="待审核" :value="pendingReviewCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="已通过" :value="approvedCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="已拒绝" :value="rejectedCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="采纳率" :value="adoptionRate" suffix="%" :precision="1" />
            </el-col>
          </el-row>
        </div>

        <!-- 待审核列表 -->
        <div class="pending-list">
          <h4>待审核知识 ({{ pendingKnowledge.length }})</h4>

          <el-table
            v-loading="reviewLoading"
            :data="pendingKnowledge"
            style="width: 100%"
            @selection-change="handleReviewSelectionChange"
          >
            <el-table-column type="selection" width="55" />

            <el-table-column prop="question" label="问题" min-width="200">
              <template #default="{ row }">
                <el-tooltip :content="row.question" placement="top">
                  <div class="question-text">{{ row.question }}</div>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column prop="answer" label="答案" min-width="300">
              <template #default="{ row }">
                <el-tooltip :content="row.answer" placement="top">
                  <div class="answer-text">{{ row.answer }}</div>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column prop="aiScore" label="AI评分" width="100" align="center">
              <template #default="{ row }">
                <el-rate
                  v-model="row.aiScore"
                  disabled
                  show-score
                  :max="100"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                />
              </template>
            </el-table-column>

            <el-table-column prop="confidenceScore" label="置信度" width="100" align="center">
              <template #default="{ row }">
                <el-progress
                  type="circle"
                  :percentage="row.confidenceScore"
                  :width="50"
                  :stroke-width="6"
                />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" type="success" @click="approveItem(row)">
                    <el-icon><Check /></el-icon>
                  </el-button>
                  <el-button size="small" type="warning" @click="editItem(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" type="danger" @click="rejectItem(row)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="showReviewDialog = false">关闭</el-button>
        <el-button type="success" @click="batchApprove" :disabled="selectedReviewItems.length === 0">
          批量通过 ({{ selectedReviewItems.length }})
        </el-button>
        <el-button type="danger" @click="batchReject" :disabled="selectedReviewItems.length === 0">
          批量拒绝 ({{ selectedReviewItems.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  View,
  Check,
  Delete,
  VideoPause,
  VideoPlay,
  UploadFilled,
  Edit,
  Close
} from '@element-plus/icons-vue'
import { enterpriseKnowledgeApi } from '@/api/enterprise-knowledge'

// 响应式数据
const loading = ref(false)
const reviewLoading = ref(false)
const miningTasks = ref([])
const showMiningConfigDialog = ref(false)
const showReviewDialog = ref(false)
const currentTask = ref(null)
const selectedReviewItems = ref([])
const pendingKnowledge = ref([])
const creating = ref(false)

// 表单引用
const miningFormRef = ref()

// 表单数据
const miningForm = reactive({
  taskName: '',
  miningMethod: 'SMART_SELECT',
  employeeIds: [],
  maxCount: 100,
  smartSelectCriteria: {
    minQualityLevel: 'B',
    minIntentionScore: 60,
    includeKeywords: [],
    excludeKeywords: []
  },
  uploadedFiles: []
})

// 其他数据
const dateRange = ref([])
const includeKeywordsText = ref('')
const excludeKeywordsText = ref('')
const fileList = ref([])

// 员工列表（模拟数据）
const employeeList = ref([
  { id: 1, name: '张三', department: '销售部' },
  { id: 2, name: '李四', department: '市场部' },
  { id: 3, name: '王五', department: '教学部' }
])

// 表单验证规则
const miningFormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  miningMethod: [
    { required: true, message: '请选择挖掘方式', trigger: 'change' }
  ],
  employeeIds: [
    { required: true, message: '请选择员工', trigger: 'change' }
  ]
}

// 计算属性
const pendingReviewCount = computed(() => pendingKnowledge.value.length)
const approvedCount = computed(() => currentTask.value?.approved || 0)
const rejectedCount = computed(() => currentTask.value?.rejected || 0)
const adoptionRate = computed(() => {
  const total = approvedCount.value + rejectedCount.value
  return total > 0 ? (approvedCount.value / total) * 100 : 0
})

// 方法
const loadMiningTasks = async () => {
  loading.value = true
  try {
    const response = await enterpriseKnowledgeApi.getMiningTasks()
    miningTasks.value = response.data
  } catch (error) {
    ElMessage.error('加载挖掘任务失败')
    console.error('Load mining tasks error:', error)
  } finally {
    loading.value = false
  }
}

const startNewMining = () => {
  // 重置表单
  Object.assign(miningForm, {
    taskName: '',
    miningMethod: 'SMART_SELECT',
    employeeIds: [],
    maxCount: 100,
    smartSelectCriteria: {
      minQualityLevel: 'B',
      minIntentionScore: 60,
      includeKeywords: [],
      excludeKeywords: []
    },
    uploadedFiles: []
  })

  dateRange.value = []
  includeKeywordsText.value = ''
  excludeKeywordsText.value = ''
  fileList.value = []

  showMiningConfigDialog.value = true
}

const handleDateRangeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    miningForm.dateRange = {
      startDate: dates[0],
      endDate: dates[1]
    }
  }
}

const updateKeywords = (type: 'include' | 'exclude') => {
  const text = type === 'include' ? includeKeywordsText.value : excludeKeywordsText.value
  const keywords = text.split(',').map(k => k.trim()).filter(k => k)
  miningForm.smartSelectCriteria[type + 'Keywords'] = keywords
}

const handleFileChange = (file: any, fileList: any[]) => {
  miningForm.uploadedFiles = fileList
}

const submitMiningTask = async () => {
  if (!miningFormRef.value) return

  try {
    await miningFormRef.value.validate()

    creating.value = true

    const taskData = {
      ...miningForm,
      dateRange: dateRange.value
    }

    await enterpriseKnowledgeApi.startMining(taskData)

    ElMessage.success('挖掘任务已启动')
    showMiningConfigDialog.value = false
    loadMiningTasks()
  } catch (error) {
    console.error('Submit mining task error:', error)
  } finally {
    creating.value = false
  }
}

const viewTaskDetail = (task: any) => {
  currentTask.value = task
  // 可以打开详情对话框或跳转到详情页面
}

const reviewResults = async (task: any) => {
  currentTask.value = task
  reviewLoading.value = true

  try {
    const response = await enterpriseKnowledgeApi.getMiningResults(task.id)
    pendingKnowledge.value = response.data.filter(item => item.reviewStatus === 'pending')
    showReviewDialog.value = true
  } catch (error) {
    ElMessage.error('加载挖掘结果失败')
    console.error('Load mining results error:', error)
  } finally {
    reviewLoading.value = false
  }
}

const handleReviewSelectionChange = (selection: any[]) => {
  selectedReviewItems.value = selection
}

const approveItem = async (item: any) => {
  try {
    await enterpriseKnowledgeApi.approveMiningResult(item.id)
    ElMessage.success('已通过')
    loadPendingKnowledge()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const rejectItem = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这条知识吗？', '确认拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await enterpriseKnowledgeApi.rejectMiningResult(item.id)
    ElMessage.success('已拒绝')
    loadPendingKnowledge()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const editItem = (item: any) => {
  // 打开编辑对话框
  ElMessage.info('编辑功能开发中')
}

const batchApprove = async () => {
  try {
    const ids = selectedReviewItems.value.map((item: any) => item.id)
    await enterpriseKnowledgeApi.batchApproveResults(ids)
    ElMessage.success(`已通过 ${ids.length} 条知识`)
    loadPendingKnowledge()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

const batchReject = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝选中的 ${selectedReviewItems.value.length} 条知识吗？`,
      '确认批量拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedReviewItems.value.map((item: any) => item.id)
    await enterpriseKnowledgeApi.batchRejectResults(ids)
    ElMessage.success(`已拒绝 ${ids.length} 条知识`)
    loadPendingKnowledge()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  }
}

const pauseTask = async (task: any) => {
  try {
    await enterpriseKnowledgeApi.pauseMiningTask(task.id)
    ElMessage.success('任务已暂停')
    loadMiningTasks()
  } catch (error) {
    ElMessage.error('暂停失败')
  }
}

const resumeTask = async (task: any) => {
  try {
    await enterpriseKnowledgeApi.resumeMiningTask(task.id)
    ElMessage.success('任务已恢复')
    loadMiningTasks()
  } catch (error) {
    ElMessage.error('恢复失败')
  }
}

const deleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${task.taskName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await enterpriseKnowledgeApi.deleteMiningTask(task.id)
    ElMessage.success('删除成功')
    loadMiningTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const loadPendingKnowledge = async () => {
  if (!currentTask.value) return

  try {
    const response = await enterpriseKnowledgeApi.getMiningResults(currentTask.value.id)
    pendingKnowledge.value = response.data.filter(item => item.reviewStatus === 'pending')
  } catch (error) {
    console.error('Load pending knowledge error:', error)
  }
}

// 辅助方法
const getMiningMethodType = (method: string) => {
  const typeMap: Record<string, string> = {
    'SMART_SELECT': 'primary',
    'SPECIFY_EMPLOYEES': 'success',
    'MANUAL_UPLOAD': 'warning'
  }
  return typeMap[method] || ''
}

const getMiningMethodText = (method: string) => {
  const textMap: Record<string, string> = {
    'SMART_SELECT': '智能选取',
    'SPECIFY_EMPLOYEES': '指定员工',
    'MANUAL_UPLOAD': '手动上传'
  }
  return textMap[method] || method
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'paused': 'warning',
    'pending': 'info'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'running': '运行中',
    'completed': '已完成',
    'failed': '失败',
    'paused': '已暂停',
    'pending': '等待中'
  }
  return textMap[status] || status
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadMiningTasks()
})
</script>

<style lang="scss" scoped>
.knowledge-mining {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .mining-tasks {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .task-name {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .mining-results {
      .result-item {
        font-size: 12px;
        color: #606266;
        margin-bottom: 2px;
      }
    }
  }

  .review-content {
    .review-summary {
      margin-bottom: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .pending-list {
      h4 {
        margin: 0 0 15px 0;
        color: #303133;
      }

      .question-text,
      .answer-text {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>