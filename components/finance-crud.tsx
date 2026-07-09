'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteFinanceRecord,
  saveCartao,
  saveCategoria,
  saveCliente,
  saveContaBancaria,
  saveContaFixa,
  saveFatura,
  saveMeta,
  type FinanceActionResult,
} from '@/app/actions/finance'
import type { BankAccount, Card as CreditCardRecord, Category, Client, FixedAccount, Goal, Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SupportData = {
  categories?: Category[]
  bankAccounts?: BankAccount[]
  cards?: CreditCardRecord[]
  invoices?: Invoice[]
  clientIncome?: { client_id: string | null; amount: number; count: number }[]
}

type ModuleKind =
  | 'clientes'
  | 'contas_fixas'
  | 'cartoes'
  | 'categorias'
  | 'contas_bancarias'
  | 'metas'
  | 'faturas'

type Props = {
  kind: ModuleKind
  title: string
  subtitle: string
  items: any[]
  support?: SupportData
}

const ACTIONS: Record<ModuleKind, (formData: FormData) => Promise<FinanceActionResult>> = {
  clientes: saveCliente,
  contas_fixas: saveContaFixa,
  cartoes: saveCartao,
  categorias: saveCategoria,
  contas_bancarias: saveContaBancaria,
  metas: saveMeta,
  faturas: saveFatura,
}

const TABLES = {
  clientes: 'clientes',
  contas_fixas: 'contas_fixas',
  cartoes: 'cartoes',
  categorias: 'categorias',
  contas_bancarias: 'contas_bancarias',
  metas: 'metas',
  faturas: 'faturas',
} as const

export function FinanceCrud({ kind, title, subtitle, items, support = {} }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()
  const formKey = editing?.id ?? 'new'

  const totals = useMemo(() => getTotals(kind, items, support), [kind, items, support])

  function reset() {
    setEditing(null)
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await ACTIONS[kind](formData)
      if (!result.ok) {
        toast.error(result.error ?? 'Erro ao salvar.')
        return
      }
      toast.success(editing ? 'Registro atualizado.' : 'Registro criado.')
      reset()
      router.refresh()
    })
  }

  function remove(item: any) {
    const label = item.name ?? item.reference_month ?? 'registro'
    if (!window.confirm(`Excluir "${label}"?`)) return

    startTransition(async () => {
      const result = await deleteFinanceRecord(TABLES[kind], item.id)
      if (!result.ok) {
        toast.error(result.error ?? 'Erro ao excluir.')
        return
      }
      toast.success('Registro excluído.')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Button onClick={reset} disabled={!editing}>
          <Plus className="size-4" />
          Novo cadastro
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {totals.map((total) => (
          <Card key={total.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{total.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{total.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing ? 'Editar cadastro' : 'Novo cadastro'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form key={formKey} action={submit} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={editing?.id ?? ''} />
              <ModuleFields kind={kind} item={editing} support={support} />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  <Check className="size-4" />
                  Salvar
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registros</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                Nenhum registro salvo no Supabase.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <ItemSummary kind={kind} item={item} support={support} />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => setEditing(item)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(item)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ModuleFields({ kind, item, support }: { kind: ModuleKind; item: any; support: SupportData }) {
  if (kind === 'clientes') {
    return (
      <>
        <Field name="name" label="Nome" item={item} required />
        <Field name="company" label="Empresa" item={item} />
        <Field name="phone_whatsapp" label="WhatsApp" item={item} />
        <Field name="email" label="E-mail" item={item} type="email" />
        <Field name="contract_value" label="Receita/contrato" item={item} type="number" step="0.01" />
        <Field name="due_date" label="Vencimento" item={item} type="number" min="1" max="31" />
        <Field name="payment_method" label="Forma de pagamento" item={item} />
        <SelectField name="status" label="Status" value={item?.status ?? 'PENDING'} options={[
          ['PENDING', 'Pendente'],
          ['PAID', 'Pago'],
          ['LATE', 'Atrasado'],
        ]} />
        <TextField name="notes" label="Observações" item={item} />
      </>
    )
  }

  if (kind === 'contas_fixas') {
    return (
      <>
        <Field name="name" label="Conta" item={item} required />
        <Field name="amount" label="Valor mensal" item={item} type="number" step="0.01" required />
        <Field name="due_day" label="Vencimento" item={item} type="number" min="1" max="31" required />
        <input type="hidden" name="recurrence" value="MONTHLY" />
        <RelationSelect name="category_id" label="Categoria" value={item?.category_id} items={support.categories} />
        <RelationSelect name="bank_account_id" label="Conta bancária" value={item?.bank_account_id} items={support.bankAccounts} />
        <Field name="paid_at" label="Pago em" item={item} type="date" />
        <SelectField name="status" label="Status" value={item?.status ?? 'PENDING'} options={[
          ['PENDING', 'Pendente'],
          ['PAID', 'Pago'],
          ['LATE', 'Atrasado'],
        ]} />
        <TextField name="notes" label="Observações" item={item} />
      </>
    )
  }

  if (kind === 'cartoes') {
    return (
      <>
        <Field name="name" label="Cartão" item={item} required />
        <Field name="brand" label="Bandeira" item={item} />
        <Field name="limit_amount" label="Limite" item={item} type="number" step="0.01" required />
        <Field name="closing_day" label="Fechamento" item={item} type="number" min="1" max="31" required />
        <Field name="due_day" label="Vencimento" item={item} type="number" min="1" max="31" required />
        <RelationSelect name="bank_account_id" label="Conta de pagamento" value={item?.bank_account_id} items={support.bankAccounts} />
      </>
    )
  }

  if (kind === 'faturas') {
    return (
      <>
        <RelationSelect name="card_id" label="Cartão" value={item?.card_id} items={support.cards} required />
        <Field name="reference_month" label="Mês de referência" item={item} type="date" required />
        <Field name="closing_date" label="Fechamento" item={item} type="date" required />
        <Field name="due_date" label="Vencimento" item={item} type="date" required />
        <Field name="amount" label="Valor" item={item} type="number" step="0.01" required />
        <Field name="paid_at" label="Pago em" item={item} type="date" />
        <SelectField name="status" label="Status" value={item?.status ?? 'OPEN'} options={[
          ['OPEN', 'Aberta'],
          ['CLOSED', 'Fechada'],
          ['PAID', 'Paga'],
          ['LATE', 'Atrasada'],
        ]} />
      </>
    )
  }

  if (kind === 'categorias') {
    return (
      <>
        <Field name="name" label="Categoria" item={item} required />
        <SelectField name="kind" label="Tipo" value={item?.kind ?? 'BOTH'} options={[
          ['INCOME', 'Receita'],
          ['EXPENSE', 'Despesa'],
          ['BOTH', 'Ambos'],
        ]} />
        <Field name="color" label="Cor" item={item} type="color" />
      </>
    )
  }

  if (kind === 'contas_bancarias') {
    return (
      <>
        <Field name="name" label="Nome da conta" item={item} required />
        <Field name="bank" label="Banco" item={item} />
        <Field name="account_type" label="Tipo" item={item} />
        <Field name="initial_balance" label="Saldo inicial" item={item} type="number" step="0.01" />
        <Field name="current_balance" label="Saldo atual" item={item} type="number" step="0.01" />
      </>
    )
  }

  return (
    <>
      <Field name="name" label="Meta" item={item} required />
      <Field name="target_amount" label="Valor alvo" item={item} type="number" step="0.01" required />
      <Field name="current_amount" label="Valor atual" item={item} type="number" step="0.01" />
      <Field name="due_date" label="Prazo" item={item} type="date" />
    </>
  )
}

function Field({ name, label, item, ...props }: any) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={item?.[name] ?? ''} {...props} />
    </div>
  )
}

function TextField({ name, label, item }: any) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        defaultValue={item?.[name] ?? ''}
        className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string
  label: string
  value: string
  options: [string, string][]
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={value}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  )
}

function RelationSelect({
  name,
  label,
  value,
  items = [],
  required,
}: {
  name: string
  label: string
  value?: string | null
  items?: { id: string; name: string }[]
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={value ?? ''}
        required={required}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Nenhum</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function ItemSummary({ kind, item, support }: { kind: ModuleKind; item: any; support: SupportData }) {
  const card = support.cards?.find((cardItem) => cardItem.id === item.card_id)
  const category = support.categories?.find((categoryItem) => categoryItem.id === item.category_id)
  const income = support.clientIncome?.find((row) => row.client_id === item.id)

  if (kind === 'clientes') {
    return (
      <>
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.email ?? 'Sem e-mail'} · contrato {formatCurrency(Number(item.contract_value ?? 0))}
          {income ? ` · recebido ${formatCurrency(income.amount)}` : ''}
        </p>
      </>
    )
  }

  if (kind === 'contas_fixas') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <Badge variant={item.status === 'PAID' ? 'default' : item.status === 'LATE' ? 'destructive' : 'secondary'}>
            {statusLabel(item.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(Number(item.amount))} · vence dia {item.due_day} · mensal
          {category ? ` · ${category.name}` : ''}
        </p>
      </>
    )
  }

  if (kind === 'cartoes') {
    const invoiceTotal = support.invoices
      ?.filter((invoice) => invoice.card_id === item.id)
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0)
    return (
      <>
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          limite {formatCurrency(Number(item.limit_amount))} · fecha dia {item.closing_day} · vence dia {item.due_day}
          {invoiceTotal ? ` · faturas ${formatCurrency(invoiceTotal)}` : ''}
        </p>
      </>
    )
  }

  if (kind === 'faturas') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{card?.name ?? 'Cartão'}</p>
          <Badge variant={item.status === 'PAID' ? 'default' : item.status === 'LATE' ? 'destructive' : 'secondary'}>
            {statusLabel(item.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(Number(item.amount))} · fecha {formatDate(item.closing_date)} · vence {formatDate(item.due_date)}
        </p>
      </>
    )
  }

  if (kind === 'categorias') {
    return (
      <>
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{kindLabel(item.kind)}</p>
      </>
    )
  }

  if (kind === 'contas_bancarias') {
    return (
      <>
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.bank ?? 'Sem banco'} · saldo {formatCurrency(Number(item.current_balance ?? 0))}
        </p>
      </>
    )
  }

  const progress = Number(item.target_amount) > 0
    ? Math.round((Number(item.current_amount ?? 0) / Number(item.target_amount)) * 100)
    : 0
  return (
    <>
      <p className="truncate text-sm font-medium">{item.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(Number(item.current_amount ?? 0))} de {formatCurrency(Number(item.target_amount ?? 0))} · {progress}%
      </p>
    </>
  )
}

function getTotals(kind: ModuleKind, items: any[], support: SupportData) {
  if (kind === 'clientes') {
    const recurring = items.reduce((sum, item) => sum + Number(item.contract_value ?? 0), 0)
    const received = support.clientIncome?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    return [
      { label: 'Clientes', value: String(items.length) },
      { label: 'Contratos', value: formatCurrency(recurring) },
      { label: 'Receitas associadas', value: formatCurrency(received) },
    ]
  }

  if (kind === 'contas_fixas') {
    const total = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
    return [
      { label: 'Contas', value: String(items.length) },
      { label: 'Custo mensal', value: formatCurrency(total) },
      { label: 'Atrasadas', value: String(items.filter((item) => item.status === 'LATE').length) },
    ]
  }

  if (kind === 'cartoes') {
    const limit = items.reduce((sum, item) => sum + Number(item.limit_amount ?? 0), 0)
    const invoices = support.invoices?.reduce((sum, item) => sum + Number(item.amount ?? 0), 0) ?? 0
    return [
      { label: 'Cartões', value: String(items.length) },
      { label: 'Limite total', value: formatCurrency(limit) },
      { label: 'Faturas', value: formatCurrency(invoices) },
    ]
  }

  if (kind === 'contas_bancarias') {
    const balance = items.reduce((sum, item) => sum + Number(item.current_balance ?? 0), 0)
    return [
      { label: 'Contas', value: String(items.length) },
      { label: 'Saldo total', value: formatCurrency(balance) },
      { label: 'Bancos', value: String(new Set(items.map((item) => item.bank).filter(Boolean)).size) },
    ]
  }

  if (kind === 'metas') {
    const current = items.reduce((sum, item) => sum + Number(item.current_amount ?? 0), 0)
    const target = items.reduce((sum, item) => sum + Number(item.target_amount ?? 0), 0)
    return [
      { label: 'Metas', value: String(items.length) },
      { label: 'Guardado', value: formatCurrency(current) },
      { label: 'Objetivo', value: formatCurrency(target) },
    ]
  }

  const total = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
  return [
    { label: 'Registros', value: String(items.length) },
    { label: 'Total', value: formatCurrency(total) },
    { label: 'Ativos', value: String(items.filter((item) => item.status !== 'PAID').length) },
  ]
}

function statusLabel(status: string) {
  return {
    PENDING: 'Pendente',
    PAID: 'Pago',
    LATE: 'Atrasado',
    OPEN: 'Aberta',
    CLOSED: 'Fechada',
  }[status] ?? status
}

function kindLabel(kind: string) {
  return {
    INCOME: 'Receita',
    EXPENSE: 'Despesa',
    BOTH: 'Receita e despesa',
  }[kind] ?? kind
}
