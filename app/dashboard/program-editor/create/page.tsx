'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fabric } from 'fabric';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ProgramCanvas } from '@/components/program-editor/ProgramCanvas';
import { CanvasToolbar } from '@/components/program-editor/CanvasToolbar';
import { MaterialLibraryPanel } from '@/components/program-editor/panels/MaterialLibraryPanel';
import { PropertyPanel } from '@/components/program-editor/panels/PropertyPanel';
import { LayerPanel } from '@/components/program-editor/panels/LayerPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageBar } from '@/components/program-editor/PageBar';
import { ChevronLeft, ChevronRight, PanelLeft, PanelRight, Maximize2 } from 'lucide-react';
import { useEditorStore } from '@/components/program-editor/managers/editor-state-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { VersionPickerDialog } from '@/components/program-editor/VersionPickerDialog';
import { ProgramAPI } from '@/lib/api/program';
import { VSNConverter } from '@/components/program-editor/converters/vsn-converter';
import { computeProgramDuration } from '@/components/program-editor/utils/duration';
import { validateEditorStateForCreation } from '@/components/program-editor/validators/vsn-validator';
import { useMaterialStore } from '@/components/program-editor/managers/material-ref-manager';

/**
 * 创建新节目页面
 */
export default function CreateProgramPage() {
  const router = useRouter();
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [activeTool, setActiveTool] = useState('select');
  const { pages, currentPageIndex, addRegion, program, setSaving, isSaving, updateProgramInfo, getCanvas } = useEditorStore();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [centerWide, setCenterWide] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      // 1) 计算总时长
      const duration = computeProgramDuration({ program, pages, currentPageIndex, canvasStates: {} });
      // 2) 构造 EditorState（最小集）
      const editorState = { program, pages, currentPageIndex, canvasStates: {} } as any;
      // 2.1) 保存前校验（结构/必填/同步窗口）
      const validation = validateEditorStateForCreation(editorState);
      if (!validation.isValid) {
        const first = validation.errors[0];
        toast.error(first?.message || '校验失败');
        return;
      }
      // 2.2) 批量兜底素材元数据
      try {
        const ensure = (useMaterialStore.getState() as any).ensureMaterialsMetadata as (ids: string[]) => Promise<void>;
        const ids: string[] = [];
        for (const p of pages) {
          for (const r of p.regions) {
            for (const it of r.items) {
              if ((it as any).materialRef?.materialId) ids.push((it as any).materialRef.materialId);
            }
          }
        }
        await ensure(ids);
      } catch {}
      // 3) 生成严格 VSN JSON 字符串
      const { vsnData } = VSNConverter.convertToVSN(editorState);
      const vsnDataStr = JSON.stringify(vsnData);
      // 4) contentData 为前端编辑状态
      const contentDataStr = JSON.stringify(editorState);
      // 5) 调用创建节目
      const { programId } = await ProgramAPI.createProgram({
        name: program.name || '未命名节目',
        description: program.description || '',
        width: program.width,
        height: program.height,
        duration,
        status: 'ready',
        thumbnailUrl: '',
        vsnData: vsnDataStr,
        contentData: contentDataStr,
      });
      toast.success('保存成功');
      if (programId) {
        router.push(`/dashboard/program-editor/edit/${programId}`);
      }
    } catch (e:any) {
      toast.error(`保存失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }, [program, pages, currentPageIndex, setSaving]);

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

  // 对齐
  const handleAlign = useCallback((type: 'left'|'centerX'|'right'|'top'|'centerY'|'bottom') => {
    const c = getCanvas();
    if (!c) return;
    const objs = c.getActiveObjects();
    if (!objs || objs.length < 2) return;
    // 计算选区包围盒
    const bounds = objs.map(o => ({
      o,
      left: o.left || 0,
      top: o.top || 0,
      w: o.getScaledWidth(),
      h: o.getScaledHeight(),
    }));
    const minL = Math.min(...bounds.map(b => b.left));
    const maxR = Math.max(...bounds.map(b => b.left + b.w));
    const minT = Math.min(...bounds.map(b => b.top));
    const maxB = Math.max(...bounds.map(b => b.top + b.h));
    const centerX = (minL + maxR) / 2;
    const centerY = (minT + maxB) / 2;
    bounds.forEach(b => {
      let newLeft = b.left;
      let newTop = b.top;
      switch (type) {
        case 'left': newLeft = minL; break;
        case 'right': newLeft = maxR - b.w; break;
        case 'centerX': newLeft = centerX - b.w / 2; break;
        case 'top': newTop = minT; break;
        case 'bottom': newTop = maxB - b.h; break;
        case 'centerY': newTop = centerY - b.h / 2; break;
      }
      b.o.set({ left: newLeft, top: newTop });
      const id = (b.o as any).id;
      if (id) {
        (useEditorStore.getState() as any).updateItemPosition?.(id, { x: newLeft, y: newTop });
      }
    });
    c.discardActiveObject();
    c.renderAll();
  }, [getCanvas]);

  // 分布
  const handleDistribute = useCallback((type: 'hspace'|'vspace') => {
    const c = getCanvas();
    if (!c) return;
    const objs = c.getActiveObjects();
    if (!objs || objs.length < 3) return;
    const arr = objs.map(o => ({
      o,
      left: o.left || 0,
      top: o.top || 0,
      w: o.getScaledWidth(),
      h: o.getScaledHeight(),
    }));
    if (type === 'hspace') {
      const sorted = arr.sort((a,b)=>a.left-b.left);
      const minL = sorted[0].left;
      const maxR = Math.max(...sorted.map(b => b.left + b.w));
      const totalW = sorted.reduce((s,b)=>s+b.w,0);
      const gaps = sorted.length - 1;
      const gap = (maxR - minL - totalW) / gaps;
      let cur = minL;
      sorted.forEach(b => {
        b.o.set({ left: cur });
        const id = (b.o as any).id; if (id) (useEditorStore.getState() as any).updateItemPosition?.(id, { x: cur, y: b.top });
        cur += b.w + gap;
      });
    } else {
      const sorted = arr.sort((a,b)=>a.top-b.top);
      const minT = sorted[0].top;
      const maxB = Math.max(...sorted.map(b => b.top + b.h));
      const totalH = sorted.reduce((s,b)=>s+b.h,0);
      const gaps = sorted.length - 1;
      const gap = (maxB - minT - totalH) / gaps;
      let cur = minT;
      sorted.forEach(b => {
        b.o.set({ top: cur });
        const id = (b.o as any).id; if (id) (useEditorStore.getState() as any).updateItemPosition?.(id, { x: b.left, y: cur });
        cur += b.h + gap;
      });
    }
    c.discardActiveObject();
    c.renderAll();
  }, [getCanvas]);

  // 锁定/显隐
  const handleToggleLock = useCallback(() => {
    const c = getCanvas();
    if (!c) return;
    const objs = c.getActiveObjects();
    if (!objs || objs.length === 0) return;
    const anyUnlocked = objs.some((o:any)=>!o.lockMovementX && !o.lockMovementY);
    objs.forEach((o:any)=>{
      const lock = anyUnlocked;
      o.lockMovementX = lock;
      o.lockMovementY = lock;
      o.lockScalingX = lock;
      o.lockScalingY = lock;
      o.lockRotation = lock;
      o.selectable = !lock;
      o.evented = !lock;
    });
    c.discardActiveObject();
    c.renderAll();
  }, [getCanvas]);

  const handleToggleVisibility = useCallback(() => {
    const c = getCanvas();
    if (!c) return;
    const objs = c.getActiveObjects();
    if (!objs || objs.length === 0) return;
    const anyVisible = objs.some((o:any)=>o.visible !== false);
    objs.forEach((o:any)=>{
      o.visible = !anyVisible;
      const id = (o as any).id; if (id) (useEditorStore.getState() as any).updateItemProperties?.(id, { visible: !anyVisible });
    });
    c.discardActiveObject();
    c.renderAll();
  }, [getCanvas]);

  // 删除选中对象
  const handleDelete = useCallback(() => {
    if (canvas && selectedObjects.length > 0) {
      selectedObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      // 创建页暂不接历史，后续进入编辑页由历史管理
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
            <VersionPickerDialog onLoadVersion={() => {}} />
            <Button size="sm" variant="default" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存并进入编辑'}
            </Button>
          </div>
        </div>
      </div>

      {/* 顶部：页签 + 工具栏 */}
      <div className="border-b">
        <div className="px-4 py-3 flex items-end gap-4">
          <div className="grid grid-cols-1 gap-2 w-64">
            <Label htmlFor="program-name">节目名称</Label>
            <Input id="program-name" placeholder="请输入节目名称" value={program.name}
              onChange={(e) => updateProgramInfo({ name: e.target.value })}/>
          </div>
          <div className="grid grid-cols-2 gap-2 items-end">
            <div className="grid gap-2 w-36">
              <Label htmlFor="program-width">宽度(px)</Label>
              <Input id="program-width" type="number" min={64} max={7680} step={1}
                value={program.width}
                onChange={(e)=>{
                  const v = Number(e.target.value || 0);
                  if (!Number.isNaN(v)) updateProgramInfo({ width: v });
                }} />
            </div>
            <div className="grid gap-2 w-36">
              <Label htmlFor="program-height">高度(px)</Label>
              <Input id="program-height" type="number" min={64} max={4320} step={1}
                value={program.height}
                onChange={(e)=>{
                  const v = Number(e.target.value || 0);
                  if (!Number.isNaN(v)) updateProgramInfo({ height: v });
                }} />
            </div>
          </div>
        </div>
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
        onPreview={() => toast.info('预览功能开发中（T2）')}
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
        onAlign={handleAlign}
        onDistribute={handleDistribute}
        onToggleLock={handleToggleLock}
        onToggleVisibility={handleToggleVisibility}
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
                width={program.width || 1920}
                height={program.height || 1080}
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