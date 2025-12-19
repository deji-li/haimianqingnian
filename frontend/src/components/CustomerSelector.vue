<template>
  <div class="customer-selector">
    <!-- 搜索框 -->
    <el-input
      v-model="searchKeyword"
      placeholder="搜索客户姓名、手机号..."
      :prefix-icon="Search"
      class="search-input"
      @input="handleSearch"
    />

    <!-- 客户列表 -->
    <div class="customer-list" v-loading="loading">
      <div
        v-for="customer in filteredCustomers"
        :key="customer.id"
        class="customer-item"
        @click="handleSelect(customer)"
      >
        <div class="customer-info">
          <div class="customer-name">{{ customer.name || '未知客户' }}</div>
          <div class="customer-phone">{{ customer.phone || '暂无手机号' }}</div>
        </div>
        <div class="customer-tags">
          <el-tag
            v-if="customer.level"
            :type="getLevelTagType(customer.level)"
            size="small"
          >
            {{ getLevelText(customer.level) }}
          </el-tag>
          <el-tag
            v-if="customer.status"
            :type="getStatusTagType(customer.status)"
            size="small"
          >
            {{ getStatusText(customer.status) }}
          </el-tag>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredCustomers.length === 0"
        description="暂无客户数据"
        :image-size="80"
      />
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getCustomerList } from '@/api/customer'
import type { Customer } from '@/api/customer'

// 定义事件
const emit = defineEmits<{
  select: [customer: Customer]
}>()

// 状态管理
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const customers = ref<Customer[]>([])

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  if (!searchKeyword.value) {
    return customers.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return customers.value.filter(customer =>
    (customer.name && customer.name.toLowerCase().includes(keyword)) ||
    (customer.phone && customer.phone.includes(keyword))
  )
})

// 获取客户列表
const loadCustomers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value
    }

    const response = await getCustomerList(params)

    if (response.statusCode === 200 && response.data) {
      customers.value = response.data.items || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('加载客户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadCustomers()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadCustomers()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadCustomers()
}

// 选择客户
const handleSelect = (customer: Customer) => {
  emit('select', customer)
}

// 客户等级标签
const getLevelTagType = (level: string) => {
  const levelMap: Record<string, string> = {
    'A': 'success',
    'B': 'primary',
    'C': 'warning',
    'D': 'info'
  }
  return levelMap[level] || 'info'
}

const getLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    'A': 'A类客户',
    'B': 'B类客户',
    'C': 'C类客户',
    'D': 'D类客户'
  }
  return levelMap[level] || `${level}类客户`
}

// 客户状态标签
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'potential': 'warning',
    'lost': 'danger',
    'converted': 'primary'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '活跃',
    'potential': '潜在',
    'lost': '流失',
    'converted': '已转化'
  }
  return statusMap[status] || status
}

// 组件挂载
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
.customer-selector {
  .search-input {
    margin-bottom: 16px;
  }

  .customer-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .customer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f7fa;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      &:last-child {
        border-bottom: none;
      }

      .customer-info {
        flex: 1;

        .customer-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .customer-phone {
          font-size: 12px;
          color: #909399;
        }
      }

      .customer-tags {
        display: flex;
        gap: 6px;
      }
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}
</style>