import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessConfig } from './entities/business-config.entity';

@Injectable()
export class BusinessConfigService {
  private readonly logger = new Logger(BusinessConfigService.name);

  // 缓存配置，避免频繁查询数据库
  private configCache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 缓存1分钟

  constructor(
    @InjectRepository(BusinessConfig)
    private readonly businessConfigRepository: Repository<BusinessConfig>,
  ) {}

  /**
   * 获取配置（带缓存）
   */
  async getConfig(configKey: string): Promise<any> {
    // 检查缓存
    const cached = this.configCache.get(configKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    // 从数据库查询
    const config = await this.businessConfigRepository.findOne({
      where: { configKey },
    });

    if (!config) {
      this.logger.warn(`配置项不存在: ${configKey}`);
      return null;
    }

    // 更新缓存
    this.configCache.set(configKey, {
      value: config.configValue,
      timestamp: Date.now(),
    });

    return config.configValue;
  }

  /**
   * 更新配置
   */
  async updateConfig(configKey: string, configValue: any): Promise<BusinessConfig> {
    const config = await this.businessConfigRepository.findOne({
      where: { configKey },
    });

    if (!config) {
      throw new NotFoundException(`配置项不存在: ${configKey}`);
    }

    config.configValue = configValue;
    const updated = await this.businessConfigRepository.save(config);

    // 清除缓存
    this.configCache.delete(configKey);

    this.logger.log(`配置已更新: ${configKey}`);
    return updated;
  }

  /**
   * 获取所有配置
   */
  async findAll(category?: string): Promise<BusinessConfig[]> {
    if (category) {
      return await this.businessConfigRepository.find({
        where: { configCategory: category },
      });
    }
    return await this.businessConfigRepository.find();
  }

  /**
   * 创建配置
   */
  async create(configData: Partial<BusinessConfig>): Promise<BusinessConfig> {
    const config = this.businessConfigRepository.create(configData);
    return await this.businessConfigRepository.save(config);
  }
}
