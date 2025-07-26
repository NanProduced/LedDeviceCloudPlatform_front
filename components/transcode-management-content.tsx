"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RotateCcw, CheckCircle, AlertCircle, Loader, Clock, Play, Pause, Trash2, MoreHorizontal } from "lucide-react"

const transcodeJobs = [
  {
    id: 1,
    fileName: "宣传视频_2024.mp4",
    originalSize: "245.6 MB",
    targetFormat: "H.264 MP4",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T10:30:00",
    endTime: "2024-01-15T10:45:00",
  },
  {
    id: 2,
    fileName: "产品演示.mov",
    originalSize: "512.8 MB",
    targetFormat: "H.264 MP4",
    status: "processing",
    progress: 65,
    startTime: "2024-01-25T16:45:00",
    estimatedTime: "还需15分钟",
  },
  {
    id: 3,
    fileName: "广告片段.avi",
    originalSize: "89.3 MB",
    targetFormat: "H.264 MP4",
    status: "failed",
    progress: 0,
    startTime: "2024-01-24T11:20:00",
    error: "源文件格式不支持",
  },
]

export default function TranscodeManagementContent() {
  const getTranscodeStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "processing":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">转码管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">视频文件转码任务管理和监控</p>
      </div>

      {/* Transcode Content */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            转码管理
          </CardTitle>
          <CardDescription>视频文件转码任务管理和监控</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>文件名</TableHead>
                  <TableHead>原始大小</TableHead>
                  <TableHead>目标格式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>开始时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcodeJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getTranscodeStatusIcon(job.status)}
                        <span className="font-medium">{job.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{job.originalSize}</TableCell>
                    <TableCell>{job.targetFormat}</TableCell>
                    <TableCell>
                      {job.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          已完成
                        </Badge>
                      )}
                      {job.status === "processing" && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          处理中
                        </Badge>
                      )}
                      {job.status === "failed" && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">失败</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={job.progress} className="w-20 h-2" />
                        <span className="text-xs text-slate-500">{job.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {new Date(job.startTime).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {job.status === "processing" && (
                            <DropdownMenuItem className="gap-2">
                              <Pause className="w-4 h-4" />
                              暂停任务
                            </DropdownMenuItem>
                          )}
                          {job.status === "failed" && (
                            <DropdownMenuItem className="gap-2">
                              <Play className="w-4 h-4" />
                              重新转码
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            删除任务
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
