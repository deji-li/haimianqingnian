/**
 * 通知相关API
 */
import { http } from '@/utils/request'

/**
 * 通知类型
 */
export type NotificationType =
  | 'follow_reminder'
  | 'order_update'
  | 'commission_paid'
  | 'system'
  | 'high_intent'
  | 'customer_assign'
  | 'lifecycle_change'
  | 'batch_operation'

/**
 * 通知接口
 */
export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  isRead: number
  readTime?: string
  createTime: string
  updateTime: string
}

/**
 * 查询参数
 */
export interface QueryNotificationParams {
  page?: number
  pageSize?: number
  type?: NotificationType
  isRead?: number
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取通知列表
 */
export function getNotificationList(params?: QueryNotificationParams) {
  return http.get<PageResponse<Notification>>('/notification', params)
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount() {
  return http.get<{ count: number }>('/notification/unread-count')
}

/**
 * 标记单个通知为已读
 */
export function markAsRead(id: number) {
  return http.post(`/notification/${id}/read`)
}

/**
 * 全部标记为已读
 */
export function markAllAsRead() {
  return http.post('/notification/read-all')
}

/**
 * 删除通知
 */
export function deleteNotification(id: number) {
  return http.delete(`/notification/${id}`)
}

/**
 * 清空已读通知
 */
export function clearReadNotifications() {
  return http.delete('/notification/clear/read')
}

/**
 * 创建测试通知
 */
export function createTestNotification() {
  return http.post('/notification/test')
}
