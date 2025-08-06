/**
 * WebSocket 相关常量定义
 * 
 * 本文件包含所有WebSocket通信相关的常量配置，包括：
 * - 默认配置参数
 * - 网关地址配置
 * - 订阅主题模板
 * - 超时时间配置
 */

import { WebSocketConfig, MessageType, ActionType, Level, Priority } from './types';

// ========== 网关和连接配置 ==========

/**
 * 默认网关地址
 * 开发环境配置
 */
export const DEFAULT_GATEWAY_URL = 'http://192.168.1.222:8082';

/**
 * 默认WebSocket地址
 */
export const DEFAULT_WEBSOCKET_URL = 'ws://192.168.1.222:8082/message-service/ws';

/**
 * 默认WebSocket配置
 */
export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  brokerURL: DEFAULT_WEBSOCKET_URL,
  connectHeaders: {},
  debug: process.env.NODE_ENV === 'development',
  reconnectDelay: 5000, // 5秒
  maxReconnectAttempts: 10,
  heartbeatIncoming: 4000, // 4秒
  heartbeatOutgoing: 4000, // 4秒
};

// ========== 订阅主题配置 ==========

/**
 * 基础订阅主题
 * 用户登录后自动订阅的主题
 */
export const BASE_SUBSCRIPTION_TOPICS = {
  /** 个人消息队列 */
  USER_QUEUE: '/user/queue/messages',
  /** 组织消息主题模板 */
  ORG_TOPIC: '/topic/org/{orgId}',
  /** 系统全局消息 */
  SYSTEM_TOPIC: '/topic/system',
} as const;

/**
 * 动态订阅主题模板
 * 根据页面或业务需求动态订阅
 */
export const DYNAMIC_SUBSCRIPTION_TOPICS = {
  /** 设备消息主题 */
  DEVICE_TOPIC: '/topic/device/{deviceId}',
  /** 任务消息主题 */
  TASK_TOPIC: '/topic/task/{taskId}',
  /** 批量操作消息主题 */
  BATCH_TOPIC: '/topic/batch/{batchId}',
  /** 用户特定通知 */
  USER_NOTIFICATION: '/topic/user/{userId}/notifications',
  /** 组织公告 */
  ORG_ANNOUNCEMENT: '/topic/org/{orgId}/announcements',
  /** 用户欢迎消息 */
  USER_WELCOME: '/user/queue/welcome',
} as const;

// ========== 消息处理配置 ==========

/**
 * 默认TTL时间配置（毫秒）
 */
export const DEFAULT_TTL_CONFIG = {
  /** 最小TTL时间 - 1分钟 */
  MIN_TTL: 60 * 1000,
  /** 最大TTL时间 - 1小时 */
  MAX_TTL: 60 * 60 * 1000,
  /** 默认TTL时间 - 5分钟 */
  DEFAULT_TTL: 5 * 60 * 1000,
  /** 永不过期 */
  NEVER_EXPIRE: 0,
} as const;

/**
 * 消息级别对应的UI展示配置
 */
export const LEVEL_UI_CONFIG = {
  [Level.SUCCESS]: {
    type: 'toast' as const,
    duration: 3000, // 3秒
    color: 'success',
    icon: '✓',
  },
  [Level.INFO]: {
    type: 'toast' as const,
    duration: 5000, // 5秒
    color: 'info',
    icon: 'ℹ',
  },
  [Level.WARNING]: {
    type: 'alert' as const,
    duration: 0, // 手动关闭
    color: 'warning',
    icon: '⚠',
  },
  [Level.ERROR]: {
    type: 'modal' as const,
    duration: 0, // 必须确认
    color: 'error',
    icon: '✕',
  },
} as const;

/**
 * 优先级对应的处理配置
 */
export const PRIORITY_CONFIG = {
  [Priority.HIGH]: {
    immediate: true,
    sound: true,
    zIndex: 2000,
  },
  [Priority.NORMAL]: {
    immediate: false,
    sound: false,
    zIndex: 1000,
  },
  [Priority.LOW]: {
    immediate: false,
    sound: false,
    zIndex: 500,
    batchable: true,
  },
} as const;

// ========== 消息类型配置 ==========

/**
 * 消息类型显示名称映射
 */
export const MESSAGE_TYPE_DISPLAY_NAMES = {
  [MessageType.TASK_PROGRESS]: '任务进度',
  [MessageType.DEVICE_STATUS]: '设备状态',
  [MessageType.FILE_UPLOAD]: '文件上传',
  [MessageType.TRANSCODE_PROGRESS]: '转码进度',
  [MessageType.COMMAND_FEEDBACK]: '命令反馈',
  [MessageType.SYSTEM_NOTIFICATION]: '系统通知',
  [MessageType.USER_MESSAGE]: '用户消息',
} as const;

/**
 * 操作类型显示名称映射
 */
export const ACTION_TYPE_DISPLAY_NAMES = {
  [ActionType.DOWNLOAD]: '下载',
  [ActionType.VIEW]: '查看',
  [ActionType.NAVIGATE]: '跳转',
  [ActionType.CONFIRM]: '确认',
  [ActionType.RETRY]: '重试',
  [ActionType.REFRESH]: '刷新',
  [ActionType.DISMISS]: '关闭',
} as const;

// ========== 性能和限制配置 ==========

/**
 * 消息处理性能配置
 */
export const PERFORMANCE_CONFIG = {
  /** 最大消息缓存数量 */
  MAX_CACHED_MESSAGES: 1000,
  /** 最大通知数量 */
  MAX_NOTIFICATIONS: 50,
  /** 消息批处理大小 */
  BATCH_PROCESS_SIZE: 10,
  /** 消息处理防抖延迟（毫秒） */
  MESSAGE_DEBOUNCE_DELAY: 100,
  /** 最大发送频率（每秒消息数） */
  MAX_SEND_RATE: 10,
} as const;

/**
 * 重连配置
 */
export const RECONNECT_CONFIG = {
  /** 初始重连延迟（毫秒） */
  INITIAL_DELAY: 1000,
  /** 最大重连延迟（毫秒） */
  MAX_DELAY: 30000,
  /** 重连延迟倍数 */
  BACKOFF_MULTIPLIER: 1.5,
  /** 最大重连次数 */
  MAX_ATTEMPTS: 10,
} as const;

// ========== ACK和确认配置 ==========

/**
 * ACK相关配置
 */
export const ACK_CONFIG = {
  /** ACK发送地址模板 */
  ACK_DESTINATION: '/app/message/ack/{messageId}',
  /** ACK超时时间（毫秒） */
  ACK_TIMEOUT: 30000,
  /** 最大重试次数 */
  MAX_ACK_RETRIES: 3,
} as const;

// ========== 调试和开发配置 ==========

/**
 * 调试配置
 */
export const DEBUG_CONFIG = {
  /** 是否启用详细日志 */
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  /** 是否保存消息历史 */
  SAVE_MESSAGE_HISTORY: process.env.NODE_ENV === 'development',
  /** 最大日志条数 */
  MAX_LOG_ENTRIES: 500,
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  /** WebSocket配置 */
  WEBSOCKET_CONFIG: 'websocket_config',
  /** 消息历史 */
  MESSAGE_HISTORY: 'websocket_message_history',
  /** 订阅状态 */
  SUBSCRIPTION_STATE: 'websocket_subscription_state',
  /** 用户偏好设置 */
  USER_PREFERENCES: 'websocket_user_preferences',
} as const;

// ========== 错误代码和消息 ==========

/**
 * 错误代码定义
 */
export const ERROR_CODES = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  MESSAGE_PARSE_ERROR: 'MESSAGE_PARSE_ERROR',
  SUBSCRIPTION_FAILED: 'SUBSCRIPTION_FAILED',
  ACK_TIMEOUT: 'ACK_TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_MESSAGE_FORMAT: 'INVALID_MESSAGE_FORMAT',
} as const;

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.CONNECTION_FAILED]: '连接WebSocket服务器失败',
  [ERROR_CODES.MESSAGE_PARSE_ERROR]: '消息解析失败',
  [ERROR_CODES.SUBSCRIPTION_FAILED]: '订阅主题失败',
  [ERROR_CODES.ACK_TIMEOUT]: '消息确认超时',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: '发送频率超出限制',
  [ERROR_CODES.INVALID_MESSAGE_FORMAT]: '消息格式不正确',
} as const;

// ========== 工具函数辅助常量 ==========

/**
 * 主题模板替换正则表达式
 */
export const TOPIC_TEMPLATE_REGEX = /\{([^}]+)\}/g;

/**
 * 消息ID生成前缀
 */
export const MESSAGE_ID_PREFIX = 'ws_msg_';

/**
 * 订阅ID生成前缀
 */
export const SUBSCRIPTION_ID_PREFIX = 'ws_sub_';

/**
 * 通知ID生成前缀
 */
export const NOTIFICATION_ID_PREFIX = 'ws_notify_';