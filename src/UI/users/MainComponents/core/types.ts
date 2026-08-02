import type { PaginationInfo } from '@/lib/api-types'

export type AccountTypeId = '1' | '2' | '3'

export type AccountStatusFilter = 'all' | 'active' | 'blocked'

export interface AccountDetails {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  userType: string
  profileImageUrl: string
  isActive: string
  isOnline: string
  createdAt: string
  lastLoginDate: string | null
}

export interface GetAllAccountsParams {
  tid: AccountTypeId
  page?: number
  itemsPerPage?: number
  search?: string
  status?: Exclude<AccountStatusFilter, 'all'> | null
}

export interface GetAllAccountsResult {
  accounts: AccountDetails[]
  pagination: PaginationInfo
}

export type AccountUserType = 'User' | 'Admin' | 'Worker'

export interface SignUpAccountPayload {
  name: string
  email: string
  phoneNumber: string
  userType: AccountUserType
  password: string
  image?: File | null
  isActive?: boolean
  isOnline?: boolean
}

export interface SavedAddress {
  id: number
  fk_user_ID: string
  label: string
  address_Line: string
  latitude: number
  longitude: number
  is_Default: boolean
  createdOn: string | null
  lastUpdatedOn: string | null
}

export interface SavedAddressPayload {
  label: string
  address_Line: string
  latitude: number
  longitude: number
  is_Default: boolean
}

export interface AccountDetailsById {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  passwordMode: string
  password: string | null
  userType: string
  isActive: string
  isOnline: string
  profileImageUrl: string
  latitude: number
  longitude: number
  addresses?: SavedAddress[]
}

export interface UpdateAccountPayload {
  id: string
  name: string
  email: string
  phoneNumber: string
  userType: AccountUserType
  password?: string
  image?: File | null
  isActive: boolean
  isOnline: boolean
}

export interface SetAccountLocationPayload {
  latitude: string | number
  longitude: string | number
}

export interface WorkerCategoryItem {
  category_id: number
  category_Name: string
}

export interface SaveWorkerCategoriesPayload {
  fk_user_ID: string
  category_ids: number[]
}

