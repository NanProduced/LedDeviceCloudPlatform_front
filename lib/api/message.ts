/**
 * 消息中心API服务
 * 
 * 提供统一的消息中心API调用接口，包括：
 * - 实时消息API
 * - 广播消息API
 * - 任务列表API（待后端补充）
 * - 消息确认API
 */

import { api } from '../api';

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
  
  /**
   * 获取任务列表（Mock实现）
   */
  static async getTaskList(params: {
    pageNum: number;
    pageSize: number;
    status?: string;
    type?: string;
  }): Promise<PageResponse<TaskInfo>> {
    // Mock数据 - 模拟任务列表
    const mockTasks: TaskInfo[] = [
      {
        id: 'task-001',
        name: '春节宣传片.mp4',
        type: 'UPLOAD',
        status: 'SUCCESS',
        progress: 100,
        fileSize: 131072000, // 125MB
        fileSizeFormatted: '125.0MB',
        createTime: '2025-01-25T13:30:00Z',
        parameters: { uploadTime: '14分20秒' }
      },
      {
        id: 'task-002',
        name: '产品介绍.avi',
        type: 'TRANSCODE',
        status: 'FAILED',
        progress: 45,
        fileSize: 93650944, // 89.3MB
        fileSizeFormatted: '89.3MB',
        createTime: '2025-01-25T12:00:00Z',
        errorMessage: '转码失败：视频格式不支持'
      },
      {
        id: 'task-003',
        name: '播放日志导出',
        type: 'EXPORT',
        status: 'RUNNING',
        progress: 75,
        createTime: '2025-01-25T11:00:00Z',
        estimatedTime: 300, // 5分钟
        fileSizeFormatted: '预计 2.3MB'
      },
      {
        id: 'task-004',
        name: '新年祝福.mov',
        type: 'UPLOAD',
        status: 'RUNNING',
        progress: 68,
        fileSize: 246415360, // 234.7MB
        fileSizeFormatted: '234.7MB',
        createTime: '2025-01-25T10:30:00Z',
        estimatedTime: 720 // 12分钟
      },
      {
        id: 'task-005',
        name: '宣传素材.wmv',
        type: 'TRANSCODE',
        status: 'SUCCESS',
        progress: 100,
        fileSize: 164626432, // 156.8MB
        fileSizeFormatted: '156.8MB',
        createTime: '2025-01-25T09:15:00Z',
        parameters: { transcodeTime: '29分20秒' }
      }
    ];

    // 模拟筛选
    let filteredTasks = mockTasks;
    if (params.status) {
      filteredTasks = filteredTasks.filter(task => task.status === params.status);
    }
    if (params.type) {
      filteredTasks = filteredTasks.filter(task => task.type === params.type);
    }

    // 模拟分页
    const total = filteredTasks.length;
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    const records = filteredTasks.slice(start, end);

    return {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
      records,
      hasNext: end < total,
      hasPrevious: params.pageNum > 1
    };
  }

  /**
   * 获取任务统计信息（Mock实现）
   */
  static async getTaskStatistics(): Promise<Record<string, number>> {
    return {
      total: 8,
      SUCCESS: 3,
      RUNNING: 2,
      PENDING: 1,
      FAILED: 2
    };
  }

  /**
   * 获取任务详情（Mock实现）
   */
  static async getTaskDetail(taskId: string): Promise<TaskInfo> {
    // Mock数据
    return {
      id: taskId,
      name: '示例任务详情',
      type: 'UPLOAD',
      status: 'RUNNING',
      progress: 65,
      fileSize: 104857600,
      fileSizeFormatted: '100.0MB',
      createTime: '2025-01-25T10:00:00Z',
      estimatedTime: 600,
      parameters: {
        originalFormat: 'mp4',
        targetFormat: 'webm',
        quality: 'high'
      }
    };
  }

  /**
   * 重试任务（Mock实现）
   */
  static async retryTask(taskId: string): Promise<void> {
    // Mock实现 - 实际需要调用后端API
    console.log(`重试任务: ${taskId}`);
  }

  /**
   * 取消任务（Mock实现）
   */
  static async cancelTask(taskId: string): Promise<void> {
    // Mock实现 - 实际需要调用后端API
    console.log(`取消任务: ${taskId}`);
  }
}

// ========== 统一导出 ==========

export const MessageAPI = {
  realtime: RealtimeMessageAPI,
  broadcast: BroadcastMessageAPI,
  task: TaskAPI
};

export default MessageAPI;