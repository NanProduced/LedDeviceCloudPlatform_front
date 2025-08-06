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

    // 1. 添加"全部素材"根节点（独立节点，不包含用户组）
    const allNode: MaterialTreeNode = {
      id: 'all',
      name: '全部素材',
      type: 'ALL',
      icon: 'folder',
      children: []
    }
    result.push(allNode)

    // 2. 直接添加用户组根节点（不创建额外容器）
    if (apiData.rootUserGroupNode) {
      const rootGroupNode = this.transformSingleGroupNode(apiData.rootUserGroupNode)
      result.push(rootGroupNode)
    }

    // 3. 添加公共资源组节点（始终显示，即使为空）
    console.log('处理公共资源组数据:', apiData.publicGroupNode)
    
    if (apiData.publicGroupNode) {
      // 后端返回了公共资源组数据，使用转换后的节点
      const publicGroupNode = this.transformSingleGroupNode(apiData.publicGroupNode)
      // 修改节点类型为PUBLIC，保持原有的显示特性
      publicGroupNode.type = 'PUBLIC'
      publicGroupNode.icon = 'globe'
      result.push(publicGroupNode)
    } else {
      // 后端没有返回数据，创建空的公共资源组节点
      const publicNode: MaterialTreeNode = {
        id: 'public',
        name: '公共资源组',
        type: 'PUBLIC',
        icon: 'globe',
        children: []
      }
      result.push(publicNode)
    }

    // 4. 添加分享文件夹节点（始终显示，即使为空）
    const sharedNode: MaterialTreeNode = {
      id: 'shared',
      name: '分享文件夹',
      type: 'SHARED',
      icon: 'share',
      children: []
    }

    if (apiData.sharedFolders && apiData.sharedFolders.length > 0) {
      sharedNode.children = apiData.sharedFolders.map(folder => 
        this.transformFolderToTreeNode(folder, 'SHARED_FOLDER')
      )
    }

    result.push(sharedNode)

    return result
  }

  /**
   * 转换单个用户组节点（包含文件夹和子用户组）
   */
  private static transformSingleGroupNode(groupNode: GroupNode): MaterialTreeNode {
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

    // 递归处理子用户组
    if (groupNode.children && groupNode.children.length > 0) {
      const childGroupNodes = groupNode.children.map(childGroup => 
        this.transformSingleGroupNode(childGroup)
      )
      treeNode.children.push(...childGroupNodes)
    }

    return treeNode
  }

  /**
   * 转换用户组节点（递归）- 保持兼容性
   */
  private static transformGroupNode(groupNode: GroupNode): MaterialTreeNode[] {
    return [this.transformSingleGroupNode(groupNode)]
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
   * @param nodeId 节点ID
   * @param nodeType 可选的节点类型，用于区分公共资源组
   */
  static getApiCallParams(nodeId: string, nodeType?: string): {
    apiType: 'all' | 'user' | 'public' | 'shared'
    params: { ugid?: number; fid?: number; includeSub?: boolean }
  } {
    const parsed = this.parseNodeId(nodeId)
    
    switch (parsed.type) {
      case 'all':
        return { apiType: 'all', params: {} }
      
      case 'group':
        // 如果nodeType是PUBLIC，说明这是公共资源组节点
        if (nodeType === 'PUBLIC') {
          return { apiType: 'public', params: { includeSub: false } }
        }
        // 否则是普通用户组
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