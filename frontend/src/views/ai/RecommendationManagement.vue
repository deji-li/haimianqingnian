<template>
  <div class="recommendation-management">
    <el-card class="header-card">
      <div class="header-content">
        <h2>话术推荐审核</h2>
        <p>管理和审核用户推荐的优质话术，通过后将自动添加到企业知识库</p>
      </div>
    </el-card>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="功能类型">
          <el-select v-model="queryParams.functionType" clearable placeholder="全部">
            <el-option label="帮你谈单" value="deal_assist" />
            <el-option label="帮你回复" value="reply_assist" />
            <el-option label="话术润色" value="script_polish" />
            <el-option label="开场白生成" value="opening_lines" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.status" clearable placeholder="全部">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecommendations">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon approved">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总计</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 推荐列表 -->
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="recommendations"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="功能类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getFunctionTypeColor(row.functionType)">
              {{ getFunctionTypeName(row.functionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="话术内容" min-width="300">
          <template #default="{ row }">
            <div class="script-content">{{ row.scriptContent }}</div>
          </template>
        </el-table-column>
        <el-table-column label="AI评分" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.aiQualityScore * 100"
              :color="getScoreColor(row.aiQualityScore)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="recommendReason" label="推荐原因" width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="推荐时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button
                link
                type="success"
                size="small"
                @click="handleApprove(row)"
              >
                <el-icon><Check /></el-icon>
                通过
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleReject(row)"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
            </template>
            <el-button
              link
              type="primary"
              size="small"
              @click="viewDetail(row)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecommendations"
          @current-change="loadRecommendations"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetail"
      title="推荐详情"
      width="800px"
    >
      <div v-if="currentRecommendation" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="推荐ID">
            {{ currentRecommendation.id }}
          </el-descriptions-item>
          <el-descriptions-item label="功能类型">
            <el-tag :type="getFunctionTypeColor(currentRecommendation.functionType)">
              {{ getFunctionTypeName(currentRecommendation.functionType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="AI质量评分">
            <el-progress
              :percentage="currentRecommendation.aiQualityScore * 100"
              :color="getScoreColor(currentRecommendation.aiQualityScore)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentRecommendation.status)">
              {{ getStatusText(currentRecommendation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="推荐时间" :span="2">
            {{ formatTime(currentRecommendation.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="推荐原因" :span="2">
            {{ currentRecommendation.recommendReason }}
          </el-descriptions-item>
          <el-descriptions-item label="话术内容" :span="2">
            <div class="detail-script-content">
              {{ currentRecommendation.scriptContent }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentRecommendation.status === 'pending'" class="detail-actions">
          <el-button
            type="success"
            @click="handleApprove(currentRecommendation)"
          >
            <el-icon><Check /></el-icon>
            通过审核
          </el-button>
          <el-button
            type="danger"
            @click="handleReject(currentRecommendation)"
          >
            <el-icon><Close /></el-icon>
            拒绝审核
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Clock,
  Check,
  Close,
  List,
  View,
} from '@element-plus/icons-vue'
import {
  getRecommendations,
  approveRecommendation,
  type QueryRecommendationsDto,
} from '@/api/ai-script-assistant'

// 查询参数
const queryParams = reactive<QueryRecommendationsDto>({
  functionType: undefined,
  status: undefined,
  page: 1,
  limit: 20,
})

// 数据
const recommendations = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const showDetail = ref(false)
const currentRecommendation = ref<any>(null)

// 统计信息
const stats = computed(() => {
  const pending = recommendations.value.filter(r => r.status === 'pending').length
  const approved = recommendations.value.filter(r => r.status === 'approved').length
  const rejected = recommendations.value.filter(r => r.status === 'rejected').length
  return {
    pending,
    approved,
    rejected,
    total: pending + approved + rejected,
  }
})

// 加载推荐列表
const loadRecommendations = async () => {
  loading.value = true
  try {
    const res: any = await getRecommendations(queryParams)
    recommendations.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载推荐列表失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选器
const resetFilters = () => {
  queryParams.functionType = undefined
  queryParams.status = undefined
  queryParams.page = 1
  loadRecommendations()
}

// 通过审核
const handleApprove = async (row: any) => {
  try {
    const { value: remark } = await ElMessageBox.prompt(
      '请输入审核备注（可选）',
      '通过审核',
      {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        inputPattern: /.*/,
        inputPlaceholder: '输入审核备注',
      }
    )

    await approveRecommendation(row.id, {
      approved: true,
      remark: remark || undefined,
    })

    ElMessage.success('审核通过！话术已添加到知识库')
    showDetail.value = false
    loadRecommendations()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error(error.response?.data?.message || '审核失败')
    }
  }
}

// 拒绝审核
const handleReject = async (row: any) => {
  try {
    const { value: remark } = await ElMessageBox.prompt(
      '请输入拒绝原因',
      '拒绝审核',
      {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入拒绝原因',
        inputPlaceholder: '输入拒绝原因',
      }
    )

    await approveRecommendation(row.id, {
      approved: false,
      remark: remark || '未通过审核',
    })

    ElMessage.success('已拒绝该推荐')
    showDetail.value = false
    loadRecommendations()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error(error.response?.data?.message || '审核失败')
    }
  }
}

// 查看详情
const viewDetail = (row: any) => {
  currentRecommendation.value = row
  showDetail.value = true
}

// 辅助函数
const getFunctionTypeName = (type: string) => {
  const names: Record<string, string> = {
    deal_assist: '帮你谈单',
    reply_assist: '帮你回复',
    script_polish: '话术润色',
    opening_lines: '开场白生成',
  }
  return names[type] || type
}

const getFunctionTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    deal_assist: 'primary',
    reply_assist: 'success',
    script_polish: 'warning',
    opening_lines: 'info',
  }
  return colors[type] || 'default'
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return types[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return texts[status] || status
}

const getScoreColor = (score: number) => {
  if (score >= 0.8) return '#67c23a'
  if (score >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadRecommendations()
})
</script>

<style scoped lang="scss">
.recommendation-management {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .header-content {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;

          &.pending {
            background: #fdf6ec;
            color: #e6a23c;
          }

          &.approved {
            background: #f0f9ff;
            color: #67c23a;
          }

          &.rejected {
            background: #fef0f0;
            color: #f56c6c;
          }

          &.total {
            background: #f4f4f5;
            color: #909399;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .list-card {
    .script-content {
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .detail-content {
    .detail-script-content {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .detail-actions {
      margin-top: 20px;
      text-align: right;
      padding-top: 20px;
      border-top: 1px solid #dcdfe6;
    }
  }
}
</style>
