<template>
  <div class="profile-container">
    <!-- 顶部背景装饰 -->
    <div class="profile-bg-decoration"></div>

    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8">
        <el-card shadow="never" class="profile-info-card">
          <div class="profile-header">
            <div class="avatar-wrapper">
              <div class="avatar-ring"></div>
              <el-avatar :size="100" :src="avatarUrl" class="profile-avatar">
                {{ userInfo?.realName?.charAt(0) }}
              </el-avatar>
              <div class="avatar-upload-overlay" @click="handleAvatarClick">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                @change="handleAvatarChange"
                style="display: none"
              />
            </div>
            <h2 class="profile-name">{{ userInfo?.realName }}</h2>
            <p class="username">@{{ userInfo?.username }}</p>
            <el-tag :type="getRoleType(userInfo?.role)" class="role-tag" size="large">
              {{ userInfo?.roleName }}
            </el-tag>
          </div>

          <el-divider />

          <div class="info-list">
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span class="label">手机号:</span>
              <span class="value">{{ userInfo?.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span class="label">邮箱:</span>
              <span class="value">{{ userInfo?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span class="label">部门:</span>
              <span class="value">{{ userInfo?.departmentName || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span class="label">校区:</span>
              <span class="value">{{ userInfo?.campusName || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span class="label">加入时间:</span>
              <span class="value">{{ formatDate(userInfo?.createTime) }}</span>
            </div>
          </div>

          <el-divider />

          <!-- 个人统计卡片 -->
          <div class="stats-section">
            <h3 class="section-title">本月数据</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon order-icon">
                  <el-icon><DocumentCopy /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ monthlyStats.orderCount || 0 }}</div>
                  <div class="stat-label">订单数</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon revenue-icon">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatMoney(monthlyStats.revenue) }}</div>
                  <div class="stat-label">销售额</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon customer-icon">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ monthlyStats.customerCount || 0 }}</div>
                  <div class="stat-label">新增客户</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 成就徽章 -->
          <div class="achievements-section" v-if="achievements.length > 0">
            <el-divider />
            <h3 class="section-title">成就徽章</h3>
            <div class="badge-list">
              <div
                v-for="badge in achievements"
                :key="badge.id"
                class="achievement-badge"
                :class="badge.type"
              >
                <el-icon>{{ badge.icon }}</el-icon>
                <span>{{ badge.name }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧编辑表单 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>个人资料</span>
            </div>
          </template>

          <el-form :model="formData" label-width="100px">
            <el-form-item label="真实姓名">
              <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile" :loading="loading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码(至少6位)"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Camera, DocumentCopy, Money, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { updateProfile, changePassword } from '@/api/user'
import { uploadFile } from '@/api/upload'
import { getMonthlyStats, type MonthlyStats } from '@/api/dashboard'
import dayjs from 'dayjs'

const userStore = useUserStore()
const loading = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()
const avatarInputRef = ref<HTMLInputElement>()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const userInfo = computed(() => userStore.userInfo)

// 本月统计数据
const monthlyStats = reactive({
  orderCount: 0,
  revenue: 0,
  customerCount: 0,
})

// 成就徽章
const achievements = ref<any[]>([
  // 示例数据，实际应从后端获取
  // { id: 1, name: '本月之星', type: 'gold', icon: 'StarFilled' },
  // { id: 2, name: '签约达人', type: 'silver', icon: 'Medal' },
])

// 获取完整的头像URL
const avatarUrl = computed(() => {
  if (!userInfo.value?.avatar) return defaultAvatar
  // 如果是完整URL，直接返回
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar
  }
  // 如果是相对路径（/api开头），直接返回，让Vite代理处理
  return userInfo.value.avatar
})

const formData = reactive({
  realName: '',
  phone: '',
  email: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 获取角色类型
const getRoleType = (role?: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    sales_manager: 'warning',
    sales: 'primary',
    campus_manager: 'success',
    operator: 'info',
    finance: '',
  }
  return typeMap[role || ''] || 'info'
}

// 格式化日期
const formatDate = (date?: string | Date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化金额
const formatMoney = (amount?: number) => {
  if (!amount) return '¥0'
  return `¥${amount.toLocaleString()}`
}

// 获取本月统计数据
const fetchMonthlyStats = async () => {
  try {
    const response = await getMonthlyStats(userInfo.value?.id)
    Object.assign(monthlyStats, response)
  } catch (error) {
    console.error('Failed to fetch monthly stats:', error)

    // 降级到模拟数据
    monthlyStats.currentMonth = {
      customers: 15,
      orders: 23,
      revenue: 156800,
      followRecords: 89,
      conversionRate: 65.8
    }

    monthlyStats.trend = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().getFullYear(), new Date().getMonth(), i + 1).toISOString().split('T')[0],
      customers: Math.floor(Math.random() * 10) + 1,
      orders: Math.floor(Math.random() * 5) + 1,
      revenue: Math.floor(Math.random() * 10000) + 1000
    }))
  }
}

// 初始化表单数据
const initFormData = () => {
  if (userInfo.value) {
    formData.realName = userInfo.value.realName || ''
    formData.phone = userInfo.value.phone || ''
    formData.email = userInfo.value.email || ''
  }
}

// 更新个人资料
const handleUpdateProfile = async () => {
  loading.value = true
  try {
    await updateProfile({
      realName: formData.realName,
      phone: formData.phone,
      email: formData.email,
    })
    ElMessage.success('个人资料更新成功')
    // 刷新用户信息
    await userStore.getUserInfo()
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await changePassword(
          passwordForm.oldPassword,
          passwordForm.newPassword
        )
        ElMessage.success('密码修改成功，请重新登录')
        // 重置表单
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        // 3秒后退出登录
        setTimeout(() => {
          userStore.logout()
        }, 3000)
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 头像上传相关
const handleAvatarClick = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持JPG、PNG、GIF格式的图片')
    return
  }

  // 验证文件大小（限制2MB）
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  try {
    loading.value = true
    // 上传头像
    const result = await uploadFile(file, 'avatar')

    // 更新用户头像
    await updateProfile({
      avatar: result.url,
    })

    ElMessage.success('头像更新成功')
    // 刷新用户信息
    await userStore.getUserInfo()
  } catch (error: any) {
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    loading.value = false
    // 清空input值，允许重复上传同一文件
    if (target) {
      target.value = ''
    }
  }
}

onMounted(() => {
  initFormData()
  fetchMonthlyStats()
})
</script>

<style scoped lang="scss">
@import '@/styles/xiaohongshu-theme.scss';

.profile-container {
  position: relative;
  min-height: calc(100vh - 120px);
  padding-top: 20px;

  .profile-bg-decoration {
    position: absolute;
    top: -60px;
    left: -40px;
    right: -40px;
    height: 280px;
    background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
    border-radius: 0 0 50% 50% / 0 0 30% 30%;
    z-index: 0;
    opacity: 0.95;
  }

  :deep(.el-row) {
    position: relative;
    z-index: 1;
  }

  .profile-info-card {
    @include xhs-card;
    border: none;
    overflow: visible;

    :deep(.el-card__body) {
      padding: 32px 24px;
    }
  }

  .profile-header {
    text-align: center;
    padding: 20px 0 24px;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
      cursor: pointer;

      .avatar-ring {
        position: absolute;
        top: -5px;
        left: -5px;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFB800 0%, #FFC940 50%, #FFD666 100%);
        opacity: 0.3;
        animation: pulse 2s ease-in-out infinite;
        z-index: 0;
      }

      .profile-avatar {
        position: relative;
        z-index: 1;
        border: 4px solid #fff;
        box-shadow: 0 8px 16px rgba(255, 184, 0, 0.2);
        font-size: 36px;
        font-weight: bold;
        background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
        color: white;
      }

      .avatar-upload-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
        color: white;
        font-size: 12px;
        z-index: 2;
        backdrop-filter: blur(4px);

        .el-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
      }

      &:hover .avatar-upload-overlay {
        opacity: 1;
      }
    }

    .profile-name {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 600;
      color: var(--xhs-text-primary);
      background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .username {
      margin-bottom: 16px;
      color: var(--xhs-text-secondary);
      font-size: 14px;
      font-weight: 500;
    }

    .role-tag {
      font-weight: 500;
      padding: 8px 20px;
      border-radius: 20px;
      border: none;
      background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
      color: white;
      font-size: 14px;
    }
  }

  .info-list {
    margin-top: 8px;

    .info-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--xhs-border-color);
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        padding-left: 8px;
        background: linear-gradient(90deg, rgba(255, 184, 0, 0.05) 0%, transparent 100%);
        border-radius: 8px;
      }

      .el-icon {
        font-size: 20px;
        color: var(--xhs-primary);
        margin-right: 12px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .label {
        color: var(--xhs-text-secondary);
        margin-right: 12px;
        min-width: 70px;
        font-size: 14px;
        font-weight: 500;
      }

      .value {
        color: var(--xhs-text-primary);
        flex: 1;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  // 统计数据部分
  .stats-section {
    margin-top: 12px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--xhs-text-primary);
      margin: 0 0 16px;
      padding-left: 12px;
      border-left: 4px solid var(--xhs-primary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;

      .stat-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background: linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, rgba(255, 201, 64, 0.05) 100%);
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 184, 0, 0.15);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.order-icon {
            background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
          }

          &.revenue-icon {
            background: linear-gradient(135deg, #FAAD14 0%, #FFD666 100%);
          }

          &.customer-icon {
            background: linear-gradient(135deg, #FFA940 0%, #FADB14 100%);
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--xhs-text-primary);
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 13px;
            color: var(--xhs-text-secondary);
            font-weight: 500;
          }
        }
      }
    }
  }

  // 成就徽章部分
  .achievements-section {
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--xhs-text-primary);
      margin: 16px 0;
      padding-left: 12px;
      border-left: 4px solid var(--xhs-primary);
    }

    .badge-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .achievement-badge {
        display: inline-flex;
        align-items: center;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        color: white;
        background: linear-gradient(135deg, #FFB800 0%, #FFC940 100%);
        box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3);

        &.gold {
          background: linear-gradient(135deg, #FADB14 0%, #FFB800 100%);
        }

        &.silver {
          background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
        }

        .el-icon {
          margin-right: 6px;
          font-size: 16px;
        }
      }
    }
  }

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--xhs-text-primary);
  }

  // 右侧表单卡片样式
  :deep(.el-col:last-child) {
    .el-card {
      @include xhs-card;
      border: none;
      margin-bottom: 20px;

      .el-card__header {
        border-bottom: 2px solid var(--xhs-border-color);
        padding: 20px 24px;
      }

      .el-card__body {
        padding: 32px 24px;
      }

      .el-form-item {
        margin-bottom: 24px;

        .el-input {
          @include xhs-input;
        }

        .el-button--primary {
          @include xhs-button-primary;
          padding: 12px 32px;
          font-weight: 500;
        }
      }
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
}
</style>
