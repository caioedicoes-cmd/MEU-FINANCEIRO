import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'
import { getMonthlySeries, getTransactions, summarize } from '@/lib/queries'
import { formatCurrency, monthLabel } from '@/lib/format'
import { StatCard } from '@/components/stat-card'
import { BalanceChart } from '@/components/dashboard/balance-chart'
import { TransactionsList } from '@/components/transactions-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const [monthTx, recent, series] = await Promise.all([
    getTransactions({ year, month }),
    getTransactions({ limit: 6 }),
    getMonthlySeries(6),
  ])

  const total = summarize(monthTx)
  const cpf = summarize(monthTx.filter((t) => t.context === 'CPF'))
  const cnpj = summarize(monthTx.filter((t) => t.context === 'CNPJ'))

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Resumo de {monthLabel(month)} de {year}
        </p>
        <p className="text-2xl font-semibold tracking-tight">
          Olá! Aqui está o panorama financeiro do casal.
        </p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Saldo do mês"
          value={total.balance}
          icon={Wallet}
          tone={total.balance >= 0 ? 'primary' : 'destructive'}
          valueClassName={total.balance < 0 ? 'text-destructive' : undefined}
          hint="Entradas menos saídas (CPF + CNPJ)"
        />
        <StatCard
          label="Entradas"
          value={total.income}
          icon={TrendingUp}
          tone="success"
          valueClassName="text-success"
        />
        <StatCard
          label="Saídas"
          value={total.expense}
          icon={TrendingDown}
          tone="destructive"
        />
      </div>

      {/* Chart + context breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BalanceChart data={series} />
        </div>
        <div className="flex flex-col gap-4">
          <ContextCard
            title="Pessoal (CPF)"
            href="/cpf"
            icon={User}
            income={cpf.income}
            expense={cpf.expense}
            balance={cpf.balance}
          />
          <ContextCard
            title="Empresa (CNPJ)"
            href="/cnpj"
            icon={Building2}
            income={cnpj.income}
            expense={cnpj.expense}
            balance={cnpj.balance}
          />
        </div>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Transações recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cpf">
              Ver tudo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionsList
            transactions={recent}
            showContext
            emptyLabel="Nenhuma transação registrada ainda. Comece adicionando uma em Pessoal ou Empresa."
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ContextCard({
  title,
  href,
  icon: Icon,
  income,
  expense,
  balance,
}: {
  title: string
  href: string
  icon: typeof User
  income: number
  expense: number
  balance: number
}) {
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <p className="font-medium">{title}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={href} aria-label={`Abrir ${title}`}>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saldo do mês</p>
          <p
            className={`text-xl font-semibold tabular-nums ${
              balance < 0 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-success">{formatCurrency(income)}</span>
          <span className="text-muted-foreground">entradas / saídas</span>
          <span className="text-destructive">{formatCurrency(expense)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
