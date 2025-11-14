<template>
  <div class="customer-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.keyword"
            placeholder="微信昵称/微信号/手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="客户意向">
          <el-select
            v-model="queryParams.customerIntent"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in customerIntentOptions"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="流量来源">
          <el-select
            v-model="queryParams.trafficSource"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in trafficSourceOptions"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="action-card" shadow="never">
      <div class="action-row">
        <div class="left-actions">
          <el-button type="primary" @click="handleAdd" v-permission="'customer:create'">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
          <el-button type="success" @click="handleSmartCreate" v-permission="'customer:create'">
            <el-icon><MagicStick /></el-icon>
            AI智能创建
          </el-button>
          <el-button @click="handleDownloadTemplate" v-permission="'customer:import'">
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-button>
          <el-button @click="handleExport" v-permission="'customer:export'">
            <el-icon><Upload /></el-icon>
            导出客户
          </el-button>
        </div>

        <div class="batch-actions" v-if="selectedCustomers.length > 0">
          <el-tag type="info" size="large">已选择 {{ selectedCustomers.length }} 项</el-tag>
          <el-button type="primary" size="small" @click="handleBatchAssign" v-permission="'customer:batch:assign'">
            批量分配销售
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchUpdateIntent" v-permission="'customer:batch:update'">
            批量修改意向
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete" v-permission="'customer:batch:delete'">
            批量删除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="customerList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="wechatNickname" label="微信昵称" width="140" />
        <el-table-column prop="wechatId" label="微信号" width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="realName" label="真实姓名" width="120" />

        <el-table-column prop="customerIntent" label="客户意向" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.customerIntent === '高意向' || row.customerIntent === '高'
                  ? 'success'
                  : row.customerIntent === '中意向' || row.customerIntent === '中'
                    ? 'warning'
                    : row.customerIntent === '低意向' || row.customerIntent === '低'
                      ? 'info'
                      : 'danger'
              "
            >
              {{ row.customerIntent }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="trafficSource" label="流量来源" width="120" />
        <el-table-column prop="salesName" label="对接销售" width="120" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />

        <el-table-column prop="nextFollowTime" label="下次回访时间" width="180">
          <template #default="{ row }">
            <span v-if="row.nextFollowTime">
              {{ formatDate(row.nextFollowTime) }}
            </span>
            <span v-else class="text-secondary">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)" v-permission="'customer:view'">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)" v-permission="'customer:update'">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)" v-permission="'customer:delete'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="微信昵称" prop="wechatNickname">
          <el-input v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
        </el-form-item>

        <el-form-item label="微信号" prop="wechatId">
          <el-input
            v-model="formData.wechatId"
            placeholder="请输入微信号"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="流量来源" prop="trafficSource">
          <el-select v-model="formData.trafficSource" placeholder="请选择流量来源" style="width: 100%">
            <el-option
              v-for="item in trafficSourceOptions"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="客户意向" prop="customerIntent">
          <el-select v-model="formData.customerIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option
              v-for="item in customerIntentOptions"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="运营人员" prop="operatorId">
          <el-select v-model="formData.operatorId" placeholder="请选择运营人员" clearable style="width: 100%">
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="下次回访时间" prop="nextFollowTime">
          <el-date-picker
            v-model="formData.nextFollowTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量分配销售对话框 -->
    <el-dialog
      v-model="batchAssignDialogVisible"
      title="批量分配销售"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="选中数量">
          <el-tag type="info">{{ selectedCustomers.length }} 个客户</el-tag>
        </el-form-item>
        <el-form-item label="分配给">
          <el-select v-model="batchAssignSalesId" placeholder="请选择销售人员" style="width: 100%">
            <el-option
              v-for="user in salesList"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchAssignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAssign">
          确定分配
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量修改意向对话框 -->
    <el-dialog
      v-model="batchIntentDialogVisible"
      title="批量修改客户意向"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="选中数量">
          <el-tag type="info">{{ selectedCustomers.length }} 个客户</el-tag>
        </el-form-item>
        <el-form-item label="客户意向">
          <el-select v-model="batchIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option
              v-for="item in customerIntentOptions"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchIntentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchUpdateIntent">
          确定修改
        </el-button>
      </template>
    </el-dialog>

    <!-- AI智能创建客户 -->
    <SmartCreateCustomer ref="smartCreateRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Download, Upload, Plus, Search, Refresh, MagicStick } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { downloadCustomerTemplate } from '@/utils/excel-template'
import {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  batchUpdateCustomer,
  exportCustomersToExcel,
  type Customer,
  type CustomerQuery,
  type CreateCustomerParams,
} from '@/api/customer'
import { getDictionaryByType, type Dictionary } from '@/api/dictionary'
import { getUserList } from '@/api/user'
import SmartCreateCustomer from '@/components/customer/SmartCreateCustomer.vue'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const customerList = ref<Customer[]>([])
const total = ref(0)
const selectedCustomers = ref<Customer[]>([])
const tableRef = ref()

const queryParams = reactive<CustomerQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  customerIntent: '',
  trafficSource: '',
  salesId: undefined,
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const smartCreateRef = ref()

const formData = reactive<CreateCustomerParams>({
  wechatNickname: '',
  wechatId: '',
  phone: '',
  realName: '',
  trafficSource: '',
  operatorId: undefined,
  salesId: userStore.userInfo?.id || 0,
  customerIntent: '中',
  nextFollowTime: '',
  remark: '',
})

const formRules: FormRules = {
  wechatId: [{ required: true, message: '请输入微信号', trigger: 'blur' }],
}

// 字典数据
const customerIntentOptions = ref<Dictionary[]>([])
const trafficSourceOptions = ref<Dictionary[]>([])

// 运营人员列表
const operatorList = ref<any[]>([])

// 加载字典数据
const loadDictionaries = async () => {
  try {
    const [intentRes, sourceRes] = await Promise.all([
      getDictionaryByType('customer_intent'),
      getDictionaryByType('traffic_source'),
    ])
    customerIntentOptions.value = intentRes
    trafficSourceOptions.value = sourceRes
  } catch (error) {
    console.error('Failed to load dictionaries:', error)
  }
}

// 加载运营人员列表
const loadOperators = async () => {
  try {
    const res = await getUserList({ page: 1, pageSize: 100, role: 'operator' })
    operatorList.value = res.list || []
  } catch (error) {
    console.error('Failed to load operators:', error)
  }
}

// 获取客户列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCustomerList(queryParams)
    customerList.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch customers:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.customerIntent = ''
  queryParams.trafficSource = ''
  queryParams.page = 1
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增客户'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// AI智能创建客户
const handleSmartCreate = () => {
  smartCreateRef.value?.open()
}

// 下载导入模板
const handleDownloadTemplate = () => {
  try {
    downloadCustomerTemplate()
    ElMessage.success('模板下载成功')
  } catch (error) {
    ElMessage.error('模板下载失败')
  }
}

// 导出客户
const handleExport = async () => {
  try {
    ElMessage.loading({ message: '正在导出，请稍候...', duration: 0 })

    const params = { ...queryParams }
    // 删除分页参数，导出所有符合筛选条件的数据
    delete params.page
    delete params.pageSize

    const blob = await exportCustomersToExcel(params)

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `客户数据_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.closeAll()
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.closeAll()
    ElMessage.error(error.message || '导出失败')
  }
}

// 查看
const handleView = (row: Customer) => {
  router.push(`/customer/detail/${row.id}`)
}

// 编辑
const handleEdit = (row: Customer) => {
  dialogTitle.value = '编辑客户'
  isEdit.value = true
  Object.assign(formData, {
    wechatNickname: row.wechatNickname,
    wechatId: row.wechatId,
    phone: row.phone,
    realName: row.realName,
    trafficSource: row.trafficSource,
    operatorId: row.operatorId,
    salesId: row.salesId,
    customerIntent: row.customerIntent,
    nextFollowTime: row.nextFollowTime,
    remark: row.remark,
  })
  formData.id = row.id
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteCustomer(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  })
}

// 多选变化
const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}

// 批量分配销售
const batchAssignDialogVisible = ref(false)
const batchAssignSalesId = ref<number>()
const salesList = ref<any[]>([])

const handleBatchAssign = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要分配的客户')
    return
  }
  batchAssignDialogVisible.value = true
  loadSalesList()
}

const loadSalesList = async () => {
  try {
    const res = await getUserList({ page: 1, pageSize: 100, role: 'sales' })
    salesList.value = res.list || []
  } catch (error) {
    console.error('Failed to load sales list:', error)
  }
}

const confirmBatchAssign = async () => {
  if (!batchAssignSalesId.value) {
    ElMessage.warning('请选择销售人员')
    return
  }

  try {
    const ids = selectedCustomers.value.map(c => c.id)
    const result = await batchUpdateCustomer({
      ids,
      salesId: batchAssignSalesId.value
    })
    ElMessage.success(result.message || '批量分配成功')
    batchAssignDialogVisible.value = false
    tableRef.value?.clearSelection()
    fetchData()
  } catch (error) {
    ElMessage.error('批量分配失败')
    console.error('Failed to batch assign:', error)
  }
}

// 批量修改意向
const batchIntentDialogVisible = ref(false)
const batchIntent = ref('')

const handleBatchUpdateIntent = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要修改意向的客户')
    return
  }
  batchIntentDialogVisible.value = true
}

const confirmBatchUpdateIntent = async () => {
  if (!batchIntent.value) {
    ElMessage.warning('请选择客户意向')
    return
  }

  try {
    const ids = selectedCustomers.value.map(c => c.id)
    const result = await batchUpdateCustomer({
      ids,
      customerIntent: batchIntent.value
    })
    ElMessage.success(result.message || '批量修改意向成功')
    batchIntentDialogVisible.value = false
    tableRef.value?.clearSelection()
    fetchData()
  } catch (error) {
    ElMessage.error('批量修改意向失败')
    console.error('Failed to batch update intent:', error)
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要删除的客户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const ids = selectedCustomers.value.map(c => c.id)
      // 逐个删除（后续可优化为批量删除API）
      await Promise.all(ids.map(id => deleteCustomer(id)))
      ElMessage.success(`成功删除 ${ids.length} 个客户`)
      tableRef.value?.clearSelection()
      fetchData()
    } catch (error) {
      ElMessage.error('批量删除失败')
      console.error('Failed to batch delete:', error)
    }
  })
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value && formData.id) {
          await updateCustomer(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createCustomer(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('Failed to submit:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    wechatNickname: '',
    wechatId: '',
    phone: '',
    realName: '',
    trafficSource: '',
    operatorId: undefined,
    salesId: userStore.userInfo?.id || 0,
    customerIntent: '中',
    nextFollowTime: '',
    remark: '',
  })
  delete formData.id
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  // 检查 URL 查询参数
  const route = router.currentRoute.value
  if (route.query.salesId) {
    queryParams.salesId = Number(route.query.salesId)
    // 如果有销售名称，可以显示提示
    if (route.query.salesName) {
      ElMessage.info(`已筛选销售：${route.query.salesName}`)
    }
  }

  loadDictionaries()
  loadOperators()
  fetchData()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.customer-list-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);

  .search-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 24px;
    }

    :deep(.el-form-item__label) {
      color: var(--xhs-text-primary);
      font-weight: 500;
    }

    :deep(.el-button--primary) {
      @include xhs-button-primary;
    }

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(255, 184, 0, 0.1);
      }

      &.is-focus {
        box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.1);
      }
    }
  }

  .action-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 20px 24px;
    }

    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .left-actions {
        display: flex;
        gap: 12px;

        :deep(.el-button--primary) {
          background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
          border: none;
          color: white;
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 184, 0, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        }

        :deep(.el-button) {
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--xhs-primary);
            color: var(--xhs-primary);
          }
        }
      }

      .batch-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.08) 0%, rgba(255, 201, 64, 0.05) 100%);
        border-radius: 12px;
        border: 1px solid rgba(255, 184, 0, 0.2);

        :deep(.el-tag) {
          background: white;
          border-color: var(--xhs-primary);
          color: var(--xhs-primary);
          font-weight: 500;
        }

        :deep(.el-button) {
          border-radius: 8px;
        }
      }
    }
  }

  :deep(.el-card) {
    @include xhs-card;
    border: none;

    .el-card__body {
      padding: 24px;
    }

    .el-table {
      border-radius: 12px;
      overflow: hidden;

      th {
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, rgba(255, 201, 64, 0.03) 100%);
        color: var(--xhs-text-primary);
        font-weight: 600;
      }

      tr {
        transition: all 0.2s ease;

        &:hover {
          background: linear-gradient(90deg, rgba(255, 184, 0, 0.03) 0%, transparent 100%);
        }
      }

      .el-button.is-link {
        color: var(--xhs-primary);
        font-weight: 500;

        &:hover {
          color: var(--xhs-primary-dark);
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px 0;

    :deep(.el-pagination) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 201, 64, 0.08) 100%);
          color: var(--xhs-primary);
        }

        &.is-active {
          background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
          color: white;
          font-weight: 600;
        }
      }
    }
  }

  .text-secondary {
    color: var(--xhs-text-secondary);
    font-size: 12px;
  }
}
</style>
