<template>
  <div class="marketing-assistant-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI营销助手</h2>
          <p class="subtitle">AI大模型已帮您搜寻客户痛点的痛点，需求与兴趣点，基于这些帮您智造营销文案，瞬间唤起兴趣点，深度激发兴趣，让客户主动想您</p>
        </div>
        <div>
          <el-button @click="goToLibrary">
            <el-icon><DocumentCopy /></el-icon>
            文案库
          </el-button>
          <el-button @click="showHistoryDialog = true">
            <el-icon><Clock /></el-icon>
            历史记录
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧：选择场景 -->
      <el-col :span="6">
        <el-card class="scene-card">
          <h3>选择场景</h3>
          <div class="scene-list">
            <div
              v-for="scene in scenes"
              :key="scene.type"
              class="scene-item"
              :class="{ active: selectedScene === scene.type }"
              @click="selectedScene = scene.type"
            >
              <div class="scene-icon" :style="{ backgroundColor: scene.color }">
                <el-icon :size="24">
                  <component :is="scene.icon" />
                </el-icon>
              </div>
              <div class="scene-info">
                <div class="scene-title">{{ scene.title }}</div>
                <div class="scene-desc">{{ scene.description }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 中间：生成配置 -->
      <el-col :span="9">
        <el-card class="config-card">
          <h3>结合<span class="highlight">客户痛点</span>生成文案</h3>

          <!-- 客户选择区域 -->
          <div class="customer-section">
            <div class="customer-select">
              <el-select
                v-model="selectedCustomerId"
                filterable
                remote
                reserve-keyword
                placeholder="搜索客户（支持姓名、手机号）"
                :remote-method="searchCustomers"
                :loading="customerSearchLoading"
                style="width: 100%"
                @change="handleCustomerChange"
                clearable
              >
                <el-option
                  v-for="customer in customerSearchResults"
                  :key="customer.id"
                  :label="`${customer.name} (${customer.phone})`"
                  :value="customer.id"
                />
              </el-select>
            </div>

            <div v-if="customerInsights" class="customer-insights">
              <div class="insights-header">
                <el-icon><User /></el-icon>
                <span>客户洞察数据</span>
                <el-tag v-if="customerInsights.hasChatRecords" type="success" size="small">
                  已分析聊天记录
                </el-tag>
              </div>

              <div class="insights-content">
                <div v-if="customerInsights.painPoints?.length" class="insight-group">
                  <strong>痛点：</strong>
                  <el-tag
                    v-for="point in customerInsights.painPoints.slice(0, 3)"
                    :key="point"
                    size="small"
                    type="danger"
                    style="margin: 2px"
                  >
                    {{ point }}
                  </el-tag>
                </div>
                <div v-if="customerInsights.needs?.length" class="insight-group">
                  <strong>需求：</strong>
                  <el-tag
                    v-for="need in customerInsights.needs.slice(0, 3)"
                    :key="need"
                    size="small"
                    type="warning"
                    style="margin: 2px"
                  >
                    {{ need }}
                  </el-tag>
                </div>
                <div v-if="customerInsights.interests?.length" class="insight-group">
                  <strong>兴趣：</strong>
                  <el-tag
                    v-for="interest in customerInsights.interests.slice(0, 3)"
                    :key="interest"
                    size="small"
                    type="primary"
                    style="margin: 2px"
                  >
                    {{ interest }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 手动配置区域 -->
          <div class="manual-config-section">
            <div class="section-header">
              <span>手动补充配置</span>
              <el-switch
                v-model="showManualConfig"
                active-text="展开"
                inactive-text="收起"
              />
            </div>

            <div v-show="showManualConfig">
              <el-tabs v-model="activeTab">
                <el-tab-pane label="客户痛点" name="painPoints">
                  <el-table
                    :data="painPoints"
                    max-height="200"
                    @selection-change="handlePainPointsSelect"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="content" label="客户痛点" />
                    <el-table-column prop="count" label="提及客户数" width="100" />
                  </el-table>
                </el-tab-pane>

                <el-tab-pane label="客户需求" name="needs">
                  <el-table
                    :data="needs"
                    max-height="200"
                    @selection-change="handleNeedsSelect"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="content" label="客户需求" />
                    <el-table-column prop="count" label="提及客户数" width="100" />
                  </el-table>
                </el-tab-pane>

                <el-tab-pane label="客户兴趣点" name="interests">
                  <el-table
                    :data="interests"
                    max-height="200"
                    @selection-change="handleInterestsSelect"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="content" label="客户兴趣点" />
                    <el-table-column prop="count" label="提及客户数" width="100" />
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <el-divider />

          <el-form :model="configForm" label-width="100px">
            <el-form-item label="发圈目的">
              <el-select v-model="configForm.purpose" placeholder="请选择" style="width: 100%">
                <el-option label="引流获客" value="引流获客" />
                <el-option label="促进成交" value="促进成交" />
                <el-option label="品牌宣传" value="品牌宣传" />
                <el-option label="活动推广" value="活动推广" />
                <el-option label="客户维护" value="客户维护" />
              </el-select>
            </el-form-item>

            <el-form-item label="风格要求">
              <el-select v-model="configForm.style" placeholder="请选择" style="width: 100%">
                <el-option label="正常" value="正常" />
                <el-option label="幽默" value="幽默" />
                <el-option label="深情" value="深情" />
                <el-option label="热情" value="热情" />
                <el-option label="急迫" value="急迫" />
                <el-option label="深沉" value="深沉" />
                <el-option label="亲切" value="亲切" />
                <el-option label="共情" value="共情" />
                <el-option label="说服" value="说服" />
                <el-option label="鼓励" value="鼓励" />
                <el-option label="崇敬" value="崇敬" />
                <el-option label="专业严谨" value="专业严谨" />
              </el-select>
            </el-form-item>

            <el-form-item label="字数要求">
              <el-select v-model="configForm.wordCount" placeholder="请选择" style="width: 100%">
                <el-option label="50字以内" value="50字以内" />
                <el-option label="50-100字" value="50-100字" />
                <el-option label="100-200字" value="100-200字" />
                <el-option label="200-500字" value="200-500字" />
                <el-option label="500字以上" value="500字以上" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-button
            type="primary"
            @click="handleGenerate"
            :loading="generating"
            style="width: 100%"
            size="large"
          >
            <el-icon><MagicStick /></el-icon>
            立即生成文案
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧：生成结果 -->
      <el-col :span="9">
        <el-card class="result-card">
          <h3>生成文案</h3>

          <div v-if="generatedContent" class="result-content">
            <!-- 质量评分和知识库引用 -->
            <div v-if="generationResult" class="result-meta">
              <div class="quality-score">
                <el-tooltip content="AI内容质量评分" placement="top">
                  <div class="score-display">
                    <span>质量评分：</span>
                    <el-rate
                      v-model="generationResult.qualityScore"
                      disabled
                      :max="5"
                      :colors="['#F56C6C', '#E6A23C', '#67C23A']"
                      size="small"
                    />
                    <span class="score-text">{{ generationResult.qualityScore?.toFixed(1) || '0.0' }}</span>
                  </div>
                </el-tooltip>
              </div>

              <div v-if="generationResult.knowledgeReferences?.length" class="knowledge-refs">
                <el-tooltip content="企业知识库引用" placement="top">
                  <div class="refs-display">
                    <el-icon><Reading /></el-icon>
                    <span>知识库引用：{{ generationResult.knowledgeReferences.length }}条</span>
                    <el-button
                      type="text"
                      size="small"
                      @click="showKnowledgeRefs = !showKnowledgeRefs"
                    >
                      {{ showKnowledgeRefs ? '收起' : '展开' }}
                    </el-button>
                  </div>
                </el-tooltip>

                <div v-show="showKnowledgeRefs" class="knowledge-list">
                  <el-tag
                    v-for="ref in generationResult.knowledgeReferences"
                    :key="ref.id"
                    size="small"
                    type="success"
                    style="margin: 2px"
                  >
                    {{ ref.title }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="content-text">{{ generatedContent }}</div>

            <el-divider />

            <div class="content-actions">
              <el-button @click="copyContent">
                <el-icon><DocumentCopy /></el-icon>
                复制文案
              </el-button>
              <el-button @click="regenerate">
                <el-icon><Refresh /></el-icon>
                重新生成
              </el-button>
              <el-button type="primary" @click="saveToLibrary">
                <el-icon><FolderAdd /></el-icon>
                保存到文案库
              </el-button>

              <!-- 知识库反哺按钮 -->
              <el-button
                v-if="generationResult?.qualityScore >= 3.5"
                type="success"
                @click="feedbackToKnowledge"
                :loading="feedbackLoading"
              >
                <el-icon><Upload /></el-icon>
                {{ feedbackToKnowledgeText }}
              </el-button>
            </div>

            <!-- 反哺状态提示 -->
            <div v-if="feedbackStatus" class="feedback-status">
              <el-alert
                :title="feedbackStatus.title"
                :type="feedbackStatus.type"
                :closable="false"
                show-icon
              >
                {{ feedbackStatus.message }}
              </el-alert>
            </div>
          </div>

          <el-empty v-else description="生成的文案将会显示在这里" :image-size="120">
            <div class="empty-icon">
              <el-icon :size="80" color="#d0d0d0"><MagicStick /></el-icon>
            </div>
          </el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 历史记录对话框 -->
    <el-dialog v-model="showHistoryDialog" title="历史记录" width="800px">
      <el-empty description="暂无历史记录" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  DocumentCopy,
  Clock,
  ChatDotRound,
  Picture,
  VideoCamera,
  Edit,
  Postcard,
  Notebook,
  Refresh,
  FolderAdd,
  User,
  Reading,
  Upload,
} from '@element-plus/icons-vue'
import {
  generateMarketingContent,
  saveMarketingContent,
  getCustomerInsights,
  feedbackContentToKnowledge,
  getMarketingHistory
} from '@/api/ai'
import { searchCustomers as searchCustomersApi } from '@/api/customer'

const router = useRouter()

// 基础状态
const selectedScene = ref('朋友圈文案')
const activeTab = ref('painPoints')
const generating = ref(false)
const generatedContent = ref('')
const generationResult = ref(null)
const showHistoryDialog = ref(false)

// 客户数据状态
const selectedCustomerId = ref(null)
const customerSearchResults = ref([])
const customerSearchLoading = ref(false)
const customerInsights = ref(null)
const showManualConfig = ref(false)

// 知识库相关状态
const showKnowledgeRefs = ref(false)
const feedbackLoading = ref(false)
const feedbackToKnowledgeText = ref('反哺到知识库')
const feedbackStatus = ref(null)

// 场景数据 - 更新为6个标准场景
const scenes = [
  {
    type: 'marketing_moments',
    title: '朋友圈文案',
    description: '根据发圈目的，撰写有吸引力的朋友圈文案',
    icon: ChatDotRound,
    color: '#67C23A',
  },
  {
    type: 'marketing_wechat',
    title: '微信群发文案',
    description: '精准定位用户需求，撰写引人入胜的微信群发文案',
    icon: DocumentCopy,
    color: '#409EFF',
  },
  {
    type: 'marketing_douyin',
    title: '抖音营销文案',
    description: '根据引人注目的抖音短视频文案，提高用户点击率的吸睛文案',
    icon: VideoCamera,
    color: '#F56C6C',
  },
  {
    type: 'marketing_xiaohongshu',
    title: '小红书营销文案',
    description: '在小红书上讲述品牌故事，通过用户共鸣和共感场景吸引读者',
    icon: Picture,
    color: '#E6A23C',
  },
  {
    type: 'marketing_video_script',
    title: '短视频拍摄脚本',
    description: '根据拍摄需求，提供视频剧本的视频拍摄脚本',
    icon: Edit,
    color: '#909399',
  },
  {
    type: 'marketing_official',
    title: '公众号推文',
    description: '创作符合公众号营销风格的推文，提高阅读量和转化',
    icon: Notebook,
    color: '#606266',
  },
]

// 手动配置数据
const painPoints = ref([
  { content: '时间紧张，无法兼顾工作和学习', count: 12 },
  { content: '担心教学质量，怕花钱学不到东西', count: 8 },
  { content: '课程价格偏高，超出预算', count: 6 },
  { content: '对课程内容不了解，不知道是否适合自己', count: 5 },
  { content: '担心学习效果，无法达到预期目标', count: 4 },
])

const needs = ref([
  { content: '灵活的学习时间安排', count: 15 },
  { content: '高质量的课程内容和师资', count: 12 },
  { content: '合理的价格和优惠活动', count: 10 },
  { content: '个性化的学习方案', count: 8 },
  { content: '完善的售后服务和保障', count: 6 },
])

const interests = ref([
  { content: '职业发展和技能提升', count: 18 },
  { content: '兴趣爱好培养', count: 12 },
  { content: '学历提升和证书获取', count: 10 },
  { content: '创业指导和商业思维', count: 8 },
  { content: '行业前沿动态和趋势', count: 6 },
])

const selectedPainPoints = ref([])
const selectedNeeds = ref([])
const selectedInterests = ref([])

const configForm = reactive({
  purpose: '',
  style: '正常',
  wordCount: '',
})

// 客户搜索方法
const searchCustomers = async (query: string) => {
  if (!query) {
    customerSearchResults.value = []
    return
  }

  customerSearchLoading.value = true
  try {
    const res = await searchCustomersApi({ keyword: query, limit: 10 })
    customerSearchResults.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '客户搜索失败')
  } finally {
    customerSearchLoading.value = false
  }
}

// 客户变更处理
const handleCustomerChange = async (customerId: number) => {
  if (!customerId) {
    customerInsights.value = null
    selectedPainPoints.value = []
    selectedNeeds.value = []
    selectedInterests.value = []
    return
  }

  try {
    // 获取客户洞察数据
    const res = await getCustomerInsights(customerId)
    customerInsights.value = res.data

    // 自动填充客户数据到选择框
    if (customerInsights.value?.painPoints?.length > 0) {
      selectedPainPoints.value = customerInsights.value.painPoints.slice(0, 3).map((point: string, index: number) => ({
        content: point,
        count: Math.floor(Math.random() * 10) + 1 // 模拟数据
      }))
    }

    if (customerInsights.value?.needs?.length > 0) {
      selectedNeeds.value = customerInsights.value.needs.slice(0, 3).map((need: string, index: number) => ({
        content: need,
        count: Math.floor(Math.random() * 10) + 1 // 模拟数据
      }))
    }

    if (customerInsights.value?.interests?.length > 0) {
      selectedInterests.value = customerInsights.value.interests.slice(0, 3).map((interest: string, index: number) => ({
        content: interest,
        count: Math.floor(Math.random() * 10) + 1 // 模拟数据
      }))
    }

    ElMessage.success('客户数据已自动加载')
  } catch (error: any) {
    console.warn('获取客户洞察失败，使用手动输入模式:', error.message)
  }
}

// 历有的选择处理方法
const handlePainPointsSelect = (selection: any[]) => {
  selectedPainPoints.value = selection
}

const handleNeedsSelect = (selection: any[]) => {
  selectedNeeds.value = selection
}

const handleInterestsSelect = (selection: any[]) => {
  selectedInterests.value = selection
}

// 生成营销文案
const handleGenerate = async () => {
  generating.value = true
  feedbackStatus.value = null

  try {
    const requestData: any = {
      scenario: selectedScene.value,
      purpose: configForm.purpose || '推广营销',
      style: configForm.style || '正常',
      wordCount: configForm.wordCount || '100-200字',
      customerId: selectedCustomerId.value,
    }

    // 组合痛点、需求、兴趣点数据
    const allPainPoints = [
      ...selectedPainPoints.value.map(p => p.content),
      ...(customerInsights.value?.painPoints || [])
    ].slice(0, 5)

    const allNeeds = [
      ...selectedNeeds.value.map(n => n.content),
      ...(customerInsights.value?.needs || [])
    ].slice(0, 5)

    const allInterests = [
      ...selectedInterests.value.map(i => i.content),
      ...(customerInsights.value?.interests || [])
    ].slice(0, 5)

    if (allPainPoints.length > 0) requestData.painPoints = allPainPoints
    if (allNeeds.length > 0) requestData.needs = allNeeds
    if (allInterests.length > 0) requestData.interests = allInterests

    const res = await generateMarketingContent(requestData)
    generatedContent.value = res.content
    generationResult.value = res

    ElMessage.success('文案生成成功')
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    generating.value = false
  }
}

// 复制文案
const copyContent = () => {
  navigator.clipboard.writeText(generatedContent.value)
  ElMessage.success('已复制到剪贴板')
}

// 重新生成
const regenerate = () => {
  handleGenerate()
}

// 前往文案库
const goToLibrary = () => {
  router.push('/ai-marketing/content-library')
}

// 保存到文案库
const saveToLibrary = async () => {
  if (!generatedContent.value) {
    ElMessage.warning('请先生成文案')
    return
  }

  try {
    await saveMarketingContent({
      contentType: selectedScene.value,
      title: `${scenes.find(s => s.type === selectedScene.value)?.title} - ${new Date().toLocaleDateString()}`,
      content: generatedContent.value,
      painPoints: selectedPainPoints.value.map((p: any) => p.content),
      interestPoints: selectedInterests.value.map((i: any) => i.content),
      purpose: configForm.purpose,
      style: configForm.style,
      wordCount: configForm.wordCount,
    })
    ElMessage.success('已保存到文案库')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 反哺到知识库
const feedbackToKnowledge = async () => {
  if (!generatedContent.value || !generationResult.value) {
    ElMessage.warning('请先生成文案')
    return
  }

  feedbackLoading.value = true
  try {
    const res = await feedbackContentToKnowledge(generationResult.value.historyId)

    feedbackStatus.value = {
      title: '反哺成功',
      type: 'success',
      message: res.message || '内容已提交至知识库审核'
    }

    feedbackToKnowledgeText.value = '已提交审核'

    setTimeout(() => {
      feedbackStatus.value = null
    }, 3000)
  } catch (error: any) {
    feedbackStatus.value = {
      title: '反哺失败',
      type: 'error',
      message: error.message || '提交失败，请稍后重试'
    }
  } finally {
    feedbackLoading.value = false
  }
}

// 组件挂载时获取历史数据
onMounted(async () => {
  try {
    // 可以加载一些初始化数据
  } catch (error) {
    console.error('初始化数据加载失败:', error)
  }
})
</script>

<style scoped lang="scss">
.marketing-assistant-container {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
      }

      .subtitle {
        margin: 5px 0 0;
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .scene-card {
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .scene-list {
      .scene-item {
        display: flex;
        align-items: flex-start;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid #EBEEF5;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #409EFF;
          background: #F5F7FA;
        }

        &.active {
          border-color: #409EFF;
          background: #ECF5FF;
        }

        .scene-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .scene-info {
          flex: 1;

          .scene-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .scene-desc {
            font-size: 12px;
            color: #909399;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .config-card {
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;

      .highlight {
        color: #409EFF;
      }
    }

    .hint-text {
      text-align: center;
      padding: 20px;
      color: #909399;
      font-size: 13px;
    }

    // 客户选择区域样式
    .customer-section {
      margin-bottom: 16px;

      .customer-select {
        margin-bottom: 12px;
      }

      .customer-insights {
        background: #F8F9FA;
        border: 1px solid #E9ECEF;
        border-radius: 6px;
        padding: 12px;

        .insights-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 500;
          color: #495057;

          .el-icon {
            margin-right: 6px;
            color: #409EFF;
          }

          .el-tag {
            margin-left: auto;
          }
        }

        .insights-content {
          .insight-group {
            margin-bottom: 6px;
            font-size: 13px;

            strong {
              color: #495057;
              margin-right: 6px;
            }

            .el-tag {
              margin-right: 4px;
              margin-bottom: 4px;
            }
          }
        }
      }
    }

    // 手动配置区域样式
    .manual-config-section {
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        font-weight: 500;
        color: #495057;
      }
    }
  }

  .result-card {
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .result-content {
      min-height: 400px;

      // 结果元信息区域
      .result-meta {
        margin-bottom: 16px;

        .quality-score {
          margin-bottom: 12px;

          .score-display {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #606266;

            span {
              margin-right: 8px;
            }

            .score-text {
              margin-left: 8px;
              font-weight: 500;
              color: #409EFF;
            }
          }
        }

        .knowledge-refs {
          .refs-display {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #606266;
            cursor: pointer;
            padding: 6px 8px;
            background: #F0F9FF;
            border: 1px solid #BFDBFE;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
              background: #E0F2FE;
              border-color: #93C5FD;
            }

            .el-icon {
              margin-right: 6px;
              color: #3B82F6;
            }

            span {
              margin-right: 8px;
            }

            .el-button {
              margin-left: auto;
              padding: 0;
            }
          }

          .knowledge-list {
            margin-top: 8px;
            padding: 8px;
            background: #F8FAFC;
            border-radius: 4px;
            border: 1px solid #E2E8F0;
          }
        }
      }

      .content-text {
        white-space: pre-wrap;
        line-height: 1.8;
        font-size: 14px;
        padding: 16px;
        background: #F5F7FA;
        border-radius: 4px;
        min-height: 300px;
      }

      .content-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        align-items: center;

        .el-button {
          flex: 0 0 auto;
          min-width: 120px;
        }
      }

      // 反哺状态样式
      .feedback-status {
        margin-top: 12px;

        .el-alert {
          font-size: 13px;
        }
      }
    }

    .empty-icon {
      margin-bottom: 20px;
    }
  }
}
</style>
