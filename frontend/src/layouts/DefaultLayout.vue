<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="layout-aside">
      <div class="logo">
        <h2>教育CRM</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="aside-menu"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-sub-menu index="/customer">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customer/list">客户列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/order">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order/list">订单列表</el-menu-item>
          <el-menu-item index="/order/dashboard">订单看板</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <span class="breadcrumb">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo?.realName || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title as string || '首页')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
    })
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
  }

  .aside-menu {
    border-right: none;
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;

  .header-left {
    .breadcrumb {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      span {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
