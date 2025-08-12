"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/sonner'
import TranscodeAPI, { PresetInfo, TranscodingParameters } from '@/lib/api/transcode'
import { Loader2 } from 'lucide-react'

interface TranscodeDialogProps {
  open: boolean
  mid: number | null
  onOpenChange: (open: boolean) => void
}

export default function TranscodeDialog({ open, mid, onOpenChange }: TranscodeDialogProps) {
  const [loadingPresets, setLoadingPresets] = useState(false)
  const [presets, setPresets] = useState<PresetInfo[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customize, setCustomize] = useState(false)
  const [paramsLoading, setParamsLoading] = useState(false)
  const [params, setParams] = useState<TranscodingParameters | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const defaultPresetName = useMemo(() => presets.find(p => p.isDefault)?.name, [presets])
  const selectedPresetInfo = useMemo(() => presets.find(p => p.name === selectedPreset), [presets, selectedPreset])

  useEffect(() => {
    if (!open) return
    let aborted = false
    async function loadPresets() {
      try {
        setLoadingPresets(true)
        const data = await TranscodeAPI.listPresets()
        if (aborted) return
        setPresets(data.presets || [])
        setSelectedPreset(data.presets?.find(p => p.isDefault)?.name || data.presets?.[0]?.name || '')
      } catch (e: any) {
        toast.error(e?.message || '加载转码预设失败')
        setPresets([])
        setSelectedPreset('')
      } finally {
        if (!aborted) setLoadingPresets(false)
      }
    }
    loadPresets()
    return () => { aborted = true }
  }, [open])

  useEffect(() => {
    if (!customize || !selectedPreset) {
      setParams(null)
      return
    }
    let aborted = false
    async function loadParams() {
      try {
        setParamsLoading(true)
        const data = await TranscodeAPI.getPresetParameters(selectedPreset)
        if (!aborted) setParams(data)
      } catch (e) {
        toast.error('加载预设参数失败')
      } finally {
        if (!aborted) setParamsLoading(false)
      }
    }
    loadParams()
    return () => { aborted = true }
  }, [customize, selectedPreset])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ mid: number }>
      if (!ce.detail) return
      onOpenChange(true)
    }
    window.addEventListener('open-transcode-dialog', handler as EventListener)
    return () => window.removeEventListener('open-transcode-dialog', handler as EventListener)
  }, [onOpenChange])

  const onSubmit = async () => {
    if (!mid) return
    if (!selectedPreset) {
      toast.error('请先选择预设')
      return
    }
    try {
      setSubmitting(true)
      const payload = customize && params ? { presetName: selectedPreset, parameters: params } : { presetName: selectedPreset }
      await TranscodeAPI.submitTranscode(mid, payload)
      toast.success('转码任务已提交')
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || '提交转码任务失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>提交转码任务</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">选择预设</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>预设</Label>
              <Select value={selectedPreset || 'DEFAULT_SENTINEL'} onValueChange={(v) => setSelectedPreset(v === 'DEFAULT_SENTINEL' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingPresets ? '加载中...' : '请选择预设'} />
                </SelectTrigger>
                <SelectContent>
                  {/* 防止空字符串报错的占位选项，不可选择为最终值 */}
                  <SelectItem value="DEFAULT_SENTINEL" disabled>请选择预设</SelectItem>
                  {presets.map(p => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.displayName || p.name}{p.isDefault ? '（默认）' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPresetInfo && (
                <div className="text-xs text-slate-500 space-y-1">
                  {selectedPresetInfo.description && <div>{selectedPresetInfo.description}</div>}
                  {selectedPresetInfo.estimatedSizeRatio !== undefined && (
                    <div>预计文件大小比例：{Math.round((selectedPresetInfo.estimatedSizeRatio || 0) * 100)}%</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">高级设置（可选）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  checked={customize}
                  onChange={(e) => setCustomize(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label>开启自定义参数</Label>
              </div>
              {customize && (
                <div className="space-y-2">
                  {paramsLoading ? (
                    <div className="flex items-center text-sm text-slate-500"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>加载参数模板...</div>
                  ) : params ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {'width' in params && (
                        <div>
                          <Label>宽度</Label>
                          <Input value={(params.width as any) ?? ''} onChange={e => setParams({ ...params!, width: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                      {'height' in params && (
                        <div>
                          <Label>高度</Label>
                          <Input value={(params.height as any) ?? ''} onChange={e => setParams({ ...params!, height: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                      {'frameRate' in params && (
                        <div>
                          <Label>帧率</Label>
                          <Input value={(params.frameRate as any) ?? ''} onChange={e => setParams({ ...params!, frameRate: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                      {'videoBitrate' in params && (
                        <div>
                          <Label>视频码率(kbps)</Label>
                          <Input value={(params.videoBitrate as any) ?? ''} onChange={e => setParams({ ...params!, videoBitrate: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                      {'audioBitrate' in params && (
                        <div>
                          <Label>音频码率(kbps)</Label>
                          <Input value={(params.audioBitrate as any) ?? ''} onChange={e => setParams({ ...params!, audioBitrate: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                      {'crf' in params && (
                        <div>
                          <Label>CRF</Label>
                          <Input value={(params.crf as any) ?? ''} onChange={e => setParams({ ...params!, crf: Number(e.target.value) || undefined })} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">启用后可编辑常用参数（分辨率、帧率、码率、CRF 等）</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button onClick={onSubmit} disabled={submitting || !mid || !selectedPreset}>
            {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>提交中...</>) : '提交转码'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

