<template>
  <div class="sync-logs">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">企业微信同步日志</span>
          <div class="header-actions">
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-area">
        <el-form :model="searchForm" inline>
          <el-form-item label="同步类型">
            <el-select v-model="searchForm.syncType" placeholder="全部" clearable>
              <el-option label="联系人同步" value="contact" />
              <el-option label="消息同步" value="message" />
              <el-option label="数据同步" value="data" />
            </el-select>
          </el-form-item>
          <el-form-item label="同步状态">
            <el-select v-model="searchForm.syncStatus" placeholder="全部" clearable>
              <el-option label="运行中" value="running" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="触发类型">
            <el-select v-model="searchForm.triggerType" placeholder="全部" clearable>
              <el-option label="手动触发" value="manual" />
              <el-option label="自动触发" value="auto" />
              <el-option label="定时触发" value="schedule" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ statistics.total || 0 }}</div>
                <div class="stats-label">总同步次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon primary">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ getRunningCount() }}</div>
                <div class="stats-label">运行中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ getCompletedCount() }}</div>
                <div class="stats-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon danger">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ getFailedCount() }}</div>
                <div class="stats-label">失败</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="title">
            同步日志列表
            <el-tag v-if="total" type="info" class="total-tag">
              共 {{ total }} 条
            </el-tag>
          </span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="logList"
        stripe
        border
      >
        <el-table-column prop="syncType" label="同步类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getSyncTypeColor(row.syncType)" size="small">
              {{ getSyncTypeText(row.syncType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="syncDirection" label="同步方向" width="120">
          <template #default="{ row }">
            <el-tag :type="getSyncDirectionColor(row.syncDirection)" size="small">
              {{ getSyncDirectionText(row.syncDirection) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="totalCount" label="总数据量" width="100" align="center">
          <template #default="{ row }">
            <span class="count-text">{{ row.totalCount || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="成功/失败" width="120" align="center">
          <template #default="{ row }">
            <div class="result-counts">
              <span class="success-count">{{ row.successCount || 0 }}</span>
              <span class="separator">/</span>
              <span class="failed-count">{{ row.failedCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="syncStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSyncStatusColor(row.syncStatus)" size="small">
              {{ getSyncStatusText(row.syncStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="triggerType" label="触发类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTriggerTypeColor(row.triggerType)" size="small">
              {{ getTriggerTypeText(row.triggerType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="durationSeconds" label="耗时" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.durationSeconds">{{ formatDuration(row.durationSeconds) }}</span>
            <span v-else class="placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="endTime" label="结束时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.syncStatus === 'failed'"
              type="warning"
              size="small"
              link
              @click="handleRetry(row)"
            >
              重试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="同步日志详情"
      width="800px"
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="同步ID">
            {{ currentLog.id }}
          </el-descriptions-item>
          <el-descriptions-item label="同步类型">
            <el-tag :type="getSyncTypeColor(currentLog.syncType)" size="small">
              {{ getSyncTypeText(currentLog.syncType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="同步方向">
            <el-tag :type="getSyncDirectionColor(currentLog.syncDirection)" size="small">
              {{ getSyncDirectionText(currentLog.syncDirection) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="触发类型">
            <el-tag :type="getTriggerTypeColor(currentLog.triggerType)" size="small">
              {{ getTriggerTypeText(currentLog.triggerType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总数据量">
            {{ currentLog.totalCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="成功数量">
            <span class="success-text">{{ currentLog.successCount || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="失败数量">
            <span class="error-text">{{ currentLog.failedCount || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getSyncStatusColor(currentLog.syncStatus)" size="small">
              {{ getSyncStatusText(currentLog.syncStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDateTime(currentLog.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDateTime(currentLog.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="耗时">
            {{ currentLog.durationSeconds ? formatDuration(currentLog.durationSeconds) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="触发用户">
            {{ currentLog.triggerUserId || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentLog.errorMessage" class="error-section">
          <div class="section-title">错误信息</div>
          <el-alert
            :title="currentLog.errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <div v-if="currentLog.syncDetails" class="details-section">
          <div class="section-title">同步详情</div>
          <el-card>
            <pre class="json-content">{{ JSON.stringify(currentLog.syncDetails, null, 2) }}</pre>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Search,
  RefreshRight,
  Check,
  Loading,
  CircleCheck,
  CircleClose,
} from '@element-plus/icons-vue'
import {
  getWeWorkSyncLogs,
  type SyncLog,
  type SyncLogQuery,
} from '@/api/wework'

// 响应式数据
const loading = ref(false)
const logList = ref<SyncLog[]>([])
const total = ref(0)
const statistics = ref({
  total: 0,
  running: 0,
  completed: 0,
  failed: 0,
})

// 搜索表单
const searchForm = reactive({
  syncType: '',
  syncStatus: '',
  triggerType: '',
})

const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<SyncLog | null>(null)

// 获取日志列表
const loadLogList = async () => {
  try {
    loading.value = true
    const params: SyncLogQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      syncType: searchForm.syncType,
      syncStatus: searchForm.syncStatus,
    }

    const response = await getWeWorkSyncLogs(params)
    logList.value = response.list
    total.value = response.total

    // 更新统计数据
    updateStatistics(response.list)
  } catch (error) {
    console.error('获取同步日志失败:', error)
    ElMessage.error('获取同步日志失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = (logs: SyncLog[]) => {
  statistics.value = {
    total: logs.length,
    running: logs.filter(log => log.syncStatus === 'running').length,
    completed: logs.filter(log => log.syncStatus === 'completed').length,
    failed: logs.filter(log => log.syncStatus === 'failed').length,
  }
}

// 计算属性
const getRunningCount = () => statistics.value.running
const getCompletedCount = () => statistics.value.completed
const getFailedCount = () => statistics.value.failed

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadLogList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    syncType: '',
    syncStatus: '',
    triggerType: '',
  })
  dateRange.value = null
  pagination.page = 1
  loadLogList()
}

// 刷新
const handleRefresh = () => {
  loadLogList()
}

// 日期范围变化
const handleDateChange = (dates: [string, string] | null) => {
  // 这里可以添加日期筛选逻辑
  console.log('日期范围:', dates)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadLogList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadLogList()
}

// 查看详情
const handleViewDetail = (row: SyncLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 重试
const handleRetry = (row: SyncLog) => {
  ElMessage.info('重试功能开发中')
}

// 辅助函数
const getSyncTypeText = (type: string) => {
  const map = {
    contact: '联系人',
    message: '消息',
    data: '数据',
  }
  return map[type] || type
}

const getSyncTypeColor = (type: string) => {
  const map = {
    contact: 'primary',
    message: 'success',
    data: 'info',
  }
  return map[type] || 'info'
}

const getSyncDirectionText = (direction: string) => {
  const map = {
    wework_to_crm: '企微→CRM',
    crm_to_wework: 'CRM→企微',
    bidirectional: '双向同步',
  }
  return map[direction] || direction
}

const getSyncDirectionColor = (direction: string) => {
  const map = {
    wework_to_crm: 'primary',
    crm_to_wework: 'success',
    bidirectional: 'warning',
  }
  return map[direction] || 'info'
}

const getSyncStatusText = (status: string) => {
  const map = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}

const getSyncStatusColor = (status: string) => {
  const map = {
    running: 'warning',
    completed: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

const getTriggerTypeText = (type: string) => {
  const map = {
    manual: '手动',
    auto: '自动',
    schedule: '定时',
  }
  return map[type] || type
}

const getTriggerTypeColor = (type: string) => {
  const map = {
    manual: 'primary',
    auto: 'success',
    schedule: 'info',
  }
  return map[type] || 'info'
}

const formatDateTime = (dateTime: string | Date | null) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}时${minutes}分${remainingSeconds}秒`
  }
}

// 组件挂载
onMounted(() => {
  loadLogList()
})
</script>

<style lang="scss" scoped>
.sync-logs {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-area {
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 16px;
  }
}

.stats-cards {
  margin-bottom: 20px;

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stats-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.success {
          background: #f0f9ff;
          color: #67c23a;
        }

        &.primary {
          background: #f0f9ff;
          color: #409eff;
        }

        &.danger {
          background: #fef0f0;
          color: #f56c6c;
        }

        &.warning {
          background: #fdf6ec;
          color: #e6a23c;
        }
      }

      .stats-info {
        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
        }

        .stats-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }
}

.table-card {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .total-tag {
        margin-left: 8px;
      }
    }
  }

  .result-counts {
    .success-count {
      color: #67c23a;
      font-weight: 500;
    }

    .separator {
      margin: 0 4px;
      color: #909399;
    }

    .failed-count {
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .count-text {
    font-weight: 500;
    color: #303133;
  }

  .placeholder {
    color: #c0c4cc;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

.log-detail {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 20px 0 12px 0;
  }

  .success-text {
    color: #67c23a;
    font-weight: 500;
  }

  .error-text {
    color: #f56c6c;
    font-weight: 500;
  }

  .error-section {
    margin-top: 20px;
  }

  .details-section {
    margin-top: 20px;

    .json-content {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: #606266;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>