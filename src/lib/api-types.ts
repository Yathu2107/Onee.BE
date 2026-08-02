export interface ApiResponse<T> {
  status: string
  text: string
  code: string
  result: T
}

export interface PaginationInfo {
  page: number
  last_page: number
  items_per_page: number
  total: number
}

export interface DataApiResponse<T> {
  data: T
  payload: {
    pagination: PaginationInfo
  }
}
