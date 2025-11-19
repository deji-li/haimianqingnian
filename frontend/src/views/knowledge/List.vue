<template>
  <div class="knowledge-list-container">
    <!-- Search and Filter Section -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryForm" :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索标题、内容或关键词"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="场景分类">
          <el-select
            v-model="queryForm.sceneCategory"
            placeholder="选择场景"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="category in sceneCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="产品分类">
          <el-select
            v-model="queryForm.productCategory"
            placeholder="选择产品"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="product in productCategories"
              :key="product.value"
              :label="product.label"
              :value="product.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="客户类型">
          <el-select
            v-model="queryForm.customerType"
            placeholder="选择客户类型"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="type in customerTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="问题类型">
          <el-select
            v-model="queryForm.questionType"
            placeholder="选择问题类型"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="type in questionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item label="来源">
          <el-select
            v-model="queryForm.sourceType"
            placeholder="选择来源"
            clearable
            style="width: 140px"
          >
            <el-option label="手动创建" value="manual" />
            <el-option label="AI挖掘" value="ai_mining" />
            <el-option label="行业导入" value="industry_import" />
            <el-option label="批量导入" value="batch_import" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Action Bar -->
    <el-card class="action-card" shadow="never">
      <div class="action-bar">
        <div class="left-actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建知识
          </el-button>
          <el-button :icon="Upload" @click="handleBatchImport">
            批量导入
          </el-button>
          <el-button
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div class="right-info">
          <el-text type="info">
            共 {{ total }} 条知识，已选择 {{ selectedIds.length }} 条
          </el-text>
        </div>
      </div>
    </el-card>

    <!-- Knowledge Table -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="knowledgeList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

        <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-text line-clamp="2">{{ row.content }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="keywords" label="关键词" width="150" show-overflow-tooltip />

        <el-table-column prop="sceneCategory" label="场景分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.sceneCategory }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sourceType" label="来源" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getSourceTypeLabel(row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="usageCount" label="使用次数" width="100" sortable />

        <el-table-column prop="negativeFeedbackCount" label="负反馈" width="100" sortable>
          <template #default="{ row }">
            <el-text v-if="row.negativeFeedbackCount > 0" type="danger">
              {{ row.negativeFeedbackCount }}
            </el-text>
            <el-text v-else type="info">0</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入知识标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入知识内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="关键词" prop="keywords">
          <el-input
            v-model="formData.keywords"
            placeholder="请输入关键词，多个关键词用逗号分隔"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="场景分类" prop="sceneCategory">
              <el-select v-model="formData.sceneCategory" placeholder="选择场景">
                <el-option
                  v-for="category in sceneCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品分类" prop="productCategory">
              <el-select v-model="formData.productCategory" placeholder="选择产品">
                <el-option
                  v-for="product in productCategories"
                  :key="product.value"
                  :label="product.label"
                  :value="product.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="formData.customerType" placeholder="选择客户类型">
                <el-option
                  v-for="type in customerTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="问题类型" prop="questionType">
              <el-select v-model="formData.questionType" placeholder="选择问题类型">
                <el-option
                  v-for="type in questionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="优先级" prop="priority">
          <el-slider
            v-model="formData.priority"
            :min="1"
            :max="100"
            :marks="{ 1: '低', 50: '中', 100: '高' }"
            show-stops
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- View Detail Dialog -->
    <el-dialog
      v-model="viewDialogVisible"
      title="知识详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentKnowledge">
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
        <el-descriptions-item label="关键词" :span="2">
          {{ currentKnowledge.keywords }}
        </el-descriptions-item>
        <el-descriptions-item label="场景分类">
          {{ currentKnowledge.sceneCategory }}
        </el-descriptions-item>
        <el-descriptions-item label="产品分类">
          {{ currentKnowledge.productCategory || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="客户类型">
          {{ currentKnowledge.customerType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="问题类型">
          {{ currentKnowledge.questionType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(currentKnowledge.priority)">
            {{ currentKnowledge.priority }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="来源">
          {{ getSourceTypeLabel(currentKnowledge.sourceType) }}
        </el-descriptions-item>
        <el-descriptions-item label="使用次数">
          {{ currentKnowledge.usageCount }}
        </el-descriptions-item>
        <el-descriptions-item label="负反馈次数">
          <el-text :type="currentKnowledge.negativeFeedbackCount > 0 ? 'danger' : 'info'">
            {{ currentKnowledge.negativeFeedbackCount }}
          </el-text>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentKnowledge.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ currentKnowledge.updateTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- Batch Import Dialog -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入"
      width="600px"
    >
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>请上传符合格式的JSON文件，每个知识条目应包含以下字段：</p>
        <ul>
          <li>title: 标题（必填）</li>
          <li>content: 内容（必填）</li>
          <li>keywords: 关键词（可选）</li>
          <li>sceneCategory: 场景分类（必填）</li>
          <li>priority: 优先级（可选，默认50）</li>
        </ul>
      </el-alert>

      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".json"
        :on-change="handleFileChange"
      >
        <template #trigger>
          <el-button type="primary" :icon="Upload">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            只能上传JSON文件
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          :disabled="!importFile"
          @click="handleConfirmImport"
        >
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  getKnowledgeList,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getKnowledgeDetail,
  batchImport,
  getCategories,
  type KnowledgeBase,
  type QueryKnowledgeDto,
  type CreateKnowledgeDto
} from '@/api/knowledge'

// Query form
const queryForm = reactive<QueryKnowledgeDto>({
  page: 1,
  limit: 20,
  keyword: '',
  sceneCategory: '',
  productCategory: '',
  customerType: '',
  questionType: '',
  status: '',
  sourceType: ''
})

// Table data
const loading = ref(false)
const knowledgeList = ref<KnowledgeBase[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

// Category options
const sceneCategories = ref<Array<{ label: string; value: string }>>([
  { label: '产品介绍', value: '产品介绍' },
  { label: '售后服务', value: '售后服务' },
  { label: '营销活动', value: '营销活动' },
  { label: '常见问题', value: '常见问题' },
  { label: '技术支持', value: '技术支持' },
  { label: '价格政策', value: '价格政策' },
  { label: '合作政策', value: '合作政策' },
  { label: '其他', value: '其他' }
])

const productCategories = ref<Array<{ label: string; value: string }>>([])
const customerTypes = ref<Array<{ label: string; value: string }>>([
  { label: '新客户', value: '新客户' },
  { label: '老客户', value: '老客户' },
  { label: '潜在客户', value: '潜在客户' },
  { label: 'VIP客户', value: 'VIP客户' }
])

const questionTypes = ref<Array<{ label: string; value: string }>>([
  { label: '咨询类', value: '咨询类' },
  { label: '投诉类', value: '投诉类' },
  { label: '建议类', value: '建议类' },
  { label: '技术类', value: '技术类' }
])

// Dialog state
const dialogVisible = ref(false)
const dialogTitle = ref('新建知识')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

// View dialog
const viewDialogVisible = ref(false)
const currentKnowledge = ref<KnowledgeBase | null>(null)

// Import dialog
const importDialogVisible = ref(false)
const importLoading = ref(false)
const importFile = ref<File | null>(null)
const uploadRef = ref()

// Form data
const formData = reactive<CreateKnowledgeDto>({
  title: '',
  content: '',
  keywords: '',
  sceneCategory: '',
  productCategory: '',
  customerType: '',
  questionType: '',
  priority: 50
})

// Form rules
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '内容长度在 10 到 2000 个字符', trigger: 'blur' }
  ],
  sceneCategory: [
    { required: true, message: '请选择场景分类', trigger: 'change' }
  ]
}

// Load categories
const loadCategories = async () => {
  try {
    const res = await getCategories()
    if (res.data?.productCategories) {
      productCategories.value = res.data.productCategories.map((item: string) => ({
        label: item,
        value: item
      }))
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// Load knowledge list
const loadKnowledgeList = async () => {
  loading.value = true
  try {
    const res = await getKnowledgeList(queryForm)
    knowledgeList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载知识列表失败')
  } finally {
    loading.value = false
  }
}

// Search
const handleSearch = () => {
  queryForm.page = 1
  loadKnowledgeList()
}

// Reset
const handleReset = () => {
  Object.assign(queryForm, {
    page: 1,
    limit: 20,
    keyword: '',
    sceneCategory: '',
    productCategory: '',
    customerType: '',
    questionType: '',
    status: '',
    sourceType: ''
  })
  loadKnowledgeList()
}

// Selection change
const handleSelectionChange = (selection: KnowledgeBase[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// Create
const handleCreate = () => {
  dialogTitle.value = '新建知识'
  editingId.value = null
  resetFormData()
  dialogVisible.value = true
}

// Edit
const handleEdit = async (row: KnowledgeBase) => {
  dialogTitle.value = '编辑知识'
  editingId.value = row.id

  try {
    const res = await getKnowledgeDetail(row.id)
    Object.assign(formData, {
      title: res.data.title,
      content: res.data.content,
      keywords: res.data.keywords,
      sceneCategory: res.data.sceneCategory,
      productCategory: res.data.productCategory,
      customerType: res.data.customerType,
      questionType: res.data.questionType,
      priority: res.data.priority
    })
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载知识详情失败')
  }
}

// View
const handleView = async (row: KnowledgeBase) => {
  try {
    const res = await getKnowledgeDetail(row.id)
    currentKnowledge.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载知识详情失败')
  }
}

// Delete
const handleDelete = (row: KnowledgeBase) => {
  ElMessageBox.confirm(
    `确定要删除知识 "${row.title}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteKnowledge(row.id)
      ElMessage.success('删除成功')
      loadKnowledgeList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // User cancelled
  })
}

// Batch delete
const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 条知识吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await Promise.all(selectedIds.value.map(id => deleteKnowledge(id)))
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      loadKnowledgeList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    // User cancelled
  })
}

// Status change
const handleStatusChange = async (row: KnowledgeBase) => {
  try {
    await updateKnowledge(row.id, { status: row.status } as any)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    // Revert status
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (editingId.value) {
        await updateKnowledge(editingId.value, formData)
        ElMessage.success('更新成功')
      } else {
        await createKnowledge(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadKnowledgeList()
    } catch (error) {
      ElMessage.error(editingId.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// Reset form data
const resetFormData = () => {
  Object.assign(formData, {
    title: '',
    content: '',
    keywords: '',
    sceneCategory: '',
    productCategory: '',
    customerType: '',
    questionType: '',
    priority: 50
  })
  formRef.value?.resetFields()
}

// Batch import
const handleBatchImport = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file: UploadFile) => {
  importFile.value = file.raw || null
}

const handleConfirmImport = async () => {
  if (!importFile.value) return

  importLoading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        await batchImport(data)
        ElMessage.success('导入成功')
        importDialogVisible.value = false
        loadKnowledgeList()
      } catch (error) {
        ElMessage.error('导入失败，请检查文件格式')
      } finally {
        importLoading.value = false
      }
    }
    reader.readAsText(importFile.value)
  } catch (error) {
    ElMessage.error('文件读取失败')
    importLoading.value = false
  }
}

// Helper functions
const getPriorityType = (priority: number) => {
  if (priority >= 80) return 'danger'
  if (priority >= 50) return 'warning'
  return 'info'
}

const getSourceTypeLabel = (sourceType: string) => {
  const labels: Record<string, string> = {
    manual: '手动创建',
    ai_mining: 'AI挖掘',
    industry_import: '行业导入',
    batch_import: '批量导入'
  }
  return labels[sourceType] || sourceType
}

// Lifecycle
onMounted(() => {
  loadCategories()
  loadKnowledgeList()
})
</script>

<style scoped lang="scss">
.knowledge-list-container {
  padding: 20px;

  .filter-card,
  .action-card,
  .table-card {
    margin-bottom: 20px;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-actions {
      display: flex;
      gap: 10px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  :deep(.el-form--inline .el-form-item) {
    margin-right: 20px;
    margin-bottom: 10px;
  }

  :deep(.el-select) {
    width: 100%;
  }
}
</style>
