import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

type Tone = 'default' | 'success' | 'destructive' | 'primary'

const toneMap: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  primary: 'bg-primary/15 text-primary',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  hint,
  valueClassName,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone?: Tone
  hint?: string
  valueClassName?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-2 text-2xl font-semibold tracking-tight tabular-nums', valueClassName)}>
            {formatCurrency(value)}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', toneMap[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}
