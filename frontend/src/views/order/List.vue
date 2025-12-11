<template>
  <div class="order-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.keyword"
            placeholder="订单号/微信号/手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="queryParams.orderStatus"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="待上课" value="待上课" />
            <el-option label="上课中" value="上课中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已退款" value="已退款" />
          </el-select>
        </el-form-item>

        <el-form-item label="学员类型">
          <el-select
            v-model="queryParams.isNewStudent"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="新学员" :value="1" />
            <el-option label="老学员" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="支付时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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
      <el-button v-permission="'order:create'" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订单
      </el-button>
      <el-button v-permission="'order:import'" type="success" @click="handleImport">
        <el-icon><Upload /></el-icon>
        导入订单
      </el-button>
      <el-button v-permission="'order:export'" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="orderNo" label="订单号" width="160" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户姓名" width="120">
          <template #default="{ row }">
            <div class="customer-cell">
              <el-button
                v-if="row.customerId"
                link
                type="primary"
                @click="goToCustomerDetail(row.customerId)"
                class="customer-link"
              >
                {{ row.customerName || row.wechatNickname || '-' }}
              </el-button>
              <span v-else class="customer-name">
                {{ row.customerName || row.wechatNickname || '-' }}
              </span>
              <div class="customer-phone">{{ row.phone || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="courseName" label="课程名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="course-info">
              <span class="course-name">{{ row.courseName || '-' }}</span>
              <el-tag v-if="row.isNewStudent === 1" size="small" type="success" class="new-tag">新学员</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="paymentAmount" label="付款金额" width="120" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <span class="amount">¥{{ formatAmount(row.paymentAmount) }}</span>
              <div v-if="row.commissionAmount" class="commission">
                提成: ¥{{ formatAmount(row.commissionAmount) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderStatus" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getOrderStatusType(row.orderStatus)"
              size="small"
              effect="light"
            >
              {{ row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="teacherName" label="授课老师" width="120">
          <template #default="{ row }">
            <div class="teacher-cell">
              <span class="teacher-name">{{ row.teacherName || '-' }}</span>
              <div class="campus-name">{{ row.campusName || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="salesName" label="销售" width="100">
          <template #default="{ row }">
            <el-button
              v-if="row.salesId"
              link
              type="primary"
              @click="goToSalesCustomers(row.salesId, row.salesName)"
              class="sales-link"
            >
              {{ row.salesName || '-' }}
            </el-button>
            <span v-else>
              {{ row.salesName || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="paymentTime" label="支付时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              {{ formatDate(row.paymentTime) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'order:view'" link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button v-permission="'order:update'" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="'order:delete'" link type="danger" size="small" @click="handleDelete(row)">
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
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="请输入订单号"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechatId">
              <el-input v-model="formData.wechatId" placeholder="请输入微信号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信昵称" prop="wechatNickname">
              <el-input v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款金额" prop="paymentAmount">
              <el-input-number
                v-model="formData.paymentAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付时间" prop="paymentTime">
              <el-date-picker
                v-model="formData.paymentTime"
                type="datetime"
                placeholder="选择支付时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态" prop="orderStatus">
              <el-select v-model="formData.orderStatus" style="width: 100%">
                <el-option label="待上课" value="待上课" />
                <el-option label="上课中" value="上课中" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已退款" value="已退款" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="授课老师" prop="teacherName">
              <el-input v-model="formData.teacherName" placeholder="请输入授课老师" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属校区" prop="campusId">
              <el-select v-model="formData.campusId" placeholder="请选择校区" style="width: 100%">
                <el-option
                  v-for="campus in campusList"
                  :key="campus.id"
                  :label="campus.name"
                  :value="campus.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单标签" prop="orderTag">
              <el-select
                v-model="formData.orderTag"
                placeholder="请选择订单标签"
                style="width: 100%"
                @change="handlePreviewCommission"
              >
                <el-option label="普通订单" value="normal" />
                <el-option label="活动订单" value="promotion" />
                <el-option label="高端订单" value="premium" />
                <el-option label="新课程" value="new_course" />
                <el-option label="续费订单" value="renewal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学员类型" prop="isNewStudent">
              <el-select v-model="formData.isNewStudent" placeholder="请选择学员类型" style="width: 100%">
                <el-option label="新学员" :value="1" />
                <el-option label="老学员" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="分销销售" prop="distributorSales">
          <el-input
            v-model="formData.distributorSales"
            placeholder="分销销售姓名"
            :disabled="!isAdminOrManager"
          />
          <span v-if="!isAdminOrManager" class="form-tip">
            仅管理员可修改
          </span>
        </el-form-item>

        <!-- 提成预览 -->
        <el-form-item v-if="commissionPreview.schemeName" label="预计提成">
          <el-alert type="success" :closable="false">
            <template #title>
              <div class="commission-preview">
                <div class="scheme-name">方案：{{ commissionPreview.schemeName }}</div>
                <div class="commission-amount">
                  ¥{{ commissionPreview.commissionAmount?.toFixed(2) || '0.00' }}
                </div>
              </div>
            </template>
          </el-alert>
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

    <!-- Excel导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入订单"
      width="600px"
      @close="handleImportDialogClose"
    >
      <div class="import-tips">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <p>1. 请下载Excel模板，按照模板格式填写订单数据</p>
          <p>2. 必填字段：订单号、销售ID、课程名称、付款金额、支付时间</p>
          <p>3. 系统会自动匹配微信号或手机号关联客户</p>
          <p>4. 系统会自动检测新/老学员（3个月规则）</p>
        </el-alert>

        <el-button type="primary" @click="downloadTemplate" style="margin-bottom: 20px">
          <el-icon><Download /></el-icon>
          下载Excel模板
        </el-button>
      </div>

      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx 或 .xls 文件，且不超过10MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleUpload">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance, type UploadFile } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  getOrderList,
  createOrder,
  updateOrder,
  deleteOrder,
  importOrders,
  type Order,
  type OrderQuery,
  type CreateOrderParams,
} from '@/api/order'
import { previewCommission } from '@/api/commission'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const orderList = ref<Order[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])

const queryParams = reactive<OrderQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  orderStatus: '',
  isNewStudent: undefined,
  startDate: '',
  endDate: '',
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增订单')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<any>({
  orderNo: '',
  wechatId: '',
  wechatNickname: '',
  phone: '',
  salesId: userStore.userInfo?.id || 0,
  courseName: '',
  paymentAmount: 0,
  paymentTime: new Date(),
  orderStatus: '待上课',
  teacherName: '',
  campusId: undefined,
  region: '',
  distributorSales: userStore.userInfo?.realName || '',
  orderTag: 'normal',
  isNewStudent: 1,
  remark: '',
})

// 校区列表
const campusList = ref<any[]>([
  { id: 1, name: '总部校区' },
  { id: 2, name: '东区校区' },
  { id: 3, name: '西区校区' },
  { id: 4, name: '南区校区' },
  { id: 5, name: '北区校区' },
])

// 提成预览数据
const commissionPreview = reactive<any>({
  schemeName: null,
  commissionAmount: 0,
})

// 判断是否为管理员或销售经理
const isAdminOrManager = computed(() => {
  const roleCode = userStore.userInfo?.roleCode
  return roleCode === 'admin' || roleCode === 'sales_manager'
})

const formRules: FormRules = {
  orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  paymentAmount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentTime: [{ required: true, message: '请选择支付时间', trigger: 'change' }],
}

const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref<UploadInstance>()
const uploadFile = ref<UploadFile | null>(null)

// 获取订单列表
const fetchData = async () => {
  loading.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startDate = dateRange.value[0]
      queryParams.endDate = dateRange.value[1]
    } else {
      queryParams.startDate = ''
      queryParams.endDate = ''
    }

    console.log('发送的查询参数:', JSON.stringify(queryParams, null, 2))
    const res = await getOrderList(queryParams)
    console.log('订单列表完整响应:', JSON.stringify(res, null, 2))
    console.log('订单列表响应keys:', Object.keys(res))
    console.log('订单列表res.data:', res.data)
    console.log('订单列表res.list:', res.list)
    console.log('实际返回的数据条数:', res.list?.length || 0)
    console.log('期望的数据条数 (pageSize):', queryParams.pageSize)
    // 修复数据解析：直接使用 res.list 而不是 res.data?.list
    orderList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('Failed to fetch orders:', error)
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
  queryParams.orderStatus = ''
  queryParams.isNewStudent = undefined
  queryParams.startDate = ''
  queryParams.endDate = ''
  dateRange.value = []
  queryParams.page = 1
  fetchData()
}

// 提成预览
const handlePreviewCommission = async () => {
  if (!formData.paymentAmount || !formData.orderTag) {
    commissionPreview.schemeName = null
    commissionPreview.commissionAmount = 0
    return
  }

  try {
    const result = await previewCommission({
      orderAmount: formData.paymentAmount,
      orderTag: formData.orderTag,
      courseName: formData.courseName
    })

    if (result) {
      commissionPreview.schemeName = result.schemeName
      commissionPreview.commissionAmount = result.commissionAmount
    } else {
      commissionPreview.schemeName = null
      commissionPreview.commissionAmount = 0
    }
  } catch (error) {
    console.error('Failed to preview commission:', error)
    commissionPreview.schemeName = null
    commissionPreview.commissionAmount = 0
  }
}

// 监听付款金额变化，自动预览提成
watch(
  () => formData.paymentAmount,
  () => {
    if (formData.paymentAmount && formData.orderTag) {
      handlePreviewCommission()
    }
  }
)

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增订单'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 查看
const handleView = (row: Order) => {
  router.push(`/order/detail/${row.id}`)
}

// 跳转到客户详情
const goToCustomerDetail = (customerId: number) => {
  router.push(`/customer/detail/${customerId}`)
}

// 跳转到销售的客户列表
const goToSalesCustomers = (salesId: number, salesName?: string) => {
  router.push({
    path: '/customer/list',
    query: { salesId: salesId.toString(), salesName },
  })
}

// 编辑
const handleEdit = (row: Order) => {
  dialogTitle.value = '编辑订单'
  isEdit.value = true
  Object.assign(formData, {
    orderNo: row.orderNo,
    wechatId: row.wechatId,
    wechatNickname: row.wechatNickname,
    phone: row.phone,
    salesId: row.salesId,
    campusId: row.campusId,
    courseName: row.courseName,
    paymentAmount: row.paymentAmount,
    paymentTime: row.paymentTime,
    orderStatus: row.orderStatus,
    teacherName: row.teacherName,
    region: row.region,
    distributorSales: row.distributorSales,
    remark: row.remark,
  })
  formData.id = row.id
  dialogVisible.value = true
}

// 表格行样式
const tableRowClassName = ({ row }: { row: Order }) => {
  if (row.orderStatus === '已完成') {
    return 'success-row'
  } else if (row.orderStatus === '已退款') {
    return 'danger-row'
  }
  return ''
}

// 格式化金额
const formatAmount = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  switch (status) {
    case '待上课':
      return 'warning'
    case '上课中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已退款':
      return 'danger'
    default:
      return 'info'
  }
}

// 删除
const handleDelete = (row: Order) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete order:', error)
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
          await updateOrder(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createOrder(formData)
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
    orderNo: '',
    wechatId: '',
    wechatNickname: '',
    phone: '',
    salesId: userStore.userInfo?.id || 0,
    courseName: '',
    paymentAmount: 0,
    paymentTime: new Date(),
    orderStatus: '待上课',
    teacherName: '',
    campusId: undefined,
    region: '',
    distributorSales: userStore.userInfo?.realName || '',
    orderTag: 'normal',
    isNewStudent: 1,
    remark: '',
  })
  delete formData.id

  // 重置提成预览
  commissionPreview.schemeName = null
  commissionPreview.commissionAmount = 0
}

// 导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 下载模板
const downloadTemplate = () => {
  const template = [
    {
      订单号: 'ORD202510280001',
      微信号: 'wx_user001',
      微信昵称: '张三',
      手机号: '13800138000',
      销售ID: userStore.userInfo?.id || 1,
      课程名称: '少儿编程基础班',
      付款金额: 3980,
      支付时间: '2025-10-28 10:00:00',
      订单状态: '待上课',
      授课老师: '刘老师',
      所属地区: '北京',
      分销销售: '',
      备注: '',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单导入模板')
  XLSX.writeFile(wb, '订单导入模板.xlsx')
}

// 文件选择
const handleFileChange = (file: UploadFile) => {
  uploadFile.value = file
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 上传
const handleUpload = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  importLoading.value = true
  try {
    const file = uploadFile.value.raw
    const reader = new FileReader()

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      // 转换数据格式
      const orders = jsonData.map((row: any) => ({
        orderNo: row['订单号'],
        wechatId: row['微信号'],
        wechatNickname: row['微信昵称'],
        phone: row['手机号'],
        salesId: row['销售ID'] || userStore.userInfo?.id || 0,
        courseName: row['课程名称'],
        paymentAmount: row['付款金额'],
        paymentTime: row['支付时间'],
        orderStatus: row['订单状态'] || '待上课',
        teacherName: row['授课老师'],
        region: row['所属地区'],
        distributorSales: row['分销销售'],
        remark: row['备注'],
      }))

      // 调用导入接口
      const result = await importOrders(orders)

      ElMessage.success(
        `导入完成！成功：${result.success} 条，失败：${result.failed} 条`,
      )

      if (result.errors.length > 0) {
        console.error('导入错误:', result.errors)
      }

      importDialogVisible.value = false
      fetchData()
    }

    reader.readAsArrayBuffer(file!)
  } catch (error) {
    console.error('Failed to import orders:', error)
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

// 导入对话框关闭
const handleImportDialogClose = () => {
  uploadFile.value = null
  uploadRef.value?.clearFiles()
}

// 导出
const handleExport = () => {
  const data = orderList.value.map((order) => ({
    订单号: order.orderNo,
    客户姓名: order.customerName || order.wechatNickname,
    微信号: order.wechatId,
    手机号: order.phone,
    课程名称: order.courseName,
    付款金额: order.paymentAmount,
    学员类型: order.isNewStudent === 1 ? '新学员' : '老学员',
    订单状态: order.orderStatus,
    销售: order.salesName,
    校区: order.campusName,
    授课老师: order.teacherName,
    所属地区: order.region,
    分销销售: order.distributorSales,
    支付时间: formatDate(order.paymentTime),
    备注: order.remark,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单数据')
  XLSX.writeFile(wb, `订单数据_${dayjs().format('YYYYMMDD')}.xlsx`)
}

// 格式化日期
const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.order-list-container {
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

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper),
    :deep(.el-date-editor .el-input__wrapper) {
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

    :deep(.el-button--success) {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    :deep(.el-button) {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover:not(.el-button--primary):not(.el-button--success) {
        border-color: var(--xhs-primary);
        color: var(--xhs-primary);
      }
    }
  }

  :deep(.el-card:not(.search-card):not(.action-card)) {
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

  .amount {
    color: #FFB800;
    font-weight: 600;
    font-size: 15px;
  }

  .import-tips {
    p {
      margin: 5px 0;
      font-size: 14px;
      color: var(--xhs-text-secondary);
    }
  }

  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: var(--xhs-text-tertiary);
  }

  .commission-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .scheme-name {
      font-size: 14px;
      color: var(--xhs-text-secondary);
    }

    .commission-amount {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  :deep(.el-upload-dragger) {
    padding: 40px;
    border-radius: 12px;
    border: 2px dashed rgba(255, 184, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--xhs-primary);
      background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);
    }
  }

  :deep(.el-dialog) {
    border-radius: 16px;

    .el-dialog__header {
      border-bottom: 1px solid #f0f0f0;
      padding: 20px 24px;

      .el-dialog__title {
        font-weight: 600;
        color: var(--xhs-text-primary);
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-form-item__label {
      color: var(--xhs-text-primary);
      font-weight: 500;
    }

    .el-input__wrapper {
      border-radius: 8px;
    }

    .el-button--primary {
      @include xhs-button-primary;
    }
  }

  // 表格优化样式
  :deep(.el-table) {
    // 表格行状态样式
    .success-row {
      background-color: rgba(103, 194, 58, 0.05);
    }

    .danger-row {
      background-color: rgba(245, 108, 108, 0.05);
    }

    // 表头样式
    .el-table__header {
      background-color: #fafafa;
      th {
        background-color: #fafafa !important;
        color: #303133;
        font-weight: 600;
        border-bottom: 2px solid #ebeef5;
        padding: 12px 0;
      }
    }

    // 表格行悬停效果
    .el-table__row {
      &:hover {
        background-color: #f8f9ff !important;
      }
    }

    // 表格单元格
    .el-table__cell {
      padding: 12px 0;
    }
  }

  // 客户信息单元格样式
  .customer-cell {
    .customer-link {
      color: #409eff;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;

      &:hover {
        color: #66b1ff;
      }
    }

    .customer-name {
      color: #303133;
      font-weight: 500;
      font-size: 14px;
    }

    .customer-phone {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  // 课程信息单元格样式
  .course-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .course-name {
      color: #303133;
      line-height: 1.4;
      font-size: 14px;
    }

    .new-tag {
      align-self: flex-start;
      font-size: 11px;
    }
  }

  // 金额单元格样式
  .amount-cell {
    text-align: right;

    .amount {
      font-size: 16px;
      font-weight: 600;
      color: #e6a23c;
      display: block;
    }

    .commission {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  // 老师信息单元格样式
  .teacher-cell {
    .teacher-name {
      color: #303133;
      font-weight: 500;
      display: block;
      font-size: 14px;
    }

    .campus-name {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  // 时间单元格样式
  .time-cell {
    font-size: 12px;
    color: #606266;
    line-height: 1.3;
  }

  // 销售链接样式
  .sales-link {
    color: #409eff;
    font-weight: 500;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }
  }

  // 订单状态标签优化
  :deep(.el-tag) {
    border-radius: 12px;
    font-weight: 500;
  }
}
</style>
