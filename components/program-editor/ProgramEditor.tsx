'use client';

/**
 * 重新设计的节目编辑器主界面
 * 使用shadcn组件确保UI一致性，简化架构专注于LED显示屏内容编辑
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Save, Settings, Layers, Image, Type, Clock, Cloud, Monitor } from 'lucide-react';

// API导入
import { ProgramAPI, CreateProgramRequest, UpdateProgramRequest } from '@/lib/api/program';
import { VSNConverter } from './converters/vsn-converter';

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
import { MediaStrip } from './components/MediaStrip';
import { TopSummary } from './components/TopSummary';

// 轻量媒体列表（当前页第一个区域）
function PageMediaList() {
  const { pages, currentPageIndex, reorderItems, updateItem } = useEditorStore();
  const page = pages[currentPageIndex];
  const region = page?.regions?.[0];
  if (!region) {
    return <div className="text-xs text-muted-foreground">暂无区域，拖入任意素材将自动创建全屏区域</div>;
  }
  const items = region.items;

  const onReorder = (from: number, to: number) => {
    if (from === to) return;
    const order = items.map(i => i.id);
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    reorderItems(currentPageIndex, region.id, order);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-xs text-muted-foreground">将素材拖拽到画布或下方素材库添加</div>
      )}
      {items.map((it, idx) => (
        <div key={it.id} className="flex items-center gap-2">
          <div className="w-5 text-xs text-muted-foreground">{idx + 1}</div>
          <div className="flex-1 truncate text-sm">{it.name}</div>
          {/* 时长（ms）仅对图片/网页等有效，这里直接暴露一个输入框 */}
          <input
            className="h-7 w-24 border rounded px-2 text-xs"
            type="number"
            min={500}
            value={(it as any).duration ?? (it as any).playDuration?.milliseconds ?? ''}
            placeholder="时长(ms)"
            onChange={(e) => {
              const v = parseInt(e.target.value || '0', 10);
              updateItem(currentPageIndex, region.id, it.id, { duration: isNaN(v) ? undefined : v });
            }}
          />
          {/* 简易上/下移动 */}
          <button className="h-7 px-2 text-xs border rounded" onClick={() => onReorder(idx, Math.max(0, idx - 1))}>上移</button>
          <button className="h-7 px-2 text-xs border rounded" onClick={() => onReorder(idx, Math.min(items.length - 1, idx + 1))}>下移</button>
        </div>
      ))}
    </div>
  );
}

// 仅显示当前条目开关
function OnlyActiveToggle() {
  const { showOnlyActiveItem, setShowOnlyActiveItem } = useEditorStore();
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={!!showOnlyActiveItem}
        onChange={(e) => setShowOnlyActiveItem(e.target.checked)}
      />
      仅显示当前条目
    </label>
  );
}

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
      
      // 获取当前编辑器状态
      const { 
        program: programInfo, 
        pages, 
        getCurrentPage,
        validate 
      } = useEditorStore.getState();
      
      // 构建EditorState用于转换
      const editorState = {
        program: programInfo,
        pages,
        currentPageIndex,
        selectedItems,
        selectedRegions,
        clipboard: [],
        history: [],
        historyIndex: -1,
        isDirty,
        isPreviewMode,
        zoomLevel,
      };

      // 转换为VSN格式
      const conversionResult = VSNConverter.convertToVSN(editorState);
      
      if (!conversionResult.validation.isValid) {
        console.error('VSN验证失败:', conversionResult.validation.errors);
        throw new Error(`节目数据验证失败: ${conversionResult.validation.errors[0]?.message || '未知错误'}`);
      }

      // 准备保存数据
      const contentData = JSON.stringify(editorState);
      const vsnData = JSON.stringify([conversionResult.vsnData]);
      
      if (programId) {
        // 更新现有节目
        const updateRequest: UpdateProgramRequest = {
          name: programInfo.name,
          description: programInfo.description,
          width: programInfo.width,
          height: programInfo.height,
          duration: pages.reduce((total, page) => total + (page.duration?.milliseconds || 0), 0),
          status: 'draft', // 保存为草稿
          vsnData,
          contentData,
        };
        
        await ProgramAPI.updateProgram(programId, updateRequest);
      } else {
        // 创建新节目
        const createRequest: CreateProgramRequest = {
          name: programInfo.name || '未命名节目',
          description: programInfo.description || '',
          width: programInfo.width,
          height: programInfo.height,
          duration: pages.reduce((total, page) => total + (page.duration?.milliseconds || 0), 0),
          status: 'draft',
          vsnData,
          contentData,
        };
        
        const result = await ProgramAPI.createProgram(createRequest);
        
        // 更新程序ID到store中
        if (result.programId) {
          useEditorStore.getState().setProgram({ id: result.programId });
        }
      }
      
      markClean();
      console.log('节目保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      // TODO: 显示用户友好的错误提示
    } finally {
      setIsSaving(false);
    }
  }, [programId, currentPageIndex, selectedItems, selectedRegions, isDirty, isPreviewMode, zoomLevel, markClean]);

  // 创建节目（替代提交审核：后端自动进入审核流程）
  const handleCreateProgram = useCallback(async () => {
    try {
      setIsSaving(true);
      const { program: programInfo, pages } = useEditorStore.getState();
      const editorState = {
        program: programInfo,
        pages,
        currentPageIndex,
        selectedItems,
        selectedRegions,
        clipboard: [],
        history: [],
        historyIndex: -1,
        isDirty,
        isPreviewMode,
        zoomLevel,
      };
      const conversionResult = VSNConverter.convertToVSN(editorState);
      if (!conversionResult.validation.isValid) {
        throw new Error(`节目数据验证失败: ${conversionResult.validation.errors[0]?.message || '未知错误'}`);
      }
      const contentData = JSON.stringify(editorState);
          const vsnData = JSON.stringify([conversionResult.vsnData]);
      const createRequest: CreateProgramRequest = {
        name: programInfo.name || '未命名节目',
        description: programInfo.description || '',
        width: programInfo.width,
        height: programInfo.height,
        duration: pages.reduce((total, page) => total + (page.duration?.milliseconds || 0), 0),
        vsnData,
        contentData,
      };
      const result = await ProgramAPI.createProgram(createRequest);
      if (result.programId) {
        useEditorStore.getState().setProgram({ id: result.programId });
      }
      markClean();
      console.log('节目创建成功，已进入审核流程');
    } catch (error) {
      console.error('创建节目失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentPageIndex, selectedItems, selectedRegions, isDirty, isPreviewMode, zoomLevel, markClean]);

  // 另存为模板
  const handleSaveAsTemplate = useCallback(async () => {
    try {
      const { program: programInfo, pages } = useEditorStore.getState();
      // 构建当前编辑器数据，用于转换与保存
      const editorState = {
        program: programInfo,
        pages,
        currentPageIndex,
        selectedItems,
        selectedRegions,
        clipboard: [],
        history: [],
        historyIndex: -1,
        isDirty,
        isPreviewMode,
        zoomLevel,
      };

      const conversionResult = VSNConverter.convertToVSN(editorState);
      if (!conversionResult.validation.isValid) {
        throw new Error(`节目数据验证失败: ${conversionResult.validation.errors[0]?.message || '未知错误'}`);
      }

      const contentData = JSON.stringify(editorState);
      const vsnData = JSON.stringify([conversionResult.vsnData]);
      await ProgramAPI.createTemplate({
        name: programInfo.name || '未命名模板',
        description: programInfo.description || '',
        width: programInfo.width,
        height: programInfo.height,
        duration: pages.reduce((total, page) => total + (page.duration?.milliseconds || 0), 0),
        vsnData,
        contentData,
      });
      console.log('模板创建成功');
    } catch (error) {
      console.error('另存为模板失败:', error);
    }
  }, [currentPageIndex, selectedItems, selectedRegions, isDirty, isPreviewMode, zoomLevel]);

  // 预览：整节目跨页顺序播放
  useEffect(() => {
    if (!isPreviewMode) return;
    // 按页面duration轮播
    let timer: NodeJS.Timeout | null = null;
    const playNext = () => {
      const state = useEditorStore.getState();
      const page = state.pages[state.currentPageIndex];
      const durationMs = Math.max(1000, page?.duration?.milliseconds ?? 3000);
      timer = setTimeout(() => {
        const nextIndex = (state.currentPageIndex + 1) % state.pages.length;
        state.setCurrentPage(nextIndex);
        playNext();
      }, durationMs);
    };
    playNext();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPreviewMode]);

  // 工具选择处理
  const handleToolSelect = useCallback((tool: EditorTool) => {
    setCurrentTool(tool);
    // TODO: 根据工具类型设置画布状态
  }, []);

  // 添加素材到画布（来自素材库点击）
  const handleAddMaterial = useCallback((material: {
    id: string;
    vsnType: VSNItemType;
    mimeType: string;
    name: string;
    dimensions?: { width: number; height: number };
    fileId?: string;
    duration?: number;
  }) => {
    const { 
      pages, 
      currentPageIndex, 
      addItem, 
      addRegion 
    } = useEditorStore.getState();
    
    const currentPage = pages[currentPageIndex];
    
    if (!currentPage) {
      console.warn('没有当前页面，无法添加素材');
      return;
    }
    
    // 如果当前页面没有区域，先创建一个默认区域
    if (currentPage.regions.length === 0) {
      const { program } = useEditorStore.getState();
      addRegion(currentPageIndex, {
        name: '主区域',
        bounds: {
          x: 0,
          y: 0,
          width: program.width,
          height: program.height,
        },
      });
    }
    
    // 获取更新后的页面信息
    const updatedCurrentPage = useEditorStore.getState().pages[currentPageIndex];
    const targetRegion = updatedCurrentPage.regions[0]; // 添加到第一个区域
    
    // 根据素材类型创建相应的编辑器项目：默认铺满整个画布（对应VSN的reserveAS=0）
    const { program } = useEditorStore.getState();
    const itemData = {
      type: material.vsnType,
      name: material.name || `素材${material.id}`,
      position: { x: 0, y: 0 }, // 从画布原点开始
      dimensions: { width: program.width, height: program.height }, // 铺满整个画布
      materialRef: {
        materialId: material.id,
        fileId: material.fileId,
        originalName: material.name || `素材${material.id}`,
        mimeType: material.mimeType || getMimeTypeByType(material.vsnType),
        fileSize: 0, // 将通过API获取
        dimensions: material.dimensions,
        duration: material.duration ? { milliseconds: Math.floor(material.duration * 1000) } : undefined,
      },
      preserveAspectRatio: false, // 默认不保持宽高比，拉伸填充（reserveAS=0）
    } as const;
    
    // 添加到区域
    addItem(currentPageIndex, targetRegion.id, itemData);
    
    console.log('素材添加成功（铺满画布）:', material.id, material.vsnType);
  }, []);
  
  // 获取素材类型的默认尺寸
  const getDefaultDimensions = (type: VSNItemType) => {
    switch (type) {
      case 4: // 单行文本
        return { width: 200, height: 40 };
      case 5: // 多行文本
        return { width: 300, height: 100 };
      case 9: // 时钟
      case 16: // 精美时钟
        return { width: 200, height: 80 };
      case 14: // 天气
        return { width: 150, height: 120 };
      case 22: // 温度等传感器
      case 21:
      case 23:
      case 24:
        return { width: 120, height: 60 };
      default:
        return { width: 200, height: 150 };
    }
  };
  
  // 根据VSN类型获取MIME类型
  const getMimeTypeByType = (type: VSNItemType): string => {
    switch (type) {
      case 2: // 图片
        return 'image/jpeg';
      case 3: // 视频
        return 'video/mp4';
      case 6: // GIF
        return 'image/gif';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <TooltipProvider>
      <div className={`h-screen flex flex-col bg-background ${className}`}>
        {/* 顶部工具栏 */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 gap-4">
            {/* 节目信息 - 重新设计为更紧凑的布局 */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col min-w-0">
                <Input
                  value={program.name}
                  onChange={(e) => setProgram({ name: e.target.value })}
                  className="h-8 text-sm font-medium border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  placeholder="节目名称"
                />
                <div className="flex items-center gap-2 mt-1">
                  <TopSummary />
                  {isDirty && <Badge variant="secondary" className="h-4 px-1.5 text-xs">未保存</Badge>}
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

              <Button
                variant="default"
                size="sm"
                onClick={handleCreateProgram}
              >
                创建节目
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAsTemplate}
              >
                另存为模板
              </Button>
            </div>

            <div className="flex-1" />

            {/* 面板切换按钮 + 仅显示当前条目开关 */}
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
              <Separator orientation="vertical" className="h-6 mx-1" />
              <OnlyActiveToggle />
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
                          <CardTitle className="text-sm">媒体列表</CardTitle>
                          <CardDescription className="text-xs">单区域顺序播放</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-3">
                          {/* 媒体列表（简版）：展示当前页第一个区域的素材顺序 */}
                          <div className="p-3 border-b">
                            <PageMediaList />
                          </div>
                          <div className="p-3">
                            <CardTitle className="text-xs mb-2">素材库</CardTitle>
                            <MaterialLibrary onAddMaterial={handleAddMaterial} />
                          </div>
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
        {/* 底部媒体胶片条 */}
        <MediaStrip />

        {/* 底部状态栏 - 优化布局 */}
        <div className="border-t bg-muted/20 px-4 py-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>素材: {pages.reduce((total, page) => 
                  total + page.regions.reduce((pageTotal, region) => pageTotal + region.items.length, 0), 0
                )}</span>
              </div>
              {selectedItems.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span>已选: {selectedItems.length}项</span>
                </>
              )}
              {selectedRegions.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span>区域: {selectedRegions.length}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span>{currentTool}</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <span>{Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}