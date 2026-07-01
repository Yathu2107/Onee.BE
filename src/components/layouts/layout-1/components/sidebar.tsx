import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { SidebarMenu } from './sidebar-menu'

export function SidebarHeader() {
  const { sidebarCollapsed, toggleSidebar } = useSettings()

  return (
    <div
      className={cn(
        'border-sidebar-border flex border-b',
        sidebarCollapsed
          ? 'h-16 items-center justify-center px-2'
          : 'h-16 items-center justify-between px-4',
      )}
    >
      {!sidebarCollapsed && (
        <Link to="/" className="flex items-center">
          <img
            src="/media/logos/Logo Without Background.png"
            alt="Onee"
            className="h-9 w-auto max-w-[160px] object-contain"
          />
        </Link>
      )}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="size-8 shrink-0">
        {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed } = useSettings()

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar fixed inset-y-0 start-0 z-20 flex flex-col border-e transition-all duration-300',
        sidebarCollapsed ? 'w-[70px]' : 'w-[265px]',
      )}
    >
      <SidebarHeader />
      <div className="flex-1 overflow-y-auto py-3">
        <SidebarMenu />
      </div>
    </aside>
  )
}
