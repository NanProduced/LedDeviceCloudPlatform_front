// 角色类型定义
export interface Role {
  rid: number;
  oid: number;
  roleName: string;
  displayName: string;
  description?: string;
  permissions?: number[];
}

// 角色详情响应类型定义
export interface RoleDetailResponse {
  rid: number;
  roleName: string; // 后端业务用于区分唯一角色的名称，不显示
  displayName: string; // 前端显示的角色名
  description?: string;
  creatorId: number; // 角色创建者用户ID
  creatorName: string; // 角色创建者用户名称
  createTime: string; // 创建时间
  updaterId: number; // 角色更新者用户ID
  updaterName: string; // 角色更新者用户名称
  updateTime: string; // 更新时间
  operationPermissions: OperationPermissionResponse[]; // 角色的操作权限
}

// 权限响应类型定义
export interface PermissionResponse {
  permissionId: number;
  permissionName: string;
  permissionDescription: string;
  permissionType: string;
}

// 操作权限响应类型定义
export interface OperationPermissionResponse {
  operationPermissionId: number;
  operationName: string;
  operationDescription: string;
  operationType: string;
}

// 权限绑定类型
export interface PermissionBinding {
  tgid: number;
  bindingType: 'INCLUDE' | 'EXCLUDE';
  includeChildren: boolean;
  remarks?: string;
}

// 权限表达式请求
export interface PermissionExpressionRequest {
  ugid: number;
  permissionBindings: PermissionBinding[];
  description?: string;
  enableRedundancyOptimization?: boolean;
}

// 权限拒绝请求
export interface PermissionDenyRequest {
  targetType: 'USER' | 'ROLE';
  targetId: number;
  orgId: number;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  reason?: string;
  durationHours?: number;
}

// 用户信息类型定义
export interface UserInfo {
  uid: number;
  username: string;
  oid: number;
  orgName: string;
  roles: Role[];
  ugid: number;
  ugName: string;
  email: string;
  phone: string;
  active: number;  // 账号状态, 0:正常;1:封禁
  createdAt: string;
  updatedAt: string;
}

// 用户列表响应中的用户信息
export interface UserListItem {
  uid: number;
  username: string;
  ugid: number;
  ugName: string;
  email: string;
  active: number; // 0:正常;1:封禁
  roles: Role[];
  createTime: string;
  updateTime: string;
}

// 用户列表分页请求参数
export interface UserListRequest {
  ugid: number;
  includeSubGroups?: boolean;
  userNameKeyword?: string;
  emailKeyword?: string;
  status?: number;
}

// 分页请求包装
export interface PageRequest<T> {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: T;
}

// 分页响应包装
export interface PageResponse<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  records: T[];
  hasNext: boolean;
  hasPrevious: boolean;
}

// 用户组树节点
export interface UserGroupTreeNode {
  ugid: number;
  ugName: string;
  parent: number | null;
  path: string;
  pathMap: Record<string, string>;
  children: UserGroupTreeNode[];
}

// 组织信息
export interface Organization {
  oid: number;
  orgName: string;
  suffix: number;
}

// 用户组树响应
export interface UserGroupTreeResponse {
  organization: Organization;
  root: UserGroupTreeNode;
}

// 创建用户请求
export interface CreateUserRequest {
  ugid: number;
  roles: number[];
  username: string;
  password: string;
  email: string;
  phone: string;
}

// 创建用户组请求
export interface CreateUserGroupRequest {
  parentUgid: number;
  userGroupName: string;
  description?: string;
}

// 修改密码请求类型
export interface ModifyPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// 多语言支持类型
export interface Translations {
  [key: string]: string;
}

export interface LanguageConfig {
  zh: Translations;
  en: Translations;
}

// ========== Material 素材管理相关类型定义 ==========

// Material Tree 前端显示节点类型
export interface MaterialTreeNode {
  id: string
  name: string
  type: "ALL" | "GROUP" | "NORMAL" | "PUBLIC" | "SHARED" | "SHARED_FOLDER"
  icon: string
  ugid?: number | null
  fid?: number | null
  isOwn?: boolean
  isVirtual?: boolean
  sharedBy?: string
  children: MaterialTreeNode[]
}

// 素材类型
export interface Material {
  mid: number
  materialName: string
  fileId: string
  materialType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'
  fileSize: number
  fileSizeFormatted: string
  mimeType: string
  fileExtension: string
  fileStatus: number
  fileStatusDesc: string
  processProgress?: number
  description?: string
  usageCount: number
  ugid: number
  fid: number
  uploadedBy: number
  uploaderName: string
  uploadTime: string
  createTime: string
  updateTime: string
}

// 分享素材类型
export interface SharedMaterial extends Material {
  shareId: number
  sharedFrom: number
  sharedFromGroupName: string
  sharedTo: number
  sharedToGroupName: string
  sharedBy: number
  sharedByUserName: string
  sharedTime: string
  resourceType: number
} 