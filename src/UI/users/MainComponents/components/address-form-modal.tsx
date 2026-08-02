import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Loader2, MapPinned, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { addAddress, updateAddress } from '../core/accounts-api'
import type { SavedAddress, SavedAddressPayload } from '../core/types'
import { LocationMapDialog } from './location-map-dialog'

interface AddressFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  userId: string
  address?: SavedAddress | null
  onClose: () => void
  onSuccess: (message: string) => void
}

interface FormState {
  label: string
  address_Line: string
  latitude: string
  longitude: string
  is_Default: boolean
}

const INITIAL_FORM: FormState = {
  label: '',
  address_Line: '',
  latitude: '0.0',
  longitude: '0.0',
  is_Default: false,
}

function parseCoordinate(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function hasLocation(latitude: string, longitude: string) {
  const lat = parseCoordinate(latitude)
  const lng = parseCoordinate(longitude)
  return !(lat === 0 && lng === 0)
}

export function AddressFormModal({
  open,
  mode,
  userId,
  address,
  onClose,
  onSuccess,
}: AddressFormModalProps) {
  const titleId = useId()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const isEdit = mode === 'edit'
  const isBusy = isSubmitting

  useEffect(() => {
    if (!open) return

    setError(null)
    setIsSubmitting(false)
    setIsMapOpen(false)

    if (mode === 'edit' && address) {
      setForm({
        label: address.label ?? '',
        address_Line: address.address_Line ?? '',
        latitude: String(address.latitude ?? 0),
        longitude: String(address.longitude ?? 0),
        is_Default: Boolean(address.is_Default),
      })
    } else {
      setForm({ ...INITIAL_FORM })
    }
  }, [open, mode, address])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy && !isMapOpen) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isBusy, isMapOpen, onClose])

  if (!open) return null

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.label.trim() || !form.address_Line.trim()) {
      setError('Label and address line are required.')
      return
    }

    const latitude = parseCoordinate(form.latitude)
    const longitude = parseCoordinate(form.longitude)

    if (!hasLocation(form.latitude, form.longitude)) {
      setError('Latitude and longitude are required. Pick a point on the map.')
      return
    }

    const payload: SavedAddressPayload = {
      label: form.label,
      address_Line: form.address_Line,
      latitude,
      longitude,
      is_Default: form.is_Default,
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        if (!address?.id) throw new ApiError('Address id is missing.')
        const response = await updateAddress(address.id, userId, payload)
        onSuccess(response.text || 'Address updated successfully.')
      } else {
        const response = await addAddress(userId, payload)
        onSuccess(response.text || 'Address added successfully.')
      }
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? 'Failed to update address.'
            : 'Failed to add address.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const locationSet = hasLocation(form.latitude, form.longitude)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
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
                <MapPinned className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-onee-black text-lg font-semibold tracking-tight">
                  {isEdit ? 'Edit address' : 'Add address'}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {isEdit ? 'Update this saved address.' : 'Add a new saved address for this user.'}
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
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            {error ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <Field label="Label" htmlFor="address-label" required>
              <Input
                id="address-label"
                value={form.label}
                onChange={(event) => updateField('label', event.target.value)}
                placeholder="e.g. Home, Work"
                required
                disabled={isBusy}
                className="h-11"
              />
            </Field>

            <Field label="Address line" htmlFor="address-line" required>
              <Input
                id="address-line"
                value={form.address_Line}
                onChange={(event) => updateField('address_Line', event.target.value)}
                placeholder="Street, city, landmark…"
                required
                disabled={isBusy}
                className="h-11"
              />
            </Field>

            <div className="rounded-xl border bg-gradient-to-br from-onee-cream/35 to-transparent p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {locationSet ? 'Location selected' : 'No location set'}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {locationSet
                      ? `${form.latitude}, ${form.longitude}`
                      : 'Open the map to pick coordinates'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => setIsMapOpen(true)}
                  className="shrink-0"
                >
                  <MapPinned className="size-4" />
                  {locationSet ? 'Change on map' : 'Open map'}
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Latitude" htmlFor="address-latitude" required>
                  <Input
                    id="address-latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) => updateField('latitude', event.target.value)}
                    required
                    disabled={isBusy}
                    className="h-10"
                  />
                </Field>
                <Field label="Longitude" htmlFor="address-longitude" required>
                  <Input
                    id="address-longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) => updateField('longitude', event.target.value)}
                    required
                    disabled={isBusy}
                    className="h-10"
                  />
                </Field>
              </div>
            </div>

            <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Set as default</p>
                <p className="text-muted-foreground text-xs">
                  Use this as the user’s default saved address.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.is_Default}
                disabled={isBusy}
                onClick={() => updateField('is_Default', !form.is_Default)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                  form.is_Default ? 'bg-onee-gold' : 'bg-onee-earth/30',
                )}
              >
                <span
                  className={cn(
                    'bg-card pointer-events-none inline-block size-5 rounded-full shadow-xs transition-transform',
                    form.is_Default ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          </div>

          <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-36 font-semibold"
              disabled={isBusy}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : isEdit ? 'Save address' : 'Add address'}
            </Button>
          </div>
        </form>
      </div>

      <LocationMapDialog
        open={isMapOpen}
        latitude={form.latitude}
        longitude={form.longitude}
        onClose={() => setIsMapOpen(false)}
        onChange={(latitude, longitude) => {
          setForm((current) => ({ ...current, latitude, longitude }))
        }}
      />
    </div>
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
