import { fetchApi } from '../api'

// ========== 类型定义 ==========

export interface TranscodingTaskQueryRequest {
  status?: string
  transcodePreset?: string
  sourceMaterialId?: number
  startTime?: string
  endTime?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
}

export interface MaterialInfo {
  materialId?: number
  materialName?: string
  fileId?: string
  fileSize?: number
  mimeType?: string
  fileExtension?: string
  storagePath?: string
  thumbnailPath?: string
  md5Hash?: string
  createTime?: string
}

export interface TranscodingDetailInfo {
  transcodingDetailId?: string
  durationMs?: number
  videoDurationSeconds?: number
  sourceResolution?: string
  targetResolution?: string
  sourceVideoCodec?: string
  targetVideoCodec?: string
  compressionRatio?: number
  qualityScore?: number
  errorMessage?: string
}

export interface TranscodingTaskInfo {
  taskId: string
  status: string
  progress?: number
  transcodePreset?: string
  sourceMaterial?: MaterialInfo
  targetMaterial?: MaterialInfo
  transcodingDetail?: TranscodingDetailInfo
  createTime?: string
  completeTime?: string
}

export interface TranscodingTaskResponse {
  tasks: TranscodingTaskInfo[]
  total: number
}

export interface VideoConfig {
  resolution?: string
  width?: number
  height?: number
  bitrate?: number
  frameRate?: number
  codec?: string
  quality?: string
  crf?: number
  speedPreset?: string
  container?: string
}

export interface AudioConfig {
  bitrate?: number
  sampleRate?: number
  channels?: number
  codec?: string
}

export interface PresetInfo {
  name: string
  displayName?: string
  description?: string
  videoConfig?: VideoConfig
  audioConfig?: AudioConfig
  isDefault?: boolean
  scene?: string
  estimatedSizeRatio?: number
}

export interface TranscodingPresetResponse {
  presets: PresetInfo[]
  supportedFormats?: string[]
}

export interface TranscodingParameters {
  videoCodec?: string
  audioCodec?: string
  videoBitrate?: number
  audioBitrate?: number
  frameRate?: number
  width?: number
  height?: number
  aspectRatio?: string
  gopSize?: number
  preset?: string
  crf?: number
  audioSampleRate?: number
  audioChannels?: number
  startTime?: number
  duration?: number
  removeAudio?: boolean
  removeVideo?: boolean
  watermark?: Record<string, unknown>
  subtitle?: Record<string, unknown>
  bframes?: number
}

// ========== API 客户端 ==========

export class TranscodeAPI {
  // 预设相关
  static async listPresets(): Promise<TranscodingPresetResponse> {
    return await fetchApi('/file/api/file/transcode/presets')
  }

  static async getPreset(id: string): Promise<PresetInfo> {
    return await fetchApi(`/file/api/file/transcode/presets/${encodeURIComponent(id)}`)
  }

  static async getPresetParameters(id: string): Promise<TranscodingParameters> {
    return await fetchApi(`/file/api/file/transcode/presets/${encodeURIComponent(id)}/parameters`)
  }

  // 任务提交
  static async submitTranscode(
    mid: number,
    payload?: { presetName?: string; parameters?: TranscodingParameters }
  ): Promise<any> {
    // 优先尝试带body提交；若失败再回退无body
    try {
      if (payload && (payload.presetName || payload.parameters)) {
        return await fetchApi(`/core/api/material/${mid}/transcode`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }
      // 无payload
      return await fetchApi(`/core/api/material/${mid}/transcode`, { method: 'POST' })
    } catch (e) {
      // 回退：无body提交
      return await fetchApi(`/core/api/material/${mid}/transcode`, { method: 'POST' })
    }
  }

  // 任务查询
  static async queryTasks(query: TranscodingTaskQueryRequest): Promise<TranscodingTaskResponse> {
    return await fetchApi('/core/api/transcoding/tasks/query', {
      method: 'POST',
      body: JSON.stringify(query)
    })
  }

  static async getTaskDetail(taskId: string): Promise<TranscodingTaskInfo> {
    return await fetchApi(`/core/api/transcoding/tasks/${encodeURIComponent(taskId)}`)
  }

  static async listTasksBySource(sourceMaterialId: number): Promise<TranscodingTaskInfo[]> {
    return await fetchApi(`/core/api/transcoding/tasks/by-source/${encodeURIComponent(String(sourceMaterialId))}`)
  }
}

export default TranscodeAPI

