import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Shield, Crown } from 'lucide-react'
import type { Tier } from '@/stores/main'

const TIER_DATA: Record<
  Tier,
  { icon: any; color: string; next: string; progress: number; benefits: string[] }
> = {
  None: {
    icon: Shield,
    color: 'text-gray-400',
    next: 'Ambassador',
    progress: 20,
    benefits: ['1 Imóvel, 1 Demanda', '3 Matches por mês', 'Mural Público'],
  },
  Ambassador: {
    icon: Star,
    color: 'text-blue-400',
    next: 'Silver',
    progress: 50,
    benefits: ['Conexões ilimitadas', 'Membros extras grátis'],
  },
  Silver: {
    icon: Shield,
    color: 'text-gray-300',
    next: 'Gold',
    progress: 80,
    benefits: ['Destaque de imóveis', 'Desconto em planos (10%)'],
  },
  Gold: {
    icon: Crown,
    color: 'text-primary',
    next: 'Elite',
    progress: 40,
    benefits: ['Prioridade no Match', 'Membros de equipe grátis'],
  },
  Elite: {
    icon: Trophy,
    color: 'text-purple-400',
    next: 'Max',
    progress: 100,
    benefits: ['Isenção total', 'Convites para Eventos Exclusivos'],
  },
}

export function AmbassadorWidget({ tier }: { tier: Tier }) {
  const data = TIER_DATA[tier] || TIER_DATA['None']
  const Icon = data.icon

  return (
    <Card className="bg-gradient-to-br from-card to-background border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Icon className={`w-32 h-32 ${data.color}`} />
      </div>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <Icon className={`w-6 h-6 ${data.color}`} />
          Status de Membro: <span className={data.color}>{tier}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso para o nível {data.next}</span>
            <span className="font-medium text-white">{data.progress}%</span>
          </div>
          <Progress
            value={data.progress}
            className="h-2 bg-secondary"
            indicatorClassName="bg-primary"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Seus Benefícios Atuais
          </h4>
          <ul className="space-y-2">
            {data.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
