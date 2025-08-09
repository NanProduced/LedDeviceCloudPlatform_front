"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FolderSelector } from "@/components/FolderSelector"
import { UploadProgress } from "@/components/UploadProgress"
import { useFileUpload, UploadStatus } from "@/hooks/useFileUpload"
import { Upload, Plus, ArrowLeft, FileText, AlertCircle, Loader2 } from "lucide-react"

export default function FileUpload() {
  // 状态管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedUserGroupId, setSelectedUserGroupId] = useState<number | null>(null)
  const [materialName, setMaterialName] = useState("")
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)

  // 文件上传Hook
  const {
    status,
    progress,
    result,
    error,
    supportedTypes,
    initializeUpload,
    uploadFile,
    cancelUpload,
    resetUpload
  } = useFileUpload('/dashboard/file-management/upload')

  // 初始化支持的文件类型
  useEffect(() => {
    initializeUpload()
  }, [initializeUpload])

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0])
      setMaterialName(files[0].name.replace(/\.[^/.]+$/, "")) // 移除扩展名作为默认素材名
    }
  }, [])

  // 处理文件拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // 处理文件夹选择
  const handleFolderChange = useCallback((folderId: string | null, userGroupId: number | null) => {
    setSelectedFolderId(folderId)
    setSelectedUserGroupId(userGroupId)
  }, [])

  // 开始上传
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      alert('请先选择文件')
      return
    }

    if (!selectedFolderId && !selectedUserGroupId) {
      alert('请选择目标文件夹')
      return
    }

    try {
      await uploadFile(selectedFile, {
        folderId: selectedFolderId || undefined,
        ugid: selectedFolderId ? undefined : (selectedUserGroupId ?? undefined),
        materialName: materialName.trim() || undefined,
        description: description.trim() || undefined
      })
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }, [selectedFile, selectedFolderId, selectedUserGroupId, materialName, description, uploadFile])

  // 重置所有状态
  const handleReset = useCallback(() => {
    resetUpload()
    setSelectedFile(null)
    setMaterialName("")
    setDescription("")
  }, [resetUpload])

  // 查看文件
  const handleViewFile = useCallback((fileUrl: string) => {
    window.open(fileUrl, '_blank')
  }, [])

  // 获取支持的文件格式显示
  const getSupportedFormats = () => {
    if (!supportedTypes) return {}
    
    const formats: Record<string, string[]> = {}
    Object.entries(supportedTypes.supportedTypes).forEach(([category, typeInfo]) => {
      formats[category] = typeInfo.extensions
    })
    return formats
  }

  const supportedFormats = getSupportedFormats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">文件上传</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">上传和管理您的媒体文件</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="outline" size="sm">
              素材管理
            </Button>
          </Link>
          <Button variant="default" size="sm">
            文件上传
          </Button>
          <Link href="/file-management/transcode">
            <Button variant="outline" size="sm">
              转码管理
            </Button>
          </Link>
          <Link href="/file-management/storage">
            <Button variant="outline" size="sm">
              存储统计
            </Button>
          </Link>
        </div>

        {/* Upload Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：文件选择和设置 */}
          <div className="space-y-6">
            {/* 文件选择区域 */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  选择文件
                </CardTitle>
                <CardDescription>支持单个文件上传，拖拽或点击选择</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 text-green-500 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {selectedFile.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedFile(null)}
                        disabled={status === UploadStatus.UPLOADING}
                      >
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          拖拽文件到此处或点击上传
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          支持视频、图片、音频等多种格式
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="file-input"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          disabled={status === UploadStatus.UPLOADING}
                        />
                        <Button 
                          className="gap-2"
                          onClick={() => document.getElementById('file-input')?.click()}
                          disabled={status === UploadStatus.UPLOADING}
                        >
                          <Plus className="w-4 h-4" />
                          选择文件
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 上传设置 */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">上传设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="uploadFolder">目标文件夹</Label>
                  <FolderSelector
                    selectedFolderId={selectedFolderId}
                    selectedUserGroupId={selectedUserGroupId}
                    onFolderChange={(fid, ugid) => handleFolderChange(fid, ugid)}
                    placeholder="请选择目标文件夹"
                    disabled={status === UploadStatus.UPLOADING}
                  />
                </div>
                <div>
                  <Label htmlFor="materialName">素材名称（可选）</Label>
                  <Input 
                    id="materialName" 
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="输入素材名称，留空使用文件名"
                    maxLength={200}
                    disabled={status === UploadStatus.UPLOADING}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {materialName.length}/200 字符
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">文件描述（可选）</Label>
                  <Textarea 
                    id="description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="添加文件描述信息"
                    maxLength={500}
                    disabled={status === UploadStatus.UPLOADING}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {description.length}/500 字符
                  </p>
                </div>
                
                {/* 操作按钮 */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleUpload}
                      disabled={!selectedFile || status === UploadStatus.UPLOADING || 
                               (!selectedFolderId && !selectedUserGroupId)}
                      className="flex-1"
                    >
                      {status === UploadStatus.UPLOADING ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          开始上传
                        </>
                      )}
                    </Button>
                    
                    {(status === UploadStatus.SUCCESS || 
                      status === UploadStatus.ERROR || 
                      status === UploadStatus.CANCELLED) && (
                      <Button variant="outline" onClick={handleReset}>
                        重置
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：进度显示和支持格式 */}
          <div className="space-y-6">
            {/* 上传进度 */}
            {(status !== UploadStatus.IDLE || selectedFile) && (
              <UploadProgress
                status={status}
                progress={progress}
                result={result}
                error={error}
                fileName={selectedFile?.name}
                onCancel={cancelUpload}
                onRetry={handleUpload}
                onReset={handleReset}
                onViewFile={handleViewFile}
              />
            )}

            {/* 支持格式 */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">支持格式</CardTitle>
                <CardDescription>
                  {supportedTypes ? '已加载文件类型配置' : '加载文件类型配置中...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(supportedFormats).map(([category, extensions]) => (
                  <div key={category}>
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {category.toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {extensions.join(', ').toUpperCase()}
                    </p>
                  </div>
                ))}
                
                {!supportedTypes && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">加载配置中...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 注意事项 */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  注意事项
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>• 当前版本仅支持单个文件上传</p>
                <p>• 系统会自动检查文件是否已存在（MD5去重）</p>
                <p>• 上传过程中请保持网络连接稳定</p>
                <p>• 视频文件的自动转码功能暂未开放</p>
                <p>• 上传进度通过WebSocket实时更新</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
