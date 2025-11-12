<template>
  <div class="tag-management">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI客户标签管理</h2>
          <p class="subtitle">AI自动生成客户标签，精准把握客户特征</p>
        </div>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          手动添加标签
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总标签数" :value="statistics.totalTags" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="AI自动标签" :value="statistics.aiGeneratedTags" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="人工标签" :value="statistics.manualTags" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="标签分类" :value="statistics.categoryCount" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card style="margin-top: 20px">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="客户ID">
          <el-input
            v-model="queryForm.customerId"
            placeholder="输入客户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="标签分类">
          <el-select v-model="queryForm.tagCategory" placeholder="选择分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="基础信息" value="基础信息" />
            <el-option label="需求痛点" value="需求痛点" />
            <el-option label="行为特征" value="行为特征" />
            <el-option label="风险标签" value="风险标签" />
            <el-option label="意向标签" value="意向标签" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签来源">
          <el-select v-model="queryForm.source" placeholder="选择来源" clearable>
            <el-option label="全部" value="" />
            <el-option label="AI自动" value="AI自动" />
            <el-option label="人工添加" value="人工添加" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTags" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标签列表 -->
    <el-card style="margin-top: 20px">
      <el-table :data="tagList" v-loading="loading" border>
        <el-table-column prop="customerId" label="客户ID" width="100" />
        <el-table-column label="客户信息" width="200">
          <template #default="{ row }">
            <div v-if="row.customer">
              <div>{{ row.customer.wechatNickname || row.customer.realName }}</div>
              <div style="font-size: 12px; color: #909399">
                {{ row.customer.phone }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标签分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.tagCategory }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tagName" label="标签名称" width="150" />
        <el-table-column prop="tagValue" label="标签值" show-overflow-tooltip />
        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="row.source === 'AI自动' ? 'success' : 'info'">
              {{ row.source }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="100">
          <template #default="{ row }">
            <span v-if="row.confidence">{{ (row.confidence * 100).toFixed(0) }}%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '有效' : '失效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              @click="handleDelete(row)"
              :loading="row.deleting"
            >
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
        @size-change="loadTags"
        @current-change="loadTags"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 添加标签对话框 -->
    <el-dialog v-model="showAddDialog" title="手动添加标签" width="600px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="客户ID" prop="customerId">
          <el-input
            v-model="addForm.customerId"
            placeholder="输入客户ID"
            type="number"
          />
        </el-form-item>
        <el-form-item label="标签分类" prop="tagCategory">
          <el-select v-model="addForm.tagCategory" placeholder="选择分类">
            <el-option label="基础信息" value="基础信息" />
            <el-option label="需求痛点" value="需求痛点" />
            <el-option label="行为特征" value="行为特征" />
            <el-option label="风险标签" value="风险标签" />
            <el-option label="意向标签" value="意向标签" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="addForm.tagName" placeholder="输入标签名称" />
        </el-form-item>
        <el-form-item label="标签值" prop="tagValue">
          <el-input
            v-model="addForm.tagValue"
            type="textarea"
            :rows="3"
            placeholder="输入标签值（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { Plus, Search } from '@element-plus/icons-vue'

// 查询表单
const queryForm = reactive({
  customerId: '',
  tagCategory: '',
  source: '',
})

// 标签列表
const tagList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// 统计数据
const statistics = ref({
  totalTags: 0,
  aiGeneratedTags: 0,
  manualTags: 0,
  categoryCount: 0,
})

// 添加标签对话框
const showAddDialog = ref(false)
const adding = ref(false)
const addFormRef = ref()
const addForm = reactive({
  customerId: '',
  tagCategory: '',
  tagName: '',
  tagValue: '',
})

const addRules = {
  customerId: [{ required: true, message: '请输入客户ID', trigger: 'blur' }],
  tagCategory: [{ required: true, message: '请选择标签分类', trigger: 'change' }],
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

// 加载标签列表
const loadTags = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      customerId: queryForm.customerId || undefined,
      tagCategory: queryForm.tagCategory || undefined,
      source: queryForm.source || undefined,
    }

    const { data } = await axios.get('/api/ai-tags/list', { params })

    tagList.value = data.data.list || []
    pagination.total = data.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载标签列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const { data } = await axios.get('/api/ai-tags/statistics')

    statistics.value = {
      totalTags: data.data.totalTags || 0,
      aiGeneratedTags: data.data.aiGeneratedTags || 0,
      manualTags: data.data.manualTags || 0,
      categoryCount: data.data.categoryCount || 0,
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.customerId = ''
  queryForm.tagCategory = ''
  queryForm.source = ''
  pagination.page = 1
  loadTags()
}

// 添加标签
const handleAdd = async () => {
  await addFormRef.value.validate()

  adding.value = true
  try {
    await axios.post('/api/ai-tags', {
      customerId: Number(addForm.customerId),
      tagCategory: addForm.tagCategory,
      tagName: addForm.tagName,
      tagValue: addForm.tagValue || null,
    })

    ElMessage.success('添加标签成功')
    showAddDialog.value = false

    // 重置表单
    addForm.customerId = ''
    addForm.tagCategory = ''
    addForm.tagName = ''
    addForm.tagValue = ''

    loadTags()
    loadStatistics()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '添加标签失败')
  } finally {
    adding.value = false
  }
}

// 删除标签
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
      type: 'warning',
    })

    row.deleting = true
    await axios.delete(`/api/ai-tags/${row.id}`)

    ElMessage.success('删除成功')
    loadTags()
    loadStatistics()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  } finally {
    row.deleting = false
  }
}

onMounted(() => {
  loadTags()
  loadStatistics()
})
</script>

<style scoped lang="scss">
.tag-management {
  padding: 20px;

  .header-card {
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: #303133;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
}
</style>
