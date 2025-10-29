import request from '@/utils/request'

export interface UploadedFile {
  id: number
  fileName: string
  originalName: string
  fileSize: number
  url: string
  downloadUrl?: string
}

export interface FileInfo {
  id: number
  fileName: string
  originalName: string
  fileSize: number
  category: string
  createTime: string
  url: string
  downloadUrl: string
}

/**
 * 上传文件
 */
export const uploadFile = (
  file: File,
  category: string,
  relatedId?: number
): Promise<UploadedFile> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  if (relatedId) {
    formData.append('relatedId', relatedId.toString())
  }

  return request<UploadedFile>({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 获取关联文件列表
 */
export const getFilesByRelatedId = (
  relatedId: number,
  category?: string
): Promise<FileInfo[]> => {
  return request<FileInfo[]>({
    url: `/upload/related/${relatedId}`,
    method: 'get',
    params: { category },
  })
}

/**
 * 删除文件
 */
export const deleteFile = (id: number) => {
  return request({
    url: `/upload/${id}`,
    method: 'delete',
  })
}

/**
 * 获取文件URL
 */
export const getFileUrl = (id: number): string => {
  return `/api/upload/file/${id}`
}

/**
 * 获取文件下载URL
 */
export const getDownloadUrl = (id: number): string => {
  return `/api/upload/download/${id}`
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
