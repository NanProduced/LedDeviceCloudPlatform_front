/**
 * WebSocket 通知管理器组件
 * 
 * 负责根据WebSocket消息的level和配置来显示相应的UI通知，包括：
 * 1. SUCCESS/INFO - Toast通知（自动消失）
 * 2. WARNING - Alert组件（手动关闭）
 * 3. ERROR - Modal弹窗（必须确认）
 * 4. 处理requireAck的确认逻辑
 * 5. 渲染和处理actions按钮
 * 6. 管理通知优先级和队列
 * 
 * 使用方式：
 * ```tsx
 * <NotificationManager />
 * ```
 * 
 * 注意：此组件应该放在WebSocketProvider内部，通常会被自动调用
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { 
  message as antdMessage, 
  notification as antdNotification, 
  Modal, 
  Button, 
  Space, 
  Alert,
  Typography,
  Divider 
} from 'antd';
import { 
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { 
  UnifiedMessage, 
  Level, 
  Priority, 
  ActionType, 
  Action,
  NotificationItem,
  MessageType
} from '../../lib/websocket/types';
import { 
  LEVEL_UI_CONFIG, 
  PRIORITY_CONFIG, 
  PERFORMANCE_CONFIG,
  ACTION_TYPE_DISPLAY_NAMES 
} from '../../lib/websocket/constants';
import { 
  generateNotificationId, 
  createLogger, 
  formatTimeDiff 
} from '../../lib/websocket/utils';
import { useWebSocketContext } from '../../contexts/WebSocketContext';

const { Text, Paragraph } = Typography;

// ========== 类型定义 ==========

/**
 * 通知管理器组件的配置选项
 */
interface NotificationManagerProps {
  /** 是否启用声音提示，默认为true */
  enableSound?: boolean;
  /** 最大同时显示的通知数量，默认从配置读取 */
  maxNotifications?: number;
  /** 是否在开发环境显示调试信息，默认为false */
  showDebugInfo?: boolean;
  /** 自定义动作处理器 */
  customActionHandlers?: Record<string, (action: Action, message: UnifiedMessage) => void>;
}

/**
 * 内部通知状态
 */
interface InternalNotification extends NotificationItem {
  /** 是否正在显示 */
  isShowing: boolean;
  /** 显示时间 */
  showTime: Date;
  /** Modal实例引用（仅ERROR级别） */
  modalRef?: { destroy: () => void };
}

// ========== 主组件 ==========

/**
 * WebSocket通知管理器组件
 * 
 * 这个组件监听WebSocket消息并根据消息的level属性显示相应的UI通知
 * 支持Toast、Alert、Modal等多种展示方式，并处理用户交互和确认逻辑
 */
export function NotificationManager({
  enableSound = true,
  maxNotifications = PERFORMANCE_CONFIG.MAX_NOTIFICATIONS,
  showDebugInfo = false,
  customActionHandlers = {},
}: NotificationManagerProps) {
  const logger = createLogger('NotificationManager');
  const router = useRouter();
  const { dispatch, messages } = useWebSocketContext();
  
  // ========== 内部状态管理 ==========
  
  /** 内部通知列表，用于管理通知的完整生命周期 */
  const [internalNotifications, setInternalNotifications] = React.useState<InternalNotification[]>([]);
  
  /** 用于防止重复处理的消息ID集合 */
  const processedMessageIds = useRef(new Set<string>());
  
  /** 音频提示元素引用 */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ========== 音频初始化 ==========
  
  /**
   * 初始化音频提示功能
   * 创建一个简单的音频元素用于播放提示音
   */
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      // 创建一个简单的提示音（使用Web Audio API生成）
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createBeep = (frequency: number, duration: number) => {
        return () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        };
      };
      
      // 存储不同类型的提示音
      (window as any).__notificationSounds__ = {
        success: createBeep(800, 0.2),
        info: createBeep(600, 0.3),
        warning: createBeep(400, 0.4),
        error: createBeep(300, 0.6),
      };
      
      logger.debug('Audio notification system initialized');
    }
  }, [enableSound]);

  // ========== 核心通知处理逻辑 ==========

  /**
   * 显示通知的核心函数
   * 根据消息的level属性选择合适的UI展示方式
   */
  const showNotification = useCallback(async (message: UnifiedMessage) => {
    // 防止重复处理同一条消息
    if (processedMessageIds.current.has(message.messageId)) {
      logger.debug('Message already processed, skipping:', message.messageId);
      return;
    }
    
    processedMessageIds.current.add(message.messageId);
    logger.info('Showing notification for message:', message.messageId, message.level);

    // 获取level对应的UI配置
    const uiConfig = LEVEL_UI_CONFIG[message.level];
    const priorityConfig = PRIORITY_CONFIG[message.priority || Priority.NORMAL];

    // 播放声音提示（如果启用）
    if (enableSound && priorityConfig.sound && typeof window !== 'undefined') {
      const sounds = (window as any).__notificationSounds__;
      if (sounds && sounds[message.level.toLowerCase()]) {
        try {
          sounds[message.level.toLowerCase()]();
        } catch (error) {
          logger.warn('Failed to play notification sound:', error);
        }
      }
    }

    // 创建通知项
    const notificationItem: InternalNotification = {
      id: generateNotificationId(),
      message,
      type: uiConfig.type,
      visible: true,
      createdAt: new Date(),
      isShowing: true,
      showTime: new Date(),
      expiresAt: uiConfig.duration > 0 ? new Date(Date.now() + uiConfig.duration) : undefined,
    };

    // 针对上传完成的定制：任务进度+SUCCESS+payload.eventType=UPLOAD_COMPLETED 或 标题包含“上传完成” → 使用Modal
    const isUploadCompleted = (
      message.messageType === MessageType.TASK_PROGRESS &&
      (message.title?.includes('上传完成') ||
       (message.payload && typeof message.payload.eventType === 'string' &&
        message.payload.eventType.toString().toUpperCase().includes('UPLOAD') &&
        message.payload.eventType.toString().toUpperCase().includes('COMPLETED')))
    );

    // 根据level展示不同类型的通知（含上传完成覆盖为Modal）
    switch (isUploadCompleted ? Level.ERROR /* 占位：强制走Modal分支 */ : message.level) {
      case Level.SUCCESS:
      case Level.INFO:
        await showToastNotification(message, notificationItem);
        break;
      case Level.WARNING:
        await showAlertNotification(message, notificationItem);
        break;
      case Level.ERROR:
        await showModalNotification(message, notificationItem);
        break;
      default:
        await showModalNotification(message, notificationItem);
    }

    // 添加到内部通知列表
    setInternalNotifications(prev => {
      const updated = [notificationItem, ...prev];
      // 限制通知数量
      return updated.slice(0, maxNotifications);
    });

    // 添加到全局状态
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationItem });

  }, [enableSound, maxNotifications, dispatch]);

  /**
   * 显示Toast通知（SUCCESS/INFO级别）
   * 自动消失，适用于一般信息提示
   */
  const showToastNotification = async (message: UnifiedMessage, notificationItem: InternalNotification) => {
    const config = LEVEL_UI_CONFIG[message.level];
    const icon = message.level === Level.SUCCESS ? <CheckCircleOutlined /> : <InfoCircleOutlined />;
    
    const messageApi = message.level === Level.SUCCESS ? antdMessage.success : antdMessage.info;
    
    messageApi({
      content: (
        <div>
          <div style={{ fontWeight: 500 }}>{message.title || '通知'}</div>
          {message.content && (
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
              {message.content}
            </div>
          )}
          {message.actions && message.actions.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <Space size="small">
                {message.actions.slice(0, 2).map(action => (
                  <Button
                    key={action.actionId}
                    size="small"
                    type="link"
                    style={{ padding: '0 4px', height: 'auto' }}
                    onClick={() => handleActionClick(action, message)}
                  >
                    {action.actionName}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      ),
      duration: config.duration / 1000, // Ant Design使用秒
      icon,
    });
  };

  /**
   * 显示Alert通知（WARNING级别）
   * 需要手动关闭，适用于重要警告信息
   */
  const showAlertNotification = async (message: UnifiedMessage, notificationItem: InternalNotification) => {
    antdNotification.warning({
      message: message.title || '警告',
      description: (
        <div>
          {message.content && (
            <Paragraph style={{ marginBottom: message.actions ? '12px' : 0 }}>
              {message.content}
            </Paragraph>
          )}
          {message.actions && message.actions.length > 0 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Space>
                {message.actions.map(action => (
                  <Button
                    key={action.actionId}
                    size="small"
                    type={action.actionType === ActionType.CONFIRM ? 'primary' : 'default'}
                    icon={getActionIcon(action.actionType)}
                    onClick={() => {
                      handleActionClick(action, message);
                      antdNotification.destroy(notificationItem.id);
                    }}
                  >
                    {action.actionName}
                  </Button>
                ))}
              </Space>
            </>
          )}
        </div>
      ),
      key: notificationItem.id,
      duration: 0, // 不自动关闭
      placement: 'topRight',
      style: { width: '400px' },
    });
  };

  /**
   * 显示Modal通知（ERROR级别）
   * 必须用户确认，适用于错误和重要提示
   */
  const showModalNotification = async (message: UnifiedMessage, notificationItem: InternalNotification) => {
    const modalFactory = (() => {
      switch (message.level) {
        case Level.SUCCESS:
          return Modal.success;
        case Level.INFO:
          return Modal.info;
        case Level.WARNING:
          return Modal.warning;
        case Level.ERROR:
        default:
          return Modal.error;
      }
    })();

    const modal = modalFactory({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {message.level === Level.ERROR ? (
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          ) : (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          )}
          {message.title || (message.level === Level.ERROR ? '错误' : '通知')}
        </div>
      ),
      content: (
        <div>
          {message.content && (
            <Paragraph style={{ marginBottom: message.actions ? '16px' : 0 }}>
              {message.content}
            </Paragraph>
          )}
          {showDebugInfo && (
            <Alert
              type="info"
              showIcon={false}
              message="调试信息"
              description={
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <div>消息ID: {message.messageId}</div>
                  <div>时间: {message.timestamp}</div>
                  <div>类型: {message.messageType}</div>
                </div>
              }
              style={{ marginTop: '12px' }}
            />
          )}
        </div>
      ),
      okText: message.requireAck ? '确认' : '知道了',
      width: 480,
      onOk: () => {
        if (message.requireAck) {
          handleMessageAck(message);
        }
        handleNotificationDismiss(notificationItem.id);
      },
      footer: (
        <div style={{ textAlign: 'right' }}>
          <Space>
            {message.actions && message.actions.map(action => (
              <Button
                key={action.actionId}
                type={action.actionType === ActionType.CONFIRM ? 'primary' : 'default'}
                icon={getActionIcon(action.actionType)}
                onClick={() => {
                  handleActionClick(action, message);
                  modal.destroy();
                  handleNotificationDismiss(notificationItem.id);
                }}
              >
                {action.actionName}
              </Button>
            ))}
            <Button 
              type="primary" 
              onClick={() => {
                if (message.requireAck) {
                  handleMessageAck(message);
                }
                modal.destroy();
                handleNotificationDismiss(notificationItem.id);
              }}
            >
              {message.requireAck ? '确认' : '知道了'}
            </Button>
          </Space>
        </div>
      ),
    });

    // 保存modal引用以便后续销毁
    notificationItem.modalRef = modal;
  };

  // ========== 动作处理逻辑 ==========

  /**
   * 处理动作按钮点击
   * 根据actionType执行相应的操作
   */
  const handleActionClick = useCallback((action: Action, message: UnifiedMessage) => {
    logger.info('Action clicked:', action.actionId, action.actionType);

    // 先检查是否有自定义处理器
    if (customActionHandlers[action.actionType]) {
      customActionHandlers[action.actionType](action, message);
      return;
    }

    // 默认动作处理逻辑
    switch (action.actionType) {
      case ActionType.DOWNLOAD:
        handleDownload(action);
        break;
      case ActionType.VIEW:
      case ActionType.NAVIGATE:
        handleNavigation(action);
        break;
      case ActionType.CONFIRM:
        handleConfirm(action, message);
        break;
      case ActionType.RETRY:
        handleRetry(action);
        break;
      case ActionType.REFRESH:
        handleRefresh(action);
        break;
      case ActionType.DISMISS:
        // 关闭动作由调用方处理
        break;
      default:
        logger.warn('Unknown action type:', action.actionType);
    }
  }, [customActionHandlers, router]);

  /**
   * 处理下载动作
   */
  const handleDownload = (action: Action) => {
    if (action.actionTarget) {
      const link = document.createElement('a');
      link.href = action.actionTarget;
      link.download = action.parameters?.fileName || '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      antdMessage.success('下载已开始');
    }
  };

  /**
   * 处理导航动作
   */
  const handleNavigation = (action: Action) => {
    if (action.actionTarget) {
      if (action.actionTarget.startsWith('http')) {
        // 外部链接
        window.open(action.actionTarget, '_blank');
      } else {
        // 内部路由
        router.push(action.actionTarget);
      }
    }
  };

  /**
   * 处理确认动作
   */
  const handleConfirm = (action: Action, message: UnifiedMessage) => {
    if (action.actionTarget) {
      // 发送确认请求到后端
      fetch(action.actionTarget, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.parameters || {}),
      })
      .then(response => {
        if (response.ok) {
          antdMessage.success('操作已确认');
        } else {
          antdMessage.error('操作失败');
        }
      })
      .catch(error => {
        logger.error('Confirm action failed:', error);
        antdMessage.error('操作失败');
      });
    }
  };

  /**
   * 处理重试动作
   */
  const handleRetry = (action: Action) => {
    if (action.actionTarget) {
      fetch(action.actionTarget, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.parameters || {}),
      })
      .then(response => {
        if (response.ok) {
          antdMessage.success('重试已开始');
        } else {
          antdMessage.error('重试失败');
        }
      })
      .catch(error => {
        logger.error('Retry action failed:', error);
        antdMessage.error('重试失败');
      });
    }
  };

  /**
   * 处理刷新动作
   */
  const handleRefresh = (action: Action) => {
    if (action.actionTarget) {
      // 如果有API地址，刷新数据
      window.location.reload();
    } else {
      // 否则刷新整个页面
      window.location.reload();
    }
  };

  /**
   * 处理消息确认（ACK）
   */
  const handleMessageAck = (message: UnifiedMessage) => {
    logger.info('Acknowledging message:', message.messageId);
    
    // 更新本地状态
    dispatch({ type: 'ACKNOWLEDGE_MESSAGE', payload: message.messageId });
    
    // 发送ACK到后端
    const ackUrl = `/app/message/ack/${message.messageId}`;
    // 这里需要通过WebSocket发送，具体实现取决于后端API
    // wsManager.send(ackUrl, { messageId: message.messageId });
  };

  /**
   * 处理通知关闭
   */
  const handleNotificationDismiss = (notificationId: string) => {
    setInternalNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, visible: false } : n)
    );
    
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  // ========== 工具函数 ==========

  /**
   * 根据动作类型获取相应的图标
   */
  const getActionIcon = (actionType: ActionType) => {
    switch (actionType) {
      case ActionType.DOWNLOAD:
        return <DownloadOutlined />;
      case ActionType.VIEW:
      case ActionType.NAVIGATE:
        return <EyeOutlined />;
      case ActionType.RETRY:
        return <ReloadOutlined />;
      case ActionType.CONFIRM:
        return <CheckOutlined />;
      default:
        return undefined;
    }
  };

  // ========== 生命周期管理 ==========

  /**
   * 清理过期的通知
   */
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      setInternalNotifications(prev => 
        prev.filter(notification => {
          if (notification.expiresAt && now > notification.expiresAt) {
            // 自动关闭过期的通知
            if (notification.modalRef) {
              notification.modalRef.destroy();
            }
            return false;
          }
          return true;
        })
      );
    }, 30000); // 每30秒检查一次

    return () => clearInterval(cleanup);
  }, []);

  // ========== 自动监听消息并显示通知 ==========
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    // 遍历消息，展示未处理过的通知（忽略 IGNORE）
    const latestBatch = messages.slice(0, 20); // 限制遍历数量，避免大列表性能问题
    latestBatch.forEach((msg) => {
      if (!processedMessageIds.current.has(msg.messageId) && msg.level !== Level.IGNORE) {
        showNotification(msg);
      }
    });
  }, [messages, showNotification]);

  // ========== 渲染 ==========

  // 通知管理器组件不需要渲染任何可见内容
  // 所有的UI都通过Ant Design的message、notification、Modal API显示
  return null;
}

// ========== 默认导出 ==========

export default NotificationManager;

// ========== 便捷Hook导出 ==========

/**
 * 使用通知管理器的Hook
 * 提供手动显示通知的能力
 */
export function useNotificationManager() {
  const { dispatch } = useWebSocketContext();
  
  const showNotification = useCallback((message: UnifiedMessage) => {
    // 创建通知管理器实例并显示通知
    const manager = new (NotificationManager as any)({});
    return manager.showNotification(message);
  }, [dispatch]);

  return { showNotification };
}