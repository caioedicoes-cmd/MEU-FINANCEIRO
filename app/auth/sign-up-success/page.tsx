import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Confirme seu e-mail</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar
          sua conta e começar a usar o sistema.
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
