import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import { ComplaintDetailModal } from './components/complaint-detail-modal'
import { ComplaintsFilters } from './components/complaints-filters'
import { ComplaintsPagination } from './components/complaints-pagination'
import { ComplaintsTable } from './components/complaints-table'
import { getComplaints } from './core/complaints-api'
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './core/constants'
import type { ComplaintStatusFilter } from './core/types'

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1,
  last_page: 1,
  items_per_page: DEFAULT_PAGE_SIZE,
  total: 0,
}

export function ComplaintsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id: routeId } = useParams<{ id?: string }>()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<ComplaintStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<number | null>(null)
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

  useEffect(() => {
    if (!routeId) {
      setDetailId(null)
      return
    }
    const parsed = Number(routeId)
    if (Number.isFinite(parsed) && parsed > 0) {
      setDetailId(parsed)
    }
  }, [routeId])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['complaints', page, debouncedSearch, status],
    queryFn: () =>
      getComplaints({
        page,
        itemsPerPage: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === 'all' ? null : status,
      }),
    placeholderData: (previous) => previous,
  })

  const complaints = data?.complaints ?? []
  const pagination = data?.pagination ?? EMPTY_PAGINATION
  const errorMessage =
    error instanceof ApiError ? error.message : error ? 'Failed to load complaints.' : null

  function openDetail(id: number) {
    setDetailId(id)
    void navigate(`/complaints/${id}`)
  }

  function closeDetail() {
    setDetailId(null)
    void navigate('/complaints')
  }

  function handleChanged(message: string) {
    setSuccessMessage(message)
    void queryClient.invalidateQueries({ queryKey: ['complaints'] })
  }

  return (
    <>
      <Helmet>
        <title>Complaints | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Complaints"
        description="Review and resolve customer complaints filed from the mobile app."
      />

      <div className="p-5">
        <Card>
          <CardHeader className="gap-4">
            <div>
              <h2 className="text-base font-semibold">All complaints</h2>
              <p className="text-muted-foreground text-sm">
                Filter by status, open a complaint, and update the admin response.
              </p>
            </div>
            <ComplaintsFilters
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
                    Showing complaints
                    {isFetching && !isLoading ? ' · Updating…' : null}
                  </div>
                  <ComplaintsTable
                    complaints={complaints}
                    isLoading={isLoading}
                    onOpen={openDetail}
                  />
                </div>
                <ComplaintsPagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ComplaintDetailModal
        open={detailId != null}
        complaintId={detailId}
        onClose={closeDetail}
        onChanged={handleChanged}
      />
    </>
  )
}
