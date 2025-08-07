/**
 * 节目编辑器类型定义统一导出
 * 
 * 提供所有节目编辑器相关的类型定义，包括：
 * - 素材引用类型
 * - 前端编辑状态类型
 * - VSN格式数据类型
 */

// 素材引用相关类型
export * from './material-ref';

// 前端编辑状态相关类型
export * from './editor-state';

// VSN格式数据相关类型
export * from './vsn-data';

// 重新导出常用类型，便于使用
export type {
  // 核心数据模型
  EditorState,
  ProgramSaveData,
  VSNData,
  
  // 素材相关
  MaterialReference,
  MaterialInfo,
  ItemType,
  MaterialCategory,
  
  // 编辑状态相关
  EditorPage,
  EditorRegion,
  EditorItem,
  ItemProperties,
  CanvasState,
  
  // VSN格式相关
  VSNPage,
  VSNRegion,
  VSNItem,
  VSNValidationResult,
  VSNConversionResult
} from './editor-state';

export type {
  // VSN基础类型
  VSNInformation,
  VSNFileSource,
  VSNLogFont,
  VSNDisplayRect,
  
  // VSN素材类型
  VSNImageItem,
  VSNVideoItem,
  VSNTextItem,
  VSNGifItem,
  VSNWebItem,
  VSNClockItem,
  VSNWeatherItem,
  VSNSensorItem,
  VSNTimerItem,
  
  // VSN工具类
  VSNEffectType,
  VSNDateStyle
} from './vsn-data';

export type {
  // 素材管理
  MaterialStatus,
  MaterialRefValidationResult,
  MaterialRefsBatchValidationResult
} from './material-ref';

// 导出工具函数和常量
export {
  // 素材类型映射
  ITEM_TYPE_MAP,
  MATERIAL_CATEGORY_MAP,
  getItemTypeCategory,
  getCategorySupportedTypes,
  
  // 默认值常量
  DEFAULT_PROGRAM_SIZE,
  DEFAULT_PAGE_DURATION,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_COLOR,
  DEFAULT_BG_COLOR,
  
  // 工具函数
  createDefaultProgram,
  createDefaultPage,
  createDefaultRegion
} from './editor-state';

export {
  // VSN工具类
  VSNColorUtils,
  VSNNumberUtils
} from './vsn-data';

/**
 * API响应通用格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    timestamp: string;
  };
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 通用验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * 通用验证警告
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * API错误代码枚举
 */
export enum ApiErrorCode {
  // 通用错误 (1000-1999)
  INVALID_REQUEST = 'ERR_1001',
  UNAUTHORIZED = 'ERR_1002',
  FORBIDDEN = 'ERR_1003',
  NOT_FOUND = 'ERR_1004',
  INTERNAL_ERROR = 'ERR_1500',
  
  // 素材相关错误 (2000-2999)
  MATERIAL_NOT_FOUND = 'ERR_2001',
  MATERIAL_UPLOAD_FAILED = 'ERR_2002',
  MATERIAL_FORMAT_UNSUPPORTED = 'ERR_2003',
  MATERIAL_SIZE_EXCEEDED = 'ERR_2004',
  MATERIAL_PROCESSING_FAILED = 'ERR_2005',
  MATERIAL_ACCESS_DENIED = 'ERR_2006',
  
  // 节目相关错误 (3000-3999)
  PROGRAM_NOT_FOUND = 'ERR_3001',
  PROGRAM_SAVE_FAILED = 'ERR_3002',
  PROGRAM_VSN_INVALID = 'ERR_3003',
  PROGRAM_PUBLISH_FAILED = 'ERR_3004',
  PROGRAM_VERSION_CONFLICT = 'ERR_3005',
  PROGRAM_MATERIAL_MISSING = 'ERR_3006',
  
  // VSN验证错误 (4000-4999)
  VSN_MISSING_REQUIRED_FIELD = 'ERR_4001',
  VSN_INVALID_DATA_TYPE = 'ERR_4002',
  VSN_INVALID_BUSINESS_RULE = 'ERR_4003',
  VSN_CONVERSION_FAILED = 'ERR_4004'
}

/**
 * 常用类型别名
 */
export type ID = string;
export type Timestamp = string; // ISO 8601 格式
export type HexColor = string; // #FFFFFF 格式
export type VSNColor = string; // 8位十六进制整数字符串
export type Milliseconds = number;
export type Percentage = number; // 0-100
export type Opacity = number; // 0-1