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

    // 根据API文档修复日期参数格式：使用date数组而不是start_time/end_time
    const requestData: any = {
      apikey: apiKey,
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status,
    };

    // 只有当有开始和结束时间时才添加date参数
    if (params.startTime && params.endTime) {
      requestData.date = [params.startTime, params.endTime];
    }

    try {
      this.logger.log(`请求���绵订单列表: page=${requestData.page}, limit=${requestData.limit}`);
      this.logger.log(`请求参数: ${JSON.stringify(requestData)}`);
      this.logger.log(`API地址: ${apiUrl}`);

      const response = await axios.post<HaimianApiResponse>(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000, // 60秒超时，给更多时间处理
      });

      this.logger.log(`海绵API响应: ${JSON.stringify(response.data)}`);

      if (response.data.code !== 200) {
        throw new HttpException(
          `海绵API返回错误: ${response.data.msg}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const orderList = response.data.data.list || [];
      this.logger.log(`成功获取 ${orderList.length} 条订单数据`);

      // 数据验证和转换
      const transformedOrders = orderList.map(order => {
        // 确保必要字段存在
        if (!order.order_id) {
          this.logger.warn(`订单缺少order_id字段: ${JSON.stringify(order)}`);
          return null;
        }

        // 转换数字字段
        if (typeof order.status === 'string') {
          const statusInt = parseInt(order.status, 10);
          order.status = !isNaN(statusInt) ? statusInt : 0;
        }
        if (typeof order.refund === 'string') {
          const refundInt = parseInt(order.refund, 10);
          order.refund = !isNaN(refundInt) ? refundInt : 0;
        }
        if (typeof order.refund_status === 'string') {
          const refundStatusInt = parseInt(order.refund_status, 10);
          order.refund_status = !isNaN(refundStatusInt) ? refundStatusInt : 0;
        }

        // 确保skus字段是数组
        if (!Array.isArray(order.skus)) {
          order.skus = [];
        }

        return order;
      }).filter(order => order !== null);

      this.logger.log(`转换后有效订单: ${transformedOrders.length} 条`);
      return transformedOrders;
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
    // 进一步减小批量大小，默认10条
    const batchSizeConfig = await this.businessConfigService.getConfig('order_sync.batch_size') || '10';
    const batchSize = !isNaN(parseInt(batchSizeConfig)) ? parseInt(batchSizeConfig) : 10;

    const allOrders: HaimianOrder[] = [];
    let page = 1;
    let hasMore = true;
    const maxPages = 5; // 减少到最多5页，防止超时

    while (hasMore && page <= maxPages) {
      this.logger.log(`正在获取第 ${page} 页数据...`);

      const orders = await this.getOrderList({
        ...params,
        page,
        limit: batchSize,
      });

      this.logger.log(`第 ${page} 页获取到 ${orders.length} 条订单`);
      allOrders.push(...orders);

      // 如果返回数量小于批次大小，说明没有更多数据了
      if (orders.length < batchSize) {
        this.logger.log(`第 ${page} 页数据不足一批，停止获取`);
        hasMore = false;
      } else {
        page++;
      }

      // 避免请求过快，延迟200ms
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (page > maxPages) {
      this.logger.warn(`已达到最大页数限制 ${maxPages}，停止获取更多数据`);
    }

    this.logger.log(`批量获取完成，共 ${allOrders.length} 条订单`);
    return allOrders;
  }
}
