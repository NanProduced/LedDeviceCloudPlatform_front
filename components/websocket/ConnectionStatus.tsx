/**
 * WebSocket 连接状态指示器组件
 * 
 * 提供WebSocket连接状态的可视化展示，包括：
 * 1. 连接状态指示（颜色、图标、文字）
 * 2. 连接错误信息显示
 * 3. 连接统计信息（连接时长、重连次数等）
 * 4. 手动重连功能
 * 5. 订阅状态统计
 * 6. 支持多种展示模式（简洁/详细/图标）
 * 
 * 使用方式：
 * ```tsx
 * // 简洁模式 - 只显示状态图标
 * <ConnectionStatus mode="icon" />
 * 
 * // 基础模式 - 显示状态和简单信息
 * <ConnectionStatus mode="basic" />
 * 
 * // 详细模式 - 显示完整的连接信息和统计
 * <ConnectionStatus mode="detailed" showStats />
 * ```
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Badge, 
  Button, 
  Card, 
  Tooltip, 
  Popover, 
  Space, 
  Typography, 
  Divider,
  Statistic,
  Progress,
  Tag,
  Alert
} from 'antd';
import { 
  WifiOutlined,
  DisconnectOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { 
  ConnectionState 
} from '../../lib/websocket/types';
import { 
  useConnectionState, 
  useSubscriptions, 
  useWebSocketContext 
} from '../../contexts/WebSocketContext';
import { 
  formatTimeDiff, 
  createLogger 
} from '../../lib/websocket/utils';

const { Text, Paragraph } = Typography;

// ========== 类型定义 ==========

/**
 * 连接状态指示器的展示模式
 */
type DisplayMode = 'icon' | 'basic' | 'detailed';

/**
 * 连接状态指示器组件的配置选项
 */
interface ConnectionStatusProps {
  /** 展示模式，默认为'basic' */
  mode?: DisplayMode;
  /** 是否显示统计信息，默认为false */
  showStats?: boolean;
  /** 是否显示重连按钮，默认为true */
  showReconnectButton?: boolean;
  /** 是否显示订阅信息，默认为true */
  showSubscriptions?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否可点击展开详情，默认为true */
  expandable?: boolean;
}

/**
 * 连接统计信息
 */
interface ConnectionStats {
  /** 连接开始时间 */
  connectTime?: Date;
  /** 连接持续时间（毫秒） */
  duration: number;
  /** 重连次数 */
  reconnectCount: number;
  /** 最后一次重连时间 */
  lastReconnectTime?: Date;
  /** 总接收消息数 */
  totalMessages: number;
  /** 活跃订阅数 */
  activeSubscriptions: number;
}

// ========== 主组件 ==========

/**
 * WebSocket连接状态指示器组件
 * 
 * 根据WebSocket的连接状态显示相应的视觉指示器
 * 支持多种展示模式，可以显示详细的连接信息和统计数据
 */
export function ConnectionStatus({
  mode = 'basic',
  showStats = false,
  showReconnectButton = true,
  showSubscriptions = true,
  className,
  style,
  expandable = true,
}: ConnectionStatusProps) {
  const logger = createLogger('ConnectionStatus');
  const { connectionState, connectionError } = useConnectionState();
  const { subscriptions } = useSubscriptions();
  const { manager, messages } = useWebSocketContext();
  
  // ========== 本地状态管理 ==========
  
  /** 是否展开详细信息 */
  const [expanded, setExpanded] = useState(false);
  
  /** 连接统计信息 */
  const [stats, setStats] = useState<ConnectionStats>({
    duration: 0,
    reconnectCount: 0,
    totalMessages: 0,
    activeSubscriptions: 0,
  });
  
  /** 连接开始时间（用于计算持续时间） */
  const [connectStartTime, setConnectStartTime] = useState<Date | null>(null);

  // ========== 连接状态监听 ==========
  
  /**
   * 监听连接状态变化，更新统计信息
   */
  useEffect(() => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        if (!connectStartTime) {
          const now = new Date();
          setConnectStartTime(now);
          setStats(prev => ({ ...prev, connectTime: now }));
          logger.debug('Connection established, start tracking duration');
        }
        break;
      
      case ConnectionState.DISCONNECTED:
      case ConnectionState.FAILED:
        setConnectStartTime(null);
        setStats(prev => ({ ...prev, connectTime: undefined }));
        break;
      
      case ConnectionState.RECONNECTING:
        setStats(prev => ({ 
          ...prev, 
          reconnectCount: prev.reconnectCount + 1,
          lastReconnectTime: new Date()
        }));
        break;
    }
  }, [connectionState, connectStartTime]);

  /**
   * 定时更新连接持续时间
   */
  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED && connectStartTime) {
      const timer = setInterval(() => {
        const duration = Date.now() - connectStartTime.getTime();
        setStats(prev => ({ ...prev, duration }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [connectionState, connectStartTime]);

  /**
   * 更新订阅和消息统计
   */
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      activeSubscriptions: subscriptions.length,
      totalMessages: messages.length,
    }));
  }, [subscriptions.length, messages.length]);

  // ========== 状态配置映射 ==========
  
  /**
   * 根据连接状态获取对应的UI配置
   */
  const statusConfig = useMemo(() => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return {
          color: 'success' as const,
          icon: <CheckCircleOutlined />,
          text: '已连接',
          badge: 'success' as const,
          description: 'WebSocket连接正常',
        };
      
      case ConnectionState.CONNECTING:
        return {
          color: 'processing' as const,
          icon: <LoadingOutlined spin />,
          text: '连接中',
          badge: 'processing' as const,
          description: '正在建立WebSocket连接...',
        };
      
      case ConnectionState.RECONNECTING:
        return {
          color: 'warning' as const,
          icon: <LoadingOutlined spin />,
          text: '重连中',
          badge: 'warning' as const,
          description: `正在尝试重连... (第${stats.reconnectCount}次)`,
        };
      
      case ConnectionState.FAILED:
        return {
          color: 'error' as const,
          icon: <ExclamationCircleOutlined />,
          text: '连接失败',
          badge: 'error' as const,
          description: connectionError || '连接失败，请检查网络或服务器状态',
        };
      
      case ConnectionState.DISCONNECTED:
      default:
        return {
          color: 'default' as const,
          icon: <DisconnectOutlined />,
          text: '未连接',
          badge: 'default' as const,
          description: '未建立WebSocket连接',
        };
    }
  }, [connectionState, connectionError, stats.reconnectCount]);

  // ========== 事件处理 ==========
  
  /**
   * 处理手动重连
   */
  const handleReconnect = () => {
    if (manager) {
      logger.info('Manual reconnect triggered');
      manager.connect().catch(error => {
        logger.error('Manual reconnect failed:', error);
      });
    }
  };

  /**
   * 切换展开状态
   */
  const handleToggleExpand = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  // ========== 渲染函数 ==========
  
  /**
   * 渲染图标模式
   */
  const renderIconMode = () => {
    const tooltip = (
      <div>
        <div><strong>{statusConfig.text}</strong></div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {statusConfig.description}
        </div>
        {connectionState === ConnectionState.CONNECTED && (
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            连接时长: {formatTimeDiff(stats.connectTime || new Date())}
          </div>
        )}
      </div>
    );

    return (
      <Tooltip title={tooltip}>
        <Badge 
          status={statusConfig.badge} 
          className={className}
          style={{ cursor: 'pointer', ...style }}
          onClick={expandable ? handleToggleExpand : undefined}
        />
      </Tooltip>
    );
  };

  /**
   * 渲染基础模式
   */
  const renderBasicMode = () => {
    return (
      <div 
        className={className}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: expandable ? 'pointer' : 'default',
          ...style 
        }}
        onClick={expandable ? handleToggleExpand : undefined}
      >
        <Badge status={statusConfig.badge} />
        <Text style={{ fontSize: '14px' }}>{statusConfig.text}</Text>
        {showReconnectButton && connectionState === ConnectionState.FAILED && (
          <Button 
            type="link" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleReconnect();
            }}
          >
            重连
          </Button>
        )}
      </div>
    );
  };

  /**
   * 渲染详细统计信息
   */
  const renderStatsContent = () => {
    return (
      <div style={{ minWidth: '300px' }}>
        {/* 连接状态信息 */}
        <div style={{ marginBottom: '16px' }}>
          <Space align="center">
            {statusConfig.icon}
            <Text strong>{statusConfig.text}</Text>
          </Space>
          <Paragraph 
            style={{ 
              margin: '8px 0 0 0', 
              fontSize: '12px', 
              color: '#666' 
            }}
          >
            {statusConfig.description}
          </Paragraph>
        </div>

        {/* 连接错误信息 */}
        {connectionError && (
          <Alert
            type="error"
            showIcon
            message="连接错误"
            description={connectionError}
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* 统计信息 */}
        {showStats && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Statistic
                title="连接时长"
                value={stats.duration}
                formatter={(value) => formatTimeDiff(new Date(Date.now() - (value as number)))}
                prefix={<ClockCircleOutlined />}
              />
              <Statistic
                title="重连次数"
                value={stats.reconnectCount}
                prefix={<ReloadOutlined />}
              />
              <Statistic
                title="接收消息"
                value={stats.totalMessages}
                prefix={<WifiOutlined />}
              />
              <Statistic
                title="活跃订阅"
                value={stats.activeSubscriptions}
                prefix={<ApiOutlined />}
              />
            </div>
          </>
        )}

        {/* 订阅信息 */}
        {showSubscriptions && subscriptions.length > 0 && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Text strong style={{ fontSize: '12px' }}>活跃订阅:</Text>
              <div style={{ marginTop: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {subscriptions.slice(0, 5).map((sub) => (
                    <Tag key={sub.id} size="small" style={{ fontSize: '11px' }}>
                      {sub.destination}
                    </Tag>
                  ))}
                  {subscriptions.length > 5 && (
                    <Text style={{ fontSize: '11px', color: '#666' }}>
                      还有 {subscriptions.length - 5} 个订阅...
                    </Text>
                  )}
                </Space>
              </div>
            </div>
          </>
        )}

        {/* 操作按钮 */}
        {showReconnectButton && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Button 
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleReconnect}
                disabled={connectionState === ConnectionState.CONNECTING}
              >
                重新连接
              </Button>
              <Button 
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => {
                  console.log('WebSocket Debug Info:', {
                    connectionState,
                    connectionError,
                    stats,
                    subscriptions,
                    manager: manager ? 'Available' : 'Not Available',
                  });
                }}
              >
                调试信息
              </Button>
            </Space>
          </>
        )}
      </div>
    );
  };

  /**
   * 渲染详细模式
   */
  const renderDetailedMode = () => {
    if (expandable) {
      return (
        <Popover
          content={renderStatsContent()}
          title="WebSocket连接状态"
          trigger="click"
          open={expanded}
          onOpenChange={setExpanded}
          placement="bottomLeft"
        >
          <div 
            className={className}
            style={{ 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              backgroundColor: '#fafafa',
              ...style 
            }}
          >
            {renderBasicMode()}
          </div>
        </Popover>
      );
    }

    return (
      <Card 
        size="small"
        title="WebSocket连接状态"
        className={className}
        style={style}
      >
        {renderStatsContent()}
      </Card>
    );
  };

  // ========== 主渲染逻辑 ==========
  
  switch (mode) {
    case 'icon':
      return renderIconMode();
    case 'basic':
      return renderBasicMode();
    case 'detailed':
      return renderDetailedMode();
    default:
      return renderBasicMode();
  }
}

// ========== 默认导出 ==========

export default ConnectionStatus;

// ========== 便捷组件导出 ==========

/**
 * 简洁的连接状态图标
 * 只显示一个状态指示点
 */
export const ConnectionStatusIcon = (props: Omit<ConnectionStatusProps, 'mode'>) => (
  <ConnectionStatus {...props} mode="icon" />
);

/**
 * 基础的连接状态指示器
 * 显示状态文字和图标
 */
export const ConnectionStatusBasic = (props: Omit<ConnectionStatusProps, 'mode'>) => (
  <ConnectionStatus {...props} mode="basic" />
);

/**
 * 详细的连接状态面板
 * 显示完整的连接信息和统计
 */
export const ConnectionStatusPanel = (props: Omit<ConnectionStatusProps, 'mode'>) => (
  <ConnectionStatus {...props} mode="detailed" showStats showSubscriptions />
);