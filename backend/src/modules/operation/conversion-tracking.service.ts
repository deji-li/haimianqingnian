import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationCustomerConversion } from './entities/operation-customer-conversion.entity';
import { OperationNotification } from './entities/operation-notification.entity';

@Injectable()
export class ConversionTrackingService {
  constructor(
    @InjectRepository(OperationCustomerConversion)
    private readonly conversionRepository: Repository<OperationCustomerConversion>,
    @InjectRepository(OperationNotification)
    private readonly notificationRepository: Repository<OperationNotification>,
  ) {}

  /**
   * 创建客户转化记录
   * 当客户被标记为有运营人员引流时调用
   */
  async createConversionRecord(data: {
    customerId: number;
    operatorId: number;
    trafficPlatform?: string;
    trafficCity?: string;
  }) {
    // 检查是否已存在记录
    const existing = await this.conversionRepository.findOne({
      where: {
        customerId: data.customerId,
        operatorId: data.operatorId
      }
    });

    if (existing) {
      return existing;
    }

    // 创建新的转化记录
    const conversion = this.conversionRepository.create({
      customerId: data.customerId,
      operatorId: data.operatorId,
      trafficPlatform: data.trafficPlatform,
      trafficCity: data.trafficCity,
      conversionStage: '引流',
      conversionTime: new Date()
    });

    return await this.conversionRepository.save(conversion);
  }

  /**
   * 更新转化阶段
   */
  async updateConversionStage(customerId: number, stage: string) {
    const conversion = await this.conversionRepository.findOne({
      where: { customerId }
    });

    if (!conversion) {
      return null;
    }

    conversion.conversionStage = stage;
    conversion.conversionTime = new Date();
    return await this.conversionRepository.save(conversion);
  }

  /**
   * 客户下单时创建转化通知
   */
  async createConversionNotification(data: {
    operatorId: number;
    customerId: number;
    orderId: number;
    customerName: string;
    orderAmount: number;
  }) {
    const title = '客户转化成功';
    const content = `您引流的客户 ${data.customerName} 已成功下单，订单金额：¥${data.orderAmount}`;

    const notification = this.notificationRepository.create({
      operatorId: data.operatorId,
      customerId: data.customerId,
      orderId: data.orderId,
      type: 'conversion',
      title,
      content
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * 创建提醒通知
   */
  async createReminderNotification(data: {
    operatorId: number;
    title: string;
    content: string;
    customerId?: number;
  }) {
    const notification = this.notificationRepository.create({
      operatorId: data.operatorId,
      customerId: data.customerId,
      type: 'reminder',
      title: data.title,
      content: data.content
    });

    return await this.notificationRepository.save(notification);
  }
}