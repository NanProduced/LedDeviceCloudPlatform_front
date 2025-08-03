import { api } from '../api'

// 材料节点树响应类型
export interface MaterialNodeTreeResponse {
  rootUserGroupNode: GroupNode
  publicFolders: FolderNode[]
  sharedFolders: FolderNode[]
}

// 文件夹节点类型
export interface FolderNode {
  fid: number
  folderName: string
  parent: number
  path: string
  children: FolderNode[]
}

// 用户组节点类型
export interface GroupNode {
  ugid: number
  groupName: string
  parent: number
  path: string
  folders: FolderNode[]
  children: GroupNode[]
}

// 素材响应类型
export interface ListMaterialResponse {
  mid: number
  materialName: string
  fileId: string
  materialType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'
  fileSize: number
  fileSizeFormatted: string
  mimeType: string
  fileExtension: string
  fileStatus: number
  fileStatusDesc: string
  processProgress?: number
  description?: string
  usageCount: number
  ugid: number
  fid: number
  uploadedBy: number
  uploaderName: string
  uploadTime: string
  createTime: string
  updateTime: string
}

// 分享素材响应类型
export interface ListSharedMaterialResponse extends ListMaterialResponse {
  shareId: number
  sharedFrom: number
  sharedFromGroupName: string
  sharedTo: number
  sharedToGroupName: string
  sharedBy: number
  sharedByUserName: string
  sharedTime: string
  resourceType: number
}

// 创建文件夹请求类型
export interface CreateFolderRequest {
  ugid?: number
  fid?: number
  folderName: string
  description?: string
}

// Material API 类
export class MaterialAPI {
  /**
   * 初始化素材管理左侧树形结构
   */
  static async initMaterialTree(): Promise<MaterialNodeTreeResponse> {
    const response = await api.get('/core/api/material/tree/init')
    return response.data
  }

  /**
   * 查询用户组素材
   * @param ugid 用户组ID
   * @param fid 文件夹ID
   * @param includeSub 是否包含子文件夹
   */
  static async listUserMaterials(
    ugid?: number,
    fid?: number,
    includeSub: boolean = false
  ): Promise<ListMaterialResponse[]> {
    const params = new URLSearchParams()
    if (ugid !== undefined) params.append('ugid', ugid.toString())
    if (fid !== undefined) params.append('fid', fid.toString())
    params.append('includeSub', includeSub.toString())

    const response = await api.get(`/core/api/material/list/user?${params.toString()}`)
    return response.data
  }

  /**
   * 查询分享的素材
   * @param fid 文件夹ID
   * @param includeSub 是否包含子文件夹
   */
  static async listSharedMaterials(
    fid?: number,
    includeSub: boolean = false
  ): Promise<ListSharedMaterialResponse[]> {
    const params = new URLSearchParams()
    if (fid !== undefined) params.append('fid', fid.toString())
    params.append('includeSub', includeSub.toString())

    const response = await api.get(`/core/api/material/list/shared?${params.toString()}`)
    return response.data
  }

  /**
   * 查询公共资源组素材
   * @param fid 文件夹ID
   * @param includeSub 是否包含子文件夹
   */
  static async listPublicMaterials(
    fid?: number,
    includeSub: boolean = false
  ): Promise<ListMaterialResponse[]> {
    const params = new URLSearchParams()
    if (fid !== undefined) params.append('fid', fid.toString())
    params.append('includeSub', includeSub.toString())

    const response = await api.get(`/core/api/material/list/public?${params.toString()}`)
    return response.data
  }

  /**
   * 查询全部素材
   */
  static async listAllMaterials(): Promise<ListMaterialResponse[]> {
    const response = await api.get('/core/api/material/get/all')
    return response.data
  }

  /**
   * 创建文件夹
   * @param request 创建文件夹请求
   */
  static async createFolder(request: CreateFolderRequest): Promise<void> {
    await api.post('/core/api/material/folder/create', request)
  }
}

// 导出默认实例
export default MaterialAPI