import type { AccountStatusFilter, AccountTypeId } from './types'

export const ACCOUNT_TABS: { id: AccountTypeId; label: string; userType: 'User' | 'Admin' | 'Worker' }[] =
  [
    { id: '1', label: 'Users', userType: 'User' },
    { id: '2', label: 'Admins', userType: 'Admin' },
    { id: '3', label: 'Workers', userType: 'Worker' },
  ]

export const USER_TYPE_OPTIONS: { value: 'User' | 'Admin' | 'Worker'; label: string }[] = [
  { value: 'User', label: 'User' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Worker', label: 'Worker' },
]

export const STATUS_OPTIONS: { value: AccountStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
]

export const DEFAULT_PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 400
