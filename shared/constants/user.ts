/**
 * 用户相关常量定义
 */

/**
 * 角色代码
 */
export const ROLE_CODES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES: 'sales',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const

/**
 * 角色名称
 */
export const ROLE_NAMES = {
  [ROLE_CODES.SUPER_ADMIN]: '超级管理员',
  [ROLE_CODES.ADMIN]: '管理员',
  [ROLE_CODES.SALES]: '销售',
  [ROLE_CODES.OPERATOR]: '运营',
  [ROLE_CODES.VIEWER]: '访客',
} as const

/**
 * 用户状态
 */
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const

/**
 * 用户状态选项
 */
export const USER_STATUS_OPTIONS = [
  { label: '正常', value: USER_STATUS.ACTIVE },
  { label: '禁用', value: USER_STATUS.INACTIVE },
]

/**
 * 权限代码
 */
export const PERMISSION_CODES = {
  // 客户管理
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_ASSIGN: 'customer:assign',
  CUSTOMER_EXPORT: 'customer:export',
  CUSTOMER_IMPORT: 'customer:import',

  // 订单管理
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_EXPORT: 'order:export',
  ORDER_IMPORT: 'order:import',

  // 跟进记录
  FOLLOW_VIEW: 'follow:view',
  FOLLOW_CREATE: 'follow:create',
  FOLLOW_DELETE: 'follow:delete',

  // 提成管理
  COMMISSION_VIEW: 'commission:view',
  COMMISSION_CALCULATE: 'commission:calculate',
  COMMISSION_EXPORT: 'commission:export',

  // 数据统计
  STATS_VIEW: 'stats:view',
  STATS_EXPORT: 'stats:export',

  // AI功能
  AI_CHAT: 'ai:chat',
  AI_ANALYSIS: 'ai:analysis',

  // 系统管理
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  DEPT_MANAGE: 'dept:manage',
  CAMPUS_MANAGE: 'campus:manage',
  SYSTEM_CONFIG: 'system:config',
} as const

/**
 * 默认头像
 */
export const DEFAULT_AVATAR = '/assets/default-avatar.png'

/**
 * Token存储键
 */
export const TOKEN_KEY = 'crm_token'

/**
 * 用户信息存储键
 */
export const USER_INFO_KEY = 'crm_user_info'
