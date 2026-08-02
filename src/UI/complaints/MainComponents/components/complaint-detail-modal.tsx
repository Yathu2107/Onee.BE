import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquareWarning, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { COMPLAINT_STATUS_VALUES } from '../core/constants'
import { getComplaintById, updateComplaintStatus } from '../core/complaints-api'
import type { ComplaintStatus } from '../core/types'
import { ComplaintStatusBadge } from './complaints-table'

interface ComplaintDetailModalProps {
  open: boolean
  complaintId: number | null
  onClose: () => void
  onChanged: (message: string) => void
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

function isComplaintStatus(value: string): value is ComplaintStatus {
  return (COMPLAINT_STATUS_VALUES as string[]).includes(value)
}

export function ComplaintDetailModal({
  open,
  complaintId,
  onClose,
  onChanged,
}: ComplaintDetailModalProps) {
  const titleId = useId()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ComplaintStatus>('Open')
  const [adminResponse, setAdminResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const query = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => getComplaintById(complaintId!),
    enabled: open && complaintId != null,
  })

  useEffect(() => {
    if (!open || !query.data) return
    const nextStatus = isComplaintStatus(String(query.data.status))
      ? (query.data.status as ComplaintStatus)
      : 'Open'
    setStatus(nextStatus)
    setAdminResponse(query.data.admin_Response ?? '')
    setError(null)
    setIsSubmitting(false)
  }, [open, query.data])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open) return null

  const complaint = query.data
  const loadError =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? 'Failed to load complaint.'
        : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!complaintId) return

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await updateComplaintStatus(complaintId, {
        status,
        admin_Response: adminResponse,
      })
      onChanged(response.text || 'Complaint status updated.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] }),
        queryClient.invalidateQueries({ queryKey: ['complaints'] }),
      ])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update complaint.')
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
        className="bg-card relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="from-onee-cream/80 via-card to-card relative shrink-0 border-b bg-gradient-to-br px-5 pt-5 pb-4 sm:px-6">
          <div className="bg-onee-gold absolute inset-x-0 top-0 h-1" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-onee-gold/15 text-onee-gold flex size-11 shrink-0 items-center justify-center rounded-xl">
                <MessageSquareWarning className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  Complaint detail
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {complaint ? `#${complaint.id}` : 'Loading…'}
                  {complaint ? (
                    <span className="ms-2 inline-flex align-middle">
                      <ComplaintStatusBadge status={String(complaint.status)} />
                    </span>
                  ) : null}
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
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {query.isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="text-onee-gold size-6 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading complaint…</p>
              </div>
            ) : loadError ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                {loadError}
              </div>
            ) : complaint ? (
              <div className="space-y-5">
                {error ? (
                  <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : null}

                <Section title="Complaint">
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Subject
                      </p>
                      <p className="mt-1 text-sm font-semibold">{complaint.subject || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {complaint.description || '—'}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section title="Related job">
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground text-xs">Job</dt>
                      <dd className="mt-0.5 font-medium">
                        {complaint.fk_job_ID != null ? `#${complaint.fk_job_ID}` : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Created</dt>
                      <dd className="mt-0.5">{formatDate(complaint.createdOn)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground text-xs">Job problem text</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap">
                        {complaint.problem_Text || '—'}
                      </dd>
                    </div>
                  </dl>
                </Section>

                <Section title="Parties">
                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground text-xs">Customer</dt>
                      <dd className="mt-0.5 font-medium">{complaint.customer_Name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Worker</dt>
                      <dd className="mt-0.5 font-medium">{complaint.worker_Name || '—'}</dd>
                    </div>
                  </dl>
                </Section>

                <Section title="Update status">
                  <div className="space-y-4">
                    <Field label="Status" htmlFor="complaint-status" required>
                      <select
                        id="complaint-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as ComplaintStatus)}
                        disabled={isSubmitting}
                        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {COMPLAINT_STATUS_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {value === 'InReview' ? 'In Review' : value}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Admin response" htmlFor="complaint-response">
                      <textarea
                        id="complaint-response"
                        value={adminResponse}
                        onChange={(event) => setAdminResponse(event.target.value)}
                        placeholder="Issue fixed and refunded."
                        disabled={isSubmitting}
                        rows={4}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </Field>
                  </div>
                </Section>
              </div>
            ) : null}
          </div>

          <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-36 font-semibold"
              disabled={isSubmitting || query.isLoading || !complaint}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : 'Update status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-onee-black text-sm font-semibold">{title}</h3>
      {children}
    </section>
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
