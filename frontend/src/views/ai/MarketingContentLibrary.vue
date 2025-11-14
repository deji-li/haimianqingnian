<template>
  <div class="marketing-content-library">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>营销文案库</h2>
          <p class="subtitle">管理和复用您的营销文案，提升工作效率</p>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-label">文案总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #F56C6C">
            <el-icon :size="28"><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.favoriteCount }}</div>
            <div class="stat-label">收藏文案</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A">
            <el-icon :size="28"><View /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalUsage }}</div>
            <div class="stat-label">总使用次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C">
            <el-icon :size="28"><Grid /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ Object.keys(statistics.typeDistribution || {}).length }}</div>
            <div class="stat-label">文案类型</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="文案类型">
          <el-select
            v-model="filterForm.contentType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option label="朋友圈文案" value="朋友圈文案" />
            <el-option label="微信群发文案" value="微信群发文案" />
            <el-option label="抖音营销文案" value="抖音营销文案" />
            <el-option label="小红书营销文案" value="小红书营销文案" />
            <el-option label="短视频拍摄脚本" value="短视频拍摄脚本" />
            <el-option label="公众号推文" value="公众号推文" />
          </el-select>
        </el-form-item>

        <el-form-item label="收藏状态">
          <el-select
            v-model="filterForm.isFavorite"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="已收藏" :value="1" />
            <el-option label="未收藏" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="filterForm.category"
            placeholder="全部分类"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option
              v-for="cat in categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索标题或内容"
            clearable
            style="width: 200px"
            @clear="handleFilter"
            @keyup.enter="handleFilter"
          >
            <template #append>
              <el-button :icon="Search" @click="handleFilter" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文案列表 -->
    <el-card class="list-card">
      <el-table
        :data="contentList"
        v-loading="loading"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contentType" label="类型" width="140">
          <template #default="{ row }">
            <el-tag>{{ row.contentType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="useCount" label="使用次数" width="100" align="center" sortable="custom" />
        <el-table-column prop="isFavorite" label="收藏" width="80" align="center">
          <template #default="{ row }">
            <el-icon
              :size="20"
              :color="row.isFavorite === 1 ? '#F56C6C' : '#C0C4CC'"
              style="cursor: pointer"
              @click="handleToggleFavorite(row)"
            >
              <StarFilled v-if="row.isFavorite === 1" />
              <Star v-else />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" @click="handleCopy(row)">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 查看/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'view' ? '查看文案' : '编辑文案'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="currentContent" label-width="100px" v-if="currentContent">
        <el-form-item label="标题">
          <el-input
            v-model="currentContent.title"
            :disabled="dialogMode === 'view'"
            placeholder="请输入标题"
          />
        </el-form-item>

        <el-form-item label="文案类型">
          <el-tag>{{ currentContent.contentType }}</el-tag>
        </el-form-item>

        <el-form-item label="文案内容">
          <el-input
            v-model="currentContent.content"
            :disabled="dialogMode === 'view'"
            type="textarea"
            :rows="10"
            placeholder="请输入文案内容"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-input
            v-model="currentContent.category"
            :disabled="dialogMode === 'view'"
            placeholder="请输入分类"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in currentContent.tags || []"
            :key="tag"
            style="margin-right: 8px"
            closable
            v-if="dialogMode === 'edit'"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-tag
            v-for="tag in currentContent.tags || []"
            :key="tag"
            style="margin-right: 8px"
            v-if="dialogMode === 'view'"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="dialogMode === 'edit' && inputVisible"
            ref="inputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-if="dialogMode === 'edit' && !inputVisible"
            class="button-new-tag"
            size="small"
            @click="showInput"
          >
            + 添加标签
          </el-button>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="currentContent.remark"
            :disabled="dialogMode === 'view'"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-form-item label="痛点" v-if="currentContent.painPoints && currentContent.painPoints.length > 0">
          <el-tag
            v-for="(point, index) in currentContent.painPoints"
            :key="index"
            type="warning"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ point }}
          </el-tag>
        </el-form-item>

        <el-form-item label="兴趣点" v-if="currentContent.interestPoints && currentContent.interestPoints.length > 0">
          <el-tag
            v-for="(point, index) in currentContent.interestPoints"
            :key="index"
            type="success"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ point }}
          </el-tag>
        </el-form-item>

        <el-form-item label="使用统计" v-if="dialogMode === 'view'">
          <div>
            <span>使用次数: {{ currentContent.useCount }} 次</span>
            <span style="margin-left: 20px" v-if="currentContent.lastUsedTime">
              最后使用: {{ formatDate(currentContent.lastUsedTime) }}
            </span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCopyDialog" v-if="dialogMode === 'view'">
          <el-icon><DocumentCopy /></el-icon>
          复制文案
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" v-if="dialogMode === 'edit'">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Star,
  StarFilled,
  View,
  Grid,
  Search,
  DocumentCopy,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import {
  getMarketingContentList,
  getMarketingContentStatistics,
  getMarketingContentCategories,
  getMarketingContentDetail,
  updateMarketingContent,
  deleteMarketingContent,
  toggleMarketingContentFavorite,
  recordMarketingContentUsage,
} from '@/api/ai'

// 统计数据
const statistics = ref({
  totalCount: 0,
  favoriteCount: 0,
  totalUsage: 0,
  typeDistribution: {},
})

// 筛选表单
const filterForm = reactive({
  contentType: '',
  isFavorite: undefined,
  category: '',
  keyword: '',
})

// 分类列表
const categories = ref<string[]>([])

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// 列表数据
const contentList = ref<any[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'edit'>('view')
const currentContent = ref<any>(null)
const saving = ref(false)

// 标签输入
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getMarketingContentStatistics()
    statistics.value = res
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getMarketingContentCategories()
    categories.value = res || []
  } catch (error: any) {
    console.error('加载分类失败:', error)
  }
}

// 加载文案列表
const loadContentList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filterForm,
    }
    const res = await getMarketingContentList(params)
    contentList.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载文案列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选
const handleFilter = () => {
  pagination.page = 1
  loadContentList()
}

// 分页改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadContentList()
}

const handlePageSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  loadContentList()
}

// 排序改变
const handleSortChange = ({ prop, order }: any) => {
  // TODO: 实现排序功能
  console.log('排序:', prop, order)
}

// 查看
const handleView = async (row: any) => {
  try {
    const res = await getMarketingContentDetail(row.id)
    currentContent.value = res
    dialogMode.value = 'view'
    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载详情失败')
  }
}

// 编辑
const handleEdit = async (row: any) => {
  try {
    const res = await getMarketingContentDetail(row.id)
    currentContent.value = { ...res }
    dialogMode.value = 'edit'
    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载详情失败')
  }
}

// 保存编辑
const handleSave = async () => {
  if (!currentContent.value) return

  saving.value = true
  try {
    await updateMarketingContent(currentContent.value.id, {
      title: currentContent.value.title,
      content: currentContent.value.content,
      category: currentContent.value.category,
      tags: currentContent.value.tags,
      remark: currentContent.value.remark,
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadContentList()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除文案"${row.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteMarketingContent(row.id)
    ElMessage.success('删除成功')
    loadContentList()
    loadStatistics()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 切换收藏
const handleToggleFavorite = async (row: any) => {
  try {
    const res = await toggleMarketingContentFavorite(row.id)
    ElMessage.success(res.message)
    row.isFavorite = res.isFavorite
    loadStatistics()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 复制文案
const handleCopy = async (row: any) => {
  try {
    await navigator.clipboard.writeText(row.content)
    ElMessage.success('已复制到剪贴板')

    // 记录使用
    await recordMarketingContentUsage(row.id, {})
    row.useCount = (row.useCount || 0) + 1
    loadStatistics()
  } catch (error: any) {
    ElMessage.error('复制失败')
  }
}

// 对话框中复制
const handleCopyDialog = async () => {
  if (!currentContent.value) return

  try {
    await navigator.clipboard.writeText(currentContent.value.content)
    ElMessage.success('已复制到剪贴板')

    // 记录使用
    await recordMarketingContentUsage(currentContent.value.id, {})
    currentContent.value.useCount = (currentContent.value.useCount || 0) + 1
    loadContentList()
    loadStatistics()
  } catch (error: any) {
    ElMessage.error('复制失败')
  }
}

// 标签管理
const removeTag = (tag: string) => {
  if (!currentContent.value.tags) return
  currentContent.value.tags = currentContent.value.tags.filter((t: string) => t !== tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (!currentContent.value.tags) {
      currentContent.value.tags = []
    }
    if (!currentContent.value.tags.includes(inputValue.value)) {
      currentContent.value.tags.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  loadStatistics()
  loadCategories()
  loadContentList()
})
</script>

<style scoped lang="scss">
.marketing-content-library {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .header-content {
      h2 {
        margin: 0;
        font-size: 24px;
      }

      .subtitle {
        margin: 5px 0 0;
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      cursor: default;

      :deep(.el-card__body) {
        display: flex;
        align-items: center;
        padding: 20px;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 16px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;

    :deep(.el-form--inline .el-form-item) {
      margin-bottom: 0;
    }
  }

  .list-card {
    :deep(.el-pagination) {
      display: flex;
    }
  }

  .tag-input {
    width: 100px;
    margin-right: 8px;
  }

  .button-new-tag {
    height: 24px;
    padding: 0 8px;
    line-height: 22px;
  }
}
</style>
