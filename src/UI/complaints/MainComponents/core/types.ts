import type { PaginationInfo } from '@/lib/api-types'

export type ComplaintStatus = 'Open' | 'InReview' | 'Resolved' | 'Rejected'
export type ComplaintStatusFilter = 'all' | ComplaintStatus

export interface ComplaintListItem {
  id: number
  fk_job_ID: number | null
  problem_Text: string | null
  fk_customer_ID: string | null
  customer_Name: string | null
  fk_worker_ID: string | null
  worker_Name: string | null
  subject: string
  description: string
  status: ComplaintStatus | string
  admin_Response: string | null
  createdOn: string | null
}

export interface ComplaintDetails extends ComplaintListItem {}

export interface UpdateComplaintStatusPayload {
  status: ComplaintStatus
  admin_Response: string
}

export interface GetComplaintsParams {
  page?: number
  itemsPerPage?: number
  status?: Exclude<ComplaintStatusFilter, 'all'> | null
  search?: string
}

export interface GetComplaintsResult {
  complaints: ComplaintListItem[]
  pagination: PaginationInfo
}
