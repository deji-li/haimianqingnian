<template>
  <div class="training-coach-dashboard">
    <el-card class="header-card" shadow="never">
      <div class="dashboard-header">
        <div>
          <h2>AI培训陪练</h2>
          <p class="subtitle">智能模拟销售场景，提升销售技能</p>
        </div>
        <div class="header-actions">
          <el-button @click="showCreateScriptDialog = true">
            <el-icon><DocumentAdd /></el-icon>
            创建剧本
          </el-button>
          <el-button type="primary" size="large" @click="startNewSession">
            <el-icon><Plus /></el-icon>
            开始新培训
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#409EFF"><TrendCharts /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalSessions }}</div>
              <div class="stat-label">总培训次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#67C23A"><SuccessFilled /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completedSessions }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#E6A23C"><Star /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ stats.averageScore }}</div>
              <div class="stat-label">平均得分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#F56C6C"><Timer /></el-icon>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalMinutes }}min</div>
              <div class="stat-label">总时长</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 培训剧本列表 -->
    <el-card class="scripts-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">培训剧本</span>
          <div class="header-actions">
            <el-select v-model="filterScenario" placeholder="场景类型" clearable style="width: 150px; margin-right: 10px;">
              <el-option label="首次接触" value="首次接触" />
              <el-option label="价格谈判" value="价格谈判" />
              <el-option label="异议处理" value="异议处理" />
              <el-option label="关系维护" value="关系维护" />
            </el-select>
            <el-select v-model="filterDifficulty" placeholder="难度" clearable style="width: 120px;">
              <el-option label="简单" value="简单" />
              <el-option label="普通" value="普通" />
              <el-option label="困难" value="困难" />
              <el-option label="专家" value="专家" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filteredScripts" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="剧本名称" min-width="180">
          <template #default="{ row }">
            <div class="script-title">
              <el-icon class="title-icon"><Document /></el-icon>
              {{ row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="scenario" label="场景类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getScenarioTagType(row.scenario)">{{ row.scenario }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyTagType(row.difficulty)" effect="plain">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customer_background" label="客户背景" min-width="200" show-overflow-tooltip />
        <el-table-column prop="max_rounds" label="最大轮次" width="100" align="center" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="startTraining(row)">
              开始训练
            </el-button>
            <el-button type="info" size="small" @click="viewDetails(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 最近训练记录 -->
    <el-card class="sessions-card" shadow="never">
      <template #header>
        <span class="card-title">最近训练记录</span>
      </template>
      <el-table :data="recentSessions" v-loading="loadingSessions">
        <el-table-column prop="session_name" label="会话名称" min-width="180" />
        <el-table-column prop="script_title" label="剧本" width="150" />
        <el-table-column prop="session_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.session_status)">
              {{ getStatusText(row.session_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="final_score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.final_score" class="score">{{ row.final_score }}</span>
            <span v-else class="no-score">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="started_at" label="训练时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.started_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.session_status === 'active'" type="primary" size="small" @click="continueSession(row)">
              继续训练
            </el-button>
            <el-button v-else type="info" size="small" @click="viewSessionDetails(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 开始新培训对话框 -->
    <el-dialog v-model="newSessionDialogVisible" title="开始新培训" width="600px">
      <el-form :model="newSessionForm" label-width="100px">
        <el-form-item label="选择剧本">
          <el-select v-model="newSessionForm.scriptId" placeholder="请选择培训剧本" style="width: 100%">
            <el-option
              v-for="script in scripts"
              :key="script.id"
              :label="`${script.title} (${script.scenario})`"
              :value="script.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会话名称">
          <el-input v-model="newSessionForm.sessionName" placeholder="为本次训练起个名字" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newSessionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStartSession">开始训练</el-button>
      </template>
    </el-dialog>

    <!-- 创建剧本对话框 -->
    <el-dialog v-model="showCreateScriptDialog" title="创建培训剧本" width="700px">
      <el-tabs v-model="createScriptTab" type="border-card">
        <!-- AI智能生成 -->
        <el-tab-pane label="AI智能生成" name="ai-generate">
          <el-form :model="aiGenerateForm" label-width="120px">
            <el-form-item label="剧本标题">
              <el-input v-model="aiGenerateForm.title" placeholder="例如：初次接触话术训练" />
            </el-form-item>
            <el-form-item label="场景类型">
              <el-select v-model="aiGenerateForm.scenario" placeholder="选择场景类型">
                <el-option label="首次接触" value="首次接触" />
                <el-option label="价格谈判" value="价格谈判" />
                <el-option label="异议处理" value="异议处理" />
                <el-option label="关系维护" value="关系维护" />
                <el-option label="成交缔结" value="成交缔结" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户背景">
              <el-input
                v-model="aiGenerateForm.customerBackground"
                type="textarea"
                :rows="3"
                placeholder="描述客户的背景信息，如：30岁女性，职场白领，对早教产品感兴趣..."
              />
            </el-form-item>
            <el-form-item label="培训目标">
              <el-input
                v-model="aiGenerateForm.trainingGoal"
                type="textarea"
                :rows="3"
                placeholder="描述本次培训的目标，如：掌握开场白技巧，建立初步信任..."
              />
            </el-form-item>
            <el-form-item label="难度等级">
              <el-radio-group v-model="aiGenerateForm.difficulty">
                <el-radio label="简单">简单</el-radio>
                <el-radio label="普通">普通</el-radio>
                <el-radio label="困难">困难</el-radio>
                <el-radio label="专家">专家</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 基于聊天记录 -->
        <el-tab-pane label="基于聊天记录" name="from-chat">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            从真实的聊天记录中提取优秀话术，生成培训剧本
          </el-alert>
          <el-form :model="chatBasedForm" label-width="120px">
            <el-form-item label="剧本标题">
              <el-input v-model="chatBasedForm.title" placeholder="为生成的剧本命名" />
            </el-form-item>
            <el-form-item label="聊天记录">
              <el-input
                v-model="chatBasedForm.chatContent"
                type="textarea"
                :rows="10"
                placeholder="粘贴真实的聊天记录，系统将自动提取优秀话术..."
              />
            </el-form-item>
            <el-form-item label="场景类型">
              <el-select v-model="chatBasedForm.scenario" placeholder="选择场景类型">
                <el-option label="首次接触" value="首次接触" />
                <el-option label="价格谈判" value="价格谈判" />
                <el-option label="异议处理" value="异议处理" />
                <el-option label="关系维护" value="关系维护" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 基于知识库 -->
        <el-tab-pane label="基于知识库" name="from-knowledge">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            从企业知识库中提取产品信息和销售话术，生成培训剧本
          </el-alert>
          <el-form :model="knowledgeBasedForm" label-width="120px">
            <el-form-item label="剧本标题">
              <el-input v-model="knowledgeBasedForm.title" placeholder="为生成的剧本命名" />
            </el-form-item>
            <el-form-item label="知识库ID">
              <el-input
                v-model="knowledgeBasedForm.knowledgeBaseId"
                placeholder="输入企业知识库的ID"
              />
            </el-form-item>
            <el-form-item label="关键词">
              <el-input
                v-model="knowledgeBasedForm.keywords"
                placeholder="输入关键词，用逗号分隔，如：产品介绍,价格,优惠"
              />
            </el-form-item>
            <el-form-item label="场景类型">
              <el-select v-model="knowledgeBasedForm.scenario" placeholder="选择场景类型">
                <el-option label="首次接触" value="首次接触" />
                <el-option label="价格谈判" value="价格谈判" />
                <el-option label="异议处理" value="异议处理" />
                <el-option label="产品介绍" value="产品介绍" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="showCreateScriptDialog = false">取消</el-button>
        <el-button type="primary" :loading="creatingScript" @click="createScript">
          创建剧本
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  TrendCharts,
  SuccessFilled,
  Star,
  Timer,
  Document,
  DocumentAdd
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// 数据状态
const loading = ref(false)
const loadingSessions = ref(false)
const scripts = ref<any[]>([])
const recentSessions = ref<any[]>([])
const filterScenario = ref('')
const filterDifficulty = ref('')
const newSessionDialogVisible = ref(false)

// 统计数据
const stats = reactive({
  totalSessions: 0,
  completedSessions: 0,
  averageScore: 0,
  totalMinutes: 0
})

// 新建会话表单
const newSessionForm = reactive({
  scriptId: null,
  sessionName: ''
})

// 创建剧本相关
const showCreateScriptDialog = ref(false)
const createScriptTab = ref('ai-generate')
const creatingScript = ref(false)

// AI智能生成表单
const aiGenerateForm = reactive({
  title: '',
  scenario: '',
  customerBackground: '',
  trainingGoal: '',
  difficulty: '普通'
})

// 基于聊天记录表单
const chatBasedForm = reactive({
  title: '',
  chatContent: '',
  scenario: ''
})

// 基于知识库表单
const knowledgeBasedForm = reactive({
  title: '',
  knowledgeBaseId: '',
  keywords: '',
  scenario: ''
})

// 过滤后的剧本列表
const filteredScripts = computed(() => {
  return scripts.value.filter(script => {
    const scenarioMatch = !filterScenario.value || script.scenario === filterScenario.value
    const difficultyMatch = !filterDifficulty.value || script.difficulty === filterDifficulty.value
    return scenarioMatch && difficultyMatch
  })
})

// 加载培训剧本
const loadScripts = async () => {
  loading.value = true
  try {
    const response = await request.get('/training-coach/scripts')
    scripts.value = response.data || []
  } catch (error) {
    console.error('Failed to load scripts:', error)
    ElMessage.error('加载培训剧本失败')
  } finally {
    loading.value = false
  }
}

// 加载最近训练记录
const loadRecentSessions = async () => {
  loadingSessions.value = true
  try {
    const response = await request.get('/training-coach/sessions', {
      params: { page: 1, limit: 5 }
    })
    recentSessions.value = response.data?.sessions || []
  } catch (error) {
    console.error('Failed to load sessions:', error)
  } finally {
    loadingSessions.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await request.get('/training-coach/statistics')
    Object.assign(stats, response.data)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// 开始新培训
const startNewSession = () => {
  newSessionDialogVisible.value = true
  newSessionForm.scriptId = null
  newSessionForm.sessionName = ''
}

// 确认开始培训
const confirmStartSession = async () => {
  if (!newSessionForm.scriptId) {
    ElMessage.warning('请选择培训剧本')
    return
  }

  try {
    const response = await request.post('/training-coach/sessions', {
      script_id: newSessionForm.scriptId,
      session_name: newSessionForm.sessionName || '未命名培训'
    })

    const sessionId = response.data.id
    ElMessage.success('创建培训会话成功')
    newSessionDialogVisible.value = false

    // 跳转到训练页面
    router.push(`/training-coach/session/${sessionId}`)
  } catch (error) {
    console.error('Failed to create session:', error)
    ElMessage.error('创建培训会话失败')
  }
}

// 开始训练
const startTraining = async (script: any) => {
  try {
    const response = await request.post('/training-coach/sessions', {
      script_id: script.id,
      session_name: `${script.title} - ${new Date().toLocaleString()}`
    })

    const sessionId = response.data.id
    router.push(`/training-coach/session/${sessionId}`)
  } catch (error) {
    console.error('Failed to start training:', error)
    ElMessage.error('开始训练失败')
  }
}

// 继续会话
const continueSession = (session: any) => {
  router.push(`/training-coach/session/${session.id}`)
}

// 查看剧本详情
const viewDetails = (script: any) => {
  router.push(`/training-coach/script/${script.id}`)
}

// 查看会话详情
const viewSessionDetails = (session: any) => {
  router.push(`/training-coach/session/${session.id}/report`)
}

// 创建剧本
const createScript = async () => {
  let endpoint = ''
  let data: any = {}
  let validate = false

  // 根据当前选择的tab验证表单并准备数据
  if (createScriptTab.value === 'ai-generate') {
    if (!aiGenerateForm.title || !aiGenerateForm.scenario || !aiGenerateForm.customerBackground || !aiGenerateForm.trainingGoal) {
      ElMessage.warning('请填写完整的剧本信息')
      return
    }
    validate = true
    endpoint = '/training-coach/scripts/ai-generate'
    data = {
      title: aiGenerateForm.title,
      scenario: aiGenerateForm.scenario,
      customer_background: aiGenerateForm.customerBackground,
      training_goal: aiGenerateForm.trainingGoal,
      difficulty: aiGenerateForm.difficulty
    }
  } else if (createScriptTab.value === 'from-chat') {
    if (!chatBasedForm.title || !chatBasedForm.chatContent || !chatBasedForm.scenario) {
      ElMessage.warning('请填写完整的剧本信息和聊天记录')
      return
    }
    validate = true
    endpoint = '/training-coach/scripts/from-chat'
    data = {
      title: chatBasedForm.title,
      chat_content: chatBasedForm.chatContent,
      scenario: chatBasedForm.scenario
    }
  } else if (createScriptTab.value === 'from-knowledge') {
    if (!knowledgeBasedForm.title || !knowledgeBasedForm.knowledgeBaseId || !knowledgeBasedForm.keywords || !knowledgeBasedForm.scenario) {
      ElMessage.warning('请填写完整的剧本信息')
      return
    }
    validate = true
    endpoint = '/training-coach/scripts/from-knowledge'
    data = {
      title: knowledgeBasedForm.title,
      knowledge_base_id: knowledgeBasedForm.knowledgeBaseId,
      keywords: knowledgeBasedForm.keywords,
      scenario: knowledgeBasedForm.scenario
    }
  }

  if (!validate) return

  creatingScript.value = true
  try {
    await request.post(endpoint, data)
    ElMessage.success('剧本创建成功')
    showCreateScriptDialog.value = false

    // 重置表单
    aiGenerateForm.title = ''
    aiGenerateForm.scenario = ''
    aiGenerateForm.customerBackground = ''
    aiGenerateForm.trainingGoal = ''
    aiGenerateForm.difficulty = '普通'

    chatBasedForm.title = ''
    chatBasedForm.chatContent = ''
    chatBasedForm.scenario = ''

    knowledgeBasedForm.title = ''
    knowledgeBasedForm.knowledgeBaseId = ''
    knowledgeBasedForm.keywords = ''
    knowledgeBasedForm.scenario = ''

    // 刷新剧本列表
    await loadScripts()
  } catch (error: any) {
    console.error('Failed to create script:', error)
    ElMessage.error(error.response?.data?.message || '剧本创建失败')
  } finally {
    creatingScript.value = false
  }
}

// 辅助函数
const getScenarioTagType = (scenario: string) => {
  const typeMap: Record<string, any> = {
    '首次接触': 'primary',
    '价格谈判': 'success',
    '异议处理': 'warning',
    '关系维护': 'info'
  }
  return typeMap[scenario] || ''
}

const getDifficultyTagType = (difficulty: string) => {
  const typeMap: Record<string, any> = {
    '简单': 'success',
    '普通': 'info',
    '困难': 'warning',
    '专家': 'danger'
  }
  return typeMap[difficulty] || ''
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    'preparing': 'info',
    'active': 'warning',
    'paused': 'info',
    'completed': 'success',
    'abandoned': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'preparing': '准备中',
    'active': '进行中',
    'paused': '已暂停',
    'completed': '已完成',
    'abandoned': '已放弃'
  }
  return textMap[status] || status
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

// 初始化
onMounted(() => {
  loadScripts()
  loadRecentSessions()
  loadStats()
})
</script>

<style scoped lang="scss">
.training-coach-dashboard {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      .subtitle {
        margin: 5px 0 0 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        font-size: 40px;
      }

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }

  .scripts-card,
  .sessions-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: bold;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .script-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .title-icon {
        color: #409EFF;
      }
    }

    .score {
      font-weight: bold;
      color: #67C23A;
    }

    .no-score {
      color: #909399;
    }
  }
}
</style>
