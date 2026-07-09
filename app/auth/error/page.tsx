import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Algo deu errado</CardTitle>
        <CardDescription>
          Não foi possível concluir a autenticação. Tente novamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/auth/login">Voltar para o login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
