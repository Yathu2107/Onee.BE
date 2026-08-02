import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  accent?: 'gold' | 'emerald' | 'sky' | 'amber' | 'rose' | 'slate' | 'earth'
}

const ACCENT: Record<NonNullable<SummaryCardProps['accent']>, string> = {
  gold: 'bg-onee-gold/15 text-onee-gold',
  emerald: 'bg-emerald-50 text-emerald-700',
  sky: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-800',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-muted text-muted-foreground',
  earth: 'bg-onee-earth/15 text-onee-earth',
}

export function SummaryCard({
  title,
  value,
  hint,
  icon: Icon,
  accent = 'gold',
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0">
          <CardDescription className="truncate">{title}</CardDescription>
          <CardTitle className="mt-1 text-2xl tabular-nums">{value}</CardTitle>
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            ACCENT[accent],
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-2">
          <div className="bg-muted h-3 w-20 animate-pulse rounded" />
          <div className="bg-muted h-7 w-16 animate-pulse rounded" />
        </div>
        <div className="bg-muted size-10 animate-pulse rounded-lg" />
      </CardHeader>
    </Card>
  )
}
