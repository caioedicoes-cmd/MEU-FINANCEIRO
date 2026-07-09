import { ContextTransactionsPage } from '@/components/context-transactions-page'
import { getTransactions, summarize } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function CpfPage() {
  const transactions = await getTransactions({ context: 'CPF' })
  const summary = summarize(transactions)

  return (
    <ContextTransactionsPage
      context="CPF"
      title="Pessoal (CPF)"
      subtitle="Controle suas entradas e saídas pessoais."
      transactions={transactions}
      summary={summary}
    />
  )
}
