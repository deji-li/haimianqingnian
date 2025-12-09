<template>
  <view class="customer-detail-page">
    <!-- 企业微信专用导航 -->
    <WeWorkHeader
      v-if="isWeWork"
      :title="customer?.realName || '客户详情'"
      :customer="customer"
      :show-chat="true"
      :show-share="true"
      @share="handleShare"
      @chat="handleWeWorkChat"
    />

    <!-- 原有导航（非企业微信环境） -->
    <view v-else class="normal-header">
      <text class="title">{{ customer?.realName || '客户详情' }}</text>
    </view>

    <view v-if="customer" class="detail-content">
      <!-- 企业微信关联状态 -->
      <view v-if="isWeWork" class="wework-status">
        <view class="status-item">
          <text class="label">企微关联:</text>
          <view :class="['status-tag', customer.weworkExternalUserId ? 'linked' : 'unlinked']">
            {{ customer.weworkExternalUserId ? '已关联' : '未关联' }}
          </view>
        </view>
        <view v-if="customer.weworkExternalUserId" class="status-item">
          <text class="label">外部联系人ID:</text>
          <text class="value">{{ customer.weworkExternalUserId }}</text>
        </view>
        <view v-if="customer.weworkFollowUserId" class="status-item">
          <text class="label">跟进员工:</text>
          <text class="value">{{ customer.weworkFollowUserId }}</text>
        </view>
        <view v-if="customer.weworkChatCount > 0" class="status-item">
          <text class="label">聊天记录:</text>
          <text class="value">{{ customer.weworkChatCount }}条</text>
        </view>
      </view>

      <!-- 客户基本信息 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <text v-if="isWeWork" class="card-action" @click="refreshCustomerInfo">刷新</text>
        </view>

        <!-- 原有信息行 -->
        <view class="info-row">
          <text class="label">姓名:</text>
          <text class="value">{{ customer.realName || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">微信昵称:</text>
          <text class="value">{{ customer.wechatNickname || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">微信ID:</text>
          <text class="value">{{ customer.wechatId }}</text>
        </view>
        <view class="info-row">
          <text class="label">手机号:</text>
          <text class="value">{{ customer.phone ? formatPhone(customer.phone) : '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="label">意向等级:</text>
          <view :class="['intent-tag', `intent-${customer.customerIntent}`]">
            {{ customer.customerIntent }}意向
          </view>
        </view>
        <view class="info-row">
          <text class="label">生命周期:</text>
          <text class="value">{{ customer.lifecycleStage || '未设置' }}</text>
        </view>
        <!-- 企业微信相关信息 -->
        <view v-if="isWeWork && customer.weworkLastChatTime" class="info-row">
          <text class="label">最后聊天:</text>
          <text class="value">{{ formatTime(customer.weworkLastChatTime) }}</text>
        </view>
        <view v-if="isWeWork && customer.intentionScore" class="info-row">
          <text class="label">AI意向度:</text>
          <view class="intention-score">
            <text class="score">{{ customer.intentionScore }}分</text>
            <view class="score-bar">
              <view class="score-fill" :style="{ width: `${customer.intentionScore}%` }"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 企业微信聊天记录（新增） -->
      <view v-if="isWeWork && customer.weworkExternalUserId" class="info-card">
        <view class="card-header">
          <text class="card-title">企业微信聊天</text>
          <view class="header-actions">
            <text v-if="chatRecords.length > 0" class="record-count">{{ chatRecords.length }}条</text>
            <text class="card-action" @click="loadChatRecords">
              {{ chatRecordsLoading ? '加载中...' : (chatRecords.length > 0 ? '查看更多' : '加载聊天') }}
            </text>
          </view>
        </view>

        <!-- 聊天记录预览 -->
        <view v-if="chatRecords.length > 0" class="chat-preview">
          <view v-for="record in chatRecords.slice(0, 5)" :key="record.id" class="chat-item" @click="openChatDetail(record)">
            <view class="chat-time">{{ formatChatTime(record.msgtime) }}</view>
            <view class="chat-content">
              <text class="message-type">{{ getMessageTypeText(record.msgtype) }}</text>
              <text class="message-text">{{ getChatContent(record) }}</text>
            </view>
            <view class="chat-meta">
              <text class="direction" :class="record.userid ? 'sent' : 'received'">
                {{ record.userid ? '我' : '客户' }}
              </text>
              <text v-if="record.aiAnalysisStatus === 'completed'" class="ai-analyzed">AI已分析</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-chat">
          <text>{{ chatRecordsLoading ? '加载中...' : '暂无聊天记录' }}</text>
          <button v-if="!chatRecordsLoading && !chatRecords.length" class="load-btn" @click="loadChatRecords">
            加载聊天记录
          </button>
        </view>
      </view>

      <!-- AI智能洞察（企业微信增强版） -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">AI智能洞察</text>
          <view v-if="isWeWork && customer.weworkChatAnalyzed" class="update-time">
            <text class="update-text">基于企微聊天</text>
            <text v-if="customer.weworkLastChatTime" class="time-text">{{ formatTime(customer.weworkLastChatTime) }}</text>
          </view>
          <text v-else class="card-action" @click="triggerAIAnalysis">
            {{ isWeWork ? '分析企微聊天' : 'AI分析' }}
          </text>
        </view>

        <!-- 原有AI洞察内容 -->
        <view v-if="aiInsights" class="ai-insights">
          <!-- 意向度评分 -->
          <view class="insight-item">
            <text class="label">意向度评分:</text>
            <view class="score-display">
              <text class="score">{{ aiInsights.intentionScore || 0 }}分</text>
              <view class="score-bar">
                <view class="score-fill" :style="{ width: `${aiInsights.intentionScore || 0}%` }"></view>
              </view>
            </view>
          </view>

          <!-- 客户痛点 -->
          <view v-if="aiInsights.customerPainPoints?.length" class="insight-item">
            <text class="label">识别痛点:</text>
            <view class="tags">
              <text v-for="pain in aiInsights.customerPainPoints" :key="pain" class="tag pain">
                {{ pain }}
              </text>
            </view>
          </view>

          <!-- 兴趣点 -->
          <view v-if="aiInsights.customerInterests?.length" class="insight-item">
            <text class="label">兴趣点:</text>
            <view class="tags">
              <text v-for="interest in aiInsights.customerInterests" :key="interest" class="tag interest">
                {{ interest }}
              </text>
            </view>
          </view>

          <!-- 需求关键词 -->
          <view v-if="aiInsights.customerNeeds?.length" class="insight-item">
            <text class="label">需求关键词:</text>
            <view class="tags">
              <text v-for="need in aiInsights.customerNeeds" :key="need" class="tag need">
                {{ need }}
              </text>
            </view>
          </view>

          <!-- 风险等级 -->
          <view v-if="aiInsights.riskLevel" class="insight-item">
            <text class="label">风险等级:</text>
            <view :class="['risk-tag', `risk-${aiInsights.riskLevel}`]">
              {{ aiInsights.riskLevel }}风险
            </view>
          </view>

          <!-- 成交机会 -->
          <view v-if="aiInsights.dealOpportunity" class="insight-item">
            <text class="label">成交机会:</text>
            <view :class="['opportunity-tag', `opportunity-${aiInsights.dealOpportunity}`]">
              {{ aiInsights.dealOpportunity }}机会
            </view>
          </view>

          <!-- 基于企微聊天的建议 -->
          <view v-if="isWeWork && aiInsights.weworkSuggestions?.length" class="insight-item">
            <text class="label">企微跟进建议:</text>
            <view class="suggestions">
              <text v-for="suggestion in aiInsights.weworkSuggestions" :key="suggestion" class="suggestion">
                • {{ suggestion }}
              </text>
            </view>
          </view>

          <!-- 预计成交周期 -->
          <view v-if="aiInsights.estimatedCycle" class="insight-item">
            <text class="label">预计成交:</text>
            <text class="cycle-text">{{ aiInsights.estimatedCycle }}</text>
          </view>
        </view>

        <!-- AI洞察为空的状态 -->
        <view v-else class="empty-insights">
          <text>{{ aiInsightsLoading ? 'AI分析中...' : '暂无AI洞察数据' }}</text>
          <button v-if="!aiInsightsLoading && !aiInsights" class="analyze-btn" @click="triggerAIAnalysis">
            {{ isWeWork ? '分析企微聊天' : '开始AI分析' }}
          </button>
        </view>
      </view>

      <!-- 原有的跟进记录 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">跟进记录</text>
          <text class="card-action" @click="showAddFollowDialog">+ 添加</text>
        </view>
        <view v-if="followRecords.length > 0" class="follow-list">
          <view v-for="record in followRecords" :key="record.id" class="follow-item">
            <view class="follow-header">
              <text class="operator">{{ record.operatorName }}</text>
              <text class="time">{{ formatDate(record.followTime, 'YYYY-MM-DD HH:mm') }}</text>
            </view>
            <view class="follow-content">{{ record.followContent }}</view>
            <view v-if="record.nextFollowTime" class="next-follow">
              下次跟进: {{ formatDate(record.nextFollowTime) }}
            </view>
          </view>
        </view>
        <view v-else class="empty-follow">
          <text>暂无跟进记录</text>
        </view>
      </view>

      <!-- 原有的订单记录 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">订单记录</text>
        </view>
        <view v-if="orders.length > 0" class="order-list">
          <view v-for="order in orders" :key="order.id" class="order-item">
            <view class="order-header">
              <text class="order-name">{{ order.courseName }}</text>
              <text class="order-amount">¥{{ formatMoney(order.paymentAmount, false) }}</text>
            </view>
            <view class="order-info">
              <text>{{ formatDate(order.paymentTime) }}</text>
              <view :class="['order-status', `status-${order.orderStatus}`]">
                {{ order.orderStatus }}
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-order">
          <text>暂无订单记录</text>
        </view>
      </view>

      <!-- 企业微信专用操作按钮 -->
      <view v-if="isWeWork" class="wework-actions">
        <button @click="associateWithWeWork" class="action-btn primary">
          {{ customer.weworkExternalUserId ? '更新企微关联' : '关联企微联系人' }}
        </button>
        <button @click="openWeWorkChat" class="action-btn secondary">
          {{ customer.weworkExternalUserId ? '发送企微消息' : '选择企微联系人' }}
        </button>
        <button @click="triggerWeWorkAnalysis" class="action-btn tertiary">
          {{ customer.weworkExternalUserId ? '重新分析' : '分析企微聊天' }}
        </button>
        <button v-if="customer.weworkExternalUserId" @click="openWeWorkProfile" class="action-btn quaternary">
          查看资料
        </button>
      </view>

      <!-- 原有的底部操作栏（非企业微信环境） -->
      <view v-else class="normal-actions">
        <button class="action-btn" @click="handleEdit">编辑</button>
        <button class="action-btn" @click="handleCall">拨打电话</button>
        <button class="action-btn primary" @click="showAddFollowDialog">添加跟进</button>
        <button class="action-btn secondary" @click="handleMessage">发送消息</button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="!customer" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 聊天详情弹窗 -->
    <uni-popup ref="chatDetailPopup" type="center">
      <view v-if="selectedChatRecord" class="chat-detail-popup">
        <view class="popup-header">
          <text class="popup-title">聊天详情</text>
          <text class="popup-close" @click="closeChatDetail">×</text>
        </view>
        <view class="popup-content">
          <view class="chat-info">
            <view class="info-row">
              <text class="label">消息类型:</text>
              <text class="value">{{ selectedChatRecord.msgtype }}</text>
            </view>
            <view class="info-row">
              <text class="label">发送时间:</text>
              <text class="value">{{ formatChatTime(selectedChatRecord.msgtime) }}</text>
            </view>
            <view v-if="selectedChatRecord.userid" class="info-row">
              <text class="label">发送方:</text>
              <text class="value">销售顾问</text>
            </view>
          </view>
          <view class="chat-content">
            <text class="content-label">消息内容:</text>
            <view class="content-text">{{ getChatContent(selectedChatRecord, true) }}</view>
          </view>
          <view v-if="selectedChatRecord.aiAnalysisResult" class="ai-analysis">
            <text class="analysis-label">AI分析:</text>
            <view class="analysis-content">
              <text>{{ selectedChatRecord.aiAnalysisResult.summary || '暂无分析结果' }}</text>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="close-btn" @click="closeChatDetail">关闭</button>
        </view>
      </view>
    </uni-popup>

    <!-- 添加跟进记录弹窗 -->
    <uni-popup ref="followPopup" type="bottom">
      <view class="follow-form">
        <view class="form-header">
          <text class="form-title">添加跟进记录</text>
          <text class="form-close" @click="closeFollowDialog">×</text>
        </view>
        <textarea
          class="follow-textarea"
          v-model="followForm.content"
          placeholder="请输入跟进内容..."
          :maxlength="500"
        ></textarea>
        <view class="form-actions">
          <button class="cancel-btn" @click="closeFollowDialog">取消</button>
          <button class="submit-btn" @click="submitFollowRecord">保存</button>
        </view>
      </view>
    </uni-popup>

    <!-- 企业微信关联弹窗 -->
    <uni-popup ref="associatePopup" type="center">
      <view class="associate-form">
        <view class="form-header">
          <text class="form-title">{{ customer.weworkExternalUserId ? '更新企微关联' : '关联企微联系人' }}</text>
          <text class="form-close" @click="closeAssociateDialog">×</text>
        </view>

        <view v-if="!customer.weworkExternalUserId" class="associate-tip">
          <text>请从企业微信中选择要关联的客户</text>
        </view>

        <view v-else class="associate-info">
          <text class="current-info">当前关联: {{ customer.weworkExternalUserId }}</text>
          <text class="change-tip">可选择新的联系人进行更新关联</text>
        </view>

        <view class="form-actions">
          <button class="cancel-btn" @click="closeAssociateDialog">取消</button>
          <button class="submit-btn" @click="handleAssociateContact">
            {{ customer.weworkExternalUserId ? '选择新联系人' : '选择联系人' }}
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 企业微信登录提示弹窗 -->
    <uni-popup ref="weworkLoginPopup" type="center">
      <view class="wework-login-prompt">
        <view class="prompt-header">
          <text class="prompt-title">企业微信登录</text>
        </view>
        <view class="prompt-content">
          <text>检测到您在企业微信环境中，是否使用企业微信账号登录？</text>
        </view>
        <view class="prompt-actions">
          <button class="cancel-btn" @click="skipWeworkLogin">普通登录</button>
          <button class="submit-btn" @click="handleWeworkLogin">企微登录</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onShow, onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { WeWorkEnv } from '@/utils/wework-env'
import { WeWorkSDK } from '@/utils/wework-sdk'
import { WeWorkAuthService } from '@/api/wework-auth'

// 响应式数据
const customer = ref(null)
const followRecords = ref([])
const orders = ref([])
const aiInsights = ref(null)
const chatRecords = ref([])
const selectedChatRecord = ref(null)

// 企业微信相关状态
const isWeWork = computed(() => WeWorkEnv.isWeWork())
const chatRecordsLoading = ref(false)
const aiInsightsLoading = ref(false)
const weworkSDK = WeWorkSDK.getInstance()

// 表单数据
const followForm = ref({
  content: ''
})

// 弹窗引用
const followPopup = ref(null)
const chatDetailPopup = ref(null)
const associatePopup = ref(null)
const weworkLoginPopup = ref(null)

// 页面参数
let customerId: number | null = null

// 初始化数据
onLoad(async (option) => {
  customerId = parseInt(option.id)
  await loadCustomerDetail(customerId)

  // 检查是否需要企业微信登录
  if (WeWorkEnv.isWeWork()) {
    await checkWeworkLoginStatus()
  }

  // 如果是企业微信环境且客户有关联，加载相关数据
  if (isWeWork.value && customer.value?.weworkExternalUserId) {
    await Promise.all([
      loadChatRecords(),
      loadAIInsights()
    ])
  }
})

// 页面显示时刷新数据
onShow(async () => {
  if (customerId) {
    await loadCustomerDetail(customerId)
  }
})

// 下拉刷新
onPullDownRefresh(async () => {
  if (customerId) {
    await loadCustomerDetail(customerId, true)
    uni.stopPullDownRefresh()
  }
})

// 加载客户详情
const loadCustomerDetail = async (id: number, refresh = false) => {
  try {
    uni.showLoading({ title: '加载中...' })

    const response = await uni.request({
      url: `/api/customer/${id}`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.success) {
      customer.value = response.data.customer

      // 加载相关数据
      await Promise.all([
        loadFollowRecords(id),
        loadOrders(id)
      ])

      // 企业微信环境加载额外数据
      if (isWeWork.value && customer.value?.weworkExternalUserId) {
        await Promise.all([
          loadChatRecords(),
          loadAIInsights()
        ])
      }
    }

    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    console.error('加载客户详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  }
}

// 加载跟进记录
const loadFollowRecords = async (id?: number) => {
  try {
    const targetId = id || customerId
    const response = await uni.request({
      url: `/api/follow-records`,
      method: 'GET',
      data: {
        customerId: targetId,
        pageSize: 10
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      followRecords.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载跟进记录失败:', error)
  }
}

// 加载订单记录
const loadOrders = async (id?: number) => {
  try {
    const targetId = id || customerId
    const response = await uni.request({
      url: `/api/orders`,
      method: 'GET',
      data: {
        customerId: targetId,
        pageSize: 10
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      orders.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载订单记录失败:', error)
  }
}

// 加载企业微信聊天记录
const loadChatRecords = async () => {
  if (!customer.value?.weworkExternalUserId) return

  try {
    chatRecordsLoading.value = true

    const response = await uni.request({
      url: '/api/wework/chat-records',
      method: 'GET',
      data: {
        externalUserId: customer.value.weworkExternalUserId,
        page: 1,
        pageSize: 20
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      chatRecords.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载企微聊天记录失败:', error)
  } finally {
    chatRecordsLoading.value = false
  }
}

// 加载AI洞察数据
const loadAIInsights = async () => {
  if (!customer.value?.id) return

  try {
    aiInsightsLoading.value = true

    const response = await uni.request({
      url: `/api/customer/${customer.value.id}/ai-insights`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.success) {
      aiInsights.value = response.data.insights
    }
  } catch (error) {
    console.error('加载AI洞察失败:', error)
  } finally {
    aiInsightsLoading.value = false
  }
}

// 企业微信关联联系人
const associateWithWeWork = () => {
  associatePopup.value?.open()
}

const handleAssociateContact = async () => {
  try {
    const externalUserId = await weworkSDK.selectExternalContact({
      type: 'single'
    })

    // 关联联系人到客户
    const response = await uni.request({
      url: '/api/wework/contacts/associate',
      method: 'POST',
      data: {
        customerId: customer.value.id,
        externalUserId
      }
    })

    if (response.statusCode === 200 && response.data.success) {
      // 刷新客户信息
      await loadCustomerDetail(customer.value.id)

      uni.showToast({
        title: customer.value.weworkExternalUserId ? '关联更新成功' : '关联成功',
        icon: 'success'
      })

      closeAssociateDialog()
    }
  } catch (error) {
    console.error('关联企微联系人失败:', error)
    uni.showToast({
      title: '关联失败',
      icon: 'error'
    })
  }
}

// 打开企业微信聊天
const openWeWorkChat = async () => {
  try {
    if (customer.value?.weworkExternalUserId) {
      // 已关联，直接打开聊天
      await weworkSDK.openEnterpriseChat({
        externalUserIds: [customer.value.weworkExternalUserId]
      })
    } else {
      // 未关联，选择联系人
      const externalUserId = await weworkSDK.selectExternalContact({
        type: 'single'
      })

      // 临时打开聊天（不关联）
      await weworkSDK.openEnterpriseChat({
        externalUserIds: [externalUserId]
      })

      // 询问是否关联
      uni.showModal({
        title: '关联提示',
        content: '是否将选择的联系人关联到此客户？',
        success: async (modalRes) => {
          if (modalRes.confirm) {
            await handleAssociateContact()
          }
        }
      })
    }
  } catch (error) {
    console.error('打开企微聊天失败:', error)
    uni.showToast({
      title: '打开聊天失败',
      icon: 'error'
    })
  }
}

// 打开企业微信用户资料
const openWeWorkProfile = async () => {
  if (!customer.value?.weworkExternalUserId) return

  try {
    await weworkSDK.openUserProfile(customer.value.weworkExternalUserId)
  } catch (error) {
    console.error('打开企微资料页失败:', error)
    uni.showToast({
      title: '打开资料页失败',
      icon: 'error'
    })
  }
}

// 触发企业微信AI分析
const triggerWeWorkAnalysis = async () => {
  if (!customer.value?.weworkExternalUserId) {
    uni.showToast({
      title: '请先关联企微联系人',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({ title: 'AI分析中...' })

    const response = await uni.request({
      url: '/api/wework/ai/trigger-analysis',
      method: 'POST',
      data: {
        externalUserId: customer.value.weworkExternalUserId
      }
    })

    uni.hideLoading()

    if (response.statusCode === 200 && response.data.success) {
      // 更新AI洞察
      aiInsights.value = response.data.aiInsights

      // 刷新客户信息
      await loadCustomerDetail(customer.value.id)

      uni.showToast({
        title: 'AI分析完成',
        icon: 'success'
      })
    } else {
      throw new Error(response.data.message || '分析失败')
    }
  } catch (error) {
    uni.hideLoading()
    console.error('触发企微AI分析失败:', error)
    uni.showToast({
      title: 'AI分析失败',
      icon: 'error'
    })
  }
}

// 触发AI分析
const triggerAIAnalysis = async () => {
  try {
    if (isWeWork.value) {
      // 企业微信环境，调用企微分析
      await triggerWeWorkAnalysis()
    } else {
      // 普通环境，调用通用分析
      await triggerGeneralAnalysis()
    }
  } catch (error) {
    console.error('触发AI分析失败:', error)
    uni.showToast({
      title: '分析失败',
      icon: 'error'
    })
  }
}

// 通用AI分析
const triggerGeneralAnalysis = async () => {
  // 实现通用AI分析逻辑
  uni.showToast({
    title: 'AI分析功能开发中',
    icon: 'none'
  })
}

// 分享到企业微信
const handleShare = async () => {
  try {
    if (!customer.value) return

    await weworkSDK.shareToChat({
      title: `${customer.value.realName || customer.value.name} - 客户资料`,
      desc: `意向度: ${customer.value.customerIntent || '未知'} | 生命周期: ${customer.value.lifecycleStage || '未知'}`,
      link: `${getCurrentBaseUrl()}/pages/customer/detail?id=${customer.value.id}`,
      imgUrl: customer.value.avatar || '/static/default-avatar.png'
    })

    uni.showToast({
      title: '分享成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('分享失败:', error)
    uni.showToast({
      title: '分享失败',
      icon: 'error'
    })
  }
}

// 处理企业微信聊天
const handleWeWorkChat = () => {
  openWeWorkChat()
}

// 刷新客户信息
const refreshCustomerInfo = async () => {
  await loadCustomerDetail(customer.value.id, true)
  uni.showToast({
    title: '刷新成功',
    icon: 'success'
  })
}

// 显示聊天详情
const openChatDetail = (record: any) => {
  selectedChatRecord.value = record
  chatDetailPopup.value?.open()
}

// 关闭聊天详情
const closeChatDetail = () => {
  selectedChatRecord.value = null
  chatDetailPopup.value?.close()
}

// 关闭关联弹窗
const closeAssociateDialog = () => {
  associatePopup.value?.close()
}

// 显示添加跟进弹窗
const showAddFollowDialog = () => {
  followPopup.value?.open()
}

// 关闭添加跟进弹窗
const closeFollowDialog = () => {
  followPopup.value?.close()
  followForm.value.content = ''
}

// 提交跟进记录
const submitFollowRecord = async () => {
  if (!followForm.value.content.trim()) {
    uni.showToast({
      title: '请输入跟进内容',
      icon: 'none'
    })
    return
  }

  try {
    const response = await uni.request({
      url: '/api/follow-records',
      method: 'POST',
      data: {
        customerId: customer.value.id,
        content: followForm.value.content,
        followTime: new Date().toISOString()
      }
    })

    if (response.statusCode === 201 && response.data.success) {
      followForm.value.content = ''
      closeFollowDialog()
      await loadFollowRecords()

      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } else {
      throw new Error(response.data.message || '添加失败')
    }
  } catch (error) {
    console.error('提交跟进记录失败:', error)
    uni.showToast({
      title: '添加失败',
      icon: 'error'
    })
  }
}

// 检查企业微信登录状态
const checkWeworkLoginStatus = async () => {
  try {
    const isLoggedIn = await WeWorkAuthService.checkLoginStatus()
    if (isLoggedIn) {
      return
    }

    // 显示登录选择弹窗
    weworkLoginPopup.value?.open()
  } catch (error) {
    console.error('检���企微登录状态失败:', error)
  }
}

// 处理企业微信登录
const handleWeworkLogin = async () => {
  try {
    const loginResult = await WeWorkAuthService.login()

    if (loginResult.success) {
      // 登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      weworkLoginPopup.value?.close()

      // 刷新页面数据
      setTimeout(() => {
        if (customerId) {
          loadCustomerDetail(customerId)
        }
      }, 1000)
    } else {
      uni.showToast({
        title: loginResult.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('企业微信登录失败:', error)
    uni.showToast({
      title: '登录失败',
      icon: 'error'
    })
  }
}

// 跳过企业微信登录
const skipWeworkLogin = () => {
  weworkLoginPopup.value?.close()
  // 可以跳转到普通登录页面
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

// 原有功能保持不变
const handleEdit = () => {
  // 编辑功能
  uni.navigateTo({
    url: `/pages/customer/edit?id=${customerId}`
  })
}

const handleCall = () => {
  // 拨打电话功能
  if (customer.value?.phone) {
    uni.makePhoneCall({
      phoneNumber: customer.value.phone
    })
  } else {
    uni.showToast({
      title: '客户暂无手机号',
      icon: 'none'
    })
  }
}

const handleMessage = () => {
  // 发送消息功能
  uni.showToast({
    title: '消息功能开发中',
    icon: 'none'
  })
}

// 辅助方法
const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-$2-$3')
}

const formatMoney = (amount: number, showSymbol = true): string => {
  const formatted = amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2
  })
  return showSymbol ? `¥${formatted}` : formatted
}

const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    default:
      return `${year}-${month}-${day}`
  }
}

const formatChatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString()
}

const getMessageTypeText = (msgtype: string): string => {
  const typeMap: Record<string, string> = {
    text: '文本',
    image: '图片',
    voice: '语音',
    video: '视频',
    file: '文件',
    location: '位置',
    link: '链接'
  }
  return typeMap[msgtype] || msgtype
}

const getChatContent = (record: any, full: boolean = false): string => {
  let content = ''

  switch (record.msgtype) {
    case 'text':
      content = record.msgcontent?.content || '[文本消息]'
      break
    case 'image':
      if (record.ocrResult) {
        content = `[图片] ${full ? record.ocrResult : record.ocrResult.substring(0, 50)}...`
      } else {
        content = '[图片]'
      }
      break
    case 'voice':
      if (record.voiceText) {
        content = `[语音] ${full ? record.voiceText : record.voiceText.substring(0, 50)}...`
      } else {
        content = '[语音消息]'
      }
      break
    case 'file':
      if (record.fileContent) {
        content = `[文件] ${full ? record.fileContent : record.fileContent.substring(0, 50)}...`
      } else {
        content = `[文件] ${record.msgcontent?.filename || '未知文件'}`
      }
      break
    default:
      content = `[${record.msgtype}消息]`
  }

  return content
}

const getCurrentBaseUrl = (): string => {
  // 根据环境获取基础URL
  return process.env.VUE_APP_BASE_URL || 'https://your-domain.com/mobile'
}
</script>

<style lang="scss" scoped>
.customer-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.detail-content {
  padding-bottom: 120rpx;
}

// 企业微信增强样式
.wework-status {
  margin: 20rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  color: white;

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      opacity: 0.9;
    }

    .value {
      font-size: 26rpx;
      opacity: 0.8;
    }

    .status-tag {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;

      &.linked {
        background: rgba(255, 255, 255, 0.2);
      color: #4caf50;
      border: 1rpx solid rgba(76, 175, 80, 0.3);
      }
    }
  }
}

.wework-actions {
  margin: 30rpx;
  padding: 0 20rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .action-btn {
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.secondary {
      background: linear-gradient(135deg, #42a5f5 0%, #478ed1 100%);
    }

    &.tertiary {
      background: linear-gradient(135deg, #8e8e93 0%, #5a6c7d 100%);
    }

    &.quaternary {
      background: linear-gradient(135deg, #ffeaa7 0%, #ffb74d 100%);
      color: #333;
    }

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
}

// 聊天记录样式
.chat-preview {
  .chat-item {
    margin-bottom: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &:active {
      background: #e9ecef;
    }

    .chat-time {
      font-size: 22rpx;
      color: #999;
      margin-bottom: 8rpx;
    }

    .chat-content {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .message-type {
        font-size: 22rpx;
        color: #667eea;
        font-weight: 500;
      }

      .message-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.4;
        word-break: break-all;
      }
    }

    .chat-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12rpx;

      .direction {
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;

        &.sent {
          background: #e3f2fd;
          color: #1976d2;
        }

        &.received {
          background: #f3e5f5;
          color: #f44336;
        }
      }

      .ai-analyzed {
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        background: #e8f5e8;
        color: #4caf50;
        border-radius: 12rpx;
      }
    }
  }
}

.empty-chat {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;

  .load-btn {
    margin-top: 20rpx;
    padding: 20rpx 40rpx;
    background: #667eea;
    color: white;
    border-radius: 24rpx;
    font-size: 28rpx;
  }
}

// AI洞察样式增强
.ai-insights {
  .intention-score {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .score {
      font-size: 32rpx;
      font-weight: bold;
      color: #667eea;
      min-width: 80rpx;
    }

    .score-bar {
      flex: 1;
      height: 12rpx;
      background: #e0e0e0;
      border-radius: 6rpx;
      overflow: hidden;

      .score-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s ease;
      }
    }
  }

  .insight-item {
    margin-bottom: 24rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 12rpx;
      display: block;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .tag {
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;

        &.pain {
          background: #ffebee;
          color: #c62828;
        }

        &.interest {
          background: #e8f5e8;
          color: #2e7d32;
        }

        &.need {
          background: #fff3e0;
          color: #f57c00;
        }
      }
    }

    .risk-tag {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;

      &.risk-high {
        background: #ffebee;
        color: #c62828;
      }

      &.risk-medium {
        background: #fff8e1;
        color: #ff9800;
      }

      &.risk-low {
        background: #f1f8e9;
        color: #4caf50;
      }
    }

    .opportunity-tag {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;

      &.opportunity-high {
        background: #e8f5e8;
        color: #2e7d32;
      }

      &.opportunity-medium {
        background: #fff3e0;
        color: #ff9800;
      }

      &.opportunity-low {
        background: #f1f8e9;
        color: #4caf50;
      }
    }

    .cycle-text {
      font-size: 26rpx;
      color: #666;
    }

    .suggestions {
      .suggestion {
        display: block;
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
        margin-bottom: 8rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.empty-insights {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;

  .analyze-btn {
    margin-top: 20rpx;
    padding: 20rpx 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 24rpx;
    font-size: 28rpx;
  }
}

// 企业微信登录弹窗样式
.wework-login-prompt {
  background: white;
  border-radius: 20rpx;
  margin: 60rpx;
  padding: 40rpx;
  text-align: center;

  .prompt-header {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
  }

  .prompt-content {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 40rpx;
    line-height: 1.5;
  }

  .prompt-actions {
    display: flex;
    gap: 20rpx;
    justify-content: center;

    .cancel-btn,
    .submit-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: 500;
      border: none;
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    .submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }
}

// 企业微信关联弹窗样式
.associate-form {
  background: white;
  border-radius: 20rpx;
  margin: 60rpx;
  padding: 40rpx;
  text-align: center;

  .form-header {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
    position: relative;

    .form-close {
      position: absolute;
      right: 0;
      top: 0;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      color: #999;
    }
  }

  .associate-tip {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 30rpx;
    line-height: 1.5;
  }

  .associate-info {
    background: #f8f9fa;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-bottom: 30rpx;

    .current-info,
    .change-tip {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 10rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .change-tip {
      color: #667eea;
    }
  }

  .form-actions {
    display: flex;
    gap: 20rpx;
    justify-content: center;

    .cancel-btn,
    .submit-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: 500;
      border: none;
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    .submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }
}

// 聊天详情弹窗样式
.chat-detail-popup {
  background: white;
  border-radius: 20rpx;
  margin: 60rpx;
  padding: 0;
  max-width: 90vw;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .popup-close {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      color: #999;
    }
  }

  .popup-content {
    padding: 30rpx;

    .chat-info {
      margin-bottom: 20rpx;

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .label {
          font-size: 28rpx;
          color: #666;
          min-width: 120rpx;
        }

        .value {
          font-size: 26rpx;
          color: #333;
          flex: 1;
          text-align: right;
        }
      }
    }

    .chat-content {
      margin-bottom: 20rpx;

      .content-label {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
        display: block;
      }

      .content-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        background: #f8f9fa;
        padding: 20rpx;
        border-radius: 8rpx;
        min-height: 100rpx;
        max-height: 400rpx;
        overflow-y: auto;
      }
    }

    .ai-analysis {
      margin-top: 20rpx;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;

      .analysis-label {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
        display: block;
      }

      .analysis-content {
        font-size: 26rpx;
        color: #333;
        line-height: 1.5;
      }
    }
  }

  .popup-footer {
    padding: 30rpx;
    border-top: 1rpx solid #f0f0f0;

    .close-btn {
      width: 100%;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      background: #667eea;
      color: white;
      border: none;
      font-weight: 500;
    }
  }
}

// 原有样式保持不变
.info-card {
  margin: 20rpx;
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .card-action {
      font-size: 26rpx;
      color: #667eea;
      padding: 0;
      background: none;
      border: none;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .record-count {
        font-size: 24rpx;
        color: #999;
        margin-right: 12rpx;
      }

      .update-time {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .update-text {
          font-size: 22rpx;
          color: #4caf50;
        }

        .time-text {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      min-width: 120rpx;
    }

    .value {
      font-size: 26rpx;
      color: #333;
      flex: 1;
    }

    .intent-tag {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;

      &.intent-高 {
        background: #e8f5e8;
        color: #2e7d32;
      }

      &.intent-中 {
        background: #fff8e1;
        color: #ff9800;
      }

      &.intent-低 {
        background: #f1f8e9;
        color: #4caf50;
      }
    }
  }

  .empty-follow,
  .empty-order {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}

// 底部操作栏
.bottom-actions,
.normal-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: white;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
    margin: 0 10rpx;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }
}

.normal-actions {
  padding: 20rpx 40rpx;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式适配
@media screen and (max-width: 750rpx) {
  .wework-actions {
    .action-btn {
      font-size: 28rpx;
    }
  }

  .chat-preview .chat-item {
    .chat-content {
      .message-type {
        font-size: 20rpx;
      }

      .message-text {
        font-size: 26rpx;
      }
    }
  }

  .ai-insights .insight-item .tags .tag {
      font-size: 22rpx;
      padding: 6rpx 12rpx;
    }
}
</style>