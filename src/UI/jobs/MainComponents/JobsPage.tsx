import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import { CreateJobModal } from './components/create-job-modal'
import { JobDetailModal } from './components/job-detail-modal'
import { JobsFilters } from './components/jobs-filters'
import { JobsPagination } from './components/jobs-pagination'
import { JobsTable } from './components/jobs-table'
import { getAllJobs } from './core/jobs-api'
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './core/constants'
import type { JobStatusFilter } from './core/types'

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1,
  last_page: 1,
  items_per_page: DEFAULT_PAGE_SIZE,
  total: 0,
}

export function JobsPage() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<JobStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [detailJobId, setDetailJobId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', page, debouncedSearch, status],
    queryFn: () =>
      getAllJobs({
        page,
        itemsPerPage: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === 'all' ? null : status,
      }),
    placeholderData: (previous) => previous,
    refetchInterval: status === 'Offering' || status === 'all' ? 5000 : false,
  })

  const jobs = data?.jobs ?? []
  const pagination = data?.pagination ?? EMPTY_PAGINATION
  const errorMessage =
    error instanceof ApiError ? error.message : error ? 'Failed to load jobs.' : null

  function handleCreateSuccess(message: string, jobId: number) {
    setSuccessMessage(message)
    setPage(1)
    void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    setDetailJobId(jobId)
  }

  function handleDetailChanged(message: string) {
    setSuccessMessage(message)
    void queryClient.invalidateQueries({ queryKey: ['jobs'] })
  }

  return (
    <>
      <Helmet>
        <title>Jobs | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Job Dispatch"
        description="Match users to nearby workers, manage offers, chat, and complete jobs."
      />

      <div className="p-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">All jobs</h2>
                <p className="text-muted-foreground text-sm">
                  Create requests, advance offers, and monitor job status.
                </p>
              </div>
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <Plus />
                Create Job
              </Button>
            </div>
            <JobsFilters
              search={searchInput}
              status={status}
              onSearchChange={setSearchInput}
              onStatusChange={setStatus}
            />
            {successMessage ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {errorMessage ? (
              <div className="text-destructive flex h-48 items-center justify-center px-5 text-sm">
                {errorMessage}
              </div>
            ) : (
              <>
                <div className="px-1">
                  <div className="text-muted-foreground mb-2 px-4 text-xs">
                    Showing jobs
                  </div>
                  <JobsTable
                    jobs={jobs}
                    isLoading={isLoading}
                    onOpen={setDetailJobId}
                  />
                </div>
                <JobsPagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateJobModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <JobDetailModal
        open={detailJobId != null}
        jobId={detailJobId}
        onClose={() => setDetailJobId(null)}
        onChanged={handleDetailChanged}
      />
    </>
  )
}
