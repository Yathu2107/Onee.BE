import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { JOB_STATUS_OPTIONS } from '../core/constants'
import type { JobStatusFilter } from '../core/types'

interface JobsFiltersProps {
  search: string
  status: JobStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: JobStatusFilter) => void
}

export function JobsFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: JobsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          className="ps-9"
          placeholder="Search jobs..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <select
        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as JobStatusFilter)}
        aria-label="Filter by status"
      >
        {JOB_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
