<template>
  <div class="contact-detail">
    <el-card class="detail-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" type="text">
              <el-icon><ArrowLeft /></el-icon>
              返回联系人列表
            </el-button>
            <div class="title">联系人详情</div>
          </div>
          <div class="header-actions">
            <el-button @click="handleEdit" :disabled="!contactData">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button @click="handleSync" :loading="syncing" type="primary">
              <el-icon><Refresh /></el-icon>
              重新同步
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="contactData" class="detail-content">
        <!-- 基本信息 -->
        <div class="section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <label>头像</label>
              <div class="avatar-container">
                <el-avatar
                  :src="contactData.avatar"
                  :size="64"
                  class="avatar"
                >
                  {{ contactData.name?.charAt(0) || '?' }}
                </el-avatar>
              </div>
            </div>
            <div class="info-item">
              <label>姓名</label>
              <span>{{ contactData.name || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>性别</label>
              <el-tag :type="getGenderType(contactData.gender)" size="small">
                {{ getGenderText(contactData.gender) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>职位</label>
              <span>{{ contactData.position || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>企业名称</label>
              <span>{{ contactData.corpName || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>外部用户ID</label>
              <span class="monospace">{{ contactData.externalUserId }}</span>
            </div>
            <div class="info-item">
              <label>跟进人员</label>
              <span>{{ contactData.followUserId || '未分配' }}</span>
            </div>
            <div class="info-item">
              <label>添加时间</label>
              <span>{{ formatDateTime(contactData.addTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 备注信息 -->
        <div class="section">
          <div class="section-title">备注信息</div>
          <div class="remark-content">
            {{ contactData.remark || '暂无备注' }}
          </div>
        </div>

        <!-- 标签管理 -->
        <div class="section">
          <div class="section-title">标签管理</div>
          <div class="tags-content">
            <div v-if="contactData.tags && contactData.tags.length" class="tags-list">
              <el-tag
                v-for="tag in contactData.tags"
                :key="tag"
                closable
                @close="handleRemoveTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div v-else class="no-tags">暂无标签</div>
            <div class="tag-input">
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="small"
                @keyup.enter="handleAddTag"
                @blur="handleAddTag"
                placeholder="输入标签名称"
              />
              <el-button
                v-else
                size="small"
                @click="showTagInput"
              >
                <el-icon><Plus /></el-icon>
                添加标签
              </el-button>
            </div>
          </div>
        </div>

        <!-- 同步状态 -->
        <div class="section">
          <div class="section-title">同步状态</div>
          <div class="sync-status">
            <div class="status-item">
              <label>同步状态</label>
              <el-tag :type="getSyncStatusType(contactData.syncStatus)">
                {{ getSyncStatusText(contactData.syncStatus) }}
              </el-tag>
            </div>
            <div class="status-item">
              <label>最后同步时间</label>
              <span>{{ formatDateTime(contactData.syncTime) }}</span>
            </div>
            <div class="status-item">
              <label>CRM客户关联</label>
              <div v-if="contactData.customerId">
                <el-tag type="success" size="small">
                  已关联 (ID: {{ contactData.customerId }})
                </el-tag>
                <el-button
                  type="text"
                  size="small"
                  @click="handleViewCustomer"
                >
                  查看客户
                </el-button>
              </div>
              <div v-else>
                <el-tag type="info" size="small">未关联</el-tag>
                <el-button
                  type="text"
                  size="small"
                  @click="handleAssociateCustomer"
                >
                  关联客户
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作记录 -->
        <div class="section">
          <div class="section-title">操作记录</div>
          <div class="timeline">
            <el-timeline>
              <el-timeline-item
                v-if="contactData.addTime"
                :timestamp="formatDateTime(contactData.addTime)"
                type="primary"
              >
                添加到企业微信联系人列表
              </el-timeline-item>
              <el-timeline-item
                v-if="contactData.syncTime"
                :timestamp="formatDateTime(contactData.syncTime)"
                :type="contactData.syncStatus === 'synced' ? 'success' : 'warning'"
              >
                {{ contactData.syncStatus === 'synced' ? '同步成功' : '同步处理' }}
              </el-timeline-item>
              <el-timeline-item
                v-if="contactData.updatedTime"
                :timestamp="formatDateTime(contactData.updatedTime)"
                type="info"
              >
                最后更新信息
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="no-data">
        <el-empty description="联系人不存在或已被删除" />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑联系人信息"
      width="600px"
      :before-close="handleCloseEdit"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" placeholder="请选择性别">
            <el-option label="未知" value="unknown" />
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="editForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="企业名称" prop="corpName">
          <el-input v-model="editForm.corpName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="跟进人员" prop="followUserId">
          <el-input v-model="editForm.followUserId" placeholder="请输入跟进人员ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit" :loading="saving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关联客户对话框 -->
    <el-dialog
      v-model="associateDialogVisible"
      title="关联CRM客户"
      width="500px"
    >
      <el-form
        ref="associateFormRef"
        :model="associateForm"
        :rules="associateFormRules"
        label-width="100px"
      >
        <el-form-item label="客户ID" prop="customerId">
          <el-input
            v-model="associateForm.customerId"
            placeholder="请输入要关联的客户ID"
            type="number"
          />
        </el-form-item>
        <el-form-item>
          <el-text type="info" size="small">
            请输入CRM系统中已存在的客户ID进行关联
          </el-text>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="associateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAssociate" :loading="associating">
            确认关联
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Refresh,
  Plus,
} from '@element-plus/icons-vue'
import {
  getWeWorkContactDetail,
  updateWeWorkContact,
  syncWeWorkContact,
  associateWeWorkContactWithCustomer,
  disassociateWeWorkContactFromCustomer,
  type WeWorkContact,
} from '@/api/wework'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)
const associating = ref(false)
const contactData = ref<WeWorkContact | null>(null)

// 编辑相关
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  name: '',
  gender: '',
  position: '',
  corpName: '',
  followUserId: '',
  remark: '',
})

// 关联客户相关
const associateDialogVisible = ref(false)
const associateFormRef = ref<FormInstance>()
const associateForm = reactive({
  customerId: null as number | null,
})

// 标签管理
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref()

// 表单验证规则
const editFormRules: FormRules = {
  name: [
    { required: false, message: '请输入联系人姓名', trigger: 'blur' },
  ],
  gender: [
    { required: false, message: '请选择性别', trigger: 'change' },
  ],
  position: [
    { max: 100, message: '职位长度不能超过100个字符', trigger: 'blur' },
  ],
  corpName: [
    { max: 255, message: '企业名称长度不能超过255个字符', trigger: 'blur' },
  ],
  remark: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' },
  ],
}

const associateFormRules: FormRules = {
  customerId: [
    { required: true, message: '请输入客户ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '客户ID必须是正整数', trigger: 'blur' },
  ],
}

// 获取联系人详情
const loadContactDetail = async () => {
  const id = route.params.id as string
  if (!id) return

  try {
    loading.value = true
    const response = await getWeWorkContactDetail(Number(id))
    contactData.value = response

    // 初始化编辑表单
    if (response) {
      Object.assign(editForm, {
        name: response.name || '',
        gender: response.gender || 'unknown',
        position: response.position || '',
        corpName: response.corpName || '',
        followUserId: response.followUserId || '',
        remark: response.remark || '',
      })
    }
  } catch (error) {
    console.error('获取联系人详情失败:', error)
    ElMessage.error('获取联系人详情失败')
  } finally {
    loading.value = false
  }
}

// 返回列表
const handleBack = () => {
  router.push('/system/wework-contacts')
}

// 编辑
const handleEdit = () => {
  if (!contactData.value) return
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value || !contactData.value) return

  try {
    await editFormRef.value.validate()
    saving.value = true

    const updateData = {
      name: editForm.name,
      gender: editForm.gender,
      position: editForm.position,
      corpName: editForm.corpName,
      followUserId: editForm.followUserId,
      remark: editForm.remark,
    }

    await updateWeWorkContact(contactData.value.id, updateData)
    ElMessage.success('保存成功')
    editDialogVisible.value = false

    // 重新加载数据
    await loadContactDetail()
  } catch (error) {
    console.error('保存编辑失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 关闭编辑
const handleCloseEdit = () => {
  editDialogVisible.value = false
  editFormRef.value?.resetFields()
}

// 重新同步
const handleSync = async () => {
  if (!contactData.value) return

  try {
    await ElMessageBox.confirm('确认要重新同步此联系人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    syncing.value = true
    await syncWeWorkContact(contactData.value.externalUserId)
    ElMessage.success('同步成功')

    // 重新加载数据
    await loadContactDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步失败:', error)
      ElMessage.error('同步失败')
    }
  } finally {
    syncing.value = false
  }
}

// 关联客户
const handleAssociateCustomer = () => {
  associateForm.customerId = null
  associateDialogVisible.value = true
}

// 保存关联
const handleSaveAssociate = async () => {
  if (!associateFormRef.value || !contactData.value) return

  try {
    await associateFormRef.value.validate()
    associating.value = true

    await associateWeWorkContactWithCustomer(contactData.value.id, associateForm.customerId!)
    ElMessage.success('关联成功')
    associateDialogVisible.value = false

    // 重新加载数据
    await loadContactDetail()
  } catch (error) {
    console.error('关联客户失败:', error)
    ElMessage.error('关联失败')
  } finally {
    associating.value = false
  }
}

// 查看客户
const handleViewCustomer = () => {
  if (contactData.value?.customerId) {
    router.push(`/customer/detail/${contactData.value.customerId}`)
  }
}

// 标签管理
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleAddTag = async () => {
  const tag = tagInputValue.value.trim()
  if (!tag || !contactData.value) return

  try {
    const newTags = [...(contactData.value.tags || []), tag]
    await updateWeWorkContact(contactData.value.id, { tags: newTags })

    contactData.value.tags = newTags
    tagInputValue.value = ''
    tagInputVisible.value = false
    ElMessage.success('标签添加成功')
  } catch (error) {
    console.error('添加标签失败:', error)
    ElMessage.error('添加标签失败')
  }
}

const handleRemoveTag = async (tag: string) => {
  if (!contactData.value) return

  try {
    const newTags = contactData.value.tags?.filter(t => t !== tag) || []
    await updateWeWorkContact(contactData.value.id, { tags: newTags })

    contactData.value.tags = newTags
    ElMessage.success('标签删除成功')
  } catch (error) {
    console.error('删除标签失败:', error)
    ElMessage.error('删除标签失败')
  }
}

// 辅助函数
const getGenderText = (gender: string) => {
  const map = {
    unknown: '未知',
    male: '男',
    female: '女',
  }
  return map[gender] || '未知'
}

const getGenderType = (gender: string) => {
  const map = {
    unknown: 'info',
    male: 'primary',
    female: 'success',
  }
  return map[gender] || 'info'
}

const getSyncStatusText = (status: string) => {
  const map = {
    pending: '待同步',
    synced: '已同步',
    failed: '同步失败',
  }
  return map[status] || status
}

const getSyncStatusType = (status: string) => {
  const map = {
    pending: 'warning',
    synced: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

const formatDateTime = (dateTime: string | Date | null) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

// 组件挂载
onMounted(() => {
  loadContactDetail()
})
</script>

<style lang="scss" scoped>
.contact-detail {
  padding: 20px;
}

.detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.detail-content {
  .section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;

      label {
        font-weight: 500;
        color: #606266;
        min-width: 100px;
      }

      .monospace {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #909399;
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .avatar-container {
        .avatar {
          background: #f0f0f0;
          color: #909399;
          font-weight: 500;
        }
      }
    }
  }

  .remark-content {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;
    line-height: 1.6;
    color: #606266;
    white-space: pre-wrap;
  }

  .tags-content {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .tag-item {
        margin: 0;
      }
    }

    .no-tags {
      color: #909399;
      margin-bottom: 12px;
    }

    .tag-input {
      .el-input {
        width: 120px;
      }
    }
  }

  .sync-status {
    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      label {
        font-weight: 500;
        color: #606266;
        min-width: 120px;
      }
    }
  }

  .timeline {
    padding: 0 20px;
  }
}

.no-data {
  text-align: center;
  padding: 60px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>