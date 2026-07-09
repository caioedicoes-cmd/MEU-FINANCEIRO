import { FinanceCrud } from '@/components/finance-crud'
import { getClients, getTransactions } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clients, transactions] = await Promise.all([
    getClients(),
    getTransactions({ context: 'CNPJ' }),
  ])

  const clientIncome = Array.from(
    transactions
      .filter((tx) => tx.type === 'IN' && tx.client_id)
      .reduce((map, tx) => {
        const current = map.get(tx.client_id) ?? { client_id: tx.client_id, amount: 0, count: 0 }
        current.amount += Number(tx.amount)
        current.count += 1
        map.set(tx.client_id, current)
        return map
      }, new Map<string | null, { client_id: string | null; amount: number; count: number }>()),
  ).map(([, value]) => value)

  return (
    <FinanceCrud
      kind="clientes"
      title="Clientes"
      subtitle="Cadastro completo e receitas associadas."
      items={clients}
      support={{ clientIncome }}
    />
  )
}
