/**
 * VSN格式验证工具
 * 
 * 提供完整的VSN格式验证功能，确保生成的数据符合设备播放要求
 */

import {
  VSNData,
  VSNPage,
  VSNRegion,
  VSNItem,
  VSNValidationError,
  VSNValidationResult,
  ItemType
} from '../types';

/**
 * 验证错误级别
 */
export enum ValidationLevel {
  ERROR = 'error',   // 阻止播放的错误
  WARNING = 'warning', // 可能影响播放的警告
  INFO = 'info'      // 提示信息
}

/**
 * 验证错误代码
 */
export enum ValidationErrorCode {
  // 必填字段错误
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  
  // 数据类型错误
  INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',
  INVALID_NUMBER_FORMAT = 'INVALID_NUMBER_FORMAT',
  INVALID_COLOR_FORMAT = 'INVALID_COLOR_FORMAT',
  
  // 业务规则错误
  INVALID_LOOP_TYPE_DURATION = 'INVALID_LOOP_TYPE_DURATION',
  MISSING_LOGFONT_HEIGHT = 'MISSING_LOGFONT_HEIGHT',
  INVALID_SYNC_REGION_ITEM_TYPE = 'INVALID_SYNC_REGION_ITEM_TYPE',
  INVALID_RECT_DIMENSIONS = 'INVALID_RECT_DIMENSIONS',
  
  // 素材引用错误
  MISSING_FILE_SOURCE = 'MISSING_FILE_SOURCE',
  INVALID_FILE_PATH = 'INVALID_FILE_PATH',
  
  // 范围验证错误
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE'
}

/**
 * 验证上下文
 */
interface ValidationContext {
  path: string[];
  errors: VSNValidationError[];
  warnings: VSNValidationError[];
}

/**
 * 创建验证错误
 */
function createValidationError(
  context: ValidationContext,
  code: ValidationErrorCode,
  message: string,
  level: ValidationLevel = ValidationLevel.ERROR
): void {
  const error: VSNValidationError = {
    field: context.path.join('.'),
    message,
    code,
    level
  };
  
  if (level === ValidationLevel.ERROR) {
    context.errors.push(error);
  } else {
    context.warnings.push(error);
  }
}

/**
 * 字段验证器
 */
export class FieldValidator {
  /**
   * 验证必填字段
   */
  static validateRequired(
    value: any,
    context: ValidationContext,
    fieldName: string
  ): boolean {
    if (value === undefined || value === null || value === '') {
      createValidationError(
        context,
        ValidationErrorCode.REQUIRED_FIELD_MISSING,
        `必填字段 ${fieldName} 不能为空`
      );
      return false;
    }
    return true;
  }

  /**
   * 验证字符串格式的数字
   */
  static validateNumberString(
    value: string,
    context: ValidationContext,
    fieldName: string,
    options?: {
      min?: number;
      max?: number;
      allowFloat?: boolean;
    }
  ): boolean {
    if (!value) return false;

    const num = options?.allowFloat ? parseFloat(value) : parseInt(value, 10);
    
    if (isNaN(num)) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_NUMBER_FORMAT,
        `字段 ${fieldName} 必须是有效的数字字符串`
      );
      return false;
    }

    if (options?.min !== undefined && num < options.min) {
      createValidationError(
        context,
        ValidationErrorCode.VALUE_OUT_OF_RANGE,
        `字段 ${fieldName} 的值 ${num} 小于最小值 ${options.min}`
      );
      return false;
    }

    if (options?.max !== undefined && num > options.max) {
      createValidationError(
        context,
        ValidationErrorCode.VALUE_OUT_OF_RANGE,
        `字段 ${fieldName} 的值 ${num} 大于最大值 ${options.max}`
      );
      return false;
    }

    return true;
  }

  /**
   * 验证VSN颜色格式
   */
  static validateVSNColor(
    value: string,
    context: ValidationContext,
    fieldName: string
  ): boolean {
    if (!value) return false;

    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 4294967295) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_COLOR_FORMAT,
        `字段 ${fieldName} 必须是有效的VSN颜色格式（0-4294967295）`
      );
      return false;
    }

    return true;
  }

  /**
   * 验证枚举值
   */
  static validateEnum<T>(
    value: T,
    validValues: T[],
    context: ValidationContext,
    fieldName: string
  ): boolean {
    if (!validValues.includes(value)) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_DATA_TYPE,
        `字段 ${fieldName} 的值 ${value} 不在有效范围内: [${validValues.join(', ')}]`
      );
      return false;
    }
    return true;
  }

  /**
   * 验证文件路径
   */
  static validateFilePath(
    value: string,
    context: ValidationContext,
    fieldName: string
  ): boolean {
    if (!value) {
      createValidationError(
        context,
        ValidationErrorCode.MISSING_FILE_SOURCE,
        `字段 ${fieldName} 文件路径不能为空`
      );
      return false;
    }

    // 基本路径格式验证
    if (value.includes('\\\\') || value.includes('//')) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_FILE_PATH,
        `字段 ${fieldName} 文件路径格式无效`,
        ValidationLevel.WARNING
      );
    }

    return true;
  }
}

/**
 * VSN业务规则验证器
 */
export class BusinessRuleValidator {
  /**
   * 验证LoopType和AppointDuration的关系
   */
  static validateLoopTypeDuration(
    page: VSNPage,
    context: ValidationContext
  ): void {
    context.path.push('page');
    
    if (page.loopType === '0' && !page.appointDuration) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_LOOP_TYPE_DURATION,
        '当LoopType为"0"时，AppointDuration必须指定'
      );
    }

    if (page.appointDuration) {
      FieldValidator.validateNumberString(
        page.appointDuration,
        context,
        'appointDuration',
        { min: 100 } // 最小100ms
      );
    }

    context.path.pop();
  }

  /**
   * 验证Region的Rect必填字段
   */
  static validateRegionRect(
    region: VSNRegion,
    context: ValidationContext
  ): void {
    context.path.push('rect');

    const rect = region.rect;
    if (!rect) {
      createValidationError(
        context,
        ValidationErrorCode.REQUIRED_FIELD_MISSING,
        'Region的rect字段是必填的'
      );
      context.path.pop();
      return;
    }

    // 验证必填字段
    FieldValidator.validateRequired(rect.x, context, 'x');
    FieldValidator.validateRequired(rect.y, context, 'y');
    FieldValidator.validateRequired(rect.width, context, 'width');
    FieldValidator.validateRequired(rect.height, context, 'height');
    FieldValidator.validateRequired(rect.borderWidth, context, 'borderWidth');

    // 验证数值格式
    if (rect.x) {
      FieldValidator.validateNumberString(rect.x, context, 'x', { min: 0 });
    }
    if (rect.y) {
      FieldValidator.validateNumberString(rect.y, context, 'y', { min: 0 });
    }
    if (rect.width) {
      FieldValidator.validateNumberString(rect.width, context, 'width', { min: 1 });
    }
    if (rect.height) {
      FieldValidator.validateNumberString(rect.height, context, 'height', { min: 1 });
    }
    if (rect.borderWidth) {
      FieldValidator.validateNumberString(rect.borderWidth, context, 'borderWidth', { min: 0 });
    }

    context.path.pop();
  }

  /**
   * 验证LogFont的lfHeight字段
   */
  static validateLogFont(
    logFont: any,
    context: ValidationContext
  ): void {
    if (!logFont) return;

    context.path.push('logFont');

    if (!FieldValidator.validateRequired(logFont.lfHeight, context, 'lfHeight')) {
      createValidationError(
        context,
        ValidationErrorCode.MISSING_LOGFONT_HEIGHT,
        'LogFont的lfHeight字段是必需的'
      );
    } else {
      FieldValidator.validateNumberString(
        logFont.lfHeight,
        context,
        'lfHeight',
        { allowFloat: true, min: 1 }
      );
    }

    // 验证可选字段
    if (logFont.lfWeight) {
      FieldValidator.validateEnum(
        logFont.lfWeight,
        ['400', '700'],
        context,
        'lfWeight'
      );
    }

    if (logFont.lfItalic) {
      FieldValidator.validateEnum(
        logFont.lfItalic,
        ['0', '1'],
        context,
        'lfItalic'
      );
    }

    if (logFont.lfUnderline) {
      FieldValidator.validateEnum(
        logFont.lfUnderline,
        ['0', '1'],
        context,
        'lfUnderline'
      );
    }

    context.path.pop();
  }

  /**
   * 验证同步窗口的素材类型限制
   */
  static validateSyncRegionItemTypes(
    region: VSNRegion,
    context: ValidationContext
  ): void {
    if (region.name !== 'sync_program') return;

    context.path.push('syncRegion');

    const allowedTypes = ['2', '3', '6']; // 图片、视频、GIF
    
    region.items.forEach((item, index) => {
      context.path.push(`item[${index}]`);
      
      if (!allowedTypes.includes(item.type)) {
        createValidationError(
          context,
          ValidationErrorCode.INVALID_SYNC_REGION_ITEM_TYPE,
          `同步窗口只能添加图片(2)、视频(3)、GIF(6)类型的素材，当前类型: ${item.type}`
        );
      }
      
      context.path.pop();
    });

    context.path.pop();
  }
}

/**
 * VSN素材项验证器
 */
export class ItemValidator {
  /**
   * 验证图片素材 (type="2")
   */
  static validateImageItem(item: any, context: ValidationContext): void {
    context.path.push('imageItem');

    // 必填字段验证
    if (!item.fileSource) {
      createValidationError(
        context,
        ValidationErrorCode.MISSING_FILE_SOURCE,
        '图片素材必须指定fileSource'
      );
    } else {
      this.validateFileSource(item.fileSource, context);
    }

    if (!FieldValidator.validateRequired(item.alpha, context, 'alpha')) {
      // alpha是必填的
    } else {
      FieldValidator.validateNumberString(
        item.alpha,
        context,
        'alpha',
        { allowFloat: true, min: 0, max: 1 }
      );
    }

    // 可选字段验证
    if (item.duration) {
      FieldValidator.validateNumberString(
        item.duration,
        context,
        'duration',
        { min: 100 }
      );
    }

    if (item.reserveAS) {
      FieldValidator.validateEnum(
        item.reserveAS,
        ['0', '1'],
        context,
        'reserveAS'
      );
    }

    context.path.pop();
  }

  /**
   * 验证视频素材 (type="3")
   */
  static validateVideoItem(item: any, context: ValidationContext): void {
    context.path.push('videoItem');

    // 必填字段验证
    if (!item.fileSource) {
      createValidationError(
        context,
        ValidationErrorCode.MISSING_FILE_SOURCE,
        '视频素材必须指定fileSource'
      );
    } else {
      this.validateFileSource(item.fileSource, context);
    }

    // 可选字段验证
    if (item.reserveAS) {
      FieldValidator.validateEnum(
        item.reserveAS,
        ['0', '1'],
        context,
        'reserveAS'
      );
    }

    if (item.duration) {
      FieldValidator.validateNumberString(
        item.duration,
        context,
        'duration',
        { min: 100 }
      );
    }

    context.path.pop();
  }

  /**
   * 验证文本素材 (type="4"|"5")
   */
  static validateTextItem(item: any, context: ValidationContext): void {
    context.path.push('textItem');

    // 必填字段验证
    FieldValidator.validateRequired(item.text, context, 'text');
    FieldValidator.validateRequired(item.textColor, context, 'textColor');
    
    if (item.textColor) {
      FieldValidator.validateVSNColor(item.textColor, context, 'textColor');
    }

    if (!item.logFont) {
      createValidationError(
        context,
        ValidationErrorCode.REQUIRED_FIELD_MISSING,
        '文本素材必须指定logFont'
      );
    } else {
      BusinessRuleValidator.validateLogFont(item.logFont, context);
    }

    // 可选字段验证
    if (item.wordSpacing) {
      FieldValidator.validateNumberString(
        item.wordSpacing,
        context,
        'wordSpacing',
        { allowFloat: true }
      );
    }

    if (item.isScroll) {
      FieldValidator.validateEnum(
        item.isScroll,
        ['0', '1'],
        context,
        'isScroll'
      );
    }

    if (item.centeralAlign) {
      FieldValidator.validateEnum(
        item.centeralAlign,
        ['0', '1', '2'],
        context,
        'centeralAlign'
      );
    }

    context.path.pop();
  }

  /**
   * 验证GIF素材 (type="6")
   */
  static validateGifItem(item: any, context: ValidationContext): void {
    context.path.push('gifItem');

    // 必填字段验证
    if (!item.fileSource) {
      createValidationError(
        context,
        ValidationErrorCode.MISSING_FILE_SOURCE,
        'GIF素材必须指定fileSource'
      );
    } else {
      this.validateFileSource(item.fileSource, context);
    }

    FieldValidator.validateRequired(item.playTimes, context, 'playTimes');
    if (item.playTimes) {
      FieldValidator.validateNumberString(
        item.playTimes,
        context,
        'playTimes',
        { min: 1 }
      );
    }

    FieldValidator.validateRequired(item.alpha, context, 'alpha');
    if (item.alpha) {
      FieldValidator.validateNumberString(
        item.alpha,
        context,
        'alpha',
        { allowFloat: true, min: 0, max: 1 }
      );
    }

    context.path.pop();
  }

  /**
   * 验证网页素材 (type="27")
   */
  static validateWebItem(item: any, context: ValidationContext): void {
    context.path.push('webItem');

    // 必填字段验证
    FieldValidator.validateRequired(item.url, context, 'url');
    FieldValidator.validateRequired(item.duration, context, 'duration');
    FieldValidator.validateRequired(item.alpha, context, 'alpha');
    FieldValidator.validateRequired(item.backColor, context, 'backColor');

    if (item.duration) {
      FieldValidator.validateNumberString(
        item.duration,
        context,
        'duration',
        { min: 100 }
      );
    }

    if (item.alpha) {
      FieldValidator.validateNumberString(
        item.alpha,
        context,
        'alpha',
        { allowFloat: true, min: 0, max: 1 }
      );
    }

    if (item.backColor) {
      FieldValidator.validateVSNColor(item.backColor, context, 'backColor');
    }

    // URL格式基础验证
    if (item.url && !item.url.startsWith('http')) {
      createValidationError(
        context,
        ValidationErrorCode.INVALID_FILE_PATH,
        'URL必须以http或https开头',
        ValidationLevel.WARNING
      );
    }

    context.path.pop();
  }

  /**
   * 验证时钟素材 (type="9")
   */
  static validateClockItem(item: any, context: ValidationContext): void {
    context.path.push('clockItem');

    // 必填字段验证
    FieldValidator.validateRequired(item.duration, context, 'duration');
    FieldValidator.validateRequired(item.isAnalog, context, 'isAnalog');
    FieldValidator.validateRequired(item.timezone, context, 'timezone');

    if (item.duration) {
      FieldValidator.validateNumberString(
        item.duration,
        context,
        'duration',
        { min: 100 }
      );
    }

    if (item.isAnalog) {
      FieldValidator.validateEnum(
        item.isAnalog,
        ['0', '1'],
        context,
        'isAnalog'
      );
    }

    if (item.timezone) {
      FieldValidator.validateNumberString(
        item.timezone,
        context,
        'timezone',
        { allowFloat: true, min: -12, max: 12 }
      );
    }

    context.path.pop();
  }

  /**
   * 验证文件源
   */
  private static validateFileSource(fileSource: any, context: ValidationContext): void {
    context.path.push('fileSource');

    FieldValidator.validateRequired(fileSource.isRelative, context, 'isRelative');
    FieldValidator.validateRequired(fileSource.filePath, context, 'filePath');

    if (fileSource.isRelative) {
      FieldValidator.validateEnum(
        fileSource.isRelative,
        ['0', '1'],
        context,
        'isRelative'
      );
    }

    if (fileSource.filePath) {
      FieldValidator.validateFilePath(fileSource.filePath, context, 'filePath');
    }

    context.path.pop();
  }
}

/**
 * VSN数据验证器主类
 */
export class VSNValidator {
  /**
   * 验证完整的VSN数据
   */
  static validate(vsnData: VSNData): VSNValidationResult {
    const context: ValidationContext = {
      path: [],
      errors: [],
      warnings: []
    };

    // 验证根节点
    this.validateRoot(vsnData, context);

    return {
      isValid: context.errors.length === 0,
      errors: context.errors,
      warnings: context.warnings
    };
  }

  /**
   * 验证根节点
   */
  private static validateRoot(vsnData: VSNData, context: ValidationContext): void {
    // 验证information
    if (!vsnData.information) {
      createValidationError(
        context,
        ValidationErrorCode.REQUIRED_FIELD_MISSING,
        'information字段是必填的'
      );
    } else {
      this.validateInformation(vsnData.information, context);
    }

    // 验证pages
    if (!vsnData.pages || vsnData.pages.length === 0) {
      createValidationError(
        context,
        ValidationErrorCode.REQUIRED_FIELD_MISSING,
        'pages字段是必填的且不能为空'
      );
    } else {
      vsnData.pages.forEach((page, index) => {
        context.path.push(`pages[${index}]`);
        this.validatePage(page, context);
        context.path.pop();
      });
    }
  }

  /**
   * 验证information节点
   */
  private static validateInformation(information: any, context: ValidationContext): void {
    context.path.push('information');

    FieldValidator.validateRequired(information.width, context, 'width');
    FieldValidator.validateRequired(information.height, context, 'height');

    if (information.width) {
      FieldValidator.validateNumberString(
        information.width,
        context,
        'width',
        { min: 1 }
      );
    }

    if (information.height) {
      FieldValidator.validateNumberString(
        information.height,
        context,
        'height',
        { min: 1 }
      );
    }

    context.path.pop();
  }

  /**
   * 验证页面节点
   */
  private static validatePage(page: VSNPage, context: ValidationContext): void {
    // 验证必填字段
    FieldValidator.validateRequired(page.regions, context, 'regions');
    FieldValidator.validateRequired(page.loopType, context, 'loopType');
    FieldValidator.validateRequired(page.bgColor, context, 'bgColor');

    // 验证loopType
    if (page.loopType) {
      FieldValidator.validateEnum(
        page.loopType,
        ['0', '1'],
        context,
        'loopType'
      );
    }

    // 验证背景色
    if (page.bgColor) {
      FieldValidator.validateVSNColor(page.bgColor, context, 'bgColor');
    }

    // 验证业务规则
    BusinessRuleValidator.validateLoopTypeDuration(page, context);

    // 验证regions
    if (page.regions && page.regions.length > 0) {
      page.regions.forEach((region, index) => {
        context.path.push(`regions[${index}]`);
        this.validateRegion(region, context);
        context.path.pop();
      });
    }
  }

  /**
   * 验证区域节点
   */
  private static validateRegion(region: VSNRegion, context: ValidationContext): void {
    // 验证必填字段
    FieldValidator.validateRequired(region.items, context, 'items');
    FieldValidator.validateRequired(region.rect, context, 'rect');
    FieldValidator.validateRequired(region.name, context, 'name');
    FieldValidator.validateRequired(region.isScheduleRegion, context, 'isScheduleRegion');

    // 验证isScheduleRegion
    if (region.isScheduleRegion) {
      FieldValidator.validateEnum(
        region.isScheduleRegion,
        ['0', '1'],
        context,
        'isScheduleRegion'
      );
    }

    // 验证rect
    BusinessRuleValidator.validateRegionRect(region, context);

    // 验证同步窗口规则
    BusinessRuleValidator.validateSyncRegionItemTypes(region, context);

    // 验证items
    if (region.items && region.items.length > 0) {
      region.items.forEach((item, index) => {
        context.path.push(`items[${index}]`);
        this.validateItem(item, context);
        context.path.pop();
      });
    }
  }

  /**
   * 验证素材项节点
   */
  private static validateItem(item: VSNItem, context: ValidationContext): void {
    // 验证type字段
    FieldValidator.validateRequired(item.type, context, 'type');

    // 根据类型进行具体验证
    switch (item.type) {
      case '2':
        ItemValidator.validateImageItem(item, context);
        break;
      case '3':
        ItemValidator.validateVideoItem(item, context);
        break;
      case '4':
      case '5':
        ItemValidator.validateTextItem(item, context);
        break;
      case '6':
        ItemValidator.validateGifItem(item, context);
        break;
      case '9':
        ItemValidator.validateClockItem(item, context);
        break;
      case '27':
        ItemValidator.validateWebItem(item, context);
        break;
      default:
        createValidationError(
          context,
          ValidationErrorCode.INVALID_DATA_TYPE,
          `不支持的素材类型: ${item.type}`,
          ValidationLevel.WARNING
        );
    }
  }
}

/**
 * 快速验证函数
 */
export const validateVSN = VSNValidator.validate;