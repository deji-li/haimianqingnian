import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessConfig } from '../../business-config/entities/business-config.entity';

interface AIConfigData {
  model: {
    provider: string;
    temperature: number;
    maxTokens: number;
  };
  evaluation: {
    goalAchievement: number;
    professionalism: number;
    efficiency: number;
    adaptability: number;
    customerSatisfaction: number;
  };
  prompts: {
    customerPersona: string;
    scriptGeneration: string;
    evaluation: string;
  };
  advanced: {
    maxRounds: number;
    responseDelay: string;
    realTimeEvaluation: boolean;
    autoSave: boolean;
  };
}

@Injectable()
export class TrainingConfigService {
  private readonly logger = new Logger(TrainingConfigService.name);

  constructor(
    @InjectRepository(BusinessConfig)
    private readonly configRepository: Repository<BusinessConfig>,
  ) {}

  /**
   * 获取AI培训配置
   */
  async getAIConfig(): Promise<AIConfigData> {
    const config = await this.configRepository.findOne({
      where: { configKey: 'training_coach_ai_config' },
    });

    if (config && config.configValue) {
      try {
        return JSON.parse(JSON.stringify(config.configValue));
      } catch (error) {
        this.logger.error('解析AI配置失败', error);
      }
    }

    // 返回默认配置
    return this.getDefaultConfig();
  }

  /**
   * 更新AI培训配置
   */
  async updateAIConfig(configData: Partial<AIConfigData>): Promise<AIConfigData> {
    const currentConfig = await this.getAIConfig();
    const newConfig = {
      ...currentConfig,
      ...configData,
    };

    // 查找或创建配置记录
    let config = await this.configRepository.findOne({
      where: { configKey: 'training_coach_ai_config' },
    });

    if (!config) {
      config = this.configRepository.create({
        configKey: 'training_coach_ai_config',
        configCategory: 'ai_training',
        configValue: newConfig,
        description: 'AI培训陪练系统的配置参数',
      });
    } else {
      config.configValue = newConfig;
    }

    await this.configRepository.save(config);

    this.logger.log('AI培训配置已更新');

    return newConfig;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): AIConfigData {
    return {
      model: {
        provider: 'deepseek',
        temperature: 0.7,
        maxTokens: 2000,
      },
      evaluation: {
        goalAchievement: 40,
        professionalism: 25,
        efficiency: 15,
        adaptability: 10,
        customerSatisfaction: 10,
      },
      prompts: {
        customerPersona: '你是专业的角色扮演AI，能够准确模拟不同类型客户的真实反应。根据客户角色的性格特点、沟通风格和决策方式，提供真实的对话回应。',
        scriptGeneration: '你是专业的销售培训专家，擅长创建实战性强的培训剧本。请根据业务场景、客户背景和培训目标，生成结构完整、逻辑清晰的销售对话剧本。',
        evaluation: '你是专业的销售培训评估师，请客观评估销售表现并提供建设性建议。从目标达成、专业性、效率、应变能力和客户满意度等维度进行评分和分析。',
      },
      advanced: {
        maxRounds: 10,
        responseDelay: 'normal', // fast / normal / slow
        realTimeEvaluation: true,
        autoSave: true,
      },
    };
  }

  /**
   * 重置为默认配置
   */
  async resetToDefault(): Promise<AIConfigData> {
    const defaultConfig = this.getDefaultConfig();
    return await this.updateAIConfig(defaultConfig);
  }
}
