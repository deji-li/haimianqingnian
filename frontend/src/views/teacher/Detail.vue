<template>
  <div class="teacher-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="handleBack" type="default" style="margin-bottom: 16px">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>

      <div class="teacher-info-header">
        <div class="teacher-avatar">
          <el-avatar :size="80" :src="teacherDetail.avatar">
            {{ teacherDetail.displayName?.charAt(0) || '老师' }}
          </el-avatar>
        </div>
        <div class="teacher-basic-info">
          <h2>{{ teacherDetail.displayName || teacherDetail.name }}</h2>
          <p class="teacher-subtitle">
            <el-tag v-if="teacherDetail.subject" type="primary" size="small">
              {{ teacherDetail.subject }}
            </el-tag>
            <el-tag v-if="teacherDetail.level" type="success" size="small" style="margin-left: 8px">
              {{ teacherDetail.level }}
            </el-tag>
            <el-tag
              :type="teacherDetail.status === '在职' ? 'success' : 'danger'"
              size="small"
              style="margin-left: 8px"
            >
              {{ teacherDetail.status }}
            </el-tag>
          </p>
          <p class="teacher-meta">
            <span v-if="teacherDetail.campusName">
              <el-icon><School /></el-icon>
              主要校区：{{ teacherDetail.campusName }}
            </span>
            <span v-if="teacherDetail.campuses && teacherDetail.campuses.length > 1" style="margin-left: 16px">
              <el-icon><MapLocation /></el-icon>
              兼职校区：
              <el-tag
                v-for="campus in teacherDetail.campuses.filter(c => !c.isPrimary)"
                :key="campus.id"
                size="small"
                style="margin-left: 4px"
              >
                {{ campus.campusName }}
              </el-tag>
            </span>
            <span v-if="teacherDetail.phone" style="margin-left: 16px">
              <el-icon><Phone /></el-icon>
              {{ teacherDetail.phone }}
            </span>
            <span v-if="teacherDetail.joinDate" style="margin-left: 16px">
              <el-icon><Calendar /></el-icon>
              入职时间：{{ formatDate(teacherDetail.joinDate) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- 业绩统计卡片 -->
    <el-row :gutter="24" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <h3>¥{{ formatNumber(teacherDetail.totalSales) }}</h3>
              <p>总销售额</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon commission">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <h3>¥{{ formatNumber(teacherDetail.totalCommission) }}</h3>
              <p>总提成</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon profit">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <h3>¥{{ formatNumber(teacherDetail.totalProfit) }}</h3>
              <p>为公司创造利润</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orders">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ teacherDetail.orderCount || 0 }}</h3>
              <p>订单数量</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程统计 -->
    <el-card style="margin-top: 24px" v-if="teacherDetail.courseStats && teacherDetail.courseStats.length > 0">
      <template #header>
        <span>课程统计</span>
      </template>

      <el-table :data="teacherDetail.courseStats" stripe>
        <el-table-column prop="courseName" label="课程名称" min-width="200">
          <template #default="{ row }">
            <span class="course-name">{{ row.courseName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.orderCount }}单</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="学员数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.studentCount }}人
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="平均单价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.avgPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="课程收入" width="120" align="right">
          <template #default="{ row }">
            <span class="revenue-amount">¥{{ formatNumber(row.revenue) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="老师提成" width="120" align="right">
          <template #default="{ row }">
            <span class="commission-amount">¥{{ formatNumber(row.commission) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="公司利润" width="120" align="right">
          <template #default="{ row }">
            <span class="profit-amount">¥{{ formatNumber(row.profit) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详细信息和订单列表 -->
    <el-row :gutter="24" style="margin-top: 24px">
      <!-- 老师详细信息 -->
      <el-col :span="8">
        <el-card title="详细信息" class="detail-card">
          <template #header>
            <span>详细信息</span>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="真实姓名">
              {{ teacherDetail.name || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="显示名称">
              {{ teacherDetail.displayName || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号码">
              {{ teacherDetail.phone || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ teacherDetail.idCard || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="银行账号">
              {{ teacherDetail.bankAccount || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="开户银行">
              {{ teacherDetail.bankName || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="默认提成">
              <span class="commission-amount">¥{{ teacherDetail.defaultCommissionRate || 0 }}/单</span>
            </el-descriptions-item>
            <el-descriptions-item label="待结算金额">
              <span class="pending-amount">¥{{ formatNumber(teacherDetail.pendingSettlement) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="离职日期">
              {{ teacherDetail.leaveDate ? formatDate(teacherDetail.leaveDate) : '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(teacherDetail.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 业绩分析 -->
      <el-col :span="16">
        <el-card title="业绩分析" class="analysis-card">
          <template #header>
            <span>业绩分析</span>
          </template>

          <el-row :gutter="16">
            <el-col :span="12">
              <div class="analysis-item">
                <div class="analysis-label">平均客单价</div>
                <div class="analysis-value">¥{{ formatNumber(teacherDetail.averageOrderValue) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="analysis-item">
                <div class="analysis-label">利润率</div>
                <div class="analysis-value">{{ teacherDetail.profitRate?.toFixed(1) || 0 }}%</div>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <div class="profit-calculation">
            <h4>利润计算说明</h4>
            <p>
              <strong>单笔利润</strong> = 订单金额 - 老师固定提成<br>
              <strong>总利润</strong> = 所有订单利润总和<br>
              <strong>利润率</strong> = (总利润 ÷ 总销售额) × 100%
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-card title="最近订单" style="margin-top: 24px" class="orders-card">
      <template #header>
        <span>最近订单</span>
        <el-button
          type="primary"
          size="small"
          style="float: right"
          @click="viewAllOrders"
        >
          查看全部订单
        </el-button>
      </template>

      <el-table
        :data="teacherDetail.recentOrders || []"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="paymentAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.paymentAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="teacherCommission" label="老师提成" width="120" align="right">
          <template #default="{ row }">
            <span class="commission">¥{{ formatNumber(row.teacherCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="利润" width="120" align="right">
          <template #default="{ row }">
            <span class="profit" :class="{ 'negative': row.profit < 0 }">
              ¥{{ formatNumber(row.profit) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)" size="small">
              {{ row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.paymentTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click="viewOrderDetail(row.id)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!teacherDetail.recentOrders?.length" class="empty-state">
        <el-empty description="暂无订单数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  School,
  MapLocation,
  Phone,
  Calendar,
  Money,
  Wallet,
  TrendCharts,
  List
} from '@element-plus/icons-vue'
import { getTeacherDetail, type TeacherDetail } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const teacherDetail = ref<TeacherDetail>({
  id: 0,
  name: '',
  displayName: '',
  phone: '',
  idCard: '',
  bankAccount: '',
  bankName: '',
  subject: '',
  level: '',
  campusId: 0,
  defaultCommissionRate: 0,
  totalSales: 0,
  totalCommission: 0,
  pendingSettlement: 0,
  status: '',
  joinDate: '',
  leaveDate: '',
  remark: '',
  createTime: '',
  updateTime: '',
  orderCount: 0,
  studentCount: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  totalProfit: 0,
  profitRate: 0,
  recentOrders: []
})

const loading = ref(false)

// 格式化数字
const formatNumber = (num: number | string | null | undefined) => {
  if (num === null || num === undefined) return '0'
  return parseFloat(num.toString()).toFixed(2)
}

// 格式化日期
const formatDate = (date: string | null | undefined) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  switch (status) {
    case '待上课':
      return 'warning'
    case '上课中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已退款':
      return 'danger'
    default:
      return 'info'
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 查看订单详情
const viewOrderDetail = (orderId: number) => {
  router.push(`/order/detail/${orderId}`)
}

// 查看全部订单
const viewAllOrders = () => {
  // 可以跳转到订单列表页面，并按当前老师筛选
  router.push({
    path: '/order/list',
    query: {
      teacherId: teacherDetail.value.id,
      teacherName: teacherDetail.value.displayName || teacherDetail.value.name
    }
  })
}

// 获取老师详情
const fetchTeacherDetail = async () => {
  try {
    loading.value = true
    const teacherId = Number(route.params.id)
    if (!teacherId) {
      ElMessage.error('无效的老师ID')
      return
    }

    const response = await getTeacherDetail(teacherId)
    teacherDetail.value = response.data
  } catch (error) {
    console.error('获取老师详情失败:', error)
    ElMessage.error('获取老师详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeacherDetail()
})
</script>

<style scoped>
.teacher-detail {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.teacher-info-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.teacher-basic-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.teacher-subtitle {
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
}

.teacher-meta {
  margin: 0;
  color: #606266;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.teacher-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-cards .stat-card {
  margin-bottom: 0;
}

.stat-card :deep(.el-card__body) {
  padding: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.commission {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.detail-card :deep(.el-descriptions__body) {
  background: #fafafa;
}

.analysis-card .analysis-item {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.analysis-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.analysis-value {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.profit-calculation {
  background: #f8f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.profit-calculation h4 {
  margin: 0 0 12px 0;
  color: #409eff;
  font-size: 16px;
}

.profit-calculation p {
  margin: 0;
  color: #606266;
  line-height: 1.8;
}

.commission {
  color: #e6a23c;
  font-weight: 500;
}

.profit {
  color: #67c23a;
  font-weight: 500;
}

.profit.negative {
  color: #f56c6c;
}

.commission-amount {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}

.pending-amount {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.orders-card :deep(.el-table__body) {
  font-size: 14px;
}
</style>