import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiConfigService } from '../../../modules/ai-config/ai-config.service';
import { AiApiKeyService } from '../../../modules/ai-config/ai-api-key.service';

/**
 * AI配置统一调用服务
 * 用途: 统一调用AI配置，避免硬编码提示词
 */
@Injectable()
export class AiConfigCallerService {
  private readonly logger = new Logger(AiConfigCallerService.name);

  constructor(
    private readonly aiConfigService: AiConfigService,
    private readonly aiApiKeyService: AiApiKeyService,
  ) {}

  /**
   * 统一调用AI配置
   * @param scenarioKey 场景key (如: knowledge_qa_extraction)
   * @param variables 变量值对象
   * @param preferProvider 优先使用的供应商 (可选, 默认deepseek)
   * @returns AI响应结果 (自动尝试解析JSON)
   */
  async callAI(
    scenarioKey: string,
    variables: Record<string, any>,
    preferProvider?: 'deepseek' | 'doubao',
  ): Promise<any> {
    try {
      // 1. 获取配置
      const provider = preferProvider || 'deepseek';
      const config = await this.aiConfigService.getPromptConfig(scenarioKey, provider);

      if (!config || !config.isActive) {
        throw new NotFoundException(
          `场景 ${scenarioKey} 的 ${provider} AI配置不存在或未启用`,
        );
      }

      this.logger.log(
        `调用AI配置: scenarioKey=${scenarioKey}, provider=${provider}, variables=${JSON.stringify(variables)}`,
      );

      // 2. 替换变量
      let promptContent = config.promptContent;
      let systemPrompt = config.systemPrompt || '';

      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const stringValue = this.convertToString(value);

        promptContent = promptContent.replace(new RegExp(placeholder, 'g'), stringValue);
        systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), stringValue);
      }

      // 3. 获取API密钥
      // TODO: AiApiKeyService.getActiveKey() doesn't exist - service needs refactoring
      // Entire service disabled until AI services are restored
      throw new Error('AI服务暂时不可用 - AiApiKeyService已删除，需要重新实现');

      /* Original implementation commented out - requires deleted services
      const apiKey = await this.aiApiKeyService.getActiveKey(provider);
      if (!apiKey) {
        throw new NotFoundException(`${provider} API密钥未配置或未启用`);
      }

      // 4. 调用AI
      let result: string;

      if (provider === 'deepseek') {
        result = await this.callDeepSeek(
          apiKey,
          promptContent,
          systemPrompt,
          config.temperature || 0.3,
          config.maxTokens || 2000,
        );
      } else if (provider === 'doubao') {
        result = await this.callDoubao(
          apiKey,
          promptContent,
          systemPrompt,
          config.temperature || 0.3,
          config.maxTokens || 2000,
        );
      } else {
        throw new Error(`不支持的AI供应商: ${provider}`);
      }

      // 5. 尝试解析JSON结果
      try {
        const jsonResult = JSON.parse(result.trim());
        return jsonResult;
      } catch {
        // 如果不是JSON格式，返回原文
        return result;
      }
      */ // End of commented out code
    } catch (error) {
      this.logger.error(
        `AI调用失败: scenarioKey=${scenarioKey}, error=${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 批量调用AI (用于需要多次AI调用的场景)
   * @param scenarioKey 场景key
   * @param variablesList 变量值列表
   * @param preferProvider 优先供应商
   */
  async callAIBatch(
    scenarioKey: string,
    variablesList: Record<string, any>[],
    preferProvider?: 'deepseek' | 'doubao',
  ): Promise<any[]> {
    const promises = variablesList.map((vars) =>
      this.callAI(scenarioKey, vars, preferProvider),
    );
    return await Promise.all(promises);
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepSeek(
    apiKey: any,
    userPrompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    try {
      const axios = require('axios');

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userPrompt });

      const response = await axios.post(
        apiKey.apiUrl,
        {
          model: apiKey.modelName || 'deepseek-chat',
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.apiKey}`,
          },
          timeout: 60000, // 60秒超时
        },
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('DeepSeek API返回格式异常');
      }
    } catch (error) {
      this.logger.error(`DeepSeek API调用失败: ${error.message}`, error.stack);
      throw new Error(`DeepSeek调用失败: ${error.message}`);
    }
  }

  /**
   * 调用豆包API
   */
  private async callDoubao(
    apiKey: any,
    userPrompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    try {
      const axios = require('axios');

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userPrompt });

      const response = await axios.post(
        apiKey.apiUrl,
        {
          model: apiKey.endpointId, // 豆包使用endpointId
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.apiKey}`,
          },
          timeout: 60000,
        },
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('豆包API返回格式异常');
      }
    } catch (error) {
      this.logger.error(`豆包API调用失败: ${error.message}`, error.stack);
      throw new Error(`豆包调用失败: ${error.message}`);
    }
  }

  /**
   * 将值转换为字符串
   */
  private convertToString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}
