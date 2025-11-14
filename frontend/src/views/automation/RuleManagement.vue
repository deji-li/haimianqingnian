<template>
  <div class="automation-container">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div>
          <h2>自动化工作流</h2>
          <p class="subtitle">自动化处理客户分配、提醒、标签等任务</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreate" v-permission="'automation:create'">
            <el-icon><Plus /></el-icon>
            创建规则
          </el-button>
          <el-button @click="handleViewLogs">
            <el-icon><Document /></el-icon>
            执行日志
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 筛选栏 -->
    <el-card shadow="never" class="filter-card">
      <el-radio-group v-model="filterRuleType" @change="loadRules">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="auto_assign">自动分配</el-radio-button>
        <el-radio-button label="auto_remind">自动提醒</el-radio-button>
        <el-radio-button label="auto_tag">自动打标签</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 规则列表 -->
    <el-card shadow="never" v-loading="loading">
      <el-table :data="rules" stripe>
        <el-table-column prop="name" label="规则名称" width="200" />
        <el-table-column prop="ruleType" label="规则类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRuleTypeTag(row.ruleType)">
              {{ getRuleTypeLabel(row.ruleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="triggerType" label="触发类型" width="140">
          <template #default="{ row }">
            {{ getTriggerTypeLabel(row.triggerType) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleToggleStatus(row)"
              :disabled="!hasPermission('automation:update')"
            />
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" align="center" />
        <el-table-column prop="executionCount" label="执行次数" width="100" align="center" />
        <el-table-column prop="lastExecutionTime" label="最后执行时间" width="180">
          <template #default="{ row }">
            {{ row.lastExecutionTime ? formatDateTime(row.lastExecutionTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="'automation:update'">
              编辑
            </el-button>
            <el-button link type="warning" @click="handleTest(row)" v-if="row.ruleType === 'auto_assign'">
              测试
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-permission="'automation:delete'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑规则对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '创建自动化规则' : '编辑自动化规则'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="formData.ruleType" placeholder="请选择规则类型" @change="handleRuleTypeChange">
            <el-option label="自动分配" value="auto_assign" />
            <el-option label="自动提醒" value="auto_remind" />
            <el-option label="自动打标签" value="auto_tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发类型" prop="triggerType">
          <el-select v-model="formData.triggerType" placeholder="请选择触发类型">
            <el-option label="新客户创建时" value="new_customer" />
            <el-option label="到达回访时间" value="follow_time" />
            <el-option label="长时间未跟进" value="no_follow" />
            <el-option label="意向变化" value="intent_change" />
          </el-select>
        </el-form-item>

        <!-- 触发条件 -->
        <el-form-item label="触发条件" v-if="needsTriggerConditions">
          <el-form-item label="天数" v-if="formData.triggerType === 'no_follow'" style="margin-bottom: 0;">
            <el-input-number v-model="triggerConditions.days" :min="1" :max="365" />
            <span style="margin-left: 8px; color: #909399;">天未跟进时触发</span>
          </el-form-item>
        </el-form-item>

        <!-- 执行动作 - 自动分配 -->
        <template v-if="formData.ruleType === 'auto_assign'">
          <el-form-item label="分配策略" prop="actions.strategy">
            <el-radio-group v-model="actions.strategy">
              <el-radio label="round_robin">轮询分配</el-radio>
              <el-radio label="random">随机分配</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标销售" prop="actions.salesIds">
            <el-select v-model="actions.salesIds" multiple placeholder="请选择销售人员">
              <el-option
                v-for="user in salesList"
                :key="user.id"
                :label="user.realName || user.username"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <!-- 执行动作 - 自动提醒 -->
        <template v-if="formData.ruleType === 'auto_remind'">
          <el-form-item label="提醒方式" prop="actions.method">
            <el-checkbox-group v-model="actions.methods">
              <el-checkbox label="system">系统通知</el-checkbox>
              <el-checkbox label="email">邮件通知</el-checkbox>
              <el-checkbox label="sms">短信通知</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="提醒内容" prop="actions.message">
            <el-input
              v-model="actions.message"
              type="textarea"
              :rows="3"
              placeholder="请输入提醒内容"
            />
          </el-form-item>
        </template>

        <!-- 执行动作 - 自动打标签 -->
        <template v-if="formData.ruleType === 'auto_tag'">
          <el-form-item label="标签名称" prop="actions.tagName">
            <el-input v-model="actions.tagName" placeholder="请输入标签名称" />
          </el-form-item>
        </template>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="formData.priority" :min="0" :max="100" />
          <span style="margin-left: 8px; color: #909399;">数字越大优先级越高</span>
        </el-form-item>

        <el-form-item label="规则描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 执行日志对话框 -->
    <el-dialog v-model="logDialogVisible" title="执行日志" width="1000px">
      <el-table :data="logs" stripe v-loading="logLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="规则" width="150">
          <template #default="{ row }">
            {{ row.rule?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100" />
        <el-table-column prop="targetId" label="目标ID" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行结果" min-width="200">
          <template #default="{ row }">
            <pre style="margin: 0; font-size: 12px;">{{ JSON.stringify(row.result || {}, null, 2) }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="耗时(ms)" width="100" align="right" />
        <el-table-column prop="createTime" label="执行时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog v-model="testDialogVisible" title="测试自动分配" width="500px">
      <el-form label-width="100px">
        <el-form-item label="客户ID">
          <el-input-number v-model="testCustomerId" :min="1" placeholder="请输入客户ID" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="testDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTestSubmit" :loading="testing">
          执行测试
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Document } from '@element-plus/icons-vue'
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
  getLogs,
  testAutoAssign,
  type AutomationRule,
  type AutomationLog,
  type CreateRuleDto
} from '@/api/automation'
import { getUserList, type User } from '@/api/user'
import { formatDateTime } from '@/utils/date'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const loading = ref(false)
const rules = ref<AutomationRule[]>([])
const filterRuleType = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<Partial<CreateRuleDto>>({
  name: '',
  ruleType: undefined,
  triggerType: undefined,
  priority: 0,
  description: ''
})

// 触发条件
const triggerConditions = reactive<Record<string, any>>({
  days: 7
})

// 执行动作
const actions = reactive<Record<string, any>>({
  strategy: 'round_robin',
  salesIds: [],
  methods: ['system'],
  message: '',
  tagName: ''
})

const currentEditId = ref<number>()

// 销售人员列表
const salesList = ref<User[]>([])

// 日志相关
const logDialogVisible = ref(false)
const logs = ref<AutomationLog[]>([])
const logLoading = ref(false)

// 测试相关
const testDialogVisible = ref(false)
const testCustomerId = ref<number>()
const testing = ref(false)
const currentTestRule = ref<AutomationRule>()

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  triggerType: [{ required: true, message: '请选择触发类型', trigger: 'change' }],
  'actions.salesIds': [
    {
      validator: (rule, value, callback) => {
        if (formData.ruleType === 'auto_assign' && (!value || value.length === 0)) {
          callback(new Error('请选择目标销售'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 计算属性
const needsTriggerConditions = computed(() => {
  return formData.triggerType === 'no_follow'
})

// 权限检查
const hasPermission = (permission: string) => {
  return userStore.hasPermission(permission)
}

// 加载规则列表
const loadRules = async () => {
  loading.value = true
  try {
    const res = await getRules(filterRuleType.value || undefined) as any
    rules.value = res || []
  } catch (error) {
    console.error('加载规则列表失败:', error)
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

// 加载销售人员列表
const loadSalesList = async () => {
  try {
    const res = await getUserList({ roleId: 2 }) as any // 假设角色ID=2是销售
    salesList.value = res.list || res || []
  } catch (error) {
    console.error('加载销售人员列表失败:', error)
  }
}

// 获取规则类型标签
const getRuleTypeTag = (type: string) => {
  const map: Record<string, string> = {
    auto_assign: 'primary',
    auto_remind: 'success',
    auto_tag: 'warning'
  }
  return map[type] || ''
}

// 获取规则类型标签文本
const getRuleTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    auto_assign: '自动分配',
    auto_remind: '自动提醒',
    auto_tag: '自动打标签'
  }
  return map[type] || type
}

// 获取触发类型标签文本
const getTriggerTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    new_customer: '新客户创建时',
    follow_time: '到达回访时间',
    no_follow: '长时间未跟进',
    intent_change: '意向变化'
  }
  return map[type] || type
}

// 创建规则
const handleCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

// 编辑规则
const handleEdit = (rule: AutomationRule) => {
  dialogMode.value = 'edit'
  currentEditId.value = rule.id

  // 填充表单数据
  formData.name = rule.name
  formData.ruleType = rule.ruleType
  formData.triggerType = rule.triggerType
  formData.priority = rule.priority
  formData.description = rule.description

  // 填充触发条件
  if (rule.triggerConditions) {
    Object.assign(triggerConditions, rule.triggerConditions)
  }

  // 填充执行动作
  if (rule.actions) {
    Object.assign(actions, rule.actions)
  }

  dialogVisible.value = true
}

// 切换规则状态
const handleToggleStatus = async (rule: AutomationRule) => {
  try {
    await toggleRule(rule.id)
    ElMessage.success(`规则已${rule.status === 'enabled' ? '启用' : '禁用'}`)
    loadRules()
  } catch (error) {
    console.error('切换规则状态失败:', error)
    ElMessage.error('操作失败')
    // 回滚状态
    rule.status = rule.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

// 删除规则
const handleDelete = (rule: AutomationRule) => {
  ElMessageBox.confirm(`确定要删除规则"${rule.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRule(rule.id)
      ElMessage.success('删除成功')
      loadRules()
    } catch (error) {
      console.error('删除规则失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 规则类型变化
const handleRuleTypeChange = () => {
  // 重置执行动作
  actions.strategy = 'round_robin'
  actions.salesIds = []
  actions.methods = ['system']
  actions.message = ''
  actions.tagName = ''
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data: CreateRuleDto = {
        name: formData.name!,
        ruleType: formData.ruleType!,
        triggerType: formData.triggerType!,
        priority: formData.priority || 0,
        description: formData.description,
        triggerConditions: needsTriggerConditions.value ? { ...triggerConditions } : undefined,
        actions: { ...actions }
      }

      if (dialogMode.value === 'create') {
        await createRule(data)
        ElMessage.success('创建成功')
      } else {
        await updateRule(currentEditId.value!, data)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      loadRules()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.ruleType = undefined
  formData.triggerType = undefined
  formData.priority = 0
  formData.description = ''

  triggerConditions.days = 7

  actions.strategy = 'round_robin'
  actions.salesIds = []
  actions.methods = ['system']
  actions.message = ''
  actions.tagName = ''

  currentEditId.value = undefined
  formRef.value?.clearValidate()
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 查看日志
const handleViewLogs = async () => {
  logDialogVisible.value = true
  logLoading.value = true
  try {
    const res = await getLogs(undefined, 100) as any
    logs.value = res || []
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    logLoading.value = false
  }
}

// 测试
const handleTest = (rule: AutomationRule) => {
  currentTestRule.value = rule
  testCustomerId.value = undefined
  testDialogVisible.value = true
}

// 执行测试
const handleTestSubmit = async () => {
  if (!testCustomerId.value) {
    ElMessage.warning('请输入客户ID')
    return
  }

  testing.value = true
  try {
    const res = await testAutoAssign(testCustomerId.value) as any
    if (res.success) {
      ElMessage.success(`测试成功！客户已分配给销售ID: ${res.assignedSalesId}`)
      testDialogVisible.value = false
    } else {
      ElMessage.warning('测试失败，未找到匹配的规则或销售')
    }
  } catch (error) {
    console.error('测试失败:', error)
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadRules()
  loadSalesList()
})
</script>

<style scoped lang="scss">
.automation-container {
  .header-card {
    margin-bottom: 16px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

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

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }
}
</style>
