import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  CommissionScheme,
  FixedRule,
  PercentageRule,
  TieredRule,
} from './entities/commission-scheme.entity';
import { CommissionCalculation } from './entities/commission-calculation.entity';
import { Order } from '../order/entities/order.entity';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(CommissionScheme)
    private schemeRepository: Repository<CommissionScheme>,
    @InjectRepository(CommissionCalculation)
    private calculationRepository: Repository<CommissionCalculation>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createScheme(createDto: CreateSchemeDto, userId: number): Promise<CommissionScheme> {
    const scheme = this.schemeRepository.create({
      ...createDto,
      createdBy: userId,
    });
    return await this.schemeRepository.save(scheme);
  }

  async findAllSchemes(includeDisabled = false): Promise<CommissionScheme[]> {
    const query = this.schemeRepository
      .createQueryBuilder('scheme')
      .orderBy('scheme.priority', 'DESC')
      .addOrderBy('scheme.id', 'ASC');

    if (!includeDisabled) {
      query.where('scheme.status = 1');
    }

    return await query.getMany();
  }

  async findSchemeById(id: number): Promise<CommissionScheme> {
    const scheme = await this.schemeRepository.findOne({ where: { id } });
    if (!scheme) {
      throw new NotFoundException(`提成方案 #${id} 不存在`);
    }
    return scheme;
  }

  async updateScheme(id: number, updateDto: UpdateSchemeDto): Promise<CommissionScheme> {
    const scheme = await this.findSchemeById(id);
    Object.assign(scheme, updateDto);
    return await this.schemeRepository.save(scheme);
  }

  async deleteScheme(id: number): Promise<void> {
    const scheme = await this.findSchemeById(id);
    await this.schemeRepository.remove(scheme);
  }

  async calculateCommission(orderId: number): Promise<{ commissionAmount: number; scheme: CommissionScheme | null }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`订单 #${orderId} 不存在`);
    }

    const schemes = await this.findAllSchemes();
    const matchedScheme = this.findMatchingScheme(order, schemes);

    if (!matchedScheme) {
      return { commissionAmount: 0, scheme: null };
    }

    const commissionAmount = this.computeCommission(order.paymentAmount, matchedScheme);

    await this.orderRepository.update(orderId, {
      commissionSchemeId: matchedScheme.id,
      commissionAmount,
      commissionCalculatedAt: new Date(),
    });

    await this.calculationRepository.save({
      orderId: order.id,
      schemeId: matchedScheme.id,
      schemeName: matchedScheme.name,
      orderAmount: order.paymentAmount,
      commissionAmount,
      calculationRule: matchedScheme.rules,
      salesId: order.salesId,
    });

    return { commissionAmount, scheme: matchedScheme };
  }

  async previewCommission(orderAmount: number, orderTag?: string, courseName?: string): Promise<{ commissionAmount: number; schemeName: string | null }> {
    const schemes = await this.findAllSchemes();
    const tempOrder: Partial<Order> = {
      paymentAmount: orderAmount,
      orderTag,
      courseName,
    };

    const matchedScheme = this.findMatchingScheme(tempOrder as Order, schemes);

    if (!matchedScheme) {
      return { commissionAmount: 0, schemeName: null };
    }

    const commissionAmount = this.computeCommission(orderAmount, matchedScheme);

    return { commissionAmount, schemeName: matchedScheme.name };
  }

  private findMatchingScheme(order: Order, schemes: CommissionScheme[]): CommissionScheme | null {
    for (const scheme of schemes) {
      if (this.isSchemeMatch(order, scheme)) {
        return scheme;
      }
    }
    return null;
  }

  private isSchemeMatch(order: Order, scheme: CommissionScheme): boolean {
    const conditions = scheme.conditions;
    if (!conditions) return true;

    if (conditions.orderTags && conditions.orderTags.length > 0 && order.orderTag) {
      if (!conditions.orderTags.includes(order.orderTag)) return false;
    }

    if (conditions.courses && conditions.courses.length > 0 && order.courseName) {
      if (!conditions.courses.includes(order.courseName)) return false;
    }

    if (conditions.minOrderAmount !== undefined && order.paymentAmount < conditions.minOrderAmount) {
      return false;
    }

    if (conditions.maxOrderAmount !== undefined && order.paymentAmount > conditions.maxOrderAmount) {
      return false;
    }

    return true;
  }

  private computeCommission(orderAmount: number, scheme: CommissionScheme): number {
    const { type, rules } = scheme;

    switch (type) {
      case 'fixed':
        return this.computeFixed(rules as FixedRule);
      case 'percentage':
        return this.computePercentage(orderAmount, rules as PercentageRule);
      case 'tiered':
        return this.computeTiered(orderAmount, rules as TieredRule);
      default:
        return 0;
    }
  }

  private computeFixed(rules: FixedRule): number {
    return rules.amount || 0;
  }

  private computePercentage(orderAmount: number, rules: PercentageRule): number {
    const percentage = rules.percentage || 0;
    return (orderAmount * percentage) / 100;
  }

  private computeTiered(orderAmount: number, rules: TieredRule): number {
    const tiers = rules.tiers || [];
    for (const tier of tiers) {
      const matchesMin = orderAmount >= tier.minAmount;
      const matchesMax = tier.maxAmount === null || orderAmount <= tier.maxAmount;
      if (matchesMin && matchesMax) {
        return (orderAmount * tier.percentage) / 100;
      }
    }
    return 0;
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    salesId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ list: any[]; total: number }> {
    const { page = 1, pageSize = 20, status, salesId, startDate, endDate } = params;

    const query = this.calculationRepository
      .createQueryBuilder('calc')
      .leftJoinAndSelect('calc.order', 'order')
      .leftJoinAndSelect('calc.sales', 'sales')
      .select([
        'calc.id',
        'calc.orderId',
        'calc.schemeId',
        'calc.schemeName',
        'calc.orderAmount',
        'calc.commissionAmount',
        'calc.status',
        'calc.settleTime',
        'calc.remark',
        'calc.createTime',
        'calc.updateTime',
        'order.orderNo',
        'sales.id',
        'sales.name',
      ]);

    if (status) {
      query.andWhere('calc.status = :status', { status });
    }

    if (salesId) {
      query.andWhere('calc.salesId = :salesId', { salesId });
    }

    if (startDate) {
      query.andWhere('calc.createTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('calc.createTime <= :endDate', { endDate });
    }

    query.orderBy('calc.createTime', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    const formattedList = list.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      orderNo: item.order?.orderNo || '',
      salesId: item.salesId,
      salesName: item.sales?.realName || '',
      schemeId: item.schemeId,
      schemeName: item.schemeName,
      orderAmount: item.orderAmount,
      commissionAmount: item.commissionAmount,
      status: item.status,
      settleTime: item.settleTime,
      remark: item.remark,
      createTime: item.createTime,
      updateTime: item.updateTime,
    }));

    return { list: formattedList, total };
  }

  async updateCommission(
    id: number,
    data: { status?: string; settleTime?: Date; remark?: string },
  ): Promise<CommissionCalculation> {
    const commission = await this.calculationRepository.findOne({ where: { id } });
    if (!commission) {
      throw new NotFoundException(`提成记录 #${id} 不存在`);
    }

    Object.assign(commission, data);
    return await this.calculationRepository.save(commission);
  }

  async batchSettle(ids: number[]): Promise<void> {
    await this.calculationRepository.update(
      { id: In(ids) },
      {
        status: 'paid',
        settleTime: new Date(),
      },
    );
  }

  async getStatistics(params?: {
    salesId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const query = this.calculationRepository.createQueryBuilder('calc');

    if (params?.salesId) {
      query.andWhere('calc.salesId = :salesId', { salesId: params.salesId });
    }

    if (params?.startDate) {
      query.andWhere('calc.createTime >= :startDate', { startDate: params.startDate });
    }

    if (params?.endDate) {
      query.andWhere('calc.createTime <= :endDate', { endDate: params.endDate });
    }

    const all = await query.getMany();

    const pending = all.filter((c) => c.status === 'pending');
    const paid = all.filter((c) => c.status === 'paid');
    const cancelled = all.filter((c) => c.status === 'cancelled');

    return {
      pending: {
        amount: pending.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
        count: pending.length,
      },
      paid: {
        amount: paid.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
        count: paid.length,
      },
      cancelled: {
        amount: cancelled.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
        count: cancelled.length,
      },
      total: {
        amount: all.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
        count: all.length,
      },
    };
  }

  async getSummaryByUser(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    const query = this.calculationRepository
      .createQueryBuilder('calc')
      .leftJoin('calc.sales', 'sales')
      .leftJoin('calc.order', 'order')
      .select([
        'calc.salesId as userId',
        'sales.realName as userName',
        'COUNT(calc.id) as orderCount',
        'SUM(calc.orderAmount) as totalAmount',
        'SUM(calc.commissionAmount) as commissionAmount',
        'AVG(calc.commissionAmount) as averageCommission',
      ])
      .groupBy('calc.salesId');

    if (params?.startDate) {
      query.andWhere('calc.createTime >= :startDate', { startDate: params.startDate });
    }

    if (params?.endDate) {
      query.andWhere('calc.createTime <= :endDate', { endDate: params.endDate });
    }

    return await query.getRawMany();
  }

  async getSummaryByMonth(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    const query = this.calculationRepository
      .createQueryBuilder('calc')
      .select([
        "DATE_FORMAT(calc.createTime, '%Y-%m') as month",
        'COUNT(calc.id) as orderCount',
        'SUM(calc.orderAmount) as totalAmount',
        'SUM(calc.commissionAmount) as commissionAmount',
      ])
      .groupBy('month')
      .orderBy('month', 'DESC');

    if (params?.startDate) {
      query.andWhere('calc.createTime >= :startDate', { startDate: params.startDate });
    }

    if (params?.endDate) {
      query.andWhere('calc.createTime <= :endDate', { endDate: params.endDate });
    }

    return await query.getRawMany();
  }
}
