<template>
  <div class="scheme-config-container">
    <!-- 页面头部 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">提成方案配置</h2>
          <p class="page-desc">管理销售提成计算方案，支持多种计算类型和灵活的匹配条件</p>
        </div>
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增方案
        </el-button>
      </div>
    </el-card>

    <!-- 方案列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="schemes"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="方案名称" min-width="150">
          <template #default="{ row }">
            <div class="scheme-name">
              <span class="name-text">{{ row.name }}</span>
              <el-tag v-if="row.priority === 0" size="small" type="danger">最高优先级</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="计算类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column label="规则概览" min-width="200">
          <template #default="{ row }">
            <div class="rule-summary">{{ getRuleSummary(row) }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="{ row }">
            <el-tag>{{ row.priority }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>

        <el-form-item label="方案名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入方案名称" />
        </el-form-item>

        <el-form-item label="方案描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入方案描述"
          />
        </el-form-item>

        <el-form-item label="计算类型" prop="type">
          <el-select v-model="formData.type" @change="handleTypeChange">
            <el-option label="固定金额" value="fixed" />
            <el-option label="百分比" value="percentage" />
            <el-option label="阶梯制" value="tiered" />
            <el-option label="自定义公式" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="formData.priority" :min="0" :max="100" />
          <span class="form-tip">数字越小优先级越高，0为最高优先级</span>
        </el-form-item>

        <!-- 计算规则 -->
        <el-divider content-position="left">计算规则</el-divider>

        <!-- 固定金额规则 -->
        <template v-if="formData.type === 'fixed'">
          <el-form-item label="固定金额" prop="rules.amount">
            <el-input-number
              v-model="formData.rules.amount"
              :min="0"
              :precision="2"
              placeholder="提成金额"
            />
            <span class="form-tip">元</span>
          </el-form-item>
        </template>

        <!-- 百分比规则 -->
        <template v-if="formData.type === 'percentage'">
          <el-form-item label="提成比例" prop="rules.percentage">
            <el-input-number
              v-model="formData.rules.percentage"
              :min="0"
              :max="100"
              :precision="2"
              placeholder="百分比"
            />
            <span class="form-tip">%</span>
          </el-form-item>
          <el-form-item label="最小订单金额">
            <el-input-number
              v-model="formData.rules.minAmount"
              :min="0"
              :precision="2"
              placeholder="可选"
            />
            <span class="form-tip">元（可选，用于限制适用范围）</span>
          </el-form-item>
          <el-form-item label="最大订单金额">
            <el-input-number
              v-model="formData.rules.maxAmount"
              :min="0"
              :precision="2"
              placeholder="可选"
            />
            <span class="form-tip">元（可选，用于限制适用范围）</span>
          </el-form-item>
        </template>

        <!-- 阶梯制规则 -->
        <template v-if="formData.type === 'tiered'">
          <el-form-item label="阶梯设置">
            <div class="tiered-rules">
              <div
                v-for="(tier, index) in formData.rules.tiers"
                :key="index"
                class="tier-item"
              >
                <el-input-number
                  v-model="tier.minAmount"
                  :min="0"
                  :precision="2"
                  placeholder="最小金额"
                  style="width: 140px"
                />
                <span class="tier-separator">~</span>
                <el-input-number
                  v-model="tier.maxAmount"
                  :min="0"
                  :precision="2"
                  placeholder="最大金额（可空）"
                  style="width: 140px"
                />
                <span class="tier-separator">提成</span>
                <el-input-number
                  v-model="tier.percentage"
                  :min="0"
                  :max="100"
                  :precision="2"
                  placeholder="百分比"
                  style="width: 120px"
                />
                <span class="tier-unit">%</span>
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeTier(index)"
                />
              </div>
              <el-button type="primary" :icon="Plus" @click="addTier">
                添加阶梯
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 自定义公式规则 -->
        <template v-if="formData.type === 'custom'">
          <el-form-item label="计算公式" prop="rules.formula">
            <el-input
              v-model="formData.rules.formula"
              type="textarea"
              :rows="3"
              placeholder="例如: orderAmount * 0.1 + 100"
            />
            <span class="form-tip">
              可用变量: orderAmount (订单金额)
            </span>
          </el-form-item>
        </template>

        <!-- 匹配条件 -->
        <el-divider content-position="left">匹配条件（可选）</el-divider>

        <el-form-item label="订单标签">
          <el-select
            v-model="formData.conditions.orderTags"
            multiple
            placeholder="选择订单标签"
            style="width: 100%"
          >
            <el-option label="普通订单" value="normal" />
            <el-option label="活动订单" value="promotion" />
            <el-option label="高端订单" value="premium" />
            <el-option label="新课程" value="new_course" />
            <el-option label="续费订单" value="renewal" />
          </el-select>
          <span class="form-tip">不选择则匹配所有标签</span>
        </el-form-item>

        <el-form-item label="课程名称">
          <el-input
            v-model="coursesInput"
            placeholder="输入课程名称，多个用逗号分隔"
          />
          <span class="form-tip">例如: 英语课程,数学课程</span>
        </el-form-item>

        <el-form-item label="订单金额范围">
          <el-col :span="11">
            <el-input-number
              v-model="formData.conditions.minOrderAmount"
              :min="0"
              :precision="2"
              placeholder="最小金额"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="2" style="text-align: center">~</el-col>
          <el-col :span="11">
            <el-input-number
              v-model="formData.conditions.maxOrderAmount"
              :min="0"
              :precision="2"
              placeholder="最大金额"
              style="width: 100%"
            />
          </el-col>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
          <span class="form-tip">禁用后该方案不会被使用</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getSchemes, createScheme, updateScheme, deleteScheme } from '@/api/commission'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const schemes = ref<any[]>([])
const coursesInput = ref('')

const formData = reactive<any>({
  id: null,
  name: '',
  description: '',
  type: 'fixed',
  priority: 10,
  status: 1,
  rules: {
    amount: 0,
    percentage: 0,
    minAmount: undefined,
    maxAmount: undefined,
    tiers: [],
    formula: '',
    variables: {}
  },
  conditions: {
    orderTags: [],
    courses: [],
    minOrderAmount: undefined,
    maxOrderAmount: undefined,
    campusIds: [],
    departmentIds: []
  }
})

const dialogTitle = computed(() => {
  return formData.id ? '编辑提成方案' : '新增提成方案'
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计算类型', trigger: 'change' }],
  priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }],
}

// 获取类型标签颜色
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    fixed: 'success',
    percentage: 'primary',
    tiered: 'warning',
    custom: 'info'
  }
  return typeMap[type] || ''
}

// 获取类型名称
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    fixed: '固定金额',
    percentage: '百分比',
    tiered: '阶梯制',
    custom: '自定义'
  }
  return names[type] || type
}

// 获取规则概览
const getRuleSummary = (row: any) => {
  const { type, rules } = row

  if (type === 'fixed') {
    return `固定提成 ¥${rules.amount || 0}`
  }

  if (type === 'percentage') {
    let summary = `提成 ${rules.percentage || 0}%`
    if (rules.minAmount || rules.maxAmount) {
      summary += ` (适用金额: ${rules.minAmount || 0}~${rules.maxAmount || '∞'})`
    }
    return summary
  }

  if (type === 'tiered') {
    const tierCount = rules.tiers?.length || 0
    return `${tierCount}个阶梯，根据订单金额计算`
  }

  if (type === 'custom') {
    return rules.formula || '自定义公式'
  }

  return '-'
}

// 获取方案列表
const fetchSchemes = async () => {
  loading.value = true
  try {
    const res = await getSchemes({ includeDisabled: true })
    schemes.value = res || []
  } catch (error) {
    ElMessage.error('获取方案列表失败')
  } finally {
    loading.value = false
  }
}

// 处理类型变化
const handleTypeChange = (type: string) => {
  // 重置规则
  if (type === 'fixed') {
    formData.rules = { amount: 0 }
  } else if (type === 'percentage') {
    formData.rules = {
      percentage: 0,
      minAmount: undefined,
      maxAmount: undefined
    }
  } else if (type === 'tiered') {
    formData.rules = {
      tiers: [
        { minAmount: 0, maxAmount: 10000, percentage: 5 },
        { minAmount: 10000, maxAmount: null, percentage: 8 }
      ]
    }
  } else if (type === 'custom') {
    formData.rules = { formula: '', variables: {} }
  }
}

// 添加阶梯
const addTier = () => {
  if (!formData.rules.tiers) {
    formData.rules.tiers = []
  }
  formData.rules.tiers.push({
    minAmount: 0,
    maxAmount: null,
    percentage: 0
  })
}

// 删除阶梯
const removeTier = (index: number) => {
  formData.rules.tiers.splice(index, 1)
}

// 新增方案
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑方案
const handleEdit = (row: any) => {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    priority: row.priority,
    status: row.status,
    rules: JSON.parse(JSON.stringify(row.rules)),
    conditions: row.conditions ? JSON.parse(JSON.stringify(row.conditions)) : {
      orderTags: [],
      courses: [],
      minOrderAmount: undefined,
      maxOrderAmount: undefined
    }
  })

  // 处理课程名称
  if (formData.conditions.courses && formData.conditions.courses.length > 0) {
    coursesInput.value = formData.conditions.courses.join(',')
  }

  dialogVisible.value = true
}

// 状态变更
const handleStatusChange = async (row: any) => {
  try {
    await updateScheme(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 删除方案
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除方案"${row.name}"吗？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    await deleteScheme(row.id)
    ElMessage.success('删除成功')
    await fetchSchemes()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 处理课程名称
      if (coursesInput.value) {
        formData.conditions.courses = coursesInput.value
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c)
      } else {
        formData.conditions.courses = []
      }

      // 清理空条件
      const conditions = { ...formData.conditions }
      Object.keys(conditions).forEach(key => {
        if (!conditions[key] || (Array.isArray(conditions[key]) && conditions[key].length === 0)) {
          delete conditions[key]
        }
      })

      const submitData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        rules: formData.rules,
        conditions: Object.keys(conditions).length > 0 ? conditions : null
      }

      if (formData.id) {
        await updateScheme(formData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createScheme(submitData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      await fetchSchemes()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.description = ''
  formData.type = 'fixed'
  formData.priority = 10
  formData.status = 1
  formData.rules = { amount: 0 }
  formData.conditions = {
    orderTags: [],
    courses: [],
    minOrderAmount: undefined,
    maxOrderAmount: undefined
  }
  coursesInput.value = ''
  formRef.value?.clearValidate()
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

onMounted(() => {
  fetchSchemes()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.scheme-config-container {
  padding: 20px;

  .header-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .page-title {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 600;
          color: var(--xhs-text-primary);
          background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-desc {
          margin: 0;
          color: var(--xhs-text-secondary);
          font-size: 14px;
        }
      }

      :deep(.el-button--primary) {
        @include xhs-button-primary;
      }
    }
  }

  .table-card {
    @include xhs-card;
    border: none;

    .scheme-name {
      display: flex;
      align-items: center;
      gap: 8px;

      .name-text {
        font-weight: 500;
      }
    }

    .rule-summary {
      color: var(--xhs-text-secondary);
      font-size: 13px;
    }
  }

  :deep(.el-dialog) {
    border-radius: var(--xhs-border-radius-base);

    .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--xhs-border-color);

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--xhs-text-primary);
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-divider {
      margin: 16px 0;

      .el-divider__text {
        font-weight: 600;
        color: var(--xhs-text-primary);
      }
    }

    .form-tip {
      margin-left: 12px;
      font-size: 12px;
      color: var(--xhs-text-tertiary);
    }

    .tiered-rules {
      width: 100%;

      .tier-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding: 12px;
        background: var(--xhs-bg-page);
        border-radius: 8px;

        .tier-separator {
          color: var(--xhs-text-secondary);
          font-size: 14px;
          padding: 0 4px;
        }

        .tier-unit {
          color: var(--xhs-text-secondary);
          margin-left: 4px;
        }
      }
    }
  }

  :deep(.el-table) {
    .el-button.is-link {
      padding: 4px 8px;
    }
  }
}
</style>
