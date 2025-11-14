import request from '@/utils/request'

export interface BusinessConfig {
  id: number
  configKey: string
  configValue: any
  configCategory: string
  description: string
  createTime: string
  updateTime: string
}

export interface UpdateConfigDto {
  configKey: string
  configValue: any
}

/**
 * 获取所有配置
 */
export function getAllConfigs(category?: string) {
  return request({
    url: '/business-config',
    method: 'get',
    params: { category }
  })
}

/**
 * 获取指定配置
 */
export function getConfig(configKey: string) {
  return request({
    url: `/business-config/${configKey}`,
    method: 'get'
  })
}

/**
 * 更新配置
 */
export function updateConfig(data: UpdateConfigDto) {
  return request({
    url: '/business-config',
    method: 'put',
    data
  })
}
