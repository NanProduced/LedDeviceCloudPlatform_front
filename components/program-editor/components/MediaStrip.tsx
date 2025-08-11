'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useEditorStore } from '../stores/editor-store'
import { getFilePreviewUrl } from '@/lib/api/filePreview'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * 画布下方的媒体胶片条：按顺序展示和管理当前页第一个区域的素材
 */
export function MediaStrip() {
  const {
    pages,
    currentPageIndex,
    activeItemIndexByRegion,
    setActiveItemIndex,
    reorderItems,
    updateItem,
  } = useEditorStore()

  const page = pages[currentPageIndex]
  const region = page?.regions?.[0]
  if (!region) {
    return (
      <div className="px-4 py-2 text-xs text-muted-foreground">暂无区域，拖拽素材到画布将自动创建全屏区域</div>
    )
  }

  const items = region.items
  const activeIndex = (activeItemIndexByRegion || {})[region.id] ?? 0

  const onMove = (idx: number, dir: 'left' | 'right') => {
    const to = dir === 'left' ? Math.max(0, idx - 1) : Math.min(items.length - 1, idx + 1)
    if (to === idx) return
    const order = items.map(i => i.id)
    const [moved] = order.splice(idx, 1)
    order.splice(to, 0, moved)
    reorderItems(currentPageIndex, region.id, order)
    setActiveItemIndex(region.id, to)
  }

  const getThumb = (item: any) => {
    const fileId: string | undefined = item?.materialRef?.fileId
    if (fileId) {
      // 生成缩略图（统一 96x72）
      return getFilePreviewUrl(fileId, { w: 144, h: 90, fit: 'cover', format: 'jpg', q: 70 })
    }
    return ''
  }

  return (
    <div className="border-t bg-muted/10">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-xs text-muted-foreground">媒体列表（{items.length}）</div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMove(activeIndex, 'left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMove(activeIndex, 'right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-3 px-4 py-3 min-h-[110px]">
          {items.map((it, idx) => {
            const active = idx === activeIndex
            const thumb = getThumb(it)
            const duration = (it as any)?.duration ?? (it as any)?.playDuration?.milliseconds
            return (
              <div
                key={it.id}
                className={cn(
                  'group relative w-[160px] h-[100px] rounded border bg-card overflow-hidden cursor-pointer',
                  active ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                )}
                onClick={() => setActiveItemIndex(region.id, idx)}
                title={it.name}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    {it.name}
                  </div>
                )}
                <div className="absolute left-1 top-1">
                  <Badge variant="secondary" className="h-5 px-1 text-[10px]">{idx + 1}</Badge>
                </div>
                <div className="absolute right-1 bottom-1">
                  <Badge variant="outline" className="h-5 px-1 text-[10px] bg-background/80">
                    {duration ? `${Math.round(duration / 1000)}s` : '-'}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

