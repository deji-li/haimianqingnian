<template>
  <div class="ai-config-container">
    <el-card class="header-card">
      <h2>AI配置管理</h2>
      <p class="desc">管理DeepSeek和豆包的API密钥和提示词配置</p>
    </el-card>

    <!-- Tab切换 -->
    <el-card style="margin-top: 20px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="API密钥配置" name="api-key">
          <ApiKeyManagement />
        </el-tab-pane>
        <el-tab-pane label="AI字段映射配置" name="field-mapping">
          <FieldMappingConfig />
        </el-tab-pane>
        <el-tab-pane label="提示词配置" name="prompt">
          <div class="config-layout-inner">
      <!-- 左侧：场景列表 -->
      <el-card class="scenario-list">
        <template #header>
          <div class="list-header">
            <span>场景列表</span>
            <el-button type="primary" size="small" @click="showCreateDialog = true">
              新增场景
            </el-button>
          </div>
        </template>

        <el-input
          v-model="searchKeyword"
          placeholder="搜索场景"
          clearable
          style="margin-bottom: 16px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-tree
          :data="scenarioTree"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleScenarioClick"
          :highlight-current="true"
          node-key="key"
        />
      </el-card>

      <!-- 右侧：配置编辑器 -->
      <el-card class="config-editor" v-loading="loading">
        <template v-if="selectedScenario">
          <div class="editor-header">
            <div class="scenario-info">
              <h3>{{ selectedScenario.scenarioName }}</h3>
              <el-tag>{{ selectedScenario.scenarioCategory }}</el-tag>
            </div>

            <!-- 模型切换 -->
            <el-radio-group v-model="currentProvider" @change="loadConfig">
              <el-radio-button value="deepseek">DeepSeek</el-radio-button>
              <el-radio-button value="doubao">豆包</el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <el-form :model="formData" label-width="120px" v-if="configExists">
            <el-form-item label="模型名称">
              <el-input v-model="formData.modelName" placeholder="如：deepseek-chat" />
            </el-form-item>

            <el-form-item label="系统提示词">
              <el-input
                type="textarea"
                v-model="formData.systemPrompt"
                :rows="4"
                placeholder="定义AI的角色和行为"
              />
            </el-form-item>

            <el-form-item label="用户提示词">
              <div class="prompt-editor">
                <el-input
                  type="textarea"
                  v-model="formData.promptContent"
                  :rows="12"
                  placeholder="输入提示词内容，支持变量：{{chatText}}, {{customerName}} 等"
                />
                <div class="variable-hint">
                  <el-icon><InfoFilled /></el-icon>
                  支持的变量：{{ formData.variables?.join(', ') || '无' }}
                </div>
              </div>
            </el-form-item>

            <el-form-item label="变量说明">
              <el-input
                type="textarea"
                v-model="formData.variableDescription"
                :rows="2"
                placeholder="说明各变量的含义"
              />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="温度参数">
                  <el-slider v-model="formData.temperature" :min="0" :max="1" :step="0.1" show-input />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大Tokens">
                  <el-input-number v-model="formData.maxTokens" :min="100" :max="8000" :step="100" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="是否启用">
              <el-switch v-model="formData.isActive" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
              <el-button @click="resetForm">重置</el-button>
              <el-button type="danger" plain @click="deleteConfig">删除配置</el-button>
            </el-form-item>
          </el-form>

          <!-- 变量配置区域 -->
          <div class="variables-section" v-if="configExists">
            <el-divider />
            <div class="section-header">
              <div class="header-left">
                <h4>变量配置列表</h4>
                <p class="desc">共 {{ variables.length }} 个变量，{{ variables.filter((v: any) => v.isActive).length }} 个已启用</p>
              </div>
              <el-button type="primary" size="default" @click="openAddVariableDialog">
                添加变量
              </el-button>
            </div>

            <el-table :data="variables" style="width: 100%" v-loading="loadingVariables">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="variableKey" label="变量标识" width="180">
                <template #default="{ row }">
                  <el-tag type="info" size="small">{{ row.variableKey }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="variableName" label="变量名称" width="150" />
              <el-table-column prop="variableDescription" label="变量说明" min-width="200" show-overflow-tooltip />
              <el-table-column prop="dataType" label="数据类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.dataType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="分类" width="120">
                <template #default="{ row }">
                  <el-tag
                    :type="getCategoryType(row.category)"
                    size="small"
                  >
                    {{ row.category || '-' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isRequired" label="必填" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.isRequired ? 'danger' : ''" size="small">
                    {{ row.isRequired ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isActive" label="启用状态" width="100" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.isActive"
                    @change="updateVariableStatus(row)"
                    :disabled="row.isRequired"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="editVariable(row)">
                    编辑
                  </el-button>
                  <el-button type="danger" link size="small" @click="deleteVariable(row)" v-if="!row.isRequired">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 未配置提示 -->
          <el-empty v-else description="当前供应商暂无配置">
            <el-button type="primary" @click="createProviderConfig">
              为{{ currentProvider }}创建配置
            </el-button>
          </el-empty>
        </template>

        <el-empty v-else description="请在左侧选择一个场景" />
      </el-card>
    </div>

    <!-- 新增场景对话框 -->
    <el-dialog v-model="showCreateDialog" title="新增场景" width="600px">
      <el-form :model="createForm" label-width="120px">
        <el-form-item label="场景标识" required>
          <el-input v-model="createForm.scenarioKey" placeholder="如：customer_info_extract" />
        </el-form-item>
        <el-form-item label="场景名称" required>
          <el-input v-model="createForm.scenarioName" placeholder="如：客户信息提取" />
        </el-form-item>
        <el-form-item label="场景分类" required>
          <el-select v-model="createForm.scenarioCategory" placeholder="选择分类">
            <el-option label="客户管理" value="客户管理" />
            <el-option label="聊天分析" value="聊天分析" />
            <el-option label="销售辅助" value="销售辅助" />
            <el-option label="团队管理" value="团队管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="AI供应商" required>
          <el-select v-model="createForm.modelProvider" placeholder="选择供应商">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="豆包" value="doubao" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createScenario">确定</el-button>
      </template>
    </el-dialog>

    <!-- 变量对话框 -->
    <el-dialog
      v-model="showVariableDialog"
      :title="variableFormMode === 'add' ? '添加变量' : '编辑变量'"
      width="700px"
    >
      <el-form :model="variableForm" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="变量标识" required>
              <el-input
                v-model="variableForm.variableKey"
                placeholder="如：chatText"
                :disabled="variableFormMode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="变量名称" required>
              <el-input v-model="variableForm.variableName" placeholder="如：聊天记录" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="变量说明">
          <el-input
            v-model="variableForm.variableDescription"
            type="textarea"
            :rows="3"
            placeholder="描述该变量的作用和含义"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="数据类型">
              <el-select v-model="variableForm.dataType" style="width: 100%">
                <el-option label="文本" value="text" />
                <el-option label="数字" value="number" />
                <el-option label="布尔" value="boolean" />
                <el-option label="日期" value="date" />
                <el-option label="JSON" value="json" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="变量分类">
              <el-select v-model="variableForm.category" style="width: 100%">
                <el-option label="必填字段" value="必填字段" />
                <el-option label="可选字段" value="可选字段" />
                <el-option label="客户信息" value="客户信息" />
                <el-option label="系统自动" value="系统自动" />
                <el-option label="业务信息" value="业务信息" />
                <el-option label="训练设置" value="训练设置" />
                <el-option label="内容要素" value="内容要素" />
                <el-option label="风格设置" value="风格设置" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="默认值">
              <el-input v-model="variableForm.defaultValue" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序">
              <el-input-number
                v-model="variableForm.displayOrder"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="示例值">
          <el-input
            v-model="variableForm.exampleValue"
            type="textarea"
            :rows="2"
            placeholder="可选"
          />
        </el-form-item>

        <el-form-item label="验证规则">
          <el-input
            v-model="variableForm.validationRule"
            placeholder="正则表达式或其他验证规则（可选）"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否必填">
              <el-switch v-model="variableForm.isRequired" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-switch v-model="variableForm.isActive" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="showVariableDialog = false">取消</el-button>
        <el-button type="primary" @click="saveVariable" :loading="savingVariable">
          {{ variableFormMode === 'add' ? '添加' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, InfoFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'
import ApiKeyManagement from '@/components/system/ApiKeyManagement.vue'
import FieldMappingConfig from '@/components/system/FieldMappingConfig.vue'

// Tab切换
const activeTab = ref('api-key')

// 搜索关键词
const searchKeyword = ref('')

// 场景列表
const scenarios = ref<any[]>([])
const selectedScenario = ref<any>(null)
const currentProvider = ref<'deepseek' | 'doubao'>('deepseek')

// 表单数据
const formData = ref({
  modelName: '',
  systemPrompt: '',
  promptContent: '',
  temperature: 0.3,
  maxTokens: 2000,
  variables: [] as string[],
  variableDescription: '',
  isActive: true,
})

// 当前配置ID
const currentConfigId = ref<number | null>(null)
const configExists = ref(false)

// 变量列表
const variables = ref<any[]>([])
const loadingVariables = ref(false)
const showVariableDialog = ref(false)
const variableFormMode = ref<'add' | 'edit'>('add')
const variableForm = ref({
  id: null as number | null,
  promptConfigId: null as number | null,
  scenarioKey: '',
  variableKey: '',
  variableName: '',
  variableDescription: '',
  dataType: 'text',
  isRequired: false,
  isActive: true,
  defaultValue: '',
  exampleValue: '',
  validationRule: '',
  displayOrder: 0,
  category: '可选字段',
})
const savingVariable = ref(false)

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 新增场景
const showCreateDialog = ref(false)
const createForm = ref({
  scenarioKey: '',
  scenarioName: '',
  scenarioCategory: '客户管理',
  modelProvider: 'deepseek',
})

// 场景树结构
const scenarioTree = computed(() => {
  const categories: any = {}

  scenarios.value.forEach((scenario: any) => {
    const category = scenario.scenarioCategory
    if (!categories[category]) {
      categories[category] = {
        name: category,
        key: category,
        children: [],
      }
    }

    // 检查是否已存在该场景
    const existing = categories[category].children.find(
      (s: any) => s.key === scenario.scenarioKey
    )

    if (!existing) {
      categories[category].children.push({
        name: scenario.scenarioName,
        key: scenario.scenarioKey,
        ...scenario,
      })
    }
  })

  return Object.values(categories)
})

// 加载场景列表
async function loadScenarios() {
  try {
    const data = await request.get('/ai-config', {
      params: { limit: 1000 },
    })
    scenarios.value = data.list || []
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载场景列表失败')
  }
}

// 选择场景
function handleScenarioClick(node: any) {
  if (node.children) return // 点击分类节点，不处理

  selectedScenario.value = node
  loadConfig()
}

// 加载配置
async function loadConfig() {
  if (!selectedScenario.value) return

  loading.value = true
  try {
    const data = await request.get(
      `/ai-config/by-scenario/${selectedScenario.value.scenarioKey}/${currentProvider.value}`
    )

    if (data) {
      configExists.value = true
      currentConfigId.value = data.id
      formData.value = {
        modelName: data.modelName || '',
        systemPrompt: data.systemPrompt || '',
        promptContent: data.promptContent || '',
        temperature: data.temperature || 0.3,
        maxTokens: data.maxTokens || 2000,
        variables: data.variables || [],
        variableDescription: data.variableDescription || '',
        isActive: data.isActive ?? true,
      }

      // 加载变量列表
      loadVariables()
    } else {
      configExists.value = false
      resetForm()
      variables.value = []
    }
  } catch (error) {
    configExists.value = false
    resetForm()
    variables.value = []
  } finally {
    loading.value = false
  }
}

// 加载变量列表
async function loadVariables() {
  if (!currentConfigId.value) return

  loadingVariables.value = true
  try {
    const data = await request.get(`/ai-config/${currentConfigId.value}/variables`)
    variables.value = data || []
  } catch (error: any) {
    console.error('加载变量失败:', error)
    variables.value = []
  } finally {
    loadingVariables.value = false
  }
}

// 获取分类标签类型
function getCategoryType(category: string) {
  const typeMap: Record<string, string> = {
    '必填字段': 'danger',
    '可选字段': 'warning',
    '客户信息': 'primary',
    '系统自动': 'info',
    '业务信息': 'success',
    '训练设置': '',
    '内容要素': 'warning',
    '风格设置': '',
  }
  return typeMap[category] || ''
}

// 更新变量启用状态
async function updateVariableStatus(variable: any) {
  try {
    await request.put(`/ai-config/variables/${variable.id}/status`, {
      isActive: variable.isActive,
    })
    ElMessage.success('更新成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新失败')
    // 恢复原状态
    variable.isActive = !variable.isActive
  }
}

// 打开添加变量对话框
function openAddVariableDialog() {
  if (!currentConfigId.value || !selectedScenario.value) {
    ElMessage.warning('请先选择一个场景')
    return
  }

  variableFormMode.value = 'add'
  resetVariableForm()
  variableForm.value.promptConfigId = currentConfigId.value
  variableForm.value.scenarioKey = selectedScenario.value.scenarioKey
  // 设置默认的显示顺序为当前变量数+1
  variableForm.value.displayOrder = variables.value.length + 1
  showVariableDialog.value = true
}

// 编辑变量
function editVariable(variable: any) {
  variableFormMode.value = 'edit'
  variableForm.value = {
    id: variable.id,
    promptConfigId: variable.promptConfigId,
    scenarioKey: variable.scenarioKey,
    variableKey: variable.variableKey,
    variableName: variable.variableName,
    variableDescription: variable.variableDescription || '',
    dataType: variable.dataType || 'text',
    isRequired: variable.isRequired || false,
    isActive: variable.isActive ?? true,
    defaultValue: variable.defaultValue || '',
    exampleValue: variable.exampleValue || '',
    validationRule: variable.validationRule || '',
    displayOrder: variable.displayOrder || 0,
    category: variable.category || '可选字段',
  }
  showVariableDialog.value = true
}

// 保存变量
async function saveVariable() {
  savingVariable.value = true
  try {
    if (variableFormMode.value === 'add') {
      await request.post('/ai-config/variables', variableForm.value)
      ElMessage.success('添加成功')
    } else {
      await request.put(`/ai-config/variables/${variableForm.value.id}`, variableForm.value)
      ElMessage.success('更新成功')
    }
    showVariableDialog.value = false
    loadVariables()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    savingVariable.value = false
  }
}

// 重置变量表单
function resetVariableForm() {
  variableForm.value = {
    id: null,
    promptConfigId: null,
    scenarioKey: '',
    variableKey: '',
    variableName: '',
    variableDescription: '',
    dataType: 'text',
    isRequired: false,
    isActive: true,
    defaultValue: '',
    exampleValue: '',
    validationRule: '',
    displayOrder: 0,
    category: '可选字段',
  }
}

// 删除变量
async function deleteVariable(variable: any) {
  if (variable.isRequired) {
    ElMessage.warning('必填变量不允许删除')
    return
  }

  await ElMessageBox.confirm(`确定删除变量"${variable.variableName}"吗？`, '提示', {
    type: 'warning',
  })

  try {
    await request.delete(`/ai-config/variables/${variable.id}`)
    ElMessage.success('删除成功')
    loadVariables()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

// 保存配置
async function saveConfig() {
  if (!selectedScenario.value || !currentConfigId.value) return

  saving.value = true
  try {
    await request.put(`/ai-config/${currentConfigId.value}`, formData.value)
    ElMessage.success('保存成功')
    loadScenarios()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 创建供应商配置
async function createProviderConfig() {
  if (!selectedScenario.value) return

  const payload = {
    scenarioKey: selectedScenario.value.scenarioKey,
    scenarioName: selectedScenario.value.scenarioName,
    scenarioCategory: selectedScenario.value.scenarioCategory,
    modelProvider: currentProvider.value,
    ...formData.value,
  }

  saving.value = true
  try {
    await request.post('/ai-config', payload)
    ElMessage.success('创建成功')
    loadScenarios()
    loadConfig()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  } finally {
    saving.value = false
  }
}

// 删除配置
async function deleteConfig() {
  if (!currentConfigId.value) return

  await ElMessageBox.confirm('确定删除此配置吗？', '提示', {
    type: 'warning',
  })

  try {
    await request.delete(`/ai-config/${currentConfigId.value}`)
    ElMessage.success('删除成功')
    loadScenarios()
    resetForm()
    configExists.value = false
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    modelName: '',
    systemPrompt: '',
    promptContent: '',
    temperature: 0.3,
    maxTokens: 2000,
    variables: [],
    variableDescription: '',
    isActive: true,
  }
}

// 创建新场景
async function createScenario() {
  const payload = {
    ...createForm.value,
    promptContent: '请在此输入提示词内容',
    systemPrompt: '你是一个AI助手',
  }

  try {
    await request.post('/ai-config', payload)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    loadScenarios()
    createForm.value = {
      scenarioKey: '',
      scenarioName: '',
      scenarioCategory: '客户管理',
      modelProvider: 'deepseek',
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  }
}

onMounted(() => {
  loadScenarios()
})
</script>

<style lang="scss" scoped>
.ai-config-container {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .desc {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }

  .config-layout-inner {
    display: flex;
    gap: 20px;
    height: calc(100vh - 320px);

    .scenario-list {
      width: 300px;
      flex-shrink: 0;

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      :deep(.el-card__body) {
        height: calc(100% - 56px);
        overflow-y: auto;
      }
    }

    .config-editor {
      flex: 1;
      overflow-y: auto;

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .scenario-info {
          h3 {
            margin: 0 0 8px 0;
          }
        }
      }

      .prompt-editor {
        width: 100%;

        .variable-hint {
          margin-top: 8px;
          padding: 8px 12px;
          background: #f4f4f5;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .variables-section {
        margin-top: 32px;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .header-left {
            h4 {
              margin: 0 0 4px 0;
              font-size: 16px;
              color: #303133;
            }

            .desc {
              margin: 0;
              font-size: 13px;
              color: #909399;
            }
          }
        }

        :deep(.el-table) {
          .el-tag {
            border: none;
          }
        }
      }
    }
  }
}
</style>
