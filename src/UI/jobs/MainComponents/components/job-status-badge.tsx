import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Offering: 'bg-amber-50 text-amber-800',
  Accepted: 'bg-sky-50 text-sky-800',
  Ongoing: 'bg-onee-gold/15 text-onee-black',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-destructive/10 text-destructive',
  Failed: 'bg-muted text-muted-foreground',
}

export function JobStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-muted text-foreground',
      )}
    >
      {status || '—'}
    </span>
  )
}
