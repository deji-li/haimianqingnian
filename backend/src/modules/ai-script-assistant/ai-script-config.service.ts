import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AiScriptPromptConfig } from './entities/ai-script-prompt-config.entity';
import { AiScriptScenario } from './entities/ai-script-scenario.entity';
import { AiScriptTechnique } from './entities/ai-script-technique.entity';
import { CreatePromptConfigDto, UpdatePromptConfigDto, QueryPromptConfigDto, SUPPORTED_VARIABLES } from './dto/prompt-config.dto';
import { FunctionType } from './dto/create-conversation.dto';

@Injectable()
export class AiScriptConfigService {
  private readonly logger = new Logger(AiScriptConfigService.name);

  constructor(
    @InjectRepository(AiScriptPromptConfig)
    private readonly configRepository: Repository<AiScriptPromptConfig>,
    @InjectRepository(AiScriptScenario)
    private readonly scenarioRepository: Repository<AiScriptScenario>,
    @InjectRepository(AiScriptTechnique)
    private readonly techniqueRepository: Repository<AiScriptTechnique>,
  ) {}

  /**
   * 创建AI配置
   */
  async createConfig(userId: number, dto: CreatePromptConfigDto) {
    try {
      // 验证场景和技巧是否存在
      if (dto.scenarioId) {
        const scenario = await this.scenarioRepository.findOne({
          where: { id: dto.scenarioId }
        });
        if (!scenario || scenario.functionType !== dto.functionType) {
          throw new BadRequestException('场景不存在或不属于该功能类型');
        }
      }

      if (dto.techniqueId) {
        const technique = await this.techniqueRepository.findOne({
          where: { id: dto.techniqueId }
        });
        if (!technique) {
          throw new BadRequestException('技巧不存在');
        }
      }

      const config = this.configRepository.create({
        ...dto,
        createdBy: userId,
      });

      const saved = await this.configRepository.save(config);
      this.logger.log(`创建AI配置成功: ID=${saved.id}, 名称=${dto.configName}`);
      return saved;

    } catch (error) {
      this.logger.error(`创建AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取配置列表
   */
  async getConfigs(query: QueryPromptConfigDto) {
    try {
      const qb = this.configRepository
        .createQueryBuilder('config')
        .leftJoinAndSelect('config.scenario', 'scenario')
        .leftJoinAndSelect('config.technique', 'technique')
        .leftJoinAndSelect('config.creator', 'creator');

      if (query.functionType) {
        qb.andWhere('config.functionType = :functionType', { functionType: query.functionType });
      }

      if (query.scenarioId) {
        qb.andWhere('config.scenarioId = :scenarioId', { scenarioId: query.scenarioId });
      }

      if (query.techniqueId) {
        qb.andWhere('config.techniqueId = :techniqueId', { techniqueId: query.techniqueId });
      }

      if (query.isActive !== undefined) {
        qb.andWhere('config.isActive = :isActive', { isActive: query.isActive });
      }

      qb.orderBy('config.createTime', 'DESC');

      const [list, total] = await qb
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      return {
        list,
        total,
        page: query.page,
        limit: query.limit,
      };

    } catch (error) {
      this.logger.error(`获取配置列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据功能类型和场景获取默认配置
   */
  async getDefaultConfig(functionType: string, scenarioId?: number, techniqueId?: number) {
    try {
      // 优先查找精确匹配的配置
      let config = await this.configRepository.findOne({
        where: {
          functionType: functionType as any,
          scenarioId: scenarioId || null,
          techniqueId: techniqueId || null,
          isActive: true,
        },
        order: { createdAt: 'DESC' },
      });

      // 如果没有精确匹配，查找功能类型的通用配置
      if (!config) {
        config = await this.configRepository.findOne({
          where: {
            functionType: functionType as any,
            scenarioId: null,
            techniqueId: null,
            isActive: true,
          },
          order: { createdAt: 'DESC' },
        });
      }

      return config;

    } catch (error) {
      this.logger.error(`获取默认配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取配置详情
   */
  async getConfigById(id: number) {
    try {
      const config = await this.configRepository.findOne({
        where: { id },
        relations: ['scenario', 'technique', 'creator'],
      });

      if (!config) {
        throw new NotFoundException('配置不存在');
      }

      return config;

    } catch (error) {
      this.logger.error(`获取配置详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(id: number, userId: number, dto: UpdatePromptConfigDto) {
    try {
      const config = await this.configRepository.findOne({
        where: { id },
      });

      if (!config) {
        throw new NotFoundException('配置不存在');
      }

      // 验证场景和技巧
      if (dto.scenarioId !== undefined && dto.scenarioId !== config.scenarioId) {
        if (dto.scenarioId) {
          const scenario = await this.scenarioRepository.findOne({
            where: { id: dto.scenarioId, functionType: config.functionType }
          });
          if (!scenario) {
            throw new BadRequestException('场景不存在或不属于该功能类型');
          }
        }
      }

      if (dto.techniqueId !== undefined && dto.techniqueId !== config.techniqueId) {
        if (dto.techniqueId) {
          const technique = await this.techniqueRepository.findOne({
            where: { id: dto.techniqueId }
          });
          if (!technique) {
            throw new BadRequestException('技巧不存在');
          }
        }
      }

      // 更新配置
      Object.assign(config, dto);
      config.updatedBy = userId;

      const updated = await this.configRepository.save(config);
      this.logger.log(`更新AI配置成功: ID=${id}`);
      return updated;

    } catch (error) {
      this.logger.error(`更新AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(id: number) {
    try {
      const config = await this.configRepository.findOne({
        where: { id },
      });

      if (!config) {
        throw new NotFoundException('配置不存在');
      }

      await this.configRepository.remove(config);
      this.logger.log(`删除AI配置成功: ID=${id}`);
      return { message: '删除成功' };

    } catch (error) {
      this.logger.error(`删除AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取支持的变量列表
   */
  getSupportedVariables() {
    return SUPPORTED_VARIABLES;
  }

  /**
   * 初始化默认配置
   */
  async initializeDefaultConfigs(userId: number) {
    const defaultConfigs = [
      // 帮你谈单默认配置
      {
        functionType: FunctionType.DEAL_ASSIST,
        configName: '帮你谈单-默认配置',
        systemPrompt: '你是一位专业的销售顾问，擅长根据客户情况生成有效的销售话术。请基于提供的场景和技巧，生成符合客户特点的沟通内容。',
        userPromptTemplate: '功能类型：{{functionType}}\n客户信息：{{customerName}}（{{industry}}，{{position}}）\n场景：{{scenario}}\n技巧：{{technique}}\n客户痛点：{{painPoint}}\n沟通目标：{{communicationGoal}}\n请生成相应的销售话术。',
        temperature: 0.7,
        maxTokens: 2000,
        knowledgeWeight: 0.7,
        variables: ['customerName', 'industry', 'position', 'scenario', 'technique', 'painPoint', 'communicationGoal'],
      },
      // 帮你回复默认配置
      {
        functionType: FunctionType.REPLY_ASSIST,
        configName: '帮你回复-默认配置',
        systemPrompt: '你是一位专业的客服顾问，擅长针对客户的疑问和异议，生成得体且有效的回复话术。',
        userPromptTemplate: '功能类型：{{functionType}}\n客户提问：{{customerQuestion}}\n客户背景：{{customerName}}（{{industry}}）\n场景：{{scenario}}\n技巧：{{technique}}\n请生成专业回复。',
        temperature: 0.8,
        maxTokens: 2000,
        knowledgeWeight: 0.6,
        variables: ['customerQuestion', 'customerName', 'industry', 'scenario', 'technique'],
      },
      // 话术润色默认配置
      {
        functionType: FunctionType.SCRIPT_POLISH,
        configName: '话术润色-默认配置',
        systemPrompt: '你是一位专业的文案编辑，擅长润色和优化销售话术，使其更加专业、流畅和有说服力。',
        userPromptTemplate: '应用场景：{{applicationScenario}}\n润色目标：{{polishGoal}}\n原始话术：{{originalScript}}\n请润色优化。',
        temperature: 0.6,
        maxTokens: 1500,
        knowledgeWeight: 0.5,
        variables: ['applicationScenario', 'polishGoal', 'originalScript'],
      },
      // 开场白生成默认配置
      {
        functionType: FunctionType.OPENING_LINES,
        configName: '开场白生成-默认配置',
        systemPrompt: '你是一位资深的销售专家，擅长根据不同场景创作吸引人的开场白，快速建立与客户的良好沟通。',
        userPromptTemplate: '场景类型：{{scenarioType}}\n客户背景：{{customerBackground}}\n技巧：{{technique}}\n沟通目标：{{goal}}\n请生成开场白。',
        temperature: 0.8,
        maxTokens: 1000,
        knowledgeWeight: 0.6,
        variables: ['scenarioType', 'customerBackground', 'technique', 'goal'],
      },
    ];

    for (const configData of defaultConfigs) {
      const exists = await this.configRepository.findOne({
        where: {
          functionType: configData.functionType,
          configName: configData.configName,
        },
      });

      if (!exists) {
        await this.createConfig(userId, configData);
      }
    }

    this.logger.log('默认AI配置初始化完成');
  }

  /**
   * 复制配置
   */
  async duplicateConfig(id: number, userId: number, newName?: string) {
    try {
      const original = await this.configRepository.findOne({
        where: { id },
      });

      if (!original) {
        throw new NotFoundException('配置不存在');
      }

      const duplicated = this.configRepository.create({
        ...original,
        id: undefined,
        configName: newName || `${original.configName} - 副本`,
        createdBy: userId,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await this.configRepository.save(duplicated);
      this.logger.log(`复制AI配置成功: 原ID=${id}, 新ID=${saved.id}`);
      return saved;

    } catch (error) {
      this.logger.error(`复制AI配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}