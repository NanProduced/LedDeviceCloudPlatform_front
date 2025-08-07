'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Image, 
  Video, 
  Type, 
  Clock, 
  Globe, 
  Thermometer, 
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

import { 
  useMaterialStore, 
  useMaterialList, 
  useMaterialCategories, 
  useMaterialLoading, 
  useMaterialError,
  useUploadProgress
} from '../managers/material-ref-manager';

import { 
  MaterialInfo, 
  MaterialCategory as MaterialCategoryType, 
  ItemType,
  MATERIAL_CATEGORY_MAP 
} from '../types';

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

// 分类图标映射
const CATEGORY_ICONS = {
  image: Image,
  video: Video,
  text: Type,
  web: Globe,
  clock: Clock,
  sensor: Thermometer,
  document: FileText,
  other: FileText
} as const;

// 素材项组件
interface MaterialItemProps {
  material: MaterialInfo;
  onSelect: (material: MaterialInfo) => void;
  onDragStart: (material: MaterialInfo, event: React.DragEvent) => void;
}

function MaterialItem({ material, onSelect, onDragStart }: MaterialItemProps) {
  const handleDragStart = (event: React.DragEvent) => {
    onDragStart(material, event);
  };

  const handleClick = () => {
    onSelect(material);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-colors"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* 缩略图或图标 */}
          {material.category === 'image' ? (
            <div className="w-10 h-10 bg-muted rounded flex-shrink-0 overflow-hidden">
              <img
                src={material.accessUrl}
                alt={material.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
              {React.createElement(CATEGORY_ICONS[material.category] || FileText, {
                className: "w-4 h-4 text-muted-foreground"
              })}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={material.name}>
              {material.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {material.metadata.dimensions && (
                <Badge variant="outline" className="text-xs">
                  {material.metadata.dimensions.width}×{material.metadata.dimensions.height}
                </Badge>
              )}
              {material.metadata.duration && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(material.metadata.duration / 1000)}s
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {formatFileSize(material.fileSize)}
              </Badge>
              {material.metadata.format && (
                <Badge variant="outline" className="text-xs">
                  {material.metadata.format}
                </Badge>
              )}
            </div>
            
            {/* 状态指示 */}
            {material.status === 'processing' && (
              <div className="flex items-center gap-1 mt-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs text-muted-foreground">处理中...</span>
              </div>
            )}
            
            {material.status === 'error' && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">处理失败</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 上传进度组件
function UploadProgressItem({ materialId, progress }: { materialId: string; progress: any }) {
  return (
    <div className="p-3 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium truncate">{progress.fileName}</span>
        <div className="flex items-center gap-2">
          {progress.status === 'uploading' && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {progress.status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          {progress.status === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
      
      {progress.status === 'uploading' && (
        <Progress value={progress.progress} className="h-2" />
      )}
      
      {progress.status === 'error' && progress.error && (
        <p className="text-xs text-red-500 mt-1">{progress.error}</p>
      )}
    </div>
  );
}

export function MaterialLibraryPanel({ className }: MaterialLibraryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // 状态管理
  const {
    loadMaterials,
    loadCategories,
    searchMaterials,
    filterByCategory,
    uploadMaterial,
    clearCompletedUploads
  } = useMaterialStore();

  const materials = useMaterialList();
  const categories = useMaterialCategories();
  const isLoading = useMaterialLoading();
  const error = useMaterialError();
  const uploadProgress = useUploadProgress();

  // 初始化加载
  useEffect(() => {
    loadCategories();
    loadMaterials();
  }, [loadCategories, loadMaterials]);

  // 搜索处理
  const handleSearch = useCallback(async (keyword: string) => {
    setSearchTerm(keyword);
    if (keyword.trim()) {
      await searchMaterials(keyword);
    } else {
      await loadMaterials();
    }
  }, [searchMaterials, loadMaterials]);

  // 分类过滤
  const handleCategoryFilter = useCallback(async (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      await loadMaterials();
    } else {
      await filterByCategory(category);
    }
  }, [filterByCategory, loadMaterials]);

  // 素材选择
  const handleMaterialSelect = useCallback((material: MaterialInfo) => {
    console.log('选中素材:', material);
    // TODO: 集成到编辑器状态管理
  }, []);

  // 拖拽开始
  const handleDragStart = useCallback((material: MaterialInfo, event: React.DragEvent) => {
    // 设置拖拽数据
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'material',
      data: material
    }));
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  // 文件上传
  const handleFileUpload = useCallback(async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await uploadMaterial(file, {
          category: selectedCategory === 'all' ? 'other' : selectedCategory
        });
      } catch (error) {
        console.error('上传失败:', error);
      }
    }
    setUploadDialogOpen(false);
    // 上传完成后刷新列表
    setTimeout(() => {
      loadMaterials();
    }, 1000);
  }, [uploadMaterial, selectedCategory, loadMaterials]);

  // 过滤素材
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 按分类分组素材
  const materialsByCategory = MATERIAL_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = filteredMaterials.filter(material => material.category === category.key);
    return acc;
  }, {} as Record<string, MaterialInfo[]>);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">素材库</h2>
          
          {/* 上传按钮 */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                上传
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>上传素材</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    拖拽文件到这里或点击选择文件
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.gif"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>选择文件</span>
                    </Button>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索素材..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 上传进度 */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">上传进度</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearCompletedUploads}
              className="text-xs"
            >
              清除已完成
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <UploadProgressItem key={id} materialId={id} progress={progress} />
            ))}
          </div>
        </div>
      )}

      {/* 素材分类和列表 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedCategory} onValueChange={handleCategoryFilter} className="h-full flex flex-col">
          <div className="p-4 pb-0">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="image">图片</TabsTrigger>
              <TabsTrigger value="video">视频</TabsTrigger>
              <TabsTrigger value="text">文本</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-4">
            {/* 错误提示 */}
            {error && (
              <div className="mx-4 mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            <TabsContent value="all" className="mt-4 space-y-4">
              {/* 加载状态 */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">加载中...</span>
                </div>
              )}

              {/* 分类卡片 */}
              {!isLoading && (
                <div className="grid gap-3">
                  {MATERIAL_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const categoryMaterials = materialsByCategory[category.key] || [];
                    return (
                      <Card 
                        key={category.key}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleCategoryFilter(category.key)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <CardTitle className="text-sm">{category.label}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {categoryMaterials.length}
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
              )}

              {/* 空状态 */}
              {!isLoading && materials.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">暂无素材</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    点击上传按钮添加素材到库中
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传素材
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 各分类的素材列表 */}
            {MATERIAL_CATEGORIES.map((category) => (
              <TabsContent key={category.key} value={category.key} className="mt-4 space-y-3">
                {/* 加载状态 */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">加载中...</span>
                  </div>
                )}

                {/* 素材列表 */}
                {!isLoading && materialsByCategory[category.key]?.map((material) => (
                  <MaterialItem
                    key={material.id}
                    material={material}
                    onSelect={handleMaterialSelect}
                    onDragStart={handleDragStart}
                  />
                ))}
              
                {/* 空状态 */}
                {!isLoading && (materialsByCategory[category.key]?.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(category.icon, {
                        className: "w-8 h-8"
                      })}
                    </div>
                    <p className="text-sm mb-4">
                      {searchTerm ? `没有找到匹配的${category.label}素材` : `暂无${category.label}素材`}
                    </p>
                    {!searchTerm && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setUploadDialogOpen(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        上传{category.label}
                      </Button>
                    )}
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