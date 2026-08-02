import type { NotificationStatusFilter } from '../core/types'
import { STATUS_OPTIONS } from '../core/constants'

interface NotificationsFiltersProps {
  status: NotificationStatusFilter
  onStatusChange: (value: NotificationStatusFilter) => void
}

export function NotificationsFilters({ status, onStatusChange }: NotificationsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as NotificationStatusFilter)}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
