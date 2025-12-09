import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Campus } from '../system/entities/campus.entity';
import { TemporaryOrder } from '../customer/entities/temporary-order.entity';
import { BusinessConfigService } from '../business-config/business-config.service';
import { TeacherService } from '../teacher/teacher.service';
import { OrderSyncLog } from './entities/order-sync-log.entity';
import {
  HaimianOrder,
  HaimianApiResponse,
  HaimianOrderMember,
} from './interfaces/haimian-order.interface';
import { HaimianApiService } from './haimian-api.service';

@Injectable()
export class OrderSyncService {
  private readonly logger = new Logger(OrderSyncService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    @InjectRepository(OrderSyncLog)
    private readonly syncLogRepository: Repository<OrderSyncLog>,
    @InjectRepository(TemporaryOrder)
    private readonly temporaryOrderRepository: Repository<TemporaryOrder>,
    private readonly haimianApiService: HaimianApiService,
    private readonly businessConfigService: BusinessConfigService,
    private readonly teacherService: TeacherService,
  ) {}

  /**
   * 同步海绵订单
   */
  async syncOrders(params: {
    startTime?: string;
    endTime?: string;
    status?: number;
    syncCustomerInfo?: boolean;
    autoCreateCampus?: boolean;
    updateExisting?: boolean;
  }): Promise<{
    total: number;
    success: number;
    failed: number;
    skipped: number;
    updated: number;
    created: number;
    errors: Array<{ orderNo: string; message: string }>;
  }> {
    const {
      startTime,
      endTime,
      status,
      syncCustomerInfo = true,
      autoCreateCampus = true,
      updateExisting = false,
    } = params;

    // 生成同步批次ID
    const syncBatchId = `SYNC_${Date.now()}`;

    this.logger.log(`开始同步海绵订单，批次ID: ${syncBatchId}`);
    this.logger.log(`同步参数: ${JSON.stringify(params)}`);

    // 从海绵API获取订单数据
    const haimianOrders = await this.haimianApiService.getAllOrders({
      startTime,
      endTime,
      status,
    });

    this.logger.log(`从海绵API获取到 ${haimianOrders.length} 条订单`);

    // 处理订单同步
    const result = {
      total: haimianOrders.length,
      success: 0,
      failed: 0,
      skipped: 0,
      updated: 0,
      created: 0,
      errors: [] as Array<{ orderNo: string; message: string }>,
    };

    for (const haimianOrder of haimianOrders) {
      const orderStartTime = Date.now();

      try {
        this.logger.log(`开始处理订单: ${haimianOrder.order_id}`);

        // 查找本地订单
        const existingOrder = await this.orderRepository.findOne({
          where: { orderNo: haimianOrder.order_id.toString() },
        });

        if (existingOrder) {
          // 订单已存在
          if (!updateExisting) {
            // 跳过已存在的订单
            await this.logSync({
              syncBatchId,
              orderNo: haimianOrder.order_id.toString(),
              syncType: 'skip',
              oldStatus: existingOrder.orderStatus,
              newStatus: null,
              externalData: haimianOrder,
              result: 'success',
              executionTime: Date.now() - orderStartTime,
            });
            result.skipped++;
            result.success++;
            continue;
          }

          // 更新订单
          const updated = await this.updateOrder(existingOrder, haimianOrder, syncBatchId, orderStartTime);
          if (updated) {
            result.updated++;
            result.success++;
          } else {
            result.skipped++;
            result.success++;
          }
        } else {
          // 创建新订单
          await this.createOrder(haimianOrder, syncBatchId, orderStartTime, {
            syncCustomerInfo,
            autoCreateCampus,
          });
          result.created++;
          result.success++;
        }
      } catch (error) {
        this.logger.error(`处理订单 ${haimianOrder.order_id} 失败: ${error.message}`);
        result.failed++;
        result.errors.push({
          orderNo: haimianOrder.order_id.toString(),
          message: error.message,
        });

        await this.logSync({
          syncBatchId,
          orderNo: haimianOrder.order_id.toString(),
          syncType: 'create',
          result: 'failed',
          errorMessage: error.message,
          externalData: haimianOrder,
          executionTime: Date.now() - orderStartTime,
        });
      }
    }

    // 处理临时订单
    const syncedOrderNos = haimianOrders.map(order => order.order_id.toString());
    await this.handleTemporaryOrdersOnSync(syncedOrderNos);

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
    // 查找或��建校区
    let campus = await this.campusRepository.findOne({
      where: { campusName: haimianOrder.store_name },
    });

    if (!campus && options.autoCreateCampus) {
      campus = this.campusRepository.create({
        campusName: haimianOrder.store_name,
        campusCode: `AUTO_${Date.now()}`, // 自动生成校区编码
        address: haimianOrder.store_name, // 将店铺名作为地址
        status: 1, // 启用
      });
      await this.campusRepository.save(campus);
      this.logger.log(`自动创建校区: ${haimianOrder.store_name}`);
    }

    if (!campus) {
      throw new Error(`校区不存在: ${haimianOrder.store_name}`);
    }

    // 直接创建或查找客户（简化逻辑）
    const customer = await this.findOrCreateCustomer(haimianOrder, options);

    // 创建或查找老师
    let teacher = null;
    if (haimianOrder.coach_name) {
      teacher = await this.teacherService.findOrCreateTeacher({
        teacherId: haimianOrder.coach_id.toString(),
        teacherName: haimianOrder.coach_name,
        campusName: haimianOrder.store_name,
        sourceSystem: '海绵青年GO',
      });
    }

    // 计算订单状态
    const orderStatus = this.mapOrderStatus(haimianOrder);

    // 合并课程名称（多商品）
    const courseName = haimianOrder.skus.map(sku => sku.goods_name).join('、');

    // 获取默认销售ID
    const defaultSalesIdConfig = await this.businessConfigService.getConfig('order_sync.default_sales_id') || '1';
    const defaultSalesId = !isNaN(parseInt(defaultSalesIdConfig)) ? parseInt(defaultSalesIdConfig) : 1;

    // 计算老师提成 - 使用课程差异化提成逻辑
    let teacherCommission = 0;
    if (haimianOrder.amount && haimianOrder.is_commission === 1 && !isNaN(parseFloat(haimianOrder.amount))) {
      // 如果API返回了提成金额，优先使用API的金额
      teacherCommission = parseFloat(haimianOrder.amount);
    } else {
      // 否则根据课程类型计算差异化提成
      teacherCommission = this.calculateCommissionByCourse(courseName);
    }

    // 创建订单
    const order = this.orderRepository.create({
      // id: undefined, // 让数据库自动生成 - 不需要显式设置
      orderNo: haimianOrder.order_id.toString(),
      customerId: customer.id,
      campusId: campus.id,
      courseName,
      teacherName: haimianOrder.coach_name || '', // 使用海绵的老师姓名
      teacherId: haimianOrder.coach_id && !isNaN(parseInt(haimianOrder.coach_id.toString())) ? parseInt(haimianOrder.coach_id.toString()) : null, // 设置老师ID
      paymentAmount: haimianOrder.need_pay && !isNaN(parseFloat(haimianOrder.need_pay)) ? parseFloat(haimianOrder.need_pay) : 0,
      paymentTime: this.parseHaimianDateTime(haimianOrder.pay_time.toString()),
      orderStatus,
      salesId: defaultSalesId,
      isNewStudent: 1,
      region: '',
      orderTag: '',
      salesCommissionAmount: teacherCommission, // 修复：老师提成应该存储到commissionAmount字段
      // 添加客户信息字段
      wechatId: `HM_${haimianOrder.member_id}_${Date.now()}`,
      wechatNickname: haimianOrder.member?.nick_name || '',
      phone: haimianOrder.member?.mobile || '',
      dataSource: '海绵青年GO',
      isExternal: 1,
      externalSystem: 'HAIMIAN',
      externalStatus: haimianOrder.status != null ? haimianOrder.status : null,
      externalRefund: haimianOrder.refund != null ? haimianOrder.refund : null,
      externalRefundStatus: haimianOrder.refund_status != null ? haimianOrder.refund_status : null,
      syncStatus: '已同步',
      lastSyncTime: new Date(),
      isDeleted: 0,
      remark: haimianOrder.remark || '',
    });

    await this.orderRepository.save(order);

    await this.logSync({
      syncBatchId,
      orderNo: haimianOrder.order_id.toString(),
      syncType: 'create',
      newStatus: orderStatus,
      externalData: haimianOrder,
      result: 'success',
      executionTime: Date.now() - startTime,
    });

    this.logger.log(`订单创建成功: ${haimianOrder.order_id}`);
  }

  /**
   * 更新现有订单
   */
  private async updateOrder(
    order: Order,
    haimianOrder: HaimianOrder,
    syncBatchId: string,
    startTime: number,
  ): Promise<boolean> {
    const oldStatus = order.orderStatus;
    const newStatus = this.mapOrderStatus(haimianOrder);

    // 检查是否需要更新
    const needsUpdate =
      oldStatus !== newStatus ||
      order.externalStatus !== haimianOrder.status ||
      order.externalRefund !== haimianOrder.refund ||
      order.externalRefundStatus !== haimianOrder.refund_status;

    if (!needsUpdate) {
      await this.logSync({
        syncBatchId,
        orderNo: haimianOrder.order_id.toString(),
        syncType: 'skip',
        oldStatus,
        newStatus: oldStatus,
        externalData: haimianOrder,
        result: 'success',
        executionTime: Date.now() - startTime,
      });
      return false;
    }

    // 更新订单状态
    order.orderStatus = newStatus;
    order.externalStatus = haimianOrder.status;
    order.externalRefund = haimianOrder.refund;
    order.externalRefundStatus = haimianOrder.refund_status;
    order.syncStatus = '已更新';
    order.lastSyncTime = new Date();

    await this.orderRepository.save(order);

    await this.logSync({
      syncBatchId,
      orderNo: haimianOrder.order_id.toString(),
      syncType: 'update',
      oldStatus,
      newStatus,
      externalData: haimianOrder,
      result: 'success',
      executionTime: Date.now() - startTime,
    });

    this.logger.log(`订单更新成功: ${haimianOrder.order_id}`);
    return true;
  }

  /**
   * 查找或创建客户
   */
  private async findOrCreateCustomer(
    haimianOrder: HaimianOrder,
    options: { syncCustomerInfo: boolean; autoCreateCampus: boolean },
  ): Promise<Customer> {
    // 首先尝试通过订单号查找已存在的客户
    let customer = await this.findCustomerByOrderId(
      haimianOrder.order_id.toString(),
      haimianOrder.member?.mobile,
      haimianOrder.member?.nick_name
    );

    if (!customer && options.syncCustomerInfo) {
      // 如果没找到客户且允许同步客户信息，则创建新客户
      const defaultSalesIdConfig = await this.businessConfigService.getConfig('order_sync.default_sales_id') || '1';
      const defaultSalesId = !isNaN(parseInt(defaultSalesIdConfig)) ? parseInt(defaultSalesIdConfig) : 1;

      customer = this.customerRepository.create({
        wechatId: `HM_${haimianOrder.member_id}_${Date.now()}`, // 生成唯一微信ID
        wechatNickname: haimianOrder.member?.nick_name || `海绵用户_${haimianOrder.member?.mobile?.slice(-4) || '未知'}`,
        phone: haimianOrder.member?.mobile || '',
        realName: haimianOrder.member?.realname || haimianOrder.member?.nick_name || '',
        source: '海绵青年GO',
        customerIntent: '中意向',
        lifecycleStage: '线索',
        salesId: defaultSalesId,
      });

      await this.customerRepository.save(customer);
      this.logger.log(`创建新客户: ${customer.wechatNickname}`);
    }

    if (!customer) {
      throw new Error('无法创建或找到客户信息');
    }

    return customer;
  }

  /**
   * 通过订单信息查找客户
   */
  private async findCustomerByOrderId(
    orderId: string,
    mobile?: string,
    nickname?: string,
  ): Promise<Customer | null> {
    // 首先通过手机号查找
    if (mobile) {
      const customerByPhone = await this.customerRepository.findOne({
        where: { phone: mobile },
      });
      if (customerByPhone) {
        this.logger.log(`通过手机号找到客户: ${customerByPhone.wechatNickname}, 订单: ${orderId}`);
        return customerByPhone;
      }
    }

    // 通过微信昵称查找
    if (nickname) {
      const customerByNickname = await this.customerRepository.findOne({
        where: { wechatNickname: nickname },
      });
      if (customerByNickname) {
        this.logger.log(`通过昵称找到客户: ${customerByNickname.wechatNickname}, 订单: ${orderId}`);
        return customerByNickname;
      }
    }

    return null;
  }

  /**
   * 映射订单状态
   */
  private mapOrderStatus(haimianOrder: HaimianOrder): string {
    // 根据海绵订单状态映射到本地订单状态
    if (haimianOrder.refund === 1 || haimianOrder.refund_status === 1) {
      return '已退款';
    }

    switch (haimianOrder.status) {
      case 1:
      case 2:
        return '待上课';
      case 3:
      case 4:
        return '上课中';
      case 5:
      case 6:
      case 7:
      case 8:
        return '已完成';
      case 0:
      default:
        return '待上课';
    }
  }

  /**
   * 解析海绵时间格式
   */
  private parseHaimianDateTime(timeValue: string | number): Date | null {
    if (!timeValue) return null;

    try {
      // 如果是时间戳（秒）
      if (typeof timeValue === 'number') {
        // 检查是否是秒级时间戳（10位数）
        if (timeValue < 10000000000) {
          return new Date(timeValue * 1000);
        }
        // 毫秒级时间戳
        return new Date(timeValue);
      }

      // 如果是字符串，尝试解析
      const timeStr = timeValue.toString();

      // 尝试直接解析日期格式
      const parsedDate = new Date(timeStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }

      // 尝试解析时间戳字符串
      const timestamp = parseInt(timeStr);
      if (!isNaN(timestamp)) {
        if (timestamp < 10000000000) {
          return new Date(timestamp * 1000);
        }
        return new Date(timestamp);
      }

      this.logger.warn(`无法解析时间格式: ${timeValue}`);
      return null;
    } catch (error) {
      this.logger.warn(`解析时间失败: ${timeValue}, 错误: ${error.message}`);
      return null;
    }
  }

  /**
   * 记录同步日志
   */
  private async logSync(data: {
    syncBatchId: string;
    orderNo: string;
    syncType: 'create' | 'update' | 'skip';
    oldStatus?: string;
    newStatus?: string;
    externalData?: any;
    result: 'success' | 'failed';
    errorMessage?: string;
    executionTime: number;
  }): Promise<void> {
    const syncLog = this.syncLogRepository.create({
      syncBatchId: data.syncBatchId,
      orderNo: data.orderNo,
      syncType: data.syncType,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      externalData: data.externalData,
      result: data.result,
      errorMessage: data.errorMessage,
      executionTime: data.executionTime,
      syncTime: new Date(),
    });

    await this.syncLogRepository.save(syncLog);
  }

  /**
   * 获取同步统计
   */
  async getSyncStatistics(params: {
    startDate?: string;
    endDate?: string;
    batchId?: string;
  }): Promise<{
    totalSyncs: number;
    successCount: number;
    failedCount: number;
    averageExecutionTime: number;
    recentLogs: OrderSyncLog[];
  }> {
    const whereCondition: any = {};

    if (params.startDate && params.endDate) {
      whereCondition.syncTime = Between(
        new Date(params.startDate),
        new Date(params.endDate),
      );
    }

    if (params.batchId) {
      whereCondition.syncBatchId = params.batchId;
    }

    const [logs, totalSyncs] = await this.syncLogRepository.findAndCount({
      where: whereCondition,
      order: { syncTime: 'DESC' },
      take: 10,
    });

    const successCount = logs.filter(log => log.result === 'success').length;
    const failedCount = logs.filter(log => log.result === 'failed').length;
    const averageExecutionTime = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.executionTime, 0) / logs.length
      : 0;

    return {
      totalSyncs,
      successCount,
      failedCount,
      averageExecutionTime,
      recentLogs: logs,
    };
  }

  /**
   * 获取业务配置服务（用于控制器访问）
   */
  getBusinessConfigService() {
    return this.businessConfigService;
  }

  /**
   * 获取同步日志
   */
  async getSyncLogs(params: {
    page: number;
    limit: number;
    batchId?: string;
    orderNo?: string;
    syncType?: string;
    result?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: OrderSyncLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const whereCondition: any = {};

    if (params.batchId) {
      whereCondition.syncBatchId = params.batchId;
    }

    if (params.orderNo) {
      whereCondition.orderNo = Like(`%${params.orderNo}%`);
    }

    if (params.syncType) {
      whereCondition.syncType = params.syncType;
    }

    if (params.result) {
      whereCondition.result = params.result;
    }

    if (params.startDate && params.endDate) {
      whereCondition.syncTime = Between(
        new Date(params.startDate),
        new Date(params.endDate),
      );
    }

    const [logs, total] = await this.syncLogRepository.findAndCount({
      where: whereCondition,
      order: { syncTime: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      logs,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  /**
   * 处理临时订单（在同步完成后调用）
   */
  async handleTemporaryOrdersOnSync(syncedOrderNos: string[]): Promise<void> {
    if (!syncedOrderNos || syncedOrderNos.length === 0) {
      return;
    }

    this.logger.log(`开始处理 ${syncedOrderNos.length} 个订单的临时记录`);

    for (const orderNo of syncedOrderNos) {
      await this.processTemporaryOrder(orderNo);
    }
  }

  /**
   * 处理单个临时订单
   */
  private async processTemporaryOrder(orderNo: string): Promise<void> {
    try {
      // 查找该订单号的临时记录
      const tempOrders = await this.temporaryOrderRepository.find({
        where: {
          orderNo: orderNo,
          status: 'pending' as any
        }
      });

      if (tempOrders.length === 0) {
        return; // 没有临时记录，跳过
      }

      // 查找实际订单
      const actualOrder = await this.orderRepository.findOne({
        where: { orderNo: orderNo }
      });

      if (!actualOrder) {
        this.logger.warn(`订单 ${orderNo} 已同步但未找到实际订单，跳过临时订单处理`);
        return;
      }

      // 处理每个临时记录
      for (const tempOrder of tempOrders) {
        await this.syncOrderToCustomer(tempOrder.customerId, actualOrder);

        // 更新临时订单状态
        await this.temporaryOrderRepository.update(tempOrder.id, {
          status: 'synced' as any,
          orderId: actualOrder.id,
          syncedAt: new Date()
        });

        this.logger.log(`临时订单 ${orderNo} 已同步到客户 ${tempOrder.customerId}`);
      }
    } catch (error) {
      this.logger.error(`处理临时订单 ${orderNo} 失败:`, error);
    }
  }

  /**
   * 同步订单到客户（从临时订单创建正式绑定）
   */
  private async syncOrderToCustomer(customerId: number, order: Order): Promise<void> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: customerId, isDeleted: false }
      });

      if (!customer) {
        this.logger.warn(`客户 ${customerId} 不存在或已删除，跳过订单同步`);
        return;
      }

      // 检查客户是否已有该订单
      const existingOrder = await this.orderRepository.findOne({
        where: {
          orderNo: order.orderNo,
          customerId: customerId
        }
      });

      if (existingOrder) {
        this.logger.log(`客户 ${customerId} 已有订单 ${order.orderNo}，跳过重复绑定`);
        return;
      }

      // 更新订单的客户ID
      await this.orderRepository.update(order.id, {
        customerId: customerId
      });

      // 更新客户的订单列表
      const currentOrderIds = customer.externalOrderIds || [];
      if (!currentOrderIds.includes(order.orderNo)) {
        currentOrderIds.push(order.orderNo);
        await this.customerRepository.update(customerId, {
          externalOrderIds: currentOrderIds,
          updateTime: new Date()
        });
      }

      this.logger.log(`订单 ${order.orderNo} 已同步到客户 ${customerId}`);
    } catch (error) {
      this.logger.error(`同步订单到客户失败:`, error);
      throw error;
    }
  }

  /**
   * 根据课程名称计算差异化提成
   */
  private calculateCommissionByCourse(courseName: string): number {
    // 如果订单没有返回提成数据，默认就写300元
    return 300;
  }
}