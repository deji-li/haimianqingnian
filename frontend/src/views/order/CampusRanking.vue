<template>
  <div class="campus-ranking">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>校区订单排行榜</span>
          <el-radio-group v-model="period" size="small" @change="loadRankings">
            <el-radio-button label="day">今日</el-radio-button>
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
            <el-radio-button label="year">近一年</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 自定义日期范围 -->
      <div v-if="period === 'custom'" class="custom-date-range">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadRankings"
          style="margin-bottom: 20px"
        />
      </div>

      <!-- 排行榜表格 -->
      <el-table
        :data="rankings"
        border
        stripe
        v-loading="loading"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.rank <= 3"
              :type="row.rank === 1 ? 'danger' : row.rank === 2 ? 'warning' : 'success'"
              effect="dark"
            >
              {{ row.rank }}
            </el-tag>
            <span v-else>{{ row.rank }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="campusName" label="校区名称" min-width="150">
          <template #default="{ row }">
            <div class="campus-name">
              <el-icon v-if="row.rank === 1" color="#f56c6c"><Trophy /></el-icon>
              <span>{{ row.campusName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderCount" label="订单数" width="120" align="right">
          <template #default="{ row }">
            <strong style="color: #409eff">{{ row.orderCount }}</strong>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalAmount"
          label="总金额(元)"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span style="color: #67c23a">{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="newStudentCount"
          label="新学员订单"
          width="120"
          align="right"
        >
          <template #default="{ row }">
            {{ row.newStudentCount }}
          </template>
        </el-table-column>

        <el-table-column label="订单占比" width="200">
          <template #default="{ row }">
            <div class="progress-wrapper">
              <el-progress
                :percentage="calculatePercentage(row.orderCount)"
                :stroke-width="16"
                :color="getProgressColor(row.rank)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计汇总 -->
      <div class="statistics-summary" v-if="rankings.length > 0">
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="总订单数" :value="totalOrderCount">
              <template #suffix>单</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="总金额" :value="totalAmount">
              <template #suffix>元</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="TOP3订单数" :value="top3OrderCount">
              <template #suffix>单 ({{ top3Percentage }}%)</template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && rankings.length === 0" description="暂无排行数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Trophy } from '@element-plus/icons-vue';
import { getCampusRanking } from '@/api/order';

// 时间范围
const period = ref('month');
const dateRange = ref([]);

// 排行榜数据
const rankings = ref([]);
const loading = ref(false);

// 加载排行榜数据
const loadRankings = async () => {
  try {
    loading.value = true;

    const params = {
      period: period.value,
    };

    if (period.value === 'custom' && dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const res = await getCampusRanking(params);
    rankings.value = res.data || [];
  } catch (error) {
    ElMessage.error('加载排行榜失败');
  } finally {
    loading.value = false;
  }
};

// 计算总订单数
const totalOrderCount = computed(() => {
  return rankings.value.reduce((sum, item) => sum + item.orderCount, 0);
});

// 计算总金额
const totalAmount = computed(() => {
  return rankings.value.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2);
});

// 计算TOP3订单数
const top3OrderCount = computed(() => {
  return rankings.value
    .slice(0, 3)
    .reduce((sum, item) => sum + item.orderCount, 0);
});

// 计算TOP3占比
const top3Percentage = computed(() => {
  if (totalOrderCount.value === 0) return 0;
  return ((top3OrderCount.value / totalOrderCount.value) * 100).toFixed(1);
});

// 计算订单占比百分比
const calculatePercentage = (count) => {
  if (totalOrderCount.value === 0) return 0;
  return Math.round((count / totalOrderCount.value) * 100);
};

// 获取进度条颜色
const getProgressColor = (rank) => {
  if (rank === 1) return '#f56c6c';
  if (rank === 2) return '#e6a23c';
  if (rank === 3) return '#67c23a';
  return '#409eff';
};

// 获取行样式
const getRowClassName = ({ row }) => {
  if (row.rank === 1) return 'rank-1';
  if (row.rank === 2) return 'rank-2';
  if (row.rank === 3) return 'rank-3';
  return '';
};

// 格式化金额
const formatMoney = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

onMounted(() => {
  loadRankings();
});
</script>

<style scoped lang="scss">
.campus-ranking {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .custom-date-range {
    margin-bottom: 20px;
  }

  .campus-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .progress-wrapper {
    padding: 0 10px;
  }

  .statistics-summary {
    margin-top: 20px;
  }

  // 排名行高亮样式
  :deep(.rank-1) {
    background-color: #fef0f0 !important;
  }

  :deep(.rank-2) {
    background-color: #fdf6ec !important;
  }

  :deep(.rank-3) {
    background-color: #f0f9ff !important;
  }
}
</style>
