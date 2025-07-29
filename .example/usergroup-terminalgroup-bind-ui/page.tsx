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
} from "lucide-react"

// 类型定义
interface TerminalGroup {
  tgid: number
  name: string
  path: string
  depth: number
  parentTgid?: number
  children?: TerminalGroup[]
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

// 模拟数据
const mockUserGroups = [
  { ugid: 1001, name: "管理员组" },
  { ugid: 1002, name: "操作员组" },
  { ugid: 1003, name: "观察员组" },
]

const mockTerminalGroups: TerminalGroup[] = [
  {
    tgid: 2001,
    name: "组织根目录",
    path: "/root",
    depth: 0,
    children: [
      {
        tgid: 2002,
        name: "设备管理",
        path: "/root/device",
        depth: 1,
        parentTgid: 2001,
        children: [
          {
            tgid: 2003,
            name: "LED设备组",
            path: "/root/device/led",
            depth: 2,
            parentTgid: 2002,
            children: [
              {
                tgid: 2004,
                name: "室内LED",
                path: "/root/device/led/indoor",
                depth: 3,
                parentTgid: 2003,
              },
              {
                tgid: 2005,
                name: "户外LED",
                path: "/root/device/led/outdoor",
                depth: 3,
                parentTgid: 2003,
              },
            ],
          },
          {
            tgid: 2006,
            name: "传感器组",
            path: "/root/device/sensor",
            depth: 2,
            parentTgid: 2002,
            children: [
              {
                tgid: 2007,
                name: "温度传感器",
                path: "/root/device/sensor/temperature",
                depth: 3,
                parentTgid: 2006,
              },
            ],
          },
        ],
      },
      {
        tgid: 2008,
        name: "监控中心",
        path: "/root/monitor",
        depth: 1,
        parentTgid: 2001,
        children: [
          {
            tgid: 2009,
            name: "实时监控",
            path: "/root/monitor/realtime",
            depth: 2,
            parentTgid: 2008,
          },
        ],
      },
    ],
  },
]

const mockPermissionStatus: UserGroupPermissionStatus = {
  ugid: 1001,
  userGroupName: "管理员组",
  permissionBindings: [
    {
      bindingId: 1,
      tgid: 2002,
      terminalGroupName: "设备管理",
      terminalGroupPath: "/root/device",
      bindingType: "INCLUDE",
      includeChildren: true,
      depth: 1,
      parentTgid: 2001,
      createTime: "2025-07-29T10:00:00Z",
      updateTime: "2025-07-29T10:00:00Z",
    },
    {
      bindingId: 2,
      tgid: 2005,
      terminalGroupName: "户外LED",
      terminalGroupPath: "/root/device/led/outdoor",
      bindingType: "EXCLUDE",
      includeChildren: false,
      depth: 3,
      parentTgid: 2003,
      createTime: "2025-07-29T10:30:00Z",
      updateTime: "2025-07-29T10:30:00Z",
    },
  ],
  statistics: {
    totalBindings: 2,
    includeBindings: 1,
    excludeBindings: 1,
    includeChildrenBindings: 1,
    totalCoveredTerminalGroups: 5,
    maxDepth: 3,
  },
  lastUpdateTime: "2025-07-29T10:30:00Z",
}

// 权限配置卡片组件
function PermissionConfigCard({
  terminalGroup,
  currentBinding,
  pendingChange,
  onPermissionChange,
}: {
  terminalGroup: TerminalGroup
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
        return "bg-green-100 text-green-800 border-green-200"
      case "EXCLUDE":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
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
      terminalGroupName: terminalGroup.name,
    })
  }

  const handleIncludeChildrenChange = (checked: boolean) => {
    if (bindingType !== "NONE") {
      onPermissionChange(terminalGroup.tgid, {
        tgid: terminalGroup.tgid,
        bindingType: bindingType as "INCLUDE" | "EXCLUDE",
        includeChildren: checked,
        terminalGroupName: terminalGroup.name,
      })
    }
  }

  const getChildrenCount = (group: TerminalGroup): number => {
    if (!group.children) return 0
    return group.children.length + group.children.reduce((sum, child) => sum + getChildrenCount(child), 0)
  }

  const childrenCount = getChildrenCount(terminalGroup)

  return (
    <Card className={`mb-4 transition-all duration-200 ${pendingChange ? "ring-2 ring-blue-200 bg-blue-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{terminalGroup.name}</span>
            <Badge variant="outline" className="text-xs">
              深度 {terminalGroup.depth}
            </Badge>
          </div>
          <Badge className={getStatusColor(bindingType)}>{getStatusText(bindingType)}</Badge>
        </div>
        <p className="text-sm text-gray-500">{terminalGroup.path}</p>
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
function TerminalGroupTree({ groups }: { groups: TerminalGroup[] }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([2001, 2002]))

  const toggleExpanded = (tgid: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(tgid)) {
      newExpanded.delete(tgid)
    } else {
      newExpanded.add(tgid)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTreeNode = (group: TerminalGroup) => {
    const hasChildren = group.children && group.children.length > 0
    const isExpanded = expandedNodes.has(group.tgid)

    return (
      <div key={group.tgid} className="select-none">
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
          style={{ paddingLeft: `${group.depth * 16 + 8}px` }}
          onClick={() => hasChildren && toggleExpanded(group.tgid)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4" />
          )}
          {isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-gray-500" />}
          <span className="text-sm">{group.name}</span>
        </div>

        {hasChildren && isExpanded && <div>{group.children!.map((child) => renderTreeNode(child))}</div>}
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
              <span className="text-gray-500">总绑定数</span>
              <div className="font-semibold">{statistics.totalBindings}</div>
            </div>
            <div>
              <span className="text-gray-500">包含权限</span>
              <div className="font-semibold text-green-600">{statistics.includeBindings}</div>
            </div>
            <div>
              <span className="text-gray-500">排除权限</span>
              <div className="font-semibold text-red-600">{statistics.excludeBindings}</div>
            </div>
            <div>
              <span className="text-gray-500">最大深度</span>
              <div className="font-semibold">{statistics.maxDepth}</div>
            </div>
          </div>

          <Separator />

          <div>
            <span className="text-gray-500 text-sm">实际覆盖终端组</span>
            <div className="font-semibold text-lg">{statistics.totalCoveredTerminalGroups}</div>
          </div>
        </CardContent>
      </Card>

      {pendingChanges.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              待保存变更
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">总变更数</span>
                <span className="font-semibold">{pendingStats.totalChanges}</span>
              </div>
              {pendingStats.includeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">新增包含</span>
                  <span className="font-semibold">+{pendingStats.includeChanges}</span>
                </div>
              )}
              {pendingStats.excludeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">新增排除</span>
                  <span className="font-semibold">+{pendingStats.excludeChanges}</span>
                </div>
              )}
              {pendingStats.removeChanges > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">移除权限</span>
                  <span className="font-semibold">-{pendingStats.removeChanges}</span>
                </div>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">变更将在点击保存后生效，影响该用户组的所有用户</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 主组件
export default function PermissionManagementPage() {
  const [selectedUserGroupId, setSelectedUserGroupId] = useState<number>(1001)
  const [permissionStatus, setPermissionStatus] = useState<UserGroupPermissionStatus>(mockPermissionStatus)
  const [pendingChanges, setPendingChanges] = useState<Map<number, PendingChange>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 获取用户组权限状态
  const loadPermissionStatus = async (ugid: number) => {
    setIsLoading(true)
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPermissionStatus(mockPermissionStatus)
      setPendingChanges(new Map())
    } catch (error) {
      console.error("Failed to load permission status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理权限变更
  const handlePermissionChange = (tgid: number, change: PendingChange) => {
    const newPendingChanges = new Map(pendingChanges)

    if (change.bindingType === "NONE") {
      // 如果设置为无权限，检查是否有现有绑定需要删除
      const existingBinding = permissionStatus.permissionBindings.find((b) => b.tgid === tgid)
      if (existingBinding) {
        newPendingChanges.set(tgid, change)
      } else {
        newPendingChanges.delete(tgid)
      }
    } else {
      newPendingChanges.set(tgid, change)
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
          bindingType: change.bindingType,
          includeChildren: change.includeChildren,
        }))

      // 模拟API调用
      console.log("Saving permission changes:", {
        ugid: selectedUserGroupId,
        permissionBindings,
        enableRedundancyOptimization: true,
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 重新加载权限状态
      await loadPermissionStatus(selectedUserGroupId)

      alert("权限配置已保存成功！")
    } catch (error) {
      console.error("Failed to save changes:", error)
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
  const getAllTerminalGroups = (groups: TerminalGroup[]): TerminalGroup[] => {
    const result: TerminalGroup[] = []
    const traverse = (group: TerminalGroup) => {
      result.push(group)
      if (group.children) {
        group.children.forEach(traverse)
      }
    }
    groups.forEach(traverse)
    return result
  }

  const allTerminalGroups = getAllTerminalGroups(mockTerminalGroups)
  const filteredGroups = allTerminalGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.path.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 获取当前绑定
  const getCurrentBinding = (tgid: number): PermissionBinding | undefined => {
    return permissionStatus.permissionBindings.find((b) => b.tgid === tgid)
  }

  useEffect(() => {
    loadPermissionStatus(selectedUserGroupId)
  }, [selectedUserGroupId])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部操作栏 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  用户组权限管理
                </CardTitle>
                <CardDescription>配置用户组对终端组的访问权限，支持包含/排除权限类型</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedUserGroupId.toString()}
                  onValueChange={(value) => setSelectedUserGroupId(Number(value))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUserGroups.map((group) => (
                      <SelectItem key={group.ugid} value={group.ugid.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  disabled={pendingChanges.size === 0 || isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  取消变更
                </Button>

                <Button onClick={handleSaveChanges} disabled={pendingChanges.size === 0 || isLoading}>
                  <Save className="h-4 w-4 mr-2" />
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
                  <Monitor className="h-5 w-5" />
                  终端组结构
                </CardTitle>
                <CardDescription>组织的终端组层级结构（只读）</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[480px]">
                  <TerminalGroupTree groups={mockTerminalGroups} />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 中间：交互式权限树 */}
          <div className="col-span-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-lg">权限配置树</CardTitle>
                <CardDescription>
                  为 {permissionStatus.userGroupName} 配置终端组访问权限 - 点击节点切换权限状态
                </CardDescription>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>包含权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span>排除权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-25 border border-green-100 rounded"></div>
                    <span>继承权限</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-500">加载中...</div>
                    </div>
                  ) : (
                    <InteractivePermissionTree
                      groups={mockTerminalGroups}
                      permissionBindings={permissionStatus.permissionBindings}
                      pendingChanges={pendingChanges}
                      onPermissionChange={handlePermissionChange}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：权限统计面板 */}
          <div className="col-span-3">
            <PermissionStatisticsPanel statistics={permissionStatus.statistics} pendingChanges={pendingChanges} />
          </div>
        </div>
      </div>
    </div>
  )
}

// 交互式权限树组件 - 使用SVG树图
function InteractivePermissionTree({
  groups,
  permissionBindings,
  pendingChanges,
  onPermissionChange,
}: {
  groups: TerminalGroup[]
  permissionBindings: PermissionBinding[]
  pendingChanges: Map<number, PendingChange>
  onPermissionChange: (tgid: number, change: PendingChange) => void
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([2001, 2002, 2008]))

  // 树节点位置计算
  interface TreeNode {
    group: TerminalGroup
    x: number
    y: number
    children: TreeNode[]
    parent?: TreeNode
  }

  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([])
  const [allNodes, setAllNodes] = useState<TreeNode[]>([])

  useEffect(() => {
    const buildTreeNodes = (groups: TerminalGroup[], parent?: TreeNode): TreeNode[] => {
      return groups.map((group, index) => {
        const node: TreeNode = {
          group,
          x: 0,
          y: 0,
          children: [],
          parent,
        }

        if (group.children && expandedNodes.has(group.tgid)) {
          node.children = buildTreeNodes(group.children, node)
        }

        return node
      })
    }

    const calculatePositions = (nodes: TreeNode[], startX = 50, startY = 50, levelHeight = 80, nodeSpacing = 150) => {
      const calculateSubtreeWidth = (node: TreeNode): number => {
        if (node.children.length === 0) return nodeSpacing
        return node.children.reduce((sum, child) => sum + calculateSubtreeWidth(child), 0)
      }

      const positionNodes = (nodes: TreeNode[], x: number, y: number) => {
        let currentX = x

        nodes.forEach((node) => {
          const subtreeWidth = calculateSubtreeWidth(node)
          node.x = currentX + subtreeWidth / 2
          node.y = y

          if (node.children.length > 0) {
            positionNodes(node.children, currentX, y + levelHeight)
          }

          currentX += subtreeWidth
        })
      }

      positionNodes(nodes, startX, startY)
      return nodes
    }

    const newTreeNodes = calculatePositions(buildTreeNodes(groups))
    setTreeNodes(newTreeNodes)
    setAllNodes(getAllNodes(newTreeNodes))
  }, [groups, expandedNodes])

  // 获取所有节点（扁平化）
  const getAllNodes = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = []
    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach((node) => {
        result.push(node)
        traverse(node.children)
      })
    }
    traverse(nodes)
    return result
  }

  // 计算SVG尺寸
  const maxX = Math.max(...allNodes.map((n) => n.x)) + 100
  const maxY = Math.max(...allNodes.map((n) => n.y)) + 100

  // 获取节点的有效权限状态
  const getEffectivePermission = (tgid: number): "INCLUDE" | "EXCLUDE" | "INHERITED" | "NONE" => {
    const pendingChange = pendingChanges.get(tgid)
    if (pendingChange) {
      return pendingChange.bindingType === "NONE" ? "NONE" : pendingChange.bindingType
    }

    const binding = permissionBindings.find((b) => b.tgid === tgid)
    if (binding) {
      return binding.bindingType
    }

    // 检查是否从父节点继承权限
    const parentBinding = permissionBindings.find((b) => b.includeChildren && isChildOf(tgid, b.tgid, groups))
    if (parentBinding && parentBinding.bindingType === "INCLUDE") {
      return "INHERITED"
    }

    return "NONE"
  }

  // 检查是否为子节点
  const isChildOf = (childTgid: number, parentTgid: number, groups: TerminalGroup[]): boolean => {
    const findNode = (nodes: TerminalGroup[], targetTgid: number): TerminalGroup | null => {
      for (const node of nodes) {
        if (node.tgid === targetTgid) return node
        if (node.children) {
          const found = findNode(node.children, targetTgid)
          if (found) return found
        }
      }
      return null
    }

    const childNode = findNode(groups, childTgid)
    if (!childNode) return false

    let current = childNode
    while (current.parentTgid) {
      if (current.parentTgid === parentTgid) return true
      current = findNode(groups, current.parentTgid) || current
      if (!current.parentTgid) break
    }
    return false
  }

  // 权限状态切换
  const handlePermissionToggle = (group: TerminalGroup) => {
    const currentPermission = getEffectivePermission(group.tgid)
    let nextPermission: "INCLUDE" | "EXCLUDE" | "NONE"

    switch (currentPermission) {
      case "NONE":
      case "INHERITED":
        nextPermission = "INCLUDE"
        break
      case "INCLUDE":
        nextPermission = "EXCLUDE"
        break
      case "EXCLUDE":
        nextPermission = "NONE"
        break
      default:
        nextPermission = "INCLUDE"
    }

    const currentBinding = permissionBindings.find((b) => b.tgid === group.tgid)
    const currentIncludeChildren = currentBinding?.includeChildren || false

    onPermissionChange(group.tgid, {
      tgid: group.tgid,
      bindingType: nextPermission,
      includeChildren: nextPermission === "NONE" ? false : currentIncludeChildren,
      terminalGroupName: group.name,
    })
  }

  // 切换展开状态
  const toggleExpanded = (tgid: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(tgid)) {
      newExpanded.delete(tgid)
    } else {
      newExpanded.add(tgid)
    }
    setExpandedNodes(newExpanded)
  }

  // 获取节点颜色
  const getNodeColor = (permission: string, isPending: boolean) => {
    const colors = {
      INCLUDE: { fill: "#dcfce7", stroke: "#16a34a", text: "#15803d" },
      EXCLUDE: { fill: "#fef2f2", stroke: "#dc2626", text: "#dc2626" },
      INHERITED: { fill: "#f0fdf4", stroke: "#22c55e", text: "#16a34a" },
      NONE: { fill: "#ffffff", stroke: "#d1d5db", text: "#6b7280" },
    }

    const color = colors[permission as keyof typeof colors] || colors.NONE

    if (isPending) {
      return { ...color, stroke: "#3b82f6", strokeWidth: "3" }
    }

    return { ...color, strokeWidth: "2" }
  }

  // 获取权限状态文本
  const getPermissionText = (permission: string) => {
    switch (permission) {
      case "INCLUDE":
        return "✓ 有权限"
      case "EXCLUDE":
        return "✗ 无权限"
      case "INHERITED":
        return "↓ 继承"
      default:
        return "○ 未配置"
    }
  }

  // 切换包含子组选项
  const handleIncludeChildrenToggle = (group: TerminalGroup, e: React.MouseEvent) => {
    e.stopPropagation()

    const currentPermission = getEffectivePermission(group.tgid)
    if (currentPermission === "NONE" || currentPermission === "INHERITED") return

    const currentBinding = permissionBindings.find((b) => b.tgid === group.tgid)
    const pendingChange = pendingChanges.get(group.tgid)
    const currentIncludeChildren = pendingChange?.includeChildren ?? currentBinding?.includeChildren ?? false

    onPermissionChange(group.tgid, {
      tgid: group.tgid,
      bindingType: currentPermission as "INCLUDE" | "EXCLUDE",
      includeChildren: !currentIncludeChildren,
      terminalGroupName: group.name,
    })
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 rounded-lg">
      <svg width={maxX} height={maxY} className="w-full h-full min-h-[400px]">
        {/* 定义渐变和阴影 */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000020" />
          </filter>
          <linearGradient id="includeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id="excludeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="100%" stopColor="#fecaca" />
          </linearGradient>
        </defs>

        {/* 绘制连接线 */}
        {allNodes.map((node) =>
          node.children.map((child) => (
            <line
              key={`${node.group.tgid}-${child.group.tgid}`}
              x1={node.x}
              y1={node.y + 30}
              x2={child.x}
              y2={child.y - 10}
              stroke="#d1d5db"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          )),
        )}

        {/* 箭头标记 */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
        </defs>

        {/* 绘制节点 */}
        {allNodes.map((node) => {
          const permission = getEffectivePermission(node.group.tgid)
          const isPending = pendingChanges.has(node.group.tgid)
          const nodeColor = getNodeColor(permission, isPending)
          const hasChildren = node.group.children && node.group.children.length > 0
          const isExpanded = expandedNodes.has(node.group.tgid)

          const currentBinding = permissionBindings.find((b) => b.tgid === node.group.tgid)
          const pendingChange = pendingChanges.get(node.group.tgid)
          const includeChildren = pendingChange?.includeChildren ?? currentBinding?.includeChildren ?? false

          return (
            <g key={node.group.tgid}>
              {/* 区域背景（如果包含子组） */}
              {hasChildren && includeChildren && (permission === "INCLUDE" || permission === "EXCLUDE") && (
                <rect
                  x={node.x - 80}
                  y={node.y - 15}
                  width="160"
                  height="80"
                  rx="12"
                  fill={permission === "INCLUDE" ? "url(#includeGradient)" : "url(#excludeGradient)"}
                  fillOpacity="0.3"
                  stroke={permission === "INCLUDE" ? "#16a34a" : "#dc2626"}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              )}

              {/* 主节点 */}
              <rect
                x={node.x - 70}
                y={node.y - 10}
                width="140"
                height="60"
                rx="8"
                fill={nodeColor.fill}
                stroke={nodeColor.stroke}
                strokeWidth={nodeColor.strokeWidth}
                filter="url(#shadow)"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePermissionToggle(node.group)}
              />

              {/* 展开/折叠按钮 */}
              {hasChildren && (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(node.group.tgid)
                  }}
                >
                  <circle cx={node.x + 60} cy={node.y + 10} r="8" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
                  <text x={node.x + 60} y={node.y + 15} textAnchor="middle" fontSize="12" fill="#6b7280">
                    {isExpanded ? "−" : "+"}
                  </text>
                </g>
              )}

              {/* 节点文本 */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={nodeColor.text}
                className="pointer-events-none"
              >
                {node.group.name}
              </text>

              {/* 权限状态 */}
              <text
                x={node.x}
                y={node.y + 20}
                textAnchor="middle"
                fontSize="10"
                fill={nodeColor.text}
                className="pointer-events-none"
              >
                {getPermissionText(permission)}
              </text>

              {/* 包含子组选项 */}
              {hasChildren && (permission === "INCLUDE" || permission === "EXCLUDE") && (
                <g className="cursor-pointer" onClick={(e) => handleIncludeChildrenToggle(node.group, e as any)}>
                  <rect
                    x={node.x - 65}
                    y={node.y + 25}
                    width="12"
                    height="12"
                    rx="2"
                    fill={includeChildren ? nodeColor.stroke : "#ffffff"}
                    stroke={nodeColor.stroke}
                    strokeWidth="1"
                  />
                  {includeChildren && (
                    <text
                      x={node.x - 59}
                      y={node.y + 34}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#ffffff"
                      className="pointer-events-none"
                    >
                      ✓
                    </text>
                  )}
                  <text
                    x={node.x - 45}
                    y={node.y + 34}
                    fontSize="9"
                    fill={nodeColor.text}
                    className="pointer-events-none"
                  >
                    含子组
                  </text>
                </g>
              )}

              {/* 深度标识 */}
              <circle cx={node.x - 60} cy={node.y - 5} r="8" fill="#3b82f6" className="pointer-events-none" />
              <text
                x={node.x - 60}
                y={node.y - 1}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#ffffff"
                className="pointer-events-none"
              >
                {node.group.depth}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
