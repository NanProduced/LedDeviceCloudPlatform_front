"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Settings,
  Shield,
  Bell,
  Activity,
  Eye,
  Camera,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Smartphone,
  Monitor,
  Trash2,
} from "lucide-react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
          <p className="text-gray-600">管理您的账户信息和偏好设置</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              基本信息
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              账户设置
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              安全设置
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              通知设置
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              活动记录
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              隐私设置
            </TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>更新您的个人资料信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头像部分 */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback>GL</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      更换头像
                    </Button>
                    <p className="text-sm text-gray-500">支持 JPG、PNG 格式，最大 5MB</p>
                  </div>
                </div>

                <Separator />

                {/* 基本信息表单 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">显示名称</Label>
                    <Input id="displayName" defaultValue="GoogleManager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" defaultValue="googleled" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱地址</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input id="email" defaultValue="googleled@gmail.com" />
                      <Badge variant="secondary">已验证</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号码</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input id="phone" defaultValue="47789875" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">公司/组织</Label>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <Input id="company" defaultValue="Google Led" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">所在地区</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <Input id="location" placeholder="请输入所在城市" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea id="bio" placeholder="介绍一下您自己..." className="min-h-[100px]" />
                </div>

                {/* 社交媒体链接 */}
                <div className="space-y-4">
                  <Label>社交媒体链接</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <Input placeholder="个人网站" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-400" />
                      <Input placeholder="GitHub 用户名" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4 text-gray-400" />
                      <Input placeholder="Twitter 用户名" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <Input placeholder="LinkedIn 用户名" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>保存更改</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 账户设置 */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>账户偏好</CardTitle>
                <CardDescription>管理您的账户设置和偏好</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">界面语言</Label>
                    <Select defaultValue="zh-CN">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="zh-TW">繁体中文</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">时区</Label>
                    <Select defaultValue="Asia/Shanghai">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                        <SelectItem value="America/New_York">纽约时间 (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">伦敦时间 (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">账户状态</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">账户类型</p>
                      <p className="text-sm text-gray-500">当前为标准用户</p>
                    </div>
                    <Badge variant="outline">标准版</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">注册时间</p>
                      <p className="text-sm text-gray-500">2024年1月15日</p>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600">危险操作</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除账户
                    </Button>
                    <p className="text-sm text-gray-500">删除账户将永久移除您的所有数据，此操作无法撤销。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>密码和安全</CardTitle>
                <CardDescription>保护您的账户安全</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">更改密码</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button>更新密码</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">两步验证</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">短信验证</p>
                      <p className="text-sm text-gray-500">通过短信接收验证码</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">邮箱验证</p>
                      <p className="text-sm text-gray-500">通过邮箱接收验证码</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">身份验证器应用</p>
                      <p className="text-sm text-gray-500">使用 Google Authenticator 等应用</p>
                    </div>
                    <Button variant="outline" size="sm">
                      设置
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">活跃会话</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Windows - Chrome</p>
                          <p className="text-sm text-gray-500">北京, 中国 • 当前会话</p>
                        </div>
                      </div>
                      <Badge variant="secondary">当前</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">iPhone - Safari</p>
                          <p className="text-sm text-gray-500">上海, 中国 • 2小时前</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        终止
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通知偏好</CardTitle>
                <CardDescription>选择您希望接收的通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">邮件通知</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">系统更新</p>
                        <p className="text-sm text-gray-500">接收系统维护和更新通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">安全警报</p>
                        <p className="text-sm text-gray-500">账户安全相关的重要通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">产品更新</p>
                        <p className="text-sm text-gray-500">新功能和产品改进通知</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">营销邮件</p>
                        <p className="text-sm text-gray-500">促销活动和特别优惠</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">推送通知</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">桌面通知</p>
                        <p className="text-sm text-gray-500">在浏览器中显示通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">移动推送</p>
                        <p className="text-sm text-gray-500">在移动设备上接收推送</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">通知频率</h3>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">实时通知</SelectItem>
                      <SelectItem value="daily">每日摘要</SelectItem>
                      <SelectItem value="weekly">每周摘要</SelectItem>
                      <SelectItem value="never">从不发送</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 活动记录 */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
                <CardDescription>查看您的账户活动历史</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">登录成功</p>
                      <p className="text-sm text-gray-500">从 Chrome 浏览器登录</p>
                      <p className="text-xs text-gray-400">2024年1月30日 14:30</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">更新个人资料</p>
                      <p className="text-sm text-gray-500">修改了邮箱地址</p>
                      <p className="text-xs text-gray-400">2024年1月29日 10:15</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">密码更改</p>
                      <p className="text-sm text-gray-500">账户密码已更新</p>
                      <p className="text-xs text-gray-400">2024年1月28日 16:45</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">启用两步验证</p>
                      <p className="text-sm text-gray-500">邮箱验证已启用</p>
                      <p className="text-xs text-gray-400">2024年1月27日 09:20</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">查看更多活动</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 隐私设置 */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>隐私控制</CardTitle>
                <CardDescription>管理您的隐私和数据设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">个人资料可见性</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">公开个人资料</p>
                        <p className="text-sm text-gray-500">允许其他用户查看您的基本信息</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">显示邮箱地址</p>
                        <p className="text-sm text-gray-500">在个人资料中显示邮箱</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">显示活动状态</p>
                        <p className="text-sm text-gray-500">显示最后在线时间</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">数据和分析</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">使用分析</p>
                        <p className="text-sm text-gray-500">帮助改进产品体验</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">个性化推荐</p>
                        <p className="text-sm text-gray-500">基于使用习惯提供个性化内容</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">数据导出</h3>
                  <p className="text-sm text-gray-500">
                    您可以随时导出您的个人数据。导出的数据将包含您的个人信息、活动记录等。
                  </p>
                  <Button variant="outline">导出我的数据</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
