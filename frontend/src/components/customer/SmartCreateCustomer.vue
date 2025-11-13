<template>
  <el-dialog
    v-model="visible"
    title="AI智能创建客户"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="smart-create-container">
      <!-- 简化的输入表单 -->
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          只需输入微信号并上传聊天截图，AI将自动识别客户信息
        </el-alert>

        <el-form-item label="微信号" prop="wechatId">
          <el-input
            v-model="formData.wechatId"
            placeholder="请输入客户的微信号（必填）"
            clearable
          />
        </el-form-item>

        <el-form-item label="微信昵称">
          <el-input
            v-model="formData.wechatNickname"
            placeholder="选填，可不填"
            clearable
          />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input
            v-model="formData.phone"
            placeholder="选填，可不填"
            clearable
          />
        </el-form-item>

        <el-form-item label="运营人员">
          <el-select
            v-model="formData.operatorId"
            placeholder="选择运营人员（选填）"
            clearable
            filterable
          >
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.realName"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="聊天截图" required>
          <div
            class="paste-area"
            @paste="handlePaste"
            tabindex="0"
            ref="pasteAreaRef"
          >
            <div class="paste-hint">
              <el-icon :size="32" color="#409EFF"><Picture /></el-icon>
              <p class="hint-text">按 Ctrl+V 粘贴截图或点击上传</p>
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
            <p class="image-count">已粘贴 {{ pastedImages.length }} 张图片</p>
            <div class="image-grid">
              <div
                v-for="(img, index) in pastedImages"
                :key="index"
                class="image-item"
              >
                <img :src="img.preview" alt="截图" />
                <el-icon class="remove-icon" @click="removePastedImage(index)">
                  <CircleClose />
                </el-icon>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="!canSubmit"
        >
          {{ submitting ? '创建中...' : '创建客户' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Plus, CircleClose } from '@element-plus/icons-vue'
import { smartCreateCustomer } from '@/api/customer'
import { getUserList } from '@/api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref()
const pasteAreaRef = ref()
const operatorList = ref<any[]>([])

const formData = ref({
  wechatId: '',
  wechatNickname: '',
  phone: '',
  operatorId: undefined as number | undefined
})

// 获取运营人员列表
const fetchOperatorList = async () => {
  try {
    const res = await getUserList({ roleCode: 'operator' })
    operatorList.value = res.list || []
  } catch (error) {
    console.error('获取运营人员列表失败:', error)
  }
}

onMounted(() => {
  fetchOperatorList()
})

const formRules = {
  wechatId: [
    { required: true, message: '请输入微信号', trigger: 'blur' }
  ]
}

const fileList = ref<any[]>([])
const pastedImages = ref<any[]>([])

const canSubmit = computed(() => {
  return formData.value.wechatId && (pastedImages.value.length > 0 || fileList.value.length > 0)
})

// 打开对话框
const open = () => {
  visible.value = true
  formData.value = {
    wechatId: '',
    wechatNickname: '',
    phone: '',
    operatorId: undefined
  }
  fileList.value = []
  pastedImages.value = []

  // 聚焦到粘贴区域
  setTimeout(() => {
    pasteAreaRef.value?.focus()
  }, 300)
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 处理粘贴
const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          pastedImages.value.push({
            file,
            preview: e.target?.result as string,
            base64: (e.target?.result as string).split(',')[1]
          })
        }
        reader.readAsDataURL(file)
      }
    }
  }

  if (pastedImages.value.length > 0) {
    ElMessage.success('截图粘贴成功')
  }
}

// 处理文件选择
const handleFileChange = (file: any) => {
  // 文件已经被 el-upload 处理
}

// 移除粘贴的图片
const removePastedImage = (index: number) => {
  pastedImages.value.splice(index, 1)
}

// 提交创建
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (pastedImages.value.length === 0 && fileList.value.length === 0) {
      ElMessage.warning('请至少上传一张聊天截图')
      return
    }

    submitting.value = true

    // 收集base64图片
    const imageBase64List: string[] = []

    // 粘贴的图片
    for (const img of pastedImages.value) {
      imageBase64List.push('data:image/png;base64,' + img.base64)
    }

    // 上传的文件
    for (const file of fileList.value) {
      if (file.raw) {
        const base64 = await fileToBase64(file.raw)
        imageBase64List.push(base64)
      }
    }

    // 调用API
    const response = await smartCreateCustomer({
      imageBase64List,
      knownInfo: {
        wechatId: formData.value.wechatId,
        wechatNickname: formData.value.wechatNickname || undefined,
        phone: formData.value.phone || undefined,
        operatorId: formData.value.operatorId
      }
    })

    ElMessage.success('客户创建成功，AI正在后台识别中')
    handleClose()

    // 跳转到客户详情页
    if (response.customerId) {
      router.push(`/customer/detail/${response.customerId}`)
    }

  } catch (error: any) {
    console.error('创建客户失败:', error)
    console.error('错误详情:', JSON.stringify(error, null, 2))
    console.error('错误响应:', error.response)
    console.error('错误响应数据:', error.response?.data)

    const errorMsg = error.response?.data?.message || error.message || '创建客户失败'
    ElMessage.error(errorMsg)
  } finally {
    submitting.value = false
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

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.smart-create-container {
  padding: 20px 0;
}

.paste-area {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;

  &:hover, &:focus {
    border-color: #409EFF;
    background-color: #f5f7fa;
  }

  .paste-hint {
    margin-bottom: 20px;

    .hint-text {
      margin: 10px 0 5px;
      font-size: 14px;
      color: #606266;
    }
  }
}

.pasted-images {
  margin-top: 15px;

  .image-count {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;

    .image-item {
      position: relative;
      width: 100px;
      height: 100px;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-icon {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 20px;
        color: #f56c6c;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        cursor: pointer;
        padding: 2px;

        &:hover {
          color: #fff;
          background: #f56c6c;
        }
      }
    }
  }
}
</style>
