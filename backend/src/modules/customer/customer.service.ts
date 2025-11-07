import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFollowRecord } from './entities/customer-follow-record.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BatchUpdateCustomerDto } from './dto/batch-update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowRecordDto } from './dto/create-follow-record.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowRecord)
    private followRecordRepository: Repository<CustomerFollowRecord>,
  ) {}

  // 创建客户
  async create(createCustomerDto: CreateCustomerDto) {
    // 检查微信号是否已存在
    const existingCustomer = await this.customerRepository.findOne({
      where: { wechatId: createCustomerDto.wechatId },
    });

    if (existingCustomer) {
      throw new ConflictException('该微信号已存在');
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  // 分页查询客户列表
  async findAll(queryDto: QueryCustomerDto, dataScope: any = {}) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      customerIntent,
      trafficSource,
      salesId,
    } = queryDto;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoin('users', 'operator', 'customer.operator_id = operator.id')
      .addSelect('sales.real_name', 'salesName')
      .addSelect('operator.real_name', 'operatorName');

    // 数据权限过滤
    if (dataScope.salesId) {
      queryBuilder.andWhere('customer.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope.campusId) {
      // 通过销售的校区ID过滤
      queryBuilder.andWhere('sales.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    // 搜索条件
    if (keyword) {
      queryBuilder.andWhere(
        '(customer.wechat_nickname LIKE :keyword OR customer.wechat_id LIKE :keyword OR customer.phone LIKE :keyword OR customer.real_name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (customerIntent) {
      queryBuilder.andWhere('customer.customer_intent = :customerIntent', {
        customerIntent,
      });
    }

    if (trafficSource) {
      queryBuilder.andWhere('customer.traffic_source = :trafficSource', {
        trafficSource,
      });
    }

    if (salesId) {
      queryBuilder.andWhere('customer.sales_id = :salesId', { salesId });
    }

    // 排序
    queryBuilder.orderBy('customer.create_time', 'DESC');

    // 分页
    const total = await queryBuilder.getCount();
    const list = await queryBuilder
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    // 转换字段名
    const formattedList = list.map((item) => ({
      id: item.customer_id,
      wechatNickname: item.customer_wechat_nickname,
      wechatId: item.customer_wechat_id,
      phone: item.customer_phone,
      realName: item.customer_real_name,
      trafficSource: item.customer_traffic_source,
      operatorId: item.customer_operator_id,
      salesId: item.customer_sales_id,
      salesWechat: item.customer_sales_wechat,
      customerIntent: item.customer_customer_intent,
      nextFollowTime: item.customer_next_follow_time,
      remark: item.customer_remark,
      createTime: item.customer_create_time,
      updateTime: item.customer_update_time,
      salesName: item.salesName,
      operatorName: item.operatorName,
    }));

    return {
      list: formattedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 查询单个客户详情
  async findOne(id: number) {
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoin('users', 'operator', 'customer.operator_id = operator.id')
      .where('customer.id = :id', { id })
      .addSelect('sales.real_name', 'salesName')
      .addSelect('sales.phone', 'salesPhone')
      .addSelect('operator.real_name', 'operatorName')
      .getRawOne();

    if (!result) {
      throw new NotFoundException('客户不存在');
    }

    // 查询跟进记录数量
    const followRecordCount = await this.followRecordRepository.count({
      where: { customerId: id },
    });

    return {
      id: result.customer_id,
      wechatNickname: result.customer_wechat_nickname,
      wechatId: result.customer_wechat_id,
      phone: result.customer_phone,
      realName: result.customer_real_name,
      trafficSource: result.customer_traffic_source,
      operatorId: result.customer_operator_id,
      salesId: result.customer_sales_id,
      salesWechat: result.customer_sales_wechat,
      customerIntent: result.customer_customer_intent,
      nextFollowTime: result.customer_next_follow_time,
      remark: result.customer_remark,
      createTime: result.customer_create_time,
      updateTime: result.customer_update_time,
      salesName: result.salesName,
      salesPhone: result.salesPhone,
      operatorName: result.operatorName,
      followRecordCount,
    };
  }

  // 更新客户
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 如果修改了微信号，检查是否与其他客户重复
    if (
      updateCustomerDto.wechatId &&
      updateCustomerDto.wechatId !== customer.wechatId
    ) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { wechatId: updateCustomerDto.wechatId },
      });

      if (existingCustomer) {
        throw new ConflictException('该微信号已被其他客户使用');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  // 批量更新客户
  async batchUpdate(batchUpdateDto: BatchUpdateCustomerDto) {
    const { ids, salesId, customerIntent, operatorId } = batchUpdateDto;

    if (ids.length === 0) {
      throw new NotFoundException('未选择任何客户');
    }

    // 构建更新对象
    const updateData: any = {};
    if (salesId !== undefined) {
      updateData.salesId = salesId;
    }
    if (customerIntent !== undefined) {
      updateData.customerIntent = customerIntent;
    }
    if (operatorId !== undefined) {
      updateData.operatorId = operatorId;
    }

    if (Object.keys(updateData).length === 0) {
      throw new NotFoundException('未指定任何更新字段');
    }

    // 批量更新
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set(updateData)
      .whereInIds(ids)
      .execute();

    return {
      success: true,
      message: `成功更新 ${ids.length} 个客户`,
      count: ids.length,
    };
  }

  // 删除客户
  async remove(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    await this.customerRepository.remove(customer);
    return { message: '删除成功' };
  }

  // 创建跟进记录
  async createFollowRecord(
    createFollowRecordDto: CreateFollowRecordDto,
    operatorId: number,
  ) {
    const { customerId, followContent, nextFollowTime } =
      createFollowRecordDto;

    // 检查客户是否存在
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 创建跟进记录
    const followRecord = this.followRecordRepository.create({
      customerId,
      followContent,
      followTime: new Date(),
      operatorId,
      nextFollowTime,
    });

    await this.followRecordRepository.save(followRecord);

    // 更新客户的下次回访时间
    if (nextFollowTime) {
      customer.nextFollowTime = nextFollowTime;
      await this.customerRepository.save(customer);
    }

    return followRecord;
  }

  // 获取客户跟进记录
  async getFollowRecords(customerId: number) {
    const records = await this.followRecordRepository
      .createQueryBuilder('record')
      .leftJoin('users', 'operator', 'record.operator_id = operator.id')
      .where('record.customer_id = :customerId', { customerId })
      .addSelect('operator.real_name', 'operatorName')
      .orderBy('record.follow_time', 'DESC')
      .getRawMany();

    return records.map((item) => ({
      id: item.record_id,
      customerId: item.record_customer_id,
      followContent: item.record_follow_content,
      followTime: item.record_follow_time,
      operatorId: item.record_operator_id,
      nextFollowTime: item.record_next_follow_time,
      createTime: item.record_create_time,
      operatorName: item.operatorName,
    }));
  }

  // 快速搜索客户（用于订单登记时选择客户）
  async searchCustomers(keyword: string) {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'customer.sales_id = sales.id')
      .where(
        'customer.wechat_id LIKE :keyword OR customer.wechat_nickname LIKE :keyword OR customer.phone LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .select('customer.id', 'id')
      .addSelect('customer.wechat_nickname', 'wechatNickname')
      .addSelect('customer.wechat_id', 'wechatId')
      .addSelect('customer.phone', 'phone')
      .addSelect('customer.real_name', 'realName')
      .addSelect('sales.real_name', 'salesName')
      .limit(10)
      .getRawMany();

    return customers;
  }

  // 获取待回访客户列表
  async getPendingFollowUps(dataScope: any = {}) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今天结束时间

    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('users', 'sales', 'sales.id = customer.sales_id')
      .leftJoin('users', 'operator', 'operator.id = customer.operator_id')
      .leftJoinAndSelect(
        'customer_follow_records',
        'lastFollow',
        'lastFollow.id = (SELECT id FROM customer_follow_records WHERE customer_id = customer.id ORDER BY follow_time DESC LIMIT 1)',
      )
      .where('customer.next_follow_time IS NOT NULL')
      .andWhere('customer.next_follow_time <= :today', { today })
      .select([
        'customer.id',
        'customer.wechat_nickname',
        'customer.wechat_id',
        'customer.phone',
        'customer.real_name',
        'customer.customer_intent',
        'customer.lifecycle_stage',
        'customer.next_follow_time',
        'customer.sales_id',
      ])
      .addSelect('sales.real_name', 'salesName')
      .addSelect('operator.real_name', 'operatorName')
      .addSelect('lastFollow.follow_time', 'lastFollowTime')
      .orderBy('customer.next_follow_time', 'ASC');

    // 应用数据权限
    if (dataScope?.salesId) {
      qb.andWhere('customer.sales_id = :salesId', {
        salesId: dataScope.salesId,
      });
    }
    if (dataScope?.campusId) {
      qb.andWhere('customer.campus_id = :campusId', {
        campusId: dataScope.campusId,
      });
    }

    const results = await qb.getRawMany();

    this.logger.debug(`[getPendingFollowUps] 查询结果数量: ${results.length}`);
    if (results.length > 0) {
      this.logger.debug(`[getPendingFollowUps] 原始字段列表: ${Object.keys(results[0]).join(', ')}`);
      this.logger.debug(`[getPendingFollowUps] 第一条原始数据: ${JSON.stringify(results[0])}`);
    }

    const mapped = results.map((item) => ({
      id: item.customer_id,
      wechatNickname: item.wechat_nickname,
      wechatId: item.wechat_id,
      phone: item.customer_phone,  // phone字段带customer前缀
      realName: item.real_name,
      customerIntent: item.customer_intent,
      lifecycleStage: item.lifecycle_stage,
      nextFollowTime: item.next_follow_time,
      lastFollowTime: item.lastFollowTime,
      salesId: item.sales_id,
      salesName: item.salesName,
      operatorName: item.operatorName,
    }));

    if (mapped.length > 0) {
      console.log('[getPendingFollowUps] 映射后第一条:', mapped[0]);
    }

    return mapped;
  }

  // 获取跟进统计
  async getFollowStatistics(dataScope: any = {}) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 基础查询条件
    const baseWhere: any = {};
    if (dataScope?.salesId) {
      baseWhere.salesId = dataScope.salesId;
    }
    if (dataScope?.campusId) {
      baseWhere.campusId = dataScope.campusId;
    }

    // 今日跟进数（从跟进记录表统计）
    const todayFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          today,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 本周跟进数
    const weekFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          weekStart,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 本月跟进数
    const monthFollowCount = await this.followRecordRepository.count({
      where: {
        followTime: Between(
          monthStart,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
        ...(dataScope?.salesId && { operatorId: dataScope.salesId }),
      },
    });

    // 待跟进客户数（今天需要跟进）
    const pendingCount = await this.customerRepository.count({
      where: {
        ...baseWhere,
        nextFollowTime: Between(
          today,
          new Date(today.getTime() + 24 * 60 * 60 * 1000),
        ),
      },
    });

    // 逾期未跟进数（应该在今天之前跟进但还没跟进的）
    const overdueCount = await this.customerRepository.count({
      where: {
        ...baseWhere,
        nextFollowTime: Between(
          new Date('2020-01-01'),
          today,
        ),
      },
    });

    // 总客户数
    const totalCustomers = await this.customerRepository.count({
      where: baseWhere,
    });

    return {
      todayFollow: todayFollowCount,
      weekFollow: weekFollowCount,
      monthFollow: monthFollowCount,
      pendingFollow: pendingCount,
      overdueFollow: overdueCount,
      totalCustomers,
    };
  }
}
