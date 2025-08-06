/**
 * WebSocket Hooks 集合
 * 
 * 提供一系列便捷的Hook接口来使用WebSocket功能，包括：
 * 1. useWebSocket - 基础WebSocket操作
 * 2. useMessages - 消息管理
 * 3. useNotifications - 通知管理
 * 4. useSubscription - 订阅管理
 * 
 * 这些Hook封装了WebSocketContext的复杂逻辑，为开发者提供简单易用的接口
 */

'use client';

import { useCallback, useMemo } from 'react';
import { 
  UseWebSocketReturn,
  UseMessagesReturn,
  UseNotificationsReturn,
  UseSubscriptionReturn,
  ConnectionState,
  MessageType,
  UnifiedMessage,
  ReceivedMessage,
  NotificationItem,
  SubscriptionInfo
} from '../lib/websocket/types';
import { 
  useWebSocketContext,
  useConnectionState,
  useMessages as useContextMessages,
  useSubscriptions,
  useNotifications as useContextNotifications
} from '../contexts/WebSocketContext';
import { createLogger } from '../lib/websocket/utils';

// ========== 基础WebSocket Hook ==========

/**
 * 使用WebSocket的基础Hook
 * 
 * 提供WebSocket连接管理的基本功能，包括连接状态、发送消息、连接控制等
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     isConnected, 
 *     connectionState, 
 *     send, 
 *     connect, 
 *     disconnect 
 *   } = useWebSocket();
 * 
 *   const handleSendMessage = () => {
 *     if (isConnected) {
 *       send('/app/test', { message: 'Hello WebSocket!' });
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <div>连接状态: {connectionState}</div>
 *       <button onClick={handleSendMessage} disabled={!isConnected}>
 *         发送消息
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket(): UseWebSocketReturn {
  const logger = createLogger('useWebSocket');
  const { manager } = useWebSocketContext();
  const { connectionState, connectionError } = useConnectionState();

  /**
   * 检查是否已连接
   */
  const isConnected = useMemo(() => {
    return connectionState === ConnectionState.CONNECTED;
  }, [connectionState]);

  /**
   * 发送消息到指定目标
   * 
   * @param destination 消息目标地址
   * @param body 消息体，可以是任意类型，会自动序列化为JSON
   * @param headers 可选的消息头
   */
  const send = useCallback((
    destination: string, 
    body: any, 
    headers?: Record<string, string>
  ) => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      throw new Error('WebSocket manager not available');
    }

    if (!isConnected) {
      logger.error('WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    try {
      manager.send(destination, body, headers);
      logger.debug('Message sent successfully:', { destination, body });
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }, [manager, isConnected]);

  /**
   * 手动连接WebSocket
   */
  const connect = useCallback(() => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      return;
    }

    logger.info('Manual connect requested');
    manager.connect().catch(error => {
      logger.error('Manual connect failed:', error);
    });
  }, [manager]);

  /**
   * 手动断开WebSocket连接
   */
  const disconnect = useCallback(() => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      return;
    }

    logger.info('Manual disconnect requested');
    manager.disconnect();
  }, [manager]);

  /**
   * 手动重连WebSocket
   */
  const reconnect = useCallback(() => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      return;
    }

    logger.info('Manual reconnect requested');
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000); // 等待1秒后重连
  }, [manager, connect, disconnect]);

  return {
    isConnected,
    connectionState,
    connectionError,
    send,
    connect,
    disconnect,
    reconnect,
  };
}

// ========== 消息管理Hook ==========

/**
 * 使用消息管理的Hook
 * 
 * 提供消息相关的功能，包括获取消息列表、按类型过滤、标记已读等
 * 
 * @example
 * ```tsx
 * function MessageList() {
 *   const { 
 *     messages, 
 *     unreadCount, 
 *     getMessagesByType, 
 *     markAsRead,
 *     clearMessages 
 *   } = useMessages();
 * 
 *   const taskMessages = getMessagesByType(MessageType.TASK_PROGRESS);
 * 
 *   return (
 *     <div>
 *       <div>未读消息: {unreadCount}</div>
 *       <button onClick={clearMessages}>清空消息</button>
 *       {messages.map(msg => (
 *         <div 
 *           key={msg.messageId}
 *           onClick={() => markAsRead(msg.messageId)}
 *           style={{ opacity: msg.isRead ? 0.6 : 1 }}
 *         >
 *           {msg.title || msg.content}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMessages(): UseMessagesReturn {
  const logger = createLogger('useMessages');
  const { messages, unreadCount } = useContextMessages();
  const { dispatch } = useWebSocketContext();

  /**
   * 根据消息类型获取消息列表
   * 
   * @param type 消息类型
   * @returns 指定类型的消息列表
   */
  const getMessagesByType = useCallback((type: MessageType): ReceivedMessage[] => {
    return messages.filter(message => message.messageType === type);
  }, [messages]);

  /**
   * 标记消息为已读
   * 
   * @param messageId 消息ID
   */
  const markAsRead = useCallback((messageId: string) => {
    logger.debug('Marking message as read:', messageId);
    dispatch({ type: 'MARK_MESSAGE_READ', payload: messageId });
  }, [dispatch]);

  /**
   * 标记所有消息为已读
   */
  const markAllAsRead = useCallback(() => {
    logger.debug('Marking all messages as read');
    dispatch({ type: 'MARK_ALL_MESSAGES_READ' });
  }, [dispatch]);

  /**
   * 确认消息（针对requireAck=true的消息）
   * 
   * @param messageId 消息ID
   */
  const acknowledgeMessage = useCallback((messageId: string) => {
    logger.debug('Acknowledging message:', messageId);
    dispatch({ type: 'ACKNOWLEDGE_MESSAGE', payload: messageId });
  }, [dispatch]);

  /**
   * 清空所有消息
   */
  const clearMessages = useCallback(() => {
    logger.debug('Clearing all messages');
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, [dispatch]);

  /**
   * 删除指定消息
   * 
   * @param messageId 消息ID
   */
  const deleteMessage = useCallback((messageId: string) => {
    logger.debug('Deleting message:', messageId);
    dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
  }, [dispatch]);

  return {
    messages,
    unreadCount,
    getMessagesByType,
    markAsRead,
    markAllAsRead,
    acknowledgeMessage,
    clearMessages,
    deleteMessage,
  };
}

// ========== 通知管理Hook ==========

/**
 * 使用通知管理的Hook
 * 
 * 提供通知相关的功能，包括显示通知、关闭通知等
 * 
 * @example
 * ```tsx
 * function NotificationDemo() {
 *   const { 
 *     notifications, 
 *     showNotification, 
 *     dismissNotification, 
 *     dismissAll 
 *   } = useNotifications();
 * 
 *   const handleShowDemo = () => {
 *     showNotification({
 *       messageId: 'demo-001',
 *       timestamp: new Date().toISOString(),
 *       oid: 1001,
 *       messageType: MessageType.SYSTEM_NOTIFICATION,
 *       level: Level.SUCCESS,
 *       title: '演示通知',
 *       content: '这是一个演示通知',
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleShowDemo}>显示演示通知</button>
 *       <button onClick={dismissAll}>关闭所有通知</button>
 *       <div>当前通知数: {notifications.length}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const logger = createLogger('useNotifications');
  const { notifications } = useContextNotifications();
  const { dispatch } = useWebSocketContext();

  /**
   * 显示通知
   * 
   * @param message 要显示的消息
   */
  const showNotification = useCallback((message: UnifiedMessage) => {
    logger.debug('Showing notification for message:', message.messageId);
    
    // 这里实际的通知显示逻辑由NotificationManager组件处理
    // 这个函数主要用于手动触发通知显示
    const notificationItem: NotificationItem = {
      id: `manual_${message.messageId}_${Date.now()}`,
      message,
      type: message.level === 'ERROR' ? 'modal' : 'toast',
      visible: true,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationItem });
  }, [dispatch]);

  /**
   * 关闭指定通知
   * 
   * @param id 通知ID
   */
  const dismissNotification = useCallback((id: string) => {
    logger.debug('Dismissing notification:', id);
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  /**
   * 关闭所有通知
   */
  const dismissAll = useCallback(() => {
    logger.debug('Dismissing all notifications');
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, [dispatch]);

  return {
    notifications,
    showNotification,
    dismissNotification,
    dismissAll,
  };
}

// ========== 订阅管理Hook ==========

/**
 * 使用订阅管理的Hook
 * 
 * 提供订阅相关的功能，包括订阅主题、取消订阅、检查订阅状态等
 * 
 * @example
 * ```tsx
 * function SubscriptionDemo() {
 *   const { 
 *     subscriptions, 
 *     subscribe, 
 *     unsubscribe, 
 *     isSubscribed 
 *   } = useSubscription();
 * 
 *   const handleSubscribeTask = async () => {
 *     try {
 *       const subscriptionId = await subscribe('/topic/task/123', (message) => {
 *         console.log('收到任务消息:', message);
 *       });
 *       console.log('订阅成功:', subscriptionId);
 *     } catch (error) {
 *       console.error('订阅失败:', error);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleSubscribeTask}>订阅任务消息</button>
 *       <div>当前订阅数: {subscriptions.length}</div>
 *       <div>是否已订阅任务: {isSubscribed('/topic/task/123') ? '是' : '否'}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSubscription(): UseSubscriptionReturn {
  const logger = createLogger('useSubscription');
  const { subscriptions } = useSubscriptions();
  const { manager } = useWebSocketContext();

  /**
   * 订阅主题
   * 
   * @param destination 订阅目标地址
   * @param callback 消息接收回调函数，可选
   * @returns Promise，解析为订阅ID
   */
  const subscribe = useCallback(async (
    destination: string, 
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> => {
    if (!manager) {
      const error = new Error('WebSocket manager not available');
      logger.error('Subscribe failed:', error);
      throw error;
    }

    if (!manager.isConnected()) {
      const error = new Error('WebSocket not connected');
      logger.error('Subscribe failed:', error);
      throw error;
    }

    try {
      logger.debug('Subscribing to:', destination);
      const subscriptionId = manager.subscribe(destination, callback || (() => {}));
      logger.info('Subscribed successfully:', { destination, subscriptionId });
      return subscriptionId;
    } catch (error) {
      logger.error('Subscribe failed:', error);
      throw error;
    }
  }, [manager]);

  /**
   * 取消订阅
   * 
   * @param destination 要取消的订阅目标地址
   */
  const unsubscribe = useCallback((destination: string) => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      return;
    }

    // 查找对应的订阅ID
    const subscription = subscriptions.find(sub => sub.destination === destination);
    if (subscription) {
      logger.debug('Unsubscribing from:', destination);
      manager.unsubscribe(subscription.id);
      logger.info('Unsubscribed successfully:', destination);
    } else {
      logger.warn('Subscription not found:', destination);
    }
  }, [manager, subscriptions]);

  /**
   * 取消所有订阅
   */
  const unsubscribeAll = useCallback(() => {
    if (!manager) {
      logger.error('WebSocket manager not available');
      return;
    }

    logger.debug('Unsubscribing from all subscriptions');
    subscriptions.forEach(subscription => {
      manager.unsubscribe(subscription.id);
    });
    logger.info('All subscriptions unsubscribed');
  }, [manager, subscriptions]);

  /**
   * 检查是否已订阅指定主题
   * 
   * @param destination 主题地址
   * @returns 是否已订阅
   */
  const isSubscribed = useCallback((destination: string): boolean => {
    return subscriptions.some(sub => sub.destination === destination);
  }, [subscriptions]);

  return {
    subscriptions,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    isSubscribed,
  };
}

// ========== 组合Hook ==========

/**
 * 使用完整WebSocket功能的组合Hook
 * 
 * 组合了所有WebSocket相关的Hook，提供一站式的WebSocket功能访问
 * 
 * @example
 * ```tsx
 * function WebSocketDemo() {
 *   const ws = useWebSocketFull();
 * 
 *   useEffect(() => {
 *     if (ws.isConnected) {
 *       // 连接成功后订阅消息
 *       ws.subscribe('/topic/demo', (message) => {
 *         console.log('收到演示消息:', message);
 *       });
 *     }
 *   }, [ws.isConnected]);
 * 
 *   return (
 *     <div>
 *       <div>连接状态: {ws.connectionState}</div>
 *       <div>未读消息: {ws.unreadCount}</div>
 *       <div>订阅数量: {ws.subscriptions.length}</div>
 *       <div>通知数量: {ws.notifications.length}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketFull() {
  const websocket = useWebSocket();
  const messages = useMessages();
  const notifications = useNotifications();
  const subscription = useSubscription();

  return {
    // WebSocket基础功能
    ...websocket,
    
    // 消息管理
    ...messages,
    
    // 通知管理
    ...notifications,
    
    // 订阅管理
    ...subscription,
  };
}

// ========== 默认导出 ==========

export default useWebSocket;