<template>
  <view class="image-uploader">
    <view class="upload-list">
      <!-- 已上传的图片 -->
      <view
        v-for="(image, index) in imageList"
        :key="index"
        class="upload-item"
      >
        <image class="upload-image" :src="image" mode="aspectFill" @click="previewImage(index)" />
        <view class="delete-btn" @click="deleteImage(index)">
          <text>×</text>
        </view>
      </view>

      <!-- 上传按钮 -->
      <view v-if="imageList.length < maxCount" class="upload-btn" @click="chooseImage">
        <text class="upload-icon">+</text>
        <text class="upload-text">上传图片</text>
      </view>
    </view>

    <view v-if="tip" class="upload-tip">
      <text>{{ tip }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string[]
  maxCount?: number
  maxSize?: number
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 9,
  maxSize: 10, // MB
  tip: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const imageList = ref<string[]>([...props.modelValue])

watch(
  () => props.modelValue,
  (newVal) => {
    imageList.value = [...newVal]
  }
)

/**
 * 选择图片
 */
function chooseImage() {
  uni.chooseImage({
    count: props.maxCount - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePaths = res.tempFilePaths

      // 检查文件大小
      for (const filePath of tempFilePaths) {
        uni.getFileInfo({
          filePath,
          success: (fileInfo) => {
            const sizeMB = fileInfo.size / 1024 / 1024
            if (sizeMB > props.maxSize) {
              uni.showToast({
                title: `图片大小不能超过${props.maxSize}MB`,
                icon: 'none'
              })
              return
            }

            // 上传图片
            uploadImage(filePath)
          }
        })
      }
    }
  })
}

/**
 * 上传图片到服务器
 */
function uploadImage(filePath: string) {
  uni.showLoading({
    title: '上传中...',
    mask: true
  })

  uni.uploadFile({
    url: 'http://localhost:3000/api/upload/image', // 替换为实际的上传接口
    filePath,
    name: 'file',
    success: (uploadRes) => {
      try {
        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 || data.data) {
          const imageUrl = data.data.url || data.data
          imageList.value.push(imageUrl)
          emit('update:modelValue', imageList.value)

          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } else {
          throw new Error(data.message || '上传失败')
        }
      } catch (error: any) {
        console.error('上传失败:', error)
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
      }
    },
    fail: (error) => {
      console.error('上传失败:', error)
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    },
    complete: () => {
      uni.hideLoading()
    }
  })
}

/**
 * 删除图片
 */
function deleteImage(index: number) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        imageList.value.splice(index, 1)
        emit('update:modelValue', imageList.value)
      }
    }
  })
}

/**
 * 预览图片
 */
function previewImage(index: number) {
  uni.previewImage({
    urls: imageList.value,
    current: index
  })
}
</script>

<style lang="scss" scoped>
.image-uploader {
  .upload-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .upload-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;

      .upload-image {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
      }

      .delete-btn {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        width: 50rpx;
        height: 50rpx;
        background: #ef4444;
        border-radius: 25rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          color: #fff;
          font-size: 40rpx;
          line-height: 1;
        }
      }
    }

    .upload-btn {
      width: 200rpx;
      height: 200rpx;
      border: 2rpx dashed #ddd;
      border-radius: 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;

      .upload-icon {
        font-size: 80rpx;
        color: #999;
        line-height: 1;
      }

      .upload-text {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .upload-tip {
    margin-top: 20rpx;
    font-size: 24rpx;
    color: #999;
  }
}
</style>
