/**
 * 消息中心主页面
 * 
 * 提供消息中心的整体布局和导航，包括：
 * - 顶部标题和操作栏
 * - 子模块标签页（实时消息、广播通知、任务列表）
 * - 子页面内容展示
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, List, RefreshCw, Settings } from 'lucide-react';
import { useMessageCenterWebSocket } from '@/lib/api/messageCenter';
import { useMessages } from '@/hooks/useWebSocket';
import RealtimeMessagesContent from './components/RealtimeMessagesContent';
import BroadcastNotificationsContent from './components/BroadcastNotificationsContent';
import TaskListContent from './components/TaskListContent';

/**
 * 消息中心主页面组件
 */
export default function MessageCenterPage() {
  const { isConnected, websocket } = useMessageCenterWebSocket();
  const { unreadCount } = useMessages();
  const connectionState = websocket?.connectionState || 'DISCONNECTED';

  /**
   * 刷新所有数据
   */
  const handleRefreshAll = () => {
    // 触发所有子组件的数据刷新
    window.dispatchEvent(new CustomEvent('refreshMessageCenter'));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">消息中心</h1>
          <p className="text-muted-foreground">
            管理实时消息、广播通知和任务状态
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 连接状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {connectionState}
            </span>
          </div>

          {/* 未读消息总数 */}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount} 条未读
            </Badge>
          )}

          {/* 操作按钮 */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshAll}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <Card className="w-full">
        <Tabs defaultValue="realtime" className="w-full">
          {/* 标签页导航 */}
          <div className="border-b px-6 pt-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="realtime" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>实时消息</span>
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>广播通知</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>任务列表</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            <TabsContent value="realtime" className="space-y-4 mt-0">
              <RealtimeMessagesContent />
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-4 mt-0">
              <BroadcastNotificationsContent />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-0">
              <TaskListContent />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}