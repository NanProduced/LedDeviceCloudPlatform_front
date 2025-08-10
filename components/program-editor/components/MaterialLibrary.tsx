'use client';

/**
 * 素材库组件
 * 使用shadcn组件实现素材分类、搜索和预览功能
 */

import React, { useState, useEffect } from 'react';
import { Search, Image, Video, FileText } from 'lucide-react';

// API导入
import { MaterialAPI, ListMaterialResponse } from '@/lib/api/material';

// shadcn组件
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// 类型定义
import { VSNItemType } from '../types/program-editor';
import { getFilePreviewUrl } from '@/lib/api/filePreview';

interface MaterialItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'gif' | 'audio';
  mimeType: string;
  fileSize: number;
  fileId?: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  createdAt: Date;
}

interface MaterialLibraryProps {
  onAddMaterial: (materialId: string, materialType: VSNItemType) => void;
  className?: string;
}

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

  const getVSNTypeFromMaterial = (m: MaterialItem): VSNItemType => {
    switch (m.type) {
      case 'image':
        return 2;
      case 'video':
        return 3;
      case 'gif':
        return 6;
      default:
        return 2;
    }
  };

  const getFallbackDimensions = (m: MaterialItem) => {
    if (m.dimensions) return m.dimensions;
    if (m.type === 'video' || m.type === 'gif') return { width: 1280, height: 720 };
    if (m.type === 'image') return { width: 800, height: 600 };
    return { width: 400, height: 300 };
  };

  const handleDragStart = (e: React.DragEvent) => {
    const payload = {
      materialId: item.id,
      materialType: getVSNTypeFromMaterial(item) as VSNItemType,
      mimeType: item.mimeType,
      dimensions: getFallbackDimensions(item),
      name: item.name,
    };
    e.dataTransfer.setData('application/x-material', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onSelect(item)}
      draggable
      onDragStart={handleDragStart}
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
 * 素材库主组件
 */
export function MaterialLibrary({ onAddMaterial, className }: MaterialLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 真实数据加载
  // 转换后端数据为前端格式
  const convertMaterialData = (backendMaterial: ListMaterialResponse): MaterialItem => {
    let type: MaterialItem['type'] = 'image';
    
    switch (backendMaterial.materialType) {
      case 'IMAGE':
        type = 'image';
        break;
      case 'VIDEO':
        type = 'video';
        break;
      case 'AUDIO':
        type = 'audio';
        break;
      default:
        type = 'image';
    }
    
    // 从文件扩展名判断是否是GIF
    if (backendMaterial.fileExtension?.toLowerCase() === 'gif') {
      type = 'gif';
    }
    
    return {
      id: backendMaterial.mid.toString(),
      name: backendMaterial.materialName,
      type,
      mimeType: backendMaterial.mimeType,
      fileSize: backendMaterial.fileSize,
      fileId: backendMaterial.fileId,
      thumbnailUrl: getFilePreviewUrl(backendMaterial.fileId, { w: 320, h: 240, fit: 'cover', format: 'jpg', q: 80 }),
      dimensions: undefined, // 需要通过metadata API获取
      duration: undefined, // 需要通过metadata API获取
      createdAt: new Date(backendMaterial.createTime),
    };
  };

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      try {
        const backendMaterials = await MaterialAPI.listAllMaterials();
        const convertedMaterials = backendMaterials.map(convertMaterialData);
        setMaterials(convertedMaterials);
      } catch (error) {
        console.error('加载素材失败:', error);
        // 使用少量测试数据作为后备
        setMaterials([
          {
            id: '1',
            name: '测试图片.jpg',
            type: 'image',
            mimeType: 'image/jpeg',
            fileSize: 1024000,
            thumbnailUrl: undefined,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // 过滤素材
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'image' && (material.type === 'image' || material.type === 'gif')) ||
      (selectedCategory === 'video' && material.type === 'video');
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



      {/* 分类标签 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
            <TabsTrigger value="image" className="text-xs">图片</TabsTrigger>
            <TabsTrigger value="video" className="text-xs">视频</TabsTrigger>
          </TabsList>
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


        </div>
      </Tabs>
    </div>
  );
}