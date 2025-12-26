<template>
  <div class="training-coach-config">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- AI模型配置 -->
      <el-tab-pane label="AI模型配置" name="model">
        <el-form :model="config.model" label-width="150px">
          <el-form-item label="AI服务商">
            <el-select v-model="config.model.provider" placeholder="选择AI服务商">
              <el-option label="DeepSeek" value="deepseek" />
              <el-option label="OpenAI GPT" value="openai" />
              <el-option label="通义千问" value="qwen" />
              <el-option label="文心一言" value="ernie" />
            </el-select>
            <span class="form-tip">选择用于培训陪练的AI模型服务商</span>
          </el-form-item>

          <el-form-item label="Temperature">
            <el-slider
              v-model="config.model.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              show-input
              :marks="{ 0: '精确', 1: '平衡', 2: '创造' }"
            />
            <span class="form-tip">控制AI回复的随机性，值越高越有创造性</span>
          </el-form-item>

          <el-form-item label="最大Token数">
            <el-input-number
              v-model="config.model.maxTokens"
              :min="500"
              :max="8000"
              :step="100"
            />
            <span class="form-tip">限制AI单次回复的最大长度</span>
          </el-form-item>

          <el-form-item label="响应超时(秒)">
            <el-input-number
              v-model="config.model.timeout"
              :min="10"
              :max="120"
              :step="5"
            />
            <span class="form-tip">AI响应的最大等待时间</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 评估权重配置 -->
      <el-tab-pane label="评估权重配置" name="evaluation">
        <el-alert
          title="评估维度说明"
          type="info"
          :closable="false"
          class="info-alert"
        >
          <p>五个评估维度的权重总和必须等于100%</p>
        </el-alert>

        <el-form :model="config.evaluation" label-width="150px">
          <el-form-item label="目标达成度">
            <el-slider
              v-model="config.evaluation.goalAchievement"
              :min="0"
              :max="100"
              show-input
            >
              <template #append>%</template>
            </el-slider>
            <span class="form-tip">评估是否达成培训目标</span>
          </el-form-item>

          <el-form-item label="专业性">
            <el-slider
              v-model="config.evaluation.professionalism"
              :min="0"
              :max="100"
              show-input
            >
              <template #append>%</template>
            </el-slider>
            <span class="form-tip">评估话术专业度和产品知识</span>
          </el-form-item>

          <el-form-item label="沟通效率">
            <el-slider
              v-model="config.evaluation.efficiency"
              :min="0"
              :max="100"
              show-input
            >
              <template #append>%</template>
            </el-slider>
            <span class="form-tip">评估沟通效率和时间管理</span>
          </el-form-item>

          <el-form-item label="应变能力">
            <el-slider
              v-model="config.evaluation.adaptability"
              :min="0"
              :max="100"
              show-input
            >
              <template #append>%</template>
            </el-slider>
            <span class="form-tip">评估处理异议和应对突发情况</span>
          </el-form-item>

          <el-form-item label="客户体验">
            <el-slider
              v-model="config.evaluation.customerSatisfaction"
              :min="0"
              :max="100"
              show-input
            >
              <template #append>%</template>
            </el-slider>
            <span class="form-tip">评估客户感受和满意度</span>
          </el-form-item>

          <el-form-item label="权重总和">
            <el-tag :type="totalWeight === 100 ? 'success' : 'danger'" size="large">
              {{ totalWeight }}%
            </el-tag>
            <span v-if="totalWeight !== 100" class="error-tip">
              权重总和必须为100%
            </span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 提示词配置 -->
      <el-tab-pane label="提示词配置" name="prompts">
        <el-form :model="config.prompts" label-width="150px">
          <el-form-item label="客户角色扮演">
            <el-input
              v-model="config.prompts.customerPersona"
              type="textarea"
              :rows="4"
              placeholder="定义AI如何扮演客户角色"
            />
            <span class="form-tip">指导AI模拟不同类型客户的行为和反应</span>
          </el-form-item>

          <el-form-item label="剧本生成">
            <el-input
              v-model="config.prompts.scriptGeneration"
              type="textarea"
              :rows="4"
              placeholder="定义如何生成培训剧本"
            />
            <span class="form-tip">指导AI如何创建销售培训剧本</span>
          </el-form-item>

          <el-form-item label="表现评估">
            <el-input
              v-model="config.prompts.evaluation"
              type="textarea"
              :rows="4"
              placeholder="定义如何评估销售表现"
            />
            <span class="form-tip">指导AI如何评估销售员的表现</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 高级设置 -->
      <el-tab-pane label="高级设置" name="advanced">
        <el-form :model="config.advanced" label-width="180px">
          <el-form-item label="默认最大对话轮次">
            <el-input-number
              v-model="config.advanced.maxRounds"
              :min="3"
              :max="15"
              :step="1"
            />
            <span class="form-tip">每次培训的默认最大对话轮数</span>
          </el-form-item>

          <el-form-item label="AI响应延迟">
            <el-radio-group v-model="config.advanced.responseDelay">
              <el-radio label="instant">即时响应</el-radio>
              <el-radio label="normal">正常(1-2秒)</el-radio>
              <el-radio label="slow">较慢(3-5秒)</el-radio>
            </el-radio-group>
            <span class="form-tip">模拟真实客户的思考时间</span>
          </el-form-item>

          <el-form-item label="实时评估">
            <el-switch
              v-model="config.advanced.realTimeEvaluation"
              active-text="开启"
              inactive-text="关闭"
            />
            <span class="form-tip">在对话过程中提供实时评分和建议</span>
          </el-form-item>

          <el-form-item label="自动保存">
            <el-switch
              v-model="config.advanced.autoSave"
              active-text="开启"
              inactive-text="关闭"
            />
            <span class="form-tip">自动保存对话历史和进度</span>
          </el-form-item>

          <el-form-item label="智能难度调整">
            <el-switch
              v-model="config.advanced.dynamicDifficulty"
              active-text="开启"
              inactive-text="关闭"
            />
            <span class="form-tip">根据表现自动调整客户难度</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 客户角色配置 -->
      <el-tab-pane label="客户角色配置" name="personas">
        <div class="personas-section">
          <div class="section-header">
            <span>自定义客户角色</span>
            <el-button type="primary" size="small" @click="addPersona">
              <el-icon><Plus /></el-icon>
              添加角色
            </el-button>
          </div>

          <el-table :data="config.customerPersonas" border>
            <el-table-column prop="name" label="角色名称" width="150" />
            <el-table-column prop="personalityType" label="性格类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.personalityType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="communicationStyle" label="沟通风格" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="success">{{ row.communicationStyle }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="isActive" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
                  {{ row.isActive ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row, $index }">
                <el-button type="primary" size="small" @click="editPersona(row, $index)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deletePersona($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button @click="resetConfig">重置为默认</el-button>
      <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
    </div>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog v-model="personaDialogVisible" :title="editingPersonaIndex === -1 ? '添加客户角色' : '编辑客户角色'" width="600px">
      <el-form :model="editingPersona" label-width="120px">
        <el-form-item label="角色名称">
          <el-input v-model="editingPersona.name" placeholder="例如：犹豫不决的李女士" />
        </el-form-item>
        <el-form-item label="性格类型">
          <el-select v-model="editingPersona.personalityType" placeholder="选择性格类型">
            <el-option label="犹豫不决" value="hesitant" />
            <el-option label="价格敏感" value="price_sensitive" />
            <el-option label="专业理性" value="professional" />
            <el-option label="急躁直接" value="impatient" />
            <el-option label="爱比较" value="comparative" />
          </el-select>
        </el-form-item>
        <el-form-item label="沟通风格">
          <el-select v-model="editingPersona.communicationStyle" placeholder="选择沟通风格">
            <el-option label="正式" value="formal" />
            <el-option label="随意" value="casual" />
            <el-option label="技术性" value="technical" />
            <el-option label="直接" value="direct" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="editingPersona.description"
            type="textarea"
            :rows="3"
            placeholder="描述该客户角色的特点和行为模式"
          />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="editingPersona.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="personaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePersona">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const activeTab = ref('model')
const saving = ref(false)
const personaDialogVisible = ref(false)
const editingPersonaIndex = ref(-1)

// 配置数据
const config = reactive({
  model: {
    provider: 'deepseek',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30
  },
  evaluation: {
    goalAchievement: 40,
    professionalism: 25,
    efficiency: 15,
    adaptability: 10,
    customerSatisfaction: 10
  },
  prompts: {
    customerPersona: '你是专业的角色扮演AI，能够准确模拟不同类型客户的真实反应。',
    scriptGeneration: '你是专业的销售培训专家，擅长创建实战性强的培训剧本。',
    evaluation: '你是专业的销售培训评估师，请客观评估销售表现并提供建设性建议。'
  },
  advanced: {
    maxRounds: 5,
    responseDelay: 'normal' as 'instant' | 'normal' | 'slow',
    realTimeEvaluation: true,
    autoSave: true,
    dynamicDifficulty: false
  },
  customerPersonas: [] as any[]
})

// 编辑中的角色
const editingPersona = reactive({
  name: '',
  personalityType: '',
  communicationStyle: '',
  description: '',
  isActive: true
})

// 计算权重总和
const totalWeight = computed(() => {
  return (
    config.evaluation.goalAchievement +
    config.evaluation.professionalism +
    config.evaluation.efficiency +
    config.evaluation.adaptability +
    config.evaluation.customerSatisfaction
  )
})

// 加载配置
const loadConfig = async () => {
  try {
    const response = await request.get('/training-coach/ai-config')
    if (response.data) {
      Object.assign(config.model, response.data.model || {})
      Object.assign(config.evaluation, response.data.evaluation || {})
      Object.assign(config.prompts, response.data.prompts || {})
      Object.assign(config.advanced, response.data.advanced || {})
      config.customerPersonas = response.data.customerPersonas || []
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  // 验证权重总和
  if (totalWeight.value !== 100) {
    ElMessage.error('评估权重总和必须为100%')
    return
  }

  saving.value = true
  try {
    await request.post('/training-coach/ai-config', config)
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('Failed to save config:', error)
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

// 重置配置
const resetConfig = () => {
  config.model.provider = 'deepseek'
  config.model.temperature = 0.7
  config.model.maxTokens = 2000
  config.model.timeout = 30

  config.evaluation.goalAchievement = 40
  config.evaluation.professionalism = 25
  config.evaluation.efficiency = 15
  config.evaluation.adaptability = 10
  config.evaluation.customerSatisfaction = 10

  config.prompts.customerPersona = '你是专业的角色扮演AI，能够准确模拟不同类型客户的真实反应。'
  config.prompts.scriptGeneration = '你是专业的销售培训专家，擅长创建实战性强的培训剧本。'
  config.prompts.evaluation = '你是专业的销售培训评估师，请客观评估销售表现并提供建设性建议。'

  config.advanced.maxRounds = 5
  config.advanced.responseDelay = 'normal'
  config.advanced.realTimeEvaluation = true
  config.advanced.autoSave = true
  config.advanced.dynamicDifficulty = false

  ElMessage.success('已重置为默认配置')
}

// 添加角色
const addPersona = () => {
  editingPersona.name = ''
  editingPersona.personalityType = ''
  editingPersona.communicationStyle = ''
  editingPersona.description = ''
  editingPersona.isActive = true
  editingPersonaIndex.value = -1
  personaDialogVisible.value = true
}

// 编辑角色
const editPersona = (persona: any, index: number) => {
  Object.assign(editingPersona, persona)
  editingPersonaIndex.value = index
  personaDialogVisible.value = true
}

// 保存角色
const savePersona = () => {
  if (!editingPersona.name || !editingPersona.personalityType || !editingPersona.communicationStyle) {
    ElMessage.warning('请填写完整角色信息')
    return
  }

  if (editingPersonaIndex.value === -1) {
    // 添加新角色
    config.customerPersonas.push({ ...editingPersona })
  } else {
    // 更新现有角色
    Object.assign(config.customerPersonas[editingPersonaIndex.value], editingPersona)
  }

  personaDialogVisible.value = false
  ElMessage.success('角色保存成功')
}

// 删除角色
const deletePersona = (index: number) => {
  config.customerPersonas.splice(index, 1)
  ElMessage.success('角色删除成功')
}

// 初始化
onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.training-coach-config {
  .form-tip {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .error-tip {
    display: inline-block;
    font-size: 12px;
    color: #F56C6C;
    margin-left: 10px;
  }

  .info-alert {
    margin-bottom: 20px;

    p {
      margin: 5px 0;
    }
  }

  .personas-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 30px 0 10px 0;
    border-top: 1px solid #EBEEF5;
    margin-top: 30px;
  }
}
</style>
