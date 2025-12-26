import request from '@/utils/request'

/**
 * 跟进提醒配置接口
 */

// 获取跟进配置
export const getFollowUpConfig = () => {
  return request({
    url: '/system/follow-up-reminder/config',
    method: 'get'
  })
}

// 更��跟进配置
export const updateFollowUpConfig = (data: any) => {
  return request({
    url: '/system/follow-up-reminder/config',
    method: 'post',
    data
  })
}

// 获取提醒任务列表
export const getFollowUpTasks = (params: any) => {
  return request({
    url: '/system/follow-up-reminder/tasks',
    method: 'get',
    params
  })
}

// 手动生成提醒任务
export const generateFollowUpTasks = () => {
  return request({
    url: '/system/follow-up-reminder/generate-tasks',
    method: 'post'
  })
}

// 标记任务为已发送
export const markTaskAsSent = (id: number) => {
  return request({
    url: `/system/follow-up-reminder/tasks/${id}/sent`,
    method: 'put'
  })
}

// 标记任务为已完成
export const markTaskAsCompleted = (id: number) => {
  return request({
    url: `/system/follow-up-reminder/tasks/${id}/completed`,
    method: 'put'
  })
}

// 取消任务
export const cancelTask = (id: number) => {
  return request({
    url: `/system/follow-up-reminder/tasks/${id}`,
    method: 'delete'
  })
}
