<template>
  <div class="file-upload-wrapper">
    <!-- 头像上传 -->
    <el-upload
      v-if="uploadType === 'avatar'"
      class="avatar-uploader"
      :action="uploadAction"
      :headers="uploadHeaders"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      :on-success="handleAvatarSuccess"
      :on-error="handleError"
    >
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>

    <!-- 附件上传 -->
    <el-upload
      v-else-if="uploadType === 'attachment'"
      class="attachment-uploader"
      :action="uploadAction"
      :headers="uploadHeaders"
      :file-list="fileList"
      :on-success="handleAttachmentSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :before-upload="beforeAttachmentUpload"
      multiple
    >
      <el-button type="primary">
        <el-icon><Upload /></el-icon>
        上传附件
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          {{ tip || '支持上传图片、PDF、Word文档，单个文件不超过10MB' }}
        </div>
      </template>
    </el-upload>

    <!-- 合同上传 -->
    <el-upload
      v-else-if="uploadType === 'contract'"
      class="contract-uploader"
      :action="uploadAction"
      :headers="uploadHeaders"
      :file-list="fileList"
      :on-success="handleAttachmentSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :before-upload="beforeContractUpload"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip">
          {{ tip || '支持上传PDF或图片格式的合同，单个文件不超过10MB' }}
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import type { UploadProps, UploadUserFile } from 'element-plus'

interface Props {
  uploadType: 'avatar' | 'attachment' | 'contract'
  category: string
  relatedId?: number
  modelValue?: string | any[]
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  uploadType: 'attachment',
  category: 'other',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | any[]): void
  (e: 'success', response: any): void
}>()

const userStore = useUserStore()

// 上传地址
const uploadAction = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${baseUrl}/upload`
})

// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`,
}))

// 头像URL
const avatarUrl = ref<string>(props.modelValue as string || '')

// 文件列表
const fileList = ref<UploadUserFile[]>([])

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.uploadType === 'avatar') {
      avatarUrl.value = newValue as string || ''
    } else if (Array.isArray(newValue)) {
      fileList.value = newValue.map(file => ({
        name: file.originalName || file.name,
        url: file.url,
        uid: file.id || file.uid,
      }))
    }
  },
  { immediate: true }
)

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过2MB!')
    return false
  }
  return true
}

// 附件上传前验证
const beforeAttachmentUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const maxSize = 10 // 10MB
  if (rawFile.size / 1024 / 1024 > maxSize) {
    ElMessage.error(`文件大小不能超过${maxSize}MB!`)
    return false
  }
  return true
}

// 合同上传前验证
const beforeContractUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('合同只支持PDF或图片格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response && response.url) {
    avatarUrl.value = response.url
    emit('update:modelValue', response.url)
    emit('success', response)
    ElMessage.success('头像上传成功')
  }
}

// 附件上传成功
const handleAttachmentSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response) {
    fileList.value.push({
      name: response.originalName,
      url: response.url,
      uid: response.id,
    })
    emit('update:modelValue', fileList.value)
    emit('success', response)
    ElMessage.success('文件上传成功')
  }
}

// 移除文件
const handleRemove: UploadProps['onRemove'] = (uploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === uploadFile.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emit('update:modelValue', fileList.value)
  }
}

// 上传失败
const handleError: UploadProps['onError'] = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('文件上传失败，请重试')
}
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
}

/* 头像上传样式 */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

/* 附件上传样式 */
.attachment-uploader {
  width: 100%;
}

/* 合同上传样式 */
.contract-uploader {
  width: 100%;
}
</style>
