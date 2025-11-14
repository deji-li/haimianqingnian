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

          <el-tabs v-model="activeTab">
            <el-tab-pane label="客户痛点" name="painPoints">
              <div class="hint-text">请与客户多沟通，我们会在此为您展示客户痛点</div>
              <el-table
                :data="painPoints"
                max-height="200"
                @selection-change="handlePainPointsSelect"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="rank" label="排行" width="80" />
                <el-table-column prop="content" label="客户痛点" />
                <el-table-column prop="count" label="提及客户数" width="100" />
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="客户需求" name="needs">
              <div class="hint-text">请与客户多沟通，我们会在此为您展示客户需求</div>
              <el-table
                :data="needs"
                max-height="200"
                @selection-change="handleNeedsSelect"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="rank" label="排行" width="80" />
                <el-table-column prop="content" label="客户需求" />
                <el-table-column prop="count" label="提及客户数" width="100" />
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="客户兴趣点" name="interests">
              <div class="hint-text">请与客户多沟通，我们会在此为您展示客户兴趣点</div>
              <el-table
                :data="interests"
                max-height="200"
                @selection-change="handleInterestsSelect"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="rank" label="排行" width="80" />
                <el-table-column prop="content" label="客户兴趣点" />
                <el-table-column prop="count" label="提及客户数" width="100" />
              </el-table>
            </el-tab-pane>
          </el-tabs>

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
                <el-option label="专业严谨" value="专业严谨" />
                <el-option label="轻松幽默" value="轻松幽默" />
                <el-option label="温馨亲切" value="温馨亲切" />
                <el-option label="激情澎湃" value="激情澎湃" />
                <el-option label="简洁直接" value="简洁直接" />
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
import { ref, reactive } from 'vue'
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
} from '@element-plus/icons-vue'
import { generateMarketingContent, saveMarketingContent } from '@/api/ai'

const router = useRouter()

const selectedScene = ref('朋友圈文案')
const activeTab = ref('painPoints')
const generating = ref(false)
const generatedContent = ref('')
const showHistoryDialog = ref(false)

const scenes = [
  {
    type: '朋友圈文案',
    title: '朋友圈文案',
    description: '根据发圈目的，撰写有吸引力的朋友圈文案',
    icon: ChatDotRound,
    color: '#67C23A',
  },
  {
    type: '微信群发文案',
    title: '微信群发文案',
    description: '精准定位用户需求，撰写引人入胜的微信群发文案',
    icon: DocumentCopy,
    color: '#409EFF',
  },
  {
    type: '抖音营销文案',
    title: '抖音营销文案',
    description: '根据引人注目的抖音短视频文案，提高用户点击率的吸睛文案',
    icon: VideoCamera,
    color: '#F56C6C',
  },
  {
    type: '小红书营销文案',
    title: '小红书营销文案',
    description: '在小红书上讲述品牌故事，通过用户共鸣和共感场景吸引读者',
    icon: Picture,
    color: '#E6A23C',
  },
  {
    type: '短视频拍摄脚本',
    title: '短视频拍摄脚本',
    description: '根据拍摄需求，提供视频剧本的视频拍摄脚本',
    icon: Edit,
    color: '#909399',
  },
  {
    type: '公众号推文',
    title: '公众号推文',
    description: '创作符合公众号营销风格的推文，提高阅读量和转化',
    icon: Notebook,
    color: '#606266',
  },
]

const painPoints = ref([])
const needs = ref([])
const interests = ref([])

const selectedPainPoints = ref([])
const selectedNeeds = ref([])
const selectedInterests = ref([])

const configForm = reactive({
  purpose: '',
  style: '',
  wordCount: '',
})

const handlePainPointsSelect = (selection: any[]) => {
  selectedPainPoints.value = selection
}

const handleNeedsSelect = (selection: any[]) => {
  selectedNeeds.value = selection
}

const handleInterestsSelect = (selection: any[]) => {
  selectedInterests.value = selection
}

const handleGenerate = async () => {
  generating.value = true
  try {
    const res = await generateMarketingContent({
      contentType: selectedScene.value,
      customerPainPoints: selectedPainPoints.value.map((p: any) => p.content),
      customerNeeds: selectedNeeds.value.map((n: any) => n.content),
      customerInterests: selectedInterests.value.map((i: any) => i.content),
      purpose: configForm.purpose,
      style: configForm.style,
      wordCount: configForm.wordCount,
    })
    generatedContent.value = res.content
    ElMessage.success('文案生成成功')
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    generating.value = false
  }
}

const copyContent = () => {
  navigator.clipboard.writeText(generatedContent.value)
  ElMessage.success('已复制到剪贴板')
}

const regenerate = () => {
  handleGenerate()
}

const goToLibrary = () => {
  router.push('/sales-tools/marketing-content-library')
}

const saveToLibrary = async () => {
  if (!generatedContent.value) {
    ElMessage.warning('请先生成文案')
    return
  }

  try {
    await saveMarketingContent({
      contentType: selectedScene.value,
      title: `${selectedScene.value} - ${new Date().toLocaleDateString()}`,
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
  }

  .result-card {
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .result-content {
      min-height: 400px;

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
        justify-content: space-around;
      }
    }

    .empty-icon {
      margin-bottom: 20px;
    }
  }
}
</style>
