import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'
import type { PaginationInfo } from '@/lib/api-types'
import { AccountFormModal } from './components/add-user-modal'
import { AssignWorkerCategoriesModal } from './components/assign-worker-categories-modal'
import { UsersFilters } from './components/users-filters'
import { UsersPagination } from './components/users-pagination'
import { UsersTable } from './components/users-table'
import { UsersTabs } from './components/users-tabs'
import { getAllAccounts } from './core/accounts-api'
import { ACCOUNT_TABS, DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './core/constants'
import type { AccountStatusFilter, AccountTypeId, AccountUserType } from './core/types'

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1,
  last_page: 1,
  items_per_page: DEFAULT_PAGE_SIZE,
  total: 0,
}

const USER_TYPE_TO_TID: Record<AccountUserType, AccountTypeId> = {
  User: '1',
  Admin: '2',
  Worker: '3',
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const [tid, setTid] = useState<AccountTypeId>('1')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<AccountStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [categoriesUserId, setCategoriesUserId] = useState<string | null>(null)
  const [categoriesWorkerName, setCategoriesWorkerName] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, tid])

  useEffect(() => {
    if (!successMessage) return

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['accounts', tid, page, debouncedSearch, status],
    queryFn: () =>
      getAllAccounts({
        tid,
        page,
        itemsPerPage: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === 'all' ? null : status,
      }),
    placeholderData: (previous) => previous,
  })

  const activeTab = ACCOUNT_TABS.find((tab) => tab.id === tid)
  const activeTabLabel = activeTab?.label ?? 'Users'
  const defaultUserType = activeTab?.userType ?? 'User'
  const accounts = data?.accounts ?? []
  const pagination = data?.pagination ?? EMPTY_PAGINATION
  const errorMessage =
    error instanceof ApiError ? error.message : error ? 'Failed to load accounts.' : null

  function openCreateModal() {
    setModalMode('create')
    setEditingAccountId(null)
    setIsModalOpen(true)
  }

  function openEditModal(accountId: string) {
    setModalMode('edit')
    setEditingAccountId(accountId)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingAccountId(null)
  }

  function handleFormSuccess(userType: AccountUserType, message: string) {
    setSuccessMessage(message)
    setTid(USER_TYPE_TO_TID[userType])
    setPage(1)
    void queryClient.invalidateQueries({ queryKey: ['accounts'] })
  }

  function openAssignCategories(accountId: string, workerName: string) {
    setCategoriesUserId(accountId)
    setCategoriesWorkerName(workerName)
  }

  function closeAssignCategories() {
    setCategoriesUserId(null)
    setCategoriesWorkerName(null)
  }

  function handleAssignCategoriesSuccess(message: string) {
    setSuccessMessage(message)
  }

  return (
    <>
      <Helmet>
        <title>User Management | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="User Management"
        description="Manage Users, Admins, and Workers Accounts."
      />

      <div className="p-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <UsersTabs value={tid} onChange={setTid} />
              <Button type="button" onClick={openCreateModal}>
                <Plus />
                Add New
              </Button>
            </div>
            <UsersFilters
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
                    Showing {activeTabLabel}
                    {isFetching && !isLoading ? ' · Updating…' : null}
                  </div>
                  <UsersTable
                    accounts={accounts}
                    isLoading={isLoading}
                    showAssignCategories={tid === '3'}
                    onEdit={openEditModal}
                    onAssignCategories={openAssignCategories}
                  />
                </div>
                <UsersPagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AccountFormModal
        open={isModalOpen}
        mode={modalMode}
        accountId={editingAccountId}
        defaultUserType={defaultUserType}
        onClose={closeModal}
        onSuccess={handleFormSuccess}
      />

      <AssignWorkerCategoriesModal
        open={Boolean(categoriesUserId)}
        userId={categoriesUserId}
        workerName={categoriesWorkerName}
        onClose={closeAssignCategories}
        onSuccess={handleAssignCategoriesSuccess}
      />
    </>
  )
}
