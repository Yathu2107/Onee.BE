import type { NotificationAudience, NotificationStatusFilter } from './types'

export const DEFAULT_PAGE_SIZE = 10

export const STATUS_OPTIONS: { value: NotificationStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
]

export const AUDIENCE_OPTIONS: { value: NotificationAudience; label: string }[] = [
  { value: 'Users', label: 'Users' },
  { value: 'Workers', label: 'Workers' },
  { value: 'Both', label: 'Both' },
]
