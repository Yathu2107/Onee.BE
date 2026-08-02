import type { ComplaintStatus, ComplaintStatusFilter } from './types'

export const DEFAULT_PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 400

export const STATUS_OPTIONS: { value: ComplaintStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'InReview', label: 'In Review' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Rejected', label: 'Rejected' },
]

export const COMPLAINT_STATUS_VALUES: ComplaintStatus[] = [
  'Open',
  'InReview',
  'Resolved',
  'Rejected',
]
