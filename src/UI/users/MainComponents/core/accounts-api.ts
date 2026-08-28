import { apiDataRequest, apiEntityRequest, apiRequest } from '@/lib/api-client'
import type {
  AccountDetails,
  AccountDetailsById,
  GetAllAccountsParams,
  GetAllAccountsResult,
  SaveWorkerCategoriesPayload,
  SavedAddress,
  SavedAddressPayload,
  SetAccountLocationPayload,
  SignUpAccountPayload,
  UpdateAccountPayload,
  WorkerCategoryItem,
} from './types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function findKey(record: Record<string, unknown>, ...keys: string[]) {
  const entries = Object.entries(record)
  for (const key of keys) {
    if (key in record) return key
    const match = entries.find(([entryKey]) => entryKey.toLowerCase() === key.toLowerCase())
    if (match) return match[0]
  }
  return null
}

function pickString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  return ''
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }
  return 0
}

function pickBoolean(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (normalized === 'true' || normalized === '1') return true
      if (normalized === 'false' || normalized === '0') return false
    }
    if (typeof value === 'number') return value !== 0
  }
  return false
}

export function normalizeSavedAddress(raw: unknown): SavedAddress {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, 'id', 'Id'),
    fk_user_ID: pickString(record, 'fk_user_ID', 'fk_User_ID', 'fkUserId', 'userId'),
    label: pickString(record, 'label', 'Label') || 'Address',
    address_Line: pickString(record, 'address_Line', 'address_line', 'addressLine', 'Address_Line'),
    latitude: pickNumber(record, 'latitude', 'Latitude'),
    longitude: pickNumber(record, 'longitude', 'Longitude'),
    is_Default: pickBoolean(record, 'is_Default', 'isDefault', 'Is_Default', 'IsDefault'),
    createdOn: pickString(record, 'createdOn', 'CreatedOn') || null,
    lastUpdatedOn: pickString(record, 'lastUpdatedOn', 'LastUpdatedOn') || null,
  }
}

function normalizeAccountDetailsById(raw: unknown): AccountDetailsById {
  const record = asRecord(raw)
  const addressesRaw = record.addresses ?? record.Addresses ?? []

  return {
    id: pickString(record, 'id', 'Id'),
    name: pickString(record, 'name', 'Name'),
    email: pickString(record, 'email', 'Email') || null,
    phoneNumber: pickString(record, 'phoneNumber', 'PhoneNumber') || null,
    passwordMode: pickString(record, 'passwordMode', 'PasswordMode'),
    password: pickString(record, 'password', 'Password') || null,
    userType: pickString(record, 'userType', 'UserType'),
    isActive: pickString(record, 'isActive', 'IsActive'),
    isOnline: pickString(record, 'isOnline', 'IsOnline'),
    profileImageUrl: pickString(record, 'profileImageUrl', 'ProfileImageUrl'),
    latitude: pickNumber(record, 'latitude', 'Latitude'),
    longitude: pickNumber(record, 'longitude', 'Longitude'),
    addresses: Array.isArray(addressesRaw) ? addressesRaw.map(normalizeSavedAddress) : [],
  }
}

export async function getAllAccounts(
  params: GetAllAccountsParams,
): Promise<GetAllAccountsResult> {
  const query = new URLSearchParams()

  query.set('page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (params.status) {
    query.set('status', params.status)
  }

  const response = await apiDataRequest<AccountDetails[]>(
    `/api/accounts/get-all-accounts/${params.tid}?${query.toString()}`,
  )

  return {
    accounts: response.data ?? [],
    pagination: response.payload?.pagination ?? {
      page: params.page ?? 1,
      last_page: 1,
      items_per_page: params.itemsPerPage ?? 10,
      total: 0,
    },
  }
}

export async function getAccountById(id: string): Promise<AccountDetailsById> {
  try {
    const response = await apiRequest<unknown>(`/api/accounts/${id}`)
    return normalizeAccountDetailsById(response.result ?? response)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/accounts/${id}`)
    return normalizeAccountDetailsById(entity)
  }
}

export function signUpAccount(payload: SignUpAccountPayload) {
  const formData = new FormData()

  formData.append('Name', payload.name.trim())
  formData.append('Email', payload.email.trim())
  formData.append('PhoneNumber', payload.phoneNumber.trim())
  formData.append('UserType', payload.userType)
  formData.append('Password', payload.password)
  formData.append('IsActive', String(payload.isActive ?? true))
  formData.append('IsOnline', String(payload.isOnline ?? false))

  if (payload.image) {
    formData.append('Image', payload.image)
  }

  return apiRequest<string>('/api/accounts/SignUp', {
    method: 'POST',
    body: formData,
  })
}

export function updateAccount(payload: UpdateAccountPayload) {
  const formData = new FormData()

  formData.append('Name', payload.name.trim())
  formData.append('Email', payload.email.trim())
  formData.append('PhoneNumber', payload.phoneNumber.trim())
  formData.append('UserType', payload.userType)
  formData.append('IsActive', String(payload.isActive))
  formData.append('IsOnline', String(payload.isOnline))

  if (payload.password?.trim()) {
    formData.append('Password', payload.password)
    formData.append('PasswordMode', 'MANUAL')
  }

  if (payload.image) {
    formData.append('Image', payload.image)
  }

  return apiRequest<string>(`/api/accounts/${payload.id}/Update`, {
    method: 'PUT',
    body: formData,
  })
}

export function setAccountLocation(id: string, location: SetAccountLocationPayload) {
  const latitude = Number(location.latitude)
  const longitude = Number(location.longitude)

  return apiRequest<string>(`/api/accounts/${id}/set-location`, {
    method: 'PUT',
    body: JSON.stringify({
      latitude: Number.isFinite(latitude) ? latitude : 0,
      longitude: Number.isFinite(longitude) ? longitude : 0,
    }),
  })
}

export async function getAddressesByUser(userId: string): Promise<SavedAddress[]> {
  try {
    const response = await apiRequest<unknown>(`/api/address/by-user/${userId}`)
    const result = response.result
    const list = Array.isArray(result)
      ? result
      : Array.isArray(asRecord(result).addresses)
        ? (asRecord(result).addresses as unknown[])
        : []
    return list.map(normalizeSavedAddress)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/address/by-user/${userId}`)
    const list = Array.isArray(entity)
      ? entity
      : Array.isArray(asRecord(entity).addresses)
        ? (asRecord(entity).addresses as unknown[])
        : []
    return list.map(normalizeSavedAddress)
  }
}

export function addAddress(userId: string, payload: SavedAddressPayload) {
  return apiRequest<unknown>(`/api/address/add/${userId}`, {
    method: 'POST',
    body: JSON.stringify({
      label: payload.label.trim(),
      address_Line: payload.address_Line.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      is_Default: payload.is_Default,
    }),
  })
}

export function updateAddress(
  id: number | string,
  userId: string,
  payload: SavedAddressPayload,
) {
  return apiRequest<unknown>(`/api/address/${id}/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({
      label: payload.label.trim(),
      address_Line: payload.address_Line.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      is_Default: payload.is_Default,
    }),
  })
}

export function setDefaultAddress(id: number | string, userId: string) {
  return apiRequest<unknown>(`/api/address/${id}/set-default/${userId}`, {
    method: 'POST',
  })
}

export function deleteAddress(id: number | string) {
  return apiRequest<string>(`/api/address/${id}`, { method: 'DELETE' })
}

export function getProfileImageUrl(
  filename?: string | null,
  userType?: string | null,
): string | null {
  if (!filename || filename === 'Default.png') return null

  const trimmed = filename.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.toLowerCase().endsWith('/default.png')) return null

  const folder = userType?.toLowerCase() === 'worker' ? 'Worker' : 'User'

  const uploadBase =
    import.meta.env.VITE_APP_UPLOAD_URL ??
    `${import.meta.env.VITE_APP_API_URL ?? ''}/Uploads/UploadImages`

  return `${uploadBase.replace(/\/$/, '')}/${folder}/${trimmed}`
}

export async function getWorkerCategories(userId: string) {
  const response = await apiRequest<WorkerCategoryItem[]>(
    `/api/worker-category/${userId}/get-categories`,
  )
  return response.result ?? []
}

export function saveWorkerCategories(payload: SaveWorkerCategoriesPayload) {
  return apiRequest<string>('/api/worker-category/save', {
    method: 'POST',
    body: JSON.stringify({
      fk_user_ID: payload.fk_user_ID,
      category_ids: payload.category_ids,
    }),
  })
}
