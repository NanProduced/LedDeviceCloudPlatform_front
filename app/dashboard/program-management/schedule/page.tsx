"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Calendar, Plus, Edit, Eye, Play, Pause, Trash2, MoreHorizontal } from "lucide-react"

const mockSchedules = [
  {
    id: 1,
    name: "工作日播放计划",
    description: "周一至周五的常规播放安排",
    programs: ["春节宣传节目", "企业文化宣传"],
    devices: ["大厅LED屏-001", "接待处屏幕"],
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    timeSlots: [
      { start: "09:00", end: "12:00", program: "企业文化宣传" },
      { start: "13:00", end: "18:00", program: "春节宣传节目" },
    ],
    status: "active",
    priority: "high",
  },
  {
    id: 2,
    name: "周末特殊播放",
    description: "周末展示内容安排",
    programs: ["产品展示节目"],
    devices: ["展厅LED屏-002"],
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    timeSlots: [{ start: "10:00", end: "17:00", program: "产品展示节目" }],
    status: "pending",
    priority: "medium",
  },
]

export default function ScheduleManagement() {
  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">执行中</Badge>
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">待执行</Badge>
        )
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">已过期</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/program-management">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">排程管理</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">创建和管理节目播放计划</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/program-management">
            <Button variant="outline" size="sm">
              节目列表
            </Button>
          </Link>
          <Link href="/program-management/create">
            <Button variant="outline" size="sm">
              创建节目
            </Button>
          </Link>
          <Link href="/program-management/publish">
            <Button variant="outline" size="sm">
              节目发布
            </Button>
          </Link>
          <Button variant="default" size="sm">
            排程管理
          </Button>
        </div>

        {/* Schedule Content */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  排程管理
                </CardTitle>
                <CardDescription>创建和管理节目播放计划</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                新建排程
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>排程名称</TableHead>
                    <TableHead>节目内容</TableHead>
                    <TableHead>目标设备</TableHead>
                    <TableHead>执行时间</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{schedule.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {schedule.programs.map((program, index) => (
                            <Badge key={index} variant="secondary" className="text-xs mr-1">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {schedule.devices.slice(0, 2).map((device, index) => (
                            <div key={index} className="text-sm">
                              {device}
                            </div>
                          ))}
                          {schedule.devices.length > 2 && (
                            <div className="text-xs text-slate-500">+{schedule.devices.length - 2} 更多</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {schedule.startDate} ~ {schedule.endDate}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {schedule.timeSlots.map((slot, index) => (
                              <div key={index}>
                                {slot.start}-{slot.end}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm font-medium ${getPriorityColor(schedule.priority)}`}>
                          {schedule.priority === "high" && "高"}
                          {schedule.priority === "medium" && "中"}
                          {schedule.priority === "low" && "低"}
                        </div>
                      </TableCell>
                      <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
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
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              编辑排程
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              查看详情
                            </DropdownMenuItem>
                            {schedule.status === "pending" && (
                              <DropdownMenuItem className="gap-2">
                                <Play className="w-4 h-4" />
                                立即执行
                              </DropdownMenuItem>
                            )}
                            {schedule.status === "active" && (
                              <DropdownMenuItem className="gap-2">
                                <Pause className="w-4 h-4" />
                                暂停排程
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" />
                              删除排程
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
    </div>
  )
}
