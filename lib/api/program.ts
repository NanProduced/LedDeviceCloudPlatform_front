import { fetchApi, CORE_API_PREFIX } from '../api'

// 前端与后端状态值映射（注意：接口文档将审批状态拆分为 approvalStatus）
// Program.status（后端）：DRAFT | PENDING | PUBLISHED | TEMPLATE
// Program.approvalStatus（后端）：PENDING | APPROVED | REJECTED
// 前端：
// - status: draft | pending | published | template
// - approvalStatus: pending | approved | rejected
export type ProgramStatusFrontend = 'draft' | 'pending' | 'published' | 'template'
export type ProgramStatusBackend = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'TEMPLATE'
export type ProgramApprovalStatusFrontend = 'pending' | 'approved' | 'rejected'
export type ProgramApprovalStatusBackend = 'PENDING' | 'APPROVED' | 'REJECTED'

const mapStatusToBackend = (status: ProgramStatusFrontend): ProgramStatusBackend => {
  switch (status) {
    case 'draft':
      return 'DRAFT'
    case 'pending':
      return 'PENDING'
    case 'published':
      return 'PUBLISHED'
    case 'template':
      return 'TEMPLATE'
    default:
      return 'DRAFT'
  }
}

const mapStatusToFrontend = (status: ProgramStatusBackend): ProgramStatusFrontend => {
  switch (status) {
    case 'DRAFT':
      return 'draft'
    case 'PENDING':
      return 'pending'
    case 'PUBLISHED':
      return 'published'
    case 'TEMPLATE':
      return 'template'
    default:
      return 'draft'
  }
}

const mapApprovalToFrontend = (status?: ProgramApprovalStatusBackend): ProgramApprovalStatusFrontend | undefined => {
  switch (status) {
    case 'PENDING':
      return 'pending'
    case 'APPROVED':
      return 'approved'
    case 'REJECTED':
      return 'rejected'
    default:
      return undefined
  }
}

// 创建/更新请求（前端定义，与后端字段对齐）
export interface CreateProgramRequest {
  name: string
  description?: string
  width: number
  height: number
  duration: number
  thumbnailUrl?: string
  vsnData: string // 严格VSN JSON字符串（注意：应为“VSNData[]”的数组JSON字符串，如: JSON.stringify([vsnData])）
  contentData: string // EditorState JSON字符串
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  status?: ProgramStatusFrontend
}

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
  approvalStatus?: ProgramApprovalStatusBackend
  thumbnailUrl?: string
  latestVersionId?: string
  createdTime?: string
  updatedTime?: string
}

export interface ProgramDetailFrontend {
  programId: string
  name: string
  description?: string
  width: number
  height: number
  duration: number
  status: ProgramStatusFrontend
  approvalStatus?: ProgramApprovalStatusFrontend
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
  approvalStatus?: ProgramApprovalStatusBackend
  thumbnailUrl?: string
  updatedAt?: string
  updatedTime?: string
}

export interface ProgramSummaryFrontend {
  programId: string
  name: string
  width: number
  height: number
  duration: number
  status: ProgramStatusFrontend
  approvalStatus?: ProgramApprovalStatusFrontend
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
  approvalStatus: mapApprovalToFrontend(b.approvalStatus),
  thumbnailUrl: b.thumbnailUrl,
  latestVersionId: b.latestVersionId,
  createdAt: (b as any).createdAt || b.createdTime || '',
  updatedAt: (b as any).updatedAt || b.updatedTime || '',
})

const mapSummary = (b: ProgramSummaryBackend): ProgramSummaryFrontend => ({
  programId: b.id,
  name: b.name,
  width: b.width,
  height: b.height,
  duration: b.duration,
  status: mapStatusToFrontend(b.status),
  approvalStatus: mapApprovalToFrontend(b.approvalStatus),
  thumbnailUrl: b.thumbnailUrl,
  updatedAt: b.updatedAt || b.updatedTime || '',
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
    // 接口文档的 CreateProgramRequest 不包含 status 字段
    const data = await fetchApi(`${this.base}/create`, { method: 'POST', body: JSON.stringify(req) }) as any
    return {
      programId: data.id ?? data.programId ?? data.programID,
      versionId: data.currentVersion ?? data.versionId,
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

  static async saveDraft(
    programId: string,
    draft: string | {
      name?: string
      description?: string
      width?: number
      height?: number
      duration?: number
      thumbnailUrl?: string
      vsnData?: string
      contentData?: string
    },
    thumbnailUrlIfStringArg?: string,
  ): Promise<{ programId: string; draftVersionId: string }>{
    // 支持字符串与完整对象两种传参，便于兼容旧用法
    const body = typeof draft === 'string'
      ? { contentData: draft, thumbnailUrl: thumbnailUrlIfStringArg }
      : draft
    const data = await fetchApi(`${this.base}/${programId}/draft`, { method: 'POST', body: JSON.stringify(body) }) as any
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
    // 使用 body 传参（PageRequestDTOQueryProgramListRequest）
    const sortField = query.sortBy === 'updatedAt' ? 'updatedTime' : query.sortBy
    const pageRequest: any = {
      pageNum: query.page || 1,
      pageSize: query.pageSize || 20,
      sortField,
      sortOrder: query.sortOrder,
      params: {
        keyword: query.keyword,
        status: query.status ? mapStatusToBackend(query.status) : undefined,
      },
    }
    const data = await fetchApi(`${this.base}/list`, { method: 'POST', body: JSON.stringify(pageRequest) }) as { pageNum: number; pageSize: number; total: number; records: ProgramSummaryBackend[] }
    return {
      items: (data as any).records ? (data as any).records.map(mapSummary) : [],
      total: (data as any).total || 0,
      page: (data as any).pageNum || (query.page || 1),
      pageSize: (data as any).pageSize || (query.pageSize || 20),
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

  // ===== 模板相关 =====
  static async createTemplate(req: Omit<CreateProgramRequest, 'status'>): Promise<{ templateId: string }>{
    const payload = { ...req }
    const data = await fetchApi(`${this.base}/template/create`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return { templateId: data.id ?? data.templateId ?? '' }
  }

  static async listTemplates(query: { keyword?: string; page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}): Promise<ProgramListResponse>{
    const params = new URLSearchParams()
    if (query.keyword) params.append('keyword', query.keyword)
    if (query.page) params.append('page', String(query.page))
    if (query.pageSize) params.append('pageSize', String(query.pageSize))
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortOrder) params.append('sortOrder', query.sortOrder)
    const data = await fetchApi(`${this.base}/template/list?${params.toString()}`) as { items: ProgramSummaryBackend[]; total: number; page: number; pageSize: number }
    return {
      items: (data.items || []).map(mapSummary),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || (query.pageSize || 20),
    }
  }

  static async instantiateFromTemplate(templateId: string, payload: { name: string; description?: string }): Promise<{ programId: string }>{
    const data = await fetchApi(`${this.base}/template/${templateId}/instantiate`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return { programId: data.id ?? data.programId ?? '' }
  }

  // ===== 审核相关（对齐核心服务文档） =====
  // 提交节目审核：POST /program/{programId}/versions/{versionId}/approval/submit
  static async submitReview(programId: string, versionId?: string, payload?: Record<string, unknown>): Promise<{ success?: boolean; approvalId?: string }>{
    let targetVersionId = versionId
    if (!targetVersionId) {
      try {
        const { items } = await this.listVersions(programId)
        if (items && items.length > 0) {
          const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const draft = sorted.find(v => v.type === 'draft')
          targetVersionId = draft?.versionId || sorted[0].versionId
        }
      } catch {}
    }
    if (!targetVersionId) throw new Error('未找到可提交审核的版本')
    const url = `${CORE_API_PREFIX}/program/${encodeURIComponent(programId)}/versions/${encodeURIComponent(targetVersionId)}/approval/submit`
    const data = await fetchApi(url, { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }) as any
    return { success: data === true || data?.success === true, approvalId: data?.approvalId }
  }

  static async listPendingReviews(query: { scope?: 'mine' | 'all'; page?: number; pageSize?: number; keyword?: string; status?: ProgramApprovalStatusFrontend } = {}): Promise<{ items: any[]; total: number; page: number; pageSize: number }>{
    const pageNum = query.page || 1
    const pageSize = query.pageSize || 20
    const scope = query.scope === 'all' ? 'all' : 'mine'

    // 新文档使用 POST + PageRequestDTO 包装
    const body: any = {
      pageNum,
      pageSize,
      params: {
        keyword: query.keyword,
        status: query.status ? (query.status.toUpperCase()) : undefined,
      },
    }

    const path = scope === 'all'
      ? `${CORE_API_PREFIX}/program/approval/all`
      : `${CORE_API_PREFIX}/program/approval/pending-for-me`

    const data = await fetchApi(path, { method: 'POST', body: JSON.stringify(body) }) as any
    return {
      items: (data.records ?? data.items ?? data.list ?? data.data ?? []),
      total: data.total ?? data.totalCount ?? 0,
      page: data.pageNum ?? data.page ?? pageNum,
      pageSize: data.pageSize ?? data.size ?? pageSize,
    }
  }

  static async approveReview(approvalId: string, payload: Record<string, unknown>): Promise<{ approvalId: string; success: boolean }>{
    const data = await fetchApi(`${CORE_API_PREFIX}/program/approval/${encodeURIComponent(approvalId)}/approve`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return { approvalId, success: data === true || data?.success === true }
  }

  static async rejectReview(approvalId: string, payload: Record<string, unknown>): Promise<{ approvalId: string; success: boolean }>{
    const data = await fetchApi(`${CORE_API_PREFIX}/program/approval/${encodeURIComponent(approvalId)}/reject`, { method: 'POST', body: JSON.stringify(payload) }) as any
    return { approvalId, success: data === true || data?.success === true }
  }

  static async getProgramReviews(programId: string): Promise<{ items: any[] }>{
    const data = await fetchApi(`${CORE_API_PREFIX}/program/${encodeURIComponent(programId)}/approval/history`) as any
    return { items: data?.items ?? data ?? [] }
  }

  // 我发起的审核请求列表（以接口文档为准，若路径不同请在此适配）
  static async listSubmittedReviews(query: { page?: number; pageSize?: number; keyword?: string; status?: ProgramApprovalStatusFrontend; startTime?: string; endTime?: string } = {}): Promise<{ items: any[]; total: number; page: number; pageSize: number }>{
    const pageNum = query.page || 1
    const pageSize = query.pageSize || 20
    const body: any = {
      pageNum,
      pageSize,
      params: {
        keyword: query.keyword,
        status: query.status ? (query.status.toUpperCase()) : undefined,
        startTime: query.startTime,
        endTime: query.endTime,
      },
    }
    const data = await fetchApi(`${CORE_API_PREFIX}/program/approval/initiated-by-me`, { method: 'POST', body: JSON.stringify(body) }) as any
    return {
      items: (data.records ?? data.items ?? data.list ?? data.data ?? []),
      total: data.total ?? data.totalCount ?? 0,
      page: data.pageNum ?? data.page ?? pageNum,
      pageSize: data.pageSize ?? data.size ?? pageSize,
    }
  }
}

export default ProgramAPI

