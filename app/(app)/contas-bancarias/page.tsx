import { FinanceCrud } from '@/components/finance-crud'
import { getBankAccounts } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ContasBancariasPage() {
  const items = await getBankAccounts()

  return (
    <FinanceCrud
      kind="contas_bancarias"
      title="Contas Bancárias"
      subtitle="Saldos e contas usadas pelos demais módulos."
      items={items}
    />
  )
}
