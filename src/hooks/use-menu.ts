import { useLocation } from 'react-router-dom'
import { type MenuItem } from '@/config/menu.config'

export function useMenu() {
  const { pathname } = useLocation()

  const getCurrentItem = (items: MenuItem[]) => items.find((item) => item.path === pathname)

  const isActive = (path?: string) => {
    if (!path) return false
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return {
    pathname,
    getCurrentItem,
    isActive,
  }
}
