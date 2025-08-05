"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Monitor,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Building2,
  Wifi,
  WifiOff,
  Trash2,
  Edit,
  Settings,
  Play,
  Pause,
  Activity,
  List,
  Grid3X3,
  Sun,
  Palette,
  Tv,
  Image,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useEffect, useCallback, useMemo } from "react"
import { terminalApi, type Terminal as ApiTerminal, type TerminalGroupTreeNode } from "@/lib/api/terminal"
import DeviceDetailDialog, { type DeviceDetailInfo } from "@/components/DeviceDetailDialog"

// 清除模拟数据，现在使用真实API

// 终端型号选项
const terminalModelOptions = [
  { value: "LED-4K-65", label: "LED-4K-65" },
  { value: "LED-4K-55", label: "LED-4K-55" },
  { value: "LED-4K-75", label: "LED-4K-75" },
  { value: "LED-HD-32", label: "LED-HD-32" },
  { value: "LED-Outdoor-100", label: "LED-Outdoor-100" },
]

interface TerminalGroupNode {
  tgid: number
  tgName: string
  terminalCount: number
  children: TerminalGroupNode[]
  parent?: number
  path?: string
  description?: string
  hasPermission?: boolean
}

// 扩展的终端信息接口（暂未开发的API字段）
interface TerminalExtendedInfo {
  // 当前播放节目信息
  currentProgram?: {
    programId: number
    programName: string
    thumbnail: string // 节目截图URL
  }
  // 显示参数
  display: {
    resolution: string // 分辨率，如 "1920x1080"
    brightness: number // 亮度 0-100
    colorTemperature: number // 色温，如 6500K
  }
}

// 基础终端信息接口（继承API接口并添加扩展信息）
interface Terminal extends ApiTerminal {
  // 扩展信息（异步加载）
  extendedInfo?: TerminalExtendedInfo
  loadingExtended?: boolean
}

interface TerminalGroupTreeProps {
  node: TerminalGroupNode
  level: number
  selectedGroup: number | null
  onSelectGroup: (tgid: number) => void
  expandedGroups: Set<number>
  onToggleExpand: (tgid: number) => void
}

// Terminal Card Component
interface TerminalCardProps {
  terminal: Terminal
  selected: boolean
  onSelect: (e: React.MouseEvent) => void
  onClick: () => void
  onLoadExtended: () => void
}

function TerminalCard({ 
  terminal, 
  selected, 
  onSelect, 
  onClick,
  onLoadExtended 
}: TerminalCardProps) {
  // 自动加载扩展信息
  React.useEffect(() => {
    if (!terminal.extendedInfo && !terminal.loadingExtended) {
      onLoadExtended()
    }
  }, [terminal.extendedInfo, terminal.loadingExtended, onLoadExtended])

  const getOnlineStatusBadge = (onlineStatus: number) => {
    return onlineStatus === 1 ? (
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

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {terminal.terminalName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {terminal.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e as unknown as React.MouseEvent<Element, MouseEvent>)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            {getOnlineStatusBadge(terminal.onlineStatus)}
          </div>
        </div>

        {/* Program Display Area */}
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden">
          {terminal.loadingExtended ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-2 w-full p-4">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          ) : terminal.extendedInfo?.currentProgram ? (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={terminal.extendedInfo.currentProgram.thumbnail}
                alt={terminal.extendedInfo.currentProgram.programName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xNDQgNzJIMTc2VjEwOEgxNDRWNzJaIiBmaWxsPSIjOTQ5NEE4Ii8+Cjwvc3ZnPgo='
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center gap-2 text-white">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="w-4 h-4" />
                  <span className="text-sm truncate">{terminal.extendedInfo.currentProgram.programName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Tv className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">暂无播放节目</p>
              </div>
            </div>
          )}
        </div>

        {/* Technical Specs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">型号</span>
            <Badge variant="outline" className="font-mono text-xs">
              {terminal.terminalModel}
            </Badge>
          </div>
          
          {terminal.loadingExtended ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm">分辨率</span>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm">亮度</span>
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm">色温</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ) : terminal.extendedInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">分辨率</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">
                  {terminal.extendedInfo.display.resolution}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Sun className="w-3 h-3" />
                  <span>亮度</span>
                </div>
                <span className="text-slate-900 dark:text-slate-100">
                  {terminal.extendedInfo.display.brightness}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Palette className="w-3 h-3" />
                  <span>色温</span>
                </div>
                                 <span className="text-slate-900 dark:text-slate-100">
                   {terminal.extendedInfo.display.colorTemperature}K
                 </span>
               </div>
             </div>
           ) : null}
           
           {/* Last Online Time for Offline Devices */}
           {terminal.onlineStatus === 0 && (
             <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                 <Clock className="w-3 h-3" />
                 <span>最后在线</span>
               </div>
               <span className="text-slate-900 dark:text-slate-100 text-xs">
                 {new Date(terminal.updatedAt).toLocaleString("zh-CN", {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                   hour: "2-digit",
                   minute: "2-digit",
                 })}
               </span>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
   )
}

function TerminalGroupTreeNode({
  node,
  level,
  selectedGroup,
  onSelectGroup,
  expandedGroups,
  onToggleExpand,
}: TerminalGroupTreeProps) {
  const isExpanded = expandedGroups.has(node.tgid)
  const hasChildren = node.children.length > 0
  const isSelected = selectedGroup === node.tgid

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          isSelected ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectGroup(node.tgid)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.tgid)
            }}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}
        <Monitor className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{node.tgName}</span>
        <Badge variant="secondary" className="text-xs">
          {node.terminalCount}
        </Badge>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TerminalGroupTreeNode
              key={child.tgid}
              node={child}
              level={level + 1}
              selectedGroup={selectedGroup}
              onSelectGroup={onSelectGroup}
              expandedGroups={expandedGroups}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DeviceManagementContent() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState<string>("all")
  const [terminalModelFilter, setTerminalModelFilter] = useState<string>("all")
  const [isCreateTerminalOpen, setIsCreateTerminalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  
  // API 状态管理
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [terminalGroupTree, setTerminalGroupTree] = useState<TerminalGroupNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTerminals, setLoadingTerminals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const [newTerminal, setNewTerminal] = useState({
    terminalName: "",
    description: "",
    terminalAccount: "",
    terminalPassword: "",
    terminalModel: "",
  })

  const [selectedTerminals, setSelectedTerminals] = useState<Set<number>>(new Set())
  const [selectedTerminalDetail, setSelectedTerminalDetail] = useState<Terminal | null>(null)
  const [isTerminalDetailOpen, setIsTerminalDetailOpen] = useState(false)

  // 生成设备详细信息（包含模拟的扩展数据）
  const generateDeviceDetailInfo = (terminal: Terminal): DeviceDetailInfo => {
    return {
      // 基础设备信息
      tid: terminal.tid,
      terminalName: terminal.terminalName,
      description: terminal.description,
      terminalModel: terminal.terminalModel,
      tgName: terminal.tgName,
      firmwareVersion: terminal.firmwareVersion,
      serialNumber: terminal.serialNumber,
      onlineStatus: terminal.onlineStatus,
      createdAt: terminal.createdAt,
      updatedAt: terminal.updatedAt,

      // 设备配置信息
      display: {
        resolution: ["1920x1080", "3840x2160", "2560x1440", "1366x768"][Math.floor(Math.random() * 4)],
        width: 256,
        height: 256,
        brightness: Math.floor(Math.random() * 100),
        contrast: Math.floor(Math.random() * 100),
        colorTemperature: [5000, 6500, 7500, 9300][Math.floor(Math.random() * 4)]
      },

      // 存储信息
      storage: {
        totalSpace: [32, 64, 128, 256, 512][Math.floor(Math.random() * 5)],
        usedSpace: 0,
        freeSpace: 0,
        usagePercentage: Math.floor(Math.random() * 80) + 10 // 10-90%
      },

      // 系统设置
      system: {
        timezone: "UTC+08:00 北京时间",
        language: "简体中文",
        autoRestart: Math.random() > 0.5,
        volume: Math.floor(Math.random() * 100),
        runTime: Math.floor(Math.random() * 8760) // 0-8760小时（一年）
      },

      // 网络信息
      network: {
        connectionStatus: terminal.onlineStatus === 1 ? "COMPLETED" : "DISCONNECTED",
        speed: terminal.onlineStatus === 1 ? "100Mbps" : "0Mbps",
        state: terminal.onlineStatus === 1 ? "UP" : "DOWN",
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        subnetMask: "255.255.255.0",
        macAddress: Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
        gateway: "192.168.1.1",
        dns: "8.8.8.8"
      },

      // 当前播放内容
      content: {
        currentProgram: Math.random() > 0.3 ? {
          programId: Math.floor(Math.random() * 1000),
          programName: ["企业宣传片", "产品展示", "新闻资讯", "广告推广", "欢迎信息"][Math.floor(Math.random() * 5)],
          thumbnail: `https://picsum.photos/320/180?random=${terminal.tid}`,
          duration: 120,
          progress: Math.floor(Math.random() * 100)
        } : undefined,
        playlist: Array.from({length: Math.floor(Math.random() * 6)}, (_, i) => ({
          id: i + 1,
          name: ["宣传视频", "产品介绍", "公司文化", "新闻播报", "广告片", "培训视频"][Math.floor(Math.random() * 6)],
          type: ["视频", "图片", "音频"][Math.floor(Math.random() * 3)],
          size: `${(Math.random() * 500 + 10).toFixed(1)}MB`,
          source: "Internet",
          addTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }))
      }
    }
  }

  // 计算存储使用情况
  const deviceDetailInfo = useMemo(() => {
    if (!selectedTerminalDetail) return null
    const info = generateDeviceDetailInfo(selectedTerminalDetail)
    info.storage.usedSpace = Math.floor(info.storage.totalSpace * info.storage.usagePercentage / 100)
    info.storage.freeSpace = info.storage.totalSpace - info.storage.usedSpace
    return info
  }, [selectedTerminalDetail])

  // 加载终端组树
  const loadTerminalGroupTree = async () => {
    try {
      setError(null)
      const response = await terminalApi.getTerminalGroupTree()
      
      // 将API响应转换为组件需要的格式
      if (response.accessibleTrees && response.accessibleTrees.length > 0) {
        // 计算每个节点的终端数量（递归计算）
        const convertTreeNode = (node: TerminalGroupTreeNode, parentCount = 0): TerminalGroupNode => {
          const children = node.children?.map(child => convertTreeNode(child)) || []
          const terminalCount = children.reduce((sum, child) => sum + child.terminalCount, 0) + parentCount
          
          return {
            tgid: node.tgid,
            tgName: node.tgName,
            terminalCount,
            children,
            parent: node.parent,
            path: node.path,
            description: node.description,
            hasPermission: node.hasPermission,
          }
        }
        
        // 使用第一个可访问的树作为根节点
        const rootNode = convertTreeNode(response.accessibleTrees[0])
        setTerminalGroupTree(rootNode)
        
        // 自动选择第一个组并展开
        setSelectedGroup(rootNode.tgid)
        setExpandedGroups(new Set([rootNode.tgid]))
      }
    } catch (error) {
      console.error('加载终端组树失败:', error)
      setError(error instanceof Error ? error.message : '加载终端组树失败')
      
      // 使用fallback数据
      const fallbackTree = {
        tgid: 1,
        tgName: "总部LED设备",
        terminalCount: 0,
        children: [],
      }
      setTerminalGroupTree(fallbackTree)
      setSelectedGroup(1)
      setExpandedGroups(new Set([1]))
    } finally {
      setLoading(false)
    }
  }

  // 加载终端列表
  const loadTerminals = useCallback(async (tgid: number, page = 1) => {
    if (!tgid) return
    
    try {
      setLoadingTerminals(true)
      setError(null)
      
      const params = {
        tgid,
        pageNum: page,
        pageSize: pagination.pageSize,
        includeSubGroups: true,
        keyword: searchQuery || undefined,
        terminalModel: terminalModelFilter !== "all" ? terminalModelFilter : undefined,
        onlineStatus: onlineStatusFilter !== "all" ? (onlineStatusFilter === "online" ? 1 : 0) : undefined,
      }
      
      const response = await terminalApi.getTerminalList(params)
      
      setTerminals(response.records.map(terminal => ({ ...terminal } as Terminal)))
      setPagination({
        pageNum: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      })
    } catch (error) {
      console.error('加载终端列表失败:', error)
      setError(error instanceof Error ? error.message : '加载终端列表失败')
      setTerminals([])
    } finally {
      setLoadingTerminals(false)
    }
  }, [pagination.pageSize, searchQuery, terminalModelFilter, onlineStatusFilter])

  // 初始化数据加载
  useEffect(() => {
    loadTerminalGroupTree()
  }, [])

  // 当选择的组或过滤条件改变时重新加载终端列表
  useEffect(() => {
    if (selectedGroup) {
      loadTerminals(selectedGroup, 1)
    }
  }, [selectedGroup, loadTerminals])

  const handleToggleExpand = (tgid: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(tgid)) {
      newExpanded.delete(tgid)
    } else {
      newExpanded.add(tgid)
    }
    setExpandedGroups(newExpanded)
  }

  // 模拟异步加载扩展信息
  const loadExtendedInfo = async (tid: number): Promise<TerminalExtendedInfo> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    // 模拟扩展数据
    const mockExtendedInfo: TerminalExtendedInfo = {
      currentProgram: Math.random() > 0.3 ? {
        programId: Math.floor(Math.random() * 1000),
        programName: ["企业宣传片", "产品展示", "新闻资讯", "广告推广", "欢迎信息"][Math.floor(Math.random() * 5)],
        thumbnail: `https://picsum.photos/320/180?random=${tid}`
      } : undefined,
      display: {
        resolution: ["1920x1080", "3840x2160", "2560x1440", "1366x768"][Math.floor(Math.random() * 4)],
        brightness: Math.floor(Math.random() * 100),
        colorTemperature: [5000, 6500, 7500, 9300][Math.floor(Math.random() * 4)]
      }
    }
    
    return mockExtendedInfo
  }

  // 加载终端扩展信息
  const handleLoadExtendedInfo = async (tid: number) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.tid === tid 
        ? { ...terminal, loadingExtended: true }
        : terminal
    ))

    try {
      const extendedInfo = await loadExtendedInfo(tid)
      setTerminals(prev => prev.map(terminal => 
        terminal.tid === tid 
          ? { ...terminal, extendedInfo, loadingExtended: false }
          : terminal
      ))
    } catch (error) {
      console.error("加载扩展信息失败:", error)
      setTerminals(prev => prev.map(terminal => 
        terminal.tid === tid 
          ? { ...terminal, loadingExtended: false }
          : terminal
      ))
    }
  }

  // 由于现在通过API进行过滤，这里只做本地搜索的补充过滤
  const filteredTerminals = terminals

  const selectedGroupName = terminalGroupTree?.children?.find(child => child.tgid === selectedGroup)?.tgName || terminalGroupTree?.tgName || "未选择组"

  const handleCreateTerminal = async () => {
    if (!selectedGroup) {
      setError("请先选择一个终端组")
      return
    }

    try {
      setLoadingTerminals(true)
      await terminalApi.createTerminal({
        ...newTerminal,
        tgid: selectedGroup,
      })
      
      // 创建成功后重新加载终端列表
      await loadTerminals(selectedGroup, pagination.pageNum)
      
      setIsCreateTerminalOpen(false)
      setNewTerminal({ 
        terminalName: "", 
        description: "", 
        terminalAccount: "", 
        terminalPassword: "", 
        terminalModel: "" 
      })
    } catch (error) {
      console.error('创建终端失败:', error)
      setError(error instanceof Error ? error.message : '创建终端失败')
    } finally {
      setLoadingTerminals(false)
    }
  }



  const handleTerminalRowClick = (terminal: Terminal) => {
    setSelectedTerminalDetail(terminal)
    setIsTerminalDetailOpen(true)
  }

  const handleTerminalSelect = (tid: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const newSelected = new Set(selectedTerminals)
    if (newSelected.has(tid)) {
      newSelected.delete(tid)
    } else {
      newSelected.add(tid)
    }
    setSelectedTerminals(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTerminals.size === filteredTerminals.length) {
      setSelectedTerminals(new Set())
    } else {
      setSelectedTerminals(new Set(filteredTerminals.map((terminal) => terminal.tid)))
    }
  }

  const getOnlineStatusBadge = (onlineStatus: number) => {
    return onlineStatus === 1 ? (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">设备管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理LED终端设备、分组和状态监控</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Terminal Groups */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5 text-blue-600" />
                终端组
              </CardTitle>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">设备分组管理</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="space-y-3 w-full">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-6 w-3/4 ml-4" />
                  <Skeleton className="h-6 w-2/3 ml-8" />
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={loadTerminalGroupTree}
                >
                  重试
                </Button>
              </div>
            ) : terminalGroupTree ? (
              <TerminalGroupTreeNode
                node={terminalGroupTree}
                level={0}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                expandedGroups={expandedGroups}
                onToggleExpand={handleToggleExpand}
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-slate-500">暂无终端组数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Content - Terminal List */}
        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedGroupName}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedGroupName} 组的设备信息</p>
              </div>
                             <div className="flex items-center gap-2">
                 <Button size="sm" className="gap-2" onClick={() => setIsCreateTerminalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  添加设备
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-800 dark:text-red-200 flex-1">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectedGroup && loadTerminals(selectedGroup, pagination.pageNum)}
                  disabled={loadingTerminals}
                >
                  {loadingTerminals ? <Loader2 className="w-4 h-4 animate-spin" /> : "重试"}
                </Button>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索设备名称、描述或序列号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  disabled={loadingTerminals}
                />
              </div>
              <div className="flex gap-2">
                <Select value={onlineStatusFilter} onValueChange={setOnlineStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="online">在线</SelectItem>
                    <SelectItem value="offline">离线</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={terminalModelFilter} onValueChange={setTerminalModelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部型号</SelectItem>
                    {terminalModelOptions.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* View Toggle */}
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grid")}>
                  <ToggleGroupItem value="list" aria-label="列表视图">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="grid" aria-label="卡片视图">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Batch Operations */}
            {selectedTerminals.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <span className="text-sm text-blue-800 dark:text-blue-400">已选择 {selectedTerminals.size} 个设备</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Play className="w-4 h-4" />
                    批量启动
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Pause className="w-4 h-4" />
                    批量停止
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="w-4 h-4" />
                    批量删除
                  </Button>
                </div>
              </div>
            )}

            {/* Terminal Display */}
            {loadingTerminals ? (
              <div className="space-y-4">
                {viewMode === "list" ? (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead className="w-12"></TableHead>
                          <TableHead>设备名称</TableHead>
                          <TableHead>所属组</TableHead>
                          <TableHead>设备型号</TableHead>
                          <TableHead>序列号</TableHead>
                          <TableHead>固件版本</TableHead>
                          <TableHead>在线状态</TableHead>
                          <TableHead>更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                      <Card key={index} className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Skeleton className="w-10 h-10 rounded-lg" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                              </div>
                            </div>
                            <Skeleton className="w-12 h-5" />
                          </div>
                          <Skeleton className="aspect-video w-full rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : viewMode === "list" ? (
              /* Terminal Table */
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedTerminals.size === filteredTerminals.length && filteredTerminals.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                      </TableHead>
                      <TableHead>设备名称</TableHead>
                      <TableHead>所属组</TableHead>
                      <TableHead>设备型号</TableHead>
                      <TableHead>序列号</TableHead>
                      <TableHead>固件版本</TableHead>
                      <TableHead>在线状态</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTerminals.map((terminal) => (
                      <TableRow
                        key={terminal.tid}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => handleTerminalRowClick(terminal)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTerminals.has(terminal.tid)}
                            onChange={(e) => handleTerminalSelect(terminal.tid, e as unknown as React.MouseEvent<Element, MouseEvent>)}
                            className="rounded border-slate-300 dark:border-slate-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Monitor className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="font-medium">{terminal.terminalName}</span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{terminal.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span>{terminal.tgName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {terminal.terminalModel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {terminal.serialNumber}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {terminal.firmwareVersion}
                        </TableCell>
                        <TableCell>
                          {getOnlineStatusBadge(terminal.onlineStatus)}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(terminal.updatedAt).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                                <Edit className="w-4 h-4" />
                                编辑设备
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Settings className="w-4 h-4" />
                                设备配置
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Activity className="w-4 h-4" />
                                性能监控
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                {terminal.onlineStatus === 1 ? (
                                  <>
                                    <Pause className="w-4 h-4" />
                                    停止设备
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    启动设备
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                删除设备
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Terminal Grid Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTerminals.map((terminal) => (
                  <TerminalCard
                    key={terminal.tid}
                    terminal={terminal}
                    selected={selectedTerminals.has(terminal.tid)}
                    onSelect={(e) => handleTerminalSelect(terminal.tid, e)}
                    onClick={() => handleTerminalRowClick(terminal)}
                    onLoadExtended={() => handleLoadExtendedInfo(terminal.tid)}
                  />
                ))}
              </div>
            )}

            {filteredTerminals.length === 0 && (
              <div className="text-center py-12">
                <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">没有找到匹配的设备</p>
              </div>
            )}

            {/* Terminal Detail Dialog */}
            <DeviceDetailDialog 
              device={deviceDetailInfo}
              open={isTerminalDetailOpen}
              onOpenChange={setIsTerminalDetailOpen}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 