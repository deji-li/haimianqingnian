<template>
  <div class="api-key-management">
    <el-alert
      title="API密钥管理"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      在此配置DeepSeek和豆包的API密钥，配置后立即生效，无需重启服务。优先级高于环境变量配置。
    </el-alert>

    <!-- API密钥列表 -->
    <el-table :data="apiKeys" v-loading="loading" border>
      <el-table-column prop="provider" label="AI供应商" width="150">
        <template #default="{ row }">
          <el-tag v-if="row.provider === 'deepseek'" type="primary">DeepSeek</el-tag>
          <el-tag v-else-if="row.provider === 'doubao'" type="success">豆包</el-tag>
          <span v-else>{{ row.provider }}</span>
        </template>
      </el-table-column>

      <el-table-column label="API密钥" min-width="200">
        <template #default="{ row }">
          <el-input
            v-if="row.editing"
            v-model="row.apiKey"
            placeholder="输入API密钥"
            type="password"
            show-password
          />
          <span v-else>{{ maskApiKey(row.apiKey) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="API地址" min-width="250">
        <template #default="{ row }">
          <el-input
            v-if="row.editing"
            v-model="row.apiUrl"
            placeholder="https://api.xxx.com/v1/..."
          />
          <span v-else style="font-size: 12px">{{ row.apiUrl }}</span>
        </template>
      </el-table-column>

      <el-table-column label="端点ID/模型" width="180">
        <template #default="{ row }">
          <template v-if="row.editing">
            <el-input
              v-if="row.provider === 'doubao'"
              v-model="row.endpointId"
              placeholder="Endpoint ID"
            />
            <el-input
              v-else
              v-model="row.modelName"
              placeholder="模型名称"
            />
          </template>
          <span v-else style="font-size: 12px">
            {{ row.provider === 'doubao' ? row.endpointId : row.modelName }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.editing">
            <el-button link type="primary" @click="handleSave(row)">保存</el-button>
            <el-button link @click="handleCancel(row)">取消</el-button>
          </template>
          <template v-else>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.isActive ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加按钮 -->
    <div style="margin-top: 20px" v-if="!hasDeepSeek || !hasDoubao">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加API密钥配置
      </el-button>
    </div>

    <!-- 添加对话框 -->
    <el-dialog v-model="showAddDialog" title="添加API密钥配置" width="600px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="AI供应商" prop="provider">
          <el-select v-model="addForm.provider" placeholder="选择AI供应商">
            <el-option label="DeepSeek" value="deepseek" :disabled="hasDeepSeek" />
            <el-option label="豆包" value="doubao" :disabled="hasDoubao" />
          </el-select>
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="addForm.apiKey"
            type="password"
            show-password
            placeholder="输入API密钥"
          />
        </el-form-item>

        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model="addForm.apiUrl" placeholder="https://api.xxx.com/v1/..." />
        </el-form-item>

        <el-form-item v-if="addForm.provider === 'doubao'" label="Endpoint ID" prop="endpointId">
          <el-input v-model="addForm.endpointId" placeholder="输入豆包Endpoint ID" />
        </el-form-item>

        <el-form-item v-if="addForm.provider === 'deepseek'" label="模型名称" prop="modelName">
          <el-input v-model="addForm.modelName" placeholder="如：deepseek-chat" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { Plus } from '@element-plus/icons-vue'

interface ApiKey {
  id?: number
  provider: string
  apiKey: string
  apiUrl: string
  endpointId?: string
  modelName?: string
  isActive: boolean
  remark?: string
  editing?: boolean
  _backup?: any
}

const apiKeys = ref<ApiKey[]>([])
const loading = ref(false)
const showAddDialog = ref(false)
const adding = ref(false)
const addFormRef = ref()

const addForm = reactive({
  provider: '',
  apiKey: '',
  apiUrl: '',
  endpointId: '',
  modelName: '',
  remark: '',
})

const addRules = {
  provider: [{ required: true, message: '请选择AI供应商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
}

const hasDeepSeek = computed(() => apiKeys.value.some(k => k.provider === 'deepseek'))
const hasDoubao = computed(() => apiKeys.value.some(k => k.provider === 'doubao'))

const maskApiKey = (key: string) => {
  if (!key || key.length < 8) return '***'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

const loadApiKeys = async () => {
  loading.value = true
  try {
    const data = await request.get('/ai-api-keys')
    apiKeys.value = data.map((item: any) => ({
      ...item,
      editing: false,
    }))
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || error.message || '加载API密钥配置失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: ApiKey) => {
  row._backup = { ...row }
  row.editing = true
}

const handleCancel = (row: ApiKey) => {
  if (row._backup) {
    Object.assign(row, row._backup)
  }
  row.editing = false
}

const handleSave = async (row: ApiKey) => {
  try {
    const updateData = {
      apiKey: row.apiKey,
      apiUrl: row.apiUrl,
      endpointId: row.endpointId,
      modelName: row.modelName,
      remark: row.remark,
    }

    await request.put(`/ai-api-keys/${row.id}`, updateData)
    ElMessage.success('保存成功')
    row.editing = false
    delete row._backup
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  }
}

const handleToggleStatus = async (row: ApiKey) => {
  try {
    await request.put(`/ai-api-keys/${row.id}`, {
      isActive: !row.isActive,
    })
    row.isActive = !row.isActive
    ElMessage.success(row.isActive ? '已启用' : '已禁用')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const handleAdd = async () => {
  await addFormRef.value.validate()

  adding.value = true
  try {
    await request.post('/ai-api-keys', {
      provider: addForm.provider,
      apiKey: addForm.apiKey,
      apiUrl: addForm.apiUrl,
      endpointId: addForm.endpointId || null,
      modelName: addForm.modelName || null,
      remark: addForm.remark || null,
      isActive: true,
    })

    ElMessage.success('添加成功')
    showAddDialog.value = false
    addForm.provider = ''
    addForm.apiKey = ''
    addForm.apiUrl = ''
    addForm.endpointId = ''
    addForm.modelName = ''
    addForm.remark = ''
    loadApiKeys()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '添加失败')
  } finally {
    adding.value = false
  }
}

onMounted(() => {
  loadApiKeys()
})
</script>

<style scoped lang="scss">
.api-key-management {
  padding: 20px;
}
</style>
