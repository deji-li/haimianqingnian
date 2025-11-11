<template>
  <view class="profile-page">
    <view class="form-container">
      <!-- 头像 -->
      <view class="form-item avatar-item">
        <text class="form-label">头像</text>
        <view class="avatar-upload" @click="chooseAvatar">
          <image class="avatar-image" :src="formData.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <text class="avatar-tip">点击更换</text>
        </view>
      </view>

      <!-- 真实姓名 -->
      <view class="form-item">
        <text class="form-label">真实姓名</text>
        <input class="form-input" v-model="formData.realName" placeholder="请输入真实姓名" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" type="number" v-model="formData.phone" placeholder="请输入手机号" />
      </view>

      <!-- 邮箱 -->
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input class="form-input" v-model="formData.email" placeholder="请输入邮箱" />
      </view>

      <!-- 用户名（只读） -->
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input class="form-input" :value="userInfo?.username" disabled />
      </view>

      <!-- 角色（只读） -->
      <view class="form-item">
        <text class="form-label">角色</text>
        <input class="form-input" :value="userInfo?.roleName" disabled />
      </view>

      <button class="submit-btn" type="primary" @click="handleSubmit" :loading="submitting">
        {{ submitting ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import type { UpdateProfileDto } from '@shared/types'
import { validatePhone, validateEmail } from '@shared/utils'
import { uploadImage } from '@/api/upload'
import { http } from '@/utils/request'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const formData = ref<UpdateProfileDto>({
  realName: userInfo.value?.realName || '',
  phone: userInfo.value?.phone || '',
  email: userInfo.value?.email || '',
  avatar: userInfo.value?.avatar || ''
})

const submitting = ref(false)

/**
 * 选择头像
 */
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      try {
        uni.showLoading({ title: '上传中...' })
        const result = await uploadImage(tempFilePath)
        formData.value.avatar = result.url

        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('上传头像失败:', error)
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

/**
 * 提交保存
 */
async function handleSubmit() {
  // 表单验证
  if (formData.value.phone && !validatePhone(formData.value.phone)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return
  }

  if (formData.value.email && !validateEmail(formData.value.email)) {
    uni.showToast({
      title: '邮箱格式不正确',
      icon: 'none'
    })
    return
  }

  try {
    submitting.value = true
    await http.put('/auth/profile', formData.value)

    // 更新本地用户信息
    await userStore.getUserInfo()

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.form-container {
  background: #fff;
  border-radius: 15rpx;
  padding: 30rpx;

  .form-item {
    margin-bottom: 40rpx;

    &.avatar-item {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 15rpx;
      font-weight: bold;
    }

    .form-input {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      padding: 0 20rpx;
      background: #f5f5f5;
      border-radius: 10rpx;
      font-size: 28rpx;
    }

    .avatar-upload {
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 100rpx;
        border: 4rpx solid #f0f0f0;
      }

      .avatar-tip {
        margin-top: 20rpx;
        font-size: 24rpx;
        color: #FFB800;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 90rpx;
    background: #FFB800;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}
</style>
