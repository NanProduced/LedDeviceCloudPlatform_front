/**
 * WebSocket消息处理器
 * 
 * 负责处理接收到的WebSocket消息，包括：
 * - 消息解析和验证
 * - 消息去重处理
 * - TTL过期检查
 * - 消息类型分发
 * - 消息处理器注册
 */

import { 
  UnifiedMessage, 
  ReceivedMessage, 
  MessageType, 
  MessageHandler 
} from './types';
import { 
  PERFORMANCE_CONFIG, 
  ERROR_CODES 
} from './constants';
import { 
  validateMessage,
  createReceivedMessage,
  isMessageExpired,
  deduplicateMessages,
  filterExpiredMessages,
  limitMessageArray,
  createWebSocketError,
  createLogger
} from './utils';

/**
 * 消息处理器类
 */
export class MessageProcessor {
  private logger = createLogger('MessageProcessor');
  
  // 消息缓存
  private messageCache = new Map<string, ReceivedMessage>();
  private processedMessageIds = new Set<string>();
  
  // 消息处理器注册表
  private messageHandlers = new Map<MessageType, MessageHandler['handler'][]>();
  private globalHandlers: ((message: UnifiedMessage) => void)[] = [];
  
  // 性能统计
  private stats = {
    totalProcessed: 0,
    duplicatesFiltered: 0,
    expiredFiltered: 0,
    validationErrors: 0,
    processingErrors: 0
  };

  constructor() {
    this.logger.debug('MessageProcessor initialized');
    this.setupPeriodicCleanup();
  }

  // ========== 公共API ==========

  /**
   * 处理接收到的消息
   */
  public async processMessage(rawMessage: any): Promise<ReceivedMessage | null> {
    this.stats.totalProcessed++;
    
    try {
      // 1. 验证消息格式
      if (!validateMessage(rawMessage)) {
        this.stats.validationErrors++;
        this.logger.warn('Invalid message format:', rawMessage);
        throw createWebSocketError(ERROR_CODES.INVALID_MESSAGE_FORMAT);
      }

      const message = rawMessage as UnifiedMessage;

      // 2. 检查消息是否重复
      if (this.isDuplicateMessage(message.messageId)) {
        this.stats.duplicatesFiltered++;
        this.logger.debug('Duplicate message filtered:', message.messageId);
        return null;
      }

      // 3. 检查消息是否过期
      if (isMessageExpired(message)) {
        this.stats.expiredFiltered++;
        this.logger.debug('Expired message filtered:', message.messageId);
        return null;
      }

      // 4. 创建接收消息对象
      const receivedMessage = createReceivedMessage(message);

      // 5. 缓存消息
      this.cacheMessage(receivedMessage);

      // 6. 分发消息到处理器
      await this.dispatchMessage(message);

      this.logger.debug('Message processed successfully:', message.messageId);
      return receivedMessage;

    } catch (error) {
      this.stats.processingErrors++;
      this.logger.error('Failed to process message:', error);
      throw error;
    }
  }

  /**
   * 批量处理消息
   */
  public async processBatchMessages(rawMessages: any[]): Promise<ReceivedMessage[]> {
    const results: ReceivedMessage[] = [];
    const batchSize = PERFORMANCE_CONFIG.BATCH_PROCESS_SIZE;

    // 分批处理以避免阻塞主线程
    for (let i = 0; i < rawMessages.length; i += batchSize) {
      const batch = rawMessages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (rawMessage) => {
        try {
          return await this.processMessage(rawMessage);
        } catch (error) {
          this.logger.error('Batch message processing failed:', error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as ReceivedMessage[]);

      // 让出控制权给其他任务
      if (i + batchSize < rawMessages.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    this.logger.debug(`Batch processed ${rawMessages.length} messages, ${results.length} valid`);
    return results;
  }

  /**
   * 注册消息类型处理器
   */
  public registerMessageHandler(
    messageType: MessageType, 
    handler: MessageHandler['handler']
  ): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    const handlers = this.messageHandlers.get(messageType)!;
    handlers.push(handler);
    
    this.logger.debug(`Registered handler for message type: ${messageType}`);

    // 返回取消注册函数
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        this.logger.debug(`Unregistered handler for message type: ${messageType}`);
      }
    };
  }

  /**
   * 注册全局消息处理器
   */
  public registerGlobalHandler(handler: (message: UnifiedMessage) => void): () => void {
    this.globalHandlers.push(handler);
    this.logger.debug('Registered global message handler');

    // 返回取消注册函数
    return () => {
      const index = this.globalHandlers.indexOf(handler);
      if (index > -1) {
        this.globalHandlers.splice(index, 1);
        this.logger.debug('Unregistered global message handler');
      }
    };
  }

  /**
   * 获取缓存的消息
   */
  public getCachedMessages(): ReceivedMessage[] {
    const messages = Array.from(this.messageCache.values());
    return filterExpiredMessages(messages);
  }

  /**
   * 根据消息类型获取缓存的消息
   */
  public getCachedMessagesByType(messageType: MessageType): ReceivedMessage[] {
    const messages = this.getCachedMessages();
    return messages.filter(message => message.messageType === messageType);
  }

  /**
   * 根据消息ID获取缓存的消息
   */
  public getCachedMessage(messageId: string): ReceivedMessage | null {
    const message = this.messageCache.get(messageId);
    return message && !isMessageExpired(message) ? message : null;
  }

  /**
   * 标记消息为已读
   */
  public markMessageAsRead(messageId: string): boolean {
    const message = this.messageCache.get(messageId);
    if (message) {
      message.isRead = true;
      this.logger.debug('Message marked as read:', messageId);
      return true;
    }
    return false;
  }

  /**
   * 确认消息（针对requireAck=true的消息）
   */
  public acknowledgeMessage(messageId: string): boolean {
    const message = this.messageCache.get(messageId);
    if (message) {
      message.isAcknowledged = true;
      this.logger.debug('Message acknowledged:', messageId);
      return true;
    }
    return false;
  }

  /**
   * 删除缓存的消息
   */
  public deleteCachedMessage(messageId: string): boolean {
    const deleted = this.messageCache.delete(messageId);
    if (deleted) {
      this.processedMessageIds.delete(messageId);
      this.logger.debug('Message deleted from cache:', messageId);
    }
    return deleted;
  }

  /**
   * 清空消息缓存
   */
  public clearMessageCache(): void {
    const count = this.messageCache.size;
    this.messageCache.clear();
    this.processedMessageIds.clear();
    this.logger.debug(`Cleared ${count} messages from cache`);
  }

  /**
   * 获取处理统计信息
   */
  public getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  public resetStats(): void {
    this.stats = {
      totalProcessed: 0,
      duplicatesFiltered: 0,
      expiredFiltered: 0,
      validationErrors: 0,
      processingErrors: 0
    };
    this.logger.debug('Stats reset');
  }

  // ========== 私有方法 ==========

  /**
   * 检查消息是否重复
   */
  private isDuplicateMessage(messageId: string): boolean {
    return this.processedMessageIds.has(messageId);
  }

  /**
   * 缓存消息
   */
  private cacheMessage(message: ReceivedMessage): void {
    // 添加到已处理消息ID集合
    this.processedMessageIds.add(message.messageId);
    
    // 添加到消息缓存
    this.messageCache.set(message.messageId, message);
    
    // 限制缓存大小
    this.limitCacheSize();
  }

  /**
   * 限制缓存大小
   */
  private limitCacheSize(): void {
    if (this.messageCache.size <= PERFORMANCE_CONFIG.MAX_CACHED_MESSAGES) {
      return;
    }

    // 获取所有消息并按时间排序
    const messages = Array.from(this.messageCache.values());
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 删除最旧的消息
    const toDelete = sortedMessages.slice(0, 
      this.messageCache.size - PERFORMANCE_CONFIG.MAX_CACHED_MESSAGES
    );

    for (const message of toDelete) {
      this.messageCache.delete(message.messageId);
      this.processedMessageIds.delete(message.messageId);
    }

    this.logger.debug(`Cache size limited, removed ${toDelete.length} old messages`);
  }

  /**
   * 分发消息到处理器
   */
  private async dispatchMessage(message: UnifiedMessage): Promise<void> {
    const promises: Promise<void>[] = [];

    // 调用类型特定的处理器
    const typeHandlers = this.messageHandlers.get(message.messageType);
    if (typeHandlers && typeHandlers.length > 0) {
      for (const handler of typeHandlers) {
        promises.push(this.safeCallHandler(handler, message, `${message.messageType} handler`));
      }
    }

    // 调用全局处理器
    for (const handler of this.globalHandlers) {
      promises.push(this.safeCallHandler(handler, message, 'global handler'));
    }

    // 等待所有处理器完成
    await Promise.allSettled(promises);
  }

  /**
   * 安全调用处理器（捕获异常）
   */
  private async safeCallHandler(
    handler: (message: UnifiedMessage) => void, 
    message: UnifiedMessage,
    handlerName: string
  ): Promise<void> {
    try {
      await handler(message);
    } catch (error) {
      this.logger.error(`Error in ${handlerName}:`, error);
    }
  }

  /**
   * 设置定期清理
   */
  private setupPeriodicCleanup(): void {
    // 每5分钟清理一次过期消息
    setInterval(() => {
      this.cleanupExpiredMessages();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期消息
   */
  private cleanupExpiredMessages(): void {
    const beforeCount = this.messageCache.size;
    const expiredMessageIds: string[] = [];

    for (const [messageId, message] of this.messageCache) {
      if (isMessageExpired(message)) {
        expiredMessageIds.push(messageId);
      }
    }

    for (const messageId of expiredMessageIds) {
      this.messageCache.delete(messageId);
      this.processedMessageIds.delete(messageId);
    }

    if (expiredMessageIds.length > 0) {
      this.logger.debug(`Cleaned up ${expiredMessageIds.length} expired messages`);
    }
  }

  /**
   * 销毁处理器
   */
  public destroy(): void {
    this.logger.info('Destroying MessageProcessor');
    
    // 清空缓存
    this.clearMessageCache();
    
    // 清空处理器
    this.messageHandlers.clear();
    this.globalHandlers.length = 0;
    
    // 重置统计
    this.resetStats();
  }
}

// ========== 单例导出 ==========

/**
 * 默认消息处理器实例
 */
export const messageProcessor = new MessageProcessor();

// ========== 便捷函数 ==========

/**
 * 注册消息类型处理器的便捷函数
 */
export function onMessage(
  messageType: MessageType, 
  handler: MessageHandler['handler']
): () => void {
  return messageProcessor.registerMessageHandler(messageType, handler);
}

/**
 * 注册全局消息处理器的便捷函数
 */
export function onAnyMessage(handler: (message: UnifiedMessage) => void): () => void {
  return messageProcessor.registerGlobalHandler(handler);
}