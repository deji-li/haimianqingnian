<template>
  <div class="commission-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>提成管理</h2>
        <p class="page-desc">管理运营人员的提成记录和审核</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.pendingCount || 0 }}</div>
                <div class="stats-label">待发放</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon approved">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.approvedCount || 0 }}</div>
                <div class="stats-label">已发放</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon rejected">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ stats.rejectedCount || 0 }}</div>
                <div class="stats-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">¥{{ formatMoney(stats.totalAmount || 0) }}</div>
                <div class="stats-label">总提成金额</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="运营人员">
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
        <el-form-item label="提成状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="待发放" value="待发放" />
            <el-option label="已发放" value="已发放" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="filterForm.orderNo"
            placeholder="输入订单号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button
            type="warning"
            :disabled="!hasSelected"
            @click="batchApprove"
          >
            批量审核
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提成记录列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="commissionList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />
        <el-table-column prop="orderTags" label="订单标签" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.orderTags" size="small">{{ row.orderTags }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatMoney(row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="commissionAmount" label="提成金额" width="120" sortable>
          <template #default="{ row }">
            <span class="commission-amount">¥{{ formatMoney(row.commissionAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '待发放'"
              link
              type="success"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === '待发放'"
              link
              type="danger"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button link type="primary" @click="viewOrderDetail(row)">查看订单</el-button>
            <el-button link type="info" @click="viewCustomerDetail(row)">查看客户</el-button>
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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="showApprovalDialog"
      :title="approvalType === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <div v-if="currentRecord" class="approval-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentRecord.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ currentRecord.customerName }}</el-descriptions-item>
          <el-descriptions-item label="运营人员">{{ currentRecord.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ formatMoney(currentRecord.orderAmount) }}</el-descriptions-item>
          <el-descriptions-item label="提成金额">¥{{ formatMoney(currentRecord.commissionAmount) }}</el-descriptions-item>
          <el-descriptions-item label="订单标签">{{ currentRecord.orderTags }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form :model="approvalForm" label-width="80px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input
            v-model="approvalForm.notes"
            type="textarea"
            :rows="3"
            :placeholder="approvalType === 'approve' ? '请输入审核通过备注（选填）' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showApprovalDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmApproval"
          :loading="submitting"
        >
          确认{{ approvalType === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量审核对话框 -->
    <el-dialog
      v-model="showBatchDialog"
      :title="`批量${batchType === 'approve' ? '通过' : '拒绝'}`"
      width="500px"
    >
      <div class="batch-info">
        <p>已选择 {{ selectedRows.length }} 条记录</p>
        <p>总提成金额：<span class="total-amount">¥{{ formatMoney(selectedTotalAmount) }}</span></p>
      </div>

      <el-form :model="batchForm" label-width="80px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input
            v-model="batchForm.notes"
            type="textarea"
            :rows="3"
            :placeholder="batchType === 'approve' ? '请输入审核通过备注（选填）' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmBatch"
          :loading="submitting"
        >
          确认{{ batchType === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Clock, Check, Close, Money } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import {
  operationApi,
  type CommissionRecord,
  type CommissionQuery
} from '@/api/operation'
import { userApi } from '@/api/user'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const commissionList = ref<CommissionRecord[]>([])
const operatorList = ref<any[]>([])
const selectedRows = ref<CommissionRecord[]>([])
const dateRange = ref<[string, string] | null>(null)
const showApprovalDialog = ref(false)
const showBatchDialog = ref(false)
const currentRecord = ref<CommissionRecord | null>(null)
const approvalType = ref<'approve' | 'reject'>('approve')
const batchType = ref<'approve' | 'reject'>('approve')

// 统计数据
const stats = reactive({
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  totalAmount: 0
})

// 筛选表单
const filterForm = reactive({
  operatorId: undefined as number | undefined,
  status: '',
  orderNo: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 审核表单
const approvalForm = reactive({
  notes: ''
})

// 批量操作表单
const batchForm = reactive({
  notes: ''
})

// 计算属性
const hasSelected = computed(() => selectedRows.value.length > 0)
const selectedTotalAmount = computed(() => {
  return selectedRows.value.reduce((sum, row) => sum + row.commissionAmount, 0)
})

// 获取提成列表
const fetchCommissions = async () => {
  loading.value = true
  try {
    const params: CommissionQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }
    const response = await operationApi.getCommissionList(params)
    commissionList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取提成列表失败:', error)
    ElMessage.error('获取提成列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const params = {
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      operatorId: filterForm.operatorId
    }
    const response = await operationApi.getCommissionSummary(params)
    Object.assign(stats, response)
  } catch (error) {
    console.error('获取统计数据失败:', error)
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

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCommissions()
  fetchStats()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    operatorId: undefined,
    status: '',
    orderNo: ''
  })
  dateRange.value = null
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: CommissionRecord[]) => {
  selectedRows.value = selection
}

// 单个审核通过
const handleApprove = (row: CommissionRecord) => {
  currentRecord.value = row
  approvalType.value = 'approve'
  approvalForm.notes = ''
  showApprovalDialog.value = true
}

// 单个审核拒绝
const handleReject = (row: CommissionRecord) => {
  currentRecord.value = row
  approvalType.value = 'reject'
  approvalForm.notes = ''
  showApprovalDialog.value = true
}

// 确认单个审核
const confirmApproval = async () => {
  if (!currentRecord.value) return

  try {
    const status = approvalType.value === 'approve' ? '已发放' : '已拒绝'
    await operationApi.updateCommissionStatus(
      currentRecord.value.id!,
      status,
      approvalForm.notes
    )
    ElMessage.success(`审核${approvalType.value === 'approve' ? '通过' : '拒绝'}成功`)
    showApprovalDialog.value = false
    fetchCommissions()
    fetchStats()
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 批量审核
const batchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的记录')
    return
  }

  const hasPending = selectedRows.value.some(row => row.status === '待发放')
  if (!hasPending) {
    ElMessage.warning('请选择待发放的记录')
    return
  }

  batchType.value = 'approve'
  batchForm.notes = ''
  showBatchDialog.value = true
}

// 确认批量操作
const confirmBatch = async () => {
  const status = batchType.value === 'approve' ? '已发放' : '已拒绝'
  const pendingRows = selectedRows.value.filter(row => row.status === '待发放')

  if (pendingRows.length === 0) {
    ElMessage.warning('没有待发放的记录')
    return
  }

  try {
    submitting.value = true
    const promises = pendingRows.map(row =>
      operationApi.updateCommissionStatus(row.id!, status, batchForm.notes)
    )
    await Promise.all(promises)
    ElMessage.success(`批量${batchType.value === 'approve' ? '通过' : '拒绝'}成功`)
    showBatchDialog.value = false
    selectedRows.value = []
    fetchCommissions()
    fetchStats()
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
  } finally {
    submitting.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    const params = {
      ...filterForm,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }
    const response = await operationApi.exportCommissions(params)

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `提成记录_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 查看订单详情
const viewOrderDetail = (row: CommissionRecord) => {
  router.push(`/order/detail/${row.orderId}`)
}

// 查看客户详情
const viewCustomerDetail = (row: CommissionRecord) => {
  router.push(`/customer/detail/${row.customerId}`)
}

// 辅助函数
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    '待发放': 'warning',
    '已发放': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchCommissions()
  fetchStats()
  fetchOperators()
})
</script>

<style scoped>
.commission-management {
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

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stats-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.approved {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.rejected {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.total {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.commission-amount {
  font-weight: bold;
  color: #67c23a;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.approval-info {
  margin-bottom: 20px;
}

.batch-info {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.batch-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.total-amount {
  font-weight: bold;
  color: #67c23a;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}
</style>