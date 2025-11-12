<template>
  <view class="smart-create-page">
    <!-- 顶部导航 -->
    <uni-nav-bar
      title="AI智能创建客户"
      left-icon="back"
      @click-left="goBack"
      background-color="#409EFF"
      color="#ffffff"
      fixed
    />

    <!-- 步骤指示器 -->
    <view class="steps-wrapper">
      <uni-steps :active="currentStep" :options="steps" direction="row" />
    </view>

    <!-- 步骤1: 拍照/选择图片 -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="upload-area">
        <view class="tip-text">
          <uni-icons type="camera" size="60" color="#409EFF" />
          <text class="tip-title">拍摄或选择聊天截图</text>
          <text class="tip-sub">支持多张图片</text>
        </view>

        <view class="btn-group">
          <button class="btn-camera" @click="takePhoto">
            <uni-icons type="camera-filled" size="24" color="#ffffff" />
            拍照
          </button>
          <button class="btn-album" @click="chooseImage">
            <uni-icons type="image" size="24" color="#ffffff" />
            相册
          </button>
        </view>
      </view>

      <!-- 已选图片预览 -->
      <view v-if="selectedImages.length > 0" class="image-preview">
        <view class="preview-header">
          <text>已选择 {{ selectedImages.length }} 张图片</text>
          <button class="btn-clear" @click="clearImages">清空</button>
        </view>
        <view class="preview-grid">
          <view
            v-for="(img, index) in selectedImages"
            :key="index"
            class="preview-item"
          >
            <image :src="img.path" mode="aspectFill" />
            <view class="remove-btn" @click="removeImage(index)">
              <uni-icons type="close" size="16" color="#ffffff" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 步骤2: AI识别中 -->
    <view v-if="currentStep === 1" class="step-content analyzing">
      <view class="loading-box">
        <uni-load-more status="loading" />
        <text class="loading-text">{{ aiProgressText }}</text>
        <text class="loading-sub">请稍候...</text>
      </view>
    </view>

    <!-- 步骤3: 确认信息 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="form-wrapper">
        <uni-section title="基础信息" type="line">
          <uni-forms ref="formRef" :model="formData" :rules="rules">
            <uni-forms-item label="微信昵称" name="wechatNickname" required>
              <uni-easyinput v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
            </uni-forms-item>

            <uni-forms-item label="真实姓名" name="realName">
              <uni-easyinput v-model="formData.realName" placeholder="请输入真实姓名" />
            </uni-forms-item>

            <uni-forms-item label="手机号" name="phone">
              <uni-easyinput v-model="formData.phone" type="number" placeholder="请输入手机号" />
            </uni-forms-item>

            <uni-forms-item label="所在地区" name="location">
              <uni-easyinput v-model="formData.location" placeholder="AI识别的所在地区" />
            </uni-forms-item>

            <uni-forms-item label="学生年级" name="studentGrade">
              <uni-easyinput v-model="formData.studentGrade" placeholder="AI识别的学生年级" />
            </uni-forms-item>
          </uni-forms>
        </uni-section>

        <uni-section title="意向信息" type="line">
          <uni-forms ref="intentFormRef" :model="formData">
            <uni-forms-item label="客户意向" name="customerIntent">
              <uni-data-select
                v-model="formData.customerIntent"
                :localdata="intentOptions"
                placeholder="请选择客户意向"
              />
            </uni-forms-item>

            <uni-forms-item label="意向分数" name="intentionScore">
              <view class="score-display">
                <text>{{ formData.intentionScore }}</text>
                <text class="score-unit">分</text>
              </view>
            </uni-forms-item>

            <uni-forms-item label="客户阶段" name="customerStage">
              <uni-data-select
                v-model="formData.customerStage"
                :localdata="stageOptions"
                placeholder="请选择客户阶段"
              />
            </uni-forms-item>

            <uni-forms-item label="预估金额" name="estimatedValue">
              <view class="money-display">
                <text>{{ formData.estimatedValue }}</text>
                <text class="money-unit">元</text>
              </view>
            </uni-forms-item>
          </uni-forms>
        </uni-section>

        <uni-section title="AI标签" type="line">
          <view class="tags-wrapper">
            <uni-tag
              v-for="(tag, index) in formData.aiTags"
              :key="index"
              :text="tag"
              type="success"
            />
          </view>
        </uni-section>

        <uni-section title="跟进建议" type="line">
          <view class="advice-wrapper">
            <view class="advice-item">
              <text class="advice-label">下一步行动：</text>
              <view class="advice-tags">
                <uni-tag
                  v-for="(step, index) in formData.nextSteps"
                  :key="index"
                  :text="step"
                  type="primary"
                  size="small"
                />
              </view>
            </view>

            <view class="advice-item">
              <text class="advice-label">销售策略：</text>
              <text class="advice-text">{{ formData.salesStrategy }}</text>
            </view>

            <view class="advice-item">
              <text class="advice-label">客户需求：</text>
              <view class="advice-tags">
                <uni-tag
                  v-for="(need, index) in formData.customerNeeds"
                  :key="index"
                  :text="need"
                  size="small"
                />
              </view>
            </view>

            <view class="advice-item">
              <text class="advice-label">风险因素：</text>
              <view class="advice-tags">
                <uni-tag
                  v-for="(risk, index) in formData.riskFactors"
                  :key="index"
                  :text="risk"
                  type="error"
                  size="small"
                />
              </view>
            </view>
          </view>
        </uni-section>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-btns">
      <button
        v-if="currentStep === 0"
        class="btn-primary"
        @click="startAI"
        :disabled="selectedImages.length === 0"
      >
        开始AI识别
      </button>

      <button v-if="currentStep === 2" class="btn-default" @click="goBack">
        取消
      </button>
      <button
        v-if="currentStep === 2"
        class="btn-primary"
        @click="submitCreate"
        :loading="submitLoading"
      >
        创建客户
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentStep = ref(0)
const selectedImages = ref<any[]>([])
const aiProgressText = ref('正在OCR识别聊天文本...')
const submitLoading = ref(false)

const steps = [
  { title: '选择图片' },
  { title: 'AI识别' },
  { title: '确认信息' },
]

// 表单数据
const formData = ref({
  wechatNickname: '',
  realName: '',
  phone: '',
  location: '',
  studentGrade: '',
  studentAge: undefined as number | undefined,
  customerIntent: '',
  intentionScore: 50,
  customerStage: '',
  estimatedValue: 0,
  estimatedCycle: '',
  dealOpportunity: '',
  aiTags: [] as string[],
  nextSteps: [] as string[],
  salesStrategy: '',
  customerNeeds: [] as string[],
  riskFactors: [] as string[],
})

const intentOptions = [
  { value: '高意向', text: '高意向' },
  { value: '中意向', text: '中意向' },
  { value: '低意向', text: '低意向' },
  { value: '无意向', text: '无意向' },
]

const stageOptions = [
  { value: '初次接触', text: '初次接触' },
  { value: '需求确认', text: '需求确认' },
  { value: '方案沟通', text: '方案沟通' },
  { value: '报价', text: '报价' },
  { value: '成交', text: '成交' },
]

const rules = {
  wechatNickname: {
    rules: [{ required: true, errorMessage: '请输入微信昵称' }],
  },
}

const formRef = ref()
const intentFormRef = ref()

// 返回
const goBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  } else {
    uni.navigateBack()
  }
}

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        selectedImages.value.push({ path, base64: '' })
      })
      convertImagesToBase64()
    },
    fail: (err) => {
      console.error('拍照失败', err)
      uni.showToast({ title: '拍照失败', icon: 'none' })
    },
  })
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - selectedImages.value.length,
    sourceType: ['album'],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        selectedImages.value.push({ path, base64: '' })
      })
      convertImagesToBase64()
    },
    fail: (err) => {
      console.error('选择图片失败', err)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

// 转换图片为base64
const convertImagesToBase64 = async () => {
  for (let i = 0; i < selectedImages.value.length; i++) {
    const img = selectedImages.value[i]
    if (!img.base64) {
      try {
        const base64 = await imageToBase64(img.path)
        img.base64 = base64
      } catch (err) {
        console.error('转换base64失败', err)
      }
    }
  }
}

// 图片转base64
const imageToBase64 = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => {
        resolve(`data:image/jpeg;base64,${res.data}`)
      },
      fail: reject,
    })
  })
}

// 移除图片
const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

// 清空图片
const clearImages = () => {
  selectedImages.value = []
}

// 开始AI识别
const startAI = async () => {
  if (selectedImages.value.length === 0) {
    uni.showToast({ title: '请先选择聊天截图', icon: 'none' })
    return
  }

  currentStep.value = 1
  aiProgressText.value = '正在OCR识别聊天文本...'

  try {
    // 确保所有图片都已转换为base64
    await convertImagesToBase64()

    const imageBase64List = selectedImages.value.map((img) => img.base64)

    // 调用API
    const res = await uni.request({
      url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/customer/smart-create`,
      method: 'POST',
      data: {
        imageBase64List,
        knownInfo: {},
      },
      header: {
        'Content-Type': 'application/json',
        // TODO: 添加token认证
      },
    })

    if (res.statusCode === 200 && res.data) {
      const data = res.data as any
      fillFormData(data)
      currentStep.value = 2
      uni.showToast({ title: 'AI识别完成！', icon: 'success' })
    } else {
      throw new Error('识别失败')
    }
  } catch (err: any) {
    console.error('AI识别失败', err)
    uni.showToast({
      title: err.message || 'AI识别失败，请重试',
      icon: 'none',
      duration: 3000,
    })
    currentStep.value = 0
  }
}

// 填充表单数据
const fillFormData = (data: any) => {
  formData.value.wechatNickname = data.basicInfo.wechatNickname || ''
  formData.value.realName = data.basicInfo.realName || ''
  formData.value.phone = data.basicInfo.phone || ''
  formData.value.location = data.basicInfo.location || ''
  formData.value.studentGrade = data.basicInfo.studentGrade || ''
  formData.value.studentAge = data.basicInfo.studentAge

  formData.value.customerIntent = data.intentInfo.customerIntent || ''
  formData.value.intentionScore = data.intentInfo.intentionScore || 50
  formData.value.customerStage = data.intentInfo.customerStage || ''
  formData.value.estimatedValue = data.intentInfo.estimatedValue || 0
  formData.value.estimatedCycle = data.intentInfo.estimatedCycle || ''
  formData.value.dealOpportunity = data.intentInfo.dealOpportunity || ''

  formData.value.aiTags = data.tags.aiTags || []

  formData.value.nextSteps = data.followUpAdvice.nextSteps || []
  formData.value.salesStrategy = data.followUpAdvice.salesStrategy || ''
  formData.value.customerNeeds = data.followUpAdvice.customerNeeds || []
  formData.value.riskFactors = data.followUpAdvice.riskFactors || []
}

// 提交创建客户
const submitCreate = async () => {
  try {
    await formRef.value.validate()

    submitLoading.value = true

    // TODO: 调用创建客户API
    // await uni.request({
    //   url: '/api/customer',
    //   method: 'POST',
    //   data: formData.value
    // })

    uni.showToast({ title: '客户创建成功！', icon: 'success' })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    console.error('创建客户失败', err)
    if (err.message) {
      uni.showToast({ title: err.message, icon: 'none' })
    }
  } finally {
    submitLoading.value = false
  }
}

onLoad(() => {
  console.log('智能创建客户页面加载')
})
</script>

<style lang="scss" scoped>
.smart-create-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 44px;
}

.steps-wrapper {
  padding: 20px;
  background-color: #ffffff;
}

.step-content {
  padding: 20px;

  &.analyzing {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }
}

.upload-area {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;

  .tip-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;

    .tip-title {
      font-size: 18px;
      color: #303133;
      margin-top: 16px;
    }

    .tip-sub {
      font-size: 14px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .btn-group {
    display: flex;
    gap: 16px;
    justify-content: center;

    button {
      flex: 1;
      height: 44px;
      border-radius: 8px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &.btn-camera {
        background-color: #409EFF;
        color: #ffffff;
      }

      &.btn-album {
        background-color: #67C23A;
        color: #ffffff;
      }
    }
  }
}

.image-preview {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    text {
      font-size: 14px;
      color: #606266;
    }

    .btn-clear {
      font-size: 14px;
      color: #F56C6C;
      background-color: transparent;
      border: none;
      padding: 0;
    }
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .preview-item {
      position: relative;
      width: 100%;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
      }

      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        background-color: rgba(245, 108, 108, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .loading-text {
    font-size: 16px;
    color: #606266;
  }

  .loading-sub {
    font-size: 14px;
    color: #909399;
  }
}

.form-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  padding-bottom: 100px;
}

.score-display,
.money-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;

  text {
    font-size: 16px;
    color: #303133;
  }

  .score-unit,
  .money-unit {
    font-size: 14px;
    color: #909399;
  }
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
}

.advice-wrapper {
  padding: 12px;

  .advice-item {
    margin-bottom: 16px;

    .advice-label {
      display: block;
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }

    .advice-text {
      font-size: 14px;
      color: #303133;
      line-height: 1.6;
    }

    .advice-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.footer-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background-color: #ffffff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  z-index: 999;

  button {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;

    &.btn-default {
      background-color: #ffffff;
      color: #606266;
      border: 1px solid #DCDFE6;
    }

    &.btn-primary {
      background-color: #409EFF;
      color: #ffffff;
      border: none;

      &:disabled {
        background-color: #A0CFFF;
      }
    }
  }
}
</style>
