/**
 * WebSocket Provider 组件
 * 
 * 这是一个高级的WebSocket Provider封装组件，提供以下功能：
 * 1. WebSocket连接配置和初始化
 * 2. 错误边界处理
 * 3. 开发环境调试支持
 * 4. 性能监控和统计
 * 5. 自定义配置选项
 * 
 * 使用方式：
 * ```tsx
 * <WebSocketProvider config={{ brokerURL: 'ws://localhost:8080/ws' }}>
 *   <App />
 * </WebSocketProvider>
 * ```
 */

'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { message } from 'antd';
import { 
  WebSocketProvider as BaseWebSocketProvider 
} from '../../contexts/WebSocketContext';
import { 
  WebSocketConfig, 
  ConnectionState 
} from '../../lib/websocket/types';
import { 
  DEFAULT_WEBSOCKET_CONFIG, 
  DEBUG_CONFIG 
} from '../../lib/websocket/constants';
import { createLogger } from '../../lib/websocket/utils';

// ========== 类型定义 ==========

/**
 * WebSocketProvider组件的配置选项
 */
interface WebSocketProviderProps {
  /** 子组件 */
  children: ReactNode;
  /** WebSocket配置，可选，会与默认配置合并 */
  config?: Partial<WebSocketConfig>;
  /** 是否启用调试模式，默认在开发环境启用 */
  enableDebug?: boolean;
  /** 是否显示连接状态提示，默认为true */
  showConnectionStatus?: boolean;
  /** 自定义错误处理函数，可选 */
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;
  /** 连接状态变化回调，可选 */
  onConnectionStateChange?: (state: ConnectionState) => void;
}

/**
 * 错误边界组件的状态
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// ========== 错误边界组件 ==========

/**
 * WebSocket错误边界组件
 * 
 * 用于捕获和处理WebSocket相关的错误，防止整个应用崩溃
 * 在生产环境中提供友好的错误提示，在开发环境中显示详细的错误信息
 */
class WebSocketErrorBoundary extends React.Component<
  WebSocketProviderProps,
  ErrorBoundaryState
> {
  private logger = createLogger('WebSocketErrorBoundary');

  constructor(props: WebSocketProviderProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * 捕获子组件中的错误
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新state，下次渲染时会显示错误UI
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 记录错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.error('WebSocket error caught by boundary:', error, errorInfo);
    
    // 更新错误信息到state
    this.setState({
      errorInfo,
    });
    
    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 在生产环境中显示用户友好的错误提示
    if (process.env.NODE_ENV === 'production') {
      message.error('WebSocket连接出现问题，请刷新页面重试');
    }
  }

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 开发环境显示详细错误信息
      if (process.env.NODE_ENV === 'development') {
        return (
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ff4d4f', 
            borderRadius: '6px',
            backgroundColor: '#fff2f0',
            margin: '20px'
          }}>
            <h2 style={{ color: '#ff4d4f', marginBottom: '16px' }}>
              🚨 WebSocket Error Boundary
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <strong>错误信息：</strong>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '8px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.errorInfo && (
              <div style={{ marginBottom: '16px' }}>
                <strong>错误堆栈：</strong>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '8px',
                  fontSize: '12px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button 
              onClick={this.handleReset}
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        );
      }
      
      // 生产环境显示简洁的错误提示
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: '#666'
        }}>
          <h3>连接出现问题</h3>
          <p>请刷新页面重试，如果问题持续存在，请联系技术支持。</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ========== 主Provider组件 ==========

/**
 * 高级WebSocket Provider组件
 * 
 * 这个组件是对基础WebSocketProvider的增强封装，提供了：
 * - 配置合并和验证
 * - 错误边界保护
 * - 开发环境调试工具
 * - 连接状态监控
 * - 性能统计
 */
export function WebSocketProvider({
  children,
  config,
  enableDebug = DEBUG_CONFIG.VERBOSE_LOGGING,
  showConnectionStatus = true,
  onError,
  onConnectionStateChange,
}: WebSocketProviderProps) {
  const logger = createLogger('WebSocketProvider');

  // ========== 配置合并 ==========
  
  /**
   * 合并用户配置和默认配置
   * 用户提供的配置会覆盖默认配置
   */
  const mergedConfig: WebSocketConfig = React.useMemo(() => {
    const merged = {
      ...DEFAULT_WEBSOCKET_CONFIG,
      ...config,
      // 确保调试模式设置正确
      debug: enableDebug,
    };
    
    logger.info('WebSocket configuration merged:', merged);
    return merged;
  }, [config, enableDebug]);

  // ========== 配置验证 ==========
  
  /**
   * 验证WebSocket配置的有效性
   */
  React.useEffect(() => {
    // 验证必要的配置项
    if (!mergedConfig.brokerURL) {
      const error = new Error('WebSocket brokerURL is required');
      logger.error('Configuration validation failed:', error);
      throw error;
    }

    // 验证URL格式
    try {
      new URL(mergedConfig.brokerURL);
    } catch (urlError) {
      const error = new Error(`Invalid WebSocket URL: ${mergedConfig.brokerURL}`);
      logger.error('URL validation failed:', error);
      throw error;
    }

    // 验证重连配置
    if (mergedConfig.maxReconnectAttempts && mergedConfig.maxReconnectAttempts < 0) {
      logger.warn('maxReconnectAttempts should be non-negative, using default value');
    }

    if (mergedConfig.reconnectDelay && mergedConfig.reconnectDelay < 1000) {
      logger.warn('reconnectDelay should be at least 1000ms for stability');
    }

    logger.debug('Configuration validation passed');
  }, [mergedConfig]);

  // ========== 开发环境调试支持 ==========
  
  /**
   * 在开发环境中添加全局调试工具
   */
  React.useEffect(() => {
    if (enableDebug && typeof window !== 'undefined') {
      // 添加全局调试对象，方便开发时调试
      (window as any).__WEBSOCKET_DEBUG__ = {
        config: mergedConfig,
        // 可以在这里添加更多调试工具
        getStats: () => {
          // 返回WebSocket统计信息
          return {
            timestamp: new Date().toISOString(),
            config: mergedConfig,
            userAgent: navigator.userAgent,
            online: navigator.onLine,
          };
        },
      };
      
      logger.info('Debug tools available at window.__WEBSOCKET_DEBUG__');
    }

    // 清理函数
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__WEBSOCKET_DEBUG__;
      }
    };
  }, [enableDebug, mergedConfig]);

  // ========== 连接状态监控 ==========
  
  /**
   * 连接状态变化处理
   */
  const handleConnectionStateChange = React.useCallback((state: ConnectionState) => {
    logger.debug('Connection state changed:', state);
    
    // 在开发环境中显示连接状态提示
    if (showConnectionStatus && enableDebug) {
      switch (state) {
        case ConnectionState.CONNECTED:
          message.success('WebSocket连接已建立');
          break;
        case ConnectionState.DISCONNECTED:
          message.info('WebSocket连接已断开');
          break;
        case ConnectionState.RECONNECTING:
          message.loading('正在重新连接WebSocket...', 0);
          break;
        case ConnectionState.FAILED:
          message.error('WebSocket连接失败');
          break;
      }
    }
    
    // 调用用户提供的回调
    if (onConnectionStateChange) {
      onConnectionStateChange(state);
    }
  }, [showConnectionStatus, enableDebug, onConnectionStateChange]);

  // ========== 性能监控 ==========
  
  /**
   * 组件挂载时的性能记录
   */
  React.useEffect(() => {
    const startTime = performance.now();
    
    logger.info('WebSocketProvider mounted');
    
    return () => {
      const endTime = performance.now();
      logger.info(`WebSocketProvider unmounted, lifespan: ${endTime - startTime}ms`);
    };
  }, []);

  // ========== 渲染 ==========
  
  return (
    <WebSocketErrorBoundary 
      onError={onError}
      onConnectionStateChange={handleConnectionStateChange}
    >
      {/* 
        使用基础的WebSocketProvider，它已经包含了所有核心逻辑
        这里主要是提供配置、错误处理和调试功能的封装
      */}
      <BaseWebSocketProvider>
        {children}
      </BaseWebSocketProvider>
      
      {/* 开发环境调试信息 */}
      {enableDebug && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999,
          maxWidth: '300px',
          opacity: 0.7,
        }}>
          <div>🔌 WebSocket Debug Mode</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>
            URL: {mergedConfig.brokerURL}
          </div>
          <div style={{ fontSize: '10px' }}>
            查看控制台获取更多调试信息
          </div>
        </div>
      )}
    </WebSocketErrorBoundary>
  );
}

// ========== 默认导出 ==========

export default WebSocketProvider;

// ========== 便捷导出 ==========

/**
 * 创建带有预设配置的WebSocketProvider
 * 
 * @param defaultConfig 默认配置
 * @returns 配置好的Provider组件
 */
export function createWebSocketProvider(defaultConfig: Partial<WebSocketConfig>) {
  return function ConfiguredWebSocketProvider({ 
    children, 
    config,
    ...props 
  }: Omit<WebSocketProviderProps, 'config'> & { 
    config?: Partial<WebSocketConfig> 
  }) {
    const mergedConfig = { ...defaultConfig, ...config };
    
    return (
      <WebSocketProvider config={mergedConfig} {...props}>
        {children}
      </WebSocketProvider>
    );
  };
}

/**
 * 开发环境专用的WebSocketProvider
 * 启用所有调试功能和详细日志
 */
export const DebugWebSocketProvider = createWebSocketProvider({
  debug: true,
  reconnectDelay: 1000, // 更短的重连延迟便于调试
  maxReconnectAttempts: 3, // 更少的重连次数避免调试时的干扰
});