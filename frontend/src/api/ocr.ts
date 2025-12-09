import request from '@/utils/request'

// OCR相关API
export const ocrApi = {
  // 验证百度OCR配置
  validateConfig() {
    return request({
      url: '/api/ai-tools/baidu-ocr/config/validate',
      method: 'get',
    })
  },

  // 高精度OCR识别
  recognizeText(file: File, options?: any) {
    const formData = new FormData()
    formData.append('file', file)

    if (options) {
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) {
          formData.append(key, options[key])
        }
      })
    }

    return request({
      url: '/api/ai-tools/baidu-ocr/recognize',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 标准OCR识别
  recognizeTextBasic(file: File, options?: any) {
    const formData = new FormData()
    formData.append('file', file)

    if (options) {
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) {
          formData.append(key, options[key])
        }
      })
    }

    return request({
      url: '/api/ai-tools/baidu-ocr/recognize/basic',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}