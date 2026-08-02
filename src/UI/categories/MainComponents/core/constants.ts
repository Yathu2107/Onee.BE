import type { CategoryStatusFilter } from './types'

export const STATUS_OPTIONS: { value: CategoryStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const DEFAULT_PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 400
