import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiPromptConfig } from './entities/ai-prompt-config.entity';
import { CreateAiPromptConfigDto } from './dto/create-ai-prompt-config.dto';
import { UpdateAiPromptConfigDto } from './dto/update-ai-prompt-config.dto';
import { QueryAiPromptConfigDto } from './dto/query-ai-prompt-config.dto';

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(
    @InjectRepository(AiPromptConfig)
    private readonly aiPromptConfigRepository: Repository<AiPromptConfig>,
  ) {}

  /**
   * 创建AI提示词配置
   */
  async create(createDto: CreateAiPromptConfigDto): Promise<AiPromptConfig> {
    try {
      // 检查是否已存在相同场景+供应商的配置
      const existing = await this.aiPromptConfigRepository.findOne({
        where: {
          scenarioKey: createDto.scenarioKey,
          modelProvider: createDto.modelProvider,
        },
      });

      if (existing) {
        throw new ConflictException(
          `场景 ${createDto.scenarioKey} 的 ${createDto.modelProvider} 配置已存在`,
        );
      }

      const config = this.aiPromptConfigRepository.create(createDto);
      return await this.aiPromptConfigRepository.save(config);
    } catch (error) {
      this.logger.error(`创建AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询配置列表
   */
  async findAll(query: QueryAiPromptConfigDto) {
    try {
      const { page = 1, limit = 20, scenarioCategory, modelProvider, scenarioKey, isActive } = query;

      const queryBuilder = this.aiPromptConfigRepository.createQueryBuilder('config');

      if (scenarioCategory) {
        queryBuilder.andWhere('config.scenarioCategory = :scenarioCategory', { scenarioCategory });
      }

      if (modelProvider) {
        queryBuilder.andWhere('config.modelProvider = :modelProvider', { modelProvider });
      }

      if (scenarioKey) {
        queryBuilder.andWhere('config.scenarioKey = :scenarioKey', { scenarioKey });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('config.isActive = :isActive', { isActive });
      }

      const [list, total] = await queryBuilder
        .orderBy('config.createTime', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        list,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`查询AI配置列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据ID查询配置
   */
  async findOne(id: number): Promise<AiPromptConfig> {
    const config = await this.aiPromptConfigRepository.findOne({ where: { id } });

    if (!config) {
      throw new NotFoundException(`ID为${id}的配置不存在`);
    }

    return config;
  }

  /**
   * 根据场景和供应商查询配置（用于AI服务调用）
   */
  async getPromptConfig(scenarioKey: string, modelProvider: string): Promise<AiPromptConfig | null> {
    try {
      const config = await this.aiPromptConfigRepository.findOne({
        where: {
          scenarioKey,
          modelProvider,
          isActive: true,
        },
      });

      return config;
    } catch (error) {
      this.logger.error(
        `获取提示词配置失败: scenarioKey=${scenarioKey}, provider=${modelProvider}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * 更新配置
   */
  async update(id: number, updateDto: UpdateAiPromptConfigDto): Promise<AiPromptConfig> {
    try {
      const config = await this.findOne(id);

      // 如果修改了场景key或供应商，检查唯一性
      if (updateDto.scenarioKey || updateDto.modelProvider) {
        const scenarioKey = updateDto.scenarioKey || config.scenarioKey;
        const modelProvider = updateDto.modelProvider || config.modelProvider;

        const existing = await this.aiPromptConfigRepository.findOne({
          where: { scenarioKey, modelProvider },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException(`场景 ${scenarioKey} 的 ${modelProvider} 配置已存在`);
        }
      }

      // 更新版本号
      const updatedConfig = this.aiPromptConfigRepository.merge(config, {
        ...updateDto,
        version: config.version + 1,
      });

      return await this.aiPromptConfigRepository.save(updatedConfig);
    } catch (error) {
      this.logger.error(`更新AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除配置
   */
  async remove(id: number): Promise<void> {
    const result = await this.aiPromptConfigRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`ID为${id}的配置不存在`);
    }
  }

  /**
   * 获取所有场景分类
   */
  async getCategories(): Promise<string[]> {
    const result = await this.aiPromptConfigRepository
      .createQueryBuilder('config')
      .select('DISTINCT config.scenarioCategory', 'category')
      .getRawMany();

    return result.map((r) => r.category);
  }
}
