<template>
  <div class="order-detail">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="left">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          @click="router.back()"
          size="large"
        >
          返回
        </el-button>
        <h2 class="page-title">订单详情</h2>
      </div>
      <div class="right">
        <el-button
          v-if="orderData"
          type="primary"
          @click="handleEdit"
          size="large"
          :disabled="orderData.isExternal === 1"
        >
          编辑订单
        </el-button>
        <el-button
          v-if="orderData && orderData.customerId"
          type="success"
          @click="goToCustomerDetail"
          size="large"
        >
          查看客户
        </el-button>
      </div>
    </div>

    <!-- 订单详情内容 -->
    <div v-loading="loading" class="order-content">
      <div v-if="orderData" class="detail-container">
        <!-- 基本信息 -->
        <el-card class="info-card" header="基本信息">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="订单号">{{ orderData.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getOrderStatusType(orderData.orderStatus)">
                {{ orderData.orderStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付金额">
              <span class="amount">¥{{ parseFloat(orderData.paymentAmount || '0').toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付时间">
              {{ formatDate(orderData.paymentTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="课程名称">
              {{ orderData.courseName }}
            </el-descriptions-item>
            <el-descriptions-item label="数据来源">
              <el-tag :type="getDataSourceType(orderData.dataSource)">
                {{ orderData.dataSource }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 客户信息 -->
        <el-card class="info-card" header="客户信息">
          <div v-if="orderData.customer" class="customer-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="客户昵称">
                {{ orderData.customer.wechatNickname || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="客户姓名">
                {{ orderData.customer.realName || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ orderData.customer.phone || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="微信ID">
                {{ orderData.customer.wechatId || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="客户意向">
                <el-tag :type="getCustomerIntentType(orderData.customer.customerIntent)">
                  {{ orderData.customer.customerIntent }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="生命周期">
                {{ orderData.customer.lifecycleStage || '未设置' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-else class="no-customer-info">
            <el-alert
              title="未关联客户"
              type="warning"
              :closable="false"
              show-icon
            >
              <p>此订单尚未关联到具体客户。您可以手动绑定客户。</p>
              <el-button
                type="primary"
                size="small"
                @click="showBindCustomerDialog = true"
                style="margin-top: 10px;"
              >
                绑定客户
              </el-button>
            </el-alert>
          </div>
        </el-card>

        <!-- 校区和老师信息 -->
        <el-card class="info-card" header="校区和老师信���">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="所属校区">
              {{ orderData.campusName || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="销售老师">
              {{ orderData.salesName || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="授课老师">
              {{ orderData.teacherName || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="本次提成金额">
              <span class="commission">¥{{ parseFloat(orderData.teacherCommission || '0').toFixed(2) }}</span>
              <el-tag v-if="orderData.teacherInfo?.commissionRate && orderData.paymentAmount"
                       type="info" size="small" style="margin-left: 8px">
                {{ parseFloat(orderData.paymentAmount || '0') * (orderData.teacherInfo.commissionRate / 100) }}元
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 外部同步信息 (仅外部订单显示) -->
        <el-card
          v-if="orderData.isExternal === 1"
          class="info-card"
          header="外部系统信息"
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="来源系统">
              {{ orderData.externalSystem || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="外部状态">
              {{ getExternalStatusText(orderData.externalStatus) }}
            </el-descriptions-item>
            <el-descriptions-item label="退款状态">
              {{ getExternalRefundText(orderData.externalRefund) }}
            </el-descriptions-item>
            <el-descriptions-item label="退款审核状态">
              {{ getExternalRefundStatusText(orderData.externalRefundStatus) }}
            </el-descriptions-item>
            <el-descriptions-item label="同步状态">
              <el-tag :type="getSyncStatusType(orderData.syncStatus)">
                {{ orderData.syncStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后同步时间">
              {{ formatDate(orderData.lastSyncTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 备注信息 -->
        <el-card
          v-if="orderData.remark"
          class="info-card"
          header="备注信息"
        >
          <p>{{ orderData.remark }}</p>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="订单不存在或已被删除" />
    </div>

    <!-- 绑定客户对话框 -->
    <el-dialog
      v-model="showBindCustomerDialog"
      title="绑定客户"
      width="600px"
    >
      <customer-bind-form
        :order-id="orderId"
        @success="handleBindSuccess"
        @cancel="showBindCustomerDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import dayjs from 'dayjs'
import CustomerBindForm from './components/CustomerBindForm.vue'
import type { Order } from '@shared/types'

const router = useRouter()
const route = useRoute()

const orderId = ref<number>(parseInt(route.params.id as string))
const orderData = ref<Order | null>(null)
const loading = ref(false)
const showBindCustomerDialog = ref(false)

// 获取订单详情
const fetchOrderDetail = async () => {
  console.log('🔥 fetchOrderDetail 被调用，orderId:', orderId.value)
  if (!orderId.value || isNaN(orderId.value)) {
    console.log('❌ 订单ID无效')
    ElMessage.error('订单ID无效')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getOrderDetail(orderId.value)
    orderData.value = response
  } catch (error: any) {
    console.error('获取订单详情失败:', error)
    if (error.response?.status === 404) {
      ElMessage.error('订单不存在或已被删除')
    } else {
      ElMessage.error(error.message || '获取订单详情失败')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    '已完成': 'success',
    '上课中': 'warning',
    '待上课': 'info',
    '已退款': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取数据来源类型
const getDataSourceType = (source: string) => {
  const sourceMap: { [key: string]: string } = {
    '手工录入': 'primary',
    '小程序导入': 'success',
    '海绵青年GO': 'warning'
  }
  return sourceMap[source] || 'info'
}

// 获取客户意向类型
const getCustomerIntentType = (intent: string) => {
  const intentMap: { [key: string]: string } = {
    '高意向': 'success',
    '中意向': 'warning',
    '低意向': 'info',
    '无意向': 'danger'
  }
  return intentMap[intent] || 'info'
}

// 获取外部状态文本
const getExternalStatusText = (status?: number) => {
  const statusMap: { [key: string]: string } = {
    '1': '未支付',
    '2': '已支付',
    '3': '已确认',
    '4': '已排课',
    '5': '上课中',
    '6': '待评价',
    '7': '已完成',
    '8': '已取消',
    '9': '已关闭',
    '-1': '异常'
  }
  return statusMap[status?.toString() || '0'] || '未知'
}

// 获取退款状态文本
const getExternalRefundText = (refund?: number) => {
  const refundMap: { [key: number]: string } = {
    0: '无退款',
    1: '申请退款',
    2: '已退款',
    3: '不予退款'
  }
  return refundMap[refund || 0] || '未知'
}

// 获取退款审核状态文本
const getExternalRefundStatusText = (status?: number) => {
  const statusMap: { [key: number]: string } = {
    0: '无审核',
    1: '通过',
    2: '驳回'
  }
  return statusMap[status || 0] || '未知'
}

// 获取同步状态类型
const getSyncStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    '未同步': 'danger',
    '已同步': 'success',
    '同步失败': 'warning'
  }
  return statusMap[status] || 'info'
}

// 编辑订单
const handleEdit = () => {
  router.push(`/order/${orderId.value}/edit`)
}

// 查看客户详情
const goToCustomerDetail = () => {
  if (orderData.value?.customerId) {
    router.push(`/customer/detail/${orderData.value.customerId}`)
  }
}

// 绑定客户成功
const handleBindSuccess = () => {
  showBindCustomerDialog.value = false
  ElMessage.success('客户绑定成功')
  fetchOrderDetail() // 重新获取订单详情
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.right {
  display: flex;
  gap: 12px;
}

.order-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  border-radius: 8px;
}

.customer-info {
  margin-top: 16px;
}

.no-customer-info {
  margin-top: 16px;
}

.amount {
  font-size: 18px;
  font-weight: 600;
  color: #e6a23c;
}

.commission {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
}
</style>