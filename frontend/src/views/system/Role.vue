<template>
  <div class="role-page">
    <el-card class="header-card">
      <div class="page-header">
        <h2>角色权限管理</h2>
        <el-button type="primary" @click="handleCreate" :icon="Plus">
          新增角色
        </el-button>
      </div>
    </el-card>

    <el-card>
      <!-- 角色列表 -->
      <el-table :data="roleList" border v-loading="loading">
        <el-table-column prop="id" label="角色ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="角色标识" width="150" />
        <el-table-column prop="dataScope" label="数据范围" width="150">
          <template #default="{ row }">
            <el-tag :type="getDataScopeType(row.dataScope)">
              {{ getDataScopeLabel(row.dataScope) }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" size="small" @click="handlePermission(row)">
              配置权限
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :disabled="row.isSystem"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="formData.roleKey" placeholder="例如：admin, sales, manager" />
        </el-form-item>
        <el-form-item label="数据范围" prop="dataScope">
          <el-select v-model="formData.dataScope" placeholder="请选择数据范围">
            <el-option label="全部数据" value="all" />
            <el-option label="本校区数据" value="campus" />
            <el-option label="本部门数据" value="department" />
            <el-option label="个人数据" value="self" />
          </el-select>
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

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="配置权限"
      width="600px"
    >
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        :props="{ children: 'children', label: 'label' }"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  type Role,
  type CreateRoleParams,
} from '@/api/role'

// 角色列表
const roleList = ref<Role[]>([])
const loading = ref(false)

// 加载角色列表
const loadRoles = async () => {
  loading.value = true
  try {
    const data = await getRoleList()
    roleList.value = data
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: 0,
  roleName: '',
  roleKey: '',
  dataScope: 'self',
  status: 1,
  remark: '',
})

// 表单验证规则
const formRules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }],
}

// 权限配置
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref()
const currentRole = ref<any>(null)
const checkedPermissions = ref<number[]>([])

// 权限树
const permissionTree = ref([
  {
    id: 1,
    label: '客户管理',
    children: [
      { id: 11, label: '查看客户列表' },
      { id: 12, label: '新增客户' },
      { id: 13, label: '编辑客户' },
      { id: 14, label: '删除客户' },
      { id: 15, label: '查看客户详情' },
      { id: 16, label: '添加跟进记录' },
    ],
  },
  {
    id: 2,
    label: '订单管理',
    children: [
      { id: 21, label: '查看订单列表' },
      { id: 22, label: '新增订单' },
      { id: 23, label: '编辑订单' },
      { id: 24, label: '删除订单' },
      { id: 25, label: '订单导入导出' },
    ],
  },
  {
    id: 3,
    label: '财务管理',
    children: [
      { id: 31, label: '查看财务统计' },
      { id: 32, label: '查看提成管理' },
      { id: 33, label: '发放提成' },
      { id: 34, label: '导出财务报表' },
    ],
  },
  {
    id: 4,
    label: '数据分析',
    children: [
      { id: 41, label: '查看数据看板' },
      { id: 42, label: '查看销售漏斗' },
      { id: 43, label: '查看高级分析' },
      { id: 44, label: '查看团队排行榜' },
    ],
  },
  {
    id: 5,
    label: '系统管理',
    children: [
      { id: 51, label: '用户管理' },
      { id: 52, label: '部门管理' },
      { id: 53, label: '校区管理' },
      { id: 54, label: '字典管理' },
      { id: 55, label: '角色管理' },
      { id: 56, label: '操作日志' },
    ],
  },
])

// 获取数据范围标签
const getDataScopeLabel = (scope: string) => {
  const map: Record<string, string> = {
    all: '全部数据',
    campus: '本校区数据',
    department: '本部门数据',
    self: '个人数据',
  }
  return map[scope] || scope
}

// 获取数据范围类型
const getDataScopeType = (scope: string) => {
  const map: Record<string, any> = {
    all: 'danger',
    campus: 'warning',
    department: 'success',
    self: 'info',
  }
  return map[scope] || 'info'
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑角色'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    await updateRoleStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      await loadRoles()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 配置权限
const handlePermission = (row: any) => {
  currentRole.value = row
  // 根据角色加载已有权限（示例）
  if (row.roleKey === 'admin') {
    checkedPermissions.value = [11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 53, 54, 55, 56]
  } else if (row.roleKey === 'sales') {
    checkedPermissions.value = [11, 12, 13, 15, 16, 21, 22, 23, 41]
  } else {
    checkedPermissions.value = []
  }
  permissionDialogVisible.value = true
}

// 保存权限
const handleSavePermission = () => {
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]

  ElMessage.success(`已为角色 ${currentRole.value?.roleName} 配置 ${allKeys.length} 项权限`)
  permissionDialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const params: CreateRoleParams = {
        name: formData.roleName,
        code: formData.roleKey,
        description: formData.remark,
        status: formData.status,
      }

      if (formData.id) {
        await updateRole(formData.id, params)
        ElMessage.success('更新成功')
      } else {
        await createRole(params)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      await loadRoles()
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = 0
  formData.roleName = ''
  formData.roleKey = ''
  formData.dataScope = 'self'
  formData.status = 1
  formData.remark = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="scss">
.role-page {
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
    }
  }
}
</style>
