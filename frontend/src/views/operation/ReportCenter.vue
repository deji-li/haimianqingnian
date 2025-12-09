<template>
  <div class="report-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>报表中心</h2>
        <p class="page-desc">生成和导出运营数据分析报表</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建报表
        </el-button>
      </div>
    </div>

    <!-- 报表模板 -->
    <el-card class="template-card">
      <template #header>
        <span>快速生成</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="template in reportTemplates" :key="template.id">
          <el-card
            class="template-item"
            :body-style="{ padding: '20px' }"
            shadow="hover"
            @click="generateReport(template)"
          >
            <div class="template-content">
              <div class="template-icon" :style="{ backgroundColor: template.color }">
                <el-icon size="24">
                  <component :is="template.icon" />
                </el-icon>
              </div>
              <div class="template-info">
                <div class="template-title">{{ template.title }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="报表类型">
          <el-select v-model="filterForm.type" placeholder="选择类型" clearable style="width: 150px">
            <el-option label="运营日报" value="daily" />
            <el-option label="运营周报" value="weekly" />
            <el-option label="运营月报" value="monthly" />
            <el-option label="业绩报表" value="performance" />
            <el-option label="转化分析" value="conversion" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人">
          <el-select v-model="filterForm.creator" placeholder="选择创建人" clearable style="width: 150px">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="生成中" value="generating" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报表列表 -->
    <el-card>
      <el-table v-loading="loading" :data="reportList" style="width: 100%">
        <el-table-column prop="name" label="报表名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="创建人" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dateRange" label="数据范围" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="100">
          <template #default="{ row }">
            {{ row.fileSize ? formatFileSize(row.fileSize) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed'"
              link
              type="primary"
              @click="downloadReport(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              link
              type="success"
              @click="previewReport(row)"
            >
              预览
            </el-button>
            <el-button
              v-if="row.status === 'generating'"
              link
              type="info"
              disabled
            >
              生成中
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              link
              type="warning"
              @click="retryGenerate(row)"
            >
              重试
            </el-button>
            <el-button link type="danger" @click="deleteReport(row)">删除</el-button>
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

    <!-- 创建报表对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建自定义报表"
      width="600px"
    >
      <el-form :model="createForm" :rules="formRules" label-width="100px">
        <el-form-item label="报表名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入报表名称" />
        </el-form-item>
        <el-form-item label="报表类型" prop="type">
          <el-select v-model="createForm.type" placeholder="选择报表类型" style="width: 100%">
            <el-option label="运营日报" value="daily" />
            <el-option label="运营周报" value="weekly" />
            <el-option label="运营月报" value="monthly" />
            <el-option label="业绩报表" value="performance" />
            <el-option label="转化分析" value="conversion" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据范围" prop="dateRange">
          <el-date-picker
            v-model="createForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="运营人员" prop="operators">
          <el-select
            v-model="createForm.operators"
            placeholder="选择运营人员（可多选）"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包含数据">
          <el-checkbox-group v-model="createForm.includeData">
            <el-checkbox label="accounts">账号数据</el-checkbox>
            <el-checkbox label="dailyReports">日报数据</el-checkbox>
            <el-checkbox label="customers">客户数据</el-checkbox>
            <el-checkbox label="commissions">提成数据</el-checkbox>
            <el-checkbox label="conversion">转化分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="输出格式">
          <el-radio-group v-model="createForm.format">
            <el-radio label="excel">Excel表格</el-radio>
            <el-radio label="pdf">PDF文档</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="submitting">
          创建报表
        </el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="`${previewReport?.name} - 预览`"
      width="80%"
      top="5vh"
    >
      <div class="preview-content">
        <div class="preview-toolbar">
          <el-button size="small" @click="downloadReport(previewReport!)">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
        <div class="preview-body">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            frameborder="0"
            style="width: 100%; height: 600px"
          ></iframe>
          <div v-else class="preview-loading">
            <el-skeleton :rows="10" animated />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, DataAnalysis, TrendCharts, PieChart, Document, User } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const reportList = ref<any[]>([])
const userList = ref<any[]>([])
const operatorList = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const showCreateDialog = ref(false)
const showPreviewDialog = ref(false)
const previewReportData = ref<any>(null)
const previewUrl = ref('')

// 筛选表单
const filterForm = reactive({
  type: '',
  creator: undefined as number | undefined,
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 创建表单
const createForm = reactive({
  name: '',
  type: '',
  dateRange: [] as string[],
  operators: [] as number[],
  includeData: ['accounts', 'dailyReports'] as string[],
  format: 'excel'
})

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入报表名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
}

// 报表模板
const reportTemplates = ref([
  {
    id: 1,
    title: '今日运营日报',
    description: '生成当天的运营数据报表',
    icon: 'Document',
    color: '#409eff',
    type: 'daily',
    dateRange: 'today'
  },
  {
    id: 2,
    title: '本周运营汇总',
    description: '本周运营数据统计和分析',
    icon: 'DataAnalysis',
    color: '#67c23a',
    type: 'weekly',
    dateRange: 'week'
  },
  {
    id: 3,
    title: '月度业绩报表',
    description: '月度运营业绩和提成分析',
    icon: 'TrendCharts',
    color: '#e6a23c',
    type: 'monthly',
    dateRange: 'month'
  },
  {
    id: 4,
    title: '转化分析报告',
    description: '客户转化漏斗和路径分析',
    icon: 'PieChart',
    color: '#f56c6c',
    type: 'conversion',
    dateRange: 'month'
  }
])

// 获取报表列表
const fetchReports = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `${['运营日报', '运营周报', '月度报表', '转化分析'][i % 4]}_${i + 1}`,
      type: ['daily', 'weekly', 'monthly', 'conversion'][i % 4],
      creatorName: `用户${i + 1}`,
      status: ['generating', 'completed', 'completed', 'failed'][i % 4],
      dateRange: '2024-01-01 至 2024-01-31',
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: i % 3 === 0 ? null : Math.floor(Math.random() * 1000000) + 100000
    }))
    reportList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    console.error('获取报表列表失败:', error)
    ElMessage.error('获取报表列表失败')
  } finally {
    loading.value = false
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await userApi.getUserList()
    userList.value = response.list || []
    operatorList.value = response.list?.filter(u => u.role === 'operation') || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 生成模板报表
const generateReport = (template: any) => {
  Object.assign(createForm, {
    name: template.title,
    type: template.type,
    dateRange: getDateRangeByType(template.dateRange),
    operators: [],
    includeData: ['accounts', 'dailyReports'],
    format: 'excel'
  })
  showCreateDialog.value = true
}

// 根据类型获取日期范围
const getDateRangeByType = (type: string): string[] => {
  const today = new Date()
  const formatDate = (date: Date) => date.toISOString().slice(0, 10)

  switch (type) {
    case 'today':
      return [formatDate(today), formatDate(today)]
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      return [formatDate(weekStart), formatDate(today)]
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return [formatDate(monthStart), formatDate(today)]
    default:
      return [formatDate(today), formatDate(today)]
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchReports()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    type: '',
    creator: undefined,
    status: ''
  })
  dateRange.value = null
  handleSearch()
}

// 确认创建报表
const confirmCreate = async () => {
  try {
    submitting.value = true
    // 这里应该调用创建报表的API
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('报表创建成功，正在生成中...')
    showCreateDialog.value = false
    fetchReports()
  } catch (error) {
    ElMessage.error('创建报表失败')
  } finally {
    submitting.value = false
  }
}

// 下载报表
const downloadReport = (row: any) => {
  // 模拟下载
  ElMessage.success(`正在下载: ${row.name}`)
  // 实际应该调用下载API
}

// 预览报表
const previewReport = (row: any) => {
  previewReportData.value = row
  showPreviewDialog.value = true
  // 模拟预览URL
  previewUrl.value = 'data:text/html,<html><body><h1>报表预览</h1><p>这里是报表内容...</p></body></html>'
}

// 重试生成
const retryGenerate = async (row: any) => {
  try {
    // 这里应该调用重试API
    ElMessage.success('重新生成中...')
    fetchReports()
  } catch (error) {
    ElMessage.error('重试失败')
  }
}

// 删除报表
const deleteReport = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报表"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 这里应该调用删除API
    ElMessage.success('删除成功')
    fetchReports()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 辅助函数
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'daily': 'primary',
    'weekly': 'success',
    'monthly': 'warning',
    'performance': 'danger',
    'conversion': 'info'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'daily': '运营日报',
    'weekly': '运营周报',
    'monthly': '运营月报',
    'performance': '业绩报表',
    'conversion': '转化分析'
  }
  return labelMap[type] || type
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    'generating': 'warning',
    'completed': 'success',
    'failed': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    'generating': '生成中',
    'completed': '已完成',
    'failed': '失败'
  }
  return labelMap[status] || status
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchReports()
  fetchUsers()
})
</script>

<style scoped>
.report-center {
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

.template-card {
  margin-bottom: 20px;
}

.template-item {
  cursor: pointer;
  transition: all 0.3s;
  height: 120px;
}

.template-item:hover {
  transform: translateY(-2px);
}

.template-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.template-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.template-info {
  flex: 1;
}

.template-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.template-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.preview-content {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.preview-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.preview-loading {
  padding: 20px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>