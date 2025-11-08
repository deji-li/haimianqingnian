<template>
  <div class="chat-analysis-container">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>AI聊天记录分析</h2>
          <p class="subtitle">上传微信聊天截图，AI自动分析客户意向和需求</p>
        </div>
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传聊天记录
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总分析次数" :value="statistics.totalRecords" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已完成" :value="statistics.completedRecords" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="A级线索" :value="statistics.qualityDistribution?.A || 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="高风险客户" :value="statistics.highRiskCount || 0" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card>
      <el-form :inline="true" :model="queryForm" @submit.prevent="loadData">
        <el-form-item label="质量等级">
          <el-select v-model="queryForm.qualityLevel" clearable placeholder="全部">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="queryForm.riskLevel" clearable placeholder="全部">
            <el-option label="无风险" value="无风险" />
            <el-option label="低风险" value="低" />
            <el-option label="中风险" value="中" />
            <el-option label="高风险" value="高" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析记录列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="chatDate" label="聊天日期" width="120" />
        <el-table-column prop="wechatId" label="微信号" width="150" />
        <el-table-column label="质量等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getQualityType(row.qualityLevel)" v-if="row.qualityLevel">
              {{ row.qualityLevel }}级
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiskType(row.riskLevel)" v-if="row.riskLevel">
              {{ row.riskLevel }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="intentionScore" label="意向评分" width="100">
          <template #default="{ row }">
            <span v-if="row.intentionScore">{{ row.intentionScore }}分</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="分析状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.analysisStatus === '已完成'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.analysisStatus === '分析中'" type="warning">分析中</el-tag>
            <el-tag v-else-if="row.analysisStatus === '失败'" type="danger">失败</el-tag>
            <el-tag v-else type="info">{{ row.analysisStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">查看详情</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.limit"
        :total="total"
        @current-change="loadData"
        @size-change="loadData"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传聊天记录" width="600px">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef" label-width="100px">
        <el-form-item label="客户微信号" prop="wechatId">
          <el-input v-model="uploadForm.wechatId" placeholder="请输入客户微信号" />
          <div class="form-tip">请确保该微信号对应的客户已在系统中</div>
        </el-form-item>
        <el-form-item label="聊天日期" prop="chatDate">
          <el-date-picker
            v-model="uploadForm.chatDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="聊天截图" prop="images">
          <el-upload
            v-model:file-list="uploadForm.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="20"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">最多上传20张截图，支持jpg/png格式</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">
          开始分析
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="AI分析结果" width="900px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="质量等级">
            <el-tag :type="getQualityType(currentDetail.qualityLevel)" size="large">
              {{ currentDetail.qualityLevel }}级
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskType(currentDetail.riskLevel)" size="large">
              {{ currentDetail.riskLevel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="意向评分">
            {{ currentDetail.intentionScore }}分
          </el-descriptions-item>
          <el-descriptions-item label="预估价值">
            ¥{{ currentDetail.estimatedValue || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div v-if="currentDetail.aiAnalysisResult">
          <h3>沟通摘要</h3>
          <p>{{ currentDetail.aiAnalysisResult.communicationSummary }}</p>

          <h3>客户画像</h3>
          <el-descriptions :column="2" border v-if="currentDetail.aiAnalysisResult.customerProfile">
            <el-descriptions-item label="家长身份">
              {{ currentDetail.aiAnalysisResult.customerProfile.parentRole }}
            </el-descriptions-item>
            <el-descriptions-item label="学生年级">
              {{ currentDetail.aiAnalysisResult.customerProfile.studentGrade }}
            </el-descriptions-item>
            <el-descriptions-item label="经济水平">
              {{ currentDetail.aiAnalysisResult.customerProfile.familyEconomicLevel }}
            </el-descriptions-item>
            <el-descriptions-item label="决策角色">
              {{ currentDetail.aiAnalysisResult.customerProfile.decisionMakerRole }}
            </el-descriptions-item>
          </el-descriptions>

          <h3>客户需求</h3>
          <el-tag
            v-for="(need, index) in currentDetail.aiAnalysisResult.customerNeeds"
            :key="index"
            style="margin-right: 10px; margin-bottom: 10px"
          >
            {{ need }}
          </el-tag>

          <h3>下一步行动</h3>
          <ul>
            <li v-for="(step, index) in currentDetail.aiAnalysisResult.nextSteps" :key="index">
              {{ step }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Plus } from '@element-plus/icons-vue'
import {
  uploadFile,
  uploadChatRecord,
  getChatRecordList,
  getChatRecordDetail,
  getChatStatistics,
  deleteChatRecord
} from '@/api/ai'

const loading = ref(false)
const uploading = ref(false)
const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const tableData = ref([])
const total = ref(0)
const currentDetail = ref(null)
const uploadFormRef = ref()

const statistics = ref({
  totalRecords: 0,
  completedRecords: 0,
  qualityDistribution: {},
  highRiskCount: 0
})

const queryForm = reactive({
  page: 1,
  limit: 20,
  qualityLevel: '',
  riskLevel: ''
})

const uploadForm = reactive({
  wechatId: '',
  chatDate: '',
  images: []
})

const uploadRules = {
  wechatId: [{ required: true, message: '请输入客户微信号', trigger: 'blur' }],
  chatDate: [{ required: true, message: '请选择聊天日期', trigger: 'change' }],
  images: [{ required: true, message: '请上传聊天截图', trigger: 'change' }]
}

const getQualityType = (level: string) => {
  const types = { A: 'success', B: 'primary', C: 'warning', D: 'danger' }
  return types[level] || 'info'
}

const getRiskType = (level: string) => {
  const types = { 无风险: 'success', 低: 'info', 中: 'warning', 高: 'danger' }
  return types[level] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getChatRecordList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const res = await getChatStatistics()
    statistics.value = res
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const resetQuery = () => {
  queryForm.page = 1
  queryForm.qualityLevel = ''
  queryForm.riskLevel = ''
  loadData()
}

const handleUpload = async () => {
  if (!uploadFormRef.value) return

  await uploadFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    uploading.value = true
    try {
      // 1. 先上传图片到服务器
      const imageUrls: string[] = []
      for (const fileObj of uploadForm.images) {
        const uploadRes = await uploadFile(fileObj.raw, 'ai_chat')
        // 使用完整的服务器URL
        const fullUrl = window.location.origin + uploadRes.url
        imageUrls.push(fullUrl)
      }

      // 2. 调用AI分析接口
      await uploadChatRecord({
        wechatId: uploadForm.wechatId,
        chatDate: uploadForm.chatDate,
        images: imageUrls
      })

      ElMessage.success('上传成功，AI正在分析中...')
      showUploadDialog.value = false
      uploadForm.wechatId = ''
      uploadForm.chatDate = ''
      uploadForm.images = []
      loadData()
      loadStatistics()
    } catch (error: any) {
      ElMessage.error(error.message || '上传失败')
    } finally {
      uploading.value = false
    }
  })
}

const viewDetail = async (row: any) => {
  try {
    const res = await getChatRecordDetail(row.id)
    currentDetail.value = res
    showDetailDialog.value = true
  } catch (error) {
    ElMessage.error('加载详情失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除这条分析记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteChatRecord(row.id)
    ElMessage.success('删除成功')
    loadData()
    loadStatistics()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadStatistics()
})
</script>

<style scoped lang="scss">
.chat-analysis-container {
  padding: 20px;
}

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
    }
  }
}

.stats-row {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.detail-content {
  h3 {
    margin-top: 20px;
    margin-bottom: 10px;
  }
}
</style>
