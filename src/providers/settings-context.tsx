import { createContext } from 'react'

export interface SettingsContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean) => void
  toggleSidebar: () => void
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined)
