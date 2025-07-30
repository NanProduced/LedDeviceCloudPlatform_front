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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
  FolderPlus,
  Activity,
  List,
  Grid3X3,
  Sun,
  Palette,
  Tv,
  Image,
} from "lucide-react"

// 模拟终端组树数据
const terminalGroupTree = {
  tgid: 1,
  tgName: "总部LED设备",
  terminalCount: 245,
  children: [
    {
      tgid: 2,
      tgName: "一楼大厅",
      terminalCount: 12,
      children: [
        {
          tgid: 3,
          tgName: "接待区",
          terminalCount: 4,
          children: [],
        },
        {
          tgid: 4,
          tgName: "展示区",
          terminalCount: 8,
          children: [],
        },
      ],
    },
    {
      tgid: 5,
      tgName: "二楼办公区",
      terminalCount: 25,
      children: [
        {
          tgid: 6,
          tgName: "会议室",
          terminalCount: 10,
          children: [],
        },
        {
          tgid: 7,
          tgName: "开放办公区",
          terminalCount: 15,
          children: [],
        },
      ],
    },
    {
      tgid: 8,
      tgName: "户外广告屏",
      terminalCount: 20,
      children: [],
    },
  ],
}

// 模拟终端列表数据
const mockTerminals = [
  {
    tid: 1,
    terminalName: "大厅主屏",
    description: "一楼大厅主要展示屏幕",
    terminalModel: "LED-4K-65",
    tgid: 2,
    tgName: "一楼大厅",
    firmwareVersion: "v2.1.5",
    serialNumber: "SN2024001001",
    onlineStatus: 1,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-25T14:20:00",
  },
  {
    tid: 2,
    terminalName: "接待台屏幕",
    description: "接待台信息展示屏",
    terminalModel: "LED-HD-32",
    tgid: 3,
    tgName: "接待区",
    firmwareVersion: "v2.0.8",
    serialNumber: "SN2024001002",
    onlineStatus: 1,
    createdAt: "2024-01-18T09:15:00",
    updatedAt: "2024-01-24T16:45:00",
  },
  {
    tid: 3,
    terminalName: "产品展示屏A",
    description: "产品展示区A区域屏幕",
    terminalModel: "LED-4K-55",
    tgid: 4,
    tgName: "展示区",
    firmwareVersion: "v2.1.3",
    serialNumber: "SN2024001003",
    onlineStatus: 0,
    createdAt: "2024-01-20T11:20:00",
    updatedAt: "2024-01-23T10:30:00",
  },
  {
    tid: 4,
    terminalName: "会议室主屏",
    description: "主会议室投影屏幕",
    terminalModel: "LED-4K-75",
    tgid: 6,
    tgName: "会议室",
    firmwareVersion: "v2.1.5",
    serialNumber: "SN2024001004",
    onlineStatus: 1,
    createdAt: "2024-02-01T14:30:00",
    updatedAt: "2024-02-01T14:30:00",
  },
  {
    tid: 5,
    terminalName: "户外广告屏1号",
    description: "正门入口户外LED广告屏",
    terminalModel: "LED-Outdoor-100",
    tgid: 8,
    tgName: "户外广告屏",
    firmwareVersion: "v1.8.2",
    serialNumber: "SN2024001005",
    onlineStatus: 0,
    createdAt: "2024-01-10T08:00:00",
    updatedAt: "2024-01-22T12:15:00",
  },
]

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
}

// 扩展的终端信息接口
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

// 基础终端信息接口
interface Terminal {
  tid: number
  terminalName: string
  description: string
  terminalModel: string
  tgid: number
  tgName: string
  firmwareVersion: string
  serialNumber: string
  onlineStatus: number
  createdAt: string
  updatedAt: string
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
                  <Image className="w-4 h-4" alt="" />
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
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1, 2, 5]))
  const [searchQuery, setSearchQuery] = useState("")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState<string>("all")
  const [terminalModelFilter, setTerminalModelFilter] = useState<string>("all")
  const [isCreateTerminalOpen, setIsCreateTerminalOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [terminals, setTerminals] = useState<Terminal[]>(mockTerminals as Terminal[])
  const [newTerminal, setNewTerminal] = useState({
    terminalName: "",
    description: "",
    terminalAccount: "",
    terminalPassword: "",
    terminalModel: "",
  })
  const [newGroup, setNewGroup] = useState({
    terminalGroupName: "",
    description: "",
  })

  const [selectedTerminals, setSelectedTerminals] = useState<Set<number>>(new Set())
  const [selectedTerminalDetail, setSelectedTerminalDetail] = useState<Terminal | null>(null)
  const [isTerminalDetailOpen, setIsTerminalDetailOpen] = useState(false)

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

  const filteredTerminals = terminals.filter((terminal) => {
    const matchesSearch = 
      terminal.terminalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      terminal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      terminal.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesOnlineStatus = 
      onlineStatusFilter === "all" || 
      (onlineStatusFilter === "online" && terminal.onlineStatus === 1) ||
      (onlineStatusFilter === "offline" && terminal.onlineStatus === 0)
    
    const matchesModel = 
      terminalModelFilter === "all" || terminal.terminalModel === terminalModelFilter

    return matchesSearch && matchesOnlineStatus && matchesModel
  })

  const selectedGroupName = selectedGroup === 1 ? "总部LED设备" : "一楼大厅"

  const handleCreateTerminal = () => {
    console.log("Creating terminal:", newTerminal)
    setIsCreateTerminalOpen(false)
    setNewTerminal({ terminalName: "", description: "", terminalAccount: "", terminalPassword: "", terminalModel: "" })
  }

  const handleCreateGroup = () => {
    console.log("Creating group:", newGroup)
    setIsCreateGroupOpen(false)
    setNewGroup({ terminalGroupName: "", description: "" })
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
            <TerminalGroupTreeNode
              node={terminalGroupTree}
              level={0}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              expandedGroups={expandedGroups}
              onToggleExpand={handleToggleExpand}
            />

            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  添加终端组
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建终端组</DialogTitle>
                  <DialogDescription>在当前组织下创建新的终端组</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">终端组名称</Label>
                    <Input
                      id="groupName"
                      value={newGroup.terminalGroupName}
                      onChange={(e) => setNewGroup({ ...newGroup, terminalGroupName: e.target.value })}
                      placeholder="请输入终端组名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupDesc">描述</Label>
                    <Input
                      id="groupDesc"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="请输入终端组描述"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateGroup}>创建</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FolderPlus className="w-4 h-4" />
                      添加子组
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Dialog open={isCreateTerminalOpen} onOpenChange={setIsCreateTerminalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      添加设备
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>创建终端设备</DialogTitle>
                      <DialogDescription>在 {selectedGroupName} 组下创建新终端设备</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="terminalName">设备名称</Label>
                        <Input
                          id="terminalName"
                          value={newTerminal.terminalName}
                          onChange={(e) => setNewTerminal({ ...newTerminal, terminalName: e.target.value })}
                          placeholder="请输入设备名称"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">设备描述</Label>
                        <Input
                          id="description"
                          value={newTerminal.description}
                          onChange={(e) => setNewTerminal({ ...newTerminal, description: e.target.value })}
                          placeholder="请输入设备描述"
                        />
                      </div>
                      <div>
                        <Label htmlFor="terminalAccount">设备账号</Label>
                        <Input
                          id="terminalAccount"
                          value={newTerminal.terminalAccount}
                          onChange={(e) => setNewTerminal({ ...newTerminal, terminalAccount: e.target.value })}
                          placeholder="请输入设备账号"
                        />
                      </div>
                      <div>
                        <Label htmlFor="terminalPassword">设备密码</Label>
                        <Input
                          id="terminalPassword"
                          type="password"
                          value={newTerminal.terminalPassword}
                          onChange={(e) => setNewTerminal({ ...newTerminal, terminalPassword: e.target.value })}
                          placeholder="请输入设备密码"
                        />
                      </div>
                      <div>
                        <Label htmlFor="terminalModel">设备型号</Label>
                        <Select value={newTerminal.terminalModel} onValueChange={(value) => setNewTerminal({ ...newTerminal, terminalModel: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择设备型号" />
                          </SelectTrigger>
                          <SelectContent>
                            {terminalModelOptions.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateTerminalOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleCreateTerminal}>创建</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索设备名称、描述或序列号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
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
            {viewMode === "list" ? (
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
            <Dialog open={isTerminalDetailOpen} onOpenChange={setIsTerminalDetailOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedTerminalDetail?.terminalName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedTerminalDetail?.description}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                {selectedTerminalDetail && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">设备ID</Label>
                        <p className="mt-1">{selectedTerminalDetail.tid}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">所属组</Label>
                        <p className="mt-1">{selectedTerminalDetail.tgName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">设备型号</Label>
                        <p className="mt-1">{selectedTerminalDetail.terminalModel}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">序列号</Label>
                        <p className="mt-1 font-mono">{selectedTerminalDetail.serialNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">固件版本</Label>
                        <p className="mt-1">{selectedTerminalDetail.firmwareVersion}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">创建时间</Label>
                        <p className="mt-1">{new Date(selectedTerminalDetail.createdAt).toLocaleString("zh-CN")}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">在线状态</Label>
                      <div className="mt-2">
                        {getOnlineStatusBadge(selectedTerminalDetail.onlineStatus)}
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTerminalDetailOpen(false)}>
                    关闭
                  </Button>
                  <Button className="gap-2">
                    <Edit className="w-4 h-4" />
                    编辑设备
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 