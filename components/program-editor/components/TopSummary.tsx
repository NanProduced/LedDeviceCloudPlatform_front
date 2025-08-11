'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '../stores/editor-store'

/**
 * 顶部节目摘要条：节目名、分辨率、页面计数、素材计数等
 */
export function TopSummary() {
  const { program, pages, currentPageIndex } = useEditorStore()
  const page = pages[currentPageIndex]
  const totalItems = pages.reduce(
    (sum, p) => sum + p.regions.reduce((s, r) => s + r.items.length, 0),
    0
  )
  const pageItems = page?.regions?.reduce((s, r) => s + r.items.length, 0) || 0

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="outline">{program.name || '未命名节目'}</Badge>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-muted-foreground">{program.width}×{program.height}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-muted-foreground">页 {currentPageIndex + 1}/{pages.length}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-muted-foreground">本页素材 {pageItems}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-muted-foreground">总素材 {totalItems}</span>
    </div>
  )
}

