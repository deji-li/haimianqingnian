<template>
  <div class="customer-detail-container">
    <!-- 返回按钮 -->
    <el-card class="back-card" shadow="never">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </el-card>

    <!-- 回访提醒 -->
    <el-alert
      v-if="customerInfo && customerInfo.nextFollowTime && isFollowDue(customerInfo.nextFollowTime)"
      :title="isOverdue(customerInfo.nextFollowTime) ? '回访已逾期' : '待回访提醒'"
      :type="isOverdue(customerInfo.nextFollowTime) ? 'error' : 'warning'"
      :closable="false"
      class="follow-alert"
      show-icon
    >
      <template #default>
        <div class="alert-content">
          <span>下次回访时间：{{ formatDateTime(customerInfo.nextFollowTime) }}</span>
          <el-button
            :type="isOverdue(customerInfo.nextFollowTime) ? 'danger' : 'warning'"
            size="default"
            @click="handleAddFollow"
            class="alert-follow-btn"
          >
            <el-icon><EditPen /></el-icon>
            立即跟进
          </el-button>
        </div>
      </template>
    </el-alert>

    <!-- 客户基本信息 -->
    <el-card class="info-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">客户基本信息</span>
          <el-button type="primary" size="small" @click="handleEdit">编辑</el-button>
        </div>
      </template>

      <el-descriptions :column="3" border v-if="customerInfo">
        <el-descriptions-item label="客户ID">{{ customerInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ customerInfo.wechatNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信号">{{ customerInfo.wechatId }}</el-descriptions-item>

        <el-descriptions-item label="手机号">{{ customerInfo.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ customerInfo.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联订单号">
          <span v-if="customerOrders.length > 0">
            <el-tag
              v-for="order in customerOrders.slice(0, 2)"
              :key="order.id"
              type="info"
              size="small"
              style="margin-right: 4px; cursor: pointer;"
              @click="handleViewOrder(order)"
              :title="'点击查看订单详情'"
            >
              {{ order.orderNo }}
            </el-tag>
            <el-tag
              v-if="customerOrders.length > 2"
              type="info"
              size="small"
              @click="scrollToOrders"
              style="cursor: pointer;"
              :title="'查看全部订单'"
            >
              +{{ customerOrders.length - 2 }}个
            </el-tag>
          </span>
          <span v-else class="text-secondary">
            暂无订单
            <el-button
              type="text"
              size="small"
              @click="handleBindOrder"
              style="margin-left: 8px; padding: 0;"
            >
              绑定订单
            </el-button>
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="客户意向">
          <el-tag
            :type="
              customerInfo.customerIntent === '高意向' || customerInfo.customerIntent === '高'
                ? 'success'
                : customerInfo.customerIntent === '中意向' || customerInfo.customerIntent === '中'
                  ? 'warning'
                  : customerInfo.customerIntent === '低意向' || customerInfo.customerIntent === '低'
                    ? 'info'
                    : 'danger'
            "
          >
            {{ customerInfo.customerIntent }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="生命周期阶段">
          <el-tag
            :type="getLifecycleTagType(customerInfo.lifecycleStage)"
            size="large"
          >
            {{ customerInfo.lifecycleStage || '线索' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="流量来源">{{ customerInfo.trafficSource || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对接销售">{{ customerInfo.salesName }}</el-descriptions-item>
        <el-descriptions-item label="运营人员">{{ customerInfo.operatorName || '-' }}</el-descriptions-item>

        <el-descriptions-item label="下次回访时间" :span="2">
          <span v-if="customerInfo.nextFollowTime">
            {{ formatDateTime(customerInfo.nextFollowTime) }}
          </span>
          <span v-else class="text-secondary">未设置</span>
        </el-descriptions-item>
        <el-descriptions-item label="跟进次数">{{ customerInfo.followRecordCount || 0 }} 次</el-descriptions-item>

        <!-- AI分析字段（动态渲染） -->
        <template v-for="field in aiFieldMappings" :key="field.dbField">
          <el-descriptions-item
            v-if="getFieldValue(field.dbField)"
            :label="field.description.replace(/（.*?）/, '')"
          >
            <el-tag v-if="shouldShowAsTag(field.dbField)" :type="getFieldTagType(field.dbField, getFieldValue(field.dbField))">
              {{ formatFieldValue(field.dbField, getFieldValue(field.dbField)) }}
            </el-tag>
            <template v-else>
              {{ formatFieldValue(field.dbField, getFieldValue(field.dbField)) }}
            </template>
            <el-icon style="color: #409EFF; margin-left: 4px" title="AI自动识别"><MagicStick /></el-icon>
          </el-descriptions-item>
        </template>

        <el-descriptions-item label="AI分析时间" v-if="customerInfo && customerInfo.lastAiAnalysisTime">
          {{ formatDateTime(customerInfo.lastAiAnalysisTime) }}
        </el-descriptions-item>
        <!-- AI分析字段结束 -->

        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(customerInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(customerInfo.updateTime) }}
        </el-descriptions-item>

        <el-descriptions-item label="备注" :span="3">
          {{ customerInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- AI智能分析 -->
    <el-card class="ai-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon style="vertical-align: middle; margin-right: 4px"><MagicStick /></el-icon>
            AI智能分析
          </span>
          <el-button type="primary" size="small" @click="goToAiChatAnalysis">
            上传聊天记录
          </el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <!-- AI标签 -->
        <el-col :span="12">
          <div class="ai-section">
            <h4 class="section-title">AI客户标签</h4>
            <div v-if="aiTags.length > 0" class="tags-container">
              <el-tag
                v-for="tag in aiTags.slice(0, 10)"
                :key="tag.id"
                :type="getTagType(tag.tagCategory)"
                style="margin-right: 8px; margin-bottom: 8px"
                size="default"
              >
                {{ tag.tagName }}
                <span v-if="tag.confidence" class="confidence">
                  ({{ Math.round(tag.confidence * 100) }}%)
                </span>
              </el-tag>
              <el-button
                v-if="aiTags.length > 10"
                link
                type="primary"
                size="small"
                @click="showAllTagsDialog = true"
              >
                查看全部 {{ aiTags.length }} 个标签
              </el-button>
            </div>
            <el-empty v-else description="暂无AI标签" :image-size="60" />
          </div>
        </el-col>

        <!-- 最新AI分析 -->
        <el-col :span="12">
          <div class="ai-section">
            <h4 class="section-title">最新聊天分析</h4>
            <div v-if="latestAiAnalysis" class="analysis-container">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="质量等级">
                  <el-tag :type="getQualityType(latestAiAnalysis.qualityLevel)" v-if="latestAiAnalysis.qualityLevel">
                    {{ latestAiAnalysis.qualityLevel }}级
                  </el-tag>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="风险等级">
                  <el-tag :type="getRiskType(latestAiAnalysis.riskLevel)" v-if="latestAiAnalysis.riskLevel">
                    {{ latestAiAnalysis.riskLevel }}
                  </el-tag>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="意向评分">
                  <span v-if="latestAiAnalysis.intentionScore">{{ latestAiAnalysis.intentionScore }}分</span>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="分析时间">
                  {{ formatDateTime(latestAiAnalysis.createTime) }}
                </el-descriptions-item>
              </el-descriptions>
              <el-button
                type="primary"
                link
                size="small"
                style="margin-top: 10px"
                @click="goToAiChatAnalysis"
              >
                查看详细分析
              </el-button>
            </div>
            <el-empty v-else description="暂无分析记录" :image-size="60" />
          </div>
        </el-col>
      </el-row>

      <!-- AI工具快捷操作 -->
      <el-divider />
      <div class="ai-actions">
        <h4 class="section-title">AI工具</h4>
        <el-space wrap>
          <el-button
            type="primary"
            @click="handleGenerateScript('开场白')"
            :loading="scriptLoading['开场白']"
            size="default"
          >
            <el-icon><ChatDotRound /></el-icon>
            生成开场白
          </el-button>
          <el-button
            type="success"
            @click="handleGenerateScript('价值主张')"
            :loading="scriptLoading['价值主张']"
            size="default"
          >
            <el-icon><Star /></el-icon>
            生成价值主张
          </el-button>
          <el-button
            type="warning"
            @click="handleGenerateScript('异议处理')"
            :loading="scriptLoading['异议处理']"
            size="default"
          >
            <el-icon><QuestionFilled /></el-icon>
            异议处理话术
          </el-button>
          <el-button
            @click="router.push('/ai/knowledge')"
            size="default"
          >
            <el-icon><Reading /></el-icon>
            查询知识库
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 客户洞察（痛点、兴趣点、需求关键词） -->
    <el-card class="insights-card" shadow="never" v-if="customerInfo">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon style="vertical-align: middle; margin-right: 4px"><TrendCharts /></el-icon>
            客户洞察
          </span>
          <el-text size="small" type="info">基于聊天记录AI分析聚合</el-text>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 痛点 -->
        <el-col :span="8">
          <div class="insight-section">
            <h4 class="insight-title">
              <el-icon color="#E6A23C"><WarningFilled /></el-icon>
              客户痛点
            </h4>
            <div v-if="aiInsights.painPoints && aiInsights.painPoints.length > 0" class="insight-content">
              <el-space direction="vertical" :fill="true" style="width: 100%">
                <el-tag
                  v-for="(point, index) in aiInsights.painPoints"
                  :key="index"
                  type="warning"
                  effect="plain"
                  size="default"
                  style="width: 100%; justify-content: flex-start"
                >
                  <el-icon style="margin-right: 4px"><Warning /></el-icon>
                  {{ point }}
                </el-tag>
              </el-space>
            </div>
            <el-empty v-else description="暂无痛点数据" :image-size="60" />
            <div class="insight-tip">
              <el-icon><InfoFilled /></el-icon>
              AI从多次沟通中自动提取，按出现频率排序
            </div>
          </div>
        </el-col>

        <!-- 兴趣点 -->
        <el-col :span="8">
          <div class="insight-section">
            <h4 class="insight-title">
              <el-icon color="#67C23A"><StarFilled /></el-icon>
              兴趣点
            </h4>
            <div v-if="aiInsights.interestPoints && aiInsights.interestPoints.length > 0" class="insight-content">
              <el-space direction="vertical" :fill="true" style="width: 100%">
                <el-tag
                  v-for="(point, index) in aiInsights.interestPoints"
                  :key="index"
                  type="success"
                  effect="plain"
                  size="default"
                  style="width: 100%; justify-content: flex-start"
                >
                  <el-icon style="margin-right: 4px"><Star /></el-icon>
                  {{ point }}
                </el-tag>
              </el-space>
            </div>
            <el-empty v-else description="暂无兴趣点数据" :image-size="60" />
            <div class="insight-tip">
              <el-icon><InfoFilled /></el-icon>
              包括明确表达和隐含的兴趣
            </div>
          </div>
        </el-col>

        <!-- 需求关键词 -->
        <el-col :span="8">
          <div class="insight-section">
            <h4 class="insight-title">
              <el-icon color="#409EFF"><Key /></el-icon>
              需求关键词
            </h4>
            <div v-if="aiInsights.needKeywords && aiInsights.needKeywords.length > 0" class="insight-content">
              <el-space wrap>
                <el-tag
                  v-for="(keyword, index) in aiInsights.needKeywords"
                  :key="index"
                  type="primary"
                  effect="light"
                  size="default"
                >
                  {{ keyword }}
                </el-tag>
              </el-space>
            </div>
            <el-empty v-else description="暂无关键词" :image-size="60" />
            <div class="insight-tip">
              <el-icon><InfoFilled /></el-icon>
              从痛点和兴趣点中智能提取
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 营销建议 -->
      <el-divider />
      <div class="marketing-suggestions" v-if="hasInsightsData">
        <h4 class="section-title">
          <el-icon><Compass /></el-icon>
          营销建议
        </h4>
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="suggestions-content">
              <p v-if="aiInsights.painPoints && aiInsights.painPoints.length > 0">
                <strong>针对痛点：</strong>重点强调我们的解决方案如何解决"{{ aiInsights.painPoints[0] }}"等问题
              </p>
              <p v-if="aiInsights.interestPoints && aiInsights.interestPoints.length > 0">
                <strong>利用兴趣点：</strong>可以从"{{ aiInsights.interestPoints[0] }}"切入，建立信任
              </p>
              <p v-if="aiInsights.needKeywords && aiInsights.needKeywords.length > 0">
                <strong>话术关键词：</strong>沟通时多使用 {{ aiInsights.needKeywords.slice(0, 5).join('、') }} 等词汇
              </p>
            </div>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 跟进记录 -->
    <el-card class="follow-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">跟进记录</span>
          <el-button type="primary" size="default" @click="handleAddFollow" class="add-follow-btn">
            <el-icon><Plus /></el-icon>
            添加跟进记录
          </el-button>
        </div>
      </template>

      <el-timeline v-if="followRecords.length > 0">
        <el-timeline-item
          v-for="record in followRecords"
          :key="record.id"
          :timestamp="formatDateTime(record.followTime)"
          placement="top"
        >
          <el-card>
            <div class="follow-header">
              <span class="operator">{{ record.operatorName }}</span>
              <span class="time">{{ formatDateTime(record.followTime) }}</span>
            </div>
            <div class="follow-content">{{ record.followContent }}</div>
            <div v-if="record.nextFollowTime" class="next-follow">
              <el-icon><Clock /></el-icon>
              下次跟进：{{ formatDateTime(record.nextFollowTime) }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无跟进记录" />
    </el-card>

    <!-- 生命周期历史 -->
    <el-card class="lifecycle-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">生命周期历史</span>
          <el-button type="primary" size="default" @click="handleChangeStage">
            <el-icon><Edit /></el-icon>
            变更阶段
          </el-button>
        </div>
      </template>

      <el-timeline v-if="lifecycleHistory.length > 0">
        <el-timeline-item
          v-for="record in lifecycleHistory"
          :key="record.id"
          :timestamp="formatDateTime(record.createTime)"
          placement="top"
          :type="getLifecycleTimelineType(record.stage)"
        >
          <el-card>
            <div class="lifecycle-header">
              <el-tag :type="getLifecycleTagType(record.stage)" size="large">
                {{ record.stage }}
              </el-tag>
              <span class="operator">操作人：{{ record.operatorName }}</span>
            </div>
            <div v-if="record.changeReason" class="lifecycle-reason">
              {{ record.changeReason }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无生命周期记录" />
    </el-card>

    <!-- 订单历史 -->
    <el-card class="order-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">
              <el-icon style="margin-right: 8px; color: #409EFF"><Document /></el-icon>
              订单历史
            </span>
            <el-tag v-if="customerOrders.length > 0" type="info" size="small">
              共 {{ customerOrders.length }} 个订单
            </el-tag>
          </div>
          <el-button type="primary" @click="handleBindOrder">
            <el-icon><Plus /></el-icon>
            绑定订单
          </el-button>
        </div>
      </template>

      <div v-if="customerOrders.length > 0" class="order-table-wrapper">
        <el-table
          :data="customerOrders"
          stripe
          class="order-table"
          :row-class-name="tableRowClassName"
          empty-text="暂无订单记录"
        >
          <el-table-column prop="orderNo" label="订单号" width="180" fixed="left">
            <template #default="{ row }">
              <div class="order-no-cell">
                <el-icon class="order-icon"><Document /></el-icon>
                <span class="order-no">{{ row.orderNo }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="courseName" label="课程名称" width="160">
            <template #default="{ row }">
              <div class="course-name">
                <el-icon class="course-icon"><Reading /></el-icon>
                <span>{{ row.courseName || '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="paymentAmount" label="付款金额" width="130" align="right">
            <template #default="{ row }">
              <span class="amount" :class="{ 'amount-high': Number(row.paymentAmount) > 5000 }">
                ¥{{ Number(row.paymentAmount || 0).toLocaleString() }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="isNewStudent" label="学员类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                :type="Number(row.isNewStudent) === 1 ? 'success' : 'info'"
                size="small"
                effect="light"
              >
                <el-icon style="margin-right: 4px">
                  <User v-if="Number(row.isNewStudent) === 1" />
                  <UserFilled v-else />
                </el-icon>
                {{ Number(row.isNewStudent) === 1 ? '新学员' : '老学员' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="orderStatus" label="订单状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.orderStatus === '待上课' ? 'warning' :
                  row.orderStatus === '上课中' ? 'primary' :
                  row.orderStatus === '已完成' ? 'success' :
                  row.orderStatus === '已退款' ? 'info' : 'danger'
                "
                size="small"
                effect="light"
              >
                <el-icon style="margin-right: 4px">
                  <Clock v-if="row.orderStatus === '待上课'" />
                  <VideoPlay v-else-if="row.orderStatus === '上课中'" />
                  <CircleCheck v-else-if="row.orderStatus === '已完成'" />
                  <CircleClose v-else-if="row.orderStatus === '已退款'" />
                  <WarningFilled v-else />
                </el-icon>
                {{ row.orderStatus || '未知状态' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="paymentTime" label="支付时间" width="160">
            <template #default="{ row }">
              <div class="payment-time">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateTime(row.paymentTime) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="salesName" label="销售顾问" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.salesName" type="primary" size="small" effect="plain">
                {{ row.salesName }}
              </el-tag>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="查看订单详情" placement="top">
                  <el-button
                    circle
                    type="primary"
                    size="small"
                    @click="handleViewOrder(row)"
                    class="action-btn view-btn"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="解绑订单" placement="top">
                  <el-button
                    circle
                    type="danger"
                    size="small"
                    @click="handleUnbindOrder(row)"
                    class="action-btn unbind-btn"
                  >
                    <el-icon><CircleClose /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else class="empty-order-container">
        <el-empty
          description="暂无订单记录"
          :image-size="120"
        >
          <template #image>
            <div class="empty-icon">
              <el-icon size="80"><Document /></el-icon>
            </div>
          </template>
          <template #description>
            <div class="empty-description">
              <p>该客户暂无订单记录</p>
              <p class="empty-tip">点击上方"绑定订单"按钮为客户绑定订单</p>
            </div>
          </template>
          <el-button type="primary" @click="handleBindOrder">
            <el-icon><Plus /></el-icon>
            立即绑定订单
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑客户信息"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="微信昵称" prop="wechatNickname">
          <el-input v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="流量来源" prop="trafficSource">
          <el-select v-model="formData.trafficSource" placeholder="请选择流量来源" style="width: 100%">
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="百度" value="百度" />
            <el-option label="朋友圈" value="朋友圈" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户意向" prop="customerIntent">
          <el-select v-model="formData.customerIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option label="高意向" value="高意向" />
            <el-option label="中意向" value="中意向" />
            <el-option label="低意向" value="低意向" />
          </el-select>
        </el-form-item>

        <el-form-item label="下次回访时间" prop="nextFollowTime">
          <el-date-picker
            v-model="formData.nextFollowTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleUpdate">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 绑定订单对话框 -->
    <el-dialog
      v-model="bindOrderDialogVisible"
      title="绑定订单"
      width="800px"
    >
      <div v-if="customerInfo" class="customer-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户昵称">{{ customerInfo.wechatNickname }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ customerInfo.realName || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ customerInfo.phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="微信ID">{{ customerInfo.wechatId || '未填写' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="order-binding" style="margin-top: 20px;">
        <el-form :model="bindOrderForm" label-width="100px">
          <el-form-item label="订单号" prop="orderNo" :error="bindOrderError">
            <el-input
              v-model="bindOrderForm.orderNo"
              placeholder="请输入完整的订单号"
              clearable
              @blur="validateOrderNo"
              @input="clearBindOrderError"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>

            <!-- 订单状态提示 -->
            <div v-if="orderStatus.message" class="order-status-message" :class="orderStatus.type">
              <el-icon v-if="orderStatus.type === 'success'"><CircleCheck /></el-icon>
              <el-icon v-else-if="orderStatus.type === 'warning'"><Warning /></el-icon>
              <el-icon v-else><InfoFilled /></el-icon>
              {{ orderStatus.message }}
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="closeBindOrderDialog">取消</el-button>
        <el-button type="primary" @click="confirmBindOrder">
          确定绑定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加跟进对话框 -->
    <el-dialog
      v-model="followDialogVisible"
      title="添加跟进记录"
      width="600px"
      @close="handleFollowDialogClose"
    >
      <el-form
        ref="followFormRef"
        :model="followFormData"
        :rules="followFormRules"
        label-width="120px"
      >
        <el-form-item label="跟进内容" prop="followContent">
          <el-input
            v-model="followFormData.followContent"
            type="textarea"
            :rows="5"
            placeholder="请输入跟进内容"
          />
        </el-form-item>

        <el-form-item label="下次跟进时间" prop="nextFollowTime">
          <el-date-picker
            v-model="followFormData.nextFollowTime"
            type="datetime"
            placeholder="选择下次跟进时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="followDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="followSubmitLoading" @click="handleSubmitFollow">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 变更生命周期阶段对话框 -->
    <el-dialog
      v-model="stageDialogVisible"
      title="变更生命周期阶段"
      width="500px"
      @close="handleStageDialogClose"
    >
      <el-form
        ref="stageFormRef"
        :model="stageFormData"
        :rules="stageFormRules"
        label-width="120px"
      >
        <el-form-item label="当前阶段">
          <el-tag :type="getLifecycleTagType(customerInfo?.lifecycleStage)" size="large">
            {{ customerInfo?.lifecycleStage || '线索' }}
          </el-tag>
        </el-form-item>

        <el-form-item label="变更为" prop="stage">
          <el-select v-model="stageFormData.stage" placeholder="请选择新阶段" style="width: 100%">
            <el-option label="线索" value="线索" />
            <el-option label="意向客户" value="意向客户" />
            <el-option label="商机" value="商机" />
            <el-option label="成交客户" value="成交客户" />
            <el-option label="复购客户" value="复购客户" />
            <el-option label="流失客户" value="流失客户" />
          </el-select>
        </el-form-item>

        <el-form-item label="变更原因" prop="changeReason">
          <el-input
            v-model="stageFormData.changeReason"
            type="textarea"
            :rows="3"
            placeholder="请输入阶段变更原因（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="stageDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="stageSubmitLoading" @click="handleSubmitStage">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看全部AI标签对话框 -->
    <el-dialog
      v-model="showAllTagsDialog"
      title="全部AI客户标签"
      width="600px"
    >
      <div class="all-tags-container">
        <el-tag
          v-for="tag in aiTags"
          :key="tag.id"
          :type="getTagType(tag.tagCategory)"
          style="margin-right: 8px; margin-bottom: 8px"
          size="default"
        >
          {{ tag.tagName }}
          <span v-if="tag.confidence" class="confidence">
            ({{ Math.round(tag.confidence * 100) }}%)
          </span>
        </el-tag>
      </div>
      <template #footer>
        <el-button @click="showAllTagsDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  EditPen,
  Plus,
  Edit,
  Clock,
  MagicStick,
  ChatDotRound,
  Star,
  QuestionFilled,
  Reading,
  TrendCharts,
  WarningFilled,
  Warning,
  StarFilled,
  Key,
  InfoFilled,
  Compass,
  Document,
  CircleCheck,
  User,
  UserFilled,
  VideoPlay,
  CircleClose,
  Calendar,
  View,
} from '@element-plus/icons-vue'
import { useRecentStore } from '@/store/recent'
import {
  getCustomerDetail,
  updateCustomer,
  getFollowRecords,
  createFollowRecord,
  type Customer,
  type FollowRecord,
} from '@/api/customer'
import {
  getCustomerOrders,
  getAvailableOrders,
  bindOrderToCustomer,
  bindOrderByOrderNo,
  unbindOrderFromCustomer,
  type Order
} from '@/api/order'
import {
  getLifecycleHistory,
  createLifecycle,
  type LifecycleHistory,
} from '@/api/lifecycle'
import {
  getCustomerTags,
  getChatRecordList,
  generateScript,
} from '@/api/ai'
import { useUserStore } from '@/store/user'
import { formatDateTime, isOverdue } from '@/utils/date'
import dayjs from 'dayjs'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recentStore = useRecentStore()

const loading = ref(false)
const customerInfo = ref<Customer | null>(null)
const followRecords = ref<FollowRecord[]>([])
const customerOrders = ref<Order[]>([])
const lifecycleHistory = ref<LifecycleHistory[]>([])
const aiTags = ref<any[]>([])
const latestAiAnalysis = ref<any>(null)

// 从AI分析中提取的洞察数据
const aiInsights = computed(() => {
  const analysis = latestAiAnalysis.value
  if (!analysis) {
    console.log('❌ latestAiAnalysis 为空，返回默认空数据')
    return {
      painPoints: [],
      interestPoints: [],
      needsSummary: '',
      objections: [],
      needKeywords: []
    }
  }

  console.log('=== aiInsights computed 开始计算 ===')

  // 如果aiAnalysisResult是字符串，尝试解析
  let analysisResult = {}
  if (analysis.aiAnalysisResult) {
    try {
      analysisResult = typeof analysis.aiAnalysisResult === 'string'
        ? JSON.parse(analysis.aiAnalysisResult)
        : analysis.aiAnalysisResult || {}
      console.log('✅ 解析后的analysisResult:', analysisResult)
    } catch (e) {
      console.error('❌ 解析aiAnalysisResult失败:', e)
      analysisResult = {}
    }
  }

  const result = {
    painPoints: analysisResult.painPoints || analysis.painPoints || [],
    interestPoints: analysisResult.interestPoints || analysis.interestPoints || [],
    needsSummary: analysisResult.needsSummary || analysis.needsSummary || '',
    objections: analysisResult.objections || analysis.objections || [],
    needKeywords: analysisResult.needKeywords ||
      (analysisResult.needsSummary || analysis.needsSummary || '').split(/[，、,;；]/).filter(k => k.trim()) ||
      []
  }

  console.log('=== aiInsights 计算结果 ===')
  console.log('painPoints:', result.painPoints)
  console.log('interestPoints:', result.interestPoints)
  console.log('needKeywords:', result.needKeywords)

  return result
})
const scriptLoading = ref<Record<string, boolean>>({
  '开场白': false,
  '价值主张': false,
  '异议处理': false
})
const aiFieldMappings = ref<any[]>([]) // AI字段映射配置

const editDialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  wechatNickname: '',
  phone: '',
  realName: '',
  trafficSource: '',
  customerIntent: '中意向',
  nextFollowTime: '',
  remark: '',
})

const formRules: FormRules = {}

const followDialogVisible = ref(false)
const followSubmitLoading = ref(false)
const followFormRef = ref<FormInstance>()

const followFormData = reactive({
  customerId: 0,
  followContent: '',
  nextFollowTime: '',
})

// 订单绑定相关状态
const bindOrderDialogVisible = ref(false)
const availableOrders = ref<Order[]>([])
const searchLoading = ref(false)
const bindOrderForm = reactive({
  orderNo: ''
})

const bindOrderError = ref('')
const orderStatus = ref({ type: '', message: '' })

const followFormRules: FormRules = {
  followContent: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
}

const stageDialogVisible = ref(false)
const stageSubmitLoading = ref(false)
const stageFormRef = ref<FormInstance>()
const showAllTagsDialog = ref(false)

const stageFormData = reactive({
  stage: '',
  changeReason: '',
})

const stageFormRules: FormRules = {
  stage: [{ required: true, message: '请选择新阶段', trigger: 'change' }],
}

// 计算属性：是否有洞察数据
const hasInsightsData = computed(() => {
  return (
    (aiInsights.value.painPoints && aiInsights.value.painPoints.length > 0) ||
    (aiInsights.value.interestPoints && aiInsights.value.interestPoints.length > 0) ||
    (aiInsights.value.needKeywords && aiInsights.value.needKeywords.length > 0)
  )
})

// 获取客户详情
const fetchCustomerInfo = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    customerInfo.value = await getCustomerDetail(customerId)

    // 记录到最近访问
    if (customerInfo.value) {
      recentStore.addRecentCustomer({
        id: customerInfo.value.id,
        wechatNickname: customerInfo.value.wechatNickname,
        phone: customerInfo.value.phone
      })
    }
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    ElMessage.error('获取客户信息失败')
  }
}

// 获取跟进记录
const fetchFollowRecords = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    followRecords.value = await getFollowRecords(customerId)
  } catch (error) {
    console.error('Failed to fetch follow records:', error)
  }
}

// 获取客户订单
const fetchCustomerOrders = async () => {
  console.log('🚀 fetchCustomerOrders 开始执行')
  const customerId = Number(route.params.id)
  console.log('🆔 客户ID:', customerId)
  if (!customerId) {
    console.log('❌ 客户ID为空，返回')
    return
  }

  try {
    const response = await getCustomerOrders(customerId)
    console.log('=== 完整API响应 ===')
    console.log('response:', response)
    console.log('response type:', typeof response)
    console.log('response.success:', response?.success)
    console.log('response.data:', response?.data)
    console.log('Array.isArray(response):', Array.isArray(response))
    console.log('Array.isArray(response.data):', Array.isArray(response?.data))

    // 处理响应拦截器处理后的数据结构：{success: true, data: [...], message: "..."}
    if (response && response.success && response.data) {
      // 标准的嵌套数据结构
      console.log('✓ 使用标准嵌套数据结构')
      customerOrders.value = response.data
    } else if (Array.isArray(response)) {
      // 如果返回的就是数组
      console.log('✓ 使用直接数组结构')
      customerOrders.value = response
    } else if (response && Array.isArray(response.data)) {
      // 兼容data就是数组的情况
      console.log('✓ 使用data数组结构')
      customerOrders.value = response.data
    } else {
      console.log('✗ 无法识别的数据结构，设置为空数组')
      customerOrders.value = []
    }

    console.log('=== 处理后的客户订单数据 ===')
    console.log('customerOrders.value:', customerOrders.value)
    console.log('customerOrders length:', customerOrders.value.length)
    if (customerOrders.value.length > 0) {
      console.log('第一个订单:', customerOrders.value[0])
    }
  } catch (error) {
    console.error('=== fetchCustomerOrders Error ===')
    console.error('Error:', error)
    customerOrders.value = []
  }
}

// 获取客户生命周期历史
const fetchLifecycleHistory = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    lifecycleHistory.value = await getLifecycleHistory(customerId)
  } catch (error) {
    console.error('Failed to fetch lifecycle history:', error)
  }
}

// 获取AI客户标签
const fetchAiTags = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    const res = await getCustomerTags(customerId)
    aiTags.value = res?.tags || []
  } catch (error) {
    console.error('Failed to fetch AI tags:', error)
  }
}

// 获取最新AI聊天分析
const fetchLatestAiAnalysis = async () => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  try {
    console.log('🤖 fetchLatestAiAnalysis 开始执行')
    console.log('🆔 客户ID:', customerId)

    const res = await getChatRecordList({
      customerId,
      page: 1,
      limit: 1,
    })

    console.log('=== AI分析API响应 ===')
    console.log('res:', res)
    console.log('res.list:', res?.list)
    console.log('res.list.length:', res?.list?.length)

    if (res?.list && res.list.length > 0) {
      console.log('✓ 找到AI分析数据')
      latestAiAnalysis.value = res.list[0]
      console.log('latestAiAnalysis.value:', latestAiAnalysis.value)
      console.log('=== AI分析数据结构详情 ===')
      console.log('latestAiAnalysis.value keys:', Object.keys(latestAiAnalysis.value || {}))

      // 检查可能的字段名
      const analysisData = latestAiAnalysis.value
      console.log('analysisData.painPoints:', analysisData?.painPoints)
      console.log('analysisData.interestPoints:', analysisData?.interestPoints)
      console.log('analysisData.needsSummary:', analysisData?.needsSummary)
      console.log('analysisData.aiAnalysisResult:', analysisData?.aiAnalysisResult)

      // 尝试解析aiAnalysisResult字段
      if (analysisData?.aiAnalysisResult) {
        try {
          const parsedResult = typeof analysisData.aiAnalysisResult === 'string'
            ? JSON.parse(analysisData.aiAnalysisResult)
            : analysisData.aiAnalysisResult
          console.log('=== 解析后的AI分析结果 ===')
          console.log('parsedResult:', parsedResult)
          console.log('parsedResult keys:', Object.keys(parsedResult || {}))
        } catch (e) {
          console.log('aiAnalysisResult解析失败:', e)
        }
      }
    } else {
      console.log('❌ 未找到AI分析数据')
      latestAiAnalysis.value = null
    }
  } catch (error) {
    console.error('=== fetchLatestAiAnalysis Error ===')
    console.error('Error:', error)
    latestAiAnalysis.value = null
  }
}

// 生成AI话术
const handleGenerateScript = async (scriptType: string) => {
  const customerId = Number(route.params.id)
  if (!customerId) return

  scriptLoading.value[scriptType] = true
  try {
    const res = await generateScript(customerId, scriptType)
    ElMessage.success('话术生成成功')
    // 在对话框中展示生成的话术
    ElMessageBox.alert(res.scriptContent, `${scriptType}话术`, {
      confirmButtonText: '复制',
      callback: async () => {
        try {
          // 尝试使用现代 clipboard API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(res.scriptContent)
          } else {
            // 降级方案：使用传统方法
            const textarea = document.createElement('textarea')
            textarea.value = res.scriptContent
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
          }
          ElMessage.success('已复制到剪贴板')
        } catch (err) {
          console.error('复制失败:', err)
          ElMessage.error('复制失败，请手动复制')
        }
      },
    })
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    scriptLoading.value[scriptType] = false
  }
}

// 跳转到AI聊天分析页面（带客户ID筛选）
const goToAiChatAnalysis = () => {
  const customerId = Number(route.params.id)
  router.push(`/ai/chat-analysis?customerId=${customerId}`)
}

// 返回
const handleBack = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  if (!customerInfo.value) return

  Object.assign(formData, {
    wechatNickname: customerInfo.value.wechatNickname,
    phone: customerInfo.value.phone,
    realName: customerInfo.value.realName,
    trafficSource: customerInfo.value.trafficSource,
    customerIntent: customerInfo.value.customerIntent,
    nextFollowTime: customerInfo.value.nextFollowTime,
    remark: customerInfo.value.remark,
  })
  editDialogVisible.value = true
}

// 更新客户
const handleUpdate = async () => {
  if (!formRef.value || !customerInfo.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await updateCustomer(customerInfo.value!.id, formData)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchCustomerInfo()
      } catch (error) {
        console.error('Failed to update customer:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 添加跟进
const handleAddFollow = () => {
  if (!customerInfo.value) return

  followFormData.customerId = customerInfo.value.id
  followFormData.followContent = ''
  followFormData.nextFollowTime = ''
  followDialogVisible.value = true
}

// 提交跟进记录
const handleSubmitFollow = async () => {
  if (!followFormRef.value) return

  await followFormRef.value.validate(async (valid) => {
    if (valid) {
      followSubmitLoading.value = true
      try {
        await createFollowRecord(followFormData)
        ElMessage.success('添加成功')
        followDialogVisible.value = false
        fetchFollowRecords()
        fetchCustomerInfo()
      } catch (error) {
        console.error('Failed to create follow record:', error)
      } finally {
        followSubmitLoading.value = false
      }
    }
  })
}

// 跟进对话框关闭
const handleFollowDialogClose = () => {
  followFormRef.value?.resetFields()
}

// 变更生命周期阶段
const handleChangeStage = () => {
  if (!customerInfo.value) return

  stageFormData.stage = ''
  stageFormData.changeReason = ''
  stageDialogVisible.value = true
}

// 提交生命周期阶段变更
const handleSubmitStage = async () => {
  if (!stageFormRef.value || !customerInfo.value) return

  await stageFormRef.value.validate(async (valid) => {
    if (valid) {
      stageSubmitLoading.value = true
      try {
        await createLifecycle({
          customerId: customerInfo.value!.id,
          stage: stageFormData.stage,
          changeReason: stageFormData.changeReason || `变更为${stageFormData.stage}`,
          operatorId: userStore.userInfo?.id || 0,
        })
        ElMessage.success('阶段变更成功')
        stageDialogVisible.value = false
        fetchCustomerInfo()
        fetchLifecycleHistory()
      } catch (error) {
        console.error('Failed to change stage:', error)
      } finally {
        stageSubmitLoading.value = false
      }
    }
  })
}

// 生命周期阶段对话框关闭
const handleStageDialogClose = () => {
  stageFormRef.value?.resetFields()
}

// 检查是否即将到期（24小时内或已逾期）
const isFollowDue = (dateStr: string) => {
  if (!dateStr) return false
  const followTime = dayjs(dateStr)
  const now = dayjs()
  const hoursDiff = followTime.diff(now, 'hour')
  // 24小时内或已逾期
  return hoursDiff <= 24
}

// 获取生命周期阶段标签类型
const getLifecycleTagType = (stage: string | undefined) => {
  const stageMap: Record<string, any> = {
    '线索': 'info',
    '意向客户': '',
    '商机': 'warning',
    '成交客户': 'success',
    '复购客户': 'success',
    '流失客户': 'danger',
  }
  return stageMap[stage || '线索'] || 'info'
}

// 获取生命周期时间轴类型
const getLifecycleTimelineType = (stage: string) => {
  const stageMap: Record<string, any> = {
    '线索': 'primary',
    '意向客户': 'primary',
    '商机': 'warning',
    '成交客户': 'success',
    '复购客户': 'success',
    '流失客户': 'danger',
  }
  return stageMap[stage] || 'primary'
}

// 获取标签类型
const getTagType = (category: string) => {
  const categoryMap: Record<string, any> = {
    '基础信息': '',
    '需求痛点': 'warning',
    '质量评估': 'success',
    '风险标签': 'danger',
    '情绪态度': 'info',
  }
  return categoryMap[category] || ''
}

// 获取质量等级类型
const getQualityType = (level: string) => {
  const types: Record<string, any> = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }
  return types[level] || 'info'
}

// 获取风险等级类型
const getRiskType = (level: string) => {
  const types: Record<string, any> = { 无风险: 'success', 低: 'info', 中: 'warning', 高: 'danger' }
  return types[level] || 'info'
}

// 加载AI字段映射配置
const loadFieldMappings = async () => {
  try {
    const data = await request.get('/business-config/ai_field_mapping')
    if (data && data.configValue) {
      // 只保留启用的字段
      aiFieldMappings.value = data.configValue.filter((field: any) => field.enabled)
    }
  } catch (error) {
    console.error('加载字段映射配置失败:', error)
  }
}

// 获取字段值
const getFieldValue = (fieldName: string) => {
  if (!customerInfo.value) return null
  return (customerInfo.value as any)[fieldName]
}

// 格式化字段显示
const formatFieldValue = (fieldName: string, value: any) => {
  if (!value) return '-'

  // 预估价值显示为金额
  if (fieldName === 'estimatedValue') {
    return `¥${value}`
  }

  // 质量等级显示带"级"后缀
  if (fieldName === 'qualityLevel') {
    return `${value}级`
  }

  // 学生年龄显示带"岁"后缀
  if (fieldName === 'studentAge') {
    return `${value}岁`
  }

  return value
}

// 获取字段标签类型（用于el-tag）
const getFieldTagType = (fieldName: string, value: any) => {
  if (fieldName === 'familyEconomicLevel') {
    return value === '高' ? 'success' : value === '中' ? 'warning' : 'info'
  }
  if (fieldName === 'qualityLevel') {
    return getQualityType(value)
  }
  if (fieldName === 'studentGrade') {
    return 'primary'
  }
  return ''
}

// 判断字段是否应该显示为tag
const shouldShowAsTag = (fieldName: string) => {
  return ['familyEconomicLevel', 'qualityLevel', 'studentGrade'].includes(fieldName)
}

// 订单绑定相关函数
const handleBindOrder = () => {
  bindOrderDialogVisible.value = true
  availableOrders.value = []
  bindOrderForm.orderId = null
}

const searchAvailableOrders = async (query: string) => {
  if (!query || !customerInfo.value) {
    availableOrders.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await getAvailableOrders(customerInfo.value.id, {
      keyword: query,
      page: 1,
      pageSize: 20
    })
    availableOrders.value = response.data || []
  } catch (error) {
    console.error('Failed to search orders:', error)
    ElMessage.error('搜索订单失败')
    availableOrders.value = []
  } finally {
    searchLoading.value = false
  }
}

// 订单号验证
const validateOrderNo = async () => {
  if (!bindOrderForm.orderNo?.trim()) {
    bindOrderError.value = '请输入订单号'
    return false
  }

  // 简单格式验证
  const orderNo = bindOrderForm.orderNo.trim()
  if (!/^\d{8,12}$/.test(orderNo)) {
    bindOrderError.value = '请输入正确的订单号格式（8-12位数字）'
    return false
  }

  bindOrderError.value = ''
  return true
}

// 清除绑定订单错误
const clearBindOrderError = () => {
  bindOrderError.value = ''
  orderStatus.value = { type: '', message: '' }
}

// 确认绑定订单
const confirmBindOrder = async () => {
  if (!await validateOrderNo()) {
    return
  }

  if (!customerInfo.value) {
    ElMessage.error('客户信息丢失，请重新操作')
    return
  }

  try {
    const response = await bindOrderByOrderNo(
      customerInfo.value.id,
      bindOrderForm.orderNo.trim()
    )

    if (response.success) {
      orderStatus.value = {
        type: response.type === 'temporary_order_created' ? 'warning' : 'success',
        message: response.message
      }

      ElMessage.success(response.message)

      // 刷新客户订单列表，增加延迟确保数据库事务完成
      setTimeout(async () => {
        await fetchCustomerOrders()
        // 同时刷新客户基本信息，可能涉及订单统计等
        await fetchCustomerInfo()
      }, 500)

      // 如果是临时订单创建，3秒后关闭对话框
      if (response.type === 'temporary_order_created') {
        setTimeout(() => {
          closeBindOrderDialog()
        }, 3000)
      } else {
        setTimeout(() => {
          closeBindOrderDialog()
        }, 1500)
      }
    } else {
      bindOrderError.value = response.message
    }
  } catch (error) {
    console.error('绑定订单失败:', error)
    bindOrderError.value = error.response?.data?.message || '绑定订单失败，请重试'
  }
}

// 查看订单详情
const handleViewOrder = (order: Order) => {
  router.push(`/order/detail/${order.id}`)
}

// 滚动到订单历史部分
const scrollToOrders = () => {
  const orderCard = document.querySelector('.order-card')
  if (orderCard) {
    orderCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // 添加高亮效果
    orderCard.classList.add('highlight')
    setTimeout(() => {
      orderCard.classList.remove('highlight')
    }, 2000)
  }
}

const handleUnbindOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要解绑此订单吗？', '解绑确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!customerInfo.value) {
      ElMessage.error('客户信息丢失，请重新操作')
      return
    }

    await unbindOrderFromCustomer(customerInfo.value.id, order.id)
    ElMessage.success('订单解绑成功')

    // 增加延迟确保数据更新完成
    setTimeout(async () => {
      await fetchCustomerOrders()
      await fetchCustomerInfo()
    }, 300)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to unbind order:', error)
      ElMessage.error('订单解绑失败')
    }
  }
}

const closeBindOrderDialog = () => {
  bindOrderDialogVisible.value = false
  bindOrderForm.orderNo = ''
  bindOrderError.value = ''
  orderStatus.value = { type: '', message: '' }
  availableOrders.value = []
}

// 表格行样式
const tableRowClassName = ({ row }: { row: Order }) => {
  if (row.paymentAmount > 10000) {
    return 'high-value-row'
  }
  if (row.orderStatus === '已完成') {
    return 'completed-row'
  }
  return ''
}

onMounted(async () => {
  // 并行加载所有数据，提升页面加载速度
  loading.value = true
  try {
    const results = await Promise.allSettled([
      fetchCustomerInfo(),
      fetchFollowRecords(),
      fetchCustomerOrders(),
      fetchLifecycleHistory(),
      fetchAiTags(),
      fetchLatestAiAnalysis(),
      loadFieldMappings()
    ])

    // 检查各个加载结果
    results.forEach((result, index) => {
      const taskNames = ['fetchCustomerInfo', 'fetchFollowRecords', 'fetchCustomerOrders', 'fetchLifecycleHistory', 'fetchAiTags', 'fetchLatestAiAnalysis', 'loadFieldMappings']
      if (result.status === 'rejected') {
        console.error(`${taskNames[index]} failed:`, result.reason)
      }
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.customer-detail-container {
  .back-card {
    margin-bottom: 16px;
  }

  .info-card {
    margin-bottom: 16px;
  }

  .follow-card {
    margin-bottom: 16px;
  }

  .order-card {
    margin-bottom: 16px;

    &.highlight {
      border: 2px solid #409eff;
      box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
      transition: all 0.3s ease;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-table-wrapper {
      .order-table {
        border-radius: 8px;
        overflow: hidden;

        .order-no-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Courier New', monospace;
          font-weight: 500;

          .order-icon {
            color: #409EFF;
            font-size: 16px;
          }
        }

        .course-name {
          display: flex;
          align-items: center;
          gap: 8px;

          .course-icon {
            color: #67C23A;
            font-size: 14px;
          }
        }

        .amount {
          font-weight: 600;
          color: #ff6b00;

          &.amount-high {
            color: #f56c6c;
            font-size: 15px;
          }
        }

        .payment-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #606266;
          font-size: 13px;

          .el-icon {
            color: #909399;
          }
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;

          .action-btn {
            transition: all 0.3s ease;

            &.view-btn:hover {
              transform: scale(1.1);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }

            &.unbind-btn:hover {
              transform: scale(1.1);
              box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
            }
          }
        }

        // 高价值订单行
        .high-value-row {
          background-color: #fff7e6;

          &:hover {
            background-color: #fff2d3 !important;
          }
        }

        // 已完成订单行
        .completed-row {
          background-color: #f0f9ff;

          &:hover {
            background-color: #e6f7ff !important;
          }
        }
      }
    }

    .empty-order-container {
      padding: 40px 20px;

      .empty-icon {
        color: #c0c4cc;
        margin-bottom: 16px;
      }

      .empty-description {
        p {
          margin: 8px 0;
          color: #606266;

          &.empty-tip {
            font-size: 13px;
            color: #909399;
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
      color: #303133;
    }
  }

  .text-secondary {
    color: #909399;
    font-size: 14px;
  }

  .follow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .operator {
      font-weight: 500;
      color: #303133;
    }

    .time {
      font-size: 12px;
      color: #909399;
    }
  }

  .follow-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    margin-bottom: 8px;
  }

  .next-follow {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #FFB800;
  }

  .amount {
    color: #ff6b00;
    font-weight: 500;
  }

  .follow-alert {
    margin-bottom: 16px;

    .alert-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;

      .alert-follow-btn {
        margin-left: 20px;
        font-weight: 500;
      }
    }
  }

  .add-follow-btn {
    font-weight: 500;
  }

  .ai-card {
    margin-bottom: 16px;

    .ai-section {
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 12px 0;
      }

      .tags-container {
        min-height: 80px;
      }

      .confidence {
        font-size: 12px;
        opacity: 0.7;
      }

      .analysis-container {
        min-height: 80px;
      }
    }

    .ai-actions {
      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 12px 0;
      }
    }
  }

  .insights-card {
    margin-bottom: 16px;

    .insight-section {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      min-height: 280px;

      .insight-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .insight-content {
        min-height: 160px;
        margin-bottom: 12px;
      }

      .insight-tip {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #909399;
        margin-top: 12px;
      }
    }

    .marketing-suggestions {
      margin-top: 16px;

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .suggestions-content {
        p {
          margin: 8px 0;
          line-height: 1.8;
          font-size: 14px;

          strong {
            color: #409eff;
            margin-right: 8px;
          }
        }
      }
    }
  }

  .order-status-message {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.4;

    &.success {
      background-color: #f0f9ff;
      border: 1px solid #67c23a;
      color: #67c23a;
    }

    &.warning {
      background-color: #fdf6ec;
      border: 1px solid #e6a23c;
      color: #e6a23c;
    }

    &.error {
      background-color: #fef0f0;
      border: 1px solid #f56c6c;
      color: #f56c6c;
    }

    &.info {
      background-color: #f4f4f5;
      border: 1px solid #909399;
      color: #909399;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>
