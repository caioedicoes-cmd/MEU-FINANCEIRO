export type TxType = 'IN' | 'OUT'
export type FinContext = 'CPF' | 'CNPJ'
export type ClientStatus = 'PENDING' | 'PAID' | 'LATE'
export type BillStatus = 'PENDING' | 'PAID' | 'LATE'
export type InvoiceStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'LATE'
export type CategoryKind = 'INCOME' | 'EXPENSE' | 'BOTH'

export type Profile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

export type Transaction = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  type: TxType
  context: FinContext
  user_id: string | null
  client_id: string | null
  bill_id: string | null
  card_id: string | null
  created_at: string
}

export type TransactionInput = {
  date: string
  category: string
  description: string
  amount: number
  type: TxType
  context: FinContext
  client_id?: string | null
}

export type Client = {
  id: string
  name: string
  company: string | null
  phone_whatsapp: string | null
  email: string | null
  contract_value: number
  due_date: number | null
  payment_method: string | null
  status: ClientStatus
  notes: string | null
  user_id: string | null
  created_at: string
}

export type FixedAccount = {
  id: string
  name: string
  category_id: string | null
  bank_account_id: string | null
  amount: number
  recurrence: 'MONTHLY'
  due_day: number
  paid_at: string | null
  status: BillStatus
  notes: string | null
  user_id: string | null
  created_at: string
}

export type Card = {
  id: string
  name: string
  brand: string | null
  limit_amount: number
  closing_day: number
  due_day: number
  bank_account_id: string | null
  user_id: string | null
  created_at: string
}

export type Invoice = {
  id: string
  card_id: string
  reference_month: string
  closing_date: string
  due_date: string
  amount: number
  paid_at: string | null
  status: InvoiceStatus
  user_id: string | null
  created_at: string
}

export type Category = {
  id: string
  name: string
  kind: CategoryKind
  color: string | null
  user_id: string | null
  created_at: string
}

export type BankAccount = {
  id: string
  name: string
  bank: string | null
  account_type: string | null
  initial_balance: number
  current_balance: number
  user_id: string | null
  created_at: string
}

export type Goal = {
  id: string
  name: string
  target_amount: number
  current_amount: number
  due_date: string | null
  user_id: string | null
  created_at: string
}
