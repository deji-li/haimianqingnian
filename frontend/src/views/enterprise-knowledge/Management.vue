<template>
  <div class="enterprise-knowledge-management">
    <div class="page-header">
      <h2>企业知识库管理</h2>
      <el-button type="primary" @click="goToCreate">
        <el-icon><Plus /></el-icon>
        创建知识库
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.query"
            placeholder="搜索知识标题或内容"
            style="width: 300px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="场景分类">
          <el-select
            v-model="searchForm.sceneCategory"
            placeholder="选择场景"
            clearable
            style="width: 150px"
          >
            <el-option label="企业介绍" value="企业介绍" />
            <el-option label="产品咨询" value="产品咨询" />
            <el-option label="价格咨询" value="价格咨询" />
            <el-option label="服务咨询" value="服务咨询" />
            <el-option label="技术支持" value="技术支持" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="来源类型">
          <el-select
            v-model="searchForm.sourceType"
            placeholder="选择来源"
            clearable
            style="width: 150px"
          >
            <el-option label="手动输入" value="manual" />
            <el-option label="AI挖掘" value="ai_mining" />
            <el-option label="行业推荐" value="industry_recommend" />
            <el-option label="文件导入" value="file_import" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="已发布" value="active" />
            <el-option label="草稿" value="inactive" />
            <el-option label="待审核" value="pending_review" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 知识库列表 -->
    <div class="knowledge-table">
      <el-table
        v-loading="loading"
        :data="knowledgeList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="title" label="知识标题" min-width="200">
          <template #default="{ row }">
            <div class="knowledge-title">
              <el-tooltip
                v-if="row.summary"
                :content="row.summary"
                placement="top"
                :show-after="500"
              >
                <span>{{ row.title }}</span>
              </el-tooltip>
              <span v-else>{{ row.title }}</span>

              <div class="knowledge-tags" v-if="row.keywords">
                <el-tag
                  v-for="keyword in row.keywords.split(',').slice(0, 3)"
                  :key="keyword"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ keyword.trim() }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="sceneCategory" label="场景分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getSceneCategoryType(row.sceneCategory)">
              {{ row.sceneCategory }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sourceType" label="来源类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getSourceTypeType(row.sourceType)">
              {{ getSourceTypeText(row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="qualityScore" label="质量评分" width="100" align="center">
          <template #default="{ row }">
            <el-rate
              v-model="row.qualityScore"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
              :max="100"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            />
          </template>
        </el-table-column>

        <el-table-column prop="usageCount" label="使用次数" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.usageCount" :max="999" type="primary">
              <span>{{ row.usageCount }}</span>
            </el-badge>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="success" @click="handleFeedback(row)">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operations" v-if="selectedItems.length > 0">
      <div class="batch-info">
        已选择 {{ selectedItems.length }} 项
      </div>
      <div class="batch-buttons">
        <el-button type="success" @click="batchPublish">批量发布</el-button>
        <el-button type="warning" @click="batchArchive">批量归档</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <!-- 知识详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="知识详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentKnowledge" class="knowledge-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="知识标题" :span="2">
            {{ currentKnowledge.title }}
          </el-descriptions-item>
          <el-descriptions-item label="场景分类">
            {{ currentKnowledge.sceneCategory }}
          </el-descriptions-item>
          <el-descriptions-item label="来源类型">
            {{ getSourceTypeText(currentKnowledge.sourceType) }}
          </el-descriptions-item>
          <el-descriptions-item label="质量评分">
            <el-rate
              v-model="currentKnowledge.qualityScore"
              disabled
              show-score
              :max="100"
            />
          </el-descriptions-item>
          <el-descriptions-item label="使用次数">
            {{ currentKnowledge.usageCount }}
          </el-descriptions-item>
          <el-descriptions-item label="关键词" :span="2">
            <el-tag
              v-for="keyword in currentKnowledge.keywords?.split(',')"
              :key="keyword"
              size="small"
              style="margin-right: 5px"
            >
              {{ keyword.trim() }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="知识内容" :span="2">
            <div class="knowledge-content">
              {{ currentKnowledge.content }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 使用统计 -->
        <div class="usage-statistics" v-if="currentKnowledge.usageCount > 0">
          <h4>使用统计</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="正反馈" :value="currentKnowledge.positiveFeedbackCount" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="负反馈" :value="currentKnowledge.negativeFeedbackCount" />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="满意度"
                :value="getSatisfactionRate(currentKnowledge)"
                suffix="%"
                :precision="1"
              />
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 反馈对话框 -->
    <el-dialog
      v-model="showFeedbackDialog"
      title="知识反馈"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentKnowledge" class="feedback-form">
        <el-form :model="feedbackForm" label-width="80px">
          <el-form-item label="知识标题">
            <el-input :value="currentKnowledge.title" readonly />
          </el-form-item>

          <el-form-item label="反馈类型">
            <el-radio-group v-model="feedbackForm.type">
              <el-radio value="positive">👍 有用</el-radio>
              <el-radio value="negative">👎 有误</el-radio>
              <el-radio value="suggestion">💡 建议</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="反馈内容">
            <el-input
              v-model="feedbackForm.content"
              type="textarea"
              :rows="4"
              placeholder="请描述具体的反馈内容..."
            />
          </el-form-item>

          <el-form-item label="联系方式" v-if="feedbackForm.type === 'negative'">
            <el-input
              v-model="feedbackForm.contact"
              placeholder="可选：留下联系方式以便后续跟进"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showFeedbackDialog = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete, ChatDotRound } from '@element-plus/icons-vue'
import { enterpriseKnowledgeApi } from '@/api/enterprise-knowledge'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const knowledgeList = ref([])
const selectedItems = ref([])
const showDetailDialog = ref(false)
const showFeedbackDialog = ref(false)
const currentKnowledge = ref(null)

// 搜索表单
const searchForm = reactive({
  query: '',
  sceneCategory: '',
  sourceType: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 反馈表单
const feedbackForm = reactive({
  type: 'positive',
  content: '',
  contact: ''
})

// 计算属性
const getSatisfactionRate = (knowledge: any) => {
  if (!knowledge.positiveFeedbackCount && !knowledge.negativeFeedbackCount) return 100
  const total = knowledge.positiveFeedbackCount + knowledge.negativeFeedbackCount
  return (knowledge.positiveFeedbackCount / total) * 100
}

// 方法
const loadKnowledgeList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }

    const response = await enterpriseKnowledgeApi.search(params)
    knowledgeList.value = response.data.results
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载知识库列表失败')
    console.error('Load knowledge list error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadKnowledgeList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    query: '',
    sceneCategory: '',
    sourceType: '',
    status: ''
  })
  pagination.page = 1
  loadKnowledgeList()
}

const handleSelectionChange = (selection: any[]) => {
  selectedItems.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  loadKnowledgeList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadKnowledgeList()
}

const goToCreate = () => {
  router.push('/ai/enterprise-knowledge/create')
}

const handleView = (row: any) => {
  currentKnowledge.value = row
  showDetailDialog.value = true
}

const handleEdit = (row: any) => {
  router.push(`/ai/enterprise-knowledge/edit/${row.id}`)
}

const handleFeedback = (row: any) => {
  currentKnowledge.value = row
  Object.assign(feedbackForm, {
    type: 'positive',
    content: '',
    contact: ''
  })
  showFeedbackDialog.value = true
}

const submitFeedback = async () => {
  if (!feedbackForm.content.trim()) {
    ElMessage.warning('请填写反馈内容')
    return
  }

  try {
    await enterpriseKnowledgeApi.submitFeedback(currentKnowledge.value.id, {
      type: feedbackForm.type,
      content: feedbackForm.content,
      contact: feedbackForm.contact
    })

    ElMessage.success('反馈提交成功')
    showFeedbackDialog.value = false
    loadKnowledgeList()
  } catch (error) {
    ElMessage.error('反馈提交失败')
    console.error('Submit feedback error:', error)
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除知识"${row.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await enterpriseKnowledgeApi.delete(row.id)
    ElMessage.success('删除成功')
    loadKnowledgeList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Delete knowledge error:', error)
    }
  }
}

// 批量操作
const batchPublish = async () => {
  const ids = selectedItems.value.map((item: any) => item.id)
  try {
    await enterpriseKnowledgeApi.batchUpdate(ids, { status: 'active' })
    ElMessage.success('批量发布成功')
    loadKnowledgeList()
  } catch (error) {
    ElMessage.error('批量发布失败')
  }
}

const batchArchive = async () => {
  const ids = selectedItems.value.map((item: any) => item.id)
  try {
    await enterpriseKnowledgeApi.batchUpdate(ids, { status: 'inactive' })
    ElMessage.success('批量归档成功')
    loadKnowledgeList()
  } catch (error) {
    ElMessage.error('批量归档失败')
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 项知识吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedItems.value.map((item: any) => item.id)
    await enterpriseKnowledgeApi.batchDelete(ids)
    ElMessage.success('批量删除成功')
    loadKnowledgeList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 辅助方法
const getSceneCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    '企业介绍': 'primary',
    '产品咨询': 'success',
    '价格咨询': 'warning',
    '服务咨询': 'info',
    '技术支持': 'danger'
  }
  return typeMap[category] || ''
}

const getSourceTypeType = (type: string) => {
  const typeMap: Record<string, string> = {
    'manual': 'primary',
    'ai_mining': 'success',
    'industry_recommend': 'warning',
    'file_import': 'info'
  }
  return typeMap[type] || ''
}

const getSourceTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'manual': '手动输入',
    'ai_mining': 'AI挖掘',
    'industry_recommend': '行业推荐',
    'file_import': '文件导入'
  }
  return textMap[type] || type
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'info',
    'pending_review': 'warning'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '已发布',
    'inactive': '草稿',
    'pending_review': '待审核'
  }
  return textMap[status] || status
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadKnowledgeList()
})
</script>

<style lang="scss" scoped>
.enterprise-knowledge-management {
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

  .filter-section {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .knowledge-table {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .knowledge-title {
      .knowledge-tags {
        margin-top: 5px;

        .el-tag {
          margin-right: 5px;
        }
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }

  .batch-operations {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 1000;

    .batch-info {
      color: #606266;
      font-size: 14px;
    }

    .batch-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .knowledge-detail {
    .knowledge-content {
      max-height: 200px;
      overflow-y: auto;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      white-space: pre-wrap;
    }

    .usage-statistics {
      margin-top: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;

      h4 {
        margin: 0 0 15px 0;
        color: #303133;
      }
    }
  }

  .feedback-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>