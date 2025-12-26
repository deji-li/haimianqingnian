<template>
  <div class="followup-config-container">
    <!-- 顶部说明 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div>
          <h2>客户跟进配置</h2>
          <p class="subtitle">根据客户意向等级设置智能跟进节奏，确保系统自动提醒跟进客户</p>
        </div>
        <el-switch
          v-model="config.enabled"
          active-text="已启用"
          inactive-text="已禁用"
          :active-value="true"
          :inactive-value="false"
          size="large"
          @change="handleToggleEnabled"
        />
      </div>
    </el-card>

    <!-- 配置卡片 -->
    <el-card shadow="never" v-loading="loading">
      <el-alert
        v-if="!config.enabled"
        title="功能已禁用"
        type="warning"
        description="启用后将自动为客户创建跟进提醒"
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <!-- 意向等级选择 -->
      <el-tabs v-model="activeTab" type="card" :disabled="!config.enabled">
        <el-tab-pane
          v-for="level in intentionLevels"
          :key="level.value"
          :label="level.label"
          :name="level.value"
        >
          <div class="config-section" v-if="config.levels[level.value]">
            <div class="section-header">
              <h3>{{ level.label }}跟进节奏配置</h3>
              <p class="section-desc">
                <template v-if="level.value === '极高意向'">
                  极高意向客户，建议每日跟进，快速转化
                </template>
                <template v-else-if="level.value === '高意向'">
                  高意向客户，建议密集跟进，保持热度
                </template>
                <template v-else-if="level.value === '中意向'">
                  中意向客户，建议规律跟进，培养信任
                </template>
                <template v-else-if="level.value === '低意向'">
                  低意向客户，建议定期跟进，维持联系
                </template>
                <template v-else-if="level.value === '无意向'">
                  无意向客户，建议低频跟进，长期培育
                </template>
                <template v-else-if="level.value === '待评估'">
                  待评估客户，建议先评估意向再制定策略
                </template>
                <template v-else>
                  成交客户，建议定期回访，维护关系
                </template>
              </p>
            </div>

            <!-- 跟进轮次配置 -->
            <div class="rounds-config">
              <div class="round-item" v-for="(round, index) in config.levels[level.value].rounds" :key="index">
                <div class="round-header">
                  <el-tag :type="getRoundTagType(index)" size="large">第{{ index + 1 }}轮</el-tag>
                  <el-text type="info" size="small">
                    <el-icon><Clock /></el-icon>
                    {{ round.intervalDays }}天后跟进
                  </el-text>
                </div>
                <el-form :model="round" label-width="100px" class="round-form">
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="间隔天数">
                        <el-input-number
                          v-model="round.intervalDays"
                          :min="1"
                          :max="365"
                          :disabled="!config.enabled"
                          controls-position="right"
                        />
                        <span style="margin-left: 8px; color: #909399;">天</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="16">
                      <el-form-item label="提醒内容">
                        <el-input
                          v-model="round.message"
                          placeholder="自定义提醒内容（可选）"
                          :disabled="!config.enabled"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>

              <!-- 添加更多轮次 -->
              <div class="add-round-section">
                <el-button
                  v-if="config.levels[level.value].rounds.length < 10"
                  @click="addRound(level.value)"
                  :disabled="!config.enabled"
                  style="width: 100%;"
                >
                  <el-icon><Plus /></el-icon>
                  添加第{{ config.levels[level.value].rounds.length + 1 }}轮跟进
                </el-button>
                <el-text v-else type="warning" style="width: 100%; text-align: center; display: block;">
                  最多支持10轮跟进配置
                </el-text>
              </div>
            </div>

            <!-- 提醒方式 -->
            <div class="reminder-methods">
              <h4>提醒方式</h4>
              <el-checkbox-group v-model="config.levels[level.value].reminderMethods" :disabled="!config.enabled">
                <el-checkbox label="system" border>系统通知</el-checkbox>
                <el-checkbox label="homepage" border>工作台卡片</el-checkbox>
                <el-checkbox label="email" border>邮件通知</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave" :loading="saving" :disabled="!config.enabled" size="large">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
        <el-button @click="handleReset" :disabled="!config.enabled" size="large">
          <el-icon><RefreshLeft /></el-icon>
          重置为默认值
        </el-button>
        <el-button @click="handlePreview" size="large">
          <el-icon><View /></el-icon>
          预览效果
        </el-button>
      </div>
    </el-card>

    <!-- 使用说明 -->
    <el-card shadow="never" style="margin-top: 16px;">
      <template #header>
        <span>📖 使用说明</span>
      </template>
      <el-alert
        title="优先级规则"
        type="success"
        :closable="false"
        style="margin-bottom: 16px;"
      >
        <template #default>
          <div style="line-height: 1.8;">
            <strong style="color: #67C23A;">销售手动设置 > 系统自动配置</strong><br>
            如果销售在客户详情中设置了"下次回访时间"，则以该时间为准，完成该次跟进后才开始进入循环提醒节奏
          </div>
        </template>
      </el-alert>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="销售手动设置优先">
          <strong>最高优先级</strong>：如果销售在客户列表/详情中手动设置了"下次回访时间"<br>
          → 以该时间为第1次跟进时间<br>
          → 完成该次跟进后，进入系统循环提醒<br>
          → 从第2轮开始按配置的间隔天数递推（如第2轮=上次跟进+3天，第3轮=再+5天...）
        </el-descriptions-item>
        <el-descriptions-item label="系统自动提醒">
          <strong>次优先级</strong>：如果销售没有手动设置"下次回访时间"<br>
          → 系统从"最后跟进时间"开始计算<br>
          → 按配置的第1轮间隔天数提醒<br>
          → 之后按第2轮、第3轮...的节奏循环提醒
        </el-descriptions-item>
        <el-descriptions-item label="循环跟进节奏">
          系统会根据当前意向等级的配置，自动在第1轮、第2轮...第N轮时提醒跟进
        </el-descriptions-item>
        <el-descriptions-item label="系统通知">
          在右上角铃铛图标中显示跟进提醒通知
        </el-descriptions-item>
        <el-descriptions-item label="工作台卡片">
          在工作台首页显示待跟进客户列表
        </el-descriptions-item>
        <el-descriptions-item label="邮件通知">
          发送提醒邮件到销售人员邮箱（需配置邮件服务）
        </el-descriptions-item>
        <el-descriptions-item label="客户意向等级">
          根据客户列表中的"客户意向"字段自动判断并应用对应配置
        </el-descriptions-item>
      </el-descriptions>

      <!-- 示例说明 -->
      <el-divider content-position="left">示例说明</el-divider>
      <div style="background: #f5f7fa; padding: 16px; border-radius: 8px;">
        <h4 style="margin-top: 0;">场景举例</h4>
        <el-steps direction="vertical" :space="100">
          <el-step>
            <template #title>
              <strong>情况1：销售手动设置了回访时间</strong>
            </template>
            <template #description>
              <div style="margin-top: 8px;">
                客户A，高意向，销售设置了"下次回访时间"为2025-01-05<br>
              <el-text type="success" size="small">
                ✓ 2025-01-05提醒：按销售设置的时间跟进（第1次）<br>
                ✓ 跟进完成后，+2天提醒（第2次，2025-01-07）<br>
                ✓ 再+3天提醒（第3次，2025-01-10）<br>
                ✓ 按配置节奏继续...
              </el-text>
              </div>
            </template>
          </el-step>
          <el-step>
            <template #title>
              <strong>情况2：销售未设置回访时间</strong>
            </template>
            <template #description>
              <div style="margin-top: 8px;">
                客户B，高意向，最后跟进时间是2025-01-01，未设置下次回访时间<br>
              <el-text type="primary" size="small">
                ✓ 系统按高意向默认配置：+2天提醒（第1次，2025-01-03）<br>
                ✓ 完成后，+3天提醒（第2次，2025-01-06）<br>
                ✓ 再+5天提醒（第3次，2025-01-11）<br>
                ✓ 按配置节奏继续...
              </el-text>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="跟进效果预览" width="800px">
      <div class="preview-content">
        <el-timeline>
          <el-timeline-item
            v-for="(round, index) in config.levels[activeTab]?.rounds || []"
            :key="index"
            :timestamp="`第${index + 1}轮跟进`"
            placement="top"
          >
            <el-card>
              <h4>第{{ index + 1 }}轮 - {{ round.intervalDays }}天后</h4>
              <p>{{ round.message || '使用默认提醒内容' }}</p>
              <el-text type="info" size="small">
                提醒时间：客户上次跟进时间 + {{ round.intervalDays }}天
              </el-text>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, RefreshLeft, View, Clock, Plus } from '@element-plus/icons-vue'
import { getFollowUpConfig, updateFollowUpConfig } from '@/api/follow-up'

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('极高意向')
const previewVisible = ref(false)

// 客户意向等级列表（从数据库获取）
const intentionLevels = [
  { label: '极高意向', value: '极高意向' },
  { label: '高意向', value: '高意向' },
  { label: '中意向', value: '中意向' },
  { label: '低意向', value: '低意向' },
  { label: '无意向', value: '无意向' },
  { label: '待评估', value: '待评估' },
  { label: '成交', value: '成交' }
]

// 默认跟进轮次配置
const getDefaultRounds = (level: string) => {
  const defaults: Record<string, number[]> = {
    '极高意向': [1, 2, 3, 5, 7],
    '高意向': [2, 3, 5, 7, 10],
    '中意向': [3, 5, 7, 10, 15],
    '低意向': [5, 7, 10, 15, 20],
    '无意向': [7, 10, 15, 20, 30],
    '待评估': [1, 3, 5, 7, 10],
    '成交': [15, 30, 60, 90, 180]
  }

  const intervals = defaults[level] || [3, 5, 7, 10, 15]

  return intervals.map(days => ({
    intervalDays: days,
    message: ''
  }))
}

// 配置数据
const config = reactive({
  enabled: false,
  levels: {} as Record<string, {
    rounds: Array<{ intervalDays: number; message: string }>
    reminderMethods: string[]
  }>
})

// 初始化所有等级的配置
const initLevels = () => {
  intentionLevels.forEach(level => {
    config.levels[level.value] = {
      rounds: getDefaultRounds(level.value),
      reminderMethods: ['system', 'homepage']
    }
  })
}

// 获取轮次标签类型
const getRoundTagType = (index: number) => {
  const types = ['danger', 'warning', 'primary', 'success', 'info']
  return types[index % types.length]
}

// 添加轮次
const addRound = (level: string) => {
  const lastRound = config.levels[level].rounds[config.levels[level].rounds.length - 1]
  config.levels[level].rounds.push({
    intervalDays: (lastRound?.intervalDays || 1) + 3,
    message: ''
  })
}

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    // 先初始化默认配置
    initLevels()

    // 从后端API加载配置
    const res = await getFollowUpConfig()
    if (res && res.data) {
      config.enabled = res.data.enabled
      // 合并保存的配置，确保所有等级都存在
      if (res.data.config) {
        Object.keys(res.data.config).forEach(key => {
          if (config.levels[key]) {
            config.levels[key] = res.data.config[key]
          }
        })
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
    initLevels()
  } finally {
    loading.value = false
  }
}

// 切换启用状态
const handleToggleEnabled = async () => {
  try {
    await updateFollowUpConfig({ enabled: config.enabled })
    ElMessage.success(config.enabled ? '已启用客户跟进提醒' : '已禁用客户跟进提醒')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
    // 回滚状态
    config.enabled = !config.enabled
  }
}

// 保存配置
const handleSave = async () => {
  saving.value = true
  try {
    await updateFollowUpConfig({
      enabled: config.enabled,
      config: config.levels
    })
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置为默认值
const handleReset = () => {
  initLevels()
  ElMessage.info('已重置为默认配置')
}

// 预览效果
const handlePreview = () => {
  previewVisible.value = true
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.followup-config-container {
  .header-card {
    margin-bottom: 16px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }

  .config-section {
    padding: 20px 0;

    .section-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        font-size: 18px;
        color: #303133;
        margin-bottom: 8px;
      }

      .section-desc {
        font-size: 14px;
        color: #606266;
        margin: 0;
      }
    }

    .rounds-config {
      margin-bottom: 24px;

      .round-item {
        margin-bottom: 16px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: #ecf5ff;
        }

        .round-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .round-form {
          margin-top: 12px;
        }
      }

      .add-round-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed #dcdfe6;
      }
    }

    .reminder-methods {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      h4 {
        font-size: 14px;
        color: #303133;
        margin-bottom: 12px;
      }

      :deep(.el-checkbox) {
        margin-right: 12px;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid #ebeef5;
    margin-top: 24px;
  }

  .preview-content {
    :deep(.el-timeline-item__timestamp) {
      font-weight: 600;
      color: #409EFF;
    }

    .el-card {
      h4 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 4px 0;
        color: #606266;
      }
    }
  }
}
</style>
