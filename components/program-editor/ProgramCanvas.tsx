'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { fabric as FabricNamespace } from 'fabric';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

import { useEditorStore } from './managers/editor-state-manager';
import { useMaterialStore } from './managers/material-ref-manager';
import { FabricSerializer } from './converters/fabric-serializer';
import { useEditorStore as useStore } from './managers/editor-state-manager';
import { 
  MaterialInfo, 
  EditorItem, 
  ItemType, 
  ITEM_TYPE_MAP 
} from './types';
import { toast } from '@/components/ui/sonner';

interface ProgramCanvasProps {
  width?: number;
  height?: number;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selectedObjects: fabric.Object[]) => void;
}

/**
 * 节目编辑画布组件
 * 基于Fabric.js实现可视化编辑功能，支持素材拖拽、对象创建等
 */
export const ProgramCanvas: React.FC<ProgramCanvasProps> = ({
  width = 1920,
  height = 1080,
  onCanvasReady,
  onSelectionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricNamespace.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricLib, setFabricLib] = useState<FabricNamespace | null>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreatingObject, setIsCreatingObject] = useState(false);
  const [zoom, setZoom] = useState(1);

  // 状态管理
  const {
    currentPageIndex,
    pages,
    selectObjects,
    addItem,
    addRegion,
    updateCanvasState,
    updateItemPosition,
    updateItemSize,
    getCanvas,
    setCanvas,
    getCurrentPage,
    getCanvasState,
  } = useEditorStore();

  const { getMaterialRef } = useMaterialStore();

  // 初始化Fabric.js画布
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (!fabricLib) return;

    // 创建Fabric.js画布实例
    const canvas = new fabricLib.Canvas(canvasRef.current as any, {
      width,
      height,
      backgroundColor: '#000000',
      selection: true,
      preserveObjectStacking: true,
      imageSmoothingEnabled: true,
      allowTouchScrolling: false,
      // 启用缩放和平移
      enableRetinaScaling: true,
    });

    // 设置画布配置
    canvas.setDimensions({
      width: '100%',
      height: '100%',
    }, {
      cssOnly: true,
    });

    // 选择事件监听
    canvas.on('selection:created', (e) => {
      const selectedObjects = canvas.getActiveObjects();
      const selectedIds = selectedObjects.map(obj => (obj as any).id).filter(Boolean);
      selectObjects(selectedIds);
      onSelectionChange?.(selectedObjects);
    });

    canvas.on('selection:updated', (e) => {
      const selectedObjects = canvas.getActiveObjects();
      const selectedIds = selectedObjects.map(obj => (obj as any).id).filter(Boolean);
      selectObjects(selectedIds);
      onSelectionChange?.(selectedObjects);
    });

    canvas.on('selection:cleared', () => {
      selectObjects([]);
      onSelectionChange?.([]);
    });

    // 对象修改事件
    canvas.on('object:modified', (e) => {
      const target = e.target;
      if (!target || !(target as any).id) return;

      const itemId = (target as any).id;
      
      // 更新位置
      updateItemPosition(itemId, {
        x: target.left || 0,
        y: target.top || 0
      });

      // 更新尺寸
      updateItemSize(itemId, {
        width: target.getScaledWidth(),
        height: target.getScaledHeight()
      });

      // 更新画布状态
      updateCanvasStateFromCanvas(canvas);
      // 记录历史
      try {
        // 延迟让状态更新先入store
        setTimeout(() => {
          try {
            (useStore.getState() as any).saveToHistory?.('修改对象');
          } catch {}
        }, 0);
      } catch {}
    });

    // 对象移动事件
    canvas.on('object:moving', (e) => {
      const target = e.target;
      if (!target || !(target as any).id) return;

      const itemId = (target as any).id;
      updateItemPosition(itemId, {
        x: target.left || 0,
        y: target.top || 0
      });
      // 实时移动时不入历史，避免爆量；仅在 modified/added 时入历史
    });

    // 缩放事件
    canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      const point = new fabricLib.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);
      setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // 平移功能
    let isPanning = false;
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (evt.altKey === true) {
        isPanning = true;
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
      }
    });

    canvas.on('mouse:move', (opt: any) => {
      if (isPanning && opt.e) {
        const delta = new fabricLib.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
      }
    });

    canvas.on('mouse:up', () => {
      canvas.defaultCursor = 'default';
      canvas.selection = true;
      isPanning = false;
    });

    // 保存引用
    fabricCanvasRef.current = canvas;
    setCanvas(canvas);

    // 通知父组件画布已准备就绪
    onCanvasReady?.(canvas);
    try {
      (useStore.getState() as any).saveToHistory?.('初始化画布');
    } catch {}

    return canvas;
  }, [width, height, onCanvasReady, onSelectionChange, selectObjects, updateItemPosition, updateItemSize, setCanvas, fabricLib]);

  // 更新画布状态到store
  const updateCanvasStateFromCanvas = useCallback((canvas: FabricNamespace.Canvas) => {
    const viewport = canvas.viewportTransform;
    const canvasState = {
      objects: [], // 这里不需要保存对象，因为我们有EditorState
      zoom: canvas.getZoom(),
      panX: viewport ? viewport[4] : 0,
      panY: viewport ? viewport[5] : 0
    };
    const page = pages[currentPageIndex];
    if (page) {
      updateCanvasState(page.id, canvasState);
    }
  }, [currentPageIndex, pages, updateCanvasState]);

  // 组件挂载时初始化画布
  useEffect(() => {
    const canvas = initCanvas();

    // 清理函数
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [initCanvas]);

  // 动态加载 fabric，仅在客户端
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('fabric');
        if (mounted) setFabricLib(mod.fabric);
      } catch (e) {
        console.error('加载 fabric 失败:', e);
      }
    })();
    return () => { mounted = false };
  }, []);

  // 创建EditorItem
  const createEditorItem = useCallback((material: MaterialInfo, position: { x: number, y: number }): EditorItem => {
    const itemType = getItemTypeFromMaterial(material);
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 根据素材类型设置默认尺寸
    let defaultSize = { width: 200, height: 150 };
    if (material.metadata.dimensions) {
      defaultSize = {
        width: Math.min(material.metadata.dimensions.width, 400),
        height: Math.min(material.metadata.dimensions.height, 300)
      };
    }

    // 创建基础属性
    const baseProperties: any = {
      duration: 5000,
      visible: true,
      locked: false
    };

    // 根据类型添加特定属性
    switch (itemType) {
      case ItemType.IMAGE:
        baseProperties.alpha = 1;
        baseProperties.reserveAS = true;
        break;
      case ItemType.VIDEO:
        baseProperties.alpha = 1;
        baseProperties.reserveAS = true;
        break;
      case ItemType.GIF:
        baseProperties.alpha = 1;
        baseProperties.playTimes = 1;
        break;
      case ItemType.SINGLE_LINE_TEXT:
        baseProperties.text = '文本内容';
        baseProperties.textColor = '#FFFFFF';
        baseProperties.font = {
          size: 24,
          family: 'Arial',
          weight: 'normal',
          italic: false,
          underline: false
        };
        baseProperties.textAlign = 0; // 左对齐
        defaultSize = { width: 200, height: 50 };
        break;
      case ItemType.WEB_STREAM:
        baseProperties.url = 'https://example.com';
        baseProperties.backColor = '#FFFFFF';
        baseProperties.isLocal = false;
        break;
    }

    return {
      id: itemId,
      type: itemType,
      name: material.name,
      position,
      size: defaultSize,
      properties: baseProperties,
      materialRef: {
        materialId: material.id,
        filePath: material.filePath || '',
        accessUrl: material.accessUrl,
        md5Hash: material.md5Hash || '',
        isRelative: material.isRelative || false,
        originName: material.originName || material.name
      }
    };
  }, []);

  // 根据素材推断ItemType
  const getItemTypeFromMaterial = useCallback((material: MaterialInfo): ItemType => {
    switch (material.category) {
      case 'image':
        return material.metadata.format?.toLowerCase() === 'gif' ? ItemType.GIF : ItemType.IMAGE;
      case 'video':
        return ItemType.VIDEO;
      case 'text':
        return ItemType.SINGLE_LINE_TEXT;
      case 'web':
        return ItemType.WEB_STREAM;
      default:
        return ItemType.IMAGE;
    }
  }, []);

  // 从素材创建Fabric.js对象
  const createFabricObjectFromMaterial = useCallback(async (item: EditorItem): Promise<FabricNamespace.Object | null> => {
    setIsCreatingObject(true);
    
    try {
      const materialRef = item.materialRef;
      const fabricObject = await FabricSerializer.createFabricObjectFromEditorItem(item, materialRef);
      
      if (fabricObject) {
        // 设置自定义属性
        (fabricObject as any).id = item.id;
        (fabricObject as any).itemType = item.type;
        (fabricObject as any).editorProperties = item.properties;
        (fabricObject as any).materialRef = materialRef;
      }
      
      return fabricObject;
    } catch (error) {
      console.error('创建Fabric.js对象失败:', error);
      return null;
    } finally {
      setIsCreatingObject(false);
    }
  }, []);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // 只有当离开整个容器时才设置为false
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const dropData = JSON.parse(data);
      if (dropData.type !== 'material') return;

      const material: MaterialInfo = dropData.data;
      if (!material) return;

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // 计算相对于画布的位置
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) / canvas.getZoom() - canvas.viewportTransform![4] / canvas.getZoom();
      const canvasY = (e.clientY - rect.top) / canvas.getZoom() - canvas.viewportTransform![5] / canvas.getZoom();

      // 创建EditorItem
      const editorItem = createEditorItem(material, { x: canvasX, y: canvasY });

      // 选择落点区域：优先命中区域；否则当前页第一个区域；若无区域则自动创建全屏区域
      const page = pages[currentPageIndex];
      if (!page) return;
      let targetRegionId = page.regions?.[0]?.id;

      // 命中检测
      if (page.regions && page.regions.length > 0) {
        for (let i = page.regions.length - 1; i >= 0; i--) {
          const r = page.regions[i];
          const { x, y, width: w, height: h } = r.rect;
          if (canvasX >= x && canvasX <= x + w && canvasY >= y && canvasY <= y + h) {
            targetRegionId = r.id;
            break;
          }
        }
      } else {
        // 无区域时自动创建全屏区域
        const newRegionId = addRegion(page.id, {
          name: '主区域',
          rect: { x: 0, y: 0, width, height, borderWidth: 0 },
        });
        targetRegionId = newRegionId;
      }

      // sync_program 防呆：仅允许 2/3/6
      try {
        const targetRegion = page.regions.find(r => r.id === (targetRegionId as string));
        if (targetRegion && targetRegion.name === 'sync_program') {
          const allowed = [ItemType.IMAGE, ItemType.VIDEO, ItemType.GIF];
          if (!allowed.includes(editorItem.type)) {
            toast.error('同步窗口仅允许 图片/视频/GIF');
            return;
          }
        }
      } catch {}

      // 添加到状态管理
      addItem(page.id, targetRegionId, editorItem);

      // 创建Fabric.js对象
      const fabricObject = await createFabricObjectFromMaterial(editorItem);
      if (fabricObject) {
        canvas.add(fabricObject);
        canvas.setActiveObject(fabricObject);
        canvas.renderAll();

        // 更新画布状态
        updateCanvasStateFromCanvas(canvas);
        // 记录历史
        try {
          setTimeout(() => {
            try {
              (useStore.getState() as any).saveToHistory?.('添加对象');
            } catch {}
          }, 0);
        } catch {}
      }

    } catch (error) {
      console.error('处理拖拽失败:', error);
    }
  }, [createEditorItem, addItem, addRegion, createFabricObjectFromMaterial, updateCanvasStateFromCanvas, pages, currentPageIndex, width, height]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newZoom = Math.min(zoom * 1.2, 20);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newZoom = Math.max(zoom / 1.2, 0.01);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  }, [zoom]);

  const handleResetZoom = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    setZoom(1);
    canvas.renderAll();
  }, []);

  // 切换页面时重建画布对象
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabricLib) return;
    const page = pages[currentPageIndex];
    if (!page) return;

    // 清空并设置背景
    canvas.clear();
    try {
      canvas.setBackgroundColor(page.bgColor || '#000000', () => {});
    } catch {
      // 颜色容错
      canvas.setBackgroundColor('#000000', () => {});
    }

    // 恢复持久化视图（缩放/平移）
    try {
      const persisted = getCanvasState(page.id);
      if (persisted) {
        canvas.setZoom(persisted.zoom || 1);
        const vt = canvas.viewportTransform;
        if (vt) {
          vt[4] = persisted.panX || 0;
          vt[5] = persisted.panY || 0;
        }
      } else {
        // 默认视图
        canvas.setZoom(1);
        canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      }
    } catch {}

    // 先渲染 Region 边框
    for (const region of page.regions || []) {
      const rect = new fabricLib.Rect({
        left: region.rect.x,
        top: region.rect.y,
        width: region.rect.width,
        height: region.rect.height,
        fill: 'transparent',
        stroke: '#00D1FF',
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        rx: 0,
        ry: 0,
      }) as any;
      rect.isRegionFrame = true;
      rect.regionId = region.id;
      canvas.add(rect);
      canvas.sendToBack(rect);
    }

    // 再渲染素材对象
    const render = async () => {
      for (const region of page.regions || []) {
        for (const item of region.items || []) {
          try {
            const fabricObject = await FabricSerializer.createFabricObjectFromEditorItem(item as any, item.materialRef);
            if (fabricObject) {
              (fabricObject as any).id = item.id;
              (fabricObject as any).itemType = item.type;
              (fabricObject as any).editorProperties = item.properties;
              (fabricObject as any).materialRef = item.materialRef;
              // 位置与尺寸
              fabricObject.set({ left: item.position.x, top: item.position.y });
              const scaleX = item.size.width / (fabricObject.width || item.size.width);
              const scaleY = item.size.height / (fabricObject.height || item.size.height);
              fabricObject.scaleX = scaleX;
              fabricObject.scaleY = scaleY;
              canvas.add(fabricObject);
            }
          } catch (e) {
            console.error('渲染对象失败', e);
          }
        }
      }
      canvas.renderAll();
      updateCanvasStateFromCanvas(canvas);
    };
    render();
  }, [currentPageIndex, pages, fabricLib, updateCanvasStateFromCanvas]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-900 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖拽覆盖层 */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary z-50 flex items-center justify-center">
          <Card className="p-6 bg-background/90 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">释放以添加素材</h3>
              <p className="text-sm text-muted-foreground">
                素材将添加到画布中的当前位置
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* 对象创建加载层 */}
      {isCreatingObject && (
        <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center">
          <Card className="p-6 bg-background/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>正在创建对象...</span>
            </div>
          </Card>
        </div>
      )}

      {/* 画布容器 */}
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="border border-gray-600"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 空态提示：无区域或无素材时给予引导 */}
      {(() => {
        const page = pages[currentPageIndex];
        if (!page) return null;
        const hasRegions = (page.regions || []).length > 0;
        const hasItems = hasRegions && page.regions.some(r => (r.items || []).length > 0);
        if (hasItems) return null;
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <Card className="px-5 py-4 bg-background/95 backdrop-blur-sm border pointer-events-auto">
              <div className="text-center space-y-1">
                {!hasRegions ? (
                  <>
                    <h3 className="text-sm font-medium">新建区域或直接拖拽素材</h3>
                    <p className="text-xs text-muted-foreground">点击上方方块按钮“新建区域”，或从左侧素材库拖拽到画布（将自动创建全屏区域）</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium">将素材拖拽到蓝色虚线区域中</h3>
                    <p className="text-xs text-muted-foreground">支持图片、视频、GIF、文本等类型；可在右侧“属性面板”调整样式</p>
                  </>
                )}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* 缩放控制 */}
      <div className="absolute top-4 right-4 z-30">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <Badge variant="outline" className="text-xs min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </Badge>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="重置缩放"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>

      {/* 画布信息显示 */}
      <div className="absolute bottom-4 left-4 z-30">
        <Card className="px-3 py-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">画布尺寸:</span>
            <Badge variant="outline">{width} × {height}</Badge>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">缩放:</span>
            <Badge variant="outline">{Math.round(zoom * 100)}%</Badge>
          </div>
        </Card>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 z-30">
        <Card className="px-3 py-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>拖拽素材到画布创建对象</div>
            <div>滚轮缩放 | Alt+拖拽平移</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgramCanvas;