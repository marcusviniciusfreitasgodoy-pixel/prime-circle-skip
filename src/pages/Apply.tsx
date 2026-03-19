import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Crown, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Apply() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')
  const { addCandidate, login } = useAppStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referrerId, setReferrerId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
  })

  useEffect(() => {
    let mounted = true
    const trackClick = async () => {
      if (!refCode) return
      try {
        let query = supabase.from('profiles').select('id')
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          refCode,
        )

        if (isUuid) {
          query = query.or(`id.eq.${refCode},referral_code.eq.${refCode}`)
        } else {
          query = query.eq('referral_code', refCode)
        }
        const { data: profiles } = await query.limit(1)

        if (profiles && profiles.length > 0 && mounted) {
          const rId = profiles[0].id
          setReferrerId(rId)

          const tracked = sessionStorage.getItem(`tracked_${rId}`)
          if (!tracked) {
            await supabase.from('referral_clicks').insert({ referrer_id: rId })
            sessionStorage.setItem(`tracked_${rId}`, 'true')
          }
        }
      } catch (e) {
        console.error('Error tracking referral:', e)
      }
    }
    trackClick()
    return () => {
      mounted = false
    }
  }, [refCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call and validation
    setTimeout(() => {
      if (refCode) {
        addCandidate({ ...formData, referredBy: referrerId || refCode, status: 'approved' })
        login('approved')
        toast({
          title: 'Aprovado para Acesso Imediato!',
          description: 'Sua indicação foi confirmada. Bem-vindo ao Prime Circle.',
        })
        navigate('/dashboard')
      } else {
        addCandidate({ ...formData, status: 'waitlist' })
        navigate('/waitlist')
      }
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
        {/* Background ambient elements */}
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-xl relative z-10 animate-fade-in-up">
          <div className="bg-card/80 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-border shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Aplicar para o <span className="text-primary">Prime Circle</span>
            </h1>

            <p className="text-muted-foreground mb-8 text-lg">
              Preencha seus dados para avaliação do nosso comitê.
            </p>

            {!refCode ? (
              <Alert className="mb-8 bg-secondary/50 border-primary/20 text-foreground shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold ml-2">
                  Acesso Exclusivo
                </AlertTitle>
                <AlertDescription className="text-muted-foreground ml-2 mt-2 leading-relaxed">
                  Nesta primeira fase, o acesso é exclusivo para parceiros indicados por membros
                  fundadores. Suas informações serão adicionadas à nossa{' '}
                  <strong className="text-foreground font-medium">
                    Lista de Espera (Base de Contato)
                  </strong>{' '}
                  para aprovação futura.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mb-8 bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
                <Crown className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold ml-2">
                  Indicação Confirmada
                </AlertTitle>
                <AlertDescription className="text-muted-foreground ml-2 mt-2 leading-relaxed">
                  Você foi convidado pelo membro fundador{' '}
                  <strong className="text-primary font-mono bg-background/50 px-1.5 py-0.5 rounded border border-primary/20">
                    {refCode}
                  </strong>
                  . Complete seu cadastro para obter acesso imediato à plataforma.
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">
                  Nome Completo
                </Label>
                <Input
                  required
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: João da Silva"
                  className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base">
                  E-mail Profissional
                </Label>
                <Input
                  required
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="joao@exemplo.com"
                  className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="creci" className="text-base">
                    CRECI
                  </Label>
                  <Input
                    required
                    id="creci"
                    value={formData.creci}
                    onChange={handleChange}
                    placeholder="Ex: 000000-F"
                    className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base">
                    WhatsApp
                  </Label>
                  <Input
                    required
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-lg h-14 font-semibold shadow-[0_0_20px_rgba(201,168,76,0.15)] hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Enviando...'
                    : refCode
                      ? 'Acessar Plataforma'
                      : 'Entrar na Lista de Espera'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
