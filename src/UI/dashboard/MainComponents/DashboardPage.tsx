import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle2,
  Loader2,
  Radio,
  RefreshCw,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import {
  BarChartCard,
  PieChartCard,
  TrendChartCard,
} from './components/dashboard-charts'
import { SummaryCard, SummaryCardSkeleton } from './components/summary-card'
import { DEFAULT_TREND_DAYS, TREND_DAY_OPTIONS } from './core/constants'
import { getDashboardOverview, getJobsTrend } from './core/dashboard-api'
import type { TrendDays } from './core/types'

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value)
}

export function DashboardPage() {
  const { user } = useAuth()
  const [trendDays, setTrendDays] = useState<TrendDays>(DEFAULT_TREND_DAYS)

  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: getDashboardOverview,
  })

  const trendQuery = useQuery({
    queryKey: ['dashboard-jobs-trend', trendDays],
    queryFn: () => getJobsTrend(trendDays),
  })

  const overview = overviewQuery.data
  const summary = overview?.summary
  const isLoading = overviewQuery.isLoading
  const errorMessage =
    overviewQuery.error instanceof ApiError
      ? overviewQuery.error.message
      : overviewQuery.error
        ? 'Failed to load dashboard.'
        : null

  const trendPoints = trendQuery.data?.points ?? overview?.jobsTrend ?? []
  const trendLoading = trendQuery.isFetching && !trendQuery.data

  function handleRetry() {
    void overviewQuery.refetch()
    void trendQuery.refetch()
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Dashboard"
        description={
          user
            ? `Welcome back, ${user.userName}. Live overview of users, jobs, and operations.`
            : 'Live overview of users, jobs, and operations.'
        }
      />

      <div className="space-y-5 p-5">
        {errorMessage ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Couldn’t load dashboard</p>
                <p className="text-sm opacity-90">{errorMessage}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          {isLoading || !summary ? (
            Array.from({ length: 10 }).map((_, index) => <SummaryCardSkeleton key={index} />)
          ) : (
            <>
              <SummaryCard
                title="Total Users"
                value={formatNumber(summary.totalUsers)}
                icon={Users}
                accent="gold"
              />
              <SummaryCard
                title="Total Workers"
                value={formatNumber(summary.totalWorkers)}
                icon={UserRound}
                accent="earth"
              />
              <SummaryCard
                title="Workers Online"
                value={formatNumber(summary.workersOnline)}
                icon={Radio}
                accent="emerald"
                hint="Currently online"
              />
              <SummaryCard
                title="Total Jobs"
                value={formatNumber(summary.totalJobs)}
                icon={Briefcase}
                accent="sky"
              />
              <SummaryCard
                title="Offering"
                value={formatNumber(summary.jobsOffering)}
                icon={Briefcase}
                accent="amber"
              />
              <SummaryCard
                title="Ongoing"
                value={formatNumber(summary.jobsOngoing)}
                icon={Loader2}
                accent="sky"
              />
              <SummaryCard
                title="Completed"
                value={formatNumber(summary.jobsCompleted)}
                icon={CheckCircle2}
                accent="emerald"
              />
              <SummaryCard
                title="Cancelled"
                value={formatNumber(summary.jobsCancelled)}
                icon={XCircle}
                accent="rose"
              />
              <SummaryCard
                title="Open Complaints"
                value={formatNumber(summary.openComplaints)}
                icon={AlertTriangle}
                accent="amber"
              />
              <SummaryCard
                title="Notifications Sent"
                value={formatNumber(summary.notificationsSent)}
                icon={Bell}
                accent="slate"
              />
              {summary.jobsAccepted > 0 || summary.jobsFailed > 0 ? (
                <>
                  <SummaryCard
                    title="Accepted"
                    value={formatNumber(summary.jobsAccepted)}
                    icon={CheckCircle2}
                    accent="emerald"
                  />
                  <SummaryCard
                    title="Failed"
                    value={formatNumber(summary.jobsFailed)}
                    icon={XCircle}
                    accent="rose"
                  />
                </>
              ) : null}
            </>
          )}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PieChartCard
            title="Jobs by status"
            description="Distribution of all jobs"
            data={overview?.jobsByStatus ?? []}
            loading={isLoading}
          />
          <PieChartCard
            title="Users vs Workers"
            description="Account mix by type"
            data={overview?.usersByType ?? []}
            loading={isLoading}
            donut
          />
          <BarChartCard
            title="Jobs by category"
            description="Volume per worker category"
            data={overview?.jobsByCategory ?? []}
            loading={isLoading}
          />
          <BarChartCard
            title="Ratings distribution"
            description="Count of ratings from 1 to 5"
            data={overview?.ratingsDistribution ?? []}
            loading={isLoading}
            color="#EBB407"
          />
        </section>

        <section>
          <TrendChartCard
            title="Jobs trend"
            description={`Daily job volume over the last ${trendDays} days`}
            data={trendPoints}
            loading={isLoading || trendLoading}
            action={
              <TrendDaysFilter
                value={trendDays}
                onChange={setTrendDays}
                disabled={trendQuery.isFetching}
              />
            }
          />
          {trendQuery.error ? (
            <p className="text-destructive mt-2 text-sm">
              {trendQuery.error instanceof ApiError
                ? trendQuery.error.message
                : 'Failed to refresh jobs trend.'}{' '}
              <button
                type="button"
                className="underline"
                onClick={() => void trendQuery.refetch()}
              >
                Retry
              </button>
            </p>
          ) : null}
        </section>
      </div>
    </>
  )
}

function TrendDaysFilter({
  value,
  onChange,
  disabled,
}: {
  value: TrendDays
  onChange: (days: TrendDays) => void
  disabled?: boolean
}) {
  return (
    <div className="bg-muted/60 flex shrink-0 rounded-lg p-1">
      {TREND_DAY_OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={
              active
                ? 'bg-card text-onee-black rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium'
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
