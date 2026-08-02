import { apiRequest } from '@/lib/api-client'
import type {
  ChartPoint,
  DashboardOverview,
  DashboardSummary,
  JobsTrendResult,
  TrendDays,
  TrendPoint,
} from './types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function findKey(record: Record<string, unknown>, ...keys: string[]) {
  const entries = Object.entries(record)
  for (const key of keys) {
    if (key in record) return key
    const match = entries.find(([entryKey]) => entryKey.toLowerCase() === key.toLowerCase())
    if (match) return match[0]
  }
  return null
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }
  return 0
}

function pickString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  return ''
}

function pickArray(record: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const resolved = findKey(record, key)
    if (!resolved) continue
    const value = record[resolved]
    if (Array.isArray(value)) return value
  }
  return []
}

function normalizeChartPoint(raw: unknown): ChartPoint {
  const record = asRecord(raw)
  return {
    label: pickString(record, 'label', 'Label', 'name', 'Name') || '—',
    value: pickNumber(record, 'value', 'Value', 'count', 'Count'),
    categoryId: (() => {
      const id = pickNumber(record, 'categoryId', 'CategoryId', 'category_id')
      return id || null
    })(),
  }
}

function normalizeTrendPoint(raw: unknown): TrendPoint {
  const record = asRecord(raw)
  return {
    date: pickString(record, 'date', 'Date'),
    label: pickString(record, 'label', 'Label') || pickString(record, 'date', 'Date') || '—',
    total: pickNumber(record, 'total', 'Total'),
    completed: pickNumber(record, 'completed', 'Completed'),
    cancelled: pickNumber(record, 'cancelled', 'Cancelled'),
  }
}

function emptySummary(): DashboardSummary {
  return {
    totalUsers: 0,
    totalWorkers: 0,
    workersOnline: 0,
    totalJobs: 0,
    jobsOffering: 0,
    jobsAccepted: 0,
    jobsOngoing: 0,
    jobsCompleted: 0,
    jobsCancelled: 0,
    jobsFailed: 0,
    openComplaints: 0,
    avgRating: 0,
    totalRatings: 0,
    notificationsSent: 0,
  }
}

function normalizeSummary(raw: unknown): DashboardSummary {
  const record = asRecord(raw)
  return {
    totalUsers: pickNumber(record, 'totalUsers', 'TotalUsers'),
    totalWorkers: pickNumber(record, 'totalWorkers', 'TotalWorkers'),
    workersOnline: pickNumber(record, 'workersOnline', 'WorkersOnline'),
    totalJobs: pickNumber(record, 'totalJobs', 'TotalJobs'),
    jobsOffering: pickNumber(record, 'jobsOffering', 'JobsOffering'),
    jobsAccepted: pickNumber(record, 'jobsAccepted', 'JobsAccepted'),
    jobsOngoing: pickNumber(record, 'jobsOngoing', 'JobsOngoing'),
    jobsCompleted: pickNumber(record, 'jobsCompleted', 'JobsCompleted'),
    jobsCancelled: pickNumber(record, 'jobsCancelled', 'JobsCancelled'),
    jobsFailed: pickNumber(record, 'jobsFailed', 'JobsFailed'),
    openComplaints: pickNumber(record, 'openComplaints', 'OpenComplaints'),
    avgRating: pickNumber(record, 'avgRating', 'AvgRating'),
    totalRatings: pickNumber(record, 'totalRatings', 'TotalRatings'),
    notificationsSent: pickNumber(record, 'notificationsSent', 'NotificationsSent'),
  }
}

export function normalizeOverview(raw: unknown): DashboardOverview {
  const record = asRecord(raw)
  return {
    summary: normalizeSummary(record.summary ?? record.Summary),
    jobsByStatus: pickArray(record, 'jobsByStatus', 'JobsByStatus').map(normalizeChartPoint),
    usersByType: pickArray(record, 'usersByType', 'UsersByType').map(normalizeChartPoint),
    jobsByCategory: pickArray(record, 'jobsByCategory', 'JobsByCategory').map(normalizeChartPoint),
    complaintsByStatus: pickArray(record, 'complaintsByStatus', 'ComplaintsByStatus').map(
      normalizeChartPoint,
    ),
    ratingsDistribution: pickArray(record, 'ratingsDistribution', 'RatingsDistribution').map(
      normalizeChartPoint,
    ),
    jobsTrend: pickArray(record, 'jobsTrend', 'JobsTrend').map(normalizeTrendPoint),
  }
}

function normalizeJobsTrend(raw: unknown, days: number): JobsTrendResult {
  const record = asRecord(raw)
  const pointsRaw = pickArray(record, 'points', 'Points', 'jobsTrend', 'JobsTrend')
  return {
    days: pickNumber(record, 'days', 'Days') || days,
    points: pointsRaw.map(normalizeTrendPoint),
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await apiRequest<unknown>('/api/dashboard/overview')
  if (!response.result) return { ...normalizeOverview({}), summary: emptySummary() }
  return normalizeOverview(response.result)
}

export async function getJobsTrend(days: TrendDays = 30): Promise<JobsTrendResult> {
  const response = await apiRequest<unknown>(`/api/dashboard/jobs-trend?days=${days}`)
  return normalizeJobsTrend(response.result ?? {}, days)
}
