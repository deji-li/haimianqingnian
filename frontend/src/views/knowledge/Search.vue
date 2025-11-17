<template>
  <div class="knowledge-search-container">
    <!-- Search Input Section -->
    <el-card class="search-card" shadow="never">
      <div class="search-header">
        <h2>智能知识搜索</h2>
        <el-text type="info">使用AI语义理解，精准匹配相关知识</el-text>
      </div>

      <div class="search-input-wrapper">
        <el-input
          v-model="searchQuery"
          placeholder="输入您的问题，AI将智能匹配最相关的知识..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon :size="20"><Search /></el-icon>
          </template>
          <template #append>
            <el-button
              type="primary"
              :loading="searching"
              :icon="Search"
              @click="handleSearch"
            >
              智能搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- Advanced Filters -->
      <el-collapse v-model="activeCollapse" class="filter-collapse">
        <el-collapse-item title="高级筛选" name="filters">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="场景分类">
              <el-select
                v-model="filterForm.sceneCategory"
                placeholder="全部场景"
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

            <el-form-item label="返回数量">
              <el-select
                v-model="filterForm.limit"
                placeholder="选择数量"
                style="width: 120px"
              >
                <el-option label="5条" :value="5" />
                <el-option label="10条" :value="10" />
                <el-option label="20条" :value="20" />
                <el-option label="50条" :value="50" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- Quick Search Examples -->
      <div v-if="!hasSearched" class="quick-search">
        <div class="quick-search-title">
          <el-icon><Bulb /></el-icon>
          <span>试试这些问题：</span>
        </div>
        <div class="example-tags">
          <el-tag
            v-for="(example, index) in searchExamples"
            :key="index"
            class="example-tag"
            type="info"
            effect="plain"
            @click="useExample(example)"
          >
            {{ example }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- Search Results -->
    <el-card v-if="hasSearched" class="results-card" shadow="never">
      <div class="results-header">
        <div class="results-info">
          <el-icon :size="20" color="#409EFF"><Document /></el-icon>
          <span class="results-count">
            找到 <strong>{{ searchResults.length }}</strong> 条相关知识
          </span>
          <el-text v-if="searchTime" type="info" size="small">
            （耗时 {{ searchTime }}ms）
          </el-text>
        </div>
        <el-button
          v-if="searchResults.length > 0"
          :icon="Download"
          size="small"
          @click="handleExport"
        >
          导出结果
        </el-button>
      </div>

      <!-- No Results -->
      <el-empty
        v-if="searchResults.length === 0"
        description="未找到相关知识"
      >
        <template #image>
          <el-icon :size="100" color="#909399"><Search /></el-icon>
        </template>
        <el-text type="info">
          尝试使用不同的关键词，或者调整筛选条件
        </el-text>
      </el-empty>

      <!-- Results List -->
      <div v-else class="results-list">
        <div
          v-for="(item, index) in searchResults"
          :key="item.id"
          class="result-item"
          @click="handleViewDetail(item)"
        >
          <div class="result-header">
            <div class="result-rank">
              <el-tag
                :type="getRankType(index)"
                size="small"
                round
              >
                #{{ index + 1 }}
              </el-tag>
            </div>
            <div class="result-title">
              <h3 v-html="highlightText(item.title, searchQuery)"></h3>
            </div>
            <div class="result-score">
              <el-progress
                :percentage="getRelevanceScore(item)"
                :color="getScoreColor(getRelevanceScore(item))"
                :stroke-width="8"
                :show-text="false"
              />
              <el-text type="info" size="small">
                相关度: {{ getRelevanceScore(item) }}%
              </el-text>
            </div>
          </div>

          <div class="result-content">
            <p v-html="highlightText(item.content, searchQuery)"></p>
          </div>

          <div class="result-meta">
            <div class="meta-tags">
              <el-tag size="small" type="primary">{{ item.sceneCategory }}</el-tag>
              <el-tag v-if="item.productCategory" size="small">
                {{ item.productCategory }}
              </el-tag>
              <el-tag v-if="item.customerType" size="small" type="success">
                {{ item.customerType }}
              </el-tag>
              <el-tag size="small" type="info">
                优先级: {{ item.priority }}
              </el-tag>
            </div>

            <div class="meta-stats">
              <el-text size="small" type="info">
                <el-icon><View /></el-icon>
                使用 {{ item.usageCount }} 次
              </el-text>
              <el-text v-if="item.negativeFeedbackCount > 0" size="small" type="danger">
                <el-icon><WarningFilled /></el-icon>
                负反馈 {{ item.negativeFeedbackCount }} 次
              </el-text>
            </div>
          </div>

          <div class="result-actions">
            <el-button size="small" type="primary" link @click.stop="handleCopyContent(item)">
              <el-icon><DocumentCopy /></el-icon>
              复制内容
            </el-button>
            <el-button size="small" type="success" link @click.stop="handleUseKnowledge(item)">
              <el-icon><Check /></el-icon>
              使用该知识
            </el-button>
            <el-button size="small" type="warning" link @click.stop="handleFeedback(item)">
              <el-icon><Warning /></el-icon>
              反馈问题
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Search History -->
    <el-card v-if="searchHistory.length > 0" class="history-card" shadow="never">
      <div class="history-header">
        <div class="history-title">
          <el-icon><Clock /></el-icon>
          <span>搜索历史</span>
        </div>
        <el-button
          size="small"
          type="danger"
          link
          @click="clearHistory"
        >
          清空历史
        </el-button>
      </div>
      <div class="history-list">
        <el-tag
          v-for="(query, index) in searchHistory"
          :key="index"
          class="history-tag"
          closable
          @click="useHistoryQuery(query)"
          @close="removeHistoryQuery(index)"
        >
          {{ query }}
        </el-tag>
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="知识详情"
      width="800px"
    >
      <el-descriptions v-if="selectedKnowledge" :column="2" border>
        <el-descriptions-item label="标题" :span="2">
          {{ selectedKnowledge.title }}
        </el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div style="white-space: pre-wrap">{{ selectedKnowledge.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="关键词" :span="2">
          {{ selectedKnowledge.keywords }}
        </el-descriptions-item>
        <el-descriptions-item label="场景分类">
          {{ selectedKnowledge.sceneCategory }}
        </el-descriptions-item>
        <el-descriptions-item label="产品分类">
          {{ selectedKnowledge.productCategory || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="客户类型">
          {{ selectedKnowledge.customerType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="问题类型">
          {{ selectedKnowledge.questionType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(selectedKnowledge.priority)">
            {{ selectedKnowledge.priority }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="使用次数">
          {{ selectedKnowledge.usageCount }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- Feedback Dialog -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="提交反馈"
      width="600px"
    >
      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="feedbackRules"
        label-width="100px"
      >
        <el-form-item label="反馈场景" prop="feedbackScene">
          <el-input v-model="feedbackForm.feedbackScene" placeholder="例如：客户咨询" />
        </el-form-item>
        <el-form-item label="用户问题" prop="userQuestion">
          <el-input
            v-model="feedbackForm.userQuestion"
            type="textarea"
            :rows="3"
            placeholder="请输入客户的原始问题"
          />
        </el-form-item>
        <el-form-item label="反馈原因" prop="feedbackReason">
          <el-select v-model="feedbackForm.feedbackReason" placeholder="选择反馈原因">
            <el-option label="内容不相关" value="内容不相关" />
            <el-option label="信息过时" value="信息过时" />
            <el-option label="表述不清" value="表述不清" />
            <el-option label="缺少细节" value="缺少细节" />
            <el-option label="其他问题" value="其他问题" />
          </el-select>
        </el-form-item>
        <el-form-item label="期望答案">
          <el-input
            v-model="feedbackForm.expectedAnswer"
            type="textarea"
            :rows="4"
            placeholder="如果有更好的答案，请填写（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="feedbackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Bulb,
  Document,
  Download,
  View,
  WarningFilled,
  DocumentCopy,
  Check,
  Warning,
  Clock
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  intelligentSearch,
  submitFeedback,
  type KnowledgeBase,
  type IntelligentSearchDto,
  type FeedbackSubmitDto
} from '@/api/knowledge'

// Search state
const searchQuery = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const searchResults = ref<KnowledgeBase[]>([])
const searchTime = ref(0)
const activeCollapse = ref<string[]>([])

// Filter form
const filterForm = reactive<IntelligentSearchDto>({
  query: '',
  limit: 10,
  sceneCategory: ''
})

// Categories
const sceneCategories = ref([
  { label: '产品介绍', value: '产品介绍' },
  { label: '售后服务', value: '售后服务' },
  { label: '营销活动', value: '营销活动' },
  { label: '常见问题', value: '常见问题' },
  { label: '技术支持', value: '技术支持' },
  { label: '价格政策', value: '价格政策' },
  { label: '合作政策', value: '合作政策' },
  { label: '其他', value: '其他' }
])

// Search examples
const searchExamples = ref([
  '产品有哪些核心功能？',
  '如何处理客户退货申请？',
  '当前有什么优惠活动？',
  '系统安装需要什么配置？',
  '如何联系技术支持？'
])

// Search history
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10

// Detail dialog
const detailDialogVisible = ref(false)
const selectedKnowledge = ref<KnowledgeBase | null>(null)

// Feedback dialog
const feedbackDialogVisible = ref(false)
const feedbackFormRef = ref<FormInstance>()
const feedbackForm = reactive<FeedbackSubmitDto>({
  knowledgeId: 0,
  feedbackScene: '',
  userQuestion: '',
  knowledgeAnswer: '',
  feedbackReason: '',
  expectedAnswer: ''
})

const feedbackRules: FormRules = {
  feedbackScene: [
    { required: true, message: '请输入反馈场景', trigger: 'blur' }
  ],
  userQuestion: [
    { required: true, message: '请输入用户问题', trigger: 'blur' }
  ],
  feedbackReason: [
    { required: true, message: '请选择反馈原因', trigger: 'change' }
  ]
}

// Perform search
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  searching.value = true
  const startTime = Date.now()

  try {
    const searchData: IntelligentSearchDto = {
      query: searchQuery.value,
      limit: filterForm.limit,
      sceneCategory: filterForm.sceneCategory || undefined
    }

    const res = await intelligentSearch(searchData)
    searchResults.value = res.data || []
    searchTime.value = Date.now() - startTime
    hasSearched.value = true

    // Add to history
    addToHistory(searchQuery.value)

    if (searchResults.value.length === 0) {
      ElMessage.info('未找到相关知识')
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

// Use example query
const useExample = (example: string) => {
  searchQuery.value = example
  handleSearch()
}

// Use history query
const useHistoryQuery = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// Add to history
const addToHistory = (query: string) => {
  // Remove if already exists
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // Add to beginning
  searchHistory.value.unshift(query)

  // Limit history size
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }

  // Save to localStorage
  localStorage.setItem('knowledgeSearchHistory', JSON.stringify(searchHistory.value))
}

// Remove history query
const removeHistoryQuery = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('knowledgeSearchHistory', JSON.stringify(searchHistory.value))
}

// Clear history
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空搜索历史吗？', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    searchHistory.value = []
    localStorage.removeItem('knowledgeSearchHistory')
    ElMessage.success('已清空搜索历史')
  }).catch(() => {
    // User cancelled
  })
}

// View detail
const handleViewDetail = (item: KnowledgeBase) => {
  selectedKnowledge.value = item
  detailDialogVisible.value = true
}

// Copy content
const handleCopyContent = async (item: KnowledgeBase) => {
  try {
    await navigator.clipboard.writeText(item.content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// Use knowledge
const handleUseKnowledge = (item: KnowledgeBase) => {
  ElMessage.success(`已使用知识：${item.title}`)
  // Here you could implement logic to insert this knowledge into a chat or other context
}

// Feedback
const handleFeedback = (item: KnowledgeBase) => {
  feedbackForm.knowledgeId = item.id
  feedbackForm.knowledgeAnswer = item.content
  feedbackForm.userQuestion = searchQuery.value
  feedbackForm.feedbackScene = ''
  feedbackForm.feedbackReason = ''
  feedbackForm.expectedAnswer = ''
  feedbackDialogVisible.value = true
}

// Submit feedback
const handleSubmitFeedback = async () => {
  if (!feedbackFormRef.value) return

  await feedbackFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await submitFeedback(feedbackForm)
      ElMessage.success('反馈提交成功')
      feedbackDialogVisible.value = false
    } catch (error) {
      ElMessage.error('反馈提交失败')
    }
  })
}

// Export results
const handleExport = () => {
  const data = searchResults.value.map(item => ({
    标题: item.title,
    内容: item.content,
    关键词: item.keywords,
    场景分类: item.sceneCategory,
    产品分类: item.productCategory,
    优先级: item.priority,
    使用次数: item.usageCount
  }))

  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `knowledge-search-results-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// Highlight text
const highlightText = (text: string, query: string) => {
  if (!query || !text) return text

  const words = query.split(/\s+/).filter(w => w.length > 0)
  let highlighted = text

  words.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark>$1</mark>')
  })

  return highlighted
}

// Get relevance score (simulate based on usage count and priority)
const getRelevanceScore = (item: KnowledgeBase) => {
  // Simple algorithm: combine priority and usage count
  const priorityScore = item.priority || 50
  const usageScore = Math.min(item.usageCount * 2, 50)
  return Math.min(Math.round((priorityScore + usageScore) / 2), 100)
}

// Get score color
const getScoreColor = (score: number) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#909399'
}

// Get rank type
const getRankType = (index: number) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
}

// Get priority type
const getPriorityType = (priority: number) => {
  if (priority >= 80) return 'danger'
  if (priority >= 50) return 'warning'
  return 'info'
}

// Load search history from localStorage
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem('knowledgeSearchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('Failed to load search history:', error)
  }
}

// Initialize
loadSearchHistory()
</script>

<style scoped lang="scss">
.knowledge-search-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .search-card,
  .results-card,
  .history-card {
    margin-bottom: 20px;
  }

  .search-header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      margin: 0 0 10px 0;
      color: #303133;
    }
  }

  .search-input-wrapper {
    margin-bottom: 20px;

    :deep(.el-input__inner) {
      font-size: 16px;
    }
  }

  .filter-collapse {
    margin-top: 20px;
    border: none;

    :deep(.el-collapse-item__header) {
      border: none;
      background: transparent;
    }

    :deep(.el-collapse-item__wrap) {
      border: none;
    }
  }

  .quick-search {
    margin-top: 30px;

    .quick-search-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
      color: #606266;
      font-size: 14px;
    }

    .example-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .example-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #EBEEF5;

    .results-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .results-count {
        font-size: 16px;
        color: #303133;

        strong {
          color: #409EFF;
          font-size: 18px;
        }
      }
    }
  }

  .results-list {
    .result-item {
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid #EBEEF5;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
      }

      .result-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;

        .result-rank {
          flex-shrink: 0;
        }

        .result-title {
          flex: 1;
          min-width: 0;

          h3 {
            margin: 0;
            font-size: 18px;
            color: #303133;
            line-height: 1.4;

            :deep(mark) {
              background-color: #FFF3CD;
              color: #856404;
              padding: 2px 4px;
              border-radius: 2px;
            }
          }
        }

        .result-score {
          flex-shrink: 0;
          width: 120px;
          text-align: right;

          .el-progress {
            margin-bottom: 5px;
          }
        }
      }

      .result-content {
        margin-bottom: 15px;
        padding-left: 45px;

        p {
          margin: 0;
          color: #606266;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;

          :deep(mark) {
            background-color: #FFF3CD;
            color: #856404;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }
      }

      .result-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        background: #F5F7FA;
        border-radius: 4px;

        .meta-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta-stats {
          display: flex;
          gap: 15px;
          align-items: center;

          .el-text {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .result-actions {
        display: flex;
        gap: 15px;
        padding-left: 45px;
      }
    }
  }

  .history-card {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .history-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        color: #303133;
      }
    }

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .history-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
