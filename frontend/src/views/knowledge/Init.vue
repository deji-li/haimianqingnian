<template>
  <div class="knowledge-init-container">
    <el-card class="init-card">
      <template #header>
        <div class="card-header">
          <h2>企业知识库初始化</h2>
          <p class="subtitle">欢迎使用智能知识库系统，让我们开始4步快速配置</p>
        </div>
      </template>

      <!-- 步骤条 -->
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="基本信息" description="填写企业基本信息" />
        <el-step title="业务信息" description="配置业务相关信息" />
        <el-step title="知识库初始化" description="导入行业问题库" />
        <el-step title="完成" description="初始化完成" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 第1步：基本信息 -->
        <div v-show="activeStep === 0" class="step-form">
          <el-form
            ref="step1FormRef"
            :model="step1Form"
            :rules="step1Rules"
            label-width="120px"
          >
            <el-form-item label="企业名称" prop="companyName">
              <el-input
                v-model="step1Form.companyName"
                placeholder="请输入企业全称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="所属行业" prop="industry">
              <el-select
                v-model="step1Form.industry"
                placeholder="请选择所属行业"
                style="width: 100%"
              >
                <el-option label="教育培训" value="教育培训" />
                <el-option label="金融" value="金融" />
                <el-option label="医疗" value="医疗" />
                <el-option label="零售" value="零售" />
                <el-option label="IT/软件" value="IT/软件" />
                <el-option label="房地产" value="房地产" />
                <el-option label="制造业" value="制造业" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>

            <el-form-item label="企业规模" prop="companySize">
              <el-radio-group v-model="step1Form.companySize">
                <el-radio label="1-50人">1-50人</el-radio>
                <el-radio label="50-200人">50-200人</el-radio>
                <el-radio label="200-500人">200-500人</el-radio>
                <el-radio label="500人以上">500人以上</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="联系人" prop="contactPerson">
              <el-input
                v-model="step1Form.contactPerson"
                placeholder="请输入联系人姓名"
              />
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="step1Form.contactPhone"
                placeholder="请输入联系电话"
                maxlength="11"
              />
            </el-form-item>

            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input
                v-model="step1Form.contactEmail"
                placeholder="请输入联系邮箱"
                type="email"
              />
            </el-form-item>

            <el-form-item label="企业地址" prop="address">
              <el-input
                v-model="step1Form.address"
                type="textarea"
                placeholder="请输入企业详细地址"
                :rows="3"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 第2步：业务信息 -->
        <div v-show="activeStep === 1" class="step-form">
          <el-form
            ref="step2FormRef"
            :model="step2Form"
            :rules="step2Rules"
            label-width="120px"
          >
            <el-form-item label="主营产品" prop="mainProducts">
              <el-select
                v-model="step2Form.mainProducts"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入主营产品/服务"
                style="width: 100%"
              >
                <el-option label="一对一辅导" value="一对一辅导" />
                <el-option label="小班课程" value="小班课程" />
                <el-option label="在线课程" value="在线课程" />
                <el-option label="集训营" value="集训营" />
                <el-option label="素质教育" value="素质教育" />
              </el-select>
              <div class="form-tip">可多选，也可以自定义输入</div>
            </el-form-item>

            <el-form-item label="客户类型" prop="customerTypes">
              <el-select
                v-model="step2Form.customerTypes"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入主要客户类型"
                style="width: 100%"
              >
                <el-option label="K12学生家长" value="K12学生家长" />
                <el-option label="成人学员" value="成人学员" />
                <el-option label="企业客户" value="企业客户" />
                <el-option label="潜在客户" value="潜在客户" />
                <el-option label="现有客户" value="现有客户" />
              </el-select>
              <div class="form-tip">可多选，也可以自定义输入</div>
            </el-form-item>

            <el-form-item label="业务模式" prop="businessModel">
              <el-radio-group v-model="step2Form.businessModel">
                <el-radio label="线下教学">线下教学</el-radio>
                <el-radio label="线上教学">线上教学</el-radio>
                <el-radio label="线上线下结合">线上线下结合</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="市场定位" prop="marketPosition">
              <el-input
                v-model="step2Form.marketPosition"
                type="textarea"
                placeholder="请简要描述您的市场定位（如：高端K12培训、在线职业教育等）"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="竞争优势" prop="competitiveAdvantages">
              <el-select
                v-model="step2Form.competitiveAdvantages"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入核心竞争优势"
                style="width: 100%"
              >
                <el-option label="师资力量强" value="师资力量强" />
                <el-option label="教学效果好" value="教学效果好" />
                <el-option label="性价比高" value="性价比高" />
                <el-option label="服务贴心" value="服务贴心" />
                <el-option label="品牌知名度高" value="品牌知名度高" />
              </el-select>
              <div class="form-tip">可多选，也可以自定义输入</div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 第3步：知识库初始化 -->
        <div v-show="activeStep === 2" class="step-form">
          <div class="init-tip">
            <el-alert
              title="知识库初始化说明"
              type="info"
              :closable="false"
              show-icon
            >
              我们会根据您的行业，自动导入相关的常见问题和答案到知识库，帮助您快速启动。您也可以稍后手动添加或修改。
            </el-alert>
          </div>

          <el-form
            ref="step3FormRef"
            :model="step3Form"
            label-width="120px"
            style="margin-top: 20px"
          >
            <el-form-item label="选择行业">
              <el-checkbox-group v-model="step3Form.selectedIndustries">
                <el-checkbox label="教育培训">教育培训（100+条问题）</el-checkbox>
                <el-checkbox label="金融">金融（50+条问题）</el-checkbox>
                <el-checkbox label="医疗">医疗（50+条问题）</el-checkbox>
                <el-checkbox label="零售">零售（50+条问题）</el-checkbox>
                <el-checkbox label="IT/软件">IT/软件（50+条问题）</el-checkbox>
              </el-checkbox-group>
              <div class="form-tip">建议选择与您业务相关的行业问题库</div>
            </el-form-item>

            <el-form-item label="自动导入">
              <el-switch
                v-model="step3Form.autoImport"
                active-text="自动导入选中的行业问题"
                inactive-text="稍后手动导入"
              />
              <div class="form-tip">
                开启后将自动导入选中行业的常见问题到知识库
              </div>
            </el-form-item>

            <el-form-item v-if="step3Form.selectedIndustries.length > 0">
              <div class="selected-summary">
                <el-icon><InfoFilled /></el-icon>
                已选择 {{ step3Form.selectedIndustries.length }} 个行业，
                预计导入约 {{ estimatedCount }} 条知识
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 第4步：完成 -->
        <div v-show="activeStep === 3" class="step-form completion-step">
          <el-result
            icon="success"
            title="初始化完成！"
            sub-title="企业知识库已成功初始化，您可以开始使用了"
          >
            <template #extra>
              <div class="completion-stats">
                <el-statistic title="导入知识数量" :value="importedCount" />
                <el-statistic title="可用场景" :value="8" suffix="个" />
                <el-statistic title="AI配置" :value="8" suffix="项" />
              </div>

              <div class="next-steps">
                <h3>接下来您可以：</h3>
                <ul>
                  <li>
                    <el-icon><EditPen /></el-icon>
                    <router-link to="/knowledge/list">管理知识库</router-link>
                    - 查看、编辑已导入的知识
                  </li>
                  <li>
                    <el-icon><Search /></el-icon>
                    <router-link to="/knowledge/search">智能搜索</router-link>
                    - 体验AI语义搜索功能
                  </li>
                  <li>
                    <el-icon><Promotion /></el-icon>
                    <router-link to="/knowledge/mining">AI知识挖掘</router-link>
                    - 从聊天记录自动挖掘知识
                  </li>
                  <li>
                    <el-icon><DataAnalysis /></el-icon>
                    <router-link to="/knowledge/statistics">使用统计</router-link>
                    - 查看知识库使用情况
                  </li>
                </ul>
              </div>

              <el-button type="primary" size="large" @click="goToKnowledgeList">
                进入知识库管理
              </el-button>
            </template>
          </el-result>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="step-actions">
        <el-button
          v-if="activeStep > 0 && activeStep < 3"
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="activeStep < 2"
          type="primary"
          :loading="loading"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="activeStep === 2"
          type="primary"
          :loading="loading"
          @click="finishInit"
        >
          完成初始化
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, EditPen, Search, Promotion, DataAnalysis } from '@element-plus/icons-vue'
import { initStep1, initStep2, initStep3, getInitStatus } from '@/api/knowledge'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

// 当前步骤
const activeStep = ref(0)
const loading = ref(false)

// 第1步表单
const step1FormRef = ref<FormInstance>()
const step1Form = ref({
  companyName: '',
  industry: '',
  companySize: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: ''
})

const step1Rules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  companySize: [{ required: true, message: '请选择企业规模', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入企业地址', trigger: 'blur' }]
}

// 第2步表单
const step2FormRef = ref<FormInstance>()
const step2Form = ref({
  mainProducts: [] as string[],
  customerTypes: [] as string[],
  businessModel: '线上线下结合',
  marketPosition: '',
  competitiveAdvantages: [] as string[]
})

const step2Rules: FormRules = {
  mainProducts: [{ required: true, message: '请选择主营产品', trigger: 'change' }],
  customerTypes: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  businessModel: [{ required: true, message: '请选择业务模式', trigger: 'change' }]
}

// 第3步表单
const step3FormRef = ref<FormInstance>()
const step3Form = ref({
  selectedIndustries: [] as string[],
  autoImport: true
})

// 预计导入数量
const estimatedCount = computed(() => {
  const counts: Record<string, number> = {
    '教育培训': 100,
    '金融': 50,
    '医疗': 50,
    '零售': 50,
    'IT/软件': 50
  }
  return step3Form.value.selectedIndustries.reduce((sum, industry) => {
    return sum + (counts[industry] || 0)
  }, 0)
})

// 实际导入数量
const importedCount = ref(0)

// 检查初始化状态
const checkInitStatus = async () => {
  try {
    const res = await getInitStatus()
    if (res.data.initialized) {
      ElMessage.warning('企业信息已初始化，正在跳转到知识库管理...')
      setTimeout(() => {
        router.push('/knowledge/list')
      }, 1500)
    }
  } catch (error) {
    console.error('检查初始化状态失败', error)
  }
}

// 上一步
const prevStep = () => {
  activeStep.value--
}

// 下一步
const nextStep = async () => {
  if (activeStep.value === 0) {
    // 验证第1步表单
    if (!step1FormRef.value) return
    const valid = await step1FormRef.value.validate().catch(() => false)
    if (!valid) return

    // 提交第1步数据
    loading.value = true
    try {
      await initStep1(step1Form.value)
      ElMessage.success('基本信息保存成功')
      activeStep.value++
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      loading.value = false
    }
  } else if (activeStep.value === 1) {
    // 验证第2步表单
    if (!step2FormRef.value) return
    const valid = await step2FormRef.value.validate().catch(() => false)
    if (!valid) return

    // 提交第2步数据
    loading.value = true
    try {
      await initStep2(step2Form.value)
      ElMessage.success('业务信息保存成功')
      activeStep.value++
      // 自动选择第1步选择的行业
      if (!step3Form.value.selectedIndustries.includes(step1Form.value.industry)) {
        step3Form.value.selectedIndustries.push(step1Form.value.industry)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      loading.value = false
    }
  }
}

// 完成初始化
const finishInit = async () => {
  loading.value = true
  try {
    // 第3步：导入知识库
    const res = await initStep3(step3Form.value)
    importedCount.value = res.data.importedCount || estimatedCount.value

    ElMessage.success('知识库初始化成功')
    activeStep.value++
  } catch (error: any) {
    ElMessage.error(error.message || '初始化失败')
  } finally {
    loading.value = false
  }
}

// 进入知识库管理
const goToKnowledgeList = () => {
  router.push('/knowledge/list')
}

// 页面加载时检查初始化状态
checkInitStatus()
</script>

<style scoped lang="scss">
.knowledge-init-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);

  .init-card {
    max-width: 1000px;
    margin: 0 auto;

    .card-header {
      text-align: center;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      .subtitle {
        margin: 10px 0 0 0;
        font-size: 14px;
        color: #909399;
      }
    }

    :deep(.el-card__body) {
      padding: 40px;
    }
  }

  .step-content {
    margin-top: 40px;
    min-height: 400px;

    .step-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-tip {
      margin-top: 5px;
      font-size: 12px;
      color: #909399;
    }

    .init-tip {
      margin-bottom: 20px;
    }

    .selected-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #ecf5ff;
      border-radius: 4px;
      color: #409eff;
      font-size: 14px;
    }

    .completion-step {
      max-width: 800px;

      .completion-stats {
        display: flex;
        justify-content: center;
        gap: 60px;
        margin: 30px 0;
      }

      .next-steps {
        margin: 30px 0;
        text-align: left;

        h3 {
          font-size: 16px;
          color: #303133;
          margin-bottom: 15px;
        }

        ul {
          list-style: none;
          padding: 0;

          li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 0;
            font-size: 14px;
            color: #606266;

            .el-icon {
              color: #409eff;
            }

            a {
              color: #409eff;
              text-decoration: none;
              font-weight: 500;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }

  .step-actions {
    margin-top: 40px;
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid #ebeef5;

    .el-button {
      min-width: 120px;
      margin: 0 10px;
    }
  }
}
</style>
