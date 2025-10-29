<template>
  <div class="campus-management">
    <el-card shadow="never">
      <el-button type="primary" @click="handleAdd">新增校区</el-button>

      <el-table :data="tableData" stripe v-loading="loading" style="margin-top: 16px">
        <el-table-column prop="campusName" label="校区名称" width="150" />
        <el-table-column prop="campusCode" label="校区编码" width="120" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="managerName" label="负责人" width="100" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="校区名称" required>
              <el-input v-model="form.campusName" placeholder="请输入校区名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="校区编码" required>
              <el-input v-model="form.campusCode" placeholder="请输入校区编码" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="校区地址">
          <el-input v-model="form.address" placeholder="请输入校区地址" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCampusList,
  createCampus,
  updateCampus,
  deleteCampus,
  toggleCampusStatus,
  type Campus,
} from '@/api/campus'

const loading = ref(false)
const tableData = ref<Campus[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const form = reactive({
  id: 0,
  campusName: '',
  campusCode: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  sort: 0,
  description: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    tableData.value = await getCampusList()
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增校区'
  form.id = 0
  form.campusName = ''
  form.campusCode = ''
  form.address = ''
  form.contactPerson = ''
  form.contactPhone = ''
  form.sort = 0
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row: Campus) => {
  dialogTitle.value = '编辑校区'
  form.id = row.id
  form.campusName = row.campusName
  form.campusCode = row.campusCode
  form.address = row.address || ''
  form.contactPerson = row.contactPerson || ''
  form.contactPhone = row.contactPhone || ''
  form.sort = row.sort
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.campusName) {
    ElMessage.warning('请输入校区名称')
    return
  }
  if (!form.campusCode) {
    ElMessage.warning('请输入校区编码')
    return
  }

  try {
    if (form.id) {
      await updateCampus(form.id, {
        campusName: form.campusName,
        campusCode: form.campusCode,
        address: form.address,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        sort: form.sort,
        description: form.description,
      })
    } else {
      await createCampus({
        campusName: form.campusName,
        campusCode: form.campusCode,
        address: form.address,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        sort: form.sort,
        description: form.description,
      })
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleToggleStatus = async (row: Campus) => {
  try {
    await toggleCampusStatus(row.id)
    ElMessage.success('操作成功')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row: Campus) => {
  try {
    await ElMessageBox.confirm('确认删除该校区吗？', '提示', { type: 'warning' })
    await deleteCampus(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.campus-management {
  // 样式
}
</style>
