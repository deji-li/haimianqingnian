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
            path: 'lifecycle-board',
            name: 'CustomerLifecycleBoard',
            component: () => import('@/views/customer/LifecycleBoard.vue'),
            meta: {
              title: '生命周期看板',
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

      // ========== 订单管理 ==========
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
            path: 'sync-config',
            name: 'OrderSyncConfig',
            component: () => import('@/views/order/SyncConfig.vue'),
            meta: {
              title: '订单同步',
            },
          },
          {
            path: 'campus-ranking',
            name: 'OrderCampusRanking',
            component: () => import('@/views/order/CampusRanking.vue'),
            meta: {
              title: '校区排行榜',
            },
          },
          {
            path: 'order-ranking',
            name: 'OrderRanking',
            component: () => import('@/views/order/Ranking.vue'),
            meta: {
              title: '订单排行榜',
            },
          },
          {
            path: 'sales-ranking',
            name: 'SalesRanking',
            component: () => import('@/views/team/Leaderboard.vue'),
            meta: {
              title: '销售排行榜',
            },
          },
          {
            path: 'ranking-overview',
            name: 'RankingOverview',
            component: () => import('@/views/ranking/Overview.vue'),
            meta: {
              title: '排行榜总览',
            },
          },
          {
            path: 'detail/:id',
            name: 'OrderDetail',
            component: () => import('@/views/order/Detail.vue'),
            meta: {
              title: '订单详情',
              hidden: true,
            },
          },
        ],
      },

      // ========== 老师管理 ==========
      {
        path: 'teacher',
        name: 'Teacher',
        redirect: '/teacher/list',
        meta: {
          title: '老师管理',
          icon: 'User',
        },
        children: [
          {
            path: 'list',
            name: 'TeacherList',
            component: () => import('@/views/teacher/List.vue'),
            meta: {
              title: '老师列表',
            },
          },
          {
            path: 'ranking',
            name: 'TeacherRanking',
            component: () => import('@/views/teacher/Ranking.vue'),
            meta: {
              title: '老师排行榜',
            },
          },
          {
            path: 'detail/:id',
            name: 'TeacherDetail',
            component: () => import('@/views/teacher/Detail.vue'),
            meta: {
              title: '老师详情',
            },
          },
        ],
      },

      // ========== 销售工具（整合AI功能） ==========
      {
        path: 'sales-tools',
        name: 'SalesTools',
        redirect: '/sales-tools/chat-analysis',
        meta: {
          title: '销售工具',
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
            path: 'tools',
            name: 'AITools',
            component: () => import('@/views/ai/ToolCenter.vue'),
            meta: {
              title: 'AI工具',
            },
          },
          {
            path: 'ocr',
            name: 'OCRTool',
            component: () => import('@/views/ai/OCRTool.vue'),
            meta: {
              title: 'OCR识别',
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
          {
            path: 'marketing-scenarios',
            name: 'MarketingScenarios',
            component: () => import('@/views/ai/MarketingScenarios.vue'),
            meta: {
              title: 'AI营销场景',
            },
          },
        ],
      },

      // ========== 企业知识库 ==========
      {
        path: 'enterprise-knowledge',
        name: 'EnterpriseKnowledge',
        redirect: '/ai/enterprise-knowledge/management',
        meta: {
          title: '企业知识库',
          icon: 'Reading',
        },
        children: [
          {
            path: 'management',
            name: 'EnterpriseKnowledgeManagement',
            component: () => import('@/views/enterprise-knowledge/Management.vue'),
            meta: {
              title: '知识库管理',
            },
          },
          {
            path: 'create',
            name: 'EnterpriseKnowledgeCreate',
            component: () => import('@/views/enterprise-knowledge/Create.vue'),
            meta: {
              title: '创建知识库',
              hidden: true,
            },
          },
          {
            path: 'mining',
            name: 'EnterpriseKnowledgeMining',
            component: () => import('@/views/enterprise-knowledge/Mining.vue'),
            meta: {
              title: '知识挖掘',
            },
          },
          {
            path: 'analytics',
            name: 'EnterpriseKnowledgeAnalytics',
            component: () => import('@/views/enterprise-knowledge/Analytics.vue'),
            meta: {
              title: '知识分析',
            },
          },
        ],
      },

      // ========== AI营销 ==========
      {
        path: 'ai-marketing',
        name: 'AIMarketing',
        redirect: '/ai-marketing/assistant',
        meta: {
          title: 'AI营销',
          icon: 'MagicStick',
        },
        children: [
          {
            path: 'assistant',
            name: 'AIMarketingAssistant',
            component: () => import('@/views/ai/MarketingAssistant.vue'),
            meta: {
              title: 'AI营销助手',
            },
          },
          {
            path: 'content-library',
            name: 'MarketingContentLibrary',
            component: () => import('@/views/ai/MarketingContentLibrary.vue'),
            meta: {
              title: '营销文案库',
            },
          },
        ],
      },

      // ========== 知识库系统 ==========
      {
        path: 'knowledge',
        name: 'Knowledge',
        redirect: '/knowledge/init',
        meta: {
          title: '知识库系统',
          icon: 'Reading',
        },
        children: [
          {
            path: 'init',
            name: 'KnowledgeInit',
            component: () => import('@/views/knowledge/Init.vue'),
            meta: {
              title: '初始化向导',
            },
          },
          {
            path: 'list',
            name: 'KnowledgeList',
            component: () => import('@/views/knowledge/List.vue'),
            meta: {
              title: '知识管理',
            },
          },
          {
            path: 'search',
            name: 'KnowledgeSearch',
            component: () => import('@/views/knowledge/Search.vue'),
            meta: {
              title: '智能搜索',
            },
          },
          {
            path: 'mining',
            name: 'KnowledgeMining',
            component: () => import('@/views/knowledge/Mining.vue'),
            meta: {
              title: 'AI知识挖掘',
            },
          },
          {
            path: 'feedback',
            name: 'KnowledgeFeedback',
            component: () => import('@/views/knowledge/Feedback.vue'),
            meta: {
              title: '负反馈管理',
            },
          },
          {
            path: 'statistics',
            name: 'KnowledgeStatistics',
            component: () => import('@/views/knowledge/Statistics.vue'),
            meta: {
              title: '使用统计',
            },
          },
        ],
      },

      // ========== 数据分析（整合所有分析功能） ==========
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
          {
            path: 'team-statistics',
            name: 'TeamStatistics',
            component: () => import('@/views/team/TeamStatistics.vue'),
            meta: {
              title: '团队统计',
            },
          },
          {
            path: 'ai-analytics',
            name: 'AIAnalytics',
            component: () => import('@/views/ai/AIAnalytics.vue'),
            meta: {
              title: 'AI人效分析',
            },
          },
          {
            path: 'ai-reports',
            name: 'AIReports',
            component: () => import('@/views/ai/AIReports.vue'),
            meta: {
              title: 'AI诊断报告',
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
          {
            path: 'accounts',
            name: 'OperationAccounts',
            component: () => import('@/views/operation/AccountManagement.vue'),
            meta: {
              title: '账号管理',
            },
          },
          {
            path: 'commissions',
            name: 'OperationCommissions',
            component: () => import('@/views/operation/CommissionManagement.vue'),
            meta: {
              title: '提成管理',
            },
          },
          {
            path: 'dashboard',
            name: 'OperationDashboard',
            component: () => import('@/views/operation/DataDashboard.vue'),
            meta: {
              title: '数据看板',
            },
          },
          {
            path: 'customers',
            name: 'OperationCustomers',
            component: () => import('@/views/operation/CustomerConversion.vue'),
            meta: {
              title: '客户转化',
            },
          },
          {
            path: 'reports',
            name: 'OperationReports',
            component: () => import('@/views/operation/ReportCenter.vue'),
            meta: {
              title: '报表中心',
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
            path: 'ai-config',
            name: 'SystemAiConfig',
            component: () => import('@/views/system/AiConfig.vue'),
            meta: {
              title: 'AI配置管理',
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
          {
            path: 'ai-api-keys',
            name: 'SystemAiApiKeys',
            component: () => import('@/views/system/AiApiKeyManagement.vue'),
            meta: {
              title: 'AI API密钥',
            },
          },
          {
            path: 'wework-config',
            name: 'WeWorkConfig',
            component: () => import('@/views/wework/Config.vue'),
            meta: {
              title: '企业微信配置',
            },
          },
          {
            path: 'wework-contacts',
            name: 'WeWorkContacts',
            component: () => import('@/views/wework/ContactManagement.vue'),
            meta: {
              title: '联系人管理',
            },
          },
          {
            path: 'wework-contact/:id',
            name: 'WeWorkContactDetail',
            component: () => import('@/views/wework/ContactDetail.vue'),
            meta: {
              title: '联系人详情',
              hidden: true,
            },
          },
          {
            path: 'wework-sync-logs',
            name: 'WeWorkSyncLogs',
            component: () => import('@/views/wework/SyncLogs.vue'),
            meta: {
              title: '同步日志',
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
