"use client"

import React, { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Building,
  Globe,
  Share,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MaterialTreeNode } from "@/lib/types"

interface FolderTreeProps {
  data: MaterialTreeNode[]
  onSelect: (node: MaterialTreeNode) => void
  selectedNode: MaterialTreeNode | null
  selectable?: (node: MaterialTreeNode) => boolean
}

interface FolderTreeNodeProps {
  node: MaterialTreeNode
  selectedNode: MaterialTreeNode | null
  onNodeSelect: (node: MaterialTreeNode) => void
  selectable?: (node: MaterialTreeNode) => boolean
  expandedNodes: Set<string>
  onToggleExpand: (nodeId: string) => void
  level: number
}

const getNodeIcon = (node: MaterialTreeNode, isExpanded: boolean) => {
  switch (node.type) {
    case "ALL":
      return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
    case "GROUP":
      return <Building className="w-4 h-4" />
    case "PUBLIC":
      return <Globe className="w-4 h-4" />
    case "SHARED":
      return <Share className="w-4 h-4" />
    case "SHARED_FOLDER":
      return <Folder className="w-4 h-4" />
    default:
      return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
  }
}

const getNodeStyle = (node: MaterialTreeNode) => {
  switch (node.type) {
    case "ALL":
      return "text-blue-600 font-medium"
    case "GROUP":
      return "text-green-600 font-medium"
    case "PUBLIC":
      return "text-purple-600 font-medium"
    case "SHARED":
      return "text-orange-600 font-medium"
    default:
      return "text-slate-700"
  }
}

function FolderTreeNode({
  node,
  selectedNode,
  onNodeSelect,
  selectable = () => true,
  expandedNodes,
  onToggleExpand,
  level
}: FolderTreeNodeProps) {
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNode?.id === node.id
  const isSelectable = selectable(node)

  const handleClick = () => {
    if (isSelectable) {
      onNodeSelect(node)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleExpand(node.id)
    }
  }

  const paddingLeft = `${level * 16 + 8}px`

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          isSelected && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
          !isSelectable && "cursor-not-allowed opacity-60"
        )}
        style={{ paddingLeft }}
        onClick={handleClick}
      >
        <div
          className="flex items-center justify-center w-4 h-4"
          onClick={handleToggle}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>
        
        <div className={cn("flex items-center gap-2", getNodeStyle(node))}>
          {getNodeIcon(node, isExpanded)}
          <span className="truncate">{node.name}</span>
        </div>
      </div>

      {/* 递归渲染子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
              selectable={selectable}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  data,
  onSelect,
  selectedNode,
  selectable = () => true
}: FolderTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-1">
      {data.map((node) => (
        <FolderTreeNode
          key={node.id}
          node={node}
          selectedNode={selectedNode}
          onNodeSelect={onSelect}
          selectable={selectable}
          expandedNodes={expandedNodes}
          onToggleExpand={handleToggleExpand}
          level={0}
        />
      ))}
    </div>
  )
}