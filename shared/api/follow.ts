/**
 * 跟进记录相关API接口定义
 */

import type {
  FollowRecord,
  CreateFollowDto,
  FollowQuery,
  PageResponse,
} from '../types'

export interface FollowApi {
  // 创建跟进记录
  createFollow(data: CreateFollowDto): Promise<FollowRecord>

  // 获取跟进记录列表
  getFollows(query: FollowQuery): Promise<PageResponse<FollowRecord>>

  // 获取跟进记录详情
  getFollowById(id: number): Promise<FollowRecord>

  // 删除跟进记录
  deleteFollow(id: number): Promise<void>

  // 获取客户的跟进历史
  getCustomerFollowHistory(customerId: number): Promise<FollowRecord[]>

  // 获取今日待跟进客户
  getTodayFollowList(): Promise<
    Array<{
      customerId: number
      customerName: string
      nextFollowTime: string
      lastFollowContent: string
    }>
  >
}
