<template>
  <div class="contact-management">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">企业微信联系人管理</span>
          <div class="header-actions">
            <el-button @click="handleSync" :loading="syncing" type="primary">
              <el-icon><Refresh /></el-icon>
              同步联系人
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :model="searchForm" inline>
          <el-form-item label="基础搜索">
            <el-input
              v-model="searchForm.keyword"
              placeholder="姓名、企业名称、备注、外部用户ID"
              clearable
              @keyup.enter="handleSearch"
              style="width: 250px"
            />
          </el-form-item>
          <el-form-item label="同步状态">
            <el-select v-model="searchForm.syncStatus" placeholder="全部" clearable style="width: 120px">
              <el-option label="待同步" value="pending" />
              <el-option label="已同步" value="synced" />
              <el-option label="同步失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="searchForm.gender" placeholder="全部" clearable style="width: 100px">
              <el-option label="未知" value="unknown" />
              <el-option label="男" value="male" />
              <el-option label="女" value="female" />
            </el-select>
          </el-form-item>
          <el-form-item label="CRM关联">
            <el-select v-model="searchForm.customerAssociated" placeholder="全部" clearable style="width: 120px">
              <el-option label="已关联" :value="true" />
              <el-option label="未关联" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="searchForm.tags"
              placeholder="选择标签"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="添加时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
            <el-button type="info" @click="toggleAdvancedSearch">
              {{ showAdvanced ? '收起' : '高级搜索' }}
              <el-icon>
                <ArrowUp v-if="showAdvanced" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 高级搜索区域 -->
        <el-collapse-transition>
          <div v-show="showAdvanced" class="advanced-search">
            <el-divider content-position="left">高级搜索条件</el-divider>
            <el-form :model="advancedForm" inline>
              <el-form-item label="跟进人员">
                <el-input
                  v-model="advancedForm.followUserId"
                  placeholder="跟进人员ID"
                  clearable
                  style="width: 150px"
                />
              </el-form-item>
              <el-form-item label="联系人类型">
                <el-select v-model="advancedForm.type" placeholder="全部" clearable style="width: 120px">
                  <el-option label="个人" value="single" />
                  <el-option label="外部联系人" value="external" />
                </el-select>
              </el-form-item>
              <el-form-item label="同步时间">
                <el-date-picker
                  v-model="syncDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
              </el-form-item>
              <el-form-item label="有标签">
                <el-switch v-model="advancedForm.hasTags" />
              </el-form-item>
              <el-form-item label="有备注">
                <el-switch v-model="advancedForm.hasRemark" />
              </el-form-item>
              <el-form-item label="有头像">
                <el-switch v-model="advancedForm.hasAvatar" />
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="title">
            联系人列表
            <el-tag v-if="total" type="info" class="total-tag">
              共 {{ total }} 条
            </el-tag>
          </span>
          <div class="table-actions">
            <el-button size="small" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="contactList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="{ row }">
            <div class="name-cell">
              <el-avatar
                v-if="row.avatar"
                :src="row.avatar"
                :size="32"
                class="avatar"
              />
              <span class="name">{{ row.name || '未命名' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="corpName" label="企业名称" min-width="120" />

        <el-table-column prop="position" label="职位" width="120" />

        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="getGenderType(row.gender)" size="small">
              {{ getGenderText(row.gender) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="followUserId" label="跟进人员" width="120" />

        <el-table-column prop="syncStatus" label="同步状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSyncStatusType(row.syncStatus)" size="small">
              {{ getSyncStatusText(row.syncStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="tags" label="标签" min-width="150">
          <template #default="{ row }">
            <div v-if="row.tags && row.tags.length" class="tags-container">
              <el-tag
                v-for="tag in row.tags.slice(0, 3)"
                :key="tag"
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <span v-if="row.tags.length > 3" class="more-tags">
                +{{ row.tags.length - 3 }}
              </span>
            </div>
            <span v-else class="no-tags">暂无标签</span>
          </template>
        </el-table-column>

        <el-table-column prop="syncTime" label="同步时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.syncTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="customerId" label="CRM客户" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.customerId" type="success" size="small">
              已关联
            </el-tag>
            <span v-else class="no-customer">未关联</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.customerId"
              type="success"
              size="small"
              link
              @click="handleViewCustomer(row)"
            >
              查看
            </el-button>
            <el-dropdown trigger="click" @command="(command) => handleCommand(command, row)">
              <el-button size="small" link>
                更多
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="sync" :disabled="row.syncStatus === 'synced'">
                    <el-icon><Refresh /></el-icon>
                    重新同步
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedContacts.length > 0" class="batch-actions">
      <el-card>
        <div class="batch-content">
          <div class="batch-info">
            <span>已选择</span>
            <el-tag type="primary" class="count-tag">{{ selectedContacts.length }}</el-tag>
            <span>个联系人</span>
            <el-button type="text" size="small" @click="handleClearSelection">
              清空选择
            </el-button>
          </div>
          <div class="batch-buttons">
            <el-button size="small" @click="handleBatchSync">
              <el-icon><Refresh /></el-icon>
              批量同步
            </el-button>
            <el-dropdown trigger="click" @command="handleBatchTag">
              <el-button size="small">
                标签管理
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="add">
                    <el-icon><Plus /></el-icon>
                    批量添加标签
                  </el-dropdown-item>
                  <el-dropdown-item command="remove">
                    <el-icon><Minus /></el-icon>
                    批量移除标签
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" @click="handleBatchAssociate">
              <el-icon><Link /></el-icon>
              批量关联客户
            </el-button>
            <el-button size="small" @click="handleBatchExport">
              <el-icon><Download /></el-icon>
              批量导出
            </el-button>
            <el-button size="small" type="warning" @click="handleBatchDisassociate">
              <el-icon><Remove /></el-icon>
              取消关联
            </el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 批量标签对话框 -->
    <el-dialog
      v-model="batchTagDialogVisible"
      :title="batchTagType === 'add' ? '批量添加标签' : '批量移除标签'"
      width="500px"
    >
      <el-form ref="batchTagFormRef" :model="batchTagForm" label-width="100px">
        <el-form-item :label="batchTagType === 'add' ? '添加标签' : '移除标签'">
          <el-select
            v-model="batchTagForm.tags"
            :placeholder="batchTagType === 'add' ? '选择要添加的标签' : '选择要移除的标签'"
            multiple
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="form-tip">
            {{ batchTagType === 'add' ? '可输入新标签名称，多个标签将批量添加到选中的联系人' : '选择要从选中联系人中移除的标签' }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchTagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBatchTag" :loading="batchTagging">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量关联客户对话框 -->
    <el-dialog
      v-model="batchAssociateDialogVisible"
      title="批量关联CRM客户"
      width="600px"
    >
      <el-form ref="batchAssociateFormRef" :model="batchAssociateForm" label-width="120px">
        <el-form-item label="关联方式">
          <el-radio-group v-model="batchAssociateForm.type">
            <el-radio value="match">智能匹配</el-radio>
            <el-radio value="phone">手机号匹配</el-radio>
            <el-radio value="name">姓名匹配</el-radio>
            <el-radio value="manual">手动指定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchAssociateForm.type === 'manual'" label="客户ID">
          <el-input
            v-model="batchAssociateForm.customerId"
            placeholder="请输入要关联的客户ID"
            type="number"
          />
          <div class="form-tip">所有选中的联系人将关联到同一个客户</div>
        </el-form-item>
        <el-form-item v-else-if="batchAssociateForm.type === 'phone'" label="手机号字段">
          <el-input
            v-model="batchAssociateForm.phoneField"
            placeholder="请输入手机号字段名"
          />
          <div class="form-tip">将根据手机号字段匹配CRM客户</div>
        </el-form-item>
        <el-form-item>
          <el-alert
            title="关联说明"
            type="info"
            :closable="false"
            show-icon
          >
            <ul>
              <li>智能匹配：系统自动根据姓名、企业等信息智能匹配</li>
              <li>手机号匹配：根据手机号精确匹配CRM客户</li>
              <li>姓名匹配：根据姓名模糊匹配CRM客户</li>
              <li>手动指定：将所有选中的联系人关联到指定客户</li>
            </ul>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAssociateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBatchAssociate" :loading="batchAssociating">
            开始关联
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Refresh,
  Search,
  RefreshRight,
  Edit,
  Delete,
  ArrowDown,
  User,
  ArrowUp,
  ArrowDown as ArrowDownIcon,
  Plus,
  Minus,
  Link,
  Remove,
  Download,
} from '@element-plus/icons-vue'
import {
  getWeWorkContacts,
  syncWeWorkContacts,
  type WeWorkContact,
} from '@/api/wework'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const syncing = ref(false)
const contactList = ref<WeWorkContact[]>([])
const selectedContacts = ref<WeWorkContact[]>([])
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  syncStatus: '',
  gender: '',
  customerAssociated: null as boolean | null,
  tags: [] as string[],
})

// 高级搜��表单
const advancedForm = reactive({
  followUserId: '',
  type: '',
  hasTags: false,
  hasRemark: false,
  hasAvatar: false,
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)
const syncDateRange = ref<[string, string] | null>(null)

// 高级搜索显示状态
const showAdvanced = ref(false)

// 可用标签列表
const availableTags = ref<string[]>([])

// 批量标签管理
const batchTagDialogVisible = ref(false)
const batchTagType = ref<'add' | 'remove'>('add')
const batchTagging = ref(false)
const batchTagForm = reactive({
  tags: [] as string[],
})

// 批量关联客户
const batchAssociateDialogVisible = ref(false)
const batchAssociating = ref(false)
const batchAssociateForm = reactive({
  type: 'match',
  customerId: null as number | null,
  phoneField: '',
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
})

// 获取联系人列表
const loadContactList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      syncStatus: searchForm.syncStatus,
      gender: searchForm.gender,
    }

    const response = await getWeWorkContacts(params)
    contactList.value = response.list
    total.value = response.total
  } catch (error) {
    console.error('获取联系人列表失败:', error)
    ElMessage.error('获取联系人列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadContactList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    syncStatus: '',
    gender: '',
  })
  pagination.page = 1
  loadContactList()
}

// 刷新
const handleRefresh = () => {
  loadContactList()
}

// 同步联系人
const handleSync = async () => {
  try {
    await ElMessageBox.confirm('确认要同步企业微信联系人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    syncing.value = true
    const response = await syncWeWorkContacts({ syncType: 'full' })

    if (response.success) {
      ElMessage.success(`同步完成！成功：${response.result.successCount}，失败：${response.result.failedCount}`)
      loadContactList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步联系人失败:', error)
      ElMessage.error('同步联系人失败')
    }
  } finally {
    syncing.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: WeWorkContact[]) => {
  selectedContacts.value = selection
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadContactList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadContactList()
}

// 查看详情
const handleViewDetail = (row: WeWorkContact) => {
  router.push(`/system/wework-contact/${row.id}`)
}

// 查看CRM客户
const handleViewCustomer = (row: WeWorkContact) => {
  if (row.customerId) {
    router.push(`/customer/detail/${row.customerId}`)
  }
}

// 操作命令
const handleCommand = async (command: string, row: WeWorkContact) => {
  switch (command) {
    case 'edit':
      // 编辑功能待实现
      ElMessage.info('编辑功能开发中')
      break
    case 'sync':
      // 重新同步单个联系人
      ElMessage.info('重新同步功能开发中')
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

// 删除联系人
const handleDelete = async (row: WeWorkContact) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除联系人"${row.name || row.externalUserId}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 删除逻辑待实现
    ElMessage.success('删除成功')
    loadContactList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除联系人失败:', error)
      ElMessage.error('删除联系人失败')
    }
  }
}

// 批量同步
const handleBatchSync = async () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要同步的联系人')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要同步选中的 ${selectedContacts.value.length} 个联系人吗？`,
      '批量同步',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.success('批量同步功能开发中')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量同步失败:', error)
      ElMessage.error('批量同步失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要删除的联系人')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedContacts.value.length} 个联系人吗？此操作不可恢复！`,
      '批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.success('批量删除功能开发中')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 辅助函数
const getGenderText = (gender: string) => {
  const map = {
    unknown: '未知',
    male: '男',
    female: '女',
  }
  return map[gender] || '未知'
}

const getGenderType = (gender: string) => {
  const map = {
    unknown: 'info',
    male: 'primary',
    female: 'success',
  }
  return map[gender] || 'info'
}

const getSyncStatusText = (status: string) => {
  const map = {
    pending: '待同步',
    synced: '已同步',
    failed: '同步失败',
  }
  return map[status] || status
}

const getSyncStatusType = (status: string) => {
  const map = {
    pending: 'warning',
    synced: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

// 高级搜索切换
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

// 日期范围变化
const handleDateChange = (dates: [string, string] | null) => {
  // 这里可以添加日期筛选逻辑
  console.log('日期范围:', dates)
}

// 清空选择
const handleClearSelection = () => {
  // 清空表格选择
  const tableRef = document.querySelector('.el-table') as any
  if (tableRef && tableRef.clearSelection) {
    tableRef.clearSelection()
  }
  selectedContacts.value = []
}

// 批量标签管理
const handleBatchTag = (command: string) => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要操作的联系人')
    return
  }
  batchTagType.value = command as 'add' | 'remove'
  batchTagForm.tags = []
  batchTagDialogVisible.value = true
}

// 保存批量标签
const handleSaveBatchTag = async () => {
  if (selectedContacts.value.length === 0 || batchTagForm.tags.length === 0) {
    ElMessage.warning('请选择联系人和标签')
    return
  }

  try {
    batchTagging.value = true

    // 这里应该调用批量标签API
    ElMessage.success(`${batchTagType.value === 'add' ? '添加' : '移除'}标签成功`)
    batchTagDialogVisible.value = false
    loadContactList()
  } catch (error) {
    console.error('批量标签操作失败:', error)
    ElMessage.error('批量标签操作失败')
  } finally {
    batchTagging.value = false
  }
}

// 批量关联客户
const handleBatchAssociate = () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要关联的联系人')
    return
  }
  batchAssociateForm.type = 'match'
  batchAssociateForm.customerId = null
  batchAssociateForm.phoneField = ''
  batchAssociateDialogVisible.value = true
}

// 保存批量关联
const handleSaveBatchAssociate = async () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要关联的联系人')
    return
  }

  if (batchAssociateForm.type === 'manual' && !batchAssociateForm.customerId) {
    ElMessage.warning('请输入客户ID')
    return
  }

  try {
    batchAssociating.value = true

    // 这里应该调用批量关联API
    ElMessage.success('批量关联成功')
    batchAssociateDialogVisible.value = false
    loadContactList()
  } catch (error) {
    console.error('批量关联失败:', error)
    ElMessage.error('批量关联失败')
  } finally {
    batchAssociating.value = false
  }
}

// 批量导出
const handleBatchExport = () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要导出的联系人')
    return
  }

  try {
    // 导出逻辑
    const csvData = selectedContacts.value.map(contact => ({
      姓名: contact.name,
      性别: getGenderText(contact.gender),
      职位: contact.position,
      企业名称: contact.corpName,
      外部用户ID: contact.externalUserId,
      同步状态: getSyncStatusText(contact.syncStatus),
      标签: contact.tags?.join(';') || '',
      备注: contact.remark,
    }))

    // 简单的CSV导出
    const csv = convertToCSV(csvData)
    downloadCSV(csv, '企业微信联系人导出.csv')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 批量取消关联
const handleBatchDisassociate = async () => {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要取消关联的联系人')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消选中的 ${selectedContacts.value.length} 个联系人的CRM关联吗？`,
      '批量取消关联',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 这里应该调用批量取消关联API
    ElMessage.success('批量取消关联成功')
    loadContactList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量取消关联失败:', error)
      ElMessage.error('批量取消关联失败')
    }
  }
}

// CSV转换工具函数
const convertToCSV = (data: any[]) => {
  if (!data.length) return ''

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row =>
    headers.map(header => `"${row[header] || ''}"`).join(',')
  )

  return [csvHeaders, ...csvRows].join('\n')
}

// CSV下载工具函数
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 加载可用标签
const loadAvailableTags = async () => {
  try {
    // 这里应该调用获取标签列表的API
    availableTags.value = ['潜在客户', '高意向', '已成交', '待跟进', '重要客户']
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 组件挂载
onMounted(() => {
  loadContactList()
  loadAvailableTags()
})
</script>

<style lang="scss" scoped>
.contact-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .search-area {
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 16px;

    .advanced-search {
      margin-top: 16px;
      padding-top: 16px;
    }
  }
}

.table-card {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .total-tag {
        margin-left: 8px;
      }
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }
  }

  .name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .avatar {
      flex-shrink: 0;
    }

    .name {
      font-weight: 500;
    }
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .tag-item {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .more-tags {
      color: #909399;
      font-size: 12px;
    }
  }

  .no-tags {
    color: #909399;
    font-size: 12px;
  }

  .no-customer {
    color: #909399;
    font-size: 12px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

.batch-actions {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;

  .batch-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .batch-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #606266;

      .count-tag {
        margin: 0 4px;
      }
    }

    .batch-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>