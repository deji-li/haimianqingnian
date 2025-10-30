import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from './entities/dictionary.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
  ) {}

  async create(createDictionaryDto: CreateDictionaryDto) {
    const existing = await this.dictionaryRepository.findOne({
      where: {
        dictType: createDictionaryDto.dictType,
        dictValue: createDictionaryDto.dictValue,
      },
    });

    if (existing) {
      throw new ConflictException('该字典项已存在');
    }

    const dictionary = this.dictionaryRepository.create(createDictionaryDto);
    return await this.dictionaryRepository.save(dictionary);
  }

  async findAll() {
    return await this.dictionaryRepository.find({
      order: { dictType: 'ASC', sort: 'ASC' },
    });
  }

  async findByType(dictType: string) {
    return await this.dictionaryRepository.find({
      where: { dictType, status: 1 },
      order: { sort: 'ASC' },
    });
  }

  async findOne(id: number) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException('字典项不存在');
    }

    return dictionary;
  }

  async update(id: number, updateDictionaryDto: UpdateDictionaryDto) {
    const dictionary = await this.findOne(id);
    Object.assign(dictionary, updateDictionaryDto);
    return await this.dictionaryRepository.save(dictionary);
  }

  async remove(id: number) {
    const dictionary = await this.findOne(id);
    await this.dictionaryRepository.remove(dictionary);
    return { message: '删除成功' };
  }

  async toggleStatus(id: number) {
    const dictionary = await this.findOne(id);
    dictionary.status = dictionary.status === 1 ? 0 : 1;
    return await this.dictionaryRepository.save(dictionary);
  }

  /**
   * 获取订单标签对应的运营提成金额
   * @param orderTag 订单标签名称
   * @returns 提成金额（元），如果没有配置则返回0
   */
  async getOperationCommissionAmount(orderTag: string): Promise<number> {
    if (!orderTag) {
      return 0;
    }

    const config = await this.dictionaryRepository.findOne({
      where: {
        dictType: 'operation_commission',
        dictName: orderTag,
        status: 1,
      },
    });

    if (!config || !config.dictValue) {
      return 0;
    }

    const amount = parseFloat(config.dictValue);
    return isNaN(amount) ? 0 : amount;
  }

  // 初始化默认字典数据
  async initDefaultData() {
    const defaultData = [
      // 客户意向
      { dictType: 'customer_intent', dictLabel: '高', dictValue: '高', sort: 1 },
      { dictType: 'customer_intent', dictLabel: '中', dictValue: '中', sort: 2 },
      { dictType: 'customer_intent', dictLabel: '低', dictValue: '低', sort: 3 },

      // 流量来源
      { dictType: 'traffic_source', dictLabel: '抖音', dictValue: '抖音', sort: 1 },
      { dictType: 'traffic_source', dictLabel: '微信', dictValue: '微信', sort: 2 },
      { dictType: 'traffic_source', dictLabel: '朋友圈', dictValue: '朋友圈', sort: 3 },
      { dictType: 'traffic_source', dictLabel: '线下', dictValue: '线下', sort: 4 },
      { dictType: 'traffic_source', dictLabel: '其他', dictValue: '其他', sort: 5 },

      // 订单状态
      { dictType: 'order_status', dictLabel: '待付款', dictValue: 'pending', sort: 1 },
      { dictType: 'order_status', dictLabel: '已付款', dictValue: 'paid', sort: 2 },
      { dictType: 'order_status', dictLabel: '已完成', dictValue: 'completed', sort: 3 },
      { dictType: 'order_status', dictLabel: '已退款', dictValue: 'refunded', sort: 4 },
    ];

    for (const item of defaultData) {
      const existing = await this.dictionaryRepository.findOne({
        where: { dictType: item.dictType, dictValue: item.dictValue },
      });

      if (!existing) {
        await this.dictionaryRepository.save(
          this.dictionaryRepository.create(item),
        );
      }
    }

    return { message: '初始化成功' };
  }
}
