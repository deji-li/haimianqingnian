<template>
  <div class="lifecycle-board">
    <div class="board-header">
      <h2>客户生命周期看板</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh" :icon="RefreshIcon">
          刷新数据
        </el-button>
      </div>
    </div>

    <el-card class="statistics-card" shadow="never">
      <div class="statistics-grid">
        <div
          v-for="stat in statistics"
          :key="stat.stage"
          class="stat-item"
          :class="`stat-${getStageClass(stat.stage)}`"
        >
          <div class="stat-label">{{ stat.stage }}</div>
          <div class="stat-value">{{ stat.count }}</div>
          <div class="stat-percentage">{{ stat.percentage.toFixed(1) }}%</div>
        </div>
      </div>
    </el-card>

    <div class="board-container">
      <div
        v-for="stage in stages"
        :key="stage"
        class="board-column"
        @drop="handleDrop($event, stage)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="column-header" :class="`header-${getStageClass(stage)}`">
          <span class="stage-name">{{ stage }}</span>
          <el-badge
            :value="getStageCount(stage)"
            :type="getStageType(stage)"
            class="stage-badge"
          />
        </div>

        <div class="column-content">
          <div
            v-for="customer in getCustomersForStage(stage)"
            :key="customer.id"
            class="customer-card"
            draggable="true"
            @dragstart="handleDragStart($event, customer)"
            @click="handleViewDetail(customer.id)"
          >
            <div class="card-header">
              <div class="customer-name">
                {{ customer.realName || customer.wechatNickname }}
              </div>
              <el-tag size="small" :type="getIntentType(customer.customerIntent)">
                {{ customer.customerIntent || '未知' }}
              </el-tag>
            </div>

            <div class="card-body">
              <div v-if="customer.phone" class="info-item">
                <el-icon><Phone /></el-icon>
                <span>{{ customer.phone }}</span>
              </div>
              <div v-if="customer.wechatId" class="info-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ customer.wechatId }}</span>
              </div>
              <div v-if="customer.salesName" class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ customer.salesName }}</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="create-time">
                {{ formatDate(customer.createTime) }}
              </span>
            </div>
          </div>

          <div v-if="getCustomersForStage(stage).length === 0" class="empty-column">
            <el-empty description="暂无客户" :image-size="60" />
          </div>
        </div>
      </div>
    </div>

    <!-- 变更确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认变更生命周期阶段"
      width="500px"
    >
      <div class="confirm-content">
        <p>
          确定要将客户
          <strong>{{ draggedCustomer?.realName || draggedCustomer?.wechatNickname }}</strong>
          从 <el-tag size="small">{{ draggedCustomer?.lifecycleStage }}</el-tag> 变更为
          <el-tag size="small" type="warning">{{ targetStage }}</el-tag> 吗？
        </p>
        <el-form :model="changeForm" label-width="100px" style="margin-top: 20px">
          <el-form-item label="变更原因">
            <el-input
              v-model="changeForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入变更原因（可选）"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="changeLoading"
          @click="handleConfirmChange"
        >
          确认变更
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, ChatDotRound, User, Refresh } from '@element-plus/icons-vue'
import {
  getLifecycleStatistics,
  getCustomersByStage,
  createLifecycle,
  type LifecycleStatistics,
} from '@/api/lifecycle'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const RefreshIcon = Refresh
const router = useRouter()
const userStore = useUserStore()

// 生命周期阶段列表
const stages = ref(['线索', '意向客户', '商机', '成交客户', '复购客户', '流失客户'])

// 统计数据
const statistics = ref<LifecycleStatistics[]>([])

// 客户数据（按阶段分组）
const customersByStage = ref<Record<string, any[]>>({})

// 拖拽相关
const draggedCustomer = ref<any>(null)
const targetStage = ref('')
const confirmDialogVisible = ref(false)
const changeLoading = ref(false)
const changeForm = ref({
  reason: '',
})

// 获取统计数据
const fetchStatistics = async () => {
  try {
    statistics.value = await getLifecycleStatistics()
  } catch (error) {
    console.error('Failed to fetch lifecycle statistics:', error)
  }
}

// 获取所有阶段的客户数据
const fetchAllCustomers = async () => {
  try {
    const promises = stages.value.map(async (stage) => {
      const customers = await getCustomersByStage(stage)
      return { stage, customers }
    })

    const results = await Promise.all(promises)
    const grouped: Record<string, any[]> = {}

    results.forEach(({ stage, customers }) => {
      grouped[stage] = customers
    })

    customersByStage.value = grouped
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    ElMessage.error('获取客户数据失败')
  }
}

// 刷新数据
const handleRefresh = async () => {
  await Promise.all([fetchStatistics(), fetchAllCustomers()])
  ElMessage.success('数据已刷新')
}

// 获取指定阶段的客户列表（本地数据）
const getCustomersForStage = computed(() => {
  return (stage: string) => {
    return customersByStage.value[stage] || []
  }
})

// 获取指定阶段的客户数量
const getStageCount = (stage: string) => {
  const stat = statistics.value.find((s) => s.stage === stage)
  return stat ? stat.count : 0
}

// 拖拽开始
const handleDragStart = (event: DragEvent, customer: any) => {
  draggedCustomer.value = customer
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', customer.id.toString())
  }
}

// 放置
const handleDrop = (event: DragEvent, stage: string) => {
  event.preventDefault()

  if (!draggedCustomer.value) return

  // 如果阶段相同，不做处理
  if (draggedCustomer.value.lifecycleStage === stage) {
    draggedCustomer.value = null
    return
  }

  targetStage.value = stage
  confirmDialogVisible.value = true
}

// 确认变更
const handleConfirmChange = async () => {
  if (!draggedCustomer.value) return

  changeLoading.value = true
  try {
    await createLifecycle({
      customerId: draggedCustomer.value.id,
      stage: targetStage.value,
      changeReason:
        changeForm.value.reason ||
        `从${draggedCustomer.value.lifecycleStage}变更为${targetStage.value}`,
      operatorId: userStore.userInfo?.id || 0,
    })

    ElMessage.success('生命周期阶段变更成功')
    confirmDialogVisible.value = false
    changeForm.value.reason = ''

    // 刷新数据
    await Promise.all([fetchStatistics(), fetchAllCustomers()])
  } catch (error) {
    console.error('Failed to change lifecycle stage:', error)
    ElMessage.error('阶段变更失败')
  } finally {
    changeLoading.value = false
    draggedCustomer.value = null
  }
}

// 查看客户详情
const handleViewDetail = (customerId: number) => {
  router.push({ name: 'CustomerDetail', params: { id: customerId } })
}

// 辅助函数：获取阶段样式类
const getStageClass = (stage: string) => {
  const stageMap: Record<string, string> = {
    线索: 'lead',
    意向客户: 'intent',
    商机: 'opportunity',
    成交客户: 'deal',
    复购客户: 'repurchase',
    流失客户: 'lost',
  }
  return stageMap[stage] || 'default'
}

// 辅助函数：获取阶段标签类型
const getStageType = (stage: string): any => {
  const stageMap: Record<string, string> = {
    线索: 'info',
    意向客户: 'primary',
    商机: 'warning',
    成交客户: 'success',
    复购客户: 'success',
    流失客户: 'danger',
  }
  return stageMap[stage] || 'info'
}

// 辅助函数：获取意向标签类型
const getIntentType = (intent: string): any => {
  const intentMap: Record<string, string> = {
    高: 'danger',
    中: 'warning',
    低: 'info',
  }
  return intentMap[intent] || 'info'
}

// 辅助函数：格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  fetchStatistics()
  fetchAllCustomers()
})
</script>

<style scoped lang="scss">
.lifecycle-board {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #303133;
    }
  }

  .statistics-card {
    margin-bottom: 20px;

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;

      .stat-item {
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-percentage {
          font-size: 12px;
          color: #909399;
        }

        &.stat-lead {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          .stat-value {
            color: #2196f3;
          }
        }

        &.stat-intent {
          background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
          .stat-value {
            color: #3f51b5;
          }
        }

        &.stat-opportunity {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          .stat-value {
            color: #ff9800;
          }
        }

        &.stat-deal {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          .stat-value {
            color: #4caf50;
          }
        }

        &.stat-repurchase {
          background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
          .stat-value {
            color: #009688;
          }
        }

        &.stat-lost {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          .stat-value {
            color: #f44336;
          }
        }
      }
    }
  }

  .board-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 15px;
    overflow-y: auto;

    .board-column {
      display: flex;
      flex-direction: column;
      background: #f5f7fa;
      border-radius: 8px;
      min-height: 0;

      .column-header {
        padding: 15px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        font-weight: bold;

        &.header-lead {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        }

        &.header-intent {
          background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%);
        }

        &.header-opportunity {
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        }

        &.header-deal {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
        }

        &.header-repurchase {
          background: linear-gradient(135deg, #009688 0%, #00796b 100%);
        }

        &.header-lost {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        .stage-name {
          font-size: 16px;
        }

        .stage-badge {
          :deep(.el-badge__content) {
            background-color: rgba(255, 255, 255, 0.9);
            color: #303133;
            font-weight: bold;
          }
        }
      }

      .column-content {
        flex: 1;
        padding: 10px;
        overflow-y: auto;

        .customer-card {
          background: white;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          cursor: move;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .customer-name {
              font-weight: bold;
              font-size: 14px;
              color: #303133;
            }
          }

          .card-body {
            .info-item {
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 12px;
              color: #606266;
              margin-bottom: 5px;

              .el-icon {
                font-size: 14px;
                color: #909399;
              }
            }
          }

          .card-footer {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ebeef5;

            .create-time {
              font-size: 11px;
              color: #909399;
            }
          }
        }

        .empty-column {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
      }
    }
  }

  .confirm-content {
    p {
      line-height: 1.8;
      color: #606266;
    }

    strong {
      color: #303133;
    }
  }
}
</style>
