import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { submitJobRating } from '../core/jobs-api'
import type { JobRating } from '../core/types'

interface JobRatingSectionProps {
  jobId: number
  workerName?: string | null
  hasRating: boolean
  rating: JobRating | null
  disabled?: boolean
  onSubmitted: (message: string, rating: JobRating) => void
  onError: (message: string) => void
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

function StarRow({
  value,
  interactive,
  onChange,
}: {
  value: number
  interactive?: boolean
  onChange?: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-1" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        if (!interactive) {
          return (
            <Star
              key={star}
              className={cn(
                'size-5',
                filled ? 'fill-onee-gold text-onee-gold' : 'text-muted-foreground/40',
              )}
            />
          )
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange?.(star)}
            className="rounded-sm p-0.5 transition-colors hover:bg-onee-gold/10"
          >
            <Star
              className={cn(
                'size-6',
                filled ? 'fill-onee-gold text-onee-gold' : 'text-muted-foreground/40',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function JobRatingSection({
  jobId,
  workerName,
  hasRating,
  rating,
  disabled,
  onSubmitted,
  onError,
}: JobRatingSectionProps) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setSelectedRating(0)
    setFeedback('')
    setIsSubmitting(false)
  }, [jobId])

  const displayRating = rating
  const showForm = !hasRating && !displayRating

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (selectedRating < 1 || selectedRating > 5) {
      onError('Select a rating from 1 to 5 stars.')
      return
    }
    if (!feedback.trim()) {
      onError('Feedback is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitJobRating(jobId, {
        rating: selectedRating,
        feedback,
      })

      if (!result.rating) {
        onError('Rating submitted but response was incomplete.')
        return
      }

      onSubmitted(result.text || 'Rating submitted successfully.', result.rating)
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to submit rating.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (displayRating || hasRating) {
    const stars = displayRating?.rating ?? 0
    return (
      <section className="space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">Worker rating</h3>
        <StarRow value={stars} />
        <p className="text-sm whitespace-pre-wrap">
          {displayRating?.feedback || '—'}
        </p>
        <dl className="text-muted-foreground grid gap-1 text-xs">
          <div className="flex justify-between gap-3">
            <dt>Worker</dt>
            <dd className="text-foreground font-medium">
              {displayRating?.worker_Name || workerName || '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Submitted</dt>
            <dd className="text-foreground font-medium">{formatDate(displayRating?.createdOn)}</dd>
          </div>
        </dl>
      </section>
    )
  }

  if (!showForm) return null

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div>
        <h3 className="text-sm font-semibold">Rate worker</h3>
        <p className="text-muted-foreground text-xs">
          Rating for {workerName || 'the assigned worker'}. One rating per completed job.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-sm font-medium">Rating</span>
          <StarRow
            value={selectedRating}
            interactive={!disabled && !isSubmitting}
            onChange={setSelectedRating}
          />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Feedback</span>
          <textarea
            value={feedback}
            disabled={disabled || isSubmitting}
            onChange={(event) => setFeedback(event.target.value)}
            rows={3}
            required
            placeholder="Excellent work, fixed quickly."
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-50"
          />
        </label>

        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 font-semibold"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Star className="size-4" />}
          {isSubmitting ? 'Submitting…' : 'Submit rating'}
        </Button>
      </form>
    </section>
  )
}
