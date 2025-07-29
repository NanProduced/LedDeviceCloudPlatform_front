"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Users,
  Monitor,
  ChevronRight,
  ChevronDown,
  Save,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle,
  Folder,
  FolderOpen,
  Search,
  Loader2
} from "lucide-react"

// 导入API服务
import { userGroupApi } from "@/lib/api/userGroup"
import { permissionApi } from "@/lib/api/permission"
import { UserGroupTreeNode } from "@/lib/types"

// 类型定义
interface TerminalGroupTreeNode {
  tgid: number
  tgName: string
  parent: number | null
  path: string
  pathMap: Record<string, string>
  children: TerminalGroupTreeNode[]
  childrenCount?: number
  description?: string
  hasPermission?: boolean
}

interface PermissionBinding {
  bindingId?: number
  tgid: number
  terminalGroupName: string
  terminalGroupPath: string
  bindingType: "INCLUDE" | "EXCLUDE"
  includeChildren: boolean
  depth: number
  parentTgid?: number
  createTime?: string
  updateTime?: string
  remarks?: string
}

interface UserGroupPermissionStatus {
  ugid: number
  userGroupName: string
  permissionBindings: PermissionBinding[]
  statistics: {
    totalBindings: number
    includeBindings: number
    excludeBindings: number
    includeChildrenBindings: number
    totalCoveredTerminalGroups: number
    maxDepth: number
  }
  lastUpdateTime: string
}

interface PendingChange {
  tgid: number
  bindingType: "INCLUDE" | "EXCLUDE" | "NONE"
  includeChildren: boolean
  terminalGroupName: string
}

interface UserGroupOption {
  ugid: number
  ugName: string
}

// 权限配置卡片组件
function PermissionConfigCard({
  terminalGroup,
  currentBinding,
  pendingChange,
  onPermissionChange,
}: {
  terminalGroup: TerminalGroupTreeNode
  currentBinding?: PermissionBinding
  pendingChange?: PendingChange
  onPermissionChange: (tgid: number, change: PendingChange) => void
}) {
  const effectiveBinding = pendingChange || currentBinding
  const bindingType = effectiveBinding?.bindingType || "NONE"
  const includeChildren = effectiveBinding?.includeChildren || false

  const getStatusColor = (type: string) => {
    switch (type) {
      case "INCLUDE":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
      case "EXCLUDE":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getStatusText = (type: string) => {
    switch (type) {
      case "INCLUDE":
        return "🟢 包含权限"
      case "EXCLUDE":
        return "🔴 排除权限"
      default:
        return "⚪ 无权限"
    }
  }

  const handlePermissionToggle = () => {
    const nextType = bindingType === "NONE" ? "INCLUDE" : bindingType === "INCLUDE" ? "EXCLUDE" : "NONE"

    onPermissionChange(terminalGroup.tgid, {
      tgid: terminalGroup.tgid,
      bindingType: nextType,
      includeChildren: nextType === "NONE" ? false : includeChildren,
      terminalGroupName: terminalGroup.tgName,
    })
  }

  const handleIncludeChildrenChange = (checked: boolean) => {
    if (bindingType !== "NONE") {
      onPermissionChange(terminalGroup.tgid, {
        tgid: terminalGroup.tgid,
        bindingType: bindingType as "INCLUDE" | "EXCLUDE",
        includeChildren: checked,
        terminalGroupName: terminalGroup.tgName,
      })
    }
  }

  const getChildrenCount = (group: TerminalGroupTreeNode): number => {
    if (!group.children) return 0
    return group.children.length + group.children.reduce((sum, child) => sum + getChildrenCount(child), 0)
  }

  const childrenCount = getChildrenCount(terminalGroup)

  return (
    <Card className={`mb-4 transition-all duration-200 ${pendingChange ? "ring-2 ring-blue-200 bg-blue-50/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{terminalGroup.tgName}</span>
            <Badge variant="outline" className="text-xs">
              深度 {terminalGroup.path.split('/').length - 1}
            </Badge>
          </div>
          <Badge className={getStatusColor(bindingType)}>{getStatusText(bindingType)}</Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{terminalGroup.path}</p>
        {terminalGroup.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{terminalGroup.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 权限状态切换按钮 */}
          <div className="flex gap-2">
            <Button
              variant={bindingType === "NONE" ? "default" : "outline"}
              size="sm"
              onClick={handlePermissionToggle}
              className="flex-1"
            >
              {bindingType === "NONE" ? "⚪ 无权限" : bindingType === "INCLUDE" ? "🟢 包含权限" : "🔴 排除权限"}
            </Button>
          </div>

          {/* 包含子组选项 */}
          {bindingType !== "NONE" && childrenCount > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`include-children-${terminalGroup.tgid}`}
                checked={includeChildren}
                onCheckedChange={handleIncludeChildrenChange}
              />
              <label
                htmlFor={`include-children-${terminalGroup.tgid}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                包含所有子组 ({childrenCount}个)
              </label>
            </div>
          )}

          {/* 影响预览 */}
          {bindingType !== "NONE" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {bindingType === "INCLUDE" ? "将获得" : "将失去"}此组
                {includeChildren && childrenCount > 0 ? `及${childrenCount}个子组` : ""}的访问权限
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 终端组树组件
function TerminalGroupTree({ groups }: { groups: TerminalGroupTreeNode[] }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

  // 默认展开根节点
  useEffect(() => {
    if (groups.length > 0) {
      setExpandedNodes(new Set([groups[0].tgid]))
    }
  }, [groups])

  const toggleExpanded = (tgid: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(tgid)) {
      newExpanded.delete(tgid)
    } else {
      newExpanded.add(tgid)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTreeNode = (group: TerminalGroupTreeNode, depth = 0) => {
    const hasChildren = group.children && group.children.length > 0
    const isExpanded = expandedNodes.has(group.tgid)

    return (
      <div key={group.tgid} className="select-none">
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => hasChildren && toggleExpanded(group.tgid)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )
          ) : (
            <div className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-slate-500" />
          )}
          <span className="text-sm text-slate-700 dark:text-slate-300">{group.tgName}</span>
          {hasChildren && (
            <Badge variant="outline" className="text-xs ml-auto">
              {group.children.length}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {group.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return <div className="space-y-1">{groups.map((group) => renderTreeNode(group))}</div>
}

// 权限统计面板组件
function PermissionStatisticsPanel({
  statistics,
  pendingChanges,
}: {
  statistics: UserGroupPermissionStatus["statistics"]
  pendingChanges: Map<number, PendingChange>
}) {
  const pendingStats = {
    totalChanges: pendingChanges.size,
    includeChanges: Array.from(pendingChanges.values()).filter((c) => c.bindingType === "INCLUDE").length,
    excludeChanges: Array.from(pendingChanges.values()).filter((c) => c.bindingType === "EXCLUDE").length,
    removeChanges: Array.from(pendingChanges.values()).filter((c) => c.bindingType === "NONE").length,
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            权限统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">总绑定数</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{statistics.totalBindings}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">包含权限</span>
              <div className="font-semibold text-green-600">{statistics.includeBindings}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">排除权限</span>
              <div className="font-semibold text-red-600">{statistics.excludeBindings}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">含子组权限</span>
              <div className="font-semibold text-blue-600">{statistics.includeChildrenBindings}</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">覆盖终端组</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{statistics.totalCoveredTerminalGroups}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">最大深度</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{statistics.maxDepth}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 待保存变更 */}
      {pendingStats.totalChanges > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              待保存变更
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">总变更数</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{pendingStats.totalChanges}</span>
              </div>
              {pendingStats.includeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">新增包含</span>
                  <span className="font-semibold text-green-600">+{pendingStats.includeChanges}</span>
                </div>
              )}
              {pendingStats.excludeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">新增排除</span>
                  <span className="font-semibold text-red-600">+{pendingStats.excludeChanges}</span>
                </div>
              )}
              {pendingStats.removeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">移除权限</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">-{pendingStats.removeChanges}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function TerminalGroupAssignmentPage() {
  // 状态管理
  const [userGroups, setUserGroups] = useState<UserGroupOption[]>([])
  const [selectedUserGroupId, setSelectedUserGroupId] = useState<number>(0)
  const [terminalGroupTree, setTerminalGroupTree] = useState<TerminalGroupTreeNode[]>([])
  const [permissionStatus, setPermissionStatus] = useState<UserGroupPermissionStatus>({
    ugid: 0,
    userGroupName: "",
    permissionBindings: [],
    statistics: {
      totalBindings: 0,
      includeBindings: 0,
      excludeBindings: 0,
      includeChildrenBindings: 0,
      totalCoveredTerminalGroups: 0,
      maxDepth: 0,
    },
    lastUpdateTime: "",
  })
  const [pendingChanges, setPendingChanges] = useState<Map<number, PendingChange>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true)
  }, [])

  // 加载用户组列表和终端组树
  useEffect(() => {
    if (!mounted) return
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        
        // 获取用户组树（从中提取用户组列表）
        const userGroupResponse = await userGroupApi.getUserGroupTree()
        
        // 从树结构中提取所有用户组（简化处理，只取根节点的直接子组）
        const extractUserGroups = (nodes: UserGroupTreeNode[]): UserGroupOption[] => {
          const result: UserGroupOption[] = []
          const traverse = (node: UserGroupTreeNode) => {
            result.push({ ugid: node.ugid, ugName: node.ugName })
            if (node.children) {
              node.children.forEach(traverse)
            }
          }
          nodes.forEach(traverse)
          return result
        }
        
        const userGroupList = userGroupResponse.root ? extractUserGroups([userGroupResponse.root]) : []
        setUserGroups(userGroupList)
        
        // 默认选择第一个用户组
        if (userGroupList.length > 0) {
          setSelectedUserGroupId(userGroupList[0].ugid)
        }
        
        // 获取终端组树
        const terminalGroupResponse = await userGroupApi.getTerminalGroupTree()
        setTerminalGroupTree(terminalGroupResponse.accessibleTrees || [])
        
      } catch (error) {
        console.error("加载初始数据失败:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [mounted])

  // 加载权限状态
  const loadPermissionStatus = async (ugid: number) => {
    if (!ugid) return
    
    try {
      setIsLoading(true)
      const response = await permissionApi.getUserGroupPermissionStatus(ugid)
      setPermissionStatus(response)
      setPendingChanges(new Map())
    } catch (error) {
      console.error("加载权限状态失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 当选中用户组改变时，加载权限状态
  useEffect(() => {
    if (selectedUserGroupId > 0) {
      loadPermissionStatus(selectedUserGroupId)
    }
  }, [selectedUserGroupId])

  // 处理权限变更
  const handlePermissionChange = (tgid: number, change: PendingChange) => {
    const newPendingChanges = new Map(pendingChanges)
    
    // 检查是否与当前绑定相同
    const existingBinding = permissionStatus.permissionBindings.find((b) => b.tgid === tgid)
    
    if (existingBinding) {
      // 如果变更后的状态与现有绑定相同，则移除待变更项
      if (
        change.bindingType === existingBinding.bindingType &&
        change.includeChildren === existingBinding.includeChildren
      ) {
        newPendingChanges.delete(tgid)
      } else if (change.bindingType === "NONE") {
        // 如果是删除操作，标记为待删除
        newPendingChanges.set(tgid, change)
      } else {
        newPendingChanges.set(tgid, change)
      }
    } else {
      // 新绑定
      if (change.bindingType !== "NONE") {
        newPendingChanges.set(tgid, change)
      } else {
        newPendingChanges.delete(tgid)
      }
    }

    setPendingChanges(newPendingChanges)
  }

  // 保存变更
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return

    setIsLoading(true)
    try {
      const permissionBindings = Array.from(pendingChanges.values())
        .filter((change) => change.bindingType !== "NONE")
        .map((change) => ({
          tgid: change.tgid,
          bindingType: change.bindingType as "INCLUDE" | "EXCLUDE",
          includeChildren: change.includeChildren,
        }))

      await permissionApi.updatePermissionExpression({
        ugid: selectedUserGroupId,
        permissionBindings,
        enableRedundancyOptimization: true,
      })

      // 重新加载权限状态
      await loadPermissionStatus(selectedUserGroupId)

      alert("权限配置已保存成功！")
    } catch (error) {
      console.error("保存权限变更失败:", error)
      alert("保存失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 取消变更
  const handleDiscardChanges = () => {
    setPendingChanges(new Map())
  }

  // 获取所有终端组的扁平列表
  const getAllTerminalGroups = (groups: TerminalGroupTreeNode[]): TerminalGroupTreeNode[] => {
    const result: TerminalGroupTreeNode[] = []
    const traverse = (group: TerminalGroupTreeNode) => {
      result.push(group)
      if (group.children) {
        group.children.forEach(traverse)
      }
    }
    groups.forEach(traverse)
    return result
  }

  const allTerminalGroups = getAllTerminalGroups(terminalGroupTree)
  const filteredGroups = allTerminalGroups.filter(
    (group) =>
      group.tgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.path.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 获取当前绑定
  const getCurrentBinding = (tgid: number): PermissionBinding | undefined => {
    return permissionStatus.permissionBindings.find((b) => b.tgid === tgid)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">终端组分配</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">配置用户组对终端组的访问权限，支持包含/排除权限类型</p>
      </div>

      {/* 顶部操作栏 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-slate-100">选择用户组:</span>
              </div>
              <Select
                value={selectedUserGroupId.toString()}
                onValueChange={(value) => setSelectedUserGroupId(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="请选择用户组" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.ugid} value={group.ugid.toString()}>
                      {group.ugName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleDiscardChanges}
                variant="outline"
                disabled={pendingChanges.size === 0 || isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                取消变更
              </Button>

              <Button 
                onClick={handleSaveChanges} 
                disabled={pendingChanges.size === 0 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存变更 ({pendingChanges.size})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 主体三栏布局 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：终端组树 */}
        <div className="col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                终端组结构
              </CardTitle>
              <CardDescription>组织的终端组层级结构（只读）</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">加载中...</span>
                  </div>
                ) : (
                  <TerminalGroupTree groups={terminalGroupTree} />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 中间：权限配置区域 */}
        <div className="col-span-6">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg">权限配置</CardTitle>
              <CardDescription>
                为 {permissionStatus.userGroupName || "选中的用户组"} 配置终端组访问权限
              </CardDescription>
              
              {/* 搜索框 */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="搜索终端组..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* 权限状态说明 */}
              <div className="flex items-center gap-4 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded dark:bg-green-900/20"></div>
                  <span>包含权限</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded dark:bg-red-900/20"></div>
                  <span>排除权限</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20"></div>
                  <span>待保存变更</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[380px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">加载权限状态...</span>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {searchTerm ? "未找到匹配的终端组" : "暂无终端组数据"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGroups.map((group) => (
                      <PermissionConfigCard
                        key={group.tgid}
                        terminalGroup={group}
                        currentBinding={getCurrentBinding(group.tgid)}
                        pendingChange={pendingChanges.get(group.tgid)}
                        onPermissionChange={handlePermissionChange}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：权限统计面板 */}
        <div className="col-span-3">
          <PermissionStatisticsPanel 
            statistics={permissionStatus.statistics} 
            pendingChanges={pendingChanges} 
          />
        </div>
      </div>
    </div>
  )
} 