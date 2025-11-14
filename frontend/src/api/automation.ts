import request from '@/utils/request'

export interface AutomationRule {
  id: number
  name: string
  ruleType: 'auto_assign' | 'auto_remind' | 'auto_tag'
  triggerType: 'new_customer' | 'follow_time' | 'no_follow' | 'intent_change'
  triggerConditions: Record<string, any>
  actions: Record<string, any>
  status: 'enabled' | 'disabled'
  priority: number
  executionCount: number
  lastExecutionTime: string | null
  description: string
  createdBy: number
  createTime: string
  updateTime: string
}

export interface AutomationLog {
  id: number
  ruleId: number
  targetType: string
  targetId: number
  status: 'success' | 'failed'
  result: Record<string, any>
  errorMessage: string | null
  executionTime: number
  createTime: string
  rule?: AutomationRule
}

export interface CreateRuleDto {
  name: string
  ruleType: 'auto_assign' | 'auto_remind' | 'auto_tag'
  triggerType: 'new_customer' | 'follow_time' | 'no_follow' | 'intent_change'
  triggerConditions?: Record<string, any>
  actions: Record<string, any>
  priority?: number
  description?: string
}

export interface UpdateRuleDto extends Partial<CreateRuleDto> {
  status?: 'enabled' | 'disabled'
}

/**
 * 获取规则列表
 */
export function getRules(ruleType?: string) {
  return request({
    url: '/automation/rules',
    method: 'get',
    params: { ruleType }
  })
}

/**
 * 获取规则详情
 */
export function getRule(id: number) {
  return request({
    url: `/automation/rules/${id}`,
    method: 'get'
  })
}

/**
 * 创建规则
 */
export function createRule(data: CreateRuleDto) {
  return request({
    url: '/automation/rules',
    method: 'post',
    data
  })
}

/**
 * 更新规则
 */
export function updateRule(id: number, data: UpdateRuleDto) {
  return request({
    url: `/automation/rules/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除规则
 */
export function deleteRule(id: number) {
  return request({
    url: `/automation/rules/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用规则
 */
export function toggleRule(id: number) {
  return request({
    url: `/automation/rules/${id}/toggle`,
    method: 'post'
  })
}

/**
 * 获取执行日志
 */
export function getLogs(ruleId?: number, limit?: number) {
  return request({
    url: '/automation/logs',
    method: 'get',
    params: { ruleId, limit }
  })
}

/**
 * 测试自动分配
 */
export function testAutoAssign(customerId: number) {
  return request({
    url: `/automation/test/assign/${customerId}`,
    method: 'post'
  })
}
