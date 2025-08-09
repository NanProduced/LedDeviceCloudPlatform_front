import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { subscriptionManager } from '@/lib/websocket/subscription'
import { FileUploadAPI, FileUploadUtils } from '@/lib/api/fileUpload'
import { 
  FileUploadRequest,
  TaskInitResponse,
  SupportedFileTypesResponse
} from '@/lib/types'
import { UnifiedMessage, MessageType } from '@/lib/websocket/types'



/**
 * 上传状态枚举
 */
export enum UploadStatus {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  CHECKING_DUPLICATE = 'CHECKING_DUPLICATE',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED'
}

/**
 * 上传进度信息
 */
export interface UploadProgress {
  progress: number              // 进度百分比 0-100
  uploadedSize: number         // 已上传字节数
  totalSize: number           // 总字节数
  uploadSpeed: number         // 上传速度（字节/秒）
  estimatedTimeRemaining: number // 预计剩余时间（秒）
}

/**
 * 上传结果信息
 */
export interface UploadResult {
  success: boolean
  taskId?: string
  fileId?: string
  fileUrl?: string
  thumbnailUrl?: string
  errorMessage?: string
  instantUpload?: boolean
}

/**
 * useFileUpload Hook 返回值接口
 */
export interface UseFileUploadReturn {
  // 状态
  status: UploadStatus
  progress: UploadProgress | null
  result: UploadResult | null
  error: string | null
  supportedTypes: SupportedFileTypesResponse | null

  // 方法
  initializeUpload: () => Promise<void>
  uploadFile: (file: File, uploadRequest: FileUploadRequest) => Promise<void>
  cancelUpload: () => void
  resetUpload: () => void
}

/**
 * 文件上传自定义Hook
 * 
 * 提供完整的文件上传功能，包括：
 * - 文件类型和大小验证
 * - MD5去重检查
 * - 异步上传任务创建
 * - 使用全局WebSocket连接的页面级订阅进度监听
 * - 上传结果处理
 */
export function useFileUpload(pagePath: string = '/dashboard/file-management/upload'): UseFileUploadReturn {
  // 状态管理
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [supportedTypes, setSupportedTypes] = useState<SupportedFileTypesResponse | null>(null)

  // 引用管理
  const currentTaskId = useRef<string | null>(null)
  const router = useRouter()
  
  // 用户上下文
  const { user } = useUser()

  /**
   * 初始化上传功能，获取支持的文件类型
   */
  const initializeUpload = useCallback(async () => {
    try {
      setStatus(UploadStatus.VALIDATING)
      setError(null)

      const types = await FileUploadAPI.getSupportedFileTypes()
      setSupportedTypes(types)
      setStatus(UploadStatus.IDLE)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取文件类型配置失败'
      setError(errorMessage)
      setStatus(UploadStatus.ERROR)
    }
  }, [])

  /**
   * 处理WebSocket进度消息
   */
  const handleProgressMessage = useCallback((message: UnifiedMessage) => {
    if (message.messageType === MessageType.TASK_PROGRESS || 
        message.messageType === MessageType.FILE_UPLOAD) {
      
      const payload = message.payload
      if (!payload) return

      // 更新进度信息
      if (payload.progress !== undefined) {
        setProgress({
          progress: payload.progress,
          uploadedSize: payload.uploadedSize || 0,
          totalSize: payload.totalSize || 0,
          uploadSpeed: payload.uploadSpeed || 0,
          estimatedTimeRemaining: payload.estimatedTimeRemaining || 0
        })
      }

      // 处理状态变更 - 兼容 status 和 eventType 字段
      const statusValue = payload.status || payload.eventType
      if (statusValue) {
        switch (statusValue) {
          case 'SUCCESS':
          case 'COMPLETED':
            setStatus(UploadStatus.SUCCESS)
            setResult({
              success: true,
              taskId: currentTaskId.current || undefined,
              fileId: payload.fileId,
              fileUrl: payload.accessUrl,
              thumbnailUrl: payload.thumbnailUrl,
              instantUpload: payload.instantUpload
            })
            break
          case 'FAILED':
          case 'ERROR':
            setStatus(UploadStatus.ERROR)
            setError(payload.errorMessage || '上传失败')
            setResult({
              success: false,
              errorMessage: payload.errorMessage || '上传失败'
            })
            break
          case 'CANCELLED':
            setStatus(UploadStatus.CANCELLED)
            break
        }
      }
    }
  }, [])

  /**
   * 订阅任务进度（使用页面级订阅）
   */
  const subscribeToProgress = useCallback(async (subscriptionUrl: string) => {
    try {
      console.log('🔄 开始订阅进度topic:', subscriptionUrl)
      console.log('📍 当前页面路径:', pagePath)
      
      const subscriptionId = await subscriptionManager.subscribeForPage(
        pagePath,
        subscriptionUrl,
        handleProgressMessage
      )
      
      console.log('✅ 进度订阅成功:', { subscriptionId, subscriptionUrl })
    } catch (err) {
      console.error('❌ 进度订阅失败:', err)
      setError(`订阅进度失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }, [pagePath, handleProgressMessage])

  /**
   * 页面卸载时自动清理订阅
   * subscriptionManager会自动处理页面级订阅的清理
   */
  useEffect(() => {
    return () => {
      // 页面级订阅会在路由变化时自动清理，这里只做保险
      subscriptionManager.unsubscribeForPage(pagePath)
    }
  }, [pagePath])

  /**
   * 上传文件
   */
  const uploadFile = useCallback(async (file: File, uploadRequest: FileUploadRequest) => {
    try {
      // 重置状态
      setError(null)
      setResult(null)
      setProgress(null)

      // 验证文件
      if (!supportedTypes) {
        throw new Error('请先初始化文件类型配置')
      }

      setStatus(UploadStatus.VALIDATING)
      const validation = FileUploadUtils.validateFile(file, supportedTypes)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // 直接上传（后端包含去重/秒传逻辑）
      setStatus(UploadStatus.UPLOADING)
      const uploadResponse = await FileUploadAPI.uploadSingleFile(file, uploadRequest)
      
      console.log('📤 上传响应:', uploadResponse)
      console.log('🎯 进度订阅URL:', uploadResponse.progressSubscriptionUrl)
      
      // 保存任务ID并订阅进度
      currentTaskId.current = uploadResponse.taskId
      await subscribeToProgress(uploadResponse.progressSubscriptionUrl)

      // 初始化进度
      setProgress({
        progress: 0,
        uploadedSize: 0,
        totalSize: uploadResponse.fileSize,
        uploadSpeed: 0,
        estimatedTimeRemaining: 0
      })

    } catch (err) {
      console.error('❌ 文件上传失败:', err)
      let errorMessage = '上传失败'
      
      if (err instanceof Error) {
        errorMessage = err.message
        
        // 特殊错误处理
        if (err.message.includes('Invalid array length')) {
          errorMessage = '文件过大或内存不足，请尝试较小的文件'
        } else if (err.message.includes('NetworkError')) {
          errorMessage = '网络错误，请检查网络连接'
        } else if (err.message.includes('timeout')) {
          errorMessage = '上传超时，请重试'
        }
      }
      
      setError(errorMessage)
      setStatus(UploadStatus.ERROR)
      setResult({
        success: false,
        errorMessage
      })
    }
  }, [supportedTypes, subscribeToProgress, user])

  /**
   * 取消上传
   */
  const cancelUpload = useCallback(() => {
    setStatus(UploadStatus.CANCELLED)
    currentTaskId.current = null
    // 页面级订阅会自动管理，无需手动取消
  }, [])

  /**
   * 重置上传状态
   */
  const resetUpload = useCallback(() => {
    setStatus(UploadStatus.IDLE)
    setProgress(null)
    setResult(null)
    setError(null)
    currentTaskId.current = null
    // 页面级订阅会自动管理，无需手动取消
  }, [])

  return {
    status,
    progress,
    result,
    error,
    supportedTypes,
    initializeUpload,
    uploadFile,
    cancelUpload,
    resetUpload
  }
}