<template>
  <div class="operation-daily-report">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总日报数" :value="stats.totalReports">
            <template #suffix>篇</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总浏览量" :value="stats.totalViews">
            <template #suffix>次</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总播放量" :value="stats.totalPlays">
            <template #suffix>次</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总评论数" :value="stats.totalComments">
            <template #suffix>条</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主列表卡片 -->
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>运营日报列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建日报
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>

          <el-form-item label="运营人员">
            <el-select
              v-model="queryForm.operatorId"
              placeholder="全部"
              clearable
              filterable
            >
              <el-option
                v-for="user in operatorList"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="账号">
            <el-select
              v-model="queryForm.accountId"
              placeholder="全部"
              clearable
              filterable
            >
              <el-option
                v-for="account in accountList"
                :key="account.id"
                :label="account.accountName"
                :value="account.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="handleExport" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="reportDate" label="日期" width="120" />
        <el-table-column prop="accountName" label="账号名称" min-width="150" />
        <el-table-column prop="platformType" label="平台" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformType(row.platformType)">
              {{ row.platformType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />
        <el-table-column prop="updateCount" label="更新数" width="80" align="right" />
        <el-table-column prop="contentTags" label="内容标签" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in (row.contentTags || '').split(',')"
              :key="tag"
              size="small"
              style="margin-right: 5px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="浏览量" width="120">
          <template #default="{ row }">
            {{ formatRange(row.viewMin, row.viewMax) }}
          </template>
        </el-table-column>
        <el-table-column label="播放量" width="120">
          <template #default="{ row }">
            {{ formatRange(row.playMin, row.playMax) }}
          </template>
        </el-table-column>
        <el-table-column label="评论数" width="120">
          <template #default="{ row }">
            {{ formatRange(row.commentMin, row.commentMax) }}
          </template>
        </el-table-column>
        <el-table-column label="私信数" width="120">
          <template #default="{ row }">
            {{ formatRange(row.messageMin, row.messageMax) }}
          </template>
        </el-table-column>
        <el-table-column label="状态变化" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.accountStatusChanged" type="warning">
              {{ row.newStatus }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日报日期" prop="reportDate">
              <el-date-picker
                v-model="form.reportDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号" prop="accountId">
              <el-select
                v-model="form.accountId"
                placeholder="选择账号"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="account in accountList"
                  :key="account.id"
                  :label="account.accountName"
                  :value="account.id"
                >
                  <span>{{ account.accountName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ account.platformType }} - {{ account.city }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="更新次数" prop="updateCount">
              <el-input-number
                v-model="form.updateCount"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内容标签">
              <el-input
                v-model="form.contentTags"
                placeholder="用逗号分隔多个标签"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">数据范围</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="浏览量范围" prop="viewMin">
              <div style="display: flex; gap: 10px; align-items: center">
                <el-input-number v-model="form.viewMin" :min="0" />
                <span>~</span>
                <el-input-number v-model="form.viewMax" :min="0" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="播放量范围" prop="playMin">
              <div style="display: flex; gap: 10px; align-items: center">
                <el-input-number v-model="form.playMin" :min="0" />
                <span>~</span>
                <el-input-number v-model="form.playMax" :min="0" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评论数范围" prop="commentMin">
              <div style="display: flex; gap: 10px; align-items: center">
                <el-input-number v-model="form.commentMin" :min="0" />
                <span>~</span>
                <el-input-number v-model="form.commentMax" :min="0" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="私信数范围" prop="messageMin">
              <div style="display: flex; gap: 10px; align-items: center">
                <el-input-number v-model="form.messageMin" :min="0" />
                <span>~</span>
                <el-input-number v-model="form.messageMax" :min="0" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">账号状态</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态是否变化">
              <el-switch v-model="form.accountStatusChanged" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新状态" v-if="form.accountStatusChanged">
              <el-select v-model="form.newStatus" placeholder="选择新状态">
                <el-option label="正常" value="正常" />
                <el-option label="风险" value="风险" />
                <el-option label="封号" value="封号" />
                <el-option label="掉号" value="掉号" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="日报详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="日报日期">
          {{ currentRow.reportDate }}
        </el-descriptions-item>
        <el-descriptions-item label="账号名称">
          {{ currentRow.accountName }}
        </el-descriptions-item>
        <el-descriptions-item label="平台">
          {{ currentRow.platformType }}
        </el-descriptions-item>
        <el-descriptions-item label="城市">
          {{ currentRow.city }}
        </el-descriptions-item>
        <el-descriptions-item label="运营人员">
          {{ currentRow.operatorName }}
        </el-descriptions-item>
        <el-descriptions-item label="更新次数">
          {{ currentRow.updateCount }}
        </el-descriptions-item>
        <el-descriptions-item label="内容标签" :span="2">
          {{ currentRow.contentTags || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览量">
          {{ formatRange(currentRow.viewMin, currentRow.viewMax) }}
        </el-descriptions-item>
        <el-descriptions-item label="播放量">
          {{ formatRange(currentRow.playMin, currentRow.playMax) }}
        </el-descriptions-item>
        <el-descriptions-item label="评论数">
          {{ formatRange(currentRow.commentMin, currentRow.commentMax) }}
        </el-descriptions-item>
        <el-descriptions-item label="私信数">
          {{ formatRange(currentRow.messageMin, currentRow.messageMax) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态变化">
          {{ currentRow.accountStatusChanged ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="新状态">
          {{ currentRow.newStatus || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRow.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download } from '@element-plus/icons-vue';
import { operationApi } from '@/api/operation';
import { userApi } from '@/api/user';

// 查询表单
const queryForm = reactive({
  dateRange: [],
  operatorId: null,
  accountId: null,
  page: 1,
  pageSize: 20,
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

// 统计数据
const stats = reactive({
  totalReports: 0,
  totalViews: 0,
  totalPlays: 0,
  totalComments: 0,
  totalMessages: 0,
});

// 账号和运营人员列表
const accountList = ref([]);
const operatorList = ref([]);

// 对话框相关
const dialogVisible = ref(false);
const detailVisible = ref(false);
const dialogTitle = computed(() => (form.id ? '编辑日报' : '新建日报'));
const formRef = ref(null);
const submitting = ref(false);
const exporting = ref(false);
const currentRow = ref(null);

// 表单数据
const form = reactive({
  id: null,
  reportDate: '',
  accountId: null,
  updateCount: 0,
  contentTags: '',
  viewMin: 0,
  viewMax: 0,
  playMin: 0,
  playMax: 0,
  commentMin: 0,
  commentMax: 0,
  messageMin: 0,
  messageMax: 0,
  accountStatusChanged: false,
  newStatus: '',
  remark: '',
});

// 表单验证规则
const formRules = {
  reportDate: [{ required: true, message: '请选择日报日期', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账号', trigger: 'change' }],
  updateCount: [{ required: true, message: '请输入更新次数', trigger: 'blur' }],
  viewMin: [{ required: true, message: '请输入浏览量最小值', trigger: 'blur' }],
  playMin: [{ required: true, message: '请输入播放量最小值', trigger: 'blur' }],
  commentMin: [{ required: true, message: '请输入评论数最小值', trigger: 'blur' }],
  messageMin: [{ required: true, message: '请输入私信数最小值', trigger: 'blur' }],
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;

    const params = {
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      operatorId: queryForm.operatorId,
      accountId: queryForm.accountId,
    };

    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startDate = queryForm.dateRange[0];
      params.endDate = queryForm.dateRange[1];
    }

    const res = await operationApi.getDailyReportList(params);
    tableData.value = res.data.list || [];
    total.value = res.data.total || 0;

    // 加载统计数据
    await loadStats();
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    const params = {};
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startDate = queryForm.dateRange[0];
      params.endDate = queryForm.dateRange[1];
    }
    if (queryForm.operatorId) {
      params.operatorId = queryForm.operatorId;
    }

    const res = await operationApi.getDailyReportStats(params);
    Object.assign(stats, res.data);
  } catch (error) {
    console.error('加载统计数据失败', error);
  }
};

// 加载账号列表
const loadAccounts = async () => {
  try {
    const res = await operationApi.getAccountList();
    accountList.value = res.data.list || [];
  } catch (error) {
    console.error('加载账号列表失败', error);
  }
};

// 加载运营人员列表
const loadOperators = async () => {
  try {
    const res = await userApi.getList({ roleId: 5 }); // 假设roleId=5为运营角色
    operatorList.value = res.data.list || [];
  } catch (error) {
    console.error('加载运营人员列表失败', error);
  }
};

// 查询
const handleQuery = () => {
  queryForm.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  queryForm.dateRange = [];
  queryForm.operatorId = null;
  queryForm.accountId = null;
  queryForm.page = 1;
  loadData();
};

// 新建
const handleCreate = () => {
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  Object.assign(form, {
    ...row,
    accountStatusChanged: Boolean(row.accountStatusChanged),
  });
  dialogVisible.value = true;
};

// 查看详情
const handleView = (row) => {
  currentRow.value = row;
  detailVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条日报吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await operationApi.deleteDailyReport(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    submitting.value = true;

    const data = {
      ...form,
      accountStatusChanged: form.accountStatusChanged ? 1 : 0,
    };

    if (form.id) {
      await operationApi.updateDailyReport(form.id, data);
      ElMessage.success('更新成功');
    } else {
      await operationApi.createDailyReport(data);
      ElMessage.success('创建成功');
    }

    dialogVisible.value = false;
    loadData();
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败');
    }
  } finally {
    submitting.value = false;
  }
};

// 导出
const handleExport = async () => {
  try {
    exporting.value = true;

    const params = {
      operatorId: queryForm.operatorId,
      accountId: queryForm.accountId,
    };

    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startDate = queryForm.dateRange[0];
      params.endDate = queryForm.dateRange[1];
    }

    const blob = await operationApi.exportDailyReports(params);

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `运营日报_${new Date().getTime()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    reportDate: '',
    accountId: null,
    updateCount: 0,
    contentTags: '',
    viewMin: 0,
    viewMax: 0,
    playMin: 0,
    playMax: 0,
    commentMin: 0,
    commentMax: 0,
    messageMin: 0,
    messageMax: 0,
    accountStatusChanged: false,
    newStatus: '',
    remark: '',
  });
};

// 对话框关闭
const handleDialogClose = () => {
  resetForm();
  formRef.value?.clearValidate();
};

// 格式化范围
const formatRange = (min, max) => {
  if (min === max) return min.toString();
  return `${min} ~ ${max}`;
};

// 获取平台标签类型
const getPlatformType = (platform) => {
  const map = {
    小红书: 'danger',
    抖音: '',
    视频号: 'success',
  };
  return map[platform] || 'info';
};

onMounted(() => {
  loadData();
  loadAccounts();
  loadOperators();
});
</script>

<style scoped lang="scss">
.operation-daily-report {
  .stats-row {
    margin-bottom: 20px;
  }

  .main-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filter-bar {
      margin-bottom: 20px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
