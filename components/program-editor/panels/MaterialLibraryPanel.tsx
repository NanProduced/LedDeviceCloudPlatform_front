'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Image, Video, Type, Clock, Globe, Thermometer } from 'lucide-react';

interface MaterialLibraryPanelProps {
  className?: string;
}

// 素材类型配置
const MATERIAL_CATEGORIES = [
  {
    key: 'image',
    label: '图片',
    icon: Image,
    types: [2], // type=2 图片
    description: '支持 JPG、PNG、BMP 等格式'
  },
  {
    key: 'video',
    label: '视频',
    icon: Video,
    types: [3, 6], // type=3 视频, type=6 GIF
    description: '支持 MP4、AVI、GIF 等格式'
  },
  {
    key: 'text',
    label: '文本',
    icon: Type,
    types: [4, 5, 102], // type=4 单行文本, type=5 多行文本, type=102 单列文本
    description: '支持单行、多行、滚动文本'
  },
  {
    key: 'web',
    label: '网页',
    icon: Globe,
    types: [27], // type=27 网页/流媒体
    description: '支持网页、流媒体内容'
  },
  {
    key: 'clock',
    label: '时钟',
    icon: Clock,
    types: [9, 16], // type=9 普通时钟, type=16 精美时钟
    description: '支持数字、模拟时钟'
  },
  {
    key: 'sensor',
    label: '传感器',
    icon: Thermometer,
    types: [14, 21, 22, 23, 24, 28], // 气象、湿度、温度、噪音、空气质量、烟雾
    description: '支持各种环境传感器'
  }
];

// 模拟素材数据
const MOCK_MATERIALS = [
  {
    id: '1',
    name: '示例图片1.jpg',
    type: 2,
    category: 'image',
    size: '1920x1080',
    duration: null,
    thumbnail: '/placeholder-image.jpg'
  },
  {
    id: '2',
    name: '示例视频1.mp4',
    type: 3,
    category: 'video',
    size: '1920x1080',
    duration: '00:30',
    thumbnail: '/placeholder-video.jpg'
  },
  {
    id: '3',
    name: '滚动文本示例',
    type: 4,
    category: 'text',
    size: null,
    duration: null,
    thumbnail: null
  }
];

export function MaterialLibraryPanel({ className }: MaterialLibraryPanelProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredMaterials = MOCK_MATERIALS.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">素材库</h2>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索素材..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 素材分类和列表 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
          <div className="p-4 pb-0">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="image">图片</TabsTrigger>
              <TabsTrigger value="video">视频</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-4">
            <TabsContent value="all" className="mt-4 space-y-4">
              {/* 分类卡片 */}
              <div className="grid gap-3">
                {MATERIAL_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card 
                      key={category.key}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <CardTitle className="text-sm">{category.label}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {MOCK_MATERIALS.filter(m => m.category === category.key).length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs">
                          {category.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* 各分类的素材列表 */}
            {MATERIAL_CATEGORIES.map((category) => (
              <TabsContent key={category.key} value={category.key} className="mt-4 space-y-3">
                {filteredMaterials
                  .filter(material => material.category === category.key)
                  .map((material) => (
                    <Card 
                      key={material.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'material',
                          data: material
                        }));
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {material.thumbnail ? (
                            <div className="w-10 h-10 bg-muted rounded flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                              <Type className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{material.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {material.size && (
                                <Badge variant="outline" className="text-xs">
                                  {material.size}
                                </Badge>
                              )}
                              {material.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {material.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {filteredMaterials.filter(m => m.category === category.key).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂无{category.label}素材</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}