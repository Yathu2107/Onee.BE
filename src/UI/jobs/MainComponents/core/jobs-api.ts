import { apiDataRequest, apiEntityRequest, apiRequest, ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import type {
  CancelJobPayload,
  ConfirmJobPayload,
  CreateJobPayload,
  FindWorkersPayload,
  FindWorkersResult,
  GetAllJobsParams,
  GetAllJobsResult,
  JobChatMessage,
  JobDetails,
  JobListItem,
  JobRating,
  JobStatus,
  MatchedWorker,
  SendChatPayload,
  SubmitJobRatingPayload,
  UserListItem,
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
    if (typeof value === 'string' && value.trim()) return value.trim()
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

function pickStringArray(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean)
    }
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value) as unknown
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item)).filter(Boolean)
        }
      } catch {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      }
    }
  }
  return []
}

function pickByKeyPattern(record: Record<string, unknown>, pattern: RegExp) {
  for (const [key, value] of Object.entries(record)) {
    if (!pattern.test(key)) continue
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  return ''
}

function pickUserId(record: Record<string, unknown>) {
  const nestedUser = asRecord(record.user ?? record.User ?? record.customer ?? record.Customer)

  return (
    pickString(
      record,
      'fK_user_ID',
      'FK_user_ID',
      'FK_User_ID',
      'fk_user_ID',
      'fk_User_ID',
      'fK_UserId',
      'FK_UserId',
      'fkUserId',
      'FkUserId',
      'userId',
      'UserId',
      'user_ID',
      'User_ID',
      'user_Id',
    ) ||
    pickString(nestedUser, 'id', 'Id', 'userId', 'UserId') ||
    pickByKeyPattern(record, /^(fk_?)?u(ser)?_?id$/i) ||
    pickByKeyPattern(record, /user.*id$/i)
  )
}

function normalizeWorker(raw: unknown): MatchedWorker {
  const record = asRecord(raw)
  return {
    id: pickString(record, 'id', 'Id', 'workerId', 'worker_ID', 'fK_worker_ID'),
    name: pickString(record, 'name', 'Name', 'worker_Name', 'workerName') || 'Worker',
    distance_Km: pickNumber(record, 'distance_Km', 'distanceKm', 'Distance_Km', 'distance') ?? 0,
    latitude: pickNumber(record, 'latitude', 'Latitude', 'lat') ?? undefined,
    longitude: pickNumber(record, 'longitude', 'Longitude', 'lng') ?? undefined,
    category_Name: pickString(record, 'category_Name', 'categoryName', 'Category_Name') || null,
    category_id: pickNumber(record, 'category_id', 'categoryId', 'Category_id'),
    phoneNumber: pickString(record, 'phoneNumber', 'PhoneNumber', 'phone') || null,
  }
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
  return null
}

function normalizeJobRating(raw: unknown): JobRating | null {
  if (raw == null || typeof raw !== 'object') return null
  const record = asRecord(raw)
  const rating = pickNumber(record, 'rating', 'Rating')
  if (rating == null) return null

  return {
    id: pickNumber(record, 'id', 'Id') ?? 0,
    rating,
    feedback: pickString(record, 'feedback', 'Feedback'),
    worker_Name: pickString(record, 'worker_Name', 'workerName', 'Worker_Name') || null,
    customer_Name:
      pickString(record, 'customer_Name', 'customerName', 'Customer_Name', 'user_Name') || null,
    fK_worker_ID:
      pickString(record, 'fK_worker_ID', 'FK_worker_ID', 'workerId', 'WorkerId') || null,
    fK_customer_ID:
      pickString(record, 'fK_customer_ID', 'FK_customer_ID', 'customerId', 'userId') || null,
    fK_job_ID: pickNumber(record, 'fK_job_ID', 'FK_job_ID', 'jobId', 'JobId'),
    problem_Text: pickString(record, 'problem_Text', 'problemText', 'Problem_Text') || null,
    createdBy: pickString(record, 'createdBy', 'CreatedBy') || null,
    createdOn: pickString(record, 'createdOn', 'CreatedOn', 'created_On') || null,
  }
}

function normalizeChatMessage(raw: unknown): JobChatMessage {
  const record = asRecord(raw)
  return {
    id: pickString(record, 'id', 'Id') || pickNumber(record, 'id', 'Id') || undefined,
    message: pickString(record, 'message', 'Message', 'text', 'Text'),
    senderId: pickString(record, 'senderId', 'SenderId', 'sender_ID', 'fK_sender_ID'),
    senderName: pickString(record, 'senderName', 'SenderName', 'sender_Name') || null,
    createdAt: pickString(record, 'createdAt', 'CreatedAt', 'created_On', 'createdOn') || null,
  }
}

export function normalizeJob(raw: unknown): JobDetails {
  const record = asRecord(raw)
  const nestedUser = asRecord(record.user ?? record.User ?? record.customer ?? record.Customer)
  const messagesRaw = record.messages ?? record.Messages ?? record.chatMessages ?? []

  const userId = pickUserId(record)

  const userName =
    pickString(
      record,
      'user_Name',
      'userName',
      'User_Name',
      'customer_Name',
      'customerName',
      'Customer_Name',
    ) ||
    pickString(nestedUser, 'name', 'Name', 'userName', 'UserName') ||
    null

  // Avoid mistaking worker id fields for user id when pattern is too broad.
  const workerId =
    pickString(
      record,
      'fK_worker_ID',
      'FK_worker_ID',
      'FK_Worker_ID',
      'fk_worker_ID',
      'fK_WorkerId',
      'fkWorkerId',
      'workerId',
      'WorkerId',
      'worker_ID',
      'Worker_ID',
    ) || null

  const rating = normalizeJobRating(record.rating ?? record.Rating)

  return {
    id: pickNumber(record, 'id', 'Id', 'jobId', 'JobId') ?? 0,
    problem_Text: pickString(record, 'problem_Text', 'problemText', 'Problem_Text', 'text', 'Text'),
    status: (pickString(record, 'status', 'Status') || 'Offering') as JobStatus | string,
    fK_user_ID: userId && userId !== workerId ? userId : '',
    customer_Name: userName,
    fK_worker_ID: workerId,
    worker_Name: pickString(record, 'worker_Name', 'workerName', 'Worker_Name') || null,
    category_Name: pickString(record, 'category_Name', 'categoryName', 'Category_Name') || null,
    category_id: pickNumber(record, 'category_id', 'categoryId', 'Category_id'),
    amount: pickNumber(record, 'amount', 'Amount'),
    cancel_Reason: pickString(record, 'cancel_Reason', 'cancelReason', 'Cancel_Reason') || null,
    offer_Expires_At:
      pickString(record, 'offer_Expires_At', 'offerExpiresAt', 'Offer_Expires_At') || null,
    queued_Worker_Ids: pickStringArray(
      record,
      'queued_Worker_Ids',
      'queuedWorkerIds',
      'Queued_Worker_Ids',
    ),
    tried_Worker_Ids: pickStringArray(
      record,
      'tried_Worker_Ids',
      'triedWorkerIds',
      'Tried_Worker_Ids',
    ),
    messages: Array.isArray(messagesRaw) ? messagesRaw.map(normalizeChatMessage) : [],
    createdAt: pickString(record, 'createdAt', 'CreatedAt', 'created_On', 'createdOn') || null,
    hasRating: pickBoolean(record, 'hasRating', 'HasRating') ?? Boolean(rating),
    rating,
  }
}

function normalizeJobListItem(raw: unknown): JobListItem {
  const job = normalizeJob(raw)
  return {
    id: job.id,
    problem_Text: job.problem_Text,
    status: job.status,
    customer_Name: job.customer_Name,
    worker_Name: job.worker_Name,
    category_Name: job.category_Name,
    amount: job.amount,
    offer_Expires_At: job.offer_Expires_At,
    createdAt: job.createdAt,
  }
}

function normalizeFindWorkersResult(raw: unknown): FindWorkersResult {
  const record = asRecord(raw)
  const workersRaw =
    record.workers ?? record.Workers ?? record.result ?? (Array.isArray(raw) ? raw : [])

  return {
    predicted_Category:
      pickString(record, 'predicted_Category', 'predictedCategory', 'category_Name', 'categoryName') ||
      null,
    category_Name: pickString(record, 'category_Name', 'categoryName', 'Category_Name') || null,
    category_id: pickNumber(record, 'category_id', 'categoryId', 'Category_id'),
    confidence: pickNumber(record, 'confidence', 'Confidence'),
    workers: Array.isArray(workersRaw)
      ? workersRaw.map(normalizeWorker).filter((worker) => worker.id)
      : [],
  }
}

function normalizeUserListItem(raw: unknown): UserListItem {
  const record = asRecord(raw)
  return {
    id: pickString(record, 'id', 'Id', 'userId', 'UserId'),
    name: pickString(record, 'name', 'Name', 'userName', 'UserName') || 'User',
    email: pickString(record, 'email', 'Email') || null,
    phoneNumber: pickString(record, 'phoneNumber', 'PhoneNumber', 'phone') || null,
  }
}

function emptyPagination(page: number, itemsPerPage: number): PaginationInfo {
  return {
    page,
    last_page: 1,
    items_per_page: itemsPerPage,
    total: 0,
  }
}

export async function getUsersForList(): Promise<UserListItem[]> {
  try {
    const response = await apiRequest<unknown>('/api/accounts/get-all-users-list/1')
    const result = response.result
    const list = Array.isArray(result)
      ? result
      : Array.isArray(asRecord(result).users)
        ? (asRecord(result).users as unknown[])
        : Array.isArray(asRecord(result).data)
          ? (asRecord(result).data as unknown[])
          : []
    return list.map(normalizeUserListItem).filter((user) => user.id)
  } catch {
    try {
      const list = await apiEntityRequest<unknown[]>('/api/accounts/get-all-users-list/1')
      return (Array.isArray(list) ? list : []).map(normalizeUserListItem).filter((user) => user.id)
    } catch {
      const response = await apiDataRequest<unknown[]>(
        '/api/accounts/get-all-accounts/1?page=1&items_per_page=100',
      )
      return (response.data ?? []).map(normalizeUserListItem).filter((user) => user.id)
    }
  }
}

export async function findWorkers(payload: FindWorkersPayload): Promise<FindWorkersResult> {
  const response = await apiRequest<unknown>('/api/job-match/find-workers', {
    method: 'POST',
    body: JSON.stringify({
      text: payload.text.trim(),
      userId: payload.userId,
    }),
  })

  return normalizeFindWorkersResult(response.result)
}

export async function createJob(payload: CreateJobPayload): Promise<JobDetails> {
  const response = await apiRequest<unknown>('/api/job/create', {
    method: 'POST',
    body: JSON.stringify({
      text: payload.text.trim(),
      userId: payload.userId,
      workerIds: payload.workerIds,
    }),
  })

  return normalizeJob(response.result)
}

export async function getJobById(id: number | string): Promise<JobDetails> {
  try {
    const response = await apiRequest<unknown>(`/api/job/${id}/get-job`)
    return normalizeJob(response.result)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/job/${id}/get-job`)
    return normalizeJob(entity)
  }
}

export async function getAllJobs(params: GetAllJobsParams): Promise<GetAllJobsResult> {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('items_per_page', String(params.itemsPerPage ?? 10))

  if (params.search?.trim()) query.set('search', params.search.trim())
  if (params.status) query.set('status', params.status)

  const endpoint = `/api/job/get-all?${query.toString()}`

  try {
    const response = await apiDataRequest<unknown[]>(endpoint)
    return {
      jobs: (response.data ?? []).map(normalizeJobListItem),
      pagination: response.payload?.pagination ?? emptyPagination(params.page ?? 1, params.itemsPerPage ?? 10),
    }
  } catch {
    const response = await apiRequest<unknown>(endpoint)
    const result = response.result
    const record = asRecord(result)
    const list = Array.isArray(result)
      ? result
      : Array.isArray(record.jobs)
        ? (record.jobs as unknown[])
        : Array.isArray(record.data)
          ? (record.data as unknown[])
          : []

    const paginationRecord = asRecord(
      record.pagination ?? asRecord(record.payload).pagination ?? {},
    )

    return {
      jobs: list.map(normalizeJobListItem),
      pagination: {
        page: Number(paginationRecord.page ?? params.page ?? 1),
        last_page: Number(paginationRecord.last_page ?? 1),
        items_per_page: Number(paginationRecord.items_per_page ?? params.itemsPerPage ?? 10),
        total: Number(paginationRecord.total ?? list.length),
      },
    }
  }
}

export function acceptJob(id: number | string) {
  return apiRequest<unknown>(`/api/job/${id}/accept`, { method: 'POST' })
}

export function cancelOffer(id: number | string) {
  return apiRequest<unknown>(`/api/job/${id}/cancel-offer`, { method: 'POST' })
}

export function confirmJob(id: number | string, payload: ConfirmJobPayload) {
  return apiRequest<unknown>(`/api/job/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ amount: payload.amount }),
  })
}

export function cancelJob(id: number | string, payload: CancelJobPayload) {
  return apiRequest<unknown>(`/api/job/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: payload.reason.trim() }),
  })
}

export function completeJob(id: number | string) {
  return apiRequest<unknown>(`/api/job/${id}/complete`, { method: 'POST' })
}

export async function getJobMessages(id: number | string): Promise<JobChatMessage[]> {
  try {
    const response = await apiRequest<unknown>(`/api/job/${id}/chat/messages`)
    const result = response.result
    const list = Array.isArray(result)
      ? result
      : Array.isArray(asRecord(result).messages)
        ? (asRecord(result).messages as unknown[])
        : []
    return list.map(normalizeChatMessage)
  } catch {
    const entity = await apiEntityRequest<unknown>(`/api/job/${id}/chat/messages`)
    const list = Array.isArray(entity)
      ? entity
      : Array.isArray(asRecord(entity).messages)
        ? (asRecord(entity).messages as unknown[])
        : []
    return list.map(normalizeChatMessage)
  }
}

export function sendJobChat(id: number | string, payload: SendChatPayload) {
  return apiRequest<unknown>(`/api/job/${id}/chat/send`, {
    method: 'POST',
    body: JSON.stringify({
      message: payload.message.trim(),
      senderId: payload.senderId,
    }),
  })
}

export async function submitJobRating(id: number | string, payload: SubmitJobRatingPayload) {
  const response = await apiRequest<unknown>(`/api/job/${id}/rating`, {
    method: 'POST',
    body: JSON.stringify({
      rating: payload.rating,
      feedback: payload.feedback.trim(),
    }),
  })

  return {
    text: response.text,
    rating: normalizeJobRating(response.result),
  }
}

export async function getJobRating(id: number | string): Promise<JobRating | null> {
  try {
    const response = await apiRequest<unknown>(`/api/job/${id}/rating`)
    return normalizeJobRating(response.result)
  } catch (err) {
    if (err instanceof ApiError) {
      const code = String(err.statusCode ?? '')
      if (code.startsWith('404') || /not found|no rating/i.test(err.message)) return null
    }
    throw err
  }
}

export function getOfferSecondsLeft(offerExpiresAt?: string | null) {
  if (!offerExpiresAt) return null
  const expires = new Date(offerExpiresAt).getTime()
  if (Number.isNaN(expires)) return null
  return Math.max(0, Math.ceil((expires - Date.now()) / 1000))
}
