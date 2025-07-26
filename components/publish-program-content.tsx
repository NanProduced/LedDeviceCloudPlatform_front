"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Send, Target, Monitor } from "lucide-react"

const mockPrograms = [
  {
    id: 1,
    name: "春节宣传节目",
    duration: "00:05:30",
    status: "published",
    scenes: 5,
    thumbnail: "/placeholder.svg?height=80&width=120",
  },
  {
    id: 2,
    name: "企业文化宣传",
    duration: "00:08:15",
    status: "playing",
    scenes: 8,
    thumbnail: "/placeholder.svg?height=80&width=120",
  },
]

const mockDevices = [
  { id: 1, name: "大厅LED屏-001", location: "一楼大厅", status: "online", group: "大厅组" },
  { id: 2, name: "会议室屏幕-A", location: "三楼会议室A", status: "online", group: "会议室组" },
  { id: 3, name: "展厅LED屏-002", location: "二楼展厅", status: "offline", group: "展厅组" },
  { id: 4, name: "办公区屏幕-B1", location: "二楼办公区", status: "online", group: "办公组" },
  { id: 5, name: "接待处屏幕", location: "一楼接待", status: "online", group: "大厅组" },
]

export default function PublishProgramContent() {
  const [selectedDevices, setSelectedDevices] = useState<Set<number>>(new Set())

  const handleDeviceSelect = (deviceId: number) => {
    const newSelected = new Set(selectedDevices)
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId)
    } else {
      newSelected.add(deviceId)
    }
    setSelectedDevices(newSelected)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">已发布</Badge>
      case "playing":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">播放中</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDeviceStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">在线</Badge>
      case "offline":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">离线</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">节目发布</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">将节目发布到指定的LED设备</p>
      </div>

      {/* Publish Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 节目选择 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              选择节目
            </CardTitle>
            <CardDescription>选择要发布的节目内容</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <img
                    src={program.thumbnail || "/placeholder.svg"}
                    alt={program.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{program.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{program.duration}</span>
                      <span>{program.scenes} 场景</span>
                      {getStatusBadge(program.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 设备选择 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              目标设备
            </CardTitle>
            <CardDescription>选择要发布到的LED设备</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDevices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDevices.has(device.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => handleDeviceSelect(device.id)}
                >
                  <Checkbox checked={selectedDevices.has(device.id)} onChange={() => handleDeviceSelect(device.id)} />
                  <Monitor className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{device.name}</h4>
                      {getDeviceStatusBadge(device.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {device.location} • {device.group}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">已选择 {selectedDevices.size} 台设备</span>
                <Button size="sm" variant="outline">
                  全选
                </Button>
              </div>
              <Button className="w-full gap-2">
                <Send className="w-4 h-4" />
                立即发布
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
