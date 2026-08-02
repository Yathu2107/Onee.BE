export interface ChartPoint {
  label: string
  value: number
  categoryId?: number | null
}

export interface TrendPoint {
  date: string
  label: string
  total: number
  completed: number
  cancelled: number
}

export interface DashboardSummary {
  totalUsers: number
  totalWorkers: number
  workersOnline: number
  totalJobs: number
  jobsOffering: number
  jobsAccepted: number
  jobsOngoing: number
  jobsCompleted: number
  jobsCancelled: number
  jobsFailed: number
  openComplaints: number
  avgRating: number
  totalRatings: number
  notificationsSent: number
}

export interface DashboardOverview {
  summary: DashboardSummary
  jobsByStatus: ChartPoint[]
  usersByType: ChartPoint[]
  jobsByCategory: ChartPoint[]
  complaintsByStatus: ChartPoint[]
  ratingsDistribution: ChartPoint[]
  jobsTrend: TrendPoint[]
}

export interface JobsTrendResult {
  days: number
  points: TrendPoint[]
}

export type TrendDays = 7 | 30 | 90
