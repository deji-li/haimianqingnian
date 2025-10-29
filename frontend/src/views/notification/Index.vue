<template>
  <div class="notification-container">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon unread-icon">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">未读通知</div>
            <div class="stat-value">{{ unreadCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" @click="filterByType('follow_reminder')">
        <div class="stat-content">
          <div class="stat-icon follow-icon">
            <el-icon><Phone /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">跟进提醒</div>
            <div class="stat-value">{{ typeStats.follow_reminder || 0 }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" @click="filterByType('target_warning')">
        <div class="stat-content">
          <div class="stat-icon warning-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">目标预警</div>
            <div class="stat-value">{{ typeStats.target_warning || 0 }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" @click="filterByType('churn_risk')">
        <div class="stat-content">
          <div class="stat-icon risk-icon">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">流失预警</div>
            <div class="stat-value">{{ typeStats.churn_risk || 0 }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover" @click="filterByType('order_update')">
        <div class="stat-content">
          <div class="stat-icon order-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">订单更新</div>
            <div class="stat-value">{{ typeStats.order_update || 0 }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="通知类型">
          <el-select
            v-model="queryParams.type"
            placeholder="全部"
            clearable
            style="width: 180px"
          >
            <el-option label="跟进提醒" value="follow_reminder" />
            <el-option label="目标预警" value="target_warning" />
            <el-option label="流失预警" value="churn_risk" />
            <el-option label="订单更新" value="order_update" />
            <el-option label="提成发放" value="commission_paid" />
            <el-option label="系统通知" value="system" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryParams.isRead"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
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
          <el-button type="success" @click="handleMarkAllRead">
            <el-icon><Check /></el-icon>
            全部已读
          </el-button>
          <el-button type="danger" @click="handleClearRead">
            <el-icon><Delete /></el-icon>
            清空已读
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <div v-loading="loading" class="notification-list">
        <el-empty v-if="notificationList.length === 0" description="暂无通知" />

        <div
          v-for="item in notificationList"
          :key="item.id"
          :class="['notification-item', { 'is-unread': item.isRead === 0 }]"
          @click="handleItemClick(item)"
        >
          <div class="notification-icon-wrapper">
            <div :class="['notification-type-icon', `${item.type}-icon`]">
              <el-icon :size="24">
                <component :is="getNotificationIcon(item.type)" />
              </el-icon>
            </div>
          </div>

          <div class="notification-body">
            <div class="notification-header">
              <el-tag :type="getNotificationTypeTag(item.type)" size="small">
                {{ getNotificationTypeText(item.type) }}
              </el-tag>
              <span class="notification-time">{{ formatTime(item.createTime) }}</span>
              <el-badge v-if="item.isRead === 0" is-dot class="unread-badge" />
            </div>

            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-content">{{ item.content }}</div>

            <div class="notification-actions">
              <el-button
                v-if="item.isRead === 0"
                type="primary"
                link
                size="small"
                @click.stop="handleMarkRead(item)"
              >
                <el-icon><Check /></el-icon>
                标记已读
              </el-button>
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="navigateToRelated(item)"
              >
                <el-icon><Right /></el-icon>
                查看详情
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click.stop="handleDelete(item)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Check,
  Delete,
  Bell,
  Phone,
  Warning,
  WarningFilled,
  Document,
  Right,
} from '@element-plus/icons-vue'
import {
  getNotificationList,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getNotificationTypeText,
  getNotificationTypeTag,
  type Notification,
} from '@/api/notification'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  type: '',
  isRead: undefined as number | undefined,
})

// 数据
const notificationList = ref<Notification[]>([])
const total = ref(0)
const loading = ref(false)

// 统计数据
const unreadCount = computed(() => {
  return notificationList.value.filter((item) => item.isRead === 0).length
})

const typeStats = computed(() => {
  const stats: Record<string, number> = {}
  notificationList.value.forEach((item) => {
    if (item.isRead === 0) {
      stats[item.type] = (stats[item.type] || 0) + 1
    }
  })
  return stats
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const data = await getNotificationList(queryParams)
    notificationList.value = data.list
    total.value = data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取通知列表失败')
  } finally {
    loading.value = false
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
  queryParams.type = ''
  queryParams.isRead = undefined
  fetchData()
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    follow_reminder: Phone,
    target_warning: Warning,
    churn_risk: WarningFilled,
    order_update: Document,
    commission_paid: Document,
    system: Bell,
  }
  return iconMap[type] || Bell
}

// 格式化时间
const formatTime = (time: string) => {
  const now = new Date()
  const notifTime = new Date(time)
  const diff = now.getTime() - notifTime.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time
}

// 按类型筛选
const filterByType = (type: string) => {
  queryParams.type = type
  queryParams.isRead = 0 // 只显示未读
  queryParams.page = 1
  fetchData()
}

// 导航到相关页面
const navigateToRelated = (item: Notification) => {
  // 根据通知类型跳转到相关页面
  if (item.type === 'follow_reminder') {
    // 跳转到客户列表
    router.push('/customer/list')
  } else if (item.type === 'target_warning') {
    // 跳转到工作台
    router.push('/workspace')
  } else if (item.type === 'churn_risk') {
    // 跳转到客户列表
    router.push('/customer/list')
  } else if (item.type === 'order_update') {
    // 跳转到订单列表
    router.push('/order/list')
  } else if (item.type === 'commission_paid') {
    // 跳转到提成管理
    router.push('/commission')
  }
}

// 点击通知项
const handleItemClick = async (item: Notification) => {
  // 如果是未读，标记为已读
  if (item.isRead === 0) {
    await handleMarkRead(item)
  }

  // 导航到相关页面
  navigateToRelated(item)
}

// 标记已读
const handleMarkRead = async (item: Notification) => {
  try {
    await markAsRead(item.id)
    item.isRead = 1
    ElMessage.success('已标记为已读')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 全部已读
const handleMarkAllRead = async () => {
  try {
    await markAllAsRead()
    ElMessage.success('已全部标记为已读')
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除
const handleDelete = async (item: Notification) => {
  try {
    await ElMessageBox.confirm('确认删除此通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteNotification(item.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 清空已读
const handleClearRead = async () => {
  try {
    await ElMessageBox.confirm('确认清空所有已读通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const result = await clearReadNotifications()
    ElMessage.success(result.message || '清空成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.notification-container {
  padding: 20px;

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.unread-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.follow-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.warning-icon {
            background: linear-gradient(135deg, #ffd89b 0%, #ff9a56 100%);
            color: white;
          }

          &.risk-icon {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
          }

          &.order-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .list-card {
    min-height: 600px;
  }

  .notification-list {
    min-height: 400px;
  }

  .notification-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background-color: #f5f7fa;
      transform: translateX(4px);
    }

    &.is-unread {
      background-color: #f0f9ff;
      border-left: 3px solid #409eff;
    }

    &.is-unread:hover {
      background-color: #e1f3ff;
    }

    .notification-icon-wrapper {
      flex-shrink: 0;

      .notification-type-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.follow_reminder-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        &.target_warning-icon {
          background: linear-gradient(135deg, #ffd89b 0%, #ff9a56 100%);
          color: white;
        }

        &.churn_risk-icon {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
        }

        &.order_update-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        &.commission_paid-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        &.system-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      }
    }

    .notification-body {
      flex: 1;
      min-width: 0;

      .notification-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 12px;
      }

      .notification-time {
        color: #909399;
        font-size: 12px;
        margin-left: auto;
      }

      .unread-badge {
        position: absolute;
        top: 20px;
        right: 20px;
      }

      .notification-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .notification-content {
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .notification-actions {
        display: flex;
        gap: 16px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
