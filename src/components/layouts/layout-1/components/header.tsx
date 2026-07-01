import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, LogOut, Moon, Search, Sun, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThemeMode } from '@/hooks/use-theme-mode'

export function Header() {
  const { setTheme, resolvedTheme, mounted } = useThemeMode()

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

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                A
              </div>
              <span className="hidden text-sm font-medium md:inline">Admin</span>
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
              <DropdownMenu.Item asChild>
                <Link
                  to="/auth/login"
                  className="text-destructive hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
