import { FinanceCrud } from '@/components/finance-crud'
import { getCategories } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const items = await getCategories()

  return (
    <FinanceCrud
      kind="categorias"
      title="Categorias"
      subtitle="Categorias persistidas no Supabase para receitas e despesas."
      items={items}
    />
  )
}
