"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  Search,
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
  Loader2,
} from "lucide-react"

// 导入API服务
import { userGroupApi } from "@/lib/api/userGroup"
import { userManagementApi } from "@/lib/api/userManagement"
import { roleApi } from "@/lib/api/role"

// 导入类型
import { 
  UserGroupTreeNode as UserGroupTreeNodeType, 
  UserListItem, 
  CreateUserRequest, 
  CreateUserGroupRequest, 
  PageRequest,
  UserListRequest,
  Role
} from "@/lib/types"

interface UserGroupTreeProps {
  node: UserGroupTreeNodeType
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
  const hasChildren = node.children && node.children.length > 0
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
          {node.children ? node.children.length : 0}
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
  // 状态管理
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  // 添加包含子组状态
  const [includeSubGroups, setIncludeSubGroups] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    ugid: 0,
    roles: [],
    username: "",
    password: "",
    email: "",
    phone: "",
  })
  const [newGroup, setNewGroup] = useState<CreateUserGroupRequest>({
    parentUgid: 0,
    userGroupName: "",
    description: "",
  })

  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserListItem | null>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)

  // 加载状态
  const [loadingTree, setLoadingTree] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRoles, setLoadingRoles] = useState(true)

  // 数据状态
  const [userGroupTree, setUserGroupTree] = useState<UserGroupTreeNodeType | null>(null)
  const [userList, setUserList] = useState<UserListItem[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  
  // 分页状态
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // 加载用户组树
  useEffect(() => {
    const fetchUserGroupTree = async () => {
      setLoadingTree(true)
      try {
        const response = await userGroupApi.getUserGroupTree()
        setUserGroupTree(response.root)
        
        // 设置默认选中的组和展开状态
        if (response.root) {
          setSelectedGroup(response.root.ugid)
          setExpandedGroups(new Set([response.root.ugid]))
          
          // 设置新建用户和新建组的默认ugid
          setNewUser(prev => ({ ...prev, ugid: response.root.ugid }))
          setNewGroup(prev => ({ ...prev, parentUgid: response.root.ugid }))
        }
      } catch (error) {
        console.error("获取用户组树失败", error)
      } finally {
        setLoadingTree(false)
      }
    }

    fetchUserGroupTree()
  }, [])

  // 加载可用角色
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true)
      try {
        const response = await roleApi.getVisibleRoles()
        setAvailableRoles(response.visibleRoles)
      } catch (error) {
        console.error("获取角色列表失败", error)
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // 选择用户组时加载用户列表
  useEffect(() => {
    if (selectedGroup) {
      loadUserList()
    }
  }, [selectedGroup, pageNum, pageSize, searchQuery, includeSubGroups])  // 添加includeSubGroups依赖

  // 加载用户列表
  const loadUserList = async () => {
    if (!selectedGroup) return

    setLoadingUsers(true)
    try {
      const request: PageRequest<UserListRequest> = {
        pageNum,
        pageSize,
        params: {
          ugid: selectedGroup,
          includeSubGroups: includeSubGroups,  // 使用状态变量
          userNameKeyword: searchQuery || undefined,
          emailKeyword: searchQuery || undefined,
        }
      }
      
      const response = await userManagementApi.getUserList(request)
      setUserList(response.records)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("获取用户列表失败", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleToggleExpand = (ugid: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(ugid)) {
      newExpanded.delete(ugid)
    } else {
      newExpanded.add(ugid)
    }
    setExpandedGroups(newExpanded)
  }

  const handleSelectGroup = (ugid: number) => {
    setSelectedGroup(ugid)
    setNewUser(prev => ({ ...prev, ugid }))
    setNewGroup(prev => ({ ...prev, parentUgid: ugid }))
  }

  const handleCreateUser = async () => {
    try {
      await userManagementApi.createUser(newUser)
      setIsCreateUserOpen(false)
      setNewUser({
        ugid: selectedGroup || 0,
        roles: [],
        username: "",
        password: "",
        email: "",
        phone: "",
      })
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error("创建用户失败", error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      await userGroupApi.createUserGroup(newGroup)
      setIsCreateGroupOpen(false)
      setNewGroup({
        parentUgid: selectedGroup || 0,
        userGroupName: "",
        description: "",
      })
      // 重新加载用户组树
      const response = await userGroupApi.getUserGroupTree()
      setUserGroupTree(response.root)
    } catch (error) {
      console.error("创建用户组失败", error)
    }
  }

  const handleUserRowClick = (user: UserListItem) => {
    setSelectedUserDetail(user)
    setIsUserDetailOpen(true)
  }

  // 修复handleUserSelect函数的类型问题
  const handleUserSelect = (uid: number, event: React.MouseEvent<Element, MouseEvent>) => {
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
    if (selectedUsers.size === userList.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(userList.map((user) => user.uid)))
    }
  }

  const handleDeleteUser = async (uid: number) => {
    try {
      await userManagementApi.deleteUser(uid)
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error("删除用户失败", error)
    }
  }

  const handleActiveUser = async (uid: number, active: boolean) => {
    try {
      if (active) {
        await userManagementApi.activeUser(uid)
      } else {
        await userManagementApi.inactiveUser(uid)
      }
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error(`${active ? "解封" : "封禁"}用户失败`, error)
    }
  }

  const handleBatchDelete = async () => {
    try {
      // 逐个删除选中的用户
      for (const uid of selectedUsers) {
        await userManagementApi.deleteUser(uid)
      }
      setSelectedUsers(new Set())
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error("批量删除用户失败", error)
    }
  }

  const handleBatchActive = async (active: boolean) => {
    try {
      // 逐个设置选中用户的状态
      for (const uid of selectedUsers) {
        if (active) {
          await userManagementApi.activeUser(uid)
        } else {
          await userManagementApi.inactiveUser(uid)
        }
      }
      setSelectedUsers(new Set())
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error(`批量${active ? "解封" : "封禁"}用户失败`, error)
    }
  }

  const handleAssignRoles = async (uid: number, roleIds: number[]) => {
    try {
      await userManagementApi.assignRolesToUser(uid, roleIds)
      loadUserList() // 重新加载用户列表
    } catch (error) {
      console.error("分配角色失败", error)
    }
  }

  const handlePageChange = (page: number) => {
    setPageNum(page)
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

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          显示 {userList.length} 条，共 {total} 条
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageNum === 1}
            onClick={() => handlePageChange(pageNum - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            第 {pageNum} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pageNum === totalPages}
            onClick={() => handlePageChange(pageNum + 1)}
          >
            下一页
          </Button>
        </div>
      </div>
    )
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
            {loadingTree ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : userGroupTree ? (
              <UserGroupTreeNode
                node={userGroupTree}
                level={0}
                selectedGroup={selectedGroup}
                onSelectGroup={handleSelectGroup}
                expandedGroups={expandedGroups}
                onToggleExpand={handleToggleExpand}
              />
            ) : (
              <div className="text-center py-4 text-slate-600">
                无法加载用户组树
              </div>
            )}
            
            {/* 删除了"添加用户组"按钮及其对应的Dialog组件 */}
          </CardContent>
        </Card>

        {/* Right Content - User List */}
        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {userGroupTree && selectedGroup 
                    ? (userGroupTree.ugid === selectedGroup ? userGroupTree.ugName : "选中组")
                    : "用户列表"}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {userGroupTree && selectedGroup ? "用户组的用户信息" : "请选择用户组"}
                </p>
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
                    <Button 
                      size="sm" 
                      className="gap-2"
                      disabled={!selectedGroup}
                    >
                      <UserPlus className="w-4 h-4" />
                      添加用户
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>创建用户</DialogTitle>
                      <DialogDescription>
                        在选中的用户组下创建新用户
                      </DialogDescription>
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
                        <Select
                          onValueChange={(value) => setNewUser({ ...newUser, roles: [parseInt(value)] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择用户角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingRoles ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : (
                              availableRoles.map((role) => (
                                <SelectItem key={role.rid} value={role.rid.toString()}>
                                  {role.displayName}
                                </SelectItem>
                              ))
                            )}
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
            {/* Search Bar with Include Subgroups Checkbox */}
            <div className="mb-6 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              
              {/* 添加"包含子组"勾选框 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeSubGroups" 
                    checked={includeSubGroups} 
                    onCheckedChange={(checked) => setIncludeSubGroups(checked === true)}
                  />
                  <Label htmlFor="includeSubGroups" className="text-sm font-medium text-slate-600 dark:text-slate-400">包含子组用户</Label>
                </div>
              </div>
            </div>

            {/* Batch Operations */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <span className="text-sm text-blue-800 dark:text-blue-400">已选择 {selectedUsers.size} 个用户</span>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 bg-transparent"
                    onClick={() => {
                      // 实现批量分配角色的逻辑
                    }}
                  >
                    <Shield className="w-4 h-4" />
                    批量分配角色
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 bg-transparent"
                    onClick={() => handleBatchActive(false)}
                  >
                    <UserX className="w-4 h-4" />
                    批量封禁
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 bg-transparent"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    批量删除
                  </Button>
                </div>
              </div>
            )}

            {/* User Table */}
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : userList.length > 0 ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === userList.length && userList.length > 0}
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
                    {userList.map((user) => (
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
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => {
                                  // 实现分配角色的逻辑
                                }}
                              >
                                <Shield className="w-4 h-4" />
                                分配角色
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleActiveUser(user.uid, user.active !== 0)}
                              >
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
                              <DropdownMenuItem 
                                className="gap-2 text-red-600"
                                onClick={() => handleDeleteUser(user.uid)}
                              >
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
                
                {/* Pagination */}
                {renderPagination()}
              </div>
            ) : (
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
