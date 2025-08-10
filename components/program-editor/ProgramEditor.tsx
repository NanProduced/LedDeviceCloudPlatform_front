'use client';

/**
 * 重新设计的节目编辑器主界面
 * 使用shadcn组件确保UI一致性，简化架构专注于LED显示屏内容编辑
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Save, Settings, Layers, Image, Type, Clock, Cloud, Monitor } from 'lucide-react';

// shadcn组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// 新的状态管理和类型
import { useEditorStore } from './stores/editor-store';
import { EditorTool, VSNItemType } from './types/program-editor';

// 子组件
import { MaterialLibrary } from './components/MaterialLibrary';
import { EditorCanvas } from './components/EditorCanvas';
import { PropertyPanel } from './components/PropertyPanel';
import { LayerPanel } from './components/LayerPanel';
import { PageTabs } from './components/PageTabs';
import { EditorToolbar } from './components/EditorToolbar';

interface ProgramEditorProps {
  programId?: string;
  className?: string;
}

/**
 * 节目编辑器主组件
 * 实现三栏布局：左侧素材库 + 中间画布 + 右侧属性面板
 */
export function ProgramEditor({ programId, className }: ProgramEditorProps) {
  // 状态管理
  const {
    program,
    pages,
    currentPageIndex,
    selectedItems,
    selectedRegions,
    isDirty,
    isPreviewMode,
    zoomLevel,
    setProgram,
    setPreviewMode,
    markClean,
  } = useEditorStore();

  // 本地状态
  const [currentTool, setCurrentTool] = useState<EditorTool>('select');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // ESC 取消选择
      if (e.key === 'Escape') {
        useEditorStore.getState().setSelectedItems([]);
        useEditorStore.getState().setSelectedRegions([]);
      }

      // Space 切换预览模式
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPreviewMode(!isPreviewMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, setPreviewMode]);

  // 保存处理
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // TODO: 实现保存逻辑
      // - 验证VSN格式
      // - 调用API保存
      // - 更新状态
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟保存
      markClean();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [markClean]);

  // 工具选择处理
  const handleToolSelect = useCallback((tool: EditorTool) => {
    setCurrentTool(tool);
    // TODO: 根据工具类型设置画布状态
  }, []);

  // 添加素材到画布
  const handleAddMaterial = useCallback((materialId: string, materialType: VSNItemType) => {
    // TODO: 实现素材添加逻辑
    console.log('添加素材:', materialId, materialType);
  }, []);

  return (
    <TooltipProvider>
      <div className={`h-screen flex flex-col bg-background ${className}`}>
        {/* 顶部工具栏 */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            {/* 节目信息 */}
            <div className="flex items-center gap-3">
              <div className="grid gap-1">
                <Input
                  value={program.name}
                  onChange={(e) => setProgram({ name: e.target.value })}
                  className="h-9 text-base font-medium"
                  placeholder="节目名称"
                />
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="h-6 px-2 gap-1">
                    <Monitor className="h-3.5 w-3.5" />
                    {program.width} × {program.height}
                  </Badge>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant="outline" className="h-6 px-2">
                    第 {currentPageIndex + 1} / {pages.length} 页
                  </Badge>
                  {isDirty && <Badge variant="secondary" className="h-6 px-2">未保存</Badge>}
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* 主要操作按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!isPreviewMode)}
              >
                <Play className="h-4 w-4 mr-1" />
                {isPreviewMode ? '退出预览' : '预览'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>

            <div className="flex-1" />

            {/* 面板切换按钮 */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  >
                    {leftPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {leftPanelOpen ? '隐藏素材库' : '显示素材库'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  >
                    {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {rightPanelOpen ? '隐藏属性面板' : '显示属性面板'}
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Badge variant="outline" className="text-xs">
                {Math.round(zoomLevel * 100)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* 页面标签栏 */}
        <PageTabs />

        {/* 工具栏 */}
        <EditorToolbar
          currentTool={currentTool}
          onToolSelect={handleToolSelect}
          disabled={isPreviewMode}
        />

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* 左侧素材库 */}
            {leftPanelOpen && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <Card className="h-full rounded-none border-0 border-r">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">素材库</CardTitle>
                      <CardDescription className="text-xs">
                        拖拽素材到画布中使用
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <MaterialLibrary onAddMaterial={handleAddMaterial} />
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* 中间画布区域 */}
            <ResizablePanel defaultSize={leftPanelOpen && rightPanelOpen ? 60 : 80}>
              <div className="h-full flex flex-col">
                <EditorCanvas
                  tool={currentTool}
                  isPreviewMode={isPreviewMode}
                  className="flex-1"
                />
              </div>
            </ResizablePanel>

            {/* 右侧属性面板 */}
            {rightPanelOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <Card className="h-full rounded-none border-0 border-l">
                    <div className="h-full">
                      <Tabs defaultValue="properties" className="h-full flex flex-col">
                        <CardHeader className="pb-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="properties" className="text-xs">
                              <Settings className="h-3 w-3 mr-1" />
                              属性
                            </TabsTrigger>
                            <TabsTrigger value="layers" className="text-xs">
                              <Layers className="h-3 w-3 mr-1" />
                              图层
                            </TabsTrigger>
                          </TabsList>
                        </CardHeader>

                        <div className="flex-1 min-h-0">
                          <TabsContent value="properties" className="h-full mt-0">
                            <PropertyPanel
                              selectedItems={selectedItems}
                              selectedRegions={selectedRegions}
                            />
                          </TabsContent>

                          <TabsContent value="layers" className="h-full mt-0">
                            <LayerPanel />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </Card>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        {/* 底部状态栏 */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>当前页面: {currentPageIndex + 1} / {pages.length}</span>
              <span>
                素材列表: ({pages.reduce((total, page) => 
                  total + page.regions.reduce((pageTotal, region) => pageTotal + region.items.length, 0), 0
                )})
              </span>
              <span>选中项目: {selectedItems.length}</span>
              <span>选中区域: {selectedRegions.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>分辨率: {program?.width || 1920} × {program?.height || 1080}</span>
              <span>工具: {currentTool}</span>
              <span>缩放: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}