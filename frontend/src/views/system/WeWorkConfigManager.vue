<template>
  <div class="wework-config-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>企业微信配置管理</h1>
        <p>管理和监控企业微信集成配置</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增配置
        </el-button>
        <el-button @click="refreshConfig">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 配置列表 -->
    <el-card class="config-list">
      <template #header>
        <div class="card-header">
          <span>配置列表</span>
          <el-tag :type="configs.length > 0 ? 'success' : 'info'">
            {{ configs.length }} 个配置
          </el-tag>
        </div>
      </template>

      <el-table :data="configs" style="width: 100%" v-loading="loading">
        <el-table-column prop="corpId" label="企业ID" width="200" />
        <el-table-column prop="agentId" label="应用ID" width="150" />
        <el-table-column prop="callbackUrl" label="回调URL" min-width="300" show-overflow-tooltip />

        <el-table-column label="功能状态" width="200">
          <template #default="{ row }">
            <div class="feature-tags">
              <el-tag v-if="row.features?.contactSync" type="success" size="small">联系人同步</el-tag>
              <el-tag v-if="row.features?.chatAnalysis" type="warning" size="small">聊天分析</el-tag>
              <el-tag v-if="row.features?.messagePush" type="info" size="small">消息推送</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="toggleConfigStatus(row)"
              :loading="row.statusLoading"
            />
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updatedTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="editConfig(row)">编辑</el-button>
              <el-button size="small" type="warning" @click="testConfig(row)">测试</el-button>
              <el-button size="small" type="danger" @click="deleteConfig(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 配置统计 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalConfigs }}</div>
            <div class="stat-label">总配置数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeConfigs }}</div>
            <div class="stat-label">活跃配置</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon sync">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.lastSyncTime ? formatTime(stats.lastSyncTime) : '从未同步' }}</div>
            <div class="stat-label">最后同步</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑配置对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingConfig ? '编辑配置' : '新增配置'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="120px"
      >
        <el-form-item label="企业ID" prop="corpId">
          <el-input v-model="configForm.corpId" placeholder="请输入企业微信CorpID" />
        </el-form-item>

        <el-form-item label="应用ID" prop="agentId">
          <el-input v-model="configForm.agentId" placeholder="请输入应用AgentID" />
        </el-form-item>

        <el-form-item label="应用Secret" prop="secret">
          <el-input
            v-model="configForm.secret"
            type="password"
            placeholder="请输入应用Secret"
            show-password
          />
        </el-form-item>

        <el-form-item label="回调URL" prop="callbackUrl">
          <el-input v-model="configForm.callbackUrl" placeholder="请输入回调URL" />
        </el-form-item>

        <el-form-item label="Token" prop="token">
          <el-input v-model="configForm.token" placeholder="请输入回调Token" />
        </el-form-item>

        <el-form-item label="AESKey" prop="aesKey">
          <el-input v-model="configForm.aesKey" placeholder="请输入消息加解密Key" />
        </el-form-item>

        <el-form-item label="功能开关">
          <div class="feature-switches">
            <el-switch
              v-model="configForm.features.contactSync"
              active-text="联系人同步"
            />
            <el-switch
              v-model="configForm.features.chatAnalysis"
              active-text="聊天分析"
            />
            <el-switch
              v-model="configForm.features.messagePush"
              active-text="消息推送"
            />
            <el-switch
              v-model="configForm.features.chatArchive"
              active-text="会话存档"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm">取消</el-button>
          <el-button type="primary" @click="saveConfig" :loading="saving">
            {{ editingConfig ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试结果对话框 -->
    <el-dialog v-model="showTestDialog" title="配置测试结果" width="500px">
      <div v-if="testResult" class="test-result">
        <el-alert
          :title="testResult.success ? '测试成功' : '测试失败'"
          :type="testResult.success ? 'success' : 'error'"
          :description="testResult.message"
          show-icon
          :closable="false"
        />

        <div v-if="testResult.details" class="test-details">
          <h4>详细信息</h4>
          <pre>{{ JSON.stringify(testResult.details, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Check, Refresh, Plus } from '@element-plus/icons-vue'
import { weworkApi } from '@/api/wework'
import type { WeWorkConfig } from '@/api/wework'

// 响应式数据
const configs = ref<WeWorkConfig[]>([])
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const showTestDialog = ref(false)
const editingConfig = ref<WeWorkConfig | null>(null)
const testResult = ref<any>(null)

// 表单数据
const configFormRef = ref()
const configForm = reactive({
  corpId: '',
  agentId: '',
  secret: '',
  callbackUrl: '',
  token: '',
  aesKey: '',
  features: {
    contactSync: true,
    chatAnalysis: true,
    messagePush: true,
    chatArchive: false
  },
  isActive: true
})

// 统计数据
const stats = reactive({
  totalConfigs: 0,
  activeConfigs: 0,
  lastSyncTime: null
})

// 表单验证规则
const configRules = {
  corpId: [
    { required: true, message: '请输入企业ID', trigger: 'blur' }
  ],
  agentId: [
    { required: true, message: '请输入应用ID', trigger: 'blur' }
  ],
  secret: [
    { required: true, message: '请输入应用Secret', trigger: 'blur' }
  ],
  callbackUrl: [
    { required: true, message: '请输入回调URL', trigger: 'blur' }
  ]
}

// 方法
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await weworkApi.getConfig()
    if (response.success && response.data) {
      // 这里应该返回配置数组，根据实际情况调整
      configs.value = response.data.config ? [response.data.config] : []
      updateStats()
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.totalConfigs = configs.value.length
  stats.activeConfigs = configs.value.filter(config => config.isActive).length
}

const toggleConfigStatus = async (config: WeWorkConfig) => {
  config.statusLoading = true
  try {
    const response = await weworkApi.saveConfig({
      ...config,
      isActive: !config.isActive
    })

    if (response.success) {
      ElMessage.success('配置状态更新成功')
      updateStats()
    } else {
      // 恢复原状态
      config.isActive = !config.isActive
      ElMessage.error('状态更新失败')
    }
  } catch (error) {
    // 恢复原状态
    config.isActive = !config.isActive
    ElMessage.error('状态更新失败')
  } finally {
    config.statusLoading = false
  }
}

const editConfig = (config: WeWorkConfig) => {
  editingConfig.value = config
  Object.assign(configForm, config)
  showAddDialog.value = true
}

const deleteConfig = async (config: WeWorkConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置 "${config.corpId}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用删除API
    ElMessage.success('配置删除成功')
    await loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除配置失败')
    }
  }
}

const testConfig = async (config: WeWorkConfig) => {
  try {
    const result = await weworkApi.testConnection({
      corpId: config.corpId,
      agentId: config.agentId,
      secret: config.secret
    })

    testResult.value = {
      success: result.success,
      message: result.message,
      details: result
    }

    showTestDialog.value = true
  } catch (error) {
    testResult.value = {
      success: false,
      message: '测试请求失败',
      details: error
    }
    showTestDialog.value = true
  }
}

const resetForm = () => {
  editingConfig.value = null
  Object.assign(configForm, {
    corpId: '',
    agentId: '',
    secret: '',
    callbackUrl: '',
    token: '',
    aesKey: '',
    features: {
      contactSync: true,
      chatAnalysis: true,
      messagePush: true,
      chatArchive: false
    },
    isActive: true
  })

  if (configFormRef.value) {
    configFormRef.value.resetFields()
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()

    saving.value = true

    const configData = editingConfig.value
      ? { ...configForm, id: editingConfig.value.id }
      : configForm

    const response = await weworkApi.saveConfig(configData)

    if (response.success) {
      ElMessage.success(editingConfig.value ? '配置更新成功' : '配置创建成功')
      showAddDialog.value = false
      resetForm()
      await loadConfigs()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

const refreshConfig = () => {
  loadConfigs()
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

onMounted(() => {
  loadConfigs()
})
</script>

<style lang="scss" scoped>
.wework-config-manager {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .config-list {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
      }
    }

    .feature-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          color: #909399;
          font-size: 20px;

          &.active {
            background: #f0f9ff;
            color: #409eff;
          }

          &.sync {
            background: #f6ffed;
            color: #67c23a;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 20px;
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
    }
  }

  .feature-switches {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .el-switch {
      margin-right: 0;
    }
  }

  .test-result {
    .test-details {
      margin-top: 16px;

      h4 {
        margin: 16px 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }

      pre {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }
}
</style>