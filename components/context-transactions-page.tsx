'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Client, FinContext, Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/format'
import { deleteTransaction } from '@/app/actions/transactions'
import { TransactionDialog } from '@/components/transaction-dialog'
import { TransactionsList } from '@/components/transactions-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StatCard } from '@/components/stat-card'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

type Summary = {
  income: number
  expense: number
  balance: number
}

export function ContextTransactionsPage({
  context,
  title,
  subtitle,
  transactions,
  summary,
  clients = [],
}: {
  context: FinContext
  title: string
  subtitle: string
  transactions: Transaction[]
  summary: Summary
  clients?: Client[]
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction)
    setDialogOpen(true)
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Excluir "${transaction.description}" no valor de ${formatCurrency(transaction.amount)}?`,
    )
    if (!confirmed) return

    setDeletingId(transaction.id)
    const result = await deleteTransaction(transaction.id)
    setDeletingId(null)

    if (!result.ok) {
      toast.error(result.error ?? 'Erro ao excluir transação.')
      return
    }

    toast.success('Transação excluída.')
    router.refresh()
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Button onClick={openNew}>
          <Plus className="size-4" />
          Nova transação
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo"
          value={summary.balance}
          icon={Wallet}
          tone={summary.balance >= 0 ? 'primary' : 'destructive'}
          valueClassName={summary.balance < 0 ? 'text-destructive' : undefined}
        />
        <StatCard
          label="Entradas"
          value={summary.income}
          icon={TrendingUp}
          tone="success"
          valueClassName="text-success"
        />
        <StatCard
          label="Saídas"
          value={summary.expense}
          icon={TrendingDown}
          tone="destructive"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Transações</CardTitle>
          {deletingId && (
            <span className="text-xs text-muted-foreground">Excluindo...</span>
          )}
        </CardHeader>
        <CardContent>
          <TransactionsList
            transactions={transactions}
            onEdit={openEdit}
            onDelete={handleDelete}
            emptyLabel="Nenhuma transação registrada ainda. Clique em Nova transação para começar."
          />
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            router.refresh()
          }
        }}
        context={context}
        transaction={editing}
        clients={clients}
      />
    </div>
  )
}
