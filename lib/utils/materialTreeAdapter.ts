import { MaterialNodeTreeResponse, GroupNode, FolderNode } from '../api/material'
import { MaterialTreeNode } from '../types'

/**
 * 将后端API数据转换为前端MaterialTree组件需要的数据结构
 */
export class MaterialTreeAdapter {
  /**
   * 转换完整的素材树数据
   */
  static transformMaterialTree(apiData: MaterialNodeTreeResponse): MaterialTreeNode[] {
    const result: MaterialTreeNode[] = []

    // 1. 添加"全部素材"根节点
    const allNode: MaterialTreeNode = {
      id: 'all',
      name: '全部素材',
      type: 'ALL',
      icon: 'folder',
      children: []
    }

    // 转换用户组节点
    if (apiData.rootUserGroupNode) {
      const groupChildren = this.transformGroupNode(apiData.rootUserGroupNode)
      allNode.children.push(...groupChildren)
    }

    result.push(allNode)

    // 2. 添加公共资源组节点
    if (apiData.publicFolders && apiData.publicFolders.length > 0) {
      const publicNode: MaterialTreeNode = {
        id: 'public',
        name: '公共素材组',
        type: 'PUBLIC',
        icon: 'globe',
        children: []
      }

      publicNode.children = apiData.publicFolders.map(folder => 
        this.transformFolderToTreeNode(folder, 'NORMAL')
      )

      result.push(publicNode)
    }

    // 3. 添加分享文件夹节点
    if (apiData.sharedFolders && apiData.sharedFolders.length > 0) {
      const sharedNode: MaterialTreeNode = {
        id: 'shared',
        name: '分享文件夹',
        type: 'SHARED',
        icon: 'share',
        children: []
      }

      sharedNode.children = apiData.sharedFolders.map(folder => 
        this.transformFolderToTreeNode(folder, 'SHARED_FOLDER')
      )

      result.push(sharedNode)
    }

    return result
  }

  /**
   * 转换用户组节点（递归）
   */
  private static transformGroupNode(groupNode: GroupNode): MaterialTreeNode[] {
    const result: MaterialTreeNode[] = []

    // 转换当前用户组
    const treeNode: MaterialTreeNode = {
      id: `group-${groupNode.ugid}`,
      name: groupNode.groupName,
      type: 'GROUP',
      icon: 'building',
      ugid: groupNode.ugid,
      isOwn: true, // 这里可以根据实际权限逻辑判断
      children: []
    }

    // 添加文件夹子节点
    if (groupNode.folders && groupNode.folders.length > 0) {
      const folderChildren = groupNode.folders.map(folder => 
        this.transformFolderToTreeNode(folder, 'NORMAL')
      )
      treeNode.children.push(...folderChildren)
    }

    result.push(treeNode)

    // 递归处理子用户组
    if (groupNode.children && groupNode.children.length > 0) {
      for (const childGroup of groupNode.children) {
        const childNodes = this.transformGroupNode(childGroup)
        result.push(...childNodes)
      }
    }

    return result
  }

  /**
   * 转换文件夹节点为树节点（递归）
   */
  private static transformFolderToTreeNode(
    folderNode: FolderNode, 
    nodeType: MaterialTreeNode['type'] = 'NORMAL'
  ): MaterialTreeNode {
    const treeNode: MaterialTreeNode = {
      id: `folder-${folderNode.fid}`,
      name: folderNode.folderName,
      type: nodeType,
      icon: 'folder',
      fid: folderNode.fid,
      children: []
    }

    // 递归处理子文件夹
    if (folderNode.children && folderNode.children.length > 0) {
      treeNode.children = folderNode.children.map(child => 
        this.transformFolderToTreeNode(child, nodeType)
      )
    }

    return treeNode
  }

  /**
   * 根据节点ID解析节点信息
   */
  static parseNodeId(nodeId: string): {
    type: 'all' | 'public' | 'shared' | 'group' | 'folder'
    id?: number
    ugid?: number
    fid?: number
  } {
    if (nodeId === 'all') {
      return { type: 'all' }
    }
    if (nodeId === 'public') {
      return { type: 'public' }
    }
    if (nodeId === 'shared') {
      return { type: 'shared' }
    }
    if (nodeId.startsWith('group-')) {
      const ugid = parseInt(nodeId.replace('group-', ''), 10)
      return { type: 'group', ugid, id: ugid }
    }
    if (nodeId.startsWith('folder-')) {
      const fid = parseInt(nodeId.replace('folder-', ''), 10)
      return { type: 'folder', fid, id: fid }
    }
    
    throw new Error(`Invalid node ID: ${nodeId}`)
  }

  /**
   * 根据节点ID和类型确定应该调用哪个API来获取文件列表
   */
  static getApiCallParams(nodeId: string): {
    apiType: 'all' | 'user' | 'public' | 'shared'
    params: { ugid?: number; fid?: number; includeSub?: boolean }
  } {
    const parsed = this.parseNodeId(nodeId)
    
    switch (parsed.type) {
      case 'all':
        return { apiType: 'all', params: {} }
      
      case 'group':
        return { 
          apiType: 'user', 
          params: { ugid: parsed.ugid, includeSub: false } 
        }
      
      case 'folder':
        // 需要根据上下文判断是用户组文件夹还是公共/分享文件夹
        // 这里简化处理，实际可能需要更多上下文信息
        return { 
          apiType: 'user', 
          params: { fid: parsed.fid, includeSub: false } 
        }
      
      case 'public':
        return { apiType: 'public', params: { includeSub: false } }
      
      case 'shared':
        return { apiType: 'shared', params: { includeSub: false } }
      
      default:
        throw new Error(`Unsupported node type: ${parsed.type}`)
    }
  }
}

export default MaterialTreeAdapter