import { FinanceCrud } from '@/components/finance-crud'
import { getCards, getInvoices } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function FaturasPage() {
  const [items, cards] = await Promise.all([getInvoices(), getCards()])

  return (
    <FinanceCrud
      kind="faturas"
      title="Faturas"
      subtitle="Faturas dos cartões com fechamento, vencimento, pagamento e atraso."
      items={items}
      support={{ cards }}
    />
  )
}
