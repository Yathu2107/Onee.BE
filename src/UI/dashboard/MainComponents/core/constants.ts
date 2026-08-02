import type { TrendDays } from './types'

export const TREND_DAY_OPTIONS: { value: TrendDays; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

export const DEFAULT_TREND_DAYS: TrendDays = 30

/** Brand-aligned chart palette */
export const CHART_COLORS = [
  '#EBB407', // gold
  '#847454', // earth
  '#060605', // black
  '#FBECB3', // cream
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#64748b', // slate
] as const

export const TREND_SERIES_COLORS = {
  total: '#EBB407',
  completed: '#10b981',
  cancelled: '#ef4444',
} as const
