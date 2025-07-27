"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive, ArrowLeft, Download } from "lucide-react"

const storageStats = {
  totalSpace: "1 TB",
  usedSpace: "256.7 GB",
  availableSpace: "767.3 GB",
  usagePercentage: 25.67,
  fileTypeBreakdown: [
    { type: "视频", size: "180.2 GB", percentage: 70.2, color: "bg-blue-500" },
    { type: "图片", size: "45.8 GB", percentage: 17.8, color: "bg-green-500" },
    { type: "音频", size: "28.3 GB", percentage: 11.0, color: "bg-purple-500" },
    { type: "其他", size: "2.4 GB", percentage: 1.0, color: "bg-gray-500" },
  ],
}

export default function StorageStatistics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">存储统计</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">查看存储使用情况和统计信息</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="outline" size="sm">
              文件浏览
            </Button>
          </Link>
          <Link href="/file-management/upload">
            <Button variant="outline" size="sm">
              文件上传
            </Button>
          </Link>
          <Link href="/file-management/transcode">
            <Button variant="outline" size="sm">
              转码管理
            </Button>
          </Link>
          <Button variant="default" size="sm">
            存储统计
          </Button>
        </div>

        {/* Storage Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-green-600" />
                存储使用情况
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">总使用量</span>
                  <span className="text-sm font-medium">
                    {storageStats.usedSpace} / {storageStats.totalSpace}
                  </span>
                </div>
                <Progress value={storageStats.usagePercentage} className="h-3" />
                <p className="text-xs text-slate-500 mt-1">剩余可用空间：{storageStats.availableSpace}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">文件类型占比</h4>
                {storageStats.fileTypeBreakdown.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        <span className="text-sm">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{type.size}</span>
                        <span className="text-xs text-slate-500 ml-2">{type.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={type.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">存储统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">总文件数</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">文件夹数</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">本月上传</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">转码任务</span>
                  <span className="font-semibold">23</span>
                </div>
              </div>

              <Button className="w-full gap-2 mt-4">
                <Download className="w-4 h-4" />
                导出存储报告
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
