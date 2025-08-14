/**
 * 任务列表页面
 * 
 * 负责展示任务列表模块的内容，包括：
 * - 任务统计卡片
 * - 任务筛选器
 * - 任务列表
 * - 任务操作（重试、取消等）
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  List, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader,
  Search,
  RefreshCw,
  Play,
  Square,
  Eye,
  RotateCcw,
  FileText,
  Upload,
  Download,
  Settings
} from 'lucide-react';
import { MessageAPI, TaskInfo, PageResponse } from '@/lib/api/message';
import { useMessageCenterWebSocket } from '@/lib/api/messageCenter';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 任务统计数据
 */
interface TaskStats {
  total: number;
  success: number;
  running: number;
  pending: number;
  failed: number;
}

/**
 * 筛选参数
 */
interface FilterParams {
  type?: string;
  status?: string;
  searchKeyword: string;
}

/**
 * 任务列表页面组件
 */
export default function TasksPage() {
  const { 
    subscribeTaskProgress, 
    unsubscribeTaskProgress, 
    isTaskSubscribed,
    unsubscribeAllTasks 
  } = useMessageCenterWebSocket();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    success: 0,
    running: 0,
    pending: 0,
    failed: 0
  });
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  
  // 详情对话框
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    task: TaskInfo | null;
  }>({
    open: false,
    task: null
  });
  
  // 筛选参数
  const [filters, setFilters] = useState<FilterParams>({
    searchKeyword: ''
  });

  /**
   * 加载任务统计
   */
  const loadTaskStats = useCallback(async () => {
    try {
      const statistics = await MessageAPI.task.getTaskStatistics();
      setStats({
        total: statistics.total || 0,
        success: statistics.SUCCESS || 0,
        running: statistics.RUNNING || 0,
        pending: statistics.PENDING || 0,
        failed: statistics.FAILED || 0
      });
    } catch (error) {
      console.error('加载任务统计失败:', error);
    }
  }, []);

  /**
   * 加载任务列表
   */
  const loadTasks = useCallback(async (page = 1, reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    try {
      const response = await MessageAPI.task.getTaskList({
        pageNum: page,
        pageSize: pagination.pageSize,
        status: filters.status,
        type: filters.type,
        keyword: filters.searchKeyword
      });

      if (reset || page === 1) {
        setTasks(response.records);
      } else {
        setTasks(prev => [...prev, ...response.records]);
      }

      setPagination({
        pageNum: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages
      });

      // 为运行中的任务订阅进度更新
      response.records
        .filter(task => task.status === 'RUNNING')
        .forEach(task => subscribeToTaskProgress(task.id));
        
    } catch (error) {
      console.error('加载任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, pagination.pageSize, filters]);

  /**
   * 订阅任务进度更新
   */
  const subscribeToTaskProgress = useCallback(async (taskId: string) => {
    if (isTaskSubscribed(taskId)) {
      return; // 已经订阅了
    }

    try {
      await subscribeTaskProgress(taskId, (message) => {
        // 处理任务进度更新消息
        if (message.payload && message.payload.taskId === taskId) {
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId 
                ? {
                    ...task,
                    progress: message.payload.progress || task.progress,
                    status: message.payload.status || task.status,
                    estimatedTime: message.payload.estimatedTime || task.estimatedTime
                  }
                : task
            )
          );
        }
      });
    } catch (error) {
      console.error(`订阅任务进度失败 ${taskId}:`, error);
    }
  }, [subscribeTaskProgress, isTaskSubscribed]);

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadTaskStats(),
        loadTasks(1, true)
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadTaskStats, loadTasks]);

  /**
   * 重试任务
   */
  const retryTask = useCallback(async (taskId: string) => {
    try {
      await MessageAPI.task.retryTask(taskId);
      
      // 更新本地状态
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'PENDING', progress: 0, errorMessage: undefined }
          : task
      ));
      
      // 刷新统计
      await loadTaskStats();
    } catch (error) {
      console.error('重试任务失败:', error);
    }
  }, [loadTaskStats]);

  /**
   * 取消任务
   */
  const cancelTask = useCallback(async (taskId: string) => {
    try {
      await MessageAPI.task.cancelTask(taskId);
      
      // 取消订阅
      await unsubscribeTaskProgress(taskId);
      
      // 更新本地状态
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'CANCELLED' }
          : task
      ));
      
      // 刷新统计
      await loadTaskStats();
    } catch (error) {
      console.error('取消任务失败:', error);
    }
  }, [unsubscribeTaskProgress, loadTaskStats]);

  /**
   * 查看任务详情
   */
  const viewTaskDetail = useCallback(async (task: TaskInfo) => {
    try {
      const detail = await MessageAPI.task.getTaskDetail(task.id);
      setDetailDialog({
        open: true,
        task: detail
      });
    } catch (error) {
      console.error('获取任务详情失败:', error);
      // 使用当前任务信息作为详情
      setDetailDialog({
        open: true,
        task
      });
    }
  }, []);

  /**
   * 获取任务状态的样式
   */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 获取任务状态的图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'RUNNING':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'CANCELLED':
        return <Square className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  /**
   * 获取任务类型的图标和文本
   */
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'UPLOAD':
        return { icon: <Upload className="w-4 h-4" />, text: '上传任务', color: 'text-blue-600' };
      case 'TRANSCODE':
        return { icon: <Settings className="w-4 h-4" />, text: '转码任务', color: 'text-purple-600' };
      case 'EXPORT':
        return { icon: <Download className="w-4 h-4" />, text: '导出任务', color: 'text-green-600' };
      case 'DOWNLOAD':
        return { icon: <Download className="w-4 h-4" />, text: '下载任务', color: 'text-orange-600' };
      default:
        return { icon: <FileText className="w-4 h-4" />, text: '任务', color: 'text-gray-600' };
    }
  };

  /**
   * 格式化剩余时间
   */
  const formatEstimatedTime = (seconds?: number) => {
    if (!seconds) return '未知';
    
    if (seconds < 60) {
      return `${seconds}秒`;
    } else if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)}分钟`;
    } else {
      return `${Math.ceil(seconds / 3600)}小时`;
    }
  };

  /**
   * 处理筛选变化
   */
  const handleFilterChange = useCallback((key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 重新加载第一页数据
    loadTasks(1, true);
  }, [loadTasks]);

  // 初始化加载
  useEffect(() => {
    refreshData();
  }, []);

  // 清理订阅
  useEffect(() => {
    return () => {
      // 取消所有任务进度订阅
      unsubscribeAllTasks();
    };
  }, [unsubscribeAllTasks]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">任务列表</h1>
        <p className="text-muted-foreground">
          管理和监控系统任务执行状态
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <List className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">总任务数</p>
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
                <p className="text-sm font-medium text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Loader className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">进行中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">等待中</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">失败</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
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
                  placeholder="搜索任务名称..."
                  value={filters.searchKeyword}
                  onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 类型筛选 */}
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="任务类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="UPLOAD">上传任务</SelectItem>
                <SelectItem value="TRANSCODE">转码任务</SelectItem>
                <SelectItem value="EXPORT">导出任务</SelectItem>
                <SelectItem value="DOWNLOAD">下载任务</SelectItem>
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="任务状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">等待中</SelectItem>
                <SelectItem value="RUNNING">进行中</SelectItem>
                <SelectItem value="SUCCESS">已完成</SelectItem>
                <SelectItem value="FAILED">失败</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
              </SelectContent>
            </Select>

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
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => {
              const typeInfo = getTypeInfo(task.type);
              return (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(task.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium truncate">
                          {task.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusStyle(task.status)}`}
                        >
                          {task.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.text}
                        </Badge>
                      </div>
                      
                      {/* 进度条 */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>进度</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          {task.fileSizeFormatted && (
                            <span>文件大小: {task.fileSizeFormatted}</span>
                          )}
                          <span>
                            创建时间: {formatDistanceToNow(new Date(task.createTime), { 
                              addSuffix: true,
                              locale: zhCN 
                            })}
                          </span>
                          {task.estimatedTime && task.status === 'RUNNING' && (
                            <span>
                              预计剩余: {formatEstimatedTime(task.estimatedTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      {task.errorMessage && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {task.errorMessage}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewTaskDetail(task)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {/* 后端暂不支持重试接口，隐藏该操作 */}
                      
                      {(task.status === 'RUNNING' || task.status === 'PENDING') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => cancelTask(task.id)}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无任务数据</p>
              </div>
            )}
          </div>

          {/* 加载更多 */}
          {pagination.pageNum < pagination.totalPages && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => loadTasks(pagination.pageNum + 1)}
                disabled={loading}
              >
                {loading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 任务详情对话框 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, task: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
          </DialogHeader>
          {detailDialog.task && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {detailDialog.task.name}
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge 
                    variant="outline" 
                    className={getStatusStyle(detailDialog.task.status)}
                  >
                    {detailDialog.task.status}
                  </Badge>
                  <Badge variant="secondary">
                    {getTypeInfo(detailDialog.task.type).text}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">创建时间:</span>
                  <p className="text-muted-foreground">{detailDialog.task.createTime}</p>
                </div>
                <div>
                  <span className="font-medium">进度:</span>
                  <p className="text-muted-foreground">{detailDialog.task.progress}%</p>
                </div>
                {detailDialog.task.fileSizeFormatted && (
                  <div>
                    <span className="font-medium">文件大小:</span>
                    <p className="text-muted-foreground">{detailDialog.task.fileSizeFormatted}</p>
                  </div>
                )}
                {detailDialog.task.estimatedTime && (
                  <div>
                    <span className="font-medium">预计剩余时间:</span>
                    <p className="text-muted-foreground">{formatEstimatedTime(detailDialog.task.estimatedTime)}</p>
                  </div>
                )}
              </div>

              {detailDialog.task.errorMessage && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">错误信息</h4>
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      {detailDialog.task.errorMessage}
                    </div>
                  </div>
                </>
              )}

              {detailDialog.task.parameters && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">任务参数</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(detailDialog.task.parameters, null, 2)}
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
