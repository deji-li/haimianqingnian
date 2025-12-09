<template>
  <view class="system-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">系统管理</text>
      <text class="header-subtitle">管理系统用户、角色和权限</text>
    </view>

    <!-- 管理菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <text class="group-title">用户与权限</text>

        <view class="menu-item" @click="navigateTo('/pages/system/users')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <text>👥</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">用户管理</text>
              <text class="menu-desc">管理系统用户账号</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/system/roles')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <text>🎭</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">角色管理</text>
              <text class="menu-desc">配置角色及权限</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/system/permissions')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);">
              <text>🔐</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">权限管理</text>
              <text class="menu-desc">查看系统权限配置</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <text class="group-title">组织架构</text>

        <view class="menu-item" @click="navigateTo('/pages/system/departments')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <text>🏢</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">部门管理</text>
              <text class="menu-desc">管理组织部门结构</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/system/campuses')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <text>🏫</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">校区管理</text>
              <text class="menu-desc">管理校区信息</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <text class="group-title">系统配置</text>

        <view class="menu-item" @click="navigateTo('/pages/system/wework-config')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <text>💼</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">企业微信配置</text>
              <text class="menu-desc">配置企业微信集成参数</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/system/ai-config')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <text>🤖</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">AI配置</text>
              <text class="menu-desc">管理AI模型配置</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/system/logs')">
          <view class="menu-left">
            <view class="menu-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
              <text>📝</text>
            </view>
            <view class="menu-info">
              <text class="menu-title">操作日志</text>
              <text class="menu-desc">查看系统操作记录</text>
            </view>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function navigateTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.system-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 30rpx 60rpx;
  color: #fff;

  .header-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 15rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.menu-section {
  padding: 0 20rpx;
  padding-bottom: 40rpx;

  .menu-group {
    margin-top: 30rpx;

    .group-title {
      display: block;
      font-size: 28rpx;
      color: #999;
      padding: 0 10rpx 15rpx;
    }

    .menu-item {
      background: #fff;
      border-radius: 15rpx;
      padding: 30rpx;
      margin-bottom: 15rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

      .menu-left {
        display: flex;
        align-items: center;
        flex: 1;

        .menu-icon {
          width: 100rpx;
          height: 100rpx;
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50rpx;
          margin-right: 25rpx;
        }

        .menu-info {
          flex: 1;

          .menu-title {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 10rpx;
          }

          .menu-desc {
            display: block;
            font-size: 24rpx;
            color: #999;
          }
        }
      }

      .menu-arrow {
        font-size: 32rpx;
        color: #ccc;
      }
    }
  }
}
</style>
