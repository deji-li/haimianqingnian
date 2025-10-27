import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFollowRecord } from './entities/customer-follow-record.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowRecordDto } from './dto/create-follow-record.dto';

@Injectable()
export class CustomerService {
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
      .leftJoinAndSelect('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoinAndSelect(
        'users',
        'operator',
        'customer.operator_id = operator.id',
      )
      .select([
        'customer.*',
        'sales.real_name as salesName',
        'operator.real_name as operatorName',
      ]);

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
      .leftJoinAndSelect('users', 'sales', 'customer.sales_id = sales.id')
      .leftJoinAndSelect(
        'users',
        'operator',
        'customer.operator_id = operator.id',
      )
      .where('customer.id = :id', { id })
      .select([
        'customer.*',
        'sales.real_name as salesName',
        'sales.phone as salesPhone',
        'operator.real_name as operatorName',
      ])
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
      .leftJoinAndSelect('users', 'operator', 'record.operator_id = operator.id')
      .where('record.customer_id = :customerId', { customerId })
      .select([
        'record.*',
        'operator.real_name as operatorName',
      ])
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
      .leftJoinAndSelect('users', 'sales', 'customer.sales_id = sales.id')
      .where(
        'customer.wechat_id LIKE :keyword OR customer.wechat_nickname LIKE :keyword OR customer.phone LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .select([
        'customer.id',
        'customer.wechat_nickname as wechatNickname',
        'customer.wechat_id as wechatId',
        'customer.phone',
        'customer.real_name as realName',
        'sales.real_name as salesName',
      ])
      .limit(10)
      .getRawMany();

    return customers;
  }
}
