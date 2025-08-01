"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Smartphone,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  Users,
  Mail,
  Phone,
  Building,
  Calendar,
} from "lucide-react"

export function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Settings Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">设置</h1>
          <p className="text-gray-600">管理您的账户设置和偏好配置</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              账户
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              安全
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              通知
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              外观
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              计费
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              高级
            </TabsTrigger>
          </TabsList>

          {/* 账户设置 */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">用户信息</CardTitle>
                </div>
                <CardDescription>查看和管理您的个人信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 用户信息网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>用户名</span>
                    </div>
                    <p className="text-lg font-medium">GoogleManager</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>邮箱</span>
                    </div>
                    <p className="text-lg font-medium">googleled@gmail.com</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>电话</span>
                    </div>
                    <p className="text-lg font-medium">47789875</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>所属组织</span>
                    </div>
                    <p className="text-lg font-medium">Google Led</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>用户组</span>
                    </div>
                    <p className="text-lg font-medium">Google Led</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>账号状态</span>
                    </div>
                    <Badge variant="destructive" className="text-sm">
                      已禁用
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>创建时间</span>
                    </div>
                    <p className="text-lg font-medium text-gray-400">-</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>更新时间</span>
                    </div>
                    <p className="text-lg font-medium text-gray-400">-</p>
                  </div>
                </div>

                <Separator />

                {/* 角色信息 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium">角色</h3>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    组织管理员
                  </Badge>
                </div>

                <Separator />

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <Button>编辑信息</Button>
                  <Button variant="outline">重置密码</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>密码设置</CardTitle>
                <CardDescription>更改您的登录密码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>两步验证</CardTitle>
                <CardDescription>为您的账户添加额外的安全保护</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">短信验证</p>
                    <p className="text-sm text-gray-500">通过短信接收验证码</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮箱验证</p>
                    <p className="text-sm text-gray-500">通过邮箱接收验证码</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">身份验证器应用</p>
                    <p className="text-sm text-gray-500">使用 Google Authenticator 等应用</p>
                  </div>
                  <Button variant="outline" size="sm">
                    设置
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>登录设备</CardTitle>
                <CardDescription>管理已登录的设备和会话</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Button variant="outline" className="w-full bg-transparent">
                  终止所有其他会话
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>邮件通知</CardTitle>
                <CardDescription>选择您希望接收的邮件通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">系统更新</p>
                    <p className="text-sm text-gray-500">平台维护和系统更新通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">安全警报</p>
                    <p className="text-sm text-gray-500">账户安全相关的重要通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">项目更新</p>
                    <p className="text-sm text-gray-500">项目进度和状态变更通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">营销邮件</p>
                    <p className="text-sm text-gray-500">产品更新和促销活动信息</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>推送通知</CardTitle>
                <CardDescription>管理浏览器和移动设备推送通知</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">桌面通知</p>
                    <p className="text-sm text-gray-500">在浏览器中显示通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">移动推送</p>
                    <p className="text-sm text-gray-500">在移动设备上接收推送</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>通知频率</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger>
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

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>主题设置</CardTitle>
                <CardDescription>自定义界面外观和主题</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">浅色模式</SelectItem>
                      <SelectItem value="dark">深色模式</SelectItem>
                      <SelectItem value="system">跟随系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>界面语言</Label>
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
                  <Label>时区设置</Label>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>显示设置</CardTitle>
                <CardDescription>调整界面显示选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">紧凑模式</p>
                    <p className="text-sm text-gray-500">减少界面元素间距</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">显示侧边栏</p>
                    <p className="text-sm text-gray-500">在主界面显示导航侧边栏</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">动画效果</p>
                    <p className="text-sm text-gray-500">启用界面过渡动画</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 计费设置 */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>当前套餐</CardTitle>
                <CardDescription>管理您的订阅和计费信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">标准版</h3>
                    <p className="text-sm text-gray-500">适合个人和小团队使用</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">¥99/月</p>
                    <p className="text-sm text-gray-500">下次计费: 2024-02-30</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button>升级套餐</Button>
                  <Button variant="outline">管理订阅</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>付款方式</CardTitle>
                <CardDescription>管理您的付款方式和账单地址</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">**** **** **** 1234</p>
                      <p className="text-sm text-gray-500">过期时间: 12/26</p>
                    </div>
                  </div>
                  <Badge variant="secondary">默认</Badge>
                </div>
                <Button variant="outline">添加付款方式</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>账单历史</CardTitle>
                <CardDescription>查看和下载历史账单</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">2024年1月账单</p>
                      <p className="text-sm text-gray-500">2024-01-01 - 2024-01-31</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">¥99.00</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">2023年12月账单</p>
                      <p className="text-sm text-gray-500">2023-12-01 - 2023-12-31</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">¥99.00</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 高级设置 */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据管理</CardTitle>
                <CardDescription>管理您的个人数据和隐私设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">数据分析</p>
                    <p className="text-sm text-gray-500">允许收集使用数据以改进服务</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">个性化推荐</p>
                    <p className="text-sm text-gray-500">基于使用习惯提供个性化内容</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    导出我的数据
                  </Button>
                  <p className="text-sm text-gray-500">导出包含您所有个人数据的存档文件</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API 访问</CardTitle>
                <CardDescription>管理 API 密钥和开发者设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">个人访问令牌</p>
                    <p className="text-sm text-gray-500">用于 API 访问的令牌</p>
                  </div>
                  <Button variant="outline" size="sm">
                    生成令牌
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">开发者模式</p>
                    <p className="text-sm text-gray-500">启用高级开发者功能</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">危险操作</CardTitle>
                <CardDescription>这些操作无法撤销，请谨慎操作</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    删除账户将永久移除您的所有数据，包括项目、文件和设置。此操作无法撤销。
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除账户
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
