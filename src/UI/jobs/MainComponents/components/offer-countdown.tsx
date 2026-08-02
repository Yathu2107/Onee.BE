import { useEffect, useState } from 'react'
import { getOfferSecondsLeft } from '../core/jobs-api'

interface OfferCountdownProps {
  offerExpiresAt?: string | null
  className?: string
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function OfferCountdown({ offerExpiresAt, className }: OfferCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => getOfferSecondsLeft(offerExpiresAt))

  useEffect(() => {
    setSecondsLeft(getOfferSecondsLeft(offerExpiresAt))

    const timer = window.setInterval(() => {
      setSecondsLeft(getOfferSecondsLeft(offerExpiresAt))
    }, 250)

    return () => window.clearInterval(timer)
  }, [offerExpiresAt])

  if (secondsLeft == null) {
    return <span className={className}>—</span>
  }

  const expired = secondsLeft <= 0

  return (
    <span className={className}>
      {expired ? 'Expired — waiting for next worker…' : formatSeconds(secondsLeft)}
    </span>
  )
}
