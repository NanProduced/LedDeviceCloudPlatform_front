"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Users,
  Monitor,
  ChevronRight,
  ChevronDown,
  Save,
  RotateCcw,
  AlertTriangle,
  Folder,
  FolderOpen,
  Search,
  Loader2,
  Info
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

// 交互式权限树组件 - 使用SVG树图
function InteractivePermissionTree({
  groups,
  permissionBindings,
  pendingChanges,
  onPermissionChange,
}: {
  groups: TerminalGroupTreeNode[]
  permissionBindings: PermissionBinding[]
  pendingChanges: Map<number, PendingChange>
  onPermissionChange: (tgid: number, change: PendingChange) => void
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

  // 默认展开根节点
  useEffect(() => {
    if (groups.length > 0) {
      setExpandedNodes(new Set([groups[0].tgid]))
    }
  }, [groups])

  // 树节点位置计算
  interface TreeNode {
    group: TerminalGroupTreeNode
    x: number
    y: number
    children: TreeNode[]
    parent?: TreeNode
  }

  const [allNodes, setAllNodes] = useState<TreeNode[]>([])

  useEffect(() => {
    const buildTreeNodes = (groups: TerminalGroupTreeNode[], parent?: TreeNode): TreeNode[] => {
      return groups.map((group) => {
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

    const calculatePositions = (nodes: TreeNode[], startX = 60, startY = 50, levelHeight = 90, nodeSpacing = 160) => {
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
  const isChildOf = (childTgid: number, parentTgid: number, groups: TerminalGroupTreeNode[]): boolean => {
    const findNode = (nodes: TerminalGroupTreeNode[], targetTgid: number): TerminalGroupTreeNode | null => {
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
    while (current.parent) {
      if (current.parent === parentTgid) return true
      current = findNode(groups, current.parent) || current
      if (!current.parent) break
    }
    return false
  }

  // 权限状态切换
  const handlePermissionToggle = (group: TerminalGroupTreeNode) => {
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
      terminalGroupName: group.tgName,
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
  const handleIncludeChildrenToggle = (group: TerminalGroupTreeNode, e: React.MouseEvent) => {
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
      terminalGroupName: group.tgName,
    })
  }

  // 计算SVG尺寸
  const maxX = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.x)) + 100 : 800
  const maxY = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.y)) + 100 : 400

  return (
    <div className="w-full h-full overflow-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg">
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
          {/* 箭头标记 */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
        </defs>

        {/* 绘制连接线 */}
        {allNodes.map((node) =>
          node.children.map((child) => (
            <line
              key={`${node.group.tgid}-${child.group.tgid}`}
              x1={node.x}
              y1={node.y + 32}
              x2={child.x}
              y2={child.y - 12}
              stroke="#d1d5db"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          )),
        )}

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
                  x={node.x - 85}
                  y={node.y - 20}
                  width="170"
                  height="85"
                  rx="12"
                  fill={permission === "INCLUDE" ? "url(#includeGradient)" : "url(#excludeGradient)"}
                  fillOpacity="0.3"
                  stroke={permission === "INCLUDE" ? "#16a34a" : "#dc2626"}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              )}

              {/* 主节点 - 适度增大 */}
              <rect
                x={node.x - 75}
                y={node.y - 12}
                width="150"
                height="65"
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
                  <circle cx={node.x + 65} cy={node.y + 12} r="9" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
                  <text x={node.x + 65} y={node.y + 17} textAnchor="middle" fontSize="12" fill="#6b7280">
                    {isExpanded ? "−" : "+"}
                  </text>
                </g>
              )}

              {/* 节点文本 */}
              <text
                x={node.x}
                y={node.y + 2}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill={nodeColor.text}
                className="pointer-events-none"
              >
                {node.group.tgName}
              </text>

              {/* 权限状态 */}
              <text
                x={node.x}
                y={node.y + 18}
                textAnchor="middle"
                fontSize="11"
                fill={nodeColor.text}
                className="pointer-events-none"
              >
                {getPermissionText(permission)}
              </text>

              {/* 包含子组选项 */}
              {hasChildren && (permission === "INCLUDE" || permission === "EXCLUDE") && (
                <g className="cursor-pointer" onClick={(e) => handleIncludeChildrenToggle(node.group, e)}>
                  <rect
                    x={node.x - 68}
                    y={node.y + 28}
                    width="12"
                    height="12"
                    rx="2"
                    fill={includeChildren ? nodeColor.stroke : "#ffffff"}
                    stroke={nodeColor.stroke}
                    strokeWidth="1"
                  />
                  {includeChildren && (
                    <text
                      x={node.x - 62}
                      y={node.y + 37}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#ffffff"
                      className="pointer-events-none"
                    >
                      ✓
                    </text>
                  )}
                  <text
                    x={node.x - 48}
                    y={node.y + 37}
                    fontSize="9"
                    fill={nodeColor.text}
                    className="pointer-events-none"
                  >
                    含子组
                  </text>
                </g>
              )}

              {/* 深度标识 */}
              <circle cx={node.x - 65} cy={node.y - 8} r="8" fill="#3b82f6" className="pointer-events-none" />
              <text
                x={node.x - 65}
                y={node.y - 3}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#ffffff"
                className="pointer-events-none"
              >
                {node.group.path.split('/').length - 1}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
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
            
            {/* 变更提示 */}
            <Alert className="mt-3 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-300 text-xs">
                变更将在点击保存后生效，影响该用户组的所有用户
              </AlertDescription>
            </Alert>
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

            {/* 权限状态图例 - 增强显示 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">权限状态说明</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-200 border-2 border-green-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">包含权限</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-200 border-2 border-red-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">排除权限</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-100 border-2 border-emerald-400 rounded-md shadow-sm"></div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">继承权限</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-200 border-2 border-blue-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">待保存变更</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="font-medium">操作提示：点击节点切换权限 • 点击 +/- 展开收起 • 勾选&ldquo;含子组&rdquo;应用到子节点</span>
            </div>
          </div>
        </CardContent>
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

        {/* 中间：权限配置区域（居中显示） */}
        <div className="col-span-6">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg">权限配置树</CardTitle>
              <CardDescription>
                为 {permissionStatus.userGroupName || "选中的用户组"} 配置终端组访问权限 - 点击节点切换权限状态
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
            </CardHeader>
            <CardContent className="flex justify-center">
              <ScrollArea className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">加载权限状态...</span>
                  </div>
                ) : terminalGroupTree.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {searchTerm ? "未找到匹配的终端组" : "暂无终端组数据"}
                  </div>
                ) : (
                  <div className="flex justify-center w-full">
                    <InteractivePermissionTree
                      groups={terminalGroupTree}
                      permissionBindings={permissionStatus.permissionBindings}
                      pendingChanges={pendingChanges}
                      onPermissionChange={handlePermissionChange}
                    />
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