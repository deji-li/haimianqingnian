<template>
  <div class="knowledge-configuration">
    <!-- ���识库概览 -->
    <div class="knowledge-overview">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ knowledgeData.totalKnowledge || 0 }}</div>
              <div class="stat-label">知识库总条目</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ knowledgeData.approvedKnowledge || 0 }}</div>
              <div class="stat-label">已审核知识</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ knowledgeData.autoUpdatedCount || 0 }}</div>
              <div class="stat-label">本月自动更新</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 知识库配置 -->
    <el-card class="config-section" style="margin-top: 20px">
      <template #header>
        <div class="section-header">
          <span>知识库设置</span>
          <el-button type="primary" size="small" @click="showCreateDialog = true">
            创建知识库
          </el-button>
        </div>
      </template>

      <el-form :model="formData" label-width="140px">
        <!-- 知识库权重 -->
        <el-form-item label="知识库权重">
          <div class="slider-container">
            <el-slider
              v-model="formData.weight"
              :min="0"
              :max="100"
              :step="5"
              show-input
              :format-tooltip="formatWeightTooltip"
            />
            <div class="slider-desc">
              <span class="desc-text">控制AI回答时对知识库的依赖程度</span>
              <span class="desc-value">{{ formData.weight }}%</span>
            </div>
          </div>
        </el-form-item>

        <!-- 搜索策略 -->
        <el-form-item label="搜索策略">
          <el-radio-group v-model="formData.searchStrategy">
            <el-radio value="semantic">
              <div class="radio-option">
                <span class="option-title">语义搜索</span>
                <span class="option-desc">基于语义理解的最智能搜索方式</span>
              </div>
            </el-radio>
            <el-radio value="keyword">
              <div class="radio-option">
                <span class="option-title">关键词搜索</span>
                <span class="option-desc">基于关键词匹配的快速搜索</span>
              </div>
            </el-radio>
            <el-radio value="hybrid">
              <div class="radio-option">
                <span class="option-title">混合搜索</span>
                <span class="option-desc">结合语义和关键词的综合搜索</span>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 更新频率 -->
        <el-form-item label="自动更新频率">
          <el-select v-model="formData.updateFrequency" placeholder="选择更新频率">
            <el-option label="实时更新" value="realtime" />
            <el-option label="每小时" value="hourly" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="手动更新" value="manual" />
          </el-select>
          <span class="form-hint">系统将根据设定频率自动从聊天记录中挖掘新知识</span>
        </el-form-item>

        <!-- 自动学习开关 -->
        <el-form-item label="自动学习">
          <div class="switch-container">
            <el-switch
              v-model="formData.autoLearning"
              active-text="启用"
              inactive-text="禁用"
            />
            <div class="switch-desc">
              启用后，系统将根据用户反馈和使用情况自动优化知识库
            </div>
          </div>
        </el-form-item>

        <!-- 知识质量阈值 -->
        <el-form-item label="知识质量阈值">
          <div class="slider-container">
            <el-slider
              v-model="formData.qualityThreshold"
              :min="50"
              :max="100"
              :step="5"
              show-input
            />
            <div class="slider-desc">
              <span class="desc-text">新知识入库的最低质量要求</span>
              <span class="desc-value">{{ formData.qualityThreshold }}分</span>
            </div>
          </div>
        </el-form-item>

        <!-- 负反馈处理 -->
        <el-form-item label="负反馈处理">
          <div class="switch-container">
            <el-switch
              v-model="formData.enableFeedbackProcessing"
              active-text="启用"
              inactive-text="禁用"
            />
            <div class="switch-desc">
              自动处理用户负反馈，及时修正不准确的知识内容
            </div>
          </div>
        </el-form-item>

        <!-- 行业知识推荐 -->
        <el-form-item label="行业知识推荐">
          <div class="switch-container">
            <el-switch
              v-model="formData.enableIndustryRecommend"
              active-text="启用"
              inactive-text="禁用"
            />
            <div class="switch-desc">
              基于企业所在行业推荐相关知识和最佳实践
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 知识库管理 -->
    <el-card class="management-section" style="margin-top: 20px">
      <template #header>
        <div class="section-header">
          <span>知识库管理</span>
          <div class="header-actions">
            <el-button @click="triggerMining" :loading="mining">
              <el-icon><Search /></el-icon>
              立即挖掘
            </el-button>
            <el-button @click="exportKnowledge">
              <el-icon><Download /></el-icon>
              导出知识
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="knowledgeList" v-loading="loading">
        <el-table-column prop="title" label="知识标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sceneCategory }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="getSourceTypeColor(row.sourceType)" size="small">
              {{ getSourceTypeText(row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualityScore" label="质量评分" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.qualityScore"
              :color="getQualityColor(row.qualityScore)"
              :stroke-width="8"
              :show-text="false"
            />
            <span class="quality-text">{{ row.qualityScore }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="usageCount" label="使用次数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="editKnowledge(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteKnowledge(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadKnowledgeList"
          @current-change="loadKnowledgeList"
        />
      </div>
    </el-card>

    <!-- 创建知识库对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建企业知识库" width="600px">
      <CreateKnowledgeForm
        v-if="showCreateDialog"
        @success="handleCreateSuccess"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 编辑知识对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑知识"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="editingKnowledge"
        ref="editFormRef"
        :model="editingKnowledge"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="知识标题" prop="title">
          <el-input
            v-model="editingKnowledge.title"
            placeholder="请输入知识标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="知识内容" prop="content">
          <el-input
            v-model="editingKnowledge.content"
            type="textarea"
            :rows="6"
            placeholder="请输入知识内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="场景分类" prop="sceneCategory">
              <el-select
                v-model="editingKnowledge.sceneCategory"
                placeholder="选择场景分类"
                style="width: 100%"
              >
                <el-option label="企业介绍" value="企业介绍" />
                <el-option label="产品咨询" value="产品咨询" />
                <el-option label="价格咨询" value="价格咨询" />
                <el-option label="服务咨询" value="服务咨询" />
                <el-option label="技术支持" value="技术支持" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="问题类型" prop="questionType">
              <el-select
                v-model="editingKnowledge.questionType"
                placeholder="选择问题类型"
                style="width: 100%"
              >
                <el-option label="系统咨询" value="系统咨询" />
                <el-option label="功能咨询" value="功能咨询" />
                <el-option label="价格咨询" value="价格咨询" />
                <el-option label="服务咨询" value="服务咨询" />
                <el-option label="投诉建议" value="投诉建议" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="productCategory">
              <el-input
                v-model="editingKnowledge.productCategory"
                placeholder="产品分类"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-input
                v-model="editingKnowledge.customerType"
                placeholder="客户类型"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="关键词" prop="keywords">
          <el-select
            v-model="editingKnowledge.keywords"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入关键词后按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="keyword in editingKnowledge.keywords"
              :key="keyword"
              :label="keyword"
              :value="keyword"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number
                v-model="editingKnowledge.priority"
                :min="0"
                :max="100"
                placeholder="0-100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="editingKnowledge.status"
                placeholder="选择状态"
                style="width: 100%"
              >
                <el-option label="已发布" value="active" />
                <el-option label="草稿" value="inactive" />
                <el-option label="待审核" value="pending_review" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="saveEdit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import { enterpriseKnowledgeApi } from '@/api/enterprise-knowledge'
import CreateKnowledgeForm from './CreateKnowledgeForm.vue'

// Props
interface KnowledgeData {
  totalKnowledge?: number
  approvedKnowledge?: number
  autoUpdatedCount?: number
  weight?: number
  searchStrategy?: string
  updateFrequency?: string
  autoLearning?: boolean
  qualityThreshold?: number
  enableFeedbackProcessing?: boolean
  enableIndustryRecommend?: boolean
}

const props = defineProps<{
  modelValue: KnowledgeData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: KnowledgeData]
  'update': [value: KnowledgeData]
}>()

// 响应式数据
const formData = ref<KnowledgeData>({
  weight: 70,
  searchStrategy: 'semantic',
  updateFrequency: 'daily',
  autoLearning: true,
  qualityThreshold: 70,
  enableFeedbackProcessing: true,
  enableIndustryRecommend: true,
  ...props.modelValue,
})

const knowledgeList = ref([])
const loading = ref(false)
const mining = ref(false)
const showCreateDialog = ref(false)

// 编辑对话框相关
const editDialogVisible = ref(false)
const editingKnowledge = ref<any>(null)
const editFormRef = ref()
const editSaving = ref(false)

// 编辑表单验证规则
const editFormRules = {
  title: [
    { required: true, message: '请输入知识标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度为2-200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入知识内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '内容长度为5-2000个字符', trigger: 'blur' }
  ],
  sceneCategory: [
    { required: true, message: '请选择场景分类', trigger: 'change' }
  ],
  questionType: [
    { required: true, message: '请选择问题类型', trigger: 'change' }
  ],
  keywords: [
    { required: true, message: '请至少添加一个关键词', trigger: 'change' },
    { validator: (rule: any, value: any, callback: any) => {
      if (!value || value.length === 0) {
        callback(new Error('请至少添加一个关键词'))
      } else if (value.length > 10) {
        callback(new Error('关键词数量不能超过10个'))
      } else {
        callback()
      }
    }, trigger: 'change' }
  ]
}

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
})

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue }
}, { deep: true })

// 监听formData变化
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
  emit('update', newValue)
}, { deep: true })

// 方法
const formatWeightTooltip = (value: number) => {
  if (value < 30) return '主要依赖AI通用知识'
  if (value < 70) return '平衡知识库和AI知识'
  return '主要依赖知识库知识'
}

const getSourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'manual': 'primary',
    'ai_mining': 'success',
    'industry_recommend': 'warning',
    'file_import': 'info',
  }
  return colorMap[type] || ''
}

const getSourceTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'manual': '手动添加',
    'ai_mining': 'AI挖掘',
    'industry_recommend': '行业推荐',
    'file_import': '文件导入',
  }
  return textMap[type] || type
}

const getQualityColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'active': 'success',
    'pending_review': 'warning',
    'inactive': 'info',
    'auto_disabled': 'danger',
  }
  return colorMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '已启用',
    'pending_review': '待审核',
    'inactive': '已禁用',
    'auto_disabled': '自动禁用',
  }
  return textMap[status] || status
}

const loadKnowledgeList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    const response = await enterpriseKnowledgeApi.getKnowledgeList(params)
    if (response.success) {
      knowledgeList.value = response.data.list
      pagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('加载知识库列表失败:', error)
    ElMessage.error('加载知识库列表失败')
  } finally {
    loading.value = false
  }
}

const triggerMining = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要立即执行知识挖掘吗？这可能需要一些时间。',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    mining.value = true
    const response = await enterpriseKnowledgeApi.triggerMining({
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      maxCount: 100,
    })

    if (response.success) {
      ElMessage.success(`知识挖掘完成，发现 ${response.data.stats.qaExtracted} 个问答`)
      loadKnowledgeList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('知识挖掘失败:', error)
      ElMessage.error('知识挖掘失败')
    }
  } finally {
    mining.value = false
  }
}

const exportKnowledge = async () => {
  try {
    // 显示导出选项对话框
    const { value: exportOptions } = await ElMessageBox.prompt(
      '请选择导出格式和范围',
      '知识库导出',
      {
        confirmButtonText: '导出',
        cancelButtonText: '取消',
        inputType: 'select',
        inputPlaceholder: '选择导出格式',
        inputOptions: [
          { value: 'excel', label: 'Excel格式 (.xlsx)' },
          { value: 'csv', label: 'CSV格式 (.csv)' },
          { value: 'json', label: 'JSON格式 (.json)' },
        ],
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            // 显示范围选择
            ElMessageBox.confirm(
              '请选择导出范围',
              '导出范围',
              {
                confirmButtonText: '全部知识',
                cancelButtonText: '当前筛选结果',
                distinguishCancelAndClose: true,
                type: 'info'
              }
            ).then(() => {
              instance.inputValue = { format: instance.inputValue, scope: 'all' }
              done()
            }).catch((action) => {
              if (action === 'cancel') {
                instance.inputValue = { format: instance.inputValue, scope: 'filtered' }
                done()
              } else {
                done()
              }
            })
          } else {
            done()
          }
        }
      }
    )

    if (!exportOptions || !exportOptions.format) {
      return
    }

    // 调用导出API
    const response = await enterpriseKnowledgeApi.exportKnowledge({
      format: exportOptions.format,
      scope: exportOptions.scope || 'all',
      filters: exportOptions.scope === 'filtered' ? searchQuery.value : undefined
    })

    // 创建下载链接
    const blob = new Blob([response], {
      type: getContentType(exportOptions.format)
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `knowledge_base_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL对象
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('导出失败')
      console.error('导出知识库失败:', error)
    }
  }
}

// 获取文件类型
const getContentType = (format: string): string => {
  const typeMap = {
    'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'json': 'application/json'
  }
  return typeMap[format] || 'application/octet-stream'
}

const editKnowledge = (knowledge: any) => {
  // 设置编辑数据
  editingKnowledge.value = {
    id: knowledge.id,
    title: knowledge.title,
    content: knowledge.content,
    sceneCategory: knowledge.sceneCategory,
    productCategory: knowledge.productCategory,
    customerType: knowledge.customerType,
    questionType: knowledge.questionType,
    keywords: knowledge.keywords ? knowledge.keywords.split(',').map(k => k.trim()) : [],
    priority: knowledge.priority || 0,
    status: knowledge.status,
  }

  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  if (!editFormRef.value || !editingKnowledge.value) return

  try {
    await editFormRef.value.validate()

    editSaving.value = true

    const updateData = {
      title: editingKnowledge.value.title,
      content: editingKnowledge.value.content,
      sceneCategory: editingKnowledge.value.sceneCategory,
      productCategory: editingKnowledge.value.productCategory,
      customerType: editingKnowledge.value.customerType,
      questionType: editingKnowledge.value.questionType,
      keywords: editingKnowledge.value.keywords.join(','),
      priority: editingKnowledge.value.priority,
      status: editingKnowledge.value.status,
    }

    const response = await enterpriseKnowledgeApi.updateKnowledge(editingKnowledge.value.id, updateData)

    if (response.success) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      loadKnowledgeList()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存编辑失败:', error)
    ElMessage.error('保存失败')
  } finally {
    editSaving.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false
  editingKnowledge.value = null
}

const deleteKnowledge = async (knowledge: any) => {
  try {
    await ElMessageBox.confirm(
      `确定删除知识"${knowledge.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await enterpriseKnowledgeApi.deleteKnowledge(knowledge.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadKnowledgeList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除知识失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  loadKnowledgeList()
  ElMessage.success('知识库创建成功')
}

onMounted(() => {
  loadKnowledgeList()
})
</script>

<style lang="scss" scoped>
.knowledge-configuration {
  .knowledge-overview {
    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .config-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: #303133;
      }
    }

    .radio-option {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .option-title {
        font-weight: 500;
        color: #303133;
      }

      .option-desc {
        font-size: 12px;
        color: #909399;
      }
    }

    .slider-container {
      width: 100%;

      .slider-desc {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;

        .desc-text {
          font-size: 13px;
          color: #909399;
        }

        .desc-value {
          font-weight: 500;
          color: #409eff;
        }
      }
    }

    .switch-container {
      .switch-desc {
        margin-top: 8px;
        font-size: 13px;
        color: #909399;
      }
    }

    .form-hint {
      margin-left: 12px;
      font-size: 13px;
      color: #909399;
    }
  }

  .management-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: #303133;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .quality-text {
      margin-left: 8px;
      font-size: 12px;
      color: #606266;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>