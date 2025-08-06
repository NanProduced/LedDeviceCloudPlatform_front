'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Bell,
  Search,
  Settings,
  Users,
  Monitor,
  Building2,
  MessageSquare,
  BarChart3,
  Zap,
  Wifi,
  WifiOff,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Shield,
  Database,
  FileText,
  FileVideo,
  Folder,
  Upload,
  RotateCcw,
  HardDrive,
  Plus,
  Send,
  Calendar,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import components for different pages
import UserManagementContent from '@/components/user-management-content';
import DeviceManagementContent from '@/components/device-management-content';
import FileManagementContent from '@/components/file-management-content';
import FileUploadContent from '@/components/file-upload-content';
import TranscodeManagementContent from '@/components/transcode-management-content';
import StorageStatisticsContent from '@/components/storage-statistics-content';
import ProgramManagementContent from '@/components/program-management-content';
import CreateProgramContent from '@/components/create-program-content';
import PublishProgramContent from '@/components/publish-program-content';
import ScheduleManagementContent from '@/components/schedule-management-content';
import UserProfileContent from '@/components/user-profile-content';
import SettingsContent from '@/components/settings-content';

const navigationItems = [
  {
    title: "主控制台",
    icon: Home,
    items: [
      { title: "运营概览", path: "/dashboard", icon: BarChart3 },
      { title: "实时监控", path: "/dashboard/monitor", icon: Monitor },
      { title: "告警中心", path: "/dashboard/alerts", icon: AlertTriangle },
    ],
  },
  {
    title: "用户管理",
    icon: Users,
    items: [
      { title: "用户列表", path: "/dashboard/user-management", icon: Users },
      { title: "角色权限", path: "/dashboard/role-management", icon: Shield },
      { title: "终端组分配", path: "/dashboard/groups", icon: Settings },
    ],
  },
  {
    title: "组织管理",
    icon: Building2,
    items: [
      { title: "组织架构", path: "/dashboard/organization", icon: Building2 },
      { title: "组织配置", path: "/dashboard/org-config", icon: Settings },
      { title: "组织统计", path: "/dashboard/org-stats", icon: BarChart3 },
    ],
  },
  {
    title: "设备管理",
    icon: Monitor,
    items: [
      { title: "设备列表", path: "/dashboard/devices", icon: Monitor },
      { title: "设备监控", path: "/dashboard/device-monitor", icon: Zap },
      { title: "设备配置", path: "/dashboard/device-config", icon: Settings },
    ],
  },
  {
    title: "素材管理",
    icon: FileText,
    items: [
      { title: "素材浏览", path: "/dashboard/file-management", icon: Folder },
      { title: "文件上传", path: "/dashboard/file-management/upload", icon: Upload },
      { title: "转码管理", path: "/dashboard/file-management/transcode", icon: RotateCcw },
      { title: "存储统计", path: "/dashboard/file-management/storage", icon: HardDrive },
    ],
  },
  {
    title: "节目管理",
    icon: FileVideo,
    items: [
      { title: "节目列表", path: "/dashboard/program-management", icon: FileVideo },
      { title: "创建节目", path: "/dashboard/program-management/create", icon: Plus },
      { title: "节目发布", path: "/dashboard/program-management/publish", icon: Send },
      { title: "排程管理", path: "/dashboard/program-management/schedule", icon: Calendar },
    ],
  },
  {
    title: "消息中心",
    icon: MessageSquare,
    items: [
      { title: "实时消息", path: "/dashboard/messages", icon: MessageSquare },
      { title: "广播通知", path: "/dashboard/notifications", icon: Bell },
      { title: "任务列表", path: "/dashboard/tasks", icon: CheckCircle },
    ],
  },
  {
    title: "系统管理",
    icon: Database,
    items: [
      { title: "权限策略", path: "/dashboard/permissions", icon: Shield },
      { title: "系统配置", path: "/dashboard/system-config", icon: Settings },
      { title: "审计日志", path: "/dashboard/audit-logs", icon: FileText },
    ],
  },
];

const deviceStats = [
  { name: "总设备数", value: "1,247", change: "+12%", icon: Monitor, color: "text-blue-600" },
  { name: "在线设备", value: "1,156", change: "+5%", icon: Wifi, color: "text-green-600" },
  { name: "离线设备", value: "91", change: "-8%", icon: WifiOff, color: "text-red-600" },
  { name: "告警数量", value: "23", change: "+3%", icon: AlertTriangle, color: "text-yellow-600" },
];

const recentActivities = [
  { user: "张三", action: "创建了新用户", target: "李四", time: "2分钟前", type: "user" },
  { user: "王五", action: "更新了设备配置", target: "LED-001", time: "5分钟前", type: "device" },
  { user: "赵六", action: "发布了广播消息", target: "全体用户", time: "10分钟前", type: "message" },
  { user: "系统", action: "检测到设备离线", target: "LED-025", time: "15分钟前", type: "alert" },
];

// Dashboard Overview Component
export const DashboardOverview = () => {
  const { user, loading, error } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  
  // 使用用户数据来个性化欢迎消息
  const welcomeMessage = user ? `欢迎回来，${user.username}` : '欢迎回来';
  
  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="text-center text-slate-600">
          正在加载用户信息...
        </div>
      </div>
    );
  }
  
  // 如果有错误，显示错误信息和调试按钮
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">LED云平台</h1>
            <p className="text-red-600 dark:text-red-400 mt-1">
              错误: {error}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('手动重新获取用户信息');
                window.location.reload();
              }}
              variant="outline"
            >
              刷新页面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{welcomeMessage}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            今天是{" "}
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">系统运行正常</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deviceStats.map((stat) => (
          <Card
            key={stat.name}
            className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} 较昨日
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status Chart */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              设备状态趋势
            </CardTitle>
            <CardDescription>过去24小时的设备在线状态变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">在线率</span>
                <span className="text-sm font-medium">92.7%</span>
              </div>
              <Progress value={92.7} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">响应率</span>
                <span className="text-sm font-medium">98.3%</span>
              </div>
              <Progress value={98.3} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">健康度</span>
                <span className="text-sm font-medium">95.1%</span>
              </div>
              <Progress value={95.1} className="h-2" />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">系统运行稳定</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">所有核心服务正常运行，设备连接稳定</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              最近活动
            </CardTitle>
            <CardDescription>系统最新操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "user"
                        ? "bg-blue-500"
                        : activity.type === "device"
                          ? "bg-green-500"
                          : activity.type === "message"
                            ? "bg-purple-500"
                            : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">
              查看全部活动
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快捷入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "添加用户", icon: Users, color: "bg-blue-500", path: "/dashboard/user-management" },
              { name: "设备监控", icon: Monitor, color: "bg-green-500", path: "/dashboard/monitor" },
              { name: "发送通知", icon: Bell, color: "bg-purple-500", path: "/dashboard/notifications" },
              { name: "STOMP调试", icon: MessageSquare, color: "bg-cyan-500", path: "/dashboard/stomp-debug" },
              { name: "系统配置", icon: Settings, color: "bg-orange-500", path: "/dashboard/settings" },
              { name: "查看日志", icon: FileText, color: "bg-red-500", path: "/dashboard/audit-logs" },
                          ].map((action) => (
                <Button
                  key={action.name}
                  variant="ghost"
                  className="h-20 flex-col gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => router.push(action.path)}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.name}</span>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder component for unimplemented pages
const PlaceholderContent = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-96">
    <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">此功能正在开发中，敬请期待...</p>
      </div>
    </Card>
  </div>
);

interface LEDPlatformAppProps {
  children?: React.ReactNode;
}

export default function LEDPlatformApp({ children }: LEDPlatformAppProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, loading, error, fetchUserInfo } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  // 检查认证状态，如果未认证则重定向到登录页
  useEffect(() => {
    if (!loading && !user) {
      // 无用户数据且非加载状态，可能是未认证 - 延迟一点时间以避免闪烁
      const timeout = setTimeout(() => {
        if (!user) {
          // 重定向到OAuth2登录端点
          window.location.href = '/oauth2/authorization/gateway-server?redirect_uri=' + 
            encodeURIComponent(window.location.origin + '/dashboard');
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [user, loading, router]);
  
  // 加载中状态
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-300">加载中...</p>
        </div>
      </div>
    );
  }

  // 认证错误状态
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-red-500">获取用户信息失败</p>
          <button 
            onClick={() => router.push('/login')}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SidebarProvider>
        <Sidebar className="border-r border-slate-200 dark:border-slate-800">
          <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">LED云平台</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">设备管理系统</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-slate-600 dark:text-slate-400 font-medium">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left ${
                              pathname === item.path
                                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                                : ""
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="搜索设备、用户或组织..."
                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Notifications Dropdown */}
                <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-4 h-4" />
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>通知中心</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">设备离线告警</p>
                        <p className="text-xs text-slate-500">LED-025 设备检测离线</p>
                        <p className="text-xs text-slate-400">15分钟前</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">新用户注册</p>
                        <p className="text-xs text-slate-500">用户"李四"已成功注册</p>
                        <p className="text-xs text-slate-400">2分钟前</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-start gap-3 p-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">系统更新</p>
                        <p className="text-xs text-slate-500">系统已成功更新至最新版本</p>
                        <p className="text-xs text-slate-400">1小时前</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-blue-600 font-medium">查看所有通知</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 使用UserAvatar组件显示用户信息和菜单 */}
                <UserAvatar />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
} 