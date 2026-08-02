import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Pencil, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getProfileImageUrl } from '../core/accounts-api'
import type { AccountDetails } from '../core/types'

interface UsersTableProps {
  accounts: AccountDetails[]
  isLoading: boolean
  showAssignCategories?: boolean
  onEdit: (accountId: string) => void
  onAssignCategories?: (accountId: string, workerName: string) => void
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UsersTable({
  accounts,
  isLoading,
  showAssignCategories = false,
  onEdit,
  onAssignCategories,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Loading accounts...
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No accounts found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Last login</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => {
            const imageUrl = getProfileImageUrl(account.profileImageUrl)
            const isActive = account.isActive?.toLowerCase() === 'active'
            const isOnline = account.isOnline?.toLowerCase() === 'online'

            return (
              <tr key={account.id} className="border-border border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-9 shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={account.name}
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-onee-gold/15 text-onee-gold flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                          {getInitials(account.name || 'U')}
                        </div>
                      )}
                      <span
                        title={isOnline ? 'Online' : 'Offline'}
                        className={cn(
                          'border-card absolute end-0 bottom-0 size-2.5 rounded-full border-2',
                          isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{account.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {account.email || '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{account.phoneNumber || '—'}</td>
                <td className="px-4 py-3">
                  <span className="bg-muted text-foreground inline-flex rounded-md px-2 py-0.5 text-xs font-medium">
                    {account.userType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isActive
                        ? 'inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                        : 'bg-destructive/10 text-destructive inline-flex rounded-md px-2 py-0.5 text-xs font-medium'
                    }
                  >
                    {account.isActive}
                  </span>
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatDate(account.createdAt)}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatDate(account.lastLoginDate)}
                </td>
                <td className="px-4 py-3 text-end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button type="button" variant="outline" size="sm" className="gap-1.5">
                        <MoreHorizontal className="size-4" />
                        Actions
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        className="bg-popover text-popover-foreground z-50 min-w-48 rounded-lg border p-1 shadow-md"
                      >
                        <DropdownMenu.Item
                          className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
                          onSelect={() => onEdit(account.id)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenu.Item>
                        {showAssignCategories ? (
                          <>
                            <DropdownMenu.Separator className="bg-border my-1 h-px" />
                            <DropdownMenu.Item
                              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none"
                              onSelect={() => onAssignCategories?.(account.id, account.name)}
                            >
                              <Tags className="size-4" />
                              Assign Categories
                            </DropdownMenu.Item>
                          </>
                        ) : null}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
