# WebSocket 开发者使用指南

## 概述

本指南详细介绍了如何在LED云平台项目中使用WebSocket组件系统。我们基于STOMP协议构建了一套完整的实时通信解决方案，提供了易用的Hook接口、智能的通知管理和可靠的连接管理。

## 快速开始

### 1. 基础使用

WebSocket功能已经在应用根部集成，您可以直接在任何组件中使用：

```tsx
import { useWebSocket, useMessages, useSubscription } from '@/hooks/useWebSocket';

function MyComponent() {
  const { isConnected, send } = useWebSocket();
  const { messages, unreadCount, markAsRead } = useMessages();
  const { subscribe, unsubscribe } = useSubscription();
  
  // 检查连接状态
  if (!isConnected) {
    return <div>WebSocket未连接</div>;
  }
  
  // 发送消息
  const handleSend = () => {
    send('/app/test', { message: 'Hello!' });
  };
  
  // 订阅主题
  const handleSubscribe = () => {
    subscribe('/topic/notifications');
  };
  
  return (
    <div>
      <div>未读消息: {unreadCount}</div>
      <button onClick={handleSend}>发送消息</button>
      <button onClick={handleSubscribe}>订阅通知</button>
    </div>
  );
}
```

### 2. 连接状态显示

在页面中显示WebSocket连接状态：

```tsx
import { ConnectionStatus } from '@/components/websocket/ConnectionStatus';

function StatusPage() {
  return (
    <div>
      {/* 简洁模式 - 只显示状态图标 */}
      <ConnectionStatus mode="icon" />
      
      {/* 基础模式 - 显示状态和简单信息 */}
      <ConnectionStatus mode="basic" />
      
      {/* 详细模式 - 显示完整信息和统计 */}
      <ConnectionStatus mode="detailed" showStats showSubscriptions />
    </div>
  );
}
```

## Hook API 详解

### useWebSocket()

提供基础的WebSocket连接管理功能。

```tsx
const {
  isConnected,      // 是否已连接
  connectionState,  // 连接状态
  connectionError,  // 连接错误信息
  send,            // 发送消息函数
  connect,         // 手动连接
  disconnect,      // 手动断开
  reconnect        // 手动重连
} = useWebSocket();

// 发送消息
send('/app/notification', {
  type: 'TEST',
  content: '测试消息'
});

// 手动重连
reconnect();
```

### useMessages()

管理接收到的消息。

```tsx
const {
  messages,           // 消息列表
  unreadCount,        // 未读消息数量
  getMessagesByType,  // 按类型获取消息
  markAsRead,         // 标记已读
  markAllAsRead,      // 全部标记已读
  acknowledgeMessage, // 确认消息
  clearMessages,      // 清空消息
  deleteMessage       // 删除消息
} = useMessages();

// 获取特定类型的消息
const taskMessages = getMessagesByType('TASK_PROGRESS');

// 标记消息为已读
markAsRead('message-id-123');

// 确认需要ACK的消息
acknowledgeMessage('message-id-456');
```

### useSubscription()

管理主题订阅。

```tsx
const {
  subscriptions,    // 当前订阅列表
  subscribe,        // 订阅主题
  unsubscribe,      // 取消订阅
  unsubscribeAll,   // 取消所有订阅
  isSubscribed      // 检查是否已订阅
} = useSubscription();

// 订阅主题
const subscriptionId = await subscribe('/topic/device/123', (message) => {
  console.log('收到设备消息:', message);
});

// 取消订阅
unsubscribe('/topic/device/123');

// 检查订阅状态
if (isSubscribed('/topic/notifications')) {
  console.log('已订阅通知主题');
}
```

### useNotifications()

管理通知显示。

```tsx
const {
  notifications,      // 当前通知列表
  showNotification,   // 显示通知
  dismissNotification,// 关闭通知
  dismissAll          // 关闭所有通知
} = useNotifications();

// 手动显示通知
showNotification({
  messageId: 'custom-001',
  timestamp: new Date().toISOString(),
  oid: 1001,
  messageType: 'USER_MESSAGE',
  level: 'SUCCESS',
  title: '操作成功',
  content: '文件上传完成'
});
```

## 页面级订阅模式

在具体的业务页面中，通常需要根据页面上下文订阅相关主题：

### 设备管理页面

```tsx
import { useEffect } from 'react';
import { useSubscription, useMessages } from '@/hooks/useWebSocket';

function DeviceManagementPage({ deviceId }: { deviceId: string }) {
  const { subscribe, unsubscribe, isConnected } = useSubscription();
  const { getMessagesByType } = useMessages();
  
  // 页面级订阅
  useEffect(() => {
    if (isConnected && deviceId) {
      // 订阅设备状态更新
      const deviceStatusTopic = `/topic/device/${deviceId}/status`;
      const deviceCommandTopic = `/topic/device/${deviceId}/command`;
      
      subscribe(deviceStatusTopic, (message) => {
        console.log('设备状态更新:', message);
        // 处理设备状态变化
      });
      
      subscribe(deviceCommandTopic, (message) => {
        console.log('设备命令反馈:', message);
        // 处理命令执行结果
      });
      
      // 清理函数
      return () => {
        unsubscribe(deviceStatusTopic);
        unsubscribe(deviceCommandTopic);
      };
    }
  }, [isConnected, deviceId, subscribe, unsubscribe]);
  
  // 获取设备相关消息
  const deviceMessages = getMessagesByType('DEVICE_STATUS');
  
  return (
    <div>
      <h1>设备管理 - {deviceId}</h1>
      {/* 设备管理界面 */}
    </div>
  );
}
```

### 任务进度页面

```tsx
function TaskProgressPage({ taskId }: { taskId: string }) {
  const { subscribe, unsubscribe, isConnected } = useSubscription();
  const { messages } = useMessages();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (isConnected && taskId) {
      const progressTopic = `/topic/task/${taskId}/progress`;
      
      subscribe(progressTopic, (message) => {
        if (message.messageType === 'TASK_PROGRESS') {
          setProgress(message.payload?.progress || 0);
        }
      });
      
      return () => unsubscribe(progressTopic);
    }
  }, [isConnected, taskId]);
  
  return (
    <div>
      <h1>任务进度</h1>
      <div>进度: {progress}%</div>
      {/* 进度显示界面 */}
    </div>
  );
}
```

## 消息格式和处理

### 统一消息格式

所有WebSocket消息都遵循`UnifiedMessage`格式：

```typescript
interface UnifiedMessage {
  messageId: string;          // 消息唯一标识
  timestamp: string;          // ISO格式时间戳
  oid: number;               // 组织ID
  messageType: MessageType;   // 消息类型
  level: Level;              // 消息级别
  title?: string;            // 消息标题
  content?: string;          // 消息内容
  payload?: any;             // 载荷数据
  priority?: Priority;       // 优先级
  requireAck?: boolean;      // 是否需要确认
  ttl?: number;             // 生存时间(毫秒)
  actions?: Action[];        // 操作按钮
}
```

### 消息类型

```typescript
enum MessageType {
  TASK_PROGRESS = 'TASK_PROGRESS',           // 任务进度
  DEVICE_STATUS = 'DEVICE_STATUS',           // 设备状态
  FILE_UPLOAD = 'FILE_UPLOAD',               // 文件上传
  TRANSCODE_PROGRESS = 'TRANSCODE_PROGRESS', // 转码进度
  COMMAND_FEEDBACK = 'COMMAND_FEEDBACK',     // 命令反馈
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION', // 系统通知
  USER_MESSAGE = 'USER_MESSAGE'              // 用户消息
}
```

### 消息级别和UI展示

- **SUCCESS**: 绿色Toast通知，3秒自动消失
- **INFO**: 蓝色Toast通知，3秒自动消失
- **WARNING**: 橙色Alert组件，需要手动关闭
- **ERROR**: 红色Modal弹窗，必须用户确认

### 操作按钮处理

消息可以包含操作按钮，系统会自动渲染并处理：

```typescript
interface Action {
  actionId: string;          // 操作ID
  actionName: string;        // 按钮文字
  actionType: ActionType;    // 操作类型
  actionTarget?: string;     // 目标地址
  parameters?: any;          // 参数
}

enum ActionType {
  DOWNLOAD = 'DOWNLOAD',     // 下载
  VIEW = 'VIEW',            // 查看
  NAVIGATE = 'NAVIGATE',    // 导航
  CONFIRM = 'CONFIRM',      // 确认
  RETRY = 'RETRY',          // 重试
  REFRESH = 'REFRESH',      // 刷新
  DISMISS = 'DISMISS'       // 关闭
}
```

## 自定义通知

### 手动显示通知

```tsx
import { useNotifications } from '@/hooks/useWebSocket';

function CustomNotificationExample() {
  const { showNotification } = useNotifications();
  
  const showSuccess = () => {
    showNotification({
      messageId: `success_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: 'USER_MESSAGE',
      level: 'SUCCESS',
      title: '操作成功',
      content: '数据保存成功',
      actions: [{
        actionId: 'view_data',
        actionName: '查看数据',
        actionType: 'NAVIGATE',
        actionTarget: '/dashboard/data'
      }]
    });
  };
  
  const showError = () => {
    showNotification({
      messageId: `error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: 'SYSTEM_NOTIFICATION',
      level: 'ERROR',
      title: '操作失败',
      content: '网络连接超时，请重试',
      requireAck: true,
      actions: [{
        actionId: 'retry',
        actionName: '重试',
        actionType: 'RETRY',
        actionTarget: '/api/retry'
      }]
    });
  };
  
  return (
    <div>
      <button onClick={showSuccess}>显示成功通知</button>
      <button onClick={showError}>显示错误通知</button>
    </div>
  );
}
```

### 自定义操作处理

```tsx
import { NotificationManager } from '@/components/websocket/NotificationManager';

function CustomNotificationManager() {
  const customActionHandlers = {
    'CUSTOM_ACTION': (action, message) => {
      console.log('自定义操作:', action);
      // 执行自定义逻辑
    }
  };
  
  return (
    <NotificationManager 
      customActionHandlers={customActionHandlers}
      enableSound={true}
      showDebugInfo={process.env.NODE_ENV === 'development'}
    />
  );
}
```

## 错误处理和调试

### 连接错误处理

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function ErrorHandlingExample() {
  const { connectionState, connectionError, reconnect } = useWebSocket();
  
  if (connectionState === 'FAILED') {
    return (
      <div className="error-container">
        <h3>连接失败</h3>
        <p>{connectionError}</p>
        <button onClick={reconnect}>重新连接</button>
      </div>
    );
  }
  
  return <div>正常内容</div>;
}
```

### 调试模式

在开发环境中，可以启用详细的调试信息：

```tsx
// 在WebSocketProvider中启用调试
<WebSocketProvider 
  enableDebug={true}
  showConnectionStatus={true}
>
  {children}
</WebSocketProvider>
```

开发环境中会显示：
- 详细的控制台日志
- 连接状态Toast提示
- 调试面板显示
- 全局调试对象 `window.__WEBSOCKET_DEBUG__`

### 调试页面

访问 `/dashboard/stomp-debug` 可以使用专门的调试页面：
- 连接状态监控
- 消息发送测试
- 订阅管理
- 通知系统测试
- 性能统计

## 性能优化建议

### 1. 订阅管理

```tsx
// ✅ 正确：基于组件生命周期管理订阅
useEffect(() => {
  if (isConnected) {
    const unsubscribe = subscribe('/topic/data');
    return unsubscribe; // 组件卸载时自动清理
  }
}, [isConnected]);

// ❌ 错误：忘记清理订阅
useEffect(() => {
  subscribe('/topic/data');
}, []); // 会导致内存泄漏
```

### 2. 消息处理

```tsx
// ✅ 正确：使用防抖处理高频消息
const debouncedHandler = useMemo(
  () => debounce((message) => {
    // 处理消息
  }, 300),
  []
);

useEffect(() => {
  subscribe('/topic/high-frequency', debouncedHandler);
}, [debouncedHandler]);
```

### 3. 消息历史管理

```tsx
// ✅ 正确：定期清理旧消息
const { clearMessages, messages } = useMessages();

useEffect(() => {
  if (messages.length > 1000) {
    clearMessages();
  }
}, [messages.length]);
```

## 最佳实践

### 1. 消息设计原则

- **明确的消息类型**：使用描述性的`messageType`
- **合适的级别**：根据重要性选择正确的`level`
- **有用的标题和内容**：提供清晰的用户提示
- **合理的TTL**：避免过期消息占用内存
- **必要时使用ACK**：重要操作需要用户确认

### 2. 订阅策略

- **页面级订阅**：在页面组件中管理相关订阅
- **避免重复订阅**：检查是否已订阅同一主题
- **及时清理**：组件卸载时取消订阅
- **错误处理**：订阅失败时的降级处理

### 3. 用户体验

- **状态反馈**：显示连接状态和操作反馈
- **适度通知**：避免过多的通知干扰用户
- **优雅降级**：连接失败时提供替代方案
- **性能监控**：监控连接质量和消息处理性能

### 4. 开发调试

- **使用调试页面**：利用内置的调试工具
- **查看控制台日志**：开发环境的详细日志
- **测试各种场景**：网络断开、重连、错误处理
- **性能分析**：监控消息处理性能和内存使用

## 故障排除

### 常见问题

1. **连接失败**
   - 检查WebSocket服务器地址
   - 确认网络连通性
   - 查看控制台错误信息

2. **消息未接收**
   - 确认已正确订阅主题
   - 检查消息格式是否正确
   - 验证过滤条件

3. **通知不显示**
   - 确认NotificationManager已加载
   - 检查消息级别设置
   - 验证消息格式

4. **性能问题**
   - 检查订阅数量
   - 监控消息频率
   - 清理历史消息

### 调试步骤

1. **检查连接状态**
   ```tsx
   const { connectionState, connectionError } = useWebSocket();
   console.log('连接状态:', connectionState);
   console.log('错误信息:', connectionError);
   ```

2. **查看订阅列表**
   ```tsx
   const { subscriptions } = useSubscription();
   console.log('当前订阅:', subscriptions);
   ```

3. **监控消息接收**
   ```tsx
   const { messages } = useMessages();
   console.log('接收到的消息:', messages);
   ```

4. **使用调试工具**
   ```javascript
   // 开发环境中可用
   console.log(window.__WEBSOCKET_DEBUG__.getStats());
   ```

## 总结

WebSocket组件系统为LED云平台提供了强大的实时通信能力，通过简洁的Hook接口和智能的通知管理，开发者可以轻松集成实时功能。遵循本指南的最佳实践，可以构建出高性能、用户友好的实时应用。

如有问题，请查看调试页面或联系开发团队。