"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  UploadStatus, 
  UploadProgress as UploadProgressType, 
  UploadResult 
} from "@/hooks/useFileUpload"
import { FileUploadUtils } from "@/lib/api/fileUpload"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Upload, 
  Loader2, 
  Download,
  Eye,
  RotateCcw
} from "lucide-react"

/**
 * 上传进度组件属性接口
 */
export interface UploadProgressProps {
  /** 当前上传状态 */
  status: UploadStatus
  /** 进度信息 */
  progress: UploadProgressType | null
  /** 上传结果 */
  result: UploadResult | null
  /** 错误信息 */
  error: string | null
  /** 上传的文件名 */
  fileName?: string
  /** 取消上传回调 */
  onCancel?: () => void
  /** 重试上传回调 */
  onRetry?: () => void
  /** 重置状态回调 */
  onReset?: () => void
  /** 查看文件回调 */
  onViewFile?: (fileUrl: string) => void
}

/**
 * 上传进度显示组件
 * 
 * 显示文件上传的实时进度，包括：
 * - 上传状态和进度条
 * - 上传速度和剩余时间
 * - 成功/失败结果显示
 * - 操作按钮（取消、重试、查看等）
 */
export function UploadProgress({
  status,
  progress,
  result,
  error,
  fileName,
  onCancel,
  onRetry,
  onReset,
  onViewFile
}: UploadProgressProps) {
  /**
   * 获取状态显示信息
   */
  const getStatusInfo = () => {
    switch (status) {
      case UploadStatus.IDLE:
        return {
          icon: <Upload className="w-5 h-5 text-slate-400" />,
          text: "等待上传",
          color: "slate"
        }
      case UploadStatus.VALIDATING:
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          text: "验证文件",
          color: "blue"
        }
      case UploadStatus.CHECKING_DUPLICATE:
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          text: "检查重复",
          color: "blue"
        }
      case UploadStatus.UPLOADING:
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          text: "上传中",
          color: "blue"
        }
      case UploadStatus.SUCCESS:
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: result?.instantUpload ? "秒传成功" : "上传成功",
          color: "green"
        }
      case UploadStatus.ERROR:
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: "上传失败",
          color: "red"
        }
      case UploadStatus.CANCELLED:
        return {
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          text: "已取消",
          color: "orange"
        }
      default:
        return {
          icon: <Upload className="w-5 h-5 text-slate-400" />,
          text: "未知状态",
          color: "slate"
        }
    }
  }

  /**
   * 渲染进度信息
   */
  const renderProgressInfo = () => {
    if (!progress) return null

    const progressPercentage = Math.round(progress.progress)
    const uploadSpeed = FileUploadUtils.formatUploadSpeed(progress.uploadSpeed)
    const remainingTime = FileUploadUtils.formatRemainingTime(progress.estimatedTimeRemaining)
    const uploadedSize = FileUploadUtils.formatFileSize(progress.uploadedSize)
    const totalSize = FileUploadUtils.formatFileSize(progress.totalSize)

    return (
      <div className="space-y-3">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">进度</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* 详细信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">上传速度</span>
            <div className="font-medium">{uploadSpeed}</div>
          </div>
          <div>
            <span className="text-slate-500">剩余时间</span>
            <div className="font-medium">{remainingTime}</div>
          </div>
          <div>
            <span className="text-slate-500">已上传</span>
            <div className="font-medium">{uploadedSize}</div>
          </div>
          <div>
            <span className="text-slate-500">总大小</span>
            <div className="font-medium">{totalSize}</div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * 渲染操作按钮
   */
  const renderActionButtons = () => {
    const buttons = []

    // 上传中显示取消按钮
    if (status === UploadStatus.UPLOADING && onCancel) {
      buttons.push(
        <Button 
          key="cancel"
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          取消上传
        </Button>
      )
    }

    // 失败时显示重试按钮
    if (status === UploadStatus.ERROR && onRetry) {
      buttons.push(
        <Button 
          key="retry"
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重试
        </Button>
      )
    }

    // 成功时显示查看和下载按钮
    if (status === UploadStatus.SUCCESS && result?.success) {
      if (result.fileUrl && onViewFile) {
        buttons.push(
          <Button 
            key="view"
            variant="outline" 
            size="sm" 
            onClick={() => onViewFile(result.fileUrl!)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            查看文件
          </Button>
        )
      }

      if (result.fileUrl) {
        buttons.push(
          <Button 
            key="download"
            variant="outline" 
            size="sm" 
            onClick={() => window.open(result.fileUrl, '_blank')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            下载
          </Button>
        )
      }
    }

    // 完成状态显示重置按钮
    if ((status === UploadStatus.SUCCESS || 
         status === UploadStatus.ERROR || 
         status === UploadStatus.CANCELLED) && onReset) {
      buttons.push(
        <Button 
          key="reset"
          variant="outline" 
          size="sm" 
          onClick={onReset}
        >
          重新上传
        </Button>
      )
    }

    return buttons.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {buttons}
      </div>
    ) : null
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <div className="font-medium">{fileName || "文件上传"}</div>
              <div className="text-sm text-slate-500">{statusInfo.text}</div>
            </div>
          </div>
          <Badge variant={statusInfo.color === 'green' ? 'default' : 'secondary'}>
            {statusInfo.text}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 进度信息 */}
        {renderProgressInfo()}

        {/* 错误信息 */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* 成功信息 */}
        {status === UploadStatus.SUCCESS && result?.success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800 dark:text-green-200">
                {result.instantUpload 
                  ? "文件已存在，秒传完成！" 
                  : "文件上传成功！"
                }
                {result.fileId && (
                  <div className="mt-1 text-xs opacity-75">
                    文件ID: {result.fileId}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {renderActionButtons()}
      </CardContent>
    </Card>
  )
}