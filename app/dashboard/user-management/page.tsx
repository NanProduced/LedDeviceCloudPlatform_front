"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Building2,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  UserCheck,
  UserX,
  FolderPlus,
} from "lucide-react"

// 模拟数据
const userGroupTree = {
  ugid: 1,
  ugName: "Google Led",
  userCount: 156,
  children: [
    {
      ugid: 2,
      ugName: "Manager",
      userCount: 12,
      children: [
        {
          ugid: 3,
          ugName: "Manager Dept.1",
          userCount: 8,
          children: [],
        },
      ],
    },
    {
      ugid: 4,
      ugName: "Support",
      userCount: 15,
      children: [],
    },
  ],
}

const mockUsers = [
  {
    uid: 1,
    username: "张三",
    email: "zhangsan@googleled.com",
    ugName: "Manager",
    roles: [{ roleName: "系统管理员", displayName: "系统管理员" }],
    active: 0,
    createTime: "2024-01-15T10:30:00",
    updateTime: "2024-01-15T10:30:00",
  },
  {
    uid: 2,
    username: "李四",
    email: "lisi@googleled.com",
    ugName: "Manager",
    roles: [{ roleName: "设备操作员", displayName: "设备操作员" }],
    active: 0,
    createTime: "2024-01-20T14:20:00",
    updateTime: "2024-01-20T14:20:00",
  },
  {
    uid: 3,
    username: "王五",
    email: "wangwu@googleled.com",
    ugName: "Support",
    roles: [{ roleName: "普通用户", displayName: "普通用户" }],
    active: 1,
    createTime: "2024-02-01T09:15:00",
    updateTime: "2024-02-01T09:15:00",
  },
  {
    uid: 4,
    username: "赵六",
    email: "zhaoliu@googleled.com",
    ugName: "Manager Dept.1",
    roles: [{ roleName: "设备操作员", displayName: "设备操作员" }],
    active: 0,
    createTime: "2024-02-10T16:45:00",
    updateTime: "2024-02-10T16:45:00",
  },
]

const roleOptions = [
  { value: "system_admin", label: "系统管理员" },
  { value: "device_operator", label: "设备操作员" },
  { value: "content_manager", label: "内容管理员" },
  { value: "viewer", label: "普通用户" },
]

interface UserGroupNode {
  ugid: number
  ugName: string
  userCount: number
  children: UserGroupNode[]
}

interface UserGroupTreeProps {
  node: UserGroupNode
  level: number
  selectedGroup: number | null
  onSelectGroup: (ugid: number) => void
  expandedGroups: Set<number>
  onToggleExpand: (ugid: number) => void
}

function UserGroupTreeNode({
  node,
  level,
  selectedGroup,
  onSelectGroup,
  expandedGroups,
  onToggleExpand,
}: UserGroupTreeProps) {
  const isExpanded = expandedGroups.has(node.ugid)
  const hasChildren = node.children.length > 0
  const isSelected = selectedGroup === node.ugid

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          isSelected ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectGroup(node.ugid)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.ugid)
            }}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}
        <Building2 className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{node.ugName}</span>
        <Badge variant="secondary" className="text-xs">
          {node.userCount}
        </Badge>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <UserGroupTreeNode
              key={child.ugid}
              node={child}
              level={level + 1}
              selectedGroup={selectedGroup}
              onSelectGroup={onSelectGroup}
              expandedGroups={expandedGroups}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserManagement() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1, 2]))
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    roles: [] as string[],
  })
  const [newGroup, setNewGroup] = useState({
    userGroupName: "",
    description: "",
  })

  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)

  const handleToggleExpand = (ugid: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(ugid)) {
      newExpanded.delete(ugid)
    } else {
      newExpanded.add(ugid)
    }
    setExpandedGroups(newExpanded)
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedGroupName = selectedGroup === 1 ? "Google Led" : "Manager"

  const handleCreateUser = () => {
    console.log("Creating user:", newUser)
    setIsCreateUserOpen(false)
    setNewUser({ username: "", email: "", phone: "", password: "", roles: [] })
  }

  const handleCreateGroup = () => {
    console.log("Creating group:", newGroup)
    setIsCreateGroupOpen(false)
    setNewGroup({ userGroupName: "", description: "" })
  }

  const handleUserRowClick = (user: any) => {
    setSelectedUserDetail(user)
    setIsUserDetailOpen(true)
  }

  const handleUserSelect = (uid: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(uid)) {
      newSelected.delete(uid)
    } else {
      newSelected.add(uid)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.uid)))
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "系统管理员":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "设备操作员":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "内容管理员":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">用户管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理系统用户、分组和权限配置</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Groups */}
          <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  用户组
                </CardTitle>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">组织架构管理</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <UserGroupTreeNode
                node={userGroupTree}
                level={0}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                expandedGroups={expandedGroups}
                onToggleExpand={handleToggleExpand}
              />

              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 mt-4">
                    <Plus className="w-4 h-4" />
                    添加用户组
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建用户组</DialogTitle>
                    <DialogDescription>在当前组织下创建新的用户组</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="groupName">用户组名称</Label>
                      <Input
                        id="groupName"
                        value={newGroup.userGroupName}
                        onChange={(e) => setNewGroup({ ...newGroup, userGroupName: e.target.value })}
                        placeholder="请输入用户组名称"
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupDesc">描述</Label>
                      <Input
                        id="groupDesc"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="请输入用户组描述"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateGroup}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Right Content - User List */}
          <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedGroupName}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedGroupName} 组的用户信息</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <FolderPlus className="w-4 h-4" />
                        添加子组
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        添加用户
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>创建用户</DialogTitle>
                        <DialogDescription>在 {selectedGroupName} 组下创建新用户</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">用户名</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="请输入用户名"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">邮箱</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="请输入邮箱地址"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">手机号</Label>
                          <Input
                            id="phone"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            placeholder="请输入手机号"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">密码</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="请输入密码"
                          />
                        </div>
                        <div>
                          <Label htmlFor="roles">角色</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择用户角色" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleCreateUser}>创建</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Batch Operations */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <span className="text-sm text-blue-800 dark:text-blue-400">已选择 {selectedUsers.size} 个用户</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Shield className="w-4 h-4" />
                      批量分配角色
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <UserX className="w-4 h-4" />
                      批量封禁
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                      批量删除
                    </Button>
                  </div>
                </div>
              )}

              {/* User Table */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                      </TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>所属组</TableHead>
                      <TableHead>电子邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.uid}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => handleUserRowClick(user)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.uid)}
                            onChange={(e) => handleUserSelect(user.uid, e)}
                            className="rounded border-slate-300 dark:border-slate-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                                {user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span>{user.ugName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
                              <Badge key={index} className={`text-xs ${getRoleColor(role.displayName)}`}>
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(user.createTime).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.active === 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }
                          >
                            {user.active === 0 ? "活跃" : "非活跃"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                                编辑用户
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Shield className="w-4 h-4" />
                                分配角色
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                {user.active === 0 ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    封禁用户
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    解封用户
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                删除用户
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">没有找到匹配的用户</p>
                </div>
              )}

              {/* User Detail Dialog */}
              <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {selectedUserDetail?.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedUserDetail?.username}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUserDetail?.email}</p>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  {selectedUserDetail && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">用户ID</Label>
                          <p className="mt-1">{selectedUserDetail.uid}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">所属组</Label>
                          <p className="mt-1">{selectedUserDetail.ugName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">创建时间</Label>
                          <p className="mt-1">{new Date(selectedUserDetail.createTime).toLocaleString("zh-CN")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">更新时间</Label>
                          <p className="mt-1">{new Date(selectedUserDetail.updateTime).toLocaleString("zh-CN")}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">用户角色</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedUserDetail.roles.map((role, index) => (
                            <Badge key={index} className={`${getRoleColor(role.displayName)}`}>
                              {role.displayName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">账户状态</Label>
                        <div className="mt-2">
                          <Badge
                            className={
                              selectedUserDetail.active === 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }
                          >
                            {selectedUserDetail.active === 0 ? "活跃" : "非活跃"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserDetailOpen(false)}>
                      关闭
                    </Button>
                    <Button className="gap-2">
                      <Edit className="w-4 h-4" />
                      编辑用户
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
