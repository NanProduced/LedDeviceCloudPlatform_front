"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Monitor,
  Wifi,
  WifiOff,
  HardDrive,
  Clock,
  MapPin,
  Activity,
  Settings,
  Sun,
  Volume2,
  Palette,
  Globe,
  Network,
  Play,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft
} from "lucide-react"

// 扩展的设备详情数据接口
export interface DeviceDetailInfo {
  // 基础设备信息
  tid: number
  terminalName: string
  description: string
  terminalModel: string
  tgName: string
  firmwareVersion: string
  serialNumber: string
  onlineStatus: number
  createdAt: string
  updatedAt: string
  
  // 设备配置信息
  display: {
    resolution: string
    width: number
    height: number
    brightness: number
    contrast: number
    colorTemperature: number
  }
  
  // 存储信息
  storage: {
    totalSpace: number // GB
    usedSpace: number // GB
    freeSpace: number // GB
    usagePercentage: number
  }
  
  // 系统设置
  system: {
    timezone: string
    language: string
    autoRestart: boolean
    volume: number
    runTime: number // 运行时间（小时）
  }
  
  // 网络信息
  network: {
    connectionStatus: "COMPLETED" | "DISCONNECTED" | "CONNECTING"
    speed: string
    state: "UP" | "DOWN"
    ipAddress: string
    subnetMask: string
    macAddress: string
    gateway?: string
    dns?: string
  }
  
  // 当前播放内容
  content: {
    currentProgram?: {
      programId: number
      programName: string
      thumbnail: string
      duration: number
      progress: number
    }
    playlist: Array<{
      id: number
      name: string
      type: string
      size: string
      source: string
      addTime: string
    }>
  }
}

interface DeviceDetailDialogProps {
  device: DeviceDetailInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeviceDetailDialog({ device, open, onOpenChange }: DeviceDetailDialogProps) {
  if (!device) return null

  const getOnlineStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <Wifi className="w-3 h-3 mr-1" />
        在线
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <WifiOff className="w-3 h-3 mr-1" />
        离线
      </Badge>
    )
  }

  const getNetworkStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            已连接
          </Badge>
        )
      case "CONNECTING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Activity className="w-3 h-3 mr-1" />
            连接中
          </Badge>
        )
      case "DISCONNECTED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <X className="w-3 h-3 mr-1" />
            已断开
          </Badge>
        )
      default:
        return null
    }
  }

  const formatRunTime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return days > 0 ? `${days}天${remainingHours}小时` : `${remainingHours}小时`
  }

  const formatFileSize = (gb: number) => {
    return gb >= 1000 ? `${(gb / 1000).toFixed(1)}TB` : `${gb.toFixed(1)}GB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[65vw] h-[75vh] max-h-[75vh] overflow-hidden p-0 rounded-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Button>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {device.terminalName}
                </DialogTitle>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{device.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {getOnlineStatusBadge(device.onlineStatus)}
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  设备配置
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="details" className="w-full h-full flex flex-col">
              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <TabsList className="grid w-full max-w-3xl grid-cols-7 h-12">
                  <TabsTrigger value="details" className="text-sm font-medium">详情</TabsTrigger>
                  <TabsTrigger value="network" className="text-sm font-medium">网络</TabsTrigger>
                  <TabsTrigger value="content" className="text-sm font-medium">内容</TabsTrigger>
                  <TabsTrigger value="program" className="text-sm font-medium">样程</TabsTrigger>
                  <TabsTrigger value="monitor" className="text-sm font-medium">监控</TabsTrigger>
                  <TabsTrigger value="map" className="text-sm font-medium">地图</TabsTrigger>
                  <TabsTrigger value="logs" className="text-sm font-medium">日志</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* 详情标签页 */}
                <TabsContent value="details" className="m-0 h-full">
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                      {/* 左侧 - 设备载图 */}
                      <div className="space-y-6">
                        <Card className="h-fit">
                          <CardHeader>
                            <CardTitle className="text-xl">设备载图</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                              {device.content.currentProgram ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={device.content.currentProgram.thumbnail}
                                    alt={device.content.currentProgram.programName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xNDQgNzJIMTc2VjEwOEgxNDRWNzJaIiBmaWxsPSIjOTQ5NEE4Ii8+Cjwvc3ZnPgo='
                                    }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="flex items-center justify-between text-white">
                                      <div className="flex items-center gap-2">
                                        <Play className="w-5 h-5" />
                                        <span className="font-medium">{device.content.currentProgram.programName}</span>
                                      </div>
                                      <span className="text-sm">{device.content.currentProgram.progress}%</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <div className="text-center">
                                    <Monitor className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-lg">暂无播放节目</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* 存储使用情况 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <HardDrive className="w-5 h-5" />
                              存储使用情况
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">存储使用率</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {device.storage.usagePercentage}% 已使用
                                </span>
                              </div>
                              <Progress value={device.storage.usagePercentage} className="h-3" />
                              <div className="flex justify-between text-sm text-slate-500 mt-2">
                                <span>{formatFileSize(device.storage.usedSpace)} 已使用</span>
                                <span>{formatFileSize(device.storage.freeSpace)} 可用</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* 右侧 - 设备信息和系统设置 */}
                      <div className="space-y-6">
                        {/* 设备基本信息 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl">设备信息</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">设备名称</div>
                                <div className="font-medium">{device.terminalName}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">设备型号</div>
                                <Badge variant="outline" className="font-mono">{device.terminalModel}</Badge>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">分辨率</div>
                                <div className="font-mono">{device.display.resolution}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">显示尺寸</div>
                                <div className="font-mono">{device.display.width} x {device.display.height}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">序列号</div>
                                <div className="font-mono text-sm">{device.serialNumber}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">固件版本</div>
                                <div>{device.firmwareVersion}</div>
                              </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">运行时间</div>
                                <div className="font-medium">{formatRunTime(device.system.runTime)}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">最后更新</div>
                                <div className="text-sm">{new Date(device.updatedAt).toLocaleString("zh-CN")}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 系统设置 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Settings className="w-5 h-5" />
                              系统设置
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">时区</div>
                                <div>{device.system.timezone}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">语言</div>
                                <div>{device.system.language}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">自动重启</div>
                              <Badge variant={device.system.autoRestart ? "default" : "secondary"}>
                                {device.system.autoRestart ? "已启用" : "已禁用"}
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Sun className="w-4 h-4" />
                                    亮度
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {device.display.brightness}
                                  </div>
                                </div>
                                <Progress value={device.display.brightness} className="h-3" />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Palette className="w-4 h-4" />
                                    对比度
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {device.display.contrast}
                                  </div>
                                </div>
                                <Progress value={device.display.contrast} className="h-3" />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Volume2 className="w-4 h-4" />
                                    音量
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {device.system.volume}
                                  </div>
                                </div>
                                <Progress value={device.system.volume} className="h-3" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 网络标签页 */}
                <TabsContent value="network" className="m-0">
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Network className="w-5 h-5" />
                            网络状态
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">连接状态</div>
                              {getNetworkStatusBadge(device.network.connectionStatus)}
                            </div>
                            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">速度</div>
                              <div className="font-bold text-lg">{device.network.speed}</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">状态</div>
                              <Badge variant={device.network.state === "UP" ? "default" : "destructive"}>
                                {device.network.state}
                              </Badge>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">类型</div>
                              <div className="font-medium">以太网</div>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">网络配置</h3>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">IP地址</div>
                                  <div className="font-mono font-medium">{device.network.ipAddress}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">子网掩码</div>
                                  <div className="font-mono font-medium">{device.network.subnetMask}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">MAC地址</div>
                                  <div className="font-mono font-medium">{device.network.macAddress}</div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">网关配置</h3>
                              <div className="space-y-3">
                                {device.network.gateway && (
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">网关</div>
                                    <div className="font-mono font-medium">{device.network.gateway}</div>
                                  </div>
                                )}
                                {device.network.dns && (
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">DNS</div>
                                    <div className="font-mono font-medium">{device.network.dns}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* 内容标签页 */}
                <TabsContent value="content" className="m-0">
                  <div className="p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                      {device.content.currentProgram && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Play className="w-5 h-5" />
                              当前播放
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-6">
                              <img
                                src={device.content.currentProgram.thumbnail}
                                alt={device.content.currentProgram.programName}
                                className="w-32 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik01NiAzMkg3MlY0OEg1NlYzMloiIGZpbGw9IiM5NDk0QTgiLz4KPC9zdmc+Cg=='
                                }}
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{device.content.currentProgram.programName}</h3>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  播放进度: {device.content.currentProgram.progress}% | 时长: {device.content.currentProgram.duration}秒
                                </div>
                                <div className="mt-3">
                                  <Progress value={device.content.currentProgram.progress} className="h-2" />
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Play className="w-4 h-4" />
                                播放控制
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            播放列表
                          </CardTitle>
                          <CardDescription>设备当前的播放内容列表</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {device.content.playlist.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {item.type} • {item.size} • {item.source}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-400">
                                  {new Date(item.addTime).toLocaleString("zh-CN")}
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {device.content.playlist.length === 0 && (
                              <div className="text-center py-12 text-slate-400">
                                <FileText className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-lg">暂无播放内容</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* 其他标签页的占位符 */}
                <TabsContent value="program" className="m-0">
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">程序管理</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-16 text-slate-400">
                            <Calendar className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">程序管理功能开发中...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="monitor" className="m-0">
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">系统监控</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-16 text-slate-400">
                            <Activity className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">系统监控功能开发中...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="map" className="m-0">
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">位置地图</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-16 text-slate-400">
                            <MapPin className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">位置地图功能开发中...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="m-0">
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">操作日志</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-16 text-slate-400">
                            <FileText className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">操作日志功能开发中...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}