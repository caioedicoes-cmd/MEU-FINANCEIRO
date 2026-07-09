import {
  LayoutDashboard,
  User,
  Building2,
  Users,
  Receipt,
  CreditCard,
  FileText,
  Landmark,
  PieChart,
  Settings,
  Tags,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Pessoal (CPF)', href: '/cpf', icon: User },
  { title: 'Empresa (CNPJ)', href: '/cnpj', icon: Building2 },
  { title: 'Clientes', href: '/clientes', icon: Users },
  { title: 'Contas Fixas', href: '/contas', icon: Receipt },
  { title: 'Cartões', href: '/cartoes', icon: CreditCard },
  { title: 'Faturas', href: '/faturas', icon: FileText },
  { title: 'Categorias', href: '/categorias', icon: Tags },
  { title: 'Contas Bancárias', href: '/contas-bancarias', icon: Landmark },
  { title: 'Metas', href: '/metas', icon: Target },
  { title: 'Relatórios', href: '/relatorios', icon: PieChart },
  { title: 'Configurações', href: '/configuracoes', icon: Settings },
]
