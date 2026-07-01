import type { ApiResponse } from '@/lib/api-types'

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
  const token = getStoredToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  let data: ApiResponse<T> | null = null

  try {
    data = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('Unexpected server response.')
  }

  if (!data || !response.ok || data.status !== 'S') {
    throw new ApiError(data?.text || 'Request failed.', data?.code)
  }

  return data
}

function getStoredToken(): string | null {
  return localStorage.getItem('onee_auth_token') ?? sessionStorage.getItem('onee_auth_token')
}
