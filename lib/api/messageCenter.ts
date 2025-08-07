/**
 * 消息中心WebSocket集成工具
 * 
 * 提供消息中心专用的WebSocket操作，包括：
 * - 消息ACK确认
 * - 任务进度订阅
 * - 批量操作
 * - 实时更新处理
 */

import { useWebSocket, useSubscription } from '@/hooks/useWebSocket';
import { UnifiedMessage } from '@/lib/websocket/types';
import { createLogger } from '@/lib/websocket/utils';

const logger = createLogger('MessageCenter');

/**
 * 消息中心WebSocket管理类
 */
export class MessageCenterWebSocket {
  private static instance: MessageCenterWebSocket;
  private websocket: ReturnType<typeof useWebSocket> | null = null;
  private subscription: ReturnType<typeof useSubscription> | null = null;
  private taskSubscriptions = new Set<string>();

  private constructor() {}

  static getInstance(): MessageCenterWebSocket {
    if (!MessageCenterWebSocket.instance) {
      MessageCenterWebSocket.instance = new MessageCenterWebSocket();
    }
    return MessageCenterWebSocket.instance;
  }

  /**
   * 初始化WebSocket连接
   */
  initialize(websocket: ReturnType<typeof useWebSocket>, subscription: ReturnType<typeof useSubscription>) {
    this.websocket = websocket;
    this.subscription = subscription;
    logger.info('MessageCenter WebSocket initialized');
  }

  /**
   * 发送消息ACK确认
   */
  async acknowledgeMessage(messageId: string): Promise<void> {
    if (!this.websocket) {
      throw new Error('WebSocket not initialized');
    }

    if (!this.websocket.isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      const destination = `/app/message/ack/${messageId}`;
      this.websocket.send(destination, {
        messageId,
        timestamp: new Date().toISOString(),
        acknowledged: true
      });
      
      logger.info('Message acknowledged:', messageId);
    } catch (error) {
      logger.error('Failed to acknowledge message:', error);
      throw error;
    }
  }

  /**
   * 批量发送ACK确认
   */
  async batchAcknowledgeMessages(messageIds: string[]): Promise<void> {
    const promises = messageIds.map(id => this.acknowledgeMessage(id));
    await Promise.all(promises);
    logger.info('Batch acknowledged messages:', messageIds.length);
  }

  /**
   * 订阅任务进度更新
   */
  async subscribeTaskProgress(taskId: string, callback?: (message: UnifiedMessage) => void): Promise<void> {
    if (!this.subscription) {
      throw new Error('Subscription manager not initialized');
    }

    const destination = `/topic/task/${taskId}`;
    
    if (this.taskSubscriptions.has(taskId)) {
      logger.warn('Task already subscribed:', taskId);
      return;
    }

    try {
      await this.subscription.subscribe(destination, (message) => {
        logger.debug('Task progress update:', { taskId, message });
        if (callback) {
          callback(message);
        }
      });
      
      this.taskSubscriptions.add(taskId);
      logger.info('Subscribed to task progress:', taskId);
    } catch (error) {
      logger.error('Failed to subscribe task progress:', error);
      throw error;
    }
  }

  /**
   * 取消任务进度订阅
   */
  async unsubscribeTaskProgress(taskId: string): Promise<void> {
    if (!this.subscription) {
      throw new Error('Subscription manager not initialized');
    }

    const destination = `/topic/task/${taskId}`;
    
    try {
      this.subscription.unsubscribe(destination);
      this.taskSubscriptions.delete(taskId);
      logger.info('Unsubscribed from task progress:', taskId);
    } catch (error) {
      logger.error('Failed to unsubscribe task progress:', error);
      throw error;
    }
  }

  /**
   * 取消所有任务订阅
   */
  async unsubscribeAllTasks(): Promise<void> {
    const promises = Array.from(this.taskSubscriptions).map(taskId => 
      this.unsubscribeTaskProgress(taskId)
    );
    await Promise.all(promises);
    logger.info('Unsubscribed from all task progress');
  }

  /**
   * 检查是否已订阅任务
   */
  isTaskSubscribed(taskId: string): boolean {
    return this.taskSubscriptions.has(taskId);
  }

  /**
   * 获取当前连接状态
   */
  isConnected(): boolean {
    return this.websocket?.isConnected || false;
  }

  /**
   * 获取订阅的任务列表
   */
  getSubscribedTasks(): string[] {
    return Array.from(this.taskSubscriptions);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.unsubscribeAllTasks();
    this.websocket = null;
    this.subscription = null;
    this.taskSubscriptions.clear();
    logger.info('MessageCenter WebSocket destroyed');
  }
}

/**
 * React Hook: 使用消息中心WebSocket功能
 */
export function useMessageCenterWebSocket() {
  const websocket = useWebSocket();
  const subscription = useSubscription();
  const instance = MessageCenterWebSocket.getInstance();

  // 确保实例已初始化
  React.useEffect(() => {
    instance.initialize(websocket, subscription);
  }, [websocket, subscription]);

  return {
    /**
     * 发送消息ACK确认
     */
    acknowledgeMessage: (messageId: string) => instance.acknowledgeMessage(messageId),
    
    /**
     * 批量发送ACK确认
     */
    batchAcknowledgeMessages: (messageIds: string[]) => instance.batchAcknowledgeMessages(messageIds),
    
    /**
     * 订阅任务进度
     */
    subscribeTaskProgress: (taskId: string, callback?: (message: UnifiedMessage) => void) => 
      instance.subscribeTaskProgress(taskId, callback),
    
    /**
     * 取消任务订阅
     */
    unsubscribeTaskProgress: (taskId: string) => instance.unsubscribeTaskProgress(taskId),
    
    /**
     * 取消所有任务订阅
     */
    unsubscribeAllTasks: () => instance.unsubscribeAllTasks(),
    
    /**
     * 检查任务订阅状态
     */
    isTaskSubscribed: (taskId: string) => instance.isTaskSubscribed(taskId),
    
    /**
     * 获取连接状态
     */
    isConnected: () => instance.isConnected(),
    
    /**
     * 获取已订阅的任务列表
     */
    getSubscribedTasks: () => instance.getSubscribedTasks(),
    
    /**
     * WebSocket基础功能
     */
    websocket,
    subscription
  };
}

// React import for useEffect
import React from 'react';

export default MessageCenterWebSocket;