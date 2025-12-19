<template>
  <div class="staff-quality">
    <!-- 顶部统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="AI质检数" :value="stats.totalChecked" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="出现违规" :value="stats.violations" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="SOP完成率" :value="stats.sopCompletionRate" suffix="%" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="高意向客户" :value="stats.highIntentCount" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="员工">
          <el-select v-model="filter.userId" clearable filterable>
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.userName || user.realName"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="triggerQualityCheck" :loading="triggering">
            {{ triggering ? '质检中...' : '触发质检' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标签页：SOP质检 | 违规质检 | 执行力报表 -->
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- SOP质检 -->
        <el-tab-pane label="SOP质检" name="sop">
          <el-table :data="sopList" v-loading="loading">
            <el-table-column prop="customerName" label="客户" width="150" />
            <el-table-column prop="chatDate" label="聊天日期" width="180" sortable />
            <el-table-column prop="sopStatus" label="SOP完成状态" width="120">
              <template #default="scope">
                <el-tag
                  :type="getSopStatusType(scope.row.sopStatus)"
                  size="small"
                >
                  {{ getSopStatusName(scope.row.sopStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sopScore" label="SOP得分" width="100">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.sopScore"
                  :color="getScoreColor(scope.row.sopScore)"
                  :stroke-width="8"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="text" @click="viewDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 违规质检 -->
        <el-tab-pane label="违规质检" name="violation">
          <el-table :data="violationList" v-loading="loading">
            <el-table-column prop="customerName" label="客户" width="150" />
            <el-table-column prop="chatDate" label="聊天日期" width="180" sortable />
            <el-table-column prop="violationItems" label="违规项" min-width="300">
              <template #default="scope">
                <el-tag
                  v-for="item in scope.row.violationItems"
                  :key="item"
                  :type="getViolationType(item)"
                  size="small"
                  class="mr-1"
                >
                  {{ item }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="violationContent" label="违规内容" min-width="400">
              <template #default="scope">
                <div v-html="highlightViolations(scope.row.violationContent, scope.row.violationKeywords)"></div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="text" @click="viewDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 执行力报表 -->
        <el-tab-pane label="执行力报表" name="report">
          <el-table :data="reportList" v-loading="loading" show-summary>
            <el-table-column prop="employeeName" label="员工姓名" width="120" />
            <el-table-column prop="totalChats" label="聊天会话数" width="120" sortable />
            <el-table-column prop="totalMessages" label="消息总数" width="100" sortable />
            <el-table-column prop="avgResponseTime" label="平均响应时间(秒)" width="150" sortable />
            <el-table-column prop="sopCompletedCount" label="SOP完成数" width="120" sortable />
            <el-table-column prop="violationCount" label="违规次数" width="100" sortable />
            <el-table-column prop="highIntentCount" label="高意向客户" width="120" sortable />
            <el-table-column prop="completionRate" label="SOP完成率" width="120">
              <template #default="scope">
                {{ scope.row.completionRate }}%
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getQualityStats,
  getSopList,
  getViolationList,
  getReportList,
  getUserList,
} from '@/api/ai-assistant'
import request from '@/utils/request'

// 数据定义
const loading = ref(false)
const activeTab = ref('sop')
const userList = ref([])
const stats = ref({})

// 列表数据
const sopList = ref([])
const violationList = ref([])
const reportList = ref([])

// 筛选条件
const filter = reactive({
  userId: null,
  dateRange: [],
})

// 触发状态
const triggering = ref(false)

// 工具方法
const getSopStatusName = (status: string) => {
  const statusMap = {
    completed: '已完成',
    uncompleted: '未完成',
    uncheck: '未质检',
  }
  return statusMap[status] || status
}

const getSopStatusType = (status: string) => {
  const typeMap = {
    completed: 'success',
    uncompleted: 'warning',
    uncheck: 'info',
  }
  return typeMap[status] || ''
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getViolationType = (violation: string) => {
  const highSeverityViolations = ['过度承诺', '侮辱谩骂', '态度恶劣']
  return highSeverityViolations.includes(violation) ? 'danger' : 'warning'
}

const highlightViolations = (content: string, keywords: string[]) => {
  if (!keywords || !keywords.length) return content

  let highlighted = content
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark style="background-color: #ff6b6b; color: white; padding: 2px 4px; border-radius: 2px;">$1</mark>')
  })
  return highlighted
}

// 事件处理
const handleFilter = async () => {
  await fetchAllData()
}

const resetFilter = () => {
  Object.assign(filter, {
    userId: null,
    dateRange: [],
  })
  handleFilter()
}

const viewDetail = (row: any) => {
  // TODO: 显示详情对话框
  console.log('查看详情', row)
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  fetchTabData()
}

// 获取数据
const fetchStats = async () => {
  try {
    const params = {
      userId: filter.userId,
      startDate: filter.dateRange?.[0],
      endDate: filter.dateRange?.[1],
    }
    const res = await getQualityStats(params)
    stats.value = {
      totalChecked: res.totalChecked || 0,
      violations: res.violations || 0,
      sopCompletionRate: res.sopCompletionRate || 0,
      highIntentCount: res.highIntentCount || 0,
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const fetchSopList = async () => {
  try {
    const params = {
      userId: filter.userId,
      startDate: filter.dateRange?.[0],
      endDate: filter.dateRange?.[1],
    }
    const res = await getSopList(params)
    sopList.value = res.list || []
  } catch (error) {
    ElMessage.error('获取SOP质检数据失败')
  }
}

const fetchViolationList = async () => {
  try {
    const params = {
      userId: filter.userId,
      startDate: filter.dateRange?.[0],
      endDate: filter.dateRange?.[1],
    }
    const res = await getViolationList(params)
    violationList.value = res.list || []
  } catch (error) {
    ElMessage.error('获取违规质检数据失败')
  }
}

const fetchReportList = async () => {
  try {
    const params = {
      userId: filter.userId,
      startDate: filter.dateRange?.[0],
      endDate: filter.dateRange?.[1],
    }
    const res = await getReportList(params)
    reportList.value = res.list || []
  } catch (error) {
    ElMessage.error('获取执行力报表失败')
  }
}

const fetchTabData = () => {
  loading.value = true
  Promise.all([
    activeTab.value === 'sop' ? fetchSopList() : Promise.resolve(),
    activeTab.value === 'violation' ? fetchViolationList() : Promise.resolve(),
    activeTab.value === 'report' ? fetchReportList() : Promise.resolve(),
  ]).finally(() => {
    loading.value = false
  })
}

const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchTabData(),
    ])
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  try {
    const res = await getUserList()
    userList.value = res.data || []
  } catch (error) {
    console.error('获取用户列表失败', error)
  }

  await fetchAllData()
})

// 触发质检检查
const triggerQualityCheck = async () => {
  triggering.value = true
  try {
    ElMessage.info('开始从聊天记录触发质检检查，请稍候...')

    const result = await request({
      url: '/ai-quality/trigger-from-chats',
      method: 'post',
      data: {
        startDate: filter.dateRange?.[0],
        endDate: filter.dateRange?.[1],
      }
    })

    ElMessage.success(`成功完成 ${result.processedCount || 0} 条聊天记录的质检检查`)

    // 刷新数据
    await fetchAllData()

  } catch (error) {
    console.error('触发质检失败:', error)
    ElMessage.error('触发质检失败，请稍后重试')
  } finally {
    triggering.value = false
  }
}
</script>

<style scoped lang="scss">
.staff-quality {
  .stats-row {
    margin-bottom: 20px;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  :deep(.mark) {
    font-weight: bold;
  }
}
</style>