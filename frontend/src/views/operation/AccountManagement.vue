<template>
  <div class="account-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>运���账号管理</h2>
        <p class="page-desc">管理各平台的运营账号信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加账号
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="平台类型">
          <el-select v-model="filterForm.platformType" placeholder="选择平台" clearable style="width: 150px">
            <el-option label="小红书" value="小红书" />
            <el-option label="抖音" value="抖音" />
            <el-option label="视频号" value="视频号" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="正常" value="正常" />
            <el-option label="风险" value="风险" />
            <el-option label="封号" value="封号" />
            <el-option label="掉号" value="掉号" />
          </el-select>
        </el-form-item>
        <el-form-item label="运营��员">
          <el-select
            v-model="filterForm.operatorId"
            placeholder="选择运营人员"
            clearable
            filterable
            style="width: 150px"
          >
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="filterForm.city" placeholder="选择城市" clearable style="width: 150px">
            <el-option label="广州" value="广州" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="北京" value="北京" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索账号名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账号列表 -->
    <el-card>
      <el-table v-loading="loading" :data="accountList" style="width: 100%">
        <el-table-column prop="platformType" label="平台类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformTagType(row.platformType)">
              {{ row.platformType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号名称" min-width="200" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="运营人员" width="120" />
        <el-table-column prop="campusName" label="所属校区" width="150" />
        <el-table-column prop="fansCount" label="粉丝数" width="100" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.fansCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalViews" label="总浏览量" width="120" sortable>
          <template #default="{ row }">
            {{ formatNumber(row.totalViews) }}
          </template>
        </el-table-column>
        <el-table-column prop="engagementRate" label="互动率" width="100" sortable>
          <template #default="{ row }">
            {{ row.engagementRate ? `${row.engagementRate}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleStatusChange(row)">
              {{ row.status === '正常' ? '标记异常' : '恢复正常' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button link type="info" @click="viewDailyReports(row)">日报</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 创建/编辑账号对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑账号' : '添加账号'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="平台类型" prop="platformType">
          <el-select v-model="form.platformType" placeholder="选择平台" style="width: 100%">
            <el-option label="小红书" value="小红书" />
            <el-option label="抖音" value="抖音" />
            <el-option label="视频号" value="视频号" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账号名称" />
        </el-form-item>
        <el-form-item label="账号链接">
          <el-input v-model="form.accountLink" placeholder="请输入账号链接（选填）" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select v-model="form.city" placeholder="选择城市" style="width: 100%">
            <el-option label="广州" value="广州" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="北京" value="北京" />
          </el-select>
        </el-form-item>
        <el-form-item label="运营人员" prop="operatorId">
          <el-select
            v-model="form.operatorId"
            placeholder="选择运营人员"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属校区" prop="campusId">
          <el-select v-model="form.campusId" placeholder="选择校区" style="width: 100%">
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.name"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="粉丝数">
          <el-input-number
            v-model="form.fansCount"
            :min="0"
            :max="999999999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总点赞量">
          <el-input-number
            v-model="form.totalLikes"
            :min="0"
            :max="999999999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="风险" value="风险" />
            <el-option label="封号" value="封号" />
            <el-option label="掉号" value="掉号" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 状态更新对话框 -->
    <el-dialog v-model="showStatusDialog" title="更新账号状态" width="400px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" placeholder="选择状态" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="风险" value="风险" />
            <el-option label="封号" value="封号" />
            <el-option label="掉号" value="掉号" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入状态变更原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmStatusChange">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  operationApi,
  type OperationAccount,
  type DailyReportQuery
} from '@/api/operation'
import { userApi } from '@/api/user'
import { campusApi } from '@/api/campus'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const accountList = ref<OperationAccount[]>([])
const operatorList = ref<any[]>([])
const campusList = ref<any[]>([])
const showCreateDialog = ref(false)
const showStatusDialog = ref(false)
const isEdit = ref(false)
const currentAccount = ref<OperationAccount | null>(null)

// 筛选表单
const filterForm = reactive({
  platformType: '',
  status: '',
  operatorId: undefined as number | undefined,
  city: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 账号表单
const form = reactive({
  platformType: '',
  accountName: '',
  accountLink: '',
  city: '',
  operatorId: undefined as number | undefined,
  campusId: undefined as number | undefined,
  fansCount: 0,
  totalLikes: 0,
  status: '正常'
})

// 状态更新表单
const statusForm = reactive({
  status: '',
  notes: ''
})

// 表单校验规则
const formRules = {
  platformType: [{ required: true, message: '请选择平台类型', trigger: 'change' }],
  accountName: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  operatorId: [{ required: true, message: '请选择运营人员', trigger: 'change' }],
  campusId: [{ required: true, message: '请选择所属校区', trigger: 'change' }]
}

const formRef = ref<FormInstance>()

// 获取账号列表
const fetchAccounts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    const response = await operationApi.getAccountList(params)
    accountList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取账号列表失败:', error)
    ElMessage.error('获取账号列表失败')
  } finally {
    loading.value = false
  }
}

// 获取运营人员列表
const fetchOperators = async () => {
  try {
    const response = await userApi.getUserList({ role: 'operation' })
    operatorList.value = response.list || []
  } catch (error) {
    console.error('获取运营人员列表失败:', error)
  }
}

// 获取校区列表
const fetchCampuses = async () => {
  try {
    const response = await campusApi.getCampusList()
    campusList.value = response.list || []
  } catch (error) {
    console.error('获取校区列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAccounts()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    platformType: '',
    status: '',
    operatorId: undefined,
    city: '',
    keyword: ''
  })
  handleSearch()
}

// 编辑账号
const handleEdit = (row: OperationAccount) => {
  isEdit.value = true
  currentAccount.value = row
  Object.assign(form, {
    id: row.id,
    platformType: row.platformType,
    accountName: row.accountName,
    accountLink: row.accountLink || '',
    city: row.city,
    operatorId: row.operatorId,
    campusId: row.campusId,
    fansCount: row.fansCount || 0,
    totalLikes: row.totalLikes || 0,
    status: row.status
  })
  showCreateDialog.value = true
}

// 删除账号
const handleDelete = async (row: OperationAccount) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账号"${row.accountName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await operationApi.deleteAccount(row.id!)
    ElMessage.success('删除成功')
    fetchAccounts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账号失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 状态变更
const handleStatusChange = (row: OperationAccount) => {
  currentAccount.value = row
  statusForm.status = row.status
  statusForm.notes = ''
  showStatusDialog.value = true
}

// 确认状态变更
const confirmStatusChange = async () => {
  if (!currentAccount.value) return

  try {
    await operationApi.updateAccountStatus(currentAccount.value.id!, statusForm.status)
    ElMessage.success('状态更新成功')
    showStatusDialog.value = false
    fetchAccounts()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 查看日报
const viewDailyReports = (row: OperationAccount) => {
  // 跳转到日报页面并筛选该账号
  // 这里可以使用路由传参或者全局状态管理
  console.log('查看账号日报:', row)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const data = { ...form }
    if (isEdit.value && currentAccount.value) {
      await operationApi.updateAccount(currentAccount.value.id!, data)
      ElMessage.success('更新成功')
    } else {
      await operationApi.createAccount(data)
      ElMessage.success('创建成功')
    }

    showCreateDialog.value = false
    fetchAccounts()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  isEdit.value = false
  currentAccount.value = null
  Object.assign(form, {
    platformType: '',
    accountName: '',
    accountLink: '',
    city: '',
    operatorId: undefined,
    campusId: undefined,
    fansCount: 0,
    totalLikes: 0,
    status: '正常'
  })
  formRef.value?.clearValidate()
}

// 辅助函数
const getPlatformTagType = (platform: string) => {
  const typeMap: Record<string, string> = {
    '小红书': 'danger',
    '抖音': 'primary',
    '视频号': 'success'
  }
  return typeMap[platform] || 'info'
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    '正常': 'success',
    '风险': 'warning',
    '封号': 'danger',
    '掉号': 'info'
  }
  return typeMap[status] || 'info'
}

const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchAccounts()
  fetchOperators()
  fetchCampuses()
})
</script>

<style scoped>
.account-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.page-desc {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}
</style>