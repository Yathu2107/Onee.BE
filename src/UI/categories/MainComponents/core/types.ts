import type { PaginationInfo } from '@/lib/api-types'

export type CategoryStatusFilter = 'all' | 'active' | 'inactive'

export interface CategoryListItem {
  id: number
  category_Name: string
  isdelete: boolean
  createdBy?: string
  createdOn?: string
}

export interface CategoryDetails {
  id: number
  category_Name: string
  isdelete: boolean
  createdBy?: string
  createdOn?: string
  lastUpdatedBy?: string
  lastUpdatedOn?: string
}

export interface GetAllCategoriesParams {
  page?: number
  itemsPerPage?: number
  search?: string
  status?: Exclude<CategoryStatusFilter, 'all'> | null
}

export interface GetAllCategoriesResult {
  categories: CategoryListItem[]
  pagination: PaginationInfo
}

export interface CategoryPayload {
  categoryName: string
  isDelete: boolean
}

export interface CategoryOption {
  id: number
  category_Name: string
}
