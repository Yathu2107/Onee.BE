import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ComplaintListItem } from '../core/types'

interface ComplaintsTableProps {
  complaints: ComplaintListItem[]
  isLoading: boolean
  onOpen: (id: number) => void
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

export function ComplaintStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: 'bg-amber-50 text-amber-800',
    InReview: 'bg-sky-50 text-sky-800',
    Resolved: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-destructive/10 text-destructive',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status === 'InReview' ? 'In Review' : status}
    </span>
  )
}

export function ComplaintsTable({ complaints, isLoading, onOpen }: ComplaintsTableProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Loading complaints...
      </div>
    )
  }

  if (complaints.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No complaints found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Worker</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created On</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id} className="border-border border-b last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">
                  {complaint.fk_job_ID != null ? `#${complaint.fk_job_ID}` : '—'}
                </p>
                {complaint.problem_Text ? (
                  <p className="text-muted-foreground line-clamp-1 max-w-[180px] text-xs">
                    {complaint.problem_Text}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{complaint.customer_Name || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{complaint.worker_Name || '—'}</td>
              <td className="px-4 py-3">
                <p className="line-clamp-2 max-w-xs font-medium">{complaint.subject || '—'}</p>
              </td>
              <td className="px-4 py-3">
                <ComplaintStatusBadge status={String(complaint.status)} />
              </td>
              <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                {formatDate(complaint.createdOn)}
              </td>
              <td className="px-4 py-3 text-end">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpen(complaint.id)}>
                  <Eye />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
