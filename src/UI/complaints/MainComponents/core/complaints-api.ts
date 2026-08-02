import { apiDataRequest, apiEntityRequest, apiRequest } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import type {
  ComplaintDetails,
  ComplaintListItem,
  GetComplaintsParams,
  GetComplaintsResult,
  UpdateComplaintStatusPayload,
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
  return null
}

function emptyPagination(page: number, itemsPerPage: number): PaginationInfo {
  return {
    page,
    last_page: 1,
    items_per_page: itemsPerPage,
    total: 0,
  }
}

export function normalizeComplaint(raw: unknown): ComplaintListItem {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, 'id', 'Id') ?? 0,
    fk_job_ID: pickNumber(record, 'fk_job_ID', 'fK_job_ID', 'FK_job_ID', 'jobId', 'JobId'),
    problem_Text:
      pickString(record, 'problem_Text', 'problemText', 'Problem_Text') || null,
    fk_customer_ID:
      pickString(record, 'fk_customer_ID', 'fK_customer_ID', 'customerId', 'CustomerId') || null,
    customer_Name:
      pickString(record, 'customer_Name', 'customerName', 'Customer_Name') || null,
    fk_worker_ID:
      pickString(record, 'fk_worker_ID', 'fK_worker_ID', 'workerId', 'WorkerId') || null,
    worker_Name: pickString(record, 'worker_Name', 'workerName', 'Worker_Name') || null,
    subject: pickString(record, 'subject', 'Subject'),
    description: pickString(record, 'description', 'Description'),
    status: pickString(record, 'status', 'Status') || 'Open',
    admin_Response:
      pickString(record, 'admin_Response', 'adminResponse', 'Admin_Response') || null,
    createdOn: pickString(record, 'createdOn', 'CreatedOn', 'createdAt') || null,
  }
}

function parseListResult(raw: unknown, params: GetComplaintsParams): GetComplaintsResult {
  const page = params.page ?? 1
  const itemsPerPage = params.itemsPerPage ?? 10
  const record = asRecord(raw)

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(record.complaints)
      ? (record.complaints as unknown[])
      : Array.isArray(record.data)
        ? (record.data as unknown[])
        : []

  const count = pickNumber(record, 'count', 'Count', 'total', 'Total') ?? list.length
  const lastPage = Math.max(1, Math.ceil(count / itemsPerPage))

  return {
    complaints: list.map(normalizeComplaint),
    pagination: {
      page,
      last_page: lastPage,
      items_per_page: itemsPerPage,
      total: count,
    },
  }
}

export async function getComplaints(params: GetComplaintsParams): Promise<GetComplaintsResult> {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))
  if (params.status) query.set('status', params.status)
  if (params.search?.trim()) query.set('search', params.search.trim())

  const endpoint = `/api/complaint/list?${query.toString()}`

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
        complaints: (response.data ?? []).map(normalizeComplaint),
        pagination:
          response.payload?.pagination ??
          emptyPagination(params.page ?? 1, params.itemsPerPage ?? 10),
      }
    }
  }
}

export async function getComplaintById(id: number | string): Promise<ComplaintDetails> {
  try {
    const response = await apiRequest<unknown>(`/api/complaint/${id}`)
    return normalizeComplaint(response.result ?? response)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/complaint/${id}`)
    return normalizeComplaint(entity)
  }
}

export function updateComplaintStatus(
  id: number | string,
  payload: UpdateComplaintStatusPayload,
) {
  return apiRequest<unknown>(`/api/complaint/${id}/update-status`, {
    method: 'PUT',
    body: JSON.stringify({
      status: payload.status,
      admin_Response: payload.admin_Response.trim(),
    }),
  })
}
