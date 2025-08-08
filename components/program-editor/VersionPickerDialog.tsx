'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProgramAPI, ProgramVersionFrontend } from '@/lib/api/program'
import { format } from 'date-fns'

interface VersionPickerDialogProps {
  programId: string
  onLoadVersion: (versionId: string) => Promise<void> | void
}

export function VersionPickerDialog({ programId, onLoadVersion }: VersionPickerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState<ProgramVersionFrontend[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    ProgramAPI.listVersions(programId)
      .then(({ items }) => setVersions(items || []))
      .catch((e: any) => setError(e?.message || '加载版本失败'))
      .finally(() => setLoading(false))
  }, [open, programId])

  const sorted = useMemo(() => {
    return [...versions].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [versions])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">版本</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择版本</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">加载中...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <ScrollArea className="max-h-80">
              <div className="space-y-2">
                {sorted.length === 0 && (
                  <div className="text-sm text-muted-foreground">暂无版本</div>
                )}
                {sorted.map(v => (
                  <div key={v.versionId} className="flex items-center justify-between rounded border p-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{v.type === 'draft' ? '草稿' : '正式'} · {v.status}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.createdAt ? format(new Date(v.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''}
                        {v.remark ? ` · ${v.remark}` : ''}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await onLoadVersion(v.versionId)
                        setOpen(false)
                      }}
                    >载入</Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VersionPickerDialog

