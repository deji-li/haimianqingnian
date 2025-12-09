import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CommissionService } from '../commission/commission.service';
import { OperationCommissionRecord } from '../operation/entities/operation-commission-record.entity';
import { DictionaryService } from '../system/dictionary.service';
import { ConversionTrackingService } from '../operation/conversion-tracking.service';

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
    private dataSource: DataSource,
    private conversionTrackingService: ConversionTrackingService,
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

              // 创建转化通知给运营人员
              try {
                await this.conversionTrackingService.createConversionNotification({
                  operatorId: customer.operatorId,
                  customerId: customer.id,
                  orderId: savedOrder.id,
                  customerName: customer.realName || customer.wechatNickname || '未知客户',
                  orderAmount: savedOrder.paymentAmount
                });

                // 更新客户转化阶段为"成交转化"
                await this.conversionTrackingService.updateConversionStage(
                  customer.id,
                  '成交转化'
                );
              } catch (notifyError) {
                this.logger.error('Failed to create conversion notification:', notifyError);
              }
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
    console.log('后端接收到的查询参数:', JSON.stringify(queryDto, null, 2));
    const { page = 1, pageSize = 20, keyword, startDate, endDate, ...filters } =
      queryDto;

    console.log('解析后的参数 - page:', page, 'pageSize:', pageSize);

    // 构建基础SQL查询
    let sql = `
      SELECT
        o.id,
        o.order_no,
        o.customer_id,
        o.wechat_id,
        o.wechat_nickname,
        o.phone,
        o.sales_id,
        o.campus_id,
        o.course_name,
        o.payment_amount,
        o.payment_time,
        o.is_new_student,
        o.order_status,
        o.teacher_name,
        o.region,
        o.distributor_sales,
        o.remark,
        o.data_source,
        o.create_time,
        o.update_time,
        u.real_name as salesName,
        c.campus_name as campusName,
        cust.real_name as customerName
      FROM orders o
      LEFT JOIN users u ON o.sales_id = u.id
      LEFT JOIN campus c ON o.campus_id = c.id
      LEFT JOIN customers cust ON o.customer_id = cust.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // 动态构建WHERE条件
    if (dataScope?.salesId) {
      sql += ` AND o.sales_id = ?`;
      params.push(dataScope.salesId);
    }

    if (dataScope?.campusId) {
      sql += ` AND o.campus_id = ?`;
      params.push(dataScope.campusId);
    }

    // 关键词搜索
    if (keyword) {
      sql += ` AND (o.order_no LIKE ? OR o.wechat_id LIKE ? OR o.phone LIKE ? OR o.wechat_nickname LIKE ?)`;
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern, keywordPattern);
    }

    // 日期范围
    if (startDate && endDate) {
      sql += ` AND o.payment_time BETWEEN ? AND ?`;
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    // 其他过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        sql += ` AND o.${key} = ?`;
        params.push(value);
      }
    });

    // 获取总数
    const countSql = sql.replace(/SELECT.*?FROM.*?LEFT JOIN.*?LEFT JOIN.*?LEFT JOIN.*?WHERE/, 'SELECT COUNT(*) FROM orders o WHERE').replace(/ORDER BY.*$/, '');
    const totalResult = await this.dataSource.query(countSql, params);
    const total = parseInt(totalResult[0].count);

    // 添加排序和分页
    sql += ` ORDER BY o.payment_time DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, (page - 1) * pageSize);

    try {
      // 直接执行SQL查询
      const results = await this.dataSource.query(sql, params);

      console.log('实际查询到的数据条数:', results.length);
      console.log('查询总数:', total);

      // 格式化结果
      const list = results.map((order: any) => ({
        id: order.id,
        orderNo: order.order_no,
        customerId: order.customer_id,
        wechatId: order.wechat_id,
        wechatNickname: order.wechat_nickname,
        phone: order.phone,
        salesId: order.sales_id,
        campusId: order.campus_id,
        courseName: order.course_name,
        paymentAmount: parseFloat(order.payment_amount || 0),
        paymentTime: order.payment_time,
        isNewStudent: order.is_new_student,
        orderStatus: order.order_status,
        teacherName: order.teacher_name,
        region: order.region,
        distributorSales: order.distributor_sales,
        remark: order.remark,
        dataSource: order.data_source,
        createTime: order.create_time,
        updateTime: order.update_time,
        salesName: order.salesName || '',
        campusName: order.campusName || '',
        customer: null, // 暂时留空，需要时可单独查询
        customerName: order.customerName || '',
      }));

      return {
        list,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询订单时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   */
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'teacher'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 获取销售、校区和老师详细信息
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('users', 'sales', 'sales.id = order.sales_id')
      .leftJoin('campus', 'campus', 'campus.id = order.campus_id')
      .leftJoin('teachers', 'teacher', 'teacher.id = order.teacher_id')
      .leftJoin('campus', 'teacher_campus', 'teacher_campus.id = teacher.campus_id')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('campus.campus_name', 'campusName')
      .addSelect('teacher.name', 'teacherName')
      .addSelect('teacher.subject', 'teacherSubject')
      .addSelect('teacher.default_commission_rate', 'teacherCommissionRate')
      .addSelect('teacher.campus_id', 'teacherCampusId')
      .addSelect('teacher_campus.campus_name', 'teacherCampusName')
      .where('order.id = :id', { id });

    const result = await qb.getRawOne();

    return {
      ...order,
      salesName: result?.salesName,
      campusName: result?.campusName,
      customerName: order.customer?.realName || order.wechatNickname,
      // 老师详细信息
      teacherInfo: order.teacher ? {
        id: order.teacher.id,
        name: order.teacher.name,
        subject: order.teacher.subject || result?.teacherSubject,
        commissionRate: order.teacher.defaultCommissionRate || result?.teacherCommissionRate,
        campusName: result?.teacherCampusName,
        campusId: result?.teacherCampusId
      } : null,
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
    // 构建基础SQL查询
    let sql = `SELECT
      COUNT(*) as totalOrders,
      SUM(payment_amount) as totalAmount,
      SUM(CASE WHEN is_new_student = 1 THEN 1 ELSE 0 END) as newStudentOrders
      FROM orders WHERE 1=1`;

    const params: any[] = [];

    // 应用数据权限
    if (dataScope?.salesId) {
      sql += ` AND sales_id = ?`;
      params.push(dataScope.salesId);
    }
    if (dataScope?.campusId) {
      sql += ` AND campus_id = ?`;
      params.push(dataScope.campusId);
    }

    // 日期范围
    if (startDate && endDate) {
      sql += ` AND payment_time BETWEEN ? AND ?`;
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    const result = await this.dataSource.query(sql, params);
    const data = result[0];

    // 按状态统计
    let statusSql = `SELECT order_status as status, COUNT(*) as count FROM orders WHERE 1=1`;
    const statusParams: any[] = [];

    if (dataScope?.salesId) {
      statusSql += ` AND sales_id = ?`;
      statusParams.push(dataScope.salesId);
    }
    if (dataScope?.campusId) {
      statusSql += ` AND campus_id = ?`;
      statusParams.push(dataScope.campusId);
    }
    if (startDate && endDate) {
      statusSql += ` AND payment_time BETWEEN ? AND ?`;
      statusParams.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    statusSql += ` GROUP BY order_status`;
    const statusStats = await this.dataSource.query(statusSql, statusParams);

    return {
      totalOrders: parseInt(data.totalOrders || 0),
      totalAmount: parseFloat(data.totalAmount || 0),
      newStudentOrders: parseInt(data.newStudentOrders || 0),
      oldStudentOrders: parseInt(data.totalOrders || 0) - parseInt(data.newStudentOrders || 0),
      statusStats,
    };
  }

  /**
   * 获取校区订单排行榜
   */
  async getCampusRanking(period: string, startDate?: string, endDate?: string) {
    // 计算日期范围
    const now = new Date();
    let rangeStart: Date;
    let rangeEnd: Date = now;

    if (startDate && endDate) {
      // 使用自定义日期范围
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
    } else {
      // 根据period计算日期范围
      switch (period) {
        case 'day':
          rangeStart = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          rangeStart = new Date(now);
          rangeStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          rangeStart = new Date(now);
          rangeStart.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          rangeStart = new Date(now);
          rangeStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          rangeStart = new Date(now);
          rangeStart.setMonth(now.getMonth() - 1);
      }
    }

    // 查询校区排行榜
    const sql = `
      SELECT
        campus.id as campusId,
        campus.campus_name as campusName,
        COUNT(o.id) as orderCount,
        SUM(o.payment_amount) as totalAmount,
        SUM(CASE WHEN o.is_new_student = 1 THEN 1 ELSE 0 END) as newStudentCount
      FROM campus
      LEFT JOIN orders o ON campus.id = o.campus_id
        AND o.payment_time BETWEEN ? AND ?
      WHERE campus.id IS NOT NULL
      GROUP BY campus.id, campus.campus_name
      HAVING orderCount > 0
      ORDER BY orderCount DESC
      LIMIT 10
    `;

    const rankings = await this.dataSource.query(sql, [rangeStart, rangeEnd]);

    return rankings.map((item: any, index: number) => ({
      rank: index + 1,
      campusId: item.campusId,
      campusName: item.campusName,
      orderCount: parseInt(item.orderCount),
      totalAmount: parseFloat(item.totalAmount || 0),
      newStudentCount: parseInt(item.newStudentCount),
    }));
  }
}