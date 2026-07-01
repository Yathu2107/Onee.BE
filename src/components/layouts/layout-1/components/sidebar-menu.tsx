import { Link } from 'react-router-dom'
import { MENU_SIDEBAR } from '@/config/menu.config'
import { useMenu } from '@/hooks/use-menu'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'

export function SidebarMenu() {
  const { isActive } = useMenu()
  const { sidebarCollapsed } = useSettings()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {MENU_SIDEBAR.map((item, index) => {
        if (item.heading) {
          return (
            <div
              key={`heading-${item.heading}-${index}`}
              className={cn(
                'text-sidebar-foreground/70 px-3 pt-5 pb-2 text-xs font-semibold tracking-wide uppercase',
                sidebarCollapsed && 'hidden',
              )}
            >
              {item.heading}
            </div>
          )
        }

        const Icon = item.icon

        return (
          <Link
            key={item.path}
            to={item.path ?? '/'}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-onee-gold/15 text-onee-gold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
              sidebarCollapsed && 'justify-center px-2',
            )}
            title={sidebarCollapsed ? item.title : undefined}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {!sidebarCollapsed && <span>{item.title}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
