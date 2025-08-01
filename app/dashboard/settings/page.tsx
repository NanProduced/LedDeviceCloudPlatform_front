"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { userApi } from '@/lib/api'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Lock,
  Clock,
  Users,
  ShieldCheck,
  Key,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  Trash2,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { user, loading } = useUser()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()

  // 密码修改状态
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // API 访问令牌状态
  const [apiTokens, setApiTokens] = useState([
    {
      id: 1,
      name: "个人访问令牌",
      token: "ghp_xxxxxxxxxxxxxxxxxxxx",
      created: "2024-01-15",
      lastUsed: "2024-01-30",
      scopes: ["read:user", "repo"]
    }
  ])
  const [showTokens, setShowTokens] = useState<{[key: number]: boolean}>({})

  // 登录设备状态
  const [loginSessions] = useState([
    {
      id: 1,
      device: "Windows - Chrome",
      location: "北京, 中国",
      lastActive: "当前会话",
      isCurrent: true,
      icon: Monitor
    },
    {
      id: 2,
      device: "iPhone - Safari",
      location: "上海, 中国",
      lastActive: "2小时前",
      isCurrent: false,
      icon: Smartphone
    }
  ])

  // 获取用户名首字母作为头像回退显示
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // 日期格式化
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: language === 'zh' ? zhCN : enUS });
    } catch {
      return dateString;
    }
  };

  // 处理语言更改
  const handleLanguageChange = (value: 'zh' | 'en') => {
    setLanguage(value);
  };

  // 处理密码修改
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // 验证密码
    if (newPassword !== confirmPassword) {
      setPasswordError('新密码与确认密码不匹配');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userApi.modifyPassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      // 清空表单
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('修改密码失败:', err);
      setPasswordError('密码修改失败，请检查当前密码是否正确');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 生成新的API令牌
  const handleGenerateToken = () => {
    const newToken = {
      id: Date.now(),
      name: `访问令牌 ${apiTokens.length + 1}`,
      token: `ghp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "从未使用",
      scopes: ["read:user"]
    };
    setApiTokens([...apiTokens, newToken]);
  };

  // 切换令牌显示/隐藏
  const toggleTokenVisibility = (tokenId: number) => {
    setShowTokens(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  // 复制令牌
  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      // 这里可以添加一个toast通知
      console.log('令牌已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 删除令牌
  const deleteToken = (tokenId: number) => {
    setApiTokens(apiTokens.filter(token => token.id !== tokenId));
  };

  // 终止登录会话
  const terminateSession = (sessionId: number) => {
    console.log('终止会话:', sessionId);
    // 这里应该调用API终止会话
  };

  // 终止所有其他会话
  const terminateAllOtherSessions = () => {
    console.log('终止所有其他会话');
    // 这里应该调用API终止所有其他会话
  };

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600"></div>
      </div>
    );
  }

  // 如果没有用户信息，可能未登录
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">账户设置</h1>
          <p className="text-gray-600 dark:text-slate-400">管理您的账户信息和偏好设置</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>查看和管理您的个人资料信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头像部分 */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {getInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      更换头像
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-slate-400">支持 JPG、PNG 格式，最大 5MB</p>
                  </div>
                </div>

                <Separator />

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="h-4 w-4" />
                      用户名
                    </div>
                    <p className="text-lg font-medium">{user.username}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4" />
                      邮箱地址
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-medium">{user.email || '-'}</p>
                      <Badge variant="secondary">已验证</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-4 w-4" />
                      手机号码
                    </div>
                    <p className="text-lg font-medium">{user.phone || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building className="h-4 w-4" />
                      所属组织
                    </div>
                    <p className="text-lg font-medium">{user.orgName}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4" />
                      用户组
                    </div>
                    <p className="text-lg font-medium">{user.ugName}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                      账号状态
                    </div>
                    <div>
                      {user.active === 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          正常
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          已禁用
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      创建时间
                    </div>
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      更新时间
                    </div>
                    <p className="text-sm">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>

                {/* 角色列表 */}
                <div className="space-y-4">
                  <h3 className="mb-2 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    用户角色
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge key={role.rid} variant="outline" className="bg-slate-100">
                          {role.displayName || role.roleName}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">无角色</span>
                    )}
                  </div>
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
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">简体中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
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
                      <p className="text-sm text-gray-500 dark:text-slate-400">当前为{user.roles?.[0]?.displayName || '普通用户'}</p>
                    </div>
                    <Badge variant="outline">{user.roles?.[0]?.displayName || '普通用户'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">注册时间</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{formatDate(user.createdAt)}</p>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400" />
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
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* 错误和成功消息 */}
                    {passwordError && (
                      <div className="rounded bg-red-100 p-2 text-sm text-red-600">
                        {passwordError}
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="rounded bg-green-100 p-2 text-sm text-green-600">
                        密码修改成功
                      </div>
                    )}

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                          处理中...
                        </>
                      ) : (
                        '更新密码'
                      )}
                    </Button>
                  </form>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">两步验证</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">短信验证</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">通过短信接收验证码</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">邮箱验证</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">通过邮箱接收验证码</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API 访问 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  API 访问
                </CardTitle>
                <CardDescription>管理 API 密钥和开发者设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">个人访问令牌</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">用于 API 访问的令牌</p>
                    </div>
                    <Button onClick={handleGenerateToken} size="sm">
                      生成令牌
                    </Button>
                  </div>

                  {/* 令牌列表 */}
                  <div className="space-y-3">
                    {apiTokens.map((token) => (
                      <div key={token.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{token.name}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              创建于 {token.created} • 最后使用: {token.lastUsed}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTokenVisibility(token.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToken(token.token)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteToken(token.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {showTokens[token.id] && (
                          <div className="bg-gray-100 dark:bg-slate-800 rounded p-3">
                            <code className="text-sm font-mono break-all">{token.token}</code>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {token.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    {apiTokens.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>暂无 API 访问令牌</p>
                        <p className="text-sm">点击上方按钮生成第一个令牌</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 登录设备 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  登录设备
                </CardTitle>
                <CardDescription>管理已登录的设备和会话</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {loginSessions.map((session) => {
                    const IconComponent = session.icon;
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              {session.location} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.isCurrent ? (
                            <Badge variant="secondary">当前</Badge>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => terminateSession(session.id)}
                            >
                              终止
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={terminateAllOtherSessions}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    终止所有其他会话
                  </Button>
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
                        <p className="text-sm text-gray-500 dark:text-slate-400">接收系统维护和更新通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">安全警报</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">账户安全相关的重要通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">设备状态</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">设备离线或异常状态通知</p>
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
                        <p className="text-sm text-gray-500 dark:text-slate-400">在浏览器中显示通知</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">移动推送</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">在移动设备上接收推送</p>
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
        </Tabs>
      </div>
    </div>
  )
}