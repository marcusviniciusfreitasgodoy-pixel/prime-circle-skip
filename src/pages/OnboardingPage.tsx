import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Crown } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAppStore()
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [model5050, setModel5050] = useState(false)

  const canProceed = terms && privacy && model5050

  const handleComplete = () => {
    completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-primary/30 text-left space-y-6 shadow-elevation gold-glow">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Bem-vindo, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Antes de acessar o painel, confirme sua adesão às regras do ecossistema.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-secondary rounded-lg border border-border">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(c) => setTerms(!!c)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm font-medium text-white cursor-pointer">
                Termos de Uso
              </label>
              <p className="text-xs text-muted-foreground">
                Concordo com as diretrizes de conduta e penalidades por inatividade.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-secondary rounded-lg border border-border">
            <Checkbox
              id="privacy"
              checked={privacy}
              onCheckedChange={(c) => setPrivacy(!!c)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="privacy" className="text-sm font-medium text-white cursor-pointer">
                Política de Privacidade
              </label>
              <p className="text-xs text-muted-foreground">
                Autorizo o uso de dados para match isolado dentro do meu Chapter.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
            <Checkbox
              id="model"
              checked={model5050}
              onCheckedChange={(c) => setModel5050(!!c)}
              className="mt-1 border-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="model" className="text-sm font-bold text-primary cursor-pointer">
                Compromisso 50/50
              </label>
              <p className="text-xs text-muted-foreground">
                Prometo praticar a divisão exata de 50/50 em comissões geradas no app.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          disabled={!canProceed}
          className="w-full gold-gradient text-lg h-14 font-semibold text-black mt-8"
        >
          Aceitar e Entrar
        </Button>
      </div>
    </div>
  )
}
