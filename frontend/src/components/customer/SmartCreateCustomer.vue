<template>
  <el-dialog
    v-model="visible"
    title="AI智能创建客户"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="smart-create-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="上传截图" description="粘贴或上传聊天截图" />
        <el-step title="AI识别" description="AI智能识别客户信息" />
        <el-step title="确认信息" description="编辑确认客户信息" />
      </el-steps>

      <!-- 步骤1: 上传截图 -->
      <div v-if="currentStep === 0" class="step-content">
        <div
          class="paste-area"
          @paste="handlePaste"
          tabindex="0"
          ref="pasteAreaRef"
        >
          <div class="paste-hint">
            <el-icon :size="48" color="#409EFF"><Picture /></el-icon>
            <p class="hint-text">按 Ctrl+V 粘贴聊天截图</p>
            <p class="hint-sub">或点击下方上传按钮</p>
          </div>

          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept="image/*"
            list-type="picture-card"
            :multiple="true"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>

        <div v-if="pastedImages.length > 0" class="pasted-images">
          <h4>已粘贴的图片 ({{ pastedImages.length }})</h4>
          <div class="image-grid">
            <div
              v-for="(img, index) in pastedImages"
              :key="index"
              class="image-item"
            >
              <img :src="img.preview" alt="聊天截图" />
              <el-icon class="remove-icon" @click="removePastedImage(index)">
                <CircleClose />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: AI识别中 -->
      <div v-if="currentStep === 1" class="step-content analyzing">
        <el-result icon="info" title="AI正在识别中...">
          <template #extra>
            <div v-loading="aiLoading" element-loading-text="正在识别聊天截图..." class="loading-box">
              <p class="progress-text">{{ aiProgressText }}</p>
            </div>
          </template>
        </el-result>
      </div>

      <!-- 步骤3: 确认信息 -->
      <div v-if="currentStep === 2" class="step-content">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
        >
          <el-tabs v-model="activeTab" type="border-card">
            <!-- 基础信息 -->
            <el-tab-pane label="基础信息" name="basic">
              <el-form-item label="微信昵称" prop="wechatNickname">
                <el-input v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
              </el-form-item>

              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" placeholder="请输入手机号" />
              </el-form-item>

              <el-form-item label="所在地区">
                <el-input v-model="formData.location" placeholder="AI识别的所在地区" />
              </el-form-item>

              <el-form-item label="学生年级">
                <el-input v-model="formData.studentGrade" placeholder="AI识别的学生年级" />
              </el-form-item>

              <el-form-item label="学生年龄">
                <el-input-number v-model="formData.studentAge" :min="0" :max="25" />
              </el-form-item>
            </el-tab-pane>

            <!-- 意向信息 -->
            <el-tab-pane label="意向信息" name="intent">
              <el-form-item label="客户意向">
                <el-select v-model="formData.customerIntent" placeholder="请选择客户意向" style="width: 100%">
                  <el-option label="高意向" value="高" />
                  <el-option label="中意向" value="中" />
                  <el-option label="低意向" value="低" />
                  <el-option label="无意向" value="无" />
                </el-select>
              </el-form-item>

              <el-form-item label="意向分数">
                <el-slider v-model="formData.intentionScore" :min="0" :max="100" show-input />
              </el-form-item>

              <el-form-item label="客户阶段">
                <el-select v-model="formData.customerStage" placeholder="请选择客户阶段" style="width: 100%">
                  <el-option label="初次接触" value="初次接触" />
                  <el-option label="需求确认" value="需求确认" />
                  <el-option label="方案沟通" value="方案沟通" />
                  <el-option label="报价" value="报价" />
                  <el-option label="成交" value="成交" />
                </el-select>
              </el-form-item>

              <el-form-item label="预估金额">
                <el-input-number v-model="formData.estimatedValue" :min="0" :step="100" />
              </el-form-item>

              <el-form-item label="预估周期">
                <el-input v-model="formData.estimatedCycle" placeholder="如：短期（1周内）" />
              </el-form-item>

              <el-form-item label="成交机会">
                <el-radio-group v-model="formData.dealOpportunity">
                  <el-radio label="高">高</el-radio>
                  <el-radio label="中">中</el-radio>
                  <el-radio label="低">低</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-tab-pane>

            <!-- 标签画像 -->
            <el-tab-pane label="标签画像" name="tags">
              <el-form-item label="AI生成标签">
                <el-tag
                  v-for="tag in formData.aiTags"
                  :key="tag"
                  type="success"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ tag }}
                </el-tag>
              </el-form-item>

              <el-form-item label="家长角色">
                <el-input v-model="formData.parentRole" placeholder="如：妈妈" />
              </el-form-item>

              <el-form-item label="家庭经济水平">
                <el-radio-group v-model="formData.familyEconomicLevel">
                  <el-radio label="高">高</el-radio>
                  <el-radio label="中">中</el-radio>
                  <el-radio label="低">低</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="教育重视程度">
                <el-radio-group v-model="formData.educationAttitude">
                  <el-radio label="很重视">很重视</el-radio>
                  <el-radio label="一般">一般</el-radio>
                  <el-radio label="不太重视">不太重视</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="沟通风格">
                <el-input v-model="formData.communicationStyle" placeholder="如：直接/委婉/理性/感性" />
              </el-form-item>

              <el-form-item label="信任程度">
                <el-radio-group v-model="formData.trustLevel">
                  <el-radio label="高">高</el-radio>
                  <el-radio label="中">中</el-radio>
                  <el-radio label="低">低</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-tab-pane>

            <!-- 跟进建议 -->
            <el-tab-pane label="跟进建议" name="advice">
              <el-form-item label="下一步行动">
                <el-tag
                  v-for="(step, index) in formData.nextSteps"
                  :key="index"
                  type="primary"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ step }}
                </el-tag>
              </el-form-item>

              <el-form-item label="销售策略">
                <el-input
                  v-model="formData.salesStrategy"
                  type="textarea"
                  :rows="3"
                  placeholder="AI推荐的销售策略"
                />
              </el-form-item>

              <el-form-item label="客户需求">
                <el-tag
                  v-for="(need, index) in formData.customerNeeds"
                  :key="index"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ need }}
                </el-tag>
              </el-form-item>

              <el-form-item label="客户痛点">
                <el-tag
                  v-for="(pain, index) in formData.customerPainPoints"
                  :key="index"
                  type="warning"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ pain }}
                </el-tag>
              </el-form-item>

              <el-form-item label="风险因素">
                <el-tag
                  v-for="(risk, index) in formData.riskFactors"
                  :key="index"
                  type="danger"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ risk }}
                </el-tag>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button v-if="currentStep > 0 && currentStep < 2" @click="currentStep--">上一步</el-button>
      <el-button v-if="currentStep === 0" type="primary" @click="handleStartAI" :disabled="!canStartAI">
        开始AI识别
      </el-button>
      <el-button v-if="currentStep === 2" @click="visible = false">取消</el-button>
      <el-button v-if="currentStep === 2" type="primary" :loading="submitLoading" @click="handleSubmit">
        创建客户
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Plus, CircleClose } from '@element-plus/icons-vue'
import axios from 'axios'

const visible = ref(false)
const currentStep = ref(0)
const activeTab = ref('basic')
const pasteAreaRef = ref<HTMLElement | null>(null)

// 图片相关
const fileList = ref([])
const pastedImages = ref<{ file: File; preview: string; base64: string }[]>([])

// AI识别相关
const aiLoading = ref(false)
const aiProgressText = ref('正在OCR识别聊天文本...')

// 表单数据
const formData = ref({
  // 基础信息
  wechatNickname: '',
  realName: '',
  phone: '',
  location: '',
  studentGrade: '',
  studentAge: undefined as number | undefined,

  // 意向信息
  customerIntent: '',
  intentionScore: 50,
  customerStage: '',
  estimatedValue: 0,
  estimatedCycle: '',
  dealOpportunity: '',

  // 标签画像
  aiTags: [] as string[],
  parentRole: '',
  familyEconomicLevel: '',
  educationAttitude: '',
  communicationStyle: '',
  trustLevel: '',

  // 跟进建议
  nextSteps: [] as string[],
  salesStrategy: '',
  customerNeeds: [] as string[],
  customerPainPoints: [] as string[],
  riskFactors: [] as string[],
})

const formRules = {
  wechatNickname: [{ required: true, message: '请输入微信昵称', trigger: 'blur' }],
}

const submitLoading = ref(false)
const formRef = ref()

// 是否可以开始AI识别
const canStartAI = computed(() => {
  return pastedImages.value.length > 0 || fileList.value.length > 0
})

// 打开对话框
const open = () => {
  visible.value = true
  currentStep.value = 0
  pastedImages.value = []
  fileList.value = []
  resetForm()

  nextTick(() => {
    pasteAreaRef.value?.focus()
  })
}

// 关闭对话框
const handleClose = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.value = {
    wechatNickname: '',
    realName: '',
    phone: '',
    location: '',
    studentGrade: '',
    studentAge: undefined,
    customerIntent: '',
    intentionScore: 50,
    customerStage: '',
    estimatedValue: 0,
    estimatedCycle: '',
    dealOpportunity: '',
    aiTags: [],
    parentRole: '',
    familyEconomicLevel: '',
    educationAttitude: '',
    communicationStyle: '',
    trustLevel: '',
    nextSteps: [],
    salesStrategy: '',
    customerNeeds: [],
    customerPainPoints: [],
    riskFactors: [],
  }
}

// 处理粘贴事件
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        const preview = URL.createObjectURL(file)
        const base64 = await fileToBase64(file)
        pastedImages.value.push({ file, preview, base64 })
        ElMessage.success(`已粘贴图片 ${pastedImages.value.length}`)
      }
    }
  }
}

// 文件转base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 处理文件上传
const handleFileChange = async (file: any) => {
  const rawFile = file.raw
  const preview = URL.createObjectURL(rawFile)
  const base64 = await fileToBase64(rawFile)
  pastedImages.value.push({ file: rawFile, preview, base64 })
}

// 移除已粘贴的图片
const removePastedImage = (index: number) => {
  pastedImages.value.splice(index, 1)
}

// 开始AI识别
const handleStartAI = async () => {
  if (!canStartAI.value) {
    ElMessage.warning('请先粘贴或上传聊天截图')
    return
  }

  currentStep.value = 1
  aiLoading.value = true
  aiProgressText.value = '正在OCR识别聊天文本...'

  try {
    // 准备请求数据
    const imageBase64List = pastedImages.value.map((img) => img.base64)

    // 调用AI识别API
    const { data } = await axios.post('/api/customer/smart-create', {
      imageBase64List,
      knownInfo: {},
    })

    aiProgressText.value = 'AI分析完成，正在填充表单...'

    // 填充表单数据
    fillFormData(data)

    setTimeout(() => {
      aiLoading.value = false
      currentStep.value = 2
      ElMessage.success('AI识别完成！')
    }, 500)
  } catch (error: any) {
    aiLoading.value = false
    currentStep.value = 0
    ElMessage.error(error.response?.data?.message || 'AI识别失败，请重试')
  }
}

// 填充表单数据
const fillFormData = (data: any) => {
  // 基础信息
  formData.value.wechatNickname = data.basicInfo.wechatNickname || ''
  formData.value.realName = data.basicInfo.realName || ''
  formData.value.phone = data.basicInfo.phone || ''
  formData.value.location = data.basicInfo.location || ''
  formData.value.studentGrade = data.basicInfo.studentGrade || ''
  formData.value.studentAge = data.basicInfo.studentAge

  // 意向信息
  formData.value.customerIntent = data.intentInfo.customerIntent || ''
  formData.value.intentionScore = data.intentInfo.intentionScore || 50
  formData.value.customerStage = data.intentInfo.customerStage || ''
  formData.value.estimatedValue = data.intentInfo.estimatedValue || 0
  formData.value.estimatedCycle = data.intentInfo.estimatedCycle || ''
  formData.value.dealOpportunity = data.intentInfo.dealOpportunity || ''

  // 标签画像
  formData.value.aiTags = data.tags.aiTags || []
  formData.value.parentRole = data.tags.profile.parentRole || ''
  formData.value.familyEconomicLevel = data.tags.profile.familyEconomicLevel || ''
  formData.value.educationAttitude = data.tags.profile.educationAttitude || ''
  formData.value.communicationStyle = data.tags.profile.communicationStyle || ''
  formData.value.trustLevel = data.tags.profile.trustLevel || ''

  // 跟进建议
  formData.value.nextSteps = data.followUpAdvice.nextSteps || []
  formData.value.salesStrategy = data.followUpAdvice.salesStrategy || ''
  formData.value.customerNeeds = data.followUpAdvice.customerNeeds || []
  formData.value.customerPainPoints = data.followUpAdvice.customerPainPoints || []
  formData.value.riskFactors = data.followUpAdvice.riskFactors || []
}

// 提交创建客户
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitLoading.value = true

    // 构建创建客户的请求数据
    const customerData = {
      wechatNickname: formData.value.wechatNickname,
      wechatId: formData.value.wechatNickname, // 如果没有微信号，使用昵称
      realName: formData.value.realName,
      phone: formData.value.phone,
      customerIntent: formData.value.customerIntent,
      trafficSource: 'AI智能识别',
      remark: `【AI识别信息】
意向分数：${formData.value.intentionScore}分
客户阶段：${formData.value.customerStage}
预估金额：${formData.value.estimatedValue}元
预估周期：${formData.value.estimatedCycle}
成交机会：${formData.value.dealOpportunity}

【AI标签】
${formData.value.aiTags.join('、')}

【客户画像】
家长角色：${formData.value.parentRole}
家庭经济：${formData.value.familyEconomicLevel}
教育态度：${formData.value.educationAttitude}
沟通风格：${formData.value.communicationStyle}
信任程度：${formData.value.trustLevel}

【下一步行动】
${formData.value.nextSteps.join('\n')}

【销售策略】
${formData.value.salesStrategy}

【客户需求】
${formData.value.customerNeeds.join('、')}

【客户痛点】
${formData.value.customerPainPoints.join('、')}

【风险因素】
${formData.value.riskFactors.join('、')}`,
    }

    // 调用创建客户API
    await axios.post('/api/customer', customerData)

    ElMessage.success('客户创建成功！')
    visible.value = false

    // emit事件通知父组件刷新
    emit('created')
  } catch (error: any) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '创建失败')
    } else {
      ElMessage.error('创建客户失败，请重试')
    }
  } finally {
    submitLoading.value = false
  }
}

// 定义emits
const emit = defineEmits(['created'])

defineExpose({
  open,
})
</script>

<style lang="scss" scoped>
.smart-create-container {
  padding: 20px 0;

  .el-steps {
    margin-bottom: 30px;
  }

  .step-content {
    min-height: 400px;
    padding: 20px 0;

    &.analyzing {
      display: flex;
      align-items: center;
      justify-content: center;

      .loading-box {
        width: 300px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;

        .progress-text {
          margin-top: 20px;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .paste-area {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s;
    outline: none;

    &:hover,
    &:focus {
      border-color: #409EFF;
    }

    .paste-hint {
      margin-bottom: 20px;

      .hint-text {
        margin: 16px 0 8px;
        font-size: 16px;
        color: #606266;
      }

      .hint-sub {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .pasted-images {
    margin-top: 30px;

    h4 {
      margin-bottom: 16px;
      color: #303133;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;

      .image-item {
        position: relative;
        width: 120px;
        height: 120px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-icon {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 20px;
          color: #f56c6c;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
  }
}
</style>
