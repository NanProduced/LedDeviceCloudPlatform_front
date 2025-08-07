/**
 * 颜色格式转换工具
 * 
 * 处理前端编辑器和VSN格式之间的颜色格式转换：
 * - 前端：#FFFFFF (十六进制颜色)
 * - VSN：8位十六进制整数字符串 (ARGB格式)
 */

/**
 * 颜色转换错误
 */
export class ColorConversionError extends Error {
  constructor(message: string, public readonly input: string) {
    super(`颜色转换失败: ${message} (输入: ${input})`);
    this.name = 'ColorConversionError';
  }
}

/**
 * 颜色格式验证
 */
export class ColorValidator {
  /**
   * 验证十六进制颜色格式
   */
  static isValidHexColor(color: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
  }

  /**
   * 验证VSN颜色格式（数字字符串）
   */
  static isValidVSNColor(color: string): boolean {
    const num = parseInt(color, 10);
    return !isNaN(num) && num >= 0 && num <= 4294967295; // 32位无符号整数范围
  }

  /**
   * 验证RGB值范围
   */
  static isValidRGBValue(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 255;
  }

  /**
   * 验证透明度值范围
   */
  static isValidAlpha(alpha: number): boolean {
    return typeof alpha === 'number' && alpha >= 0 && alpha <= 1;
  }
}

/**
 * RGBA颜色值接口
 */
export interface RGBAColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

/**
 * 颜色转换工具类
 */
export class ColorConverter {
  /**
   * 将十六进制颜色转换为RGBA对象
   * @param hexColor 十六进制颜色 (#RGB, #RRGGBB, #AARRGGBB)
   * @returns RGBA颜色对象
   */
  static hexToRGBA(hexColor: string): RGBAColor {
    if (!ColorValidator.isValidHexColor(hexColor)) {
      throw new ColorConversionError('无效的十六进制颜色格式', hexColor);
    }

    let hex = hexColor.replace('#', '').toUpperCase();
    
    // 处理简写格式 #RGB -> #RRGGBB
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // 如果没有Alpha通道，默认为不透明
    if (hex.length === 6) {
      hex = 'FF' + hex;
    }
    
    if (hex.length !== 8) {
      throw new ColorConversionError('十六进制颜色长度无效', hexColor);
    }

    const a = parseInt(hex.substr(0, 2), 16) / 255;
    const r = parseInt(hex.substr(2, 2), 16);
    const g = parseInt(hex.substr(4, 2), 16);
    const b = parseInt(hex.substr(6, 2), 16);

    return { r, g, b, a };
  }

  /**
   * 将RGBA对象转换为十六进制颜色
   * @param rgba RGBA颜色对象
   * @param includeAlpha 是否包含Alpha通道
   * @returns 十六进制颜色字符串
   */
  static rgbaToHex(rgba: RGBAColor, includeAlpha: boolean = false): string {
    const { r, g, b, a } = rgba;

    if (!ColorValidator.isValidRGBValue(r) || 
        !ColorValidator.isValidRGBValue(g) || 
        !ColorValidator.isValidRGBValue(b) ||
        !ColorValidator.isValidAlpha(a)) {
      throw new ColorConversionError('无效的RGBA值', JSON.stringify(rgba));
    }

    const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0').toUpperCase();
    
    const hexR = toHex(r);
    const hexG = toHex(g);
    const hexB = toHex(b);
    
    if (includeAlpha) {
      const hexA = toHex(a * 255);
      return `#${hexA}${hexR}${hexG}${hexB}`;
    }
    
    return `#${hexR}${hexG}${hexB}`;
  }

  /**
   * 将十六进制颜色转换为VSN格式（8位十六进制整数字符串）
   * @param hexColor 十六进制颜色
   * @returns VSN格式颜色字符串
   */
  static hexToVSNColor(hexColor: string): string {
    const rgba = this.hexToRGBA(hexColor);
    return this.rgbaToVSNColor(rgba);
  }

  /**
   * 将RGBA对象转换为VSN格式
   * @param rgba RGBA颜色对象
   * @returns VSN格式颜色字符串
   */
  static rgbaToVSNColor(rgba: RGBAColor): string {
    const { r, g, b, a } = rgba;

    if (!ColorValidator.isValidRGBValue(r) || 
        !ColorValidator.isValidRGBValue(g) || 
        !ColorValidator.isValidRGBValue(b) ||
        !ColorValidator.isValidAlpha(a)) {
      throw new ColorConversionError('无效的RGBA值', JSON.stringify(rgba));
    }

    // VSN使用ARGB格式的32位整数
    const alpha = Math.round(a * 255);
    const argb = (alpha << 24) | (r << 16) | (g << 8) | b;
    
    // 转换为无符号32位整数
    const unsignedARGB = argb >>> 0;
    
    return unsignedARGB.toString();
  }

  /**
   * 将VSN格式颜色转换为十六进制颜色
   * @param vsnColor VSN格式颜色字符串
   * @param includeAlpha 是否包含Alpha通道
   * @returns 十六进制颜色字符串
   */
  static vsnColorToHex(vsnColor: string, includeAlpha: boolean = false): string {
    if (!ColorValidator.isValidVSNColor(vsnColor)) {
      throw new ColorConversionError('无效的VSN颜色格式', vsnColor);
    }

    const rgba = this.vsnColorToRGBA(vsnColor);
    return this.rgbaToHex(rgba, includeAlpha);
  }

  /**
   * 将VSN格式颜色转换为RGBA对象
   * @param vsnColor VSN格式颜色字符串
   * @returns RGBA颜色对象
   */
  static vsnColorToRGBA(vsnColor: string): RGBAColor {
    if (!ColorValidator.isValidVSNColor(vsnColor)) {
      throw new ColorConversionError('无效的VSN颜色格式', vsnColor);
    }

    const argb = parseInt(vsnColor, 10);
    
    // 提取ARGB各分量
    const a = ((argb >> 24) & 0xFF) / 255;
    const r = (argb >> 16) & 0xFF;
    const g = (argb >> 8) & 0xFF;
    const b = argb & 0xFF;

    return { r, g, b, a };
  }

  /**
   * 调整颜色透明度
   * @param hexColor 十六进制颜色
   * @param alpha 新的透明度 (0-1)
   * @returns 调整透明度后的十六进制颜色
   */
  static setAlpha(hexColor: string, alpha: number): string {
    if (!ColorValidator.isValidAlpha(alpha)) {
      throw new ColorConversionError('无效的透明度值', alpha.toString());
    }

    const rgba = this.hexToRGBA(hexColor);
    rgba.a = alpha;
    return this.rgbaToHex(rgba, true);
  }

  /**
   * 获取颜色的透明度
   * @param hexColor 十六进制颜色
   * @returns 透明度值 (0-1)
   */
  static getAlpha(hexColor: string): number {
    const rgba = this.hexToRGBA(hexColor);
    return rgba.a;
  }

  /**
   * 混合两种颜色
   * @param color1 第一种颜色
   * @param color2 第二种颜色
   * @param ratio 混合比例 (0-1，0表示完全是color1，1表示完全是color2)
   * @returns 混合后的颜色
   */
  static blendColors(color1: string, color2: string, ratio: number): string {
    if (ratio < 0 || ratio > 1) {
      throw new ColorConversionError('混合比例必须在0-1之间', ratio.toString());
    }

    const rgba1 = this.hexToRGBA(color1);
    const rgba2 = this.hexToRGBA(color2);

    const blended: RGBAColor = {
      r: Math.round(rgba1.r * (1 - ratio) + rgba2.r * ratio),
      g: Math.round(rgba1.g * (1 - ratio) + rgba2.g * ratio),
      b: Math.round(rgba1.b * (1 - ratio) + rgba2.b * ratio),
      a: rgba1.a * (1 - ratio) + rgba2.a * ratio
    };

    return this.rgbaToHex(blended, true);
  }

  /**
   * 获取颜色的亮度 (0-1)
   * @param hexColor 十六进制颜色
   * @returns 亮度值
   */
  static getLuminance(hexColor: string): number {
    const rgba = this.hexToRGBA(hexColor);
    
    // 使用相对亮度公式
    const { r, g, b } = rgba;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * 判断颜色是否为深色
   * @param hexColor 十六进制颜色
   * @param threshold 阈值 (0-1，默认0.5)
   * @returns 是否为深色
   */
  static isDark(hexColor: string, threshold: number = 0.5): boolean {
    return this.getLuminance(hexColor) < threshold;
  }

  /**
   * 获取对比色（黑色或白色）
   * @param hexColor 十六进制颜色
   * @returns 对比色
   */
  static getContrastColor(hexColor: string): string {
    return this.isDark(hexColor) ? '#FFFFFF' : '#000000';
  }
}

/**
 * 常用颜色常量
 */
export const CommonColors = {
  // 基础颜色
  TRANSPARENT: '#00000000',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#0000FF',
  YELLOW: '#FFFF00',
  CYAN: '#00FFFF',
  MAGENTA: '#FF00FF',
  
  // 灰度
  GRAY_LIGHT: '#CCCCCC',
  GRAY: '#808080',
  GRAY_DARK: '#404040',
  
  // VSN默认值
  VSN_TRANSPARENT: '0',
  VSN_BLACK: '4278190080',
  VSN_WHITE: '4294967295',
  VSN_RED: '4294901760',
  VSN_GREEN: '4278255360',
  VSN_BLUE: '4278190335'
} as const;

/**
 * 预设颜色调色板
 */
export const ColorPalettes = {
  // 基础调色板
  basic: [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0'
  ],
  
  // 材质设计调色板
  material: [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ],
  
  // 渐变色调色板
  gradients: [
    ['#FF6B6B', '#4ECDC4'],
    ['#A8E6CF', '#FFD93D'],
    ['#6C5CE7', '#A29BFE'],
    ['#FD79A8', '#FDCB6E'],
    ['#00B894', '#00CEC9']
  ]
} as const;

/**
 * 颜色转换工具函数（便捷导出）
 */
export const colorUtils = {
  hexToVSN: ColorConverter.hexToVSNColor,
  vsnToHex: ColorConverter.vsnColorToHex,
  hexToRGBA: ColorConverter.hexToRGBA,
  rgbaToHex: ColorConverter.rgbaToHex,
  setAlpha: ColorConverter.setAlpha,
  getAlpha: ColorConverter.getAlpha,
  blendColors: ColorConverter.blendColors,
  getLuminance: ColorConverter.getLuminance,
  isDark: ColorConverter.isDark,
  getContrastColor: ColorConverter.getContrastColor,
  isValidHex: ColorValidator.isValidHexColor,
  isValidVSN: ColorValidator.isValidVSNColor
};