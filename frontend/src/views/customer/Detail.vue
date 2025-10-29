<template>
  <div class="customer-detail-container">
    <!-- 返回按钮 -->
    <el-card class="back-card" shadow="never">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </el-card>

    <!-- 回访提醒 -->
    <el-alert
      v-if="customerInfo && customerInfo.nextFollowTime && isFollowDue(customerInfo.nextFollowTime)"
      :title="isOverdue(customerInfo.nextFollowTime) ? '回访已逾期' : '待回访提醒'"
      :type="isOverdue(customerInfo.nextFollowTime) ? 'error' : 'warning'"
      :closable="false"
      class="follow-alert"
      show-icon
    >
      <template #default>
        <div class="alert-content">
          <span>下次回访时间：{{ formatDateTime(customerInfo.nextFollowTime) }}</span>
          <el-button
            :type="isOverdue(customerInfo.nextFollowTime) ? 'danger' : 'warning'"
            size="default"
            @click="handleAddFollow"
            class="alert-follow-btn"
          >
            <el-icon><EditPen /></el-icon>
            立即跟进
          </el-button>
        </div>
      </template>
    </el-alert>

    <!-- 客户基本信息 -->
    <el-card class="info-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">客户基本信息</span>
          <el-button type="primary" size="small" @click="handleEdit">编辑</el-button>
        </div>
      </template>

      <el-descriptions :column="3" border v-if="customerInfo">
        <el-descriptions-item label="客户ID">{{ customerInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ customerInfo.wechatNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信号">{{ customerInfo.wechatId }}</el-descriptions-item>

        <el-descriptions-item label="手机号">{{ customerInfo.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ customerInfo.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="客户意向">
          <el-tag
            :type="
              customerInfo.customerIntent === '高'
                ? 'success'
                : customerInfo.customerIntent === '中'
                  ? 'warning'
                  : 'info'
            "
          >
            {{ customerInfo.customerIntent }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="生命周期阶段">
          <el-tag
            :type="getLifecycleTagType(customerInfo.lifecycleStage)"
            size="large"
          >
            {{ customerInfo.lifecycleStage || '线索' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="流量来源">{{ customerInfo.trafficSource || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对接销售">{{ customerInfo.salesName }}</el-descriptions-item>
        <el-descriptions-item label="运营人员">{{ customerInfo.operatorName || '-' }}</el-descriptions-item>

        <el-descriptions-item label="下次回访时间" :span="2">
          <span v-if="customerInfo.nextFollowTime">
            {{ formatDateTime(customerInfo.nextFollowTime) }}
          </span>
          <span v-else class="text-secondary">未设置</span>
        </el-descriptions-item>
        <el-descriptions-item label="跟进次数">{{ customerInfo.followRecordCount || 0 }} 次</el-descriptions-item>

        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(customerInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(customerInfo.updateTime) }}
        </el-descriptions-item>

        <el-descriptions-item label="备注" :span="3">
          {{ customerInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 跟进记录 -->
    <el-card class="follow-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">跟进记录</span>
          <el-button type="primary" size="default" @click="handleAddFollow" class="add-follow-btn">
            <el-icon><Plus /></el-icon>
            添加跟进记录
          </el-button>
        </div>
      </template>

      <el-timeline v-if="followRecords.length > 0">
        <el-timeline-item
          v-for="record in followRecords"
          :key="record.id"
          :timestamp="formatDateTime(record.followTime)"
          placement="top"
        >
          <el-card>
            <div class="follow-header">
              <span class="operator">{{ record.operatorName }}</span>
              <span class="time">{{ formatDateTime(record.followTime) }}</span>
            </div>
            <div class="follow-content">{{ record.followContent }}</div>
            <div v-if="record.nextFollowTime" class="next-follow">
              <el-icon><Clock /></el-icon>
              下次跟进：{{ formatDateTime(record.nextFollowTime) }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无跟进记录" />
    </el-card>

    <!-- 生命周期历史 -->
    <el-card class="lifecycle-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">生命周期历史</span>
          <el-button type="primary" size="default" @click="handleChangeStage">
            <el-icon><Edit /></el-icon>
            变更阶段
          </el-button>
        </div>
      </template>

      <el-timeline v-if="lifecycleHistory.length > 0">
        <el-timeline-item
          v-for="record in lifecycleHistory"
          :key="record.id"
          :timestamp="formatDateTime(record.createTime)"
          placement="top"
          :type="getLifecycleTimelineType(record.stage)"
        >
          <el-card>
            <div class="lifecycle-header">
              <el-tag :type="getLifecycleTagType(record.stage)" size="large">
                {{ record.stage }}
              </el-tag>
              <span class="operator">操作人：{{ record.operatorName }}</span>
            </div>
            <div v-if="record.changeReason" class="lifecycle-reason">
              {{ record.changeReason }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无生命周期记录" />
    </el-card>

    <!-- 订单历史 -->
    <el-card class="order-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">订单历史</span>
        </div>
      </template>

      <el-table v-if="customerOrders.length > 0" :data="customerOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="courseName" label="课程名称" width="140" />
        <el-table-column prop="paymentAmount" label="付款金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.paymentAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isNewStudent" label="学员类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isNewStudent === 1 ? 'success' : 'info'">
              {{ row.isNewStudent === 1 ? '新学员' : '老学员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.orderStatus === '待上课'
                  ? 'warning'
                  : row.orderStatus === '上课中'
                    ? 'primary'
                    : row.orderStatus === '已完成'
                      ? 'success'
                      : 'danger'
              "
            >
              {{ row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.paymentTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="暂无订单记录" />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑客户信息"
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
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleUpdate">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加跟进对话框 -->
    <el-dialog
      v-model="followDialogVisible"
      title="添加跟进记录"
      width="600px"
      @close="handleFollowDialogClose"
    >
      <el-form
        ref="followFormRef"
        :model="followFormData"
        :rules="followFormRules"
        label-width="120px"
      >
        <el-form-item label="跟进内容" prop="followContent">
          <el-input
            v-model="followFormData.followContent"
            type="textarea"
            :rows="5"
            placeholder="请输入跟进内容"
          />
        </el-form-item>

        <el-form-item label="下次跟进时间" prop="nextFollowTime">
          <el-date-picker
            v-model="followFormData.nextFollowTime"
            type="datetime"
            placeholder="选择下次跟进时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="followDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="followSubmitLoading" @click="handleSubmitFollow">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 变更生命周期阶段对话框 -->
    <el-dialog
      v-model="stageDialogVisible"
      title="变更生命周期阶段"
      width="500px"
      @close="handleStageDialogClose"
    >
      <el-form
        ref="stageFormRef"
        :model="stageFormData"
        :rules="stageFormRules"
        label-width="120px"
      >
        <el-form-item label="当前阶段">
          <el-tag :type="getLifecycleTagType(customerInfo?.lifecycleStage)" size="large">
            {{ customerInfo?.lifecycleStage || '线索' }}
          </el-tag>
        </el-form-item>

        <el-form-item label="变更为" prop="stage">
          <el-select v-model="stageFormData.stage" placeholder="请选择新阶段" style="width: 100%">
            <el-option label="线索" value="线索" />
            <el-option label="意向客户" value="意向客户" />
            <el-option label="商机" value="商机" />
            <el-option label="成交客户" value="成交客户" />
            <el-option label="复购客户" value="复购客户" />
            <el-option label="流失客户" value="流失客户" />
          </el-select>
        </el-form-item>

        <el-form-item label="变更原因" prop="changeReason">
          <el-input
            v-model="stageFormData.changeReason"
            type="textarea"
            :rows="3"
            placeholder="请输入阶段变更原因（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="stageDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="stageSubmitLoading" @click="handleSubmitStage">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRecentStore } from '@/store/recent'
import {
  getCustomerDetail,
  updateCustomer,
  getFollowRecords,
  createFollowRecord,
  type Customer,
  type FollowRecord,
} from '@/api/customer'
import { getCustomerOrders, type Order } from '@/api/order'
import {
  getLifecycleHistory,
  createLifecycle,
  type LifecycleHistory,
} from '@/api/lifecycle'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recentStore = useRecentStore()

const loading = ref(false)
const customerInfo = ref<Customer | null>(null)
const followRecords = ref<FollowRecord[]>([])
const customerOrders = ref<Order[]>([])
const lifecycleHistory = ref<LifecycleHistory[]>([])

const editDialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  wechatNickname: '',
  phone: '',
  realName: '',
  trafficSource: '',
  customerIntent: '中',
  nextFollowTime: '',
  remark: '',
})

const formRules: FormRules = {}

const followDialogVisible = ref(false)
const followSubmitLoading = ref(false)
const followFormRef = ref<FormInstance>()

const followFormData = reactive({
  customerId: 0,
  followContent: '',
  nextFollowTime: '',
})

const followFormRules: FormRules = {
  followContent: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
}

const stageDialogVisible = ref(false)
const stageSubmitLoading = ref(false)
const stageFormRef = ref<FormInstance>()

const stageFormData = reactive({
  stage: '',
  changeReason: '',
})

const stageFormRules: FormRules = {
  stage: [{ required: true, message: '请选择新阶段', trigger: 'change' }],
}

// 获取客户详情
const fetchCustomerInfo = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  loading.value = true
  try {
    customerInfo.value = await getCustomerDetail(customerId)

    // 记录到最近访问
    if (customerInfo.value) {
      recentStore.addRecentCustomer({
        id: customerInfo.value.id,
        wechatNickname: customerInfo.value.wechatNickname,
        phone: customerInfo.value.phone
      })
    }
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    ElMessage.error('获取客户信息失败')
  } finally {
    loading.value = false
  }
}

// 获取跟进记录
const fetchFollowRecords = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    followRecords.value = await getFollowRecords(customerId)
  } catch (error) {
    console.error('Failed to fetch follow records:', error)
  }
}

// 获取客户订单
const fetchCustomerOrders = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    customerOrders.value = await getCustomerOrders(customerId)
  } catch (error) {
    console.error('Failed to fetch customer orders:', error)
  }
}

// 获取客户生命周期历史
const fetchLifecycleHistory = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    lifecycleHistory.value = await getLifecycleHistory(customerId)
  } catch (error) {
    console.error('Failed to fetch lifecycle history:', error)
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  if (!customerInfo.value) return

  Object.assign(formData, {
    wechatNickname: customerInfo.value.wechatNickname,
    phone: customerInfo.value.phone,
    realName: customerInfo.value.realName,
    trafficSource: customerInfo.value.trafficSource,
    customerIntent: customerInfo.value.customerIntent,
    nextFollowTime: customerInfo.value.nextFollowTime,
    remark: customerInfo.value.remark,
  })
  editDialogVisible.value = true
}

// 更新客户
const handleUpdate = async () => {
  if (!formRef.value || !customerInfo.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await updateCustomer(customerInfo.value!.id, formData)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchCustomerInfo()
      } catch (error) {
        console.error('Failed to update customer:', error)
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

// 添加跟进
const handleAddFollow = () => {
  if (!customerInfo.value) return

  followFormData.customerId = customerInfo.value.id
  followFormData.followContent = ''
  followFormData.nextFollowTime = ''
  followDialogVisible.value = true
}

// 提交跟进记录
const handleSubmitFollow = async () => {
  if (!followFormRef.value) return

  await followFormRef.value.validate(async (valid) => {
    if (valid) {
      followSubmitLoading.value = true
      try {
        await createFollowRecord(followFormData)
        ElMessage.success('添加成功')
        followDialogVisible.value = false
        fetchFollowRecords()
        fetchCustomerInfo()
      } catch (error) {
        console.error('Failed to create follow record:', error)
      } finally {
        followSubmitLoading.value = false
      }
    }
  })
}

// 跟进对话框关闭
const handleFollowDialogClose = () => {
  followFormRef.value?.resetFields()
}

// 变更生命周期阶段
const handleChangeStage = () => {
  if (!customerInfo.value) return

  stageFormData.stage = ''
  stageFormData.changeReason = ''
  stageDialogVisible.value = true
}

// 提交生命周期阶段变更
const handleSubmitStage = async () => {
  if (!stageFormRef.value || !customerInfo.value) return

  await stageFormRef.value.validate(async (valid) => {
    if (valid) {
      stageSubmitLoading.value = true
      try {
        await createLifecycle({
          customerId: customerInfo.value!.id,
          stage: stageFormData.stage,
          changeReason: stageFormData.changeReason || `变更为${stageFormData.stage}`,
          operatorId: userStore.userInfo?.id || 0,
        })
        ElMessage.success('阶段变更成功')
        stageDialogVisible.value = false
        fetchCustomerInfo()
        fetchLifecycleHistory()
      } catch (error) {
        console.error('Failed to change stage:', error)
      } finally {
        stageSubmitLoading.value = false
      }
    }
  })
}

// 生命周期阶段对话框关闭
const handleStageDialogClose = () => {
  stageFormRef.value?.resetFields()
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 检查是否逾期
const isOverdue = (dateStr: string) => {
  if (!dateStr) return false
  return dayjs(dateStr).isBefore(dayjs())
}

// 检查是否即将到期（24小时内或已逾期）
const isFollowDue = (dateStr: string) => {
  if (!dateStr) return false
  const followTime = dayjs(dateStr)
  const now = dayjs()
  const hoursDiff = followTime.diff(now, 'hour')
  // 24小时内或已逾期
  return hoursDiff <= 24
}

// 获取生命周期阶段标签类型
const getLifecycleTagType = (stage: string | undefined) => {
  const stageMap: Record<string, any> = {
    '线索': 'info',
    '意向客户': '',
    '商机': 'warning',
    '成交客户': 'success',
    '复购客户': 'success',
    '流失客户': 'danger',
  }
  return stageMap[stage || '线索'] || 'info'
}

// 获取生命周期时间轴类型
const getLifecycleTimelineType = (stage: string) => {
  const stageMap: Record<string, any> = {
    '线索': 'primary',
    '意向客户': 'primary',
    '商机': 'warning',
    '成交客户': 'success',
    '复购客户': 'success',
    '流失客户': 'danger',
  }
  return stageMap[stage] || 'primary'
}

onMounted(() => {
  fetchCustomerInfo()
  fetchFollowRecords()
  fetchCustomerOrders()
  fetchLifecycleHistory()
})
</script>

<style scoped lang="scss">
.customer-detail-container {
  .back-card {
    margin-bottom: 16px;
  }

  .info-card {
    margin-bottom: 16px;
  }

  .follow-card {
    margin-bottom: 16px;
  }

  .order-card {
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .text-secondary {
    color: #909399;
    font-size: 14px;
  }

  .follow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .operator {
      font-weight: 500;
      color: #303133;
    }

    .time {
      font-size: 12px;
      color: #909399;
    }
  }

  .follow-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    margin-bottom: 8px;
  }

  .next-follow {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #FFB800;
  }

  .amount {
    color: #ff6b00;
    font-weight: 500;
  }

  .follow-alert {
    margin-bottom: 16px;

    .alert-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;

      .alert-follow-btn {
        margin-left: 20px;
        font-weight: 500;
      }
    }
  }

  .add-follow-btn {
    font-weight: 500;
  }
}
</style>
