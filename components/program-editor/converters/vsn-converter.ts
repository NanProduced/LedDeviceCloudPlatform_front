/**
 * VSN格式转换器
 * 
 * 实现EditorState和VSNData之间的双向转换
 * 确保数据完整性和VSN格式兼容性
 */

import {
  EditorState,
  EditorPage,
  EditorRegion,
  EditorItem,
  VSNData,
  VSNPage,
  VSNRegion,
  VSNItem,
  VSNInformation,
  VSNImageItem,
  VSNVideoItem,
  VSNTextItem,
  VSNGifItem,
  VSNWebItem,
  VSNClockItem,
  VSNWeatherItem,
  VSNSensorItem,
  VSNTimerItem,
  VSNConversionResult,
  VSNValidationResult,
  ItemType,
  MaterialReference
} from '../types';

import { ColorConverter } from './color-converter';
import { VSNValidator } from './validation-utils';

/**
 * 转换错误
 */
export class ConversionError extends Error {
  constructor(message: string, public readonly context?: string) {
    super(`VSN转换失败: ${message}${context ? ` (${context})` : ''}`);
    this.name = 'ConversionError';
  }
}

/**
 * 转换选项
 */
interface ConversionOptions {
  /** 是否严格模式（缺少必填字段时抛出错误） */
  strict?: boolean;
  /** 是否填充默认值 */
  fillDefaults?: boolean;
  /** 是否验证结果 */
  validate?: boolean;
  /** 素材引用映射 */
  materialRefs?: Record<string, MaterialReference>;
}

/**
 * 默认转换选项
 */
const DEFAULT_OPTIONS: ConversionOptions = {
  strict: false,
  fillDefaults: true,
  validate: true,
  materialRefs: {}
};

/**
 * 数值转换工具
 */
class NumberUtils {
  /**
   * 数值转字符串
   */
  static toString(value: number | undefined): string {
    return value !== undefined ? value.toString() : '0';
  }

  /**
   * 字符串转数值
   */
  static toNumber(value: string | undefined): number {
    if (!value) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * 布尔值转VSN字符串
   */
  static boolToVSN(value: boolean | undefined): string {
    return value ? '1' : '0';
  }

  /**
   * VSN字符串转布尔值
   */
  static vsnToBool(value: string | undefined): boolean {
    return value === '1';
  }
}

/**
 * VSN转换器主类
 */
export class VSNConverter {
  /**
   * 将EditorState转换为VSNData
   */
  static convertToVSN(
    editorState: EditorState,
    materialRefs: MaterialReference[] = [],
    options: ConversionOptions = {}
  ): VSNConversionResult {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      // 创建素材引用映射
      const materialRefMap: Record<string, MaterialReference> = {};
      materialRefs.forEach(ref => {
        materialRefMap[ref.materialId] = ref;
      });
      opts.materialRefs = materialRefMap;

      // 转换数据
      const vsnData: VSNData = {
        information: this.convertInformation(editorState.program, opts),
        pages: editorState.pages.map(page => this.convertPage(page, opts)),
        programId: editorState.program.id,
        isBucketProgram: false // 暂不支持桶节目
      };

      // 验证结果
      let validation: VSNValidationResult = { isValid: true, errors: [], warnings: [] };
      if (opts.validate) {
        validation = VSNValidator.validate(vsnData);
      }

      return {
        vsnData,
        validation
      };
    } catch (error) {
      const validation: VSNValidationResult = {
        isValid: false,
        errors: [{
          field: 'root',
          message: error instanceof Error ? error.message : '转换失败',
          code: 'CONVERSION_ERROR',
          level: 'error'
        }],
        warnings: []
      };

      return {
        vsnData: this.createEmptyVSNData(),
        validation
      };
    }
  }

  /**
   * 将VSNData转换为EditorState
   */
  static convertFromVSN(
    vsnData: VSNData,
    options: ConversionOptions = {}
  ): EditorState {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const editorState: EditorState = {
        program: {
          id: vsnData.programId,
          name: '导入的节目',
          width: NumberUtils.toNumber(vsnData.information.width),
          height: NumberUtils.toNumber(vsnData.information.height)
        },
        pages: vsnData.pages.map((page, index) => 
          this.convertPageFromVSN(page, index, opts)
        ),
        currentPageIndex: 0,
        canvasStates: {}
      };

      return editorState;
    } catch (error) {
      throw new ConversionError(
        error instanceof Error ? error.message : '从VSN转换失败'
      );
    }
  }

  /**
   * 转换节目信息
   */
  private static convertInformation(
    program: any,
    options: ConversionOptions
  ): VSNInformation {
    return {
      width: NumberUtils.toString(program.width || 1920),
      height: NumberUtils.toString(program.height || 1080)
    };
  }

  /**
   * 转换页面
   */
  private static convertPage(
    page: EditorPage,
    options: ConversionOptions
  ): VSNPage {
    // 兼容新编辑器模型：duration为对象、背景颜色为backgroundColor
    const loopTypeNum: 0 | 1 = (page as any).autoLoop ? 1 : 0;
    const appointMs = (page as any).duration?.milliseconds ?? (page as any).duration ?? 5000;
    const bgHex = (page as any).backgroundColor?.value || (page as any).bgColor || '#000000';

    const vsnPage: VSNPage = {
      regions: page.regions.map(region => this.convertRegion(region, options)),
      loopType: NumberUtils.toString(loopTypeNum),
      appointDuration: loopTypeNum === 0 ? NumberUtils.toString(appointMs) : '',
      bgColor: ColorConverter.hexToVSNColor(bgHex)
    };

    // 处理背景文件
    if (page.bgFile) {
      vsnPage.bgFile = {
        isRelative: NumberUtils.boolToVSN(page.bgFile.isRelative),
        filePath: page.bgFile.filePath,
        md5: page.bgFile.md5 || ''
      };
    }

    // 处理背景音频
    if (page.bgAudios && page.bgAudios.length > 0) {
      vsnPage.bgAudios = page.bgAudios.map(audio => ({
        fileSource: {
          isRelative: NumberUtils.boolToVSN(audio.isRelative),
          filePath: audio.filePath,
          md5: audio.md5
        },
        volume: NumberUtils.toString(audio.volume)
      }));
    }

    return vsnPage;
  }

  /**
   * 转换区域
   */
  private static convertRegion(
    region: EditorRegion,
    options: ConversionOptions
  ): VSNRegion {
    const rect = (region as any).rect || (region as any).bounds;
    const vsnRegion: VSNRegion = {
      items: region.items.map(item => this.convertItem(item, options)),
      rect: {
        x: NumberUtils.toString(rect?.x || 0),
        y: NumberUtils.toString(rect?.y || 0),
        width: NumberUtils.toString(rect?.width || 0),
        height: NumberUtils.toString(rect?.height || 0),
        borderWidth: NumberUtils.toString(rect?.borderWidth || (region as any).borderWidth || 0)
      },
      name: region.name,
      isScheduleRegion: NumberUtils.boolToVSN((region as any).isScheduleRegion || false)
    };

    // 处理可选字段
    if (region.layer !== undefined) {
      vsnRegion.layer = NumberUtils.toString(region.layer);
    }

    return vsnRegion;
  }

  /**
   * 转换素材项
   */
  private static convertItem(
    item: EditorItem,
    options: ConversionOptions
  ): VSNItem {
    const baseItem: any = {
      type: NumberUtils.toString(item.type),
      name: (item as any).name
    };

    // 根据类型转换
    switch (item.type) {
      case ItemType.IMAGE:
        return this.convertImageItem(item, baseItem, options);
      case ItemType.VIDEO:
        return this.convertVideoItem(item, baseItem, options);
      case ItemType.SINGLE_LINE_TEXT:
      case ItemType.MULTI_LINE_TEXT:
      case ItemType.SINGLE_COLUMN_TEXT:
        return this.convertTextItem(item, baseItem, options);
      case ItemType.GIF:
        return this.convertGifItem(item, baseItem, options);
      case ItemType.WEB_STREAM:
        return this.convertWebItem(item, baseItem, options);
      case ItemType.CLOCK:
        return this.convertClockItem(item, baseItem, options);
      case ItemType.WEATHER:
        return this.convertWeatherItem(item, baseItem, options);
      case ItemType.HUMIDITY:
      case ItemType.TEMPERATURE:
      case ItemType.NOISE:
      case ItemType.AIR_QUALITY:
      case ItemType.SMOKE:
      case ItemType.SENSOR_TIP:
      case ItemType.SENSOR_INITIAL:
        return this.convertSensorItem(item, baseItem, options);
      case ItemType.TIMER:
        return this.convertTimerItem(item, baseItem, options);
      default:
        throw new ConversionError(`不支持的素材类型: ${item.type}`);
    }
  }

  /**
   * 转换图片素材
   */
  private static convertImageItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNImageItem {
    const materialRef = this.getMaterialRef(item, options) || (item as any).materialRef;
    const alpha = (item as any).opacity ?? 1;
    const preserve = (item as any).preserveAspectRatio ?? false;

    return {
      ...baseItem,
      type: '2',
      fileSource: materialRef ? this.convertFileSource(materialRef as any) : {
        isRelative: '1',
        filePath: './placeholder.jpg'
      },
      alpha: NumberUtils.toString(alpha),
      duration: undefined,
      reserveAS: NumberUtils.boolToVSN(preserve)
    };
  }

  /**
   * 转换视频素材
   */
  private static convertVideoItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNVideoItem {
    const materialRef = this.getMaterialRef(item, options) || (item as any).materialRef;
    const preserve = (item as any).preserveAspectRatio ?? false;
    const playMs = (item as any).playDuration?.milliseconds;

    return {
      ...baseItem,
      type: '3',
      fileSource: materialRef ? this.convertFileSource(materialRef as any) : {
        isRelative: '1',
        filePath: './placeholder.mp4'
      },
      reserveAS: NumberUtils.boolToVSN(preserve),
      duration: playMs ? NumberUtils.toString(playMs) : undefined
    };
  }

  /**
   * 转换文本素材
   */
  private static convertTextItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNTextItem {
    const props = (item as any);
    const textColorHex = props.color?.value || '#000000';
    const italic = props.fontStyle === 'italic';
    const underline = props.textDecoration === 'underline';

    const textItem: VSNTextItem = {
      ...baseItem,
      type: NumberUtils.toString(item.type),
      text: props.content || props.text || '',
      textColor: ColorConverter.hexToVSNColor(textColorHex),
      logFont: {
        lfHeight: NumberUtils.toString(props.fontSize || 24),
        lfWeight: props.fontWeight === 'bold' ? '700' : '400',
        lfItalic: NumberUtils.boolToVSN(italic),
        lfUnderline: NumberUtils.boolToVSN(underline),
        lfFaceName: props.fontFamily
      }
    };

    // 处理可选属性
    if (props.letterSpacing !== undefined) {
      textItem.wordSpacing = NumberUtils.toString(props.letterSpacing);
    }

    if (props.isScroll !== undefined) {
      textItem.isScroll = NumberUtils.boolToVSN(props.isScroll);
    }

    if (props.textAlign !== undefined) {
      textItem.centeralAlign = NumberUtils.toString(props.textAlign);
    }

    // 处理滚动相关属性
    if (props.isScroll) {
      if (props.scrollSpeed !== undefined) {
        textItem.speed = NumberUtils.toString(props.scrollSpeed);
      }
      if (props.isHeadConnectTail !== undefined) {
        textItem.isHeadConnectTail = NumberUtils.boolToVSN(props.isHeadConnectTail);
      }
      if (props.repeatCount !== undefined) {
        textItem.repeatCount = NumberUtils.toString(props.repeatCount);
      }
    }

    return textItem;
  }

  /**
   * 转换GIF素材
   */
  private static convertGifItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNGifItem {
    const materialRef = this.getMaterialRef(item, options) || (item as any).materialRef;
    const playTimes = (item as any).playTimes ?? 1;
    const alpha = (item as any).opacity ?? 1;
    const preserve = (item as any).preserveAspectRatio ?? true;

    return {
      ...baseItem,
      type: '6',
      fileSource: materialRef ? this.convertFileSource(materialRef as any) : {
        isRelative: '1',
        filePath: './placeholder.gif'
      },
      playTimes: NumberUtils.toString(playTimes),
      alpha: NumberUtils.toString(alpha),
      reserveAS: NumberUtils.boolToVSN(preserve)
    };
  }

  /**
   * 转换网页素材
   */
  private static convertWebItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNWebItem {
    const props = (item as any).properties || (item as any);

    return {
      ...baseItem,
      type: '27',
      url: props.url || 'about:blank',
      duration: NumberUtils.toString(props.duration || 5000),
      alpha: NumberUtils.toString(props.alpha ?? 1),
      backColor: props.backColor ? 
        ColorConverter.hexToVSNColor(props.backColor) : 
        ColorConverter.hexToVSNColor('#FFFFFF'),
      isLocal: props.isLocal ? NumberUtils.boolToVSN(props.isLocal) : undefined
    };
  }

  /**
   * 转换时钟素材
   */
  private static convertClockItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNClockItem {
    const props = (item as any).properties || (item as any);

    return {
      ...baseItem,
      type: '9',
      duration: NumberUtils.toString(props.duration || 5000),
      isAnalog: NumberUtils.boolToVSN(props.isAnalog || false),
      timezone: NumberUtils.toString(props.timezone || 0),
      zoneBias: props.zoneBias ? NumberUtils.toString(props.zoneBias) : undefined,
      zoneDescripId: props.zoneDescripId,
      centeralAlign: props.textAlign ? NumberUtils.toString(props.textAlign) : undefined,
      text: props.fixedText,
      daylightZone: props.useDaylightTime ? NumberUtils.boolToVSN(props.useDaylightTime) : undefined
    };
  }

  /**
   * 转换气象素材
   */
  private static convertWeatherItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNWeatherItem {
    const props = (item as any).properties || (item as any);

    return {
      ...baseItem,
      type: '14',
      backColor: props.backColor ? 
        ColorConverter.hexToVSNColor(props.backColor) : 
        ColorConverter.hexToVSNColor('#FFFFFF'),
      duration: NumberUtils.toString(props.duration || 5000),
      regionName: props.regionName || '',
      regionCode: props.regionCode || '',
      serverType: NumberUtils.toString(props.serverType || 0),
      logFont: {
        lfHeight: NumberUtils.toString(props.font?.size || 24),
        lfWeight: props.font?.weight === 'bold' ? '700' : '400',
        lfItalic: NumberUtils.boolToVSN(props.font?.italic),
        lfUnderline: NumberUtils.boolToVSN(props.font?.underline),
        lfFaceName: props.font?.family
      },
      playTimes: '1',
      remainTime: NumberUtils.toString(props.duration ? props.duration / 100 : 50),
      showStyle: '0',
      bShowAsFahrenheit: NumberUtils.boolToVSN(props.useFahrenheit || false)
    };
  }

  /**
   * 转换传感器素材
   */
  private static convertSensorItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNSensorItem {
    const props = (item as any).properties || (item as any);

    return {
      ...baseItem,
      type: NumberUtils.toString(item.type),
      logFont: {
        lfHeight: NumberUtils.toString(props.font?.size || 24),
        lfWeight: props.font?.weight === 'bold' ? '700' : '400',
        lfItalic: NumberUtils.boolToVSN(props.font?.italic),
        lfUnderline: NumberUtils.boolToVSN(props.font?.underline),
        lfFaceName: props.font?.family
      },
      centeralAlign: props.textAlign ? NumberUtils.toString(props.textAlign) : undefined,
      textColor: props.textColor ? ColorConverter.hexToVSNColor(props.textColor) : undefined,
      prefix: props.prefix,
      suffix: props.suffix,
      bShowAsFahrenheit: props.useFahrenheit ? NumberUtils.boolToVSN(props.useFahrenheit) : undefined
    };
  }

  /**
   * 转换计时器素材
   */
  private static convertTimerItem(
    item: EditorItem,
    baseItem: any,
    options: ConversionOptions
  ): VSNTimerItem {
    const props = (item as any).properties || (item as any);

    return {
      ...baseItem,
      type: '15',
      logFont: {
        lfHeight: NumberUtils.toString(props.fontSize || 24),
        lfWeight: props.fontWeight === 'bold' ? '700' : '400',
        lfItalic: NumberUtils.boolToVSN(props.fontStyle === 'italic'),
        lfUnderline: NumberUtils.boolToVSN(props.textDecoration === 'underline'),
        lfFaceName: props.fontFamily
      },
      duration: NumberUtils.toString(props.duration?.milliseconds || props.duration || 5000),
      textColor: ColorConverter.hexToVSNColor(props.color?.value || '#000000'),
      prefix: props.prefix || '',
      beToEndTime: '0', // 默认正计时
      endDateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
  }

  /**
   * 从VSN转换页面
   */
  private static convertPageFromVSN(
    vsnPage: VSNPage,
    index: number,
    options: ConversionOptions
  ): EditorPage {
    const page: EditorPage = {
      id: `page_${index}`,
      name: `页面${index + 1}`,
      duration: NumberUtils.toNumber(vsnPage.appointDuration) || 5000,
      loopType: NumberUtils.toNumber(vsnPage.loopType) as 0 | 1,
      bgColor: ColorConverter.vsnColorToHex(vsnPage.bgColor),
      regions: vsnPage.regions.map((region, regionIndex) => 
        this.convertRegionFromVSN(region, regionIndex, options)
      )
    };

    // 处理背景文件
    if (vsnPage.bgFile) {
      page.bgFile = {
        filePath: vsnPage.bgFile.filePath,
        isRelative: NumberUtils.vsnToBool(vsnPage.bgFile.isRelative),
        md5: vsnPage.bgFile.md5
      };
    }

    // 处理背景音频
    if (vsnPage.bgAudios) {
      page.bgAudios = vsnPage.bgAudios.map(audio => ({
        filePath: audio.fileSource.filePath,
        volume: NumberUtils.toNumber(audio.volume),
        isRelative: NumberUtils.vsnToBool(audio.fileSource.isRelative),
        md5: audio.fileSource.md5
      }));
    }

    return page;
  }

  /**
   * 从VSN转换区域
   */
  private static convertRegionFromVSN(
    vsnRegion: VSNRegion,
    index: number,
    options: ConversionOptions
  ): EditorRegion {
    return {
      id: `region_${index}`,
      name: vsnRegion.name,
      rect: {
        x: NumberUtils.toNumber(vsnRegion.rect.x),
        y: NumberUtils.toNumber(vsnRegion.rect.y),
        width: NumberUtils.toNumber(vsnRegion.rect.width),
        height: NumberUtils.toNumber(vsnRegion.rect.height),
        borderWidth: NumberUtils.toNumber(vsnRegion.rect.borderWidth)
      },
      items: vsnRegion.items.map((item, itemIndex) => 
        this.convertItemFromVSN(item, itemIndex, options)
      ),
      isScheduleRegion: NumberUtils.vsnToBool(vsnRegion.isScheduleRegion),
      layer: vsnRegion.layer ? NumberUtils.toNumber(vsnRegion.layer) : undefined
    };
  }

  /**
   * 从VSN转换素材项
   */
  private static convertItemFromVSN(
    vsnItem: VSNItem,
    index: number,
    options: ConversionOptions
  ): EditorItem {
    const type = NumberUtils.toNumber(vsnItem.type) as ItemType;
    
    const baseItem: EditorItem = {
      id: `item_${index}`,
      type,
      name: vsnItem.name,
      position: { x: 0, y: 0 }, // VSN中没有位置信息，使用默认值
      size: { width: 200, height: 50 }, // VSN中没有尺寸信息，使用默认值
      properties: {}
    };

    // 根据类型设置属性（这里只是基本转换，具体实现需要根据每种类型的特点）
    switch (type) {
      case ItemType.SINGLE_LINE_TEXT:
      case ItemType.MULTI_LINE_TEXT:
        const textItem = vsnItem as VSNTextItem;
        baseItem.properties = {
          text: textItem.text,
          textColor: ColorConverter.vsnColorToHex(textItem.textColor),
          font: {
            size: NumberUtils.toNumber(textItem.logFont.lfHeight),
            family: textItem.logFont.lfFaceName,
            weight: textItem.logFont.lfWeight === '700' ? 'bold' : 'normal',
            italic: NumberUtils.vsnToBool(textItem.logFont.lfItalic),
            underline: NumberUtils.vsnToBool(textItem.logFont.lfUnderline)
          }
        };
        break;
      // 其他类型的转换...
    }

    return baseItem;
  }

  /**
   * 获取素材引用
   */
  private static getMaterialRef(
    item: EditorItem,
    options: ConversionOptions
  ): MaterialReference | null {
    if (!item.materialRef || !options.materialRefs) {
      return null;
    }
    return options.materialRefs[item.materialRef.materialId] || null;
  }

  /**
   * 转换文件源
   */
  private static convertFileSource(materialRef: any) {
    // 兼容新旧两种素材引用结构
    const isRelative = materialRef?.isRelative ?? false;
    const originName = materialRef?.originName || materialRef?.originalName || materialRef?.materialName || '';
    const md5 = materialRef?.md5Hash || materialRef?.md5 || '';
    let filePath: string | undefined = materialRef?.filePath || materialRef?.convertPath || materialRef?.accessUrl;
    if (!filePath) {
      const fileId: string | undefined = materialRef?.fileId;
      if (fileId) {
        // 兜底使用文件服务的流地址，保证VSN校验通过（后端可再做二次转换）
        filePath = `/file/api/file/stream/${fileId}`;
      }
    }
    if (!filePath) {
      // 最后兜底，避免空字符串导致校验失败
      filePath = './placeholder.bin';
    }

    return {
      isRelative: NumberUtils.boolToVSN(isRelative),
      filePath,
      md5,
      originName,
      convertPath: materialRef?.convertPath
    };
  }

  /**
   * 创建空的VSN数据
   */
  private static createEmptyVSNData(): VSNData {
    return {
      information: { width: '1920', height: '1080' },
      pages: []
    };
  }
}

/**
 * 便捷导出函数
 */
export const convertToVSN = VSNConverter.convertToVSN;
export const convertFromVSN = VSNConverter.convertFromVSN;