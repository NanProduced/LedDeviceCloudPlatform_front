'use client';

import React from 'react';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEditorStore } from './managers/editor-state-manager';

interface PageBarProps {
  className?: string;
}

export const PageBar: React.FC<PageBarProps> = ({ className }) => {
  const {
    pages,
    currentPageIndex,
    setCurrentPage,
    addPage,
    duplicatePage,
    removePage,
    updatePage,
  } = useEditorStore();

  const handleAdd = () => {
    addPage({ name: `页面${pages.length + 1}` });
    setCurrentPage(pages.length); // 跳到新页
  };

  const handleDuplicate = () => {
    const current = pages[currentPageIndex];
    if (!current) return;
    const newId = duplicatePage(current.id);
    const newIndex = pages.length; // 新页会在末尾
    setCurrentPage(newIndex);
  };

  const handleDelete = () => {
    if (pages.length <= 1) return; // 至少保留一页
    const current = pages[currentPageIndex];
    if (!current) return;
    removePage(current.id);
  };

  const gotoPrev = () => {
    if (currentPageIndex > 0) setCurrentPage(currentPageIndex - 1);
  };

  const gotoNext = () => {
    if (currentPageIndex < pages.length - 1) setCurrentPage(currentPageIndex + 1);
  };

  return (
    <Card className={cn('px-3 py-2 flex items-center gap-2', className)}>
      <Button variant="ghost" size="icon" onClick={gotoPrev} disabled={currentPageIndex === 0}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {pages.map((p, idx) => (
          <button
            key={p.id}
            className={cn(
              'px-3 py-1 rounded-md text-sm whitespace-nowrap transition-colors',
              idx === currentPageIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            )}
            onClick={() => setCurrentPage(idx)}
            title={`时长: ${p.loopType === 0 ? `${p.duration}ms` : '自动'}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="icon" onClick={gotoNext} disabled={currentPageIndex >= pages.length - 1}>
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="w-4 h-4" /> 新建
        </Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1" disabled={!pages[currentPageIndex]}>
          <Copy className="w-4 h-4" /> 复制
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1" disabled={pages.length <= 1}>
          <Trash2 className="w-4 h-4" /> 删除
        </Button>
      </div>
    </Card>
  );
};

export default PageBar;

