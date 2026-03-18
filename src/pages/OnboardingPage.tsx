import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Crown, Sparkles, Loader2 } from 'lucide-react'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAppStore()
  const { user: authUser } = useAuth()

  const [step, setStep] = useState(1)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [model5050, setModel5050] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [creci, setCreci] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [hasCreci, setHasCreci] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchProfileData = async () => {
      if (!authUser) {
        setIsFetching(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('whatsapp_number, creci')
          .eq('id', authUser.id)
          .single()

        if (!error && data && mounted) {
          if (data.whatsapp_number) {
            setWhatsapp(data.whatsapp_number)
            setHasWhatsapp(true)
          }
          if (data.creci) {
            setCreci(data.creci)
            setHasCreci(true)
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err)
      } finally {
        if (mounted) setIsFetching(false)
      }
    }

    fetchProfileData()

    return () => {
      mounted = false
    }
  }, [authUser])

  const canProceed =
    terms &&
    privacy &&
    model5050 &&
    (hasWhatsapp || whatsapp.trim().length >= 10) &&
    (hasCreci || creci.trim().length >= 4)

  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      if (authUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            accepted_terms: true,
            whatsapp_number: whatsapp,
            creci: creci,
          })
          .eq('id', authUser.id)

        if (error) throw error

        localStorage.setItem(`terms_accepted_${authUser.id}`, 'true')
        completeOnboarding()
      } else {
        completeOnboarding()
      }
      setStep(2)
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar suas preferências. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = (path: string) => {
    navigate(path)
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-primary/30 text-left space-y-6 shadow-elevation gold-glow animate-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <div className="animate-in fade-in-0 duration-500">
            <div className="text-center mb-8">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Bem vindo Corretor</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Antes de acessar o painel, complete seus dados e confirme sua adesão às regras.
              </p>
            </div>

            {(!hasWhatsapp || !hasCreci) && (
              <div className="space-y-4 mb-6">
                {!hasWhatsapp && (
                  <div className="space-y-2">
                    <label htmlFor="whatsapp" className="text-sm font-medium text-white">
                      WhatsApp com DDD
                    </label>
                    <Input
                      id="whatsapp"
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="bg-secondary/50 border-border text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </div>
                )}
                {!hasCreci && (
                  <div className="space-y-2">
                    <label htmlFor="creci" className="text-sm font-medium text-white">
                      Número do CRECI
                    </label>
                    <Input
                      id="creci"
                      placeholder="00000-F"
                      value={creci}
                      onChange={(e) => setCreci(e.target.value)}
                      className="bg-secondary/50 border-border text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </div>
                )}
              </div>
            )}

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
                  <label
                    htmlFor="privacy"
                    className="text-sm font-medium text-white cursor-pointer"
                  >
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
              onClick={handleContinue}
              disabled={!canProceed || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-lg h-14 font-semibold text-black mt-8"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continuar'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in-0 duration-500 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
              <Sparkles className="w-10 h-10 text-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Ferramenta Colaborativa</h2>

            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Sua voz constrói o Prime Circle. Sugestões aprovadas e implementadas garantem{' '}
              <strong className="text-primary font-bold">1 mês de mensalidade gratuita</strong>{' '}
              adicionado automaticamente à sua conta.
            </p>

            <div className="bg-secondary/50 p-4 rounded-lg border border-border w-full text-sm text-left mb-8">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Compartilhe novas ideias
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Vote nas melhores
                  propostas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Suba no Ranking de
                  Colaboradores
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => handleComplete('/dashboard')}
                className="flex-1 h-14 font-semibold border-border hover:bg-secondary text-white"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => handleComplete('/suggestions')}
                className="gold-gradient text-black flex-1 h-14 font-bold text-lg"
              >
                Ver Sugestões
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
