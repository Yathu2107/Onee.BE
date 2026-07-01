export interface ApiResponse<T> {
  status: string
  text: string
  code: string
  result: T
}
