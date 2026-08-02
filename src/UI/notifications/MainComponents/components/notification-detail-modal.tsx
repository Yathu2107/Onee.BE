import { useEffect, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { getNotificationById } from '../core/notifications-api'
import type { NotificationListItem } from '../core/types'

interface NotificationDetailModalProps {
  open: boolean
  notificationId: number | null
  sending: boolean
  onClose: () => void
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

export function NotificationDetailModal({
  open,
  notificationId,
  sending,
  onClose,
  onSend,
}: NotificationDetailModalProps) {
  const titleId = useId()

  const query = useQuery({
    queryKey: ['notification', notificationId],
    queryFn: () => getNotificationById(notificationId!),
    enabled: open && notificationId != null,
  })

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !sending) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, sending, onClose])

  if (!open) return null

  const notification = query.data
  const isDraft = notification?.status === 'Draft'
  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? 'Failed to load notification.'
        : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-onee-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={sending}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="from-onee-cream/80 via-card to-card relative shrink-0 border-b bg-gradient-to-br px-5 pt-5 pb-4 sm:px-6">
          <div className="bg-onee-gold absolute inset-x-0 top-0 h-1" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-onee-gold/15 text-onee-gold flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Bell className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  Notification detail
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {notification ? `#${notification.id}` : 'Loading…'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={sending}
              onClick={onClose}
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {query.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="text-onee-gold size-6 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading notification…</p>
            </div>
          ) : errorMessage ? (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
              {errorMessage}
            </div>
          ) : notification ? (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Title
                </p>
                <p className="mt-1 text-sm font-semibold">{notification.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Body
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{notification.body}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Audience</dt>
                  <dd className="mt-0.5 font-medium">{notification.audience}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Status</dt>
                  <dd className="mt-0.5 font-medium">{notification.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Created</dt>
                  <dd className="mt-0.5">{formatDate(notification.createdOn)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Sent</dt>
                  <dd className="mt-0.5">{formatDate(notification.sentOn)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Created by</dt>
                  <dd className="mt-0.5">{notification.createdBy || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Recipients</dt>
                  <dd className="mt-0.5 tabular-nums">{notification.recipientCount ?? 0}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
          <Button type="button" variant="outline" disabled={sending} onClick={onClose}>
            Close
          </Button>
          {isDraft && notification ? (
            <Button
              type="button"
              disabled={sending}
              onClick={() => onSend(notification)}
              className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 font-semibold"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {sending ? 'Sending…' : 'Send'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
