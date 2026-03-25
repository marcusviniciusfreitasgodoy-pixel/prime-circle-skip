import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2, BookOpen, Scale, Workflow } from 'lucide-react'
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

      // Prioridade 1: Buscar dados recém-cadastrados da sessão (user_metadata)
      const metaWhatsapp = authUser.user_metadata?.whatsapp_number
      const metaCreci = authUser.user_metadata?.creci

      let foundWhatsapp = false
      let foundCreci = false

      if (metaWhatsapp) {
        setWhatsapp(metaWhatsapp)
        setHasWhatsapp(true)
        foundWhatsapp = true
      }

      if (metaCreci) {
        setCreci(metaCreci)
        setHasCreci(true)
        foundCreci = true
      }

      // Se ambos já foram encontrados na sessão, libera a interface rapidamente
      if (foundWhatsapp && foundCreci) {
        if (mounted) setIsFetching(false)
      }

      // Prioridade 2: Buscar no banco de dados para garantir sincronia caso algo não esteja no metadata
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('whatsapp_number, creci')
          .eq('id', authUser.id)
          .single()

        if (!error && data && mounted) {
          if (!foundWhatsapp && data.whatsapp_number) {
            setWhatsapp(data.whatsapp_number)
            setHasWhatsapp(true)
          }
          if (!foundCreci && data.creci) {
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

  const handleContinueToStep2 = async () => {
    setIsSubmitting(true)
    try {
      if (authUser) {
        // Apenas envia a atualização se o usuário preencheu agora.
        // Se já tinha (veio do cadastro), o trigger do banco já salvou no profile.
        const updateData: any = { accepted_terms: true }

        if (!hasWhatsapp && whatsapp) {
          updateData.whatsapp_number = whatsapp
        }
        if (!hasCreci && creci) {
          updateData.creci = creci
        }

        const { error } = await supabase.from('profiles').update(updateData).eq('id', authUser.id)

        if (error) throw error
      }
      setStep(2)
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar suas preferências. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async (path: string) => {
    if (authUser) {
      localStorage.setItem(`terms_accepted_${authUser.id}`, 'true')
    }
    completeOnboarding()
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
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)] mx-auto mb-4 shrink-0">
                <div className="w-6 h-6 rounded-full bg-card" />
              </div>
              <h1 className="text-2xl font-bold text-white">Bem vindo Corretor</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Antes de acessar o painel, confirme sua adesão às regras da rede privada.
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
                    Autorizo o uso de dados para match isolado dentro do meu Núcleo Regional.
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
              onClick={handleContinueToStep2}
              disabled={!canProceed || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-lg h-14 font-semibold text-black mt-8"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continuar'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in-0 duration-500 space-y-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Regras e Dinâmica</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Entenda como extrair 100% de valor da nossa rede privada.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-primary" /> 1. A Regra de Ouro
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O Prime Circle é fundamentado na <strong>divisão exata de 50/50</strong> em todas
                  as comissões. O descumprimento gera banimento irreversível.
                </p>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                  <Workflow className="w-4 h-4 text-primary" /> 2. Fluxo de Trabalho
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed list-disc pl-4">
                  <li>
                    <strong>Demandas:</strong> Publique o que seu cliente busca.
                  </li>
                  <li>
                    <strong>Imóveis:</strong> Cadastre opções abertas ou off-market.
                  </li>
                  <li>
                    <strong>Matches:</strong> Nossa IA conecta e notifica as pontas.
                  </li>
                  <li>
                    <strong>Conexões:</strong> Atualize o status até o Fechamento.
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setStep(3)}
              className="w-full bg-primary hover:bg-primary/90 text-lg h-14 font-semibold text-black mt-8"
            >
              Entendi, prosseguir
            </Button>
          </div>
        )}

        {step === 3 && (
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
                Ir para o Painel
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
