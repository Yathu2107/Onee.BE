import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { JobListItem } from '../core/types'
import { JobStatusBadge } from './job-status-badge'
import { OfferCountdown } from './offer-countdown'

interface JobsTableProps {
  jobs: JobListItem[]
  isLoading: boolean
  onOpen: (jobId: number) => void
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

export function JobsTable({ jobs, isLoading, onOpen }: JobsTableProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Loading jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No jobs found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">Job</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Worker</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Offer timer</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-border border-b last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">#{job.id}</p>
                <p className="text-muted-foreground line-clamp-1 max-w-xs text-xs">
                  {job.problem_Text || '—'}
                </p>
                {job.category_Name ? (
                  <p className="text-muted-foreground mt-0.5 text-xs">{job.category_Name}</p>
                ) : null}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{job.customer_Name || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{job.worker_Name || '—'}</td>
              <td className="px-4 py-3">
                <JobStatusBadge status={String(job.status)} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {job.status === 'Offering' ? (
                  <OfferCountdown
                    offerExpiresAt={job.offer_Expires_At}
                    className="text-sm font-medium tabular-nums"
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                {formatDate(job.createdAt)}
              </td>
              <td className="px-4 py-3 text-end">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpen(job.id)}>
                  <Eye />
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
