<template>
  <div class="target-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon style="margin-right: 8px"><Flag /></el-icon>
            销售目标管理
          </span>
          <div class="header-actions">
            <el-button @click="handleBackToWorkspace">
              <el-icon><ArrowLeft /></el-icon>
              返回工作台
            </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增目标
            </el-button>
            <el-button @click="handleRefreshAll">
              <el-icon><Refresh /></el-icon>
              刷新所有目标数据
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="query-form">
        <el-form-item label="目标类型">
          <el-select v-model="queryParams.targetType" placeholder="全部" clearable style="width: 150px">
            <el-option label="月度目标" value="monthly" />
            <el-option label="季度目标" value="quarterly" />
            <el-option label="年度目标" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchTargetList">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="targetList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="销售人员" width="120" />
        <el-table-column prop="targetType" label="目标类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTargetTypeTag(row.targetType)">
              {{ getTargetTypeName(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标金额" width="150">
          <template #default="{ row }">
            <span style="color: #606266">¥{{ (row.targetAmount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际金额" width="150">
          <template #default="{ row }">
            <span :style="{ color: (row.actualAmount || 0) >= (row.targetAmount || 0) ? '#67C23A' : '#E6A23C' }">
              ¥{{ (row.actualAmount || 0).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="金额进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.min(row.amountProgress || 0, 100)"
              :status="getProgressStatus(row.amountProgress || 0)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column label="订单目标" width="120" align="center">
          <template #default="{ row }">
            {{ row.actualCount || 0 }} / {{ row.targetCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="订单进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.min(row.countProgress || 0, 100)"
              :status="getProgressStatus(row.countProgress || 0)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120">
          <template #default="{ row }">
            {{ dayjs(row.startDate).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120">
          <template #default="{ row }">
            {{ dayjs(row.endDate).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="success" size="small" @click="handleRefresh(row.id)">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="销售人员" prop="userId">
          <el-select v-model="formData.userId" placeholder="请选择销售人员" style="width: 100%">
            <el-option
              v-for="user in salesList"
              :key="user.id"
              :label="user.realName"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="formData.targetType" placeholder="请选择目标类型" style="width: 100%">
            <el-option label="月度目标" value="月度目标" />
            <el-option label="季度目标" value="季度目标" />
            <el-option label="年度目标" value="年度目标" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number
            v-model="formData.targetAmount"
            :min="0"
            :step="1000"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单目标" prop="targetCount">
          <el-input-number
            v-model="formData.targetCount"
            :min="0"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="目标月份" prop="targetMonth">
          <el-date-picker
            v-model="formData.targetMonth"
            type="month"
            placeholder="选择目标月份"
            style="width: 100%"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Flag, Plus, Refresh, Search, Edit, ArrowLeft, Delete,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getTargetList,
  createTarget,
  updateTarget,
  deleteTarget,
  refreshTargetActual,
  refreshAllTargetActual,
  type SalesTarget,
  type CreateTargetParams,
  type UpdateTargetParams,
} from '@/api/target'
import { getUserList } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const targetList = ref<SalesTarget[]>([])
const salesList = ref<any[]>([])

const queryParams = reactive({
  targetType: '',
  status: undefined as number | undefined,
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑销售目标' : '新增销售目标'))
const isEdit = ref(false)
const editId = ref<number>()
const submitting = ref(false)

const formRef = ref<FormInstance>()
const formData = reactive({
  userId: undefined as number | undefined,
  targetType: '',
  targetAmount: 0,
  targetCount: 0,
  targetMonth: '',
  status: 1,
  remark: '',
})

const formRules: FormRules = {
  userId: [{ required: true, message: '请选择销售人员', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择目标类型', trigger: 'change' }],
  targetAmount: [{ required: true, message: '请输入目标金额', trigger: 'blur' }],
  targetCount: [{ required: true, message: '请输入订单目标', trigger: 'blur' }],
  targetMonth: [{ required: true, message: '请选择目标月份', trigger: 'change' }],
}

// 返回工作台
const handleBackToWorkspace = () => {
  router.push({ name: 'Workspace' })
}

// 获取销售目标列表
const fetchTargetList = async () => {
  console.log('fetchTargetList 开始执行...')
  loading.value = true
  try {
    console.log('调用 getTargetList API...')
    let data = await getTargetList()
    console.log('✅ API返回的原始数据:', data)
    console.log('数据类型:', typeof data, '是否为数组:', Array.isArray(data))
    console.log('数据长度:', data?.length)

    // 前端过滤
    if (queryParams.targetType) {
      console.log('应用targetType过滤:', queryParams.targetType)
      data = data.filter(item => item.targetType === queryParams.targetType)
    }
    if (queryParams.status !== undefined) {
      console.log('应用status过滤:', queryParams.status)
      data = data.filter(item => item.status === queryParams.status)
    }

    targetList.value = data
    console.log('✅ 最终设置到targetList的数据:', targetList.value)
    console.log('targetList长度:', targetList.value.length)
  } catch (error) {
    console.error('❌ 获取销售目标列表失败:', error)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    ElMessage.error('获取销售目标列表失败')
  } finally {
    loading.value = false
    console.log('fetchTargetList 执行完成')
  }
}

// 获取销售人员列表
const fetchSalesList = async () => {
  try {
    const data = await getUserList({
      page: 1,
      pageSize: 1000,
      roleCode: 'sales', // 销售角色
    })
    salesList.value = data.list || []
  } catch (error) {
    console.error('Failed to fetch sales list:', error)
  }
}

// 新增目标
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  formData.targetMonth = dayjs().format('YYYY-MM')
  dialogVisible.value = true
}

// 编辑目标
const handleEdit = (row: SalesTarget) => {
  isEdit.value = true
  editId.value = row.id
  formData.userId = row.userId
  formData.targetType = row.targetType
  formData.targetAmount = row.targetAmount
  formData.targetCount = row.targetCount
  // 从开始日期提取月份
  formData.targetMonth = dayjs(row.startDate).format('YYYY-MM')
  formData.status = row.status
  formData.remark = row.remark
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 根据月份计算开始和结束日期
    const monthStart = dayjs(formData.targetMonth).startOf('month')
    const monthEnd = dayjs(formData.targetMonth).endOf('month')

    submitting.value = true
    try {
      if (isEdit.value && editId.value) {
        const params: UpdateTargetParams = {
          targetAmount: formData.targetAmount,
          targetCount: formData.targetCount,
          startDate: monthStart.format('YYYY-MM-DD'),
          endDate: monthEnd.format('YYYY-MM-DD'),
          status: formData.status,
          remark: formData.remark,
        }
        await updateTarget(editId.value, params)
        ElMessage.success('更新成功')
      } else {
        const params: CreateTargetParams = {
          userId: formData.userId!,
          targetType: formData.targetType,
          targetAmount: formData.targetAmount,
          targetCount: formData.targetCount,
          startDate: monthStart.format('YYYY-MM-DD'),
          endDate: monthEnd.format('YYYY-MM-DD'),
          remark: formData.remark,
        }
        await createTarget(params)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchTargetList()
    } catch (error) {
      console.error('Failed to submit target:', error)
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

// 刷新单个目标数据
const handleRefresh = async (id: number) => {
  try {
    await refreshTargetActual(id)
    ElMessage.success('刷新成功')
    fetchTargetList()
  } catch (error) {
    console.error('Failed to refresh target:', error)
    ElMessage.error('刷新失败')
  }
}

// 刷新所有目标数据
const handleRefreshAll = async () => {
  try {
    await refreshAllTargetActual()
    ElMessage.success('刷新所有目标数据成功')
    fetchTargetList()
  } catch (error) {
    console.error('Failed to refresh all targets:', error)
    ElMessage.error('刷新失败')
  }
}

// 删除目标
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.userName}"的${getTargetTypeName(row.targetType)}吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteTarget(row.id)
    ElMessage.success('删除成功')
    fetchTargetList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete target:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置查询条件
const handleReset = () => {
  queryParams.targetType = ''
  queryParams.status = undefined
  fetchTargetList()
}

// 重置表单
const resetForm = () => {
  formData.userId = undefined
  formData.targetType = ''
  formData.targetAmount = 0
  formData.targetCount = 0
  formData.targetMonth = ''
  formData.status = 1
  formData.remark = ''
  formRef.value?.clearValidate()
}

// 获取目标类型标签
const getTargetTypeTag = (type: string) => {
  const map: Record<string, string> = {
    'monthly': 'primary',
    'quarterly': 'success',
    'yearly': 'warning',
  }
  return map[type] || 'info'
}

// 获取目标类型名称
const getTargetTypeName = (type: string) => {
  const map: Record<string, string> = {
    'monthly': '月度目标',
    'quarterly': '季度目标',
    'yearly': '年度目标',
  }
  return map[type] || type
}

// 获取状态标签
const getStatusTag = (status: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
  }
  return map[status] || 'info'
}

// 获取状态文字
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '已取消',
    1: '进行中',
    2: '已完成',
  }
  return map[status] || '未知'
}

// 获取进度条状态
const getProgressStatus = (progress: number) => {
  if (progress >= 100) return 'success'
  if (progress >= 80) return 'warning'
  return ''
}

onMounted(async () => {
  console.log('=================================')
  console.log('=== Target Management 组件已挂载 ===')
  console.log('=================================')
  console.log('当前路由:', window.location.href)
  console.log('开始加载数据...')
  console.log('')

  try {
    console.log('步骤1: 调用 fetchTargetList...')
    await fetchTargetList()
    console.log('步骤1: fetchTargetList 完成')
    console.log('')

    console.log('步骤2: 调用 fetchSalesList...')
    await fetchSalesList()
    console.log('步骤2: fetchSalesList 完成')
    console.log('')

    console.log('✅ 数据加载完成')
    console.log('=================================')
  } catch (error) {
    console.error('❌ 数据加载失败:', error)
    console.error('错误详情:', error)
    console.log('=================================')
  }
})
</script>

<style scoped lang="scss">
.target-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .query-form {
    margin-bottom: 16px;
  }
}
</style>
