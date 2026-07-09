import { FinanceCrud } from '@/components/finance-crud'
import { getGoals } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function MetasPage() {
  const items = await getGoals()

  return (
    <FinanceCrud
      kind="metas"
      title="Metas"
      subtitle="Objetivos financeiros com valor alvo, progresso e prazo."
      items={items}
    />
  )
}
