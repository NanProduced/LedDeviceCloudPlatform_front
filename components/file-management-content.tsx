"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MaterialTree } from "@/components/ui/material-tree"
import MaterialAPI from "@/lib/api/material" 
import MaterialTreeAdapter from "@/lib/utils/materialTreeAdapter"
import { Material, SharedMaterial } from "@/lib/types"
import {
  Search,
  Folder,
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
  Loader2,
  HelpCircle,
} from "lucide-react"

// 现在使用真实的API数据，不再需要模拟数据

// 素材节点名称映射
const getNodeDisplayName = (nodeId: string) => {
  const nodeMap: Record<string, string> = {
    "all": "全部素材",
    "group-1": "设备组素材A",
    "group-2": "设备组素材B", 
    "group-3": "虚拟设备组目录",
    "public": "公共素材组",
    "shared": "分享文件夹",
    "group-1-video": "视频文件夹A",
    "group-1-image": "图片文件夹A",
    "group-2-audio": "音频文件夹B",
    "public-video": "公共视频文件夹A",
    "public-image": "公共图片文件夹B",
    "shared-folder-1": "来自销售部的分享",
    "shared-folder-2": "来自市场部的分享",
  }
  return nodeMap[nodeId] || nodeId
}

export default function FileManagementContent() {
  const [selectedNode, setSelectedNode] = useState<string>("")
  const [selectedFolderName, setSelectedFolderName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [materials, setMaterials] = useState<(Material | SharedMaterial)[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [includeSub, setIncludeSub] = useState<boolean>(false)
  const [showIncludeSubOption, setShowIncludeSubOption] = useState<boolean>(false)
  const [initializing, setInitializing] = useState<boolean>(true)

  const handleNodeSelect = async (nodeId: string) => {
    setSelectedNode(nodeId)
    setSelectedFolderName(getNodeDisplayName(nodeId))
    
    // 根据节点类型判断是否显示includeSub选项并加载材料
    try {
      const { apiType } = MaterialTreeAdapter.getApiCallParams(nodeId)
      setShowIncludeSubOption(apiType === 'user' || apiType === 'public' || apiType === 'shared')
      await loadMaterials(nodeId)
    } catch (error) {
      console.error('API参数解析失败:', error)
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      setError(`无法处理节点选择: ${errorMsg}`)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // 根据节点加载对应的素材列表
  const loadMaterials = async (nodeId: string) => {
    try {
      setLoading(true)
      setError("")
      
      const { apiType, params } = MaterialTreeAdapter.getApiCallParams(nodeId)
      
      let materialList: (Material | SharedMaterial)[] = []
      
      switch (apiType) {
        case 'all':
          materialList = await MaterialAPI.listAllMaterials()
          break
        case 'user':
          materialList = await MaterialAPI.listUserMaterials(params.ugid, params.fid, includeSub)
          break
        case 'public':
          materialList = await MaterialAPI.listPublicMaterials(params.fid, includeSub)
          break
        case 'shared':
          materialList = await MaterialAPI.listSharedMaterials(params.fid, includeSub)
          break
        default:
          throw new Error(`不支持的API类型: ${apiType}`)
      }
      
      setMaterials(materialList)
    } catch (error) {
      console.error('Failed to load materials:', error)
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      setError(`加载素材列表失败: ${errorMsg}`)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  // 初始化默认选择用户组根目录
  useEffect(() => {
    const initializeDefault = async () => {
      try {
        setInitializing(true)
        setError("")
        
        // 获取素材树数据来确定默认选择的用户组
        const treeData = await MaterialAPI.initMaterialTree()
        
        // 默认选择用户组根目录（rootUserGroupNode本身）
        if (treeData.rootUserGroupNode) {
          const rootUserGroupId = `group-${treeData.rootUserGroupNode.ugid}`
          const rootUserGroupName = treeData.rootUserGroupNode.groupName
          
          setSelectedNode(rootUserGroupId)
          setSelectedFolderName(rootUserGroupName)
          setShowIncludeSubOption(true) // 用户组需要显示includeSub选项
          
          // 加载该用户组的素材
          await loadMaterials(rootUserGroupId)
        }
      } catch (error) {
        console.error('Failed to initialize default selection:', error)
        const errorMsg = error instanceof Error ? error.message : '未知错误'
        setError(`初始化失败: ${errorMsg}`)
      } finally {
        setInitializing(false)
      }
    }
    
    initializeDefault()
  }, [])
  
  // 当includeSub状态变化时重新加载素材
  useEffect(() => {
    if (selectedNode && !initializing) {
      loadMaterials(selectedNode)
    }
  }, [includeSub])

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

  const getStatusBadge = (material: Material | SharedMaterial) => {
    const statusMap: Record<number, { label: string; className: string }> = {
      0: { label: "已完成", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      1: { label: "处理中", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      2: { label: "失败", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
    }
    
    const status = statusMap[material.fileStatus] || { label: material.fileStatusDesc, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" }
    
    return (
      <div className="flex items-center gap-2">
        <Badge className={status.className}>{status.label}</Badge>
        {material.processProgress !== undefined && material.fileStatus === 1 && (
          <span className="text-xs text-slate-500">{material.processProgress}%</span>
        )}
      </div>
    )
  }

  const filteredMaterials = materials.filter((material) => 
    material.materialName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">素材管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理和组织您的媒体文件资源</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 素材树 */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="w-5 h-5 text-blue-600" />
              素材分类
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <MaterialTree 
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              onError={handleError}
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
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索文件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              
              {/* 是否包含子组勾选框 */}
              {showIncludeSubOption && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-sub"
                      checked={includeSub}
                      onCheckedChange={(checked) => setIncludeSub(checked as boolean)}
                    />
                    <label
                      htmlFor="include-sub"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      是否包含子组
                    </label>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>勾选后将查询当前组及其所有子组下的素材文件</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">加载中...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          {searchQuery ? "没有找到匹配的文件" : "此文件夹为空"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material.mid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                              {getFileIcon(material.materialType.toLowerCase())}
                            </div>
                            <div>
                              <p className="font-medium">{material.materialName}</p>
                              <p className="text-xs text-slate-500">ID: {material.mid}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(material.materialType.toLowerCase())}
                            <span className="capitalize">{material.materialType.toLowerCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {material.fileSizeFormatted}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(material.uploadTime).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell>{getStatusBadge(material)}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
