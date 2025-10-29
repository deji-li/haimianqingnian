<template>
  <div class="okr-detail">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">OKR详情</span>
      </template>
    </el-page-header>

    <el-card shadow="never" v-loading="loading" style="margin-top: 16px">
      <!-- OKR基本信息 -->
      <div class="okr-header">
        <h2>{{ okr.title }}</h2>
        <div class="meta-info">
          <el-tag v-if="okr.type === 'individual'" type="info">个人</el-tag>
          <el-tag v-else-if="okr.type === 'team'" type="primary">团队</el-tag>
          <el-tag v-else type="warning">公司</el-tag>

          <el-tag v-if="okr.status === 'draft'" type="info" style="margin-left: 8px">草稿</el-tag>
          <el-tag v-else-if="okr.status === 'active'" type="primary" style="margin-left: 8px">进行中</el-tag>
          <el-tag v-else-if="okr.status === 'completed'" type="success" style="margin-left: 8px">已完成</el-tag>
          <el-tag v-else type="warning" style="margin-left: 8px">已取消</el-tag>

          <span class="owner">负责人: {{ okr.ownerName }}</span>
          <span class="date">{{ okr.startDate }} 至 {{ okr.endDate }}</span>
        </div>
        <p class="description" v-if="okr.description">{{ okr.description }}</p>

        <!-- 总体进度 -->
        <div class="progress-section">
          <div class="progress-label">
            <span>总体完成度</span>
            <span class="progress-value">{{ okr.progress }}%</span>
          </div>
          <el-progress :percentage="okr.progress" :color="getProgressColor(okr.progress)" :stroke-width="20" />
        </div>
      </div>

      <el-divider />

      <!-- 关键结果列表 -->
      <div class="key-results">
        <div class="section-header">
          <h3>关键结果（KR）</h3>
          <el-button type="primary" size="small" @click="handleAddKR">添加KR</el-button>
        </div>

        <div v-if="keyResults.length === 0" class="empty">
          <el-empty description="暂无关键结果" />
        </div>

        <div v-else class="kr-list">
          <el-card
            v-for="kr in keyResults"
            :key="kr.id"
            shadow="hover"
            class="kr-card"
          >
            <div class="kr-header">
              <div class="kr-title">
                <el-icon class="icon"><Flag /></el-icon>
                <span>{{ kr.description }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px">权重: {{ kr.weight }}</el-tag>
              </div>
              <div class="kr-actions">
                <el-button link type="primary" size="small" @click="handleEditKR(kr)">更新进度</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteKR(kr)">删除</el-button>
              </div>
            </div>

            <div class="kr-content">
              <div class="kr-values">
                <div class="value-item">
                  <span class="label">目标值:</span>
                  <span class="value">{{ kr.targetValue }} {{ kr.unit }}</span>
                </div>
                <div class="value-item">
                  <span class="label">当前值:</span>
                  <span class="value current">{{ kr.currentValue }} {{ kr.unit }}</span>
                </div>
                <div class="value-item">
                  <span class="label">完成度:</span>
                  <span class="value">{{ kr.progress.toFixed(1) }}%</span>
                </div>
              </div>

              <el-progress
                :percentage="kr.progress"
                :color="getProgressColor(kr.progress)"
                :stroke-width="10"
                style="margin-top: 12px"
              />
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 更新进度对话框 -->
    <el-dialog v-model="updateDialogVisible" title="更新关键结果" width="500px">
      <el-form :model="updateForm" label-width="100px">
        <el-form-item label="描述">
          <el-input v-model="updateForm.description" disabled />
        </el-form-item>
        <el-form-item label="目标值">
          <el-input-number
            v-model="updateForm.targetValue"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="当前值">
          <el-input-number
            v-model="updateForm.currentValue"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="updateForm.unit" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number
            v-model="updateForm.weight"
            :min="1"
            :max="10"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateKR">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加KR对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加关键结果" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="描述" required>
          <el-input v-model="addForm.description" placeholder="请输入关键结果描述" />
        </el-form-item>
        <el-form-item label="目标值" required>
          <el-input-number
            v-model="addForm.targetValue"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="addForm.unit" placeholder="如: 个、次、%等" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number
            v-model="addForm.weight"
            :min="1"
            :max="10"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveNewKR">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOkrDetail,
  updateKeyResult,
  addKeyResult,
  deleteKeyResult,
  type Okr,
  type KeyResult,
} from '@/api/okr'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const okrId = ref(Number(route.params.id))

const okr = ref<Okr>({
  id: 0,
  title: '',
  description: '',
  ownerId: 0,
  type: '',
  startDate: '',
  endDate: '',
  status: '',
  progress: 0,
  createTime: '',
  updateTime: '',
})

const keyResults = ref<KeyResult[]>([])

const updateDialogVisible = ref(false)
const updateForm = reactive({
  id: 0,
  description: '',
  targetValue: 0,
  currentValue: 0,
  unit: '',
  weight: 1,
})

const addDialogVisible = ref(false)
const addForm = reactive({
  description: '',
  targetValue: 0,
  unit: '',
  weight: 1,
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOkrDetail(okrId.value)
    okr.value = res
    keyResults.value = res.keyResults || []
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 编辑KR
const handleEditKR = (kr: KeyResult) => {
  updateForm.id = kr.id
  updateForm.description = kr.description
  updateForm.targetValue = kr.targetValue
  updateForm.currentValue = kr.currentValue
  updateForm.unit = kr.unit || ''
  updateForm.weight = kr.weight
  updateDialogVisible.value = true
}

// 更新KR
const handleUpdateKR = async () => {
  try {
    await updateKeyResult(updateForm.id, {
      targetValue: updateForm.targetValue,
      currentValue: updateForm.currentValue,
      unit: updateForm.unit,
      weight: updateForm.weight,
    })
    ElMessage.success('更新成功')
    updateDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 添加KR
const handleAddKR = () => {
  addForm.description = ''
  addForm.targetValue = 0
  addForm.unit = ''
  addForm.weight = 1
  addDialogVisible.value = true
}

// 保存新KR
const handleSaveNewKR = async () => {
  if (!addForm.description) {
    ElMessage.warning('请输入关键结果描述')
    return
  }
  if (addForm.targetValue <= 0) {
    ElMessage.warning('请输入目标值')
    return
  }

  try {
    await addKeyResult(okrId.value, {
      description: addForm.description,
      targetValue: addForm.targetValue,
      unit: addForm.unit,
      weight: addForm.weight,
    })
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

// 删除KR
const handleDeleteKR = async (kr: KeyResult) => {
  try {
    await ElMessageBox.confirm('确认删除该关键结果吗？', '提示', { type: 'warning' })
    await deleteKeyResult(kr.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    // 用户取消
  }
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67C23A'
  if (progress >= 50) return '#FFB800'
  return '#F56C6C'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.okr-detail {
  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .okr-header {
    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 12px;
    }

    .meta-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;

      .owner, .date {
        color: #909399;
      }
    }

    .description {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .progress-section {
      margin-top: 20px;

      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;

        .progress-value {
          font-size: 18px;
          font-weight: 600;
          color: #FFB800;
        }
      }
    }
  }

  .key-results {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: 18px;
        color: #303133;
        margin: 0;
      }
    }

    .kr-list {
      .kr-card {
        margin-bottom: 16px;

        .kr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .kr-title {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 500;
            color: #303133;

            .icon {
              margin-right: 8px;
              color: #FFB800;
            }
          }
        }

        .kr-content {
          .kr-values {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;

            .value-item {
              .label {
                font-size: 13px;
                color: #909399;
                margin-right: 4px;
              }

              .value {
                font-size: 14px;
                color: #303133;
                font-weight: 500;

                &.current {
                  color: #FFB800;
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
    }

    .empty {
      padding: 40px 0;
    }
  }
}
</style>
