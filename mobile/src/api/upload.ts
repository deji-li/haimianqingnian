/**
 * 上传相关API
 */
import { http } from '@/utils/request'

/**
 * 上传图片
 */
export function uploadImage(filePath: string): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'http://localhost:3000/api/upload/image',
      filePath,
      name: 'file',
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200 || data.data) {
            resolve({ url: data.data.url || data.data })
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}

/**
 * 上传文件
 */
export function uploadFile(filePath: string): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'http://localhost:3000/api/upload/file',
      filePath,
      name: 'file',
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200 || data.data) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}
