import { useState, type ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SettingsContext } from '@/providers/settings-context'

function SettingsProviderInner({ children }: { children: ReactNode }) {
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem storageKey="theme">
      <SettingsProviderInner>{children}</SettingsProviderInner>
    </NextThemesProvider>
  )
}
