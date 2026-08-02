import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationInfo } from '@/lib/api-types'

interface ComplaintsPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function ComplaintsPagination({ pagination, onPageChange }: ComplaintsPaginationProps) {
  const { page, last_page, items_per_page, total } = pagination

  if (total === 0) return null

  const from = (page - 1) * items_per_page + 1
  const to = Math.min(page * items_per_page, total)

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="text-muted-foreground text-sm">
          Page {page} of {Math.max(last_page, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= last_page}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
