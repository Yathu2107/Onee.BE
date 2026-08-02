import type { PaginationInfo } from '@/lib/api-types'

export type NotificationAudience = 'Users' | 'Workers' | 'Both'
export type NotificationStatus = 'Draft' | 'Sent'
export type NotificationStatusFilter = 'all' | NotificationStatus

export interface NotificationListItem {
  id: number
  title: string
  body: string
  audience: NotificationAudience | string
  status: NotificationStatus | string
  createdBy: string | null
  createdOn: string | null
  sentBy: string | null
  sentOn: string | null
  recipientCount: number
}

export interface NotificationDetails extends NotificationListItem {}

export interface CreateNotificationPayload {
  title: string
  body: string
  audience: NotificationAudience
}

export interface GetNotificationsParams {
  page?: number
  itemsPerPage?: number
  status?: Exclude<NotificationStatusFilter, 'all'> | null
}

export interface GetNotificationsResult {
  notifications: NotificationListItem[]
  pagination: PaginationInfo
}

export interface InboxItem {
  id: number
  title: string
  body: string
  type: string | null
  userId: string | null
  createdOn: string | null
  isRead: boolean
}
