'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  Bell,
  Shield,
  Palette
} from 'lucide-react';

export default function SettingsContent() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: 'zh' | 'en') => {
    setLanguage(value);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">管理您的系统偏好设置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 语言设置 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              语言设置
            </CardTitle>
            <CardDescription>选择您偏好的界面语言</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">界面语言</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">简体中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              更改语言设置将立即生效，影响整个应用界面
            </p>
          </CardContent>
        </Card>

        {/* 主题设置 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              主题设置
            </CardTitle>
            <CardDescription>自定义应用外观主题</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>主题模式</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="flex-col gap-2 h-16">
                  <Sun className="w-4 h-4" />
                  <span className="text-xs">浅色</span>
                </Button>
                <Button variant="outline" className="flex-col gap-2 h-16">
                  <Moon className="w-4 h-4" />
                  <span className="text-xs">深色</span>
                </Button>
                <Button variant="outline" className="flex-col gap-2 h-16">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">跟随系统</span>
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              主题设置功能即将推出
            </p>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              通知设置
            </CardTitle>
            <CardDescription>管理系统通知偏好</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">设备离线通知</p>
                  <p className="text-xs text-slate-500">设备离线时发送通知</p>
                </div>
                <Button variant="outline" size="sm">启用</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">系统更新通知</p>
                  <p className="text-xs text-slate-500">系统更新时发送通知</p>
                </div>
                <Button variant="outline" size="sm">启用</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">任务完成通知</p>
                  <p className="text-xs text-slate-500">批量任务完成时发送通知</p>
                </div>
                <Button variant="outline" size="sm">启用</Button>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              通知设置功能即将推出
            </p>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              安全设置
            </CardTitle>
            <CardDescription>管理账户安全选项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">登录会话管理</p>
                  <p className="text-xs text-slate-500">查看和管理活跃会话</p>
                </div>
                <Button variant="outline" size="sm">管理</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">操作日志</p>
                  <p className="text-xs text-slate-500">查看账户操作历史</p>
                </div>
                <Button variant="outline" size="sm">查看</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">账户锁定</p>
                  <p className="text-xs text-slate-500">临时锁定账户</p>
                </div>
                <Button variant="outline" size="sm">锁定</Button>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              安全管理功能即将推出
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 系统信息 */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            系统信息
          </CardTitle>
          <CardDescription>系统版本和配置信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">应用版本</p>
              <p className="text-sm font-mono">v1.0.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">构建时间</p>
              <p className="text-sm font-mono">{new Date().toISOString().split('T')[0]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">技术栈</p>
              <p className="text-sm">Next.js + TypeScript</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}