"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import MaterialAPI, { MaterialDetailResponse } from "@/lib/api/material"
import { api } from "@/lib/api"
import { getFileDownloadUrl, getFilePreviewUrl, getFileStreamUrl, getFileInfoApiPath } from "@/lib/api/filePreview"
import { FileInfo, MaterialMetadataItem } from "@/lib/types"
import {
  ImageIcon,
  Video,
  Music,
  File as FileIcon,
  Download,
  Loader2,
  Info,
} from "lucide-react"

export interface MaterialDetailDialogProps {
  mid: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getTypeIcon(type?: string) {
  const t = (type || "").toLowerCase()
  if (t === "image") return <ImageIcon className="w-5 h-5 text-green-600" />
  if (t === "video") return <Video className="w-5 h-5 text-blue-600" />
  if (t === "audio") return <Music className="w-5 h-5 text-purple-600" />
  return <FileIcon className="w-5 h-5 text-slate-600" />
}

function getStatusBadge(material?: MaterialDetailResponse) {
  if (!material) return null
  const label = material.fileStatusDesc || ""
  const progress = material.processProgress ?? undefined

  const desc = label.toLowerCase()
  const isSuccess = desc.includes("完成") || desc.includes("success") || progress === 100
  const isProcessing =
    desc.includes("处理中") ||
    desc.includes("转码") ||
    desc.includes("上传") ||
    (progress !== undefined && progress > 0 && progress < 100)
  const isFailed = desc.includes("失败") || desc.includes("error") || desc.includes("fail")

  let className = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  if (isSuccess)
    className = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  else if (isFailed)
    className = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  else if (isProcessing)
    className = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  else {
    const fallbackMap: Record<number, { label: string; className: string }> = {
      1: { label: "已完成", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      0: { label: "处理中", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      2: { label: "失败", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
    }
    const fb = fallbackMap[material.fileStatus]
    if (fb) {
      return (
        <div className="flex items-center gap-2">
          <Badge className={fb.className}>{fb.label}</Badge>
          {progress !== undefined && material.fileStatus === 0 && (
            <span className="text-xs text-slate-500">{progress}%</span>
          )}
        </div>
      )
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={className}>{label || "未知"}</Badge>
      {progress !== undefined && isProcessing && (
        <span className="text-xs text-slate-500">{progress}%</span>
      )}
    </div>
  )
}

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "-"
  const thresh = 1024
  if (Math.abs(bytes) < thresh) {
    return bytes + " B"
  }
  const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  let u = -1
  const r = 10
  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
  return bytes.toFixed(1) + " " + units[u]
}

export default function MaterialDetailDialog({ mid, open, onOpenChange }: MaterialDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [material, setMaterial] = useState<MaterialDetailResponse | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [metadata, setMetadata] = useState<MaterialMetadataItem | null>(null)

  const canPreview = useMemo(() => {
    const type = material?.materialType.toLowerCase()
    return type === "image" || type === "video" || type === "audio"
  }, [material])

  useEffect(() => {
    let aborted = false
    async function load() {
      if (!open || !mid) return
      setLoading(true)
      setError("")
      setMaterial(null)
      setFileInfo(null)
      try {
        const detail = await MaterialAPI.getMaterialDetail(mid)
        if (aborted) return
        if (!detail) {
          setError("未找到素材详情")
          return
        }
        setMaterial(detail)
        // 获取元数据（正确接口）
        try {
          const meta = await MaterialAPI.getMaterialMetadata(mid, {
            includeThumbnails: true,
            includeBasicInfo: true,
            includeImageMetadata: true,
            includeVideoMetadata: true,
          })
          if (!aborted) setMetadata(meta)
        } catch (e) {
          console.warn("获取素材元数据失败", e)
        }
        if (detail.fileId) {
          try {
            const fileRes = await api.get(getFileInfoApiPath(detail.fileId))
            if (!aborted) setFileInfo(fileRes.data as FileInfo)
          } catch (e) {
            console.warn("获取文件信息失败", e)
          }
        }
      } catch (e: any) {
        setError(e?.message || "加载失败")
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    load()
    return () => {
      aborted = true
    }
  }, [open, mid])

  const previewEl = useMemo(() => {
    if (!material) return null
    const type = material.materialType.toLowerCase()
    const fileId = material.fileId
    const preferPreviewUrl = metadata?.previewUrl || undefined
    const preferStreamUrl = metadata?.streamUrl || undefined
    if (type === "image") {
      return (
        <img
          src={preferPreviewUrl || getFilePreviewUrl(fileId, { w: 960, h: 540, fit: "contain" })}
          alt={material.materialName}
          className="w-full h-full object-contain"
        />
      )
    }
    if (type === "video") {
      return (
        <video
          className="w-full h-full"
          controls
          poster={preferPreviewUrl || getFilePreviewUrl(fileId, { w: 960, h: 540, t: 1 })}
          src={preferStreamUrl || getFileStreamUrl(fileId)}
        />
      )
    }
    if (type === "audio") {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
          <Music className="w-10 h-10 text-purple-600" />
          <audio controls className="w-full">
            <source src={preferStreamUrl || getFileStreamUrl(fileId)} />
          </audio>
        </div>
      )
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <FileIcon className="w-12 h-12 mx-auto mb-3" />
          <p>该类型暂不支持预览</p>
        </div>
      </div>
    )
  }, [material])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[70vw] h-[78vh] max-h-[78vh] overflow-hidden p-0 rounded-lg">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900/90 dark:bg-slate-100/10 rounded-lg flex items-center justify-center">
                {getTypeIcon(material?.materialType)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl truncate">
                  {material?.materialName || "素材详情"}
                </DialogTitle>
                <div className="mt-1 flex items-center gap-3">
                  {getStatusBadge(material || undefined)}
                  {material?.processProgress !== undefined && material.fileStatus === 0 && (
                    <div className="flex items-center gap-2">
                      <Progress value={material.processProgress} className="h-2 w-40" />
                      <span className="text-xs text-slate-500">{material.processProgress}%</span>
                    </div>
                  )}
                </div>
              </div>
              {material?.fileId && (
                <a href={getFileDownloadUrl(material.fileId, true)} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    下载
                  </Button>
                </a>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm text-slate-500">加载中...</span>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : !material ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                暂无数据
              </div>
            ) : (
              <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
                <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <TabsList className="grid w-full max-w-xl grid-cols-3 h-11">
                    <TabsTrigger value="preview" className="text-sm font-medium">预览</TabsTrigger>
                    <TabsTrigger value="info" className="text-sm font-medium">信息</TabsTrigger>
                    <TabsTrigger value="file" className="text-sm font-medium">文件</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="preview" className="m-0 h-full">
                    <div className="p-6 h-full">
                      <Card className="h-full">
                        <CardContent className="h-[58vh] p-4">
                          {canPreview ? (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                              {previewEl}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              暂不支持预览该类型
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="m-0 h-full">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Info className="w-4 h-4" /> 基本信息
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">素材ID</div>
                              <div className="col-span-2 font-mono">{material.mid}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">名称</div>
                              <div className="col-span-2 truncate">{material.materialName}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">类型</div>
                              <div className="col-span-2 capitalize">{material.materialType.toLowerCase()}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">大小</div>
                              <div className="col-span-2">{material.fileSizeFormatted}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">扩展名</div>
                              <div className="col-span-2">{material.fileExtension}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">MIME</div>
                              <div className="col-span-2">{material.mimeType}</div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">上传者</div>
                              <div className="col-span-2">{material.uploaderName}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">上传时间</div>
                              <div className="col-span-2">{new Date(material.uploadTime).toLocaleString("zh-CN")}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">所属用户组</div>
                              <div className="col-span-2">ugid={material.ugid}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-slate-500">所属文件夹</div>
                              <div className="col-span-2">fid={material.fid ?? "-"}</div>
                            </div>
                            {material.description && (
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-slate-500">描述</div>
                                <div className="col-span-2 whitespace-pre-wrap break-words">{material.description}</div>
                              </div>
                            )}
                            {/* 元数据（图片/视频） */}
                            {metadata?.imageMetadata && (
                              <>
                                <Separator />
                                <div className="text-sm font-semibold">图片元数据</div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">分辨率</div>
                                  <div className="col-span-2">{metadata.imageMetadata.width} x {metadata.imageMetadata.height}</div>
                                </div>
                                {metadata.imageMetadata.colorSpace && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-slate-500">色彩空间</div>
                                    <div className="col-span-2">{metadata.imageMetadata.colorSpace}</div>
                                  </div>
                                )}
                              </>
                            )}
                            {metadata?.videoMetadata && (
                              <>
                                <Separator />
                                <div className="text-sm font-semibold">视频元数据</div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">分辨率</div>
                                  <div className="col-span-2">{metadata.videoMetadata.width} x {metadata.videoMetadata.height}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">时长</div>
                                  <div className="col-span-2">{Math.round((metadata.videoMetadata.durationMs || 0) / 1000)} 秒</div>
                                </div>
                                {metadata.videoMetadata.frameRate !== undefined && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-slate-500">帧率</div>
                                    <div className="col-span-2">{metadata.videoMetadata.frameRate} fps</div>
                                  </div>
                                )}
                                {metadata.videoMetadata.videoCodec && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-slate-500">视频编码</div>
                                    <div className="col-span-2">{metadata.videoMetadata.videoCodec}</div>
                                  </div>
                                )}
                                {metadata.videoMetadata.audioCodec && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="text-slate-500">音频编码</div>
                                    <div className="col-span-2">{metadata.videoMetadata.audioCodec}</div>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">文件信息</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            {fileInfo ? (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">文件ID</div>
                                  <div className="col-span-2 font-mono break-all">{fileInfo.fileId}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">原始文件名</div>
                                  <div className="col-span-2 break-all">{fileInfo.originalFilename}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">大小</div>
                                  <div className="col-span-2">{formatBytes(fileInfo.fileSize)}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">MD5</div>
                                  <div className="col-span-2 font-mono break-all">{fileInfo.md5Hash}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">存储类型</div>
                                  <div className="col-span-2">{fileInfo.storageType}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">引用次数</div>
                                  <div className="col-span-2">{fileInfo.refCount}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">上传时间</div>
                                  <div className="col-span-2">{new Date(fileInfo.uploadTime).toLocaleString("zh-CN")}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-slate-500">更新时间</div>
                                  <div className="col-span-2">{new Date(fileInfo.updateTime).toLocaleString("zh-CN")}</div>
                                </div>
                              </>
                            ) : (
                              <div className="text-slate-400 text-sm">暂无文件信息</div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="m-0 h-full">
                    <div className="p-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">链接与操作</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          {material.fileId ? (
                            <>
                              <div className="space-y-1">
                                <div className="text-slate-500">预览链接</div>
                                <div className="font-mono break-all text-xs">
                                  {(metadata?.previewUrl) || getFilePreviewUrl(material.fileId, { w: 960, h: 540, fit: "contain" })}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-slate-500">下载链接</div>
                                <div className="font-mono break-all text-xs">
                                  {getFileDownloadUrl(material.fileId, true)}
                                </div>
                              </div>
                              <div>
                                <a href={getFileDownloadUrl(material.fileId, true)} target="_blank" rel="noreferrer">
                                  <Button className="gap-2" size="sm">
                                    <Download className="w-4 h-4" /> 直接下载
                                  </Button>
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400">暂无文件ID</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

