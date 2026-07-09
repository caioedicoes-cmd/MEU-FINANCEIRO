'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Leaf className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Nosso Financeiro</p>
          <p className="text-xs text-sidebar-foreground/60">Gestão do casal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-4 text-xs text-sidebar-foreground/50">
        {new Date().getFullYear()} · Feito para nós dois
      </div>
    </aside>
  )
}
