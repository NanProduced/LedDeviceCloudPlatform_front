/**
 * WebSocket 工具函数
 * 
 * 本文件包含所有WebSocket通信相关的工具函数，包括：
 * - 消息验证和格式化
 * - 主题处理
 * - TTL管理
 * - ID生成
 * - 错误处理
 */

import { 
  UnifiedMessage, 
  MessageType, 
  Level, 
  Priority, 
  ActionType,
  ReceivedMessage,
  SubscriptionInfo 
} from './types';
import { 
  DEFAULT_TTL_CONFIG, 
  TOPIC_TEMPLATE_REGEX, 
  MESSAGE_ID_PREFIX, 
  SUBSCRIPTION_ID_PREFIX, 
  NOTIFICATION_ID_PREFIX,
  ERROR_CODES,
  ERROR_MESSAGES 
} from './constants';

// ========== 消息验证函数 ==========

/**
 * 验证消息是否符合UnifiedMessage格式
 */
export function validateMessage(message: any): message is UnifiedMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  // 检查必填字段
  const requiredFields = ['messageId', 'timestamp', 'oid', 'messageType', 'level'];
  for (const field of requiredFields) {
    if (!message[field]) {
      return false;
    }
  }

  // 验证枚举值
  if (!Object.values(MessageType).includes(message.messageType)) {
    return false;
  }

  if (!Object.values(Level).includes(message.level)) {
    return false;
  }

  // 验证时间戳格式
  if (!isValidISODate(message.timestamp)) {
    return false;
  }

  // 验证oid是数字
  if (typeof message.oid !== 'number') {
    return false;
  }

  // 验证优先级（如果存在）
  if (message.priority && !Object.values(Priority).includes(message.priority)) {
    return false;
  }

  // 验证actions数组（如果存在）
  if (message.actions && !Array.isArray(message.actions)) {
    return false;
  }

  if (message.actions) {
    for (const action of message.actions) {
      if (!validateAction(action)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 验证操作对象是否有效
 */
export function validateAction(action: any): boolean {
  if (!action || typeof action !== 'object') {
    return false;
  }

  const requiredFields = ['actionId', 'actionName', 'actionType', 'actionTarget'];
  for (const field of requiredFields) {
    if (!action[field] || typeof action[field] !== 'string') {
      return false;
    }
  }

  return Object.values(ActionType).includes(action.actionType);
}

/**
 * 验证ISO8601日期格式
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

// ========== 消息处理函数 ==========

/**
 * 将原始消息转换为ReceivedMessage
 */
export function createReceivedMessage(message: UnifiedMessage): ReceivedMessage {
  return {
    ...message,
    receivedAt: new Date(),
    isRead: false,
    isAcknowledged: false,
  };
}

/**
 * 检查消息是否过期
 */
export function isMessageExpired(message: UnifiedMessage | ReceivedMessage): boolean {
  if (!message.ttl || message.ttl === DEFAULT_TTL_CONFIG.NEVER_EXPIRE) {
    return false;
  }

  const messageTime = new Date(message.timestamp).getTime();
  const now = Date.now();
  return (now - messageTime) > message.ttl;
}

/**
 * 获取消息剩余生存时间（毫秒）
 */
export function getMessageRemainingTTL(message: UnifiedMessage | ReceivedMessage): number {
  if (!message.ttl || message.ttl === DEFAULT_TTL_CONFIG.NEVER_EXPIRE) {
    return Infinity;
  }

  const messageTime = new Date(message.timestamp).getTime();
  const now = Date.now();
  const elapsed = now - messageTime;
  const remaining = message.ttl - elapsed;

  return Math.max(0, remaining);
}

/**
 * 根据消息内容生成摘要
 */
export function generateMessageSummary(message: UnifiedMessage): string {
  if (message.title) {
    return message.title;
  }

  if (message.content) {
    return message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
  }

  return `${message.messageType} 消息`;
}

// ========== 主题处理函数 ==========

/**
 * 替换主题模板中的占位符
 */
export function replaceTopic(template: string, params: Record<string, string | number>): string {
  return template.replace(TOPIC_TEMPLATE_REGEX, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * 从主题中提取参数
 */
export function extractTopicParams(topic: string, template: string): Record<string, string> | null {
  // 将模板转换为正则表达式
  const regexPattern = template.replace(TOPIC_TEMPLATE_REGEX, '([^/]+)');
  const regex = new RegExp(`^${regexPattern}$`);
  
  const match = topic.match(regex);
  if (!match) {
    return null;
  }

  // 提取参数名
  const paramNames: string[] = [];
  let paramMatch;
  const paramRegex = new RegExp(TOPIC_TEMPLATE_REGEX);
  while ((paramMatch = paramRegex.exec(template)) !== null) {
    paramNames.push(paramMatch[1]);
  }

  // 构建参数对象
  const params: Record<string, string> = {};
  for (let i = 0; i < paramNames.length && i + 1 < match.length; i++) {
    params[paramNames[i]] = match[i + 1];
  }

  return params;
}

/**
 * 验证主题格式是否有效
 */
export function isValidTopic(topic: string): boolean {
  if (!topic || typeof topic !== 'string') {
    return false;
  }

  // 基本格式检查
  return topic.startsWith('/') && topic.length > 1;
}

// ========== ID生成函数 ==========

/**
 * 生成唯一的消息ID
 */
export function generateMessageId(): string {
  return `${MESSAGE_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成唯一的订阅ID
 */
export function generateSubscriptionId(): string {
  return `${SUBSCRIPTION_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成唯一的通知ID
 */
export function generateNotificationId(): string {
  return `${NOTIFICATION_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ========== 格式化函数 ==========

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间差
 */
export function formatTimeDiff(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  if (seconds > 0) return `${seconds}秒前`;
  return '刚刚';
}

/**
 * 格式化JSON字符串（带错误处理）
 */
export function safeJsonStringify(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    return String(obj);
  }
}

/**
 * 安全解析JSON字符串
 */
export function safeJsonParse<T = any>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

// ========== 去重和缓存函数 ==========

/**
 * 基于messageId的消息去重
 */
export function deduplicateMessages(messages: ReceivedMessage[]): ReceivedMessage[] {
  const seen = new Set<string>();
  return messages.filter(message => {
    if (seen.has(message.messageId)) {
      return false;
    }
    seen.add(message.messageId);
    return true;
  });
}

/**
 * 按时间排序消息（最新的在前）
 */
export function sortMessagesByTime(messages: ReceivedMessage[]): ReceivedMessage[] {
  return [...messages].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * 过滤过期消息
 */
export function filterExpiredMessages(messages: ReceivedMessage[]): ReceivedMessage[] {
  return messages.filter(message => !isMessageExpired(message));
}

/**
 * 限制消息数组大小
 */
export function limitMessageArray(messages: ReceivedMessage[], maxSize: number): ReceivedMessage[] {
  if (messages.length <= maxSize) {
    return messages;
  }
  
  // 保留最新的消息
  return sortMessagesByTime(messages).slice(0, maxSize);
}

// ========== 错误处理函数 ==========

/**
 * 创建WebSocket错误对象
 */
export function createWebSocketError(code: string, message?: string, originalError?: Error): Error {
  const errorMessage = message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || '未知错误';
  const error = new Error(errorMessage);
  (error as any).code = code;
  (error as any).originalError = originalError;
  return error;
}

/**
 * 检查错误是否为连接相关错误
 */
export function isConnectionError(error: Error): boolean {
  const code = (error as any).code;
  return code === ERROR_CODES.CONNECTION_FAILED;
}

/**
 * 检查错误是否为消息格式错误
 */
export function isMessageFormatError(error: Error): boolean {
  const code = (error as any).code;
  return code === ERROR_CODES.MESSAGE_PARSE_ERROR || 
         code === ERROR_CODES.INVALID_MESSAGE_FORMAT;
}

// ========== 重连辅助函数 ==========

/**
 * 计算指数退避延迟时间
 */
export function calculateBackoffDelay(
  attempt: number, 
  initialDelay: number = 1000, 
  maxDelay: number = 30000, 
  multiplier: number = 1.5
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * 添加随机抖动以避免雷群效应
 */
export function addJitter(delay: number, jitterFactor: number = 0.1): number {
  const jitter = delay * jitterFactor * (Math.random() - 0.5);
  return Math.max(0, delay + jitter);
}

// ========== 本地存储辅助函数 ==========

/**
 * 安全地保存到localStorage
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * 安全地从localStorage读取
 */
export function safeLocalStorageGet<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

/**
 * 安全地从localStorage删除
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
}

// ========== 调试和日志函数 ==========

/**
 * 创建带前缀的日志函数
 */
export function createLogger(prefix: string) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    debug: (...args: any[]) => {
      if (isDev) console.debug(`[${prefix}]`, ...args);
    },
    info: (...args: any[]) => {
      if (isDev) console.info(`[${prefix}]`, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[${prefix}]`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`[${prefix}]`, ...args);
    },
  };
}

/**
 * 深度克隆对象（简单实现）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}