'use client'

import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/nav'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'

function useTitle() {
  const pathname = usePathname()
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )
  return match?.title ?? 'Nosso Financeiro'
}

export function AppHeader({ name, email }: { name: string; email: string }) {
  const title = useTitle()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h1 className="text-lg font-semibold tracking-tight text-balance">{title}</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <UserMenu name={name} email={email} />
      </div>
    </header>
  )
}
