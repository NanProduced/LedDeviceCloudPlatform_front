/**
 * 重新设计的节目编辑器类型定义
 * 基于VSN规范，简化架构，专注于LED显示屏内容编辑
 */

// ============================================================================
// 基础类型定义
// ============================================================================

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rectangle extends Position, Dimensions {}

export interface Color {
  value: string; // 十六进制颜色值，如 "#FF0000"
  alpha?: number; // 透明度 0-1
}

export interface Duration {
  milliseconds: number;
}

// ============================================================================
// 素材引用类型
// ============================================================================

export interface MaterialReference {
  materialId: string;
  fileId?: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  dimensions?: Dimensions;
  duration?: Duration; // 视频/GIF的播放时长
  thumbnailUrl?: string;
}

// ============================================================================
// VSN Item Types (基于VSN文档)
// ============================================================================

export type VSNItemType = 
  | 2   // 图片
  | 3   // 视频  
  | 4   // 单行文本
  | 5   // 多行文本
  | 6   // GIF
  | 9   // 普通时钟
  | 14  // 天气
  | 15  // 计时器
  | 16  // 精美时钟
  | 21  // 湿度
  | 22  // 温度
  | 23  // 噪音
  | 24  // 空气质量
  | 27  // 网页/流媒体
  | 28  // 烟雾
  | 102; // 单列文本

// ============================================================================
// 编辑器项目类型 (统一的编辑器对象模型)
// ============================================================================

export interface BaseEditorItem {
  id: string;
  type: VSNItemType;
  name: string;
  position: Position;
  dimensions: Dimensions;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  rotation?: number;
  opacity?: number;
  preserveAspectRatio?: boolean; // 是否保持等比例缩放（影响画布渲染与缩放手柄行为）
}

// 图片项目
export interface ImageEditorItem extends BaseEditorItem {
  type: 2;
  materialRef: MaterialReference;
  preserveAspectRatio: boolean;
  effects?: VisualEffect[];
}

// 视频项目
export interface VideoEditorItem extends BaseEditorItem {
  type: 3;
  materialRef: MaterialReference;
  autoPlay: boolean;
  loop: boolean;
  volume: number;
  playDuration?: Duration;
}

// 文本项目
export interface TextEditorItem extends BaseEditorItem {
  type: 4 | 5 | 102;
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: Color;
  backgroundColor?: Color;
  textAlign: 'left' | 'center' | 'right';
  lineHeight?: number;
  scrolling?: TextScrollSettings;
  border?: BorderSettings;
}

// 时钟项目
export interface ClockEditorItem extends BaseEditorItem {
  type: 9 | 16;
  clockType: 'digital' | 'analog';
  timeFormat: '12h' | '24h';
  showDate: boolean;
  showSeconds: boolean;
  fontSize?: number;
  color?: Color;
  timezone?: string;
}

// 天气项目
export interface WeatherEditorItem extends BaseEditorItem {
  type: 14;
  cityCode: string;
  showTemperature: boolean;
  showWeatherIcon: boolean;
  showWind: boolean;
  showHumidity: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  fontSize?: number;
  color?: Color;
}

// 传感器项目 (温度、湿度、噪音、空气质量等)
export interface SensorEditorItem extends BaseEditorItem {
  type: 21 | 22 | 23 | 24 | 28;
  sensorId?: string;
  unit: string;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: Color;
  warningThreshold?: number;
  warningColor?: Color;
}

// 网页项目
export interface WebEditorItem extends BaseEditorItem {
  type: 27;
  url: string;
  isLocal: boolean;
  localFile?: MaterialReference;
  refreshInterval?: number;
  enableJavaScript: boolean;
}

// GIF项目
export interface GifEditorItem extends BaseEditorItem {
  type: 6;
  materialRef: MaterialReference;
  playTimes: number; // 播放次数
  preserveAspectRatio: boolean;
}

// 计时器项目
export interface TimerEditorItem extends BaseEditorItem {
  type: 15;
  targetDateTime: string; // ISO日期字符串
  isCountdown: boolean; // true=倒计时, false=正计时
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  fontSize?: number;
  color?: Color;
  prefix?: string;
}

// 联合类型
export type EditorItem = 
  | ImageEditorItem
  | VideoEditorItem  
  | TextEditorItem
  | ClockEditorItem
  | WeatherEditorItem
  | SensorEditorItem
  | WebEditorItem
  | GifEditorItem
  | TimerEditorItem;

// ============================================================================
// 视觉效果和样式
// ============================================================================

export interface VisualEffect {
  type: 'fade-in' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-in' | 'rotate';
  duration: number; // 毫秒
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface TextScrollSettings {
  enabled: boolean;
  direction: 'left' | 'right' | 'up' | 'down';
  speed: number; // 像素/秒
  pauseOnHover?: boolean;
  repeat: boolean;
}

export interface BorderSettings {
  width: number;
  color: Color;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  colors: Color[];
  direction?: number; // 角度 (仅linear)
  centerX?: number; // 中心点 (仅radial)
  centerY?: number;
}

// ============================================================================
// 区域和页面
// ============================================================================

export interface EditorRegion {
  id: string;
  name: string;
  bounds: Rectangle;
  borderWidth: number;
  borderColor: Color;
  backgroundColor?: Color;
  items: EditorItem[];
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

export interface EditorPage {
  id: string;
  name: string;
  duration: Duration; // 页面播放时长
  autoLoop: boolean; // 是否自动循环
  backgroundColor: Color;
  backgroundImage?: MaterialReference;
  regions: EditorRegion[];
  transitions?: PageTransition[];
}

export interface PageTransition {
  type: 'fade' | 'slide' | 'push' | 'cover';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

// ============================================================================
// 节目信息
// ============================================================================

export interface ProgramInfo {
  id?: string;
  name: string;
  description: string;
  width: number;
  height: number;
  duration?: Duration; // 总播放时长（可选）
  backgroundColor?: Color; // 可选
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

// ============================================================================
// 编辑器状态
// ============================================================================

export interface EditorState {
  program: ProgramInfo;
  pages: EditorPage[];
  currentPageIndex: number;
  selectedItems: string[]; // 选中的item IDs
  selectedRegions: string[]; // 选中的region IDs
  clipboard: EditorItem[]; // 复制的项目
  history: EditorHistoryEntry[];
  historyIndex: number;
  isDirty: boolean; // 是否有未保存的更改
  isPreviewMode: boolean;
  zoomLevel: number;
}

export interface EditorHistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  state: Partial<EditorState>;
}

// ============================================================================
// 工具和操作
// ============================================================================

export type EditorTool = 
  | 'select'     // 选择工具
  | 'region'     // 创建区域
  | 'text'       // 添加文本
  | 'image'      // 添加图片
  | 'video'      // 添加视频
  | 'clock'      // 添加时钟
  | 'weather'    // 添加天气
  | 'sensor'     // 添加传感器
  | 'web'        // 添加网页
  | 'pan'        // 平移画布
  | 'zoom';      // 缩放画布

export interface EditorOperation {
  type: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'reorder';
  targetType: 'item' | 'region' | 'page';
  targetId: string;
  data: any;
  timestamp: Date;
}

// ============================================================================
// 验证和错误
// ============================================================================

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// API 相关类型
// ============================================================================

export interface SaveProgramRequest {
  program: ProgramInfo;
  pages: EditorPage[];
  contentData: string; // JSON序列化的编辑器状态
  vsnData: string; // VSN格式的节目数据
}

export interface LoadProgramResponse {
  program: ProgramInfo;
  pages: EditorPage[];
  contentData?: string;
  vsnData?: string;
}

// ============================================================================
// 预览相关
// ============================================================================

export interface PreviewSettings {
  showGrid: boolean;
  showRulers: boolean;
  showBounds: boolean;
  showItemNames: boolean;
  snapToGrid: boolean;
  gridSize: number;
  backgroundColor: Color;
}

export interface PreviewFrame {
  pageIndex: number;
  timestamp: number; // 播放时间点(ms)
  regionSnapshots: RegionSnapshot[];
}

export interface RegionSnapshot {
  regionId: string;
  bounds: Rectangle;
  itemSnapshots: ItemSnapshot[];
}

export interface ItemSnapshot {
  itemId: string;
  bounds: Rectangle;
  visible: boolean;
  content: any; // 渲染内容（文本、图片URL等）
}

// ============================================================================
// 导出的工具类型
// ============================================================================

export type EditorItemType = EditorItem['type'];
export type EditorItemId = EditorItem['id'];
export type EditorRegionId = EditorRegion['id'];
export type EditorPageId = EditorPage['id'];