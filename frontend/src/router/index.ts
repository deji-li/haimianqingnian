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
      // 工作台
      {
        path: 'workspace',
        name: 'Workspace',
        component: () => import('@/views/workspace/Index.vue'),
        meta: {
          title: '工作台',
          icon: 'Monitor',
        },
      },
      // 个人中心（隐藏菜单）
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
      // 消息中心（隐藏菜单）
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

      // ========== 客户管理 ==========
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

      // ========== 订单管理 ==========
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
              permissions: ['order:view'],
            },
          },
          {
            path: 'sync-config',
            name: 'OrderSyncConfig',
            component: () => import('@/views/order/SyncConfig.vue'),
            meta: {
              title: '订单同步',
              permissions: ['order:sync'],
            },
          },
          {
            path: 'campus-ranking',
            name: 'OrderCampusRanking',
            component: () => import('@/views/order/CampusRanking.vue'),
            meta: {
              title: '校区排行榜',
              permissions: ['order:view'],
            },
          },
        ],
      },

      // ========== AI工具 ==========
      {
        path: 'ai',
        name: 'AI',
        redirect: '/ai/chat-analysis',
        meta: {
          title: 'AI工具',
          icon: 'MagicStick',
        },
        children: [
          {
            path: 'chat-analysis',
            name: 'ChatAnalysis',
            component: () => import('@/views/ai/ChatAnalysis.vue'),
            meta: {
              title: '聊天分析',
            },
          },
          {
            path: 'marketing-scenarios',
            name: 'MarketingScenarios',
            component: () => import('@/views/ai/MarketingScenarios.vue'),
            meta: {
              title: 'AI营销场景',
            },
          },
          {
            path: 'marketing-content-library',
            name: 'MarketingContentLibrary',
            component: () => import('@/views/ai/MarketingContentLibrary.vue'),
            meta: {
              title: '营销文案库',
            },
          },
          {
            path: 'analytics',
            name: 'AIAnalytics',
            component: () => import('@/views/ai/AIAnalytics.vue'),
            meta: {
              title: 'AI人效分析',
            },
          },
          {
            path: 'reports',
            name: 'AIReports',
            component: () => import('@/views/ai/AIReports.vue'),
            meta: {
              title: 'AI诊断报告',
            },
          },
          {
            path: 'config',
            name: 'AIConfig',
            component: () => import('@/views/system/AiConfig.vue'),
            meta: {
              title: 'AI配置',
            },
          },
        ],
      },

      // ========== 销售工具 ==========
      {
        path: 'sales-tools',
        name: 'SalesTools',
        redirect: '/sales-tools/knowledge',
        meta: {
          title: '销售工具',
          icon: 'Briefcase',
        },
        children: [
          {
            path: 'knowledge',
            name: 'Knowledge',
            component: () => import('@/views/ai/Knowledge.vue'),
            meta: {
              title: '话术库',
            },
          },
          {
            path: 'recovery',
            name: 'CustomerRecovery',
            component: () => import('@/views/ai/MarketingAssistant.vue'),
            meta: {
              title: '客户复苏',
            },
          },
          {
            path: 'tags',
            name: 'TagManagement',
            component: () => import('@/views/ai/TagManagement.vue'),
            meta: {
              title: '标签管理',
            },
          },
        ],
      },

      // ========== 数据分析 ==========
      {
        path: 'analytics',
        name: 'Analytics',
        redirect: '/analytics/dashboard',
        meta: {
          title: '数据分析',
          icon: 'TrendCharts',
        },
        children: [
          {
            path: 'dashboard',
            name: 'AnalyticsDashboard',
            component: () => import('@/views/dashboard/Index.vue'),
            meta: {
              title: '数据看板',
            },
          },
          {
            path: 'personal',
            name: 'PersonalStats',
            component: () => import('@/views/crm/PersonalStats.vue'),
            meta: {
              title: '个人统计',
            },
          },
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
          {
            path: 'leaderboard',
            name: 'TeamLeaderboard',
            component: () => import('@/views/team/Leaderboard.vue'),
            meta: {
              title: '团队排行榜',
            },
          },
        ],
      },

      // ========== 财务提成（整合财务和提成） ==========
      {
        path: 'finance',
        name: 'Finance',
        redirect: '/finance/statistics',
        meta: {
          title: '财务提成',
          icon: 'Money',
        },
        children: [
          {
            path: 'statistics',
            name: 'FinanceStatistics',
            component: () => import('@/views/finance/Overview.vue'),
            meta: {
              title: '财务统计',
            },
          },
          {
            path: 'commission-records',
            name: 'CommissionRecords',
            component: () => import('@/views/commission/List.vue'),
            meta: {
              title: '提成记录',
            },
          },
          {
            path: 'commission-schemes',
            name: 'CommissionSchemes',
            component: () => import('@/views/commission/SchemeConfig.vue'),
            meta: {
              title: '提成方案',
              permissions: ['commission:manage'],
            },
          },
        ],
      },

      // ========== 目标管理 ==========
      {
        path: 'target',
        name: 'Target',
        component: () => import('@/views/target/Management.vue'),
        meta: {
          title: '目标管理',
          icon: 'Flag',
        },
      },

      // ========== 运营管理 ==========
      {
        path: 'operation',
        name: 'Operation',
        redirect: '/operation/daily-reports',
        meta: {
          title: '运营管理',
          icon: 'DataLine',
        },
        children: [
          {
            path: 'daily-reports',
            name: 'OperationDailyReports',
            component: () => import('@/views/operation/DailyReportList.vue'),
            meta: {
              title: '运营日报',
            },
          },
        ],
      },

      // ========== 自动化管理 ==========
      {
        path: 'automation',
        name: 'Automation',
        component: () => import('@/views/automation/RuleManagement.vue'),
        meta: {
          title: '自动化工作流',
          icon: 'Operation',
        },
      },

      // ========== 系统管理 ==========
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
          {
            path: 'business-config',
            name: 'SystemBusinessConfig',
            component: () => import('@/views/system/BusinessConfig.vue'),
            meta: {
              title: '业务配置',
            },
          },
        ],
      },
    ],
  },
  // 数据大屏（独立页面）
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
