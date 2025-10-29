import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * 权限指令
 * @example
 * <el-button v-permission="'customer:create'">创建客户</el-button>
 * <el-button v-permission="['customer:create', 'customer:update']">编辑</el-button>
 * <el-button v-permission:any="['customer:view', 'order:view']">查看</el-button>
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg } = binding
    const userStore = useUserStore()

    if (!value) {
      return
    }

    let hasPermission = false

    if (arg === 'any') {
      // v-permission:any 表示拥有任一权限即可
      const permissions = Array.isArray(value) ? value : [value]
      hasPermission = userStore.hasAnyPermission(permissions)
    } else {
      // v-permission 表示需要拥有所有权限
      hasPermission = userStore.hasPermission(value)
    }

    if (!hasPermission) {
      // 没有权限，移除元素
      el.parentNode?.removeChild(el)
    }
  },
}

export default permission
