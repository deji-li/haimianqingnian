/**
 * 测试shared包导入
 */

// 测试类型导入
import type { Customer, Order, User, FollowRecord } from '@shared/types'
import type { CustomerApi, OrderApi, UserApi } from '@shared/api'

// 测试工具函数导入
import {
  formatDate,
  formatMoney,
  formatPhone,
  validatePhone,
  validateEmail,
} from '@shared/utils'

// 测试常量导入
import {
  LIFECYCLE_STAGES,
  ORDER_STATUSES,
  DEFAULT_PAGE_SIZE,
  ROLE_CODES,
} from '@shared/constants'

// 测试函数调用
export function testSharedPackage() {
  // 测试格式化函数
  console.log('格式化日期:', formatDate(new Date()))
  console.log('格式化金额:', formatMoney(12345.67))
  console.log('格式化手机号:', formatPhone('13812345678'))

  // 测试验证函数
  console.log('验证手机号:', validatePhone('13812345678'))
  console.log('验证邮箱:', validateEmail('test@example.com'))

  // 测试常量
  console.log('客户生命周期阶段:', LIFECYCLE_STAGES)
  console.log('订单状态:', ORDER_STATUSES)
  console.log('默认分页大小:', DEFAULT_PAGE_SIZE)
  console.log('角色代码:', ROLE_CODES)

  // 测试类型（编译时检查）
  const customer: Customer = {
    id: 1,
    wechatId: 'test123',
    wechatNickname: '测试客户',
    salesId: 1,
    customerIntent: '高',
    createTime: '2025-01-10',
    updateTime: '2025-01-10',
  }

  const order: Order = {
    id: 1,
    orderNo: '20250110001',
    salesId: 1,
    courseName: '数学课程',
    paymentAmount: 1000,
    paymentTime: '2025-01-10',
    isNewStudent: true,
    orderStatus: '待上课',
    dataSource: '手工录入',
    commissionAmount: 100,
    createTime: '2025-01-10',
    updateTime: '2025-01-10',
  }

  console.log('测试客户:', customer)
  console.log('测试订单:', order)

  return {
    success: true,
    message: '@shared包导入测试成功！',
  }
}
