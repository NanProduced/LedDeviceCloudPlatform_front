"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FolderTree } from "@/components/ui/folder-tree"
import MaterialAPI from "@/lib/api/material"
import MaterialTreeAdapter from "@/lib/utils/materialTreeAdapter"
import { MaterialTreeNode } from "@/lib/types"
import { Folder, FolderOpen, Search } from "lucide-react"

/**
 * 文件夹选择器属性接口
 */
export interface FolderSelectorProps {
  /** 当前选中的文件夹ID */
  selectedFolderId?: string | null
  /** 当前选中的用户组ID */
  selectedUserGroupId?: number | null
  /** 文件夹选择变化回调 */
  onFolderChange: (folderId: string | null, userGroupId: number | null, folderPath?: string) => void
  /** 触发器文本 */
  triggerText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
}

/**
 * 文件夹选择器组件
 * 
 * 复用素材管理的树结构，提供文件夹选择功能。
 * 支持选择用户组文件夹和公共文件夹。
 */
export function FolderSelector({
  selectedFolderId,
  selectedUserGroupId,
  onFolderChange,
  triggerText = "选择文件夹",
  disabled = false,
  placeholder = "请选择目标文件夹"
}: FolderSelectorProps) {
  // 状态管理
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<MaterialTreeNode[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedNode, setSelectedNode] = useState<MaterialTreeNode | null>(null)
  const [selectedPath, setSelectedPath] = useState("")

  /**
   * 加载素材树数据
   */
  const loadTreeData = async () => {
    try {
      setLoading(true)
      console.log('开始加载素材树数据...')
      const response = await MaterialAPI.initMaterialTree()
      console.log('API响应数据:', response)
      const treeNodes = MaterialTreeAdapter.transformMaterialTree(response)
      console.log('转换后的树节点:', treeNodes)
      setTreeData(treeNodes)
    } catch (error) {
      console.error('Failed to load material tree:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理树节点选择
   */
  const handleNodeSelect = (node: MaterialTreeNode) => {
    // 只允许选择文件夹节点（NORMAL类型且fid不为空）或用户组节点
    if (node.type === 'NORMAL' && node.fid) {
      setSelectedNode(node)
      setSelectedPath(node.name)
    } else if (node.type === 'GROUP' && node.ugid) {
      setSelectedNode(node)
      setSelectedPath(node.name)
    }
  }

  /**
   * 确认选择
   */
  const handleConfirm = () => {
    if (selectedNode) {
      if (selectedNode.type === 'NORMAL' && selectedNode.fid) {
        // 选择的是文件夹
        onFolderChange(
          selectedNode.fid.toString(),
          selectedNode.ugid || null,
          selectedPath
        )
      } else if (selectedNode.type === 'GROUP' && selectedNode.ugid) {
        // 选择的是用户组（根目录）
        onFolderChange(
          null,
          selectedNode.ugid,
          selectedPath
        )
      }
      setOpen(false)
    }
  }

  /**
   * 取消选择
   */
  const handleCancel = () => {
    setSelectedNode(null)
    setSelectedPath("")
    setOpen(false)
  }

  /**
   * 过滤树节点（基于搜索关键词）
   */
  const filterTreeNodes = (nodes: MaterialTreeNode[], keyword: string): MaterialTreeNode[] => {
    if (!keyword) return nodes

    return nodes.reduce<MaterialTreeNode[]>((filtered, node) => {
      const matchesKeyword = node.name.toLowerCase().includes(keyword.toLowerCase())
      const filteredChildren = filterTreeNodes(node.children, keyword)

      if (matchesKeyword || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        })
      }

      return filtered
    }, [])
  }

  /**
   * 获取显示文本
   */
  const getDisplayText = () => {
    if (selectedPath) return selectedPath

    // 当外部已选择但本地selectedPath尚未建立时，根据外部值给出合理提示
    if (selectedFolderId) return '已选择文件夹'
    if (selectedUserGroupId) return '已选择用户组'
    return placeholder
  }

  /**
   * 获取显示图标
   */
  const getDisplayIcon = () => {
    if (selectedNode) {
      return <FolderOpen className="w-4 h-4 text-blue-600" />
    }
    return <Folder className="w-4 h-4 text-slate-400" />
  }

  // 组件挂载时加载数据
  useEffect(() => {
    if (open && treeData.length === 0) {
      loadTreeData()
    }
  }, [open])

  // 根据当前选择更新显示路径
  useEffect(() => {
    // 如果外部清空选择，则同步清空
    if (!selectedFolderId && !selectedUserGroupId) {
      setSelectedNode(null)
      setSelectedPath("")
    }
    // 外部已选择但本地没有弹窗上下文时，不要覆盖用户刚刚在弹窗中做出的选择
    // 显示文本交由 getDisplayText 基于外部值兜底
  }, [selectedFolderId, selectedUserGroupId])

  const filteredTreeData = filterTreeNodes(treeData, searchKeyword)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          {getDisplayIcon()}
          <span className="ml-2 flex-1 truncate">
            {getDisplayText()}
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[700px]">
        <DialogHeader>
          <DialogTitle>选择目标文件夹</DialogTitle>
          <DialogDescription>
            请选择文件上传的目标文件夹。您可以选择用户组根目录或具体的文件夹。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索文件夹..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 素材树 */}
          <div className="border rounded-lg max-h-[400px] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-500">加载中...</div>
              </div>
            ) : filteredTreeData.length > 0 ? (
              <FolderTree
                data={filteredTreeData}
                onSelect={handleNodeSelect}
                selectedNode={selectedNode}
                selectable={(node) => 
                  (node.type === 'NORMAL' && !!node.fid) || 
                  (node.type === 'GROUP' && !!node.ugid)
                }
              />
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-500">
                  {searchKeyword ? "未找到匹配的文件夹" : "暂无文件夹"}
                </div>
              </div>
            )}
          </div>

          {/* 当前选择显示 */}
          {selectedNode && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  已选择: {selectedPath}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {selectedNode.type === 'GROUP' ? '用户组根目录' : '文件夹'}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedNode}
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}