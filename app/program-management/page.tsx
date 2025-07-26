"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Send,
  Users,
  FileVideo,
  Eye,
  Copy,
  Download,
} from "lucide-react"
import Link from "next/link"

// 模拟数据
const mockPrograms = [
  {
    id: 1,
    name: "春节宣传节目",
    description: "2024年春节主题宣传内容",
    duration: "00:05:30",
    status: "published",
    createTime: "2024-01-10T09:00:00",
    updateTime: "2024-01-15T14:30:00",
    creator: "张三",
    playCount: 156,
    thumbnail: "/placeholder.svg?height=80&width=120",
    scenes: 5,
    devices: 12,
  },
  {
    id: 2,
    name: "产品展示节目",
    description: "最新产品功能展示",
    duration: "00:03:45",
    status: "draft",
    createTime: "2024-01-20T10:15:00",
    updateTime: "2024-01-22T16:20:00",
    creator: "李四",
    playCount: 0,
    thumbnail: "/placeholder.svg?height=80&width=120",
    scenes: 3,
    devices: 0,
  },
  {
    id: 3,
    name: "企业文化宣传",
    description: "公司企业文化展示内容",
    duration: "00:08:15",
    status: "playing",
    createTime: "2024-01-05T14:45:00",
    updateTime: "2024-01-25T11:30:00",
    creator: "王五",
    playCount: 89,
    thumbnail: "/placeholder.svg?height=80&width=120",
    scenes: 8,
    devices: 25,
  },
]

const mockDevices = [
  { id: 1, name: "大厅LED屏-001", location: "一楼大厅", status: "online", group: "大厅组" },
  { id: 2, name: "会议室屏幕-A", location: "三楼会议室A", status: "online", group: "会议室组" },
  { id: 3, name: "展厅LED屏-002", location: "二楼展厅", status: "offline", group: "展厅组" },
  { id: 4, name: "办公区屏幕-B1", location: "二楼办公区", status: "online", group: "办公组" },
  { id: 5, name: "接待处屏幕", location: "一楼接待", status: "online", group: "大厅组" },
]

const mockSchedules = [
  {
    id: 1,
    name: "工作日播放计划",
    description: "周一至周五的常规播放安排",
    programs: ["春节宣传节目", "企业文化宣传"],
    devices: ["大厅LED屏-001", "接待处屏幕"],
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    timeSlots: [
      { start: "09:00", end: "12:00", program: "企业文化宣传" },
      { start: "13:00", end: "18:00", program: "春节宣传节目" },
    ],
    status: "active",
    priority: "high",
  },
  {
    id: 2,
    name: "周末特殊播放",
    description: "周末展示内容安排",
    programs: ["产品展示节目"],
    devices: ["展厅LED屏-002"],
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    timeSlots: [{ start: "10:00", end: "17:00", program: "产品展示节目" }],
    status: "pending",
    priority: "medium",
  },
]

const mediaAssets = [
  {
    id: 1,
    name: "春节背景视频.mp4",
    type: "video",
    size: "125.6 MB",
    duration: "00:02:30",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: true,
  },
  {
    id: 2,
    name: "公司LOGO.png",
    type: "image",
    size: "2.1 MB",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: false,
  },
  {
    id: 3,
    name: "产品介绍.mp4",
    type: "video",
    size: "89.3 MB",
    duration: "00:01:45",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: true,
  },
  {
    id: 4,
    name: "背景音乐.mp3",
    type: "audio",
    size: "5.8 MB",
    duration: "00:03:20",
    used: false,
  },
]

export default function ProgramManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const [isProgramDetailOpen, setIsProgramDetailOpen] = useState(false)
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedDevices, setSelectedDevices] = useState<Set<number>>(new Set())
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set())

  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    scenes: [] as any[],
  })

  const [publishSettings, setPublishSettings] = useState({
    devices: [] as number[],
    startTime: "",
    endTime: "",
    priority: "medium",
    autoPlay: true,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">已发布</Badge>
      case "playing":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">播放中</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">草稿</Badge>
      case "stopped":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">已停止</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDeviceStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">在线</Badge>
      case "offline":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">离线</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">执行中</Badge>
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">待执行</Badge>
        )
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">已过期</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const handleDeviceSelect = (deviceId: number) => {
    const newSelected = new Set(selectedDevices)
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId)
    } else {
      newSelected.add(deviceId)
    }
    setSelectedDevices(newSelected)
  }

  const handleAssetSelect = (assetId: number) => {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssets(newSelected)
  }

  const filteredPrograms = mockPrograms.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">节目管理</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">创建、管理和发布LED显示节目内容</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button variant="default" size="sm">
            节目列表
          </Button>
          <Link href="/program-management/create">
            <Button variant="outline" size="sm">
              创建节目
            </Button>
          </Link>
          <Link href="/program-management/publish">
            <Button variant="outline" size="sm">
              节目发布
            </Button>
          </Link>
          <Link href="/program-management/schedule">
            <Button variant="outline" size="sm">
              排程管理
            </Button>
          </Link>
        </div>

        {/* 节目列表 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-blue-600" />
                  节目列表
                </CardTitle>
                <CardDescription>管理已创建的节目内容</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                新建节目
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 搜索栏 */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="搜索节目名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* 节目网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <div
                    onClick={() => {
                      setSelectedProgram(program)
                      setIsProgramDetailOpen(true)
                    }}
                  >
                    <div className="relative">
                      <img
                        src={program.thumbnail || "/placeholder.svg"}
                        alt={program.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 left-2">{getStatusBadge(program.status)}</div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {program.duration}
                        </Badge>
                      </div>
                      {program.status === "playing" && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-t-lg">
                          <div className="bg-green-600 text-white p-2 rounded-full">
                            <Play className="w-6 h-6 fill-current" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{program.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {program.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {program.creator}
                        </span>
                        <span>{new Date(program.updateTime).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-medium">{program.scenes}</div>
                          <div className="text-slate-500">场景</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-medium">{program.devices}</div>
                          <div className="text-slate-500">设备</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-medium">{program.playCount}</div>
                          <div className="text-slate-500">播放</div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <CardContent className="px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent">
                        <Edit className="w-3 h-3" />
                        编辑
                      </Button>
                      <Button size="sm" className="flex-1 gap-2">
                        <Send className="w-3 h-3" />
                        发布
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="w-4 h-4" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="w-4 h-4" />
                            导出
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 节目详情对话框 */}
        <Dialog open={isProgramDetailOpen} onOpenChange={setIsProgramDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <img
                  src={selectedProgram?.thumbnail || "/placeholder.svg"}
                  alt={selectedProgram?.name}
                  className="w-16 h-12 rounded object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold">{selectedProgram?.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedProgram?.description}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedProgram && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedProgram.duration}</div>
                    <div className="text-sm text-slate-500">总时长</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedProgram.scenes}</div>
                    <div className="text-sm text-slate-500">场景数</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedProgram.devices}</div>
                    <div className="text-sm text-slate-500">发布设备</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedProgram.playCount}</div>
                    <div className="text-sm text-slate-500">播放次数</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-900 dark:text-slate-100">基本信息</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">创建者</span>
                        <span className="font-medium">{selectedProgram.creator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">状态</span>
                        {getStatusBadge(selectedProgram.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">创建时间</span>
                        <span className="font-medium">
                          {new Date(selectedProgram.createTime).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">更新时间</span>
                        <span className="font-medium">
                          {new Date(selectedProgram.updateTime).toLocaleString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium text-slate-900 dark:text-slate-100">节目预览</Label>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                      <FileVideo className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">点击预览节目内容</p>
                      <Button variant="outline" className="mt-3 gap-2 bg-transparent">
                        <Eye className="w-4 h-4" />
                        预览节目
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProgramDetailOpen(false)}>
                关闭
              </Button>
              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                编辑节目
              </Button>
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                发布节目
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
