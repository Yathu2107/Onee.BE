import { useState, type ReactNode } from 'react'
import { SettingsContext } from '@/providers/settings-context'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <SettingsContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
