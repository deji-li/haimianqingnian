<template>
  <div class="workspace-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div style="display: flex; align-items: center; gap: 20px;">
          <el-avatar
            :size="80"
            :src="userInfo?.avatar"
            style="background-color: #409EFF; font-size: 32px; font-weight: 600;"
          >
            {{ userInfo?.realName?.charAt(0) || 'U' }}
          </el-avatar>
          <div>
            <h1 style="margin: 0; color: white;">你好，{{ userInfo?.realName }} 👋</h1>
            <p class="subtitle" style="margin: 8px 0 0 0; color: white;">{{ getGreeting() }}，{{ getEncouragement() }}</p>
          </div>
        </div>
      </div>
      <div class="quick-actions">
        <el-button type="primary" @click="handleQuickAdd('customer')">
          <el-icon><UserFilled /></el-icon>
          新增客户
        </el-button>
        <el-button type="success" @click="handleQuickAdd('order')">
          <el-icon><DocumentAdd /></el-icon>
          新增订单
        </el-button>
        <el-button type="warning" @click="handleQuickAdd('follow')">
          <el-icon><ChatDotRound /></el-icon>
          跟进记录
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <!-- 今日数据统计卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日新增客户</p>
              <h2 class="stat-value">{{ todayStats.newCustomers }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><DocumentAdd /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日新增订单</p>
              <h2 class="stat-value">{{ todayStats.newOrders }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日成交金额</p>
              <h2 class="stat-value">¥{{ todayStats.todayAmount.toLocaleString() }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-purple">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日跟进记录</p>
              <h2 class="stat-value">{{ todayStats.followRecords }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 左侧：销售目标进度 -->
      <el-col :span="16">
        <el-card shadow="never" class="target-card">
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon style="margin-right: 8px"><TrendCharts /></el-icon>
                我的销售目标
              </span>
              <div class="header-actions">
                <el-button size="small" @click="handleManageTargets">
                  <el-icon><Setting /></el-icon>
                  管理目标
                </el-button>
                <el-button type="primary" size="small" @click="handleCreateTarget">
                  <el-icon><Plus /></el-icon>
                  新增目标
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="targetProgress.length === 0" class="empty-state">
            <el-empty description="暂无销售目标">
              <el-button type="primary" @click="handleCreateTarget">
                <el-icon><Plus /></el-icon>
                创建第一个目标
              </el-button>
            </el-empty>
          </div>

          <div v-else class="target-grid">
            <div
              v-for="target in targetProgress.slice(0, 2)"
              :key="target.targetId"
              class="target-card-item"
            >
              <div class="target-card-header">
                <el-tag :type="getTargetTypeTag(target.targetType)" size="large">
                  {{ getTargetTypeName(target.targetType) }}
                </el-tag>
                <el-tag
                  v-if="target.remainingDays <= 7 && target.remainingDays > 0"
                  type="warning"
                  size="small"
                >
                  剩余{{ target.remainingDays }}天
                </el-tag>
                <el-tag
                  v-else-if="target.remainingDays <= 0"
                  type="danger"
                  size="small"
                >
                  已过期
                </el-tag>
              </div>

              <div class="target-date-range">
                <el-icon><Calendar /></el-icon>
                {{ formatDateRange(target.startDate, target.endDate) }}
              </div>

              <div class="target-stats">
                <div class="stat-box">
                  <div class="stat-header">
                    <el-icon color="#FFB800"><Wallet /></el-icon>
                    <span>金额进度</span>
                  </div>
                  <div class="stat-amount">
                    <span class="current">¥{{ target.actualAmount.toLocaleString() }}</span>
                    <template v-if="target.targetAmount > 0">
                      <span class="divider">/</span>
                      <span class="total">¥{{ target.targetAmount.toLocaleString() }}</span>
                    </template>
                  </div>
                  <template v-if="target.targetAmount > 0">
                    <el-progress
                      :percentage="Math.min(target.amountProgress, 100)"
                      :status="getProgressStatus(target.amountProgress)"
                      :stroke-width="10"
                      :show-text="false"
                    />
                    <div
                      class="progress-text"
                      :style="{
                        color: target.amountProgress >= 100 ? '#F56C6C' : '#909399',
                        fontWeight: target.amountProgress >= 100 ? 'bold' : 'normal'
                      }"
                    >
                      {{ target.amountProgress.toFixed(1) }}% 完成
                    </div>
                  </template>
                  <div v-else class="progress-text" style="color: #909399">
                    未设置目标金额
                  </div>
                </div>

                <div class="stat-box">
                  <div class="stat-header">
                    <el-icon color="#67C23A"><Document /></el-icon>
                    <span>订单进度</span>
                  </div>
                  <div class="stat-amount">
                    <span class="current">{{ target.actualCount }}</span>
                    <template v-if="target.targetCount > 0">
                      <span class="divider">/</span>
                      <span class="total">{{ target.targetCount }} 单</span>
                    </template>
                  </div>
                  <template v-if="target.targetCount > 0">
                    <el-progress
                      :percentage="Math.min(target.countProgress, 100)"
                      :status="getProgressStatus(target.countProgress)"
                      :stroke-width="10"
                      :show-text="false"
                    />
                    <div
                      class="progress-text"
                      :style="{
                        color: target.countProgress >= 100 ? '#F56C6C' : '#909399',
                        fontWeight: target.countProgress >= 100 ? 'bold' : 'normal'
                      }"
                    >
                      {{ target.countProgress.toFixed(1) }}% 完成
                    </div>
                  </template>
                  <div v-else class="progress-text" style="color: #909399">
                    未设置订单目标
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 待跟进客户列表 -->
        <el-card shadow="never" class="pending-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span class="title">待跟进客户</span>
              <el-link type="primary" @click="handleViewAllCustomers">
                查看全部
              </el-link>
            </div>
          </template>

          <el-table :data="pendingCustomers" style="width: 100%">
            <el-table-column label="客户名称" width="140">
              <template #default="{ row }">
                <span style="color: #303133; font-weight: 500">
                  {{ row.realName || '未填写' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="wechatNickname" label="微信昵称" width="150">
              <template #default="{ row }">
                <span style="color: #606266">{{ row.wechatNickname || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="wechatId" label="微信号" width="140">
              <template #default="{ row }">
                <span style="color: #606266">{{ row.wechatId || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" width="130">
              <template #default="{ row }">
                <span style="color: #909399">{{ row.phone || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerIntent" label="意向" width="100">
              <template #default="{ row }">
                <el-tag :type="getIntentType(row.customerIntent)" size="small">
                  {{ row.customerIntent || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastFollowTime" label="最后跟进时间" width="220">
              <template #default="{ row }">
                <span :class="isOverdueFollow(row.lastFollowTime) ? 'overdue-time' : ''">
                  {{ formatDateTime(row.lastFollowTime) || '未跟进' }}
                  <el-tag
                    v-if="isOverdueFollow(row.lastFollowTime)"
                    type="danger"
                    size="small"
                    style="margin-left: 8px"
                  >
                    已逾期
                  </el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="180">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleViewCustomer(row.id)"
                >
                  查看详情
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  link
                  @click="handleFollowUp(row.id)"
                >
                  立即跟进
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：快捷入口和通知 -->
      <el-col :span="8">
        <el-card shadow="never" class="shortcuts-card">
          <template #header>
            <span class="title">快捷入口</span>
          </template>

          <div class="shortcuts-grid">
            <div class="shortcut-item" @click="handleShortcut('customer-list')">
              <el-icon size="24"><User /></el-icon>
              <span>客户列表</span>
            </div>
            <div class="shortcut-item" @click="handleShortcut('lifecycle-board')">
              <el-icon size="24"><TrendCharts /></el-icon>
              <span>生命周期看板</span>
            </div>
            <div class="shortcut-item" @click="handleShortcut('order-list')">
              <el-icon size="24"><Document /></el-icon>
              <span>订单列表</span>
            </div>
            <div class="shortcut-item" @click="handleShortcut('commission')">
              <el-icon size="24"><Money /></el-icon>
              <span>我的提成</span>
            </div>
          </div>
        </el-card>

        <!-- 本月数据统计 -->
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span class="title">本月数据</span>
          </template>

          <div class="month-stats">
            <div class="month-stat-item">
              <div class="stat-label">新增客户</div>
              <div class="stat-value">{{ monthStats.customers }}</div>
            </div>
            <div class="month-stat-item">
              <div class="stat-label">新增订单</div>
              <div class="stat-value">{{ monthStats.orders }}</div>
            </div>
            <div class="month-stat-item">
              <div class="stat-label">成交金额</div>
              <div class="stat-value">¥{{ monthStats.amount.toLocaleString() }}</div>
            </div>
            <div class="month-stat-item">
              <div class="stat-label">跟进记录</div>
              <div class="stat-value">{{ monthStats.follows }}</div>
            </div>
          </div>
        </el-card>

        <!-- 跟进统计 -->
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span class="title">跟进统计</span>
            </div>
          </template>

          <div class="follow-stats-grid">
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon size="24"><ChatDotRound /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.todayFollow }}</div>
                <div class="stat-label">今日跟进</div>
              </div>
            </div>
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon size="24"><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.weekFollow }}</div>
                <div class="stat-label">本周跟进</div>
              </div>
            </div>
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon size="24"><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.monthFollow }}</div>
                <div class="stat-label">本月跟进</div>
              </div>
            </div>
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ffd89b 0%, #ff9a56 100%)">
                <el-icon size="24"><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.pendingFollow }}</div>
                <div class="stat-label">今日待跟进</div>
              </div>
            </div>
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)">
                <el-icon size="24"><Warning /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.overdueFollow }}</div>
                <div class="stat-label">逾期未跟进</div>
              </div>
            </div>
            <div class="follow-stat-item">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                <el-icon size="24"><UserFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ followStats.totalCustomers }}</div>
                <div class="stat-label">总客户数</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建目标对话框 -->
    <el-dialog v-model="targetDialogVisible" title="创建销售目标" width="600px">
      <el-form :model="targetForm" label-width="100px">
        <el-form-item label="目标类型">
          <el-select v-model="targetForm.targetType" placeholder="请选择" style="width: 100%">
            <el-option label="月度目标" value="monthly" />
            <el-option label="季度目标" value="quarterly" />
            <el-option label="年度目标" value="yearly" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标金额">
          <el-input-number
            v-model="targetForm.targetAmount"
            :min="0"
            :step="1000"
            placeholder="请输入目标金额"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目标订单数">
          <el-input-number
            v-model="targetForm.targetCount"
            :min="0"
            placeholder="请输入目标订单数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目标月份">
          <el-date-picker
            v-model="targetForm.targetMonth"
            type="month"
            placeholder="选择目标月份"
            style="width: 100%"
            value-format="YYYY-MM"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="targetForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="targetDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="targetSubmitLoading"
          @click="handleSubmitTarget"
        >
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  DocumentAdd,
  ChatDotRound,
  Wallet,
  User,
  TrendCharts,
  Document,
  Money,
  Flag,
  Setting,
  Plus,
  Calendar,
  Warning,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getTargetProgress, createTarget, type TargetProgress } from '@/api/target'
import { getPendingFollowUps, getFollowStatistics, type FollowStatistics } from '@/api/customer'
import { getDashboardOverview } from '@/api/dashboard'
import { formatDateTime, isOverdue } from '@/utils/date'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 销售目标进度
const targetProgress = ref<TargetProgress[]>([])

// 今日统计数据
const todayStats = reactive({
  newCustomers: 0,
  newOrders: 0,
  todayAmount: 0,
  followRecords: 0,
})

// 本月统计数据
const monthStats = reactive({
  customers: 0,
  orders: 0,
  amount: 0,
  follows: 0,
})

// 待跟进客户列表
const pendingCustomers = ref<any[]>([])

// 跟进统计数据
const followStats = ref<FollowStatistics>({
  todayFollow: 0,
  weekFollow: 0,
  monthFollow: 0,
  pendingFollow: 0,
  overdueFollow: 0,
  totalCustomers: 0,
})

// 创建目标对话框
const targetDialogVisible = ref(false)
const targetSubmitLoading = ref(false)
const targetForm = reactive({
  targetType: 'monthly',
  targetAmount: 0,
  targetCount: 0,
  targetMonth: '',
  remark: '',
})

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 24) return '晚上好'
  return '你好'
}

// 获取鼓励语
const getEncouragement = () => {
  const encouragements = [
    '今天也要加油哦',
    '相信自己，你能做到',
    '每一次努力都会有收获',
    '保持热情，继续前进',
    '成功就在不远处',
  ]
  return encouragements[Math.floor(Math.random() * encouragements.length)]
}

// 获取销售目标进度
const fetchTargetProgress = async () => {
  if (!userInfo.value?.id) return
  try {
    targetProgress.value = await getTargetProgress(userInfo.value.id)
  } catch (error) {
    console.error('Failed to fetch target progress:', error)
  }
}

// 获取待跟进客户
const fetchPendingCustomers = async () => {
  try {
    const data = await getPendingFollowUps()
    pendingCustomers.value = (data || []).slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch pending customers:', error)
  }
}

// 获取跟进统计
const fetchFollowStatistics = async () => {
  try {
    const data = await getFollowStatistics()
    followStats.value = data
  } catch (error) {
    console.error('Failed to fetch follow statistics:', error)
  }
}

// 获取今日和本月数据
const fetchDashboardStats = async () => {
  try {
    const data = await getDashboardOverview()
    // 更新今日数据
    todayStats.newCustomers = data.today.newCustomers
    todayStats.newOrders = data.today.newOrders
    todayStats.todayAmount = data.today.revenue
    todayStats.followRecords = data.today.followRecords

    // 计算本月数据
    // 注意：当前后端的 revenue.thisMonth 是本月收入，但客户数和订单数需要额外计算
    // 这里暂时使用近似值，实际应该后端提供专门的月度统计接口
    monthStats.amount = data.revenue.thisMonth
    monthStats.customers = data.customer.total
    monthStats.orders = data.order.total
    monthStats.follows = 0 // 后端暂未提供月度跟进记录统计
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }
}

// 快捷操作
const handleQuickAdd = (type: string) => {
  if (type === 'customer') {
    router.push({ name: 'CustomerList' })
  } else if (type === 'order') {
    router.push({ name: 'OrderList' })
  } else if (type === 'follow') {
    router.push({ name: 'CustomerList' })
  }
}

// 管理目标
const handleManageTargets = () => {
  router.push({ name: 'TargetManagement' })
}

// 创建目标
const handleCreateTarget = () => {
  // 初始化表单
  const now = dayjs()
  targetForm.targetType = 'monthly'
  targetForm.targetAmount = 0
  targetForm.targetCount = 0
  targetForm.targetMonth = now.format('YYYY-MM')
  targetForm.remark = ''

  targetDialogVisible.value = true
}

// 提交创建目标
const handleSubmitTarget = async () => {
  if (!userInfo.value?.id) return
  if (!targetForm.targetMonth) {
    ElMessage.warning('请选择目标月份')
    return
  }

  // 根据月份计算开始和结束日期
  const monthStart = dayjs(targetForm.targetMonth).startOf('month')
  const monthEnd = dayjs(targetForm.targetMonth).endOf('month')

  targetSubmitLoading.value = true
  try {
    await createTarget({
      userId: userInfo.value.id,
      targetType: targetForm.targetType,
      targetAmount: targetForm.targetAmount,
      targetCount: targetForm.targetCount,
      startDate: monthStart.format('YYYY-MM-DD'),
      endDate: monthEnd.format('YYYY-MM-DD'),
      remark: targetForm.remark,
    })
    ElMessage.success('销售目标创建成功')
    targetDialogVisible.value = false
    fetchTargetProgress()
  } catch (error) {
    console.error('Failed to create target:', error)
    ElMessage.error('创建失败')
  } finally {
    targetSubmitLoading.value = false
  }
}

// 快捷入口
const handleShortcut = (type: string) => {
  const routeMap: Record<string, string> = {
    'customer-list': 'CustomerList',
    'lifecycle-board': 'CustomerLifecycleBoard',
    'order-list': 'OrderList',
    commission: 'Commission',
  }
  const routeName = routeMap[type]
  if (routeName) {
    router.push({ name: routeName })
  }
}

// 查看客户详情
const handleViewCustomer = (id: number) => {
  router.push({ name: 'CustomerDetail', params: { id } })
}

// 立即跟进
const handleFollowUp = (id: number) => {
  router.push({ name: 'CustomerDetail', params: { id } })
}

// 查看全部客户
const handleViewAllCustomers = () => {
  router.push({ name: 'CustomerList' })
}

// 辅助函数
const getTargetTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    monthly: 'primary',
    quarterly: 'success',
    yearly: 'warning',
  }
  return typeMap[type] || 'info'
}

const getTargetTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    monthly: '月度目标',
    quarterly: '季度目标',
    yearly: '年度目标',
  }
  return nameMap[type] || type
}

const getProgressStatus = (progress: number) => {
  if (progress >= 100) return 'success'
  if (progress >= 80) return undefined
  if (progress >= 50) return 'warning'
  return 'exception'
}

const getIntentType = (intent: string): any => {
  const intentMap: Record<string, string> = {
    高: 'danger',
    中: 'warning',
    低: 'info',
  }
  return intentMap[intent] || ''
}

const formatDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return ''
  return `${dayjs(startDate).format('YYYY/MM/DD')} - ${dayjs(endDate).format('YYYY/MM/DD')}`
}

// 判断是否逾期（超过7天未跟进）
const isOverdueFollow = (lastFollowTime: string) => {
  if (!lastFollowTime) return false
  const now = dayjs()
  const lastFollow = dayjs(lastFollowTime)
  const daysDiff = now.diff(lastFollow, 'day')
  return daysDiff > 7
}

onMounted(() => {
  fetchTargetProgress()
  fetchPendingCustomers()
  fetchDashboardStats()
  fetchFollowStatistics()
})
</script>

<style scoped lang="scss">
.workspace-container {
  padding: 20px;

  .welcome-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 20px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 32px;
        color: white !important;
      }

      .subtitle {
        margin: 0;
        font-size: 16px;
        opacity: 0.9;
        color: white !important;
      }
    }

    .quick-actions {
      .el-button {
        margin-left: 12px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      border: none;

      &.stat-blue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.stat-green {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.stat-orange {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.stat-purple {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }

      .stat-content {
        display: flex;
        align-items: center;

        .stat-icon {
          font-size: 48px;
          margin-right: 20px;
          opacity: 0.8;
        }

        .stat-info {
          flex: 1;

          .stat-label {
            margin: 0 0 8px 0;
            font-size: 14px;
            opacity: 0.9;
            color: white;
          }

          .stat-value {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            color: white;
          }
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .target-card {
    .empty-state {
      padding: 40px 0;
      text-align: center;
    }

    .target-list {
      .target-item {
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .target-header {
          margin-bottom: 20px;

          .target-type {
            display: flex;
            align-items: center;
            gap: 12px;

            .date-range {
              color: #606266;
              font-size: 14px;
            }
          }
        }

        .progress-section {
          .progress-item {
            margin-bottom: 16px;

            &:last-child {
              margin-bottom: 0;
            }

            .progress-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;

              .label {
                color: #606266;
                font-size: 14px;
              }

              .value {
                color: #303133;
                font-size: 14px;
                font-weight: 500;
              }
            }
          }
        }
      }
    }

    .target-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;

      .target-card-item {
        padding: 24px;
        background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
        border-radius: 12px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .target-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .target-date-range {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #909399;
          font-size: 14px;
          margin-bottom: 20px;
          padding: 8px 12px;
          background: #f0f2f5;
          border-radius: 6px;

          .el-icon {
            font-size: 16px;
          }
        }

        .target-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;

          .stat-box {
            padding: 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e4e7ed;

            .stat-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              font-size: 14px;
              color: #606266;
              font-weight: 500;

              .el-icon {
                font-size: 18px;
              }
            }

            .stat-amount {
              margin-bottom: 12px;
              font-size: 16px;
              display: flex;
              align-items: baseline;
              gap: 6px;

              .current {
                font-size: 24px;
                font-weight: bold;
                color: #303133;
              }

              .divider {
                color: #909399;
                font-size: 18px;
              }

              .total {
                color: #606266;
                font-size: 16px;
              }
            }

            .progress-text {
              text-align: right;
              font-size: 13px;
              color: #909399;
              margin-top: 8px;
            }
          }
        }
      }
    }
  }

  .shortcuts-card {
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .shortcut-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .el-icon {
          margin-bottom: 8px;
          color: #409eff;
        }

        span {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .month-stats {
    .month-stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .stat-label {
        color: #909399;
        font-size: 14px;
      }

      .stat-value {
        color: #303133;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

  .follow-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .follow-stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  // 逾期时间样式
  .overdue-time {
    color: #F56C6C !important;
    font-weight: 600;
  }
}
</style>
