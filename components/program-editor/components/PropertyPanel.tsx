'use client';

/**
 * 属性面板组件
 * 使用shadcn组件实现对象属性编辑功能
 */

import React, { useState, useEffect } from 'react';
import { Palette, Move3d, Eye, Lock, RotateCw, Maximize, AspectRatio, Monitor } from 'lucide-react';

// shadcn组件
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// 状态管理和类型
import { useEditorStore } from '../stores/editor-store';
import { EditorItem, EditorRegion, TextEditorItem, ClockEditorItem, WeatherEditorItem } from '../types/program-editor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PropertyPanelProps {
  selectedItems: string[];
  selectedRegions: string[];
  className?: string;
}

/**
 * 颜色选择器组件
 */
function ColorPicker({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value?: string; 
  onChange: (color: string) => void; 
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-sm">{label}</Label>
      <div className="col-span-3 flex items-center gap-2">
        <Input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-16 p-1 border rounded"
        />
        <Input
          type="text"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-8 flex-1 text-xs"
        />
      </div>
    </div>
  );
}

/**
 * 数值输入组件
 */
function NumberInput({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void; 
  min?: number; 
  max?: number; 
  step?: number; 
  unit?: string; 
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-sm">{label}</Label>
      <div className="col-span-3 flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="h-8 flex-1"
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * 文本属性编辑器
 */
function TextProperties({ 
  item, 
  onUpdate 
}: { 
  item: TextEditorItem; 
  onUpdate: (updates: Partial<TextEditorItem>) => void; 
}) {
  return (
    <div className="space-y-4">
      {/* 文本内容 */}
      <div className="grid gap-2">
        <Label className="text-sm">文本内容</Label>
        <Textarea
          value={item.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="输入文本内容"
          className="min-h-[80px]"
        />
      </div>

      {/* 字体设置 */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="font">
          <AccordionTrigger className="text-sm">字体设置</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <NumberInput
              label="字号"
              value={item.fontSize}
              onChange={(fontSize) => onUpdate({ fontSize })}
              min={8}
              max={200}
              unit="px"
            />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">字体</Label>
              <div className="col-span-3">
                <Select
                  value={item.fontFamily}
                  onValueChange={(fontFamily) => onUpdate({ fontFamily })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="微软雅黑">微软雅黑</SelectItem>
                    <SelectItem value="SimHei">黑体</SelectItem>
                    <SelectItem value="SimSun">宋体</SelectItem>
                    <SelectItem value="KaiTi">楷体</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">粗细</Label>
              <div className="col-span-3">
                <Select
                  value={item.fontWeight}
                  onValueChange={(fontWeight) => onUpdate({ fontWeight: fontWeight as 'normal' | 'bold' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">正常</SelectItem>
                    <SelectItem value="bold">粗体</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">对齐</Label>
              <div className="col-span-3">
                <Select
                  value={item.textAlign}
                  onValueChange={(textAlign) => onUpdate({ textAlign: textAlign as 'left' | 'center' | 'right' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">左对齐</SelectItem>
                    <SelectItem value="center">居中</SelectItem>
                    <SelectItem value="right">右对齐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ColorPicker
              label="颜色"
              value={item.color.value}
              onChange={(value) => onUpdate({ color: { value } })}
            />

            {item.backgroundColor && (
              <ColorPicker
                label="背景色"
                value={item.backgroundColor.value}
                onChange={(value) => onUpdate({ backgroundColor: { value } })}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/**
 * 时钟属性编辑器
 */
function ClockProperties({ 
  item, 
  onUpdate 
}: { 
  item: ClockEditorItem; 
  onUpdate: (updates: Partial<ClockEditorItem>) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right text-sm">类型</Label>
        <div className="col-span-3">
          <Select
            value={item.clockType}
            onValueChange={(clockType) => onUpdate({ clockType: clockType as 'digital' | 'analog' })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital">数字时钟</SelectItem>
              <SelectItem value="analog">模拟时钟</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right text-sm">格式</Label>
        <div className="col-span-3">
          <Select
            value={item.timeFormat}
            onValueChange={(timeFormat) => onUpdate({ timeFormat: timeFormat as '12h' | '24h' })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12小时制</SelectItem>
              <SelectItem value="24h">24小时制</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right text-sm">显示日期</Label>
        <div className="col-span-3">
          <Switch
            checked={item.showDate}
            onCheckedChange={(showDate) => onUpdate({ showDate })}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right text-sm">显示秒</Label>
        <div className="col-span-3">
          <Switch
            checked={item.showSeconds}
            onCheckedChange={(showSeconds) => onUpdate({ showSeconds })}
          />
        </div>
      </div>

      {item.fontSize && (
        <NumberInput
          label="字号"
          value={item.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={200}
          unit="px"
        />
      )}

      {item.color && (
        <ColorPicker
          label="颜色"
          value={item.color.value}
          onChange={(value) => onUpdate({ color: { value } })}
        />
      )}
    </div>
  );
}

/**
 * 通用属性编辑器
 */
function CommonProperties({ 
  items, 
  onUpdate 
}: { 
  items: EditorItem[]; 
  onUpdate: (updates: Partial<EditorItem>) => void; 
}) {
  if (items.length === 0) return null;

  const firstItem = items[0];
  const allSameType = items.every(item => item.type === firstItem.type);
  const { program } = useEditorStore();

  // 快捷功能：适应屏幕
  const handleFitToScreen = () => {
    onUpdate({
      position: { x: 0, y: 0 },
      dimensions: { width: program.width, height: program.height },
      preserveAspectRatio: false,
    });
  };

  // 快捷功能：保持比例适应屏幕
  const handleFitToScreenKeepRatio = () => {
    if (!firstItem.materialRef?.dimensions) return;
    
    const { width: originalW, height: originalH } = firstItem.materialRef.dimensions;
    const { width: screenW, height: screenH } = program;
    
    const scaleX = screenW / originalW;
    const scaleY = screenH / originalH;
    const scale = Math.min(scaleX, scaleY);
    
    const newW = Math.round(originalW * scale);
    const newH = Math.round(originalH * scale);
    
    onUpdate({
      position: { 
        x: Math.round((screenW - newW) / 2), 
        y: Math.round((screenH - newH) / 2) 
      },
      dimensions: { width: newW, height: newH },
      preserveAspectRatio: true,
    });
  };

  // 快捷功能：居中对齐
  const handleCenter = () => {
    const centerX = Math.round((program.width - firstItem.dimensions.width) / 2);
    const centerY = Math.round((program.height - firstItem.dimensions.height) / 2);
    onUpdate({
      position: { x: centerX, y: centerY },
    });
  };

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="grid gap-2">
        <Label className="text-sm">名称</Label>
        <Input
          value={firstItem.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="对象名称"
          className="h-8"
        />
      </div>

      {/* 位置和尺寸 */}
      <Accordion type="single" collapsible defaultValue="transform" className="w-full">
        <AccordionItem value="transform">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Move3d className="h-4 w-4" />
              变换
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="X"
                value={firstItem.position.x}
                onChange={(x) => onUpdate({ position: { ...firstItem.position, x } })}
                min={0}
                unit="px"
              />
              <NumberInput
                label="Y"
                value={firstItem.position.y}
                onChange={(y) => onUpdate({ position: { ...firstItem.position, y } })}
                min={0}
                unit="px"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="宽度"
                value={firstItem.dimensions.width}
                onChange={(width) => onUpdate({ dimensions: { ...firstItem.dimensions, width } })}
                min={1}
                unit="px"
              />
              <NumberInput
                label="高度"
                value={firstItem.dimensions.height}
                onChange={(height) => onUpdate({ dimensions: { ...firstItem.dimensions, height } })}
                min={1}
                unit="px"
              />
            </div>

            {/* 比例锁定 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">锁定比例</Label>
              <div className="col-span-3">
                <Switch
                  checked={!!firstItem.preserveAspectRatio}
                  onCheckedChange={(preserveAspectRatio) => onUpdate({ preserveAspectRatio })}
                />
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">快捷操作</Label>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFitToScreen}
                        className="h-8 px-2 text-xs"
                      >
                        <Maximize className="h-3 w-3 mr-1" />
                        填充屏幕
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      拉伸至屏幕大小，不保持比例
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {firstItem.materialRef?.dimensions && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFitToScreenKeepRatio}
                          className="h-8 px-2 text-xs"
                        >
                          <AspectRatio className="h-3 w-3 mr-1" />
                          适应屏幕
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        保持比例适应屏幕并居中
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCenter}
                        className="h-8 px-2 text-xs"
                      >
                        <Move3d className="h-3 w-3 mr-1" />
                        居中
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      将对象移到屏幕中心
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {firstItem.rotation !== undefined && (
              <NumberInput
                label="旋转"
                value={firstItem.rotation}
                onChange={(rotation) => onUpdate({ rotation })}
                min={-360}
                max={360}
                unit="°"
              />
            )}

            {firstItem.opacity !== undefined && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm">不透明度</Label>
                <div className="col-span-3">
                  <Slider
                    value={[firstItem.opacity * 100]}
                    onValueChange={([value]) => onUpdate({ opacity: value / 100 })}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 显示状态 */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="display">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              显示
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">可见</Label>
              <div className="col-span-3">
                <Switch
                  checked={firstItem.visible}
                  onCheckedChange={(visible) => onUpdate({ visible })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">锁定</Label>
              <div className="col-span-3">
                <Switch
                  checked={firstItem.locked}
                  onCheckedChange={(locked) => onUpdate({ locked })}
                />
              </div>
            </div>

            <NumberInput
              label="层级"
              value={firstItem.zIndex}
              onChange={(zIndex) => onUpdate({ zIndex })}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/**
 * 属性面板主组件
 */
export function PropertyPanel({ 
  selectedItems, 
  selectedRegions, 
  className 
}: PropertyPanelProps) {
  const { findItem, findRegion, updateItem, updateRegion } = useEditorStore();

  // 获取选中的项目和区域对象
  const items = selectedItems.map(id => findItem(id)).filter(Boolean).map(info => info!.item);
  const regions = selectedRegions.map(id => findRegion(id)).filter(Boolean).map(info => info!.region);

  // 处理项目属性更新
  const handleItemUpdate = (updates: Partial<EditorItem>) => {
    selectedItems.forEach(itemId => {
      const itemInfo = findItem(itemId);
      if (itemInfo) {
        updateItem(itemInfo.pageIndex, itemInfo.regionId, itemId, updates);
      }
    });
  };

  // 处理区域属性更新
  const handleRegionUpdate = (updates: Partial<EditorRegion>) => {
    selectedRegions.forEach(regionId => {
      const regionInfo = findRegion(regionId);
      if (regionInfo) {
        updateRegion(regionInfo.pageIndex, regionId, updates);
      }
    });
  };

  // 没有选择任何对象
  if (items.length === 0 && regions.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-6">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm">选择对象查看属性</p>
          <p className="text-xs mt-1">点击画布中的元素或区域</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="p-4 space-y-4">
        {/* 选择状态显示 */}
        <div className="flex items-center gap-2 mb-4">
          {items.length > 0 && (
            <Badge variant="default">
              {items.length} 个项目
            </Badge>
          )}
          {regions.length > 0 && (
            <Badge variant="outline">
              {regions.length} 个区域
            </Badge>
          )}
        </div>

        {/* 项目属性 */}
        {items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">项目属性</CardTitle>
              {items.length === 1 && (
                <CardDescription className="text-xs">
                  类型: {items[0].type === 4 ? '单行文本' : 
                         items[0].type === 5 ? '多行文本' :
                         items[0].type === 9 ? '时钟' :
                         items[0].type === 14 ? '天气' :
                         items[0].type === 2 ? '图片' :
                         items[0].type === 3 ? '视频' : 
                         '未知'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 通用属性 */}
              <CommonProperties items={items} onUpdate={handleItemUpdate} />

              {/* 特定类型属性 */}
              {items.length === 1 && (
                <>
                  {(items[0].type === 4 || items[0].type === 5) && (
                    <>
                      <Separator />
                      <TextProperties 
                        item={items[0] as TextEditorItem} 
                        onUpdate={handleItemUpdate} 
                      />
                    </>
                  )}

                  {(items[0].type === 9 || items[0].type === 16) && (
                    <>
                      <Separator />
                      <ClockProperties 
                        item={items[0] as ClockEditorItem} 
                        onUpdate={handleItemUpdate} 
                      />
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 区域属性 */}
        {regions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">区域属性</CardTitle>
              <CardDescription className="text-xs">
                显示区域设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {regions.length === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-sm">区域名称</Label>
                    <Input
                      value={regions[0].name}
                      onChange={(e) => handleRegionUpdate({ name: e.target.value })}
                      placeholder="区域名称"
                      className="h-8"
                    />
                  </div>

                  <Accordion type="single" collapsible defaultValue="bounds" className="w-full">
                    <AccordionItem value="bounds">
                      <AccordionTrigger className="text-sm">位置和尺寸</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <NumberInput
                            label="X"
                            value={regions[0].bounds.x}
                            onChange={(x) => handleRegionUpdate({ 
                              bounds: { ...regions[0].bounds, x } 
                            })}
                            min={0}
                            unit="px"
                          />
                          <NumberInput
                            label="Y"
                            value={regions[0].bounds.y}
                            onChange={(y) => handleRegionUpdate({ 
                              bounds: { ...regions[0].bounds, y } 
                            })}
                            min={0}
                            unit="px"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <NumberInput
                            label="宽度"
                            value={regions[0].bounds.width}
                            onChange={(width) => handleRegionUpdate({ 
                              bounds: { ...regions[0].bounds, width } 
                            })}
                            min={1}
                            unit="px"
                          />
                          <NumberInput
                            label="高度"
                            value={regions[0].bounds.height}
                            onChange={(height) => handleRegionUpdate({ 
                              bounds: { ...regions[0].bounds, height } 
                            })}
                            min={1}
                            unit="px"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="appearance">
                      <AccordionTrigger className="text-sm">外观</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <NumberInput
                          label="边框宽度"
                          value={regions[0].borderWidth}
                          onChange={(borderWidth) => handleRegionUpdate({ borderWidth })}
                          min={0}
                          unit="px"
                        />

                        <ColorPicker
                          label="边框颜色"
                          value={regions[0].borderColor.value}
                          onChange={(value) => handleRegionUpdate({ 
                            borderColor: { value } 
                          })}
                        />

                        {regions[0].backgroundColor && (
                          <ColorPicker
                            label="背景颜色"
                            value={regions[0].backgroundColor.value}
                            onChange={(value) => handleRegionUpdate({ 
                              backgroundColor: { value } 
                            })}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}