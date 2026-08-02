import { Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NotificationListItem } from '../core/types'

interface NotificationsTableProps {
  notifications: NotificationListItem[]
  isLoading: boolean
  sendingId: number | null
  onView: (id: number) => void
  onSend: (notification: NotificationListItem) => void
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  const isDraft = status === 'Draft'
  return (
    <span
      className={
        isDraft
          ? 'inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800'
          : 'inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
      }
    >
      {status}
    </span>
  )
}

export function NotificationsTable({
  notifications,
  isLoading,
  sendingId,
  onView,
  onSend,
}: NotificationsTableProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Loading notifications...
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No notifications found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Audience</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created On</th>
            <th className="px-4 py-3 font-medium">Sent On</th>
            <th className="px-4 py-3 font-medium">Recipients</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => {
            const isDraft = notification.status === 'Draft'
            const isSending = sendingId === notification.id

            return (
              <tr key={notification.id} className="border-border border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{notification.title || '—'}</p>
                  <p className="text-muted-foreground line-clamp-1 max-w-xs text-xs">
                    {notification.body || '—'}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{notification.audience || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={String(notification.status)} />
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatDate(notification.createdOn)}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatDate(notification.sentOn)}
                </td>
                <td className="px-4 py-3 tabular-nums">{notification.recipientCount ?? 0}</td>
                <td className="px-4 py-3 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onView(notification.id)}
                    >
                      <Eye />
                      View
                    </Button>
                    {isDraft ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSending || sendingId != null}
                        onClick={() => onSend(notification)}
                      >
                        <Send />
                        {isSending ? 'Sending…' : 'Send'}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
