<template>
  <div class="dashboard-container">
    <el-card class="welcome-card" v-loading="loading">
      <h2>欢迎使用教育培训CRM管理系统</h2>
      <p>当前登录用户：{{ userStore.userInfo?.realName }} ({{ userStore.userInfo?.roleName }})</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <el-icon class="icon" color="#FFB800"><User /></el-icon>
          <div>
            <p class="label">用户名</p>
            <p class="value">{{ userStore.userInfo?.username }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.departmentName">
          <el-icon class="icon" color="#FF9800"><OfficeBuilding /></el-icon>
          <div>
            <p class="label">所属部门</p>
            <p class="value">{{ userStore.userInfo.departmentName }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.campusName">
          <el-icon class="icon" color="#67C23A"><Location /></el-icon>
          <div>
            <p class="label">所属校区</p>
            <p class="value">{{ userStore.userInfo.campusName }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据概览 -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总客户数</p>
              <p class="stat-value">{{ overview.customer?.total || 0 }}</p>
            </div>
            <el-icon class="stat-icon" color="#409EFF"><UserFilled /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总订单数</p>
              <p class="stat-value">{{ overview.order?.total || 0 }}</p>
            </div>
            <el-icon class="stat-icon" color="#67C23A"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总收入</p>
              <p class="stat-value">¥{{ (overview.revenue?.total || 0).toLocaleString() }}</p>
            </div>
            <el-icon class="stat-icon" color="#E6A23C"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日数据 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>今日数据</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="today-stat">
            <p class="label">新增客户</p>
            <p class="value">{{ overview.today?.newCustomers || 0 }}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-stat">
            <p class="label">新增订单</p>
            <p class="value">{{ overview.today?.newOrders || 0 }}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-stat">
            <p class="label">今日收入</p>
            <p class="value">¥{{ (overview.today?.revenue || 0).toLocaleString() }}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="today-stat">
            <p class="label">跟进记录</p>
            <p class="value">{{ overview.today?.followRecords || 0 }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 待跟进客户 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>待跟进客户</span>
          <el-button type="text" @click="router.push('/customer/list')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="pendingFollowUps" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="intent" label="意向课程" />
        <el-table-column prop="lastFollowTime" label="最后跟进时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastFollowTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="router.push(`/customer/detail/${row.id}`)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, OfficeBuilding, Location, UserFilled, Document, Money } from '@element-plus/icons-vue'
import { getDashboardOverview } from '@/api/dashboard'
import { getPendingFollowUps, type Customer } from '@/api/customer'
import { formatDateTime } from '@/utils/date'
import type { DashboardOverview } from '@/api/dashboard'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const overview = ref<DashboardOverview>({
  customer: { total: 0, byIntent: [] },
  order: { total: 0, newStudent: 0, oldStudent: 0, byStatus: [] },
  revenue: { total: 0, thisMonth: 0 },
  today: { newCustomers: 0, newOrders: 0, revenue: 0, followRecords: 0 }
})

const pendingFollowUps = ref<Customer[]>([])

const loadData = async () => {
  loading.value = true
  try {
    // 加载概览数据
    const overviewRes = await getDashboardOverview()
    if (overviewRes.data) {
      overview.value = overviewRes.data
    }

    // 加载待跟进客户
    const followUpRes = await getPendingFollowUps({ limit: 5 })
    if (followUpRes.data) {
      pendingFollowUps.value = followUpRes.data.list || []
    }
  } catch (error) {
    console.error('加载看板数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-card p {
  margin: 0;
  opacity: 0.9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-item .icon {
  font-size: 32px;
}

.info-item .label {
  margin: 0 0 5px 0;
  font-size: 14px;
  opacity: 0.8;
}

.info-item .value {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.stat-card {
  height: 120px;
}

.stat-card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.2;
}

.today-stat {
  text-align: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.today-stat .label {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #909399;
}

.today-stat .value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .welcome-card :deep(.el-card__body) {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 24px !important;
  }
}
</style>