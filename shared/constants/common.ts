/**
 * 通用常量定义
 */

/**
 * 分页默认配置
 */
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * 日期格式
 */
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const TIME_FORMAT = 'HH:mm:ss'

/**
 * 状态码
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const

/**
 * 响应消息
 */
export const RESPONSE_MESSAGE = {
  SUCCESS: '操作成功',
  FAIL: '操作失败',
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  NETWORK_ERROR: '网络错误，请稍后重试',
  TIMEOUT: '请求超时',
  UNAUTHORIZED: '未授权，请先登录',
  FORBIDDEN: '没有权限访问',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器错误',
} as const

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 30000

/**
 * 上传文件大小限制（字节）
 */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * 允许上传的图片类型
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * 允许上传的文件类型
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

/**
 * 性别选项
 */
export const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

/**
 * 状态选项（通用）
 */
export const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/**
 * 是否选项
 */
export const YES_NO_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false },
]
