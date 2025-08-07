import { fetchApi } from '../api'
import {
  FileUploadRequest,
  FileExistenceCheckRequest,
  FileExistenceCheckResponse,
  TaskInitResponse,
  SupportedFileTypesResponse,
  UploadProgressResponse,
  FileUploadStatistics,
  FileTypeInfo
} from '../types'
import CryptoJS from 'crypto-js'

/**
 * 文件上传API类
 * 
 * 负责处理文件上传相关的API调用，包括：
 * - 获取支持的文件类型
 * - 文件去重检查
 * - 创建上传任务
 * - 查询上传进度
 * - 获取上传统计
 */
export class FileUploadAPI {
  /**
   * 获取支持的文件类型和系统配置
   */
  static async getSupportedFileTypes(): Promise<SupportedFileTypesResponse> {
    return await fetchApi('/file/api/file/upload/supported-types')
  }

  /**
   * MD5文件去重检查
   * @param request 文件存在性检查请求
   */
  static async checkFileDuplicate(request: FileExistenceCheckRequest): Promise<FileExistenceCheckResponse> {
    return await fetchApi('/file/api/file/upload/check-duplicate', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * 异步上传单个文件
   * @param file 要上传的文件
   * @param uploadRequest 上传参数
   */
  static async uploadSingleFile(
    file: File,
    uploadRequest: FileUploadRequest
  ): Promise<TaskInitResponse> {
    const formData = new FormData()
    formData.append('file', file)

    // 根据API文档，uploadRequest应该作为query参数，但实际应该是form data
    // 将参数添加到formData中
    if (uploadRequest.folderId) {
      formData.append('folderId', uploadRequest.folderId)
    }
    if (uploadRequest.materialName) {
      formData.append('materialName', uploadRequest.materialName)
    }
    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description)
    }

    // 直接使用fetch，避免api.post的JSON处理
    const response = await fetch('/file/api/file/upload/single', {
      method: 'POST',
      credentials: 'include', // 发送Cookie
      body: formData // FormData会自动设置正确的Content-Type
    })
    
    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} - ${response.statusText}`)
    }
    
    const responseData = await response.json()
    return responseData
  }

  /**
   * 获取上传进度
   * @param taskId 上传任务ID
   */
  static async getUploadProgress(taskId: string): Promise<UploadProgressResponse> {
    return await fetchApi(`/file/api/file/upload/progress/${taskId}`)
  }

  /**
   * 获取组织的文件上传统计信息
   * @param organizationId 组织ID
   */
  static async getUploadStatistics(organizationId: string): Promise<FileUploadStatistics> {
    return await fetchApi(`/file/api/file/upload/statistics/${organizationId}`)
  }
}

/**
 * 文件上传工具函数
 */
export class FileUploadUtils {
  /**
   * 计算文件的MD5哈希值
   * @param file 文件对象
   */
  static async calculateMD5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
          const md5Hash = CryptoJS.MD5(wordArray).toString()
          resolve(md5Hash)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 验证文件类型和大小
   * @param file 文件对象
   * @param supportedTypes 支持的文件类型配置
   */
  static validateFile(file: File, supportedTypes: SupportedFileTypesResponse): {
    isValid: boolean
    error?: string
    category?: string
  } {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1)
    const mimeType = file.type

    // 查找匹配的文件类型
    let matchedCategory: string | undefined
    let matchedTypeInfo: FileTypeInfo | undefined

    for (const [category, typeInfo] of Object.entries(supportedTypes.supportedTypes)) {
      if (typeInfo.extensions.includes(fileExtension) || 
          typeInfo.mimeTypes.includes(mimeType)) {
        matchedCategory = category
        matchedTypeInfo = typeInfo
        break
      }
    }

    if (!matchedCategory || !matchedTypeInfo) {
      return {
        isValid: false,
        error: `不支持的文件类型: ${fileExtension}`
      }
    }

    // 检查文件大小
    if (file.size > matchedTypeInfo.maxSize) {
      const maxSizeMB = (matchedTypeInfo.maxSize / (1024 * 1024)).toFixed(1)
      return {
        isValid: false,
        error: `文件大小超出限制，最大支持 ${maxSizeMB}MB`
      }
    }

    return {
      isValid: true,
      category: matchedCategory
    }
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 格式化上传速度
   * @param bytesPerSecond 每秒字节数
   */
  static formatUploadSpeed(bytesPerSecond: number): string {
    return this.formatFileSize(bytesPerSecond) + '/s'
  }

  /**
   * 格式化剩余时间
   * @param seconds 剩余秒数
   */
  static formatRemainingTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes}分钟`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}小时${minutes}分钟`
    }
  }

  /**
   * 获取文件类型对应的图标
   * @param fileType 文件类型
   */
  static getFileTypeIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      'VIDEO': '🎬',
      'IMAGE': '🖼️',
      'AUDIO': '🎵',
      'DOCUMENT': '📄'
    }
    return iconMap[fileType] || '📁'
  }
}

// 导出默认实例
export default FileUploadAPI