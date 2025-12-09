import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiApiKey } from './entities/ai-api-key.entity';
import { CreateAiApiKeyDto, UpdateAiApiKeyDto } from './dto/ai-api-key.dto';

@Injectable()
export class AiApiKeyService {
  private readonly logger = new Logger(AiApiKeyService.name);

  constructor(
    @InjectRepository(AiApiKey)
    private readonly aiApiKeyRepository: Repository<AiApiKey>,
  ) {}

  /**
   * 创建API密钥配置
   */
  async create(createDto: CreateAiApiKeyDto): Promise<AiApiKey> {
    try {
      // 检查是否已存在相同供应商的配置
      const existing = await this.aiApiKeyRepository.findOne({
        where: { provider: createDto.provider },
      });

      if (existing) {
        throw new ConflictException(`${createDto.provider} 的API密钥配置已存在，请使用更新功能`);
      }

      const config = this.aiApiKeyRepository.create(createDto);
      const saved = await this.aiApiKeyRepository.save(config);

      this.logger.log(`创建API密钥配置成功: ${createDto.provider}`);
      return saved;
    } catch (error) {
      this.logger.error(`创建API密钥配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询所有API密钥配置
   */
  async findAll(): Promise<AiApiKey[]> {
    try {
      return await this.aiApiKeyRepository.find({
        order: { createTime: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`查询API密钥配置列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据供应商查询API密钥配置
   */
  async findByProvider(provider: string): Promise<AiApiKey | null> {
    try {
      return await this.aiApiKeyRepository.findOne({
        where: { provider, isActive: true },
      });
    } catch (error) {
      this.logger.error(`查询${provider}的API密钥配置失败: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 获取指定供应商的活跃API密钥
   */
  async getActiveKey(provider: string): Promise<AiApiKey | null> {
    try {
      return await this.aiApiKeyRepository.findOne({
        where: { provider, isActive: true },
      });
    } catch (error) {
      this.logger.error(`获取${provider}的活跃API密钥失败: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 获取所有可用的AI模型
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const configs = await this.aiApiKeyRepository.find({
        where: { isActive: true },
        select: ['provider'],
      });

      return configs.map(config => config.provider);
    } catch (error) {
      this.logger.error(`获取可用AI模型失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 根据ID查询API密钥配置
   */
  async findOne(id: number): Promise<AiApiKey> {
    const config = await this.aiApiKeyRepository.findOne({ where: { id } });

    if (!config) {
      throw new NotFoundException(`ID为${id}的API密钥配置不存在`);
    }

    return config;
  }

  /**
   * 更新API密钥配置
   */
  async update(id: number, updateDto: UpdateAiApiKeyDto): Promise<AiApiKey> {
    try {
      const config = await this.findOne(id);

      const updatedConfig = this.aiApiKeyRepository.merge(config, updateDto);
      const saved = await this.aiApiKeyRepository.save(updatedConfig);

      this.logger.log(`更新API密钥配置成功: ${config.provider}`);
      return saved;
    } catch (error) {
      this.logger.error(`更新API密钥配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除API密钥配置
   */
  async remove(id: number): Promise<void> {
    const result = await this.aiApiKeyRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`ID为${id}的API密钥配置不存在`);
    }

    this.logger.log(`删除API密钥配置成功: ID=${id}`);
  }
}
