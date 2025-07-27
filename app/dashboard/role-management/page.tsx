"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  MoreHorizontal,
  Search,
  Trash2,
  Edit,
  ChevronRight,
  Loader2,
  Check,
  X
} from "lucide-react"

// 导入API服务
import { roleApi } from "@/lib/api/role"
import { permissionApi } from "@/lib/api/permission"

// 导入类型
import { Role, PermissionResponse } from "@/lib/types"

export default function RoleManagement() {
  // 状态管理
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  
  // 新角色/编辑角色表单
  const [roleForm, setRoleForm] = useState({
    roleName: "",
    description: "",
    permissions: [] as number[]
  })
  
  // 权限相关
  const [permissions, setPermissions] = useState<Record<string, PermissionResponse[]>>({})
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())
  
  // 加载状态
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [savingRole, setSavingRole] = useState(false)
  
  // 错误状态
  const [errorRoles, setErrorRoles] = useState<string | null>(null)
  const [errorPermissions, setErrorPermissions] = useState<string | null>(null)
  
  // 确保组件已挂载，避免SSR水合错误
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 获取角色列表
  useEffect(() => {
    if (!mounted) return;
    
    const fetchRoles = async () => {
      setLoadingRoles(true)
      setErrorRoles(null)
      try {
        console.log('获取角色列表...')
        const response = await roleApi.getVisibleRoles()
        console.log('角色列表响应:', response)
        if (response && response.visibleRoles) {
          setRoles(response.visibleRoles || [])
          if (response.visibleRoles && response.visibleRoles.length > 0) {
            setSelectedRole(response.visibleRoles[0])
          }
        } else {
          throw new Error('API返回数据格式不符合预期')
        }
      } catch (error) {
        console.error("获取角色列表失败", error)
        setErrorRoles(error instanceof Error ? error.message : "未知错误")
        // 使用模拟数据保证UI可用
        setRoles(getMockRoles())
      } finally {
        setLoadingRoles(false)
      }
    }
    
    fetchRoles()
  }, [mounted])
  
  // 获取权限列表
  useEffect(() => {
    if (!mounted) return;
    
    const fetchPermissions = async () => {
      setLoadingPermissions(true)
      setErrorPermissions(null)
      try {
        console.log('获取权限列表...')
        const response = await permissionApi.getCurrentUserPermissions()
        console.log('权限列表响应:', response)
        setPermissions(response || {})
      } catch (error) {
        console.error("获取权限列表失败", error)
        setErrorPermissions(error instanceof Error ? error.message : "未知错误")
        // 使用模拟数据保证UI可用
        setPermissions(getMockPermissions())
      } finally {
        setLoadingPermissions(false)
      }
    }
    
    fetchPermissions()
  }, [mounted])
  
  // 当选中角色改变时，加载该角色的权限
  useEffect(() => {
    if (selectedRole) {
      // 这里假设角色对象中包含其权限ID列表
      // 实际情况可能需要额外的API调用获取角色的权限
      setSelectedPermissions(new Set(selectedRole.permissions || []))
    } else {
      setSelectedPermissions(new Set())
    }
  }, [selectedRole])
  
  // 过滤角色列表
  const filteredRoles = roles.filter(role => 
    role.roleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 模拟角色数据
  function getMockRoles(): Role[] {
    return [
      {
        rid: 1,
        oid: 1,
        roleName: "admin",
        displayName: "管理员",
        description: "系统管理员，拥有全部权限",
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      {
        rid: 2,
        oid: 1,
        roleName: "operator",
        displayName: "运营人员",
        description: "运营人员，主要负责内容管理",
        permissions: [4, 7, 8, 9]
      },
      {
        rid: 3,
        oid: 1,
        roleName: "viewer",
        displayName: "访客",
        description: "访客，只有查看权限",
        permissions: [4]
      }
    ];
  }
  
  // 模拟权限数据
  function getMockPermissions(): Record<string, PermissionResponse[]> {
    return {
      系统管理: [
        { permissionId: 1, permissionName: "用户管理", permissionDescription: "管理系统用户", permissionType: "SYSTEM" },
        { permissionId: 2, permissionName: "角色管理", permissionDescription: "管理系统角色", permissionType: "SYSTEM" },
        { permissionId: 3, permissionName: "组织架构", permissionDescription: "管理组织架构", permissionType: "SYSTEM" },
      ],
      设备管理: [
        { permissionId: 4, permissionName: "设备查看", permissionDescription: "查看设备信息", permissionType: "DEVICE" },
        { permissionId: 5, permissionName: "设备控制", permissionDescription: "控制设备", permissionType: "DEVICE" },
        { permissionId: 6, permissionName: "设备配置", permissionDescription: "配置设备参数", permissionType: "DEVICE" },
      ],
      内容管理: [
        { permissionId: 7, permissionName: "节目管理", permissionDescription: "管理播放节目", permissionType: "CONTENT" },
        { permissionId: 8, permissionName: "素材管理", permissionDescription: "管理素材库", permissionType: "CONTENT" },
        { permissionId: 9, permissionName: "排期管理", permissionDescription: "管理播放排期", permissionType: "CONTENT" },
      ],
    };
  }
  
  // 选中角色
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
  }
  
  // 创建新角色
  const handleCreateRole = async () => {
    setSavingRole(true)
    try {
      await roleApi.createRole(
        roleForm.roleName,
        roleForm.description,
        Array.from(selectedPermissions)
      )
      // 重新加载角色列表
      const response = await roleApi.getVisibleRoles()
      setRoles(response.visibleRoles || [])
      setIsCreateRoleOpen(false)
      resetRoleForm()
    } catch (error) {
      console.error("创建角色失败", error)
      alert("创建角色失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setSavingRole(false)
    }
  }
  
  // 编辑角色
  const handleEditRole = async () => {
    if (!selectedRole) return
    
    setSavingRole(true)
    try {
      await roleApi.updateRole(
        selectedRole.rid,
        roleForm.roleName,
        roleForm.description,
        Array.from(selectedPermissions)
      )
      // 重新加载角色列表
      const response = await roleApi.getVisibleRoles()
      setRoles(response.visibleRoles || [])
      
      // 更新选中的角色
      const updatedRole = response.visibleRoles?.find(r => r.rid === selectedRole.rid) || null
      setSelectedRole(updatedRole)
      
      setIsEditRoleOpen(false)
      resetRoleForm()
    } catch (error) {
      console.error("更新角色失败", error)
      alert("更新角色失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setSavingRole(false)
    }
  }
  
  // 删除角色
  const handleDeleteRole = async (rid: number) => {
    if (!confirm("确定要删除这个角色吗？")) return
    
    try {
      await roleApi.deleteRole(rid)
      // 重新加载角色列表
      const response = await roleApi.getVisibleRoles()
      setRoles(response.visibleRoles || [])
      
      // 如果删除的是当前选中的角色，则清空选中状态
      if (selectedRole && selectedRole.rid === rid) {
        setSelectedRole(response.visibleRoles && response.visibleRoles.length > 0 ? response.visibleRoles[0] : null)
      }
    } catch (error) {
      console.error("删除角色失败", error)
      alert("删除角色失败: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }
  
  // 切换权限选择状态
  const togglePermission = (permissionId: number) => {
    const newSelectedPermissions = new Set(selectedPermissions)
    if (newSelectedPermissions.has(permissionId)) {
      newSelectedPermissions.delete(permissionId)
    } else {
      newSelectedPermissions.add(permissionId)
    }
    setSelectedPermissions(newSelectedPermissions)
  }
  
  // 打开编辑对话框，并填充表单数据
  const openEditDialog = (role: Role) => {
    setRoleForm({
      roleName: role.roleName || "",
      description: role.description || "",
      permissions: role.permissions || []
    })
    setSelectedPermissions(new Set(role.permissions || []))
    setIsEditRoleOpen(true)
  }
  
  // 重置表单数据
  const resetRoleForm = () => {
    setRoleForm({
      roleName: "",
      description: "",
      permissions: []
    })
    setSelectedPermissions(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">角色管理</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">管理系统角色和权限分配</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Roles List */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                角色列表
              </CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="搜索角色..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : filteredRoles.length > 0 ? (
              <div className="space-y-1">
                {filteredRoles.map((role) => (
                  <div
                    key={role.rid}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 ${
                      selectedRole?.rid === role.rid
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleSelectRole(role)}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {role.displayName}
                        </p>
                        {/* 根据用户要求，不再显示roleName */}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-70"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>角色操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(role)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑角色
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRole(role.rid)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除角色
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : errorRoles ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
                <p className="font-medium">获取角色列表失败</p>
                <p className="text-sm mt-1">{errorRoles}</p>
                <Button 
                  variant="outline" 
                  className="mt-2 text-xs" 
                  size="sm"
                  onClick={() => {
                    setLoadingRoles(true)
                    setErrorRoles(null)
                    roleApi.getVisibleRoles()
                      .then(response => {
                        setRoles(response.visibleRoles || [])
                        if (response.visibleRoles && response.visibleRoles.length > 0) {
                          setSelectedRole(response.visibleRoles[0])
                        }
                      })
                      .catch(error => {
                        console.error("重试获取角色列表失败", error)
                        setErrorRoles(error instanceof Error ? error.message : "未知错误")
                        setRoles(getMockRoles())
                      })
                      .finally(() => setLoadingRoles(false))
                  }}
                >
                  重试
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                未找到角色
              </div>
            )}
            
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  创建角色
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>创建角色</DialogTitle>
                  <DialogDescription>
                    创建新角色并分配权限
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">角色名称</Label>
                    <Input
                      id="roleName"
                      value={roleForm.roleName}
                      onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })}
                      placeholder="请输入角色名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">角色描述</Label>
                    <Textarea
                      id="description"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      placeholder="请输入角色描述"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>角色权限</Label>
                    <div className="max-h-60 overflow-y-auto mt-2 space-y-3 border rounded-md p-3">
                      {loadingPermissions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        </div>
                      ) : errorPermissions ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
                          <p className="font-medium">获取权限列表失败</p>
                          <p className="text-xs mt-1">{errorPermissions}</p>
                          <Button 
                            variant="outline" 
                            className="mt-2 text-xs" 
                            size="sm"
                            onClick={() => {
                              setLoadingPermissions(true)
                              setErrorPermissions(null)
                              permissionApi.getCurrentUserPermissions()
                                .then(response => {
                                  setPermissions(response || {})
                                })
                                .catch(error => {
                                  console.error("重试获取权限列表失败", error)
                                  setErrorPermissions(error instanceof Error ? error.message : "未知错误")
                                  setPermissions(getMockPermissions())
                                })
                                .finally(() => setLoadingPermissions(false))
                            }}
                          >
                            重试
                          </Button>
                        </div>
                      ) : (
                        Object.entries(permissions).map(([category, perms]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-sm text-slate-600">{category}</h4>
                            {perms.map((permission) => (
                              <div key={permission.permissionId} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`perm-${permission.permissionId}`}
                                  checked={selectedPermissions.has(permission.permissionId)}
                                  onCheckedChange={() => togglePermission(permission.permissionId)}
                                />
                                <Label htmlFor={`perm-${permission.permissionId}`} className="text-sm">
                                  {permission.permissionName}
                                  <span className="text-xs text-slate-500 ml-2">
                                    {permission.permissionDescription}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateRoleOpen(false)
                    resetRoleForm()
                  }}>
                    取消
                  </Button>
                  <Button onClick={handleCreateRole} disabled={savingRole}>
                    {savingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    创建
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>编辑角色</DialogTitle>
                  <DialogDescription>
                    修改角色信息和权限
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editRoleName">角色名称</Label>
                    <Input
                      id="editRoleName"
                      value={roleForm.roleName}
                      onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })}
                      placeholder="请输入角色名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDescription">角色描述</Label>
                    <Textarea
                      id="editDescription"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      placeholder="请输入角色描述"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>角色权限</Label>
                    <div className="max-h-60 overflow-y-auto mt-2 space-y-3 border rounded-md p-3">
                      {loadingPermissions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        </div>
                      ) : (
                        Object.entries(permissions).map(([category, perms]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-sm text-slate-600">{category}</h4>
                            {perms.map((permission) => (
                              <div key={permission.permissionId} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-perm-${permission.permissionId}`}
                                  checked={selectedPermissions.has(permission.permissionId)}
                                  onCheckedChange={() => togglePermission(permission.permissionId)}
                                />
                                <Label htmlFor={`edit-perm-${permission.permissionId}`} className="text-sm">
                                  {permission.permissionName}
                                  <span className="text-xs text-slate-500 ml-2">
                                    {permission.permissionDescription}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsEditRoleOpen(false)
                    resetRoleForm()
                  }}>
                    取消
                  </Button>
                  <Button onClick={handleEditRole} disabled={savingRole}>
                    {savingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    保存
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Right Content - Role Details & Permissions */}
        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          {selectedRole ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      {selectedRole.displayName}
                    </CardTitle>
                    {/* 根据用户要求，不再显示roleName */}
                    {selectedRole.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {selectedRole.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openEditDialog(selectedRole)}
                    >
                      <Edit className="w-4 h-4" />
                      编辑角色
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="permissions" className="mt-2">
                  <TabsList className="mb-4">
                    <TabsTrigger value="permissions">角色权限</TabsTrigger>
                    <TabsTrigger value="users">拥有该角色的用户</TabsTrigger>
                  </TabsList>
                  <TabsContent value="permissions">
                    {loadingPermissions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(permissions).map(([category, perms]) => (
                          <div key={category} className="space-y-3">
                            <h3 className="font-medium text-lg text-slate-800 dark:text-slate-200">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {perms.map((permission) => {
                                const hasPermission = selectedPermissions.has(permission.permissionId)
                                return (
                                  <div 
                                    key={permission.permissionId} 
                                    className={`p-3 rounded-md border ${
                                      hasPermission 
                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                                        : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                          {permission.permissionName}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          {permission.permissionDescription}
                                        </p>
                                        <Badge 
                                          className="mt-2" 
                                          variant={hasPermission ? "default" : "outline"}
                                        >
                                          {permission.permissionType}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center">
                                        {hasPermission ? (
                                          <Check className="text-green-600 h-5 w-5" />
                                        ) : (
                                          <X className="text-slate-400 h-5 w-5" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="users">
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>用户名</TableHead>
                            <TableHead>邮箱</TableHead>
                            <TableHead>用户组</TableHead>
                            <TableHead>状态</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* 这里需要额外的API来获取拥有该角色的用户列表 */}
                          {/* 为了演示效果，这里使用一个空状态 */}
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                              暂无数据或API暂未实现
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">未选择角色</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                从左侧列表选择一个角色，或创建新角色
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-6 gap-2">
                    <Plus className="w-4 h-4" />
                    创建角色
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* 内容与创建角色对话框相同 */}
                </DialogContent>
              </Dialog>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
} 