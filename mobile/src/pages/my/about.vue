<template>
  <view class="about-page">
    <!-- Logo和名称 -->
    <view class="app-header">
      <view class="app-logo">
        <text class="logo-icon">🎓</text>
      </view>
      <text class="app-name">教育CRM系统</text>
      <text class="app-version">v{{ version }}</text>
      <text class="app-slogan">专业的教育培训客户管理系统</text>
    </view>

    <!-- 功能介绍 -->
    <view class="features-section">
      <view class="section-title">核心功能</view>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">👥</text>
          <view class="feature-content">
            <text class="feature-title">客户管理</text>
            <text class="feature-desc">全方位管理客户信息、跟进记录和生命周期</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">📋</text>
          <view class="feature-content">
            <text class="feature-title">订单管理</text>
            <text class="feature-desc">便捷的订单创建、跟踪和统计分析</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <view class="feature-content">
            <text class="feature-title">数据统计</text>
            <text class="feature-desc">实时数据分析，助力业绩提升</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">🤖</text>
          <view class="feature-content">
            <text class="feature-title">AI助手</text>
            <text class="feature-desc">智能客户创建、话术推荐、内容生成</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">🔐</text>
          <view class="feature-content">
            <text class="feature-title">权限管理</text>
            <text class="feature-desc">细粒度的四级权限控制体系</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">📱</text>
          <view class="feature-content">
            <text class="feature-title">移动办公</text>
            <text class="feature-desc">随时随地处理客户业务</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
      <view class="section-title">联系我们</view>
      <view class="contact-list">
        <view class="contact-item" @click="handleCall">
          <text class="contact-icon">📞</text>
          <view class="contact-content">
            <text class="contact-label">客服电话</text>
            <text class="contact-value">400-888-8888</text>
          </view>
          <text class="contact-arrow">></text>
        </view>

        <view class="contact-item" @click="handleEmail">
          <text class="contact-icon">✉️</text>
          <view class="contact-content">
            <text class="contact-label">商务合作</text>
            <text class="contact-value">service@example.com</text>
          </view>
          <text class="contact-arrow">></text>
        </view>

        <view class="contact-item" @click="handleWebsite">
          <text class="contact-icon">🌐</text>
          <view class="contact-content">
            <text class="contact-label">官方网站</text>
            <text class="contact-value">www.example.com</text>
          </view>
          <text class="contact-arrow">></text>
        </view>

        <view class="contact-item" @click="handleAddress">
          <text class="contact-icon">📍</text>
          <view class="contact-content">
            <text class="contact-label">公司地址</text>
            <text class="contact-value">北京市朝阳区创业大厦8层</text>
          </view>
          <text class="contact-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="info-section">
      <view class="info-item" @click="handlePrivacy">
        <text class="info-label">隐私政策</text>
        <text class="info-arrow">></text>
      </view>

      <view class="info-item" @click="handleTerms">
        <text class="info-label">服务条款</text>
        <text class="info-arrow">></text>
      </view>

      <view class="info-item" @click="handleCheckUpdate">
        <text class="info-label">检查更新</text>
        <view class="info-right">
          <text class="info-value">当前已是最新版本</text>
          <text class="info-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="copyright-section">
      <text class="copyright-text">© 2024 教育CRM系统</text>
      <text class="copyright-text">All Rights Reserved</text>
      <text class="copyright-text">京ICP备12345678号</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const version = ref('1.0.0')

/**
 * 拨打电话
 */
function handleCall() {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888'
  })
}

/**
 * 发送邮件
 */
function handleEmail() {
  uni.setClipboardData({
    data: 'service@example.com',
    success: () => {
      uni.showToast({
        title: '邮箱已复制',
        icon: 'success'
      })
    }
  })
}

/**
 * 打开网站
 */
function handleWebsite() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 查看地址
 */
function handleAddress() {
  uni.setClipboardData({
    data: '北京市朝阳区创业大厦8层',
    success: () => {
      uni.showToast({
        title: '地址已复制',
        icon: 'success'
      })
    }
  })
}

/**
 * 隐私政策
 */
function handlePrivacy() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 服务条款
 */
function handleTerms() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 检查更新
 */
function handleCheckUpdate() {
  uni.showLoading({ title: '检查中...' })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '已是最新版本',
      icon: 'success'
    })
  }, 1000)
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: 40rpx;
}

.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 60rpx;

  .app-logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);

    .logo-icon {
      font-size: 80rpx;
    }
  }

  .app-name {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 15rpx;
  }

  .app-version {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 20rpx;
  }

  .app-slogan {
    font-size: 26rpx;
    color: #666;
  }
}

.features-section {
  margin: 30rpx 30rpx 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
  }

  .feature-list {
    .feature-item {
      display: flex;
      align-items: flex-start;
      padding: 30rpx;
      background: #fff;
      border-radius: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

      .feature-icon {
        font-size: 48rpx;
        margin-right: 25rpx;
      }

      .feature-content {
        flex: 1;

        .feature-title {
          display: block;
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 10rpx;
        }

        .feature-desc {
          display: block;
          font-size: 26rpx;
          color: #999;
          line-height: 1.6;
        }
      }
    }
  }
}

.contact-section {
  margin: 30rpx 30rpx 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
  }

  .contact-list {
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .contact-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .contact-icon {
        font-size: 40rpx;
        margin-right: 25rpx;
      }

      .contact-content {
        flex: 1;

        .contact-label {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 8rpx;
        }

        .contact-value {
          display: block;
          font-size: 26rpx;
          color: #999;
        }
      }

      .contact-arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }
}

.info-section {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 30rpx;
      color: #333;
    }

    .info-right {
      display: flex;
      align-items: center;

      .info-value {
        font-size: 26rpx;
        color: #999;
        margin-right: 10rpx;
      }

      .info-arrow {
        font-size: 28rpx;
        color: #ccc;
      }
    }

    .info-arrow {
      font-size: 28rpx;
      color: #ccc;
    }
  }
}

.copyright-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;

  .copyright-text {
    font-size: 24rpx;
    color: #999;
    line-height: 2;
  }
}
</style>
