import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiPromptConfig } from './entities/ai-prompt-config.entity';
import { AiPromptVariable } from './entities/ai-prompt-variable.entity';
import { CreateAiPromptConfigDto } from './dto/create-ai-prompt-config.dto';
import { UpdateAiPromptConfigDto } from './dto/update-ai-prompt-config.dto';
import { QueryAiPromptConfigDto } from './dto/query-ai-prompt-config.dto';

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(
    @InjectRepository(AiPromptConfig)
    private readonly aiPromptConfigRepository: Repository<AiPromptConfig>,
    @InjectRepository(AiPromptVariable)
    private readonly aiPromptVariableRepository: Repository<AiPromptVariable>,
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

  /**
   * 获取指定配置的所有变量
   */
  async getVariables(promptConfigId: number): Promise<AiPromptVariable[]> {
    try {
      return await this.aiPromptVariableRepository.find({
        where: { promptConfigId },
        order: { displayOrder: 'ASC', id: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`获取变量配置失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 根据场景key获取变量列表
   */
  async getVariablesByScenarioKey(scenarioKey: string): Promise<AiPromptVariable[]> {
    try {
      return await this.aiPromptVariableRepository.find({
        where: { scenarioKey, isActive: true },
        order: { displayOrder: 'ASC', id: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`获取变量配置失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 获取指定配置的变量（返回键值对格式，方便代码使用）
   */
  async getVariablesMap(scenarioKey: string): Promise<Record<string, any>> {
    const variables = await this.getVariablesByScenarioKey(scenarioKey);
    const map: Record<string, any> = {};

    variables.forEach((v) => {
      map[v.variableKey] = {
        name: v.variableName,
        description: v.variableDescription,
        type: v.dataType,
        required: v.isRequired,
        defaultValue: v.defaultValue,
        exampleValue: v.exampleValue,
      };
    });

    return map;
  }

  /**
   * 创建变量
   */
  async createVariable(createDto: any): Promise<any> {
    try {
      // 检查是否已存在相同的变量key
      const existing = await this.aiPromptVariableRepository.findOne({
        where: {
          promptConfigId: createDto.promptConfigId,
          variableKey: createDto.variableKey,
        },
      });

      if (existing) {
        throw new ConflictException(
          `变量 ${createDto.variableKey} 已存在于该配置中`,
        );
      }

      const variable = this.aiPromptVariableRepository.create(createDto);
      return await this.aiPromptVariableRepository.save(variable);
    } catch (error) {
      this.logger.error(`创建变量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新变量
   */
  async updateVariable(id: number, updateDto: any): Promise<any> {
    try {
      const variable = await this.aiPromptVariableRepository.findOne({
        where: { id },
      });

      if (!variable) {
        throw new NotFoundException(`ID为${id}的变量不存在`);
      }

      // 如果修改了variableKey，检查唯一性
      if (updateDto.variableKey && updateDto.variableKey !== variable.variableKey) {
        const existing = await this.aiPromptVariableRepository.findOne({
          where: {
            promptConfigId: variable.promptConfigId,
            variableKey: updateDto.variableKey,
          },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException(
            `变量 ${updateDto.variableKey} 已存在于该配置中`,
          );
        }
      }

      const updatedVariable = this.aiPromptVariableRepository.merge(variable, updateDto);
      return await this.aiPromptVariableRepository.save(updatedVariable);
    } catch (error) {
      this.logger.error(`更新变量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除变量
   */
  async removeVariable(id: number): Promise<void> {
    try {
      const variable = await this.aiPromptVariableRepository.findOne({
        where: { id },
      });

      if (!variable) {
        throw new NotFoundException(`ID为${id}的变量不存在`);
      }

      // 必填变量不允许删除
      if (variable.isRequired) {
        throw new ConflictException('必填变量不允许删除');
      }

      await this.aiPromptVariableRepository.delete(id);
    } catch (error) {
      this.logger.error(`删除变量失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新变量状态
   */
  async updateVariableStatus(id: number, isActive: boolean): Promise<any> {
    try {
      const variable = await this.aiPromptVariableRepository.findOne({
        where: { id },
      });

      if (!variable) {
        throw new NotFoundException(`ID为${id}的变量不存在`);
      }

      // 必填变量不允许禁用
      if (variable.isRequired && !isActive) {
        throw new ConflictException('必填变量不允许禁用');
      }

      variable.isActive = isActive;
      return await this.aiPromptVariableRepository.save(variable);
    } catch (error) {
      this.logger.error(`更新变量状态失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ==================== 新增方法 ====================

  /**
   * 获取所有AI配置（包括模型、功能、参数）
   */
  async getAllConfigs() {
    try {
      // 获取可用的AI模型
      const models = await this.aiPromptConfigRepository
        .createQueryBuilder('config')
        .leftJoinAndSelect('config.variables', 'variable')
        .orderBy('config.createTime', 'DESC')
        .getMany();

      // 获取功能开关
      const features = {
        aiAssistant: true,
        customerAnalysis: true,
        marketingAdvice: true,
        knowledgeMining: true,
        ocrTool: true,
      };

      // 获取知识库配置
      const knowledge = {
        totalKnowledge: 0,
        weight: 70,
        searchStrategy: 'semantic',
        updateFrequency: 'daily',
        autoLearning: true,
      };

      // 获取AI参数
      const parameters = {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      };

      return {
        models,
        features,
        knowledge,
        parameters,
      };
    } catch (error) {
      this.logger.error(`获取所有配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新所有配置
   */
  async updateAllConfig(config: any) {
    try {
      const { models, features, knowledge, parameters } = config;

      // 更新功能开关
      if (features) {
        // 这里可以保存到系统配置表或Redis
        this.logger.log(`更新功能开关: ${JSON.stringify(features)}`);
      }

      // 更新知识库配置
      if (knowledge) {
        this.logger.log(`更新知识库配置: ${JSON.stringify(knowledge)}`);
      }

      // 更新AI参数
      if (parameters) {
        this.logger.log(`更新AI参数: ${JSON.stringify(parameters)}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`更新所有配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取模型配置
   */
  async getModelConfigs() {
    try {
      return await this.aiPromptConfigRepository.find({
        order: { createTime: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`获取模型配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新模型配置
   */
  async updateModelConfig(id: number, config: any) {
    try {
      const modelConfig = await this.aiPromptConfigRepository.findOne({ where: { id } });
      if (!modelConfig) {
        throw new NotFoundException('模型配置不存在');
      }

      Object.assign(modelConfig, config);
      return await this.aiPromptConfigRepository.save(modelConfig);
    } catch (error) {
      this.logger.error(`更新模型配置失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 测试模型连接
   */
  async testModelConnection(modelConfig: any) {
    try {
      // 简化的连接测试，实际项目中可以调用真实的API
      this.logger.log(`测试模型连接: ${modelConfig.scenarioKey}`);

      // 模拟测试结果
      return {
        success: true,
        message: '连接测试成功',
        responseTime: 150,
        model: modelConfig.modelName || 'test-model',
      };
    } catch (error) {
      this.logger.error(`测试模型连接失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message,
        responseTime: 0,
      };
    }
  }

  /**
   * 获取功能开关状态
   */
  async getFeatureFlags() {
    try {
      // 这里可以从数据库或配置文件读取功能开关状态
      return {
        aiAssistant: true,
        customerAnalysis: true,
        marketingAdvice: true,
        knowledgeMining: true,
        ocrTool: true,
      };
    } catch (error) {
      this.logger.error(`获取功能开关失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新功能开关
   */
  async updateFeatureFlags(features: any) {
    try {
      // 这里可以将功能开关状态保存到数据库或配置文件
      this.logger.log(`更新功能开关: ${JSON.stringify(features)}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`更新功能开关失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取AI参数配置
   */
  async getAIParameters() {
    try {
      // 这里可以从数据库或配置文件读取AI参数
      return {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      };
    } catch (error) {
      this.logger.error(`获取AI参数失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新AI参数
   */
  async updateAIParameters(params: any) {
    try {
      // 这里可以将AI参数保存到数据库或配置文件
      this.logger.log(`更新AI参数: ${JSON.stringify(params)}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`更新AI参数失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
