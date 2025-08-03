"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Plus, ArrowLeft } from "lucide-react"

export default function FileUpload() {
  const [selectedFolderName] = useState("根目录")

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">文件上传</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">上传和管理您的媒体文件</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="outline" size="sm">
              素材管理
            </Button>
          </Link>
          <Button variant="default" size="sm">
            文件上传
          </Button>
          <Link href="/file-management/transcode">
            <Button variant="outline" size="sm">
              转码管理
            </Button>
          </Link>
          <Link href="/file-management/storage">
            <Button variant="outline" size="sm">
              存储统计
            </Button>
          </Link>
        </div>

        {/* Upload Content */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              文件上传
            </CardTitle>
            <CardDescription>支持单个和批量文件上传</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                拖拽文件到此处或点击上传
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                支持视频、图片、音频等多种格式，单个文件最大支持 2GB
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                选择文件
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">上传设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="uploadFolder">目标文件夹</Label>
                    <Input id="uploadFolder" value={selectedFolderName} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="description">文件描述</Label>
                    <Textarea id="description" placeholder="添加文件描述（可选）" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoTranscode" className="rounded" />
                    <Label htmlFor="autoTranscode">自动转码视频文件</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">支持格式</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">视频</p>
                    <p className="text-xs text-slate-500">MP4, AVI, MOV, WMV, FLV, MKV</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">图片</p>
                    <p className="text-xs text-slate-500">JPG, PNG, GIF, BMP, SVG, WEBP</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">音频</p>
                    <p className="text-xs text-slate-500">MP3, WAV, AAC, FLAC, OGG</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
