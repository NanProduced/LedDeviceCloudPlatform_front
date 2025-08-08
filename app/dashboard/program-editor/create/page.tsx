'use client';

import React, { useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ProgramCanvas } from '@/components/program-editor/ProgramCanvas';
import { CanvasToolbar } from '@/components/program-editor/CanvasToolbar';
import { MaterialLibraryPanel } from '@/components/program-editor/panels/MaterialLibraryPanel';
import { PropertyPanel } from '@/components/program-editor/panels/PropertyPanel';
import { LayerPanel } from '@/components/program-editor/panels/LayerPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageBar } from '@/components/program-editor/PageBar';
import { useEditorStore } from '@/components/program-editor/managers/editor-state-manager';

/**
 * 创建新节目页面
 */
export default function CreateProgramPage() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const { pages, currentPageIndex, addRegion, program } = useEditorStore();

  // 画布准备就绪回调
  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
    console.log('Canvas ready:', fabricCanvas);
  }, []);

  // 选择变更回调
  const handleSelectionChange = useCallback((objects: fabric.Object[]) => {
    setSelectedObjects(objects);
    console.log('Selection changed:', objects);
  }, []);

  // 工具选择回调
  const handleToolSelect = useCallback((tool: string) => {
    setActiveTool(tool);
    console.log('Tool selected:', tool);
    
    if (canvas) {
      // 根据工具类型设置画布模式
      switch (tool) {
        case 'select':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'default';
          break;
        case 'pan':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'grab';
          break;
        default:
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'crosshair';
          break;
      }
    }
  }, [canvas]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    // TODO: 实现撤销逻辑
    console.log('Undo');
  }, []);

  // 重做操作
  const handleRedo = useCallback(() => {
    // TODO: 实现重做逻辑
    console.log('Redo');
  }, []);

  // 缩放操作
  const handleZoomIn = useCallback(() => {
    if (canvas) {
      const zoom = canvas.getZoom();
      canvas.setZoom(Math.min(zoom * 1.2, 5));
    }
  }, [canvas]);

  const handleZoomOut = useCallback(() => {
    if (canvas) {
      const zoom = canvas.getZoom();
      canvas.setZoom(Math.max(zoom * 0.8, 0.1));
    }
  }, [canvas]);

  const handleResetZoom = useCallback(() => {
    if (canvas) {
      canvas.setZoom(1);
      canvas.absolutePan({ x: 0, y: 0 });
    }
  }, [canvas]);

  // 删除选中对象
  const handleDelete = useCallback(() => {
    if (canvas && selectedObjects.length > 0) {
      selectedObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [canvas, selectedObjects]);

  // 复制选中对象
  const handleCopy = useCallback(() => {
    if (canvas && selectedObjects.length > 0) {
      // TODO: 实现复制逻辑
      console.log('Copy objects:', selectedObjects);
    }
  }, [canvas, selectedObjects]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部标题栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">创建新节目</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              选中对象: {selectedObjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* 顶部：页签 + 工具栏 */}
      <div className="border-b">
        <PageBar className="rounded-none" />
      </div>
      {/* 工具栏 */}
      <CanvasToolbar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        canUndo={false}
        canRedo={false}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onAddRegion={() => {
          const page = pages[currentPageIndex];
          if (!page) return;
          const hasRegion = page.regions && page.regions.length > 0;
          const canvasW = program?.width || 1920;
          const canvasH = program?.height || 1080;
          const rect = hasRegion
            ? { // 居中半屏默认
                x: Math.floor(canvasW * 0.25),
                y: Math.floor(canvasH * 0.25),
                width: Math.floor(canvasW * 0.5),
                height: Math.floor(canvasH * 0.5),
                borderWidth: 0,
              }
            : { // 全屏
                x: 0,
                y: 0,
                width: canvasW,
                height: canvasH,
                borderWidth: 0,
              };
          addRegion(page.id, { name: hasRegion ? `区域${page.regions.length + 1}` : '主区域', rect });
        }}
      />
      
      {/* 主要内容区域 - 三栏式布局 */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* 左侧面板 - 素材库 */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <MaterialLibraryPanel className="h-full border-r" />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* 中间面板 - 画布区域 */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              <ProgramCanvas
                width={1920}
                height={1080}
                onCanvasReady={handleCanvasReady}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* 右侧面板 - 属性和图层 */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-l">
              <Tabs defaultValue="properties" className="h-full flex flex-col">
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="properties">属性</TabsTrigger>
                    <TabsTrigger value="layers">图层</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="properties" className="flex-1 mt-0">
                  <PropertyPanel 
                    className="h-full" 
                    selectedObjects={selectedObjects}
                  />
                </TabsContent>
                
                <TabsContent value="layers" className="flex-1 mt-0">
                  <LayerPanel 
                    className="h-full"
                    selectedObjects={selectedObjects.map(obj => obj.id || 'unknown')}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}