import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { STATUS_OPTIONS } from '../core/constants'
import type { CategoryStatusFilter } from '../core/types'

interface CategoriesFiltersProps {
  search: string
  status: CategoryStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: CategoryStatusFilter) => void
}

export function CategoriesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CategoriesFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          className="ps-9"
          placeholder="Search by category name..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <select
        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as CategoryStatusFilter)}
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
