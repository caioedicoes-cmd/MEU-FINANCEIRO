import { FinanceCrud } from '@/components/finance-crud'
import { getBankAccounts, getCategories, getFixedAccounts } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ContasPage() {
  const [items, categories, bankAccounts] = await Promise.all([
    getFixedAccounts(),
    getCategories(),
    getBankAccounts(),
  ])

  return (
    <FinanceCrud
      kind="contas_fixas"
      title="Contas Fixas"
      subtitle="Recorrência mensal, vencimento, pagamento e atraso."
      items={items}
      support={{ categories, bankAccounts }}
    />
  )
}
