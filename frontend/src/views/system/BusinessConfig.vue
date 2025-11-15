<template>
  <div class="business-config-container">
    <!-- 顶部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div>
          <h2>业务配置管理</h2>
          <p class="subtitle">配置订单同步、默认值等业务参数（AI相关配置请到【AI工具→AI配置】中设置）</p>
        </div>
      </div>
    </el-card>

    <!-- 筛选栏 -->
    <el-card shadow="never" class="filter-card">
      <el-radio-group v-model="filterCategory" @change="loadConfigs">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="default_values">默认值</el-radio-button>
        <el-radio-button label="business_rules">业务规则</el-radio-button>
        <el-radio-button label="other">其他</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 配置列表 -->
    <el-card shadow="never" v-loading="loading">
      <el-table :data="configs" stripe>
        <el-table-column prop="configKey" label="配置键" width="250" />
        <el-table-column prop="configCategory" label="类别" width="150">
          <template #default="{ row }">
            <el-tag :type="getCategoryTag(row.configCategory)">
              {{ getCategoryLabel(row.configCategory) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="配置值" min-width="300">
          <template #default="{ row }">
            <div class="config-value-cell">
              <pre v-if="isJsonObject(row.configValue)">{{ JSON.stringify(row.configValue, null, 2) }}</pre>
              <span v-else>{{ formatValue(row.configValue) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑配置"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="120px"
      >
        <el-form-item label="配置键">
          <el-input v-model="formData.configKey" disabled />
        </el-form-item>

        <el-form-item label="配置类别">
          <el-tag :type="getCategoryTag(formData.configCategory)">
            {{ getCategoryLabel(formData.configCategory) }}
          </el-tag>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            disabled
          />
        </el-form-item>

        <el-form-item label="配置值">
          <!-- JSON对象编辑器 -->
          <div v-if="isJsonObject(formData.configValue)" class="json-editor">
            <el-button
              size="small"
              @click="editMode = editMode === 'visual' ? 'json' : 'visual'"
              style="margin-bottom: 8px;"
            >
              切换到{{ editMode === 'visual' ? 'JSON' : '可视化' }}编辑
            </el-button>

            <!-- 可视化编辑 -->
            <div v-if="editMode === 'visual'" class="visual-editor">
              <el-form-item
                v-for="(value, key) in formData.configValue"
                :key="key"
                :label="String(key)"
                label-width="180px"
              >
                <el-input v-model="formData.configValue[key]" />
              </el-form-item>
            </div>

            <!-- JSON编辑 -->
            <el-input
              v-else
              v-model="jsonString"
              type="textarea"
              :rows="15"
              placeholder="请输入JSON格式的配置"
            />
          </div>

          <!-- 普通值编辑 -->
          <template v-else>
            <!-- 布尔值 -->
            <el-switch
              v-if="typeof formData.configValue === 'boolean'"
              v-model="formData.configValue"
            />
            <!-- 数字 -->
            <el-input-number
              v-else-if="typeof formData.configValue === 'number'"
              v-model="formData.configValue"
            />
            <!-- 字符串 -->
            <el-input
              v-else
              v-model="formData.configValue"
              type="textarea"
              :rows="3"
            />
          </template>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import {
  getAllConfigs,
  updateConfig,
  type BusinessConfig
} from '@/api/businessConfig'
import { formatDateTime } from '@/utils/date'

const loading = ref(false)
const configs = ref<BusinessConfig[]>([])
const filterCategory = ref('')

// 对话框相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const editMode = ref<'visual' | 'json'>('visual')
const jsonString = ref('')

// 表单数据
const formData = reactive<Partial<BusinessConfig>>({
  configKey: '',
  configValue: null,
  configCategory: '',
  description: ''
})

// 加载配置列表
const loadConfigs = async () => {
  loading.value = true
  try {
    const res = await getAllConfigs(filterCategory.value || undefined) as any
    // 过滤掉AI相关配置（这些配置在AI配置页面管理）
    const aiConfigKeys = ['ai_field_mapping', 'ai_prompt_config', 'ai_model_config']
    configs.value = (res || []).filter((config: BusinessConfig) =>
      !aiConfigKeys.includes(config.configKey)
    )
  } catch (error) {
    console.error('加载配置列表失败:', error)
    ElMessage.error('加载配置列表失败')
  } finally {
    loading.value = false
  }
}

// 获取类别标签类型
const getCategoryTag = (category: string) => {
  const map: Record<string, string> = {
    field_mapping: 'primary',
    default_values: 'success',
    business_rules: 'warning',
    other: 'info'
  }
  return map[category] || 'info'
}

// 获取类别标签文本
const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    field_mapping: '字段映射',
    default_values: '默认值',
    business_rules: '业务规则',
    other: '其他'
  }
  return map[category] || category
}

// 判断是否为JSON对象
const isJsonObject = (value: any) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// 格式化值显示
const formatValue = (value: any) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// 编辑配置
const handleEdit = (config: BusinessConfig) => {
  formData.configKey = config.configKey
  formData.configValue = JSON.parse(JSON.stringify(config.configValue)) // 深拷贝
  formData.configCategory = config.configCategory
  formData.description = config.description

  if (isJsonObject(config.configValue)) {
    editMode.value = 'visual'
    jsonString.value = JSON.stringify(config.configValue, null, 2)
  }

  dialogVisible.value = true
}

// 监听JSON编辑模式的切换
watch(editMode, (newMode) => {
  if (newMode === 'json' && isJsonObject(formData.configValue)) {
    jsonString.value = JSON.stringify(formData.configValue, null, 2)
  } else if (newMode === 'visual' && jsonString.value) {
    try {
      formData.configValue = JSON.parse(jsonString.value)
    } catch (error) {
      ElMessage.error('JSON格式错误')
    }
  }
})

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 如果是JSON编辑模式，先同步到formData
    if (editMode.value === 'json' && isJsonObject(formData.configValue)) {
      try {
        formData.configValue = JSON.parse(jsonString.value)
      } catch (error) {
        ElMessage.error('JSON格式错误，请检查')
        submitting.value = false
        return
      }
    }

    await updateConfig({
      configKey: formData.configKey!,
      configValue: formData.configValue
    })

    ElMessage.success('配置已更新')
    dialogVisible.value = false
    loadConfigs()
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formData.configKey = ''
  formData.configValue = null
  formData.configCategory = ''
  formData.description = ''
  jsonString.value = ''
  editMode.value = 'visual'
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.business-config-container {
  .header-card {
    margin-bottom: 16px;

    .header-content {
      h2 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .config-value-cell {
    pre {
      margin: 0;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      max-height: 200px;
      overflow: auto;
    }
  }

  .json-editor {
    width: 100%;

    .visual-editor {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 16px;
      background: #f5f7fa;
    }
  }
}
</style>
