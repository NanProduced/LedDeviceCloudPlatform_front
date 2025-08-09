/**
 * 素材引用相关类型定义
 * 
 * 这些类型用于管理节目中对素材的引用，确保素材的一致性和可访问性
 */

/**
 * VSN素材类型枚举
 * 对应VSN格式中的Item.Type字段
 */
export enum ItemType {
  IMAGE = 2,              // 图片
  VIDEO = 3,              // 视频
  SINGLE_LINE_TEXT = 4,   // 单行文本
  MULTI_LINE_TEXT = 5,    // 多行文本
  GIF = 6,                // GIF动画
  TV_CARD = 8,            // 电视卡/采集卡/摄像头
  CLOCK = 9,              // 普通时钟
  DOC = 11,               // 文档
  EXCEL = 12,             // Excel
  PPT = 13,               // PowerPoint
  WEATHER = 14,           // 中国气象、全球气象
  TIMER = 15,             // 计时器
  EXQUISITE_CLOCK = 16,   // 精美时钟
  HUMIDITY = 21,          // 湿度
  TEMPERATURE = 22,       // 温度
  NOISE = 23,             // 噪音
  AIR_QUALITY = 24,       // 空气质量
  WEB_STREAM = 27,        // 网页、流媒体
  SMOKE = 28,             // 烟雾
  SENSOR_TIP = 29,        // 显示没有传感器时的提示文字
  SENSOR_INITIAL = 30,    // 传感器初始值
  SINGLE_COLUMN_TEXT = 102 // 单列文本
}

/**
 * 素材分类类型
 * 用于前端UI的分类显示
 */
export type MaterialCategory = 
  | 'image'     // 图片类
  | 'video'     // 视频类
  | 'text'      // 文本类
  | 'web'       // 网页类
  | 'clock'     // 时钟类
  | 'sensor'    // 传感器类
  | 'document'  // 文档类
  | 'other';    // 其他类型

/**
 * 素材处理状态
 */
export enum MaterialStatus {
  PROCESSING = 'processing', // 处理中
  READY = 'ready',          // 就绪
  ERROR = 'error'           // 错误
}

/**
 * 素材引用信息
 * 用于在节目中引用具体的素材文件
 */
export interface MaterialReference {
  /** 素材ID */
  materialId: string;
  
  /** 素材名称 */
  materialName: string;
  
  /** 素材类型（VSN格式） */
  materialType: ItemType;
  
  /** 素材分类（前端使用） */
  category: MaterialCategory;
  
  // 文件信息
  /** 文件相对路径 */
  filePath: string;
  
  /** 完整访问URL */
  accessUrl: string;
  
  /** 文件MD5哈希值 */
  md5Hash: string;
  
  /** 原始文件名 */
  originName: string;
  
  // 元数据
  /** 文件大小（字节） */
  fileSize: number;
  
  /** 图片/视频尺寸 */
  dimensions?: {
    width: number;
    height: number;
  };
  
  /** 视频/音频时长（毫秒） */
  duration?: number;
  
  /** 文件格式 */
  format?: string;
  
  // 引用配置
  /** 是否使用相对路径 */
  isRelative: boolean;
  
  /** 转换后路径（如有） */
  convertPath?: string;
}

/**
 * 完整的素材信息
 * 包含素材的所有详细信息和管理数据
 */
export interface MaterialInfo {
  /** 素材ID */
  id: string;
  
  /** 素材名称 */
  name: string;
  
  /** 素材类型 */
  type: ItemType;
  
  /** 素材分类 */
  category: MaterialCategory;
  
  // 文件信息
  /** 文件路径 */
  filePath: string;
  
  /** 访问URL */
  accessUrl: string;
  
  /** MD5哈希值 */
  md5Hash: string;
  
  /** 原始文件名 */
  originName: string;
  
  /** 文件大小 */
  fileSize: number;
  
  // 元数据
  metadata: {
    /** 文件格式 */
    format: string;
    
    /** 尺寸信息 */
    dimensions?: {
      width: number;
      height: number;
    };
    
    /** 时长（毫秒） */
    duration?: number;
    
    /** 比特率 */
    bitrate?: number;
    
    /** 帧率（视频） */
    fps?: number;
  };
  
  // 管理信息
  /** 创建时间 */
  createdAt: string;
  
  /** 更新时间 */
  updatedAt: string;
  
  /** 创建者ID */
  createdBy: string;
  
  /** 标签 */
  tags?: string[];
  
  /** 描述 */
  description?: string;
  
  // 状态信息
  /** 处理状态 */
  status: MaterialStatus;
  
  /** 处理进度 (0-100) */
  processingProgress?: number;
  
  /** 错误信息 */
  errorMessage?: string;

  /** 原始文件状态码（与素材管理列表对齐：0=处理中,1=已完成,2=失败 等后端定义） */
  fileStatus?: number;

  /** 原始文件状态描述（用于UI呈现的一致性判断） */
  fileStatusDesc?: string;
}

/**
 * 素材分类信息
 * 用于素材库的分类展示
 */
export interface MaterialCategory {
  /** 分类标识 */
  key: MaterialCategory;
  
  /** 分类名称 */
  label: string;
  
  /** 分类描述 */
  description: string;
  
  /** 支持的VSN类型 */
  supportedTypes: ItemType[];
  
  /** 图标名称 */
  icon?: string;
  
  /** 该分类下的素材数量 */
  count: number;
}

/**
 * 素材引用验证结果
 */
export interface MaterialRefValidationResult {
  /** 素材ID */
  materialId: string;
  
  /** 是否有效 */
  isValid: boolean;
  
  /** 当前有效的访问URL */
  currentUrl?: string;
  
  /** 当前文件MD5 */
  currentMd5?: string;
  
  /** 验证失败原因 */
  error?: string;
}

/**
 * 批量素材引用验证结果
 */
export interface MaterialRefsBatchValidationResult {
  /** 验证结果列表 */
  results: MaterialRefValidationResult[];
  
  /** 无效引用数量 */
  invalidCount: number;
  
  /** 有效引用数量 */
  validCount: number;
}

/**
 * 素材类型映射配置
 */
export const ITEM_TYPE_MAP = {
  [ItemType.IMAGE]: '图片',
  [ItemType.VIDEO]: '视频',
  [ItemType.SINGLE_LINE_TEXT]: '单行文本',
  [ItemType.MULTI_LINE_TEXT]: '多行文本',
  [ItemType.GIF]: 'GIF',
  [ItemType.TV_CARD]: '电视卡/采集卡/摄像头',
  [ItemType.CLOCK]: '普通时钟',
  [ItemType.DOC]: '文档',
  [ItemType.EXCEL]: 'Excel',
  [ItemType.PPT]: 'PowerPoint',
  [ItemType.WEATHER]: '气象',
  [ItemType.TIMER]: '计时器',
  [ItemType.EXQUISITE_CLOCK]: '精美时钟',
  [ItemType.HUMIDITY]: '湿度',
  [ItemType.TEMPERATURE]: '温度',
  [ItemType.NOISE]: '噪音',
  [ItemType.AIR_QUALITY]: '空气质量',
  [ItemType.WEB_STREAM]: '网页/流媒体',
  [ItemType.SMOKE]: '烟雾',
  [ItemType.SENSOR_TIP]: '传感器提示文字',
  [ItemType.SENSOR_INITIAL]: '传感器初始值',
  [ItemType.SINGLE_COLUMN_TEXT]: '单列文本'
} as const;

/**
 * 素材分类映射配置
 */
export const MATERIAL_CATEGORY_MAP: Record<MaterialCategory, {
  label: string;
  description: string;
  supportedTypes: ItemType[];
}> = {
  image: {
    label: '图片',
    description: '支持 JPG、PNG、BMP 等格式',
    supportedTypes: [ItemType.IMAGE]
  },
  video: {
    label: '视频',
    description: '支持 MP4、AVI、GIF 等格式',
    supportedTypes: [ItemType.VIDEO, ItemType.GIF]
  },
  text: {
    label: '文本',
    description: '支持单行、多行、滚动文本',
    supportedTypes: [ItemType.SINGLE_LINE_TEXT, ItemType.MULTI_LINE_TEXT, ItemType.SINGLE_COLUMN_TEXT]
  },
  web: {
    label: '网页',
    description: '支持网页、流媒体内容',
    supportedTypes: [ItemType.WEB_STREAM]
  },
  clock: {
    label: '时钟',
    description: '支持数字、模拟时钟',
    supportedTypes: [ItemType.CLOCK, ItemType.EXQUISITE_CLOCK, ItemType.TIMER]
  },
  sensor: {
    label: '传感器',
    description: '支持各种环境传感器',
    supportedTypes: [
      ItemType.WEATHER,
      ItemType.HUMIDITY,
      ItemType.TEMPERATURE,
      ItemType.NOISE,
      ItemType.AIR_QUALITY,
      ItemType.SMOKE,
      ItemType.SENSOR_TIP,
      ItemType.SENSOR_INITIAL
    ]
  },
  document: {
    label: '文档',
    description: '支持 DOC、Excel、PPT 等格式',
    supportedTypes: [ItemType.DOC, ItemType.EXCEL, ItemType.PPT]
  },
  other: {
    label: '其他',
    description: '其他类型素材',
    supportedTypes: [ItemType.TV_CARD]
  }
};

/**
 * 根据ItemType获取MaterialCategory
 */
export function getItemTypeCategory(itemType: ItemType): MaterialCategory {
  for (const [category, config] of Object.entries(MATERIAL_CATEGORY_MAP)) {
    if (config.supportedTypes.includes(itemType)) {
      return category as MaterialCategory;
    }
  }
  return 'other';
}

/**
 * 根据MaterialCategory获取支持的ItemType列表
 */
export function getCategorySupportedTypes(category: MaterialCategory): ItemType[] {
  return MATERIAL_CATEGORY_MAP[category]?.supportedTypes || [];
}