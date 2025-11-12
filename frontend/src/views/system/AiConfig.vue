<template>
  <div class="ai-config-container">
    <el-card class="header-card">
      <h2>AI提示词配置管理</h2>
      <p class="desc">管理DeepSeek和豆包的提示词配置，支持多场景独立配置</p>
    </el-card>

    <div class="config-layout">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, InfoFilled } from '@element-plus/icons-vue'
import axios from 'axios'

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
    const { data } = await axios.get('/api/ai-config', {
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
    const { data } = await axios.get(
      `/api/ai-config/by-scenario/${selectedScenario.value.scenarioKey}/${currentProvider.value}`
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
    } else {
      configExists.value = false
      resetForm()
    }
  } catch (error) {
    configExists.value = false
    resetForm()
  } finally {
    loading.value = false
  }
}

// 保存配置
async function saveConfig() {
  if (!selectedScenario.value || !currentConfigId.value) return

  saving.value = true
  try {
    await axios.put(`/api/ai-config/${currentConfigId.value}`, formData.value)
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
    await axios.post('/api/ai-config', payload)
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
    await axios.delete(`/api/ai-config/${currentConfigId.value}`)
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
    await axios.post('/api/ai-config', payload)
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

  .config-layout {
    display: flex;
    gap: 20px;
    height: calc(100vh - 240px);

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
    }
  }
}
</style>
