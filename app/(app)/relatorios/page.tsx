import { BarChart3, CreditCard, Landmark, Receipt, Target, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react'
import { BalanceChart } from '@/components/dashboard/balance-chart'
import { StatCard } from '@/components/stat-card'
import { getFinanceData, getMonthlySeries, summarizeFinance } from '@/lib/queries'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage() {
  const [data, series] = await Promise.all([getFinanceData(), getMonthlySeries(6)])
  const total = summarizeFinance(data)
  const bankBalance = data.bankAccounts.reduce((sum, account) => sum + Number(account.current_balance ?? 0), 0)
  const goalsTarget = data.goals.reduce((sum, goal) => sum + Number(goal.target_amount ?? 0), 0)
  const goalsCurrent = data.goals.reduce((sum, goal) => sum + Number(goal.current_amount ?? 0), 0)
  const fixedTotal = data.fixedAccounts.reduce((sum, bill) => sum + Number(bill.amount ?? 0), 0)
  const invoicesTotal = data.invoices.reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0)

  const categoryRows = data.categories.map((category) => {
    const transactions = data.transactions
      .filter((tx) => tx.category === category.name)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    const fixed = data.fixedAccounts
      .filter((account) => account.category_id === category.id)
      .reduce((sum, account) => sum + Number(account.amount), 0)
    return { name: category.name, amount: transactions + fixed }
  }).filter((row) => row.amount > 0)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Visão consolidada de todas as tabelas</p>
        <h2 className="text-2xl font-semibold tracking-tight">Relatórios</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo consolidado" value={total.balance} icon={Wallet} tone={total.balance >= 0 ? 'primary' : 'destructive'} />
        <StatCard label="Entradas" value={total.income} icon={TrendingUp} tone="success" valueClassName="text-success" />
        <StatCard label="Saídas" value={total.expense} icon={TrendingDown} tone="destructive" />
        <StatCard label="Saldo bancário" value={bankBalance} icon={Landmark} tone="primary" />
      </div>

      <BalanceChart data={series} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReportCard
          title="Clientes"
          icon={Users}
          rows={[
            ['Cadastros', String(data.clients.length)],
            ['Contratos recorrentes', formatCurrency(data.clients.reduce((sum, client) => sum + Number(client.contract_value ?? 0), 0))],
            ['Receitas vinculadas', formatCurrency(data.transactions.filter((tx) => tx.client_id).reduce((sum, tx) => sum + Number(tx.amount), 0))],
          ]}
        />
        <ReportCard
          title="Contas e faturas"
          icon={Receipt}
          rows={[
            ['Contas fixas', formatCurrency(fixedTotal)],
            ['Atrasadas', String(data.fixedAccounts.filter((bill) => bill.status === 'LATE').length)],
            ['Faturas', formatCurrency(invoicesTotal)],
          ]}
        />
        <ReportCard
          title="Cartões"
          icon={CreditCard}
          rows={[
            ['Cartões', String(data.cards.length)],
            ['Limite total', formatCurrency(data.cards.reduce((sum, card) => sum + Number(card.limit_amount ?? 0), 0))],
            ['Faturas abertas', String(data.invoices.filter((invoice) => invoice.status !== 'PAID').length)],
          ]}
        />
        <ReportCard
          title="Metas"
          icon={Target}
          rows={[
            ['Guardado', formatCurrency(goalsCurrent)],
            ['Objetivo', formatCurrency(goalsTarget)],
            ['Progresso', goalsTarget > 0 ? `${Math.round((goalsCurrent / goalsTarget) * 100)}%` : '0%'],
          ]}
        />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4" />
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados para exibir.</p>
            ) : (
              <ul className="space-y-2">
                {categoryRows.map((category) => (
                  <li key={category.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate text-muted-foreground">{category.name}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(category.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReportCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string
  icon: typeof Users
  rows: [string, string][]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
