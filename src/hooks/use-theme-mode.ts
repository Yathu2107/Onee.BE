import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
  }
}
