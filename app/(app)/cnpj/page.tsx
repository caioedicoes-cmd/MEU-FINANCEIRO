import { ContextTransactionsPage } from '@/components/context-transactions-page'
import { getClients, getTransactions, summarize } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function CnpjPage() {
  const [transactions, clients] = await Promise.all([
    getTransactions({ context: 'CNPJ' }),
    getClients(),
  ])
  const summary = summarize(transactions)

  return (
    <ContextTransactionsPage
      context="CNPJ"
      title="Empresa (CNPJ)"
      subtitle="Acompanhe receitas, despesas e movimentações da empresa."
      transactions={transactions}
      summary={summary}
      clients={clients}
    />
  )
}
