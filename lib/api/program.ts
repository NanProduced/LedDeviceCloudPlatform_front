import { fetchApi, CORE_API_PREFIX } from '../api'

// 前端与后端状态值映射
// 前端：draft | ready | published
// 后端：DRAFT | PENDING | PUBLISHED
export type ProgramStatusFrontend = 'draft' | 'ready' | 'published'
export type ProgramStatusBackend = 'DRAFT' | 'PENDING' | 'PUBLISHED'

const mapStatusToBackend = (status: ProgramStatusFrontend): ProgramStatusBackend => {
  switch (status) {
    case 'draft':
      return 'DRAFT'
    case 'ready':
      return 'PENDING' // 与后端同事对齐：ready ↔ PENDING
    case 'published':
      return 'PUBLISHED'
    default:
      return 'DRAFT'
  }
}

const mapStatusToFrontend = (status: ProgramStatusBackend): ProgramStatusFrontend => {
  switch (status) {
    case 'DRAFT':
      return 'draft'
    case 'PENDING':
      return 'ready' // 与后端同事对齐：PENDING ↔ ready
    case 'PUBLISHED':
      return 'published'
    default:
      return 'draft'
  }
}

// 创建/更新请求（前端定义，与后端字段对齐）
export interface CreateProgramRequest {
  name: string
  description?: string
  width: number
  height: number
  duration: number
  status: ProgramStatusFrontend
  thumbnailUrl?: string
  vsnData: string // 严格VSN JSON字符串
  contentData: string // EditorState JSON字符串
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {}

// 后端返回的基础结构（DynamicResponse<T> 已由 fetchApi 适配）

// 后端详情对象（字段名以 id 为主）
interface ProgramDetailBackend {
  id: string
  name: string
  description?: string
  width: number
  height: number
  duration: number
  status: ProgramStatusBackend
  thumbnailUrl?: string
  latestVersionId?: string
  createdAt: string
  updatedAt: string
}

export interface ProgramDetailFrontend {
  programId: string
  name: string
  description?: string
  width: number
  height: number
  duration: number
  status: ProgramStatusFrontend
  thumbnailUrl?: string
  latestVersionId?: string
  createdAt: string
  updatedAt: string
}

// 内容返回
interface ProgramContentBackend {
  id: string
  versionId: string
  vsnData: string
  contentData: string
  thumbnailUrl?: string
  status: ProgramStatusBackend
  savedAt?: string
}

export interface ProgramContentFrontend {
  programId: string
  versionId: string
  vsnData: string
  contentData: string
  thumbnailUrl?: string
  status: ProgramStatusFrontend
  savedAt?: string
}

// 列表返回
interface ProgramSummaryBackend {
  id: string
  name: string
  width: number
  height: number
  duration: number
  status: ProgramStatusBackend
  thumbnailUrl?: string
  updatedAt: string
}

export interface ProgramSummaryFrontend {
  programId: string
  name: string
  width: number
  height: number
  duration: number
  status: ProgramStatusFrontend
  thumbnailUrl?: string
  updatedAt: string
}

export interface ProgramListQuery {
  keyword?: string
  status?: ProgramStatusFrontend
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProgramListResponse {
  items: ProgramSummaryFrontend[]
  total: number
  page: number
  pageSize: number
}

// 版本相关
interface ProgramVersionBackend {
  versionId: string
  type: 'DRAFT' | 'RELEASE'
  status: ProgramStatusBackend
  createdAt: string
  remark?: string
}

export interface ProgramVersionFrontend {
  versionId: string
  type: 'draft' | 'release'
  status: ProgramStatusFrontend
  createdAt: string
  remark?: string
}

const mapDetail = (b: ProgramDetailBackend): ProgramDetailFrontend => ({
  programId: b.id,
  name: b.name,
  description: b.description,
  width: b.width,
  height: b.height,
  duration: b.duration,
  status: mapStatusToFrontend(b.status),
  thumbnailUrl: b.thumbnailUrl,
  latestVersionId: b.latestVersionId,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
})

const mapSummary = (b: ProgramSummaryBackend): ProgramSummaryFrontend => ({
  programId: b.id,
  name: b.name,
  width: b.width,
  height: b.height,
  duration: b.duration,
  status: mapStatusToFrontend(b.status),
  thumbnailUrl: b.thumbnailUrl,
  updatedAt: b.updatedAt,
})

const mapContent = (b: ProgramContentBackend): ProgramContentFrontend => ({
  programId: b.id,
  versionId: b.versionId,
  vsnData: b.vsnData,
  contentData: b.contentData,
  thumbnailUrl: b.thumbnailUrl,
  status: mapStatusToFrontend(b.status),
  savedAt: b.savedAt,
})

const mapStatusParam = (s?: ProgramStatusFrontend): ProgramStatusBackend | undefined => {
  return s ? mapStatusToBackend(s) : undefined
}

export class ProgramAPI {
  static base = `${CORE_API_PREFIX}/program`

  static async createProgram(req: CreateProgramRequest): Promise<{ programId: string; versionId?: string; status?: ProgramStatusFrontend }>{
    const payload = {
      ...req,
      status: mapStatusToBackend(req.status),
    }
    // 后端返回 { id, versionId, status }
    const data = await fetchApi(`${this.base}/create`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return {
      programId: data.id ?? data.programId ?? data.programID,
      versionId: data.versionId,
      status: data.status ? mapStatusToFrontend(data.status) : undefined,
    }
  }

  static async updateProgram(programId: string, req: UpdateProgramRequest): Promise<{ programId: string; versionId?: string }>{
    const payload = {
      ...req,
      status: req.status ? mapStatusToBackend(req.status) : undefined,
    }
    const data = await fetchApi(`${this.base}/${programId}`, { method: 'PUT', body: JSON.stringify(payload) }) as any
    return {
      programId: data.id ?? programId,
      versionId: data.versionId,
    }
  }

  static async saveDraft(programId: string, contentData: string, thumbnailUrl?: string): Promise<{ programId: string; draftVersionId: string }>{
    const payload = { contentData, thumbnailUrl }
    const data = await fetchApi(`${this.base}/${programId}/draft`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return { programId: data.id ?? programId, draftVersionId: data.draftVersionId ?? data.versionId }
  }

  static async publishProgram(programId: string, publishRemark?: string): Promise<{ programId: string; versionId: string; publishedAt?: string }>{
    const payload = publishRemark ? { publishRemark } : undefined
    const data = await fetchApi(`${this.base}/${programId}/publish`, { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }) as any
    return { programId: data.id ?? programId, versionId: data.versionId, publishedAt: data.publishedAt }
  }

  static async getProgram(programId: string): Promise<ProgramDetailFrontend>{
    const data = await fetchApi(`${this.base}/${programId}`) as ProgramDetailBackend
    return mapDetail(data)
  }

  static async getProgramContent(programId: string, versionId?: string): Promise<ProgramContentFrontend>{
    const url = versionId ? `${this.base}/${programId}/content?versionId=${encodeURIComponent(versionId)}` : `${this.base}/${programId}/content`
    const data = await fetchApi(url) as ProgramContentBackend
    return mapContent(data)
  }

  static async listPrograms(query: ProgramListQuery = {}): Promise<ProgramListResponse>{
    const params = new URLSearchParams()
    if (query.keyword) params.append('keyword', query.keyword)
    if (query.status) params.append('status', mapStatusToBackend(query.status))
    if (query.page) params.append('page', String(query.page))
    if (query.pageSize) params.append('pageSize', String(query.pageSize))
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortOrder) params.append('sortOrder', query.sortOrder)
    const data = await fetchApi(`${this.base}/list?${params.toString()}`) as { items: ProgramSummaryBackend[]; total: number; page: number; pageSize: number }
    return {
      items: (data.items || []).map(mapSummary),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || (query.pageSize || 20),
    }
  }

  static async deleteProgram(programId: string): Promise<{ programId: string; deleted: boolean }>{
    const data = await fetchApi(`${this.base}/${programId}`, { method: 'DELETE' }) as any
    return { programId: data.id ?? programId, deleted: !!(data.deleted ?? true) }
  }

  static async copyProgram(programId: string): Promise<{ programId: string }>{
    const data = await fetchApi(`${this.base}/${programId}/copy`, { method: 'POST' }) as any
    return { programId: data.id ?? data.programId ?? '' }
  }

  static async listVersions(programId: string): Promise<{ items: ProgramVersionFrontend[]; total: number }>{
    const data = await fetchApi(`${this.base}/${programId}/versions`) as { items: ProgramVersionBackend[]; total: number }
    return {
      items: (data.items || []).map(v => ({
        versionId: v.versionId,
        type: v.type === 'DRAFT' ? 'draft' : 'release',
        status: mapStatusToFrontend(v.status),
        createdAt: v.createdAt,
        remark: v.remark,
      })),
      total: data.total || (data.items?.length || 0),
    }
  }

  static async revertVersion(programId: string, versionId: string): Promise<{ programId: string; newVersionId?: string }>{
    const data = await fetchApi(`${this.base}/${programId}/versions/${versionId}/revert`, { method: 'POST' }) as any
    return { programId: data.id ?? programId, newVersionId: data.versionId }
  }
}

export default ProgramAPI

