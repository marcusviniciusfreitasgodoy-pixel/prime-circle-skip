import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Crown, Check } from 'lucide-react'
import useAppStore from '@/stores/main'
import { sendTransactionalEmail } from '@/lib/email'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAppStore()

  const handleComplete = async () => {
    completeOnboarding()
    // Trigger the automated Welcome Email via Resend mock
    await sendTransactionalEmail('Welcome Email', { to: 'user@example.com', name: user?.name })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-primary/30 text-center space-y-8 shadow-elevation gold-glow">
        <Crown className="w-12 h-12 text-primary mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Bem-vindo ao Círculo, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Sua aprovação foi confirmada. A partir de agora, você faz parte de um ambiente de alta
            performance focado em liquidez imobiliária.
          </p>
        </div>

        <div className="bg-secondary p-5 rounded-lg text-left space-y-4 border border-border">
          <h3 className="text-white font-medium text-sm">O que fazer agora?</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Cadastre as demandas ativas dos seus clientes</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Adicione seu inventário de imóveis exclusivos</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Faça matches inteligentes e garanta 50/50 nas comissões</span>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full gold-gradient text-lg h-14 font-semibold"
        >
          Acessar Dashboard
        </Button>
      </div>
    </div>
  )
}
