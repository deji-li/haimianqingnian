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
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>

        <el-form-item label="流量来源">
          <el-select
            v-model="queryParams.trafficSource"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="百度" value="百度" />
            <el-option label="朋友圈" value="朋友圈" />
            <el-option label="其他" value="其他" />
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增客户
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="customerList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="wechatNickname" label="微信昵称" width="140" />
        <el-table-column prop="wechatId" label="微信号" width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="realName" label="真实姓名" width="120" />

        <el-table-column prop="customerIntent" label="客户意向" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.customerIntent === '高'
                  ? 'success'
                  : row.customerIntent === '中'
                    ? 'warning'
                    : 'info'
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
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
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
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="百度" value="百度" />
            <el-option label="朋友圈" value="朋友圈" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户意向" prop="customerIntent">
          <el-select v-model="formData.customerIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
  type CustomerQuery,
  type CreateCustomerParams,
} from '@/api/customer'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const customerList = ref<Customer[]>([])
const total = ref(0)

const queryParams = reactive<CustomerQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  customerIntent: '',
  trafficSource: '',
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<CreateCustomerParams>({
  wechatNickname: '',
  wechatId: '',
  phone: '',
  realName: '',
  trafficSource: '',
  salesId: userStore.userInfo?.id || 0,
  customerIntent: '中',
  nextFollowTime: '',
  remark: '',
})

const formRules: FormRules = {
  wechatId: [{ required: true, message: '请输入微信号', trigger: 'blur' }],
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
  fetchData()
})
</script>

<style scoped lang="scss">
.customer-list-container {
  .search-card {
    margin-bottom: 16px;
  }

  .action-card {
    margin-bottom: 16px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .text-secondary {
    color: #909399;
    font-size: 12px;
  }
}
</style>
