'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  GripVertical,
  Image,
  Type,
  Video,
  Clock,
  Globe,
  Thermometer,
  FileText,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fabric } from 'fabric';

import { useEditorStore } from '../managers/editor-state-manager';
import { 
  ItemType, 
  EditorItem, 
  ITEM_TYPE_MAP
} from '../types';

interface LayerPanelProps {
  className?: string;
  selectedObjects?: string[]; // 选中对象的ID数组
}

// 获取对象类型图标
const getObjectIcon = (type: ItemType) => {
  const iconMap = {
    [ItemType.IMAGE]: Image,
    [ItemType.VIDEO]: Video,
    [ItemType.GIF]: Image,
    [ItemType.SINGLE_LINE_TEXT]: Type,
    [ItemType.MULTI_LINE_TEXT]: Type,
    [ItemType.SINGLE_COLUMN_TEXT]: Type,
    [ItemType.WEB_STREAM]: Globe,
    [ItemType.CLOCK]: Clock,
    [ItemType.EXQUISITE_CLOCK]: Clock,
    [ItemType.WEATHER]: Thermometer,
    [ItemType.HUMIDITY]: Thermometer,
    [ItemType.TEMPERATURE]: Thermometer,
    [ItemType.NOISE]: Thermometer,
    [ItemType.AIR_QUALITY]: Thermometer,
    [ItemType.SMOKE]: Thermometer,
    [ItemType.SENSOR_TIP]: Thermometer,
    [ItemType.SENSOR_INITIAL]: Thermometer,
    [ItemType.TIMER]: Clock,
    [ItemType.TV_CARD]: FileText,
    [ItemType.DOC]: FileText,
    [ItemType.EXCEL]: FileText,
    [ItemType.PPT]: FileText
  };
  return iconMap[type] || Type;
};

// 获取对象类型颜色
const getObjectTypeColor = (type: ItemType) => {
  const colorMap = {
    [ItemType.IMAGE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ItemType.VIDEO]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [ItemType.GIF]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [ItemType.SINGLE_LINE_TEXT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ItemType.MULTI_LINE_TEXT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ItemType.SINGLE_COLUMN_TEXT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ItemType.WEB_STREAM]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    [ItemType.CLOCK]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [ItemType.EXQUISITE_CLOCK]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [ItemType.WEATHER]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    [ItemType.HUMIDITY]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ItemType.TEMPERATURE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [ItemType.TIMER]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

// 图层项组件
interface LayerItemProps {
  item: EditorItem;
  isSelected: boolean;
  zIndex: number;
  onSelect: (itemId: string) => void;
  onToggleVisibility: (itemId: string) => void;
  onToggleLock: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
}

function LayerItem({
  item,
  isSelected,
  zIndex,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown
}: LayerItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = getObjectIcon(item.type);
  const typeName = ITEM_TYPE_MAP[item.type]?.label || '未知';
  
  // 从属性中获取可见性和锁定状态
  const isVisible = item.properties.visible !== false;
  const isLocked = item.properties.locked === true;
  
  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(item.id);
  }, [item.id, onToggleVisibility]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock(item.id);
  }, [item.id, onToggleLock]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(item.id);
  }, [item.id, onDuplicate]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveUp(item.id);
  }, [item.id, onMoveUp]);

  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveDown(item.id);
  }, [item.id, onMoveDown]);

  // 获取显示名称
  const displayName = useMemo(() => {
    if (item.name) return item.name;
    
    // 根据类型和属性生成名称
    switch (item.type) {
      case ItemType.SINGLE_LINE_TEXT:
      case ItemType.MULTI_LINE_TEXT:
      case ItemType.SINGLE_COLUMN_TEXT:
        const text = item.properties.text as string;
        return text ? `文本: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}` : typeName;
      case ItemType.WEB_STREAM:
        const url = item.properties.url as string;
        return url ? `网页: ${url}` : typeName;
      default:
        return typeName;
    }
  }, [item, typeName]);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md group',
        isSelected && 'ring-2 ring-primary bg-accent',
        !isVisible && 'opacity-50',
        isLocked && 'border-dashed'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {/* 拖拽手柄 */}
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleMoveUp}
            >
              <ArrowUp className="w-2.5 h-2.5" />
            </Button>
            <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleMoveDown}
            >
              <ArrowDown className="w-2.5 h-2.5" />
            </Button>
          </div>
          
          {/* 对象图标和层级 */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
              getObjectTypeColor(item.type)
            )}>
              <Icon className="w-3 h-3" />
            </div>
            <Badge variant="outline" className="text-xs">
              {zIndex}
            </Badge>
          </div>
          
          {/* 对象名称和信息 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={displayName}>
              {displayName}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {typeName}
              </Badge>
              {item.materialRef && (
                <Badge variant="outline" className="text-xs">
                  素材
                </Badge>
              )}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-60'
          )}>
            {/* 可见性切换 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={handleToggleVisibility}
              title={isVisible ? '隐藏' : '显示'}
            >
              {isVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
            
            {/* 锁定切换 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={handleToggleLock}
              title={isLocked ? '解锁' : '锁定'}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </Button>
            
            {/* 复制 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={handleDuplicate}
              title="复制"
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            {/* 删除 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-destructive hover:text-destructive"
              onClick={handleDelete}
              title="删除"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LayerPanel({ className, selectedObjects = [] }: LayerPanelProps) {
  // 状态管理
  const {
    selectedObjectIds,
    currentPageIndex,
    pages,
    updateItemProperties,
    duplicateItem,
    deleteItem,
    moveItemUp,
    moveItemDown,
    moveItemToTop,
    moveItemToBottom,
    selectObjects,
    getCanvas
  } = useEditorStore();

  // 获取当前页面的所有对象
  const currentPageItems = useMemo(() => {
    if (!pages[currentPageIndex]) return [];
    
    const items: EditorItem[] = [];
    const currentPage = pages[currentPageIndex];
    
    for (const region of currentPage.regions) {
      for (const item of region.items) {
        items.push(item);
      }
    }
    
    return items;
  }, [pages, currentPageIndex]);

  // 按照在Fabric.js画布中的层级排序（z-index大的在前面）
  const sortedItems = useMemo(() => {
    const canvas = getCanvas();
    if (!canvas) {
      // 如果没有画布，按照默认层级排序
      return [...currentPageItems].sort((a, b) => {
        const aIndex = a.properties.zIndex || 0;
        const bIndex = b.properties.zIndex || 0;
        return bIndex - aIndex;
      });
    }

    // 根据Fabric.js画布中的对象顺序排序
    const canvasObjects = canvas.getObjects();
    const itemsWithIndex = currentPageItems.map(item => {
      const fabricObject = canvasObjects.find(obj => (obj as any).id === item.id);
      const canvasIndex = fabricObject ? canvasObjects.indexOf(fabricObject) : -1;
      return { item, canvasIndex };
    });

    return itemsWithIndex
      .sort((a, b) => b.canvasIndex - a.canvasIndex)
      .map(entry => entry.item);
  }, [currentPageItems, getCanvas]);

  // 获取对象在画布中的实际层级
  const getObjectZIndex = useCallback((itemId: string): number => {
    const canvas = getCanvas();
    if (!canvas) return 0;

    const canvasObjects = canvas.getObjects();
    const fabricObject = canvasObjects.find(obj => (obj as any).id === itemId);
    
    return fabricObject ? canvasObjects.indexOf(fabricObject) + 1 : 0;
  }, [getCanvas]);

  // 选择对象
  const handleSelectObject = useCallback((itemId: string) => {
    selectObjects([itemId]);
    
    // 同步到Fabric.js画布选择
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        canvas.setActiveObject(fabricObject);
        canvas.renderAll();
      }
    }
  }, [selectObjects, getCanvas]);

  // 切换可见性
  const handleToggleVisibility = useCallback((itemId: string) => {
    const item = currentPageItems.find(item => item.id === itemId);
    if (!item) return;

    const newVisibility = !(item.properties.visible !== false);
    
    // 更新编辑器状态
    updateItemProperties(itemId, {
      ...item.properties,
      visible: newVisibility
    });

    // 同步到Fabric.js画布
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        fabricObject.set('visible', newVisibility);
        canvas.renderAll();
      }
    }
    try {
      (useEditorStore.getState() as any).saveToHistory?.(newVisibility ? '显示对象' : '隐藏对象');
    } catch {}
  }, [currentPageItems, updateItemProperties, getCanvas]);

  // 切换锁定状态
  const handleToggleLock = useCallback((itemId: string) => {
    const item = currentPageItems.find(item => item.id === itemId);
    if (!item) return;

    const newLockState = !(item.properties.locked === true);
    
    // 更新编辑器状态
    updateItemProperties(itemId, {
      ...item.properties,
      locked: newLockState
    });

    // 同步到Fabric.js画布
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        fabricObject.set({
          selectable: !newLockState,
          evented: !newLockState
        });
        canvas.renderAll();
      }
    }
    try {
      (useEditorStore.getState() as any).saveToHistory?.(newLockState ? '锁定对象' : '解锁对象');
    } catch {}
  }, [currentPageItems, updateItemProperties, getCanvas]);

  // 复制对象
  const handleDuplicate = useCallback((itemId: string) => {
    duplicateItem(itemId);
  }, [duplicateItem]);

  // 删除对象
  const handleDelete = useCallback((itemId: string) => {
    deleteItem(itemId);
    
    // 从Fabric.js画布中移除
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        canvas.remove(fabricObject);
        canvas.renderAll();
      }
    }
    try {
      (useEditorStore.getState() as any).saveToHistory?.('删除对象');
    } catch {}
  }, [deleteItem, getCanvas]);

  // 层级操作
  const handleMoveUp = useCallback((itemId: string) => {
    moveItemUp(itemId);
    
    // 同步到Fabric.js画布
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        canvas.bringForward(fabricObject);
        canvas.renderAll();
      }
    }
    try {
      (useEditorStore.getState() as any).saveToHistory?.('上移图层');
    } catch {}
  }, [moveItemUp, getCanvas]);

  const handleMoveDown = useCallback((itemId: string) => {
    moveItemDown(itemId);
    
    // 同步到Fabric.js画布
    const canvas = getCanvas();
    if (canvas) {
      const fabricObject = canvas.getObjects().find(obj => (obj as any).id === itemId);
      if (fabricObject) {
        canvas.sendBackwards(fabricObject);
        canvas.renderAll();
      }
    }
    try {
      (useEditorStore.getState() as any).saveToHistory?.('下移图层');
    } catch {}
  }, [moveItemDown, getCanvas]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">图层面板</h2>
          <Badge variant="secondary">{currentPageItems.length} 个对象</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          点击选择对象，使用箭头调整层级
        </p>
      </div>

      {/* 快捷操作 */}
      {selectedObjectIds.length > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">选中操作:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedObjectIds.forEach(id => moveItemToTop(id))}
            >
              <Maximize className="w-3 h-3 mr-1" />
              置顶
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedObjectIds.forEach(id => moveItemToBottom(id))}
            >
              <Maximize className="w-3 h-3 mr-1 rotate-180" />
              置底
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedObjectIds.forEach(handleDelete)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              删除
            </Button>
          </div>
        </div>
      )}

      {/* 图层列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sortedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Type className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium mb-1">暂无图层对象</p>
              <p className="text-xs">从素材库拖拽素材到画布创建对象</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <LayerItem
                key={item.id}
                item={item}
                isSelected={selectedObjectIds.includes(item.id)}
                zIndex={getObjectZIndex(item.id)}
                onSelect={handleSelectObject}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}