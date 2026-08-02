import type { PaginationInfo } from '@/lib/api-types'

export const JOB_STATUSES = [
  'Offering',
  'Accepted',
  'Ongoing',
  'Completed',
  'Cancelled',
  'Failed',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export type JobStatusFilter = 'all' | JobStatus

export interface UserListItem {
  id: string
  name: string
  email?: string | null
  phoneNumber?: string | null
}

export interface MatchedWorker {
  id: string
  name: string
  distance_Km: number
  latitude?: number
  longitude?: number
  category_Name?: string | null
  category_id?: number | null
  phoneNumber?: string | null
}

export interface FindWorkersResult {
  predicted_Category?: string | null
  category_Name?: string | null
  category_id?: number | null
  confidence?: number | null
  workers: MatchedWorker[]
}

export interface JobChatMessage {
  id?: number | string
  message: string
  senderId: string
  senderName?: string | null
  createdAt?: string | null
}

export interface JobRating {
  id: number
  rating: number
  feedback: string
  worker_Name?: string | null
  customer_Name?: string | null
  fK_worker_ID?: string | null
  fK_customer_ID?: string | null
  fK_job_ID?: number | null
  problem_Text?: string | null
  createdBy?: string | null
  createdOn?: string | null
}

export interface JobDetails {
  id: number
  problem_Text: string
  status: JobStatus | string
  fK_user_ID: string
  customer_Name?: string | null
  fK_worker_ID?: string | null
  worker_Name?: string | null
  category_Name?: string | null
  category_id?: number | null
  amount?: number | null
  cancel_Reason?: string | null
  offer_Expires_At?: string | null
  queued_Worker_Ids: string[]
  tried_Worker_Ids: string[]
  messages: JobChatMessage[]
  createdAt?: string | null
  hasRating: boolean
  rating: JobRating | null
}

export interface SubmitJobRatingPayload {
  rating: number
  feedback: string
}

export interface JobListItem {
  id: number
  problem_Text: string
  status: JobStatus | string
  customer_Name?: string | null
  worker_Name?: string | null
  category_Name?: string | null
  amount?: number | null
  offer_Expires_At?: string | null
  createdAt?: string | null
}

export interface GetAllJobsParams {
  page?: number
  itemsPerPage?: number
  search?: string
  status?: Exclude<JobStatusFilter, 'all'> | null
}

export interface GetAllJobsResult {
  jobs: JobListItem[]
  pagination: PaginationInfo
}

export interface FindWorkersPayload {
  text: string
  userId: string
}

export interface CreateJobPayload {
  text: string
  userId: string
  workerIds: string[]
}

export interface ConfirmJobPayload {
  amount: number
}

export interface CancelJobPayload {
  reason: string
}

export interface SendChatPayload {
  message: string
  senderId: string
}
