<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="layout-aside">
      <div class="logo">
        <h2>海绵青年专用</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="aside-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/workspace">
          <el-icon><Monitor /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <el-sub-menu index="/customer">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customer/list">客户列表</el-menu-item>
          <el-menu-item index="/customer/lifecycle-board">生命周期看板</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>

        <el-sub-menu index="/finance">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>财务提成</span>
          </template>
          <el-menu-item index="/finance/statistics">财务统计</el-menu-item>
          <el-menu-item index="/finance/commission-records">提成记录</el-menu-item>
          <el-menu-item index="/finance/commission-schemes">提成方案</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/target">
          <el-icon><Flag /></el-icon>
          <span>目标管理</span>
        </el-menu-item>

        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/department">部门管理</el-menu-item>
          <el-menu-item index="/system/campus">校区管理</el-menu-item>
          <el-menu-item index="/system/dictionary">字典管理</el-menu-item>
          <el-menu-item index="/system/role">角色权限</el-menu-item>
          <el-menu-item index="/system/operation-log">操作日志</el-menu-item>
          <el-menu-item index="/system/ai-config">AI配置</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/sales-tools">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>销售工具</span>
          </template>
          <el-menu-item index="/sales-tools/chat-analysis">聊天分析</el-menu-item>
          <el-menu-item index="/sales-tools/knowledge">话术库</el-menu-item>
          <el-menu-item index="/sales-tools/tools">AI工具</el-menu-item>
          <el-menu-item index="/sales-tools/recovery">客户复苏</el-menu-item>
          <el-menu-item index="/sales-tools/tags">标签管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/analytics">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>数据分析</span>
          </template>
          <el-menu-item index="/analytics/dashboard">数据看板</el-menu-item>
          <el-menu-item index="/analytics/personal">个人统计</el-menu-item>
          <el-menu-item index="/analytics/funnel">销售漏斗</el-menu-item>
          <el-menu-item index="/analytics/advanced">高级分析</el-menu-item>
          <el-menu-item index="/analytics/leaderboard">团队排行榜</el-menu-item>
          <el-menu-item index="/analytics/ai-analytics">AI人效分析</el-menu-item>
          <el-menu-item index="/analytics/ai-reports">AI诊断报告</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/datascreen">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据大屏</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <span class="breadcrumb">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <!-- 最近访问 -->
          <el-dropdown @command="handleRecentVisit" trigger="click">
            <el-button :icon="Clock" circle title="最近访问" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled style="font-weight: 600; color: #303133;">最近访问</el-dropdown-item>
                <el-dropdown-item divided disabled v-if="recentStore.recentCustomers.length === 0 && recentStore.recentOrders.length === 0">
                  暂无访问记录
                </el-dropdown-item>
                <template v-if="recentStore.recentCustomers.length > 0">
                  <el-dropdown-item disabled style="font-size: 12px; color: #909399;">客户</el-dropdown-item>
                  <el-dropdown-item
                    v-for="item in recentStore.recentCustomers"
                    :key="`customer-${item.id}`"
                    :command="`customer-${item.id}`"
                  >
                    <el-icon style="margin-right: 8px;"><User /></el-icon>
                    {{ item.title }}
                  </el-dropdown-item>
                </template>
                <template v-if="recentStore.recentOrders.length > 0">
                  <el-dropdown-item divided disabled style="font-size: 12px; color: #909399;">订单</el-dropdown-item>
                  <el-dropdown-item
                    v-for="item in recentStore.recentOrders"
                    :key="`order-${item.id}`"
                    :command="`order-${item.id}`"
                  >
                    <el-icon style="margin-right: 8px;"><Document /></el-icon>
                    {{ item.title }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 消息通知 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button :icon="Bell" circle @click="goToNotification" />
          </el-badge>

          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo?.realName || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useRecentStore } from '@/store/recent'
import { ElMessageBox } from 'element-plus'
import { Bell, Wallet, Money, TrendCharts, Setting, Monitor, Trophy, DataAnalysis, Flag, User, Document, DataLine, Clock, MagicStick } from '@element-plus/icons-vue'
import { getUnreadCount } from '@/api/notification'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recentStore = useRecentStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title as string || '首页')

// 未读消息数量
const unreadCount = ref(0)

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    unreadCount.value = await getUnreadCount()
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 跳转到消息中心
const goToNotification = () => {
  router.push('/notification')
}

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  console.log('菜单选择:', index)
  router.push(index)
}

// 定时刷新未读数量（每30秒）
let timer: number | null = null
onMounted(() => {
  fetchUnreadCount()
  timer = window.setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 处理最近访问点击
const handleRecentVisit = (command: string) => {
  const [type, id] = command.split('-')
  if (type === 'customer') {
    router.push(`/customer/detail/${id}`)
  } else if (type === 'order') {
    router.push('/order/list')  // 订单暂时跳转到列表页
  }
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
    })
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
  }

  .aside-menu {
    border-right: none;
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;

  .header-left {
    .breadcrumb {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-badge {
      cursor: pointer;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      span {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
