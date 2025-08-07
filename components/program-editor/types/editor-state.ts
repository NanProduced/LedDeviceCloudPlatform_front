/**
 * 前端编辑状态类型定义
 * 
 * 这些类型用于管理节目编辑器的前端状态，便于编辑操作和Fabric.js集成
 * 特点：使用数值类型、嵌套对象结构、包含UI状态
 */

import { ItemType, MaterialReference } from './material-ref';

/**
 * 循环播放类型
 */
export type LoopType = 0 | 1; // 0=指定播放时长，1=自动计算播放时长

/**
 * 文本对齐方式
 */
export type TextAlign = 0 | 1 | 2; // 0=居左，1=居中，2=居右

/**
 * 节目基础信息
 */
export interface ProgramInfo {
  /** 节目ID（可选，创建时为空） */
  id?: string;
  
  /** 节目名称 */
  name: string;
  
  /** 节目宽度（像素） */
  width: number;
  
  /** 节目高度（像素） */
  height: number;
  
  /** 节目描述 */
  description?: string;
}

/**
 * 背景文件信息
 */
export interface EditorBgFile {
  /** 文件路径 */
  filePath: string;
  
  /** 是否相对路径 */
  isRelative: boolean;
  
  /** 文件MD5 */
  md5?: string;
}

/**
 * 背景音频信息
 */
export interface EditorBgAudio {
  /** 音频文件路径 */
  filePath: string;
  
  /** 音量 (0.0-1.0) */
  volume: number;
  
  /** 是否相对路径 */
  isRelative: boolean;
  
  /** 文件MD5 */
  md5?: string;
}

/**
 * 节目页面信息
 */
export interface EditorPage {
  /** 页面ID */
  id: string;
  
  /** 页面名称 */
  name: string;
  
  /** 播放时长（毫秒） */
  duration: number;
  
  /** 循环播放类型 */
  loopType: LoopType;
  
  /** 背景颜色（十六进制格式，如 #000000） */
  bgColor: string;
  
  /** 背景文件 */
  bgFile?: EditorBgFile;
  
  /** 背景音频列表 */
  bgAudios?: EditorBgAudio[];
  
  /** 区域列表 */
  regions: EditorRegion[];
}

/**
 * 区域矩形信息
 */
export interface EditorRect {
  /** X坐标 */
  x: number;
  
  /** Y坐标 */
  y: number;
  
  /** 宽度 */
  width: number;
  
  /** 高度 */
  height: number;
  
  /** 边框宽度 */
  borderWidth: number;
  
  /** 边框颜色 */
  borderColor?: string;
}

/**
 * 节目区域信息
 */
export interface EditorRegion {
  /** 区域ID */
  id: string;
  
  /** 区域名称 */
  name: string;
  
  /** 区域矩形 */
  rect: EditorRect;
  
  /** 素材项列表 */
  items: EditorItem[];
  
  /** 是否排程区域 */
  isScheduleRegion: boolean;
  
  /** 区域层级 */
  layer?: number;
  
  /** 区域类型（如同步窗口等） */
  regionType?: 'sync_program' | 'singleline_scroll' | 'normal';
}

/**
 * 位置信息
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 尺寸信息
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 基础素材属性
 */
export interface BaseItemProperties {
  /** 背景色 */
  backColor?: string;
  
  /** 播放时长（毫秒） */
  duration?: number;
  
  /** 是否可见 */
  visible?: boolean;
  
  /** 不透明度 (0-1) */
  opacity?: number;
  
  /** 旋转角度 */
  rotation?: number;
  
  /** Z-Index层级 */
  zIndex?: number;
}

/**
 * 图片素材属性
 */
export interface ImageItemProperties extends BaseItemProperties {
  /** 透明度 (0-1) */
  alpha?: number;
  
  /** 是否保持宽高比 */
  reserveAS?: boolean;
  
  /** 入场特效 */
  effect?: EffectConfig;
}

/**
 * 视频素材属性
 */
export interface VideoItemProperties extends BaseItemProperties {
  /** 是否保持宽高比 */
  reserveAS?: boolean;
  
  /** 是否自动播放 */
  autoPlay?: boolean;
  
  /** 是否循环播放 */
  loop?: boolean;
  
  /** 音量 (0-1) */
  volume?: number;
}

/**
 * GIF素材属性
 */
export interface GifItemProperties extends BaseItemProperties {
  /** 播放次数 */
  playTimes?: number;
  
  /** 透明度 (0-1) */
  alpha?: number;
  
  /** 是否保持宽高比 */
  reserveAS?: boolean;
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体大小 */
  size: number;
  
  /** 字体族 */
  family?: string;
  
  /** 字体粗细 */
  weight?: 'normal' | 'bold' | number;
  
  /** 是否斜体 */
  italic?: boolean;
  
  /** 是否下划线 */
  underline?: boolean;
}

/**
 * 文本渐变配置
 */
export interface TextGradientConfig {
  /** 渐变开始X坐标 */
  startX?: number;
  
  /** 渐变开始Y坐标 */
  startY?: number;
  
  /** 渐变结束X坐标 */
  endX?: number;
  
  /** 渐变结束Y坐标 */
  endY?: number;
  
  /** 渐变颜色列表 */
  colors: string[];
  
  /** 渐变位置列表 (0-1) */
  positions: number[];
  
  /** 渐变模式 */
  mode?: 'clamp' | 'repeat' | 'mirror';
}

/**
 * 文本阴影配置
 */
export interface TextShadowConfig {
  /** 横向偏移 */
  dx: number;
  
  /** 纵向偏移 */
  dy: number;
  
  /** 模糊半径 */
  radius: number;
  
  /** 阴影颜色 */
  color: string;
}

/**
 * 文本素材属性
 */
export interface TextItemProperties extends BaseItemProperties {
  /** 文本内容 */
  text: string;
  
  /** 文字颜色 */
  textColor: string;
  
  /** 字体配置 */
  font: FontConfig;
  
  /** 文本对齐方式 */
  textAlign?: TextAlign;
  
  /** 字母间距 */
  letterSpacing?: number;
  
  /** 行高 */
  lineHeight?: number;
  
  /** 是否滚动 */
  isScroll?: boolean;
  
  /** 滚动速度（像素/秒） */
  scrollSpeed?: number;
  
  /** 是否首尾相连 */
  isHeadConnectTail?: boolean;
  
  /** 播放次数 */
  repeatCount?: number;
  
  /** 是否按时间播放 */
  isScrollByTime?: boolean;
  
  /** 是否按帧滚动 */
  isSpeedByFrame?: boolean;
  
  /** 按帧滚动速度 */
  speedByFrame?: number;
  
  /** 内边框颜色 */
  outlineColor?: string;
  
  /** 外边框颜色 */
  outlineColor2?: string;
  
  /** 内边框宽度 */
  outlineWidth?: number;
  
  /** 外边框宽度 */
  outlineWidth2?: number;
  
  /** 文本渐变 */
  textGradient?: TextGradientConfig;
  
  /** 文本阴影 */
  textShadow?: TextShadowConfig;
  
  /** 是否使用线性渐变着色器 */
  useLinearGradient?: boolean;
}

/**
 * 网页素材属性
 */
export interface WebItemProperties extends BaseItemProperties {
  /** 网页URL */
  url: string;
  
  /** 透明度 (0-1) */
  alpha?: number;
  
  /** 是否本地网页 */
  isLocal?: boolean;
}

/**
 * 时钟素材属性
 */
export interface ClockItemProperties extends BaseItemProperties {
  /** 是否模拟时钟 */
  isAnalog?: boolean;
  
  /** 时区偏移（小时） */
  timezone?: number;
  
  /** 时区偏移（分钟） */
  zoneBias?: number;
  
  /** 时区ID */
  zoneDescripId?: string;
  
  /** 是否使用夏令时 */
  useDaylightTime?: boolean;
  
  /** 固定文本 */
  fixedText?: string;
  
  /** 文本对齐方式 */
  textAlign?: TextAlign;
  
  /** 字体配置 */
  font?: FontConfig;
  
  /** 文字颜色 */
  textColor?: string;
}

/**
 * 传感器素材属性
 */
export interface SensorItemProperties extends BaseItemProperties {
  /** 地区名称（气象用） */
  regionName?: string;
  
  /** 地区代码（气象用） */
  regionCode?: string;
  
  /** 服务器类型（气象用） */
  serverType?: number;
  
  /** 是否使用华氏度 */
  useFahrenheit?: boolean;
  
  /** 字体配置 */
  font?: FontConfig;
  
  /** 文字颜色 */
  textColor?: string;
  
  /** 文本对齐方式 */
  textAlign?: TextAlign;
  
  /** 前缀文本 */
  prefix?: string;
  
  /** 后缀文本 */
  suffix?: string;
}

/**
 * 特效配置
 */
export interface EffectConfig {
  /** 特效类型ID */
  type: number;
  
  /** 特效时长（毫秒） */
  duration: number;
}

/**
 * 排程配置
 */
export interface ScheduleConfig {
  /** 是否限制时间 */
  isLimitTime: boolean;
  
  /** 开始时间 */
  startTime: string;
  
  /** 结束时间 */
  endTime: string;
  
  /** 是否限制日期 */
  isLimitDate: boolean;
  
  /** 开始日期 */
  startDay: string;
  
  /** 开始日期时间 */
  startDayTime: string;
  
  /** 结束日期 */
  endDay: string;
  
  /** 结束日期时间 */
  endDayTime: string;
  
  /** 是否限制星期 */
  isLimitWeek: boolean;
  
  /** 星期限制数组 */
  limitWeek: string;
}

/**
 * 素材属性联合类型
 * 根据ItemType条件化属性类型
 */
export type ItemProperties<T extends ItemType = ItemType> =
  T extends ItemType.IMAGE ? ImageItemProperties :
  T extends ItemType.VIDEO ? VideoItemProperties :
  T extends ItemType.GIF ? GifItemProperties :
  T extends ItemType.SINGLE_LINE_TEXT | ItemType.MULTI_LINE_TEXT | ItemType.SINGLE_COLUMN_TEXT ? TextItemProperties :
  T extends ItemType.WEB_STREAM ? WebItemProperties :
  T extends ItemType.CLOCK | ItemType.EXQUISITE_CLOCK ? ClockItemProperties :
  T extends ItemType.WEATHER | ItemType.HUMIDITY | ItemType.TEMPERATURE | ItemType.NOISE | ItemType.AIR_QUALITY | ItemType.SMOKE ? SensorItemProperties :
  BaseItemProperties;

/**
 * 素材项信息
 */
export interface EditorItem<T extends ItemType = ItemType> {
  /** 素材项ID */
  id: string;
  
  /** 素材类型 */
  type: T;
  
  /** 素材项名称 */
  name?: string;
  
  /** 位置信息 */
  position: Position;
  
  /** 尺寸信息 */
  size: Size;
  
  /** 类型特定属性 */
  properties: ItemProperties<T>;
  
  /** 素材引用（如果是文件素材） */
  materialRef?: MaterialReference;
  
  /** Fabric.js序列化数据 */
  fabricData?: any;
  
  /** 特效配置 */
  effect?: EffectConfig;
  
  /** 排程配置（排程区域中使用） */
  schedule?: ScheduleConfig;
}

/**
 * Fabric.js序列化对象
 */
export interface SerializedFabricObject {
  /** 对象ID */
  id: string;
  
  /** 对象类型 */
  type: string; // 'image', 'text', 'rect' 等
  
  /** Fabric.js属性 */
  fabricProperties: any; // Fabric.js的toObject()结果
  
  /** 编辑器扩展属性 */
  editorProperties: ItemProperties;
  
  /** 素材引用 */
  materialRef?: MaterialReference;
}

/**
 * 画布状态
 */
export interface CanvasState {
  /** 序列化的对象列表 */
  objects: SerializedFabricObject[];
  
  /** 缩放比例 */
  zoom: number;
  
  /** 水平平移 */
  panX: number;
  
  /** 垂直平移 */
  panY: number;
}

/**
 * 编辑器状态
 * 包含节目编辑的完整前端状态
 */
export interface EditorState {
  /** 节目基础信息 */
  program: ProgramInfo;
  
  /** 页面列表 */
  pages: EditorPage[];
  
  /** 当前页面索引 */
  currentPageIndex: number;
  
  /** 画布状态（每页独立） */
  canvasStates: Record<string, CanvasState>;
  
  /** 选中的对象ID列表 */
  selectedObjectIds?: string[];
  
  /** 当前激活的工具 */
  activeTool?: string;
  
  /** 撤销堆栈 */
  undoStack?: any[];
  
  /** 重做堆栈 */
  redoStack?: any[];
}

/**
 * 节目保存数据
 * 包含完整的节目信息，用于保存和加载
 */
export interface ProgramSaveData {
  // 基础信息
  id?: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  
  // 版本信息
  version: string;
  status: 'draft' | 'published';
  
  // 时间信息
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // 用户信息
  createdBy: string;
  updatedBy: string;
  
  // 核心数据
  editorState: EditorState;
  materialRefs: MaterialReference[];
  
  // 元数据
  metadata: {
    totalDuration: number;
    pageCount: number;
    objectCount: number;
    fileSize: number;
  };
}

/**
 * 节目列表项
 */
export interface ProgramListItem {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  version: string;
  
  // 时间信息
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // 用户信息
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  updatedByName: string;
  
  // 元数据
  metadata: {
    width: number;
    height: number;
    totalDuration: number;
    pageCount: number;
    objectCount: number;
  };
  
  // 缩略图
  thumbnail?: string;
}

/**
 * 默认值常量
 */
export const DEFAULT_PROGRAM_SIZE = {
  width: 1920,
  height: 1080
} as const;

export const DEFAULT_PAGE_DURATION = 5000; // 5秒

export const DEFAULT_FONT_SIZE = 24;

export const DEFAULT_TEXT_COLOR = '#000000';

export const DEFAULT_BG_COLOR = '#FFFFFF';

/**
 * 创建默认的节目信息
 */
export function createDefaultProgram(name: string = '新建节目'): ProgramInfo {
  return {
    name,
    width: DEFAULT_PROGRAM_SIZE.width,
    height: DEFAULT_PROGRAM_SIZE.height
  };
}

/**
 * 创建默认的页面
 */
export function createDefaultPage(name: string = '页面1'): EditorPage {
  return {
    id: `page_${Date.now()}`,
    name,
    duration: DEFAULT_PAGE_DURATION,
    loopType: 0,
    bgColor: DEFAULT_BG_COLOR,
    regions: []
  };
}

/**
 * 创建默认的区域
 */
export function createDefaultRegion(name: string = '区域1'): EditorRegion {
  return {
    id: `region_${Date.now()}`,
    name,
    rect: {
      x: 0,
      y: 0,
      width: DEFAULT_PROGRAM_SIZE.width,
      height: DEFAULT_PROGRAM_SIZE.height,
      borderWidth: 0
    },
    items: [],
    isScheduleRegion: false
  };
}