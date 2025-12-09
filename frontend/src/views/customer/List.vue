<template>
  <div class="customer-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <!-- 基础筛选 -->
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.keyword"
            placeholder="微信昵称/微信号/手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="客户意向">
          <el-select
            v-model="queryParams.customerIntent"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in customerIntentOptions.filter(opt => opt && opt.id && opt.dictLabel && opt.dictValue)"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="流量来源">
          <el-select
            v-model="queryParams.trafficSource"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in trafficSourceOptions.filter(opt => opt && opt.id && opt.dictLabel && opt.dictValue)"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
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
          <el-button @click="showAdvancedFilter = !showAdvancedFilter" link>
            <el-icon><Operation /></el-icon>
            {{ showAdvancedFilter ? '收起' : '高级筛选' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选面板 -->
      <el-collapse-transition>
        <div v-show="showAdvancedFilter" class="advanced-filter">
          <el-divider content-position="left">
            <el-icon><Filter /></el-icon>
            高级筛选条件
          </el-divider>

          <el-form :model="queryParams" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="运营人员">
                  <el-select
                    v-model="queryParams.operatorId"
                    placeholder="请选择运营人员"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="user in operatorList.filter(user => user && user.id && (user.realName || user.username))"
                      :key="user.id"
                      :label="user.realName || user.username"
                      :value="user.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="创建时间">
                  <el-date-picker
                    v-model="createTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="回访时间">
                  <el-date-picker
                    v-model="nextFollowTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数据完整性">
                  <el-checkbox-group v-model="dataCompletenessFilter">
                    <el-checkbox label="hasPhone">有手机号</el-checkbox>
                    <el-checkbox label="hasRealName">有真实姓名</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="排序字段">
                  <el-select
                    v-model="queryParams.sortBy"
                    placeholder="请选择排序字段"
                    clearable
                    style="width: 100%"
                  >
                    <el-option label="创建时间" value="createTime" />
                    <el-option label="更新时间" value="updateTime" />
                    <el-option label="回访时间" value="nextFollowTime" />
                    <el-option label="客户意向" value="customerIntent" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="排序方向">
                  <el-radio-group v-model="queryParams.sortOrder">
                    <el-radio label="DESC">降序</el-radio>
                    <el-radio label="ASC">升序</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24" style="text-align: right;">
                <el-button @click="handleResetAdvanced">清空高级筛选</el-button>
                <el-button @click="handleSaveFilter">
                  <el-icon><FolderAdd /></el-icon>
                  保存筛选条件
                </el-button>
                <el-button type="primary" @click="handleSearch">应用筛选</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="action-card" shadow="never">
      <div class="action-row">
        <div class="left-actions">
          <el-button type="primary" @click="handleAdd" v-permission="'customer:create'">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
          <el-button type="success" @click="handleSmartCreate" v-permission="'customer:create'">
            <el-icon><MagicStick /></el-icon>
            AI智能创建
          </el-button>
          <el-button @click="handleDownloadTemplate" v-permission="'customer:import'">
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-button>
          <el-button type="warning" @click="handleImport" v-permission="'customer:import'">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport" v-permission="'customer:export'">
            <el-icon><Download /></el-icon>
            导出客户
          </el-button>
        </div>

        <div class="batch-actions" v-if="selectedCustomers.length > 0">
          <el-tag type="info" size="large">已选择 {{ selectedCustomers.length }} 项</el-tag>
          <el-button type="primary" size="small" @click="handleBatchAssign" v-permission="'customer:batch:assign'">
            批量分配销售
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchUpdateIntent" v-permission="'customer:batch:update'">
            批量修改意向
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete" v-permission="'customer:batch:delete'">
            批量删除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="customerList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="wechatNickname" label="微信昵称" width="140" />
        <el-table-column prop="wechatId" label="微信号" width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="realName" label="真实姓名" width="120" />

        <el-table-column prop="customerIntent" label="客户意向" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.customerIntent === '高意向' || row.customerIntent === '高'
                  ? 'success'
                  : row.customerIntent === '中意向' || row.customerIntent === '中'
                    ? 'warning'
                    : row.customerIntent === '低意向' || row.customerIntent === '低'
                      ? 'info'
                      : 'danger'
              "
            >
              {{ row.customerIntent }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="trafficSource" label="流量来源" width="120" />
        <el-table-column prop="salesName" label="对接销售" width="120" />
        <el-table-column prop="operatorName" label="运营人员" width="120" />

        <el-table-column prop="nextFollowTime" label="下次回访时间" width="180">
          <template #default="{ row }">
            <span v-if="row.nextFollowTime">
              {{ formatDate(row.nextFollowTime) }}
            </span>
            <span v-else class="text-secondary">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleBindOrder(row)">
              绑定订单
            </el-button>
            <el-button link type="success" size="small" @click="handleFollowRecord(row)">
              跟进记录
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
        <el-form-item label="微信昵称" prop="wechatNickname">
          <el-input v-model="formData.wechatNickname" placeholder="请输入微信昵称" />
        </el-form-item>

        <el-form-item label="微信号" prop="wechatId">
          <el-input
            v-model="formData.wechatId"
            placeholder="请输入微信号"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="流量来源" prop="trafficSource">
          <el-select v-model="formData.trafficSource" placeholder="请选择流量来源" style="width: 100%">
            <el-option
              v-for="item in trafficSourceOptions.filter(opt => opt && opt.id && opt.dictLabel && opt.dictValue)"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="客户意向" prop="customerIntent">
          <el-select v-model="formData.customerIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option
              v-for="item in customerIntentOptions.filter(opt => opt && opt.id && opt.dictLabel && opt.dictValue)"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="运营人员" prop="operatorId">
          <el-select v-model="formData.operatorId" placeholder="请选择运营人员" clearable style="width: 100%">
            <el-option
              v-for="user in operatorList"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="下次回访时间" prop="nextFollowTime">
          <el-date-picker
            v-model="formData.nextFollowTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 绑定订单对话框 -->
    <el-dialog
      v-model="bindOrderDialogVisible"
      title="绑定订单"
      width="800px"
    >
      <div v-if="currentCustomer" class="customer-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户昵称">{{ currentCustomer.wechatNickname }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ currentCustomer.realName || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCustomer.phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="微信ID">{{ currentCustomer.wechatId || '未填写' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="order-binding" style="margin-top: 20px;">
        <el-form :model="bindOrderForm" label-width="100px">
          <el-form-item label="已有关单">
            <div v-if="customerOrders.length > 0">
              <el-table :data="customerOrders" style="width: 100%">
                <el-table-column prop="orderNo" label="订单号" width="150" />
                <el-table-column prop="paymentAmount" label="金额" width="120">
                  <template #default="{ row }">
                    <span class="amount" :class="{ 'amount-high': Number(row.paymentAmount) > 5000 }">
                      ¥{{ Number(row.paymentAmount || 0).toLocaleString() }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="orderStatus" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="
                        row.orderStatus === '待上课' ? 'warning' :
                        row.orderStatus === '上课中' ? 'primary' :
                        row.orderStatus === '已完成' ? 'success' :
                        row.orderStatus === '已退款' ? 'info' : 'danger'
                      "
                      size="small"
                      effect="light"
                    >
                      {{ row.orderStatus || '未知状态' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="danger" size="small" @click="handleUnbindOrder(row)">
                      解绑
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无订单" />
            </div>
          </el-form-item>

          <el-form-item label="绑定新订单">
            <div style="display: flex; gap: 10px;">
              <el-input
                v-model="bindOrderForm.orderNo"
                placeholder="请输入订单号进行绑定"
                style="flex: 1"
                clearable
              />
              <el-button type="primary" @click="searchOrderByNo" :loading="searchLoading">
                搜索
              </el-button>
            </div>
            <div v-if="searchResult.orderNo" style="margin-top: 10px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
              <p><strong>订单号：</strong>{{ searchResult.orderNo }}</p>
              <p><strong>课程：</strong>{{ searchResult.courseName }}</p>
              <p><strong>金额：</strong>¥{{ searchResult.paymentAmount }}</p>
              <p><strong>状态：</strong>
                <el-tag :type="getOrderStatusType(searchResult.orderStatus)">{{ searchResult.orderStatus }}</el-tag>
              </p>
              <p><strong>支付时间：</strong>{{ formatDate(searchResult.paymentTime) }}</p>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="closeBindOrderDialog">取消</el-button>
        <el-button type="primary" @click="confirmBindOrder">
          确定绑定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量分配销售对话框 -->
    <el-dialog
      v-model="batchAssignDialogVisible"
      title="批量分配销售"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="选中数量">
          <el-tag type="info">{{ selectedCustomers.length }} 个客户</el-tag>
        </el-form-item>
        <el-form-item label="分配给">
          <el-select v-model="batchAssignSalesId" placeholder="请选择销售人员" style="width: 100%">
            <el-option
              v-for="user in salesList.filter(user => user && user.id && (user.realName || user.username))"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchAssignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAssign">
          确定分配
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量修改意向对话框 -->
    <el-dialog
      v-model="batchIntentDialogVisible"
      title="批量修改客户意向"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="选中数量">
          <el-tag type="info">{{ selectedCustomers.length }} 个客户</el-tag>
        </el-form-item>
        <el-form-item label="客户意向">
          <el-select v-model="batchIntent" placeholder="请选择客户意向" style="width: 100%">
            <el-option
              v-for="item in customerIntentOptions.filter(opt => opt && opt.id && opt.dictLabel && opt.dictValue)"
              :key="item.id"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchIntentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchUpdateIntent">
          确定修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入客户"
      width="600px"
      @close="importFile = null; importResult = null"
    >
      <div v-if="!importResult">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            <p>1. 请先下载导入模板，按照模板格式填写客户数据</p>
            <p>2. 必填字段：客户姓名、微信号</p>
            <p>3. 微信号必须唯一，重复的数据将被跳过</p>
            <p>4. 支持Excel格式(.xlsx)</p>
          </template>
        </el-alert>

        <el-upload
          class="upload-container"
          drag
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept=".xlsx"
          :on-change="(file) => handleFileChange(file.raw)"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只支持.xlsx格式的Excel文件
            </div>
          </template>
        </el-upload>
      </div>

      <div v-else class="import-result">
        <el-result
          :icon="importResult.success ? 'success' : 'warning'"
          :title="importResult.message"
        >
          <template #sub-title>
            <div class="result-stats">
              <div class="stat-item success">
                <span class="label">成功导入：</span>
                <span class="value">{{ importResult.successCount }} 条</span>
              </div>
              <div class="stat-item error" v-if="importResult.errorCount > 0">
                <span class="label">失败：</span>
                <span class="value">{{ importResult.errorCount }} 条</span>
              </div>
              <div class="stat-item">
                <span class="label">总计：</span>
                <span class="value">{{ importResult.totalRows }} 条</span>
              </div>
            </div>
          </template>
          <template #extra>
            <div v-if="importResult.errors && importResult.errors.length > 0">
              <el-divider content-position="left">错误详情</el-divider>
              <el-table
                :data="importResult.errors"
                style="width: 100%"
                max-height="300"
              >
                <el-table-column prop="row" label="行号" width="80" />
                <el-table-column prop="error" label="错误信息" />
              </el-table>
            </div>
          </template>
        </el-result>
      </div>

      <template #footer>
        <div v-if="!importResult">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="importing"
            :disabled="!importFile"
            @click="handleImportSubmit"
          >
            {{ importing ? '导入中...' : '开始导入' }}
          </el-button>
        </div>
        <div v-else>
          <el-button @click="importDialogVisible = false">关闭</el-button>
          <el-button
            type="primary"
            @click="importFile = null; importResult = null"
          >
            继续导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI智能创建客户 -->
    <SmartCreateCustomer ref="smartCreateRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Download, Upload, Plus, Search, Refresh, MagicStick, Operation, Filter, FolderAdd } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { downloadCustomerTemplate } from '@/utils/excel-template'
import {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  batchUpdateCustomer,
  exportCustomersToExcel,
  downloadImportTemplate,
  importCustomersFromExcel,
  type Customer,
  type CustomerQuery,
  type CreateCustomerParams,
} from '@/api/customer'
import {
  getCustomerOrders,
  getAvailableOrders,
  bindOrderToCustomer,
  bindOrderByOrderNo,
  unbindOrderFromCustomer,
} from '@/api/order'
import { getDictionaryByType, type Dictionary } from '@/api/dictionary'
import { getUserList } from '@/api/user'
import SmartCreateCustomer from '@/components/customer/SmartCreateCustomer.vue'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const customerList = ref<Customer[]>([])
const total = ref(0)
const selectedCustomers = ref<Customer[]>([])
const tableRef = ref()

const queryParams = reactive<CustomerQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  customerIntent: '',
  trafficSource: '',
  salesId: undefined,
  operatorId: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
  nextFollowTimeStart: undefined,
  nextFollowTimeEnd: undefined,
  hasPhone: undefined,
  hasRealName: undefined,
  sortBy: 'createTime',
  sortOrder: 'DESC',
})

// 高级筛选状态
const showAdvancedFilter = ref(false)
const createTimeRange = ref<[string, string] | null>(null)
const nextFollowTimeRange = ref<[string, string] | null>(null)
const dataCompletenessFilter = ref<string[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增客户')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const smartCreateRef = ref()

const formData = reactive<CreateCustomerParams>({
  wechatNickname: '',
  wechatId: '',
  phone: '',
  realName: '',
  trafficSource: '',
  operatorId: undefined,
  salesId: userStore.userInfo?.id || 0,
  customerIntent: '中意向',
  nextFollowTime: '',
  remark: '',
})

const formRules: FormRules = {
  wechatId: [{ required: true, message: '请输入微信号', trigger: 'blur' }],
}

// 字典数据
const customerIntentOptions = ref<Dictionary[]>([])
const trafficSourceOptions = ref<Dictionary[]>([])

// 运营人员列表
const operatorList = ref<any[]>([])

// 加载字典数据
const loadDictionaries = async () => {
  try {
    const [intentRes, sourceRes] = await Promise.all([
      getDictionaryByType('customer_intent'),
      getDictionaryByType('traffic_source'),
    ])
    customerIntentOptions.value = intentRes
    trafficSourceOptions.value = sourceRes
  } catch (error) {
    console.error('Failed to load dictionaries:', error)
  }
}

// 加载运营人员列表
const loadOperators = async () => {
  try {
    const res = await getUserList({ page: 1, pageSize: 100, role: 'operator' })
    operatorList.value = res.list || []
  } catch (error) {
    console.error('Failed to load operators:', error)
  }
}

// 获取客户列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCustomerList(queryParams)
    customerList.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch customers:', error)
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
  queryParams.customerIntent = ''
  queryParams.trafficSource = ''
  queryParams.page = 1
  handleResetAdvanced()
  fetchData()
}

// 清空高级筛选
const handleResetAdvanced = () => {
  queryParams.operatorId = undefined
  queryParams.createTimeStart = undefined
  queryParams.createTimeEnd = undefined
  queryParams.nextFollowTimeStart = undefined
  queryParams.nextFollowTimeEnd = undefined
  queryParams.hasPhone = undefined
  queryParams.hasRealName = undefined
  queryParams.sortBy = 'createTime'
  queryParams.sortOrder = 'DESC'
  createTimeRange.value = null
  nextFollowTimeRange.value = null
  dataCompletenessFilter.value = []
}

// 监听创建时间范围变化
watch(createTimeRange, (val) => {
  if (val && val.length === 2) {
    queryParams.createTimeStart = val[0]
    queryParams.createTimeEnd = val[1]
  } else {
    queryParams.createTimeStart = undefined
    queryParams.createTimeEnd = undefined
  }
})

// 监听回访时间范围变化
watch(nextFollowTimeRange, (val) => {
  if (val && val.length === 2) {
    queryParams.nextFollowTimeStart = val[0]
    queryParams.nextFollowTimeEnd = val[1]
  } else {
    queryParams.nextFollowTimeStart = undefined
    queryParams.nextFollowTimeEnd = undefined
  }
})

// 监听数据完整性筛选变化
watch(dataCompletenessFilter, (val) => {
  queryParams.hasPhone = val.includes('hasPhone') ? true : undefined
  queryParams.hasRealName = val.includes('hasRealName') ? true : undefined
})

// 保存筛选条件到localStorage
const handleSaveFilter = () => {
  const filterData = {
    keyword: queryParams.keyword,
    customerIntent: queryParams.customerIntent,
    trafficSource: queryParams.trafficSource,
    operatorId: queryParams.operatorId,
    createTimeRange: createTimeRange.value,
    nextFollowTimeRange: nextFollowTimeRange.value,
    dataCompletenessFilter: dataCompletenessFilter.value,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  }
  localStorage.setItem('customerFilterConditions', JSON.stringify(filterData))
  ElMessage.success('筛选条件已保存')
}

// 从localStorage恢复筛选条件
const restoreFilterConditions = () => {
  const saved = localStorage.getItem('customerFilterConditions')
  if (saved) {
    try {
      const filterData = JSON.parse(saved)
      queryParams.keyword = filterData.keyword || ''
      queryParams.customerIntent = filterData.customerIntent || ''
      queryParams.trafficSource = filterData.trafficSource || ''
      queryParams.operatorId = filterData.operatorId
      queryParams.sortBy = filterData.sortBy || 'createTime'
      queryParams.sortOrder = filterData.sortOrder || 'DESC'
      createTimeRange.value = filterData.createTimeRange
      nextFollowTimeRange.value = filterData.nextFollowTimeRange
      dataCompletenessFilter.value = filterData.dataCompletenessFilter || []

      // 如果有保存的高级筛选条件，自动展开高级筛选
      if (filterData.operatorId || filterData.createTimeRange || filterData.nextFollowTimeRange ||
          filterData.dataCompletenessFilter?.length > 0) {
        showAdvancedFilter.value = true
      }
    } catch (error) {
      console.error('恢复筛选条件失败:', error)
    }
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增客户'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// AI智能创建客户
const handleSmartCreate = () => {
  smartCreateRef.value?.open()
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const blob = await downloadImportTemplate()

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'customer_import_template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('模板下载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '模板下载失败')
  }
}

// 导入对话框
const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<any>(null)

// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true
  importFile.value = null
  importResult.value = null
}

// 文件选择
const handleFileChange = (file: File) => {
  importFile.value = file
  importResult.value = null
}

// 执行导入
const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的Excel文件')
    return
  }

  importing.value = true
  try {
    const result = await importCustomersFromExcel(importFile.value)
    importResult.value = result

    if (result.success) {
      ElMessage.success(result.message)
      // 刷新列表
      fetchData()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 导出客户
const handleExport = async () => {
  try {
    ElMessage.loading({ message: '正在导出，请稍候...', duration: 0 })

    const params = { ...queryParams }
    // 删除分页参数，导出所有符合筛选条件的数据
    delete params.page
    delete params.pageSize

    const blob = await exportCustomersToExcel(params)

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `客户数据_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.closeAll()
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.closeAll()
    ElMessage.error(error.message || '导出失败')
  }
}

// 查看
const handleView = (row: Customer) => {
  router.push(`/customer/detail/${row.id}`)
}

// 编辑
const handleEdit = (row: Customer) => {
  dialogTitle.value = '编辑客户'
  isEdit.value = true
  Object.assign(formData, {
    wechatNickname: row.wechatNickname,
    wechatId: row.wechatId,
    phone: row.phone,
    realName: row.realName,
    trafficSource: row.trafficSource,
    operatorId: row.operatorId,
    salesId: row.salesId,
    customerIntent: row.customerIntent,
    nextFollowTime: row.nextFollowTime,
    remark: row.remark,
  })
  formData.id = row.id
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteCustomer(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  })
}

// 多选变化
const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}

// 批量分配销售
const batchAssignDialogVisible = ref(false)
const batchAssignSalesId = ref<number>()
const salesList = ref<any[]>([])

const handleBatchAssign = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要分配的客户')
    return
  }
  batchAssignDialogVisible.value = true
  loadSalesList()
}

const loadSalesList = async () => {
  try {
    const res = await getUserList({ page: 1, pageSize: 100, role: 'sales' })
    salesList.value = res.list || []
  } catch (error) {
    console.error('Failed to load sales list:', error)
  }
}

const confirmBatchAssign = async () => {
  if (!batchAssignSalesId.value) {
    ElMessage.warning('请选择销售人员')
    return
  }

  try {
    const ids = selectedCustomers.value.map(c => c.id)
    const result = await batchUpdateCustomer({
      ids,
      salesId: batchAssignSalesId.value
    })
    ElMessage.success(result.message || '批量分配成功')
    batchAssignDialogVisible.value = false
    tableRef.value?.clearSelection()
    fetchData()
  } catch (error) {
    ElMessage.error('批量分配失败')
    console.error('Failed to batch assign:', error)
  }
}

// 批量修改意向
const batchIntentDialogVisible = ref(false)
const batchIntent = ref('')

const handleBatchUpdateIntent = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要修改意向的客户')
    return
  }
  batchIntentDialogVisible.value = true
}

const confirmBatchUpdateIntent = async () => {
  if (!batchIntent.value) {
    ElMessage.warning('请选择客户意向')
    return
  }

  try {
    const ids = selectedCustomers.value.map(c => c.id)
    const result = await batchUpdateCustomer({
      ids,
      customerIntent: batchIntent.value
    })
    ElMessage.success(result.message || '批量修改意向成功')
    batchIntentDialogVisible.value = false
    tableRef.value?.clearSelection()
    fetchData()
  } catch (error) {
    ElMessage.error('批量修改意向失败')
    console.error('Failed to batch update intent:', error)
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要删除的客户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const ids = selectedCustomers.value.map(c => c.id)
      // 逐个删除（后续可优化为批量删除API）
      await Promise.all(ids.map(id => deleteCustomer(id)))
      ElMessage.success(`成功删除 ${ids.length} 个客户`)
      tableRef.value?.clearSelection()
      fetchData()
    } catch (error) {
      ElMessage.error('批量删除失败')
      console.error('Failed to batch delete:', error)
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
          await updateCustomer(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createCustomer(formData)
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
    wechatNickname: '',
    wechatId: '',
    phone: '',
    realName: '',
    trafficSource: '',
    operatorId: undefined,
    salesId: userStore.userInfo?.id || 0,
    customerIntent: '中意向',
    nextFollowTime: '',
    remark: '',
  })
  delete formData.id
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 绑定订单相关变量
const bindOrderDialogVisible = ref(false)
const currentCustomer = ref<Customer | null>(null)
const customerOrders = ref<any[]>([])
const availableOrders = ref<any[]>([])
const searchLoading = ref(false)
const bindingCustomerId = ref<number | null>(null)
const bindOrderForm = reactive({
  orderNo: ''
})
const searchResult = reactive({
  orderNo: '',
  courseName: '',
  paymentAmount: 0,
  orderId: null as number | null
})

// 处理绑定订单
const handleBindOrder = (row: Customer) => {
  currentCustomer.value = row
  bindingCustomerId.value = row.id
  loadCustomerOrders(row.id)
  bindOrderDialogVisible.value = true
}

// 加载客户订单
const loadCustomerOrders = async (customerId: number) => {
  try {
    console.log('🚀 List.vue loadCustomerOrders 开始执行')
    console.log('🆔 客户ID:', customerId)

    // 调用实际的API来获取客户订单
    const response = await getCustomerOrders(customerId)
    console.log('=== List.vue API响应 ===')
    console.log('response:', response)
    console.log('response.data:', response?.data)
    console.log('response.success:', response?.success)

    if (response && response.success && response.data) {
      console.log('✓ 使用 response.data')
      customerOrders.value = response.data
    } else if (response && Array.isArray(response.data)) {
      console.log('✓ 使用 response.data 数组')
      customerOrders.value = response.data
    } else if (Array.isArray(response)) {
      console.log('✓ 使用 response 数组')
      customerOrders.value = response
    } else {
      console.log('✗ 无法识别数据结构，设置为空数组')
      customerOrders.value = []
    }

    console.log('=== List.vue 处理后的订单数据 ===')
    console.log('customerOrders.value:', customerOrders.value)
    console.log('订单数量:', customerOrders.value.length)
  } catch (error) {
    console.error('=== List.vue loadCustomerOrders Error ===')
    console.error('Error:', error)
    ElMessage.error('加载客户订单失败')
    customerOrders.value = []
  }
}

// 搜索订单
const searchOrders = async (query: string) => {
  if (!query || !bindingCustomerId.value) {
    availableOrders.value = []
    return
  }

  searchLoading.value = true
  try {
    // 调用实际的API来搜索可绑定的订单
    const response = await getAvailableOrders(bindingCustomerId.value, {
      keyword: query,
      page: 1,
      pageSize: 20
    })
    availableOrders.value = response.data || []
  } catch (error) {
    console.error('Failed to search orders:', error)
    ElMessage.error('搜索订单失败')
    availableOrders.value = []
  } finally {
    searchLoading.value = false
  }
}

// 通过订单号搜索订单
const searchOrderByNo = async () => {
  if (!bindOrderForm.orderNo.trim()) {
    ElMessage.warning('请输入订单号')
    return
  }

  searchLoading.value = true
  try {
    // 调用API搜索订单，这里需要根据实际API调整
    const response = await getAvailableOrders(bindingCustomerId.value!, {
      keyword: bindOrderForm.orderNo.trim(),
      page: 1,
      pageSize: 1
    })

    if (response.data && response.data.length > 0) {
      const order = response.data[0]
      searchResult.orderNo = order.orderNo
      searchResult.courseName = order.courseName
      searchResult.paymentAmount = order.paymentAmount
      searchResult.orderId = order.id
      ElMessage.success('订单搜索成功')
    } else {
      ElMessage.error('未找到该订单号的订单')
      // 清空搜索结果
      searchResult.orderNo = ''
      searchResult.courseName = ''
      searchResult.paymentAmount = 0
      searchResult.orderId = null
    }
  } catch (error) {
    console.error('Failed to search order by number:', error)
    ElMessage.error('搜索订单失败')
    // 清空搜索结果
    searchResult.orderNo = ''
    searchResult.courseName = ''
    searchResult.paymentAmount = 0
    searchResult.orderId = null
  } finally {
    searchLoading.value = false
  }
}

// 确认绑定订单
const confirmBindOrder = async () => {
  if (!searchResult.orderId) {
    ElMessage.warning('请先搜索并选择要绑定的订单')
    return
  }

  if (!currentCustomer.value) {
    ElMessage.error('客户信息丢失，请重新操作')
    return
  }

  try {
    // 调用API通过订单号绑定订单
    await bindOrderByOrderNo(currentCustomer.value.id, searchResult.orderNo)
    ElMessage.success('订单绑定成功')
    bindOrderDialogVisible.value = false
    loadCustomerOrders(currentCustomer.value.id)
    // 清空表单
    bindOrderForm.orderNo = ''
    searchResult.orderNo = ''
    searchResult.courseName = ''
    searchResult.paymentAmount = 0
    searchResult.orderId = null
  } catch (error) {
    console.error('Failed to bind order:', error)
    ElMessage.error('订单绑定失败')
  }
}

// 解绑订单
const handleUnbindOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要解绑此订单吗？', '解绑确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!currentCustomer.value) {
      ElMessage.error('客户信息丢失，请重新操作')
      return
    }

    // 调用实际的API来解绑订单
    await unbindOrderFromCustomer(currentCustomer.value.id, order.id)
    ElMessage.success('订单解绑成功')
    loadCustomerOrders(currentCustomer.value.id)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to unbind order:', error)
      ElMessage.error('订单解绑失败')
    }
  }
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    '已完成': 'success',
    '进行中': 'warning',
    '待付款': 'info',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 关闭绑定订单对话框
const closeBindOrderDialog = () => {
  bindOrderDialogVisible.value = false
  currentCustomer.value = null
  bindingCustomerId.value = null
  customerOrders.value = []
  availableOrders.value = []
  bindOrderForm.orderNo = ''
  searchResult.orderNo = ''
  searchResult.courseName = ''
  searchResult.paymentAmount = 0
  searchResult.orderId = null
}

// 处理跟进记录
const handleFollowRecord = (row: Customer) => {
  try {
    // 跳转到客户详情页面，并定位到跟进记录标签页
    router.push({
      path: `/customer/detail/${row.id}`,
      query: { tab: 'follow' }
    })
  } catch (error) {
    console.error('Failed to navigate to follow record:', error)
    ElMessage.error('页面跳转失败')
  }
}

onMounted(() => {
  // 检查 URL 查询参数
  const route = router.currentRoute.value
  if (route.query.salesId) {
    queryParams.salesId = Number(route.query.salesId)
    // 如果有销售名称，可以显示提示
    if (route.query.salesName) {
      ElMessage.info(`已筛选销售：${route.query.salesName}`)
    }
  } else {
    // 如果没有URL参数，尝试恢复保存的筛选条件
    restoreFilterConditions()
  }

  loadDictionaries()
  loadOperators()
  fetchData()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.customer-list-container {
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

    :deep(.el-input__wrapper) {
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

    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .left-actions {
        display: flex;
        gap: 12px;

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

        :deep(.el-button) {
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--xhs-primary);
            color: var(--xhs-primary);
          }
        }
      }

      .batch-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.08) 0%, rgba(255, 201, 64, 0.05) 100%);
        border-radius: 12px;
        border: 1px solid rgba(255, 184, 0, 0.2);

        :deep(.el-tag) {
          background: white;
          border-color: var(--xhs-primary);
          color: var(--xhs-primary);
          font-weight: 500;
        }

        :deep(.el-button) {
          border-radius: 8px;
        }
      }
    }
  }

  :deep(.el-card) {
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

  .text-secondary {
    color: var(--xhs-text-secondary);
    font-size: 12px;
  }

  .advanced-filter {
    margin-top: 20px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(255, 184, 0, 0.02) 0%, rgba(255, 201, 64, 0.01) 100%);
    border-radius: 12px;
    border: 1px solid rgba(255, 184, 0, 0.1);

    :deep(.el-divider__text) {
      background: transparent;
      color: var(--xhs-primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    :deep(.el-form-item__label) {
      color: var(--xhs-text-primary);
      font-weight: 500;
    }

    :deep(.el-checkbox) {
      margin-right: 20px;
    }

    :deep(.el-radio) {
      margin-right: 20px;
    }

    :deep(.el-date-editor) {
      .el-range-separator {
        color: var(--xhs-text-secondary);
      }
    }
  }

  .upload-container {
    :deep(.el-upload-dragger) {
      border-radius: 12px;
      border: 2px dashed #dcdfe6;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--xhs-primary);
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.03) 0%, rgba(255, 201, 64, 0.02) 100%);
      }
    }

    :deep(.el-icon--upload) {
      color: var(--xhs-primary);
      font-size: 48px;
    }
  }

  .import-result {
    .result-stats {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 16px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, rgba(255, 201, 64, 0.03) 100%);
      border-radius: 12px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 14px;
          color: var(--xhs-text-secondary);
        }

        .value {
          font-size: 24px;
          font-weight: 600;
          color: var(--xhs-text-primary);
        }

        &.success .value {
          color: #67c23a;
        }

        &.error .value {
          color: #f56c6c;
        }
      }
    }

    :deep(.el-result__title) {
      color: var(--xhs-text-primary);
      font-weight: 600;
    }

    :deep(.el-table) {
      margin-top: 16px;
      border-radius: 8px;
      overflow: hidden;
    }
  }

  // ==================== 响应式设计 ====================

  // 平板设备 (768px - 1024px)
  @media (max-width: 1024px) {
    .search-card {
      :deep(.el-form) {
        .el-form-item {
          margin-right: 12px;
          margin-bottom: 12px;
        }

        .el-input,
        .el-select {
          width: 180px !important;
        }
      }
    }

    .action-row {
      .left-actions {
        .el-button {
          margin-bottom: 8px;
        }
      }
    }

    .advanced-filter {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 12px;
        }
      }
    }
  }

  // 移动设备 (< 768px)
  @media (max-width: 768px) {
    .search-card {
      :deep(.el-form) {
        &.el-form--inline {
          .el-form-item {
            display: block;
            margin-right: 0;
            margin-bottom: 12px;

            .el-form-item__label {
              display: block;
              text-align: left;
              float: none;
              margin-bottom: 4px;
            }

            .el-form-item__content {
              margin-left: 0 !important;
            }
          }

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }
      }
    }

    .advanced-filter {
      padding: 16px;

      :deep(.el-form) {
        label-width: 80px;

        .el-row .el-col {
          flex: 0 0 100%;
          max-width: 100%;
        }

        .el-date-editor {
          width: 100%;
        }

        .el-checkbox,
        .el-radio {
          display: block;
          margin-bottom: 8px;
        }
      }
    }

    .action-card {
      .action-row {
        flex-direction: column;
        gap: 12px;

        .left-actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;

          .el-button {
            margin: 0;
            padding: 8px 12px;
            font-size: 13px;

            span {
              display: none; // 隐藏按钮文字，仅显示图标
            }

            &::after {
              content: attr(aria-label);
              font-size: 11px;
            }
          }
        }

        .batch-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .el-tag {
            width: 100%;
            justify-content: center;
          }

          .el-button {
            width: 100%;
          }
        }
      }
    }

    // 表格优化：隐藏部分列
    :deep(.el-table) {
      font-size: 13px;

      .el-table__header th:nth-child(2),
      .el-table__body td:nth-child(2),
      .el-table__header th:nth-child(4),
      .el-table__body td:nth-child(4),
      .el-table__header th:nth-child(6),
      .el-table__body td:nth-child(6) {
        display: none; // 隐藏ID、微信号、真实姓名列
      }

      .el-table__header th,
      .el-table__body td {
        padding: 8px 0;
      }

      .cell {
        padding-left: 8px;
        padding-right: 8px;
      }
    }

    .pagination-container {
      justify-content: center;
      padding: 12px 0;

      :deep(.el-pagination) {
        .el-pagination__sizes,
        .el-pagination__jump {
          display: none; // 隐藏页面大小选择和跳转
        }

        .btn-prev,
        .btn-next {
          padding: 0 8px;
        }

        .el-pager li {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 13px;
        }
      }
    }
  }

  // 小屏手机 (< 480px)
  @media (max-width: 480px) {
    .search-card,
    .action-card {
      :deep(.el-card__body) {
        padding: 12px;
      }
    }

    .advanced-filter {
      padding: 12px;

      :deep(.el-form) {
        .el-form-item__label {
          font-size: 13px;
        }

        .el-button {
          font-size: 12px;
          padding: 6px 10px;
        }
      }
    }

    .action-card .action-row .left-actions {
      grid-template-columns: 1fr; // 单列布局

      .el-button {
        padding: 10px 12px;

        span {
          display: inline; // 显示按钮文字
        }

        &::after {
          content: none;
        }
      }
    }

    // 表格进一步简化
    :deep(.el-table) {
      font-size: 12px;

      .el-table__header th:nth-child(3),
      .el-table__body td:nth-child(3) {
        display: none; // 还隐藏微信昵称，只保留手机号和意向
      }

      .el-table__header th,
      .el-table__body td {
        padding: 6px 0;
      }

      .cell {
        padding-left: 4px;
        padding-right: 4px;
      }

      .el-tag {
        font-size: 11px;
        padding: 0 6px;
        height: 20px;
        line-height: 20px;
      }

      .el-button {
        font-size: 11px;
        padding: 4px 8px;
      }
    }

    .pagination-container :deep(.el-pagination) {
      .el-pager {
        li {
          min-width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 12px;
          margin: 0 2px;

          &:not(.is-active):not(:hover) {
            display: none; // 仅显示当前页和相邻页
          }

          &:nth-child(2),
          &:last-child {
            display: inline-block !important; // 始终显示首页和末页
          }
        }
      }

      .btn-prev,
      .btn-next {
        min-width: 24px;
        height: 24px;
        line-height: 24px;
        padding: 0 6px;
        font-size: 12px;
      }
    }
  }
}
</style>
