"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageIcon, Settings, Upload, CheckCircle, FileVideo } from "lucide-react"

const mediaAssets = [
  {
    id: 1,
    name: "春节背景视频.mp4",
    type: "video",
    size: "125.6 MB",
    duration: "00:02:30",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: true,
  },
  {
    id: 2,
    name: "公司LOGO.png",
    type: "image",
    size: "2.1 MB",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: false,
  },
  {
    id: 3,
    name: "产品介绍.mp4",
    type: "video",
    size: "89.3 MB",
    duration: "00:01:45",
    thumbnail: "/placeholder.svg?height=60&width=60",
    used: true,
  },
  {
    id: 4,
    name: "背景音乐.mp3",
    type: "audio",
    size: "5.8 MB",
    duration: "00:03:20",
    used: false,
  },
]

export default function CreateProgramContent() {
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set())
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    scenes: [] as any[],
  })

  const handleAssetSelect = (assetId: number) => {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssets(newSelected)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">创建节目</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">使用素材制作新的LED显示节目</p>
      </div>

      {/* Create Program Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 素材库 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-green-600" />
              素材库
            </CardTitle>
            <CardDescription>选择素材制作节目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAssets.has(asset.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => handleAssetSelect(asset.id)}
                >
                  <Checkbox checked={selectedAssets.has(asset.id)} onChange={() => handleAssetSelect(asset.id)} />
                  <img
                    src={asset.thumbnail || "/placeholder.svg?height=40&width=40"}
                    alt={asset.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{asset.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{asset.size}</span>
                      {asset.duration && <span>{asset.duration}</span>}
                    </div>
                  </div>
                  {asset.used && (
                    <Badge variant="secondary" className="text-xs">
                      已使用
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              上传新素材
            </Button>
          </CardContent>
        </Card>

        {/* 节目编辑区 */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              节目编辑
            </CardTitle>
            <CardDescription>制作和编辑节目内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="programName">节目名称</Label>
                <Input
                  id="programName"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  placeholder="请输入节目名称"
                />
              </div>
              <div>
                <Label htmlFor="programDesc">节目描述</Label>
                <Input
                  id="programDesc"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="请输入节目描述"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">场景设置</Label>
              <div className="mt-3 space-y-3">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                  <FileVideo className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    拖拽素材到此处创建场景
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">从左侧素材库选择文件，或直接拖拽到此区域</p>
                  <Button variant="outline">添加场景</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">已选择 {selectedAssets.size} 个素材</div>
              <div className="flex items-center gap-2">
                <Button variant="outline">预览节目</Button>
                <Button className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  保存节目
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
