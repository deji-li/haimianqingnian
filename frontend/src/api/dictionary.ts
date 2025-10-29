import request from '@/utils/request'

export interface Dictionary {
  id: number
  dictType: string
  dictLabel: string
  dictValue: string
  sort: number
  status: number
  remark?: string
  createTime: string
  updateTime: string
}

export interface CreateDictionaryParams {
  dictType: string
  dictLabel: string
  dictValue: string
  sort?: number
  remark?: string
}

// 获取所有字典
export function getDictionaryList() {
  return request<Dictionary[]>({
    url: '/dictionary',
    method: 'get',
  })
}

// 根据类型获取字典
export function getDictionaryByType(type: string) {
  return request<Dictionary[]>({
    url: `/dictionary/type/${type}`,
    method: 'get',
  })
}

// 获取字典详情
export function getDictionaryDetail(id: number) {
  return request<Dictionary>({
    url: `/dictionary/${id}`,
    method: 'get',
  })
}

// 创建字典
export function createDictionary(data: CreateDictionaryParams) {
  return request<Dictionary>({
    url: '/dictionary',
    method: 'post',
    data,
  })
}

// 更新字典
export function updateDictionary(id: number, data: Partial<CreateDictionaryParams> & { status?: number }) {
  return request<Dictionary>({
    url: `/dictionary/${id}`,
    method: 'put',
    data,
  })
}

// 删除字典
export function deleteDictionary(id: number) {
  return request({
    url: `/dictionary/${id}`,
    method: 'delete',
  })
}

// 切换状态
export function toggleDictionaryStatus(id: number) {
  return request({
    url: `/dictionary/${id}/toggle-status`,
    method: 'patch',
  })
}

// 初始化默认数据
export function initDefaultData() {
  return request({
    url: '/dictionary/init',
    method: 'post',
  })
}
