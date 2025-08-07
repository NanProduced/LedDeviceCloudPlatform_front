import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { subscriptionManager } from '@/lib/websocket/subscription'
import { FileUploadAPI, FileUploadUtils } from '@/lib/api/fileUpload'
import { 
  FileUploadRequest,
  TaskInitResponse,
  SupportedFileTypesResponse,
  UnifiedMessage,
  MessageType
} from '@/lib/types'

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

      // 处理状态变更
      if (payload.status) {
        switch (payload.status) {
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
  const subscribeToProgress = useCallback(async (taskId: string) => {
    try {
      // 使用页面级订阅，自动管理生命周期
      await subscriptionManager.subscribeForPage(
        pagePath,
        `/topic/task/${taskId}`,
        handleProgressMessage
      )
    } catch (err) {
      console.error('Failed to subscribe to task progress:', err)
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

      // MD5去重检查
      setStatus(UploadStatus.CHECKING_DUPLICATE)
      const md5Hash = await FileUploadUtils.calculateMD5(file)
      
      // 检查文件是否已存在
      if (!user) {
        throw new Error('用户信息不可用，请重新登录')
      }
      
      const duplicateCheck = await FileUploadAPI.checkFileDuplicate({
        md5Hash,
        organizationId: user.oid.toString()
      })

      if (duplicateCheck.exists && duplicateCheck.existingFile) {
        // 文件已存在，直接返回结果（秒传）
        setStatus(UploadStatus.SUCCESS)
        setResult({
          success: true,
          fileId: duplicateCheck.existingFile.fileId,
          fileUrl: duplicateCheck.existingFile.accessUrl,
          thumbnailUrl: duplicateCheck.existingFile.thumbnailUrl,
          instantUpload: true
        })
        setProgress({
          progress: 100,
          uploadedSize: duplicateCheck.existingFile.fileSize,
          totalSize: duplicateCheck.existingFile.fileSize,
          uploadSpeed: 0,
          estimatedTimeRemaining: 0
        })
        return
      }

      // 开始上传
      setStatus(UploadStatus.UPLOADING)
      const uploadResponse = await FileUploadAPI.uploadSingleFile(file, uploadRequest)
      
      // 保存任务ID并订阅进度
      currentTaskId.current = uploadResponse.taskId
      await subscribeToProgress(uploadResponse.taskId)

      // 初始化进度
      setProgress({
        progress: 0,
        uploadedSize: 0,
        totalSize: uploadResponse.fileSize,
        uploadSpeed: 0,
        estimatedTimeRemaining: 0
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败'
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