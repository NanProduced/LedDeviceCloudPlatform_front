import { api } from '../api'
import { MaterialMetadataItem } from '../types'

// 材料节点树响应类型
export interface MaterialNodeTreeResponse {
  rootUserGroupNode: GroupNode
  publicGroupNode?: GroupNode  // 公共资源组节点（可能为空，但前端始终显示）
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
  fid: number | null
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

// 素材详情响应类型（在列表字段基础上补充一些可选信息）
export interface MaterialDetailResponse extends ListMaterialResponse {
  // 若后端未来扩展更多字段，可在此补充
  // 例如：metadata、tags 等
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
   * 获取素材详情
   * 按照后端文档仅暴露了列表与全量查询，这里提供按ID查询的后向兼容：
   * 1) 优先尝试 /core/api/material/detail/{mid}（如后端提供）
   * 2) 回退到 /core/api/material/get/all 后本地筛选
   */
  static async getMaterialDetail(mid: number): Promise<MaterialDetailResponse | null> {
    try {
      // 优先尝试潜在的详情端点（如果网关存在将直接返回；如果404则回退）
      const tryDetail = await api.get(`/core/api/material/detail/${mid}`)
      return tryDetail.data as MaterialDetailResponse
    } catch {
      // 回退方案：从全部列表中筛选（性能可接受，前端兜底）
      try {
        const all = await this.listAllMaterials()
        const found = all.find(item => item.mid === mid) || null
        return found as MaterialDetailResponse | null
      } catch (e) {
        console.error('getMaterialDetail fallback failed:', e)
        return null
      }
    }
  }

  /**
   * 获取素材元数据（包含预览/流/缩略图以及图片/视频专属信息）
   */
  static async getMaterialMetadata(materialId: number, options?: {
    includeThumbnails?: boolean
    includeBasicInfo?: boolean
    includeImageMetadata?: boolean
    includeVideoMetadata?: boolean
  }): Promise<MaterialMetadataItem> {
    const params = new URLSearchParams()
    if (options?.includeThumbnails !== undefined) params.append('includeThumbnails', String(options.includeThumbnails))
    if (options?.includeBasicInfo !== undefined) params.append('includeBasicInfo', String(options.includeBasicInfo))
    if (options?.includeImageMetadata !== undefined) params.append('includeImageMetadata', String(options.includeImageMetadata))
    if (options?.includeVideoMetadata !== undefined) params.append('includeVideoMetadata', String(options.includeVideoMetadata))

    const qs = params.toString()
    const url = `/core/api/material/metadata/${materialId}${qs ? `?${qs}` : ''}`
    const response = await api.get(url)
    return response.data as MaterialMetadataItem
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