"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
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
  ChevronRight,
  ChevronDown,
} from "lucide-react"

// Mock data
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
]

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

export default function FileManagementContent() {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(1)
  const [selectedFolderName, setSelectedFolderName] = useState("根目录")
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1, 2, 5]))
  const [searchQuery, setSearchQuery] = useState("")

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "已转码":
      case "已处理":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">已完成</Badge>
      case "转码中":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">处理中</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">{status}</Badge>
    }
  }

  const filteredFiles = mockFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">素材管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理和组织您的媒体文件资源</p>
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

            <Button variant="ghost" className="w-full justify-start gap-2 mt-4">
              <FolderPlus className="w-4 h-4" />
              新建文件夹
            </Button>
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

            {/* 文件表格 */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
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
                      <TableCell>{getStatusBadge(file.status)}</TableCell>
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
                            <DropdownMenuItem className="gap-2">
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
    </div>
  )
}
