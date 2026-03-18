import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Check, X, Gift, CalendarDays, Zap } from 'lucide-react'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'

export default function PlansPage() {
  const { user, getExpirationInfo } = useAppStore()

  const expInfo = getExpirationInfo()
  const discountPct = user?.tier === 'Elite+' ? 30 : user?.tier === 'Elite' ? 20 : 0

  const handleCheckout = (planName: string, amount: number) => {
    toast.loading(`Iniciando checkout seguro para ${planName}...`)
    setTimeout(() => {
      toast.dismiss()
      toast.success(`Checkout concluído (Simulação)! R$ ${amount.toFixed(2)} processado.`)
      // Mock de redirecionamento para o gateway (Stripe/Pagar.me)
    }, 2000)
  }

  const plans = [
    {
      name: 'Free',
      basePrice: 0,
      desc: 'Limitado, para experimentação.',
      features: ['1 Demanda Ativa', '1 Imóvel Ativo', 'Até 3 Conexões/mês', 'Acesso ao Mural'],
      missing: ['Registrar Fechamentos', 'Destaque no Radar'],
      active: user?.plan === 'Free' || expInfo?.isExpired,
      btn: user?.plan === 'Free' ? 'Plano Atual' : 'Rebaixado (Expirado)',
      canBuy: false,
    },
    {
      name: 'Standard',
      basePrice: 197,
      desc: 'Para corretores de alta performance.',
      features: [
        'Imóveis Ilimitados',
        'Demandas Ilimitadas',
        'Conexões Ilimitadas',
        'Registrar Fechamentos',
        'Suporte Prioritário',
      ],
      missing: [],
      active: user?.plan === 'Standard' && !expInfo?.isExpired,
      btn: user?.plan === 'Standard' && !expInfo?.isExpired ? 'Plano Atual' : 'Fazer Upgrade',
      canBuy: true,
    },
    {
      name: 'Founder',
      basePrice: 97,
      desc: 'Acesso completo com condições de fundador.',
      features: ['Acesso Vitalício', 'Limites Ilimitados', 'Voto no Board', 'Eventos Presenciais'],
      missing: [],
      active: (user?.plan === 'Founder' || user?.wasFounder) && !expInfo?.isExpired,
      btn:
        user?.plan === 'Founder' || user?.wasFounder
          ? expInfo?.isExpired
            ? 'Renovar Assinatura'
            : 'Plano Atual'
          : 'Esgotado',
      canBuy: user?.plan === 'Founder' || user?.wasFounder,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <FounderExpiryBanner />

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Invista na sua Infraestrutura</h2>
        <p className="text-muted-foreground">
          Evolua seu plano e destrave os limites operacionais.
        </p>
      </div>

      {user && user.plan !== 'Free' && expInfo && (
        <Card className="bg-primary/10 border-primary/30 mb-8 shadow-elevation relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Status da Assinatura: {user.plan === 'Free' ? 'Gratuito' : user.plan}
              </h3>
              {user.plan === 'Founder' && (
                <p className="text-primary font-medium mb-3">
                  Pagamentos ativados após os 12 meses de acesso gratuito para fundadores.
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-background rounded-md px-4 py-2 border border-border flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Vencimento (Trial)</span>
                    <span
                      className={`text-sm font-semibold ${expInfo.isExpired ? 'text-destructive' : 'text-white'}`}
                    >
                      {expInfo.expirationDate.toLocaleDateString()}{' '}
                      {!expInfo.isExpired && `(${expInfo.daysLeft} dias restantes)`}
                    </span>
                  </div>
                </div>
                <div className="bg-background rounded-md px-4 py-2 border border-border flex items-center gap-3">
                  <Gift className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Créditos Acumulados</span>
                    <span className="text-sm font-semibold text-white">
                      {expInfo.totalCredits} meses extras
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {discountPct > 0 && (
              <div className="text-center bg-background border border-primary/50 p-4 rounded-lg min-w-[140px]">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider mb-1">
                  Desconto Nível
                </span>
                <span className="text-3xl font-bold text-primary">{discountPct}% OFF</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const finalPrice = plan.basePrice * (1 - discountPct / 100)
          const displayPrice = plan.basePrice === 0 ? 'R$ 0' : `R$ ${finalPrice.toFixed(0)}/mês`

          return (
            <Card
              key={i}
              className={`bg-card border-border flex flex-col ${plan.name === 'Standard' ? 'border-primary shadow-[0_0_30px_rgba(201,168,76,0.1)] relative' : ''}`}
            >
              {plan.name === 'Standard' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">
                  RECOMENDADO
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-white">
                  {plan.name === 'Free' ? 'Gratuito' : plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground min-h-[40px]">
                  {plan.desc}
                </CardDescription>
                <div className="text-3xl font-bold text-white mt-4 flex items-center justify-center gap-2">
                  {plan.basePrice > 0 && discountPct > 0 && plan.canBuy && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {plan.basePrice}
                    </span>
                  )}
                  {plan.basePrice > 0 && !plan.canBuy && plan.name === 'Founder'
                    ? 'Exclusivo'
                    : displayPrice}
                </div>
              </CardHeader>
              <CardContent className="flex-1 mt-6">
                <ul className="space-y-3">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.missing.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-muted-foreground/50 line-through"
                    >
                      <X className="w-4 h-4 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.active ? 'outline' : 'default'}
                  disabled={!plan.canBuy || plan.active}
                  onClick={() =>
                    plan.canBuy && !plan.active ? handleCheckout(plan.name, finalPrice) : undefined
                  }
                  className={`w-full ${plan.name === 'Standard' && !plan.active ? 'gold-gradient text-black font-semibold' : plan.active ? 'border-border text-muted-foreground' : 'bg-secondary text-white'}`}
                >
                  {plan.btn}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
