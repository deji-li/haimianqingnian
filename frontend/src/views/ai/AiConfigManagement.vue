<template>
  <div class="ai-config-management">
    <!-- 头部 -->
    <el-card class="header-card">
      <div class="header-content">
        <h2>AI配置管理</h2>
        <p>管理AI话术助手的提示词、温度值、Token限制等参数配置</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建配置
        </el-button>
        <el-button @click="initializeDefaults">
          <el-icon><Refresh /></el-icon>
          初始化默认配置
        </el-button>
      </div>
    </el-card>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="功能类型">
          <el-select v-model="queryParams.functionType" clearable placeholder="全部">
            <el-option label="帮你谈单" value="deal_assist" />
            <el-option label="帮你回复" value="reply_assist" />
            <el-option label="话术润色" value="script_polish" />
            <el-option label="开场白生成" value="opening_lines" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isActive" clearable placeholder="全部">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadConfigs">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 配置列表 -->
    <el-card class="list-card">
      <el-table v-loading="loading" :data="configs" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="功能类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getFunctionTypeColor(row.functionType)">
              {{ getFunctionTypeName(row.functionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="configName" label="配置名称" min-width="200" />
        <el-table-column label="适用范围" width="200">
          <template #default="{ row }">
            <div v-if="row.scenario && row.technique" class="scope-text">
              {{ row.scenario.scenarioName }} - {{ row.technique.techniqueName }}
            </div>
            <div v-else-if="row.scenario" class="scope-text">
              {{ row.scenario.scenarioName }}
            </div>
            <div v-else class="scope-text">通用配置</div>
          </template>
        </el-table-column>
        <el-table-column label="参数" width="200">
          <template #default="{ row }">
            <div class="params">
              <div>温度: {{ row.temperature }}</div>
              <div>Token: {{ row.maxTokens }}</div>
              <div>知识权重: {{ row.knowledgeWeight }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button link type="warning" size="small" @click="editConfig(row)">
              <el-icon><EditPen /></el-icon>
              编辑
            </el-button>
            <el-button link type="success" size="small" @click="duplicateConfig(row)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="deleteConfig(row)"
              v-if="!row.scenarioId && !row.techniqueId"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadConfigs"
          @current-change="loadConfigs"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? '编辑配置' : '新建配置'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="120px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配置名称" prop="configName">
              <el-input v-model="configForm.configName" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功能类型" prop="functionType">
              <el-select v-model="configForm.functionType" style="width: 100%" @change="onFunctionTypeChange">
                <el-option label="帮你谈单" value="deal_assist" />
                <el-option label="帮你回复" value="reply_assist" />
                <el-option label="话术润色" value="script_polish" />
                <el-option label="开场白生成" value="opening_lines" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="场景" prop="scenarioId">
              <el-select
                v-model="configForm.scenarioId"
                placeholder="选择场景（可选）"
                style="width: 100%"
                clearable
                @change="onScenarioChange"
              >
                <el-option
                  v-for="scenario in scenarios"
                  :key="scenario.id"
                  :label="scenario.scenarioName"
                  :value="scenario.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技巧" prop="techniqueId">
              <el-select
                v-model="configForm.techniqueId"
                placeholder="选择技巧（可选）"
                style="width: 100%"
                clearable
                :disabled="!configForm.scenarioId"
              >
                <el-option
                  v-for="technique in techniques"
                  :key="technique.id"
                  :label="technique.techniqueName"
                  :value="technique.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input
            v-model="configForm.systemPrompt"
            type="textarea"
            :rows="3"
            placeholder="AI的系统提示词，定义AI的角色和基本行为"
          />
        </el-form-item>

        <el-form-item label="用户提示词模板" prop="userPromptTemplate">
          <el-input
            v-model="configForm.userPromptTemplate"
            type="textarea"
            :rows="4"
            placeholder="用户输入的提示词模板，支持变量：{{variable}}"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="温度值" prop="temperature">
              <el-slider
                v-model="configForm.temperature"
                :min="0"
                :max="2"
                :step="0.1"
                :format-tooltip="(val: number) => val.toFixed(1)"
                show-input
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大Token数" prop="maxTokens">
              <el-input-number
                v-model="configForm.maxTokens"
                :min="100"
                :max="8000"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="知识库权重" prop="knowledgeWeight">
              <el-slider
                v-model="configForm.knowledgeWeight"
                :min="0"
                :max="1"
                :step="0.1"
                :format-tooltip="(val: number) => val.toFixed(1)"
                show-input
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="支持变量" prop="variables">
          <el-select
            v-model="configForm.variables"
            multiple
            placeholder="选择支持的变量"
            style="width: 100%"
          >
            <el-option
              v-for="(variable, key) in supportedVariables"
              :key="key"
              :label="`${variable.label} ({{${variable.name}}})`"
              :value="variable.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-switch v-model="configForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="配置详情" width="800px">
      <div v-if="currentConfig" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="配置ID">
            {{ currentConfig.id }}
          </el-descriptions-item>
          <el-descriptions-item label="配置名称">
            {{ currentConfig.configName }}
          </el-descriptions-item>
          <el-descriptions-item label="功能类型">
            <el-tag :type="getFunctionTypeColor(currentConfig.functionType)">
              {{ getFunctionTypeName(currentConfig.functionType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentConfig.isActive ? 'success' : 'danger'">
              {{ currentConfig.isActive ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="适用场景" :span="2">
            <div v-if="currentConfig.scenario">
              {{ currentConfig.scenario.scenarioName }}
              <span v-if="currentConfig.technique">
                - {{ currentConfig.technique.techniqueName }}
              </span>
            </div>
            <div v-else>通用配置</div>
          </el-descriptions-item>
          <el-descriptions-item label="温度值">
            {{ currentConfig.temperature }}
          </el-descriptions-item>
          <el-descriptions-item label="最大Token数">
            {{ currentConfig.maxTokens }}
          </el-descriptions-item>
          <el-descriptions-item label="知识库权重">
            {{ currentConfig.knowledgeWeight }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentConfig.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="系统提示词" :span="2">
            <div class="detail-text">{{ currentConfig.systemPrompt || '无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="用户提示词模板" :span="2">
            <div class="detail-text">{{ currentConfig.userPromptTemplate || '无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="支持变量" :span="2">
            <div class="variables-list">
              <el-tag
                v-for="variable in currentConfig.variables"
                :key="variable"
                size="small"
                class="variable-tag"
              >
                {{ variable }}
              </el-tag>
              <span v-if="!currentConfig.variables || currentConfig.variables.length === 0">
                无
              </span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  View,
  EditPen,
  Delete,
  CopyDocument,
} from '@element-plus/icons-vue'
import {
  getPromptConfigs,
  createPromptConfig,
  updatePromptConfig,
  deletePromptConfig as deleteConfigApi,
  duplicatePromptConfig,
  getPromptConfigById,
  getSupportedVariables,
  initializeDefaultConfigs,
  type CreatePromptConfigDto,
  type UpdatePromptConfigDto,
  type QueryPromptConfigDto,
} from '@/api/ai-script-assistant'
import { getScenarios } from '@/api/ai-script-assistant'

// 查询参数
const queryParams = reactive<QueryPromptConfigDto>({
  functionType: undefined,
  scenarioId: undefined,
  techniqueId: undefined,
  isActive: undefined,
  page: 1,
  limit: 20,
})

// 数据
const configs = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const isEditing = ref(false)
const currentConfig = ref<any>(null)
const configFormRef = ref<FormInstance>()

// 场景和技巧
const scenarios = ref<any[]>([])
const techniques = ref<any[]>([])
const supportedVariables = ref<Record<string, any>>({})

// 表单数据
const configForm = reactive<CreatePromptConfigDto>({
  functionType: 'deal_assist',
  scenarioId: undefined,
  techniqueId: undefined,
  configName: '',
  systemPrompt: '',
  userPromptTemplate: '',
  temperature: 0.7,
  maxTokens: 2000,
  knowledgeWeight: 0.7,
  variables: [],
  isActive: true,
})

// 表单验证规则
const configRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
  ],
  functionType: [
    { required: true, message: '请选择功能类型', trigger: 'change' },
  ],
}

// 加载配置列表
const loadConfigs = async () => {
  loading.value = true
  try {
    const res: any = await getPromptConfigs(queryParams)
    configs.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载配置列表失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选器
const resetFilters = () => {
  queryParams.functionType = undefined
  queryParams.scenarioId = undefined
  queryParams.techniqueId = undefined
  queryParams.isActive = undefined
  queryParams.page = 1
  loadConfigs()
}

// 功能类型变化
const onFunctionTypeChange = async () => {
  configForm.scenarioId = undefined
  configForm.techniqueId = undefined
  await loadScenarios()
}

// 加载场景
const loadScenarios = async () => {
  try {
    const res = await getScenarios(configForm.functionType)
    scenarios.value = res || []
    techniques.value = []
  } catch (error) {
    console.error('加载场景失败:', error)
  }
}

// 场景变化
const onScenarioChange = async () => {
  configForm.techniqueId = undefined
  if (configForm.scenarioId) {
    const scenario = scenarios.value.find(s => s.id === configForm.scenarioId)
    if (scenario && scenario.techniques) {
      techniques.value = scenario.techniques
    }
  } else {
    techniques.value = []
  }
}

// 保存配置
const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    if (isEditing.value) {
      await updatePromptConfig(currentConfig.value.id, configForm)
      ElMessage.success('配置更新成功')
    } else {
      await createPromptConfig(configForm)
      ElMessage.success('配置创建成功')
    }

    showCreateDialog.value = false
    loadConfigs()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    saving.value = false
  }
}

// 编辑配置
const editConfig = async (row: any) => {
  isEditing.value = true
  currentConfig.value = row

  // 加载配置详情
  const detail = await getPromptConfigById(row.id)

  Object.assign(configForm, {
    ...detail,
    variables: detail.variables || [],
  })

  // 加载场景和技巧
  await loadScenarios()
  if (detail.scenarioId) {
    configForm.scenarioId = detail.scenarioId
    await onScenarioChange()
    if (detail.techniqueId) {
      configForm.techniqueId = detail.techniqueId
    }
  }

  showCreateDialog.value = true
}

// 查看详情
const viewDetail = async (row: any) => {
  currentConfig.value = await getPromptConfigById(row.id)
  showDetailDialog.value = true
}

// 复制配置
const duplicateConfig = async (row: any) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新配置名称',
      '复制配置',
      {
        confirmButtonText: '确认复制',
        cancelButtonText: '取消',
        inputPlaceholder: `${row.configName} - 副本`,
      }
    )

    await duplicatePromptConfig(row.id, newName)
    ElMessage.success('配置复制成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('复制配置失败:', error)
      ElMessage.error(error.response?.data?.message || '复制失败')
    }
  }
}

// 删除配置
const deleteConfig = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置"${row.configName}"吗？此操作不可恢复。`,
      '删除配置',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteConfigApi(row.id)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 初始化默认配置
const initializeDefaults = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要初始化默认配置吗？这将创建所有功能类型的基础配置。',
      '初始化默认配置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    await initializeDefaultConfigs()
    ElMessage.success('默认配置初始化成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('初始化失败:', error)
      ElMessage.error(error.response?.data?.message || '初始化失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(configForm, {
    functionType: 'deal_assist',
    scenarioId: undefined,
    techniqueId: undefined,
    configName: '',
    systemPrompt: '',
    userPromptTemplate: '',
    temperature: 0.7,
    maxTokens: 2000,
    knowledgeWeight: 0.7,
    variables: [],
    isActive: true,
  })
  scenarios.value = []
  techniques.value = []
  isEditing.value = false
  currentConfig.value = null
}

// 关闭对话框时重置表单
const handleCloseDialog = () => {
  resetForm()
  if (configFormRef.value) {
    configFormRef.value.resetFields()
  }
}

// 监听对话框关闭
watch(() => showCreateDialog.value, (newVal) => {
  if (!newVal) {
    handleCloseDialog()
  }
})

// 辅助函数
const getFunctionTypeName = (type: string) => {
  const names: Record<string, string> = {
    deal_assist: '帮你谈单',
    reply_assist: '帮你回复',
    script_polish: '话术润色',
    opening_lines: '开场白生成',
  }
  return names[type] || type
}

const getFunctionTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    deal_assist: 'primary',
    reply_assist: 'success',
    script_polish: 'warning',
    opening_lines: 'info',
  }
  return colors[type] || 'default'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadConfigs(),
    loadScenarios(),
    getSupportedVariables().then(res => {
      supportedVariables.value = res
    }),
  ])
})
</script>

<style scoped lang="scss">
.ai-config-management {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .list-card {
    .scope-text {
      font-size: 13px;
      color: #606266;
    }

    .params {
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .detail-content {
    .detail-text {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .variables-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .variable-tag {
        margin: 0;
      }
    }
  }
}
</style>