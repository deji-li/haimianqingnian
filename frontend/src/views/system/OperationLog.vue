<template>
  <div class="operation-log-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="操作模块">
          <el-select
            v-model="queryParams.module"
            placeholder="请选择模块"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="module in modules"
              :key="module"
              :label="module"
              :value="module"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 380px"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="danger" @click="handleClean">
            <el-icon><Delete /></el-icon>
            清理旧日志
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="logList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="action" label="操作动作" width="120" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="800px"
    >
      <el-descriptions v-if="currentLog" :column="2" border>
        <el-descriptions-item label="日志ID">
          {{ currentLog.id }}
        </el-descriptions-item>
        <el-descriptions-item label="操作用户">
          {{ currentLog.username }}
        </el-descriptions-item>
        <el-descriptions-item label="操作模块">
          {{ currentLog.module }}
        </el-descriptions-item>
        <el-descriptions-item label="操作动作">
          {{ currentLog.action }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ currentLog.ipAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentLog.status === 1 ? 'success' : 'danger'">
            {{ currentLog.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">
          {{ currentLog.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="User Agent" :span="2">
          {{ currentLog.userAgent }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorMsg" label="错误信息" :span="2">
          <el-text type="danger">{{ currentLog.errorMsg }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="请求详情" :span="2">
          <pre class="detail-json">{{ formatDetail(currentLog.detail) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { getLogList, getModules, cleanOldLogs, type OperationLog } from '@/api/log'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  username: '',
  module: '',
  startTime: '',
  endTime: '',
  status: undefined as number | undefined,
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 数据
const logList = ref<OperationLog[]>([])
const total = ref(0)
const loading = ref(false)
const modules = ref<string[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<OperationLog | null>(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startTime = dateRange.value[0]
      queryParams.endTime = dateRange.value[1]
    } else {
      queryParams.startTime = ''
      queryParams.endTime = ''
    }

    const data = await getLogList(queryParams)
    logList.value = data.list
    total.value = data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 获取模块列表
const fetchModules = async () => {
  try {
    modules.value = await getModules()
  } catch (error: any) {
    console.error('获取模块列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.page = 1
  queryParams.pageSize = 20
  queryParams.username = ''
  queryParams.module = ''
  queryParams.status = undefined
  dateRange.value = null
  fetchData()
}

// 查看详情
const handleViewDetail = (row: OperationLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 格式化详情 JSON
const formatDetail = (detail: string) => {
  try {
    const obj = JSON.parse(detail)
    return JSON.stringify(obj, null, 2)
  } catch {
    return detail
  }
}

// 清理旧日志
const handleClean = async () => {
  try {
    await ElMessageBox.confirm(
      '确认清理30天前的日志吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await cleanOldLogs()
    ElMessage.success(result.message)
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '清理失败')
    }
  }
}

onMounted(() => {
  fetchData()
  fetchModules()
})
</script>

<style scoped>
.operation-log-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  min-height: 600px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-json {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
}
</style>
