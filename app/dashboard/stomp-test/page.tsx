"use client"

import { useState, useEffect, useRef } from "react"
import { Client as StompClient, StompSubscription } from "@stomp/stompjs"
import { useUser } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Wifi,
  WifiOff,
  Send,
  Trash2,
  Plus,
  Settings,
  User,
  Clock,
  XCircle,
  Copy,
  Loader2
} from "lucide-react"

// 消息类型定义
interface CommonStompMessage {
  messageId: string
  timestamp: string
  messageType: "NOTIFICATION" | "TERMINAL_STATUS_CHANGE" | "COMMAND_FEEDBACK"
  subType_1: "USER" | "ORG" | "BATCH"
  subType_2: string
  payload: unknown
}

interface ReceivedMessage {
  id: string
  destination: string
  timestamp: string
  headers: Record<string, string>
  body: string
  parsed?: CommonStompMessage
}

interface Subscription {
  id: string
  destination: string
  subscription: StompSubscription
  timestamp: string
}

export default function StompTestPage() {
  const { user } = useUser()
  const [client, setClient] = useState<StompClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // 消息相关状态
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  
  // 发送消息表单
  const [sendForm, setSendForm] = useState({
    destination: "/app/test",
    body: JSON.stringify({ message: "Hello STOMP!" }, null, 2),
    headers: JSON.stringify({ "content-type": "application/json" }, null, 2)
  })
  
  // 订阅表单
  const [subscribeForm, setSubscribeForm] = useState({
    destination: "/topic/test"
  })
  
  const clientRef = useRef<StompClient | null>(null)
  
  // 创建STOMP客户端
  const createStompClient = () => {
    if (clientRef.current) {
      clientRef.current.deactivate()
    }
    
    const stompClient = new StompClient({
      brokerURL: 'ws://192.168.1.222:8082/message-service/ws',
      connectHeaders: {},
      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })
    
    stompClient.onConnect = (frame) => {
      console.log('STOMP连接成功:', frame)
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionError(null)
      
      console.log('连接建立完成，开始自动订阅默认主题...')
      
      // 自动订阅默认主题
      if (user) {
        const autoSubscriptions = [
          '/user/queue/messages',
          `/topic/org/${user.oid}`,
          '/topic/system'
        ]
        
        autoSubscriptions.forEach((destination) => {
          try {
            const subscription = stompClient.subscribe(destination, (message) => {
              console.log(`收到自动订阅消息 [${destination}]:`, message.body)
              addReceivedMessage(destination, message.headers, message.body)
            })
            
            addSubscription(destination, subscription)
            console.log(`✓ 自动订阅成功: ${destination}`)
          } catch (error) {
            console.error(`✗ 自动订阅失败 [${destination}]:`, error)
          }
        })
        
        console.log('自动订阅完成，可以开始手动订阅其他主题和测试')
      } else {
        console.log('用户信息不存在，跳过自动订阅')
      }
    }
    
    stompClient.onStompError = (frame) => {
      console.error('STOMP错误:', frame)
      setConnectionError(`STOMP错误: ${frame.headers.message}`)
      setIsConnected(false)
      setIsConnecting(false)
    }
    
    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket错误:', error)
      setConnectionError('WebSocket连接错误')
      setIsConnected(false)
      setIsConnecting(false)
    }
    
    stompClient.onDisconnect = () => {
      console.log('STOMP连接断开')
      setIsConnected(false)
      setIsConnecting(false)
      setSubscriptions([])
    }
    
    clientRef.current = stompClient
    setClient(stompClient)
    
    return stompClient
  }
  

  
  // 添加订阅记录
  const addSubscription = (destination: string, subscription: StompSubscription) => {
    const sub: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      destination,
      subscription,
      timestamp: new Date().toLocaleTimeString()
    }
    setSubscriptions(prev => [...prev, sub])
  }
  
  // 添加接收到的消息
  const addReceivedMessage = (destination: string, headers: Record<string, string>, body: string) => {
    let parsed: CommonStompMessage | undefined
    try {
      parsed = JSON.parse(body) as CommonStompMessage
    } catch {
      // 不是JSON格式的消息，忽略解析错误
    }
    
    const message: ReceivedMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      destination,
      timestamp: new Date().toLocaleString(),
      headers,
      body,
      parsed
    }
    
    setReceivedMessages(prev => [message, ...prev])
  }
  
  // 连接STOMP
  const handleConnect = () => {
    if (!user) {
      alert('请先登录')
      return
    }
    
    setIsConnecting(true)
    setConnectionError(null)
    
    const stompClient = createStompClient()
    stompClient.activate()
  }
  
  // 断开连接
  const handleDisconnect = () => {
    if (clientRef.current) {
      clientRef.current.deactivate()
    }
  }
  
  // 发送消息
  const handleSendMessage = () => {
    if (!client || !isConnected) {
      alert('请先连接STOMP')
      return
    }
    
    try {
      const headers = sendForm.headers ? JSON.parse(sendForm.headers) : {}
      client.publish({
        destination: sendForm.destination,
        body: sendForm.body,
        headers
      })
      
      console.log('消息已发送:', {
        destination: sendForm.destination,
        body: sendForm.body,
        headers
      })
      
      alert('消息发送成功')
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送消息失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
  
  // 手动订阅
  const handleSubscribe = () => {
    if (!client || !isConnected) {
      alert('请先连接STOMP')
      return
    }
    
    const subscription = client.subscribe(subscribeForm.destination, (message) => {
      console.log('收到订阅消息:', message.body)
      addReceivedMessage(subscribeForm.destination, message.headers, message.body)
    })
    
    addSubscription(subscribeForm.destination, subscription)
    setSubscribeForm({ destination: "" })
  }
  
  // 取消订阅
  const handleUnsubscribe = (sub: Subscription) => {
    sub.subscription.unsubscribe()
    setSubscriptions(prev => prev.filter(s => s.id !== sub.id))
  }
  
  // 清空消息
  const handleClearMessages = () => {
    setReceivedMessages([])
  }
  
  // 复制消息内容
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  }

  // 格式化JSON，如果不是有效JSON则返回原始内容
  const formatJsonMessage = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return content
    }
  }
  
  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
    }
  }, [])
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 text-slate-400 mx-auto" />
            <h3 className="text-xl font-semibold">请先登录</h3>
            <p className="text-slate-600">需要登录后才能使用STOMP测试功能</p>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">STOMP WebSocket 测试</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          测试与 message-service 的 STOMP 连接和消息收发
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          连接建立后，需要手动订阅主题才能接收消息
        </p>
      </div>
      
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            连接状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  状态: {' '}
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "已连接" : isConnecting ? "连接中..." : "未连接"}
                  </Badge>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  用户: {user.username} (ID: {user.uid})
                </p>
                <p className="text-sm text-slate-600">
                  组织: {user.orgName} (ID: {user.oid})
                </p>
                <p className="text-sm text-slate-600">
                  服务地址: ws://192.168.1.222:8082/message-service/ws
                </p>
                {isConnected && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ 连接已建立，可以开始订阅主题和收发消息
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!isConnected ? (
                  <Button onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    连接
                  </Button>
                ) : (
                  <Button onClick={handleDisconnect} variant="destructive">
                    断开连接
                  </Button>
                )}
              </div>
            </div>
            
            {connectionError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">连接错误</span>
                </div>
                <p className="text-sm mt-1">{connectionError}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Send Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                发送消息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="destination">目标地址 (Destination)</Label>
                <Input
                  id="destination"
                  value={sendForm.destination}
                  onChange={(e) => setSendForm(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="/app/test"
                />
              </div>
              
              <div>
                <Label htmlFor="headers">消息头 (Headers) - JSON格式</Label>
                <Textarea
                  id="headers"
                  value={sendForm.headers}
                  onChange={(e) => setSendForm(prev => ({ ...prev, headers: e.target.value }))}
                  placeholder='{"content-type": "application/json"}'
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="body">消息体 (Body)</Label>
                <Textarea
                  id="body"
                  value={sendForm.body}
                  onChange={(e) => setSendForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="消息内容"
                  rows={6}
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
          
          {/* Manual Subscribe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                订阅主题
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                手动订阅主题以接收消息推送
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={subscribeForm.destination}
                  onChange={(e) => setSubscribeForm({ destination: e.target.value })}
                  placeholder="/topic/test"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubscribe} 
                  disabled={!isConnected || !subscribeForm.destination}
                >
                  订阅
                </Button>
              </div>
              
              {/* 快捷订阅按钮 */}
              {user && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">快捷订阅（基于当前用户）：</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSubscribeForm({ destination: `/topic/user/${user.uid}/notifications` })}
                    >
                      用户通知
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSubscribeForm({ destination: `/topic/org/${user.oid}/announcements` })}
                    >
                      组织公告
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSubscribeForm({ destination: `/user/queue/welcome` })}
                    >
                      欢迎消息
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSubscribeForm({ destination: `/topic/test` })}
                    >
                      测试主题
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Active Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                当前订阅
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-slate-500 text-center py-4">暂无订阅</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div>
                        <p className="font-medium text-sm">{sub.destination}</p>
                        <p className="text-xs text-slate-500">{sub.timestamp}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnsubscribe(sub)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Messages */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                接收到的消息 ({receivedMessages.length})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearMessages}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                清空
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[750px]">
              {receivedMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无消息</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedMessages.map((message) => (
                    <div key={message.id} className="border rounded-md p-3 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {message.destination}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {message.timestamp}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyMessage(message.body)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Tabs defaultValue="formatted" className="mt-2">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="formatted">格式化</TabsTrigger>
                          <TabsTrigger value="raw">原始</TabsTrigger>
                          <TabsTrigger value="headers">头部</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="formatted" className="mt-2">
                          {message.parsed ? (
                            <div className="space-y-2 text-sm">
                              <div><strong>消息ID:</strong> {message.parsed.messageId}</div>
                              <div><strong>时间戳:</strong> {message.parsed.timestamp}</div>
                              <div><strong>消息类型:</strong> {message.parsed.messageType}</div>
                              <div><strong>子类型1:</strong> {message.parsed.subType_1}</div>
                              <div><strong>子类型2:</strong> {message.parsed.subType_2}</div>
                              <div><strong>载荷:</strong></div>
                              <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto min-h-[100px] whitespace-pre-wrap">
                                {JSON.stringify(message.parsed.payload, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto min-h-[120px] whitespace-pre-wrap">
                              {formatJsonMessage(message.body)}
                            </pre>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="raw" className="mt-2">
                          <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto min-h-[120px] whitespace-pre-wrap">
                            {formatJsonMessage(message.body)}
                          </pre>
                        </TabsContent>
                        
                        <TabsContent value="headers" className="mt-2">
                          <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto min-h-[100px] whitespace-pre-wrap">
                            {JSON.stringify(message.headers, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 