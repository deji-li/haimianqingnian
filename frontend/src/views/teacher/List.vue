<template>
  <div class="teacher-list">
    <div class="page-header">
      <h2>老师列表</h2>
      <p class="page-desc">管理所有老师信息，查看详细资料和业绩统计</p>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="老师姓名/手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="校区">
          <el-select
            v-model="searchForm.campusId"
            placeholder="选择校区"
            clearable
            style="width: 150px"
          >
            <el-option label="全部校区" value="" />
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.campusName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部状态" value="" />
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
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

      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加老师
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>

    <!-- 老师列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="teacherList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="displayName" label="老师姓名" width="120">
          <template #default="{ row }">
            {{ row.displayName || row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="campusName" label="所属校区" width="120" />
        <el-table-column prop="level" label="级别" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="完成订单" width="100">
          <template #default="{ row }">
            {{ row.orderCount || 0 }}单
          </template>
        </el-table-column>
        <el-table-column prop="totalSales" label="总销售额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalSales?.toLocaleString() || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCommission" label="总提成" width="120">
          <template #default="{ row }">
            ¥{{ row.totalCommission?.toLocaleString() || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="totalProfit" label="为公司创造利润" width="140">
          <template #default="{ row }">
            ¥{{ row.totalProfit?.toLocaleString() || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑老师对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑老师' : '添加老师'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="老师姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入老师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示名称" prop="displayName">
              <el-input v-model="form.displayName" placeholder="请输入显示名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属校区" prop="campusIds">
              <el-select v-model="form.campusIds" placeholder="选择校区（可多选）" style="width: 100%" multiple>
                <el-option
                  v-for="campus in campusList"
                  :key="campus.id"
                  :label="campus.campusName"
                  :value="campus.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="级别" prop="level">
              <el-input v-model="form.level" placeholder="请输入级别" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="科目" prop="subject">
              <el-input v-model="form.subject" placeholder="请输入科目" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认提成金额" prop="defaultCommissionRate">
              <el-input-number
                v-model="form.defaultCommissionRate"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 8px">元/单</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="在职" value="在职" />
                <el-option label="离职" value="离职" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker
                v-model="form.joinDate"
                type="date"
                placeholder="选择入职日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="银行账号" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="银行名称" prop="bankName">
              <el-input v-model="form.bankName" placeholder="请输入银行名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import {
  getTeacherList,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  type Teacher,
  type TeacherQuery,
  type CreateTeacherParams
} from '@/api/teacher'
import { getCampusList, type Campus } from '@/api/campus'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const teacherList = ref<Teacher[]>([])
const campusList = ref<Campus[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive<TeacherQuery>({
  keyword: '',
  campusId: undefined,
  status: '',
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 表单数据
const form = reactive<CreateTeacherParams & { campusIds?: number[] }>({
  name: '',
  displayName: '',
  phone: '',
  idCard: '',
  bankAccount: '',
  bankName: '',
  subject: '',
  level: '',
  campusIds: [], // 改为数组，支持多校区
  campusId: undefined, // 保留兼容性
  defaultCommissionRate: 0, // 默认提成金额为0
  status: '在职',
  joinDate: '',
  remark: '',
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入老师姓名', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  idCard: [
    { pattern: /^\d{17}[\dX]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  defaultCommissionRate: [
    { type: 'number', min: 0, message: '提成金额必须大于等于0', trigger: 'blur' }
  ],
}

// 获取老师列表
const fetchTeacherList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    const response = await getTeacherList(params)
    teacherList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取老师列表失败:', error)
    ElMessage.error('获取老师列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTeacherList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    campusId: undefined,
    status: '',
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  fetchTeacherList()
}

// 添加老师
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑老师
const handleEdit = (teacher: Teacher) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(form, {
    id: teacher.id,
    name: teacher.name,
    displayName: teacher.displayName,
    phone: teacher.phone,
    idCard: teacher.idCard,
    bankAccount: teacher.bankAccount,
    bankName: teacher.bankName,
    subject: teacher.subject,
    level: teacher.level,
    // 支持多校区：优先使用 campusIds 数组，如果没有则从单个 campusId 转换
    campusIds: teacher.campusIds && teacher.campusIds.length > 0 ? teacher.campusIds : (teacher.campusId ? [teacher.campusId] : []),
    campusId: teacher.campusId, // 保留兼容性
    defaultCommissionRate: teacher.defaultCommissionRate ? Number(teacher.defaultCommissionRate) : 0,
    status: teacher.status,
    joinDate: teacher.joinDate ? new Date(teacher.joinDate) : '',
    remark: teacher.remark,
  })
}

// 查看详情
const handleViewDetail = (teacher: Teacher) => {
  router.push(`/teacher/detail/${teacher.id}`)
}

// 删除老师
const handleDelete = async (teacher: Teacher) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除老师"${teacher.displayName || teacher.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteTeacher(teacher.id)
    ElMessage.success('删除成功')
    fetchTeacherList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除老师失败:', error)
      ElMessage.error('删除老师失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = {
      ...form,
      joinDate: form.joinDate ? form.joinDate.toISOString().split('T')[0] : '',
      // 兼容性处理：如果选择了多个校区，取第一个作为主要校区
      campusId: form.campusIds && form.campusIds.length > 0 ? form.campusIds[0] : undefined,
      // 保留 campusIds 数组用于多校区功能
      campusIds: form.campusIds || [],
    }

    // 移除不需要提交的字段
    delete submitData.id // 只移除id，其他字段保留

    if (isEdit.value) {
      await updateTeacher(form.id as number, submitData)
      ElMessage.success('更新成功')
    } else {
      await createTeacher(submitData)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchTeacherList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitting.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    name: '',
    displayName: '',
    phone: '',
    idCard: '',
    bankAccount: '',
    bankName: '',
    subject: '',
    level: '',
    campusIds: [], // 重置校区数组
    campusId: undefined, // 保留兼容性
    defaultCommissionRate: 0, // 默认提成金额为0
    status: '在职',
    joinDate: '',
    remark: '',
  })
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTeacherList()
}

// 页码改变
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchTeacherList()
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 获取校区列表
const fetchCampusList = async () => {
  try {
    const response = await getCampusList()
    campusList.value = response || []
  } catch (error) {
    console.error('获取校区列表失败:', error)
    ElMessage.error('获取校区列表失败')
  }
}

// 初始化
onMounted(() => {
  fetchCampusList()
  fetchTeacherList()
})
</script>

<style scoped lang="scss">
.teacher-list {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-desc {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 20px;

    .search-form {
      margin-bottom: 16px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
    }
  }

  .table-card {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>