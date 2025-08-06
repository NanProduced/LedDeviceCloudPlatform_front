"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * STOMP测试页面重定向
 * 
 * 由于页面已重命名为stomp-debug，这里提供自动重定向
 */
export default function StompTestRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // 自动重定向到新的调试页面
    router.replace('/dashboard/stomp-debug')
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-slate-600">页面已迁移，正在跳转到调试页面...</p>
      </div>
    </div>
  )
}