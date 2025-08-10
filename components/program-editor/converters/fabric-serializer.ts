"use client";
/**
 * Fabric.js 序列化器
 * 
 * 负责Fabric.js对象的序列化和反序列化，确保画布状态的完整保存和恢复
 */

import { fabric } from 'fabric';
import {
  SerializedFabricObject,
  CanvasState,
  EditorItem,
  MaterialReference,
  ItemProperties,
  ItemType
} from '../types';

/**
 * 序列化错误
 */
export class SerializationError extends Error {
  constructor(message: string, public readonly objectId?: string) {
    super(`Fabric.js序列化失败: ${message}${objectId ? ` (对象ID: ${objectId})` : ''}`);
    this.name = 'SerializationError';
  }
}

/**
 * 序列化选项
 */
interface SerializationOptions {
  /** 是否包含图片数据 */
  includeImageData?: boolean;
  /** 是否压缩数据 */
  compress?: boolean;
  /** 自定义属性列表 */
  customProperties?: string[];
}

/**
 * 反序列化选项
 */
interface DeserializationOptions {
  /** 素材引用映射 */
  materialRefs?: Record<string, MaterialReference>;
  /** 是否严格模式 */
  strict?: boolean;
  /** 错误处理回调 */
  onError?: (error: Error, objectData: any) => void;
}

/**
 * 默认序列化选项
 */
const DEFAULT_SERIALIZATION_OPTIONS: SerializationOptions = {
  includeImageData: false,
  compress: false,
  customProperties: ['id', 'itemType', 'materialRefId', 'editorProperties']
};

/**
 * 默认反序列化选项
 */
const DEFAULT_DESERIALIZATION_OPTIONS: DeserializationOptions = {
  materialRefs: {},
  strict: false
};

// 注意：不要在模块顶层直接访问 fabric.*，以避免在SSR阶段因未定义而报错。
// 如果需要类型映射，请在运行时（函数内部）访问。

/**
 * 编辑器对象类型到Fabric.js类型的映射
 */
const EDITOR_TO_FABRIC_TYPE_MAP: Record<ItemType, string> = {
  [ItemType.IMAGE]: 'image',
  [ItemType.VIDEO]: 'image', // 视频在canvas中以图片形式显示
  [ItemType.GIF]: 'image',
  [ItemType.SINGLE_LINE_TEXT]: 'text',
  [ItemType.MULTI_LINE_TEXT]: 'textbox',
  [ItemType.SINGLE_COLUMN_TEXT]: 'textbox',
  [ItemType.WEB_STREAM]: 'rect', // 网页以矩形占位符显示
  [ItemType.CLOCK]: 'text',
  [ItemType.WEATHER]: 'text',
  [ItemType.HUMIDITY]: 'text',
  [ItemType.TEMPERATURE]: 'text',
  [ItemType.NOISE]: 'text',
  [ItemType.AIR_QUALITY]: 'text',
  [ItemType.SMOKE]: 'text',
  [ItemType.SENSOR_TIP]: 'text',
  [ItemType.SENSOR_INITIAL]: 'text',
  [ItemType.TIMER]: 'text',
  [ItemType.TV_CARD]: 'rect',
  [ItemType.DOC]: 'rect',
  [ItemType.EXCEL]: 'rect',
  [ItemType.PPT]: 'rect',
  [ItemType.EXQUISITE_CLOCK]: 'text'
};

/**
 * Fabric.js序列化器主类
 */
export class FabricSerializer {
  /**
   * 序列化Fabric.js画布
   */
  static serializeCanvas(
    canvas: fabric.Canvas,
    options: SerializationOptions = {}
  ): CanvasState {
    const opts = { ...DEFAULT_SERIALIZATION_OPTIONS, ...options };

    try {
      const objects = canvas.getObjects().map(obj => 
        this.serializeObject(obj, opts)
      );

      const viewport = canvas.viewportTransform;
      
      return {
        objects,
        zoom: canvas.getZoom(),
        panX: viewport ? viewport[4] : 0,
        panY: viewport ? viewport[5] : 0
      };
    } catch (error) {
      throw new SerializationError(
        error instanceof Error ? error.message : '画布序列化失败'
      );
    }
  }

  /**
   * 反序列化到Fabric.js画布
   */
  static deserializeCanvas(
    canvas: fabric.Canvas,
    canvasState: CanvasState,
    options: DeserializationOptions = {}
  ): Promise<void> {
    const opts = { ...DEFAULT_DESERIALIZATION_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      try {
        // 清空画布
        canvas.clear();

        // 设置视图状态
        canvas.setZoom(canvasState.zoom || 1);
        if (canvasState.panX !== undefined || canvasState.panY !== undefined) {
          canvas.viewportTransform[4] = canvasState.panX || 0;
          canvas.viewportTransform[5] = canvasState.panY || 0;
        }

        // 反序列化对象（确保不在SSR中执行）
        const promises = (typeof window !== 'undefined')
          ? canvasState.objects.map(objData => this.deserializeObject(objData, opts))
          : Promise.resolve([] as fabric.Object[]);

        Promise.all(promises)
          .then((objects: any) => {
            // 添加对象到画布
            objects.forEach(obj => {
              if (obj) {
                canvas.add(obj);
              }
            });

            canvas.renderAll();
            resolve();
          })
          .catch(reject);
      } catch (error) {
        reject(new SerializationError(
          error instanceof Error ? error.message : '画布反序列化失败'
        ));
      }
    });
  }

  /**
   * 序列化单个Fabric.js对象
   */
  static serializeObject(
    obj: fabric.Object,
    options: SerializationOptions
  ): SerializedFabricObject {
    try {
      // 获取基础Fabric.js属性
      const fabricProperties = obj.toObject([
        ...(options.customProperties || []),
        'selectable',
        'evented',
        'lockMovementX',
        'lockMovementY',
        'lockRotation',
        'lockScalingX',
        'lockScalingY'
      ]);

      // 提取编辑器扩展属性
      const editorProperties = (obj as any).editorProperties || {};
      const materialRef = (obj as any).materialRef;
      const itemType = (obj as any).itemType;

      return {
        id: (obj as any).id || `obj_${Date.now()}`,
        type: obj.type || 'object',
        fabricProperties,
        editorProperties,
        materialRef
      };
    } catch (error) {
      throw new SerializationError(
        `对象序列化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        (obj as any).id
      );
    }
  }

  /**
   * 反序列化单个Fabric.js对象
   */
  static deserializeObject(
    objData: SerializedFabricObject,
    options: DeserializationOptions
  ): Promise<fabric.Object | null> {
    return new Promise((resolve, reject) => {
      try {
        const { type, fabricProperties, editorProperties, materialRef } = objData;

        // 处理不同类型的对象
        switch (type) {
          case 'image':
            this.deserializeImageObject(fabricProperties, editorProperties, materialRef, options)
              .then(obj => {
                if (obj) {
                  this.applyCommonProperties(obj, objData);
                }
                resolve(obj);
              })
              .catch(reject);
            break;

          case 'text':
          case 'i-text':
          case 'textbox':
            const textObj = this.deserializeTextObject(fabricProperties, editorProperties, type);
            if (textObj) {
              this.applyCommonProperties(textObj, objData);
            }
            resolve(textObj);
            break;

          case 'rect':
            const rectObj = this.deserializeRectObject(fabricProperties, editorProperties);
            if (rectObj) {
              this.applyCommonProperties(rectObj, objData);
            }
            resolve(rectObj);
            break;

          case 'circle':
            const circleObj = this.deserializeCircleObject(fabricProperties, editorProperties);
            if (circleObj) {
              this.applyCommonProperties(circleObj, objData);
            }
            resolve(circleObj);
            break;

          default:
            // 使用通用方法反序列化
            fabric.util.enlivenObjects([fabricProperties], (objects: fabric.Object[]) => {
              const obj = objects[0];
              if (obj) {
                this.applyCommonProperties(obj, objData);
              }
              resolve(obj || null);
            }, '');
        }
      } catch (error) {
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error('反序列化失败'), objData);
        }
        
        if (options.strict) {
          reject(error);
        } else {
          resolve(null); // 非严格模式下跳过错误对象
        }
      }
    });
  }

  /**
   * 反序列化图片对象
   */
  private static deserializeImageObject(
    fabricProperties: any,
    editorProperties: ItemProperties,
    materialRef?: MaterialReference,
    options: DeserializationOptions = {}
  ): Promise<fabric.Image | null> {
    return new Promise((resolve) => {
      // 获取图片URL
      let imageUrl = fabricProperties.src;
      
      if (materialRef && options.materialRefs?.[materialRef.materialId]) {
        const ref = options.materialRefs[materialRef.materialId];
        imageUrl = ref.accessUrl;
      }

      if (!imageUrl) {
        // 使用占位图片
        imageUrl = this.createPlaceholderImageUrl(
          fabricProperties.width || 200,
          fabricProperties.height || 150,
          '图片'
        );
      }

      // 创建图片对象
      // 在客户端环境中再访问 fabric.Image
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      fabric.Image.fromURL(imageUrl, (img) => {
        if (img) {
          // 应用属性
          img.set(fabricProperties);
          
          // 处理图片加载失败的情况
          img.on('image:loaded', () => {
            resolve(img);
          });
          
          // 如果图片加载失败，使用占位图片
          const originalImg = img.getElement() as HTMLImageElement;
          originalImg.onerror = () => {
            const placeholderUrl = this.createPlaceholderImageUrl(
              fabricProperties.width || 200,
              fabricProperties.height || 150,
              '加载失败'
            );
            
            fabric.Image.fromURL(placeholderUrl, (placeholderImg) => {
              if (placeholderImg) {
                placeholderImg.set(fabricProperties);
                resolve(placeholderImg);
              } else {
                resolve(null);
              }
            }, { crossOrigin: 'anonymous' } as any);
          };
          
          resolve(img);
        } else {
          resolve(null);
        }
      }, { crossOrigin: 'anonymous' } as any);
    });
  }

  /**
   * 反序列化文本对象
   */
  private static deserializeTextObject(
    fabricProperties: any,
    editorProperties: ItemProperties,
    type: string
  ): fabric.Object | null {
    try {
      let textObj: fabric.Object;

      switch (type) {
        case 'i-text':
          textObj = new fabric.IText(fabricProperties.text || '', fabricProperties);
          break;
        case 'textbox':
          textObj = new fabric.Textbox(fabricProperties.text || '', fabricProperties);
          break;
        default:
          textObj = new fabric.Text(fabricProperties.text || '', fabricProperties);
      }

      return textObj;
    } catch (error) {
      console.error('文本对象反序列化失败:', error);
      return null;
    }
  }

  /**
   * 反序列化矩形对象
   */
  private static deserializeRectObject(
    fabricProperties: any,
    editorProperties: ItemProperties
  ): fabric.Rect | null {
    try {
      return new fabric.Rect(fabricProperties);
    } catch (error) {
      console.error('矩形对象反序列化失败:', error);
      return null;
    }
  }

  /**
   * 反序列化圆形对象
   */
  private static deserializeCircleObject(
    fabricProperties: any,
    editorProperties: ItemProperties
  ): fabric.Circle | null {
    try {
      return new fabric.Circle(fabricProperties);
    } catch (error) {
      console.error('圆形对象反序列化失败:', error);
      return null;
    }
  }

  /**
   * 应用通用属性
   */
  private static applyCommonProperties(
    obj: fabric.Object,
    objData: SerializedFabricObject
  ): void {
    // 设置自定义属性
    (obj as any).id = objData.id;
    (obj as any).editorProperties = objData.editorProperties;
    (obj as any).materialRef = objData.materialRef;
    
    // 确保对象可选择和可事件化
    obj.set({
      selectable: true,
      evented: true
    });
  }

  /**
   * 创建占位图片URL
   */
  private static createPlaceholderImageUrl(
    width: number,
    height: number,
    text: string
  ): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD48L3N2Zz4=';
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // 绘制文本
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL();
  }

  /**
   * 从EditorItem创建Fabric.js对象
   */
  static createFabricObjectFromEditorItem(
    item: EditorItem,
    materialRef?: MaterialReference
  ): Promise<fabric.Object | null> {
    return new Promise((resolve) => {
      const fabricType = EDITOR_TO_FABRIC_TYPE_MAP[item.type] || 'rect';
      
      // 基础属性
      const baseProps = {
        left: item.position.x,
        top: item.position.y,
        width: item.size.width,
        height: item.size.height,
        selectable: true,
        evented: true
      };

      // 自定义属性
      const customProps = {
        id: item.id,
        itemType: item.type,
        editorProperties: item.properties,
        materialRef
      };

      switch (fabricType) {
        case 'image':
          this.createImageObject(item, materialRef, baseProps, customProps)
            .then(resolve);
          break;

        case 'text':
        case 'textbox':
          const textObj = this.createTextObject(item, fabricType, baseProps, customProps);
          resolve(textObj);
          break;

        case 'rect':
        default:
          const rectObj = this.createRectObject(item, baseProps, customProps);
          resolve(rectObj);
          break;
      }
    });
  }

  /**
   * 创建图片对象
   */
  private static createImageObject(
    item: EditorItem,
    materialRef: MaterialReference | undefined,
    baseProps: any,
    customProps: any
  ): Promise<fabric.Image | null> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }

      const baseUrl = materialRef?.accessUrl || '';
      const isVideoLike = item.type === ItemType.VIDEO || item.type === ItemType.GIF;
      let previewUrl = baseUrl;
      if (previewUrl) {
        // 对视频/GIF 强制使用截帧，以免直接返回视频文件导致图片解码失败
        if (isVideoLike && !/([?&])t=/.test(previewUrl)) {
          previewUrl += (previewUrl.includes('?') ? '&' : '?') + 't=1000';
        }
        // 尺寸适配，利于更快加载
        const sizeQuery = `w=${Math.max(1, Math.round(item.size.width))}&h=${Math.max(1, Math.round(item.size.height))}&fit=cover`;
        if (!/([?&])(w|h|fit)=/.test(previewUrl)) {
          previewUrl += (previewUrl.includes('?') ? '&' : '?') + sizeQuery;
        }
      }

      const fallbackUrl = this.createPlaceholderImageUrl(
        item.size.width,
        item.size.height,
        isVideoLike ? '视频预览' : '图片'
      );

      const srcToUse = previewUrl || fallbackUrl;

      // 预加载，失败则回退占位图，避免 Fabric 内部 onerror 情况下返回空对象
      const testImg = new Image();
      testImg.onload = () => {
        fabric.Image.fromURL(srcToUse, (img) => {
          if (!img) {
            resolve(null);
            return;
          }
          img.set({
            ...baseProps,
            ...customProps
          });
          if ((item as any).properties?.alpha !== undefined) {
            img.set('opacity', (item as any).properties.alpha);
          }
          resolve(img);
        }, { crossOrigin: 'anonymous' } as any);
      };
      testImg.onerror = () => {
        fabric.Image.fromURL(fallbackUrl, (img) => {
          if (!img) {
            resolve(null);
            return;
          }
          img.set({
            ...baseProps,
            ...customProps
          });
          resolve(img);
        }, { crossOrigin: 'anonymous' } as any);
      };
      testImg.src = srcToUse;
    });
  }

  /**
   * 创建文本对象
   */
  private static createTextObject(
    item: EditorItem,
    fabricType: string,
    baseProps: any,
    customProps: any
  ): fabric.Object | null {
    const textProps = item.properties as any;
    const text = textProps.text || '文本';

    const textOptions = {
      ...baseProps,
      ...customProps,
      fill: textProps.textColor || '#000000',
      fontSize: textProps.font?.size || 24,
      fontFamily: textProps.font?.family || 'Arial',
      fontWeight: textProps.font?.weight || 'normal',
      fontStyle: textProps.font?.italic ? 'italic' : 'normal',
      underline: textProps.font?.underline || false,
      textAlign: ['left', 'center', 'right'][textProps.textAlign || 0] as any
    };

    switch (fabricType) {
      case 'textbox':
        return new fabric.Textbox(text, {
          ...textOptions,
          width: item.size.width
        });
      default:
        return new fabric.Text(text, textOptions);
    }
  }

  /**
   * 创建矩形对象
   */
  private static createRectObject(
    item: EditorItem,
    baseProps: any,
    customProps: any
  ): fabric.Rect {
    const props = item.properties as any;
    
    return new fabric.Rect({
      ...baseProps,
      ...customProps,
      fill: props.backColor || '#ffffff',
      stroke: props.borderColor || '#cccccc',
      strokeWidth: 1
    });
  }
}

/**
 * 便捷导出函数
 */
export const serializeCanvas = FabricSerializer.serializeCanvas;
export const deserializeCanvas = FabricSerializer.deserializeCanvas;
export const createFabricObject = FabricSerializer.createFabricObjectFromEditorItem;