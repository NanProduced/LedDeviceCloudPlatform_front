/**
 * 消息中心API服务
 * 
 * 提供统一的消息中心API调用接口，包括：
 * - 实时消息API
 * - 广播消息API
 * - 任务列表API（待后端补充）
 * - 消息确认API
 */

import { api, CORE_API_PREFIX } from '../api';

// ========== 类型定义 ==========

/**
 * 分页请求参数
 */
export interface PageRequest<T = any> {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  params?: T;
}

/**
 * 分页响应结果
 */
export interface PageResponse<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  records: T[];
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 实时消息查询参数
 */
export interface QueryRealtimeMessageRequest {
  /** 消息类型筛选项 */
  messageType?: string;
  /** 是否只看未读消息 */
  onlyUnread?: boolean;
}

/**
 * 实时消息响应
 */
export interface RealtimeMessageResponse {
  /** 消息ID */
  id: string;
  /** 时间戳 */
  timestamp: string;
  /** 组织ID */
  oid: number;
  /** 用户ID */
  uid: number;
  /** 消息类型 */
  messageType: string;
  /** 子类型1 */
  subType_1?: string;
  /** 子类型2 */
  subType_2?: string;
  /** 优先级 */
  level: string;
  /** 标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 附加消息 */
  payload?: any;
}

/**
 * 广播消息查询参数
 */
export interface QueryBroadcastMessageRequest {
  /** 消息类型筛选项 */
  messageType?: string;
  /** 消息子类型筛选项 */
  subType_1?: string;
  /** 是否只看未读消息 */
  onlyUnread?: boolean;
  /** 消息范围筛选项（SYSTEM/ORG） */
  scope?: 'SYSTEM' | 'ORG';
}

/**
 * 广播消息响应
 */
export interface BroadcastMessageResponse {
  /** MongoDB文档ID */
  id: string;
  /** 消息ID */
  messageId: string;
  /** 时间戳 */
  timestamp: string;
  /** 组织ID */
  oid: number;
  /** 消息类型 */
  messageType: string;
  /** 消息子类型1 */
  subType_1?: string;
  /** 消息子类型2 */
  subType_2?: string;
  /** 消息级别 */
  level: string;
  /** 消息范围（SYSTEM/ORG） */
  scope: string;
  /** 目标组织列表 */
  targetOid?: number[];
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 附加数据 */
  payload?: any;
  /** 过期时间 */
  expiredAt?: string;
  /** 发布者ID */
  publisherId: number;
  /** 用户是否已读该消息 */
  isRead: boolean;
  /** 用户已读时间 */
  readAt?: string;
}

/**
 * 任务信息（Mock数据结构，待后端API补充）
 */
export interface TaskInfo {
  /** 任务ID */
  id: string;
  /** 任务名称/描述 */
  name: string;
  /** 任务类型 */
  type: 'UPLOAD' | 'TRANSCODE' | 'EXPORT' | 'DOWNLOAD';
  /** 任务状态 */
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  /** 进度百分比 */
  progress: number;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 文件大小（格式化） */
  fileSizeFormatted?: string;
  /** 创建时间 */
  createTime: string;
  /** 预计剩余时间（秒） */
  estimatedTime?: number;
  /** 错误信息（如果失败） */
  errorMessage?: string;
  /** 扩展参数 */
  parameters?: Record<string, any>;
}

/**
 * 批量操作请求
 */
export interface BatchOperationRequest {
  /** 操作类型 */
  action: 'MARK_READ' | 'DELETE' | 'ARCHIVE';
  /** 消息ID列表 */
  messageIds: string[];
}

// ========== 实时消息API ==========

/**
 * 实时消息API服务类
 */
export class RealtimeMessageAPI {
  
  /**
   * 获取用户实时消息列表
   */
  static async getMessageList(params: PageRequest<QueryRealtimeMessageRequest>): Promise<PageResponse<RealtimeMessageResponse>> {
    const response = await api.post('/core/api/realtime/message/list', params);
    return response.data;
  }

  /**
   * 获取用户未读消息数量
   */
  static async getUnreadCount(): Promise<number> {
    const response = await api.get('/core/api/realtime/message/unread');
    return response.data;
  }

  /**
   * 获取用户未读消息统计（按类型分类）
   */
  static async getUnreadCountByType(): Promise<Record<string, number>> {
    const response = await api.get('/core/api/realtime/message/count');
    return response.data;
  }

  /**
   * 标记消息为已读（通过STOMP发送）
   * 注意：这里只是示例，实际实现需要通过WebSocket的STOMP连接发送ACK
   */
  static async markAsRead(messageId: string): Promise<void> {
    // 实际实现应该通过 WebSocket Manager 发送到 /app/message/ack/{messageId}
    // 这里预留接口，具体实现在组件中通过useWebSocket hooks
    throw new Error('请通过WebSocket STOMP连接发送ACK确认');
  }

  /**
   * 批量操作消息
   */
  static async batchOperation(request: BatchOperationRequest): Promise<void> {
    // 待后端API提供
    const response = await api.post('/core/api/realtime/message/batch', request);
    return response.data;
  }
}

// ========== 广播消息API ==========

/**
 * 广播消息API服务类
 */
export class BroadcastMessageAPI {
  
  /**
   * 获取用户广播消息列表
   */
  static async getMessageList(params: PageRequest<QueryBroadcastMessageRequest>): Promise<PageResponse<BroadcastMessageResponse>> {
    const response = await api.post('/core/api/broadcast/message/list', params);
    return response.data;
  }

  /**
   * 获取用户未读广播消息数量
   */
  static async getUnreadCount(): Promise<number> {
    const response = await api.get('/core/api/broadcast/message/unread/count');
    return response.data;
  }

  /**
   * 按类型获取用户未读广播消息数量
   */
  static async getUnreadCountByType(): Promise<Record<string, number>> {
    const response = await api.get('/core/api/broadcast/message/unread/count-by-type');
    return response.data;
  }

  /**
   * 获取广播消息详情
   */
  static async getMessageDetail(messageId: string): Promise<BroadcastMessageResponse> {
    const response = await api.get(`/core/api/broadcast/message/detail/${messageId}`);
    return response.data;
  }

  /**
   * 标记广播消息为已读（通过STOMP发送）
   */
  static async markAsRead(messageId: string): Promise<void> {
    // 同实时消息，通过STOMP发送ACK
    throw new Error('请通过WebSocket STOMP连接发送ACK确认');
  }

  /**
   * 批量操作广播消息
   */
  static async batchOperation(request: BatchOperationRequest): Promise<void> {
    // 待后端API提供
    const response = await api.post('/core/api/broadcast/message/batch', request);
    return response.data;
  }
}

// ========== 任务列表API（Mock实现） ==========

/**
 * 任务列表API服务类
 * 注意：当前为Mock实现，待后端API完善后替换
 */
export class TaskAPI {
  private static mapStatusToBackend(status?: string): string | undefined {
    switch (status) {
      case 'PENDING':
        return 'PENDING'
      case 'RUNNING':
        return 'RUNNING'
      case 'SUCCESS':
        return 'COMPLETED'
      case 'FAILED':
        return 'FAILED'
      case 'CANCELLED':
        return 'CANCELED'
      default:
        return undefined
    }
  }
  private static mapStatusToFrontend(status?: string): TaskInfo['status'] {
    switch (status) {
      case 'PENDING':
        return 'PENDING';
      case 'RUNNING':
        return 'RUNNING';
      case 'COMPLETED':
        return 'SUCCESS';
      case 'FAILED':
        return 'FAILED';
      case 'CANCELED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  /**
   * 获取任务列表（核心服务真实接口）
   */
  static async getTaskList(params: {
    pageNum: number;
    pageSize: number;
    status?: string;
    type?: string;
    keyword?: string;
  }): Promise<PageResponse<TaskInfo>> {
    const body = {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      params: {
        keyword: params.keyword,
        taskType: params.type,
        taskStatus: TaskAPI.mapStatusToBackend(params.status),
      },
    };

    const response = await api.post(`${CORE_API_PREFIX}/task/list`, body);
    const data = response.data as any;

    const records: TaskInfo[] = (data.records || []).map((item: any) => ({
      id: item.taskId,
      name: item.ref || item.taskId,
      type: item.taskType || 'UPLOAD',
      status: TaskAPI.mapStatusToFrontend(item.taskStatus),
      progress: typeof item.progress === 'number' ? item.progress : 0,
      createTime: item.createTime,
      errorMessage: item.errorMessage,
      parameters: undefined,
      fileSize: undefined,
      fileSizeFormatted: undefined,
      estimatedTime: undefined,
    }));

    const pageSize = data.pageSize || params.pageSize;
    const total: number = data.total || records.length || 0;
    const pageNum = data.pageNum || params.pageNum || 1;

    return {
      pageNum,
      pageSize,
      total,
      totalPages: Math.ceil(total / (pageSize || 1)),
      records,
      hasNext: typeof data.hasNext === 'boolean' ? data.hasNext : pageNum * pageSize < total,
      hasPrevious: typeof data.hasPrevious === 'boolean' ? data.hasPrevious : pageNum > 1,
    };
  }

  /**
   * 获取任务统计信息（核心服务真实接口）
   */
  static async getTaskStatistics(): Promise<Record<string, number>> {
    const response = await api.post(`${CORE_API_PREFIX}/task/count/status`, {});
    const map = (response.data || {}) as Record<string, number>;
    const pending = map.PENDING || 0;
    const running = map.RUNNING || 0;
    const completed = map.COMPLETED || 0;
    const failed = map.FAILED || 0;
    const canceled = map.CANCELED || 0;
    const total = pending + running + completed + failed + canceled;
    return {
      total,
      PENDING: pending,
      RUNNING: running,
      SUCCESS: completed,
      FAILED: failed,
      CANCELLED: canceled,
    } as any;
  }

  /**
   * 获取任务详情（后端暂无对应接口，回退由调用方处理）
   */
  static async getTaskDetail(_taskId: string): Promise<TaskInfo> {
    throw new Error('后端暂无任务详情接口');
  }

  /**
   * 重试任务（后端暂无对应接口）
   */
  static async retryTask(_taskId: string): Promise<void> {
    throw new Error('后端暂无任务重试接口');
  }

  /**
   * 取消任务（核心服务真实接口）
   */
  static async cancelTask(taskId: string): Promise<void> {
    await api.post(`${CORE_API_PREFIX}/task/cancel/${encodeURIComponent(taskId)}`);
  }
}

// ========== 统一导出 ==========

export const MessageAPI = {
  realtime: RealtimeMessageAPI,
  broadcast: BroadcastMessageAPI,
  task: TaskAPI
};

export default MessageAPI;