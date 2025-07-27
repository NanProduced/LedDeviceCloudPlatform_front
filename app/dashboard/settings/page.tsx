'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">系统设置</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理系统配置和个人设置</p>
      </div>
      
      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            设置页面
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">设置功能</h3>
            <p className="text-slate-600 dark:text-slate-400">此功能正在开发中，敬请期待...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}