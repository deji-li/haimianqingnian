<template>
  <div class="dictionary-page">
    <el-card class="header-card">
      <div class="page-header">
        <h2>字典管理</h2>
        <div class="actions">
          <el-button type="warning" @click="handleInit" :icon="Refresh">
            初始化默认数据
          </el-button>
          <el-button type="primary" @click="handleCreate" :icon="Plus">
            新增字典
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card>
      <!-- 筛选 -->
      <el-form inline>
        <el-form-item label="字典类型">
          <el-select v-model="queryParams.dictType" clearable placeholder="请选择" style="width: 200px">
            <el-option label="客户意向" value="customer_intent" />
            <el-option label="流量来源" value="traffic_source" />
            <el-option label="订单状态" value="order_status" />
            <el-option label="客户阶段" value="customer_stage" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable placeholder="请选择" style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList" :icon="Search">查询</el-button>
          <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="dataList" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="dictType" label="字典类型" width="150">
          <template #default="{ row }">
            <el-tag>{{ getDictTypeLabel(row.dictType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dictLabel" label="字典标签" width="150" />
        <el-table-column prop="dictValue" label="字典值" width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-select v-model="formData.dictType" placeholder="请选择字典类型">
            <el-option label="客户意向" value="customer_intent" />
            <el-option label="流量来源" value="traffic_source" />
            <el-option label="订单状态" value="order_status" />
            <el-option label="客户阶段" value="customer_stage" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="formData.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="formData.dictValue" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import {
  getDictionaryList,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  initDefaultData
} from '@/api/dictionary'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  dictType: '',
  status: undefined as number | undefined,
})

// 数据列表
const dataList = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典')
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: 0,
  dictType: '',
  dictLabel: '',
  dictValue: '',
  sort: 0,
  status: 1,
  remark: '',
})

// 表单验证规则
const formRules: FormRules = {
  dictType: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
}

// 获取字典类型标签
const getDictTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    customer_intent: '客户意向',
    traffic_source: '流量来源',
    order_status: '订单状态',
    customer_stage: '客户阶段',
  }
  return map[type] || type
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const data = await getDictionaryList()
    // 前端过滤数据
    let filteredData = data || []

    // 按字典类型过滤
    if (queryParams.dictType) {
      filteredData = filteredData.filter(item => item.dictType === queryParams.dictType)
    }

    // 按状态过滤
    if (queryParams.status !== undefined) {
      filteredData = filteredData.filter(item => item.status === queryParams.status)
    }

    // 分页
    total.value = filteredData.length
    const start = (queryParams.page - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    dataList.value = filteredData.slice(start, end)
  } catch (error: any) {
    ElMessage.error(error.message || '获取字典列表失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryParams.page = 1
  queryParams.dictType = ''
  queryParams.status = undefined
  fetchList()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增字典'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑字典'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    await updateDictionary(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    // 还原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该字典项吗？', '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      await deleteDictionary(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 初始化默认数据
const handleInit = () => {
  ElMessageBox.confirm(
    '确定要初始化默认字典数据吗？这将创建系统预置的字典项。',
    '提示',
    {
      type: 'warning',
    }
  ).then(async () => {
    try {
      await initDefaultData()
      ElMessage.success('初始化成功')
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '初始化失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (formData.id) {
        await updateDictionary(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createDictionary(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = 0
  formData.dictType = ''
  formData.dictLabel = ''
  formData.dictValue = ''
  formData.sort = 0
  formData.status = 1
  formData.remark = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.dictionary-page {
  .header-card {
    margin-bottom: 20px;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      .actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>
