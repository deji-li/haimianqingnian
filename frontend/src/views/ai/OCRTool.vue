<template>
  <div class="ocr-tool">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <el-icon class="mr-2 text-blue-500">
              <Document />
            </el-icon>
            <span class="text-xl font-semibold">OCR文字识别</span>
          </div>
          <div class="flex items-center space-x-4">
            <el-button @click="validateConfig" :loading="validating" type="info">
              检查配置
            </el-button>
            <el-button @click="showSettings = true" type="primary">
              配置设置
            </el-button>
          </div>
        </div>
      </template>

      <!-- 配置状态提示 -->
      <el-alert
        v-if="configStatus"
        :title="configStatus.message"
        :type="configStatus.valid ? 'success' : 'warning'"
        show-icon
        :closable="false"
        class="mb-4"
      />

      <!-- 上传区域 -->
      <div class="upload-section">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept="image/*"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将图片拖拽到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png/gif/bmp 格式，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>

        <!-- 已选择的文件 -->
        <div v-if="selectedFile" class="mt-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div class="flex items-center">
              <el-icon class="mr-2 text-green-500">
                <Check />
              </el-icon>
              <span>{{ selectedFile.name }}</span>
              <span class="ml-2 text-sm text-gray-500">
                ({{ formatFileSize(selectedFile.size) }})
              </span>
            </div>
            <el-button @click="clearFile" size="small" type="danger" text>
              移除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 识别选项 -->
      <div v-if="selectedFile" class="options-section mt-6">
        <h3 class="text-lg font-medium mb-4">识别选项</h3>
        <el-form :model="ocrOptions" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="识别模式">
                <el-radio-group v-model="ocrMode">
                  <el-radio label="accurate">高精度</el-radio>
                  <el-radio label="basic">标准版</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="语言类型">
                <el-select v-model="ocrOptions.languageType" placeholder="选择语言类型">
                  <el-option label="中英文混合" value="CHN_ENG" />
                  <el-option label="仅中文" value="CHN" />
                  <el-option label="仅英文" value="ENG" />
                  <el-option label="仅葡萄牙语" value="POR" />
                  <el-option label="仅法语" value="FRE" />
                  <el-option label="仅德语" value="GER" />
                  <el-option label="仅西班牙语" value="SPA" />
                  <el-option label="仅俄语" value="RUS" />
                  <el-option label="仅日语" value="JAP" />
                  <el-option label="仅韩语" value="KOR" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="其他选项">
                <div class="space-y-2">
                  <el-checkbox v-model="ocrOptions.detectDirection">
                    检测图像朝向
                  </el-checkbox>
                  <el-checkbox v-model="ocrOptions.probability">
                    返回置信度
                  </el-checkbox>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="mt-6">
          <el-button
            @click="recognizeText"
            :loading="recognizing"
            type="primary"
            size="large"
            :disabled="!selectedFile"
          >
            <el-icon class="mr-2">
              <MagicStick />
            </el-icon>
            开始识别
          </el-button>
        </div>
      </div>

      <!-- 识别结果 -->
      <div v-if="recognitionResult" class="result-section mt-6">
        <h3 class="text-lg font-medium mb-4">识别结果</h3>

        <!-- 统计信息 -->
        <div class="mb-4">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="识别区域数" :value="recognitionResult.wordsResultCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="字符数" :value="extractedText.length" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="识别耗时" :value="recognitionTime" suffix="ms" />
            </el-col>
            <el-col :span="6">
              <el-button @click="copyText" type="success" size="small">
                <el-icon class="mr-1">
                  <CopyDocument />
                </el-icon>
                复制文本
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 识别文本 -->
        <div class="result-text">
          <el-input
            v-model="extractedText"
            type="textarea"
            :rows="10"
            readonly
            placeholder="识别的文本将显示在这里"
          />
        </div>

        <!-- 详细结果（如果有位置信息） -->
        <div v-if="showDetailedResults" class="mt-4">
          <el-collapse>
            <el-collapse-item title="详细识别结果">
              <div class="detailed-results">
                <div
                  v-for="(item, index) in recognitionResult.wordsResult"
                  :key="index"
                  class="mb-3 p-3 border rounded"
                >
                  <div class="font-medium mb-1">{{ item.words }}</div>
                  <div v-if="item.location" class="text-sm text-gray-600">
                    位置: 左{{ item.location.left }}, 上{{ item.location.top }},
                    宽{{ item.location.width }}, 高{{ item.location.height }}
                  </div>
                  <div v-if="item.probability" class="text-sm text-gray-600">
                    置信度: {{ (item.probability.average * 100).toFixed(2) }}%
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>

    <!-- 配置设置对话框 -->
    <el-dialog v-model="showSettings" title="百度OCR配置设置" width="600px">
      <el-form :model="configForm" label-width="120px">
        <el-form-item label="API Key">
          <el-input
            v-model="configForm.apiKey"
            placeholder="百度OCR API Key"
            show-password
          />
        </el-form-item>
        <el-form-item label="Secret Key">
          <el-input
            v-model="configForm.secretKey"
            placeholder="百度OCR Secret Key"
            show-password
          />
        </el-form-item>
        <el-form-item label="App ID">
          <el-input
            v-model="configForm.appId"
            placeholder="百度OCR App ID"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="configForm.isActive" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="configForm.remark"
            type="textarea"
            :rows="3"
            placeholder="配置备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end space-x-4">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button @click="saveConfig" type="primary" :loading="savingConfig">
            保存配置
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  UploadFilled,
  Check,
  MagicStick,
  CopyDocument,
} from '@element-plus/icons-vue'
import { ocrApi } from '@/api/ocr'
import { aiApiKeyApi } from '@/api/aiApiKey'

// 响应式数据
const selectedFile = ref<File | null>(null)
const recognizing = ref(false)
const recognitionResult = ref<any>(null)
const recognitionTime = ref(0)
const configStatus = ref<any>(null)
const validating = ref(false)
const showSettings = ref(false)
const savingConfig = ref(false)
const ocrMode = ref('accurate')

// OCR识别选项
const ocrOptions = ref({
  detectDirection: false,
  languageType: 'CHN_ENG',
  detectRisk: 'false',
  vertexesLocation: false,
  probability: false,
})

// 配置表单
const configForm = ref({
  apiKey: '',
  secretKey: '',
  appId: '',
  isActive: true,
  remark: '百度OCR配置',
})

// 计算属性
const extractedText = computed(() => {
  if (!recognitionResult.value) return ''
  return recognitionResult.value.wordsResult
    .map((item: any) => item.words)
    .join('\n')
})

const showDetailedResults = computed(() => {
  return recognitionResult.value?.wordsResult?.some((item: any) =>
    item.location || item.probability
  )
})

// 文件大小格式化
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理文件选择
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
  recognitionResult.value = null
}

// 清除文件
const clearFile = () => {
  selectedFile.value = null
  recognitionResult.value = null
}

// 复制文本
const copyText = async () => {
  try {
    await navigator.clipboard.writeText(extractedText.value)
    ElMessage.success('文本已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动选择文本复制')
  }
}

// 验证配置
const validateConfig = async () => {
  validating.value = true
  try {
    const response = await ocrApi.validateConfig()
    configStatus.value = response.data
    if (response.data.valid) {
      ElMessage.success('百度OCR配置验证成功')
    } else {
      ElMessage.warning('百度OCR配置验证失败: ' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('配置验证请求失败')
    configStatus.value = {
      valid: false,
      message: '配置验证请求失败'
    }
  } finally {
    validating.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  if (!configForm.value.apiKey || !configForm.value.secretKey || !configForm.value.appId) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  savingConfig.value = true
  try {
    const configData = {
      provider: 'baidu_ocr',
      apiKey: configForm.value.apiKey,
      apiUrl: 'https://aip.baidubce.com/oauth/2.0/token',
      appId: configForm.value.appId,
      secretKey: configForm.value.secretKey,
      isActive: configForm.value.isActive,
      remark: configForm.value.remark,
    }

    // 检查是否已存在百度OCR配置
    const existingConfigs = await aiApiKeyApi.getList()
    const existingBaiduOcr = existingConfigs.data.find((config: any) => config.provider === 'baidu_ocr')

    if (existingBaiduOcr) {
      // 更新现有配置
      await aiApiKeyApi.update(existingBaiduOcr.id, configData)
      ElMessage.success('百度OCR配置更新成功')
    } else {
      // 创建新配置
      await aiApiKeyApi.create(configData)
      ElMessage.success('百度OCR配置创建成功')
    }

    showSettings.value = false
    await validateConfig()
  } catch (error) {
    ElMessage.error('保存配置失败')
  } finally {
    savingConfig.value = false
  }
}

// 文字识别
const recognizeText = async () => {
  if (!selectedFile.value) return

  recognizing.value = true
  const startTime = Date.now()

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('languageType', ocrOptions.value.languageType)
    formData.append('detectDirection', ocrOptions.value.detectDirection.toString())
    formData.append('probability', ocrOptions.value.probability.toString())

    const apiUrl = ocrMode.value === 'accurate'
      ? '/api/ai-tools/baidu-ocr/recognize'
      : '/api/ai-tools/baidu-ocr/recognize/basic'

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      recognitionResult.value = result.data
      recognitionTime.value = Date.now() - startTime
      ElMessage.success('OCR识别完成')
    } else {
      ElMessage.error(result.message || 'OCR识别失败')
    }
  } catch (error) {
    ElMessage.error('OCR识别请求失败')
  } finally {
    recognizing.value = false
  }
}

// 初始化
onMounted(async () => {
  await validateConfig()

  // 尝试加载现有配置
  try {
    const configs = await aiApiKeyApi.getList()
    const baiduOcrConfig = configs.data.find((config: any) => config.provider === 'baidu_ocr')
    if (baiduOcrConfig) {
      configForm.value = {
        apiKey: baiduOcrConfig.apiKey || '',
        secretKey: baiduOcrConfig.secretKey || '',
        appId: baiduOcrConfig.appId || '',
        isActive: baiduOcrConfig.isActive || true,
        remark: baiduOcrConfig.remark || '百度OCR配置',
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
})
</script>

<style scoped>
.ocr-tool {
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  margin: 20px 0;
}

.options-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.result-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.result-text {
  margin-top: 16px;
}

.detailed-results {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style>