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
    redirect: '/workspace',
    children: [
      {
        path: 'workspace',
        name: 'Workspace',
        component: () => import('@/views/workspace/Index.vue'),
        meta: {
          title: '工作台',
          icon: 'Monitor',
        },
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '数据看板',
          icon: 'DataLine',
          permissions: ['dashboard:view'],
        },
      },
      {
        path: 'crm-stats',
        name: 'CRMStats',
        component: () => import('@/views/crm/PersonalStats.vue'),
        meta: {
          title: 'CRM统计',
          icon: 'DataAnalysis',
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          hidden: true,
        },
      },
      {
        path: 'notification',
        name: 'Notification',
        component: () => import('@/views/notification/Index.vue'),
        meta: {
          title: '消息中心',
          icon: 'Bell',
          hidden: true,
        },
      },
      {
        path: 'customer',
        name: 'Customer',
        redirect: '/customer/list',
        meta: {
          title: '客户管理',
          icon: 'User',
          permissions: ['customer:view'],
        },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/List.vue'),
            meta: {
              title: '客户列表',
              permissions: ['customer:view'],
            },
          },
          {
            path: 'lifecycle-board',
            name: 'CustomerLifecycleBoard',
            component: () => import('@/views/customer/LifecycleBoard.vue'),
            meta: {
              title: '生命周期看板',
              permissions: ['customer:view'],
            },
          },
          {
            path: 'detail/:id',
            name: 'CustomerDetail',
            component: () => import('@/views/customer/Detail.vue'),
            meta: {
              title: '客户详情',
              hidden: true,
              permissions: ['customer:view'],
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
          permissions: ['order:view'],
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
      {
        path: 'analytics',
        name: 'Analytics',
        redirect: '/analytics/funnel',
        meta: {
          title: '数据分析',
          icon: 'TrendCharts',
        },
        children: [
          {
            path: 'funnel',
            name: 'AnalyticsFunnel',
            component: () => import('@/views/analytics/SalesFunnel.vue'),
            meta: {
              title: '销售漏斗',
            },
          },
          {
            path: 'advanced',
            name: 'AnalyticsAdvanced',
            component: () => import('@/views/analytics/AdvancedAnalytics.vue'),
            meta: {
              title: '高级分析',
            },
          },
        ],
      },
      {
        path: 'ai',
        name: 'AI',
        redirect: '/ai/chat-analysis',
        meta: {
          title: 'AI智能助手',
          icon: 'MagicStick',
        },
        children: [
          {
            path: 'chat-analysis',
            name: 'AIChatAnalysis',
            component: () => import('@/views/ai/ChatAnalysis.vue'),
            meta: {
              title: 'AI聊天记录分析',
              permissions: ['ai-chat:view'],
            },
          },
          {
            path: 'knowledge',
            name: 'AIKnowledge',
            component: () => import('@/views/ai/Knowledge.vue'),
            meta: {
              title: 'AI知识库',
              permissions: ['ai-knowledge:view'],
            },
          },
          {
            path: 'tools',
            name: 'AITools',
            component: () => import('@/views/ai/ToolCenter.vue'),
            meta: {
              title: 'AI工具中心',
              permissions: ['ai-tools:view'],
            },
          },
          {
            path: 'marketing',
            name: 'AIMarketing',
            component: () => import('@/views/ai/MarketingAssistant.vue'),
            meta: {
              title: 'AI营销助手',
              permissions: ['ai-marketing:use'],
            },
          },
          {
            path: 'analytics',
            name: 'AIAnalytics',
            component: () => import('@/views/ai/AIAnalytics.vue'),
            meta: {
              title: 'AI人效分析',
              permissions: ['ai-analytics:view'],
            },
          },
          {
            path: 'reports',
            name: 'AIReports',
            component: () => import('@/views/ai/AIReports.vue'),
            meta: {
              title: 'AI诊断报告',
              permissions: ['ai:report:view'],
            },
          },
        ],
      },
      {
        path: 'team-leaderboard',
        name: 'TeamLeaderboard',
        component: () => import('@/views/team/Leaderboard.vue'),
        meta: {
          title: '团队排行榜',
          icon: 'trophy',
        },
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/Overview.vue'),
        meta: {
          title: '财务统计',
          icon: 'Wallet',
        },
      },
      {
        path: 'commission',
        name: 'Commission',
        redirect: '/commission/list',
        meta: {
          title: '提成管理',
          icon: 'Money',
        },
        children: [
          {
            path: 'list',
            name: 'CommissionList',
            component: () => import('@/views/commission/List.vue'),
            meta: {
              title: '我的提成',
            },
          },
          {
            path: 'schemes',
            name: 'CommissionSchemes',
            component: () => import('@/views/commission/SchemeConfig.vue'),
            meta: {
              title: '提成方案配置',
              permissions: ['commission:manage'],
            },
          },
        ],
      },
      {
        path: 'target-management',
        name: 'TargetManagement',
        component: () => import('@/views/target/Management.vue'),
        meta: {
          title: '销售目标管理',
          icon: 'Flag',
        },
      },
      {
        path: 'okr',
        name: 'OKR',
        redirect: '/okr/list',
        meta: {
          title: 'OKR管理',
          icon: 'TrendCharts',
        },
        children: [
          {
            path: 'list',
            name: 'OKRList',
            component: () => import('@/views/okr/List.vue'),
            meta: {
              title: 'OKR列表',
            },
          },
          {
            path: 'detail/:id',
            name: 'OKRDetail',
            component: () => import('@/views/okr/Detail.vue'),
            meta: {
              title: 'OKR详情',
              hidden: true,
            },
          },
        ],
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: {
          title: '系统管理',
          icon: 'Setting',
        },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/User.vue'),
            meta: {
              title: '用户管理',
            },
          },
          {
            path: 'department',
            name: 'SystemDepartment',
            component: () => import('@/views/system/Department.vue'),
            meta: {
              title: '部门管理',
            },
          },
          {
            path: 'campus',
            name: 'SystemCampus',
            component: () => import('@/views/system/Campus.vue'),
            meta: {
              title: '校区管理',
            },
          },
          {
            path: 'dictionary',
            name: 'SystemDictionary',
            component: () => import('@/views/system/Dictionary.vue'),
            meta: {
              title: '字典管理',
            },
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/Role.vue'),
            meta: {
              title: '角色权限',
            },
          },
          {
            path: 'operation-log',
            name: 'SystemOperationLog',
            component: () => import('@/views/system/OperationLog.vue'),
            meta: {
              title: '操作日志',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/datascreen',
    name: 'DataScreen',
    component: () => import('@/views/datascreen/Index.vue'),
    meta: {
      title: '数据大屏',
      requiresAuth: true,
    },
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

  // 检查路由权限
  const permissions = to.meta.permissions as string[] | undefined
  if (permissions && permissions.length > 0) {
    // 检查用户是否拥有任一权限即可访问
    const hasPermission = userStore.hasAnyPermission(permissions)
    if (!hasPermission) {
      // 无权限，显示403或返回首页
      console.warn(`无权限访问: ${to.path}, 需要权限: ${permissions.join(', ')}`)
      // 可以导航到403页面或返回首页
      next('/workspace')
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
