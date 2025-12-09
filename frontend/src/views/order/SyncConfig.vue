<template>
  <div class="order-sync-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单同步配置</span>
          <el-button
            type="primary"
            @click="handleManualSync"
            :loading="syncing"
            v-if="activeTab === 'manual'"
          >
            <el-icon><Refresh /></el-icon>
            {{ syncing ? '同步中...' : '立即同步' }}
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            :model="configForm"
            label-width="160px"
            style="max-width: 800px"
          >
            <el-form-item label="API密钥">
              <el-input
                v-model="configForm.apiKey"
                placeholder="请输入海绵系统API密钥"
                show-password
              />
            </el-form-item>

            <el-form-item label="API地址">
              <el-input
                v-model="configForm.apiUrl"
                placeholder="请输入海绵订单列表接口地址"
              />
            </el-form-item>

            <el-form-item label="默认销售人员">
              <el-select
                v-model="configForm.defaultSalesId"
                placeholder="选择默认销售人员"
                filterable
              >
                <el-option
                  v-for="user in salesList.filter(user => user && user.id && user.realName)"
                  :key="user.id"
                  :label="user.realName"
                  :value="user.id"
                />
              </el-select>
              <div class="form-tip">外部订单导入时默认分配的销售人员</div>
            </el-form-item>

            <el-divider content-position="left">同步策略</el-divider>

            <el-form-item label="启用自动同步">
              <el-switch v-model="configForm.enabled" />
              <div class="form-tip">关闭后定时任务将停止，仅支持手动同步</div>
            </el-form-item>

            <el-form-item label="同步间隔(分钟)">
              <el-input-number
                v-model="configForm.interval"
                :min="10"
                :max="120"
                :step="5"
              />
              <div class="form-tip">建议设置为30-60分钟，避免频繁请求</div>
            </el-form-item>

            <el-form-item label="每日批量更新时间">
              <el-time-picker
                v-model="configForm.dailyUpdateTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
              />
              <div class="form-tip">每天在此时间执行全量订单状态更新</div>
            </el-form-item>

            <el-form-item label="增量同步天数">
              <el-input-number
                v-model="configForm.syncRangeDays"
                :min="1"
                :max="30"
              />
              <div class="form-tip">
                定时同步时拉取最近N天的订单，建议3-7天
              </div>
            </el-form-item>

            <el-form-item label="每批次同步数量">
              <el-input-number
                v-model="configForm.batchSize"
                :min="50"
                :max="500"
                :step="50"
              />
              <div class="form-tip">每次同步处理的订单数量，建议50-200</div>
            </el-form-item>

            <el-divider content-position="left">数据处理</el-divider>

            <el-form-item label="更新已存在订单">
              <el-switch v-model="configForm.updateExisting" />
              <div class="form-tip">
                开启则更新已同步订单的状态，关闭则只创建新订单
              </div>
            </el-form-item>

            <el-form-item label="同步客户信息">
              <el-switch v-model="configForm.syncCustomerInfo" />
              <div class="form-tip">
                将订单中的手机号、昵称等信息补充到客户档案
              </div>
            </el-form-item>

            <el-form-item label="自动创建校区">
              <el-switch v-model="configForm.autoCreateCampus" />
              <div class="form-tip">遇到不存在的校区时自动创建</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveConfig" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="loadConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 同步日志 -->
        <el-tab-pane label="同步日志" name="logs">
          <div class="logs-filter">
            <el-form :inline="true" :model="logQuery">
              <el-form-item label="订单号">
                <el-input
                  v-model="logQuery.orderNo"
                  placeholder="请输入订单号"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>

              <el-form-item label="同步类型">
                <el-select
                  v-model="logQuery.syncType"
                  placeholder="全部"
                  clearable
                  style="width: 120px"
                >
                  <el-option label="自动同步" value="auto" />
                  <el-option label="手动同步" value="manual" />
                  <el-option label="新建" value="create" />
                  <el-option label="更新" value="update" />
                  <el-option label="跳过" value="skip" />
                  <el-option label="删除" value="delete" />
                </el-select>
              </el-form-item>

              <el-form-item label="同步结果">
                <el-select
                  v-model="logQuery.result"
                  placeholder="全部"
                  clearable
                  style="width: 100px"
                >
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="failed" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="loadLogs">查询</el-button>
                <el-button @click="resetLogQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="logs.list" border stripe v-loading="logsLoading">
            <el-table-column prop="orderNo" label="订单号" width="180" />
            <el-table-column prop="syncType" label="同步类型" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="
                    row.syncType === 'create'
                      ? 'success'
                      : row.syncType === 'update'
                      ? 'warning'
                      : 'info'
                  "
                >
                  {{ getSyncTypeText(row.syncType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="oldStatus" label="原状态" width="100" />
            <el-table-column prop="newStatus" label="新状态" width="100" />
            <el-table-column prop="syncTime" label="同步时间" width="160">
              <template #default="{ row }">
                {{ formatSyncTime(row.syncTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="result" label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
                  {{ row.result === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="executionTime"
              label="耗时(ms)"
              width="100"
            />
            <el-table-column prop="errorMessage" label="错误信息" min-width="200" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewLogDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="logQuery.page"
              v-model:page-size="logQuery.pageSize"
              :total="logs.total"
              :page-sizes="[20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="loadLogs"
              @size-change="loadLogs"
            />
          </div>
        </el-tab-pane>

        <!-- 字段映射 -->
        <el-tab-pane label="字段映射" name="mapping">
          <el-alert
            title="字段映射说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <p>以下为海绵系统订单字段与本系统的映射关系，仅供参考，不可修改</p>
          </el-alert>

          <el-table :data="fieldMappings" border stripe>
            <el-table-column prop="externalField" label="海绵字段" width="200" />
            <el-table-column prop="localField" label="本地字段" width="200" />
            <el-table-column prop="description" label="说明" min-width="300" />
          </el-table>

          <el-divider>订单状态映射规则</el-divider>

          <el-table :data="statusMappings" border stripe>
            <el-table-column
              prop="externalStatus"
              label="海绵状态值"
              width="150"
            />
            <el-table-column prop="condition" label="条件" width="200" />
            <el-table-column prop="localStatus" label="本地状态" width="150" />
            <el-table-column prop="description" label="说明" min-width="300" />
          </el-table>
        </el-tab-pane>

        <!-- 客户绑定 -->
        <el-tab-pane label="客户绑定" name="binding">
          <el-alert
            title="客户绑定说明"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <p>
              同步订单前，需要先将客户档案与外部订单号绑定。系统会根据订单号自动匹配客户。
            </p>
            <p>请在客户管理页面，编辑客户档案，在"关联订单号"字段中添加对应的外部订单号。</p>
          </el-alert>

          <el-form :inline="true">
            <el-form-item label="客户搜索">
              <el-input
                v-model="customerSearchKeyword"
                placeholder="输入客户姓名或手机号"
                clearable
                @keyup.enter="searchCustomers"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchCustomers">搜索</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="customers"
            border
            stripe
            v-loading="customersLoading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="realName" label="姓名" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column
              prop="externalOrderIds"
              label="已绑定订单号"
              min-width="200"
            >
              <template #default="{ row }">
                <el-tag
                  v-for="orderId in row.externalOrderIds || []"
                  :key="orderId"
                  style="margin-right: 5px"
                >
                  {{ orderId }}
                </el-tag>
                <span v-if="!row.externalOrderIds || row.externalOrderIds.length === 0">
                  未绑定
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="openBindingDialog(row)"
                >
                  编辑绑定
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 手动同步 -->
        <el-tab-pane label="手动同步" name="manual">
          <el-alert
            title="手动同步说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <p>
              手动同步允许您指定时间范围和订单状态进行同步，不受定时任务限制。
            </p>
            <p>建议在首次配置完成后，先执行一次手动同步以导入历史订单。</p>
          </el-alert>

          <el-form
            :model="manualSyncForm"
            label-width="120px"
            style="max-width: 600px"
          >
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="manualSyncForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="订单状态">
              <el-select
                v-model="manualSyncForm.status"
                placeholder="全部状态"
                clearable
              >
                <el-option label="全部" value="" />
                <el-option label="待发货" :value="2" />
                <el-option label="待收货" :value="3" />
                <el-option label="已完成" :value="7" />
              </el-select>
              <div class="form-tip">留空则同步所有状态的订单</div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleManualSync"
                :loading="syncing"
                size="large"
              >
                <el-icon><Refresh /></el-icon>
                {{ syncing ? '同步中...' : '开始同步' }}
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider v-if="syncResult">同步结果</el-divider>

          <el-descriptions
            v-if="syncResult"
            :column="2"
            border
            style="max-width: 800px"
          >
            <el-descriptions-item label="批次ID">
              {{ syncResult.syncBatchId }}
            </el-descriptions-item>
            <el-descriptions-item label="总处理数">
              {{ syncResult.totalProcessed }}
            </el-descriptions-item>
            <el-descriptions-item label="成功数">
              <el-tag type="success">{{ syncResult.successCount }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="失败数">
              <el-tag type="danger">{{ syncResult.failedCount }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="新建订单">
              {{ syncResult.createdCount }}
            </el-descriptions-item>
            <el-descriptions-item label="更新订单">
              {{ syncResult.updatedCount }}
            </el-descriptions-item>
            <el-descriptions-item label="跳过订单">
              {{ syncResult.skippedCount }}
            </el-descriptions-item>
            <el-descriptions-item label="执行耗时">
              {{ syncResult.executionTime }}ms
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="syncResult && syncResult.errors && syncResult.errors.length > 0">
            <el-divider>错误详情</el-divider>
            <el-table :data="syncResult.errors" border stripe>
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column prop="message" label="错误信息" min-width="300" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 帮助文档 -->
        <el-tab-pane label="帮助文档" name="help">
          <div class="help-content">
            <h3>订单同步功能使用指南</h3>

            <el-divider />

            <h4>一、功能概述</h4>
            <p>
              订单同步功能用于自动从海绵青年GO系统拉取订单数据，并同步到本CRM系统中，
              实现订单数据的统一管理和自动化处理。
            </p>

            <h4>二、配置步骤</h4>
            <ol>
              <li>
                <strong>基本设置：</strong>在"基本设置"标签页中配置API密钥、API地址等必要参数
              </li>
              <li>
                <strong>客户绑定：</strong>在客户档案中绑定外部订单号，建立客户与订单的关联关系
              </li>
              <li>
                <strong>手动同步：</strong>首次配置完成后，建议先执行一次手动同步导入历史订单
              </li>
              <li>
                <strong>启用自动同步：</strong>确认配置无误后，开启自动同步功能
              </li>
            </ol>

            <h4>三、字段映射说明</h4>
            <ul>
              <li>order_id → 订单号</li>
              <li>member_mobile → 客户手机号</li>
              <li>store_name → 校区名称</li>
              <li>goods_name → 课程名称</li>
              <li>pay_price → 支付金额</li>
            </ul>

            <h4>四、状态映射规则</h4>
            <ul>
              <li>海绵状态2-6 + 无退款 → 待上课</li>
              <li>海绵状态7 + 无退款 → 已完成</li>
              <li>海绵状态8,9,-1 或已退款 → 已退款</li>
              <li>海绵状态1（未支付）→ 不同步</li>
            </ul>

            <h4>五、常见问题</h4>
            <el-collapse accordion>
              <el-collapse-item title="Q1: 同步失败提示&quot;未找到关联客户&quot;怎么办？" name="1">
                <p>
                  这是因为客户档案中未绑定对应的外部订单号。请在"客户绑定"标签页中，
                  找到对应客户，编辑并添加外部订单号。
                </p>
              </el-collapse-item>
              <el-collapse-item title="Q2: 如何处理校区不存在的情况？" name="2">
                <p>
                  在"基本设置"中开启"自动创建校区"选项，系统会自动创建不存在的校区。
                  也可以手动在系统设置中先创建好对应的校区。
                </p>
              </el-collapse-item>
              <el-collapse-item title="Q3: 订单状态不同步怎么办？" name="3">
                <p>
                  检查"基本设置"中的"更新已存在订单"选项是否开启。如果关闭，
                  系统只会创建新订单，不会更新已存在订单的状态。
                </p>
              </el-collapse-item>
              <el-collapse-item title="Q4: 同步频率如何设置？" name="4">
                <p>
                  建议设置为30-60分钟。频率过高可能对外部系统造成压力，
                  频率过低可能导致订单状态更新不及时。可根据实际业务量调整。
                </p>
              </el-collapse-item>
            </el-collapse>

            <h4>六、技术支持</h4>
            <p>如遇问题，请联系系统管理员或技术支持团队。</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="logDetailVisible" title="同步日志详情" width="60%">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="订单号">
          {{ currentLog.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="同步类型">
          {{ getSyncTypeText(currentLog.syncType) }}
        </el-descriptions-item>
        <el-descriptions-item label="原状态">
          {{ currentLog.oldStatus || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="新状态">
          {{ currentLog.newStatus || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="同步时间">
          {{ formatSyncTime(currentLog.syncTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="执行耗时">
          {{ currentLog.executionTime }}ms
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="currentLog.result === 'success' ? 'success' : 'danger'">
            {{ currentLog.result === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          {{ currentLog.errorMessage || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider v-if="currentLog && currentLog.changes">变更详情</el-divider>
      <pre v-if="currentLog && currentLog.changes" style="background: #f5f5f5; padding: 15px; border-radius: 4px;">{{ JSON.stringify(currentLog.changes, null, 2) }}</pre>

      <el-divider v-if="currentLog && currentLog.externalData">海绵原始数据</el-divider>
      <pre v-if="currentLog && currentLog.externalData" style="background: #f5f5f5; padding: 15px; border-radius: 4px; max-height: 400px; overflow-y: auto;">{{ JSON.stringify(currentLog.externalData, null, 2) }}</pre>
    </el-dialog>

    <!-- 客户绑定对话框 -->
    <el-dialog v-model="bindingDialogVisible" title="编辑订单号绑定" width="500px">
      <el-form :model="bindingForm" label-width="100px">
        <el-form-item label="客户姓名">
          <el-input :value="bindingForm.realName" disabled />
        </el-form-item>
        <el-form-item label="订单号列表">
          <el-select
            v-model="bindingForm.externalOrderIds"
            multiple
            filterable
            allow-create
            placeholder="输入订单号后按回车添加"
            style="width: 100%"
          >
          </el-select>
          <div class="form-tip">
            可输入多个订单号，每输入一个后按回车键添加
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBinding" :loading="bindingSaving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { orderSyncApi } from '@/api/order-sync';
import { userApi } from '@/api/user';
import { customerApi } from '@/api/customer';

// 时间格式化函数
const formatSyncTime = (time) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// 当前标签页
const activeTab = ref('basic');

// 基本配置
const configForm = reactive({
  apiKey: '12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT', // 海绵API密钥
  apiUrl: 'https://yx.vipstore.top/yoga/admin/getGoodsOrderList', // 海绵订单接口地址
  defaultSalesId: 1, // 默认为第一个用户
  enabled: true,
  interval: 30,
  dailyUpdateTime: '02:00',
  syncRangeDays: 7,
  batchSize: 100,
  updateExisting: true,
  syncCustomerInfo: true,
  autoCreateCampus: true,
});

const saving = ref(false);
const salesList = ref([]);

// 同步日志
const logs = reactive({
  list: [],
  total: 0,
});

const logQuery = reactive({
  orderNo: '',
  syncType: '',
  result: '',
  page: 1,
  pageSize: 20,
});

const logsLoading = ref(false);
const logDetailVisible = ref(false);
const currentLog = ref(null);

// 手动同步
const manualSyncForm = reactive({
  dateRange: [],
  status: null,
});

const syncing = ref(false);
const syncResult = ref(null);

// 客户绑定
const customerSearchKeyword = ref('');
const customers = ref([]);
const customersLoading = ref(false);
const bindingDialogVisible = ref(false);
const bindingSaving = ref(false);
const bindingForm = reactive({
  id: null,
  realName: '',
  externalOrderIds: [],
});

// 字段映射
const fieldMappings = ref([
  { externalField: 'order_id', localField: 'orderNo', description: '订单号（唯一标识）' },
  { externalField: 'member_mobile', localField: 'phone', description: '客户手机号' },
  { externalField: 'member_nickname', localField: 'wechatNickname', description: '客户昵称' },
  { externalField: 'store_name', localField: 'campusName', description: '校区名称（等同于城市名）' },
  { externalField: 'goods_name', localField: 'courseName', description: '课程名称（多商品用顿号连接）' },
  { externalField: 'pay_price', localField: 'paymentAmount', description: '支付金额' },
  { externalField: 'pay_time', localField: 'paymentTime', description: '支付时间' },
  { externalField: 'status', localField: 'externalStatus', description: '海绵原始状态值（1-9）' },
  { externalField: 'refund', localField: 'externalRefund', description: '退款标识' },
  { externalField: 'refund_status', localField: 'externalRefundStatus', description: '退款状态' },
]);

const statusMappings = ref([
  { externalStatus: '2-6', condition: '无退款', localStatus: '待上课', description: '订单已支付，待消费' },
  { externalStatus: '7', condition: '无退款', localStatus: '已完成', description: '订单已完成' },
  { externalStatus: '8, 9, -1', condition: '或已退款', localStatus: '已退款', description: '订单取消或已退款' },
  { externalStatus: '1', condition: '-', localStatus: '不同步', description: '未支付订单不同步到系统' },
]);

// 键名映射 - 从数据库字段到前��字段的映射
const configKeyMap = {
  'api_key': 'apiKey',
  'api_url': 'apiUrl',
  'daily_update_time': 'dailyUpdateTime',
  'sync_range_days': 'syncRangeDays',
  'update_existing': 'updateExisting',
  'sync_customer_info': 'syncCustomerInfo',
  'auto_create_campus': 'autoCreateCampus',
  'enabled': 'enabled',
  'interval': 'interval',
  'batch_size': 'batchSize',
  'default_sales_id': 'defaultSalesId'
};

// 反向键名映射 - 从前端字段到数据库字段的映射
const reverseConfigKeyMap = {
  'apiKey': 'api_key',
  'apiUrl': 'api_url',
  'dailyUpdateTime': 'daily_update_time',
  'syncRangeDays': 'sync_range_days',
  'updateExisting': 'update_existing',
  'syncCustomerInfo': 'sync_customer_info',
  'autoCreateCampus': 'auto_create_campus',
  'enabled': 'enabled',
  'interval': 'interval',
  'batchSize': 'batch_size',
  'defaultSalesId': 'default_sales_id'
};

// 加载配置
const loadConfig = async () => {
  try {
    const res = await orderSyncApi.getConfig();
    console.log('配置API响应:', res); // 添加调试日志

    // 处理后端返回的数据格式：{success: true, data: {key: value, ...}}
    let configs = [];
    if (res && res.data && typeof res.data === 'object') {
      // 将对象转换为数组格式
      configs = Object.entries(res.data).map(([key, value]) => ({
        configKey: key,
        configValue: value
      }));
    } else if (Array.isArray(res)) {
      configs = res;
    }

    console.log('处理后的配置数组:', configs); // 添加调试日志

    configs.forEach((item) => {
      let key = item.configKey.replace('order_sync.', '');

      // 应用键名映射
      if (configKeyMap[key]) {
        key = configKeyMap[key];
      }

      console.log('处理配置项:', {
        originalKey: item.configKey,
        processedKey: key,
        originalValue: item.configValue,
        inForm: key in configForm
      });

      if (key in configForm) {
        let value = item.configValue;

        // 类型转换
        if (key === 'enabled' || key === 'updateExisting' || key === 'syncCustomerInfo' || key === 'autoCreateCampus') {
          // 处理布尔值：支持字符串和布尔类型
          if (typeof value === 'string') {
            value = value === 'true';
          } else if (typeof value === 'boolean') {
            value = value; // 保持布尔值不变
          }
        } else if (key === 'defaultSalesId' || key === 'interval' || key === 'syncRangeDays' || key === 'batchSize') {
          value = parseInt(value);
        }

        configForm[key] = value;
        console.log(`设置表单字段 ${key} =`, value);
      } else {
        console.log(`表单中没有字段: ${key}`);
      }
    });

    console.log('最终表单数据:', configForm);
  } catch (error) {
    ElMessage.error('加载配置失败');
  }
};

// 保存配置
const saveConfig = async () => {
  try {
    saving.value = true;

    // 手动映射配置键 - 确保正确转换
    const keyMapping = {
      'apiKey': 'api_key',
      'apiUrl': 'api_url',
      'defaultSalesId': 'default_sales_id',
      'dailyUpdateTime': 'daily_update_time',
      'syncRangeDays': 'sync_range_days',
      'batchSize': 'batch_size',
      'updateExisting': 'update_existing',
      'syncCustomerInfo': 'sync_customer_info',
      'autoCreateCampus': 'auto_create_campus',
      'enabled': 'enabled',
      'interval': 'interval'
    };

    // 转换配置为数组格式
    const updates = Object.keys(configForm).map((key) => {
      let value = configForm[key];

      // 处理null值，避免转换��"null"字符串
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = String(value);
      }

      // 使用强制键名映射
      const dbKey = keyMapping[key] || key;

      return {
        configKey: `order_sync.${dbKey}`,
        configValue: value,
      };
    });

    // 批量更新
    for (const item of updates) {
      await orderSyncApi.updateConfig(item);
    }

    ElMessage.success('配置保存成功');
  } catch (error) {
    ElMessage.error('配置保存失败');
  } finally {
    saving.value = false;
  }
};

// 加载销售人员列表
const loadSalesList = async () => {
  try {
    const res = await userApi.getList({ roleId: 3 }); // 假设roleId=3为销售角色
    salesList.value = (res && res.list) ? res.list : [];
  } catch (error) {
    console.error('加载销售人员失败', error);
    salesList.value = []; // 设置空数组避免undefined错误
  }
};

// 加载日志
const loadLogs = async () => {
  try {
    logsLoading.value = true;

    // 映射前端参数到后端期望的参数名
    const params = {
      page: logQuery.page,
      limit: logQuery.pageSize
    };

    // 映射筛选条件
    if (logQuery.orderNo) {
      // 使用新增的orderNo参数筛选
      params.orderNo = logQuery.orderNo;
    }

    // 处理同步类型筛选
    if (logQuery.syncType) {
      params.syncType = logQuery.syncType;
    }

    // 处理同步结果筛选
    if (logQuery.result) {
      params.result = logQuery.result;
    }

    console.log('发送的日志查询参数:', params);
    const res = await orderSyncApi.getLogs(params);
    console.log('日志查询完整响应:', JSON.stringify(res, null, 2));

    // 处理后端返回的数据格式
    logs.list = res.logs || [];
    logs.total = res.total || 0;
  } catch (error) {
    console.error('加载日志失败:', error);
    if (error.response?.status === 400) {
      ElMessage.error('参数错误: ' + (error.response.data?.message || '请求参数不正确'));
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足: 需要订单同步权限');
    } else {
      ElMessage.error('加载日志失败');
    }
  } finally {
    logsLoading.value = false;
  }
};

// 重置日志查询
const resetLogQuery = () => {
  logQuery.orderNo = '';
  logQuery.syncType = '';
  logQuery.result = '';
  logQuery.page = 1;
  logQuery.pageSize = 20;
  loadLogs();
};

// 查看日志详情
const viewLogDetail = (row) => {
  currentLog.value = row;
  logDetailVisible.value = true;
};

// 获取同步类型文本
const getSyncTypeText = (type) => {
  const map = {
    create: '新建',
    update: '更新',
    skip: '跳过',
    delete: '删除',
  };
  return map[type] || type;
};

// 手动同步
const handleManualSync = async () => {
  try {
    await ElMessageBox.confirm('确定要执行订单同步吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    syncing.value = true;
    syncResult.value = null;

    const params = {};
    if (manualSyncForm.dateRange && manualSyncForm.dateRange.length === 2) {
      params.startTime = manualSyncForm.dateRange[0];
      params.endTime = manualSyncForm.dateRange[1];
    }
    if (manualSyncForm.status !== null) {
      params.status = manualSyncForm.status;
    }

    const res = await orderSyncApi.triggerSync(params);
    syncResult.value = res.data;

    ElMessage.success('同步完成');

    // 刷新日志
    if (activeTab.value === 'logs') {
      loadLogs();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('同步失败：' + (error.message || '未知错误'));
    }
  } finally {
    syncing.value = false;
  }
};

// 搜索客户
const searchCustomers = async () => {
  try {
    customersLoading.value = true;
    const res = await customerApi.getList({
      keyword: customerSearchKeyword.value,
      page: 1,
      pageSize: 50,
    });
    customers.value = res.list || [];
  } catch (error) {
    ElMessage.error('搜索客户失败');
  } finally {
    customersLoading.value = false;
  }
};

// 打开绑定对话框
const openBindingDialog = (row) => {
  bindingForm.id = row.id;
  bindingForm.realName = row.realName || row.wechatNickname;
  bindingForm.externalOrderIds = row.externalOrderIds || [];
  bindingDialogVisible.value = true;
};

// 保存绑定
const saveBinding = async () => {
  try {
    bindingSaving.value = true;
    await customerApi.update(bindingForm.id, {
      externalOrderIds: bindingForm.externalOrderIds,
    });
    ElMessage.success('保存成功');
    bindingDialogVisible.value = false;
    searchCustomers(); // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    bindingSaving.value = false;
  }
};

onMounted(() => {
  loadConfig();
  loadSalesList();
  loadLogs();
});
</script>

<style scoped lang="scss">
.order-sync-config {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .logs-filter {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .help-content {
    padding: 20px;
    line-height: 1.8;

    h3 {
      color: #303133;
      margin-bottom: 20px;
    }

    h4 {
      color: #606266;
      margin: 20px 0 10px;
    }

    p {
      color: #606266;
      margin: 10px 0;
    }

    ul,
    ol {
      color: #606266;
      padding-left: 25px;

      li {
        margin: 8px 0;
      }
    }
  }
}
</style>
