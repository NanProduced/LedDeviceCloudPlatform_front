"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ImageIcon, Settings, Upload, CheckCircle, FileVideo } from "lucide-react"

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

export default function CreateProgram() {
  // 直接重定向到可视化编辑器
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard/program-editor/create')
  }
  return null
}
