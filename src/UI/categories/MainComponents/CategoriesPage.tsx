import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import { CategoriesFilters } from './components/categories-filters'
import { CategoriesPagination } from './components/categories-pagination'
import { CategoriesTable } from './components/categories-table'
import { CategoryFormModal } from './components/category-form-modal'
import { getAllCategories } from './core/categories-api'
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './core/constants'
import type { CategoryStatusFilter } from './core/types'

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1,
  last_page: 1,
  items_per_page: DEFAULT_PAGE_SIZE,
  total: 0,
}

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<CategoryStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['categories', page, debouncedSearch, status],
    queryFn: () =>
      getAllCategories({
        page,
        itemsPerPage: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === 'all' ? null : status,
      }),
    placeholderData: (previous) => previous,
  })

  const categories = data?.categories ?? []
  const pagination = data?.pagination ?? EMPTY_PAGINATION
  const errorMessage =
    error instanceof ApiError ? error.message : error ? 'Failed to load categories.' : null

  function openCreateModal() {
    setModalMode('create')
    setEditingCategoryId(null)
    setIsModalOpen(true)
  }

  function openEditModal(categoryId: number) {
    setModalMode('edit')
    setEditingCategoryId(categoryId)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingCategoryId(null)
  }

  function handleFormSuccess(message: string) {
    setSuccessMessage(message)
    setPage(1)
    void queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  return (
    <>
      <Helmet>
        <title>Worker Categories | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Worker Categories"
        description="Manage worker skill categories used across the platform."
      />

      <div className="p-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">All categories</h2>
                <p className="text-muted-foreground text-sm">
                  Add, edit, and activate worker categories.
                </p>
              </div>
              <Button type="button" onClick={openCreateModal}>
                <Plus />
                Add New
              </Button>
            </div>
            <CategoriesFilters
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
                    Showing categories
                    {isFetching && !isLoading ? ' · Updating…' : null}
                  </div>
                  <CategoriesTable
                    categories={categories}
                    isLoading={isLoading}
                    onEdit={openEditModal}
                  />
                </div>
                <CategoriesPagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryFormModal
        open={isModalOpen}
        mode={modalMode}
        categoryId={editingCategoryId}
        onClose={closeModal}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
