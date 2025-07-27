'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor } from 'lucide-react';

export default function MonitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">实时监控</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">监控系统运行状态和设备状态</p>
      </div>
      
      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600" />
            实时监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">实时监控</h3>
            <p className="text-slate-600 dark:text-slate-400">此功能正在开发中，敬请期待...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}