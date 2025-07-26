"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Search,
  Folder,
  FolderOpen,
  File,
  ImageIcon,
  Video,
  Music,
  Download,
  Eye,
  Trash2,
  Edit,
  MoreHorizontal,
  FolderPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"

// 模拟数据
const folderTree = {
  id: 1,
  name: "根目录",
  type: "folder",
  children: [
    {
      id: 2,
      name: "视频素材",
      type: "folder",
      children: [
        { id: 3, name: "宣传视频", type: "folder", children: [] },
        { id: 4, name: "广告视频", type: "folder", children: [] },
      ],
    },
    {
      id: 5,
      name: "图片素材",
      type: "folder",
      children: [
        { id: 6, name: "LOGO", type: "folder", children: [] },
        { id: 7, name: "背景图", type: "folder", children: [] },
      ],
    },
    { id: 8, name: "音频素材", type: "folder", children: [] },
  ],
}

const mockFiles = [
  {
    id: 1,
    name: "宣传视频_2024.mp4",
    type: "video",
    size: "245.6 MB",
    uploadTime: "2024-01-15T10:30:00",
    status: "已转码",
    thumbnail: "/placeholder.svg?height=60&width=60",
    duration: "00:03:45",
  },
  {
    id: 2,
    name: "产品展示.jpg",
    type: "image",
    size: "2.3 MB",
    uploadTime: "2024-01-20T14:20:00",
    status: "已处理",
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "背景音乐.mp3",
    type: "audio",
    size: "8.7 MB",
    uploadTime: "2024-01-22T09:15:00",
    status: "已处理",
    duration: "00:02:15",
  },
  {
    id: 4,
    name: "转码中视频.mp4",
    type: "video",
    size: "156.2 MB",
    uploadTime: "2024-01-25T16:45:00",
    status: "转码中",
    progress: 65,
  },
]

const transcodeJobs = [
  {
    id: 1,
    fileName: "宣传视频_2024.mp4",
    originalSize: "245.6 MB",
    targetFormat: "H.264 MP4",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T10:30:00",
    endTime: "2024-01-15T10:45:00",
  },
  {
    id: 2,
    fileName: "产品演示.mov",
    originalSize: "512.8 MB",
    targetFormat: "H.264 MP4",
    status: "processing",
    progress: 65,
    startTime: "2024-01-25T16:45:00",
    estimatedTime: "还需15分钟",
  },
  {
    id: 3,
    fileName: "广告片段.avi",
    originalSize: "89.3 MB",
    targetFormat: "H.264 MP4",
    status: "failed",
    progress: 0,
    startTime: "2024-01-24T11:20:00",
    error: "源文件格式不支持",
  },
  {
    id: 4,
    fileName: "培训视频.wmv",
    originalSize: "324.1 MB",
    targetFormat: "H.264 MP4",
    status: "pending",
    progress: 0,
    queuePosition: 2,
  },
]

const storageStats = {
  totalSpace: "1 TB",
  usedSpace: "256.7 GB",
  availableSpace: "767.3 GB",
  usagePercentage: 25.67,
  fileTypeBreakdown: [
    { type: "视频", size: "180.2 GB", percentage: 70.2, color: "bg-blue-500" },
    { type: "图片", size: "45.8 GB", percentage: 17.8, color: "bg-green-500" },
    { type: "音频", size: "28.3 GB", percentage: 11.0, color: "bg-purple-500" },
    { type: "其他", size: "2.4 GB", percentage: 1.0, color: "bg-gray-500" },
  ],
}

interface FolderTreeProps {
  node: any
  level: number
  onSelectFolder: (id: number, name: string) => void
  selectedFolder: number | null
  expandedFolders: Set<number>
  onToggleExpand: (id: number) => void
}

function FolderTreeNode({
  node,
  level,
  onSelectFolder,
  selectedFolder,
  expandedFolders,
  onToggleExpand,
}: FolderTreeProps) {
  const isExpanded = expandedFolders.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedFolder === node.id

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          isSelected ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectFolder(node.id, node.name)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <Folder className="w-4 h-4 text-blue-600" />
          )
        ) : (
          <Folder className="w-4 h-4 text-slate-500" />
        )}
        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child: any) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelectFolder={onSelectFolder}
              selectedFolder={selectedFolder}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileManagement() {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(1)
  const [selectedFolderName, setSelectedFolderName] = useState("根目录")
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1, 2, 5]))
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [previewFile, setPreviewFile] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleToggleExpand = (id: number) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const handleSelectFolder = (id: number, name: string) => {
    setSelectedFolder(id)
    setSelectedFolderName(name)
  }

  const handleFileSelect = (id: number) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedFiles(newSelected)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5 text-blue-600" />
      case "image":
        return <ImageIcon className="w-5 h-5 text-green-600" />
      case "audio":
        return <Music className="w-5 h-5 text-purple-600" />
      default:
        return <File className="w-5 h-5 text-slate-500" />
    }
  }

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case "已转码":
      case "已处理":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">已完成</Badge>
      case "转码中":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">处理中</Badge>
            {progress && <span className="text-xs text-slate-500">{progress}%</span>}
          </div>
        )
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">失败</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">{status}</Badge>
    }
  }

  const getTranscodeStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "processing":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredFiles = mockFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">素材管理</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">管理和组织您的媒体文件资源</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Link href="/file-management">
            <Button variant="default" size="sm">
              文件浏览
            </Button>
          </Link>
          <Link href="/file-management/upload">
            <Button variant="outline" size="sm">
              文件上传
            </Button>
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 文件夹树 */}
          <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Folder className="w-5 h-5 text-blue-600" />
                文件夹
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FolderTreeNode
                node={folderTree}
                level={0}
                onSelectFolder={handleSelectFolder}
                selectedFolder={selectedFolder}
                expandedFolders={expandedFolders}
                onToggleExpand={handleToggleExpand}
              />

              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 mt-4">
                    <FolderPlus className="w-4 h-4" />
                    新建文件夹
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建文件夹</DialogTitle>
                    <DialogDescription>在 {selectedFolderName} 下创建新文件夹</DialogDescription>
                  </DialogHeader>
                  <div>
                    <Label htmlFor="folderName">文件夹名称</Label>
                    <Input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="请输入文件夹名称"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={() => setIsCreateFolderOpen(false)}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* 文件列表 */}
          <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedFolderName}</CardTitle>
                  <CardDescription>当前文件夹中的文件列表</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Upload className="w-4 h-4" />
                    上传文件
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 搜索栏 */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索文件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* 批量操作 */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <span className="text-sm text-blue-800 dark:text-blue-400">已选择 {selectedFiles.size} 个文件</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      批量下载
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 text-red-600 bg-transparent">
                      <Trash2 className="w-4 h-4" />
                      批量删除
                    </Button>
                  </div>
                </div>
              )}

              {/* 文件表格 */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </TableHead>
                      <TableHead>文件名</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>大小</TableHead>
                      <TableHead>上传时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => handleFileSelect(file.id)}
                            className="rounded border-slate-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {file.thumbnail ? (
                              <img
                                src={file.thumbnail || "/placeholder.svg"}
                                alt={file.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              {file.duration && <p className="text-xs text-slate-500">{file.duration}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="capitalize">{file.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{file.size}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(file.uploadTime).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell>{getStatusBadge(file.status, file.progress)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setPreviewFile(file)
                                  setIsPreviewOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                预览
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="w-4 h-4" />
                                下载
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                重命名
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 文件预览对话框 */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewFile && getFileIcon(previewFile.type)}
                {previewFile?.name}
              </DialogTitle>
            </DialogHeader>
            {previewFile && (
              <div className="space-y-4">
                <div className="flex justify-center bg-slate-50 dark:bg-slate-800 rounded-lg p-8 min-h-[300px] items-center">
                  {previewFile.type === "image" ? (
                    <img
                      src={previewFile.thumbnail || "/placeholder.svg"}
                      alt={previewFile.name}
                      className="max-w-full max-h-full rounded-lg"
                    />
                  ) : previewFile.type === "video" ? (
                    <video controls className="max-w-full max-h-full rounded-lg">
                      <source src="/placeholder-video.mp4" type="video/mp4" />
                      您的浏览器不支持视频播放。
                    </video>
                  ) : (
                    <div className="text-center">
                      {getFileIcon(previewFile.type)}
                      <p className="text-slate-500 mt-2">此文件类型暂不支持预览</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">文件大小：</span>
                    <span className="font-medium">{previewFile.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">上传时间：</span>
                    <span className="font-medium">{new Date(previewFile.uploadTime).toLocaleString("zh-CN")}</span>
                  </div>
                  {previewFile.duration && (
                    <div>
                      <span className="text-slate-500">时长：</span>
                      <span className="font-medium">{previewFile.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                关闭
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                下载
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
