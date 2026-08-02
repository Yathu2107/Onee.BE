import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import { CreateNotificationModal } from './components/create-notification-modal'
import { NotificationDetailModal } from './components/notification-detail-modal'
import { NotificationsFilters } from './components/notifications-filters'
import { NotificationsPagination } from './components/notifications-pagination'
import { NotificationsTable } from './components/notifications-table'
import { DEFAULT_PAGE_SIZE } from './core/constants'
import { getNotifications, sendNotification } from './core/notifications-api'
import type { NotificationListItem, NotificationStatusFilter } from './core/types'

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1,
  last_page: 1,
  items_per_page: DEFAULT_PAGE_SIZE,
  total: 0,
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id: routeId } = useParams<{ id?: string }>()

  const [status, setStatus] = useState<NotificationStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [status])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    if (!routeId) {
      setDetailId(null)
      return
    }
    const parsed = Number(routeId)
    if (Number.isFinite(parsed) && parsed > 0) {
      setDetailId(parsed)
    }
  }, [routeId])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['notifications', page, status],
    queryFn: () =>
      getNotifications({
        page,
        itemsPerPage: DEFAULT_PAGE_SIZE,
        status: status === 'all' ? null : status,
      }),
    placeholderData: (previous) => previous,
  })

  const notifications = data?.notifications ?? []
  const pagination = data?.pagination ?? EMPTY_PAGINATION
  const errorMessage =
    error instanceof ApiError ? error.message : error ? 'Failed to load notifications.' : null

  function openDetail(id: number) {
    setDetailId(id)
    void navigate(`/notifications/${id}`)
  }

  function closeDetail() {
    setDetailId(null)
    void navigate('/notifications')
  }

  function handleCreateSuccess(message: string) {
    setSuccessMessage(message)
    setPage(1)
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function handleSend(notification: NotificationListItem) {
    if (notification.status !== 'Draft') return

    const confirmed = window.confirm(
      `Send this notification to all matching ${notification.audience || 'Users/Workers'}?`,
    )
    if (!confirmed) return

    setSendingId(notification.id)

    try {
      const response = await sendNotification(notification.id)
      setSuccessMessage(response.text || 'Notification sent.')
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['notification', notification.id] })
    } catch (err) {
      setSuccessMessage(null)
      window.alert(err instanceof ApiError ? err.message : 'Failed to send notification.')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Notifications | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Notifications"
        description="Create draft broadcasts and send them to Users, Workers, or Both."
      />

      <div className="p-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Broadcast notifications</h2>
                <p className="text-muted-foreground text-sm">
                  Draft messages stay unpublished until you send them.
                </p>
              </div>
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <Plus />
                Create
              </Button>
            </div>
            <NotificationsFilters status={status} onStatusChange={setStatus} />
            {successMessage ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {errorMessage ? (
              <div className="text-destructive flex h-48 items-center justify-center px-5 text-sm">
                {errorMessage}
              </div>
            ) : (
              <>
                <div className="px-1">
                  <div className="text-muted-foreground mb-2 px-4 text-xs">
                    Showing notifications
                    {isFetching && !isLoading ? ' · Updating…' : null}
                  </div>
                  <NotificationsTable
                    notifications={notifications}
                    isLoading={isLoading}
                    sendingId={sendingId}
                    onView={openDetail}
                    onSend={handleSend}
                  />
                </div>
                <NotificationsPagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateNotificationModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <NotificationDetailModal
        open={detailId != null}
        notificationId={detailId}
        sending={sendingId != null && sendingId === detailId}
        onClose={closeDetail}
        onSend={handleSend}
      />
    </>
  )
}
