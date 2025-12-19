<template>
  <div class="customer-insights">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总洞察数" :value="stats.totalInsights" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="涉及客户" :value="stats.customerCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="本周新增" :value="stats.weeklyNew" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="高价值洞察" :value="stats.highValue" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="洞察类型">
          <el-select v-model="filter.insightType" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="痛点" value="pain_point" />
            <el-option label="需求" value="need" />
            <el-option label="兴趣点" value="interest" />
            <el-option label="客户异议" value="objection" />
            <el-option label="客户问题" value="question" />
            <el-option label="提及竞品" value="competitor" />
            <el-option label="退费原因" value="refund_reason" />
            <el-option label="关注焦点" value="focus" />
            <el-option label="建议" value="suggestion" />
            <el-option label="预算相关" value="budget" />
            <el-option label="时间规划" value="timeline" />
            <el-option label="决策者" value="decision_maker" />
            <el-option label="联系方式" value="contact_info" />
            <el-option label="购买意向" value="purchase_intention" />
            <el-option label="售后服务" value="after_sales" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="至"
            placeholder="选择时间范围"
          />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="filter.customerId" filterable clearable>
            <el-option
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.realName || customer.userName"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="extractInsights" :loading="extracting">
            {{ extracting ? '提取中...' : '提取洞察' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 洞察列表 -->
    <el-card>
      <el-table :data="insightList" v-loading="loading">
        <el-table-column prop="content" label="洞察内容" min-width="300">
          <template #default="scope">
            <el-tag :type="getInsightTypeColor(scope.row.insightType)" size="small">
              {{ getInsightTypeName(scope.row.insightType) }}
            </el-tag>
            {{ scope.row.content }}
          </template>
        </el-table-column>
        <el-table-column prop="mentionCount" label="提及次数" width="120" sortable />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="text" @click="showDetail(scope.row)">查看详情</el-button>
            <el-button type="text" @click="viewCustomer(scope.row.customerId)">查看客户</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        class="mt-4"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="洞察详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="洞察类型">
          {{ getInsightTypeName(currentDetail.insightType) }}
        </el-descriptions-item>
        <el-descriptions-item label="提及次数">
          {{ currentDetail.mentionCount }}
        </el-descriptions-item>
        <el-descriptions-item label="相关客户" :span="2">
          {{ currentDetail.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="来源" :span="2">
          聊天记录分析
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h4>相关聊天记录</h4>
      <el-table :data="relatedChats" max-height="300">
        <el-table-column prop="wechatId" label="微信号" />
        <el-table-column prop="chatDate" label="聊天日期" />
        <el-table-column prop="qualityLevel" label="质量等级">
          <template #default="scope">
            <el-tag :type="getQualityType(scope.row.qualityLevel)">
              {{ scope.row.qualityLevel }}级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="text" @click="viewChatDetail(scope.row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getCustomerInsights, getInsightStats, getCustomerList, extractInsightsFromChat } from '@/api/ai-assistant'

const router = useRouter()

// 数据定义
const loading = ref(false)
const insightList = ref([])
const customerList = ref([])
const stats = ref({})
const showDetailDialog = ref(false)
const currentDetail = ref({})
const relatedChats = ref([])

// 筛选条件
const filter = reactive({
  insightType: '',
  customerId: null,
  dateRange: [],
})

// 提取状态
const extracting = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 获取洞察列表
const fetchInsights = async () => {
  loading.value = true
  try {
    const params = {
      ...filter,
      page: pagination.page,
      limit: pagination.pageSize,
    }
    const res = await getCustomerInsights(params)
    insightList.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    ElMessage.error('获取洞察数据失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getInsightStats()
    stats.value = {
      totalInsights: res.totalInsights || 0,
      customerCount: res.customerCount || 0,
      weeklyNew: res.weeklyNew || 0,
      highValue: res.highValue || 0,
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const res = await getCustomerList()
    customerList.value = res.data || []
  } catch (error) {
    console.error('获取客户列表失败', error)
  }
}

// 工具方法
const getInsightTypeName = (type: string) => {
  const typeMap = {
    // 支持的类型
    pain_point: '痛点',
    need: '需求',
    interest: '兴趣点',
    objection: '客户异议',
    question: '客户问题',
    competitor: '提及竞品',
    refund_reason: '退费原因',
    focus: '关注焦点',
    suggestion: '建议',
    // 新增的洞察类型
    budget: '预算相关',
    timeline: '时间规划',
    decision_maker: '决策者',
    contact_info: '联系方式',
    purchase_intention: '购买意向',
    after_sales: '售后服务',
  }
  return typeMap[type] || type
}

const getInsightTypeColor = (type: string) => {
  const colorMap = {
    pain_point: 'danger',
    need: 'primary',
    interest: 'success',
    objection: 'danger',
    question: 'warning',
    competitor: 'info',
    refund_reason: 'danger',
    focus: 'primary',
    suggestion: 'success',
    budget: 'warning',
    timeline: 'info',
    decision_maker: 'primary',
    contact_info: 'success',
    purchase_intention: 'danger',
    after_sales: 'info',
  }
  return colorMap[type] || ''
}

const getQualityType = (level: string) => {
  const typeMap = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }
  return typeMap[level] || 'info'
}

// 事件处理
const handleFilter = () => {
  pagination.page = 1
  fetchInsights()
}

const resetFilter = () => {
  Object.assign(filter, {
    insightType: '',
    customerId: null,
    dateRange: [],
  })
  handleFilter()
}

const handlePageChange = () => {
  fetchInsights()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchInsights()
}

const showDetail = async (row: any) => {
  currentDetail.value = row
  // TODO: 获取相关聊天记录
  relatedChats.value = []
  showDetailDialog.value = true
}

const viewCustomer = (customerId: number) => {
  router.push(`/customer/detail/${customerId}`)
}

const viewChatDetail = (chatId: number) => {
  router.push(`/ai/chat/detail/${chatId}`)
}

// 提取客户洞察
const extractInsights = async () => {
  extracting.value = true
  try {
    ElMessage.info('开始从聊天记录提取客户洞察，请稍候...')

    const result = await extractInsightsFromChat({
      // 可以根据筛选条件设置时间范围
      startDate: filter.dateRange?.[0],
      endDate: filter.dateRange?.[1],
    })

    ElMessage.success(`成功从 ${result.processedCount || 0} 条聊天记录中提取了 ${result.insightCount || 0} 个洞察`)

    // 刷新数据
    await Promise.all([
      fetchStats(),
      fetchInsights()
    ])

  } catch (error) {
    console.error('提取洞察失败:', error)
    ElMessage.error('提取洞察失败，请稍后重试')
  } finally {
    extracting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchCustomers()
  fetchInsights()
})
</script>

<style scoped lang="scss">
.customer-insights {
  .stats-row {
    margin-bottom: 20px;
  }

  .filter-card {
    margin-bottom: 20px;
  }
}
</style>