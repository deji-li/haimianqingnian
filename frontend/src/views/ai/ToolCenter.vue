<template>
  <div class="ai-tool-center">
    <el-card class="header-card">
      <h2>AI工具中心</h2>
      <p class="subtitle">AI赋能销售，让工作更高效</p>
    </el-card>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- AI话术助手 -->
      <el-tab-pane label="AI话术助手" name="script">
        <div class="tool-section">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-card>
                <h3>生成个性化话术</h3>
                <el-form :model="scriptForm" label-width="100px">
                  <el-form-item label="客户ID">
                    <el-input v-model="scriptForm.customerId" placeholder="输入客户ID" />
                  </el-form-item>
                  <el-form-item label="话术类型">
                    <el-select v-model="scriptForm.scriptType" placeholder="选择类型">
                      <el-option label="开场白" value="开场白" />
                      <el-option label="需求挖掘" value="需求挖掘" />
                      <el-option label="应对异议" value="应对异议" />
                      <el-option label="促成成交" value="促成" />
                      <el-option label="售后跟进" value="售后" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="generateScript" :loading="generating">
                      <el-icon><MagicStick /></el-icon>
                      AI生成话术
                    </el-button>
                  </el-form-item>
                </el-form>

                <div v-if="generatedScript" class="generated-script">
                  <h4>生成的话术：</h4>
                  <el-input
                    v-model="generatedScript.scriptContent"
                    type="textarea"
                    :rows="6"
                    readonly
                  />
                  <el-button type="success" @click="copyScript" style="margin-top: 10px">
                    <el-icon><DocumentCopy /></el-icon>
                    复制话术
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :span="16">
              <el-card>
                <h3>话术库</h3>
                <el-select v-model="scriptListType" @change="loadScripts" style="margin-bottom: 10px">
                  <el-option label="开场白" value="开场白" />
                  <el-option label="需求挖掘" value="需求挖掘" />
                  <el-option label="应对异议" value="应对异议" />
                  <el-option label="促成成交" value="促成" />
                </el-select>

                <el-table :data="scriptList" max-height="500">
                  <el-table-column prop="scriptTitle" label="标题" />
                  <el-table-column prop="scriptContent" label="内容" show-overflow-tooltip />
                  <el-table-column prop="usageCount" label="使用次数" width="100" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="useScript(row)">使用</el-button>
                      <el-button link type="success" @click="markScriptSuccess(row)">有效</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- AI风险预警 -->
      <el-tab-pane label="AI风险预警" name="risk">
        <div class="tool-section">
          <el-alert
            v-if="riskAlerts.length > 0"
            :title="`您有 ${riskAlerts.length} 个待处理的风险预警`"
            type="warning"
            show-icon
          />

          <el-table :data="riskAlerts" style="margin-top: 20px">
            <el-table-column prop="customerId" label="客户ID" width="100" />
            <el-table-column prop="riskType" label="风险类型" width="120" />
            <el-table-column label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag :type="row.riskLevel === '高' ? 'danger' : 'warning'">
                  {{ row.riskLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="riskReason" label="风险原因" show-overflow-tooltip />
            <el-table-column label="建议行动" width="200">
              <template #default="{ row }">
                <div v-if="row.recommendedActions">
                  <div v-for="(action, index) in row.recommendedActions.slice(0, 2)" :key="index">
                    {{ index + 1 }}. {{ action }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="预警时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleRisk(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- AI客户复苏 -->
      <el-tab-pane label="AI客户复苏" name="recovery">
        <div class="tool-section">
          <el-form :inline="true">
            <el-form-item label="沉睡天数">
              <el-input-number v-model="sleepDays" :min="7" :max="180" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadSleepingCustomers" :loading="loadingSleep">
                <el-icon><Search /></el-icon>
                识别沉睡客户
              </el-button>
            </el-form-item>
          </el-form>

          <el-alert
            v-if="sleepingCustomers.length > 0"
            :title="`发现 ${sleepingCustomers.length} 个沉睡客户，建议及时跟进`"
            type="info"
            show-icon
            style="margin-top: 10px"
          />

          <el-table :data="sleepingCustomers" style="margin-top: 20px">
            <el-table-column label="客户信息" width="200">
              <template #default="{ row }">
                <div>{{ row.customer.wechatNickname }}</div>
                <div style="font-size: 12px; color: #909399">{{ row.customer.wechatId }}</div>
              </template>
            </el-table-column>
            <el-table-column label="意向等级" width="100">
              <template #default="{ row }">
                <el-tag>{{ row.customer.customerIntent }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="沉睡天数" width="100">
              <template #default="{ row }">
                {{ row.sleepDays }}天
              </template>
            </el-table-column>
            <el-table-column label="AI复苏话术" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.recoveryScript }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="copyRecoveryScript(row)">
                  复制话术
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- AI培训陪练 -->
      <el-tab-pane label="AI培训陪练" name="training">
        <div class="tool-section">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-card v-if="!trainingSession">
                <h3>开始AI陪练</h3>
                <el-form :model="trainingForm" label-width="100px">
                  <el-form-item label="选择场景">
                    <el-select v-model="trainingForm.scenario" placeholder="选择训练场景">
                      <el-option label="首次接触客户" value="首次接触" />
                      <el-option label="需求挖掘" value="需求挖掘" />
                      <el-option label="价格谈判" value="价格谈判" />
                      <el-option label="处理异议" value="处理异议" />
                      <el-option label="促成签单" value="促成签单" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="startTraining">
                      <el-icon><VideoPlay /></el-icon>
                      开始陪练
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card v-else>
                <div class="training-info">
                  <h3>训练场景：{{ trainingForm.scenario }}</h3>
                  <p>轮次：{{ trainingRounds }}</p>
                  <el-button type="danger" @click="stopTraining">结束训练</el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :span="16">
              <el-card class="chat-box">
                <div class="messages" ref="messagesContainer">
                  <div
                    v-for="(msg, index) in trainingMessages"
                    :key="index"
                    :class="['message', msg.role === 'user' ? 'user' : 'ai']"
                  >
                    <div class="message-label">{{ msg.role === 'user' ? '你' : 'AI客户' }}</div>
                    <div class="message-content">{{ msg.message }}</div>
                  </div>
                </div>

                <div class="input-area" v-if="trainingSession">
                  <el-input
                    v-model="userMessage"
                    placeholder="输入你的回复..."
                    @keyup.enter="sendMessage"
                  />
                  <el-button type="primary" @click="sendMessage" :loading="sending">
                    发送
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 处理风险对话框 -->
    <el-dialog v-model="showHandleRiskDialog" title="处理风险预警" width="500px">
      <el-form :model="handleRiskForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-input
            v-model="handleRiskForm.handleResult"
            type="textarea"
            :rows="4"
            placeholder="请输入处理结果..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHandleRiskDialog = false">取消</el-button>
        <el-button type="primary" @click="submitHandleRisk">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, DocumentCopy, Search, VideoPlay } from '@element-plus/icons-vue'
import {
  generateScript,
  getScriptList,
  recordScriptUsage,
  getPendingRiskAlerts,
  handleRiskAlert,
  getSleepingCustomers,
  startTraining as startTrainingApi,
  trainConversation,
  endTraining
} from '@/api/ai'

const activeTab = ref('script')
const generating = ref(false)
const loadingSleep = ref(false)
const sending = ref(false)

// 话术助手
const scriptForm = reactive({ customerId: '', scriptType: '' })
const generatedScript = ref(null)
const scriptListType = ref('开场白')
const scriptList = ref([])

// 风险预警
const riskAlerts = ref([])
const showHandleRiskDialog = ref(false)
const currentRisk = ref(null)
const handleRiskForm = reactive({ handleResult: '' })

// 客户复苏
const sleepDays = ref(30)
const sleepingCustomers = ref([])

// AI陪练
const trainingForm = reactive({ scenario: '' })
const trainingSession = ref(null)
const trainingMessages = ref([])
const trainingRounds = ref(0)
const userMessage = ref('')
const messagesContainer = ref()

const generateScriptHandler = async () => {
  if (!scriptForm.customerId || !scriptForm.scriptType) {
    ElMessage.warning('请填写完整信息')
    return
  }

  generating.value = true
  try {
    const res = await generateScript(Number(scriptForm.customerId), scriptForm.scriptType)
    generatedScript.value = res.data
    ElMessage.success('话术生成成功')
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    generating.value = false
  }
}

const loadScripts = async () => {
  try {
    const res = await getScriptList(scriptListType.value)
    scriptList.value = res.data
  } catch (error) {
    ElMessage.error('加载话术库失败')
  }
}

const copyScript = () => {
  if (generatedScript.value) {
    navigator.clipboard.writeText(generatedScript.value.scriptContent)
    ElMessage.success('话术已复制到剪贴板')
  }
}

const useScript = (script: any) => {
  navigator.clipboard.writeText(script.scriptContent)
  recordScriptUsage(script.id, false)
  ElMessage.success('话术已复制到剪贴板')
}

const markScriptSuccess = async (script: any) => {
  await recordScriptUsage(script.id, true)
  ElMessage.success('已标记为有效')
  loadScripts()
}

const loadRiskAlerts = async () => {
  try {
    const res = await getPendingRiskAlerts()
    riskAlerts.value = res.data
  } catch (error) {
    console.error('加载风险预警失败', error)
  }
}

const handleRisk = (risk: any) => {
  currentRisk.value = risk
  showHandleRiskDialog.value = true
}

const submitHandleRisk = async () => {
  if (!handleRiskForm.handleResult) {
    ElMessage.warning('请输入处理结果')
    return
  }

  try {
    await handleRiskAlert(currentRisk.value.id, handleRiskForm.handleResult)
    ElMessage.success('处理成功')
    showHandleRiskDialog.value = false
    handleRiskForm.handleResult = ''
    loadRiskAlerts()
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

const loadSleepingCustomers = async () => {
  loadingSleep.value = true
  try {
    const res = await getSleepingCustomers(sleepDays.value)
    sleepingCustomers.value = res.data.customers
    ElMessage.success(`识别到 ${res.data.total} 个沉睡客户`)
  } catch (error) {
    ElMessage.error('识别失败')
  } finally {
    loadingSleep.value = false
  }
}

const copyRecoveryScript = (row: any) => {
  navigator.clipboard.writeText(row.recoveryScript)
  ElMessage.success('复苏话术已复制')
}

const startTrainingHandler = async () => {
  if (!trainingForm.scenario) {
    ElMessage.warning('请选择训练场景')
    return
  }

  try {
    const res = await startTrainingApi(trainingForm.scenario)
    trainingSession.value = res.data
    trainingMessages.value = []
    trainingRounds.value = 0
    ElMessage.success('开始训练，AI客户已就位')
  } catch (error) {
    ElMessage.error('开始训练失败')
  }
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) return

  trainingMessages.value.push({
    role: 'user',
    message: userMessage.value
  })

  const msg = userMessage.value
  userMessage.value = ''

  sending.value = true
  try {
    const res = await trainConversation(trainingSession.value.id, msg)
    trainingMessages.value.push({
      role: 'assistant',
      message: res.data.aiReply
    })
    trainingRounds.value = res.data.roundCount

    nextTick(() => {
      messagesContainer.value?.scrollTo(0, messagesContainer.value.scrollHeight)
    })
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

const stopTraining = async () => {
  try {
    const res = await endTraining(trainingSession.value.id)
    ElMessage.success(`训练结束！评分：${res.data.aiScore}分`)
    ElMessage.info(res.data.aiFeedback)
    trainingSession.value = null
    trainingMessages.value = []
    trainingForm.scenario = ''
  } catch (error) {
    ElMessage.error('结束训练失败')
  }
}

onMounted(() => {
  loadScripts()
  loadRiskAlerts()
})
</script>

<style scoped lang="scss">
.ai-tool-center {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
    }

    .subtitle {
      margin: 5px 0 0;
      color: #909399;
    }
  }

  .tool-section {
    padding: 20px;
  }

  .generated-script {
    margin-top: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .training-info {
    h3 {
      margin-top: 0;
    }
  }

  .chat-box {
    height: 600px;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;

      .message {
        margin-bottom: 15px;

        .message-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 5px;
        }

        .message-content {
          padding: 10px;
          border-radius: 4px;
          max-width: 80%;
        }

        &.user .message-content {
          background: #409eff;
          color: white;
          margin-left: auto;
        }

        &.ai .message-content {
          background: #f5f7fa;
        }
      }
    }

    .input-area {
      display: flex;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid #dcdfe6;
    }
  }
}
</style>
