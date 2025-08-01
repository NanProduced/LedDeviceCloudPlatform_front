"use client"

import { useState } from "react"
import { UserDropdown } from "../components/user-dropdown"
import { SettingsPage } from "../components/settings-page"

export default function Page() {
  const [currentView, setCurrentView] = useState<"dropdown" | "settings">("dropdown")

  const handleSettingsClick = () => {
    setCurrentView("settings")
  }

  const handleBackToDropdown = () => {
    setCurrentView("dropdown")
  }

  if (currentView === "settings") {
    return (
      <div>
        <div className="p-4 border-b bg-white">
          <button onClick={handleBackToDropdown} className="text-blue-600 hover:text-blue-800">
            ← 返回
          </button>
        </div>
        <SettingsPage />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">LED云平台</h1>
          <p className="text-gray-600 mb-6">点击右上角的用户头像进入账户设置</p>

          <div className="flex justify-end">
            <UserDropdown onSettingsClick={handleSettingsClick} />
          </div>
        </div>
      </div>
    </div>
  )
}
