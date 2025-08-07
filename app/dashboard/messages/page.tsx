/**
 * 实时消息页面
 * 
 * 负责展示实时消息模块的内容，包括：
 * - 消息统计卡片
 * - 消息筛选器
 * - 消息列表
 * - 批量操作
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Check,
  Trash2
} from 'lucide-react';
import { MessageAPI, RealtimeMessageResponse, PageResponse } from '@/lib/api/message';
import { useMessageCenterWebSocket } from '@/lib/api/messageCenter';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 消息统计数据
 */
interface MessageStats {
  unread: number;
  device: number;
  task: number;
  system: number;
}

/**
 * 筛选参数
 */
interface FilterParams {
  messageType?: string;
  onlyUnread: boolean;
  searchKeyword: string;
}

/**
 * 实时消息页面组件
 */
export default function MessagesPage() {
  const { acknowledgeMessage, batchAcknowledgeMessages, isConnected } = useMessageCenterWebSocket();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<MessageStats>({
    unread: 0,
    device: 0,
    task: 0,
    system: 0
  });
  const [messages, setMessages] = useState<RealtimeMessageResponse[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  
  // 筛选参数
  const [filters, setFilters] = useState<FilterParams>({
    onlyUnread: false,
    searchKeyword: ''
  });

  /**
   * 加载消息统计
   */
  const loadMessageStats = useCallback(async () => {
    try {
      const [unreadCount, countByType] = await Promise.all([
        MessageAPI.realtime.getUnreadCount(),
        MessageAPI.realtime.getUnreadCountByType()
      ]);

      setStats({
        unread: unreadCount,
        device: countByType['DEVICE_STATUS'] || 0,
        task: countByType['TASK_PROGRESS'] || 0,
        system: countByType['SYSTEM_NOTIFICATION'] || 0
      });
    } catch (error) {
      console.error('加载消息统计失败:', error);
    }
  }, []);

  /**
   * 加载消息列表
   */
  const loadMessages = useCallback(async (page = 1, reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    try {
      const response = await MessageAPI.realtime.getMessageList({
        pageNum: page,
        pageSize: pagination.pageSize,
        sortField: 'timestamp',
        sortOrder: 'desc',
        params: {
          messageType: filters.messageType,
          onlyUnread: filters.onlyUnread
        }
      });

      if (reset || page === 1) {
        setMessages(response.records);
      } else {
        setMessages(prev => [...prev, ...response.records]);
      }

      setPagination({
        pageNum: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('加载消息列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, pagination.pageSize, filters]);

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMessageStats(),
        loadMessages(1, true)
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadMessageStats, loadMessages]);

  /**
   * 标记消息为已读（通过STOMP）
   */
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // 通过STOMP发送ACK确认
      await acknowledgeMessage(messageId);
      
      // 更新本地状态
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true } // 假设API响应中有isRead字段
          : msg
      ));
      
      // 刷新统计
      await loadMessageStats();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }, [acknowledgeMessage, loadMessageStats]);

  /**
   * 批量标记已读
   */
  const batchMarkAsRead = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    
    try {
      // 批量发送STOMP ACK
      await batchAcknowledgeMessages(Array.from(selectedMessages));
      
      // 清空选择
      setSelectedMessages(new Set());
      
      // 刷新数据
      await refreshData();
    } catch (error) {
      console.error('批量标记已读失败:', error);
    }
  }, [selectedMessages, batchAcknowledgeMessages, refreshData]);

  /**
   * 切换消息选择状态
   */
  const toggleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = useCallback(() => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
  }, [selectedMessages.size, messages]);

  /**
   * 获取消息级别的样式
   */
  const getLevelStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  /**
   * 获取消息类型的图标
   */
  const getTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'DEVICE_STATUS':
        return <AlertCircle className="w-4 h-4" />;
      case 'TASK_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'SYSTEM_NOTIFICATION':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  /**
   * 处理筛选变化
   */
  const handleFilterChange = useCallback((key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 重新加载第一页数据
    loadMessages(1, true);
  }, [loadMessages]);

  // 初始化加载
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">实时消息</h1>
        <p className="text-muted-foreground">
          管理和查看实时消息通知
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">未读消息</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">设备消息</p>
                <p className="text-2xl font-bold text-blue-600">{stats.device}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">任务消息</p>
                <p className="text-2xl font-bold text-green-600">{stats.task}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">系统消息</p>
                <p className="text-2xl font-bold text-purple-600">{stats.system}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索消息内容..."
                  value={filters.searchKeyword}
                  onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 类型筛选 */}
            <Select 
              value={filters.messageType || 'all'} 
              onValueChange={(value) => handleFilterChange('messageType', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="消息类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="DEVICE_STATUS">设备状态</SelectItem>
                <SelectItem value="TASK_PROGRESS">任务进度</SelectItem>
                <SelectItem value="SYSTEM_NOTIFICATION">系统通知</SelectItem>
              </SelectContent>
            </Select>

            {/* 已读/未读筛选 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="only-unread"
                checked={filters.onlyUnread}
                onCheckedChange={(checked) => handleFilterChange('onlyUnread', checked)}
              />
              <label htmlFor="only-unread" className="text-sm font-medium">
                只看未读
              </label>
            </div>

            {/* 刷新按钮 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {/* 批量操作 */}
          {selectedMessages.size > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedMessages.size} 条消息
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={batchMarkAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    标记已读
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedMessages(new Set())}>
                    取消选择
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 消息列表 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">消息列表</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedMessages.size === messages.length && messages.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedMessages.has(message.id) ? 'bg-muted border-primary' : ''
                }`}
                onClick={() => toggleMessageSelection(message.id)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedMessages.has(message.id)}
                    onChange={() => {}} // 由父容器处理
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(message.messageType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium truncate">
                        {message.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getLevelStyle(message.level)}`}
                      >
                        {message.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.timestamp), { 
                          addSuffix: true,
                          locale: zhCN 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(message.id);
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无消息数据</p>
              </div>
            )}
          </div>

          {/* 加载更多 */}
          {pagination.pageNum < pagination.totalPages && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => loadMessages(pagination.pageNum + 1)}
                disabled={loading}
              >
                {loading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
