'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Client, FinContext, Transaction, TxType } from '@/lib/types'
import { categoriesFor } from '@/lib/constants'
import { todayISO } from '@/lib/format'
import { saveTransaction } from '@/app/actions/transactions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function TransactionDialog({
  open,
  onOpenChange,
  context,
  transaction,
  clients = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: FinContext
  transaction?: Transaction | null
  clients?: Client[]
}) {
  const editing = Boolean(transaction)
  const [type, setType] = useState<TxType>('OUT')
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [clientId, setClientId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setType(transaction?.type ?? 'OUT')
      setDate(transaction?.date ?? todayISO())
      setDescription(transaction?.description ?? '')
      setCategory(transaction?.category ?? '')
      setAmount(transaction ? String(transaction.amount) : '')
      setClientId(transaction?.client_id ?? '')
    }
  }, [open, transaction])

  const categories = categoriesFor(context, type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    if (!category) {
      toast.error('Selecione uma categoria.')
      return
    }

    setSaving(true)
    const result = await saveTransaction({
      id: transaction?.id,
      date,
      category,
      description,
      amount: parsed,
      type,
      context,
      client_id: clientId || null,
    })
    setSaving(false)

    if (!result.ok) {
      toast.error(result.error ?? 'Erro ao salvar.')
      return
    }
    toast.success(editing ? 'Transação atualizada.' : 'Transação adicionada.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar transação' : 'Nova transação'}</DialogTitle>
          <DialogDescription>
            {context === 'CPF' ? 'Conta pessoal (CPF)' : 'Conta empresarial (CNPJ)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('OUT')
                setCategory('')
              }}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                type === 'OUT'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
              aria-pressed={type === 'OUT'}
            >
              Saída
            </button>
            <button
              type="button"
              onClick={() => {
                setType('IN')
                setCategory('')
              }}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                type === 'IN'
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
              aria-pressed={type === 'IN'}
            >
              Entrada
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-desc">Descrição</Label>
            <Input
              id="tx-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Mercado, Salário, Cliente X"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-amount">Valor (R$)</Label>
              <Input
                id="tx-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-date">Data</Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-cat">Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value ?? '')}>
              <SelectTrigger id="tx-cat">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {context === 'CNPJ' && type === 'IN' && clients.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-client">Cliente associado</Label>
              <Select value={clientId || 'none'} onValueChange={(value) => setClientId(value === 'none' ? '' : (value ?? ''))}>
                <SelectTrigger id="tx-client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
