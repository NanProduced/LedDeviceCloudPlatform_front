"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building,
  Globe,
  Github,
  Linkedin,
  Edit3,
  Share2,
  Award,
  Activity,
  Users,
  Star,
} from "lucide-react"

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" />
                  <AvatarFallback className="text-2xl">GM</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold">GoogleManager</h1>
                  <Badge variant="secondary">标准用户</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    在线
                  </Badge>
                </div>
                <p className="text-gray-600">LED云平台资深用户 • Google Led</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>北京, 中国</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>加入于 2024年1月</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享资料
                </Button>
                <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  {isEditing ? "保存" : "编辑资料"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="activity">活动</TabsTrigger>
            <TabsTrigger value="projects">项目</TabsTrigger>
            <TabsTrigger value="achievements">成就</TabsTrigger>
          </TabsList>

          {/* 概览标签 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧主要信息 */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>关于我</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        placeholder="介绍一下您自己..."
                        defaultValue="专注于LED显示技术的产品经理，拥有5年行业经验。热爱创新技术，致力于为客户提供最优质的LED解决方案。"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        专注于LED显示技术的产品经理，拥有5年行业经验。热爱创新技术，致力于为客户提供最优质的LED解决方案。
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>技能标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">LED技术</Badge>
                      <Badge variant="secondary">产品管理</Badge>
                      <Badge variant="secondary">项目管理</Badge>
                      <Badge variant="secondary">数据分析</Badge>
                      <Badge variant="secondary">团队协作</Badge>
                      <Badge variant="secondary">客户服务</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>最近活动</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">更新了项目 "LED显示屏控制系统"</p>
                          <p className="text-xs text-gray-500">2小时前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">完成了客户需求分析报告</p>
                          <p className="text-xs text-gray-500">1天前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm">参与了技术讨论会议</p>
                          <p className="text-xs text-gray-500">3天前</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧信息卡片 */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>联系信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">googleled@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">47789875</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Google Led</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>社交链接</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">www.googleled.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Github className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">@googleled</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">GoogleManager</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>统计数据</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">项目数量</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">完成任务</span>
                      <span className="font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">团队协作</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">获得点赞</span>
                      <span className="font-medium">234</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 活动标签 */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>活动时间线</CardTitle>
                <CardDescription>查看您在平台上的所有活动记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">创建了新项目</p>
                      <p className="text-sm text-gray-600">LED户外显示屏项目已启动</p>
                      <p className="text-xs text-gray-400">今天 14:30</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">加入团队讨论</p>
                      <p className="text-sm text-gray-600">参与了产品优化讨论</p>
                      <p className="text-xs text-gray-400">昨天 16:45</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">获得成就徽章</p>
                      <p className="text-sm text-gray-600">解锁"项目专家"徽章</p>
                      <p className="text-xs text-gray-400">2天前</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 项目标签 */}
          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>LED显示屏控制系统</CardTitle>
                  <CardDescription>智能LED显示屏管理平台</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>开始时间: 2024-01-15</span>
                      <span>预计完成: 2024-03-01</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>客户管理系统</CardTitle>
                  <CardDescription>LED客户关系管理平台</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>开始时间: 2023-11-01</span>
                      <span>完成时间: 2024-01-10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 成就标签 */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-medium mb-2">项目专家</h3>
                  <p className="text-sm text-gray-600">完成10个以上项目</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">团队协作者</h3>
                  <p className="text-sm text-gray-600">参与100次团队协作</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">优秀贡献者</h3>
                  <p className="text-sm text-gray-600">获得200个点赞</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
