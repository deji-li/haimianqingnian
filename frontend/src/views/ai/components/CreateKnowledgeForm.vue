<template>
  <div class="create-knowledge-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      label-position="left"
    >
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center>
        <el-step title="企业信息" description="补充企业基本信息" />
        <el-step title="客户常见问题" description="添加常见FAQ" />
        <el-step title="AI挖掘配置" description="设置挖掘参数" />
        <el-step title="生成知识库" description="完成创建" />
      </el-steps>

      <!-- 步骤1：企业信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <h3>步骤1：补充企业基本信息</h3>

        <el-form-item label="输入方式" prop="enterpriseInfo.inputMethod">
          <el-radio-group v-model="formData.enterpriseInfo.inputMethod">
            <el-radio value="MANUAL">手动输入</el-radio>
            <el-radio value="FILE_UPLOAD">文件上传</el-radio>
            <el-radio value="AI_ASSIST">AI帮写</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 手动输入 -->
        <div v-if="formData.enterpriseInfo.inputMethod === 'MANUAL'">
          <el-form-item label="企业信息" prop="enterpriseInfo.manualContent">
            <el-input
              v-model="formData.enterpriseInfo.manualContent"
              type="textarea"
              :rows="6"
              placeholder="请输入企业基本信息，包括经营范围、产品介绍等"
            />
          </el-form-item>
        </div>

        <!-- 文件上传 -->
        <div v-if="formData.enterpriseInfo.inputMethod === 'FILE_UPLOAD'">
          <el-form-item label="上传文件">
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              accept=".txt,.doc,.docx,.pdf"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                支持 .txt, .doc, .docx, .pdf 格式文件
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <!-- AI帮写 -->
        <div v-if="formData.enterpriseInfo.inputMethod === 'AI_ASSIST'">
          <el-form-item label="企业名称" prop="enterpriseInfo.companyName">
            <el-input
              v-model="formData.enterpriseInfo.companyName"
              placeholder="请输入企业名称"
            />
          </el-form-item>
          <el-form-item label="行业类型" prop="enterpriseInfo.industry">
            <el-select
              v-model="formData.enterpriseInfo.industry"
              placeholder="选择行业类型"
              style="width: 100%"
            >
              <el-option label="教育培训" value="教育培训" />
              <el-option label="互联网科技" value="互联网科技" />
              <el-option label="电子商务" value="电子商务" />
              <el-option label="金融服务" value="金融服务" />
              <el-option label="医疗健康" value="医疗健康" />
              <el-option label="制造业" value="制造业" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 步骤2：客户常见问题 -->
      <div v-show="currentStep === 1" class="step-content">
        <h3>步骤2：补充客户常见问题</h3>

        <el-form-item label="是否有现有FAQ" prop="customerFAQ.hasExistingFAQ">
          <el-switch
            v-model="formData.customerFAQ.hasExistingFAQ"
            active-text="有"
            inactive-text="没有"
          />
        </el-form-item>

        <div v-if="formData.customerFAQ.hasExistingFAQ">
          <el-form-item label="FAQ数据">
            <div class="faq-list">
              <div
                v-for="(faq, index) in formData.customerFAQ.faqData"
                :key="index"
                class="faq-item"
              >
                <el-row :gutter="20">
                  <el-col :span="11">
                    <el-input
                      v-model="faq.question"
                      placeholder="问题"
                    />
                  </el-col>
                  <el-col :span="11">
                    <el-input
                      v-model="faq.answer"
                      placeholder="答案"
                    />
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      type="danger"
                      icon="Delete"
                      circle
                      @click="removeFAQ(index)"
                    />
                  </el-col>
                </el-row>
              </div>

              <el-button
                type="dashed"
                icon="Plus"
                style="width: 100%"
                @click="addFAQ"
              >
                添加FAQ
              </el-button>
            </div>
          </el-form-item>
        </div>

        <div v-else>
          <el-alert
            title="提示"
            type="info"
            description="选择"否"将在后续步骤中通过AI挖掘自动生成FAQ"
            :closable="false"
          />
        </div>
      </div>

      <!-- 步骤3：AI挖掘配置 -->
      <div v-show="currentStep === 2" class="step-content">
        <h3>步骤3：AI挖掘配置</h3>

        <el-form-item label="挖掘方式" prop="miningConfig.miningMethod">
          <el-radio-group v-model="formData.miningConfig.miningMethod">
            <el-radio value="SMART_SELECT">智能选取</el-radio>
            <el-radio value="SPECIFY_EMPLOYEES">指定员工</el-radio>
            <el-radio value="MANUAL_UPLOAD">手动上传</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 时间范围 -->
        <el-form-item
          label="时间范围"
          v-if="formData.miningConfig.miningMethod !== 'MANUAL_UPLOAD'"
        >
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="handleDateRangeChange"
          />
        </el-form-item>

        <!-- 指定员工 -->
        <div v-if="formData.miningConfig.miningMethod === 'SPECIFY_EMPLOYEES'">
          <el-form-item label="选择员工">
            <el-select
              v-model="formData.miningConfig.employeeIds"
              multiple
              filterable
              placeholder="选择员工"
              style="width: 100%"
            >
              <!-- 这里需要从后端获取员工列表 -->
              <el-option
                v-for="employee in employeeList"
                :key="employee.id"
                :label="employee.name"
                :value="employee.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 智能选取条件 -->
        <div v-if="formData.miningConfig.miningMethod === 'SMART_SELECT'">
          <el-form-item label="质量级别">
            <el-select
              v-model="formData.miningConfig.smartSelectCriteria.minQualityLevel"
              placeholder="选择质量级别"
              style="width: 200px"
            >
              <el-option label="A 级" value="A" />
              <el-option label="B 级" value="B" />
              <el-option label="C 级" value="C" />
              <el-option label="D 级" value="D" />
            </el-select>
          </el-form-item>

          <el-form-item label="意向度评分">
            <el-input-number
              v-model="formData.miningConfig.smartSelectCriteria.minIntentionScore"
              :min="0"
              :max="100"
              placeholder="最低意向度评分"
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <!-- 挖定条件 -->
        <div v-if="formData.miningConfig.smartSelectCriteria">
          <el-form-item label="包含关键词">
            <el-input
              v-model="includeKeywordsText"
              placeholder="用逗号分隔多个关键词"
              @change="updateKeywords('include')"
            />
          </el-form-item>

          <el-form-item label="排除关键词">
            <el-input
              v-model="excludeKeywordsText"
              placeholder="用逗号分隔多个关键词"
              @change="updateKeywords('exclude')"
            />
          </el-form-item>
        </div>

        <!-- 最大处理数量 -->
        <el-form-item label="最大处理数量">
          <el-input-number
            v-model="formData.miningConfig.maxCount"
            :min="10"
            :max="500"
            placeholder="最大处理记录数"
            style="width: 200px"
          />
        </el-form-item>
      </div>

      <!-- 步骤4：生成结果 -->
      <div v-show="currentStep === 3" class="step-content">
        <h3>步骤4：生成企业知识库</h3>

        <div class="preview-section">
          <h4>配置预览</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="企业信息方式">
              {{ getMethodText(formData.enterpriseInfo.inputMethod) }}
            </el-descriptions-item>
            <el-descriptions-item label="FAQ数据">
              {{ formData.customerFAQ.hasExistingFAQ ? '有现有数据' : '将自动生成' }}
            </el-descriptions-item>
            <el-descriptions-item label="挖掘方式">
              {{ getMiningMethodText(formData.miningConfig.miningMethod) }}
            </elights-descriptions-item>
            <el-descriptions-item label="预计处理量">
              {{ getEstimatedCount() }} 条记录
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="action-section">
          <el-button @click="prevStep">上一步</el-button>
          <el-button
            type="primary"
            :loading="creating"
            @click="submitForm"
          >
            {{ creating ? '正在创建...' : '开始创建' }}
          </el-button>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="form-actions" v-show="currentStep < 3">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button
          type="primary"
          @click="nextStep"
          :disabled="!canGoNext"
        >
          {{ currentStep === 2 ? '开始创建' : '下一步' }}
        </el-button>
      </div>
    </el-form>

    <!-- 创建结果对话框 -->
    <el-dialog
      v-model="showResultDialog"
      title="知识库创建结果"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="creationResult" class="result-content">
        <el-result
          :icon="creationResult.success ? 'success' : 'error'"
          :title="creationResult.success ? '创建成功' : '创建失败'"
          :sub-title="creationResult.message"
        >
          <template #extra v-if="creationResult.success && creationResult.result">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="企业ID">
                {{ creationResult.result.enterpriseId }}
              </el-descriptions-item>
              <el-descriptions-item label="总知识条目">
                {{ creationResult.result.knowledgeBase.totalKnowledge }}
              </el-descriptions-item>
              <el-descriptions-item label="基础信息">
                {{ creationResult.result.knowledgeBase.basicInfoCount }} 条
              </el-descriptions-item>
              <el-descriptions-item label="客户FAQ">
                {{ creationResult.result.knowledgeBase.customerFAQCount }} 条
              </el-descriptions-item>
              <el-descriptions-item label="AI挖掘">
                {{ creationResult.result.knowledgeBase.minedKnowledgeCount }} 条
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-result>
      </div>

      <template #footer>
        <el-button @click="showResultDialog = false">关闭</el-button>
        <el-button
          v-if="creationResult.success"
          type="primary"
          @click="goToKnowledgeManagement"
        >
          查看知识库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { enterpriseKnowledgeApi } from '@/api/enterprise-knowledge'
import { UploadFilled, Delete, Plus } from '@element-plus/icons-vue'

const router = useRouter()

// 表单引用
const formRef = ref()

// 当前步骤
const currentStep = ref(0)

// 表单数据
const formData = reactive({
  enterpriseInfo: {
    inputMethod: 'MANUAL',
    companyName: '',
    industry: '',
    manualContent: '',
    uploadedFiles: [],
  },
  customerFAQ: {
    hasExistingFAQ: false,
    faqData: [
      { question: '', answer: '', category: '' },
    ],
  },
  miningConfig: {
    miningMethod: 'SMART_SELECT',
    dateRange: null,
    employeeIds: [],
    maxCount: 100,
    smartSelectCriteria: {
      minQualityLevel: 'B',
      minIntentionScore: 60,
      includeKeywords: [],
      excludeKeywords: [],
    },
  },
})

// 文件列表
const fileList = ref([])

// 员工列表（模拟数据）
const employeeList = ref([
  { id: 1, name: '张三', department: '销售部' },
  { id: 2, name: '李四', department: '市场部' },
  {  id: 3, name: '王五', department: '教学部' },
])

// 日期范围
const dateRange = ref([])

// 关键词文本
const includeKeywordsText = ref('')
const excludeKeywordsText = ref('')

// 创建状态
const creating = ref(false)
const showResultDialog = ref(false)
const creationResult = ref<any>(null)

// 计算属性
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 0:
      return validateStep1()
    case 1:
      return true // FAQ步骤总是可以继续
    case 2:
      return validateStep2()
    default:
      return false
  }
})

const getEstimatedCount = () => {
  if (formData.miningConfig.miningMethod === 'MANUAL_UPLOAD') {
    return formData.miningConfig.maxCount
  }
  return formData.miningConfig.maxCount
}

// 表单验证规则
const formRules = {
  enterpriseInfo: {
    inputMethod: [
      { required: true, message: '请选择输入方式', trigger: 'change' }
    ],
    companyName: [
      { required: true, message: '请输入企业名称', trigger: 'blur' }
    ],
    industry: [
      { required: true, message: '请选择行业类型', trigger: 'change' }
    ],
    manualContent: [
      { required: true, message: '请输入企业信息', trigger: 'blur' }
    ],
  },
  miningConfig: {
    miningMethod: [
      { required: true, message: '请选择挖掘方式', trigger: 'change' }
    ],
    maxCount: [
      { required: true, message: '请输入最大处理数量', trigger: 'blur' }
    ],
  },
}

// 方法
const validateStep1 = () => {
  const { enterpriseInfo } = formData
  if (enterpriseInfo.inputMethod === 'MANUAL') {
    return !!enterpriseInfo.manualContent.trim()
  } else if (enterpriseInfo.inputMethod === 'FILE_UPLOAD') {
    return fileList.value.length > 0
  } else if (enterpriseInfo.inputMethod === 'AI_ASSIST') {
    return !!enterpriseInfo.companyName.trim() && !!enterpriseInfo.industry
  }
  return false
}

const validateStep2 = () => {
  if (formData.miningConfig.miningMethod === 'SMART_SELECT') {
    return true
  } else if (formData.miningConfig.miningMethod === 'SPECIFY_EMPLOYEES') {
      return formData.miningConfig.employeeIds.length > 0
  } else if (formData.miningConfig.miningMethod === 'MANUAL_UPLOAD') {
      return true
    }
    return false
}

const getMethodText = (method: string) => {
  const methodMap = {
    'MANUAL': '手动输入',
    'FILE_UPLOAD': '文件上传',
    'AI_ASSIST': 'AI帮写',
  }
  return methodMap[method] || method
}

const getMiningMethodText = (method: string) => {
  const methodMap = {
    'SMART_SELECT': '智能选取',
    'SPECIFY_EMPLOYEES': '指定员工',
    'MANUAL_UPLOAD': '手动上传',
  }
  return methodMap[method] || method
}

const handleFileChange = (file: any, fileList: any[]) => {
  formData.enterpriseInfo.uploadedFiles = fileList
}

const handleDateRangeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    formData.miningConfig.dateRange = {
      startDate: dates[0],
      endDate: dates[1],
    }
  }
}

const updateKeywords = (type: 'include' | 'exclude') => {
  const text = type === 'include' ? includeKeywordsText.value : excludeKeywordsText.value
  const keywords = text.split(',').map(k => k.trim()).filter(k => k)
  formData.miningConfig.smartSelectCriteria[type + 'Keywords'] = keywords
}

const addFAQ = () => {
  formData.customerFAQ.faqData.push({ question: '', answer: '', category: '' })
}

const removeFAQ = (index: number) => {
  formData.customerFAQ.faqData.splice(index, 1)
}

const nextStep = () => {
  if (canGoNext.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitForm = async () => {
  creating.value = true
  try {
    const result = await enterpriseKnowledgeApi.create({
      enterpriseInfo: formData.enterpriseInfo,
      customerFAQ: formData.customerFAQ,
      miningConfig: formData.miningConfig,
    })

    creationResult.value = result.data
    showResultDialog.value = true

    if (result.success) {
      ElMessage.success('知识库创建成功')
    }
  } catch (error) {
    creationResult.value = {
      success: false,
      message: error.response?.data?.message || '创建失败',
      result: null,
    }
    showResultDialog.value = true
    ElMessage.error('知识库创建失败')
  } finally {
    creating.value = false
  }
}

const goToKnowledgeManagement = () => {
  router.push('/ai/enterprise-knowledge/management')
}

onMounted(() => {
  // 可以在这里初始化一些数据
})
</script>

<style lang="scss" scoped>
.create-knowledge-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .step-content {
    margin-top: 20px;
    padding: 30px;
    background: #f9f9f9;
    border-radius: 8px;
    min-height: 400px;

    h3 {
      margin-bottom: 20px;
      color: #303133;
    }
  }

  .form-actions {
    margin-top: 30px;
    text-align: center;

    .el-button {
      margin: 0 10px;
    }
  }

  .upload-demo {
    width: 100%;
  }

  .faq-list {
    .faq-item {
      margin-bottom: 15px;
      padding: 15px;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
    }
  }

  .preview-section {
    margin-bottom: 30px;

    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }

  .action-section {
    text-align: center;

    .el-button {
      margin: 0 10px;
    }
  }

  .result-content {
    .el-descriptions {
      margin-top: 20px;
    }
  }
}
</style>