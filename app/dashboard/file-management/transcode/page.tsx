"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  RotateCcw,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Clock,
  Play,
  Pause,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import TranscodeAPI, { TranscodingTaskInfo, TranscodingTaskQueryRequest } from "@/lib/api/transcode"
import { useWebSocketContext } from "@/contexts/WebSocketContext"
import { MessageType } from "@/lib/websocket/types"

function getStatusBadge(status?: string) {
  const s = (status || '').toUpperCase()
  if (s.includes('COMPLETED')) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">已完成</Badge>
  if (s.includes('FAILED')) return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">失败</Badge>
  if (s.includes('RUN') || s.includes('PROCESS') || s.includes('PENDING')) return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">处理中</Badge>
  return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">未知</Badge>
}

export default function TranscodeManagement() {
  const [loading, setLoading] = React.useState(false)
  const [tasks, setTasks] = React.useState<TranscodingTaskInfo[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [size] = React.useState(20)
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [preset, setPreset] = React.useState<string | undefined>(undefined)
  const [keyword, setKeyword] = React.useState('')
  const { messages } = useWebSocketContext()

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const query: TranscodingTaskQueryRequest = { page, size }
      if (status) query.status = status
      if (preset) query.transcodePreset = preset
      const res = await TranscodeAPI.queryTasks(query)
      setTasks(res.tasks || [])
      setTotal(res.total || 0)
    } catch (e) {
      setTasks([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, size, status, preset])

  React.useEffect(() => { load() }, [load])

  // WebSocket进度更新
  React.useEffect(() => {
    if (!messages || messages.length === 0) return
    const latest = messages[0]
    if (latest.messageType !== MessageType.TRANSCODE_PROGRESS) return
    const payload = latest.payload || {}
    const taskId = payload?.taskId
    const progress = payload?.progress
    const statusStr = payload?.status
    if (!taskId) return
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, progress: typeof progress === 'number' ? progress : t.progress, status: statusStr || t.status } : t))
  }, [messages])

  const filteredTasks = React.useMemo(() => {
    if (!keyword) return tasks
    const k = keyword.toLowerCase()
    return tasks.filter(t =>
      t.taskId.toLowerCase().includes(k) ||
      (t.sourceMaterial?.materialName || '').toLowerCase().includes(k)
    )
  }, [tasks, keyword])

  const getTranscodeStatusIcon = (statusStr?: string) => {
    const s = (statusStr || '').toUpperCase()
    if (s.includes('COMPLETED')) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (s.includes('FAILED')) return <AlertCircle className="w-5 h-5 text-red-600" />
    if (s.includes('RUN') || s.includes('PROCESS') || s.includes('PENDING')) return <Loader className="w-5 h-5 text-blue-600 animate-spin" />
    return <Clock className="w-5 h-5 text-gray-500" />
  }

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">转码管理</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">视频文件转码任务管理和监控</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="outline" size="sm">
              素材管理
            </Button>
          </Link>
          <Link href="/file-management/upload">
            <Button variant="outline" size="sm">
              文件上传
            </Button>
          </Link>
          <Button variant="default" size="sm">
            转码管理
          </Button>
          <Link href="/file-management/storage">
            <Button variant="outline" size="sm">
              存储统计
            </Button>
          </Link>
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
            {/* 过滤器 */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="w-56">
                <Input placeholder="搜索任务ID/文件名" value={keyword} onChange={e => setKeyword(e.target.value)} />
              </div>
              <Select value={status ?? 'ALL'} onValueChange={(v) => setStatus(v === 'ALL' ? undefined : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="PENDING">排队中</SelectItem>
                  <SelectItem value="RUNNING">处理中</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                </SelectContent>
              </Select>
              {/* 预设筛选占位：后续可动态获取预设列表填充 */}
              <Select value={preset ?? 'ALL'} onValueChange={(v) => setPreset(v === 'ALL' ? undefined : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="预设筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部预设</SelectItem>
                  {/* 可在首屏加载时注入真实预设 */}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => { setPage(1); load() }} disabled={loading}>
                {loading ? (<><Loader className="w-4 h-4 mr-2 animate-spin"/>刷新中...</>) : '应用筛选'}
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>任务ID</TableHead>
                    <TableHead>文件名</TableHead>
                    <TableHead>预设</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8"><div className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin"/><span className="text-sm text-slate-500">加载中...</span></div></TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-slate-500">暂无任务</TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.taskId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="font-mono text-xs">{task.taskId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getTranscodeStatusIcon(task.status)}
                            <span className="font-medium">{task.sourceMaterial?.materialName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{task.transcodePreset || '-'}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress ?? 0} className="w-20 h-2" />
                            <span className="text-xs text-slate-500">{task.progress ?? 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {task.createTime ? new Date(task.createTime).toLocaleString('zh-CN') : '-'}
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
                              {((task.status || '').toUpperCase().includes('RUN') || (task.status || '').toUpperCase().includes('PENDING')) && (
                                <DropdownMenuItem className="gap-2">
                                  <Pause className="w-4 h-4" />
                                  暂停任务（占位）
                                </DropdownMenuItem>
                              )}
                              {((task.status || '').toUpperCase().includes('FAILED')) && (
                                <DropdownMenuItem className="gap-2" onClick={() => {
                                  if (task.sourceMaterial?.materialId) {
                                    const event = new CustomEvent('open-transcode-dialog', { detail: { mid: task.sourceMaterial.materialId } })
                                    window.dispatchEvent(event)
                                  }
                                }}>
                                  <Play className="w-4 h-4" />
                                  重新转码
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                删除任务（占位）
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
