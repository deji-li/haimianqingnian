<template>
  <div class="wework-config">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">企业微信配置</span>
          <el-button type="primary" @click="testConnection" :loading="testingConnection">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
        </div>
      </template>
    </el-card>

    <div class="content-container">
      <el-card class="config-card">
        <template #header>
          <span>基础配置</span>
        </template>

        <el-form
          ref="configFormRef"
          :model="configForm"
          :rules="configRules"
          label-width="120px"
          class="config-form"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="企业ID" prop="corpId">
                <el-input
                  v-model="configForm.corpId"
                  placeholder="请输入企业微信企业ID"
                  show-password
                />
                <div class="form-tip">
                  企业微信后台管理中心的"企业ID"
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="应用Secret" prop="appSecret">
                <el-input
                  v-model="configForm.appSecret"
                  placeholder="请输入应用Secret"
                  type="password"
                  show-password
                />
                <div class="form-tip">
                  自建应用的Secret，请妥善保管
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="回调Token" prop="token">
                <el-input
                  v-model="configForm.token"
                  placeholder="请输入回调Token（可选）"
                />
                <div class="form-tip">
                  用于接收企业微信事件推送的验证Token
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="回调AESKey" prop="aesKey">
                <el-input
                  v-model="configForm.aesKey"
                  placeholder="请输入回调AESKey（可选）"
                />
                <div class="form-tip">
                  用于接收企业微信事件推送的加密密钥
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Webhook地址" prop="webhookUrl">
            <el-input
              v-model="configForm.webhookUrl"
              placeholder="请输入Webhook回调地址（可选）"
            />
            <div class="form-tip">
              用于接收企业微信事件推送的服务器地址
            </div>
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch
              v-model="configForm.isActive"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="config-card">
        <template #header>
          <span>同步策略</span>
        </template>

        <el-form :model="configForm.syncStrategy" label-width="120px" class="config-form">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="同步间隔">
                <el-input-number
                  v-model="configForm.syncStrategy.syncInterval"
                  :min="1"
                  :max="1440"
                  placeholder="60"
                />
                <span class="input-suffix">分钟</span>
                <div class="form-tip">
                  自动同步的时间间隔
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="增量同步">
                <el-switch
                  v-model="configForm.syncStrategy.incrementalSync"
                  active-text="启用"
                  inactive-text="禁用"
                />
                <div class="form-tip">
                  只同步有变更的数据，提高效率
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="批量大小">
                <el-input-number
                  v-model="configForm.syncStrategy.batchSize"
                  :min="10"
                  :max="1000"
                  placeholder="100"
                />
                <span class="input-suffix">条/批次</span>
                <div class="form-tip">
                  每次批量处理的记录数
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <div class="action-bar">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">
          保存配置
        </el-button>
      </div>
    </div>

    <!-- 连接测试结果弹窗 -->
    <el-dialog
      v-model="testResultVisible"
      title="连接测试结果"
      width="600px"
    >
      <div v-if="testResult" class="test-result">
        <div class="result-header">
          <el-icon
            :class="testResult.success ? 'success' : 'error'"
            size="24"
          >
            <CircleCheckFilled v-if="testResult.success" />
            <CircleCloseFilled v-else />
          </el-icon>
          <span class="result-title">
            {{ testResult.success ? '连接成功' : '连接失败' }}
          </span>
        </div>
        <div class="result-content">
          <p>{{ testResult.message }}</p>
          <div v-if="testResult.details" class="result-details">
            <h4>详细信息：</h4>
            <ul>
              <li>联系人数量: {{ testResult.details.contactCount }}</li>
              <li>Token状态: {{ testResult.details.tokenStatus }}</li>
              <li v-if="testResult.details.contactError" class="error-item">
                联系人获取错误: {{ testResult.details.contactError }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { getWeWorkConfig, saveWeWorkConfig, testWeWorkConnection } from '@/api/wework'
import type { WeWorkConfig } from '@/api/wework'

const configFormRef = ref()
const saving = ref(false)
const testingConnection = ref(false)
const testResultVisible = ref(false)
const testResult = ref<any>(null)

const configForm = reactive<WeWorkConfig>({
  corpId: '',
  appSecret: '',
  token: '',
  aesKey: '',
  webhookUrl: '',
  syncStrategy: {
    syncInterval: 60,
    incrementalSync: true,
    batchSize: 100,
  },
  isActive: true,
})

const configRules = {
  corpId: [
    { required: true, message: '请输入企业ID', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '企业ID格式不正确', trigger: 'blur' },
  ],
  appSecret: [
    { required: true, message: '请输入应用Secret', trigger: 'blur' },
    { min: 32, message: '应用Secret长度至少32位', trigger: 'blur' },
  ],
  token: [
    { pattern: /^[a-zA-Z0-9_-]*$/, message: 'Token格式不正确', trigger: 'blur' },
  ],
  webhookUrl: [
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' },
  ],
}

const loadConfig = async () => {
  try {
    const config = await getWeWorkConfig()
    if (config) {
      Object.assign(configForm, config)
      if (!config.syncStrategy) {
        configForm.syncStrategy = {
          syncInterval: 60,
          incrementalSync: true,
          batchSize: 100,
        }
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    await saveWeWorkConfig(configForm)
    ElMessage.success('配置保存成功')
  } catch (error) {
    if (error.message) {
      // 表单验证错误
      return
    }
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  try {
    testingConnection.value = true
    testResult.value = await testWeWorkConnection()
    testResultVisible.value = true

    if (testResult.value.success) {
      ElMessage.success('连接测试成功')
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败')
  } finally {
    testingConnection.value = false
  }
}

const resetForm = () => {
  if (configFormRef.value) {
    configFormRef.value.resetFields()
  }
  configForm.syncStrategy = {
    syncInterval: 60,
    incrementalSync: true,
    batchSize: 100,
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.wework-config {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.content-container {
  .config-card {
    margin-bottom: 20px;

    .config-form {
      .form-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      .input-suffix {
        margin-left: 8px;
        color: #909399;
      }
    }
  }

  .action-bar {
    text-align: right;
    padding: 20px 0;
  }
}

.test-result {
  .result-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .success {
      color: #67c23a;
    }

    .error {
      color: #f56c6c;
    }

    .result-title {
      margin-left: 12px;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .result-content {
    color: #606266;

    .result-details {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;

      h4 {
        margin-bottom: 8px;
        color: #303133;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 4px;

          &.error-item {
            color: #f56c6c;
          }
        }
      }
    }
  }
}
</style>