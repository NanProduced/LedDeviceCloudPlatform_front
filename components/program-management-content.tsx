"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
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

export default function ProgramManagementContent() {
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredPrograms = mockPrograms.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">节目管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">创建、管理和发布LED显示节目内容</p>
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
                <div>
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
    </div>
  )
}
