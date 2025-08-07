'use client';

import React from 'react';
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
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerPanelProps {
  className?: string;
  objects?: any[]; // Fabric.js 对象数组
  selectedObjects?: string[]; // 选中对象的ID数组
  onSelectObject?: (objectId: string) => void;
  onToggleVisibility?: (objectId: string) => void;
  onToggleLock?: (objectId: string) => void;
  onDeleteObject?: (objectId: string) => void;
  onDuplicateObject?: (objectId: string) => void;
}

// 获取对象类型图标
const getObjectIcon = (type: string) => {
  switch (type) {
    case 'image':
      return Image;
    case 'text':
      return Type;
    case 'video':
      return Video;
    case 'clock':
      return Clock;
    case 'web':
      return Globe;
    default:
      return Type;
  }
};

// 获取对象类型颜色
const getObjectTypeColor = (type: string) => {
  switch (type) {
    case 'image':
      return 'bg-blue-100 text-blue-800';
    case 'text':
      return 'bg-green-100 text-green-800';
    case 'video':
      return 'bg-purple-100 text-purple-800';
    case 'clock':
      return 'bg-orange-100 text-orange-800';
    case 'web':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 模拟图层数据
const MOCK_OBJECTS = [
  {
    id: 'obj_1',
    type: 'text',
    name: '标题文本',
    visible: true,
    locked: false,
    zIndex: 3
  },
  {
    id: 'obj_2',
    type: 'image',
    name: '背景图片.jpg',
    visible: true,
    locked: false,
    zIndex: 2
  },
  {
    id: 'obj_3',
    type: 'video',
    name: '宣传视频.mp4',
    visible: false,
    locked: true,
    zIndex: 1
  },
  {
    id: 'obj_4',
    type: 'clock',
    name: '数字时钟',
    visible: true,
    locked: false,
    zIndex: 4
  }
];

export function LayerPanel({
  className,
  objects = MOCK_OBJECTS,
  selectedObjects = ['obj_1'],
  onSelectObject,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
  onDuplicateObject
}: LayerPanelProps) {
  // 按 zIndex 排序，zIndex 大的在前面（顶层）
  const sortedObjects = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  const handleSelectObject = (objectId: string) => {
    onSelectObject?.(objectId);
  };

  const handleToggleVisibility = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    onToggleVisibility?.(objectId);
  };

  const handleToggleLock = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    onToggleLock?.(objectId);
  };

  const handleDeleteObject = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    onDeleteObject?.(objectId);
  };

  const handleDuplicateObject = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    onDuplicateObject?.(objectId);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">图层面板</h2>
          <Badge variant="secondary">{objects.length} 个对象</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          拖拽可调整层级顺序
        </p>
      </div>

      {/* 图层列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sortedObjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">暂无图层对象</p>
              <p className="text-xs mt-1">从素材库拖拽素材到画布</p>
            </div>
          ) : (
            sortedObjects.map((object) => {
              const Icon = getObjectIcon(object.type);
              const isSelected = selectedObjects.includes(object.id);
              
              return (
                <Card
                  key={object.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-primary bg-accent'
                  )}
                  onClick={() => handleSelectObject(object.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* 拖拽手柄 */}
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      
                      {/* 对象图标和类型 */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-6 h-6 rounded flex items-center justify-center',
                          getObjectTypeColor(object.type)
                        )}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {object.zIndex}
                        </Badge>
                      </div>
                      
                      {/* 对象名称 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {object.name}
                        </p>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1">
                        {/* 可见性切换 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={(e) => handleToggleVisibility(e, object.id)}
                        >
                          {object.visible ? (
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
                          onClick={(e) => handleToggleLock(e, object.id)}
                        >
                          {object.locked ? (
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
                          onClick={(e) => handleDuplicateObject(e, object.id)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        {/* 删除 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteObject(e, object.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}