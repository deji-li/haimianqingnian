import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query.dto';
import { CommissionService } from '../commission/commission.service';
import { OperationCommissionRecord } from '../operation/entities/operation-commission-record.entity';
import { DictionaryService } from '../system/dictionary.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OperationCommissionRecord)
    private operationCommissionRepository: Repository<OperationCommissionRecord>,
    private commissionService: CommissionService,
    private dictionaryService: DictionaryService,
  ) {}

  /**
   * 创建订单（智能客户关联）
   */
  async create(createOrderDto: CreateOrderDto) {
    // 1. 尝试匹配现有客户
    let customerId = createOrderDto.customerId;

    if (!customerId && (createOrderDto.wechatId || createOrderDto.phone)) {
      const existingCustomer = await this.customerRepository.findOne({
        where: [
          createOrderDto.wechatId
            ? { wechatId: createOrderDto.wechatId }
            : undefined,
          createOrderDto.phone ? { phone: createOrderDto.phone } : undefined,
        ].filter(Boolean),
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    // 2. 检测是否为新学员（3个月规则）
    let isNewStudent = 1;
    if (customerId) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentOrder = await this.orderRepository.findOne({
        where: {
          customerId,
        },
        order: {
          paymentTime: 'DESC',
        },
      });

      if (recentOrder && recentOrder.paymentTime > threeMonthsAgo) {
        isNewStudent = 0;
      }
    }

    // 3. 创建订单
    const order = this.orderRepository.create({
      ...createOrderDto,
      customerId,
      isNewStudent,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 4. 自动计算销售提成
    if (savedOrder.salesId && savedOrder.paymentAmount > 0) {
      try {
        const sales = await this.userRepository.findOne({
          where: { id: savedOrder.salesId },
        });

        if (sales) {
          await this.commissionService.calculateCommission(savedOrder.id);
        }
      } catch (error) {
        // 提成计算失败不影响订单创建
        this.logger.error('Failed to calculate commission:', error);
      }
    }

    // 5. 自动创建运营提成记录
    // 必须同时满足3个条件：新学员订单 + 有运营人员 + 有订单标签且配置了提成
    if (customerId && savedOrder.paymentAmount > 0 && savedOrder.isNewStudent === 1) {
      try {
        const customer = await this.customerRepository.findOne({
          where: { id: customerId },
        });

        // 检查客户是否有引流运营人员 且 订单有标签
        if (customer?.operatorId && savedOrder.orderTag) {
          // 从字典配置获取该订单标签的提成金额
          const commissionAmount = await this.dictionaryService.getOperationCommissionAmount(
            savedOrder.orderTag,
          );

          // 只有配置了提成金额才创建记录
          if (commissionAmount > 0) {
            const existingCommission = await this.operationCommissionRepository.findOne({
              where: { orderId: savedOrder.id },
            });

            // 避免重复创建
            if (!existingCommission) {
              const operationCommission = this.operationCommissionRepository.create({
                operatorId: customer.operatorId,
                customerId: customer.id,
                orderId: savedOrder.id,
                orderTag: savedOrder.orderTag, // 记录订单标签
                orderAmount: savedOrder.paymentAmount,
                commissionAmount: commissionAmount, // 从配置读取
                status: '待发放',
              });

              await this.operationCommissionRepository.save(operationCommission);
            }
          }
        }
      } catch (error) {
        // 运营提成创建失败不影响订单创建
        this.logger.error('Failed to create operation commission:', error);
      }
    }

    return savedOrder;
  }

  /**
   * 分页查询订单列表
   */
  async findAll(queryDto: QueryOrderDto, dataScope?: any) {
    const { page, pageSize, keyword, startDate, endDate, ...filters } =
      queryDto;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('customers', 'customer', 'customer.id = order.customer_id')
      .leftJoin('users', 'sales', 'sales.id = order.sales_id')
      .leftJoin('campus', 'campus', 'campus.id = order.campus_id')
      .addSelect('customer.real_name', 'customerRealName')
      .addSelect('customer.wechat_nickname', 'customerWechatNickname')
      .addSelect('customer.phone', 'customerPhone')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('campus.campus_name', 'campusName');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 关键词搜索
    if (keyword) {
      qb.andWhere(
        '(order.order_no LIKE :keyword OR order.wechat_id LIKE :keyword OR order.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    // 其他过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const columnName = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        qb.andWhere(`order.${columnName} = :${key}`, { [key]: value });
      }
    });

    // 分页
    const total = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);

    // 排序
    qb.orderBy('order.payment_time', 'DESC');

    const rawResults = await qb.getRawMany();

    // 格式化结果 - 从raw results中提取数据
    const list = rawResults.map((raw) => ({
      id: raw.order_id,
      orderNo: raw.order_order_no,
      customerId: raw.order_customer_id,
      wechatId: raw.order_wechat_id,
      wechatNickname: raw.order_wechat_nickname,
      phone: raw.order_phone || raw.customerPhone, // 优先使用订单phone，没有则使用客户phone
      salesId: raw.order_sales_id,
      campusId: raw.order_campus_id,
      courseName: raw.order_course_name,
      paymentAmount: raw.order_payment_amount,
      paymentTime: raw.order_payment_time,
      isNewStudent: raw.order_is_new_student,
      orderStatus: raw.order_order_status,
      teacherName: raw.order_teacher_name,
      region: raw.order_region,
      distributorSales: raw.order_distributor_sales,
      remark: raw.order_remark,
      dataSource: raw.order_data_source,
      createTime: raw.order_create_time,
      updateTime: raw.order_update_time,
      salesName: raw.salesName,
      campusName: raw.campusName,
      customer: raw.order_customer_id ? {
        id: raw.order_customer_id,
        realName: raw.customerRealName,
        wechatNickname: raw.customerWechatNickname,
        phone: raw.customerPhone,
      } : null,
      customerName: raw.customerRealName || raw.order_wechat_nickname,
    }));

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取订单详情
   */
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 获取销售和校区信息
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('users', 'sales', 'sales.id = order.sales_id')
      .leftJoin('campus', 'campus', 'campus.id = order.campus_id')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('campus.campus_name', 'campusName')
      .where('order.id = :id', { id });

    const result = await qb.getRawOne();

    return {
      ...order,
      salesName: result?.salesName,
      campusName: result?.campusName,
      customerName: order.customer?.realName || order.wechatNickname,
    };
  }

  /**
   * 更新订单
   */
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  /**
   * 删除订单
   */
  async remove(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    await this.orderRepository.remove(order);
    return { message: '删除成功' };
  }

  /**
   * 批量导入订单（Excel）- 支持覆盖更新
   */
  async importOrders(orders: CreateOrderDto[]) {
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const orderDto of orders) {
      try {
        // 检查订单号是否已存在
        const existingOrder = await this.orderRepository.findOne({
          where: { orderNo: orderDto.orderNo },
        });

        if (existingOrder) {
          // 存在则更新
          // 1. 尝试匹配客户
          let customerId = orderDto.customerId || existingOrder.customerId;
          if (
            !customerId &&
            (orderDto.wechatId || orderDto.phone)
          ) {
            const existingCustomer = await this.customerRepository.findOne({
              where: [
                orderDto.wechatId
                  ? { wechatId: orderDto.wechatId }
                  : undefined,
                orderDto.phone
                  ? { phone: orderDto.phone }
                  : undefined,
              ].filter(Boolean),
            });

            if (existingCustomer) {
              customerId = existingCustomer.id;
            }
          }

          // 2. 更新订单
          await this.orderRepository.update(existingOrder.id, {
            ...orderDto,
            customerId,
            dataSource: '小程序导入',
            updateTime: new Date(),
          });

          results.updated++;
        } else {
          // 不存在则新增
          await this.create({ ...orderDto, dataSource: '小程序导入' });
          results.inserted++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `订单号 ${orderDto.orderNo}: ${error.message}`,
        );
      }
    }

    return results;
  }

  /**
   * 获取客户的订单历史
   */
  async getCustomerOrders(customerId: number) {
    return await this.orderRepository.find({
      where: { customerId },
      order: { paymentTime: 'DESC' },
    });
  }

  /**
   * 获取订单统计数据（用于看板）
   */
  async getStatistics(startDate?: string, endDate?: string, dataScope?: any) {
    const qb = this.orderRepository.createQueryBuilder('order');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('order.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('order.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 日期范围
    if (startDate && endDate) {
      qb.andWhere('order.payment_time BETWEEN :startDate AND :endDate', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      });
    }

    // 总订单数
    const totalOrders = await qb.getCount();

    // 总金额
    const totalAmount = await qb
      .select('SUM(order.payment_amount)', 'total')
      .getRawOne();

    // 新学员订单数
    const newStudentOrders = await qb
      .andWhere('order.is_new_student = 1')
      .getCount();

    // 按状态统计
    const statusStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.order_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.order_status')
      .getRawMany();

    return {
      totalOrders,
      totalAmount: parseFloat(totalAmount?.total || 0),
      newStudentOrders,
      oldStudentOrders: totalOrders - newStudentOrders,
      statusStats,
    };
  }
}
