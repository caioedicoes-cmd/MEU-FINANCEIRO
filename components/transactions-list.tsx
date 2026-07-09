'use client'

import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function TransactionsList({
  transactions,
  showContext = false,
  onEdit,
  onDelete,
  emptyLabel = 'Nenhuma transação encontrada.',
}: {
  transactions: Transaction[]
  showContext?: boolean
  onEdit?: (tx: Transaction) => void
  onDelete?: (tx: Transaction) => void
  emptyLabel?: string
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((tx) => {
        const isIncome = tx.type === 'IN'
        return (
          <li key={tx.id} className="flex items-center gap-3 py-3">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full',
                isIncome ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
              )}
            >
              {isIncome ? (
                <ArrowUpRight className="size-5" aria-hidden="true" />
              ) : (
                <ArrowDownLeft className="size-5" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{tx.description}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>{formatDate(tx.date)}</span>
                <span aria-hidden="true">·</span>
                <span>{tx.category}</span>
                {showContext && (
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {tx.context}
                  </Badge>
                )}
              </div>
            </div>

            <p
              className={cn(
                'shrink-0 text-sm font-semibold tabular-nums',
                isIncome ? 'text-success' : 'text-foreground',
              )}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </p>

            {(onEdit || onDelete) && (
              <div className="flex shrink-0 items-center">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => onEdit(tx)}
                    aria-label="Editar transação"
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(tx)}
                    aria-label="Excluir transação"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
