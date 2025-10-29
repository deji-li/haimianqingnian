<template>
  <div class="department-management">
    <el-card shadow="never">
      <el-button type="primary" @click="handleAdd()">新增部门</el-button>

      <el-table
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        stripe
        v-loading="loading"
        style="margin-top: 16px"
      >
        <el-table-column prop="departmentName" label="部门名称" width="200" />
        <el-table-column prop="managerName" label="负责人" width="120" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAdd(row.id)">新增下级</el-button>
            <el-button link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="部门名称" required>
          <el-input v-model="form.departmentName" placeholder="请输入部门名称" />
        </el-form-item>
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
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  type Department,
} from '@/api/department'

const loading = ref(false)
const tableData = ref<Department[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const form = reactive({
  id: 0,
  departmentName: '',
  parentId: undefined as number | undefined,
  sort: 0,
  description: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    tableData.value = await getDepartmentList()
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = (parentId?: number) => {
  dialogTitle.value = parentId ? '新增下级部门' : '新增部门'
  form.id = 0
  form.departmentName = ''
  form.parentId = parentId
  form.sort = 0
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row: Department) => {
  dialogTitle.value = '编辑部门'
  form.id = row.id
  form.departmentName = row.departmentName
  form.parentId = row.parentId
  form.sort = row.sort
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.departmentName) {
    ElMessage.warning('请输入部门名称')
    return
  }

  try {
    if (form.id) {
      await updateDepartment(form.id, {
        departmentName: form.departmentName,
        sort: form.sort,
        description: form.description,
      })
    } else {
      await createDepartment({
        departmentName: form.departmentName,
        parentId: form.parentId,
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

const handleToggleStatus = async (row: Department) => {
  try {
    await toggleDepartmentStatus(row.id)
    ElMessage.success('操作成功')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm('确认删除该部门吗？', '提示', { type: 'warning' })
    await deleteDepartment(row.id)
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
.department-management {
  // 样式
}
</style>
