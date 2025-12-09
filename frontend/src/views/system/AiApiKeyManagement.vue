<template>
  <div class="ai-api-key-container">
    <!-- 顶部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div>
          <h2>AI API密钥管理</h2>
          <p class="subtitle">管理AI服务的API密钥，配置不同服务商的接口参数</p>
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreate"
          v-permission="'system:ai-config'"
        >
          添加密钥
        </el-button>
      </div>
    </el-card>

    <!-- 搜索筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form inline>
        <el-form-item label="服务商">
          <el-select
            v-model="queryParams.provider"
            placeholder="全部服务商"
            clearable
            style="width: 150px"
          >
            <el-option label="OpenAI" value="openai" />
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
            <el-option label="百度" value="baidu" />
            <el-option label="智谱AI" value="zhipuai" />
            <el-option label="讯飞" value="xunfei" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.isActive"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索名称或备注"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="apiKeys"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="provider" label="服务商" width="100">
          <template #default="{ row }">
            <el-tag :type="getProviderTagType(row.provider)">
              {{ getProviderName(row.provider) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="apiKey" label="API密钥" width="200">
          <template #default="{ row }">
            <span class="api-key-text">{{ maskApiKey(row.apiKey) }}</span>
            <el-button
              link
              type="primary"
              size="small"
              @click="copyToClipboard(row.apiKey)"
            >
              复制
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="模型" width="120" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
              :loading="row.statusLoading"
            />
          </template>
        </el-table-column>
        <el-table-column prop="currentUsage" label="当日使用" width="100">
          <template #default="{ row }">
            <span v-if="row.dailyLimit">
              {{ row.currentUsage || 0 }}/{{ row.dailyLimit }}
            </span>
            <span v-else>无限制</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastUsedAt" label="最后使用" width="160">
          <template #default="{ row }">
            <span v-if="row.lastUsedAt">
              {{ formatDate(row.lastUsedAt) }}
            </span>
            <span v-else class="text-secondary">未使用</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleTest(row)"
              :loading="row.testLoading"
            >
              测试
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewUsage(row)"
            >
              使用量
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-permission="'system:ai-config'"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-permission="'system:ai-config'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑API密钥' : '添加API密钥'"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入密钥名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务商" prop="provider">
              <el-select v-model="formData.provider" placeholder="请选择服务商" style="width: 100%">
                <el-option label="OpenAI" value="openai" />
                <el-option label="阿里云" value="aliyun" />
                <el-option label="腾讯云" value="tencent" />
                <el-option label="百度" value="baidu" />
                <el-option label="智谱AI" value="zhipuai" />
                <el-option label="讯飞" value="xunfei" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="formData.apiKey"
            type="password"
            placeholder="请输入API密钥"
            show-password
          />
        </el-form-item>

        <el-form-item label="API密钥 Secret">
          <el-input
            v-model="formData.apiSecret"
            type="password"
            placeholder="请输入API Secret（可选）"
            show-password
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接口地址">
              <el-input v-model="formData.endpoint" placeholder="自定义接口地址（可选）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型">
              <el-input v-model="formData.model" placeholder="默认模型（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大Token数">
              <el-input-number
                v-model="formData.maxTokens"
                :min="1"
                :max="100000"
                placeholder="最大Token数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="温度参数">
              <el-input-number
                v-model="formData.temperature"
                :min="0"
                :max="2"
                :step="0.1"
                placeholder="温度参数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-switch
                v-model="formData.isActive"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日限额">
              <el-input-number
                v-model="formData.dailyLimit"
                :min="0"
                placeholder="日调用次数限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月限额">
              <el-input-number
                v-model="formData.monthlyLimit"
                :min="0"
                placeholder="月调用次数限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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

    <!-- 使用量统计对话框 -->
    <el-dialog
      v-model="usageDialogVisible"
      title="使用量统计"
      width="800px"
    >
      <div v-if="usageData" class="usage-content">
        <el-row :gutter="20" class="usage-summary">
          <el-col :span="6">
            <div class="usage-stat">
              <div class="stat-value">{{ usageData.totalRequests }}</div>
              <div class="stat-label">总请求数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="usage-stat">
              <div class="stat-value">{{ usageData.totalTokens.toLocaleString() }}</div>
              <div class="stat-label">总Token数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="usage-stat">
              <div class="stat-value">{{ usageData.averageResponseTime }}ms</div>
              <div class="stat-label">平均响应时间</div>
            </div>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleResetUsage" size="small">
              重置使用量
            </el-button>
          </el-col>
        </el-row>

        <div class="usage-chart">
          <h4>每日使用趋势</h4>
          <div class="chart-placeholder">
            <el-empty description="图表功能开发中" />
          </div>
        </div>

        <div class="usage-table">
          <h4>详细使用记录</h4>
          <el-table :data="usageData.dailyUsage" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="requestCount" label="请求数" width="100" />
            <el-table-column prop="tokenCount" label="Token数" width="120" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  testApiKeyConnection,
  getApiKeyUsage,
  resetApiKeyUsage,
  type AiApiKey,
  type CreateApiKeyParams,
  type UpdateApiKeyParams,
  type ApiKeyQuery
} from '@/api/aiApiKey'

const loading = ref(false)
const apiKeys = ref<AiApiKey[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const usageDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const currentApiKey = ref<AiApiKey | null>(null)
const usageData = ref<any>(null)

const queryParams = reactive<ApiKeyQuery>({
  page: 1,
  pageSize: 20,
  provider: undefined,
  isActive: undefined,
  keyword: ''
})

const formData = reactive<CreateApiKeyParams & { isActive: boolean }>({
  name: '',
  provider: '',
  apiKey: '',
  apiSecret: '',
  endpoint: '',
  model: '',
  maxTokens: undefined,
  temperature: undefined,
  dailyLimit: undefined,
  monthlyLimit: undefined,
  isActive: true,
  remark: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' }
  ],
  provider: [
    { required: true, message: '请选择服务商', trigger: 'change' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

const formRef = ref<FormInstance>()

// 获取服务商标签类型
const getProviderTagType = (provider: string) => {
  const typeMap: Record<string, string> = {
    openai: 'success',
    aliyun: 'primary',
    tencent: 'warning',
    baidu: 'info',
    zhipuai: 'danger',
    xunfei: ''
  }
  return typeMap[provider] || ''
}

// 获取服务商名称
const getProviderName = (provider: string) => {
  const nameMap: Record<string, string> = {
    openai: 'OpenAI',
    aliyun: '阿里云',
    tencent: '腾讯云',
    baidu: '百度',
    zhipuai: '智谱AI',
    xunfei: '讯飞'
  }
  return nameMap[provider] || provider
}

// 掩码API密钥
const maskApiKey = (apiKey: string) => {
  if (!apiKey) return ''
  if (apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 8) + '****'
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const { list, total: totalCount } = await getApiKeys(queryParams)
    apiKeys.value = list
    total.value = totalCount
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    ElMessage.error('获取API密钥列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    pageSize: 20,
    provider: undefined,
    isActive: undefined,
    keyword: ''
  })
  fetchData()
}

// 创建
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: AiApiKey) => {
  isEdit.value = true
  Object.assign(formData, {
    name: row.name,
    provider: row.provider,
    apiKey: row.apiKey,
    apiSecret: row.apiSecret || '',
    endpoint: row.endpoint || '',
    model: row.model || '',
    maxTokens: row.maxTokens,
    temperature: row.temperature,
    dailyLimit: row.dailyLimit,
    monthlyLimit: row.monthlyLimit,
    isActive: row.isActive,
    remark: row.remark || ''
  })
  currentApiKey.value = row
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: AiApiKey) => {
  ElMessageBox.confirm(
    `确定要删除API密钥 "${row.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteApiKey(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete API key:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 状态切换
const handleStatusChange = async (row: AiApiKey) => {
  row.statusLoading = true
  try {
    await updateApiKey(row.id, { isActive: row.isActive })
    ElMessage.success(row.isActive ? '已启用' : '已禁用')
  } catch (error) {
    // 恢复原状态
    row.isActive = !row.isActive
    console.error('Failed to update status:', error)
    ElMessage.error('状态更新失败')
  } finally {
    row.statusLoading = false
  }
}

// 测试连接
const handleTest = async (row: AiApiKey) => {
  row.testLoading = true
  try {
    const result = await testApiKeyConnection(row.id)
    if (result.success) {
      ElMessage.success(`连接成功，响应时间：${result.responseTime}ms`)
    } else {
      ElMessage.error(`连接失败：${result.message}`)
    }
  } catch (error) {
    console.error('Failed to test API key:', error)
    ElMessage.error('测试连接失败')
  } finally {
    row.testLoading = false
  }
}

// 查看使用量
const handleViewUsage = async (row: AiApiKey) => {
  try {
    usageData.value = await getApiKeyUsage(row.id)
    currentApiKey.value = row
    usageDialogVisible.value = true
  } catch (error) {
    console.error('Failed to get usage data:', error)
    ElMessage.error('获取使用量数据失败')
  }
}

// 重置使用量
const handleResetUsage = async () => {
  if (!currentApiKey.value) return

  try {
    await ElMessageBox.confirm('确定要重置该API密钥的使用量吗？', '重置确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await resetApiKeyUsage(currentApiKey.value.id)
    ElMessage.success('使用量重置成功')
    if (currentApiKey.value) {
      handleViewUsage(currentApiKey.value)
    }
  } catch (error) {
    // 用户取消或其他错误
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value && currentApiKey.value) {
          await updateApiKey(currentApiKey.value.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createApiKey(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('Failed to submit API key:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    provider: '',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    model: '',
    maxTokens: undefined,
    temperature: undefined,
    dailyLimit: undefined,
    monthlyLimit: undefined,
    isActive: true,
    remark: ''
  })
  currentApiKey.value = null
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.ai-api-key-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);

  .header-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        color: var(--xhs-text-primary);
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .subtitle {
        color: var(--xhs-text-secondary);
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .search-card, .table-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .api-key-text {
    font-family: monospace;
    font-size: 12px;
    color: var(--xhs-text-secondary);
  }

  .text-secondary {
    color: var(--xhs-text-secondary);
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .usage-content {
    .usage-summary {
      margin-bottom: 20px;

      .usage-stat {
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
        color: white;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }

    .usage-chart, .usage-table {
      margin-top: 20px;

      h4 {
        margin-bottom: 15px;
        color: var(--xhs-text-primary);
      }
    }

    .chart-placeholder {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--xhs-bg-color);
      border-radius: 8px;
    }
  }

  :deep(.el-button--primary) {
    @include xhs-button-primary;
  }

  :deep(.el-table) {
    .el-table__header {
      th {
        background: var(--xhs-bg-color);
        color: var(--xhs-text-primary);
        font-weight: 600;
      }
    }

    .el-table__row {
      &:hover {
        background: rgba(255, 184, 0, 0.05);
      }
    }
  }

  :deep(.el-form-item__label) {
    color: var(--xhs-text-primary);
    font-weight: 500;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--xhs-primary);
    }

    &.is-focus {
      border-color: var(--xhs-primary);
      box-shadow: 0 0 0 2px rgba(255, 184, 0, 0.2);
    }
  }

  :deep(.el-select) {
    .el-select__wrapper {
      border-radius: 8px;
    }
  }
}
</style>