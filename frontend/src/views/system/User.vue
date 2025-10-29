<template>
  <div class="user-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.keyword"
            placeholder="用户名/姓名/手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="角色">
          <el-select
            v-model="queryParams.roleCode"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="销售主管" value="sales_manager" />
            <el-option label="销售" value="sales" />
            <el-option label="校区主管" value="campus_manager" />
            <el-option label="运营" value="operator" />
            <el-option label="财务" value="finance" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="部门">
          <el-select
            v-model="queryParams.departmentId"
            placeholder="全部部门"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :label="dept.departmentName"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="校区">
          <el-select
            v-model="queryParams.campusId"
            placeholder="全部校区"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="action-card" shadow="never">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="roleName" label="角色" width="120" />
        <el-table-column prop="departmentName" label="部门" width="140" />
        <el-table-column prop="campusName" label="校区" width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="角色" prop="roleCode">
          <el-select v-model="formData.roleCode" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="销售主管" value="sales_manager" />
            <el-option label="销售" value="sales" />
            <el-option label="校区主管" value="campus_manager" />
            <el-option label="运营" value="operator" />
            <el-option label="财务" value="finance" />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="所属部门">
          <el-select v-model="formData.departmentId" placeholder="请选择部门" clearable style="width: 100%">
            <el-option
              v-for="dept in flatDepartmentList"
              :key="dept.id"
              :label="dept.departmentName"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属校区">
          <el-select
            v-model="formData.campusIds"
            multiple
            placeholder="请选择校区（可多选）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
          <span style="color: #999; font-size: 12px; margin-left: 8px;">
            第一个选择的校区将作为主校区
          </span>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordFormData"
        :rules="passwordFormRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordFormData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleSubmitResetPassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
  type User,
  type UserQuery,
  type CreateUserParams,
} from '@/api/user'
import { getDepartmentList, type Department } from '@/api/department'
import { getCampusList, type Campus } from '@/api/campus'
import dayjs from 'dayjs'

const loading = ref(false)
const userList = ref<User[]>([])
const total = ref(0)

const departmentList = ref<Department[]>([])
const campusList = ref<Campus[]>([])
const flatDepartmentList = ref<Department[]>([])

const queryParams = reactive<UserQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  roleCode: '',
  status: undefined,
  departmentId: undefined,
  campusId: undefined,
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<any>({
  username: '',
  password: '',
  realName: '',
  roleCode: '',
  phone: '',
  email: '',
  departmentId: undefined,
  campusId: undefined,
  campusIds: [],
  status: 1,
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()
const currentUserId = ref(0)

const passwordFormData = reactive({
  newPassword: '',
})

const passwordFormRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
}

// 获取用户列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    userList.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.roleCode = ''
  queryParams.status = undefined
  queryParams.departmentId = undefined
  queryParams.campusId = undefined
  queryParams.page = 1
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  Object.assign(formData, {
    username: row.username,
    realName: row.realName,
    roleCode: row.roleCode,
    phone: row.phone,
    email: row.email,
    departmentId: row.departmentId,
    campusId: row.campusId,
    campusIds: row.campusIds || [],
    status: row.status,
  })
  formData.id = row.id
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: User) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  })
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value && formData.id) {
          await updateUser(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createUser(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('Failed to submit:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    username: '',
    password: '',
    realName: '',
    roleCode: '',
    phone: '',
    email: '',
    departmentId: undefined,
    campusId: undefined,
    campusIds: [],
    status: 1,
  })
  delete formData.id
}

// 重置密码
const handleResetPassword = (row: User) => {
  currentUserId.value = row.id
  passwordFormData.newPassword = ''
  passwordDialogVisible.value = true
}

// 提交重置密码
const handleSubmitResetPassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await resetPassword(currentUserId.value, passwordFormData.newPassword)
        ElMessage.success('密码重置成功')
        passwordDialogVisible.value = false
      } catch (error) {
        console.error('Failed to reset password:', error)
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 启用/禁用
const handleToggleStatus = (row: User) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await toggleUserStatus(row.id)
      ElMessage.success(`${action}成功`)
      fetchData()
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  })
}

// 格式化日期
const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const data = await getDepartmentList()
    departmentList.value = data
    flatDepartmentList.value = flattenDepartments(data)
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
}

// 获取校区列表
const fetchCampuses = async () => {
  try {
    const data = await getCampusList()
    campusList.value = data
  } catch (error) {
    console.error('Failed to fetch campuses:', error)
  }
}

// 扁平化部门树
const flattenDepartments = (departments: Department[]): Department[] => {
  const result: Department[] = []
  const flatten = (list: Department[], level = 0) => {
    list.forEach(dept => {
      const prefix = '　'.repeat(level)
      result.push({
        ...dept,
        departmentName: prefix + dept.departmentName
      })
      if (dept.children && dept.children.length > 0) {
        flatten(dept.children, level + 1)
      }
    })
  }
  flatten(departments)
  return result
}

onMounted(() => {
  fetchData()
  fetchDepartments()
  fetchCampuses()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.user-list-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);

  .search-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 24px;
    }

    :deep(.el-form-item__label) {
      color: var(--xhs-text-primary);
      font-weight: 500;
    }

    :deep(.el-button--primary) {
      @include xhs-button-primary;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper) {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(255, 184, 0, 0.1);
      }

      &.is-focus {
        box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.1);
      }
    }
  }

  .action-card {
    @include xhs-card;
    margin-bottom: 20px;
    border: none;
    background: white;

    :deep(.el-card__body) {
      padding: 20px 24px;
    }

    :deep(.el-button--primary) {
      background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
      border: none;
      color: white;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 184, 0, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  :deep(.el-card:not(.search-card):not(.action-card)) {
    @include xhs-card;
    border: none;

    .el-card__body {
      padding: 24px;
    }

    .el-table {
      border-radius: 12px;
      overflow: hidden;

      th {
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, rgba(255, 201, 64, 0.03) 100%);
        color: var(--xhs-text-primary);
        font-weight: 600;
      }

      tr {
        transition: all 0.2s ease;

        &:hover {
          background: linear-gradient(90deg, rgba(255, 184, 0, 0.03) 0%, transparent 100%);
        }
      }

      .el-button.is-link {
        color: var(--xhs-primary);
        font-weight: 500;

        &:hover {
          color: var(--xhs-primary-dark);
        }
      }

      .el-tag {
        border-radius: 8px;
        font-weight: 500;
      }

      .el-switch {
        :deep(.el-switch__core) {
          &.is-checked {
            background-color: var(--xhs-primary);
          }
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px 0;

    :deep(.el-pagination) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 201, 64, 0.08) 100%);
          color: var(--xhs-primary);
        }

        &.is-active {
          background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
          color: white;
          font-weight: 600;
        }
      }
    }
  }

  :deep(.el-dialog) {
    border-radius: 16px;

    .el-dialog__header {
      border-bottom: 1px solid #f0f0f0;
      padding: 20px 24px;

      .el-dialog__title {
        font-weight: 600;
        color: var(--xhs-text-primary);
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-form-item__label {
      color: var(--xhs-text-primary);
      font-weight: 500;
    }

    .el-input__wrapper,
    .el-select .el-input__wrapper,
    .el-textarea__inner {
      border-radius: 8px;
    }

    .el-button--primary {
      @include xhs-button-primary;
    }
  }
}
</style>
