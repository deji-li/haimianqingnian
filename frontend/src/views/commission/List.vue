<template>
  <div class="commission-list">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">待发放提成</p>
              <p class="stat-value amount">¥{{ statistics.pending.amount.toFixed(2) }}</p>
              <p class="stat-count">{{ statistics.pending.count }} 笔</p>
            </div>
            <el-icon class="stat-icon" color="#FFB800"><Wallet /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">已发放提成</p>
              <p class="stat-value amount-success">¥{{ statistics.paid.amount.toFixed(2) }}</p>
              <p class="stat-count">{{ statistics.paid.count }} 笔</p>
            </div>
            <el-icon class="stat-icon" color="#67C23A"><Checked /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">已取消提成</p>
              <p class="stat-value">¥{{ statistics.cancelled.amount.toFixed(2) }}</p>
              <p class="stat-count">{{ statistics.cancelled.count }} 笔</p>
            </div>
            <el-icon class="stat-icon" color="#909399"><CircleClose /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">提成总额</p>
              <p class="stat-value">¥{{ statistics.total.amount.toFixed(2) }}</p>
              <p class="stat-count">{{ statistics.total.count }} 笔</p>
            </div>
            <el-icon class="stat-icon" color="#409EFF"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tabs 切换 -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 明细列表 -->
        <el-tab-pane label="提成明细" name="detail">
    <!-- 搜索和操作 -->
    <div>
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待发放" value="pending" />
            <el-option label="已发放" value="paid" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算月份">
          <el-date-picker
            v-model="queryForm.settlementMonth"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="success"
            :disabled="selectedRows.length === 0"
            @click="handleBatchSettle"
          >
            批量发放
          </el-button>
          <el-button
            type="warning"
            :disabled="tableData.length === 0"
            @click="handleExport"
          >
            导出数据
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="row => row.status === 'pending'" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户" width="120" />
        <el-table-column prop="userName" label="员工" width="100" />
        <el-table-column prop="userRole" label="角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.userRole === 'sales'" type="primary">销售</el-tag>
            <el-tag v-else-if="row.userRole === 'sales_manager'" type="warning">销售经理</el-tag>
            <el-tag v-else-if="row.userRole === 'campus_manager'" type="success">校区经理</el-tag>
            <el-tag v-else-if="row.userRole === 'operator'">运营</el-tag>
            <el-tag v-else type="info">{{ row.userRole }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.orderAmount ?? 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="commissionRate" label="提成比例" width="100" align="right">
          <template #default="{ row }">
            {{ row.commissionRate ?? 0 }}%
          </template>
        </el-table-column>
        <el-table-column prop="commissionAmount" label="提成金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.commissionAmount ?? 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待发放</el-tag>
            <el-tag v-else-if="row.status === 'paid'" type="success">已发放</el-tag>
            <el-tag v-else type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settlementMonth" label="结算月份" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="handleSettle(row)"
            >
              发放
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="warning"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </div>
        </el-tab-pane>

        <!-- 汇总报表 -->
        <el-tab-pane label="汇总报表" name="summary">
          <div class="summary-container">
            <!-- 日期筛选 -->
            <el-form :inline="true" style="margin-bottom: 16px">
              <el-form-item label="统计周期">
                <el-date-picker
                  v-model="summaryDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  @change="fetchSummaryData"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchSummaryData">查询</el-button>
                <el-button @click="handleResetSummary">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 按人员汇总 -->
            <h3 style="margin: 20px 0 10px 0">按人员汇总</h3>
            <el-table :data="userSummaryData" stripe v-loading="summaryLoading" border>
              <el-table-column prop="userName" label="姓名" width="120" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="userRole" label="角色" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.userRole === 'sales'" type="primary">销售</el-tag>
                  <el-tag v-else-if="row.userRole === 'sales_manager'" type="warning">销售经理</el-tag>
                  <el-tag v-else-if="row.userRole === 'campus_manager'" type="success">校区经理</el-tag>
                  <el-tag v-else-if="row.userRole === 'operator'">运营</el-tag>
                  <el-tag v-else type="info">{{ row.userRole }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalCount" label="总笔数" width="100" align="right" />
              <el-table-column prop="totalAmount" label="总提成金额" width="140" align="right">
                <template #default="{ row }">
                  <span class="amount">¥{{ (row.totalAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="pendingCount" label="待发放笔数" width="120" align="right" />
              <el-table-column prop="pendingAmount" label="待发放金额" width="140" align="right">
                <template #default="{ row }">
                  <span style="color: #FFB800">¥{{ (row.pendingAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paidCount" label="已发放笔数" width="120" align="right" />
              <el-table-column prop="paidAmount" label="已发放金额" width="140" align="right">
                <template #default="{ row }">
                  <span style="color: #67C23A">¥{{ (row.paidAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 按月份汇总 -->
            <h3 style="margin: 30px 0 10px 0">按月份汇总</h3>
            <el-table :data="monthSummaryData" stripe v-loading="summaryLoading" border>
              <el-table-column prop="month" label="月份" width="120" />
              <el-table-column prop="totalCount" label="总笔数" width="100" align="right" />
              <el-table-column prop="totalAmount" label="总提成金额" width="140" align="right">
                <template #default="{ row }">
                  <span class="amount">¥{{ (row.totalAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="pendingCount" label="待发放笔数" width="120" align="right" />
              <el-table-column prop="pendingAmount" label="待发放金额" width="140" align="right">
                <template #default="{ row }">
                  <span style="color: #FFB800">¥{{ (row.pendingAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paidCount" label="已发放笔数" width="120" align="right" />
              <el-table-column prop="paidAmount" label="已发放金额" width="140" align="right">
                <template #default="{ row }">
                  <span style="color: #67C23A">¥{{ (row.paidAmount ?? 0).toFixed(2) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="提成比例">
          <el-input-number
            v-model="editForm.commissionRate"
            :min="0"
            :max="100"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          >
            <template #suffix>%</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量发放对话框 -->
    <el-dialog v-model="settleDialogVisible" title="批量发放提成" width="400px">
      <el-form>
        <el-form-item label="结算月份">
          <el-date-picker
            v-model="settlementMonth"
            type="month"
            placeholder="选择结算月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>
        <el-alert
          :title="`将发放 ${selectedRows.length} 笔提成，总金额 ¥${selectedTotalAmount.toFixed(2)}`"
          type="warning"
          :closable="false"
          style="margin-top: 10px"
        />
      </el-form>
      <template #footer>
        <el-button @click="settleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchSettle">确认发放</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCommissionList,
  updateCommission,
  batchSettleCommission,
  getCommissionStatistics,
  getCommissionSummaryByUser,
  getCommissionSummaryByMonth,
  type Commission,
  type CommissionStatistics,
  type UserCommissionSummary,
  type MonthCommissionSummary,
} from '@/api/commission'
import { exportCommissions } from '@/utils/export'
import { formatDateTime } from '@/utils/date'

const loading = ref(false)
const tableData = ref<Commission[]>([])
const total = ref(0)
const selectedRows = ref<Commission[]>([])
const activeTab = ref('detail')

// 汇总报表数据
const summaryLoading = ref(false)
const summaryDateRange = ref<[string, string] | null>(null)
const userSummaryData = ref<UserCommissionSummary[]>([])
const monthSummaryData = ref<MonthCommissionSummary[]>([])

const queryForm = reactive({
  page: 1,
  pageSize: 20,
  status: '',
  settlementMonth: '',
})

const statistics = ref<CommissionStatistics>({
  pending: { amount: 0, count: 0 },
  paid: { amount: 0, count: 0 },
  cancelled: { amount: 0, count: 0 },
  total: { amount: 0, count: 0 },
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const editForm = reactive({
  id: 0,
  commissionRate: 0,
  remark: '',
})

const settleDialogVisible = ref(false)
const settlementMonth = ref('')

const selectedTotalAmount = computed(() => {
  return selectedRows.value.reduce((sum, row) => sum + (row.commissionAmount ?? 0), 0)
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCommissionList(queryForm)
    if (isUnmounting.value) return // 组件卸载中，跳过状态更新
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    if (isUnmounting.value) return // 组件卸载中，跳过错误提示
    ElMessage.error('获取数据失败')
  } finally {
    if (!isUnmounting.value) {
      loading.value = false
    }
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getCommissionStatistics()
    if (isUnmounting.value) return // 组件卸载中，跳过状态更新
    statistics.value = res
  } catch (error) {
    if (!isUnmounting.value) {
      console.error('Failed to fetch statistics:', error)
    }
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryForm.status = ''
  queryForm.settlementMonth = ''
  handleSearch()
}

// 选择变化
const handleSelectionChange = (rows: Commission[]) => {
  selectedRows.value = rows
}

// 编辑
const handleEdit = (row: Commission) => {
  dialogTitle.value = '编辑提成'
  editForm.id = row.id
  editForm.commissionRate = row.commissionRate
  editForm.remark = row.remark || ''
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  try {
    await updateCommission(editForm.id, {
      commissionRate: editForm.commissionRate,
      remark: editForm.remark,
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 发放单笔
const handleSettle = async (row: Commission) => {
  try {
    await ElMessageBox.confirm(`确认发放提成 ¥${(row.commissionAmount ?? 0).toFixed(2)} 吗？`, '提示', {
      type: 'warning',
    })

    const currentMonth = new Date().toISOString().slice(0, 7)
    await updateCommission(row.id, {
      status: 'paid',
      settlementMonth: currentMonth,
    })

    ElMessage.success('发放成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    // 用户取消
  }
}

// 取消提成
const handleCancel = async (row: Commission) => {
  try {
    await ElMessageBox.confirm('确认取消该提成吗？', '提示', {
      type: 'warning',
    })

    await updateCommission(row.id, { status: 'cancelled' })
    ElMessage.success('取消成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    // 用户取消
  }
}

// 批量发放
const handleBatchSettle = () => {
  settlementMonth.value = new Date().toISOString().slice(0, 7)
  settleDialogVisible.value = true
}

// 确认批量发放
const handleConfirmBatchSettle = async () => {
  if (!settlementMonth.value) {
    ElMessage.warning('请选择结算月份')
    return
  }

  try {
    const ids = selectedRows.value.map(row => row.id)
    await batchSettleCommission(ids, settlementMonth.value)
    ElMessage.success('批量发放成功')
    settleDialogVisible.value = false
    selectedRows.value = []
    fetchData()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('批量发放失败')
  }
}

// 导出数据
const handleExport = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  try {
    exportCommissions(tableData.value)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// Tab切换
const handleTabChange = (tabName: string) => {
  if (tabName === 'summary') {
    fetchSummaryData()
  }
}

// 获取汇总数据
const fetchSummaryData = async () => {
  summaryLoading.value = true
  try {
    const startDate = summaryDateRange.value?.[0]
    const endDate = summaryDateRange.value?.[1]

    const [userSummary, monthSummary] = await Promise.all([
      getCommissionSummaryByUser(startDate, endDate),
      getCommissionSummaryByMonth(startDate, endDate),
    ])

    if (isUnmounting.value) return // 组件卸载中，跳过状态更新
    userSummaryData.value = userSummary
    monthSummaryData.value = monthSummary
  } catch (error) {
    if (isUnmounting.value) return // 组件卸载中，跳过错误提示
    ElMessage.error('获取汇总数据失败')
  } finally {
    if (!isUnmounting.value) {
      summaryLoading.value = false
    }
  }
}

// 重置汇总筛选
const handleResetSummary = () => {
  summaryDateRange.value = null
  fetchSummaryData()
}

// 组件卸载标志
const isUnmounting = ref(false)

onMounted(() => {
  fetchData()
  fetchStatistics()
})

onBeforeUnmount(() => {
  // 标记组件正在卸载，防止异步操作更新已卸载的组件
  isUnmounting.value = true
})
</script>

<style scoped lang="scss">
.commission-list {
  .stat-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    .stat-icon {
      font-size: 48px;
      opacity: 0.3;
    }

    .stat-info {
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;

        &.amount {
          color: #FFB800;
        }

        &.amount-success {
          color: #67C23A;
        }
      }

      .stat-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .amount {
    color: #FFB800;
    font-weight: 500;
  }
}
</style>
