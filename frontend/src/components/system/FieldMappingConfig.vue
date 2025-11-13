<template>
  <div class="field-mapping-config">
    <div class="header">
      <div class="info">
        <h3>AI字段映射配置</h3>
        <p>配置AI识别结果如何自动填充到客户字段，可以添加/删除/启用/禁用任意字段</p>
      </div>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加字段映射
      </el-button>
    </div>

    <el-alert
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px">
          <el-icon><InfoFilled /></el-icon>
          <span>配置说明</span>
        </div>
      </template>
      <ul style="margin: 8px 0; padding-left: 20px">
        <li><strong>AI字段路径</strong>：AI分析结果中的字段路径，如 customerProfile.wechatNickname</li>
        <li><strong>数据库字段</strong>：要填充到数据库的字段名，如 wechatNickname</li>
        <li><strong>启用状态</strong>：关闭后该字段不会被AI自动填充</li>
        <li><strong>覆盖模式</strong>：开启后，即使字段已有值也会被AI结果覆盖</li>
      </ul>
    </el-alert>

    <el-table
      :data="fieldMappings"
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="60" />

      <el-table-column prop="aiField" label="AI字段路径" min-width="200">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">{{ row.aiField }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="dbField" label="数据库字段" width="150">
        <template #default="{ row }">
          <el-tag>{{ row.dbField }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="字段说明" min-width="200" />

      <el-table-column label="启用状态" width="100" align="center">
        <template #default="{ row, $index }">
          <el-switch
            v-model="row.enabled"
            @change="toggleFieldEnabled($index, row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="覆盖模式" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.overwrite ? 'warning' : 'info'" size="small">
            {{ row.overwrite ? '覆盖' : '保留' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            link
            @click="editField($index, row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            link
            @click="deleteField($index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-actions">
      <el-button
        type="success"
        :loading="saving"
        @click="saveAllMappings"
      >
        保存所有配置
      </el-button>
      <el-button @click="loadFieldMappings">刷新</el-button>
      <span class="hint">修改后需要点击"保存所有配置"才会生效</span>
    </div>

    <!-- 添加/编辑字段对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingIndex === -1 ? '添加字段映射' : '编辑字段映射'"
      width="600px"
    >
      <el-form :model="fieldForm" label-width="120px" :rules="fieldRules" ref="fieldFormRef">
        <el-form-item label="AI字段路径" required prop="aiField">
          <el-input
            v-model="fieldForm.aiField"
            placeholder="如：customerProfile.wechatNickname"
          >
            <template #prepend>analysisResult.</template>
          </el-input>
          <div class="form-hint">从AI分析结果中读取的字段路径（支持嵌套，用.分隔）</div>
        </el-form-item>

        <el-form-item label="数据库字段" required prop="dbField">
          <el-input
            v-model="fieldForm.dbField"
            placeholder="如：wechatNickname"
          />
          <div class="form-hint">Customer表中的字段名</div>
        </el-form-item>

        <el-form-item label="字段说明" required prop="description">
          <el-input
            v-model="fieldForm.description"
            placeholder="如：微信昵称（从聊天截图识别）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="fieldForm.enabled" />
          <span style="margin-left: 12px; color: #909399; font-size: 13px">
            关闭后该字段不会被AI自动填充
          </span>
        </el-form-item>

        <el-form-item label="覆盖模式">
          <el-switch v-model="fieldForm.overwrite" />
          <span style="margin-left: 12px; color: #909399; font-size: 13px">
            开启后，即使字段已有值也会被覆盖
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddField">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, InfoFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface FieldMapping {
  aiField: string
  dbField: string
  enabled: boolean
  overwrite: boolean
  description: string
}

// 数据
const fieldMappings = ref<FieldMapping[]>([])
const loading = ref(false)
const saving = ref(false)

// 对话框
const showAddDialog = ref(false)
const editingIndex = ref(-1)
const fieldFormRef = ref()

const fieldForm = ref<FieldMapping>({
  aiField: '',
  dbField: '',
  enabled: true,
  overwrite: true,
  description: '',
})

const fieldRules = {
  aiField: [{ required: true, message: '请输入AI字段路径', trigger: 'blur' }],
  dbField: [{ required: true, message: '请输入数据库字段名', trigger: 'blur' }],
  description: [{ required: true, message: '请输入字段说明', trigger: 'blur' }],
}

// 加载字段映射配置
async function loadFieldMappings() {
  loading.value = true
  try {
    const data = await request.get('/business-config/ai_field_mapping')
    if (data && data.configValue) {
      fieldMappings.value = data.configValue
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

// 切换字段启用状态
async function toggleFieldEnabled(index: number, row: FieldMapping) {
  // 状态已经改变，只需提示用户保存
  ElMessage.info('请点击"保存所有配置"按钮使更改生效')
}

// 编辑字段
function editField(index: number, row: FieldMapping) {
  editingIndex.value = index
  fieldForm.value = { ...row }
  showAddDialog.value = true
}

// 删除字段
async function deleteField(index: number) {
  await ElMessageBox.confirm('确定删除此字段映射吗？', '提示', {
    type: 'warning',
  })

  fieldMappings.value.splice(index, 1)
  ElMessage.info('请点击"保存所有配置"按钮使删除生效')
}

// 确认添加/编辑字段
async function confirmAddField() {
  if (!fieldFormRef.value) return

  await fieldFormRef.value.validate()

  if (editingIndex.value === -1) {
    // 添加新字段
    fieldMappings.value.push({ ...fieldForm.value })
    ElMessage.success('字段已添加，请点击"保存所有配置"')
  } else {
    // 编辑现有字段
    fieldMappings.value[editingIndex.value] = { ...fieldForm.value }
    ElMessage.success('字段已修改，请点击"保存所有配置"')
  }

  showAddDialog.value = false
  resetFieldForm()
}

// 重置表单
function resetFieldForm() {
  editingIndex.value = -1
  fieldForm.value = {
    aiField: '',
    dbField: '',
    enabled: true,
    overwrite: true,
    description: '',
  }
}

// 保存所有映射配置
async function saveAllMappings() {
  saving.value = true
  try {
    await request.put('/business-config', {
      configKey: 'ai_field_mapping',
      configValue: fieldMappings.value,
    })
    ElMessage.success('配置保存成功，AI识别将使用新配置')
    loadFieldMappings()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadFieldMappings()
})
</script>

<style lang="scss" scoped>
.field-mapping-config {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .info {
      h3 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .footer-actions {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 12px;

    .hint {
      color: #909399;
      font-size: 13px;
    }
  }

  .form-hint {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
  }
}
</style>
