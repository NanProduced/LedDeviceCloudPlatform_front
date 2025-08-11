'use client';

/**
 * 编辑器画布组件
 * 使用原生DOM+CSS实现精确的LED显示屏布局，替代复杂的Fabric.js
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Plus, Move, RotateCw, Trash2, ZoomIn, ZoomOut, Maximize2, Monitor } from 'lucide-react';

// shadcn组件
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// 状态管理和类型
import { useEditorStore } from '../stores/editor-store';
import { EditorTool, EditorItem, EditorRegion, Position, Rectangle, VSNItemType } from '../types/program-editor';
import { getFilePreviewUrl, getFileStreamUrl, getFileDownloadUrl } from '@/lib/api/filePreview';

interface EditorCanvasProps {
  tool: EditorTool;
  isPreviewMode: boolean;
  className?: string;
}

interface CanvasViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

type DisplayMode = 'fit' | 'actual' | 'custom';

/**
 * 可编辑项目组件
 */
function EditableItem({ 
  item, 
  region, 
  pageIndex, 
  isSelected, 
  isPreviewMode, 
  canvasScale,
  onSelect, 
  onUpdate 
}: {
  item: EditorItem;
  region: EditorRegion;
  pageIndex: number;
  isSelected: boolean;
  isPreviewMode: boolean;
  canvasScale: number;
  onSelect: (itemId: string, multiSelect?: boolean) => void;
  onUpdate: (updates: Partial<EditorItem>) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; offsetX: number; offsetY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ clientX: number; clientY: number; width: number; height: number } | null>(null);

  // 处理点击选择
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    onSelect(item.id, e.ctrlKey || e.metaKey);
  }, [isPreviewMode, item.id, onSelect]);

  // 处理拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;

    e.preventDefault();
    e.stopPropagation();

    // 若未选中，先选中当前项
    if (!isSelected) {
      onSelect(item.id, e.ctrlKey || e.metaKey);
    }

    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: (e.clientX - item.position.x * canvasScale),
      offsetY: (e.clientY - item.position.y * canvasScale),
    });
  }, [isPreviewMode, isSelected, item.position, canvasScale, item.id, onSelect]);

  // 处理拖拽移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStart) {
      const newX = Math.max(0, (e.clientX - dragStart.offsetX) / canvasScale);
      const newY = Math.max(0, (e.clientY - dragStart.offsetY) / canvasScale);
      const clampedX = Math.min(newX, region.bounds.x + region.bounds.width - item.dimensions.width);
      const clampedY = Math.min(newY, region.bounds.y + region.bounds.height - item.dimensions.height);
      onUpdate({ position: { x: clampedX, y: clampedY } });
    } else if (isResizing && resizeStart) {
      const dx = (e.clientX - resizeStart.clientX) / canvasScale;
      const dy = (e.clientY - resizeStart.clientY) / canvasScale;
      // 目标尺寸（未约束）
      let targetW = resizeStart.width + dx;
      let targetH = resizeStart.height + dy;
      // 比例锁定：按当前项目宽高比例
      if (item.preserveAspectRatio) {
        const ratio = resizeStart.width / Math.max(1, resizeStart.height);
        if (Math.abs(dx) > Math.abs(dy)) {
          targetW = resizeStart.width + dx;
          targetH = targetW / ratio;
        } else {
          targetH = resizeStart.height + dy;
          targetW = targetH * ratio;
        }
      }
      // 约束在区域内
      const maxW = region.bounds.width - (item.position.x - region.bounds.x);
      const maxH = region.bounds.height - (item.position.y - region.bounds.y);
      const newWidth = Math.max(10, Math.min(targetW, maxW));
      const newHeight = Math.max(10, Math.min(targetH, maxH));
      onUpdate({ dimensions: { width: Math.round(newWidth), height: Math.round(newHeight) } });
    }
  }, [isDragging, dragStart, isResizing, resizeStart, canvasScale, region.bounds, item.position.x, item.position.y, item.dimensions.width, item.dimensions.height, onUpdate]);

  // 处理拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setIsResizing(false);
    setResizeStart(null);
  }, []);

  // 绑定全局鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode || !isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ clientX: e.clientX, clientY: e.clientY, width: item.dimensions.width, height: item.dimensions.height });
  }, [isPreviewMode, isSelected, item.dimensions.width, item.dimensions.height]);

  // 渲染内容
  const renderContent = () => {
    switch (item.type) {
      case 4: // 单行文本
      case 5: // 多行文本
        const textItem = item as any;
        return (
          <div
            className="w-full h-full flex items-center justify-center text-white overflow-hidden"
            style={{
              fontSize: `${textItem.fontSize || 16}px`,
              fontFamily: textItem.fontFamily || 'Arial',
              fontWeight: textItem.fontWeight || 'normal',
              fontStyle: textItem.fontStyle || 'normal',
              color: textItem.color?.value || '#ffffff',
              textAlign: textItem.textAlign || 'left',
              backgroundColor: textItem.backgroundColor?.value,
            }}
          >
            {textItem.content || '文本内容'}
          </div>
        );
        
      case 9: // 时钟
        const clockItem = item as any;
        const now = new Date();
        const timeStr = clockItem.timeFormat === '12h' 
          ? now.toLocaleTimeString('en-US', { hour12: true })
          : now.toLocaleTimeString('en-US', { hour12: false });
        
        return (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white"
            style={{
              fontSize: `${clockItem.fontSize || 24}px`,
              color: clockItem.color?.value || '#ffffff',
            }}
          >
            <div className="font-mono">{timeStr}</div>
            {clockItem.showDate && (
              <div className="text-sm opacity-80">
                {now.toLocaleDateString()}
              </div>
            )}
          </div>
        );
        
      case 2: // 图片
        const imageItem = item as any;
        {
          const imageFileId: string | undefined = imageItem.materialRef?.fileId;
          if (imageFileId) {
            const src = getFilePreviewUrl(imageFileId, {
              w: Math.max(1, Math.floor(item.dimensions.width)),
              h: Math.max(1, Math.floor(item.dimensions.height)),
              fit: imageItem.preserveAspectRatio ? 'contain' : 'fill',
              format: 'jpg',
              q: 85,
            });
            return (
              <img
                src={src}
                alt={imageItem.materialRef?.originalName || '图片'}
                className={`w-full h-full ${imageItem.preserveAspectRatio ? 'object-contain' : 'object-fill'} select-none`}
                draggable={false}
              />
            );
          }
        }
        return (
          <div className="w-full h-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs">图片素材</div>
            </div>
          </div>
        );

      case 3: // 视频
        const videoItem = item as any;
        {
          const videoFileId: string | undefined = videoItem.materialRef?.fileId;
          if (videoFileId) {
            const videoSrc = getFileStreamUrl(videoFileId);
            return (
              <video
                src={videoSrc}
                className={`w-full h-full ${videoItem.preserveAspectRatio ? 'object-contain' : 'object-fill'} bg-black`}
                muted
                autoPlay
                loop
                playsInline
                controls={isPreviewMode}
              />
            );
          }
        }
        return (
          <div className="w-full h-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-1">🎞️</div>
              <div className="text-xs">视频素材</div>
            </div>
          </div>
        );

      case 6: // GIF
        const gifItem = item as any;
        {
          const gifFileId: string | undefined = gifItem.materialRef?.fileId;
          if (gifFileId) {
            const gifSrc = getFileDownloadUrl(gifFileId, false);
            return (
              <img
                src={gifSrc}
                alt={gifItem.materialRef?.originalName || 'GIF'}
                className={`w-full h-full ${gifItem.preserveAspectRatio ? 'object-contain' : 'object-fill'} select-none`}
                draggable={false}
              />
            );
          }
        }
        return (
          <div className="w-full h-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs">GIF素材</div>
            </div>
          </div>
        );
        
      case 14: // 天气
        return (
          <div className="w-full h-full flex items-center justify-center text-white bg-blue-500/20">
            <div className="text-center">
              <div className="text-2xl mb-1">☀️</div>
              <div className="text-sm">25°C</div>
              <div className="text-xs opacity-80">晴天</div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground text-xs">
              未知类型 {item.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-150 ${
        isSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      } ${isDragging ? 'cursor-move' : ''}`}
      style={{
        left: item.position.x,
        top: item.position.y,
        width: item.dimensions.width,
        height: item.dimensions.height,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        opacity: item.opacity || 1,
        zIndex: item.zIndex || 0,
        visibility: item.visible ? 'visible' : 'hidden',
        pointerEvents: isPreviewMode ? 'none' : 'auto',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* 内容区域 */}
      <div className="w-full h-full relative overflow-hidden rounded">
        {renderContent()}
      </div>
      
      {/* 选择状态指示器 */}
      {isSelected && !isPreviewMode && (
        <>
          {/* 尺寸调整手柄 */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border border-white rounded-sm cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
          
          {/* 信息标签 */}
          <div className="absolute -top-6 left-0 flex gap-2">
            <Badge variant="default" className="text-xs h-5">
              {item.name}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 bg-background/80">
              {Math.round(item.dimensions.width)}×{Math.round(item.dimensions.height)}
            </Badge>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 可编辑区域组件
 */
function EditableRegion({ 
  region, 
  pageIndex, 
  isSelected, 
  isPreviewMode, 
  canvasScale,
  previewIndex,
  onSelect, 
  onUpdate 
}: {
  region: EditorRegion;
  pageIndex: number;
  isSelected: boolean;
  isPreviewMode: boolean;
  canvasScale: number;
  previewIndex: number;
  onSelect: (regionId: string, multiSelect?: boolean) => void;
  onUpdate: (updates: Partial<EditorRegion>) => void;
}) {
  const { selectedItems, updateItem } = useEditorStore();
  const prevIsPreviewRef = useRef(isPreviewMode);

  // 处理区域选择
  const handleRegionClick = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    // 只有点击空白区域时才选择区域
    if (e.target === e.currentTarget) {
      onSelect(region.id, e.ctrlKey || e.metaKey);
    }
  }, [isPreviewMode, region.id, onSelect]);

  // 处理项目选择
  const handleItemSelect = useCallback((itemId: string, multiSelect?: boolean) => {
    const store = useEditorStore.getState();
    if (multiSelect) {
      const newSelection = store.selectedItems.includes(itemId)
        ? store.selectedItems.filter(id => id !== itemId)
        : [...store.selectedItems, itemId];
      store.setSelectedItems(newSelection);
    } else {
      store.setSelectedItems([itemId]);
    }
  }, []);

  // 处理项目更新
  const handleItemUpdate = useCallback((itemId: string, updates: Partial<EditorItem>) => {
    updateItem(pageIndex, region.id, itemId, updates);
  }, [pageIndex, region.id, updateItem]);

  useEffect(() => {
    // 进入或退出预览时重置选择
    if (prevIsPreviewRef.current !== isPreviewMode) {
      prevIsPreviewRef.current = isPreviewMode;
    }
  }, [isPreviewMode]);

  return (
    <div
      className={`absolute border-2 transition-all duration-150 ${
        isSelected && !isPreviewMode
          ? 'border-green-500 bg-green-500/5'
          : 'border-gray-300/50 hover:border-gray-400/70'
      } ${isPreviewMode ? 'border-transparent' : ''}`}
      style={{
        left: region.bounds.x,
        top: region.bounds.y,
        width: region.bounds.width,
        height: region.bounds.height,
        backgroundColor: region.backgroundColor?.value,
        zIndex: region.zIndex || 0,
        visibility: region.visible ? 'visible' : 'hidden',
      }}
      onClick={handleRegionClick}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('application/x-material')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
    >
      {/* 区域名称标签 */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-6 left-0">
          <Badge variant="outline" className="text-xs h-5 bg-background">
            {region.name}
          </Badge>
        </div>
      )}
      
      {/* 区域内的项目 */}
      {region.items.map((item, index) => {
        if (isPreviewMode && index !== previewIndex) return null;
        return (
          <EditableItem
            key={item.id}
            item={item}
            region={region}
            pageIndex={pageIndex}
            isSelected={selectedItems.includes(item.id)}
            isPreviewMode={isPreviewMode}
            canvasScale={canvasScale}
            onSelect={handleItemSelect}
            onUpdate={(updates) => handleItemUpdate(item.id, updates)}
          />
        );
      })}
    </div>
  );
}

/**
 * 编辑器画布主组件
 */
export function EditorCanvas({ tool, isPreviewMode, className }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<CanvasViewport>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('fit');
  const [regionPlayIndex, setRegionPlayIndex] = useState<Record<string, number>>({});

  const {
    program,
    pages,
    currentPageIndex,
    selectedRegions,
    zoomLevel,
    setSelectedItems,
    setSelectedRegions,
    addRegion,
    updateRegion,
  } = useEditorStore();

  const currentPage = pages[currentPageIndex];
  const canvasWidth = program.width;
  const canvasHeight = program.height;

  // 处理画布点击（取消选择）
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedItems([]);
      setSelectedRegions([]);
    }
  }, [setSelectedItems, setSelectedRegions]);

  // 处理区域选择
  const handleRegionSelect = useCallback((regionId: string, multiSelect?: boolean) => {
    if (multiSelect) {
      const newSelection = selectedRegions.includes(regionId)
        ? selectedRegions.filter(id => id !== regionId)
        : [...selectedRegions, regionId];
      setSelectedRegions(newSelection);
    } else {
      setSelectedRegions([regionId]);
      setSelectedItems([]); // 清除项目选择
    }
  }, [selectedRegions, setSelectedRegions, setSelectedItems]);

  // 处理区域更新
  const handleRegionUpdate = useCallback((regionId: string, updates: Partial<EditorRegion>) => {
    updateRegion(currentPageIndex, regionId, updates);
  }, [currentPageIndex, updateRegion]);

  // 处理缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, viewport.scale * delta));
      setViewport(prev => ({ ...prev, scale: newScale }));
      // 手动缩放时切换到自定义模式
      if (displayMode !== 'custom') {
        setDisplayMode('custom');
      }
    }
  }, [viewport.scale, displayMode]);

  // 处理显示模式切换
  const handleDisplayModeChange = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
    
    if (mode === 'fit') {
      // 适应窗口：计算合适的缩放比例
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const padding = 64; // 留出边距
          const availableWidth = containerRect.width - padding;
          const availableHeight = containerRect.height - padding;
          
          const scaleX = availableWidth / canvasWidth;
          const scaleY = availableHeight / canvasHeight;
          const scale = Math.min(scaleX, scaleY, 1); // 不放大超过100%
          
          setViewport(prev => ({ ...prev, scale }));
        }
      }
    } else if (mode === 'actual') {
      // 实际大小：100%缩放
      setViewport(prev => ({ ...prev, scale: 1 }));
    }
    // custom模式保持当前缩放不变
  }, [canvasWidth, canvasHeight]);

  // 快速缩放按钮
  const handleZoom = useCallback((factor: number) => {
    const newScale = Math.max(0.1, Math.min(5, viewport.scale * factor));
    setViewport(prev => ({ ...prev, scale: newScale }));
    setDisplayMode('custom');
  }, [viewport.scale]);

  // 计算画布容器尺寸
  const containerWidth = Math.max(800, canvasWidth * viewport.scale + 200);
  const containerHeight = Math.max(600, canvasHeight * viewport.scale + 200);
  // 预览轮播：每个区域顺序播放
  useEffect(() => {
    if (!isPreviewMode) return;
    // 初始化每个区域索引
    const initial: Record<string, number> = {};
    currentPage.regions.forEach(r => {
      initial[r.id] = 0;
    });
    setRegionPlayIndex(initial);

    const interval = setInterval(() => {
      setRegionPlayIndex(prev => {
        const next: Record<string, number> = { ...prev };
        currentPage.regions.forEach(r => {
          const len = r.items.length;
          if (len > 0) {
            const cur = prev[r.id] ?? 0;
            next[r.id] = (cur + 1) % len;
          } else {
            next[r.id] = 0;
          }
        });
        return next;
      });
    }, 3000); // 默认每项3秒

    return () => clearInterval(interval);
  }, [isPreviewMode, currentPageIndex, currentPage.regions]);

  // 处理素材拖入
  const handleDragOver = useCallback((e: React.DragEvent) => {
    // 允许放置
    if (e.dataTransfer.types.includes('application/x-material')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/x-material')) return;
    e.preventDefault();
    try {
      const json = e.dataTransfer.getData('application/x-material');
      const payload = JSON.parse(json) as {
        materialId: string;
        materialType: VSNItemType;
        mimeType?: string;
        dimensions?: { width: number; height: number };
        name?: string;
        fileId?: string;
      };

      // 若没有区域则创建一个全屏区域
      if (currentPage.regions.length === 0) {
        addRegion(currentPageIndex, {
          name: '主区域',
          bounds: { x: 0, y: 0, width: program.width, height: program.height },
        });
      }

      const updatedPage = useEditorStore.getState().pages[currentPageIndex];
      const targetRegion = updatedPage.regions[0];

      // 将屏幕坐标换算为画布坐标
      const canvasRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const dropX = (e.clientX - canvasRect.left) / viewport.scale;
      const dropY = (e.clientY - canvasRect.top) / viewport.scale;

      // 默认在鼠标落点创建一个可见尺寸的项（保持在区域内），非直接铺满
      const defaultW = Math.min(targetRegion.bounds.width, payload.dimensions?.width || Math.floor(program.width * 0.5));
      const defaultH = Math.min(targetRegion.bounds.height, payload.dimensions?.height || Math.floor(program.height * 0.5));
      const localX = Math.max(targetRegion.bounds.x, Math.min(dropX, targetRegion.bounds.x + targetRegion.bounds.width - defaultW));
      const localY = Math.max(targetRegion.bounds.y, Math.min(dropY, targetRegion.bounds.y + defaultH));

      useEditorStore.getState().addItem(currentPageIndex, targetRegion.id, {
        type: payload.materialType,
        name: payload.name ?? `素材${payload.materialId}`,
        position: { x: Math.floor(localX), y: Math.floor(localY) },
        dimensions: { width: Math.floor(defaultW), height: Math.floor(defaultH) },
        materialRef: {
          materialId: payload.materialId,
          originalName: payload.name ?? `素材${payload.materialId}`,
          mimeType: payload.mimeType ?? 'application/octet-stream',
          fileSize: 0,
          dimensions: payload.dimensions,
          fileId: payload.fileId,
        },
        preserveAspectRatio: true,
        visible: true,
        locked: false,
        zIndex: 0,
      });
    } catch (err) {
      console.error('drop 解析失败', err);
    }
  }, [currentPageIndex, program.width, program.height, viewport.scale, addRegion, currentPage.regions.length]);

  if (!currentPage) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2">📄</div>
          <p>暂无页面内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full overflow-hidden ${className}`}>
      {/* 工具提示 */}
      {!isPreviewMode && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <Badge variant="outline" className="bg-background/80 backdrop-blur">
            当前工具: {tool}
          </Badge>
        </div>
      )}

      {/* 显示模式和缩放控制 */}
      {!isPreviewMode && (
        <TooltipProvider>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur p-2 rounded-lg border shadow-sm">
            {/* 显示模式选择器 */}
            <Select value={displayMode} onValueChange={handleDisplayModeChange}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-3 w-3" />
                    适应窗口
                  </div>
                </SelectItem>
                <SelectItem value="actual">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3 w-3" />
                    实际大小
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="h-3 w-3" />
                    自定义缩放
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-border" />

            {/* 缩放控制 */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleZoom(0.8)}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  缩小 (Ctrl + 滚轮)
                </TooltipContent>
              </Tooltip>

              <Badge variant="outline" className="bg-background min-w-[50px] text-center text-xs">
                {Math.round(viewport.scale * 100)}%
              </Badge>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleZoom(1.25)}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  放大 (Ctrl + 滚轮)
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      )}

      {/* 画布滚动区域 */}
      <ScrollArea className="h-full">
        <div
          ref={canvasRef}
          className="relative bg-gray-100 p-16"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          {/* LED显示屏画布（注意：黑色矩形即为节目分辨率 {canvasWidth}×{canvasHeight}，外部浅灰背景是编辑区域，不会导出） */}
          <div
            className="relative mx-auto bg-black shadow-lg"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${viewport.scale})`,
              transformOrigin: 'top left',
              backgroundColor: currentPage.backgroundColor.value,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* 网格背景 (仅编辑模式) */}
            {!isPreviewMode && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #fff 1px, transparent 1px),
                    linear-gradient(to bottom, #fff 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* 渲染区域 */}
            {currentPage.regions.map((region) => (
              <EditableRegion
                key={region.id}
                region={region}
                pageIndex={currentPageIndex}
                isSelected={selectedRegions.includes(region.id)}
                isPreviewMode={isPreviewMode}
                canvasScale={viewport.scale}
                previewIndex={regionPlayIndex[region.id] ?? 0}
                onSelect={handleRegionSelect}
                onUpdate={(updates) => handleRegionUpdate(region.id, updates)}
              />
            ))}

            {/* 添加区域提示 */}
            {!isPreviewMode && currentPage.regions.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="bg-background/80 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      点击添加第一个区域
                    </p>
                    <Button
                      size="sm"
                      onClick={() => addRegion(currentPageIndex, {
                        name: '主区域',
                        bounds: {
                          x: Math.floor(canvasWidth * 0.1),
                          y: Math.floor(canvasHeight * 0.1),
                          width: Math.floor(canvasWidth * 0.8),
                          height: Math.floor(canvasHeight * 0.8),
                        },
                      })}
                    >
                      添加区域
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}