'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ProgramCanvas } from '@/components/program-editor/ProgramCanvas';
import { CanvasToolbar } from '@/components/program-editor/CanvasToolbar';
import { MaterialLibraryPanel } from '@/components/program-editor/panels/MaterialLibraryPanel';
import { PropertyPanel } from '@/components/program-editor/panels/PropertyPanel';
import { LayerPanel } from '@/components/program-editor/panels/LayerPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PanelLeft, PanelRight, Maximize2 } from 'lucide-react';
import { useEditorStore } from '@/components/program-editor/managers/editor-state-manager';
import { ProgramAPI } from '@/lib/api/program';
import { VSNConverter } from '@/components/program-editor/converters/vsn-converter';
import { computeProgramDuration } from '@/components/program-editor/utils/duration';
import { FabricSerializer } from '@/components/program-editor/converters/fabric-serializer';
import { VersionPickerDialog } from '@/components/program-editor/VersionPickerDialog';

interface EditProgramPageProps {
  params: {
    id: string;
  };
}

/**
 * 编辑现有节目页面
 */
export default function EditProgramPage({ params }: EditProgramPageProps) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [centerWide, setCenterWide] = useState(false);
  const {
    program,
    pages,
    currentPageIndex,
    setSaving,
    isSaving,
    loadProgram,
    updateProgramInfo,
    getCurrentPage,
  } = useEditorStore();

  // 画布准备就绪回调
  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
    console.log('Canvas ready for program:', params.id);
  }, [params.id]);

  // 加载节目内容（优先用 contentData，其次 vsnData）
  useEffect(() => {
    (async () => {
      try {
        const content = await ProgramAPI.getProgramContent(params.id);
        if (content?.contentData) {
          const parsed = JSON.parse(content.contentData);
          // 兼容：确保program.id为当前id
          parsed.program = parsed.program || {};
          parsed.program.id = params.id;
          loadProgram(parsed);
        } else if (content?.vsnData) {
          const editor = VSNConverter.convertFromVSN(JSON.parse(content.vsnData));
          editor.program.id = params.id;
          loadProgram(editor);
        } else {
          updateProgramInfo({ id: params.id });
        }
      } catch (e) {
        console.error('加载节目失败', e);
        updateProgramInfo({ id: params.id });
      }
    })();
  }, [params.id, loadProgram, updateProgramInfo]);

  // 选择变更回调
  const handleSelectionChange = useCallback((objects: fabric.Object[]) => {
    setSelectedObjects(objects);
  }, []);

  // 工具选择回调
  const handleToolSelect = useCallback((tool: string) => {
    setActiveTool(tool);
    
    if (canvas) {
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

  const buildContentData = useCallback(() => {
    // 仅序列化当前页画布，后续可扩展为多页缓存
    const currentPage = getCurrentPage();
    const canvasStates: any = {};
    if (canvas && currentPage) {
      try {
        const state = FabricSerializer.serializeCanvas(canvas);
        canvasStates[currentPage.id] = state;
      } catch {}
    }
    return JSON.stringify({ program, pages, currentPageIndex, canvasStates });
  }, [canvas, program, pages, currentPageIndex, getCurrentPage]);

  const handleSaveDraft = useCallback(async () => {
    try {
      setSaving(true);
      const contentDataStr = buildContentData();
      await ProgramAPI.saveDraft(params.id, contentDataStr);
      // eslint-disable-next-line no-alert
      alert('草稿已保存');
    } catch (e:any) {
      // eslint-disable-next-line no-alert
      alert(`保存草稿失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }, [params.id, setSaving, buildContentData]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const duration = computeProgramDuration({ program, pages, currentPageIndex, canvasStates: {} } as any);
      const editorState = { program, pages, currentPageIndex, canvasStates: {} } as any;
      const { vsnData } = VSNConverter.convertToVSN(editorState);
      const vsnDataStr = JSON.stringify(vsnData);
      const contentDataStr = buildContentData();
      await ProgramAPI.updateProgram(params.id, {
        name: program.name,
        description: program.description,
        width: program.width,
        height: program.height,
        duration,
        status: 'ready',
        thumbnailUrl: '',
        vsnData: vsnDataStr,
        contentData: contentDataStr,
      });
      // eslint-disable-next-line no-alert
      alert('保存成功');
    } catch (e:any) {
      // eslint-disable-next-line no-alert
      alert(`保存失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }, [params.id, setSaving, program, pages, currentPageIndex, buildContentData]);

  const handlePublish = useCallback(async () => {
    try {
      setSaving(true);
      await handleSave();
      const res = await ProgramAPI.publishProgram(params.id);
      // eslint-disable-next-line no-alert
      alert('发布成功');
    } catch (e:any) {
      // eslint-disable-next-line no-alert
      alert(`发布失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }, [params.id, handleSave, setSaving]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部标题栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">编辑节目 - {params.id}</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLeftOpen(v=>!v)} title={leftOpen ? '隐藏素材库' : '显示素材库'}>
              {leftOpen ? <PanelLeft className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setRightOpen(v=>!v)} title={rightOpen ? '隐藏属性' : '显示属性'}>
              {rightOpen ? <PanelRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCenterWide(v=>!v)} title={centerWide ? '还原布局' : '最大化画布'}>
              <Maximize2 className="h-4 w-4"/>
            </Button>
            <span className="text-sm text-muted-foreground">
              选中对象: {selectedObjects.length}
            </span>
            <VersionPickerDialog
              programId={params.id}
              onLoadVersion={async (versionId) => {
                const data = await ProgramAPI.getProgramContent(params.id, versionId)
                if (data?.contentData) {
                  const parsed = JSON.parse(data.contentData)
                  parsed.program = parsed.program || {}
                  parsed.program.id = params.id
                  loadProgram(parsed)
                } else if (data?.vsnData) {
                  const editor = VSNConverter.convertFromVSN(JSON.parse(data.vsnData))
                  editor.program.id = params.id
                  loadProgram(editor)
                }
              }}
            />
            <Button size="sm" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>草稿</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? '保存中...' : '保存'}</Button>
            <Button size="sm" variant="default" onClick={handlePublish} disabled={isSaving}>发布</Button>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <CanvasToolbar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        canUndo={false}
        canRedo={false}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onDelete={handleDelete}
      />
      
      {/* 主要内容区域 - 三栏式布局 */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* 左侧面板 - 素材库 */}
          {leftOpen && (
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <MaterialLibraryPanel className="h-full border-r" />
            </ResizablePanel>
          )}
          
          {leftOpen && <ResizableHandle withHandle />}
          
          {/* 中间面板 - 画布区域 */}
          <ResizablePanel defaultSize={centerWide ? 100 : 60} minSize={40}>
            <div className="h-full flex flex-col">
              <ProgramCanvas
                width={1920}
                height={1080}
                onCanvasReady={handleCanvasReady}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </ResizablePanel>
          
          {rightOpen && <ResizableHandle withHandle />}
          
          {/* 右侧面板 - 属性和图层 */}
          {rightOpen && (
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
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}