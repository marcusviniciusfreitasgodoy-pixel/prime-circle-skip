import { useState, useEffect } from 'react'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import { toast } from 'sonner'
import { useSEO } from '@/hooks/use-seo'
import { PlanCard, type PlanData } from '@/components/plans/PlanCard'
import { PlansCalculator } from '@/components/plans/PlansCalculator'
import { PlansTable } from '@/components/plans/PlansTable'
import { ActivePlanCard } from '@/components/plans/ActivePlanCard'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { calculatePlanPrice, type PlanPriceCalculation } from '@/services/pricing'
import { Skeleton } from '@/components/ui/skeleton'

export default function PlansPage() {
  useSEO({
    title: 'Planos e Preços | Prime Circle',
    description:
      'Conheça nossos planos e invista na sua infraestrutura para evoluir no mercado imobiliário de alto padrão.',
  })

  const { user } = useAuth()

  const [plans, setPlans] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<any>(null)
  const [pricing, setPricing] = useState<Record<string, PlanPriceCalculation>>({})
  const [matchesThisMonth, setMatchesThisMonth] = useState(0)
  const [loading, setLoading] = useState(true)

  const [simulatedMatches, setSimulatedMatches] = useState<number>(0)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      try {
        const { data: plansData } = await supabase
          .from('plans')
          .select('*')
          .order('price_base', { ascending: true })
        if (plansData && isMounted) {
          setPlans(plansData)
        }

        if (user && plansData) {
          const { data: userPlanData } = await supabase
            .from('user_plans')
            .select('*, plans(name)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()

          if (userPlanData && isMounted) setUserPlan(userPlanData)

          const prices: Record<string, PlanPriceCalculation> = {}
          let currentMatches = 0
          for (const p of plansData) {
            const res = await calculatePlanPrice(user.id, p.id)
            if (res) {
              prices[p.id] = res
              currentMatches = res.matches_this_month
            }
          }
          if (isMounted) {
            setPricing(prices)
            setMatchesThisMonth(currentMatches)
            setSimulatedMatches(currentMatches)
          }
        }
      } catch (err) {
        console.error('Error loading plans data', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [user])

  const getDiscount = (matches: number) => {
    if (matches >= 20) return 0.3
    if (matches >= 10) return 0.2
    return 0
  }

  const simulatedDiscount = getDiscount(simulatedMatches)

  const handleCheckout = (planName: string, amount: number) => {
    toast.loading(`Iniciando checkout seguro para ${planName}...`)
    setTimeout(() => {
      toast.dismiss()
      toast.success(`Checkout concluído (Simulação)! R$ ${amount.toFixed(2)} processado.`)
    }, 2000)
  }

  const mappedPlans: PlanData[] = plans.map((p) => {
    const priceInfo = pricing[p.id]
    const basePrice = Number(p.price_base)

    let finalPrice = basePrice
    let discount = 0
    if (user && priceInfo) {
      if (simulatedMatches === matchesThisMonth) {
        finalPrice = priceInfo.final_price
        discount = priceInfo.discount_percentage / 100
      } else {
        discount = simulatedDiscount
        finalPrice = basePrice * (1 - discount)
      }
    } else {
      discount = simulatedDiscount
      finalPrice = basePrice * (1 - discount)
    }

    let isActive = false
    if (userPlan) {
      isActive = userPlan.plan_id === p.id
    } else {
      isActive = p.name === 'FREE' || basePrice === 0
    }

    let btnText = 'Fazer Upgrade'
    let canBuy = true

    if (isActive) {
      btnText = 'Plano Atual'
      canBuy = false
    } else if (p.name === 'FOUNDER') {
      btnText = 'Esgotado'
      canBuy = false
    } else if (p.name === 'FREE' || basePrice === 0) {
      btnText = 'Escolher'
      canBuy = false
    }

    let features: any[] = []
    if (Array.isArray(p.features_json)) {
      features = p.features_json
    } else if (typeof p.features_json === 'string') {
      try {
        features = JSON.parse(p.features_json)
      } catch (e) {
        /* ignore */
      }
    }

    return {
      name: p.name,
      basePrice: basePrice,
      priceLabel: `R$ ${finalPrice.toFixed(0)}`,
      desc: p.description || '',
      features,
      active: isActive,
      btnText,
      canBuy,
      highlight: p.name === 'PROFESSIONAL',
    }
  })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up py-8 px-4">
        <div className="text-center space-y-3 mb-12">
          <Skeleton className="h-12 w-[300px] mx-auto" />
          <Skeleton className="h-6 w-[500px] mx-auto mt-4" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    )
  }

  let nextTarget = 10
  let discountMsg = '20%'
  if (matchesThisMonth >= 20) {
    nextTarget = 30
    discountMsg = '30% (Máximo)'
  } else if (matchesThisMonth >= 10) {
    nextTarget = 20
    discountMsg = '30%'
  }
  const progress = Math.min(
    (matchesThisMonth / (matchesThisMonth >= 20 ? 20 : nextTarget)) * 100,
    100,
  )
  const remaining = Math.max(nextTarget - matchesThisMonth, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up px-4">
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

      {user && userPlan && <ActivePlanCard userPlan={userPlan} />}

      {user && (
        <div className="bg-secondary/40 border border-border p-6 rounded-2xl mb-12 max-w-5xl mx-auto shadow-[0_0_30px_rgba(201,168,76,0.05)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white">Sua Performance no Mês</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Você tem{' '}
                <strong className="text-primary text-base">
                  {matchesThisMonth} conexões (matches)
                </strong>{' '}
                neste mês.
              </p>
            </div>
            {matchesThisMonth >= 20 ? (
              <div className="bg-primary text-black font-bold text-sm px-4 py-1.5 rounded-full shadow-sm">
                Desconto Máximo Ativo!
              </div>
            ) : (
              <div className="text-sm text-left md:text-right text-muted-foreground">
                Faltam <strong className="text-white text-base">{remaining}</strong> para atingir{' '}
                <span className="text-primary font-bold">{discountMsg} OFF</span>
              </div>
            )}
          </div>
          <div className="h-3 w-full bg-background/50 rounded-full overflow-hidden relative z-10">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
        {mappedPlans.map((plan, i) => {
          const discountVal =
            simulatedMatches === matchesThisMonth
              ? (pricing[plans[i].id]?.discount_percentage || 0) / 100
              : simulatedDiscount
          return <PlanCard key={i} plan={plan} discount={discountVal} onCheckout={handleCheckout} />
        })}
      </div>

      <PlansCalculator
        matchesCount={simulatedMatches}
        setMatchesCount={setSimulatedMatches}
        discount={simulatedDiscount}
      />

      <PlansTable />
    </div>
  )
}
