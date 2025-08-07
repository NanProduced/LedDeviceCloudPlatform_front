/**
 * 广播通知内容组件
 * 
 * 负责展示广播通知模块的内容，包括：
 * - 通知统计卡片
 * - 通知筛选器
 * - 通知列表
 * - 通知详情查看
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  FileText,
  Search,
  RefreshCw,
  Check,
  Eye,
  Users,
  Building,
  Calendar
} from 'lucide-react';
import { MessageAPI, BroadcastMessageResponse, PageResponse } from '@/lib/api/message';
import { useMessageCenterWebSocket } from '@/lib/api/messageCenter';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 通知统计数据
 */
interface NotificationStats {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
}

/**
 * 筛选参数
 */
interface FilterParams {
  messageType?: string;
  scope?: 'SYSTEM' | 'ORG';
  onlyUnread: boolean;
  searchKeyword: string;
}

/**
 * 广播通知内容组件
 */
export default function BroadcastNotificationsContent() {
  const { acknowledgeMessage, batchAcknowledgeMessages, isConnected } = useMessageCenterWebSocket();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    published: 0,
    scheduled: 0,
    draft: 0
  });
  const [notifications, setNotifications] = useState<BroadcastMessageResponse[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  
  // 详情对话框
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    notification: BroadcastMessageResponse | null;
  }>({
    open: false,
    notification: null
  });
  
  // 筛选参数
  const [filters, setFilters] = useState<FilterParams>({
    onlyUnread: false,
    searchKeyword: ''
  });

  /**
   * 加载通知统计
   */
  const loadNotificationStats = useCallback(async () => {
    try {
      const [unreadCount, countByType] = await Promise.all([
        MessageAPI.broadcast.getUnreadCount(),
        MessageAPI.broadcast.getUnreadCountByType()
      ]);

      // Mock统计数据 - 实际应该从API获取
      setStats({
        total: 5,
        published: 3,
        scheduled: 1,
        draft: 1
      });
    } catch (error) {
      console.error('加载通知统计失败:', error);
    }
  }, []);

  /**
   * 加载通知列表
   */
  const loadNotifications = useCallback(async (page = 1, reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    try {
      const response = await MessageAPI.broadcast.getMessageList({
        pageNum: page,
        pageSize: pagination.pageSize,
        sortField: 'timestamp',
        sortOrder: 'desc',
        params: {
          messageType: filters.messageType,
          scope: filters.scope,
          onlyUnread: filters.onlyUnread
        }
      });

      if (reset || page === 1) {
        setNotifications(response.records);
      } else {
        setNotifications(prev => [...prev, ...response.records]);
      }

      setPagination({
        pageNum: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('加载通知列表失败:', error);
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
        loadNotificationStats(),
        loadNotifications(1, true)
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadNotificationStats, loadNotifications]);

  /**
   * 标记通知为已读（通过STOMP）
   */
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // 通过STOMP发送ACK确认
      await acknowledgeMessage(messageId);
      
      // 更新本地状态
      setNotifications(prev => prev.map(notification => 
        notification.messageId === messageId 
          ? { ...notification, isRead: true }
          : notification
      ));
      
      // 刷新统计
      await loadNotificationStats();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }, [acknowledgeMessage, loadNotificationStats]);

  /**
   * 查看通知详情
   */
  const viewNotificationDetail = useCallback(async (notification: BroadcastMessageResponse) => {
    try {
      // 如果未读，先标记为已读
      if (!notification.isRead) {
        await markAsRead(notification.messageId);
      }
      
      // 获取详细信息
      const detail = await MessageAPI.broadcast.getMessageDetail(notification.messageId);
      
      setDetailDialog({
        open: true,
        notification: detail
      });
    } catch (error) {
      console.error('获取通知详情失败:', error);
    }
  }, [markAsRead]);

  /**
   * 批量标记已读
   */
  const batchMarkAsRead = useCallback(async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      // 批量发送STOMP ACK
      await batchAcknowledgeMessages(Array.from(selectedNotifications));
      
      // 清空选择
      setSelectedNotifications(new Set());
      
      // 刷新数据
      await refreshData();
    } catch (error) {
      console.error('批量标记已读失败:', error);
    }
  }, [selectedNotifications, batchAcknowledgeMessages, refreshData]);

  /**
   * 切换通知选择状态
   */
  const toggleNotificationSelection = useCallback((messageId: string) => {
    setSelectedNotifications(prev => {
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
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.messageId)));
    }
  }, [selectedNotifications.size, notifications]);

  /**
   * 获取消息级别的样式
   */
  const getLevelStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  /**
   * 获取消息范围的图标和文本
   */
  const getScopeInfo = (scope: string) => {
    switch (scope) {
      case 'SYSTEM':
        return { icon: <Building className="w-4 h-4" />, text: '系统通知', color: 'text-purple-600' };
      case 'ORG':
        return { icon: <Users className="w-4 h-4" />, text: '组织通知', color: 'text-blue-600' };
      default:
        return { icon: <Bell className="w-4 h-4" />, text: '通知', color: 'text-gray-600' };
    }
  };

  /**
   * 获取阅读率显示
   */
  const getReadingRate = (notification: BroadcastMessageResponse) => {
    // Mock数据 - 实际应该从API获取
    const mockRate = Math.floor(Math.random() * 40) + 60; // 60-100%
    return `${mockRate}%`;
  };

  /**
   * 处理筛选变化
   */
  const handleFilterChange = useCallback((key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 重新加载第一页数据
    loadNotifications(1, true);
  }, [loadNotifications]);

  // 初始化加载
  useEffect(() => {
    refreshData();
  }, []);

  // 监听全局刷新事件
  useEffect(() => {
    const handleRefresh = () => refreshData();
    window.addEventListener('refreshMessageCenter', handleRefresh);
    return () => window.removeEventListener('refreshMessageCenter', handleRefresh);
  }, [refreshData]);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">总通知数</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">已发布</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">定时发布</p>
                <p className="text-2xl font-bold text-orange-600">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">草稿</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
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
                  placeholder="搜索通知标题或内容..."
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
                <SelectValue placeholder="通知类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="SYSTEM_MAINTENANCE">系统维护</SelectItem>
                <SelectItem value="FEATURE_RELEASE">功能发布</SelectItem>
                <SelectItem value="DEVICE_UPGRADE">设备升级</SelectItem>
                <SelectItem value="TRAINING">培训通知</SelectItem>
                <SelectItem value="SECURITY">安全提醒</SelectItem>
              </SelectContent>
            </Select>

            {/* 范围筛选 */}
            <Select 
              value={filters.scope || 'all'} 
              onValueChange={(value) => handleFilterChange('scope', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="通知范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部范围</SelectItem>
                <SelectItem value="SYSTEM">系统通知</SelectItem>
                <SelectItem value="ORG">组织通知</SelectItem>
              </SelectContent>
            </Select>

            {/* 已读/未读筛选 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="only-unread-broadcast"
                checked={filters.onlyUnread}
                onCheckedChange={(checked) => handleFilterChange('onlyUnread', checked)}
              />
              <label htmlFor="only-unread-broadcast" className="text-sm font-medium">
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
          {selectedNotifications.size > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedNotifications.size} 条通知
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={batchMarkAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    标记已读
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedNotifications(new Set())}>
                    取消选择
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 通知列表 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">通知列表</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const scopeInfo = getScopeInfo(notification.scope);
              return (
                <div
                  key={notification.messageId}
                  className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                    selectedNotifications.has(notification.messageId) ? 'bg-muted border-primary' : ''
                  } ${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedNotifications.has(notification.messageId)}
                      onCheckedChange={() => toggleNotificationSelection(notification.messageId)}
                    />
                    
                    <div className="flex-shrink-0 mt-1">
                      {scopeInfo.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLevelStyle(notification.level)}`}
                        >
                          {notification.level}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {notification.messageType}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="destructive" className="text-xs">
                            未读
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.content}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className={scopeInfo.color}>
                            {scopeInfo.text}
                          </span>
                          <span>阅读率: {getReadingRate(notification)}</span>
                          <span>
                            {formatDistanceToNow(new Date(notification.timestamp), { 
                              addSuffix: true,
                              locale: zhCN 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewNotificationDetail(notification)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notification.messageId)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {notifications.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无通知数据</p>
              </div>
            )}
          </div>

          {/* 加载更多 */}
          {pagination.pageNum < pagination.totalPages && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => loadNotifications(pagination.pageNum + 1)}
                disabled={loading}
              >
                {loading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 通知详情对话框 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, notification: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>通知详情</DialogTitle>
          </DialogHeader>
          {detailDialog.notification && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {detailDialog.notification.title}
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge 
                    variant="outline" 
                    className={getLevelStyle(detailDialog.notification.level)}
                  >
                    {detailDialog.notification.level}
                  </Badge>
                  <Badge variant="secondary">
                    {detailDialog.notification.messageType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(detailDialog.notification.timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">通知内容</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detailDialog.notification.content}
                </div>
              </div>

              {detailDialog.notification.payload && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">附加信息</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(detailDialog.notification.payload, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}