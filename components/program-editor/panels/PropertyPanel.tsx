'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Clock
} from 'lucide-react';

interface PropertyPanelProps {
  className?: string;
  selectedObjects?: any[]; // Fabric.js 对象数组
}

// 模拟选中的对象数据
const MOCK_SELECTED_OBJECT = {
  id: 'obj_1',
  type: 'text',
  name: '文本对象',
  properties: {
    left: 100,
    top: 50,
    width: 200,
    height: 40,
    angle: 0,
    opacity: 1,
    visible: true,
    // 文本特有属性
    text: '示例文本',
    fontSize: 24,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    textColor: '#000000',
    textAlign: 'left',
    // 素材属性
    materialId: null,
    duration: 5000,
    zIndex: 1
  }
};

export function PropertyPanel({ className, selectedObjects = [] }: PropertyPanelProps) {
  const [selectedObject, setSelectedObject] = React.useState(MOCK_SELECTED_OBJECT);
  const hasSelection = selectedObjects.length > 0 || true; // 临时用true显示内容

  // 更新对象属性
  const updateProperty = (key: string, value: any) => {
    setSelectedObject(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [key]: value
      }
    }));
  };

  if (!hasSelection) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">属性面板</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>请选择一个对象</p>
            <p className="text-sm mt-1">选中画布中的对象来编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">属性面板</h2>
          <Badge variant="secondary">{selectedObjects.length || 1} 个对象</Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {selectedObject.name}
        </p>
      </div>

      {/* 属性编辑区域 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform">变换</TabsTrigger>
              <TabsTrigger value="appearance">外观</TabsTrigger>
              <TabsTrigger value="content">内容</TabsTrigger>
            </TabsList>

            {/* 变换属性 */}
            <TabsContent value="transform" className="space-y-4">
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
                        value={selectedObject.properties.left}
                        onChange={(e) => updateProperty('left', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="top">Y 坐标</Label>
                      <Input
                        id="top"
                        type="number"
                        value={selectedObject.properties.top}
                        onChange={(e) => updateProperty('top', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="width">宽度</Label>
                      <Input
                        id="width"
                        type="number"
                        value={selectedObject.properties.width}
                        onChange={(e) => updateProperty('width', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">高度</Label>
                      <Input
                        id="height"
                        type="number"
                        value={selectedObject.properties.height}
                        onChange={(e) => updateProperty('height', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      <Label htmlFor="angle">旋转角度: {selectedObject.properties.angle}°</Label>
                    </div>
                    <Slider
                      value={[selectedObject.properties.angle]}
                      onValueChange={([value]) => updateProperty('angle', value)}
                      max={360}
                      min={-360}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 外观属性 */}
            <TabsContent value="appearance" className="space-y-4">
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
                      checked={selectedObject.properties.visible}
                      onCheckedChange={(checked) => updateProperty('visible', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opacity">不透明度: {Math.round(selectedObject.properties.opacity * 100)}%</Label>
                    <Slider
                      value={[selectedObject.properties.opacity]}
                      onValueChange={([value]) => updateProperty('opacity', value)}
                      max={1}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <CardTitle className="text-base">层级</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zIndex">Z-Index</Label>
                    <Input
                      id="zIndex"
                      type="number"
                      value={selectedObject.properties.zIndex}
                      onChange={(e) => updateProperty('zIndex', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      置顶
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      置底
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 内容属性 */}
            <TabsContent value="content" className="space-y-4">
              {selectedObject.type === 'text' && (
                <>
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
                        <Input
                          id="text"
                          value={selectedObject.properties.text}
                          onChange={(e) => updateProperty('text', e.target.value)}
                          placeholder="输入文本内容..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fontSize">字体大小</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          value={selectedObject.properties.fontSize}
                          onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">字体</Label>
                        <Select
                          value={selectedObject.properties.fontFamily}
                          onValueChange={(value) => updateProperty('fontFamily', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Microsoft YaHei">微软雅黑</SelectItem>
                            <SelectItem value="SimHei">黑体</SelectItem>
                            <SelectItem value="SimSun">宋体</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="textColor">文字颜色</Label>
                        <div className="flex gap-2">
                          <Input
                            id="textColor"
                            type="color"
                            value={selectedObject.properties.textColor}
                            onChange={(e) => updateProperty('textColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={selectedObject.properties.textColor}
                            onChange={(e) => updateProperty('textColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="textAlign">对齐方式</Label>
                        <Select
                          value={selectedObject.properties.textAlign}
                          onValueChange={(value) => updateProperty('textAlign', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">左对齐</SelectItem>
                            <SelectItem value="center">居中</SelectItem>
                            <SelectItem value="right">右对齐</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

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
                      value={selectedObject.properties.duration}
                      onChange={(e) => updateProperty('duration', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}