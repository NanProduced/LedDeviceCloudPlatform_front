/**
 * WebSocket 相关类型定义
 * 
 * 本文件包含所有WebSocket通信相关的类型定义，包括：
 * - 统一消息格式
 * - 枚举类型
 * - 连接状态
 * - Hook接口
 * - 通知类型
 */

// ========== 枚举类型定义 ==========

/**
 * 消息类型枚举
 * 用于标识不同类型的WebSocket消息
 */
export enum MessageType {
  /** 任务进度更新 */
  TASK_PROGRESS = 'TASK_PROGRESS',
  /** 设备状态变更 */
  DEVICE_STATUS = 'DEVICE_STATUS',
  /** 文件上传状态 */
  FILE_UPLOAD = 'FILE_UPLOAD',
  /** 转码进度 */
  TRANSCODE_PROGRESS = 'TRANSCODE_PROGRESS',
  /** 命令执行反馈 */
  COMMAND_FEEDBACK = 'COMMAND_FEEDBACK',
  /** 系统通知 */
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  /** 用户消息 */
  USER_MESSAGE = 'USER_MESSAGE',
  /** 连接状态 */
  CONNECTION_STATUS = 'CONNECTION_STATUS',
  /** 主题订阅反馈 */
  TOPIC_SUBSCRIBE_FEEDBACK = 'TOPIC_SUBSCRIBE_FEEDBACK'
}

/**
 * 消息级别枚举
 * 决定前端UI的展示方式
 */
export enum Level {
  /** 成功 - 绿色Toast通知，3秒自动消失 */
  SUCCESS = 'SUCCESS',
  /** 信息 - 蓝色Toast通知，5秒自动消失 */
  INFO = 'INFO',
  /** 警告 - 黄色Alert组件，需手动关闭 */
  WARNING = 'WARNING',
  /** 错误 - 红色Modal弹窗，必须用户确认 */
  ERROR = 'ERROR',
  /** 忽略 - 不显示UI，仅记录日志 */
  IGNORE = 'IGNORE'
}

/**
 * 消息优先级枚举
 */
export enum Priority {
  /** 高优先级 - 立即显示，可能伴随声音提示 */
  HIGH = 'HIGH',
  /** 普通优先级 - 正常队列处理 */
  NORMAL = 'NORMAL',
  /** 低优先级 - 延迟显示，可批量处理 */
  LOW = 'LOW'
}

/**
 * 操作类型枚举
 * 定义消息中actions按钮的操作类型
 */
export enum ActionType {
  /** 下载操作 */
  DOWNLOAD = 'DOWNLOAD',
  /** 查看详情 */
  VIEW = 'VIEW',
  /** 页面导航 */
  NAVIGATE = 'NAVIGATE',
  /** 确认操作 */
  CONFIRM = 'CONFIRM',
  /** 重试操作 */
  RETRY = 'RETRY',
  /** 刷新数据 */
  REFRESH = 'REFRESH',
  /** 关闭消息 */
  DISMISS = 'DISMISS'
}

/**
 * WebSocket连接状态枚举
 */
export enum ConnectionState {
  /** 未连接 */
  DISCONNECTED = 'DISCONNECTED',
  /** 连接中 */
  CONNECTING = 'CONNECTING',
  /** 已连接 */
  CONNECTED = 'CONNECTED',
  /** 重连中 */
  RECONNECTING = 'RECONNECTING',
  /** 连接失败 */
  FAILED = 'FAILED'
}

/**
 * 资源类型枚举
 * 用于context中的resourceType字段
 */
export enum ResourceType {
  TASK = 'TASK',
  COMMAND = 'COMMAND',
  TERMINAL = 'TERMINAL',
  DEVICE = 'DEVICE',
  FILE = 'FILE',
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

// ========== 接口类型定义 ==========

/**
 * 消息上下文接口
 * 包含业务相关的上下文信息
 */
export interface MessageContext {
  /** 资源类型 */
  resourceType?: ResourceType;
  /** 用户ID */
  uid?: number;
  /** 终端ID */
  tid?: number;
  /** 批量ID */
  batchId?: string;
  /** 任务ID */
  taskId?: string;
  /** 命令ID */
  commandId?: string;
}

/**
 * 操作按钮接口
 * 定义消息中可执行的操作
 */
export interface Action {
  /** 操作ID */
  actionId: string;
  /** 操作名称（按钮显示文本） */
  actionName: string;
  /** 操作类型 */
  actionType: ActionType;
  /** 操作目标（API地址或路由） */
  actionTarget: string;
  /** 操作参数 */
  parameters?: Record<string, any>;
}

/**
 * 统一消息格式接口
 * 与后端Message格式完全一致
 */
export interface UnifiedMessage {
  /** 消息唯一ID，用于去重和ACK */
  messageId: string;
  /** 消息生成时间，ISO8601格式 */
  timestamp: string;
  /** 组织ID，用于组织隔离 */
  oid: number;
  
  /** 主消息类型 */
  messageType: MessageType;
  /** 子类型1，业务自定义 */
  subType_1?: string;
  /** 子类型2，可选 */
  subType_2?: string;
  /** 子类型3，可选 */
  subType_3?: string;
  
  /** 消息级别，影响前端展示 */
  level: Level;
  /** 业务上下文 */
  context?: MessageContext;
  /** 是否为聚合消息 */
  aggregate?: boolean;
  
  /** 消息标题 */
  title?: string;
  /** 消息正文内容 */
  content?: string;
  /** 业务数据体，根据messageType结构动态 */
  payload?: any;
  
  /** 消息优先级 */
  priority?: Priority;
  /** 是否需要用户主动确认 */
  requireAck?: boolean;
  /** 消息过期时间（毫秒） */
  ttl?: number;
  /** 可执行操作列表 */
  actions?: Action[];
  /** 扩展属性 */
  extra?: Record<string, any>;
}

/**
 * 接收到的消息接口
 * 在UnifiedMessage基础上添加接收时间等前端字段
 */
export interface ReceivedMessage extends UnifiedMessage {
  /** 前端接收时间 */
  receivedAt: Date;
  /** 是否已读 */
  isRead?: boolean;
  /** 是否已确认（针对requireAck=true的消息） */
  isAcknowledged?: boolean;
}

/**
 * 订阅信息接口
 */
export interface SubscriptionInfo {
  /** 订阅ID */
  id: string;
  /** 订阅目标地址 */
  destination: string;
  /** 订阅时间 */
  subscribedAt: Date;
  /** 是否为自动订阅 */
  isAutoSubscription: boolean;
  /** STOMP订阅对象 */
  subscription?: any; // StompSubscription类型，避免循环依赖
}

/**
 * 通知项接口
 * 用于通知管理器
 */
export interface NotificationItem {
  /** 通知ID */
  id: string;
  /** 关联的消息 */
  message: UnifiedMessage;
  /** 通知类型 */
  type: 'toast' | 'alert' | 'modal';
  /** 是否可见 */
  visible: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 过期时间 */
  expiresAt?: Date;
}

// ========== Hook接口定义 ==========

/**
 * useWebSocket Hook 返回值接口
 */
export interface UseWebSocketReturn {
  /** 是否已连接 */
  isConnected: boolean;
  /** 连接状态 */
  connectionState: ConnectionState;
  /** 连接错误信息 */
  connectionError: string | null;
  /** 发送消息函数 */
  send: (destination: string, body: any, headers?: Record<string, string>) => void;
  /** 连接函数 */
  connect: () => void;
  /** 断开连接函数 */
  disconnect: () => void;
  /** 重连函数 */
  reconnect: () => void;
}

/**
 * useMessages Hook 返回值接口
 */
export interface UseMessagesReturn {
  /** 所有消息列表 */
  messages: ReceivedMessage[];
  /** 未读消息数量 */
  unreadCount: number;
  /** 根据类型获取消息 */
  getMessagesByType: (type: MessageType) => ReceivedMessage[];
  /** 标记消息为已读 */
  markAsRead: (messageId: string) => void;
  /** 标记所有消息为已读 */
  markAllAsRead: () => void;
  /** 确认消息（针对requireAck=true的消息） */
  acknowledgeMessage: (messageId: string) => void;
  /** 清空消息 */
  clearMessages: () => void;
  /** 删除消息 */
  deleteMessage: (messageId: string) => void;
}

/**
 * useNotifications Hook 返回值接口
 */
export interface UseNotificationsReturn {
  /** 当前通知列表 */
  notifications: NotificationItem[];
  /** 显示通知 */
  showNotification: (message: UnifiedMessage) => void;
  /** 关闭通知 */
  dismissNotification: (id: string) => void;
  /** 关闭所有通知 */
  dismissAll: () => void;
}

/**
 * useSubscription Hook 返回值接口
 */
export interface UseSubscriptionReturn {
  /** 当前订阅列表 */
  subscriptions: SubscriptionInfo[];
  /** 订阅主题 */
  subscribe: (destination: string, callback?: (message: UnifiedMessage) => void) => Promise<string>;
  /** 取消订阅 */
  unsubscribe: (destination: string) => void;
  /** 取消所有订阅 */
  unsubscribeAll: () => void;
  /** 检查是否已订阅 */
  isSubscribed: (destination: string) => boolean;
}

// ========== WebSocket Context 相关类型 ==========

/**
 * WebSocket状态接口
 */
export interface WebSocketState {
  /** 连接状态 */
  connectionState: ConnectionState;
  /** 连接错误 */
  connectionError: string | null;
  /** 消息列表 */
  messages: ReceivedMessage[];
  /** 订阅列表 */
  subscriptions: SubscriptionInfo[];
  /** 通知列表 */
  notifications: NotificationItem[];
  /** 未读消息数量 */
  unreadCount: number;
}

/**
 * WebSocket Action类型
 */
export type WebSocketAction =
  | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState }
  | { type: 'SET_CONNECTION_ERROR'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: ReceivedMessage }
  | { type: 'MARK_MESSAGE_READ'; payload: string }
  | { type: 'MARK_ALL_MESSAGES_READ' }
  | { type: 'ACKNOWLEDGE_MESSAGE'; payload: string }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_SUBSCRIPTION'; payload: SubscriptionInfo }
  | { type: 'REMOVE_SUBSCRIPTION'; payload: string }
  | { type: 'CLEAR_SUBSCRIPTIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

/**
 * WebSocket Context值接口
 */
export interface WebSocketContextValue extends WebSocketState {
  /** 分发Action */
  dispatch: React.Dispatch<WebSocketAction>;
  /** WebSocket管理器实例 */
  manager: any; // WebSocketManager类型，避免循环依赖
}

// ========== 配置相关类型 ==========

/**
 * WebSocket配置接口
 */
export interface WebSocketConfig {
  /** WebSocket服务器地址 */
  brokerURL: string;
  /** 连接头信息 */
  connectHeaders?: Record<string, string>;
  /** 是否启用调试 */
  debug?: boolean;
  /** 重连延迟（毫秒） */
  reconnectDelay?: number;
  /** 最大重连次数 */
  maxReconnectAttempts?: number;
  /** 心跳间隔（毫秒） */
  heartbeatIncoming?: number;
  /** 心跳间隔（毫秒） */
  heartbeatOutgoing?: number;
}

/**
 * 消息处理器接口
 */
export interface MessageHandler {
  /** 消息类型 */
  messageType: MessageType;
  /** 处理函数 */
  handler: (message: UnifiedMessage) => void;
}

/**
 * 订阅配置接口
 */
export interface SubscriptionConfig {
  /** 订阅地址 */
  destination: string;
  /** 是否为自动订阅 */
  isAutoSubscription?: boolean;
  /** 订阅头信息 */
  headers?: Record<string, string>;
}