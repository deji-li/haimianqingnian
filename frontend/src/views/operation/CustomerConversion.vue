<template>
  <div class="customer-conversion">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>客户转化分析</h2>
        <p class="page-desc">追踪运营引流客户的转化情况</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 转化漏斗概览 -->
    <el-card class="funnel-overview">
      <template #header>
        <span>转化漏斗概览</span>
      </template>
      <div ref="funnelChartRef" class="funnel-chart"></div>
    </el-card>

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
        <el-form-item label="客户状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="潜在客户" value="潜在客户" />
            <el-option label="咨询中" value="咨询中" />
            <el-option label="试听中" value="试听中" />
            <el-option label="已成交" value="已成交" />
            <el-option label="流失" value="流失" />
          </el-select>
        </el-form-item>
        <el-form-item label="转化阶段">
          <el-select v-model="filterForm.conversionStage" placeholder="选择阶段" clearable style="width: 150px">
            <el-option label="引流" value="引流" />
            <el-option label="初步接触" value="初步接触" />
            <el-option label="深度咨询" value="深度咨询" />
            <el-option label="试听体验" value="试听体验" />
            <el-option label="成交转化" value="成交转化" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源平台">
          <el-select v-model="filterForm.platform" placeholder="选择平台" clearable style="width: 150px">
            <el-option label="小红书" value="小红书" />
            <el-option label="抖音" value="抖音" />
            <el-option label="视频号" value="视频号" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源城市">
          <el-select v-model="filterForm.city" placeholder="选择城市" clearable style="width: 150px">
            <el-option label="广州" value="广州" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="���京" value="北京" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 客户列表 -->
    <el-card>
      <el-table v-loading="loading" :data="customerList" style="width: 100%">
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />
        <el-table-column prop="trafficPlatform" label="来源平台" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformTagType(row.trafficPlatform)" size="small">
              {{ row.trafficPlatform }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trafficCity" label="来源城市" width="100" />
        <el-table-column prop="status" label="客户状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="conversionStage" label="转化阶段" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="80" sortable>
          <template #default="{ row }">
            <el-badge :value="row.orderCount" :max="99" type="primary">
              <span>{{ row.orderCount }}</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120" sortable>
          <template #default="{ row }">
            <span v-if="row.totalAmount > 0" class="amount-text">
              ¥{{ formatMoney(row.totalAmount) }}
            </span>
            <span v-else class="no-order">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="conversionRate" label="转化率" width="100" sortable>
          <template #default="{ row }">
            <span v-if="row.conversionRate !== undefined" :class="getConversionClass(row.conversionRate)">
              {{ row.conversionRate }}%
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="引流时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastOrderDate" label="最后成交" width="180">
          <template #default="{ row }">
            {{ row.lastOrderDate ? formatDate(row.lastOrderDate) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewCustomer(row)">查看详情</el-button>
            <el-button link type="info" @click="viewConversionPath(row)">转化路径</el-button>
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

    <!-- 转化路径对话框 -->
    <el-dialog v-model="showPathDialog" title="客户转化路径" width="600px">
      <div v-if="currentCustomer" class="conversion-path">
        <el-timeline>
          <el-timeline-item
            v-for="item in conversionPath"
            :key="item.id"
            :timestamp="formatDate(item.timestamp)"
            :type="getTimelineType(item.stage)"
          >
            <div class="path-item">
              <div class="stage-title">{{ item.stage }}</div>
              <div class="stage-desc">{{ item.description }}</div>
              <div v-if="item.operator" class="stage-operator">负责人：{{ item.operator }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="showPathDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  operationApi,
  type CustomerConversion
} from '@/api/operation'
import { userApi } from '@/api/user'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const customerList = ref<CustomerConversion[]>([])
const operatorList = ref<any[]>([])
const showPathDialog = ref(false)
const currentCustomer = ref<CustomerConversion | null>(null)
const conversionPath = ref<any[]>([])

// 筛选表单
const filterForm = reactive({
  operatorId: undefined as number | undefined,
  status: '',
  conversionStage: '',
  platform: '',
  city: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 图表实例
let funnelChart: echarts.ECharts | null = null
const funnelChartRef = ref<HTMLElement>()

// 获取客户列表
const fetchCustomers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    const response = await operationApi.getOperationCustomers(params)
    customerList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取客户列表失败:', error)
    ElMessage.error('获取客户列表失败')
  } finally {
    loading.value = false
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

// 初始化转化漏斗图
const initFunnelChart = async () => {
  if (!funnelChartRef.value) return

  funnelChart = echarts.init(funnelChartRef.value)

  try {
    const response = await operationApi.getConversionFunnel()
    updateFunnelChart(response)
  } catch (error) {
    // 使用模拟数据
    updateFunnelChart({
      stages: [
        { name: '引流', value: 1000 },
        { name: '初步接触', value: 600 },
        { name: '深度咨询', value: 300 },
        { name: '试听体验', value: 150 },
        { name: '成交转化', value: 80 }
      ]
    })
  }
}

// 更新转化漏斗图
const updateFunnelChart = (data: any) => {
  if (!funnelChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: data.stages || [
        { value: 1000, name: '引流' },
        { value: 600, name: '初步接触' },
        { value: 300, name: '深度咨询' },
        { value: 150, name: '试听体验' },
        { value: 80, name: '成交转化' }
      ]
    }]
  }

  funnelChart.setOption(option)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCustomers()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    operatorId: undefined,
    status: '',
    conversionStage: '',
    platform: '',
    city: ''
  })
  handleSearch()
}

// 查看客户详情
const viewCustomer = (row: CustomerConversion) => {
  router.push(`/customer/detail/${row.id}`)
}

// 查看转化路径
const viewConversionPath = (row: CustomerConversion) => {
  currentCustomer.value = row
  // 模拟转化路径数据
  conversionPath.value = [
    {
      id: 1,
      stage: '引流成功',
      description: `通过${row.trafficPlatform}平台引流成功`,
      timestamp: row.createdAt,
      operator: row.operatorName
    },
    {
      id: 2,
      stage: '初步接触',
      description: '销售首次联系客户',
      timestamp: new Date(new Date(row.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      operator: '销售顾问'
    },
    {
      id: 3,
      stage: '深度咨询',
      description: '客户咨询课程详情',
      timestamp: new Date(new Date(row.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      operator: '课程顾问'
    }
  ]

  if (row.orderCount > 0) {
    conversionPath.value.push({
      id: 4,
      stage: '试听体验',
      description: '客户参与试听课程',
      timestamp: new Date(new Date(row.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      operator: '授课老师'
    })
    conversionPath.value.push({
      id: 5,
      stage: '成交转化',
      description: `成功报名，订单金额¥${formatMoney(row.totalAmount)}`,
      timestamp: row.lastOrderDate!,
      operator: '销售顾问'
    })
  }

  showPathDialog.value = true
}

// 导出数据
const exportData = async () => {
  try {
    const params = {
      ...filterForm
    }
    // 这里应该调用导出API
    ElMessage.success('导出功能开发中')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  funnelChart?.resize()
}

// 辅助函数
const getPlatformTagType = (platform: string) => {
  const typeMap: Record<string, string> = {
    '小红书': 'danger',
    '抖音': 'primary',
    '视频号': 'success'
  }
  return typeMap[platform] || 'info'
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    '潜在客户': 'info',
    '咨询中': 'warning',
    '试听中': 'primary',
    '已成交': 'success',
    '流失': 'danger'
  }
  return typeMap[status] || 'info'
}

const getTimelineType = (stage: string) => {
  const typeMap: Record<string, string> = {
    '引流成功': 'primary',
    '初步接触': 'warning',
    '深度咨询': 'warning',
    '试听体验': 'primary',
    '成交转化': 'success'
  }
  return typeMap[stage] || 'primary'
}

const getConversionClass = (rate: number) => {
  if (!rate) return ''
  if (rate >= 10) return 'high-conversion'
  if (rate >= 5) return 'medium-conversion'
  return 'low-conversion'
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
  fetchCustomers()
  fetchOperators()
  initFunnelChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  funnelChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.customer-conversion {
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

.funnel-overview {
  margin-bottom: 20px;
  height: 400px;
}

.funnel-overview :deep(.el-card__body) {
  height: calc(100% - 60px);
  padding: 20px;
}

.funnel-chart {
  width: 100%;
  height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.amount-text {
  color: #67c23a;
  font-weight: bold;
}

.no-order {
  color: #909399;
}

.high-conversion {
  color: #67c23a;
  font-weight: bold;
}

.medium-conversion {
  color: #e6a23c;
}

.low-conversion {
  color: #f56c6c;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.conversion-path {
  max-height: 400px;
  overflow-y: auto;
}

.path-item {
  padding-bottom: 10px;
}

.stage-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stage-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 3px;
}

.stage-operator {
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
}
</style>