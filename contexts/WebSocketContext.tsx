/**
 * WebSocket Context
 * 
 * 提供全局WebSocket状态管理，包括：
 * - 连接状态管理
 * - 消息状态管理
 * - 订阅状态管理
 * - 通知状态管理
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { 
  WebSocketState, 
  WebSocketAction, 
  WebSocketContextValue,
  ConnectionState,
  ReceivedMessage,
  SubscriptionInfo,
  NotificationItem
} from '../lib/websocket/types';
import { WebSocketManager } from '../lib/websocket/manager';
import { MessageProcessor } from '../lib/websocket/processor';
import { subscriptionManager } from '../lib/websocket/subscription';
import { createLogger } from '../lib/websocket/utils';
import { useUser } from './UserContext';

// ========== 初始状态 ==========

const initialState: WebSocketState = {
  connectionState: ConnectionState.DISCONNECTED,
  connectionError: null,
  messages: [],
  subscriptions: [],
  notifications: [],
  unreadCount: 0,
};

// ========== Reducer ==========

function webSocketReducer(state: WebSocketState, action: WebSocketAction): WebSocketState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionState: action.payload,
      };

    case 'SET_CONNECTION_ERROR':
      return {
        ...state,
        connectionError: action.payload,
      };

    case 'ADD_MESSAGE':
      const newMessage = action.payload;
      const existingMessageIndex = state.messages.findIndex(
        msg => msg.messageId === newMessage.messageId
      );
      
      if (existingMessageIndex >= 0) {
        // 更新已存在的消息
        const updatedMessages = [...state.messages];
        updatedMessages[existingMessageIndex] = newMessage;
        return {
          ...state,
          messages: updatedMessages,
        };
      } else {
        // 添加新消息
        const updatedMessages = [newMessage, ...state.messages];
        const newUnreadCount = newMessage.isRead ? state.unreadCount : state.unreadCount + 1;
        
        return {
          ...state,
          messages: updatedMessages,
          unreadCount: newUnreadCount,
        };
      }

    case 'MARK_MESSAGE_READ':
      const messageId = action.payload;
      const readMessages = state.messages.map(msg => 
        msg.messageId === messageId ? { ...msg, isRead: true } : msg
      );
      const wasUnread = state.messages.find(msg => 
        msg.messageId === messageId && !msg.isRead
      );
      
      return {
        ...state,
        messages: readMessages,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };

    case 'MARK_ALL_MESSAGES_READ':
      const allReadMessages = state.messages.map(msg => ({ ...msg, isRead: true }));
      return {
        ...state,
        messages: allReadMessages,
        unreadCount: 0,
      };

    case 'ACKNOWLEDGE_MESSAGE':
      const ackMessageId = action.payload;
      const ackedMessages = state.messages.map(msg =>
        msg.messageId === ackMessageId ? { ...msg, isAcknowledged: true } : msg
      );
      
      return {
        ...state,
        messages: ackedMessages,
      };

    case 'DELETE_MESSAGE':
      const deleteMessageId = action.payload;
      const filteredMessages = state.messages.filter(msg => msg.messageId !== deleteMessageId);
      const deletedMessage = state.messages.find(msg => msg.messageId === deleteMessageId);
      const unreadCountAfterDelete = deletedMessage && !deletedMessage.isRead 
        ? state.unreadCount - 1 
        : state.unreadCount;
      
      return {
        ...state,
        messages: filteredMessages,
        unreadCount: Math.max(0, unreadCountAfterDelete),
      };

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        unreadCount: 0,
      };

    case 'ADD_SUBSCRIPTION':
      const newSubscription = action.payload;
      const existingSubIndex = state.subscriptions.findIndex(
        sub => sub.id === newSubscription.id
      );
      
      if (existingSubIndex >= 0) {
        const updatedSubscriptions = [...state.subscriptions];
        updatedSubscriptions[existingSubIndex] = newSubscription;
        return {
          ...state,
          subscriptions: updatedSubscriptions,
        };
      } else {
        return {
          ...state,
          subscriptions: [...state.subscriptions, newSubscription],
        };
      }

    case 'REMOVE_SUBSCRIPTION':
      const subscriptionId = action.payload;
      return {
        ...state,
        subscriptions: state.subscriptions.filter(sub => sub.id !== subscriptionId),
      };

    case 'CLEAR_SUBSCRIPTIONS':
      return {
        ...state,
        subscriptions: [],
      };

    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };

    case 'REMOVE_NOTIFICATION':
      const notificationId = action.payload;
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== notificationId),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
}

// ========== Context ==========

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// ========== Provider ==========

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [state, dispatch] = useReducer(webSocketReducer, initialState);
  const { user } = useUser();
  
  // 管理器实例引用
  const managerRef = useRef<WebSocketManager | null>(null);
  const processorRef = useRef<MessageProcessor | null>(null);
  const subscriptionRef = useRef<SubscriptionManager | null>(null);
  
  const logger = createLogger('WebSocketProvider');

  // ========== 初始化管理器 ==========
  
  useEffect(() => {
    logger.info('Initializing WebSocket managers');
    
    // 创建管理器实例
    const manager = new WebSocketManager();
    const processor = new MessageProcessor();
    
    // 保存引用
    managerRef.current = manager;
    processorRef.current = processor;
    subscriptionRef.current = subscriptionManager; // 使用单例
    
    // 设置管理器之间的关联
    subscriptionManager.setWebSocketManager(manager);
    
    // 设置连接状态回调
    manager.onConnectionStateChanged((connectionState) => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: connectionState });
    });
    
    manager.onConnectionErrorChanged((connectionError) => {
      dispatch({ type: 'SET_CONNECTION_ERROR', payload: connectionError });
    });
    
    // 设置消息接收回调
    manager.onMessage(async (message) => {
      try {
        const processedMessage = await processor.processMessage(message);
        if (processedMessage) {
          dispatch({ type: 'ADD_MESSAGE', payload: processedMessage });
        }
      } catch (error) {
        logger.error('Failed to process received message:', error);
      }
    });
    
    // 设置订阅变化回调
    subscriptionManager.onSubscriptionChanged((subscriptions) => {
      // 清空并重新添加订阅
      dispatch({ type: 'CLEAR_SUBSCRIPTIONS' });
      subscriptions.forEach(sub => {
        dispatch({ type: 'ADD_SUBSCRIPTION', payload: sub });
      });
    });
    
    // 清理函数
    return () => {
      logger.info('Destroying WebSocket managers');
      manager.destroy();
      processor.destroy();
      // 注意：不要销毁单例的subscriptionManager
    };
  }, []);

  // ========== 用户变化处理 ==========
  
  useEffect(() => {
    subscriptionManager.setCurrentUser(user);
  }, [user]);

  // ========== 自动连接 ==========
  
  useEffect(() => {
    if (user && managerRef.current) {
      logger.info('User logged in, connecting WebSocket');
      managerRef.current.connect().catch(error => {
        logger.error('Failed to connect WebSocket:', error);
      });
    } else if (!user && managerRef.current) {
      logger.info('User logged out, disconnecting WebSocket');
      managerRef.current.disconnect();
    }
  }, [user]);

  // ========== 连接状态变化处理 ==========
  
  useEffect(() => {
    if (state.connectionState === ConnectionState.CONNECTED) {
      // 连接成功后恢复订阅
      subscriptionManager.restoreSubscriptions().catch(error => {
        logger.error('Failed to restore subscriptions:', error);
      });
    }
  }, [state.connectionState]);

  // ========== Context值 ==========
  
  const contextValue: WebSocketContextValue = {
    ...state,
    dispatch,
    manager: managerRef.current,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ========== Hook ==========

/**
 * 使用WebSocket Context的Hook
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// ========== 便捷Hooks ==========

/**
 * 获取连接状态的Hook
 */
export function useConnectionState() {
  const { connectionState, connectionError } = useWebSocketContext();
  return { connectionState, connectionError };
}

/**
 * 获取消息的Hook
 */
export function useMessages() {
  const { messages, unreadCount } = useWebSocketContext();
  return { messages, unreadCount };
}

/**
 * 获取订阅的Hook
 */
export function useSubscriptions() {
  const { subscriptions } = useWebSocketContext();
  return { subscriptions };
}

/**
 * 获取通知的Hook
 */
export function useNotifications() {
  const { notifications } = useWebSocketContext();
  return { notifications };
}