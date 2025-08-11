"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProgramAPI } from "@/lib/api/program"

export default function ReviewCenterPage() {
  const [activeTab, setActiveTab] = useState<'mine' | 'all' | 'created'>('mine')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [createdItems, setCreatedItems] = useState<any[]>([])
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; requestId?: string }>({ open: false })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId?: string }>({ open: false })
  const [remark, setRemark] = useState("")
  const [reason, setReason] = useState("")

  const scopeParam = useMemo(() => (activeTab === 'all' ? 'all' : 'mine'), [activeTab])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      if (activeTab === 'created') {
        const res = await ProgramAPI.listSubmittedReviews({ page: 1, pageSize: 20 })
        setCreatedItems(res.items || [])
      } else {
        const { items } = await ProgramAPI.listPendingReviews({ scope: scopeParam, page: 1, pageSize: 20 })
        setItems(items || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [scopeParam, activeTab])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = useCallback(async () => {
    if (!approveDialog.requestId) return
    try {
      await ProgramAPI.approveReview(approveDialog.requestId, { remark })
      setApproveDialog({ open: false })
      setRemark("")
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }, [approveDialog.requestId, remark, loadData])

  const handleReject = useCallback(async () => {
    if (!rejectDialog.requestId) return
    try {
      await ProgramAPI.rejectReview(rejectDialog.requestId, { reason })
      setRejectDialog({ open: false })
      setReason("")
      await loadData()
    } catch (e) {
      console.error(e)
    }
  }, [rejectDialog.requestId, reason, loadData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">审核中心</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">处理节目审核任务</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>审核任务</CardTitle>
          <CardDescription>审批通过后节目进入“可发布”状态</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="mine">待我审核</TabsTrigger>
              <TabsTrigger value="created">我发起的</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
            <TabsContent value="mine" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>节目名称</TableHead>
                    <TableHead>提交人</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((it: any) => (
                    <TableRow key={it.requestId || it.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Badge variant="outline">PENDING</Badge>
                        {it.programName || it.name}
                      </TableCell>
                      <TableCell>{it.submitterName || '-'}</TableCell>
                      <TableCell>{it.submittedAt ? new Date(it.submittedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setApproveDialog({ open: true, requestId: it.requestId || it.id })}>通过</Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectDialog({ open: true, requestId: it.requestId || it.id })}>拒绝</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!items || items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>节目名称</TableHead>
                    <TableHead>提交人</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((it: any) => (
                    <TableRow key={it.requestId || it.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Badge variant="outline">PENDING</Badge>
                        {it.programName || it.name}
                      </TableCell>
                      <TableCell>{it.submitterName || '-'}</TableCell>
                      <TableCell>{it.submittedAt ? new Date(it.submittedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setApproveDialog({ open: true, requestId: it.requestId || it.id })}>通过</Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectDialog({ open: true, requestId: it.requestId || it.id })}>拒绝</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!items || items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="created" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>节目名称</TableHead>
                    <TableHead>当前状态</TableHead>
                    <TableHead>提交时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdItems?.map((it: any) => (
                    <TableRow key={it.requestId || it.id}>
                      <TableCell className="font-medium">{it.programName || it.name}</TableCell>
                      <TableCell><Badge variant="outline">{it.status || 'PENDING'}</Badge></TableCell>
                      <TableCell>{it.submittedAt ? new Date(it.submittedAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {(!createdItems || createdItems.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 审批通过对话框 */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核通过</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="通过意见（按接口文档字段名/长度）" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false })}>取消</Button>
            <Button onClick={handleApprove}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审批拒绝对话框 */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核拒绝</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="拒绝原因（按接口文档字段名/长度）" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false })}>取消</Button>
            <Button variant="destructive" onClick={handleReject}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

