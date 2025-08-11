'use client';

/**
 * 图层面板组件
 * 使用shadcn组件实现图层管理功能
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, MoreHorizontal, GripVertical, Copy, Trash2 } from 'lucide-react';

// shadcn组件
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

// 状态管理和类型
import { useEditorStore } from '../stores/editor-store';
import { EditorItem, EditorRegion } from '../types/program-editor';

interface LayerPanelProps {
  className?: string;
}

/**
 * 图层项组件
 */
function LayerItem({ 
  item, 
  regionId, 
  pageIndex, 
  isSelected, 
  onSelect 
}: {
  item: EditorItem;
  regionId: string;
  pageIndex: number;
  isSelected: boolean;
  onSelect: (itemId: string, multiSelect?: boolean) => void;
}) {
  const { updateItem, deleteItem, duplicateItem } = useEditorStore();

  // 获取项目类型图标
  const getItemIcon = (type: number) => {
    switch (type) {
      case 2: return '🖼️';
      case 3: return '🎬';
      case 4: 
      case 5: 
      case 102: return '📝';
      case 6: return '🎞️';
      case 9: 
      case 16: return '🕐';
      case 14: return '🌤️';
      case 15: return '⏱️';
      case 21: return '💧';
      case 22: return '🌡️';
      case 23: return '🔊';
      case 24: return '🌫️';
      case 27: return '🌐';
      case 28: return '💨';
      default: return '❓';
    }
  };

  // 获取项目类型名称
  const getItemTypeName = (type: number) => {
    const typeNames: Record<number, string> = {
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

  // 处理可见性切换
  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem(pageIndex, regionId, item.id, { visible: !item.visible });
  };

  // 处理锁定切换
  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem(pageIndex, regionId, item.id, { locked: !item.locked });
  };

  // 处理选择
  const handleSelect = (e: React.MouseEvent) => {
    onSelect(item.id, e.ctrlKey || e.metaKey);
  };

  // 处理复制
  const handleDuplicate = () => {
    duplicateItem(pageIndex, regionId, item.id);
  };

  // 处理删除
  const handleDelete = () => {
    deleteItem(pageIndex, regionId, item.id);
  };

  return (
    <div
      className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-accent text-accent-foreground' 
          : 'hover:bg-muted/50'
      }`}
      onClick={handleSelect}
    >
      {/* 拖拽手柄 */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* 项目信息 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm">{getItemIcon(item.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{getItemTypeName(item.type)}</p>
        </div>
        <Badge variant="outline" className="text-xs h-5">
          {item.zIndex}
        </Badge>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleVisibilityToggle}
        >
          {item.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleLockToggle}
        >
          {item.locked ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </Button>

        {/* 更多操作 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              复制项目
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              删除项目
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/**
 * 区域组件
 */
function RegionSection({ 
  region, 
  pageIndex, 
  selectedItems, 
  onSelectItem 
}: {
  region: EditorRegion;
  pageIndex: number;
  selectedItems: string[];
  onSelectItem: (itemId: string, multiSelect?: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1">
      {/* 区域标题 */}
      <div
        className="flex items-center gap-2 p-2 bg-muted/30 rounded-md cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm">📁</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{region.name}</p>
            <p className="text-xs text-muted-foreground">
              {region.items.length} 个项目
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs h-5">
            {region.bounds.width}×{region.bounds.height}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            {region.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* 区域内的项目 */}
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {region.items.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-xs">此区域暂无项目</p>
            </div>
          ) : (
            [...region.items]
              .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)) // 按z-index降序排列（不修改原数组）
              .map((item) => (
                <LayerItem
                  key={item.id}
                  item={item}
                  regionId={region.id}
                  pageIndex={pageIndex}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={onSelectItem}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 图层面板主组件
 */
export function LayerPanel({ className }: LayerPanelProps) {
  const {
    pages,
    currentPageIndex,
    selectedItems,
    setSelectedItems,
  } = useEditorStore();

  const currentPage = pages[currentPageIndex];

  // 处理项目选择
  const handleItemSelect = (itemId: string, multiSelect?: boolean) => {
    if (multiSelect) {
      const newSelection = selectedItems.includes(itemId)
        ? selectedItems.filter(id => id !== itemId)
        : [...selectedItems, itemId];
      setSelectedItems(newSelection);
    } else {
      setSelectedItems([itemId]);
    }
  };

  if (!currentPage) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-6">
          <div className="text-2xl mb-2">📑</div>
          <p className="text-sm">暂无页面内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 顶部统计信息 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{currentPage.name}</h3>
            <p className="text-xs text-muted-foreground">
              {currentPage.regions.length} 个区域，
              {currentPage.regions.reduce((sum, region) => sum + region.items.length, 0)} 个项目
            </p>
          </div>
          
          {selectedItems.length > 0 && (
            <Badge variant="default" className="text-xs">
              已选 {selectedItems.length}
            </Badge>
          )}
        </div>
      </div>

      {/* 图层列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {currentPage.regions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm">暂无区域</p>
              <p className="text-xs mt-1">在画布中添加区域开始编辑</p>
            </div>
          ) : (
            [...currentPage.regions]
              .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)) // 按z-index降序排列（不修改原数组）
              .map((region) => (
                <RegionSection
                  key={region.id}
                  region={region}
                  pageIndex={currentPageIndex}
                  selectedItems={selectedItems}
                  onSelectItem={handleItemSelect}
                />
              ))
          )}
        </div>
      </ScrollArea>

      {/* 底部操作栏 */}
      {selectedItems.length > 0 && (
        <div className="border-t p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>选中 {selectedItems.length} 个项目</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItems([])}
              className="h-6 text-xs"
            >
              取消选择
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}