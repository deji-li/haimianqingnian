/**
 * 统计相关API
 */
import { http } from '@/utils/request'

/**
 * 获取首页统计数据
 */
export function getHomeStats() {
  return http.get<{
    todayFollowCount: number
    pendingFollowCount: number
    monthOrderCount: number
    monthOrderAmount: number
    customerCount: number
    highIntentCount: number
  }>('/stats/home')
}

/**
 * 获取跟进统计
 */
export function getFollowStats() {
  return http.get<{
    todayFollow: number
    weekFollow: number
    monthFollow: number
    pendingFollow: number
    overdueFollow: number
  }>('/customer/follow/statistics')
}

/**
 * 获取详细统计数据
 */
export function getDetailStats(params: { startDate?: string; endDate?: string }) {
  return http.get('/stats/detail', params)
}
