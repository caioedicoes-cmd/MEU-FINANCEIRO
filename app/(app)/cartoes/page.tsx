import { FinanceCrud } from '@/components/finance-crud'
import { getBankAccounts, getCards, getInvoices } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function CartoesPage() {
  const [items, bankAccounts, invoices] = await Promise.all([
    getCards(),
    getBankAccounts(),
    getInvoices(),
  ])

  return (
    <FinanceCrud
      kind="cartoes"
      title="Cartões"
      subtitle="Limite, fechamento, vencimento e fatura automática."
      items={items}
      support={{ bankAccounts, invoices }}
    />
  )
}
