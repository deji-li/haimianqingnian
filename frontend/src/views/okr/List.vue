<template>
  <div class="okr-list">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">进行中</p>
              <p class="stat-value">{{ statistics.active.count }}</p>
              <p class="stat-progress">平均完成度: {{ statistics.active.avgProgress.toFixed(1) }}%</p>
            </div>
            <el-icon class="stat-icon" color="#409EFF"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">已完成</p>
              <p class="stat-value">{{ statistics.completed.count }}</p>
              <p class="stat-progress">平均完成度: {{ statistics.completed.avgProgress.toFixed(1) }}%</p>
            </div>
            <el-icon class="stat-icon" color="#67C23A"><CircleCheck /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">草稿</p>
              <p class="stat-value">{{ statistics.draft.count }}</p>
              <p class="stat-progress">待启动</p>
            </div>
            <el-icon class="stat-icon" color="#E6A23C"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">OKR总数</p>
              <p class="stat-value">{{ statistics.total.count }}</p>
              <p class="stat-progress">总体完成度: {{ statistics.total.avgProgress.toFixed(1) }}%</p>
            </div>
            <el-icon class="stat-icon" color="#FFB800"><List /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作 -->
    <el-card shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="类型">
          <el-select v-model="queryForm.type" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="个人" value="individual" />
            <el-option label="团队" value="team" />
            <el-option label="公司" value="company" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增OKR</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="title" label="OKR标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ownerName" label="负责人" width="100" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'individual'" type="info">个人</el-tag>
            <el-tag v-else-if="row.type === 'team'" type="primary">团队</el-tag>
            <el-tag v-else type="warning">公司</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="110" />
        <el-table-column prop="endDate" label="结束日期" width="110" />
        <el-table-column prop="progress" label="完成度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :color="getProgressColor(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'active'" type="primary">进行中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else type="warning">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keyResultCount" label="KR数量" width="80" align="center" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'draft'"
              link
              type="success"
              size="small"
              @click="handleActivate(row)"
            >
              启动
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="OKR标题" required>
          <el-input v-model="form.title" placeholder="请输入OKR标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="类型" required>
              <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
                <el-option label="个人" value="individual" />
                <el-option label="团队" value="team" />
                <el-option label="公司" value="company" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始日期" required>
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束日期" required>
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>关键结果（KR）</el-divider>

        <div v-for="(kr, index) in form.keyResults" :key="index" class="kr-item">
          <el-row :gutter="16">
            <el-col :span="10">
              <el-input v-model="kr.description" placeholder="关键结果描述" />
            </el-col>
            <el-col :span="5">
              <el-input-number
                v-model="kr.targetValue"
                placeholder="目标值"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="4">
              <el-input v-model="kr.unit" placeholder="单位" />
            </el-col>
            <el-col :span="3">
              <el-input-number
                v-model="kr.weight"
                placeholder="权重"
                :min="1"
                :max="10"
                controls-position="right"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="2">
              <el-button type="danger" link @click="removeKR(index)">删除</el-button>
            </el-col>
          </el-row>
        </div>

        <el-button type="primary" plain @click="addKR" style="width: 100%; margin-top: 10px">
          + 添加关键结果
        </el-button>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import {
  getOkrList,
  createOkr,
  updateOkr,
  deleteOkr,
  getOkrStatistics,
  type Okr,
  type OkrStatistics,
} from '@/api/okr'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const tableData = ref<Okr[]>([])
const total = ref(0)

const queryForm = reactive({
  page: 1,
  pageSize: 20,
  type: '',
  status: '',
})

const statistics = ref<OkrStatistics>({
  draft: { count: 0, avgProgress: 0 },
  active: { count: 0, avgProgress: 0 },
  completed: { count: 0, avgProgress: 0 },
  cancelled: { count: 0, avgProgress: 0 },
  total: { count: 0, avgProgress: 0 },
})

const dialogVisible = ref(false)
const dialogTitle = ref('')

const form = reactive({
  id: 0,
  title: '',
  description: '',
  ownerId: 0,
  type: 'individual',
  startDate: '',
  endDate: '',
  keyResults: [] as any[],
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOkrList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getOkrStatistics()
    statistics.value = res
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryForm.type = ''
  queryForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增OKR'
  form.id = 0
  form.title = ''
  form.description = ''
  form.ownerId = userStore.userInfo?.id || 0
  form.type = 'individual'
  form.startDate = ''
  form.endDate = ''
  form.keyResults = []
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Okr) => {
  dialogTitle.value = '编辑OKR'
  form.id = row.id
  form.title = row.title
  form.description = row.description || ''
  form.ownerId = row.ownerId
  form.type = row.type
  form.startDate = row.startDate
  form.endDate = row.endDate
  form.keyResults = []
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: Okr) => {
  router.push(`/okr/detail/${row.id}`)
}

// 保存
const handleSave = async () => {
  if (!form.title) {
    ElMessage.warning('请输入OKR标题')
    return
  }
  if (!form.type) {
    ElMessage.warning('请选择类型')
    return
  }
  if (!form.startDate || !form.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }

  try {
    if (form.id) {
      await updateOkr(form.id, {
        title: form.title,
        description: form.description,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
      })
    } else {
      await createOkr({
        title: form.title,
        description: form.description,
        ownerId: form.ownerId,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        keyResults: form.keyResults,
      })
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 启动
const handleActivate = async (row: Okr) => {
  try {
    await updateOkr(row.id, { status: 'active' })
    ElMessage.success('启动成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

// 删除
const handleDelete = async (row: Okr) => {
  try {
    await ElMessageBox.confirm('确认删除该OKR吗？', '提示', { type: 'warning' })
    await deleteOkr(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStatistics()
  } catch (error) {
    // 用户取消
  }
}

// 添加KR
const addKR = () => {
  form.keyResults.push({
    description: '',
    targetValue: 0,
    unit: '',
    weight: 1,
  })
}

// 删除KR
const removeKR = (index: number) => {
  form.keyResults.splice(index, 1)
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67C23A'
  if (progress >= 50) return '#FFB800'
  return '#F56C6C'
}

onMounted(() => {
  fetchData()
  fetchStatistics()
})
</script>

<style scoped lang="scss">
.okr-list {
  .stat-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    .stat-icon {
      font-size: 48px;
      opacity: 0.3;
    }

    .stat-info {
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-progress {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .kr-item {
    margin-bottom: 10px;
  }
}
</style>
