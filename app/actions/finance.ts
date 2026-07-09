'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'

export type FinanceActionResult = { ok: boolean; error?: string }

const TABLES = {
  clientes: '/clientes',
  contas_fixas: '/contas',
  cartoes: '/cartoes',
  faturas: '/cartoes',
  categorias: '/categorias',
  contas_bancarias: '/contas-bancarias',
  metas: '/metas',
} as const

type TableName = keyof typeof TABLES

function revalidateFinance(path: string) {
  revalidatePath(path)
  revalidatePath('/dashboard')
  revalidatePath('/relatorios')
}

async function authedSupabase() {
  if (!hasSupabaseEnv()) return { error: 'Supabase não configurado.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado.' }
  return { supabase, user }
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length ? text : null
}

function money(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? '0').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function day(value: FormDataEntryValue | null, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return fallback
  return Math.min(31, Math.max(1, parsed))
}

function currentInvoiceDates(closingDay: number, dueDay: number) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const validDay = (targetDay: number, targetMonth = month) => {
    const last = new Date(year, targetMonth + 1, 0).getDate()
    return Math.min(targetDay, last)
  }
  const closingDate = `${year}-${pad(month + 1)}-${pad(validDay(closingDay))}`
  const dueMonth = dueDay <= closingDay ? month + 1 : month
  const dueYear = dueMonth > 11 ? year + 1 : year
  const normalizedDueMonth = dueMonth > 11 ? 0 : dueMonth
  const dueLast = new Date(dueYear, normalizedDueMonth + 1, 0).getDate()
  const dueDate = `${dueYear}-${pad(normalizedDueMonth + 1)}-${pad(Math.min(dueDay, dueLast))}`
  return {
    reference_month: `${year}-${pad(month + 1)}-01`,
    closing_date: closingDate,
    due_date: dueDate,
  }
}

async function ensureCurrentInvoice(
  supabase: NonNullable<Awaited<ReturnType<typeof authedSupabase>>['supabase']>,
  userId: string,
  cardId: string,
  closingDay: number,
  dueDay: number,
) {
  const dates = currentInvoiceDates(closingDay, dueDay)
  const { data: existing } = await supabase
    .from('faturas')
    .select('id')
    .eq('card_id', cardId)
    .eq('reference_month', dates.reference_month)
    .maybeSingle()

  if (existing?.id) {
    await supabase
      .from('faturas')
      .update({ closing_date: dates.closing_date, due_date: dates.due_date })
      .eq('id', existing.id)
    return
  }

  await supabase.from('faturas').insert({
    card_id: cardId,
    user_id: userId,
    amount: 0,
    status: 'OPEN',
    paid_at: null,
    ...dates,
  })
}

export async function saveCliente(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const record = {
    name,
    company: clean(formData.get('company')),
    phone_whatsapp: clean(formData.get('phone_whatsapp')),
    email: clean(formData.get('email')),
    contract_value: money(formData.get('contract_value')),
    due_date: clean(formData.get('due_date')) ? day(formData.get('due_date')) : null,
    payment_method: clean(formData.get('payment_method')),
    status: clean(formData.get('status')) ?? 'PENDING',
    notes: clean(formData.get('notes')),
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('clientes').update(record).eq('id', id)
    : await ctx.supabase.from('clientes').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/clientes')
  return { ok: true }
}

export async function saveContaFixa(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const record = {
    name,
    category_id: clean(formData.get('category_id')),
    bank_account_id: clean(formData.get('bank_account_id')),
    amount: money(formData.get('amount')),
    recurrence: 'MONTHLY',
    due_day: day(formData.get('due_day')),
    paid_at: clean(formData.get('paid_at')),
    status: clean(formData.get('status')) ?? 'PENDING',
    notes: clean(formData.get('notes')),
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('contas_fixas').update(record).eq('id', id)
    : await ctx.supabase.from('contas_fixas').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/contas')
  return { ok: true }
}

export async function saveCartao(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const closingDay = day(formData.get('closing_day'))
  const dueDay = day(formData.get('due_day'))
  const record = {
    name,
    brand: clean(formData.get('brand')),
    limit_amount: money(formData.get('limit_amount')),
    closing_day: closingDay,
    due_day: dueDay,
    bank_account_id: clean(formData.get('bank_account_id')),
    user_id: ctx.user.id,
  }

  const result = id
    ? await ctx.supabase.from('cartoes').update(record).eq('id', id).select('id').single()
    : await ctx.supabase.from('cartoes').insert(record).select('id').single()

  if (result.error) return { ok: false, error: result.error.message }
  await ensureCurrentInvoice(ctx.supabase, ctx.user.id, result.data.id, closingDay, dueDay)
  revalidateFinance('/cartoes')
  return { ok: true }
}

export async function saveFatura(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const cardId = clean(formData.get('card_id'))
  if (!cardId) return { ok: false, error: 'Cartão obrigatório.' }

  const record = {
    card_id: cardId,
    reference_month: clean(formData.get('reference_month')),
    closing_date: clean(formData.get('closing_date')),
    due_date: clean(formData.get('due_date')),
    amount: money(formData.get('amount')),
    paid_at: clean(formData.get('paid_at')),
    status: clean(formData.get('status')) ?? 'OPEN',
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('faturas').update(record).eq('id', id)
    : await ctx.supabase.from('faturas').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/cartoes')
  return { ok: true }
}

export async function saveCategoria(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const record = {
    name,
    kind: clean(formData.get('kind')) ?? 'BOTH',
    color: clean(formData.get('color')) ?? '#2f6fed',
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('categorias').update(record).eq('id', id)
    : await ctx.supabase.from('categorias').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/categorias')
  return { ok: true }
}

export async function saveContaBancaria(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const initial = money(formData.get('initial_balance'))
  const current = money(formData.get('current_balance'))
  const record = {
    name,
    bank: clean(formData.get('bank')),
    account_type: clean(formData.get('account_type')),
    initial_balance: initial,
    current_balance: current || initial,
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('contas_bancarias').update(record).eq('id', id)
    : await ctx.supabase.from('contas_bancarias').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/contas-bancarias')
  return { ok: true }
}

export async function saveMeta(formData: FormData): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const id = clean(formData.get('id'))
  const name = clean(formData.get('name'))
  if (!name) return { ok: false, error: 'Nome obrigatório.' }

  const record = {
    name,
    target_amount: money(formData.get('target_amount')),
    current_amount: money(formData.get('current_amount')),
    due_date: clean(formData.get('due_date')),
    user_id: ctx.user.id,
  }

  const { error } = id
    ? await ctx.supabase.from('metas').update(record).eq('id', id)
    : await ctx.supabase.from('metas').insert(record)

  if (error) return { ok: false, error: error.message }
  revalidateFinance('/metas')
  return { ok: true }
}

export async function deleteFinanceRecord(
  table: TableName,
  id: string,
): Promise<FinanceActionResult> {
  const ctx = await authedSupabase()
  if ('error' in ctx) return { ok: false, error: ctx.error }

  const { error } = await ctx.supabase.from(table).delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateFinance(TABLES[table])
  return { ok: true }
}
