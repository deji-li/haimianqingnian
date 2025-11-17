import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiFieldMappingConfig } from '../../../modules/ai-config/entities/ai-field-mapping-config.entity';
import { AiConfigCallerService } from './ai-config-caller.service';

/**
 * 字段映射服务
 * 用途: 根据配置进行字段映射转换
 */
@Injectable()
export class FieldMappingService {
  private readonly logger = new Logger(FieldMappingService.name);

  constructor(
    @InjectRepository(AiFieldMappingConfig)
    private readonly mappingConfigRepository: Repository<AiFieldMappingConfig>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 执行字段映射
   * @param mappingScenario 映射场景 (如: chat_to_knowledge)
   * @param sourceData 源数据对象
   * @returns 目标数据对象
   */
  async mapFields(mappingScenario: string, sourceData: any): Promise<any> {
    try {
      this.logger.log(`开始字段映射: scenario=${mappingScenario}`);

      // 1. 获取映射配置
      const mappings = await this.mappingConfigRepository.find({
        where: { mappingScenario, isActive: true },
        order: { displayOrder: 'ASC' },
      });

      if (mappings.length === 0) {
        this.logger.warn(`映射场景 ${mappingScenario} 没有配置，返回原数据`);
        return sourceData;
      }

      const targetData: any = {};

      // 2. 遍历映射规则
      for (const mapping of mappings) {
        try {
          const sourceValue = this.getNestedValue(sourceData, mapping.sourceField);
          let targetValue;

          switch (mapping.mappingType) {
            case 'direct':
              // 直接映射
              targetValue = sourceValue !== undefined ? sourceValue : mapping.defaultValue;
              break;

            case 'transform':
              // 转换映射 (执行JS表达式)
              try {
                const transformFn = new Function('value', 'data', mapping.transformRule);
                targetValue = transformFn(sourceValue, sourceData);
              } catch (error) {
                this.logger.warn(
                  `转换映射失败: ${mapping.sourceField} -> ${mapping.targetField}, ` +
                    `error=${error.message}, 使用默认值`,
                );
                targetValue = mapping.defaultValue;
              }
              break;

            case 'ai_extract':
              // AI提取映射
              try {
                this.logger.log(
                  `AI提取映射: ${mapping.sourceField} -> ${mapping.targetField}, ` +
                    `scenarioKey=${mapping.transformRule}`,
                );
                const aiResult = await this.aiConfigCallerService.callAI(
                  mapping.transformRule, // transformRule存储的是AI场景key
                  { [mapping.sourceField]: sourceValue },
                );
                targetValue = aiResult;
              } catch (error) {
                this.logger.error(
                  `AI提取映射失败: ${mapping.sourceField} -> ${mapping.targetField}, ` +
                    `error=${error.message}, 使用默认值`,
                );
                targetValue = mapping.defaultValue;
              }
              break;

            default:
              targetValue = sourceValue;
          }

          // 3. 设置目标值
          this.setNestedValue(targetData, mapping.targetField, targetValue);

          this.logger.debug(
            `映射成功: ${mapping.sourceField} -> ${mapping.targetField}, ` +
              `type=${mapping.mappingType}`,
          );
        } catch (error) {
          this.logger.error(
            `字段映射失败: ${mapping.sourceField} -> ${mapping.targetField}, ` +
              `error=${error.message}`,
            error.stack,
          );
          // 继续处理其他字段
        }
      }

      this.logger.log(`字段映射完成: scenario=${mappingScenario}`);
      return targetData;
    } catch (error) {
      this.logger.error(
        `字段映射异常: scenario=${mappingScenario}, error=${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 批量映射
   * @param mappingScenario 映射场景
   * @param sourceDataList 源数据列表
   */
  async mapFieldsBatch(
    mappingScenario: string,
    sourceDataList: any[],
  ): Promise<any[]> {
    const promises = sourceDataList.map((sourceData) =>
      this.mapFields(mappingScenario, sourceData),
    );
    return await Promise.all(promises);
  }

  /**
   * 获取嵌套对象的值 (支持a.b.c格式)
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * 设置嵌套对象的值 (支持a.b.c格式)
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) return;

    let current = obj;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  /**
   * 获取映射场景的所有配置
   * @param mappingScenario 映射场景
   */
  async getMappingConfigs(mappingScenario: string): Promise<AiFieldMappingConfig[]> {
    return await this.mappingConfigRepository.find({
      where: { mappingScenario },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * 创建映射配置
   */
  async createMappingConfig(configData: Partial<AiFieldMappingConfig>): Promise<AiFieldMappingConfig> {
    const config = this.mappingConfigRepository.create(configData);
    return await this.mappingConfigRepository.save(config);
  }

  /**
   * 更新映射配置
   */
  async updateMappingConfig(
    id: number,
    configData: Partial<AiFieldMappingConfig>,
  ): Promise<AiFieldMappingConfig> {
    await this.mappingConfigRepository.update(id, configData);
    const updated = await this.mappingConfigRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`映射配置ID ${id} 不存在`);
    }
    return updated;
  }

  /**
   * 删除映射配置
   */
  async deleteMappingConfig(id: number): Promise<void> {
    await this.mappingConfigRepository.delete(id);
  }
}
