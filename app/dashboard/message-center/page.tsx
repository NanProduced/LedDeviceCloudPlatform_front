/**
 * 消息中心概览页面
 * 
 * 提供消息中心的概览信息，包括：
 * - 各模块统计汇总
 * - 快速访问链接
 * - 最新消息预览
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  MessageSquare, 
  List, 
  RefreshCw, 
  ArrowRight,
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  Building
} from 'lucide-react';
import { useMessageCenterWebSocket } from '@/lib/api/messageCenter';
import { useMessages } from '@/hooks/useWebSocket';
import { MessageAPI } from '@/lib/api/message';

import Link from 'next/link';

/**
 * 概览统计数据
 */
interface OverviewStats {
  realtime: {
    total: number;
    unread: number;
    device: number;
    task: number;
    system: number;
  };
  broadcast: {
    total: number;
    unread: number;
    system: number;
    org: number;
  };
  tasks: {
    total: number;
    running: number;
    success: number;
    failed: number;
    pending: number;
  };
}

/**
 * 消息中心概览页面组件
 */
export default function MessageCenterPage() {
  const { isConnected, websocket } = useMessageCenterWebSocket();
  const { unreadCount } = useMessages();
  const connectionState = websocket?.connectionState || 'DISCONNECTED';

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OverviewStats>({
    realtime: { total: 0, unread: 0, device: 0, task: 0, system: 0 },
    broadcast: { total: 0, unread: 0, system: 0, org: 0 },
    tasks: { total: 0, running: 0, success: 0, failed: 0, pending: 0 }
  });

  /**
   * 加载概览统计
   */
  const loadOverviewStats = useCallback(async () => {
    setLoading(true);
    try {
      const [
        realtimeUnread,
        realtimeCountByType,
        broadcastUnread,
        taskStats
      ] = await Promise.all([
        MessageAPI.realtime.getUnreadCount(),
        MessageAPI.realtime.getUnreadCountByType(),
        MessageAPI.broadcast.getUnreadCount(),
        MessageAPI.task.getTaskStatistics()
      ]);

      setStats({
        realtime: {
          total: Object.values(realtimeCountByType).reduce((sum, count) => sum + count, 0),
          unread: realtimeUnread,
          device: realtimeCountByType['DEVICE_STATUS'] || 0,
          task: realtimeCountByType['TASK_PROGRESS'] || 0,
          system: realtimeCountByType['SYSTEM_NOTIFICATION'] || 0
        },
        broadcast: {
          total: 5, // Mock数据
          unread: broadcastUnread,
          system: 3, // Mock数据
          org: 2 // Mock数据
        },
        tasks: {
          total: taskStats.total || 0,
          running: taskStats.RUNNING || 0,
          success: taskStats.SUCCESS || 0,
          failed: taskStats.FAILED || 0,
          pending: taskStats.PENDING || 0
        }
      });
    } catch (error) {
      console.error('加载概览统计失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   */
  const refreshData = useCallback(() => {
    loadOverviewStats();
  }, [loadOverviewStats]);

  // 初始化加载
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和状态栏 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">消息中心</h1>
          <p className="text-muted-foreground">
            统一管理实时消息、广播通知和任务状态
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

          {/* 刷新按钮 */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 快速导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 实时消息模块 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-orange-500" />
              实时消息
            </CardTitle>
            <Link href="/dashboard/message-center/realtime-messages">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {stats.realtime.unread}
                </span>
                <span className="text-sm text-muted-foreground">未读消息</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-medium text-blue-600">{stats.realtime.device}</p>
                  <p className="text-muted-foreground">设备</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-600">{stats.realtime.task}</p>
                  <p className="text-muted-foreground">任务</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-purple-600">{stats.realtime.system}</p>
                  <p className="text-muted-foreground">系统</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 广播通知模块 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bell className="w-4 h-4 mr-2 text-blue-500" />
              广播通知
            </CardTitle>
            <Link href="/dashboard/message-center/broadcast-notifications">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {stats.broadcast.unread}
                </span>
                <span className="text-sm text-muted-foreground">未读通知</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-medium text-purple-600">{stats.broadcast.system}</p>
                  <p className="text-muted-foreground">系统通知</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-blue-600">{stats.broadcast.org}</p>
                  <p className="text-muted-foreground">组织通知</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 任务列表模块 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <List className="w-4 h-4 mr-2 text-green-500" />
              任务列表
            </CardTitle>
            <Link href="/dashboard/message-center/task-list">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {stats.tasks.running}
                </span>
                <span className="text-sm text-muted-foreground">进行中</span>
              </div>
              
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center">
                  <p className="font-medium text-green-600">{stats.tasks.success}</p>
                  <p className="text-muted-foreground">完成</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-yellow-600">{stats.tasks.pending}</p>
                  <p className="text-muted-foreground">等待</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-red-600">{stats.tasks.failed}</p>
                  <p className="text-muted-foreground">失败</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-600">{stats.tasks.total}</p>
                  <p className="text-muted-foreground">总计</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 统计汇总 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">未读消息</p>
                <p className="text-xl font-bold text-orange-600">{stats.realtime.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">未读通知</p>
                <p className="text-xl font-bold text-blue-600">{stats.broadcast.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">进行中任务</p>
                <p className="text-xl font-bold text-blue-600">{stats.tasks.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">已完成任务</p>
                <p className="text-xl font-bold text-green-600">{stats.tasks.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">失败任务</p>
                <p className="text-xl font-bold text-red-600">{stats.tasks.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <List className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">总任务数</p>
                <p className="text-xl font-bold text-gray-600">{stats.tasks.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/message-center/realtime-messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                查看实时消息
              </Button>
            </Link>
            
            <Link href="/dashboard/message-center/broadcast-notifications">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                查看广播通知
              </Button>
            </Link>
            
            <Link href="/dashboard/message-center/task-list">
              <Button variant="outline" className="w-full justify-start">
                <List className="w-4 h-4 mr-2" />
                查看任务列表
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}