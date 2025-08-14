import { fetchApi, CORE_API_PREFIX } from '../api'

export interface TrendDataPoint {
  timestamp: string
  value: number
  deltaValue?: number
  deltaPercentage?: number
}

export interface TrendSummary {
  overallTrend?: string
  averageDailyGrowth?: number
  maxDailyGrowth?: number
  growthRate?: number
  peakTime?: string
  peakValue?: number
}

export interface QuotaTrendResponse {
  orgId: number
  period: 'day' | 'week' | 'month' | string
  storageUsageTrend: TrendDataPoint[]
  fileCountTrend: TrendDataPoint[]
  summary?: TrendSummary
  generatedAt?: string
}

export interface StorageQuotaInfo {
  maxSize: number
  usedSize: number
  remainingSize: number
  usagePercentage: number
  status?: string
}

export interface FileQuotaInfo {
  maxCount: number
  usedCount: number
  remainingCount: number
  usagePercentage: number
  status?: string
}

export interface WarningInfo {
  thresholdPercent?: number
  isWarning?: boolean
  warningMessage?: string
}

export interface PredictionInfo {
  estimatedDaysRemaining?: number
  growthTrend?: string
  dailyGrowthBytes?: number
}

export interface OrgQuotaDetailResponse {
  orgId: number
  storageInfo: StorageQuotaInfo
  fileInfo?: FileQuotaInfo
  warningInfo?: WarningInfo
  predictionInfo?: PredictionInfo
  updatedTime?: string
}

export interface FileTypeBreakdownItem {
  fileType: string
  fileTypeDisplayName?: string
  usedBytes: number
  fileCount: number
  storagePercentage?: number
  countPercentage?: number
  averageFileSize?: number
}

export interface UserGroupBreakdownItem {
  userGroupId: number
  userGroupName: string
  usedBytes: number
  fileCount: number
  storagePercentage?: number
  countPercentage?: number
  activeUserCount?: number
}

export interface OperationTypeBreakdownItem {
  operationType: string
  operationDisplayName?: string
  operationCount: number
  totalBytes: number
  operationPercentage?: number
  lastOperationTime?: string
}

export interface BreakdownSummary {
  totalUsedBytes: number
  totalFileCount: number
  topFileTypeByStorage?: string
  topUserGroupByCount?: string
  mostActiveOperationType?: string
  statisticTimeRange?: string
  extras?: Record<string, unknown>
}

export interface QuotaBreakdownResponse {
  orgId: number
  fileTypeBreakdown: FileTypeBreakdownItem[]
  userGroupBreakdown: UserGroupBreakdownItem[]
  operationTypeBreakdown: OperationTypeBreakdownItem[]
  summary?: BreakdownSummary
  generatedAt?: string
}

export class QuotaAPI {
  static async getTrend(orgId: number, options?: { period?: 'day' | 'week' | 'month'; days?: number }): Promise<QuotaTrendResponse> {
    const params = new URLSearchParams()
    if (options?.period) params.append('period', options.period)
    if (options?.days != null) params.append('days', String(options.days))
    return await fetchApi(`${CORE_API_PREFIX}/quota/trend/${encodeURIComponent(String(orgId))}${params.size ? `?${params.toString()}` : ''}`)
  }

  static async getDetail(orgId: number): Promise<OrgQuotaDetailResponse> {
    return await fetchApi(`${CORE_API_PREFIX}/quota/detail/${encodeURIComponent(String(orgId))}`)
  }

  static async getBreakdown(orgId: number): Promise<QuotaBreakdownResponse> {
    return await fetchApi(`${CORE_API_PREFIX}/quota/breakdown/${encodeURIComponent(String(orgId))}`)
  }
}

export default QuotaAPI

