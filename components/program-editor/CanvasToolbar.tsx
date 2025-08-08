'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer2,
  Hand,
  Square,
  Type,
  Image,
  Video,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react';

interface CanvasToolbarProps {
  onToolSelect?: (tool: string) => void;
  activeTool?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onAddRegion?: () => void;
}

/**
 * 画布工具栏组件
 * 提供选择、绘制、编辑等工具
 */
export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onToolSelect,
  activeTool = 'select',
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDelete,
  onCopy,
  onPaste,
  onAddRegion,
}) => {
  const handleToolClick = (tool: string) => {
    onToolSelect?.(tool);
  };

  const toolButtons = [
    { id: 'select', icon: MousePointer2, label: '选择工具', group: 'basic' },
    { id: 'pan', icon: Hand, label: '拖拽画布', group: 'basic' },
    { id: 'rectangle', icon: Square, label: '新建区域', group: 'shapes' },
    { id: 'text', icon: Type, label: '文本', group: 'shapes' },
    { id: 'image', icon: Image, label: '图片', group: 'media' },
    { id: 'video', icon: Video, label: '视频', group: 'media' },
  ];

  const renderToolButton = (tool: typeof toolButtons[0]) => (
    <Button
      key={tool.id}
      variant={activeTool === tool.id ? 'default' : 'ghost'}
      size="sm"
      onClick={() => handleToolClick(tool.id)}
      title={tool.label}
      className="h-8 w-8 p-0"
    >
      <tool.icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="flex items-center gap-1 p-2 bg-background border-b border-border">
      {/* 基础工具 */}
      <div className="flex items-center gap-1">
        {toolButtons
          .filter(tool => tool.group === 'basic')
          .map(renderToolButton)}
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 形状工具 */}
      <div className="flex items-center gap-1">
        {/* 新建区域按钮 */}
        <Button
          variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            handleToolClick('rectangle');
            onAddRegion?.();
          }}
          title="新建区域"
          className="h-8 w-8 p-0"
        >
          <Square className="h-4 w-4" />
        </Button>
        {/* 其他形状（预留） */}
        {toolButtons
          .filter(tool => tool.group === 'shapes' && tool.id !== 'rectangle')
          .map(renderToolButton)}
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 媒体工具 */}
      <div className="flex items-center gap-1">
        {toolButtons
          .filter(tool => tool.group === 'media')
          .map(renderToolButton)}
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 历史操作 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="撤销"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="重做"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 缩放控制 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          title="缩小"
          className="h-8 w-8 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetZoom}
          title="重置缩放"
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          title="放大"
          className="h-8 w-8 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 编辑操作 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          title="复制"
          className="h-8 w-8 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          title="删除"
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 图层工具 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          title="图层管理"
          className="h-8 w-8 p-0"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasToolbar;