import { useState } from 'react'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { useSEO } from '@/hooks/use-seo'
import { PlanCard, type PlanData } from '@/components/plans/PlanCard'
import { PlansCalculator } from '@/components/plans/PlansCalculator'
import { PlansTable } from '@/components/plans/PlansTable'
import { ActivePlanCard } from '@/components/plans/ActivePlanCard'

export default function PlansPage() {
  useSEO({
    title: 'Planos e Preços | Prime Circle',
    description:
      'Conheça nossos planos e invista na sua infraestrutura para evoluir no mercado imobiliário de alto padrão.',
  })

  const { user, getExpirationInfo } = useAppStore()
  const expInfo = getExpirationInfo()

  const [matchesCount, setMatchesCount] = useState<number>(0)

  const getDiscount = (matches: number) => {
    if (matches >= 20) return 0.3
    if (matches >= 10) return 0.2
    return 0
  }

  const discount = getDiscount(matchesCount)

  const handleCheckout = (planName: string, amount: number) => {
    toast.loading(`Iniciando checkout seguro para ${planName}...`)
    setTimeout(() => {
      toast.dismiss()
      toast.success(`Checkout concluído (Simulação)! R$ ${amount.toFixed(2)} processado.`)
    }, 2000)
  }

  const plans: PlanData[] = [
    {
      name: 'FREE',
      basePrice: 0,
      priceLabel: 'R$ 0',
      desc: 'Para iniciantes na rede.',
      features: [
        { text: '3 Demandas/mês', included: true },
        { text: '3 Imóveis', included: true },
        { text: '10 Conexões/mês', included: true },
        { text: 'Suporte', included: false },
        { text: 'Badge Founder', included: false },
      ],
      active: user?.plan === 'Free',
      btnText: user?.plan === 'Free' ? 'Seu Plano Atual' : 'Escolher',
      canBuy: false,
    },
    {
      name: 'PROFESSIONAL',
      basePrice: 97,
      priceLabel: `R$ ${(97 * (1 - discount)).toFixed(0)}`,
      desc: 'Para corretores de alta performance.',
      features: [
        { text: 'Demandas Ilimitadas', included: true },
        { text: 'Imóveis Ilimitados', included: true },
        { text: 'Conexões Ilimitadas', included: true },
        { text: 'Suporte em até 4h', included: true },
        { text: 'Desconto por matches', included: true },
      ],
      highlight: true,
      active: user?.plan === 'Standard' && !expInfo?.isExpired,
      btnText: user?.plan === 'Standard' && !expInfo?.isExpired ? 'Plano Atual' : 'Fazer Upgrade',
      canBuy: true,
    },
    {
      name: 'FOUNDER',
      basePrice: 47,
      priceLabel: `R$ ${(47 * (1 - discount)).toFixed(0)}`,
      desc: 'Condição especial permanente.',
      features: [
        { text: 'Demandas Ilimitadas', included: true },
        { text: 'Imóveis Ilimitados', included: true },
        { text: 'Conexões Ilimitadas', included: true },
        { text: 'Suporte em até 2h', included: true },
        { text: 'Badge Founder Exclusivo', included: true },
      ],
      active: (user?.plan === 'Founder' || user?.wasFounder) && !expInfo?.isExpired,
      btnText:
        user?.plan === 'Founder' || user?.wasFounder
          ? expInfo?.isExpired
            ? 'Renovar Assinatura'
            : 'Plano Atual'
          : 'Esgotado',
      canBuy: user?.plan === 'Founder' || user?.wasFounder,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <FounderExpiryBanner />

      <div className="text-center space-y-3 mb-12 mt-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Invista na sua Infraestrutura
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Evolua seu plano e destrave os limites operacionais. Pague menos à medida que você
          colabora mais com a rede.
        </p>
      </div>

      {user && expInfo && <ActivePlanCard user={user} expInfo={expInfo} />}

      <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <PlanCard key={i} plan={plan} discount={discount} onCheckout={handleCheckout} />
        ))}
      </div>

      <PlansCalculator
        matchesCount={matchesCount}
        setMatchesCount={setMatchesCount}
        discount={discount}
      />

      <PlansTable />
    </div>
  )
}
