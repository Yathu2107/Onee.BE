import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import {
  JOB_POLL_INTERVAL_MS,
  canChat,
  isTerminalStatus,
} from '../core/constants'
import {
  acceptJob,
  cancelJob,
  cancelOffer,
  completeJob,
  confirmJob,
  getJobById,
  getJobMessages,
  getOfferSecondsLeft,
  getUsersForList,
  sendJobChat,
} from '../core/jobs-api'
import type { JobRating } from '../core/types'
import { JobRatingSection } from './job-rating-section'
import { JobStatusBadge } from './job-status-badge'
import { OfferCountdown } from './offer-countdown'

interface JobDetailModalProps {
  open: boolean
  jobId: number | null
  onClose: () => void
  onChanged: (message: string) => void
}

export function JobDetailModal({ open, jobId, onClose, onChanged }: JobDetailModalProps) {
  const titleId = useId()
  const queryClient = useQueryClient()
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)
  const [amount, setAmount] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [senderRole, setSenderRole] = useState<'user' | 'worker'>('user')
  const [localRating, setLocalRating] = useState<JobRating | null>(null)

  const jobQuery = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId!),
    enabled: open && jobId != null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status || isTerminalStatus(String(status))) return false
      return JOB_POLL_INTERVAL_MS
    },
  })

  const job = jobQuery.data
  const chatEnabled = job ? canChat(String(job.status)) : false

  const usersQuery = useQuery({
    queryKey: ['users-list-for-chat'],
    queryFn: getUsersForList,
    enabled: open && chatEnabled && Boolean(job) && !job?.fK_user_ID,
    staleTime: 60_000,
  })

  const resolvedUserId = useMemo(() => {
    if (job?.fK_user_ID) return job.fK_user_ID

    const userName = job?.customer_Name?.trim().toLowerCase()
    if (!userName || !usersQuery.data?.length) return ''

    const match = usersQuery.data.find(
      (user) => user.name.trim().toLowerCase() === userName,
    )
    return match?.id ?? ''
  }, [job?.fK_user_ID, job?.customer_Name, usersQuery.data])

  const resolvedWorkerId = job?.fK_worker_ID ?? ''

  const messagesQuery = useQuery({
    queryKey: ['job-messages', jobId],
    queryFn: () => getJobMessages(jobId!),
    enabled: open && jobId != null && chatEnabled,
    refetchInterval: chatEnabled ? JOB_POLL_INTERVAL_MS : false,
  })

  const messages = useMemo(() => {
    if (messagesQuery.data && messagesQuery.data.length > 0) return messagesQuery.data
    return job?.messages ?? []
  }, [messagesQuery.data, job?.messages])

  useEffect(() => {
    if (!open) return
    setActionError(null)
    setIsActing(false)
    setAmount('')
    setCancelReason('')
    setChatMessage('')
    setSenderRole('user')
    setLocalRating(null)
  }, [open, jobId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, open])

  const secondsLeft = getOfferSecondsLeft(job?.offer_Expires_At)
  const acceptDisabled =
    isActing || !job || job.status !== 'Offering' || (secondsLeft != null && secondsLeft <= 0)

  async function runAction(action: () => Promise<{ text?: string }>, fallbackMessage: string) {
    setActionError(null)
    setIsActing(true)
    try {
      const response = await action()
      const message = response.text || fallbackMessage
      onChanged(message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['job-messages', jobId] }),
      ])
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setIsActing(false)
    }
  }

  async function handleAccept() {
    if (!jobId) return
    await runAction(() => acceptJob(jobId), 'Offer accepted.')
  }

  async function handleCancelOffer() {
    if (!jobId) return
    await runAction(() => cancelOffer(jobId), 'Offer cancelled. Moving to next worker.')
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault()
    if (!jobId) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setActionError('Enter a valid amount greater than 0.')
      return
    }
    await runAction(() => confirmJob(jobId, { amount: value }), 'Job confirmed. Status Ongoing.')
  }

  async function handleCancelJob(event: FormEvent) {
    event.preventDefault()
    if (!jobId) return
    if (!cancelReason.trim()) {
      setActionError('Cancel reason is required.')
      return
    }
    await runAction(
      () => cancelJob(jobId, { reason: cancelReason }),
      'Job cancelled.',
    )
  }

  async function handleComplete() {
    if (!jobId) return
    await runAction(() => completeJob(jobId), 'Job completed.')
  }

  async function handleSendChat(event: FormEvent) {
    event.preventDefault()
    if (!jobId || !job) return
    if (!chatMessage.trim()) return

    const senderId = senderRole === 'user' ? resolvedUserId : resolvedWorkerId
    if (!senderId) {
      setActionError(
        senderRole === 'worker'
          ? 'No current worker assigned to send as.'
          : 'User id missing on this job.',
      )
      return
    }

    setActionError(null)
    setIsActing(true)
    try {
      await sendJobChat(jobId, { message: chatMessage, senderId })
      setChatMessage('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
        queryClient.invalidateQueries({ queryKey: ['job-messages', jobId] }),
      ])
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to send message.')
    } finally {
      setIsActing(false)
    }
  }

  if (!open) return null

  const loadError =
    jobQuery.error instanceof ApiError
      ? jobQuery.error.message
      : jobQuery.error
        ? 'Failed to load job.'
        : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-onee-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={isActing}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="from-onee-cream/80 via-card to-card relative shrink-0 border-b bg-gradient-to-br px-5 pt-5 pb-4 sm:px-6">
          <div className="bg-onee-gold absolute inset-x-0 top-0 h-1" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  Job #{jobId}
                </h2>
                {job ? <JobStatusBadge status={String(job.status)} /> : null}
              </div>
              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                {job?.problem_Text || 'Job details and live offer controls.'}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" disabled={isActing} onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {jobQuery.isLoading ? (
            <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 text-sm">
              <Loader2 className="size-5 animate-spin" />
              Loading job…
            </div>
          ) : loadError ? (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
              {loadError}
            </div>
          ) : job ? (
            <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="space-y-5">
                {actionError ? (
                  <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {actionError}
                  </div>
                ) : null}

                {job.status === 'Failed' ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    No workers available / no one accepted.
                  </div>
                ) : null}

                <section className="space-y-3 rounded-xl border p-4">
                  <h3 className="text-sm font-semibold">Summary</h3>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">User</dt>
                      <dd className="text-end font-medium">{job.customer_Name || job.fK_user_ID}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Current worker</dt>
                      <dd className="text-end font-medium">
                        {job.worker_Name || job.fK_worker_ID || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="text-end font-medium">{job.category_Name || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="text-end font-medium">
                        {job.amount != null ? job.amount.toLocaleString() : '—'}
                      </dd>
                    </div>
                    {job.cancel_Reason ? (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Cancel reason</dt>
                        <dd className="text-end font-medium">{job.cancel_Reason}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                {job.status === 'Completed' ? (
                  <JobRatingSection
                    jobId={job.id}
                    workerName={job.worker_Name}
                    hasRating={Boolean(job.hasRating || job.rating || localRating)}
                    rating={localRating ?? job.rating}
                    disabled={isActing}
                    onError={setActionError}
                    onSubmitted={(message, rating) => {
                      setActionError(null)
                      setLocalRating(rating)
                      onChanged(message)
                      void queryClient.invalidateQueries({ queryKey: ['job', jobId] })
                      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
                    }}
                  />
                ) : null}

                {job.status === 'Offering' ? (
                  <section className="space-y-3 rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">Offer window</h3>
                      <OfferCountdown
                        offerExpiresAt={job.offer_Expires_At}
                        className="text-onee-black text-sm font-semibold tabular-nums"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Queued: {job.queued_Worker_Ids.length || 0} · Tried:{' '}
                      {job.tried_Worker_Ids.length || 0}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={acceptDisabled}
                        className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 font-semibold"
                        onClick={() => void handleAccept()}
                      >
                        {isActing ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp />}
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isActing}
                        onClick={() => void handleCancelOffer()}
                      >
                        <ThumbsDown />
                        Cancel offer
                      </Button>
                    </div>
                  </section>
                ) : null}

                {job.status === 'Accepted' ? (
                  <section className="space-y-4 rounded-xl border p-4">
                    <h3 className="text-sm font-semibold">After accept</h3>
                    <form onSubmit={handleConfirm} className="space-y-2">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium">Confirm amount</span>
                        <Input
                          type="number"
                          min="1"
                          step="any"
                          value={amount}
                          disabled={isActing}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="e.g. 2500"
                        />
                      </label>
                      <Button
                        type="submit"
                        disabled={isActing}
                        className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 font-semibold"
                      >
                        {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 />}
                        Confirm → Ongoing
                      </Button>
                    </form>

                    <form onSubmit={handleCancelJob} className="space-y-2 border-t pt-4">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium">Cancel with reason</span>
                        <textarea
                          value={cancelReason}
                          disabled={isActing}
                          onChange={(event) => setCancelReason(event.target.value)}
                          rows={2}
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-50"
                          placeholder="User rejected amount"
                        />
                      </label>
                      <Button type="submit" variant="destructive" disabled={isActing}>
                        <XCircle />
                        Cancel job
                      </Button>
                    </form>
                  </section>
                ) : null}

                {job.status === 'Ongoing' ? (
                  <section className="space-y-3 rounded-xl border p-4">
                    <h3 className="text-sm font-semibold">Ongoing</h3>
                    <Button
                      type="button"
                      disabled={isActing}
                      className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 font-semibold"
                      onClick={() => void handleComplete()}
                    >
                      {isActing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 />}
                      Complete job
                    </Button>
                  </section>
                ) : null}
              </div>

              <section className="flex h-[530px] max-h-[530px] flex-col overflow-hidden rounded-xl border">
                <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
                  <MessageSquare className="text-onee-gold size-4" />
                  <h3 className="text-sm font-semibold">Chat</h3>
                  {!chatEnabled ? (
                    <span className="text-muted-foreground ms-auto text-xs">
                      Available when Accepted or Ongoing
                    </span>
                  ) : null}
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">No messages yet.</p>
                  ) : (
                    messages.map((message, index) => {
                      const normalizedSenderName = message.senderName?.trim().toLowerCase() ?? ''
                      const normalizedUserName = job.customer_Name?.trim().toLowerCase() ?? ''
                      const normalizedWorkerName = job.worker_Name?.trim().toLowerCase() ?? ''
                      const isUserById =
                        Boolean(resolvedUserId) && message.senderId === resolvedUserId
                      const isWorkerById =
                        Boolean(resolvedWorkerId) && message.senderId === resolvedWorkerId
                      const isUserByName =
                        Boolean(normalizedUserName) && normalizedSenderName === normalizedUserName
                      const isWorkerByName =
                        Boolean(normalizedWorkerName) &&
                        normalizedSenderName === normalizedWorkerName

                      const isUser = isUserById || (!isWorkerById && isUserByName)
                      return (
                        <div
                          key={String(message.id ?? `${message.senderId}-${index}`)}
                          className={cn(
                            'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                            isUser
                              ? 'bg-muted ms-0'
                              : 'bg-onee-gold/15 text-onee-black ms-auto',
                          )}
                        >
                          <p className="text-muted-foreground mb-0.5 text-[11px] font-medium">
                            {message.senderName ||
                              (isUser || !isWorkerByName
                                ? job.customer_Name || 'User'
                                : job.worker_Name || 'Worker')}
                          </p>
                          <p className="break-words whitespace-pre-wrap">{message.message}</p>
                        </div>
                      )
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendChat} className="shrink-0 space-y-2 border-t px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!chatEnabled || isActing}
                      onClick={() => setSenderRole('user')}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium',
                        senderRole === 'user'
                          ? 'bg-onee-gold/20 text-onee-black'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      As user
                    </button>
                    <button
                      type="button"
                      disabled={!chatEnabled || isActing || !resolvedWorkerId}
                      onClick={() => setSenderRole('worker')}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium',
                        senderRole === 'worker'
                          ? 'bg-onee-gold/20 text-onee-black'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      As worker
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      disabled={!chatEnabled || isActing}
                      onChange={(event) => setChatMessage(event.target.value)}
                      placeholder={
                        chatEnabled ? 'Type a message…' : 'Chat locked until Accepted'
                      }
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!chatEnabled || isActing || !chatMessage.trim()}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
