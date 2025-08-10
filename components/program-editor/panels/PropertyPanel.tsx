'use client';

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Move, 
  RotateCw, 
  Palette, 
  Type, 
  Eye,
  Layers,
  Clock,
  Image,
  Video,
  Globe,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Maximize,
  MoreHorizontal,
  Square
} from 'lucide-react';

import { fabric } from 'fabric';
import { useEditorStore } from '../managers/editor-state-manager';
import { useMaterialStore } from '../managers/material-ref-manager';
import { 
  ItemType, 
  EditorItem, 
  ItemProperties,
  MaterialReference,
  ITEM_TYPE_MAP
} from '../types';

type TransformProp = 'left' | 'top' | 'width' | 'height' | 'angle';

interface PropertyPanelProps {
  className?: string;
  selectedObjects?: fabric.Object[]; // Fabric.js 对象数组
}

// 字体选项
const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimHei', label: '黑体' },
  { value: 'SimSun', label: '宋体' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' }
];

// 对齐方式选项
const TEXT_ALIGN_OPTIONS = [
  { value: 0, label: '左对齐' },
  { value: 1, label: '居中' },
  { value: 2, label: '右对齐' }
];

// 字体粗细选项
const FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'bold', label: '粗体' },
  { value: '100', label: '极细' },
  { value: '300', label: '细' },
  { value: '500', label: '中等' },
  { value: '700', label: '粗' },
  { value: '900', label: '极粗' }
];

// 获取对象类型图标
function getTypeIcon(type: ItemType) {
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
    [ItemType.TIMER]: Clock
  };
  return iconMap[type] || Settings;
}

// 获取对象类型名称
function getTypeName(type: ItemType): string {
  return (ITEM_TYPE_MAP as any)[type] || '未知对象';
}

export function PropertyPanel({ className, selectedObjects = [] }: PropertyPanelProps) {
  // 状态管理
  const {
    selectedObjectIds,
    currentPageIndex,
    pages,
    updatePage,
    updateRegion,
    updateItemProperties,
    updateItemPosition,
    updateItemSize,
    moveItemToTop,
    moveItemToBottom,
    moveItemUp,
    moveItemDown,
    getCanvas
  } = useEditorStore();

  const { getMaterialRef } = useMaterialStore();

  // 获取当前选中的编辑器对象
  const selectedEditorItems = useMemo(() => {
    if (selectedObjectIds.length === 0 || !pages[currentPageIndex]) return [];
    
    const currentPage = pages[currentPageIndex];
    const selectedItems: EditorItem[] = [];
    
    for (const region of currentPage.regions) {
      for (const item of region.items) {
        if (selectedObjectIds.includes(item.id)) {
          selectedItems.push(item);
        }
      }
    }
    
    return selectedItems;
  }, [selectedObjectIds, pages, currentPageIndex]);

  // 获取主要选中对象（第一个）
  const primarySelectedItem = selectedEditorItems[0];
  const primarySelectedObject = selectedObjects[0];

  // 入历史防抖
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveHistoryDebounced = useCallback((desc: string) => {
    try {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        try {
          (useEditorStore.getState() as any).saveToHistory?.(desc);
        } catch {}
      }, 300);
    } catch {}
  }, []);

  // 更新Fabric.js对象属性
  const updateFabricObjectProperty = useCallback((property: string, value: any) => {
    if (!primarySelectedObject) return;

    const canvas = getCanvas();
    if (!canvas) return;

    // 更新Fabric.js对象
    primarySelectedObject.set(property, value);
    canvas.renderAll();

    // 同步到编辑器状态
    if (primarySelectedItem) {
      updateItemProperties(primarySelectedItem.id, {
        ...primarySelectedItem.properties,
        [property]: value
      });
      saveHistoryDebounced('更新对象属性');
    }
  }, [primarySelectedObject, primarySelectedItem, updateItemProperties, getCanvas]);

  // 更新编辑器对象属性
  const updateEditorProperty = useCallback((property: string, value: any) => {
    if (!primarySelectedItem) return;

    // 更新编辑器状态
    updateItemProperties(primarySelectedItem.id, {
      ...primarySelectedItem.properties,
      [property]: value
    });

    // 同步到Fabric.js对象
    if (primarySelectedObject) {
      const canvas = getCanvas();
      if (canvas) {
        // 根据属性类型进行映射
        if (property === 'textColor') {
          primarySelectedObject.set('fill', value);
        } else if (property === 'font') {
          const fontProps = value as any;
          primarySelectedObject.set({
            fontSize: fontProps.size,
            fontFamily: fontProps.family,
            fontWeight: fontProps.weight,
            fontStyle: fontProps.italic ? 'italic' : 'normal',
            underline: fontProps.underline || false
          });
        } else {
          primarySelectedObject.set(property, value);
        }
        canvas.renderAll();
      }
      saveHistoryDebounced('更新对象属性');
    }
  }, [primarySelectedItem, primarySelectedObject, updateItemProperties, getCanvas]);

  // 简易节流/防抖调度器
  const timersRef = useRef<{ [key: string]: any }>({});
  const schedule = useCallback((key: string, fn: () => void, delay: number) => {
    const timers = timersRef.current;
    if (timers[key]) clearTimeout(timers[key]);
    timers[key] = setTimeout(() => {
      fn();
      delete timers[key];
    }, delay);
  }, []);

  // 位置和尺寸更新（先声明，供后续节流包装引用）
  const updateTransform = useCallback((property: TransformProp, value: number) => {
    if (!primarySelectedObject || !primarySelectedItem) return;

    const canvas = getCanvas();
    if (!canvas) return;

    // 更新Fabric.js对象
    primarySelectedObject.set(property, value);
    canvas.renderAll();

    // 更新编辑器状态
    if (property === 'left' || property === 'top') {
      updateItemPosition(primarySelectedItem.id, {
        x: property === 'left' ? value : primarySelectedItem.position.x,
        y: property === 'top' ? value : primarySelectedItem.position.y
      });
    } else if (property === 'width' || property === 'height') {
      updateItemSize(primarySelectedItem.id, {
        width: property === 'width' ? value : primarySelectedItem.size.width,
        height: property === 'height' ? value : primarySelectedItem.size.height
      });
    }
    saveHistoryDebounced('更新位置/尺寸/旋转');
  }, [primarySelectedObject, primarySelectedItem, updateItemPosition, updateItemSize, getCanvas]);

  // 包装后的节流更新
  const updateTransformThrottled = useCallback((property: TransformProp, value: number) => {
    schedule(`transform:${property}`, () => updateTransform(property, value), property === 'angle' ? 100 : 100);
  }, [schedule, updateTransform]);

  const updateFabricPropertyThrottled = useCallback((property: string, value: any) => {
    schedule(`fabric:${property}`, () => updateFabricObjectProperty(property, value), 100);
  }, [schedule, updateFabricObjectProperty]);

  const updateEditorPropertyThrottled = useCallback((property: string, value: any) => {
    schedule(`editor:${property}`, () => updateEditorProperty(property, value), 300);
  }, [schedule, updateEditorProperty]);

  

  // 层级操作
  const handleLayerOperation = useCallback((operation: 'top' | 'bottom' | 'up' | 'down') => {
    if (!primarySelectedItem) return;

    switch (operation) {
      case 'top':
        moveItemToTop(primarySelectedItem.id);
        break;
      case 'bottom':
        moveItemToBottom(primarySelectedItem.id);
        break;
      case 'up':
        moveItemUp(primarySelectedItem.id);
        break;
      case 'down':
        moveItemDown(primarySelectedItem.id);
        break;
    }
  }, [primarySelectedItem, moveItemToTop, moveItemToBottom, moveItemUp, moveItemDown]);

  // 获取素材引用
  const materialRef = useMemo(() => {
    if (!primarySelectedItem?.materialRef) return null;
    return getMaterialRef(primarySelectedItem.materialRef.materialId);
  }, [primarySelectedItem?.materialRef, getMaterialRef]);

  // 计算当前页面与区域（对象未选中时，区域默认当前页第一个）
  const currentPage = pages[currentPageIndex];
  const currentRegion = useMemo(() => {
    if (!currentPage) return null;
    if (primarySelectedItem) {
      for (const region of currentPage.regions) {
        if (region.items.some(i => i.id === primarySelectedItem.id)) return region;
      }
    }
    return currentPage.regions?.[0] || null;
  }, [currentPage, primarySelectedItem]);

  const TypeIcon = primarySelectedItem ? getTypeIcon(primarySelectedItem.type) : Settings;

  const panel = (
    <>
      <div className={"flex flex-col h-full " + (className || '')}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">属性面板</h2>
          <Badge variant="secondary">{selectedEditorItems.length} 个对象</Badge>
        </div>
        {primarySelectedItem && (
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground truncate">
              {primarySelectedItem.name || getTypeName(primarySelectedItem.type)}
            </p>
          </div>
        )}
      </div>

      {/* 属性编辑区域（顶层页签：页面 / 区域 / 对象） */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="object" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="page">页面</TabsTrigger>
              <TabsTrigger value="region">区域</TabsTrigger>
              <TabsTrigger value="object">对象</TabsTrigger>
            </TabsList>

            {/* 页面属性 */}
            <TabsContent value="page" className="space-y-4">
              {currentPage ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <CardTitle className="text-base">页面基础</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="page-name">名称</Label>
                        <Input
                          id="page-name"
                          value={currentPage.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            updatePage(currentPage.id, { name: v });
                            saveHistoryDebounced('更新页面属性');
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="loopType">播放方式</Label>
                          <Select
                            value={String(currentPage.loopType)}
                            onValueChange={(v)=>{ updatePage(currentPage.id, { loopType: Number(v) as any }); saveHistoryDebounced('更新页面属性'); }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">指定时长</SelectItem>
                              <SelectItem value="1">自动计算</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="page-duration">页面时长(ms)</Label>
                          <Input
                            id="page-duration"
                            type="number"
                            min={100}
                            value={currentPage.duration}
                            onChange={(e)=>{ const v = parseInt(e.target.value)||0; updatePage(currentPage.id, { duration: v }); saveHistoryDebounced('更新页面属性'); }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page-bg">背景色</Label>
                        <div className="flex gap-2">
                          <Input id="page-bg" type="color" value={currentPage.bgColor}
                            onChange={(e)=>{ const v = e.target.value; updatePage(currentPage.id, { bgColor: v }); const c = getCanvas(); try { c?.setBackgroundColor(v, ()=>{}); c?.renderAll(); } catch {}; saveHistoryDebounced('更新页面属性'); }}
                            className="w-12 h-10 p-1" />
                          <Input value={currentPage.bgColor} onChange={(e)=>{ const v=e.target.value; updatePage(currentPage.id, { bgColor: v }); const c=getCanvas(); try { c?.setBackgroundColor(v, ()=>{}); c?.renderAll(); } catch {}; saveHistoryDebounced('更新页面属性'); }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">无页面</div>
              )}
            </TabsContent>

            {/* 区域属性 */}
            <TabsContent value="region" className="space-y-4">
              {currentPage && currentRegion ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      <CardTitle className="text-base">区域属性</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="region-name">名称</Label>
                      <Input id="region-name" value={currentRegion.name}
                        onChange={(e)=>{ updateRegion(currentPage.id, currentRegion.id, { name: e.target.value }); saveHistoryDebounced('更新区域属性'); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="region-x">X</Label>
                        <Input id="region-x" type="number" value={currentRegion.rect.x}
                          onChange={(e)=>{
                            const v = parseInt(e.target.value)||0;
                            const rect = { ...currentRegion.rect, x: v };
                            updateRegion(currentPage.id, currentRegion.id, { rect });
                            const c = getCanvas();
                            const frame = c?.getObjects().find((o:any)=>o.isRegionFrame && o.regionId===currentRegion.id);
                            if (frame) { frame.set('left', v); c?.renderAll(); }
                            saveHistoryDebounced('更新区域属性');
                          }} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region-y">Y</Label>
                        <Input id="region-y" type="number" value={currentRegion.rect.y}
                          onChange={(e)=>{
                            const v = parseInt(e.target.value)||0;
                            const rect = { ...currentRegion.rect, y: v };
                            updateRegion(currentPage.id, currentRegion.id, { rect });
                            const c = getCanvas();
                            const frame = c?.getObjects().find((o:any)=>o.isRegionFrame && o.regionId===currentRegion.id);
                            if (frame) { frame.set('top', v); c?.renderAll(); }
                            saveHistoryDebounced('更新区域属性');
                          }} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region-w">宽度</Label>
                        <Input id="region-w" type="number" value={currentRegion.rect.width}
                          onChange={(e)=>{
                            const v = parseInt(e.target.value)||0;
                            const rect = { ...currentRegion.rect, width: v };
                            updateRegion(currentPage.id, currentRegion.id, { rect });
                            const c = getCanvas();
                            const frame = c?.getObjects().find((o:any)=>o.isRegionFrame && o.regionId===currentRegion.id);
                            if (frame) { frame.set('width', v); c?.renderAll(); }
                            saveHistoryDebounced('更新区域属性');
                          }} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region-h">高度</Label>
                        <Input id="region-h" type="number" value={currentRegion.rect.height}
                          onChange={(e)=>{
                            const v = parseInt(e.target.value)||0;
                            const rect = { ...currentRegion.rect, height: v };
                            updateRegion(currentPage.id, currentRegion.id, { rect });
                            const c = getCanvas();
                            const frame = c?.getObjects().find((o:any)=>o.isRegionFrame && o.regionId===currentRegion.id);
                            if (frame) { frame.set('height', v); c?.renderAll(); }
                            saveHistoryDebounced('更新区域属性');
                          }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-sm text-muted-foreground">无区域</div>
              )}
            </TabsContent>

            {/* 对象属性（包含 原有的 变换/外观/内容 页签） */}
            <TabsContent value="object" className="space-y-4">
              {selectedEditorItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>请选择一个对象</p>
                  <p className="text-sm mt-1">选中画布中的对象来编辑属性</p>
                </div>
              ) : null}
              <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform">变换</TabsTrigger>
              <TabsTrigger value="appearance">外观</TabsTrigger>
              <TabsTrigger value="content">内容</TabsTrigger>
            </TabsList>

            {/* 变换属性 */}
            <TabsContent value="transform" className="space-y-4">
              {/* 位置和大小 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    <CardTitle className="text-base">位置和大小</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="left">X 坐标</Label>
                      <Input
                        id="left"
                        type="number"
                        value={primarySelectedObject?.left || primarySelectedItem?.position.x || 0}
                        onChange={(e) => updateTransformThrottled('left', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="top">Y 坐标</Label>
                      <Input
                        id="top"
                        type="number"
                        value={primarySelectedObject?.top || primarySelectedItem?.position.y || 0}
                        onChange={(e) => updateTransformThrottled('top', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="width">宽度</Label>
                      <Input
                        id="width"
                        type="number"
                        value={primarySelectedObject?.width || primarySelectedItem?.size.width || 100}
                        onChange={(e) => updateTransformThrottled('width', parseInt(e.target.value) || 100)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">高度</Label>
                      <Input
                        id="height"
                        type="number"
                        value={primarySelectedObject?.height || primarySelectedItem?.size.height || 50}
                        onChange={(e) => updateTransformThrottled('height', parseInt(e.target.value) || 50)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      <Label htmlFor="angle">旋转角度: {Math.round(primarySelectedObject?.angle || 0)}°</Label>
                    </div>
                    <Slider
                      value={[primarySelectedObject?.angle || 0]}
                      onValueChange={([value]) => updateTransformThrottled('angle', value)}
                      max={360}
                      min={-360}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 层级控制 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <CardTitle className="text-base">层级控制</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLayerOperation('top')}
                    >
                      <Maximize className="w-4 h-4 mr-1" />
                      置顶
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLayerOperation('bottom')}
                    >
                      <Maximize className="w-4 h-4 mr-1 rotate-180" />
                      置底
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLayerOperation('up')}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      上移
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLayerOperation('down')}
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      下移
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 外观属性 */}
            <TabsContent value="appearance" className="space-y-4">
              {/* 可见性和透明度 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <CardTitle className="text-base">可见性</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visible">显示对象</Label>
                    <Switch
                      id="visible"
                      checked={primarySelectedObject?.visible !== false}
                      onCheckedChange={(checked) => updateFabricPropertyThrottled('visible', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opacity">
                      不透明度: {Math.round((primarySelectedObject?.opacity || 1) * 100)}%
                    </Label>
                    <Slider
                      value={[primarySelectedObject?.opacity || 1]}
                      onValueChange={([value]) => updateFabricPropertyThrottled('opacity', value)}
                      max={1}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 颜色和样式 */}
              {primarySelectedItem && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <CardTitle className="text-base">颜色和样式</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 背景色（适用于矩形等） */}
                    {(primarySelectedItem.type === ItemType.WEB_STREAM || 
                      primarySelectedObject?.type === 'rect') && (
                      <div className="space-y-2">
                        <Label htmlFor="backgroundColor">背景色</Label>
                        <div className="flex gap-2">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={primarySelectedItem.properties.backColor || '#FFFFFF'}
                            onChange={(e) => updateEditorProperty('backColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={primarySelectedItem.properties.backColor || '#FFFFFF'}
                            onChange={(e) => updateEditorProperty('backColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Alpha透明度（VSN特有） */}
                    {(primarySelectedItem.type === ItemType.IMAGE || 
                      primarySelectedItem.type === ItemType.VIDEO ||
                      primarySelectedItem.type === ItemType.GIF) && (
                      <div className="space-y-2">
                        <Label htmlFor="alpha">
                          Alpha值: {primarySelectedItem.properties.alpha ?? 1}
                        </Label>
                        <Slider
                          value={[primarySelectedItem.properties.alpha ?? 1]}
                          onValueChange={([value]) => updateEditorPropertyThrottled('alpha', value)}
                          max={1}
                          min={0}
                          step={0.01}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 内容属性 */}
            <TabsContent value="content" className="space-y-4">
              {/* 文本属性 */}
              {primarySelectedItem && [ItemType.SINGLE_LINE_TEXT, ItemType.MULTI_LINE_TEXT, ItemType.SINGLE_COLUMN_TEXT].includes(primarySelectedItem.type) && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      <CardTitle className="text-base">文本内容</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text">文本</Label>
                      {primarySelectedItem.type === ItemType.MULTI_LINE_TEXT ? (
                        <Textarea
                          id="text"
                          value={primarySelectedItem.properties.text || ''}
                          onChange={(e) => updateEditorPropertyThrottled('text', e.target.value)}
                          placeholder="输入文本内容..."
                          rows={3}
                        />
                      ) : (
                        <Input
                          id="text"
                          value={primarySelectedItem.properties.text || ''}
                          onChange={(e) => updateEditorPropertyThrottled('text', e.target.value)}
                          placeholder="输入文本内容..."
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="fontSize">字体大小</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          min="8"
                          max="200"
                          value={primarySelectedItem.properties.font?.size || 24}
                          onChange={(e) => updateEditorProperty('font', {
                            ...primarySelectedItem.properties.font,
                            size: parseInt(e.target.value) || 24
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fontWeight">字体粗细</Label>
                        <Select
                          value={primarySelectedItem.properties.font?.weight || 'normal'}
                          onValueChange={(value) => updateEditorProperty('font', {
                            ...primarySelectedItem.properties.font,
                            weight: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHT_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">字体</Label>
                      <Select
                        value={primarySelectedItem.properties.font?.family || 'Arial'}
                        onValueChange={(value) => updateEditorProperty('font', {
                          ...primarySelectedItem.properties.font,
                          family: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">文字颜色</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={primarySelectedItem.properties.textColor || '#000000'}
                          onChange={(e) => updateEditorProperty('textColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={primarySelectedItem.properties.textColor || '#000000'}
                          onChange={(e) => updateEditorProperty('textColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="textAlign">对齐方式</Label>
                        <Select
                          value={(primarySelectedItem.properties.textAlign || 0).toString()}
                          onValueChange={(value) => updateEditorProperty('textAlign', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEXT_ALIGN_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="letterSpacing">字符间距</Label>
                        <Input
                          id="letterSpacing"
                          type="number"
                          step="0.1"
                          value={primarySelectedItem.properties.letterSpacing || 0}
                          onChange={(e) => updateEditorProperty('letterSpacing', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="italic">斜体</Label>
                      <Switch
                        id="italic"
                        checked={primarySelectedItem.properties.font?.italic || false}
                        onCheckedChange={(checked) => updateEditorProperty('font', {
                          ...primarySelectedItem.properties.font,
                          italic: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="underline">下划线</Label>
                      <Switch
                        id="underline"
                        checked={primarySelectedItem.properties.font?.underline || false}
                        onCheckedChange={(checked) => updateEditorProperty('font', {
                          ...primarySelectedItem.properties.font,
                          underline: checked
                        })}
                      />
                    </div>

                    {/* 滚动文本属性 */}
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isScroll">启用滚动</Label>
                        <Switch
                          id="isScroll"
                          checked={primarySelectedItem.properties.isScroll || false}
                          onCheckedChange={(checked) => updateEditorProperty('isScroll', checked)}
                        />
                      </div>

                      {primarySelectedItem.properties.isScroll && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="scrollSpeed">滚动速度</Label>
                            <Input
                              id="scrollSpeed"
                              type="number"
                              min="1"
                              max="100"
                              value={primarySelectedItem.properties.scrollSpeed || 5}
                              onChange={(e) => updateEditorProperty('scrollSpeed', parseInt(e.target.value) || 5)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="isHeadConnectTail">首尾相接</Label>
                            <Switch
                              id="isHeadConnectTail"
                              checked={primarySelectedItem.properties.isHeadConnectTail || false}
                              onCheckedChange={(checked) => updateEditorProperty('isHeadConnectTail', checked)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="repeatCount">重复次数</Label>
                            <Input
                              id="repeatCount"
                              type="number"
                              min="1"
                              value={primarySelectedItem.properties.repeatCount || 1}
                              onChange={(e) => updateEditorProperty('repeatCount', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 结束内容页签 */}
            </TabsContent>

            {/* 关闭内层 Tabs */}
            </Tabs>

            {/* 网页/流媒体属性 */}
              {primarySelectedItem && primarySelectedItem.type === ItemType.WEB_STREAM && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <CardTitle className="text-base">网页设置</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">网址或流媒体地址</Label>
                      <Input
                        id="url"
                        type="url"
                        value={primarySelectedItem.properties.url || ''}
                        onChange={(e) => updateEditorPropertyThrottled('url', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="isLocal">本地文件</Label>
                      <Switch
                        id="isLocal"
                        checked={primarySelectedItem.properties.isLocal || false}
                        onCheckedChange={(checked) => updateEditorProperty('isLocal', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 播放设置 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <CardTitle className="text-base">播放设置</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">播放时长 (毫秒)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="100"
                      value={primarySelectedItem?.properties.duration || 5000}
                      onChange={(e) => updateEditorProperty('duration', parseInt(e.target.value) || 5000)}
                    />
                  </div>

                  {/* 视频特有属性 */}
                  {primarySelectedItem && [ItemType.VIDEO, ItemType.GIF].includes(primarySelectedItem.type) && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reserveAS">保留纵横比</Label>
                      <Switch
                        id="reserveAS"
                        checked={primarySelectedItem.properties.reserveAS || false}
                        onCheckedChange={(checked) => updateEditorProperty('reserveAS', checked)}
                      />
                    </div>
                  )}

                  {/* GIF特有属性 */}
                  {primarySelectedItem && primarySelectedItem.type === ItemType.GIF && (
                    <div className="space-y-2">
                      <Label htmlFor="playTimes">播放次数</Label>
                      <Input
                        id="playTimes"
                        type="number"
                        min="1"
                        value={primarySelectedItem.properties.playTimes || 1}
                        onChange={(e) => updateEditorProperty('playTimes', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 素材信息 */}
              {materialRef && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">素材信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">名称：</span>
                      {materialRef.name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">格式：</span>
                      {materialRef.format}
                    </div>
                    {materialRef.dimensions && (
                      <div className="text-sm">
                        <span className="font-medium">尺寸：</span>
                        {materialRef.dimensions.width} × {materialRef.dimensions.height}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">大小：</span>
                      {(materialRef.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
    </>
  );
  return panel;
}