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