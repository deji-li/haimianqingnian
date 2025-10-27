<template>
  <div class="dashboard-container">
    <el-card class="welcome-card">
      <h2>欢迎使用教育培训CRM管理系统</h2>
      <p>当前登录用户：{{ userStore.userInfo?.realName }} ({{ userStore.userInfo?.roleName }})</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <el-icon class="icon" color="#FFB800"><User /></el-icon>
          <div>
            <p class="label">用户名</p>
            <p class="value">{{ userStore.userInfo?.username }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.departmentName">
          <el-icon class="icon" color="#FF9800"><OfficeBuilding /></el-icon>
          <div>
            <p class="label">所属部门</p>
            <p class="value">{{ userStore.userInfo.departmentName }}</p>
          </div>
        </div>
        <div class="info-item" v-if="userStore.userInfo?.campusName">
          <el-icon class="icon" color="#67C23A"><Location /></el-icon>
          <div>
            <p class="label">所属校区</p>
            <p class="value">{{ userStore.userInfo.campusName }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#FFB800"><TrendCharts /></el-icon>
            <div class="stat-info">
              <p class="stat-label">今日订单</p>
              <p class="stat-value">0</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><Wallet /></el-icon>
            <div class="stat-info">
              <p class="stat-label">本月业绩</p>
              <p class="stat-value">¥0</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF"><User /></el-icon>
            <div class="stat-info">
              <p class="stat-label">客户总数</p>
              <p class="stat-value">0</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="tips-card" style="margin-top: 20px;">
      <h3>系统说明</h3>
      <ul>
        <li>✅ 项目骨架已搭建完成</li>
        <li>✅ 用户认证功能已实现</li>
        <li>✅ 黄色主题已定制</li>
        <li>📝 后续将逐步开发CRM、订单、财务等功能模块</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
</script>

<style scoped lang="scss">
.dashboard-container {
  .welcome-card {
    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      font-size: 14px;
      color: #606266;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 32px;
        }

        .label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .value {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        font-size: 48px;
      }

      .stat-info {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .tips-card {
    h3 {
      font-size: 18px;
      color: #303133;
      margin-bottom: 15px;
    }

    ul {
      padding-left: 20px;

      li {
        font-size: 14px;
        color: #606266;
        line-height: 2;
      }
    }
  }
}
</style>
