import { CheckCircle2, Database, Shield, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const name = profile?.name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const email = profile?.email ?? user?.email ?? ''

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Conta, conexão e preferências</p>
        <h2 className="text-2xl font-semibold tracking-tight">Configurações</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4" />
            Perfil
          </CardTitle>
          <CardDescription>Informações da conta conectada.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Nome" value={name} />
          <Info label="E-mail" value={email || 'Não informado'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" />
            Supabase
          </CardTitle>
          <CardDescription>Status da conexão usada para login e dados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge variant={hasSupabaseEnv() ? 'default' : 'destructive'}>
            {hasSupabaseEnv() ? 'Configurado' : 'Não configurado'}
          </Badge>
          {hasSupabaseEnv() && (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-success" />
              Variáveis públicas encontradas em .env.local
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Segurança
          </CardTitle>
          <CardDescription>Boas práticas para manter o app protegido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Use apenas a chave pública anon no app.</p>
          <p>Nunca salve a service_role ou chaves secretas em arquivos do frontend.</p>
          <p>Se uma chave administrativa foi compartilhada, gere uma nova no Supabase.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
