import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { HaimianApiService } from './haimian-api.service';
import { BusinessConfigService } from '../business-config/business-config.service';
import { OrderSyncLog } from './entities/order-sync-log.entity';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Campus } from '../system/entities/campus.entity';
import { HaimianOrder } from './interfaces/haimian-order.interface';
import { SyncResultDto, SyncLogQueryDto } from './dto/sync-result.dto';

@Injectable()
export class OrderSyncService {
  private readonly logger = new Logger(OrderSyncService.name);

  constructor(
    @InjectRepository(OrderSyncLog)
    private readonly syncLogRepository: Repository<OrderSyncLog>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    private readonly haimianApiService: HaimianApiService,
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  /**
   * 手动触发同步
   */
  async triggerSync(params?: {
    startTime?: string;
    endTime?: string;
    status?: number;
  }): Promise<SyncResultDto> {
    const syncBatchId = uuidv4();
    const startTime = Date.now();

    this.logger.log(`开始手动同步，批次ID: ${syncBatchId}`);

    try {
      // 获取配置
      const syncRangeDays = parseInt(
        await this.businessConfigService.getConfig('order_sync.sync_range_days') || '7',
      );

      // 计算时间范围（如果未指定）
      const endDate = params?.endTime || this.formatDate(new Date());
      const startDate =
        params?.startTime ||
        this.formatDate(new Date(Date.now() - syncRangeDays * 24 * 60 * 60 * 1000));

      // 获取海绵订单数据
      const haimianOrders = await this.haimianApiService.getAllOrders({
        startTime: startDate,
        endTime: endDate,
        status: params?.status,
      });

      // 过滤掉status=1（未支付）的订单
      const ordersToSync = haimianOrders.filter(order => order.status !== 1);

      this.logger.log(`获取到 ${ordersToSync.length} 条待同步订单（已过滤未支付订单）`);

      // 执行同步
      const result = await this.syncOrders(ordersToSync, syncBatchId);

      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      this.logger.log(
        `同步完成，批次ID: ${syncBatchId}，` +
          `成功: ${result.successCount}，失败: ${result.failedCount}，` +
          `耗时: ${executionTime}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(`同步失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 执行订单同步
   */
  private async syncOrders(
    haimianOrders: HaimianOrder[],
    syncBatchId: string,
  ): Promise<SyncResultDto> {
    const result: SyncResultDto = {
      syncBatchId,
      totalProcessed: haimianOrders.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 0,
      executionTime: 0,
      errors: [],
    };

    const updateExisting = (await this.businessConfigService.getConfig('order_sync.update_existing')) === 'true';
    const syncCustomerInfo = (await this.businessConfigService.getConfig('order_sync.sync_customer_info')) === 'true';
    const autoCreateCampus = (await this.businessConfigService.getConfig('order_sync.auto_create_campus')) === 'true';

    for (const haimianOrder of haimianOrders) {
      const orderStartTime = Date.now();
      try {
        // 查找本地订单
        const existingOrder = await this.orderRepository.findOne({
          where: { orderNo: haimianOrder.order_id },
        });

        if (existingOrder) {
          // 订单已存在
          if (!updateExisting) {
            // 跳过已存在的订单
            await this.logSync({
              syncBatchId,
              orderNo: haimianOrder.order_id,
              syncType: 'skip',
              oldStatus: existingOrder.orderStatus,
              newStatus: null,
              externalData: haimianOrder,
              result: 'success',
              executionTime: Date.now() - orderStartTime,
            });
            result.skippedCount++;
            result.successCount++;
            continue;
          }

          // 更新订单
          const updated = await this.updateOrder(existingOrder, haimianOrder, syncBatchId, orderStartTime);
          if (updated) {
            result.updatedCount++;
            result.successCount++;
          } else {
            result.skippedCount++;
            result.successCount++;
          }
        } else {
          // 创建新订单
          await this.createOrder(haimianOrder, syncBatchId, orderStartTime, {
            syncCustomerInfo,
            autoCreateCampus,
          });
          result.createdCount++;
          result.successCount++;
        }
      } catch (error) {
        this.logger.error(`处理订单 ${haimianOrder.order_id} 失败: ${error.message}`);
        result.failedCount++;
        result.errors.push({
          orderNo: haimianOrder.order_id,
          message: error.message,
        });

        await this.logSync({
          syncBatchId,
          orderNo: haimianOrder.order_id,
          syncType: 'create',
          result: 'failed',
          errorMessage: error.message,
          externalData: haimianOrder,
          executionTime: Date.now() - orderStartTime,
        });
      }
    }

    return result;
  }

  /**
   * 创建新订单
   */
  private async createOrder(
    haimianOrder: HaimianOrder,
    syncBatchId: string,
    startTime: number,
    options: { syncCustomerInfo: boolean; autoCreateCampus: boolean },
  ): Promise<void> {
    // 查找或创建校区
    let campus = await this.campusRepository.findOne({
      where: { campusName: haimianOrder.store_name },
    });

    if (!campus && options.autoCreateCampus) {
      campus = this.campusRepository.create({
        campusName: haimianOrder.store_name,
        city: haimianOrder.store_name, // 城市名就是校区名
        status: 1, // 启用
      });
      await this.campusRepository.save(campus);
      this.logger.log(`自动创建校区: ${haimianOrder.store_name}`);
    }

    if (!campus) {
      throw new Error(`校区不存在: ${haimianOrder.store_name}`);
    }

    // 查找客户（通过external_order_ids字段）
    const customer = await this.findCustomerByOrderId(haimianOrder.order_id);

    if (!customer) {
      throw new Error(
        `未找到关联客户，订单号: ${haimianOrder.order_id}，请先在客户档案中绑定此订单号`,
      );
    }

    // 同步客户信息（如果启用）
    if (options.syncCustomerInfo) {
      if (haimianOrder.member_mobile && !customer.phone) {
        customer.phone = haimianOrder.member_mobile;
      }
      if (haimianOrder.member_nickname && !customer.wechatNickname) {
        customer.wechatNickname = haimianOrder.member_nickname;
      }
      await this.customerRepository.save(customer);
    }

    // 计算订单状态
    const orderStatus = this.mapOrderStatus(haimianOrder);

    // 合并课程名称（多商品）
    const courseName = haimianOrder.skus.map(sku => sku.goods_name).join('、');

    // 获取默认销售ID
    const defaultSalesId = parseInt(
      await this.businessConfigService.getConfig('order_sync.default_sales_id') || '1',
    );

    // 创建订单
    const order = this.orderRepository.create({
      orderNo: haimianOrder.order_id,
      customerId: customer.id,
      campusId: campus.id,
      courseName,
      teacherName: '', // 外部订单暂无教师信息
      paymentAmount: parseFloat(haimianOrder.pay_price),
      paymentTime: new Date(haimianOrder.pay_time),
      orderStatus,
      salesId: defaultSalesId,
      dataSource: '海绵青年GO',
      isExternal: 1,
      externalSystem: 'HAIMIAN',
      externalStatus: haimianOrder.status,
      externalRefund: haimianOrder.refund,
      externalRefundStatus: haimianOrder.refund_status,
      syncStatus: '已同步',
      lastSyncTime: new Date(),
      isDeleted: 0,
      remark: haimianOrder.remark || '',
    });

    await this.orderRepository.save(order);

    // 记录日志
    await this.logSync({
      syncBatchId,
      orderNo: haimianOrder.order_id,
      syncType: 'create',
      newStatus: orderStatus,
      externalData: haimianOrder,
      result: 'success',
      executionTime: Date.now() - startTime,
    });

    this.logger.log(`创建订单成功: ${haimianOrder.order_id}`);
  }

  /**
   * 更新订单
   */
  private async updateOrder(
    existingOrder: Order,
    haimianOrder: HaimianOrder,
    syncBatchId: string,
    startTime: number,
  ): Promise<boolean> {
    const newStatus = this.mapOrderStatus(haimianOrder);
    const oldStatus = existingOrder.orderStatus;

    // 检测变更
    const changes: any = {};
    let hasChanges = false;

    if (newStatus !== oldStatus) {
      changes.orderStatus = { old: oldStatus, new: newStatus };
      hasChanges = true;
    }

    if (haimianOrder.status !== existingOrder.externalStatus) {
      changes.externalStatus = { old: existingOrder.externalStatus, new: haimianOrder.status };
      hasChanges = true;
    }

    if (haimianOrder.refund !== existingOrder.externalRefund) {
      changes.externalRefund = { old: existingOrder.externalRefund, new: haimianOrder.refund };
      hasChanges = true;
    }

    if (haimianOrder.refund_status !== existingOrder.externalRefundStatus) {
      changes.externalRefundStatus = {
        old: existingOrder.externalRefundStatus,
        new: haimianOrder.refund_status,
      };
      hasChanges = true;
    }

    if (!hasChanges) {
      // 无变化，跳过
      await this.logSync({
        syncBatchId,
        orderNo: haimianOrder.order_id,
        syncType: 'skip',
        oldStatus,
        newStatus: oldStatus,
        externalData: haimianOrder,
        result: 'success',
        executionTime: Date.now() - startTime,
      });
      return false;
    }

    // 更新订单
    existingOrder.orderStatus = newStatus;
    existingOrder.externalStatus = haimianOrder.status;
    existingOrder.externalRefund = haimianOrder.refund;
    existingOrder.externalRefundStatus = haimianOrder.refund_status;
    existingOrder.lastSyncTime = new Date();
    existingOrder.syncStatus = '已同步';

    await this.orderRepository.save(existingOrder);

    // 记录日志
    await this.logSync({
      syncBatchId,
      orderNo: haimianOrder.order_id,
      syncType: 'update',
      oldStatus,
      newStatus,
      changes,
      externalData: haimianOrder,
      result: 'success',
      executionTime: Date.now() - startTime,
    });

    this.logger.log(`更新订单成功: ${haimianOrder.order_id}，状态: ${oldStatus} -> ${newStatus}`);
    return true;
  }

  /**
   * 映射订单状态
   * 规则：
   * - status=1: 不同步（未支付）
   * - status=2-6 且无退款: 待上课
   * - status=7 且无退款: 已完成
   * - status=8,9,-1 或 refund=2 或 refund_status=1: 已退款
   */
  private mapOrderStatus(haimianOrder: HaimianOrder): string {
    // 检查退款状态
    if (
      haimianOrder.refund === 2 || // 已退款
      haimianOrder.refund_status === 1 || // 退款通过
      [8, 9, -1].includes(haimianOrder.status) // 订单关闭/取消
    ) {
      return '已退款';
    }

    // 根据订单状态映射
    if (haimianOrder.status === 7) {
      return '已完成';
    }

    if ([2, 3, 4, 5, 6].includes(haimianOrder.status)) {
      return '待上课';
    }

    // 默认
    return '待上课';
  }

  /**
   * 通过订单号查找客户
   */
  private async findCustomerByOrderId(orderId: string): Promise<Customer | null> {
    // 使用JSON_CONTAINS查找（MySQL 5.7+）
    // 由于TypeORM对JSON_CONTAINS支持有限，使用LIKE模糊查询
    const customers = await this.customerRepository.find({
      where: {
        // @ts-ignore
        externalOrderIds: Like(`%${orderId}%`),
      },
    });

    // 进一步精确匹配（避免误匹配）
    for (const customer of customers) {
      if (Array.isArray(customer.externalOrderIds) &&customer.externalOrderIds.includes(orderId)) {
        return customer;
      }
    }

    return null;
  }

  /**
   * 记录同步日志
   */
  private async logSync(data: {
    syncBatchId: string;
    orderNo: string;
    syncType: string;
    oldStatus?: string;
    newStatus?: string;
    changes?: any;
    externalData?: any;
    result: string;
    errorMessage?: string;
    executionTime: number;
  }): Promise<void> {
    const log = this.syncLogRepository.create(data);
    await this.syncLogRepository.save(log);
  }

  /**
   * 查询同步日志
   */
  async getSyncLogs(query: SyncLogQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const where: any = {};
    if (query.syncBatchId) where.syncBatchId = query.syncBatchId;
    if (query.orderNo) where.orderNo = Like(`%${query.orderNo}%`);
    if (query.syncType) where.syncType = query.syncType;
    if (query.result) where.result = query.result;

    const [logs, total] = await this.syncLogRepository.findAndCount({
      where,
      order: { syncTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: logs,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取同步配置
   */
  async getSyncConfig() {
    const config = await this.businessConfigService.findAll('order_sync');
    return config;
  }

  /**
   * 更新同步配置
   */
  async updateSyncConfig(configKey: string, configValue: string) {
    return this.businessConfigService.updateConfig(configKey, configValue);
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
