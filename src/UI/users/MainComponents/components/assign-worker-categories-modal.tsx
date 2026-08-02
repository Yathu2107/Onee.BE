import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { Layers, Loader2, Tags, X } from 'lucide-react'
import { getCategoriesForList } from '@/UI/categories/MainComponents/core/categories-api'
import type { CategoryOption } from '@/UI/categories/MainComponents/core/types'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { getWorkerCategories, saveWorkerCategories } from '../core/accounts-api'

interface AssignWorkerCategoriesModalProps {
  open: boolean
  userId: string | null
  workerName?: string | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function AssignWorkerCategoriesModal({
  open,
  userId,
  workerName,
  onClose,
  onSuccess,
}: AssignWorkerCategoriesModalProps) {
  const titleId = useId()
  const selectId = useId()
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isBusy = isLoading || isSubmitting

  const selectedCategories = useMemo(
    () =>
      selectedIds
        .map((id) => allCategories.find((category) => category.id === id))
        .filter((category): category is CategoryOption => Boolean(category)),
    [allCategories, selectedIds],
  )

  const availableCategories = useMemo(
    () => allCategories.filter((category) => !selectedIds.includes(category.id)),
    [allCategories, selectedIds],
  )

  useEffect(() => {
    if (!open || !userId) return

    let cancelled = false

    async function loadCategories() {
      setError(null)
      setIsSubmitting(false)
      setAllCategories([])
      setSelectedIds([])
      setIsLoading(true)

      try {
        const [list, assigned] = await Promise.all([
          getCategoriesForList(),
          getWorkerCategories(userId!),
        ])

        if (cancelled) return

        const options = Array.isArray(list) ? list : []
        const assignedOptions: CategoryOption[] = assigned.map((item) => ({
          id: item.category_id,
          category_Name: item.category_Name,
        }))

        const merged = [...options]
        for (const option of assignedOptions) {
          if (!merged.some((item) => item.id === option.id)) {
            merged.push(option)
          }
        }

        setAllCategories(merged)
        setSelectedIds(assignedOptions.map((item) => item.id))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load worker categories.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [open, userId])

  function handleSelectCategory(value: string) {
    const categoryId = Number(value)
    if (!Number.isFinite(categoryId) || selectedIds.includes(categoryId)) return

    setSelectedIds((current) => [...current, categoryId])
  }

  function handleRemoveCategory(categoryId: number) {
    setSelectedIds((current) => current.filter((id) => id !== categoryId))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId) return

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await saveWorkerCategories({
        fk_user_ID: userId,
        category_ids: selectedIds,
      })

      onSuccess(response.text || 'Worker categories updated successfully.')
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save worker categories.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-onee-black/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={isBusy}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="from-onee-cream/80 via-card to-card relative shrink-0 border-b bg-gradient-to-br px-5 pt-5 pb-4 sm:px-6">
          <div className="bg-onee-gold absolute inset-x-0 top-0 h-1" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="bg-onee-gold/15 text-onee-gold flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Tags className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  Assign Categories
                </h2>
                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {workerName
                    ? `Choose skill categories for ${workerName}.`
                    : 'Choose skill categories for this worker.'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isBusy}
              onClick={onClose}
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {isLoading ? (
              <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 text-sm">
                <Loader2 className="size-5 animate-spin" />
                Loading categories…
              </div>
            ) : (
              <div className="space-y-5">
                {error ? (
                  <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : null}

                <section className="space-y-3">
                  <div>
                    <h3 className="text-onee-black text-sm font-semibold">Add category</h3>
                    <p className="text-muted-foreground text-xs">
                      Already assigned categories are hidden from this list.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={selectId} className="text-sm font-medium">
                      Category
                    </label>
                    <div className="relative">
                      <Layers className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                      <select
                        id={selectId}
                        value=""
                        disabled={isBusy || availableCategories.length === 0}
                        onChange={(event) => {
                          handleSelectCategory(event.target.value)
                          event.target.value = ''
                        }}
                        className={cn(
                          'border-input bg-background h-11 w-full appearance-none rounded-md border pe-8 ps-9 text-sm outline-none',
                          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      >
                        <option value="">
                          {availableCategories.length === 0
                            ? 'All categories assigned'
                            : 'Select a category…'}
                        </option>
                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div>
                    <h3 className="text-onee-black text-sm font-semibold">Assigned categories</h3>
                    <p className="text-muted-foreground text-xs">
                      Remove a category to make it available in the dropdown again.
                    </p>
                  </div>

                  {selectedCategories.length === 0 ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-sm">
                      No categories assigned yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((category) => (
                        <span
                          key={category.id}
                          className="bg-onee-gold/15 text-onee-black inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                        >
                          {category.category_Name}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemoveCategory(category.id)}
                            className="hover:bg-onee-gold/25 rounded-sm p-0.5"
                            aria-label={`Remove ${category.category_Name}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>

          <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-36 font-semibold"
              disabled={isBusy || isLoading}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
