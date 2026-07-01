import { Link } from 'react-router-dom'
import { MENU_SIDEBAR } from '@/config/menu.config'
import { useMenu } from '@/hooks/use-menu'

export function Breadcrumb() {
  const { pathname } = useMenu()
  const current = MENU_SIDEBAR.find((item) => item.path === pathname)

  return (
    <nav className="text-muted-foreground flex items-center gap-2 text-sm">
      <Link to="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">{current?.title ?? 'Dashboard'}</span>
    </nav>
  )
}
