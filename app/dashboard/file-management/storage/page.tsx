"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive, ArrowLeft, Download } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import QuotaAPI, { QuotaBreakdownResponse, OrgQuotaDetailResponse } from "@/lib/api/quota"
import { formatFileSize } from "@/lib/websocket/utils"

export default function StorageStatistics() {
  const { user } = useUser()
  const orgId = user?.oid

  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<OrgQuotaDetailResponse | null>(null)
  const [breakdown, setBreakdown] = useState<QuotaBreakdownResponse | null>(null)
  const [groupSortBy, setGroupSortBy] = useState<'bytes' | 'count'>('bytes')
  const [opSortBy, setOpSortBy] = useState<'count' | 'throughput'>('count')

  const usagePercentage = useMemo(() => detail?.storageInfo?.usagePercentage ?? 0, [detail])
  const usedSizeText = useMemo(() => detail ? formatFileSize(detail.storageInfo.usedSize) : '-', [detail])
  const maxSizeText = useMemo(() => detail ? formatFileSize(detail.storageInfo.maxSize) : '-', [detail])
  const remainingText = useMemo(() => detail ? formatFileSize(detail.storageInfo.remainingSize) : '-', [detail])

  const fileTypeSeries = useMemo(() => {
    return (breakdown?.fileTypeBreakdown || []).map((it) => ({
      key: it.fileType,
      name: it.fileTypeDisplayName || it.fileType,
      sizeText: formatFileSize(it.usedBytes),
      percentage: Math.round((it.storagePercentage ?? 0) * 100) / 100,
    }))
  }, [breakdown])

  const groupSeries = useMemo(() => {
    const groups = [...(breakdown?.userGroupBreakdown || [])]
    const sorted = groups.sort((a, b) => {
      if (groupSortBy === 'bytes') return (b.usedBytes || 0) - (a.usedBytes || 0)
      return (b.fileCount || 0) - (a.fileCount || 0)
    })
    const top = sorted.slice(0, 5)
    const maxBytes = Math.max(1, ...top.map(g => g.usedBytes || 0))
    return top.map(g => ({
      id: g.userGroupId,
      name: g.userGroupName,
      usedBytes: g.usedBytes || 0,
      usedText: formatFileSize(g.usedBytes || 0),
      count: g.fileCount || 0,
      progress: Math.round(((g.usedBytes || 0) / maxBytes) * 100),
    }))
  }, [breakdown, groupSortBy])

  const operationSeries = useMemo(() => {
    const ops = (breakdown?.operationTypeBreakdown || []).map(o => ({
      type: o.operationType,
      name: o.operationDisplayName || o.operationType,
      count: o.operationCount || 0,
      totalBytes: o.totalBytes || 0,
      throughputAbs: Math.abs(o.totalBytes || 0),
      throughputText: formatFileSize(Math.abs(o.totalBytes || 0)),
      lastTime: o.lastOperationTime,
    }))
    const sorted = ops.sort((a, b) => {
      if (opSortBy === 'throughput') return b.throughputAbs - a.throughputAbs
      return b.count - a.count
    })
    return sorted
  }, [breakdown, opSortBy])

  const netChangeBytes = useMemo(() => {
    return (breakdown?.operationTypeBreakdown || []).reduce((acc, cur) => acc + (cur.totalBytes || 0), 0)
  }, [breakdown])
  const netChangeText = useMemo(() => {
    const sign = netChangeBytes > 0 ? '+' : (netChangeBytes < 0 ? '-' : '')
    return `${sign}${formatFileSize(Math.abs(netChangeBytes))}`
  }, [netChangeBytes])

  function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
    if (!rows || rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => {
      const v = r[h]
      if (v == null) return ''
      const s = String(v).replace(/"/g, '""')
      return /[",\n]/.test(s) ? `"${s}"` : s
    }).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportUserGroups = useCallback(() => {
    const rows = (breakdown?.userGroupBreakdown || []).map(g => ({
      userGroupId: g.userGroupId,
      userGroupName: g.userGroupName,
      usedBytes: g.usedBytes,
      usedBytesFormatted: formatFileSize(g.usedBytes || 0),
      fileCount: g.fileCount,
      storagePercentage: g.storagePercentage,
      countPercentage: g.countPercentage,
      activeUserCount: g.activeUserCount,
    }))
    downloadCSV('user-group-usage.csv', rows)
  }, [breakdown])

  const exportOperations = useCallback(() => {
    const rows = (breakdown?.operationTypeBreakdown || []).map(o => ({
      operationType: o.operationType,
      operationDisplayName: o.operationDisplayName,
      operationCount: o.operationCount,
      totalBytes: o.totalBytes,
      totalBytesFormatted: formatFileSize(Math.abs(o.totalBytes || 0)),
      lastOperationTime: o.lastOperationTime,
    }))
    downloadCSV('operation-stats.csv', rows)
  }, [breakdown])

  const loadData = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [d, b] = await Promise.all([
        QuotaAPI.getDetail(orgId),
        QuotaAPI.getBreakdown(orgId),
      ])
      setDetail(d)
      setBreakdown(b)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">存储统计</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">查看存储使用情况和统计信息</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/file-management">
            <Button variant="outline" size="sm">素材管理</Button>
          </Link>
          <Link href="/file-management/upload">
            <Button variant="outline" size="sm">文件上传</Button>
          </Link>
          <Link href="/file-management/transcode">
            <Button variant="outline" size="sm">转码管理</Button>
          </Link>
          <Button variant="default" size="sm">存储统计</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-green-600" />
                存储使用情况
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">总使用量</span>
                  <span className="text-sm font-medium">
                    {usedSizeText} / {maxSizeText}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-3" />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">剩余可用空间：{remainingText}</p>
                  <p className="text-xs text-slate-500">统计区间：{breakdown?.summary?.statisticTimeRange || '-'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">文件类型占比</h4>
                {fileTypeSeries.map((t) => (
                  <div key={t.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-slate-500`} />
                        <span className="text-sm">{t.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{t.sizeText}</span>
                        <span className="text-xs text-slate-500 ml-2">{t.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={t.percentage || 0} className="h-2" />
                  </div>
                ))}
                {(!fileTypeSeries || fileTypeSeries.length === 0) && (
                  <p className="text-xs text-muted-foreground">暂无数据</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">统计摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">告警状态</span>
                <span className="font-semibold">{detail?.warningInfo?.isWarning ? '预警' : '正常'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">统计区间</span>
                <span className="font-semibold">{breakdown?.summary?.statisticTimeRange || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">净变化（Σ totalBytes）</span>
                <span className={`font-semibold ${netChangeBytes > 0 ? 'text-green-600' : netChangeBytes < 0 ? 'text-red-600' : ''}`}>{netChangeText}</span>
              </div>
              <Button className="w-full gap-2 mt-2" disabled={loading || !orgId} onClick={loadData}>
                <Download className="w-4 h-4" />
                刷新数据
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">用户组用量榜（Top 5）</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant={groupSortBy === 'bytes' ? 'default' : 'outline'} size="sm" onClick={() => setGroupSortBy('bytes')}>按用量</Button>
                  <Button variant={groupSortBy === 'count' ? 'default' : 'outline'} size="sm" onClick={() => setGroupSortBy('count')}>按文件数</Button>
                  <Button variant="outline" size="sm" onClick={exportUserGroups}>导出</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无数据</p>
              ) : groupSeries.map(g => (
                <div key={g.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{g.name}</span>
                    </div>
                    <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                      {g.usedText} · {g.count} 个文件
                    </div>
                  </div>
                  <Progress value={g.progress} className="h-2" />
                  <div className="text-right">
                    <Link href={`/dashboard/file-management?ugid=${g.id}`} className="text-xs text-blue-600 hover:underline">在素材管理中查看</Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">操作类型统计</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant={opSortBy === 'count' ? 'default' : 'outline'} size="sm" onClick={() => setOpSortBy('count')}>按次数</Button>
                  <Button variant={opSortBy === 'throughput' ? 'default' : 'outline'} size="sm" onClick={() => setOpSortBy('throughput')}>按吞吐量</Button>
                  <Button variant="outline" size="sm" onClick={exportOperations}>导出</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">净变化（Σ totalBytes）：<span className={`${netChangeBytes > 0 ? 'text-green-600' : netChangeBytes < 0 ? 'text-red-600' : ''} font-medium`}>{netChangeText}</span></div>
              {operationSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无数据</p>
              ) : operationSeries.map(op => (
                <div key={op.type} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{op.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">最近一次：{op.lastTime ? new Date(op.lastTime).toLocaleString() : '-'}</div>
                  </div>
                  <div className="w-48 text-right">
                    <div className="text-sm">次数：{op.count}</div>
                    <div className="text-xs text-slate-500">吞吐量：{op.throughputText}</div>
                  </div>
                </div>
              ))}
              <div className="text-xs text-slate-500">注：吞吐量使用绝对值展示处理数据量；净变化为各操作 totalBytes 求和的有符号结果</div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
