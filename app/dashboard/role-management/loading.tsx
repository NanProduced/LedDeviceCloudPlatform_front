import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function RoleManagementLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Roles List */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Content - Role Details & Permissions */}
        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">加载角色数据...</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 