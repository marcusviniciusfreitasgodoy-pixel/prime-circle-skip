import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Shield, Crown, Sparkles } from 'lucide-react'
import type { Tier } from '@/stores/main'

const TIER_DATA: Record<
  Tier,
  { icon: any; color: string; next: string; req: number; benefits: string[] }
> = {
  None: { icon: Shield, color: 'text-gray-400', next: 'Embaixador', req: 1, benefits: [] },
  Ambassador: {
    icon: Star,
    color: 'text-blue-400',
    next: 'Silver',
    req: 5,
    benefits: ['Acesso Base', 'Mural Público'],
  },
  Silver: {
    icon: Shield,
    color: 'text-gray-300',
    next: 'Gold',
    req: 7,
    benefits: ['1 Mês Grátis'],
  },
  Gold: {
    icon: Crown,
    color: 'text-primary',
    next: 'Elite',
    req: 10,
    benefits: ['2 Meses Grátis'],
  },
  Elite: {
    icon: Trophy,
    color: 'text-purple-400',
    next: 'Elite+',
    req: 15,
    benefits: ['3 Meses Grátis', '20% Desconto'],
  },
  'Elite+': {
    icon: Sparkles,
    color: 'text-pink-400',
    next: 'Max',
    req: 99,
    benefits: ['4 Meses Grátis', '30% Desconto'],
  },
}

export function AmbassadorWidget({ tier, referrals = 0 }: { tier: Tier; referrals?: number }) {
  const data = TIER_DATA[tier] || TIER_DATA['None']
  const Icon = data.icon
  const progress = Math.min(100, Math.round((referrals / data.req) * 100))

  return (
    <Card className="bg-gradient-to-br from-card to-background border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Icon className={`w-32 h-32 ${data.color}`} />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <Icon className={`w-6 h-6 ${data.color}`} />
          Status:{' '}
          <span className={data.color}>
            {tier === 'Ambassador' ? 'Embaixador' : tier === 'None' ? 'Iniciante' : tier}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{referrals} Indicações Aprovadas</span>
            <span className="font-medium text-white">
              Faltam {Math.max(0, data.req - referrals)} para {data.next}
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-secondary"
            indicatorClassName={`bg-current ${data.color}`}
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
            Benefícios do Nível
          </h4>
          <ul className="space-y-2">
            {data.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white">
                <div className={`w-1.5 h-1.5 rounded-full ${data.color.replace('text-', 'bg-')}`} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
