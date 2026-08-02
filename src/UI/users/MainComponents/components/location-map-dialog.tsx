import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import L from 'leaflet'
import {
  Crosshair,
  Loader2,
  LocateFixed,
  MapPinned,
  Navigation,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

/** Approximate geographic center of Sri Lanka */
export const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718]
const DEFAULT_ZOOM = 8
const SELECTED_ZOOM = 14
const SEARCH_DEBOUNCE_MS = 400

interface LocationMapDialogProps {
  open: boolean
  latitude: string
  longitude: string
  onClose: () => void
  onChange: (latitude: string, longitude: string) => void
  /** When set, footer primary button calls this instead of only closing. */
  onConfirm?: () => void | Promise<void>
  confirmLabel?: string
  isConfirming?: boolean
  error?: string | null
  title?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function parseCoordinate(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function hasExistingCoordinates(latitude: string, longitude: string) {
  const lat = parseCoordinate(latitude)
  const lng = parseCoordinate(longitude)
  if (lat === null || lng === null) return false
  return !(lat === 0 && lng === 0)
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

/** Custom pin — avoids Vite breaking Leaflet's default PNG marker paths */
function createPinIcon() {
  return L.divIcon({
    className: 'onee-map-pin',
    html: `
      <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.716 23.284 0 15 0z"
          fill="#EBB407"
          stroke="#060605"
          stroke-width="1.4"
        />
        <circle cx="15" cy="15" r="5.75" fill="#FFFFFF" />
        <circle cx="15" cy="15" r="2.5" fill="#EBB407" />
      </svg>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  })
}

export function LocationMapDialog({
  open,
  latitude,
  longitude,
  onClose,
  onChange,
  onConfirm,
  confirmLabel = 'Done',
  isConfirming = false,
  error = null,
  title = 'Pick location',
}: LocationMapDialogProps) {
  const titleId = useId()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  const searchAbortRef = useRef<AbortController | null>(null)

  const [geoError, setGeoError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  onChangeRef.current = onChange

  const locationReady = hasExistingCoordinates(latitude, longitude)

  function moveMarkerTo(lat: number, lng: number, zoom = SELECTED_ZOOM) {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return

    const latLng = L.latLng(lat, lng)
    marker.setLatLng(latLng)
    map.setView(latLng, zoom)
    onChangeRef.current(formatCoordinate(lat), formatCoordinate(lng))
  }

  useEffect(() => {
    if (!open || !mapContainerRef.current || mapRef.current) return

    const hasCoords = hasExistingCoordinates(latitude, longitude)
    const lat = hasCoords ? parseCoordinate(latitude)! : SRI_LANKA_CENTER[0]
    const lng = hasCoords ? parseCoordinate(longitude)! : SRI_LANKA_CENTER[1]
    const zoom = hasCoords ? SELECTED_ZOOM : DEFAULT_ZOOM

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom,
      scrollWheelZoom: true,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: createPinIcon(),
    }).addTo(map)

    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onChangeRef.current(formatCoordinate(position.lat), formatCoordinate(position.lng))
    })

    map.on('click', (event: L.LeafletMouseEvent) => {
      marker.setLatLng(event.latlng)
      onChangeRef.current(formatCoordinate(event.latlng.lat), formatCoordinate(event.latlng.lng))
    })

    mapRef.current = map
    markerRef.current = marker

    const invalidateTimer = window.setTimeout(() => {
      map.invalidateSize()
    }, 50)

    return () => {
      window.clearTimeout(invalidateTimer)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setSearchResults([])
      setSearchError(null)
      setShowResults(false)
      setGeoError(null)
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isConfirming) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, isConfirming])

  useEffect(() => {
    if (!open) return

    const query = searchQuery.trim()
    if (query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      setSearchError(null)
      return
    }

    const timer = window.setTimeout(async () => {
      searchAbortRef.current?.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller

      setIsSearching(true)
      setSearchError(null)

      try {
        const params = new URLSearchParams({
          format: 'json',
          q: query,
          limit: '6',
          addressdetails: '0',
        })

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        )

        if (!response.ok) throw new Error('Search failed')

        const data = (await response.json()) as NominatimResult[]
        setSearchResults(data)
        setShowResults(true)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setSearchResults([])
        setSearchError('Could not search places. Try again.')
      } finally {
        setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      searchAbortRef.current?.abort()
    }
  }, [open, searchQuery])

  if (!open) return null

  function goToCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }

    setGeoError(null)
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        moveMarkerTo(position.coords.latitude, position.coords.longitude)
        setIsLocating(false)
      },
      () => {
        setGeoError('Unable to get your current location. Please allow location access.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function selectSearchResult(result: NominatimResult) {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    moveMarkerTo(lat, lng)
    setSearchQuery(result.display_name)
    setShowResults(false)
    setSearchResults([])
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    if (searchResults[0]) selectSearchResult(searchResults[0])
  }

  function handlePrimaryAction() {
    if (onConfirm) {
      void onConfirm()
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="bg-onee-black/45 absolute inset-0 backdrop-blur-[2px]"
        aria-label="Close map"
        disabled={isConfirming}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
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
                  {title}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Search a place, click the map, or drag the marker
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isConfirming}
              onClick={onClose}
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {(error || geoError) && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
              {error || geoError}
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="relative z-20">
            <div className="relative">
              <Search className="text-muted-foreground absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setShowResults(true)
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
                placeholder="Search place (e.g. Colombo Fort, Kandy…)"
                className="h-11 ps-10 pe-10"
                autoComplete="off"
                disabled={isConfirming}
              />
              {isSearching ? (
                <Loader2 className="text-onee-gold absolute end-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                  disabled={isConfirming}
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setShowResults(false)
                  }}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {showResults && (isSearching || searchResults.length > 0 || searchError) ? (
              <div className="bg-card border-border absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-52 overflow-hidden rounded-xl border shadow-lg">
                {isSearching && searchResults.length === 0 ? (
                  <div className="text-muted-foreground flex items-center gap-2 px-4 py-3 text-sm">
                    <Loader2 className="text-onee-gold size-4 animate-spin" />
                    Searching places…
                  </div>
                ) : searchError ? (
                  <p className="text-destructive px-4 py-3 text-sm">{searchError}</p>
                ) : (
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {searchResults.map((result) => (
                      <li key={result.place_id}>
                        <button
                          type="button"
                          className="hover:bg-onee-cream/50 flex w-full items-start gap-3 px-4 py-2.5 text-start transition-colors"
                          onClick={() => selectSearchResult(result)}
                        >
                          <MapPinned className="text-onee-gold mt-0.5 size-4 shrink-0" />
                          <span className="text-sm leading-snug">{result.display_name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs',
                  locationReady
                    ? 'border-onee-gold/40 bg-onee-gold/10 text-onee-black'
                    : 'border-border bg-muted/40 text-muted-foreground',
                )}
              >
                <Crosshair className="size-3.5 shrink-0" />
                <span className="font-medium">Lat</span>
                <span className="font-mono">{latitude || '—'}</span>
              </div>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs',
                  locationReady
                    ? 'border-onee-gold/40 bg-onee-gold/10 text-onee-black'
                    : 'border-border bg-muted/40 text-muted-foreground',
                )}
              >
                <Navigation className="size-3.5 shrink-0" />
                <span className="font-medium">Lng</span>
                <span className="font-mono">{longitude || '—'}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLocating || isConfirming}
              onClick={goToCurrentLocation}
              className="shrink-0"
            >
              {isLocating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LocateFixed className="size-4" />
              )}
              {isLocating ? 'Locating…' : 'Use current location'}
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border shadow-inner">
            <div className="from-onee-cream/90 via-card/80 to-card/60 pointer-events-none absolute inset-x-0 top-0 z-[400] flex items-center gap-2 border-b bg-gradient-to-b px-3 py-2 text-xs backdrop-blur-sm">
              <span className="bg-onee-gold size-1.5 rounded-full" />
              <span className="text-muted-foreground">
                Click anywhere on the map or drag the gold pin to set coordinates
              </span>
            </div>

            <div
              ref={mapContainerRef}
              className="z-0 h-[380px] w-full [&_.leaflet-bottom.leaflet-right]:mb-2 [&_.leaflet-bottom.leaflet-right]:me-2 [&_.onee-map-pin]:border-0 [&_.onee-map-pin]:bg-transparent"
            />
          </div>
        </div>

        <div className="border-border bg-card/95 flex shrink-0 items-center justify-end gap-2 border-t px-5 py-4 backdrop-blur-sm sm:px-6">
          <Button type="button" variant="outline" disabled={isConfirming} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isConfirming}
            onClick={handlePrimaryAction}
            className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 min-w-36 font-semibold"
          >
            {isConfirming ? <Loader2 className="size-4 animate-spin" /> : null}
            {isConfirming ? 'Saving…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
