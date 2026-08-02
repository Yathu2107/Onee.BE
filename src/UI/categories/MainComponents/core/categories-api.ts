import { apiDataRequest, apiEntityRequest, apiRequest } from '@/lib/api-client'
import type {
  CategoryDetails,
  CategoryListItem,
  CategoryOption,
  CategoryPayload,
  GetAllCategoriesParams,
  GetAllCategoriesResult,
} from './types'

export async function getAllCategories(
  params: GetAllCategoriesParams,
): Promise<GetAllCategoriesResult> {
  const query = new URLSearchParams()

  query.set('Page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (params.status) {
    query.set('status', params.status)
  }

  const response = await apiDataRequest<CategoryListItem[]>(
    `/api/category/get-all?${query.toString()}`,
  )

  return {
    categories: response.data ?? [],
    pagination: response.payload?.pagination ?? {
      page: params.page ?? 1,
      last_page: 1,
      items_per_page: params.itemsPerPage ?? 10,
      total: 0,
    },
  }
}

export function getCategoryById(id: number | string) {
  return apiEntityRequest<CategoryDetails>(`/api/category/${id}/get-category`)
}

export function getCategoriesForList() {
  return apiEntityRequest<CategoryOption[]>('/api/category/get-all-for-list')
}

export function addCategory(payload: CategoryPayload) {
  return apiRequest<string>('/api/category/add-category', {
    method: 'POST',
    body: JSON.stringify({
      Category_Name: payload.categoryName.trim(),
      Isdelete: payload.isDelete,
    }),
  })
}

export function updateCategory(id: number | string, payload: CategoryPayload) {
  return apiRequest<string>(`/api/category/${id}/update-category`, {
    method: 'PUT',
    body: JSON.stringify({
      Category_Name: payload.categoryName.trim(),
      Isdelete: payload.isDelete,
    }),
  })
}
