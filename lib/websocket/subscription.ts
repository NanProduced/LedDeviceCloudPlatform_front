/**
 * WebSocket订阅管理器
 * 
 * 负责管理WebSocket订阅，包括：
 * - 自动订阅基础队列
 * - 动态订阅和取消订阅
 * - 订阅状态管理
 * - 页面级订阅生命周期
 */

import { 
  SubscriptionInfo, 
  SubscriptionConfig, 
  UnifiedMessage 
} from './types';
import { 
  BASE_SUBSCRIPTION_TOPICS, 
  DYNAMIC_SUBSCRIPTION_TOPICS 
} from './constants';
import { 
  replaceTopic, 
  isValidTopic,
  generateSubscriptionId,
  createLogger 
} from './utils';
import { WebSocketManager } from './manager';
import { UserInfo } from '../types';

/**
 * 订阅管理器类
 */
export class SubscriptionManager {
  private logger = createLogger('SubscriptionManager');
  
  // 订阅状态
  private subscriptions = new Map<string, SubscriptionInfo>();
  private autoSubscriptions = new Set<string>();
  private pageSubscriptions = new Map<string, Set<string>>(); // 页面路径 -> 订阅ID集合
  
  // WebSocket管理器引用
  private wsManager: WebSocketManager | null = null;
  
  // 当前用户信息
  private currentUser: UserInfo | null = null;
  
  // 事件回调
  private onSubscriptionChange?: (subscriptions: SubscriptionInfo[]) => void;

  constructor() {
    this.logger.debug('SubscriptionManager initialized');
    this.setupRouteListener();
  }

  // ========== 公共API ==========

  /**
   * 设置WebSocket管理器
   */
  public setWebSocketManager(manager: WebSocketManager): void {
    this.wsManager = manager;
    this.logger.debug('WebSocket manager set');
  }

  /**
   * 设置当前用户信息
   */
  public setCurrentUser(user: UserInfo | null): void {
    const previousUser = this.currentUser;
    this.currentUser = user;
    
    if (user && (!previousUser || previousUser.uid !== user.uid)) {
      this.logger.info('User changed, setting up auto subscriptions', { 
        uid: user.uid, 
        oid: user.oid 
      });
      this.setupAutoSubscriptions();
    } else if (!user && previousUser) {
      this.logger.info('User logged out, clearing subscriptions');
      this.clearAllSubscriptions();
    }
  }

  /**
   * 订阅主题
   */
  public async subscribe(
    destination: string,
    callback?: (message: UnifiedMessage) => void,
    config?: Partial<SubscriptionConfig>
  ): Promise<string> {
    if (!this.wsManager || !this.wsManager.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    if (!isValidTopic(destination)) {
      throw new Error(`Invalid topic: ${destination}`);
    }

    // 检查是否已经订阅
    const existingSubscription = this.findSubscriptionByDestination(destination);
    if (existingSubscription) {
      this.logger.warn('Already subscribed to:', destination);
      return existingSubscription.id;
    }

    try {
      // 创建订阅
      const subscriptionId = this.wsManager.subscribe(
        destination,
        callback || (() => {}),
        config?.headers
      );

      // 创建订阅信息
      const subscriptionInfo: SubscriptionInfo = {
        id: subscriptionId,
        destination,
        subscribedAt: new Date(),
        isAutoSubscription: config?.isAutoSubscription || false,
      };

      // 保存订阅信息
      this.subscriptions.set(subscriptionId, subscriptionInfo);

      if (subscriptionInfo.isAutoSubscription) {
        this.autoSubscriptions.add(subscriptionId);
      }

      this.logger.debug('Subscribed to topic:', { destination, subscriptionId });
      this.notifySubscriptionChange();

      return subscriptionId;
    } catch (error) {
      this.logger.error('Failed to subscribe:', error);
      throw error;
    }
  }

  /**
   * 取消订阅
   */
  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      this.logger.warn('Subscription not found:', subscriptionId);
      return false;
    }

    try {
      // 从WebSocket管理器取消订阅
      if (this.wsManager) {
        this.wsManager.unsubscribe(subscriptionId);
      }

      // 清理本地状态
      this.subscriptions.delete(subscriptionId);
      this.autoSubscriptions.delete(subscriptionId);

      // 从页面订阅中移除
      for (const [page, pageSubscriptions] of this.pageSubscriptions) {
        pageSubscriptions.delete(subscriptionId);
        if (pageSubscriptions.size === 0) {
          this.pageSubscriptions.delete(page);
        }
      }

      this.logger.debug('Unsubscribed from topic:', {
        destination: subscription.destination,
        subscriptionId
      });
      this.notifySubscriptionChange();

      return true;
    } catch (error) {
      this.logger.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * 根据目标地址取消订阅
   */
  public unsubscribeByDestination(destination: string): boolean {
    const subscription = this.findSubscriptionByDestination(destination);
    if (subscription) {
      return this.unsubscribe(subscription.id);
    }
    return false;
  }

  /**
   * 页面级订阅（自动管理生命周期）
   */
  public async subscribeForPage(
    pagePath: string,
    destination: string,
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> {
    const subscriptionId = await this.subscribe(destination, callback, {
      isAutoSubscription: false
    });

    // 记录页面级订阅
    if (!this.pageSubscriptions.has(pagePath)) {
      this.pageSubscriptions.set(pagePath, new Set());
    }
    this.pageSubscriptions.get(pagePath)!.add(subscriptionId);

    this.logger.debug('Page subscription created:', { pagePath, destination, subscriptionId });
    return subscriptionId;
  }

  /**
   * 清理页面订阅
   */
  public unsubscribeForPage(pagePath: string): void {
    const pageSubscriptions = this.pageSubscriptions.get(pagePath);
    if (!pageSubscriptions) {
      return;
    }

    const unsubscribedCount = pageSubscriptions.size;
    for (const subscriptionId of pageSubscriptions) {
      this.unsubscribe(subscriptionId);
    }

    this.pageSubscriptions.delete(pagePath);
    this.logger.debug(`Unsubscribed ${unsubscribedCount} subscriptions for page: ${pagePath}`);
  }

  /**
   * 获取所有订阅
   */
  public getSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * 获取自动订阅
   */
  public getAutoSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.isAutoSubscription);
  }

  /**
   * 获取页面订阅
   */
  public getPageSubscriptions(pagePath?: string): SubscriptionInfo[] {
    if (pagePath) {
      const pageSubscriptionIds = this.pageSubscriptions.get(pagePath);
      if (!pageSubscriptionIds) return [];
      
      return Array.from(pageSubscriptionIds)
        .map(id => this.subscriptions.get(id))
        .filter(sub => sub !== undefined) as SubscriptionInfo[];
    }

    // 返回所有页面订阅
    const allPageSubscriptionIds = new Set<string>();
    for (const pageSubscriptions of this.pageSubscriptions.values()) {
      for (const id of pageSubscriptions) {
        allPageSubscriptionIds.add(id);
      }
    }

    return Array.from(allPageSubscriptionIds)
      .map(id => this.subscriptions.get(id))
      .filter(sub => sub !== undefined) as SubscriptionInfo[];
  }

  /**
   * 检查是否已订阅某个主题
   */
  public isSubscribed(destination: string): boolean {
    return this.findSubscriptionByDestination(destination) !== null;
  }

  /**
   * 清空所有订阅
   */
  public clearAllSubscriptions(): void {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    for (const subscriptionId of subscriptionIds) {
      this.unsubscribe(subscriptionId);
    }

    this.subscriptions.clear();
    this.autoSubscriptions.clear();
    this.pageSubscriptions.clear();

    this.logger.debug('All subscriptions cleared');
    this.notifySubscriptionChange();
  }

  /**
   * 设置订阅变化回调
   */
  public onSubscriptionChanged(callback: (subscriptions: SubscriptionInfo[]) => void): void {
    this.onSubscriptionChange = callback;
  }

  // ========== 便捷订阅方法 ==========

  /**
   * 订阅设备消息
   */
  public async subscribeToDevice(
    deviceId: string,
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> {
    const destination = replaceTopic(DYNAMIC_SUBSCRIPTION_TOPICS.DEVICE_TOPIC, { deviceId });
    return this.subscribe(destination, callback);
  }

  /**
   * 订阅任务消息
   */
  public async subscribeToTask(
    taskId: string,
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> {
    const destination = replaceTopic(DYNAMIC_SUBSCRIPTION_TOPICS.TASK_TOPIC, { taskId });
    return this.subscribe(destination, callback);
  }

  /**
   * 订阅批量操作消息
   */
  public async subscribeToBatch(
    batchId: string,
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> {
    const destination = replaceTopic(DYNAMIC_SUBSCRIPTION_TOPICS.BATCH_TOPIC, { batchId });
    return this.subscribe(destination, callback);
  }

  /**
   * 订阅用户通知
   */
  public async subscribeToUserNotifications(
    userId: string,
    callback?: (message: UnifiedMessage) => void
  ): Promise<string> {
    const destination = replaceTopic(DYNAMIC_SUBSCRIPTION_TOPICS.USER_NOTIFICATION, { userId });
    return this.subscribe(destination, callback);
  }

  // ========== 私有方法 ==========

  /**
   * 设置自动订阅
   */
  private async setupAutoSubscriptions(): Promise<void> {
    if (!this.currentUser || !this.wsManager || !this.wsManager.isConnected()) {
      this.logger.debug('Cannot setup auto subscriptions: user or connection not available');
      return;
    }

    const { uid, oid } = this.currentUser;

    try {
      // 订阅个人消息队列
      await this.subscribe(BASE_SUBSCRIPTION_TOPICS.USER_QUEUE, undefined, {
        isAutoSubscription: true
      });

      // 订阅组织消息主题
      const orgTopic = replaceTopic(BASE_SUBSCRIPTION_TOPICS.ORG_TOPIC, { orgId: oid.toString() });
      await this.subscribe(orgTopic, undefined, {
        isAutoSubscription: true
      });

      // 订阅系统消息主题
      await this.subscribe(BASE_SUBSCRIPTION_TOPICS.SYSTEM_TOPIC, undefined, {
        isAutoSubscription: true
      });

      this.logger.info('Auto subscriptions setup completed', {
        uid,
        oid,
        subscriptions: this.getAutoSubscriptions().map(sub => sub.destination)
      });

    } catch (error) {
      this.logger.error('Failed to setup auto subscriptions:', error);
    }
  }

  /**
   * 根据目标地址查找订阅
   */
  private findSubscriptionByDestination(destination: string): SubscriptionInfo | null {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.destination === destination) {
        return subscription;
      }
    }
    return null;
  }

  /**
   * 通知订阅变化
   */
  private notifySubscriptionChange(): void {
    if (this.onSubscriptionChange) {
      this.onSubscriptionChange(this.getSubscriptions());
    }
  }

  /**
   * 设置路由监听器（用于页面级订阅管理）
   */
  private setupRouteListener(): void {
    // 监听浏览器历史变化
    let currentPath = window.location.pathname;

    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        this.logger.debug('Route changed:', { from: currentPath, to: newPath });
        
        // 清理旧页面的订阅
        this.unsubscribeForPage(currentPath);
        
        currentPath = newPath;
      }
    };

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', handleRouteChange);

    // 监听pushstate和replacestate（程序化导航）
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };
  }

  /**
   * 重新连接后恢复订阅
   */
  public async restoreSubscriptions(): Promise<void> {
    if (!this.wsManager || !this.wsManager.isConnected()) {
      this.logger.warn('Cannot restore subscriptions: WebSocket not connected');
      return;
    }

    const subscriptionsToRestore = Array.from(this.subscriptions.values());
    this.logger.info(`Restoring ${subscriptionsToRestore.length} subscriptions`);

    // 清空当前订阅状态
    this.subscriptions.clear();
    this.autoSubscriptions.clear();

    // 重新建立订阅
    for (const subscription of subscriptionsToRestore) {
      try {
        await this.subscribe(subscription.destination, undefined, {
          isAutoSubscription: subscription.isAutoSubscription
        });
      } catch (error) {
        this.logger.error(`Failed to restore subscription: ${subscription.destination}`, error);
      }
    }

    this.logger.info('Subscriptions restoration completed');
  }

  /**
   * 销毁订阅管理器
   */
  public destroy(): void {
    this.logger.info('Destroying SubscriptionManager');
    
    // 清空所有订阅
    this.clearAllSubscriptions();
    
    // 清空状态
    this.wsManager = null;
    this.currentUser = null;
    this.onSubscriptionChange = undefined;
  }
}

// ========== 单例导出 ==========

/**
 * 默认订阅管理器实例
 */
export const subscriptionManager = new SubscriptionManager();