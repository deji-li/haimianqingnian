import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { BusinessConfigService } from '../business-config/business-config.service';
import {
  HaimianApiRequest,
  HaimianApiResponse,
  HaimianOrder,
} from './interfaces/haimian-order.interface';

@Injectable()
export class HaimianApiService {
  private readonly logger = new Logger(HaimianApiService.name);

  constructor(private readonly businessConfigService: BusinessConfigService) {}

  /**
   * 获取海绵系统订单列表
   */
  async getOrderList(params: {
    page?: number;
    limit?: number;
    startTime?: string;
    endTime?: string;
    status?: number;
  }): Promise<HaimianOrder[]> {
    const apiKey = await this.businessConfigService.getConfig('order_sync.api_key');
    const apiUrl = await this.businessConfigService.getConfig('order_sync.api_url');

    if (!apiKey || !apiUrl) {
      throw new HttpException('订单同步配置不完整，请检查API密钥和地址', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const requestData: HaimianApiRequest = {
      key: apiKey,
      page: params.page || 1,
      limit: params.limit || 100,
      start_time: params.startTime,
      end_time: params.endTime,
      status: params.status,
    };

    try {
      this.logger.log(`请求海绵订单列表: page=${requestData.page}, limit=${requestData.limit}`);

      const response = await axios.post<HaimianApiResponse>(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30秒超时
      });

      if (response.data.code !== 200) {
        throw new HttpException(
          `海绵API返回错误: ${response.data.msg}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.log(`成功获取 ${response.data.data.list.length} 条订单数据`);
      return response.data.data.list;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`海绵API调用失败: ${error.message}`);
        throw new HttpException(
          `调用海绵API失败: ${error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw error;
    }
  }

  /**
   * 批量获取订单（处理分页）
   */
  async getAllOrders(params: {
    startTime?: string;
    endTime?: string;
    status?: number;
  }): Promise<HaimianOrder[]> {
    const batchSize = parseInt(
      await this.businessConfigService.getConfig('order_sync.batch_size') || '100',
    );

    const allOrders: HaimianOrder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const orders = await this.getOrderList({
        ...params,
        page,
        limit: batchSize,
      });

      allOrders.push(...orders);

      // 如果返回数量小于批次大小，说明没有更多数据了
      if (orders.length < batchSize) {
        hasMore = false;
      } else {
        page++;
      }

      // 避免请求过快，延迟100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`批量获取完成，共 ${allOrders.length} 条订单`);
    return allOrders;
  }
}
