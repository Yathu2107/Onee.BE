import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useProgress() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTimer = window.setTimeout(() => setProgress(30), 0)
    const finishTimer = window.setTimeout(() => setProgress(100), 300)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(finishTimer)
    }
  }, [location.pathname])

  return { progress }
}
