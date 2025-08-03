"use client"

import type React from "react"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Building,
  Globe,
  Share,
  FolderIcon as FolderShare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TreeNode {
  id: string
  name: string
  type: "ALL" | "GROUP" | "NORMAL" | "PUBLIC" | "SHARED" | "SHARED_FOLDER"
  icon: string
  ugid: number | null
  isOwn?: boolean
  isVirtual?: boolean
  sharedBy?: string
  children: TreeNode[]
}

interface MaterialTreeProps {
  data: TreeNode[]
  selectedNode: string
  onNodeSelect: (nodeId: string) => void
}

const getNodeIcon = (node: TreeNode, isExpanded: boolean) => {
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
      return <FolderShare className="w-4 h-4" />
    default:
      return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
  }
}

const getNodeStyle = (node: TreeNode) => {
  switch (node.type) {
    case "ALL":
      return "text-blue-600 font-medium"
    case "GROUP":
      if (node.isVirtual) {
        return "text-gray-500 italic"
      }
      return node.isOwn ? "text-green-600 font-medium" : "text-orange-600"
    case "PUBLIC":
      return "text-purple-600 font-medium"
    case "SHARED":
      return "text-pink-600 font-medium"
    case "SHARED_FOLDER":
      return "text-pink-500"
    default:
      return "text-gray-700"
  }
}

const TreeNodeComponent = ({
  node,
  level = 0,
  selectedNode,
  onNodeSelect,
  expandedNodes,
  onToggleExpand,
}: {
  node: TreeNode
  level?: number
  selectedNode: string
  onNodeSelect: (nodeId: string) => void
  expandedNodes: Set<string>
  onToggleExpand: (nodeId: string) => void
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const isSelected = selectedNode === node.id

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleExpand(node.id)
    }
  }

  const handleSelect = () => {
    onNodeSelect(node.id)
    if (hasChildren && !isExpanded) {
      onToggleExpand(node.id)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1.5 px-2 hover:bg-gray-50 cursor-pointer rounded-md mx-2",
          isSelected && "bg-blue-50 border border-blue-200",
          level > 0 && "ml-4",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-4 h-4 mr-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-5 mr-1" />
        )}

        <div className="flex items-center flex-1 min-w-0">
          <div className="mr-2 flex-shrink-0">{getNodeIcon(node, isExpanded)}</div>
          <span className={cn("text-sm truncate", getNodeStyle(node))}>
            {node.name}
            {node.isVirtual && <span className="ml-1 text-xs">[虚拟节点]</span>}
            {node.sharedBy && <span className="ml-1 text-xs">({node.sharedBy})</span>}
          </span>
        </div>

        {/* 权限标识 */}
        <div className="flex items-center space-x-1 ml-2">
          {node.type === "GROUP" && node.ugid && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {node.isOwn ? "自有" : `ugid=${node.ugid}`}
            </span>
          )}
          {node.type === "PUBLIC" && (
            <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">公共</span>
          )}
          {node.type === "SHARED_FOLDER" && (
            <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">分享</span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MaterialTree({ data, selectedNode, onNodeSelect }: MaterialTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["group-1", "group-2", "group-3", "public", "shared"]),
  )

  const handleToggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <div className="py-2">
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          expandedNodes={expandedNodes}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  )
}
