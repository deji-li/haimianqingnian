import request from '@/utils/request'

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string
  relatedId: number
  isRead: number
  readTime: string
  createTime: string
}

export interface QueryNotificationParams {
  page?: number
  pageSize?: number
  type?: string
  isRead?: number
}

export interface NotificationListResponse {
  list: Notification[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取通知列表
 */
export const getNotificationList = (params: QueryNotificationParams) => {
  return request<NotificationListResponse>({
    url: '/notification',
    method: 'get',
    params,
  })
}

/**
 * 获取未读通知数量
 */
export const getUnreadCount = () => {
  return request<number>({
    url: '/notification/unread-count',
    method: 'get',
  })
}

/**
 * 标记为已读
 */
export const markAsRead = (id: number) => {
  return request({
    url: `/notification/${id}/read`,
    method: 'post',
  })
}

/**
 * 全部标记为已读
 */
export const markAllAsRead = () => {
  return request({
    url: '/notification/read-all',
    method: 'post',
  })
}

/**
 * 删除通知
 */
export const deleteNotification = (id: number) => {
  return request({
    url: `/notification/${id}`,
    method: 'delete',
  })
}

/**
 * 清空已读通知
 */
export const clearReadNotifications = () => {
  return request({
    url: '/notification/clear/read',
    method: 'delete',
  })
}

/**
 * 发送系统通知（管理员）
 */
export const sendSystemNotification = (data: {
  userIds: number[]
  title: string
  content: string
}) => {
  return request({
    url: '/notification/system',
    method: 'post',
    data,
  })
}

/**
 * 获取通知类型显示文本
 */
export const getNotificationTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    follow_reminder: '回访提醒',
    order_update: '订单更新',
    commission_paid: '提成发放',
    system: '系统通知',
  }
  return typeMap[type] || type
}

/**
 * 获取通知类型标签类型
 */
export const getNotificationTypeTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    follow_reminder: 'warning',
    order_update: 'primary',
    commission_paid: 'success',
    system: 'info',
  }
  return tagMap[type] || 'info'
}
