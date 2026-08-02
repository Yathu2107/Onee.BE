import { useEffect, useId, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Briefcase, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { createJob, findWorkers, getUsersForList } from '../core/jobs-api'
import type { MatchedWorker, UserListItem } from '../core/types'

interface CreateJobModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (message: string, jobId: number) => void
}

export function CreateJobModal({ open, onClose, onSuccess }: CreateJobModalProps) {
  const titleId = useId()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [userId, setUserId] = useState('')
  const [text, setText] = useState('')
  const [workers, setWorkers] = useState<MatchedWorker[]>([])
  const [queueIds, setQueueIds] = useState<string[]>([])
  const [matchMeta, setMatchMeta] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isFinding, setIsFinding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isBusy = isFinding || isSubmitting

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadUsers() {
      setError(null)
      setUserId('')
      setText('')
      setWorkers([])
      setQueueIds([])
      setMatchMeta(null)
      setIsSubmitting(false)
      setIsFinding(false)
      setIsLoadingUsers(true)

      try {
        const list = await getUsersForList()
        if (!cancelled) setUsers(list)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load users.')
        }
      } finally {
        if (!cancelled) setIsLoadingUsers(false)
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [open])

  const queueWorkers = queueIds
    .map((id) => workers.find((worker) => worker.id === id))
    .filter((worker): worker is MatchedWorker => Boolean(worker))

  function toggleQueue(workerId: string) {
    setQueueIds((current) =>
      current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId],
    )
  }

  function moveQueue(workerId: string, direction: -1 | 1) {
    setQueueIds((current) => {
      const index = current.indexOf(workerId)
      if (index < 0) return current
      const next = index + direction
      if (next < 0 || next >= current.length) return current
      const copy = [...current]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy
    })
  }

  async function handleFindWorkers() {
    setError(null)

    if (!userId) {
      setError('Select a user.')
      return
    }
    if (!text.trim()) {
      setError('Enter the problem description.')
      return
    }

    setIsFinding(true)
    setWorkers([])
    setQueueIds([])
    setMatchMeta(null)

    try {
      const result = await findWorkers({ text, userId })
      setWorkers(result.workers)

      const category = result.category_Name || result.predicted_Category
      const confidence =
        result.confidence != null ? ` · confidence ${(result.confidence * 100).toFixed(0)}%` : ''
      setMatchMeta(
        result.workers.length === 0
          ? 'No workers available for this work.'
          : category
            ? `Matched: ${category}${confidence}`
            : `${result.workers.length} worker(s) found within 7 km.`,
      )

      if (result.workers.length > 0) {
        setQueueIds(result.workers.map((worker) => worker.id))
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to find workers.')
    } finally {
      setIsFinding(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!userId) {
      setError('Select a user.')
      return
    }
    if (!text.trim()) {
      setError('Enter the problem description.')
      return
    }
    if (queueIds.length === 0) {
      setError('Select at least one worker for the offer queue.')
      return
    }

    setIsSubmitting(true)

    try {
      const job = await createJob({
        text,
        userId,
        workerIds: queueIds,
      })

      onSuccess('Job offer created successfully.', job.id)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create job.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-onee-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={isBusy}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="from-onee-cream/80 via-card to-card relative shrink-0 border-b bg-gradient-to-br px-5 pt-5 pb-4 sm:px-6">
          <div className="bg-onee-gold absolute inset-x-0 top-0 h-1" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-onee-gold/15 text-onee-gold flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Briefcase className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  Create job request
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Find nearby workers and send an ordered offer queue.
                </p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" disabled={isBusy} onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {error ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">User & problem</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium">User</span>
                  <select
                    value={userId}
                    disabled={isBusy || isLoadingUsers}
                    onChange={(event) => setUserId(event.target.value)}
                    className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-50"
                    required
                  >
                    <option value="">
                      {isLoadingUsers ? 'Loading users…' : 'Select user…'}
                    </option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                        {user.email ? ` · ${user.email}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium">Problem description</span>
                  <textarea
                    value={text}
                    disabled={isBusy}
                    onChange={(event) => setText(event.target.value)}
                    rows={3}
                    placeholder="e.g. My laptop is not working"
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-50"
                    required
                  />
                </label>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isBusy || !userId || !text.trim()}
                onClick={() => void handleFindWorkers()}
              >
                {isFinding ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Find workers
              </Button>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Matched workers</h3>
                {matchMeta ? <p className="text-muted-foreground text-xs">{matchMeta}</p> : null}
              </div>

              {workers.length === 0 ? (
                <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                  Run Find workers to see ranked matches within 7 km.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-muted-foreground border-b">
                        <th className="px-3 py-2 font-medium">Queue</th>
                        <th className="px-3 py-2 font-medium">Worker</th>
                        <th className="px-3 py-2 font-medium">Distance</th>
                        <th className="px-3 py-2 font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((worker) => {
                        const selected = queueIds.includes(worker.id)
                        const order = selected ? queueIds.indexOf(worker.id) + 1 : null

                        return (
                          <tr key={worker.id} className="border-b last:border-0">
                            <td className="px-3 py-2">
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={isBusy}
                                  onChange={() => toggleQueue(worker.id)}
                                />
                                <span className="text-xs font-medium tabular-nums">
                                  {order ?? '—'}
                                </span>
                              </label>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium">{worker.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {worker.phoneNumber || worker.id}
                              </p>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {worker.distance_Km.toFixed(2)} km
                            </td>
                            <td className="px-3 py-2">{worker.category_Name || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {queueWorkers.length > 0 ? (
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Offer order</h3>
                  <p className="text-muted-foreground text-xs">
                    First in this list receives the initial 1-minute offer.
                  </p>
                </div>
                <ul className="space-y-2">
                  {queueWorkers.map((worker, index) => (
                    <li
                      key={worker.id}
                      className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {index + 1}. {worker.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {worker.distance_Km.toFixed(2)} km
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8"
                          disabled={isBusy || index === 0}
                          onClick={() => moveQueue(worker.id, -1)}
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8"
                          disabled={isBusy || index === queueWorkers.length - 1}
                          onClick={() => moveQueue(worker.id, 1)}
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                'bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-40 font-semibold',
              )}
              disabled={isBusy || queueIds.length === 0}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Sending…' : 'Send job request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
