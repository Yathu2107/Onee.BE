import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Bell, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { AUDIENCE_OPTIONS } from '../core/constants'
import { createNotification } from '../core/notifications-api'
import type { NotificationAudience } from '../core/types'

interface CreateNotificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

interface FormState {
  title: string
  body: string
  audience: NotificationAudience
}

const INITIAL_FORM: FormState = {
  title: '',
  body: '',
  audience: 'Both',
}

export function CreateNotificationModal({
  open,
  onClose,
  onSuccess,
}: CreateNotificationModalProps) {
  const titleId = useId()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ ...INITIAL_FORM })
    setError(null)
    setIsSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open) return null

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createNotification({
        title: form.title,
        body: form.body,
        audience: form.audience,
      })
      onSuccess(response.text || 'Notification draft created.')
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create notification.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-onee-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={isSubmitting}
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
                  Create notification
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Creates a Draft broadcast. Send it later from the list.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isSubmitting}
              onClick={onClose}
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            {error ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <Field label="Title" htmlFor="notification-title" required>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Maintenance notice"
                required
                disabled={isSubmitting}
                className="h-11"
              />
            </Field>

            <Field label="Body" htmlFor="notification-body" required>
              <textarea
                id="notification-body"
                value={form.body}
                onChange={(event) => updateField('body', event.target.value)}
                placeholder="App will be offline tonight 11pm–12am"
                required
                disabled={isSubmitting}
                rows={4}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>

            <Field label="Audience" htmlFor="notification-audience" required>
              <select
                id="notification-audience"
                value={form.audience}
                onChange={(event) =>
                  updateField('audience', event.target.value as NotificationAudience)
                }
                disabled={isSubmitting}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
              >
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-36 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Creating…' : 'Create draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
    </div>
  )
}
