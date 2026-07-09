import type { ReactNode } from 'react'
import { Leaf } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Leaf className="size-6" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight">Nosso Financeiro</p>
          <p className="text-sm text-muted-foreground">Gestão compartilhada</p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}
