'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import type { FinContext, TxType } from '@/lib/types'

export type ActionResult = { ok: boolean; error?: string }

type TxPayload = {
  id?: string
  date: string
  category: string
  description: string
  amount: number
  type: TxType
  context: FinContext
  client_id?: string | null
}

function revalidateAll() {
  revalidatePath('/dashboard')
  revalidatePath('/cpf')
  revalidatePath('/cnpj')
  revalidatePath('/relatorios')
}

export async function saveTransaction(payload: TxPayload): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: 'Supabase não configurado.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Não autenticado.' }

  if (!payload.description.trim()) return { ok: false, error: 'Descrição obrigatória.' }
  if (!payload.category) return { ok: false, error: 'Categoria obrigatória.' }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0)
    return { ok: false, error: 'Valor inválido.' }

  const record = {
    date: payload.date,
    category: payload.category,
    description: payload.description.trim(),
    amount: payload.amount,
    type: payload.type,
    context: payload.context,
    client_id: payload.client_id ?? null,
    user_id: user.id,
  }

  if (payload.id) {
    const { error } = await supabase
      .from('transactions')
      .update(record)
      .eq('id', payload.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase.from('transactions').insert(record)
    if (error) return { ok: false, error: error.message }
  }

  revalidateAll()
  return { ok: true }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: 'Supabase não configurado.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado.' }

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidateAll()
  return { ok: true }
}
