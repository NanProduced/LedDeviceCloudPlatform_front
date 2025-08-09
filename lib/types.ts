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

// ========== 文件上传相关类型定义 ==========

// 文件上传请求类型
export interface FileUploadRequest {
  folderId?: string      // 目标文件夹ID
  ugid?: number          // 目标用户组根目录ID（当选择的是用户组根目录时传递）
  materialName?: string  // 素材名称，最大200字符
  description?: string   // 文件描述，最大500字符
}

// 文件存在性检查请求
export interface FileExistenceCheckRequest {
  md5Hash: string
  organizationId: string
}

// 文件元数据类型
export interface FileMetadata {
  duration?: number      // 视频时长（秒）
  width?: number        // 视频宽度
  height?: number       // 视频高度
  frameRate?: number    // 帧率
  bitrate?: number      // 比特率
  codec?: string        // 编码格式
  sampleRate?: number   // 音频采样率
  channels?: number     // 音频通道数
  dpi?: number          // 图片DPI
  colorSpace?: string   // 颜色空间
}

// 文件上传响应类型
export interface FileUploadResponse {
  fileId: string
  originalFilename: string
  fileSize: number
  fileType: string
  mimeType: string
  md5Hash: string
  storagePath: string
  accessUrl: string
  thumbnailUrl?: string
  status: 'PENDING' | 'UPLOADING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  taskId: string
  transcodingTaskId?: string
  uploadTime: string
  metadata?: FileMetadata
  errorMessage?: string
  instantUpload: boolean  // 是否为秒传
}

// 文件存在性检查响应
export interface FileExistenceCheckResponse {
  exists: boolean
  existingFile?: FileUploadResponse
}

// 任务初始化响应
export interface TaskInitResponse {
  taskId: string
  taskType: string
  status: string
  filename: string
  fileSize: number
  organizationId: string
  userId: string
  estimatedDuration: string
  createTime: string
  progressSubscriptionUrl: string
  message: string
}

// 文件类型信息
export interface FileTypeInfo {
  category: string
  extensions: string[]
  mimeTypes: string[]
  maxSize: number
  supportsTranscoding: boolean
  supportsPreview: boolean
  supportsThumbnail: boolean
  description: string
}

// 系统配置信息
export interface SystemConfig {
  maxConcurrentUploads: number
  recommendedChunkSize: number
  storageStrategies: string[]
  tempFileRetentionDays: number
  virusScanEnabled: boolean
  contentRecognitionEnabled: boolean
}

// 支持的文件类型响应
export interface SupportedFileTypesResponse {
  supportedTypes: Record<string, FileTypeInfo>
  sizeLimits: Record<string, number>
  transcodingFormats: Record<string, string[]>
  systemConfig: SystemConfig
}

// 上传质量指标
export interface QualityMetrics {
  avgSpeed: number     // 平均上传速度
  maxSpeed: number     // 最大上传速度
  minSpeed: number     // 最小上传速度
  stability: number    // 连接稳定性
  retransmissionRate: number  // 重传率
}

// 上传进度响应
export interface UploadProgressResponse {
  uploadId: string
  fileName: string
  status: string
  progress: number            // 上传进度百分比
  uploadedSize: number       // 已上传大小
  totalSize: number          // 总文件大小
  uploadSpeed: number        // 上传速度
  estimatedTimeRemaining: number  // 预计剩余时间
  uploadedChunks: number     // 已上传分块数
  totalChunks: number        // 总分块数
  failedChunks: number[]     // 失败分块列表
  startTime: string          // 上传开始时间
  lastUpdateTime: string     // 最后更新时间
  errorMessage?: string      // 错误信息
  retryCount: number         // 重试次数
  qualityMetrics: QualityMetrics
}

// 文件上传统计
export interface FileUploadStatistics {
  organizationId: string
  totalFiles: number
  totalSize: number
  todayUploads: number
  thisWeekUploads: number
  thisMonthUploads: number
} 