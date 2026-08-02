import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Layers, Loader2, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { addCategory, getCategoryById, updateCategory } from '../core/categories-api'

interface CategoryFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  categoryId?: number | null
  onClose: () => void
  onSuccess: (message: string) => void
}

interface FormState {
  categoryName: string
  isActive: boolean
}

const INITIAL_FORM: FormState = {
  categoryName: '',
  isActive: true,
}

export function CategoryFormModal({
  open,
  mode,
  categoryId,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const titleId = useId()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = mode === 'edit'
  const isBusy = isSubmitting || isLoadingDetails

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadForm() {
      setError(null)
      setIsSubmitting(false)

      if (mode === 'create') {
        setForm({ ...INITIAL_FORM })
        return
      }

      if (!categoryId) {
        setError('Category id is missing.')
        return
      }

      setIsLoadingDetails(true)

      try {
        const details = await getCategoryById(categoryId)
        if (cancelled) return

        setForm({
          categoryName: details.category_Name ?? '',
          isActive: !details.isdelete,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load category details.')
        }
      } finally {
        if (!cancelled) setIsLoadingDetails(false)
      }
    }

    void loadForm()

    return () => {
      cancelled = true
    }
  }, [open, mode, categoryId])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isBusy, onClose])

  if (!open) return null

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.categoryName.trim()) {
      setError('Category name is required.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      categoryName: form.categoryName,
      isDelete: !form.isActive,
    }

    try {
      if (isEdit) {
        if (!categoryId) throw new ApiError('Category id is missing.')

        const response = await updateCategory(categoryId, payload)
        onSuccess(response.text || 'Category updated successfully.')
      } else {
        const response = await addCategory(payload)
        onSuccess(response.text || 'Category added successfully.')
      }

      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? 'Failed to update category.'
            : 'Failed to add category.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = isSubmitting
    ? isEdit
      ? 'Saving…'
      : 'Creating…'
    : isEdit
      ? 'Save changes'
      : 'Add category'

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
                <Layers className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  {isEdit ? 'Edit category' : 'Add worker category'}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {isEdit
                    ? 'Update the category name and status.'
                    : 'Create a new worker skill category.'}
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
            {isLoadingDetails ? (
              <LoadingState />
            ) : (
              <div className="space-y-5">
                {error ? (
                  <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : null}

                <Section title="Details" description="Category name used for worker skills">
                  <Field label="Category name" htmlFor="category-name" required>
                    <Input
                      id="category-name"
                      value={form.categoryName}
                      onChange={(event) => updateField('categoryName', event.target.value)}
                      placeholder="e.g. Plumber"
                      required
                      disabled={isBusy}
                      className="h-11"
                    />
                  </Field>
                </Section>

                <Section title="Status" description="Control whether this category is available">
                  <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="bg-onee-gold/15 text-onee-gold mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Shield className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Active status</p>
                        <p className="text-muted-foreground text-xs">
                          {form.isActive
                            ? 'This category is available for workers.'
                            : 'This category is inactive and hidden from use.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isActive}
                      disabled={isBusy}
                      onClick={() => updateField('isActive', !form.isActive)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                        form.isActive ? 'bg-onee-gold' : 'bg-onee-earth/30',
                      )}
                    >
                      <span
                        className={cn(
                          'bg-card pointer-events-none inline-block size-5 rounded-full shadow-xs transition-transform',
                          form.isActive ? 'translate-x-[22px]' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </div>
                </Section>
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
              disabled={isBusy || isLoadingDetails}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-onee-black text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="text-onee-gold size-6 animate-spin" />
      <p className="text-muted-foreground text-sm">Loading category details…</p>
    </div>
  )
}
