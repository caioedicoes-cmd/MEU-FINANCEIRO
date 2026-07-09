import { createClient } from '@/lib/supabase/server'
import type {
  BankAccount,
  Card,
  Category,
  Client,
  FixedAccount,
  Goal,
  Invoice,
  FinContext,
  Transaction,
} from '@/lib/types'

export type MonthSummary = {
  income: number
  expense: number
  balance: number
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
  return { start: fmt(start), end: fmt(end) }
}

export async function getTransactions(options?: {
  context?: FinContext
  year?: number
  month?: number
  limit?: number
}): Promise<Transaction[]> {
  const supabase = await createClient()
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (options?.context) query = query.eq('context', options.context)

  if (options?.year !== undefined && options?.month !== undefined) {
    const { start, end } = monthRange(options.year, options.month)
    query = query.gte('date', start).lt('date', end)
  }

  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) {
    console.log('[v0] getTransactions error:', error.message)
    return []
  }
  return (data ?? []) as Transaction[]
}

async function getRows<T>(table: string, orderColumn = 'created_at'): Promise<T[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: false })

  if (error) {
    console.log(`[finance] ${table} error:`, error.message)
    return []
  }

  return (data ?? []) as T[]
}

export function getClients() {
  return getRows<Client>('clientes', 'name')
}

export function getFixedAccounts() {
  return getRows<FixedAccount>('contas_fixas', 'due_day')
}

export function getCards() {
  return getRows<Card>('cartoes', 'name')
}

export function getInvoices() {
  return getRows<Invoice>('faturas', 'due_date')
}

export function getCategories() {
  return getRows<Category>('categorias', 'name')
}

export function getBankAccounts() {
  return getRows<BankAccount>('contas_bancarias', 'name')
}

export function getGoals() {
  return getRows<Goal>('metas', 'created_at')
}

export function summarize(transactions: Transaction[]): MonthSummary {
  const income = transactions
    .filter((t) => t.type === 'IN')
    .reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((s, t) => s + Number(t.amount), 0)
  return { income, expense, balance: income - expense }
}

export async function getFinanceData() {
  const [
    transactions,
    clients,
    fixedAccounts,
    cards,
    invoices,
    categories,
    bankAccounts,
    goals,
  ] = await Promise.all([
    getTransactions(),
    getClients(),
    getFixedAccounts(),
    getCards(),
    getInvoices(),
    getCategories(),
    getBankAccounts(),
    getGoals(),
  ])

  return {
    transactions,
    clients,
    fixedAccounts,
    cards,
    invoices,
    categories,
    bankAccounts,
    goals,
  }
}

export function summarizeFinance(data: Awaited<ReturnType<typeof getFinanceData>>): MonthSummary {
  const txSummary = summarize(data.transactions)
  const fixedExpenses = data.fixedAccounts.reduce((sum, item) => sum + Number(item.amount), 0)
  const invoices = data.invoices.reduce((sum, item) => sum + Number(item.amount), 0)
  const clientIncome = data.clients.reduce((sum, item) => sum + Number(item.contract_value ?? 0), 0)

  return {
    income: txSummary.income + clientIncome,
    expense: txSummary.expense + fixedExpenses + invoices,
    balance: txSummary.balance + clientIncome - fixedExpenses - invoices,
  }
}

export async function getMonthlySeries(months = 6): Promise<
  { label: string; cpf: number; cnpj: number; income: number; expense: number }[]
> {
  const supabase = await createClient()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('date, amount, type, context')
    .gte('date', startStr)

  if (error) {
    console.log('[v0] getMonthlySeries error:', error.message)
  }

  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const buckets: Record<string, { label: string; cpf: number; cnpj: number; income: number; expense: number }> = {}

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets[key] = { label: MONTHS[d.getMonth()], cpf: 0, cnpj: 0, income: 0, expense: 0 }
  }

  for (const row of data ?? []) {
    const [y, m] = row.date.split('-').map(Number)
    const key = `${y}-${m - 1}`
    const bucket = buckets[key]
    if (!bucket) continue
    const amt = Number(row.amount)
    if (row.type === 'IN') bucket.income += amt
    else bucket.expense += amt
    const net = row.type === 'IN' ? amt : -amt
    if (row.context === 'CPF') bucket.cpf += net
    else bucket.cnpj += net
  }

  return Object.values(buckets)
}
