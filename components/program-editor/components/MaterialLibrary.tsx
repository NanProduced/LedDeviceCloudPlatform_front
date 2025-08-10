'use client';

/**
 * 素材库组件
 * 使用shadcn组件实现素材分类、搜索和预览功能
 */

import React, { useState, useEffect } from 'react';
import { Search, Image, Video, Type, Clock, Cloud, Thermometer, FileText, Globe } from 'lucide-react';

// shadcn组件
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// 类型定义
import { VSNItemType } from '../types/program-editor';

interface MaterialItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'gif' | 'audio';
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  createdAt: Date;
}

interface MaterialCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  itemTypes: VSNItemType[];
  description: string;
}

interface MaterialLibraryProps {
  onAddMaterial: (materialId: string, materialType: VSNItemType) => void;
  className?: string;
}

// 素材分类配置
const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'image',
    name: '图片',
    icon: Image,
    itemTypes: [2], // VSN type=2 图片
    description: '支持 JPG、PNG、BMP 等格式',
  },
  {
    id: 'video',
    name: '视频',
    icon: Video,
    itemTypes: [3, 6], // VSN type=3 视频, type=6 GIF
    description: '支持 MP4、AVI、GIF 等格式',
  },
  {
    id: 'text',
    name: '文本',
    icon: Type,
    itemTypes: [4, 5, 102], // VSN type=4 单行文本, type=5 多行文本, type=102 单列文本
    description: '支持单行、多行、滚动文本',
  },
  {
    id: 'clock',
    name: '时钟',
    icon: Clock,
    itemTypes: [9, 16], // VSN type=9 普通时钟, type=16 精美时钟
    description: '数字时钟、模拟时钟',
  },
  {
    id: 'weather',
    name: '天气',
    icon: Cloud,
    itemTypes: [14], // VSN type=14 天气
    description: '实时天气信息显示',
  },
  {
    id: 'sensor',
    name: '传感器',
    icon: Thermometer,
    itemTypes: [21, 22, 23, 24, 28], // VSN type=21-24 各种传感器
    description: '温度、湿度、空气质量等',
  },
  {
    id: 'web',
    name: '网页',
    icon: Globe,
    itemTypes: [27], // VSN type=27 网页/流媒体
    description: '网页内容、流媒体',
  },
];

/**
 * 素材项组件
 */
function MaterialItemCard({ 
  item, 
  onSelect 
}: { 
  item: MaterialItem; 
  onSelect: (item: MaterialItem) => void; 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onSelect(item)}
    >
      <CardContent className="p-3">
        {/* 预览图 */}
        <div className="aspect-[4/3] bg-muted rounded-md mb-2 overflow-hidden relative h-32">
          {item.thumbnailUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <Skeleton className="w-full h-full absolute inset-0" />
              )}
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === 'image' && <Image className="h-8 w-8 text-muted-foreground" />}
              {item.type === 'video' && <Video className="h-8 w-8 text-muted-foreground" />}
              {item.type === 'gif' && <Video className="h-8 w-8 text-muted-foreground" />}
              {item.type === 'audio' && <FileText className="h-8 w-8 text-muted-foreground" />}
            </div>
          )}

          {/* 类型标识 */}
          <div className="absolute top-1 right-1">
            <Badge variant="secondary" className="text-xs h-5">
              {item.type.toUpperCase()}
            </Badge>
          </div>

          {/* 时长标识 (视频) */}
          {item.duration && (
            <div className="absolute bottom-1 right-1">
              <Badge variant="default" className="text-xs h-5">
                {formatDuration(item.duration)}
              </Badge>
            </div>
          )}

          {/* 尺寸标识 (图片/视频) */}
          {item.dimensions && (
            <div className="absolute bottom-1 left-1">
              <Badge variant="outline" className="text-xs h-5 bg-background/80">
                {item.dimensions.width}×{item.dimensions.height}
              </Badge>
            </div>
          )}
        </div>

        {/* 文件信息 */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium truncate" title={item.name}>
            {item.name}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{formatFileSize(item.fileSize)}</span>
            <span>{item.createdAt.toLocaleDateString()}</span>
          </div>
          {/* 添加详细信息显示 */}
          {item.dimensions && (
            <div className="text-xs text-muted-foreground">
              尺寸: {item.dimensions.width} × {item.dimensions.height}
            </div>
          )}
          {item.duration && (
            <div className="text-xs text-muted-foreground">
              时长: {formatDuration(item.duration)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 快速添加按钮组件
 */
function QuickAddButtons({ onAddItem }: { onAddItem: (type: VSNItemType) => void }) {
  const quickItems = [
    { type: 4 as VSNItemType, name: '文本', icon: Type },
    { type: 9 as VSNItemType, name: '时钟', icon: Clock },
    { type: 14 as VSNItemType, name: '天气', icon: Cloud },
    { type: 22 as VSNItemType, name: '温度', icon: Thermometer },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3 border-b">
      {quickItems.map((item) => (
        <Card
          key={item.type}
          className="cursor-pointer hover:shadow-sm transition-all duration-200 group"
          onClick={() => onAddItem(item.type)}
        >
          <CardContent className="p-3 text-center">
            <item.icon className="h-6 w-6 mx-auto mb-1 text-muted-foreground group-hover:text-foreground" />
            <p className="text-xs">{item.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * 素材库主组件
 */
export function MaterialLibrary({ onAddMaterial, className }: MaterialLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    // TODO: 实际的API调用
    setTimeout(() => {
      setMaterials([
        {
          id: '1',
          name: '宣传海报.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          fileSize: 1024000,
          thumbnailUrl: '/api/file/preview/1?w=200&h=150',
          dimensions: { width: 1920, height: 1080 },
          createdAt: new Date(),
        },
        {
          id: '2',
          name: '产品介绍.mp4',
          type: 'video',
          mimeType: 'video/mp4',
          fileSize: 10240000,
          thumbnailUrl: '/api/file/preview/2?w=200&h=150&t=1',
          dimensions: { width: 1920, height: 1080 },
          duration: 30,
          createdAt: new Date(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // 过滤素材
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'image' && material.type === 'image') ||
      (selectedCategory === 'video' && (material.type === 'video' || material.type === 'gif'));
    return matchesSearch && matchesCategory;
  });

  // 处理素材选择
  const handleMaterialSelect = (material: MaterialItem) => {
    let vsnType: VSNItemType = 2; // 默认图片
    
    switch (material.type) {
      case 'image':
        vsnType = 2;
        break;
      case 'video':
        vsnType = 3;
        break;
      case 'gif':
        vsnType = 6;
        break;
    }
    
    onAddMaterial(material.id, vsnType);
  };

  // 处理快速添加
  const handleQuickAdd = (type: VSNItemType) => {
    onAddMaterial('quick-' + type, type);
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 搜索栏 */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索素材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* 快速添加按钮 */}
      <QuickAddButtons onAddItem={handleQuickAdd} />

              {/* 分类标签 */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <div className="border-b">
            <ScrollArea>
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
                <TabsTrigger value="image" className="text-xs">图片</TabsTrigger>
                <TabsTrigger value="video" className="text-xs">视频</TabsTrigger>
                <TabsTrigger value="text" className="text-xs">文本</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 mt-1">
                <TabsTrigger value="clock" className="text-xs">时钟</TabsTrigger>
                <TabsTrigger value="weather" className="text-xs">天气</TabsTrigger>
                <TabsTrigger value="sensor" className="text-xs">传感器</TabsTrigger>
                <TabsTrigger value="web" className="text-xs">网页</TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

        {/* 素材列表 */}
        <div className="flex-1 min-h-0">
          <TabsContent value="all" className="h-full mt-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="p-3 space-y-3">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <Skeleton className="aspect-video mb-2" />
                        <Skeleton className="h-4 mb-1" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((material) => (
                      <MaterialItemCard
                        key={material.id}
                        item={material}
                        onSelect={handleMaterialSelect}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">暂无素材</p>
                      <p className="text-xs">请上传素材或使用快速添加</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="image" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                {filteredMaterials
                  .filter(m => m.type === 'image')
                  .map((material) => (
                    <MaterialItemCard
                      key={material.id}
                      item={material}
                      onSelect={handleMaterialSelect}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="video" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                {filteredMaterials
                  .filter(m => m.type === 'video' || m.type === 'gif')
                  .map((material) => (
                    <MaterialItemCard
                      key={material.id}
                      item={material}
                      onSelect={handleMaterialSelect}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 文本类型 */}
          <TabsContent value="text" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Type className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">文本素材</p>
                  <p className="text-xs">支持单行、多行、滚动文本</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 时钟类型 */}
          <TabsContent value="clock" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">时钟组件</p>
                  <p className="text-xs">数字时钟、模拟时钟</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 天气类型 */}
          <TabsContent value="weather" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Cloud className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">天气组件</p>
                  <p className="text-xs">实时天气信息显示</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 传感器类型 */}
          <TabsContent value="sensor" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Thermometer className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">传感器组件</p>
                  <p className="text-xs">温度、湿度、空气质量等</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 网页类型 */}
          <TabsContent value="web" className="h-full mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">网页组件</p>
                  <p className="text-xs">网页内容、流媒体</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}