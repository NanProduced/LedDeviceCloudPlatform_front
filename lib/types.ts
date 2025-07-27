// 角色类型定义
export interface Role {
  rid: number;
  oid: number;
  roleName: string;
  displayName: string;
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