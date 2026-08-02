import type { ApiResponse, DataApiResponse } from '@/lib/api-types'

const API_URL = import.meta.env.VITE_APP_API_URL ?? ''

export class ApiError extends Error {
  statusCode?: string

  constructor(message: string, statusCode?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const { data } = await requestJson<ApiResponse<T>>(endpoint, options)

  if (!data || data.status !== 'S') {
    throw new ApiError(data?.text || 'Request failed.', data?.code)
  }

  return data
}

/** For endpoints that return an entity body directly (not Message / DataResponse). */
export async function apiEntityRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { data, ok } = await requestJson<T & { text?: string; code?: string; status?: string }>(
    endpoint,
    options,
  )

  if (!ok || data == null) {
    throw new ApiError(data?.text || 'Request failed.', data?.code)
  }

  return data
}

/** For endpoints that return `{ data, payload }` instead of `{ status, result }`. */
export async function apiDataRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<DataApiResponse<T>> {
  const { data, ok } = await requestJson<DataApiResponse<T>>(endpoint, options)

  if (!ok || !data || data.data === undefined) {
    throw new ApiError('Unexpected server response.')
  }

  return data
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; ok: boolean }> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Let the browser set multipart boundary for FormData uploads.
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (isFormData) {
    headers.delete('Content-Type')
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  let data: T | null = null

  try {
    data = (await response.json()) as T
  } catch {
    throw new ApiError('Unexpected server response.')
  }

  return { data, ok: response.ok }
}

function getStoredToken(): string | null {
  return localStorage.getItem('onee_auth_token') ?? sessionStorage.getItem('onee_auth_token')
}
