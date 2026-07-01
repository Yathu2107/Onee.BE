import { Outlet } from 'react-router-dom'
import { Footer } from './components/footer'
import { Header } from './components/header'
import { Sidebar } from './components/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'

export function Layout1() {
  const isMobile = useIsMobile()
  const { sidebarCollapsed } = useSettings()

  return (
    <div className="flex min-h-screen w-full">
      {!isMobile && <Sidebar />}

      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'ps-[70px]' : 'ps-[265px]'),
        )}
      >
        <Header />
        <main className="grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
