/**
 * 跟进记录相关API
 */
import type { FollowRecord, CreateFollowDto } from '@shared/types'
import { http } from '@/utils/request'

/**
 * 获取客户跟进记录
 */
export function getFollowRecords(customerId: number) {
  return http.get<FollowRecord[]>(`/customer/${customerId}/follow-records`)
}

/**
 * 创建跟进记录
 */
export function createFollowRecord(data: CreateFollowDto) {
  return http.post<FollowRecord>('/customer/follow-record', data)
}

/**
 * 获取待回访客户列表
 */
export function getPendingFollowUps() {
  return http.get('/customer/pending-followups/list')
}

/**
 * 获取今日待跟进列表
 */
export function getTodayFollowList() {
  return http.get('/customer/follow/today')
}
