import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { SidebarMenu } from './sidebar-menu'

export function SidebarHeader() {
  const { sidebarCollapsed, toggleSidebar } = useSettings()

  return (
    <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="bg-primary flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white">
          O
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm leading-none font-semibold">Onee Admin</span>
            <span className="text-muted-foreground text-xs">Metronic</span>
          </div>
        )}
      </Link>
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="size-8">
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
