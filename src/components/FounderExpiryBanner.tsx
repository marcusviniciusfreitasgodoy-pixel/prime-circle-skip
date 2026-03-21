import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Info, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useFounderExpiry } from '@/hooks/useFounderExpiry'

export function FounderExpiryBanner() {
  const { isFounder, isExpiring, isExpired, daysRemaining } = useFounderExpiry()

  if (!isFounder) return null

  if (isExpired) {
    return (
      <Alert
        variant="destructive"
        className="mb-6 bg-destructive/10 border-destructive shadow-[0_0_15px_rgba(255,0,0,0.1)]"
      >
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-semibold ml-2">
          Seu período gratuito de 6 meses encerrou
        </AlertTitle>
        <AlertDescription className="mt-2 ml-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="leading-relaxed">
            Sua mensalidade especial de R$ 47/mês está ativa a partir de hoje. Atualize sua forma de
            pagamento para manter os limites ilimitados e benefícios do plano Founder.
          </span>
          <Button asChild size="sm" variant="destructive" className="whitespace-nowrap">
            <Link to="/plans">Ver Planos</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isExpiring) {
    return (
      <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-semibold ml-2">Aviso de Expiração da Isenção</AlertTitle>
        <AlertDescription className="mt-2 ml-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="leading-relaxed">
            Sua isenção de 6 meses encerra em {daysRemaining} dias. A partir da expiração, sua
            mensalidade especial de R$ 47/mês será ativada para manter seu acesso sem restrições.
          </span>
          <Button
            asChild
            size="sm"
            className="bg-yellow-500 text-white hover:bg-yellow-600 whitespace-nowrap border-none"
          >
            <Link to="/plans">Ver Planos</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)] [&>svg]:text-green-500">
      <Crown className="h-5 w-5" />
      <AlertTitle className="font-semibold ml-2">Membro Founder - Isenção Ativa</AlertTitle>
      <AlertDescription className="mt-2 ml-2 text-green-400">
        Você possui isenção total de cobrança nos seus primeiros 6 meses de adesão. Aproveite todo o
        potencial da rede sem restrições!
      </AlertDescription>
    </Alert>
  )
}
