'use client';

/**
 * 编辑器工具栏组件
 * 使用shadcn组件实现工具选择和快捷操作
 */

import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Type, 
  Image, 
  Clock, 
  Cloud, 
  Move,
  ZoomIn,
  ZoomOut,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyEnd
} from 'lucide-react';

// shadcn组件
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// 状态管理和类型
import { useEditorStore } from '../stores/editor-store';
import { EditorTool, VSNItemType } from '../types/program-editor';

interface EditorToolbarProps {
  currentTool: EditorTool;
  onToolSelect: (tool: EditorTool) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 工具按钮组件
 */
function ToolButton({ 
  tool, 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  disabled 
}: {
  tool: EditorTool;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * 编辑器工具栏组件
 */
export function EditorToolbar({ 
  currentTool, 
  onToolSelect, 
  disabled = false, 
  className 
}: EditorToolbarProps) {
  const {
    selectedItems,
    selectedRegions,
    zoomLevel,
    setZoomLevel,
    copyItems,
    cutItems,
    pasteItems,
    deleteItem,
    deleteRegion,
    updateItem,
    getCurrentPage,
    currentPageIndex,
    addItem,
  } = useEditorStore();

  const hasSelection = selectedItems.length > 0 || selectedRegions.length > 0;
  const hasItemSelection = selectedItems.length > 0;
  const currentPage = getCurrentPage();

  // 添加不同类型的项目
  const handleAddItem = (type: VSNItemType) => {
    if (!currentPage || currentPage.regions.length === 0) return;
    
    // 添加到第一个区域（或选中的区域）
    const targetRegion = selectedRegions.length > 0 
      ? currentPage.regions.find(r => r.id === selectedRegions[0])
      : currentPage.regions[0];
    
    if (targetRegion) {
      addItem(currentPageIndex, targetRegion.id, {
        type,
        name: getItemTypeName(type),
        position: { x: 50, y: 50 },
        dimensions: getDefaultDimensions(type),
      });
    }
  };

  // 获取项目类型名称
  const getItemTypeName = (type: VSNItemType): string => {
    const typeNames: Record<VSNItemType, string> = {
      2: '图片',
      3: '视频',
      4: '单行文本',
      5: '多行文本',
      6: 'GIF',
      9: '时钟',
      14: '天气',
      15: '计时器',
      16: '精美时钟',
      21: '湿度',
      22: '温度',
      23: '噪音',
      24: '空气质量',
      27: '网页',
      28: '烟雾',
      102: '单列文本',
    };
    return typeNames[type] || '未知';
  };

  // 获取默认尺寸
  const getDefaultDimensions = (type: VSNItemType) => {
    switch (type) {
      case 4: // 单行文本
        return { width: 200, height: 40 };
      case 5: // 多行文本
        return { width: 300, height: 100 };
      case 9: // 时钟
      case 16: // 精美时钟
        return { width: 200, height: 80 };
      case 14: // 天气
        return { width: 150, height: 120 };
      case 22: // 温度等传感器
      case 21:
      case 23:
      case 24:
        return { width: 120, height: 60 };
      default:
        return { width: 200, height: 150 };
    }
  };

  // 处理删除操作
  const handleDelete = () => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(itemId => {
        const itemInfo = useEditorStore.getState().findItem(itemId);
        if (itemInfo) {
          deleteItem(itemInfo.pageIndex, itemInfo.regionId, itemId);
        }
      });
    }
    
    if (selectedRegions.length > 0) {
      selectedRegions.forEach(regionId => {
        const regionInfo = useEditorStore.getState().findRegion(regionId);
        if (regionInfo) {
          deleteRegion(regionInfo.pageIndex, regionId);
        }
      });
    }
  };

  // 处理复制操作
  const handleCopy = () => {
    if (selectedItems.length > 0 && currentPage) {
      const firstItem = useEditorStore.getState().findItem(selectedItems[0]);
      if (firstItem) {
        copyItems(currentPageIndex, firstItem.regionId, selectedItems);
      }
    }
  };

  // 处理粘贴操作
  const handlePaste = () => {
    if (currentPage && currentPage.regions.length > 0) {
      const targetRegion = selectedRegions.length > 0 
        ? currentPage.regions.find(r => r.id === selectedRegions[0])
        : currentPage.regions[0];
      
      if (targetRegion) {
        pasteItems(currentPageIndex, targetRegion.id);
      }
    }
  };

  // 对齐操作
  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedItems.length < 2) return;
    
    // TODO: 实现对齐逻辑
    console.log('对齐:', type);
  };

  // 缩放操作
  const handleZoom = (factor: number) => {
    setZoomLevel(Math.max(0.1, Math.min(5, zoomLevel * factor)));
  };

  return (
    <div className={`border-b bg-background px-4 py-2 ${className}`}>
      <div className="flex items-center gap-1">
        {/* 选择工具组 */}
        <div className="flex items-center gap-1">
          <ToolButton
            tool="select"
            icon={MousePointer2}
            label="选择工具 (V)"
            isActive={currentTool === 'select'}
            onClick={() => onToolSelect('select')}
            disabled={disabled}
          />
          <ToolButton
            tool="pan"
            icon={Move}
            label="移动画布 (H)"
            isActive={currentTool === 'pan'}
            onClick={() => onToolSelect('pan')}
            disabled={disabled}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 添加元素工具组 */}
        <div className="flex items-center gap-1">
          <ToolButton
            tool="region"
            icon={Square}
            label="添加区域 (R)"
            isActive={currentTool === 'region'}
            onClick={() => onToolSelect('region')}
            disabled={disabled}
          />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddItem(4)}
                disabled={disabled || !currentPage || currentPage.regions.length === 0}
                className="h-8 w-8 p-0"
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">添加文本 (T)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddItem(2)}
                disabled={disabled || !currentPage || currentPage.regions.length === 0}
                className="h-8 w-8 p-0"
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">添加图片 (I)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddItem(9)}
                disabled={disabled || !currentPage || currentPage.regions.length === 0}
                className="h-8 w-8 p-0"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">添加时钟 (C)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddItem(14)}
                disabled={disabled || !currentPage || currentPage.regions.length === 0}
                className="h-8 w-8 p-0"
              >
                <Cloud className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">添加天气 (W)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 编辑操作组 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={disabled || !hasItemSelection}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">复制 (Ctrl+C)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                disabled={disabled || !currentPage || currentPage.regions.length === 0}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">粘贴 (Ctrl+V)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={disabled || !hasSelection}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">删除 (Delete)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 对齐工具组 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('left')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">左对齐</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('center')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">水平居中</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('right')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">右对齐</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('top')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignHorizontalJustifyCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">顶部对齐</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('middle')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignVerticalJustifyCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">垂直居中</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlign('bottom')}
                disabled={disabled || selectedItems.length < 2}
                className="h-8 w-8 p-0"
              >
                <AlignHorizontalJustifyEnd className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">底部对齐</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 视图控制组 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(0.8)}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">缩小 (Ctrl+-)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom(1.25)}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">放大 (Ctrl++)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(1)}
                disabled={disabled}
                className="h-8 px-2 text-xs"
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">重置缩放 (Ctrl+0)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}