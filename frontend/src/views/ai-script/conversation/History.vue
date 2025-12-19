<template>
  <div class="conversation-history-container">
    <el-card class="filter-card">
      <div class="filter-section">
        <el-row :gutter="16">
          <!-- 管理员可以选择查看的用户 -->
          <el-col :span="6" v-if="isAdmin">
            <el-select
              v-model="filterForm.userId"
              placeholder="选择销售人员"
              clearable
              filterable
              @change="handleFilterChange"
            >
              <el-option label="全部销售" :value="null" />
              <el-option
                v-for="user in salesUsers"
                :key="user.id"
                :label="user.realName"
                :value="user.id"
              />
            </el-select>
          </el-col>

          <!-- 功能类型筛选 -->
          <el-col :span="6">
            <el-select
              v-model="filterForm.functionType"
              placeholder="选择功能类型"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部类型" :value="null" />
              <el-option label="帮你谈单" value="deal_assist" />
              <el-option label="帮你回复" value="reply_assist" />
              <el-option label="话术润色" value="script_polish" />
              <el-option label="开场白生成" value="opening_lines" />
            </el-select>
          </el-col>

          <!-- 日期范围筛选 -->
          <el-col :span="8">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleFilterChange"
            />
          </el-col>

          <!-- 搜索 -->
          <el-col :span="4">
            <el-button type="primary" :icon="Search" @click="handleFilterChange">
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span class="title">对话记录</span>
          <span class="total">共 {{ total }} 条记录</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="conversations"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="title" label="对话标题" min-width="200">
          <template #default="{ row }">
            <div class="conversation-title-cell">
              <el-icon class="conversation-icon"><ChatDotRound /></el-icon>
              <span>{{ row.title || '新对话' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="functionType" label="功能类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getFunctionTypeColor(row.functionType)">
              {{ getFunctionTypeName(row.functionType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="scenario" label="场景" width="150">
          <template #default="{ row }">
            {{ row.scenario?.scenarioName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="customer" label="客户" width="120" v-if="isAdmin">
          <template #default="{ row }">
            {{ row.customer?.realName || row.customer?.wechatNickname || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="user" label="销售人员" width="120" v-if="isAdmin">
          <template #default="{ row }">
            {{ getUserName(row.userId) }}
          </template>
        </el-table-column>

        <el-table-column prop="latestMessage" label="最新消息" min-width="250">
          <template #default="{ row }">
            <div class="latest-message">
              {{ getLatestMessagePreview(row.latestMessage) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="lastMessageTime" label="最后更新" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastMessageTime || row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click.stop="viewConversation(row.id)"
            >
              查看详情
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click.stop="handleDelete(row.id)"
              v-if="canDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 对话详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="对话详情"
      width="70%"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="conversation-detail">
        <div v-if="currentConversation" class="conversation-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="对话标题">
              {{ currentConversation.title }}
            </el-descriptions-item>
            <el-descriptions-item label="功能类型">
              <el-tag :type="getFunctionTypeColor(currentConversation.functionType)">
                {{ getFunctionTypeName(currentConversation.functionType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="场景">
              {{ currentConversation.scenario?.scenarioName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="技巧">
              {{ currentConversation.technique?.techniqueName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="客户">
              {{ currentConversation.customer?.realName || currentConversation.customer?.wechatNickname || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatTime(currentConversation.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="messages-container">
          <div v-for="msg in currentMessages" :key="msg.id" :class="['message-item', msg.role]">
            <div class="message-header">
              <el-icon v-if="msg.role === 'user'"><User /></el-icon>
              <el-icon v-else><Cpu /></el-icon>
              <span class="role-name">{{ msg.role === 'user' ? '我' : 'AI助手' }}</span>
              <span class="message-time">{{ formatTime(msg.createTime) }}</span>
            </div>
            <div class="message-content">
              {{ msg.content }}
            </div>
            <div v-if="msg.knowledgeSource && msg.knowledgeSource.length > 0" class="knowledge-sources">
              <el-icon><Reading /></el-icon>
              <span>引用了 {{ msg.knowledgeSource.length }} 条知识库内容</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ChatDotRound, User, Cpu, Reading } from '@element-plus/icons-vue'
import { getConversations, getConversationDetail, deleteConversation } from '@/api/ai-script-assistant'
import { getUserList } from '@/api/user'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 判断是否是管理员
const isAdmin = computed(() => {
  const role = userStore.userInfo?.roleCode
  return role === 'admin' || role === 'super_admin'
})

// 筛选表单
const filterForm = reactive({
  userId: null as number | null,
  functionType: null as string | null,
  dateRange: null as any,
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
})

// 数据
const loading = ref(false)
const conversations = ref<any[]>([])
const total = ref(0)
const salesUsers = ref<any[]>([])

// 对话详情
const dialogVisible = ref(false)
const detailLoading = ref(false)
const currentConversation = ref<any>(null)
const currentMessages = ref<any[]>([])

// 加载销售人员列表（管理员用）
const loadSalesUsers = async () => {
  if (!isAdmin.value) return

  try {
    const res = await getUserList({ page: 1, limit: 1000 })
    salesUsers.value = res.list || res.data || []
  } catch (error) {
    console.error('加载销售人员列表失败:', error)
  }
}

// 加载对话列表
const loadConversations = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit,
    }

    // 管理员可以筛选用户
    if (isAdmin.value && filterForm.userId) {
      params.userId = filterForm.userId
    }

    if (filterForm.functionType) {
      params.functionType = filterForm.functionType
    }

    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }

    const res = await getConversations(params)
    conversations.value = res.list || res.data || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载对话列表失败:', error)
    ElMessage.error('加载对话列表失败')
  } finally {
    loading.value = false
  }
}

// 查看对话详情
const viewConversation = async (conversationId: number) => {
  detailLoading.value = true
  dialogVisible.value = true

  try {
    const res = await getConversationDetail(conversationId)
    currentConversation.value = res.conversation
    currentMessages.value = res.messages || []
  } catch (error) {
    console.error('加载对话详情失败:', error)
    ElMessage.error('加载对话详情失败')
    dialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 删除对话
const handleDelete = async (conversationId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？删除后将无法恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteConversation(conversationId)
    ElMessage.success('对话删除成功')
    await loadConversations()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除对话失败:', error)
      ElMessage.error('删除对话失败')
    }
  }
}

// 判断是否可以删除（普通用户只能删除自己的对话）
const canDelete = (conversation: any) => {
  if (isAdmin.value) return true
  return conversation.userId === userStore.userInfo?.id
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadConversations()
}

// 分页变化
const handlePageChange = () => {
  loadConversations()
}

const handlePageSizeChange = () => {
  pagination.page = 1
  loadConversations()
}

// 行点击
const handleRowClick = (row: any) => {
  viewConversation(row.id)
}

// 获取功能类型名称
const getFunctionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    deal_assist: '帮你谈单',
    reply_assist: '帮你回复',
    script_polish: '话术润色',
    opening_lines: '开场白生成',
  }
  return typeMap[type] || type
}

// 获取功能类型颜色
const getFunctionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    deal_assist: 'primary',
    reply_assist: 'success',
    script_polish: 'warning',
    opening_lines: 'info',
  }
  return colorMap[type] || ''
}

// 获取用户名称
const getUserName = (userId: number) => {
  const user = salesUsers.value.find(u => u.id === userId)
  return user?.realName || user?.username || '-'
}

// 获取最新消息预览
const getLatestMessagePreview = (message: any) => {
  if (!message) return '-'
  const content = message.content || ''
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return '-'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 一分钟内
  if (diff < 60000) {
    return '刚刚'
  }

  // 一小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }

  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  // 其他
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  loadSalesUsers()
  loadConversations()
})
</script>

<style scoped lang="scss">
.conversation-history-container {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;

    .filter-section {
      .el-select,
      .el-date-picker {
        width: 100%;
      }
    }
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 600;
      }

      .total {
        color: #909399;
        font-size: 14px;
      }
    }

    .conversation-title-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .conversation-icon {
        color: #409eff;
        font-size: 16px;
      }
    }

    .latest-message {
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.el-table__row) {
      cursor: pointer;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .conversation-detail {
    .conversation-info {
      margin-bottom: 20px;
    }

    .messages-container {
      max-height: 500px;
      overflow-y: auto;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .message-item {
        margin-bottom: 16px;
        padding: 12px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &.user {
          border-left: 3px solid #409eff;
        }

        &.assistant {
          border-left: 3px solid #67c23a;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #606266;
          font-size: 14px;

          .el-icon {
            font-size: 18px;
          }

          .role-name {
            font-weight: 600;
          }

          .message-time {
            margin-left: auto;
            color: #909399;
            font-size: 12px;
          }
        }

        .message-content {
          line-height: 1.6;
          color: #303133;
          white-space: pre-wrap;
        }

        .knowledge-sources {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #ebeef5;
          color: #909399;
          font-size: 12px;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
