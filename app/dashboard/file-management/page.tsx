"use client"

import FileManagementContent from "@/components/file-management-content"
import React from "react"
import TranscodeDialog from "@/components/TranscodeDialog"



export default function FileManagement() {
  const [open, setOpen] = React.useState(false)
  const [mid, setMid] = React.useState<number | null>(null)

  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ mid: number }>
      if (ce.detail?.mid) {
        setMid(ce.detail.mid)
        setOpen(true)
      }
    }
    window.addEventListener('open-transcode-dialog', handler as EventListener)
    return () => window.removeEventListener('open-transcode-dialog', handler as EventListener)
  }, [])

  return (
    <>
      <FileManagementContent />
      <TranscodeDialog open={open} mid={mid} onOpenChange={setOpen} />
    </>
  )
}
