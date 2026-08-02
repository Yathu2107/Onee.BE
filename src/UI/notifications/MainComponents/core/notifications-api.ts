import { apiDataRequest, apiEntityRequest, apiRequest } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import type {
  CreateNotificationPayload,
  GetNotificationsParams,
  GetNotificationsResult,
  InboxItem,
  NotificationDetails,
  NotificationListItem,
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

function emptyPagination(page: number, itemsPerPage: number): PaginationInfo {
  return {
    page,
    last_page: 1,
    items_per_page: itemsPerPage,
    total: 0,
  }
}

export function normalizeNotification(raw: unknown): NotificationListItem {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, 'id', 'Id'),
    title: pickString(record, 'title', 'Title'),
    body: pickString(record, 'body', 'Body'),
    audience: pickString(record, 'audience', 'Audience') || 'Users',
    status: pickString(record, 'status', 'Status') || 'Draft',
    createdBy: pickString(record, 'createdBy', 'CreatedBy') || null,
    createdOn: pickString(record, 'createdOn', 'CreatedOn') || null,
    sentBy: pickString(record, 'sentBy', 'SentBy') || null,
    sentOn: pickString(record, 'sentOn', 'SentOn') || null,
    recipientCount: pickNumber(record, 'recipientCount', 'RecipientCount'),
  }
}

function normalizeInboxItem(raw: unknown): InboxItem {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, 'id', 'Id'),
    title: pickString(record, 'title', 'Title'),
    body: pickString(record, 'body', 'Body', 'message', 'Message'),
    type: pickString(record, 'type', 'Type') || null,
    userId: pickString(record, 'userId', 'UserId', 'fk_user_ID', 'fK_user_ID') || null,
    createdOn: pickString(record, 'createdOn', 'CreatedOn', 'createdAt') || null,
    isRead: pickBoolean(record, 'isRead', 'IsRead', 'is_Read'),
  }
}

function parseListResult(
  raw: unknown,
  params: GetNotificationsParams,
): GetNotificationsResult {
  const page = params.page ?? 1
  const itemsPerPage = params.itemsPerPage ?? 10
  const record = asRecord(raw)

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(record.notifications)
      ? (record.notifications as unknown[])
      : Array.isArray(record.data)
        ? (record.data as unknown[])
        : []

  const count = pickNumber(record, 'count', 'Count', 'total', 'Total') || list.length
  const lastPage = Math.max(1, Math.ceil(count / itemsPerPage))

  return {
    notifications: list.map(normalizeNotification),
    pagination: {
      page,
      last_page: lastPage,
      items_per_page: itemsPerPage,
      total: count,
    },
  }
}

export async function getNotifications(
  params: GetNotificationsParams,
): Promise<GetNotificationsResult> {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))
  if (params.status) query.set('status', params.status)

  const endpoint = `/api/notification/list?${query.toString()}`

  try {
    const response = await apiRequest<unknown>(endpoint)
    return parseListResult(response.result ?? response, params)
  } catch {
    try {
      const entity = await apiEntityRequest<unknown>(endpoint)
      return parseListResult(entity, params)
    } catch {
      const response = await apiDataRequest<unknown[]>(endpoint)
      return {
        notifications: (response.data ?? []).map(normalizeNotification),
        pagination:
          response.payload?.pagination ??
          emptyPagination(params.page ?? 1, params.itemsPerPage ?? 10),
      }
    }
  }
}

export async function getNotificationById(id: number | string): Promise<NotificationDetails> {
  try {
    const response = await apiRequest<unknown>(`/api/notification/${id}`)
    return normalizeNotification(response.result ?? response)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/notification/${id}`)
    return normalizeNotification(entity)
  }
}

export function createNotification(payload: CreateNotificationPayload) {
  return apiRequest<unknown>('/api/notification/create', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title.trim(),
      body: payload.body.trim(),
      audience: payload.audience,
    }),
  })
}

export function sendNotification(id: number | string) {
  return apiRequest<unknown>(`/api/notification/${id}/send`, { method: 'POST' })
}

export async function getNotificationInbox(params: {
  page?: number
  itemsPerPage?: number
  userId?: string
  type?: string
}): Promise<{ items: InboxItem[]; pagination: PaginationInfo }> {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))
  if (params.userId?.trim()) query.set('userId', params.userId.trim())
  if (params.type?.trim()) query.set('type', params.type.trim())

  const endpoint = `/api/notification/inbox?${query.toString()}`
  const page = params.page ?? 1
  const itemsPerPage = params.itemsPerPage ?? 10

  try {
    const response = await apiRequest<unknown>(endpoint)
    const record = asRecord(response.result ?? response)
    const list = Array.isArray(response.result)
      ? (response.result as unknown[])
      : Array.isArray(record.inbox)
        ? (record.inbox as unknown[])
        : Array.isArray(record.items)
          ? (record.items as unknown[])
          : Array.isArray(record.data)
            ? (record.data as unknown[])
            : []
    const count = pickNumber(record, 'count', 'Count', 'total') || list.length
    return {
      items: list.map(normalizeInboxItem),
      pagination: {
        page,
        last_page: Math.max(1, Math.ceil(count / itemsPerPage)),
        items_per_page: itemsPerPage,
        total: count,
      },
    }
  } catch {
    const entity = await apiEntityRequest<unknown>(endpoint)
    const record = asRecord(entity)
    const list = Array.isArray(entity)
      ? entity
      : Array.isArray(record.inbox)
        ? (record.inbox as unknown[])
        : Array.isArray(record.items)
          ? (record.items as unknown[])
          : []
    const count = pickNumber(record, 'count', 'Count', 'total') || list.length
    return {
      items: list.map(normalizeInboxItem),
      pagination: {
        page,
        last_page: Math.max(1, Math.ceil(count / itemsPerPage)),
        items_per_page: itemsPerPage,
        total: count,
      },
    }
  }
}
