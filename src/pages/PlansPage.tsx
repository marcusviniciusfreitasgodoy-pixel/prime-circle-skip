import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Check, X } from 'lucide-react'

export default function PlansPage() {
  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      desc: 'Limitado, para experimentação.',
      features: ['1 Demanda Ativa', '1 Imóvel Ativo', 'Até 3 Conexões/mês', 'Acesso ao Mural'],
      missing: ['Registrar Fechamentos', 'Destaque no Radar'],
      active: true,
      btn: 'Plano Atual',
    },
    {
      name: 'Standard',
      price: 'R$ 297/mês',
      desc: 'Para corretores de alta performance.',
      features: [
        'Imóveis Ilimitados',
        'Demandas Ilimitadas',
        'Conexões Ilimitadas',
        'Registrar Fechamentos',
        'Suporte Prioritário',
      ],
      missing: [],
      active: false,
      btn: 'Fazer Upgrade',
    },
    {
      name: 'Founder',
      price: 'Exclusivo',
      desc: 'Apenas para sócios fundadores.',
      features: ['Acesso Vitalício', 'Limites Ilimitados', 'Voto no Board', 'Eventos Presenciais'],
      missing: [],
      active: false,
      btn: 'Esgotado',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-3xl font-bold text-white">Invista na sua Infraestrutura</h2>
        <p className="text-muted-foreground">
          Evolua seu plano e destrave os limites operacionais.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
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
              <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground min-h-[40px]">
                {plan.desc}
              </CardDescription>
              <div className="text-3xl font-bold text-white mt-4">{plan.price}</div>
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
                disabled={plan.name === 'Founder'}
                className={`w-full ${plan.name === 'Standard' ? 'gold-gradient text-black font-semibold' : plan.active ? 'border-border text-muted-foreground' : 'bg-secondary text-white'}`}
              >
                {plan.btn}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
