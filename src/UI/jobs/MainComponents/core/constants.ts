import type { JobStatus, JobStatusFilter } from './types'

export const DEFAULT_PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 400
export const JOB_POLL_INTERVAL_MS = 2500

export const JOB_STATUS_OPTIONS: { value: JobStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Offering', label: 'Offering' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Failed', label: 'Failed' },
]

export const ACTIVE_POLL_STATUSES: JobStatus[] = ['Offering', 'Accepted', 'Ongoing']

export function isJobStatus(value: string): value is JobStatus {
  return (['Offering', 'Accepted', 'Ongoing', 'Completed', 'Cancelled', 'Failed'] as string[]).includes(
    value,
  )
}

export function canChat(status: string) {
  return status === 'Accepted' || status === 'Ongoing'
}

export function isTerminalStatus(status: string) {
  return status === 'Completed' || status === 'Cancelled' || status === 'Failed'
}
