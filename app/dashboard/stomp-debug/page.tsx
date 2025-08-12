/**
 * WebSocket (STOMP) 调试页面
 * 
 * 使用新的WebSocket组件系统进行调试和测试，包括：
 * 1. 连接状态监控
 * 2. 消息收发测试
 * 3. 订阅管理
 * 4. 通知系统测试
 * 5. 性能监控
 * 
 * 注意：这是一个调试页面，用于开发和测试WebSocket功能
 */

"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { 
  useWebSocket, 
  useMessages, 
  useNotifications, 
  useSubscription 
} from "@/hooks/useWebSocket"
import { MessageType } from "@/lib/websocket/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionStatus } from "@/components/websocket/ConnectionStatus"
import {
  MessageSquare,
  Send,
  Trash2,
  Plus,
  Settings,
  User,
  Clock,
  Copy,
  Bug,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Eye
} from "lucide-react"

// ========== 类型定义 ==========

/**
 * 测试消息模板
 */
interface TestMessageTemplate {
  name: string
  description: string
  destination: string
  body: any
  headers?: Record<string, string>
}

/**
 * 调试页面状态
 */
interface DebugPageState {
  sendForm: {
    destination: string
    body: string
    headers: string
  }
  subscribeForm: {
    destination: string
  }
  selectedTemplate: TestMessageTemplate | null
}

// ========== 预定义测试模板 ==========

/**
 * 预定义的测试消息模板
 * 用于快速测试不同类型的消息
 */
const TEST_MESSAGE_TEMPLATES: TestMessageTemplate[] = [
  {
    name: "任务进度通知",
    description: "模拟任务进度更新消息",
    destination: "/app/test/task-progress",
    body: {
      messageId: `task_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: "TASK_PROGRESS",
      level: "INFO",
      title: "任务进度更新",
      content: "文件转码任务进度：75% 完成",
      payload: {
        taskId: "task_12345",
        progress: 75,
        totalFiles: 100,
        completedFiles: 75,
        estimatedTime: "2分钟"
      },
      actions: [{
        actionId: "view_task",
        actionName: "查看详情",
        actionType: "VIEW",
        actionTarget: "/dashboard/tasks/12345"
      }]
    }
  },
  {
    name: "设备状态变更",
    description: "模拟设备状态变更通知",
    destination: "/app/test/device-status",
    body: {
      messageId: `device_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: "DEVICE_STATUS",
      level: "WARNING",
      title: "设备状态变更",
      content: "设备 LED-001 已离线",
      payload: {
        deviceId: "LED-001",
        status: "OFFLINE",
        lastSeen: new Date().toISOString(),
        location: "北京市朝阳区"
      },
      requireAck: true,
      actions: [{
        actionId: "check_device",
        actionName: "检查设备",
        actionType: "NAVIGATE",
        actionTarget: "/dashboard/devices/LED-001"
      }]
    }
  },
  {
    name: "系统错误通知",
    description: "模拟系统错误消息",
    destination: "/app/test/system-error",
    body: {
      messageId: `error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: "SYSTEM_NOTIFICATION",
      level: "ERROR",
      title: "系统错误",
      content: "数据库连接失败，请联系管理员",
      priority: "HIGH",
      requireAck: true,
      ttl: 300000, // 5分钟
      actions: [
        {
          actionId: "retry",
          actionName: "重试",
          actionType: "RETRY",
          actionTarget: "/api/retry/db-connection"
        },
        {
          actionId: "contact_admin",
          actionName: "联系管理员",
          actionType: "NAVIGATE",
          actionTarget: "/dashboard/support"
        }
      ]
    }
  },
  {
    name: "成功通知",
    description: "模拟成功操作通知",
    destination: "/app/test/success",
    body: {
      messageId: `success_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oid: 1001,
      messageType: "USER_MESSAGE",
      level: "SUCCESS",
      title: "操作成功",
      content: "文件上传完成，共上传 5 个文件",
      payload: {
        uploadId: "upload_12345",
        fileCount: 5,
        totalSize: "2.5MB"
      },
      actions: [{
        actionId: "view_files",
        actionName: "查看文件",
        actionType: "VIEW",
        actionTarget: "/dashboard/files/upload_12345"
      }]
    }
  }
]

/**
 * 预定义的订阅主题模板
 */
const SUBSCRIPTION_TEMPLATES = [
  { name: "用户消息队列", destination: "/user/queue/messages" },
  { name: "系统通知", destination: "/topic/system" },
  { name: "设备状态", destination: "/topic/device/status" },
  { name: "任务进度", destination: "/topic/task/progress" },
  { name: "测试主题", destination: "/topic/test" },
]

// ========== 主组件 ==========

/**
 * WebSocket调试页面组件
 * 
 * 提供完整的WebSocket功能测试界面，包括连接管理、消息测试、订阅管理等
 */
export default function StompDebugPage() {
  const { user } = useUser()
  const { 
    isConnected, 
    connectionState, 
    connectionError, 
    send, 
    connect, 
    disconnect, 
    reconnect 
  } = useWebSocket()
  
  const { 
    messages, 
    unreadCount, 
    markAsRead, 
    clearMessages,
    acknowledgeMessage
  } = useMessages()
  
  const { 
    notifications, 
    showNotification, 
    dismissAll 
  } = useNotifications()
  
  const { 
    subscriptions, 
    subscribe, 
    unsubscribe, 
    isSubscribed 
  } = useSubscription()

  // ========== 本地增强状态 ==========
  const [taskIdForQuick, setTaskIdForQuick] = useState("")
  const [destinationForUnsubscribe, setDestinationForUnsubscribe] = useState("")
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>("")
  const [brokerURL, setBrokerURL] = useState<string>("")
  const [heartbeat, setHeartbeat] = useState<{incoming?: number; outgoing?: number}>({})

  // ========== 本地状态管理 ==========
  
  const [debugState, setDebugState] = useState<DebugPageState>({
    sendForm: {
      destination: "/app/test",
      body: JSON.stringify({ message: "Hello WebSocket!" }, null, 2),
      headers: JSON.stringify({ "content-type": "application/json" }, null, 2)
    },
    subscribeForm: {
      destination: ""
    },
    selectedTemplate: null
  })

  const [stats, setStats] = useState({
    totalMessagesSent: 0,
    totalMessagesReceived: messages.length,
    subscriptionHistory: [] as string[]
  })

  // ========== 副作用处理 ==========
  
  /**
   * 更新统计信息
   */
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalMessagesReceived: messages.length
    }))
  }, [messages.length])

  // 读取 Provider 暴露的调试配置
  useEffect(() => {
    const dbg = (typeof window !== 'undefined' ? (window as any).__WEBSOCKET_DEBUG__ : undefined)
    if (dbg?.config) {
      setBrokerURL(dbg.config.brokerURL || "")
      setHeartbeat({ incoming: dbg.config.heartbeatIncoming, outgoing: dbg.config.heartbeatOutgoing })
    }
  }, [])

  // ========== 事件处理函数 ==========
  
  /**
   * 发送测试消息
   */
  const handleSendMessage = () => {
    if (!isConnected) {
      alert('WebSocket未连接，请先连接')
      return
    }

    try {
      const headers = debugState.sendForm.headers ? 
        JSON.parse(debugState.sendForm.headers) : {}
      
      const body = JSON.parse(debugState.sendForm.body)
      
      send(debugState.sendForm.destination, body, headers)
      
      setStats(prev => ({
        ...prev,
        totalMessagesSent: prev.totalMessagesSent + 1
      }))
      
      console.log('测试消息已发送:', {
        destination: debugState.sendForm.destination,
        body,
        headers
      })
      
      alert('消息发送成功')
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送消息失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  /**
   * 使用模板填充发送表单
   */
  const handleUseTemplate = (template: TestMessageTemplate) => {
    setDebugState(prev => ({
      ...prev,
      sendForm: {
        destination: template.destination,
        body: JSON.stringify(template.body, null, 2),
        headers: JSON.stringify(template.headers || {}, null, 2)
      },
      selectedTemplate: template
    }))
  }

  /**
   * 订阅主题
   */
  const handleSubscribe = async () => {
    if (!isConnected) {
      alert('WebSocket未连接，请先连接')
      return
    }

    if (!debugState.subscribeForm.destination) {
      alert('请输入订阅地址')
      return
    }

    try {
      await subscribe(debugState.subscribeForm.destination, (message) => {
        console.log('收到订阅消息:', message)
      })
      
      setStats(prev => ({
        ...prev,
        subscriptionHistory: [...prev.subscriptionHistory, debugState.subscribeForm.destination]
      }))
      
      setDebugState(prev => ({
        ...prev,
        subscribeForm: { destination: "" }
      }))
      
      alert('订阅成功')
    } catch (error) {
      console.error('订阅失败:', error)
      alert('订阅失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  /**
   * 取消订阅
   */
  const handleUnsubscribe = (destination: string) => {
    unsubscribe(destination)
    alert(`已取消订阅: ${destination}`)
  }

  // 快速通过任务ID订阅
  const handleQuickSubscribeTask = async () => {
    if (!taskIdForQuick) {
      alert('请输入任务ID')
      return
    }
    const dest = `/topic/task/${taskIdForQuick}`
    try {
      await subscribe(dest)
      alert(`已订阅: ${dest}`)
    } catch (e) {
      alert('订阅失败')
    }
  }

  // 通过目的地址退订
  const handleUnsubscribeByDestination = () => {
    if (!destinationForUnsubscribe) {
      alert('请输入订阅目的地址')
      return
    }
    unsubscribe(destinationForUnsubscribe)
  }

  /**
   * 快速订阅预定义主题
   */
  const handleQuickSubscribe = async (destination: string) => {
    if (isSubscribed(destination)) {
      handleUnsubscribe(destination)
    } else {
      setDebugState(prev => ({
        ...prev,
        subscribeForm: { destination }
      }))
      
      // 自动订阅
      try {
        await subscribe(destination)
        alert(`已订阅: ${destination}`)
      } catch (error) {
        console.error('快速订阅失败:', error)
        alert('订阅失败')
      }
    }
  }

  /**
   * 测试通知显示
   */
  const handleTestNotification = (template: TestMessageTemplate) => {
    showNotification(template.body)
  }

  /**
   * 复制内容到剪贴板
   */
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  /**
   * 格式化JSON显示
   */
  const formatJson = (content: any) => {
    try {
      if (typeof content === 'string') {
        return JSON.stringify(JSON.parse(content), null, 2)
      }
      return JSON.stringify(content, null, 2)
    } catch {
      return String(content)
    }
  }

  // ========== 渲染逻辑 ==========
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 text-slate-400 mx-auto" />
            <h3 className="text-xl font-semibold">请先登录</h3>
            <p className="text-slate-600">需要登录后才能使用WebSocket调试功能</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 通知管理器全局已挂载，此处无需重复 */}
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bug className="w-8 h-8" />
            WebSocket 调试面板
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            使用新的WebSocket组件系统进行连接测试、消息收发和功能调试
          </p>
          {brokerURL && (
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Broker: {brokerURL} {heartbeat?.incoming || heartbeat?.outgoing ? `（心跳 in:${heartbeat.incoming || 0}ms / out:${heartbeat.outgoing || 0}ms）` : ''}
            </p>
          )}
        </div>
        
        {/* 连接状态指示器 */}
        <div className="flex items-center gap-4">
          <ConnectionStatus mode="detailed" showStats showSubscriptions />
          <div className="flex gap-2">
            <Button onClick={connect} disabled={isConnected} size="sm">
              连接
            </Button>
            <Button onClick={disconnect} disabled={!isConnected} variant="outline" size="sm">
              断开
            </Button>
            <Button onClick={reconnect} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">{connectionState}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">连接状态</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-sm text-slate-600">接收消息</p>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs mt-1">{unreadCount} 未读</Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-sm text-slate-600">活跃订阅</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalMessagesSent}</div>
            <p className="text-sm text-slate-600">发送消息</p>
          </CardContent>
        </Card>
      </div>

      {/* 连接错误提示 */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            连接错误: {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* 主要功能区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：消息发送和订阅 */}
        <div className="space-y-6">
          {/* 订阅增强：按任务ID/目的地址操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                订阅快捷操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm">按任务ID订阅 /topic/task/{'{taskId}'}</Label>
                <div className="flex gap-2">
                  <Input placeholder="taskId" value={taskIdForQuick} onChange={(e) => setTaskIdForQuick(e.target.value)} />
                  <Button size="sm" onClick={handleQuickSubscribeTask} disabled={!isConnected}>订阅</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm">按目的地址退订</Label>
                <div className="flex gap-2">
                  <Input placeholder="/topic/xxx" value={destinationForUnsubscribe} onChange={(e) => setDestinationForUnsubscribe(e.target.value)} />
                  <Button size="sm" variant="outline" onClick={handleUnsubscribeByDestination}>退订</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 消息模板 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                测试消息模板
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEST_MESSAGE_TEMPLATES.map((template) => (
                <div key={template.name} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500">{template.description}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseTemplate(template)}
                    >
                      使用
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestNotification(template)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 发送消息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                发送消息
                {debugState.selectedTemplate && (
                  <Badge variant="outline" className="ml-2">
                    {debugState.selectedTemplate.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="destination">目标地址</Label>
                <Input
                  id="destination"
                  value={debugState.sendForm.destination}
                  onChange={(e) => setDebugState(prev => ({
                    ...prev,
                    sendForm: { ...prev.sendForm, destination: e.target.value }
                  }))}
                  placeholder="/app/test"
                />
              </div>
              
              <div>
                <Label htmlFor="body">消息体 (JSON)</Label>
                <Textarea
                  id="body"
                  value={debugState.sendForm.body}
                  onChange={(e) => setDebugState(prev => ({
                    ...prev,
                    sendForm: { ...prev.sendForm, body: e.target.value }
                  }))}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={!isConnected}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                发送消息
              </Button>
            </CardContent>
          </Card>

          {/* 订阅管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                订阅管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={debugState.subscribeForm.destination}
                  onChange={(e) => setDebugState(prev => ({
                    ...prev,
                    subscribeForm: { destination: e.target.value }
                  }))}
                  placeholder="/topic/test"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubscribe} 
                  disabled={!isConnected}
                >
                  订阅
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">快捷订阅</Label>
                <div className="grid grid-cols-1 gap-2">
                  {SUBSCRIPTION_TEMPLATES.map((template) => (
                    <Button
                      key={template.destination}
                      size="sm"
                      variant={isSubscribed(template.destination) ? "default" : "outline"}
                      onClick={() => handleQuickSubscribe(template.destination)}
                      className="justify-start"
                    >
                      {template.name}
                      {isSubscribed(template.destination) && (
                        <CheckCircle className="w-3 h-3 ml-auto" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：消息显示和订阅状态 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 活跃订阅 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  活跃订阅 ({subscriptions.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={dismissAll}>
                  清空通知
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-slate-500 text-center py-4">暂无订阅</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{sub.destination}</div>
                        <div className="text-xs text-slate-500">ID: {sub.id}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnsubscribe(sub.destination)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 接收到的消息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  接收消息 ({messages.length})
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
                    value={messageTypeFilter}
                    onChange={(e) => setMessageTypeFilter(e.target.value)}
                  >
                    <option value="">全部类型</option>
                    {Object.values(MessageType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearMessages}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    清空
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {(messages.filter(m => !messageTypeFilter || m.messageType === messageTypeFilter).length) === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无消息</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter(m => !messageTypeFilter || m.messageType === messageTypeFilter)
                      .map((message) => (
                      <div key={message.messageId} className="border rounded p-3 bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {message.messageType}
                              </Badge>
                              <Badge variant={message.level === 'ERROR' ? 'destructive' : 'default'} className="text-xs">
                                {message.level}
                              </Badge>
                              {!message.isRead && (
                                <Badge variant="secondary" className="text-xs">未读</Badge>
                              )}
                            </div>
                            <h4 className="font-medium mt-1">{message.title}</h4>
                            <p className="text-sm text-slate-600">{message.content}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {message.timestamp}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {!message.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(message.messageId)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(formatJson(message))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {message.payload && (
                          <details className="mt-2">
                            <summary className="text-sm font-medium cursor-pointer">载荷数据</summary>
                            <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs mt-2 overflow-x-auto">
                              {formatJson(message.payload)}
                            </pre>
                          </details>
                        )}

                        {message.requireAck && !message.acknowledged && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              onClick={() => acknowledgeMessage(message.messageId)}
                            >
                              确认消息
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}