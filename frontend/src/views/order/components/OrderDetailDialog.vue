<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="order-detail-container">
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ orderDetail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="数据来源">
              <el-tag
                :type="
                  orderDetail.dataSource === '海绵青年GO'
                    ? 'primary'
                    : orderDetail.dataSource === '小程序导入'
                      ? 'success'
                      : 'info'
                "
                :effect="orderDetail.dataSource === '海绵青年GO' ? 'dark' : 'plain'"
              >
                {{ orderDetail.dataSource || '手工录入' }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="客户姓名">{{ orderDetail.customerName || orderDetail.wechatNickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ orderDetail.phone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="课程名称">{{ orderDetail.courseName }}</el-descriptions-item>
            <el-descriptions-item label="付款金额">
              <span class="amount">¥{{ orderDetail.paymentAmount }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="订单状态">
              <el-tag
                :type="
                  orderDetail.orderStatus === '待上课'
                    ? 'warning'
                    : orderDetail.orderStatus === '上课中'
                      ? 'primary'
                      : orderDetail.orderStatus === '已完成'
                        ? 'success'
                        : 'danger'
                "
              >
                {{ orderDetail.orderStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="学员类型">
              <el-tag :type="orderDetail.isNewStudent === 1 ? 'success' : 'info'">
                {{ orderDetail.isNewStudent === 1 ? '新学员' : '老学员' }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="销售顾问">{{ orderDetail.salesName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所属校区">{{ orderDetail.campusName || '-' }}</el-descriptions-item>

            <el-descriptions-item label="授课老师">{{ orderDetail.teacherName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ formatDate(orderDetail.paymentTime) }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ formatDate(orderDetail.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(orderDetail.updateTime) }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ orderDetail.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 同步信息 (仅外部订单显示) -->
        <el-tab-pane v-if="orderDetail.isExternal === 1" label="同步信息" name="sync">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="是否外部订单">
              <el-tag :type="orderDetail.isExternal === 1 ? 'primary' : 'info'">
                {{ orderDetail.isExternal === 1 ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="外部系统">{{ orderDetail.externalSystem || '-' }}</el-descriptions-item>

            <el-descriptions-item label="同步状态">
              <el-tag
                :type="
                  orderDetail.syncStatus === '已同步'
                    ? 'success'
                    : orderDetail.syncStatus === '同步失败'
                      ? 'danger'
                      : 'warning'
                "
              >
                {{ orderDetail.syncStatus || '未同步' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后同步时间">{{ formatDate(orderDetail.lastSyncTime) }}</el-descriptions-item>

            <el-descriptions-item label="外部订单状态">{{ orderDetail.externalStatus || '-' }}</el-descriptions-item>
            <el-descriptions-item label="退款标识">
              <el-tag v-if="orderDetail.externalRefund !== null" :type="getRefundTagType(orderDetail.externalRefund)">
                {{ getRefundText(orderDetail.externalRefund) }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>

            <el-descriptions-item label="退款状态" :span="2">
              <el-tag v-if="orderDetail.externalRefundStatus !== null" :type="getRefundStatusTagType(orderDetail.externalRefundStatus)">
                {{ getRefundStatusText(orderDetail.externalRefundStatus) }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 海绵API原始数据 (仅海绵订单显示) -->
        <el-tab-pane v-if="orderDetail.externalRawData" label="海绵API数据" name="raw">
          <el-alert
            title="海绵青年GO系统原始数据"
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          >
            <template #default>
              以下为订单同步时从海绵青年GO系统获取的完整原始数据,包含所有API返回的字段信息。
            </template>
          </el-alert>

          <div class="raw-data-container">
            <!-- 订单基本信息 -->
            <el-card shadow="never" class="data-section">
              <template #header>
                <div class="card-header">
                  <span>订单基本信息</span>
                </div>
              </template>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="订单ID">{{ orderDetail.externalRawData.order_id }}</el-descriptions-item>
                <el-descriptions-item label="订单状态码">{{ orderDetail.externalRawData.status }}</el-descriptions-item>

                <el-descriptions-item label="订单总金额">¥{{ orderDetail.externalRawData.total_price }}</el-descriptions-item>
                <el-descriptions-item label="需支付金额">¥{{ orderDetail.externalRawData.need_pay }}</el-descriptions-item>

                <el-descriptions-item label="创建时间(时间戳)">{{ orderDetail.externalRawData.add_time }}</el-descriptions-item>
                <el-descriptions-item label="创建时间(格式化)">{{ orderDetail.externalRawData.add_time_format }}</el-descriptions-item>

                <el-descriptions-item label="支付时间(时间戳)">{{ orderDetail.externalRawData.pay_time }}</el-descriptions-item>
                <el-descriptions-item label="支付时间(格式化)">{{ orderDetail.externalRawData.pay_time_format }}</el-descriptions-item>

                <el-descriptions-item label="退款标识">{{ orderDetail.externalRawData.refund }} ({{ getRefundText(orderDetail.externalRawData.refund) }})</el-descriptions-item>
                <el-descriptions-item label="退款状态">{{ orderDetail.externalRawData.refund_status }} ({{ getRefundStatusText(orderDetail.externalRawData.refund_status) }})</el-descriptions-item>

                <el-descriptions-item label="会员ID">{{ orderDetail.externalRawData.member_id }}</el-descriptions-item>
                <el-descriptions-item label="门店ID">{{ orderDetail.externalRawData.store_id }}</el-descriptions-item>

                <el-descriptions-item label="门店名称" :span="2">{{ orderDetail.externalRawData.store_name }}</el-descriptions-item>

                <el-descriptions-item label="备注" :span="2">{{ orderDetail.externalRawData.remark || '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 会员信息 -->
            <el-card v-if="orderDetail.externalRawData.member" shadow="never" class="data-section">
              <template #header>
                <div class="card-header">
                  <span>会员信息</span>
                </div>
              </template>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="会员ID">{{ orderDetail.externalRawData.member.member_id }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ orderDetail.externalRawData.member.mobile }}</el-descriptions-item>

                <el-descriptions-item label="昵称">{{ orderDetail.externalRawData.member.nick_name }}</el-descriptions-item>
                <el-descriptions-item label="真实姓名">{{ orderDetail.externalRawData.member.realname || '-' }}</el-descriptions-item>

                <el-descriptions-item label="性别">
                  {{ orderDetail.externalRawData.member.sex === 1 ? '男' : orderDetail.externalRawData.member.sex === 2 ? '女' : '未知' }}
                </el-descriptions-item>
                <el-descriptions-item label="头像">
                  <el-image
                    v-if="orderDetail.externalRawData.member.face"
                    :src="orderDetail.externalRawData.member.face"
                    :preview-src-list="[orderDetail.externalRawData.member.face]"
                    fit="cover"
                    style="width: 40px; height: 40px; border-radius: 4px"
                  />
                  <span v-else>-</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 商品SKU列表 -->
            <el-card v-if="orderDetail.externalRawData.skus && orderDetail.externalRawData.skus.length" shadow="never" class="data-section">
              <template #header>
                <div class="card-header">
                  <span>商品SKU列表 ({{ orderDetail.externalRawData.skus.length }}项)</span>
                </div>
              </template>
              <el-table :data="orderDetail.externalRawData.skus" border stripe size="small">
                <el-table-column prop="sku_id" label="SKU ID" width="120" />
                <el-table-column label="商品图片" width="100">
                  <template #default="{ row }">
                    <el-image
                      v-if="row.goods_image"
                      :src="row.goods_image"
                      :preview-src-list="[row.goods_image]"
                      fit="cover"
                      style="width: 60px; height: 60px; border-radius: 4px"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="goods_name" label="商品名称" min-width="180" />
                <el-table-column prop="sku_name" label="规格名称" min-width="150" />
                <el-table-column prop="sku_price" label="单价" width="100">
                  <template #default="{ row }">
                    ¥{{ row.sku_price }}
                  </template>
                </el-table-column>
                <el-table-column prop="sku_number" label="数量" width="80" />
                <el-table-column prop="sku_unit" label="单位" width="80" />
                <el-table-column prop="sku_total_price" label="小计" width="100">
                  <template #default="{ row }">
                    ¥{{ row.sku_total_price }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <!-- 完整JSON数据 -->
            <el-card shadow="never" class="data-section">
              <template #header>
                <div class="card-header">
                  <span>完整JSON数据</span>
                  <el-button size="small" @click="copyJson">
                    <el-icon><CopyDocument /></el-icon>
                    复制JSON
                  </el-button>
                </div>
              </template>
              <el-input
                v-model="formattedJson"
                type="textarea"
                :rows="15"
                readonly
                class="json-textarea"
              />
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button v-if="orderDetail.externalRawData" type="primary" @click="copyAllData">
        <el-icon><CopyDocument /></el-icon>
        复制所有海绵数据
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import dayjs from 'dayjs'

interface Props {
  modelValue: boolean
  orderId?: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const orderDetail = ref<any>({})
const activeTab = ref('basic')

const formattedJson = computed(() => {
  if (!orderDetail.value.externalRawData) return ''
  return JSON.stringify(orderDetail.value.externalRawData, null, 2)
})

watch(
  () => [props.modelValue, props.orderId],
  ([visible, orderId]) => {
    console.log('OrderDetailDialog: watch triggered -', { visible, orderId })
    if (visible && orderId) {
      fetchOrderDetail()
    }
  }
)

const fetchOrderDetail = async () => {
  if (!props.orderId) {
    console.warn('OrderDetailDialog: orderId is not provided')
    return
  }

  console.log('OrderDetailDialog: fetching order detail for ID:', props.orderId)
  loading.value = true
  try {
    const data = await getOrderDetail(props.orderId)
    console.log('OrderDetailDialog: received order detail:', data)
    orderDetail.value = data

    // 如果有外部数据,默认显示海绵API数据标签页
    if (orderDetail.value.externalRawData) {
      activeTab.value = 'raw'
      console.log('OrderDetailDialog: has external raw data, switching to raw tab')
    }
  } catch (error: any) {
    console.error('OrderDetailDialog: fetch failed:', error)
    ElMessage.error(error.message || '获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string | Date | null) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getRefundText = (refund: number) => {
  const map: Record<number, string> = {
    0: '默认',
    1: '申请退款',
    2: '已退款',
    3: '不予退款'
  }
  return map[refund] || '-'
}

const getRefundTagType = (refund: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'danger',
    3: 'success'
  }
  return map[refund] || 'info'
}

const getRefundStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '默认',
    1: '通过',
    2: '驳回'
  }
  return map[status] || '-'
}

const getRefundStatusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    ElMessage.success('JSON数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyAllData = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    ElMessage.success('所有海绵数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleClose = () => {
  visible.value = false
  orderDetail.value = {}
  activeTab.value = 'basic'
}
</script>

<style scoped lang="scss">
.order-detail-container {
  min-height: 400px;

  .amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
  }

  .raw-data-container {
    .data-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
    }

    .json-textarea {
      font-family: 'Courier New', monospace;
      font-size: 13px;

      :deep(.el-textarea__inner) {
        background-color: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}

// 黄色主题样式
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3);
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #FFA000 0%, #FFB800 100%);
  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4);
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, rgba(255, 201, 64, 0.08) 100%);
}

:deep(.el-tag--primary) {
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 201, 64, 0.15) 100%);
  border-color: #FFB800;
  color: #FFB800;
}
</style>
