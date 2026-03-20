import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Check, X, Zap, HelpCircle, CalendarDays, Gift } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { useSEO } from '@/hooks/use-seo'

export default function PlansPage() {
  useSEO({
    title: 'Planos e Preços | Prime Circle',
    description:
      'Conheça nossos planos e invista na sua infraestrutura para evoluir no mercado imobiliário de alto padrão.',
  })

  const { user, needs, getExpirationInfo } = useAppStore()
  const expInfo = getExpirationInfo()

  const [matchesCount, setMatchesCount] = useState<number>(0)
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true)

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

  // Identifica se o usuário Free atingiu o limite de 3 demandas cadastradas
  const userDemandsCount = needs.filter((n) => n.ownerId === user?.id).length
  const showLimitBanner = user?.plan === 'Free' && userDemandsCount >= 3 && isBannerVisible

  const plans = [
    {
      name: 'FREE',
      basePrice: 0,
      priceLabel: 'R$ 0',
      desc: 'Para iniciantes na rede.',
      features: [
        { text: '3 Demandas/mês', included: true },
        { text: '3 Imóveis ativos', included: true },
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

  const compareFeatures = [
    {
      name: 'Demandas/mês',
      tooltip: 'Quantidade de pedidos de busca que você pode cadastrar mensalmente.',
      free: '3',
      pro: 'Ilimitado',
      founder: 'Ilimitado',
    },
    {
      name: 'Imóveis ativos',
      tooltip: 'Número de propriedades exclusivas que você pode ofertar na rede.',
      free: '3',
      pro: 'Ilimitado',
      founder: 'Ilimitado',
    },
    {
      name: 'Conexões/mês',
      tooltip: 'Quantidade de matches (conversas iniciadas) que você pode realizar.',
      free: '10',
      pro: 'Ilimitado',
      founder: 'Ilimitado',
    },
    {
      name: 'Suporte',
      tooltip: 'Tempo médio de resposta do nosso time de atendimento.',
      free: 'Comunitário',
      pro: 'Até 4h',
      founder: 'Até 2h',
    },
    {
      name: 'Desconto por matches',
      tooltip: 'Redução na mensalidade baseada no volume de negócios gerados.',
      free: false,
      pro: true,
      founder: true,
    },
    {
      name: 'Badge Founder',
      tooltip: 'Selo exclusivo de membro pioneiro e prioridade nos resultados.',
      free: false,
      pro: false,
      founder: true,
    },
    {
      name: 'Voto em produto',
      tooltip: 'Poder de decisão sobre o desenvolvimento de novas funcionalidades.',
      free: false,
      pro: true,
      founder: true,
    },
  ]

  return (
    <>
      {showLimitBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm text-black px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-md border-b border-primary animate-fade-in-down">
          <p className="text-sm font-semibold max-w-3xl text-center sm:text-left">
            Você atingiu seu limite de 3 demandas mensais. Faça o upgrade para PROFESSIONAL e
            publique ilimitadamente por R$ 97/mês (ou menos com desconto por matches).
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="default"
              size="sm"
              className="bg-black text-white hover:bg-black/80 font-bold shadow-sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Upgrade Agora
            </Button>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`max-w-6xl mx-auto space-y-8 animate-fade-in-up ${showLimitBanner ? 'pt-8' : ''}`}
      >
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

        {user && user.plan !== 'Free' && expInfo && (
          <Card className="bg-primary/10 border-primary/30 mb-12 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Zap className="w-32 h-32 text-primary" />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Status: {user.plan === 'Standard' ? 'Professional' : user.plan}
                </h3>
                {user.plan === 'Founder' && (
                  <p className="text-primary font-medium mb-4 text-base">
                    Condição de fundador com pagamentos ativados após 12 meses de carência.
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
                    <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                        Vencimento
                      </span>
                      <span
                        className={`text-sm font-bold ${expInfo.isExpired ? 'text-destructive' : 'text-white'}`}
                      >
                        {expInfo.expirationDate.toLocaleDateString()}{' '}
                        {!expInfo.isExpired && `(${expInfo.daysLeft} dias)`}
                      </span>
                    </div>
                  </div>
                  <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
                    <Gift className="w-6 h-6 text-primary" />
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                        Créditos Extras
                      </span>
                      <span className="text-sm font-bold text-white">
                        {expInfo.totalCredits} meses adicionados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            return (
              <Card
                key={i}
                className={`bg-card border-border flex flex-col relative transition-all duration-300 ${plan.highlight ? 'border-primary shadow-[0_0_40px_rgba(201,168,76,0.15)] scale-105 z-10' : 'hover:border-border/80 hover:shadow-elevation'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Recomendado
                  </div>
                )}
                <CardHeader className="text-center pb-6 pt-8 px-6">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2 min-h-[44px] text-base">
                    {plan.desc}
                  </CardDescription>
                  <div className="mt-6 flex flex-col items-center justify-center min-h-[90px]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-white">
                        {plan.priceLabel.split('/')[0]}
                      </span>
                      {plan.basePrice > 0 && (
                        <span className="text-lg text-muted-foreground font-medium">/mês</span>
                      )}
                    </div>
                    {plan.basePrice > 0 && discount > 0 && plan.canBuy && (
                      <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full mt-3 inline-block">
                        Valor original: R$ {plan.basePrice}/mês
                      </span>
                    )}
                    {plan.basePrice > 0 && !plan.canBuy && plan.name === 'FOUNDER' && (
                      <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full mt-3 inline-block">
                        Vagas Esgotadas
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-8">
                  <ul className="space-y-4">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        {feat.included ? (
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feat.included
                              ? 'text-zinc-300 font-medium'
                              : 'text-muted-foreground/50 line-through'
                          }
                        >
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="px-8 pb-8 pt-4">
                  <Button
                    variant={plan.active ? 'outline' : 'default'}
                    disabled={!plan.canBuy || plan.active}
                    onClick={() =>
                      plan.canBuy && !plan.active
                        ? handleCheckout(plan.name, plan.basePrice * (1 - discount))
                        : undefined
                    }
                    className={`w-full h-12 text-base font-bold transition-all ${
                      plan.highlight && !plan.active
                        ? 'gold-gradient text-black hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:scale-[1.02]'
                        : plan.active
                          ? 'border-border text-muted-foreground bg-secondary/50'
                          : 'bg-secondary text-white hover:bg-secondary/80'
                    }`}
                  >
                    {plan.btnText}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-secondary/40 border border-primary/20 shadow-[0_0_30px_rgba(201,168,76,0.05)] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none blur-2xl">
            <div className="w-40 h-40 bg-primary rounded-full"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 text-center relative z-10">
            Calculadora de Liquidez
          </h3>
          <p className="text-muted-foreground text-center mb-10 relative z-10 text-lg">
            No Prime Circle, quem colabora mais paga menos. Simule seu desconto baseado no volume de
            matches mensais.
          </p>
          <div className="space-y-8 relative z-10 px-4">
            <div className="flex items-center justify-between">
              <span className="text-lg text-white font-medium">
                Conexões no mês: <strong className="text-primary text-2xl">{matchesCount}</strong>
              </span>
              <Badge className="bg-primary text-black font-bold text-lg px-4 py-1.5 rounded-md shadow-sm">
                {discount * 100}% OFF
              </Badge>
            </div>
            <div className="pt-2">
              <Slider
                value={[matchesCount]}
                onValueChange={(val) => setMatchesCount(val[0])}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-4 font-medium">
              <span>0</span>
              <span className={matchesCount >= 10 ? 'text-primary transition-colors' : ''}>
                10 matches (20%)
              </span>
              <span className={matchesCount >= 20 ? 'text-primary transition-colors' : ''}>
                20+ matches (30%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border/50">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-4">Comparativo Detalhado</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Entenda todas as diferenças de forma aprofundada e escolha o ecossistema ideal para o
              seu momento atual de carreira.
            </p>
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-elevation max-w-5xl mx-auto">
              <Table>
                <TableHeader className="bg-secondary/80">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[250px] md:w-[350px] text-white font-semibold py-5 px-6 text-base">
                      Funcionalidade
                    </TableHead>
                    <TableHead className="text-center font-bold text-white py-5 text-base w-[150px]">
                      FREE
                    </TableHead>
                    <TableHead className="text-center font-bold text-primary py-5 bg-primary/5 text-base w-[150px]">
                      PROFESSIONAL
                    </TableHead>
                    <TableHead className="text-center font-bold text-white py-5 text-base w-[150px]">
                      FOUNDER
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compareFeatures.map((feat, i) => (
                    <TableRow
                      key={i}
                      className="border-border hover:bg-secondary/40 transition-colors"
                    >
                      <TableCell className="font-medium text-white px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base">{feat.name}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-white cursor-help transition-colors shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="max-w-[250px] bg-secondary border-border text-white p-3 shadow-lg rounded-lg"
                            >
                              <p className="text-sm leading-relaxed">{feat.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground py-5">
                        {typeof feat.free === 'boolean' ? (
                          feat.free ? (
                            <Check className="w-5 h-5 mx-auto text-primary" />
                          ) : (
                            <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="font-semibold text-sm">{feat.free}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-white font-medium bg-primary/5 py-5">
                        {typeof feat.pro === 'boolean' ? (
                          feat.pro ? (
                            <Check className="w-5 h-5 mx-auto text-primary" />
                          ) : (
                            <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="font-bold text-sm text-primary">{feat.pro}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground py-5">
                        {typeof feat.founder === 'boolean' ? (
                          feat.founder ? (
                            <Check className="w-5 h-5 mx-auto text-primary" />
                          ) : (
                            <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="font-semibold text-sm">{feat.founder}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </>
  )
}
