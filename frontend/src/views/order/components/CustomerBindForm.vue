<template>
  <div class="customer-bind-form">
    <el-form
      ref="formRef"
      :model="bindForm"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="绑定方式">
        <el-radio-group v-model="bindType">
          <el-radio label="search">搜索现有客户</el-radio>
          <el-radio label="create">创建新客户</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 搜索现有客户 -->
      <template v-if="bindType === 'search'">
        <el-form-item label="搜索客户" prop="keyword">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入客户姓名、手机号或微信昵称搜索"
            @input="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item
          v-if="searchResults.length > 0"
          label="选择客户"
          prop="customerId"
        >
          <el-select
            v-model="bindForm.customerId"
            placeholder="请选择要绑定的客户"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="customer in searchResults"
              :key="customer.id"
              :label="`${customer.wechatNickname} (${customer.phone || '无手机号'})`"
              :value="customer.id"
            >
              <div style="display: flex; justify-content: space-between;">
                <span>{{ customer.wechatNickname }}</span>
                <span style="color: #999;">{{ customer.phone || '无手机号' }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-else-if="searchKeyword && !searchLoading"
          label="搜索结果"
        >
          <el-alert
            title="未找到匹配的客户"
            type="info"
            :closable="false"
            show-icon
          />
        </el-form-item>
      </template>

      <!-- 创建新客户 -->
      <template v-else>
        <el-form-item label="微信昵称" prop="wechatNickname">
          <el-input
            v-model="bindForm.wechatNickname"
            placeholder="请输入客户微信昵称"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="bindForm.phone"
            placeholder="请输入客户手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="bindForm.realName"
            placeholder="请输入客户真实姓名"
          />
        </el-form-item>

        <el-form-item label="客户来源" prop="source">
          <el-select
            v-model="bindForm.source"
            placeholder="请选择客户来源"
            style="width: 100%"
          >
            <el-option label="海绵青年GO" value="海绵青年GO" />
            <el-option label="小程序导入" value="小程序导入" />
            <el-option label="手工录入" value="手工录入" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="绑定备注" prop="remark">
        <el-input
          v-model="bindForm.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入绑定原因或备注信息（可选）"
        />
      </el-form-item>
    </el-form>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确认绑定
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { searchCustomers, createCustomer, bindOrderToCustomer } from '@/api/customer'

interface BindForm {
  customerId?: number
  wechatNickname: string
  phone: string
  realName: string
  source: string
  remark: string
}

interface Props {
  orderId: number
}

interface Emits {
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<InstanceType<typeof ElForm>>()
const bindType = ref<'search' | 'create'>('search')
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const submitting = ref(false)

const bindForm = reactive<BindForm>({
  customerId: undefined,
  wechatNickname: '',
  phone: '',
  realName: '',
  source: '手工录入',
  remark: '',
})

// 表单验证规则
const formRules = {
  customerId: [
    { required: true, message: '请选择要绑定的客户', trigger: 'change' }
  ],
  wechatNickname: [
    { required: true, message: '请输入客户微信昵称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入客户手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入客户真实姓名', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择客户来源', trigger: 'change' }
  ]
}

// 监听绑定方式变化，清空表单
watch(bindType, () => {
  bindForm.customerId = undefined
  bindForm.wechatNickname = ''
  bindForm.phone = ''
  bindForm.realName = ''
  bindForm.source = '手工录入'
  bindForm.remark = ''
  searchResults.value = []
  searchKeyword.value = ''
})

// 搜索客户
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await searchCustomers(searchKeyword.value.trim())
    searchResults.value = response.data || []
  } catch (error: any) {
    console.error('搜索客户失败:', error)
    ElMessage.error(error.message || '搜索客户失败')
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    return // 验证失败，不继续执行
  }

  submitting.value = true
  try {
    let customerId = bindForm.customerId

    // 如果是创建新客户，先创建客户
    if (bindType.value === 'create') {
      const customerData = {
        wechatNickname: bindForm.wechatNickname,
        phone: bindForm.phone,
        realName: bindForm.realName,
        source: bindForm.source,
        customerIntent: '中意向',
        lifecycleStage: '线索'
      }

      const createResponse = await createCustomer(customerData)
      customerId = createResponse.data.id
    }

    // 绑定订单到客户
    if (!customerId) {
      throw new Error('客户ID获取失败')
    }

    await bindOrderToCustomer(customerId, props.orderId)
    ElMessage.success('订单绑定成功')
    emit('success')
  } catch (error: any) {
    console.error('绑定订单失败:', error)
    ElMessage.error(error.message || '绑定订单失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.customer-bind-form {
  padding: 20px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-actions .el-button {
  margin-left: 12px;
}
</style>