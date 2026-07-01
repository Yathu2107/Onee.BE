import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, LogOut, Search, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.userName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <header className="border-border bg-card sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b px-5">
      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
        <Input className="ps-9" placeholder="Search..." />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          <span className="bg-destructive absolute end-2 top-2 size-2 rounded-full" />
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="bg-onee-gold/15 text-onee-gold flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                {initials ?? 'A'}
              </div>
              <span className="hidden text-sm font-medium md:inline">
                {user?.userName ?? 'Admin'}
              </span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="bg-popover text-popover-foreground z-50 min-w-48 rounded-lg border p-1 shadow-md"
            >
              <DropdownMenu.Item asChild>
                <Link
                  to="/settings"
                  className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
                >
                  <User className="size-4" />
                  My Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bg-border my-1 h-px" />
              <DropdownMenu.Item
                className="text-destructive hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
                onSelect={handleLogout}
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
