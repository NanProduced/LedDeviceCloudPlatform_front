/**
 * 转换器模块统一导出
 * 
 * 提供VSN格式转换、颜色转换、验证等功能
 */

// VSN格式转换器
export * from './vsn-converter';
export { VSNConverter, ConversionError, convertToVSN, convertFromVSN } from './vsn-converter';

// 颜色格式转换器
export * from './color-converter';
export { 
  ColorConverter, 
  ColorValidator, 
  ColorConversionError,
  colorUtils,
  CommonColors,
  ColorPalettes
} from './color-converter';

// 验证工具
export * from './validation-utils';
export { 
  VSNValidator, 
  FieldValidator, 
  BusinessRuleValidator, 
  ItemValidator,
  ValidationLevel,
  ValidationErrorCode,
  validateVSN
} from './validation-utils';

// Fabric.js序列化器
export * from './fabric-serializer';
export { 
  FabricSerializer, 
  SerializationError,
  serializeCanvas,
  deserializeCanvas,
  createFabricObject
} from './fabric-serializer';

// 重新导出常用类型
export type {
  RGBAColor
} from './color-converter';

export type {
  ConversionOptions
} from './vsn-converter';

/**
 * 转换器工具集合
 */
export const Converters = {
  VSN: VSNConverter,
  Color: ColorConverter,
  Validator: VSNValidator,
  Fabric: FabricSerializer
} as const;

/**
 * 便捷工具函数集合
 */
export const utils = {
  // VSN转换
  toVSN: convertToVSN,
  fromVSN: convertFromVSN,
  validateVSN: validateVSN,
  
  // 颜色转换
  hexToVSN: colorUtils.hexToVSN,
  vsnToHex: colorUtils.vsnToHex,
  hexToRGBA: colorUtils.hexToRGBA,
  rgbaToHex: colorUtils.rgbaToHex,
  
  // Fabric.js序列化
  serializeCanvas: serializeCanvas,
  deserializeCanvas: deserializeCanvas,
  createFabricObject: createFabricObject,
  
  // 验证
  isValidHex: colorUtils.isValidHex,
  isValidVSN: colorUtils.isValidVSN
} as const;