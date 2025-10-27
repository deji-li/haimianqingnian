import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'DataLine',
        },
      },
      {
        path: 'customer',
        name: 'Customer',
        redirect: '/customer/list',
        meta: {
          title: '客户管理',
          icon: 'User',
        },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/List.vue'),
            meta: {
              title: '客户列表',
            },
          },
          {
            path: 'detail/:id',
            name: 'CustomerDetail',
            component: () => import('@/views/customer/Detail.vue'),
            meta: {
              title: '客户详情',
              hidden: true,
            },
          },
        ],
      },
      {
        path: 'order',
        name: 'Order',
        redirect: '/order/list',
        meta: {
          title: '订单管理',
          icon: 'Document',
        },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/order/List.vue'),
            meta: {
              title: '订单列表',
            },
          },
          {
            path: 'dashboard',
            name: 'OrderDashboard',
            component: () => import('@/views/order/Dashboard.vue'),
            meta: {
              title: '订单看板',
            },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const token = userStore.token

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 教育培训CRM`
  }

  // 登录页面
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 需要认证的页面
  if (!token) {
    next('/login')
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
