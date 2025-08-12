/**
 * WebSocket连接管理器
 * 
 * 负责管理STOMP WebSocket连接，包括：
 * - 连接建立和维护
 * - 自动重连机制
 * - 连接状态管理
 * - 心跳检测
 * - 错误处理
 */

import { Client, StompSubscription } from '@stomp/stompjs';
import { 
  ConnectionState, 
  WebSocketConfig, 
  UnifiedMessage,
  SubscriptionInfo 
} from './types';
import { 
  DEFAULT_WEBSOCKET_CONFIG, 
  RECONNECT_CONFIG, 
  ERROR_CODES 
} from './constants';
import { 
  createWebSocketError, 
  calculateBackoffDelay, 
  addJitter,
  createLogger,
  validateMessage 
} from './utils';

/**
 * WebSocket连接管理器类
 */
export class WebSocketManager {
  private client: Client | null = null;
  private config: WebSocketConfig;
  private logger = createLogger('WebSocketManager');
  
  // 连接状态
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionError: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // 订阅管理
  private subscriptions = new Map<string, StompSubscription>();
  private subscriptionCallbacks = new Map<string, (message: UnifiedMessage) => void>();
  private subscriptionDestinations = new Map<string, string>();
  
  // 事件回调
  private onConnectionStateChange?: (state: ConnectionState) => void;
  private onConnectionError?: (error: string | null) => void;
  private onMessageReceived?: (message: UnifiedMessage) => void;
  
  // 网络状态监听
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isPageVisible = typeof document !== 'undefined' ? !document.hidden : true;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
    this.setupNetworkListeners();
    this.setupVisibilityListeners();
    this.logger.debug('WebSocketManager initialized', this.config);
  }

  // ========== 公共API ==========

  /**
   * 连接WebSocket
   */
  public async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED || 
        this.connectionState === ConnectionState.CONNECTING) {
      this.logger.warn('Already connected or connecting');
      return;
    }

    this.setConnectionState(ConnectionState.CONNECTING);
    this.setConnectionError(null);

    try {
      await this.createConnection();
    } catch (error) {
      this.logger.error('Failed to connect:', error);
      const wsError = createWebSocketError(
        ERROR_CODES.CONNECTION_FAILED, 
        undefined, 
        error as Error
      );
      this.handleConnectionError(wsError);
    }
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    this.logger.info('Disconnecting WebSocket');
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 清除所有订阅
    this.clearSubscriptions();
    
    // 断开客户端连接
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (error) {
        this.logger.warn('Error during disconnect:', error);
      }
      this.client = null;
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  /**
   * 发送消息
   */
  public send(destination: string, body: any, headers?: Record<string, string>): void {
    if (!this.client || this.connectionState !== ConnectionState.CONNECTED) {
      throw createWebSocketError(ERROR_CODES.CONNECTION_FAILED, '连接未建立');
    }

    try {
      const messageBody = typeof body === 'string' ? body : JSON.stringify(body);
      this.client.publish({
        destination,
        body: messageBody,
        headers: headers || {}
      });
      
      this.logger.debug('Message sent:', { destination, body, headers });
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw createWebSocketError(
        ERROR_CODES.MESSAGE_PARSE_ERROR, 
        undefined, 
        error as Error
      );
    }
  }

  /**
   * 订阅主题
   */
  public subscribe(
    destination: string, 
    callback: (message: UnifiedMessage) => void,
    headers?: Record<string, string>
  ): string {
    if (!this.client || this.connectionState !== ConnectionState.CONNECTED) {
      throw createWebSocketError(ERROR_CODES.CONNECTION_FAILED, '连接未建立');
    }

    try {
      const subscription = this.client.subscribe(destination, (stompMessage) => {
        this.handleReceivedMessage(destination, stompMessage.body, callback);
      }, headers);

      const subscriptionId = `${destination}_${Date.now()}`;
      this.subscriptions.set(subscriptionId, subscription);
      this.subscriptionCallbacks.set(subscriptionId, callback);
      this.subscriptionDestinations.set(subscriptionId, destination);
      
      this.logger.debug('Subscribed to:', destination);
      return subscriptionId;
    } catch (error) {
      this.logger.error('Failed to subscribe:', error);
      throw createWebSocketError(
        ERROR_CODES.SUBSCRIPTION_FAILED, 
        undefined, 
        error as Error
      );
    }
  }

  /**
   * 取消订阅
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      try {
        // 附带destination头取消订阅，STOMP库会自动填充id头
        const destination = this.subscriptionDestinations.get(subscriptionId);
        if (destination) {
          (subscription as any).unsubscribe({ destination });
        } else {
          subscription.unsubscribe();
        }
        this.subscriptions.delete(subscriptionId);
        this.subscriptionCallbacks.delete(subscriptionId);
        this.subscriptionDestinations.delete(subscriptionId);
        this.logger.debug('Unsubscribed:', subscriptionId);
      } catch (error) {
        this.logger.warn('Error during unsubscribe:', error);
      }
    }
  }

  /**
   * 获取连接状态
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * 获取连接错误
   */
  public getConnectionError(): string | null {
    return this.connectionError;
  }

  /**
   * 获取活动订阅列表
   */
  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  // ========== 事件监听器设置 ==========

  /**
   * 设置连接状态变化回调
   */
  public onConnectionStateChanged(callback: (state: ConnectionState) => void): void {
    this.onConnectionStateChange = callback;
  }

  /**
   * 设置连接错误回调
   */
  public onConnectionErrorChanged(callback: (error: string | null) => void): void {
    this.onConnectionError = callback;
  }

  /**
   * 设置消息接收回调
   */
  public onMessage(callback: (message: UnifiedMessage) => void): void {
    this.onMessageReceived = callback;
  }

  // ========== 私有方法 ==========

  /**
   * 创建STOMP连接
   */
  private async createConnection(): Promise<void> {
    this.client = new Client({
      brokerURL: this.config.brokerURL,
      connectHeaders: this.config.connectHeaders || {},
      debug: this.config.debug ? (str) => this.logger.debug('[STOMP]', str) : undefined,
      reconnectDelay: 0, // 我们自己管理重连
      heartbeatIncoming: this.config.heartbeatIncoming || 4000,
      heartbeatOutgoing: this.config.heartbeatOutgoing || 4000,
    });

    // 设置连接回调
    this.client.onConnect = (frame) => {
      this.logger.info('STOMP connected:', frame.headers);
      this.setConnectionState(ConnectionState.CONNECTED);
      this.setConnectionError(null);
      this.reconnectAttempts = 0;
    };

    // 设置错误回调
    this.client.onStompError = (frame) => {
      this.logger.error('STOMP error:', frame);
      const error = createWebSocketError(
        ERROR_CODES.CONNECTION_FAILED,
        `STOMP错误: ${frame.headers.message || '未知错误'}`
      );
      this.handleConnectionError(error);
    };

    // 设置WebSocket错误回调
    this.client.onWebSocketError = (event) => {
      this.logger.error('WebSocket error:', event);
      const error = createWebSocketError(
        ERROR_CODES.CONNECTION_FAILED,
        'WebSocket连接错误'
      );
      this.handleConnectionError(error);
    };

    // 设置断开连接回调
    this.client.onDisconnect = () => {
      this.logger.info('STOMP disconnected');
      const wasConnected = this.connectionState === ConnectionState.CONNECTED || this.connectionState === ConnectionState.RECONNECTING || this.connectionState === ConnectionState.CONNECTING;
      this.setConnectionState(ConnectionState.DISCONNECTED);
      this.clearSubscriptions();
      
      // 如果不是主动调用 disconnect() 触发的，并且之前处于连接态，则尝试重连
      if (wasConnected) {
        this.scheduleReconnect();
      }
    };

    // 激活连接
    this.client.activate();
  }

  /**
   * 处理接收到的消息
   */
  private handleReceivedMessage(
    destination: string, 
    body: string, 
    callback: (message: UnifiedMessage) => void
  ): void {
    try {
      const message = JSON.parse(body);
      
      // 验证消息格式
      if (!validateMessage(message)) {
        this.logger.warn('Invalid message format:', message);
        return;
      }

      this.logger.debug('Message received:', { destination, message });
      
      // 调用订阅回调
      callback(message);
      
      // 调用全局消息回调
      if (this.onMessageReceived) {
        this.onMessageReceived(message);
      }
    } catch (error) {
      this.logger.error('Failed to parse message:', error);
    }
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(error: Error): void {
    this.setConnectionError(error.message);
    this.setConnectionState(ConnectionState.FAILED);
    
    // 如果网络在线且页面可见，尝试重连
    if (this.isOnline && this.isPageVisible) {
      this.scheduleReconnect();
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= RECONNECT_CONFIG.MAX_ATTEMPTS) {
      this.logger.error('Max reconnect attempts reached');
      this.setConnectionState(ConnectionState.FAILED);
      return;
    }

    this.reconnectAttempts++;
    const delay = calculateBackoffDelay(
      this.reconnectAttempts,
      RECONNECT_CONFIG.INITIAL_DELAY,
      RECONNECT_CONFIG.MAX_DELAY,
      RECONNECT_CONFIG.BACKOFF_MULTIPLIER
    );
    
    const jitteredDelay = addJitter(delay);
    
    this.logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${jitteredDelay}ms`);
    this.setConnectionState(ConnectionState.RECONNECTING);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        this.logger.error('Reconnect failed:', error);
      });
    }, jitteredDelay);
  }

  /**
   * 设置连接状态
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.logger.debug('Connection state changed:', state);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
    }
  }

  /**
   * 设置连接错误
   */
  private setConnectionError(error: string | null): void {
    if (this.connectionError !== error) {
      this.connectionError = error;
      
      if (this.onConnectionError) {
        this.onConnectionError(error);
      }
    }
  }

  /**
   * 清除所有订阅
   */
  private clearSubscriptions(): void {
    for (const [subscriptionId, subscription] of this.subscriptions) {
      try {
        const destination = this.subscriptionDestinations.get(subscriptionId);
        if (destination) {
          (subscription as any).unsubscribe({ destination });
        } else {
          subscription.unsubscribe();
        }
      } catch (error) {
        this.logger.warn('Error unsubscribing:', error);
      }
    }
    
    this.subscriptions.clear();
    this.subscriptionCallbacks.clear();
    this.subscriptionDestinations.clear();
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListeners(): void {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      this.logger.debug('Server-side environment detected, skipping network listeners setup');
      return;
    }
    
    window.addEventListener('online', () => {
      this.logger.info('Network came online');
      this.isOnline = true;
      
      // 如果连接失败且页面可见，尝试重连
      if (this.connectionState === ConnectionState.FAILED && this.isPageVisible) {
        this.reconnectAttempts = 0; // 重置重连计数
        this.connect().catch(error => {
          this.logger.error('Auto-reconnect on online failed:', error);
        });
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', () => {
        this.logger.info('Network went offline');
        this.isOnline = false;
        
        // 清除重连定时器
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      });
    }
  }

  /**
   * 设置页面可见性监听
   */
  private setupVisibilityListeners(): void {
    // 检查是否在客户端环境
    if (typeof document === 'undefined') {
      this.logger.debug('Server-side environment detected, skipping visibility listeners setup');
      return;
    }
    
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      if (this.isPageVisible) {
        this.logger.debug('Page became visible');
        
        // 如果连接失败且网络在线，尝试重连
        if (this.connectionState === ConnectionState.FAILED && this.isOnline) {
          this.reconnectAttempts = 0; // 重置重连计数
          this.connect().catch(error => {
            this.logger.error('Auto-reconnect on visibility change failed:', error);
          });
        }
      } else {
        this.logger.debug('Page became hidden');
        
        // 页面隐藏时清除重连定时器，但保持连接
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      }
    });
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.logger.info('Destroying WebSocketManager');
    
    // 断开连接
    this.disconnect();
    
    // 清除事件监听器
    this.onConnectionStateChange = undefined;
    this.onConnectionError = undefined;
    this.onMessageReceived = undefined;
    
    // 注意：这里不移除网络和可见性监听器，因为它们是全局的
    // 在实际应用中可能需要更复杂的清理逻辑
  }
}