<template>
  <div class="knowledge-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI企业知识库</h2>
          <p class="subtitle">智能搜索，快速找到答案</p>
        </div>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加知识
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="16">
      <!-- 智能搜索 -->
      <el-col :span="8">
        <el-card>
          <h3>AI智能搜索</h3>
          <el-input
            v-model="searchQuestion"
            type="textarea"
            :rows="3"
            placeholder="请输入问题，AI会为您找到最相关的答案..."
          />
          <el-button
            type="primary"
            @click="aiSearch"
            :loading="searching"
            style="margin-top: 10px; width: 100%"
          >
            <el-icon><Search /></el-icon>
            AI搜索
          </el-button>

          <div v-if="searchResults.length > 0" class="search-results">
            <h4>搜索结果（{{ searchResults.length }}条）</h4>
            <div
              v-for="(result, index) in searchResults"
              :key="index"
              class="result-item"
              @click="viewKnowledge(result)"
            >
              <div class="result-title">{{ result.title }}</div>
              <div class="result-content">{{ result.content.substring(0, 100) }}...</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 知识库列表 -->
      <el-col :span="16">
        <el-card>
          <el-form :inline="true" :model="queryForm">
            <el-form-item label="分类">
              <el-select v-model="queryForm.category" clearable @change="loadData">
                <el-option
                  v-for="cat in categories"
                  :key="cat.category"
                  :label="`${cat.category} (${cat.count})`"
                  :value="cat.category"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="queryForm.keyword" placeholder="搜索关键词" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadData">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="tableData" v-loading="loading">
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="title" label="标题" width="200" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="usageCount" label="使用次数" width="100" />
            <el-table-column prop="priority" label="优先级" width="80" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewKnowledge(row)">查看</el-button>
                <el-button link @click="editKnowledge(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="queryForm.page"
            v-model:page-size="queryForm.limit"
            :total="total"
            @current-change="loadData"
            layout="total, prev, pager, next"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑知识对话框 -->
    <el-dialog v-model="showAddDialog" :title="editingKnowledge ? '编辑知识' : '添加知识'" width="600px">
      <el-form :model="knowledgeForm" :rules="knowledgeRules" ref="knowledgeFormRef" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="knowledgeForm.category" placeholder="选择分类" allow-create filterable>
            <el-option
              v-for="cat in categories"
              :key="cat.category"
              :label="cat.category"
              :value="cat.category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="knowledgeForm.title" placeholder="输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="knowledgeForm.content" type="textarea" :rows="6" placeholder="输入知识内容" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="knowledgeForm.keywords" placeholder="多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="knowledgeForm.priority" :min="0" :max="100" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看知识详情对话框 -->
    <el-dialog v-model="showViewDialog" title="知识详情" width="600px">
      <div v-if="currentKnowledge">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="分类">{{ currentKnowledge.category }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ currentKnowledge.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">
            <div style="white-space: pre-wrap">{{ currentKnowledge.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="关键词">{{ currentKnowledge.keywords }}</el-descriptions-item>
          <el-descriptions-item label="使用次数">{{ currentKnowledge.usageCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentKnowledge.createTime }}</el-descriptions-item>
        </el-descriptions>

        <el-button type="primary" @click="copyContent" style="margin-top: 20px">
          <el-icon><DocumentCopy /></el-icon>
          复制内容
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, DocumentCopy } from '@element-plus/icons-vue'
import {
  searchKnowledge,
  getKnowledgeList,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getKnowledgeCategories
} from '@/api/ai'

const loading = ref(false)
const searching = ref(false)
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const tableData = ref([])
const total = ref(0)
const categories = ref([])
const searchQuestion = ref('')
const searchResults = ref([])
const currentKnowledge = ref(null)
const editingKnowledge = ref(null)
const knowledgeFormRef = ref()

const queryForm = reactive({
  page: 1,
  limit: 20,
  category: '',
  keyword: ''
})

const knowledgeForm = reactive({
  category: '',
  title: '',
  content: '',
  keywords: '',
  priority: 0
})

const knowledgeRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getKnowledgeList(queryForm)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getKnowledgeCategories()
    categories.value = res.data
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const aiSearch = async () => {
  if (!searchQuestion.value.trim()) {
    ElMessage.warning('请输入问题')
    return
  }

  searching.value = true
  try {
    const res = await searchKnowledge({
      question: searchQuestion.value,
      limit: 5
    })
    searchResults.value = res.data.results
    ElMessage.success(`找到 ${res.data.total} 条相关知识`)
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const viewKnowledge = (knowledge: any) => {
  currentKnowledge.value = knowledge
  showViewDialog.value = true
}

const editKnowledge = (knowledge: any) => {
  editingKnowledge.value = knowledge
  Object.assign(knowledgeForm, knowledge)
  showAddDialog.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除这条知识吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteKnowledge(row.id)
    ElMessage.success('删除成功')
    loadData()
    loadCategories()
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!knowledgeFormRef.value) return

  await knowledgeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      if (editingKnowledge.value) {
        await updateKnowledge(editingKnowledge.value.id, knowledgeForm)
        ElMessage.success('更新成功')
      } else {
        await createKnowledge(knowledgeForm)
        ElMessage.success('添加成功')
      }

      showAddDialog.value = false
      resetForm()
      loadData()
      loadCategories()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

const resetForm = () => {
  editingKnowledge.value = null
  knowledgeForm.category = ''
  knowledgeForm.title = ''
  knowledgeForm.content = ''
  knowledgeForm.keywords = ''
  knowledgeForm.priority = 0
}

const copyContent = () => {
  if (currentKnowledge.value) {
    navigator.clipboard.writeText(currentKnowledge.value.content)
    ElMessage.success('内容已复制')
  }
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style scoped lang="scss">
.knowledge-container {
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

  .search-results {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
    }

    .result-item {
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background: #f5f7fa;
      }

      .result-title {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .result-content {
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
