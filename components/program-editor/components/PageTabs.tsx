'use client';

/**
 * 页面标签组件
 * 使用shadcn组件实现页面管理功能
 */

import React, { useState } from 'react';
import { Plus, MoreHorizontal, Copy, Trash2, Edit3 } from 'lucide-react';

// shadcn组件
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 状态管理
import { useEditorStore } from '../stores/editor-store';

interface PageTabsProps {
  className?: string;
}

/**
 * 页面重命名对话框
 */
function RenamePageDialog({ 
  pageIndex, 
  currentName, 
  open, 
  onOpenChange 
}: {
  pageIndex: number;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newName, setNewName] = useState(currentName);
  const { updatePage } = useEditorStore();

  const handleSave = () => {
    if (newName.trim()) {
      updatePage(pageIndex, { name: newName.trim() });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>重命名页面</DialogTitle>
          <DialogDescription>
            为页面设置一个新的名称
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="page-name" className="text-right">
              名称
            </Label>
            <Input
              id="page-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              placeholder="输入页面名称"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 页面标签组件
 */
export function PageTabs({ className }: PageTabsProps) {
  const {
    pages,
    currentPageIndex,
    setCurrentPage,
    addPage,
    duplicatePage,
    deletePage,
    updatePage,
  } = useEditorStore();

  const [renamePageIndex, setRenamePageIndex] = useState<number | null>(null);

  // 处理页面切换
  const handlePageChange = (pageIndex: string) => {
    setCurrentPage(parseInt(pageIndex));
  };

  // 处理添加页面
  const handleAddPage = () => {
    addPage({
      name: `页面 ${pages.length + 1}`,
    });
  };

  // 处理复制页面
  const handleDuplicatePage = (pageIndex: number) => {
    duplicatePage(pageIndex);
  };

  // 处理删除页面
  const handleDeletePage = (pageIndex: number) => {
    if (pages.length > 1) {
      deletePage(pageIndex);
    }
  };

  // 计算页面总时长
  const calculateTotalDuration = () => {
    return pages.reduce((total, page) => total + page.duration.milliseconds, 0);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={`border-b bg-background ${className}`}>
      <div className="flex items-center justify-between px-4 py-2">
        {/* 页面标签列表 */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="w-full">
            <Tabs
              value={currentPageIndex.toString()}
              onValueChange={handlePageChange}
              className="w-full"
            >
              <TabsList className="h-auto p-1 bg-transparent">
                {pages.map((page, index) => (
                  <div key={page.id} className="flex items-center group">
                    <TabsTrigger
                      value={index.toString()}
                      className="relative flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="truncate max-w-[100px]">{page.name}</span>
                      
                      {/* 页面信息徽章 */}
                      <div className="flex items-center gap-1">
                        {page.regions.length > 0 && (
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            {page.regions.length}
                          </Badge>
                        )}
                        <Badge variant="outline" className="h-4 px-1 text-xs">
                          {formatDuration(page.duration.milliseconds)}
                        </Badge>
                      </div>
                    </TabsTrigger>

                    {/* 页面操作菜单 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                          <span className="sr-only">页面操作</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[150px]">
                        <DropdownMenuItem onClick={() => setRenamePageIndex(index)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePage(index)}>
                          <Copy className="mr-2 h-4 w-4" />
                          复制页面
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(index)}
                          disabled={pages.length <= 1}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除页面
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* 添加页面按钮和统计信息 */}
        <div className="flex items-center gap-3 ml-4">
          {/* 节目统计信息 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>总时长: {formatDuration(calculateTotalDuration())}</span>
            <span>•</span>
            <span>共 {pages.length} 页</span>
          </div>

          {/* 添加页面按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPage}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            添加页面
          </Button>
        </div>
      </div>

      {/* 重命名对话框 */}
      {renamePageIndex !== null && (
        <RenamePageDialog
          pageIndex={renamePageIndex}
          currentName={pages[renamePageIndex]?.name || ''}
          open={renamePageIndex !== null}
          onOpenChange={(open) => {
            if (!open) setRenamePageIndex(null);
          }}
        />
      )}
    </div>
  );
}