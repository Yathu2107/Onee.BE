import { cn } from '@/lib/utils'
import { ACCOUNT_TABS } from '../core/constants'
import type { AccountTypeId } from '../core/types'

interface UsersTabsProps {
  value: AccountTypeId
  onChange: (value: AccountTypeId) => void
}

export function UsersTabs({ value, onChange }: UsersTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Account type"
      className="border-border bg-muted/40 inline-flex rounded-lg border p-1"
    >
      {ACCOUNT_TABS.map((tab) => {
        const isActive = tab.id === value

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
