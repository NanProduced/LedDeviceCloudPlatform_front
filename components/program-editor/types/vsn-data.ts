/**
 * VSN格式数据类型定义
 * 
 * 严格按照VSN规范定义，用于设备播放
 * 特点：全String类型、扁平结构、完整必填字段
 * 
 * 重要约束：
 * 1. 所有数值都必须转换为String类型
 * 2. 必填字段必须有值，否则节目无法播放
 * 3. 颜色格式为8位十六进制整数字符串
 */

/**
 * VSN节目信息
 */
export interface VSNInformation {
  /** 节目宽度（String类型！） */
  width: string;
  
  /** 节目高度（String类型！） */
  height: string;
}

/**
 * VSN文件源信息
 */
export interface VSNFileSource {
  /** 是否相对路径："0"=否，"1"=是 */
  isRelative: string;
  
  /** 文件路径 */
  filePath: string;
  
  /** 文件MD5码（32位，可选） */
  md5?: string;
  
  /** 原始文件名（可选） */
  originName?: string;
  
  /** 转换后路径（可选） */
  convertPath?: string;
}

/**
 * VSN字体配置
 */
export interface VSNLogFont {
  /** 字体大小（必填！Float字符串） */
  lfHeight: string;
  
  /** 字体粗细："400"=正常，"700"=加粗 */
  lfWeight?: string;
  
  /** 是否斜体："0"=否，"1"=是 */
  lfItalic?: string;
  
  /** 是否下划线："0"=否，"1"=是 */
  lfUnderline?: string;
  
  /** 字体名称 */
  lfFaceName?: string;
}

/**
 * VSN特效配置
 */
export interface VSNEffect {
  /** 特效类型（String类型） */
  type: string;
  
  /** 特效时长（毫秒，String类型） */
  time: string;
}

/**
 * VSN排程配置
 */
export interface VSNSchedule {
  /** 是否限制时间："0"=否，"1"=是 */
  isLimitTime: string;
  
  /** 开始时间：[00:00:00,23:59:59] */
  startTime: string;
  
  /** 结束时间：[00:00:00,23:59:59] */
  endTime: string;
  
  /** 是否限制日期："0"=否，"1"=是 */
  isLimitDate: string;
  
  /** 开始日期：yyyy/MM/dd */
  startDay: string;
  
  /** 开始日期时间：[00:00:00,23:59:59] */
  startDayTime: string;
  
  /** 结束日期：yyyy/MM/dd */
  endDay: string;
  
  /** 结束日期时间：[00:00:00,23:59:59] */
  endDayTime: string;
  
  /** 是否限制星期："0"=否，"1"=是 */
  isLimitWeek: string;
  
  /** 星期限制数组："1,1,1,1,1,1,1" */
  limitWeek: string;
}

/**
 * VSN文本渐变配置
 */
export interface VSNTextGradient {
  /** 渐变X开始坐标（Float字符串） */
  gradientStartX?: string;
  
  /** 渐变Y开始坐标（Float字符串） */
  gradientStartY?: string;
  
  /** 渐变X结束坐标（Float字符串） */
  gradientEndX?: string;
  
  /** 渐变Y结束坐标（Float字符串） */
  gradientEndY?: string;
  
  /** 渐变颜色列表："0xffffbbaa,0xff6655aa" */
  gradientColors: string;
  
  /** 渐变色位置："0.0,0.9" */
  gradientPositions: string;
  
  /** 渐变模式："0"=CLAMP，"1"=REPEAT，"2"=MIRROR */
  gradientMode?: string;
}

/**
 * VSN多图片信息
 */
export interface VSNMultiPicInfo {
  /** 图片数量（String类型） */
  picCount: string;
  
  /** 图片文件 */
  filePath: VSNFileSource;
  
  /** 单张图片播放时间（毫秒，String类型） */
  onePicDuration: string;
}

/**
 * VSN背景文件
 */
export interface VSNBgFile {
  /** 是否相对路径："0"=否，"1"=是 */
  isRelative: string;
  
  /** 文件路径 */
  filePath: string;
  
  /** 文件MD5码 */
  md5: string;
}

/**
 * VSN背景音频
 */
export interface VSNBgAudio {
  /** 音频文件源 */
  fileSource: VSNFileSource;
  
  /** 音频音量（0.0~1.0，Float字符串） */
  volume: string;
}

/**
 * VSN桶节目配置
 */
export interface VSNBucket {
  /** Item列表播放顺序 */
  itemIndexs: number[];
  
  /** 节目排程 */
  bucketSchedule: VSNSchedule;
  
  /** 初始节目下标 */
  mPlayIndex: number;
}

/**
 * VSN显示矩形
 */
export interface VSNDisplayRect {
  /** X坐标（String类型） */
  x: string;
  
  /** Y坐标（String类型） */
  y: string;
  
  /** 宽度（String类型） */
  width: string;
  
  /** 高度（String类型） */
  height: string;
  
  /** 边框宽度（String类型） */
  borderWidth: string;
  
  /** 边框颜色（8位十六进制整数字符串） */
  borderColor?: string;
}

/**
 * VSN数字时钟配置
 */
export interface VSNDigitalClock {
  /** 时间风格（Integer字符串） */
  digitalClock: string;
  
  /** 字体颜色（10位十进制整数字符串） */
  ftColor: string;
  
  /** 显示标志（按位或运算结果字符串） */
  flags: string;
  
  /** 字体大小（String类型） */
  ftSize: string;
  
  /** 是否斜体："0"=否，"1"=是 */
  bItalic?: string;
  
  /** 是否下划线："0"=否，"1"=是 */
  bUnderline?: string;
  
  /** 是否加粗："0"=否，"1"=是 */
  bBold?: string;
  
  /** 字体粗细："400"=正常，"700"=粗体 */
  weight?: string;
  
  /** 字体名称 */
  name?: string;
}

/**
 * VSN素材项基础接口
 */
export interface VSNBaseItem {
  /** 素材类型（String类型） */
  type: string;
  
  /** 素材名称 */
  name?: string;
  
  /** 背景色（8位十六进制整数字符串） */
  backColor?: string;
  
  /** 入场特效 */
  ineffect?: VSNEffect;
  
  /** 排程配置 */
  schedule?: VSNSchedule;
}

/**
 * VSN图片素材（type="2"）
 */
export interface VSNImageItem extends VSNBaseItem {
  type: '2';
  
  /** 图片位置（必填） */
  fileSource: VSNFileSource;
  
  /** 透明度（必填，[0,1] Float字符串） */
  alpha: string;
  
  /** 素材播放时间（毫秒，Long字符串） */
  duration?: string;
  
  /** 是否缩放素材："1"=CENTER_INSIDE(否)，"0"=FIT_XY(是) */
  reserveAS?: string;
  
  /** 入场特效 */
  ineffect?: VSNEffect;
}

/**
 * VSN视频素材（type="3"）
 */
export interface VSNVideoItem extends VSNBaseItem {
  type: '3';
  
  /** 视频位置（必填） */
  fileSource: VSNFileSource;
  
  /** 是否缩放素材："1"=CENTER_INSIDE(否)，"0"=FIT_XY(是) */
  reserveAS?: string;
  
  /** 播放时长（同步节目时必需，Long字符串） */
  duration?: string;
}

/**
 * VSN文本素材（type="4"|"5"）
 */
export interface VSNTextItem extends VSNBaseItem {
  type: '4' | '5';
  
  /** 文本内容（必填） */
  text: string;
  
  /** 文本颜色（必填，8位十六进制整数字符串） */
  textColor: string;
  
  /** 字体样式（必填） */
  logFont: VSNLogFont;
  
  /** 字母间距（Float字符串） */
  wordSpacing?: string;
  
  /** 是否滚动："1"=是，"0"=否 */
  isScroll?: string;
  
  /** 内边框颜色（8位十六进制整数字符串） */
  outlineColor?: string;
  
  /** 外边框颜色（8位十六进制整数字符串） */
  outlineColor2?: string;
  
  /** 内边框宽度（Float字符串） */
  outlineWidth?: string;
  
  /** 外边框宽度（Float字符串） */
  outlineWidth2?: string;
  
  /** 阴影横向偏移量（Float字符串） */
  shadowDx?: string;
  
  /** 阴影纵向偏移量（Float字符串） */
  shadowDy?: string;
  
  /** 阴影模糊半径（Float字符串） */
  shadowRadius?: string;
  
  /** 阴影颜色（8位十六进制整数字符串） */
  shadowColor?: string;
  
  /** 是否首尾相连："1"=是，"0"=否 */
  isHeadConnectTail?: string;
  
  /** 播放时长（Long字符串） */
  playLength?: string;
  
  /** 播放次数（Integer字符串） */
  repeatCount?: string;
  
  /** 是否根据时间播放："1"=是，"0"=否 */
  isScrollByTime?: string;
  
  /** 是否启用按帧滚动速度："1"=是，"0"=否 */
  ifSpeedByFrame?: string;
  
  /** 按帧滚动速度（点/帧，Float字符串） */
  speedByFrame?: string;
  
  /** 按时间滚动速度（点/秒，Float字符串） */
  speed?: string;
  
  /** 是否使用线性渐变着色器："1"=是，"0"=否 */
  beglaring?: string;
  
  /** 文字渐变色配置 */
  textGradient?: VSNTextGradient;
  
  /** 文本对齐方式："0"=居左，"1"=居中，"2"=居右 */
  centeralAlign?: string;
  
  /** 入场特效（isScroll为0且文本走MultiPicInfo渲染时有效） */
  ineffect?: VSNEffect;
  
  /** 多图片信息（MultiPicInfo文本） */
  multiPicInfo?: VSNMultiPicInfo;
  
  /** base64串列表（base64文本） */
  base64Pages?: string[];
  
  /** 处理base64字符串标志："0"=否，"1"=是 */
  forceSinglePage?: string;
}

/**
 * VSN GIF素材（type="6"）
 */
export interface VSNGifItem extends VSNBaseItem {
  type: '6';
  
  /** GIF文件位置（必填） */
  fileSource: VSNFileSource;
  
  /** 动画播放次数（必填，Integer字符串） */
  playTimes: string;
  
  /** 透明度（必填，[0,1] Float字符串） */
  alpha: string;
  
  /** 是否缩放素材："1"=CENTER_INSIDE(否)，"0"=FIT_XY(是) */
  reserveAS?: string;
}

/**
 * VSN网页素材（type="27"）
 */
export interface VSNWebItem extends VSNBaseItem {
  type: '27';
  
  /** 网页URL（必填） */
  url: string;
  
  /** 素材播放时间（必填，毫秒Long字符串） */
  duration: string;
  
  /** 透明度（必填，[0,1] Float字符串） */
  alpha: string;
  
  /** 背景色（必填，8位十六进制整数字符串） */
  backColor: string;
  
  /** 是否本地web素材："1"=是，"0"=否 */
  isLocal?: string;
  
  /** 文件资源（isLocal为1时必需） */
  fileSource?: VSNFileSource;
}

/**
 * VSN时钟素材（type="9"）
 */
export interface VSNClockItem extends VSNBaseItem {
  type: '9';
  
  /** 播放时间（必填，毫秒Long字符串） */
  duration: string;
  
  /** 是否模拟时钟（必填）："0"=否，"1"=是 */
  isAnalog: string;
  
  /** 时区（必填，小时Float字符串） */
  timezone: string;
  
  /** 时区时间戳（分钟Long字符串） */
  zoneBias?: string;
  
  /** 时区ID */
  zoneDescripId?: string;
  
  /** 数字时钟配置（isAnalog==0时必需） */
  digitalClock?: VSNDigitalClock;
  
  /** 文本对齐方式："0"=居左，"1"=居中，"2"=居右 */
  centeralAlign?: string;
  
  /** 固定文本 */
  text?: string;
  
  /** 是否使用夏令时："0"=否，"1"=是 */
  daylightZone?: string;
  
  /** 夏令时偏移量（分钟String类型） */
  daylightBias?: string;
  
  /** 背景颜色（8位十六进制整数字符串） */
  backColor?: string;
}

/**
 * VSN气象素材（type="14"）
 */
export interface VSNWeatherItem extends VSNBaseItem {
  type: '14';
  
  /** 背景色（必填，8位十六进制整数字符串） */
  backColor: string;
  
  /** 天气播放时间（必填，毫秒Long字符串） */
  duration: string;
  
  /** 地区（必填） */
  regionName: string;
  
  /** 地区代码（必填） */
  regionCode: string;
  
  /** 气象服务器类型（必填）："0"=国内，"1"=全球 */
  serverType: string;
  
  /** 字体样式（必填） */
  logFont: VSNLogFont;
  
  /** 播放次数（必填，Integer字符串） */
  playTimes: string;
  
  /** 每页播放时间（必填，Long字符串除以100） */
  remainTime: string;
  
  /** 动画风格（必填）："0"=一般风格 */
  showStyle: string;
  
  /** 是否使用华氏度（必填）："0"=摄氏度，"1"=华氏度 */
  bShowAsFahrenheit: string;
  
  /** 文字渐变色 */
  textGradient?: VSNTextGradient;
  
  /** 模糊半径（使用textGradient时必需，Integer字符串） */
  shadowRadius?: string;
  
  /** 阴影横向偏移量（使用textGradient时必需） */
  shadowDx?: string;
  
  /** 阴影纵向偏移量（使用textGradient时必需） */
  shadowDy?: string;
  
  /** 阴影颜色（使用textGradient时必需，8位十六进制整数字符串） */
  shadowColor?: string;
  
  /** 反色："0"=否，"1"=是 */
  invertClr?: string;
  
  /** 是否显示天气："0"=否，"1"=是 */
  isShowWeather?: string;
  
  /** 是否显示实时温度："0"=否，"1"=是 */
  isShowTemperature?: string;
  
  /** 是否显示风力："0"=否，"1"=是 */
  isShowWind?: string;
  
  /** 是否显示空气指数："0"=否，"1"=是 */
  isShowAir?: string;
  
  /** 是否显示穿衣指数："0"=否，"1"=是 */
  isShowColdIndex?: string;
  
  /** 是否显示湿度："0"=否，"1"=是 */
  isShowHumidity?: string;
  
  /** 是否显示全天温度："0"=否，"1"=是 */
  isShowTemperatureDaynight?: string;
  
  /** 各种前缀文本 */
  temperaturePrefix?: string;
  windPrefix?: string;
  airPrefix?: string;
  coldIndex?: string;
  humidity?: string;
  temperaturePrefixDaynight?: string;
  
  /** 是否多行显示："0"=否，"1"=是 */
  isMultiLine?: string;
  
  /** 文本移动类型："0"=翻页，其他为左移 */
  moveType?: string;
  
  /** 是否启用按帧滚动速度："1"=是，"0"=否 */
  ifSpeedByFrame?: string;
  
  /** 按帧滚动速度（点/帧，Float字符串） */
  speedByFrame?: string;
  
  /** 按时间滚动速度（点/秒，Float字符串） */
  speed?: string;
  
  /** 文本对齐方式："0"=居左，"1"=居中，"2"=居右 */
  centeralAlign?: string;
  
  /** 文本颜色（8位十六进制整数字符串） */
  textColor?: string;
}

/**
 * VSN传感器素材（type="21"|"22"|"23"|"24"|"28"|"29"|"30"）
 */
export interface VSNSensorItem extends VSNBaseItem {
  type: '21' | '22' | '23' | '24' | '28' | '29' | '30';
  
  /** 字体样式（必填） */
  logFont: VSNLogFont;
  
  /** 文本对齐方式："0"=居中，"1"=居右，"2"=居左 */
  centeralAlign?: string;
  
  /** 文本颜色（8位十六进制整数字符串） */
  textColor?: string;
  
  /** 前缀文本 */
  prefix?: string;
  
  /** 后缀文本 */
  suffix?: string;
  
  /** 是否使用华氏度："0"=摄氏度，"1"=华氏度 */
  bShowAsFahrenheit?: string;
  
  /** 噪声素材文本起始x坐标（Float字符串） */
  textX?: string;
  
  /** 噪声素材文本起始y坐标（Float字符串） */
  textY?: string;
  
  /** 是否显示噪声文本："0"=否，"1"=是 */
  bShowText?: string;
  
  /** 是否显示噪声刻度盘："0"=否，"1"=是 */
  bShowPic?: string;
  
  /** 异常数据时显示的内容："0"=--M，"1"=--S */
  sourceType?: string;
  
  /** 是否显示多行（仅type=24有效）："0"=否，"1"=是 */
  bShowMultiline?: string;
}

/**
 * VSN计时器素材（type="15"）
 */
export interface VSNTimerItem extends VSNBaseItem {
  type: '15';
  
  /** 字体类型（必填，lfHeight字段必需） */
  logFont: VSNLogFont;
  
  /** 播放时间（必填，毫秒String类型） */
  duration: string;
  
  /** 文本颜色（必填，8位十六进制整数字符串） */
  textColor: string;
  
  /** 计时器前缀文本（必填） */
  prefix: string;
  
  /** 计时类型（必填）："0"=正计时，"1"=倒计时 */
  beToEndTime: string;
  
  /** 计时器起始时间（必填，格式：yyyy-MM-dd HH:mm:ss） */
  endDateTime: string;
  
  /** 是否多行显示 */
  isMultiLine?: string;
  
  /** 文本对齐方式："0"=居左，"1"=居中，"2"=居右 */
  centeralAlign?: string;
  
  /** 天数颜色（8位十六进制整数字符串） */
  dayCountColor?: string;
  
  /** 小时颜色（8位十六进制整数字符串） */
  hourCountColor?: string;
  
  /** 分钟颜色（8位十六进制整数字符串） */
  minuteCountColor?: string;
  
  /** 秒数颜色（8位十六进制整数字符串） */
  secondCountColor?: string;
  
  /** 是否显示天数："0"=否，"1"=是 */
  isShowDayCount?: string;
  
  /** 是否显示小时："0"=否，"1"=是 */
  isShowHourCount?: string;
  
  /** 是否显示分钟："0"=否，"1"=是 */
  isShowMinuteCount?: string;
  
  /** 是否显示秒："0"=否，"1"=是 */
  isShowSecondCount?: string;
  
  /** 计时器显示格式："0"=888天88小时08分08秒，"1"=888天88:08:08 */
  style?: string;
  
  /** 背景颜色（8位十六进制整数字符串） */
  backColor?: string;
}

/**
 * VSN素材项联合类型
 */
export type VSNItem = 
  | VSNImageItem
  | VSNVideoItem
  | VSNTextItem
  | VSNGifItem
  | VSNWebItem
  | VSNClockItem
  | VSNWeatherItem
  | VSNSensorItem
  | VSNTimerItem;

/**
 * VSN区域信息
 */
export interface VSNRegion {
  /** 窗口素材列表（必填） */
  items: VSNItem[];
  
  /** 节目窗口区域（必填） */
  rect: VSNDisplayRect;
  
  /** 节目窗口名称（必填） */
  name: string;
  
  /** 是否排程区域（必填）："0"=否，"1"=是 */
  isScheduleRegion: string;
  
  /** 桶节目 */
  buckets?: VSNBucket[];
  
  /** 区域层级（存在多个Region时必需，>0 Integer字符串） */
  layer?: string;
}

/**
 * VSN页面信息
 */
export interface VSNPage {
  /** 节目页区域列表（必填） */
  regions: VSNRegion[];
  
  /** 播放时长方式（必填）："0"=指定播放时长，"1"=自动计算播放时长 */
  loopType: string;
  
  /** 节目页时长（loopType为0时必填，毫秒String类型） */
  appointDuration: string;
  
  /** 节目页背景色（必填，8位16进制数String类型） */
  bgColor: number; // 后端要求Integer（32位无符号整数，ARGB）
  
  /** 背景文件 */
  bgFile?: VSNBgFile;
  
  /** 背景音频 */
  bgAudios?: VSNBgAudio[];
}

/**
 * VSN节目信息
 */
export interface VSNProgram {
  /** 节目页列表（必填） */
  pages: VSNPage[];
  
  /** 节目信息（必填） */
  info: VSNInformation;
  
  /** 节目ID（建议加上，桶节目判断时需要） */
  programId?: string;
  
  /** 是否为桶节目（建议手动指定） */
  isBucketProgram?: boolean;
}

/**
 * VSN根节点
 */
export interface VSNData {
  /** 节目信息（必填） */
  information: VSNInformation;
  
  /** 节目页列表（必填） */
  pages: VSNPage[];
  
  /** 节目ID */
  programId?: string;
  
  /** 是否为桶节目 */
  isBucketProgram?: boolean;
}

/**
 * VSN验证错误信息
 */
export interface VSNValidationError {
  /** 错误字段路径 */
  field: string;
  
  /** 错误信息 */
  message: string;
  
  /** 错误代码 */
  code: string;
  
  /** 错误级别 */
  level: 'error' | 'warning' | 'info';
}

/**
 * VSN验证结果
 */
export interface VSNValidationResult {
  /** 是否有效 */
  isValid: boolean;
  
  /** 错误列表 */
  errors: VSNValidationError[];
  
  /** 警告列表 */
  warnings: VSNValidationError[];
  
  /** 缺失的素材ID列表 */
  missingMaterials?: string[];
}

/**
 * VSN转换结果
 */
export interface VSNConversionResult {
  /** VSN数据 */
  vsnData: VSNData;
  
  /** VSN XML字符串 */
  vsnXml?: string;
  
  /** 验证结果 */
  validation: VSNValidationResult;
}

/**
 * VSN效果类型枚举
 */
export enum VSNEffectType {
  NONE = 0,                    // 无特效
  RANDOM = 1,                  // 随机特效
  LEFT_COVER = 2,              // 左覆盖
  RIGHT_COVER = 3,             // 右覆盖
  TOP_COVER = 4,               // 上覆盖
  BOTTOM_COVER = 5,            // 下覆盖
  TOP_LEFT_DIAGONAL = 6,       // 左上角覆盖（斜线）
  TOP_RIGHT_DIAGONAL = 7,      // 右上角覆盖（斜线）
  BOTTOM_LEFT_DIAGONAL = 8,    // 左下角覆盖（斜线）
  BOTTOM_RIGHT_DIAGONAL = 9,   // 右下角覆盖（斜线）
  TOP_LEFT_STRAIGHT = 10,      // 左上角覆盖（直线）
  TOP_RIGHT_STRAIGHT = 11,     // 右上角覆盖（直线）
  BOTTOM_LEFT_STRAIGHT = 12,   // 左下角覆盖（直线）
  BOTTOM_RIGHT_STRAIGHT = 13,  // 右下角覆盖（直线）
  HORIZONTAL_BLIND = 14,       // 水平百叶
  VERTICAL_BLIND = 15,         // 垂直百叶
  HORIZONTAL_SPLIT = 16,       // 左右对开
  VERTICAL_SPLIT = 17,         // 上下对开
  HORIZONTAL_CLOSE = 18,       // 左右闭合
  VERTICAL_CLOSE = 19,         // 上下闭合
  MOVE_UP = 20,               // 上移
  MOVE_DOWN = 21,             // 下移
  MOVE_LEFT = 22,             // 左移
  MOVE_RIGHT = 23,            // 右移
  MOVE_TOP_LEFT = 24,         // 左上角移
  MOVE_TOP_RIGHT = 25,        // 右上角移
  MOVE_BOTTOM_LEFT = 26,      // 左下角移
  MOVE_BOTTOM_RIGHT = 27,     // 右下角移
  MOSAIC_SMALL = 28,          // 马赛克（小）
  MOSAIC_MEDIUM = 29,         // 马赛克（中）
  MOSAIC_LARGE = 30,          // 马赛克（大）
  FADE = 31,                  // 渐变
  ROTATE_RIGHT_360 = 32,      // 右旋360
  ROTATE_LEFT_360 = 33,       // 左旋360
  ROTATE_RIGHT_180 = 34,      // 右旋180
  ROTATE_LEFT_180 = 35,       // 左旋180
  ROTATE_RIGHT_90 = 36,       // 右旋90
  ROTATE_LEFT_90 = 37,        // 左旋90
  SCALE_CENTER = 38,          // 由小变大（中间）
  SCALE_TOP_LEFT = 39,        // 由小变大（左上）
  SCALE_TOP_RIGHT = 40,       // 由小变大（右上）
  SCALE_BOTTOM_RIGHT = 41,    // 由小变大（右下）
  SCALE_BOTTOM_LEFT = 42,     // 由小变大（左下）
  RECT_CENTER_OUT = 43,       // 矩形中间向四周
  RECT_OUT_CENTER = 44,       // 矩形四周向中间
  DIAMOND_CENTER_OUT = 45,    // 菱形中间向四周
  DIAMOND_OUT_CENTER = 46,    // 菱形四周向中间
  CROSS_CENTER_OUT = 47,      // 十字中间向四周
  CROSS_OUT_CENTER = 48,      // 十字四周向中间
  ANIMATION_3D_1 = 49,        // 三维动画一
  ANIMATION_3D_2 = 50         // 三维动画二
}

/**
 * VSN日期风格枚举
 */
export enum VSNDateStyle {
  YYYY_MM_DD = 1,             // 2018-08-18
  MM_DD_YYYY = 2,             // 08/18/2018
  M_D_YYYY = 3,               // 8/18/2018
  YYYY_MM_DD_SPACE = 4,       // 2018 08 18
  YYYY_M_D = 5,               // 2018/8/18
  MONTH_DD_YYYY = 6,          // August 18,2018
  DD_MM_YYYY = 7,             // 18/08/2018
  DD_MM_YYYY_DOT = 8,         // 18.08.2018
  DD_M_YYYY_SPACE = 9,        // 18/8 2018
  DD_MON_YYYY = 10,           // 18 Aug.2018
  DD_MON_YYYY_DOT = 11,       // 18.Aug.2018
  DD_MON_YYYY_DASH = 12,      // 18-Aug-2018
  YYYY_M_D_CHINESE = 13       // 2018年8月18日
}

/**
 * 颜色格式转换工具函数
 */
export class VSNColorUtils {
  /**
   * 将十六进制颜色转换为8位十六进制整数字符串
   * @param hexColor 十六进制颜色 (#FFFFFF)
   * @returns 8位十六进制整数字符串
   */
  static hexToVSNColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const rgba = hex.length === 6 ? `FF${hex}` : hex;
    return parseInt(rgba, 16).toString();
  }

  /**
   * 将8位十六进制整数字符串转换为十六进制颜色
   * @param vsnColor 8位十六进制整数字符串
   * @returns 十六进制颜色 (#FFFFFF)
   */
  static vsnColorToHex(vsnColor: string): string {
    const num = parseInt(vsnColor, 10);
    const hex = num.toString(16).toUpperCase().padStart(8, '0');
    return `#${hex.substring(2)}`; // 去掉Alpha通道
  }
}

/**
 * 数值转换工具函数
 */
export class VSNNumberUtils {
  /**
   * 将数值转换为String类型
   */
  static numberToString(value: number): string {
    return value.toString();
  }

  /**
   * 将String类型转换为数值
   */
  static stringToNumber(value: string): number {
    return parseFloat(value) || 0;
  }

  /**
   * 将布尔值转换为VSN格式字符串
   */
  static booleanToVSNString(value: boolean): string {
    return value ? '1' : '0';
  }

  /**
   * 将VSN格式字符串转换为布尔值
   */
  static vsnStringToBoolean(value: string): boolean {
    return value === '1';
  }
}